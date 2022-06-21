import 'module-alias/register'

import { DocumentType } from '@typegoose/typegoose'
import { Step, TodoModel } from '@/models/Todo'
import { User, UserModel } from '@/models/User'
import { scheduleJob } from 'node-schedule'
import { sendRemindWord } from '@/reminder/sendRemindWord'
import bot from '@/helpers/bot'
import startMongo from '@/helpers/startMongo'
import todayMSK from '@/helpers/todayMSK'

startMongo()
  .then(() => {
    scheduleJob('*/15 * * * *', checkBD)
  })
  .catch((err) => {
    console.log(err)
  })

let checkTime = 0
async function checkBD() {
  checkTime += 1
  console.log('Проверка БД номер: ' + checkTime)
  const today = todayMSK()
  const todos = await TodoModel.find({ remindTime: { $lte: today } })
  let user: DocumentType<User> | null = null
  if (todos) {
    for (const todo of todos) {
      if (user && user.telegramId == todo.telegramId) {
        if (user.todos && user.todos.length > 0) {
          const todoId: string = todo._id.toString()
          const checkTodo = user.todos
            .map((i) => {
              if (i) {
                return i.toString()
              }
            })
            .includes(todoId)
          if (!checkTodo) {
            user.todos?.push(todo)
            await user.save()
          }
        } else if (user.todos && user.todos.length == 0) {
          user.todos?.push(todo)
          await user.save()
        }
      } else {
        user = await UserModel.findOne({ telegramId: todo.telegramId })
        if (!user) {
          throw new Error('Не найден юзер в reminder')
        }
        const todoId: string = todo._id.toString()
        if (!user.todoOnCheck) {
          user.todoOnCheck = todo
          await user.save()
          await sendRemindWord(todo)
        } else if (
          !(
            user.todos &&
            user?.todos
              .map((i) => {
                if (i) {
                  return i.toString()
                }
              })
              .includes(todoId)
          ) &&
          user.todoOnCheck.toString() !== todoId
        ) {
          user?.todos?.push(todo)
          await user.save()
        }
      }
    }
  }

  const minutes20Todos = await TodoModel.find({
    step: Step.minutes20,
    remindTime: { $lte: today },
  })
  const usersIds: number[] = []
  if (minutes20Todos) {
    for (const oneTodo of minutes20Todos) {
      if (!usersIds.includes(oneTodo.telegramId)) {
        usersIds.push(oneTodo.telegramId)
      }
    }
  }
  if (usersIds[0]) {
    for (const userId of usersIds) {
      const user = await UserModel.findOne({ telegramId: userId })
      if (!user) {
        throw new Error('Не удается найти юзера в отправке 20-ти минуток')
      }
      const userTodoOnCheck = await TodoModel.findById(user.todoOnCheck)
      if (!userTodoOnCheck) {
        throw new Error('Не удается найти ToDo в отправке 20-ти минуток')
      }
      if (userTodoOnCheck.step != Step.minutes20) {
        await sendRemindWord(userTodoOnCheck)
      }
    }
  }

  // Check usersToLearn
  const usersToLearn = await UserModel.find({
    nextRemindForLearn: { $lte: today },
  })

  if (usersToLearn) {
    for (const user of usersToLearn) {
      await user.setRemindForLearn(true)
      let text
      if (user.lostDaysForLearn && user.lostDaysForLearn >= 3) {
        text = `Привет горемыка😁, ты пропустил более ${
          user.lostDaysForLearn
        } дней. За это время ты мог выучить ${user.lostDaysForLearn * 5}-${
          user.lostDaysForLearn * 15
        } слов. Просто нажми /learn, чтобы не было как всегда.`
      } else {
        text =
          'Привет! Ты не учил новые слова больше 24 часов! Рекомендую команду /learn.'
      }
      await bot.api.sendMessage(user.telegramId, text, {
        parse_mode: 'HTML',
      })
      await user.save()
    }
  }

  // Check usersToCheck
  const usersToCheck = await UserModel.find({
    nextRemindForCheck: { $lte: today },
  })

  if (usersToCheck) {
    for (const user of usersToCheck) {
      const text =
        'Привет! Ты не повторял слова уже более 2 дней! Рекомендую команду /check.'
      await bot.api.sendMessage(user.telegramId, text, {
        parse_mode: 'HTML',
      })
      await user.setRemindForCheck()
      await user.save()
    }
  }

  console.log('Проверка БД окончена')
}
