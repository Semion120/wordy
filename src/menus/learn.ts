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
  .text('Больше переводов', async (ctx) => {
    const user = ctx.dbuser
    if (!user.needTolearn || !user.needTolearn[0]) {
      throw new Error('Нет слова для изучения')
    }
    await responseWithWord(ctx, user.needTolearn[0], true, true)
  })
  .text('Больше примеров', async (ctx) => {
    const user = ctx.dbuser
    if (!user.needTolearn || !user.needTolearn[0]) {
      throw new Error('Нет слова для изучения')
    }
    await responseWithWord(ctx, user.needTolearn[0], true, false, true)
  })

export async function nextWord(ctx: Context) {
  const wordsToLearn = ctx.dbuser.needTolearn
  if (wordsToLearn && wordsToLearn.length > 0) {
    const nextWord = wordsToLearn[0]
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

export async function makeWordTemplate(
  word: Ref<Word> | undefined,
  moreTranslats = false,
  moreExamples = false
) {
  const w = await WordModel.findById(word?.toString())
  if (w) {
    const translates = getTranslates(w, moreTranslats)
    const examples = getExamples(w, moreExamples)
    return `${w.englishWord}\n${w.transcription}\n\n${translates}\n\n${examples}`
  } else {
    throw new Error('Cant find word with ID: ' + word?.toString())
  }
}

function getTranslates(word: Word, moreTranslats = false) {
  let translates = ``
  let num = 0
  if (!word.translates || !word.translates[0]) {
    throw new Error('Не найдены переводы у слова')
  }
  if (!moreTranslats) {
    if (word.translates[0]) {
      num += 1
      const translate = `${num}) ${word.translates[0]}\n`
      translates += translate
    }
    if (word.translates[1]) {
      num += 1
      const translate = `${num}) ${word.translates[1]}\n`
      translates += translate
    }
    if (word.translates[2]) {
      num += 1
      const translate = `${num}) ${word.translates[2]}`
      translates += translate
    }
  } else {
    for (const translate of word.translates) {
      num += 1
      const doneTranslate =
        num == word.translates.length
          ? `${num}) ${translate}`
          : `${num}) ${translate}\n`
      translates += doneTranslate
    }
    if (word.translates.length <= 3) {
      translates += '\n<b>Больше переводов в базе нет</b>'
    }
  }
  return translates
}
function getExamples(word: Word, moreExamples = false) {
  const examples = word.examples
  if (!examples || !examples[0]) {
    throw new Error('Не найдены переводы у слова')
  }
  let doneExample = ``
  if (!moreExamples) {
    doneExample = `${word.examples[0].englishExample.replace(
      word.englishWord,
      `<b>${word.englishWord}</b>`
    )}—${word.examples[0].russianExample}`
  } else {
    let num = 0
    for (const example of examples) {
      num += 1
      const ex =
        num == 3
          ? `${example.englishExample.replace(
              word.englishWord,
              `<b>${word.englishWord}</b>`
            )}—${example.russianExample}\n\n`
          : `${example.englishExample.replace(
              word.englishWord,
              `<b>${word.englishWord}</b>`
            )}—${example.russianExample}\n\n`
      doneExample += ex
    }
  }
  return doneExample
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
  edit = true,
  moreTranslats = false,
  moreExamples = false
) {
  if (edit) {
    return await ctx.editMessageText(
      await makeWordTemplate(nextWord, moreTranslats, moreExamples),
      {
        parse_mode: 'HTML',
        reply_markup: learnNewWordMenu,
      }
    )
  } else {
    return await ctx.reply(
      await makeWordTemplate(nextWord, moreTranslats, moreExamples),
      {
        parse_mode: 'HTML',
        reply_markup: learnNewWordMenu,
      }
    )
  }
}
