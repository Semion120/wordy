import Context from '@/models/Context'
import settingsMenu from '@/menus/settings'

export default async function handleSettings(ctx: Context) {
  const remindTime = ctx.dbuser.settings?.remindTime
  const hours = remindTime?.getHours()
  const minutes =
    remindTime?.getMinutes() == 0 ? '00' : remindTime?.getMinutes()
  const remindTimeNow = `${hours}:${minutes}`
  return await ctx.reply(`${ctx.i18n.t('settings', { remindTimeNow })}`, {
    parse_mode: 'HTML',
    reply_markup: settingsMenu,
  })
}
