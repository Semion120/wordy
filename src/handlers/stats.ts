import { WordModel } from '@/models/Word'
import Context from '@/models/Context'
import sendOptions from '@/helpers/sendOptions'

export default async function handleStats(ctx: Context) {
  const options = sendOptions(ctx)
  const wordsLearned = ctx.dbuser.learnedWords
  const wordsLearnedLength = wordsLearned?.length
  const wordsInDictLength = await WordModel.count()
  return await ctx.reply(
    `${ctx.i18n.t('getStats', { wordsLearnedLength, wordsInDictLength })}`,
    options
  )
}
