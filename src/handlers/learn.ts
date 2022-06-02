import { learnStartMenu, responseWithWord } from '@/menus/learn'
import Context from '@/models/Context'
import sendOptions from '@/helpers/sendOptions'

export default async function handleLearn(ctx: Context) {
  await ctx.dbuser.setRemindForLearn()
  const options = sendOptions(ctx)
  const wordsToLearn = ctx.dbuser.needTolearn
  if (wordsToLearn && wordsToLearn[0]) {
    const nextWord = wordsToLearn[0]
    return await responseWithWord(ctx, nextWord, false)
  } else {
    return ctx.replyWithLocalization('learnStart', {
      ...options,
      reply_markup: learnStartMenu,
    })
  }
}
