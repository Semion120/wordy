import { UserModel } from '@/models/User'
import Context from '@/models/Context'
import sendOptions from '@/helpers/sendOptions'

export default async function handleHelp(ctx: Context) {
  if (!ctx.from) {
    throw new Error('No from field found')
  }
  const user = await UserModel.findOne({
    telegramId: ctx.from?.id,
  })
  if (user && user?.settings?.remindTime) {
    return ctx.replyWithLocalization('help', sendOptions(ctx))
  } else {
    return ctx.replyWithLocalization('helpForNew', sendOptions(ctx))
  }
}
