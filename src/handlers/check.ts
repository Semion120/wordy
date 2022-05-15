import { TodoModel } from '@/models/Todo'
import { sendRemindWord } from '@/reminder/sendRemindWord'
import Context from '@/models/Context'

export default async function handleCheck(ctx: Context) {
  const user = ctx.dbuser
  if (!user) {
    throw new Error('user не найден')
  }
  if (!user.todoOnCheck) {
    if (user.todos && user.todos.length > 0) {
      const newTodo = user.todos.shift()
      user.todoOnCheck = newTodo
      await user.save()
      const todo = await TodoModel.findById(user.todoOnCheck)
      if (!todo) {
        throw new Error('Не найдено Todo')
      }
      return await sendRemindWord(todo)
    } else {
      await ctx.reply('Слов для повторения нет :(')
    }
  } else {
    const todo = await TodoModel.findById(user.todoOnCheck)
    if (!todo) {
      throw new Error('Не найдено Todo')
    }
    return await sendRemindWord(todo)
  }
}
