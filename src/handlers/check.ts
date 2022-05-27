import { TodoModel } from '@/models/Todo'
import { sendRemindWord } from '@/reminder/sendRemindWord'
import Context from '@/models/Context'

export default async function handleCheck(ctx: Context) {
  const user = ctx.dbuser
  if (!user) {
    throw new Error('user не найден')
  }
  console.log(0, user.todos)
  if (!user.todoOnCheck) {
    if (user.todos && user.todos.length > 0) {
      console.log(1, user.todos.length)
      const newTodo = user.todos.shift()
      user.todoOnCheck = newTodo
      await user.save()
      const todo = await TodoModel.findById(user.todoOnCheck)
      if (!todo) {
        throw new Error('Не найдено Todo')
      }
      return await sendRemindWord(todo)
    } else {
      console.log(1.1, user.todoOnCheck, user.todos)
      await ctx.reply('Слов для повторения нет :(')
    }
  } else {
    console.log(2, user.todoOnCheck)
    const todo = await TodoModel.findById(user.todoOnCheck)
    if (!todo) {
      throw new Error('Не найдено Todo')
    }
    return await sendRemindWord(todo)
  }
}
