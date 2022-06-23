import Context from '@/models/Context'
import adminMenu from '@/menus/adminMenu'
import env from '@/helpers/env'

export default async function handleAdminMessage(ctx: Context) {
  const user = ctx.dbuser
  if (!ctx.message || !ctx.message.text) {
    throw new Error('Сообщение не обнаружено??')
  }
  if (user.telegramId == Number(env.ADMIN)) {
    await ctx.reply(ctx.message.text, {
      reply_markup: adminMenu,
    })
  } else {
    await ctx.reply('Бот интерактивен, так что используй команды :)')
  }
}
