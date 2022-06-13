import Context from '@/models/Context'
import sendOptions from '@/helpers/sendOptions'

export default async function handleHelp(ctx: Context) {
  if (!ctx.from) {
    throw new Error('No from field found')
  }
  return await ctx.replyWithLocalization('help', sendOptions(ctx))
}
