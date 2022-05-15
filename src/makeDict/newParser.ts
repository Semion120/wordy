require('module-alias/register')
import { WordModel, findOrCreateWord } from '@/models/Word'
import { parse } from 'node-html-parser'
import { readFileSync } from 'fs'
import axios from 'axios'
import startMongo from '@/helpers/startMongo'

const wordsString = readFileSync('./src/makeDict/goldenDict.txt', 'utf8')
let words = wordsString.split(',')
const baseUrl = 'https://englishlib.org/dictionary/en-ru/'
const badWords: string[] = []

bestFunc()
  .then(() => {
    console.log('Закончено!')
    console.log('Проблемные слова:')
    console.log(badWords)
    return
  })
  .catch((err) => {
    console.log(err)
  })

async function bestFunc() {
  await startMongo()
  const dict = await WordModel.find({})
  const wordFromDict: string[] = []
  for (const word of dict) {
    wordFromDict.push(word.englishWord)
  }
  words = words.filter(function (i) {
    return wordFromDict.indexOf(i) < 0
  })
  console.log(words.length)
  for (const workingWord of words) {
    const url = baseUrl + `${workingWord}.html`
    await getAdditionalInfo(url, workingWord).catch((err) => {
      console.log(err)
    })
  }
}

async function getHtml(url: string) {
  return await axios.get(url)
}
// Добавить проверку по базе данных, и сохранение слов котоыре не прошли по каким то параметрам
async function getAdditionalInfo(url: string, workingWord: string) {
  await delay(1000)
  await getHtml(url).then(async (html) => {
    if (typeof html.data == 'string') {
      const dom = parse(html.data)
      try {
        //transcription
        const transcription = dom
          .querySelector('#uk_tr_sound')
          ?.querySelector('span')?.text
        //translate
        let translates: string | string[] | undefined = await getTranslates(
          workingWord
        )
        if (!translates) {
          if (dom.querySelector('i.tr_ress')?.text) {
            translates = dom.querySelector('i.tr_ress')?.text
          }
        }
        //table with examples
        const table = dom.querySelector('table.style_tr_text')
        const lines = table?.querySelectorAll('tr')
        let examples
        if (lines) {
          examples = [
            {
              englishExample: lines[0].querySelectorAll('td')[0]?.text,
              russianExample: lines[0].querySelectorAll('td')[1]?.text,
            },
            {
              englishExample: lines[1].querySelectorAll('td')[0]?.text,
              russianExample: lines[1].querySelectorAll('td')[1]?.text,
            },
            {
              englishExample: lines[2].querySelectorAll('td')[0]?.text,
              russianExample: lines[2].querySelectorAll('td')[1]?.text,
            },
          ]
        } else {
          throw new Error('Не нашло строки таблицы в примерах')
        }
        console.log(
          workingWord,
          Boolean(transcription),
          Boolean(translates),
          Boolean(examples)
        )
        await findOrCreateWord(workingWord, transcription, translates, examples)
      } catch (err) {
        console.log(err)
      }
    }
  })
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function getTranslates(workingWord: string) {
  const url = 'https://www.lingvolive.com/en-us/translate/en-ru/' + workingWord
  const translatesArr: string[] = []
  let translates
  await getHtml(url).then((html) => {
    if (typeof html.data == 'string') {
      const dom = parse(html.data)
      const lis = dom.querySelector('ol._1Mc81._1TaPP')?.querySelectorAll('li')
      if (lis) {
        for (const li of lis) {
          translatesArr.push(li.text)
        }
        translates = translatesArr
      } else {
        translates = dom.querySelector('span._1vkMh.Zf_4w._1Ib4l')?.text
      }
    }
  })
  return translates
}
