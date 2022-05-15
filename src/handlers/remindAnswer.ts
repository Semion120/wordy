import { TodoModel } from '@/models/Todo'
import { makeWordTemplate } from '@/menus/learn'
import { sendRemindWord } from '@/reminder/sendRemindWord'
import Context from '@/models/Context'
import bot from '@/helpers/bot'

export async function trueRemindAnswer(ctx: Context) {
  const user = ctx.dbuser
  await TodoModel.deleteOne({ _id: user.todoOnCheck })
  console.log(user.todoOnCheck, user.todos?.length)
  user.todoOnCheck = undefined
  await ctx.editMessageText('Это правильный ответ :)')

  if (user.todos && user.todos.length > 0) {
    const todoId = user.todos.shift()
    const todo = await TodoModel.findById(todoId)
    if (!todo) {
      throw new Error('Не получается найти ToDo в trueRemindAnswer controller')
    }
    user.todoOnCheck = todoId
    await user.save()
    return sendRemindWord(todo)
  } else {
    await user.save()
    const text = 'На сегодня слова для повторения закончились ^_^'
    return await bot.api.sendMessage(user.telegramId, text)
  }
}

export async function falseRemindAnswer(ctx: Context) {
  const user = ctx.dbuser
  await ctx.editMessageText(
    'Это неверный ответ :(\nЯ пришлю это слово, чтобы ты его смог повторить. В следущий раз не ошибешься :) \nВ след за ним отправлю следущее слово для проверки, ты его отличишь по кнопкам с верным вариантом ответа :)'
  )
  try {
    const mistakeTodo = await TodoModel.findById(user.todoOnCheck)
    if (!mistakeTodo) {
      throw new Error('Нет такого Todo ID')
    }
    await ctx.reply(await makeWordTemplate(mistakeTodo.wordToRemind), {
      parse_mode: 'HTML',
    })
  } catch (err) {
    console.log(err)
  }
  await TodoModel.deleteOne({ _id: user.todoOnCheck })
  user.todoOnCheck = undefined

  if (user.todos && user.todos.length > 0) {
    const todoId = user.todos.shift()
    const todo = await TodoModel.findById(todoId)
    if (!todo) {
      throw new Error('Не получается найти ToDo в trueRemindAnswer controller')
    }
    user.todoOnCheck = todoId
    await user.save()
    return sendRemindWord(todo)
  } else {
    await user.save()
    const text = 'На сегодня слова для повторения закончились ^_^'
    return await bot.api.sendMessage(user.telegramId, text)
  }
}
