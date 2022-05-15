import { Menu } from '@grammyjs/menu'
import { Ref } from '@typegoose/typegoose'
import { Word, WordModel } from '@/models/Word'
import Context from '@/models/Context'
import makeTodos from '@/reminder/makeTodo'

export const learnStartMenu = new Menu<Context>('learnStart')
  .text('5', async (ctx) => {
    await sendFirstWord(ctx, 5)
  })
  .text('10', async (ctx) => {
    return await sendFirstWord(ctx, 10)
  })
  .text('15', async (ctx) => {
    return await sendFirstWord(ctx, 15)
  })
  .row()

export const learnNewWordMenu = new Menu<Context>('learnNewWord')
  .text('❌ Доучусь потом ', async (ctx) => {
    ctx.menu.close()
    return await ctx.editMessageText('До встречи в другой раз!')
  })
  .text('✅ Дальше', async (ctx) => {
    const wordsToLearn = ctx.dbuser.needTolearn
    if (wordsToLearn && wordsToLearn[0]) {
      const word = wordsToLearn[0]
      await makeTodos(word, ctx.dbuser)
    } else {
      throw new Error('Не получается найти needTolearn')
    }
    await updateWordsDb(ctx)
    await nextWord(ctx)
  })
  .row()

export async function nextWord(ctx: Context) {
  const wordsToLearn = ctx.dbuser.needTolearn
  if (wordsToLearn && wordsToLearn.length > 0) {
    const nextWord = wordsToLearn[0]
    console.log(wordsToLearn.length)
    return await responseWithWord(ctx, nextWord)
  } else {
    ctx.menu.close()
    return await ctx.editMessageText('Это было последнее слово, до встречи!', {
      parse_mode: 'HTML',
    })
  }
}

async function sendFirstWord(ctx: Context, numberOfWords: number) {
  await findNewWordsToLearn(ctx, numberOfWords)
  if (ctx.dbuser.needTolearn && ctx.dbuser.needTolearn[0]) {
    const firstWord = ctx.dbuser.needTolearn[0]
    return await responseWithWord(ctx, firstWord)
  } else {
    throw new Error('Cant find needTolearn at' + ctx.dbuser.telegramId)
  }
}

async function findNewWordsToLearn(ctx: Context, numberOfWords: number) {
  await ctx.dbuser.findRandomWords(numberOfWords)
}

export async function makeWordTemplate(word: Ref<Word> | undefined) {
  const w = await WordModel.findById(word?.toString())
  if (w) {
    let translate = 'Translate is undefind'
    if (w.translates) {
      translate = w.translates[0]
    } else {
      throw new Error(`Cannot find translates for |${w.englishWord}|`)
    }
    return `${w.englishWord}\n${w.transcription}\n${translate}\n\n${w.examples[0].englishExample}—${w.examples[0].russianExample}\n\n${w.examples[1].englishExample}—${w.examples[1].russianExample}`
  } else {
    throw new Error('Cant find word with ID: ' + word?.toString())
  }
}

async function updateWordsDb(ctx: Context) {
  const wordsToLearn = ctx.dbuser.needTolearn
  if (wordsToLearn) {
    const learnedWord = wordsToLearn[0]
    ctx.dbuser.learnedWords?.push(learnedWord)
  } else {
    throw new Error('Cant find needTolearn words when want to update DB')
  }

  ctx.dbuser.needTolearn?.shift()
  await ctx.dbuser.save()
}

export async function responseWithWord(
  ctx: Context,
  nextWord: Ref<Word>,
  edit = true
) {
  if (edit) {
    return await ctx.editMessageText(await makeWordTemplate(nextWord), {
      parse_mode: 'HTML',
      reply_markup: learnNewWordMenu,
    })
  } else {
    return await ctx.reply(await makeWordTemplate(nextWord), {
      parse_mode: 'HTML',
      reply_markup: learnNewWordMenu,
    })
  }
}
