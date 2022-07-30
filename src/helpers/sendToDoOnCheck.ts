import { DocumentType, Ref } from '@typegoose/typegoose'
import { Todo, TodoModel } from '@/models/Todo'
import { User } from '@/models/User'
import { sendRemindWord } from '@/reminder/sendRemindWord'
import Context from '@/models/Context'

export default async function sendToDoOnCheck(
  todoOnCheck: Ref<Todo>,
  user: DocumentType<User>,
  ctx: Context
): Promise<void> {
  const todo = await TodoModel.findById(todoOnCheck)
  if (!todo) {
    if (user.todos && user.todos.length > 0) {
      user.todoOnCheck = user.todos.shift()
      await user.save()
      return await sendToDoOnCheck(todoOnCheck, user, ctx)
    } else {
      user.todoOnCheck = undefined
      await user.save()
      await ctx.reply('Слов для повторения нет ;(')
    }
    throw new Error('Не найдено Todo')
  }
  await sendRemindWord(todo)
}
