import { Menu } from '@grammyjs/menu'

const settingsMenu = new Menu('baseMenu')
  .text('Изменить время', async (ctx) => {
    ctx.menu.close()
    await ctx.editMessageText('Пришлите время в формате: 17:00')
  })
  .row()

export default settingsMenu
