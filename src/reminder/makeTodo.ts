import { DocumentType, Ref } from '@typegoose/typegoose'
import { Step, TodoModel } from '@/models/Todo'
import { User } from '@/models/User'
import { Word, WordModel } from '@/models/Word'
import todayMSK from '@/helpers/todayMSK'

export default async function makeTodos(
  wordId: Ref<Word>,
  user: DocumentType<User>
) {
  const word = await WordModel.findById(wordId)
  if (word) {
    try {
      await makeTodo20Minutes(word, user)
      await makeTodo1Day(word, user)
      await makeTodo2Week(word, user)
      await makeTodo1mounth(word, user)
    } catch (err) {
      console.log(err)
    }
  } else {
    throw new Error('Не получилось найти слово по ID в создании напоминаний')
  }
}

async function makeTodo20Minutes(
  word: DocumentType<Word>,
  user: DocumentType<User>
) {
  const remindTime = todayMSK()

  const delta = remindTime.getMinutes() + 20
  remindTime.setMinutes(delta)
  const wordToRemind = word
  const testQuestion = word.testQuestion
  const telegramId = user.telegramId

  return await TodoModel.create({
    remindTime,
    wordToRemind,
    testQuestion,
    telegramId,
    step: Step.minutes20,
  })
}

async function makeTodo1Day(
  word: DocumentType<Word>,
  user: DocumentType<User>
) {
  const remindTime = todayMSK()

  const delta = remindTime.getDate() + 1
  remindTime.setDate(delta)
  const wordToRemind = word
  const testQuestion = word.testQuestion
  const telegramId = user.telegramId

  return await TodoModel.create({
    remindTime,
    wordToRemind,
    testQuestion,
    telegramId,
    step: Step.day1,
  })
}

async function makeTodo2Week(
  word: DocumentType<Word>,
  user: DocumentType<User>
) {
  const remindTime = todayMSK()

  const delta = remindTime.getDate() + 14
  remindTime.setDate(delta)
  const wordToRemind = word
  const testQuestion = word.testQuestion
  const telegramId = user.telegramId

  return await TodoModel.create({
    remindTime,
    wordToRemind,
    testQuestion,
    telegramId,
    step: Step.week2,
  })
}

async function makeTodo1mounth(
  word: DocumentType<Word>,
  user: DocumentType<User>
) {
  const remindTime = todayMSK()

  const delta = remindTime.getMonth() + 1
  remindTime.setMonth(delta)
  const wordToRemind = word
  const testQuestion = word.testQuestion
  const telegramId = user.telegramId

  console.log('')
  return await TodoModel.create({
    remindTime,
    wordToRemind,
    testQuestion,
    telegramId,
    step: Step.mounth1,
  })
}
