import 'module-alias/register'

import { TodoModel } from '@/models/Todo'
import { WordModel } from '@/models/Word'
import { Words_newModel } from '@/models/WordsUpdate'
import startMongo from '@/helpers/startMongo'

updateWords().catch((err) => console.log(err))

async function updateWords() {
  await startMongo()
  const words_old = await WordModel.find({})
  const totalLength = words_old.length
  let numOfWord = 0
  for (const wordOld of words_old) {
    const wordNew = await Words_newModel.findOne({
      englishWord: wordOld.englishWord,
    })
    if (!wordNew) {
      continue
    }

    wordOld.translates = wordNew.translates
    wordOld.transcription = wordNew.transcription
    wordOld.translates = wordNew.translates
    if (wordNew.examples[0]) {
      wordOld.examples = wordNew.examples
    }

    numOfWord += 1
    await wordOld.save()
    await wordOld.makeTestQuestion()
    console.log(`Обновлено ${numOfWord} из ${totalLength}`)
  }

  // Update ToDos
  const todos = await TodoModel.find({})
  if (!todos) {
    return
  }
  for (const todo of todos) {
    const word = await WordModel.findById(todo.wordToRemind)
    if (!word || !word.testQuestion) {
      continue
    }
    todo.testQuestion = word?.testQuestion
    await todo.save()
  }
  console.log('Обновление БД слов выполнено')
}
