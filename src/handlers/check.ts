import Context from '@/models/Context'
import sendToDoOnCheck from '@/helpers/sendToDoOnCheck'

export default async function handleCheck(ctx: Context) {
  await ctx.dbuser.setRemindForCheck()
  const user = ctx.dbuser
  if (!user) {
    throw new Error('user не найден')
  }
  if (!user.todoOnCheck) {
    if (user.todos && user.todos.length > 0) {
      const newTodo = user.todos.shift()
      user.todoOnCheck = newTodo
      await user.save()
      return await sendToDoOnCheck(user.todoOnCheck, user, ctx)
    } else {
      await ctx.reply('Слов для повторения нет :(')
    }
  } else {
    return await sendToDoOnCheck(user.todoOnCheck, user, ctx)
  }
}
