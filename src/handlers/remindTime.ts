import { DictModel } from '@/models/Dict'
import Context from '@/models/Context'
import sendOptions from '@/helpers/sendOptions'

export default async function handleRemindTime(ctx: Context) {
  const timeFromMessage = ctx.message?.text?.match(/[0-9]{2}:[0-9]{2}/)
  let time
  if (timeFromMessage) {
    const hour = Number(timeFromMessage[0].split(':')[0])
    const minutes = Number(timeFromMessage[0].split(':')[1])
    time = new Date()
    time.setHours(hour)
    time.setMinutes(minutes)
  } else {
    return ctx.reply('Неверное время: ' + timeFromMessage, sendOptions(ctx))
  }
  const user = ctx.dbuser
  user.settings = { remindTime: time }
  await user.save()
  return ctx.replyWithLocalization('got_time', sendOptions(ctx))
}
