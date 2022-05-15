import 'module-alias/register'

import { DocumentType } from '@typegoose/typegoose'
import { TodoModel } from '@/models/Todo'
import { User, UserModel } from '@/models/User'
import { scheduleJob } from 'node-schedule'
import { sendRemindWord } from '@/reminder/sendRemindWord'
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
  console.log('Проверка БД окончена')
}