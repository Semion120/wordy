import { Context } from 'grammy'
import { Menu } from '@grammyjs/menu'
import { UserModel } from '@/models/User'
import bot from '@/helpers/bot'

const adminMenu = new Menu<Context>('adminMenu')
  .text('Отменить', async (ctx) => {
    await ctx.menu.close()
  })
  .text('Отправить', async (ctx) => {
    const users = await UserModel.find()
    if (
      !ctx.update.callback_query.message ||
      !ctx.update.callback_query.message.text
    ) {
      throw new Error('Не найден текст сообщения')
    }
    for (const user of users) {
      await bot.api.sendMessage(
        user.telegramId,
        ctx.update.callback_query.message.text,
        { parse_mode: 'HTML' }
      )
    }
    ctx.menu.close()
  })
  .row()

export default adminMenu
