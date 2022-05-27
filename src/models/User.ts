require('module-alias/register')
import { Dict } from '@/models/Dict'
import { DocumentType, Ref, getModelForClass, prop } from '@typegoose/typegoose'
import { Todo } from '@/models/Todo'
import { Word, WordModel } from '@/models/Word'
import { random, round } from 'mathjs'

export interface Settings {
  remindTime: Date
}

export class User {
  @prop({ required: true, unique: true })
  telegramId!: number
  @prop({ required: true, default: 'ru' })
  language!: string
  @prop({ ref: Dict })
  useDict?: Ref<Dict>
  @prop({ ref: Word, default: [] })
  learnedWords?: Ref<Word>[]
  @prop({
    default: { reremindTime: defaultTime() },
  })
  settings?: Settings
  @prop({ ref: Word, default: [] })
  needTolearn?: Ref<Word>[]
  @prop({ ref: Todo, default: [] })
  todos?: Ref<Todo>[]
  @prop({ ref: Todo, default: undefined })
  todoOnCheck?: Ref<Todo> | undefined

  public async findRandomWords(
    this: DocumentType<User>,
    numberOfWords: number
  ) {
    const words = await WordModel.find({})
    const wordsWithoutLearned = words
      .map((word) => word._id.toString())
      .filter(
        (i: string) =>
          !this.learnedWords
            ?.map((i) => {
              if (i) {
                return i.toString()
              }
            })
            .includes(i)
      )
    for (let i = 0; i < numberOfWords; i++) {
      const arrayLength = wordsWithoutLearned.length
      const index = round(getRandomIndex(0, arrayLength - 1))
      const word: Ref<Word> = wordsWithoutLearned[index]
      wordsWithoutLearned.splice(index, 1)
      this.needTolearn?.push(word)
    }
    await this.save()
  }
}

export const UserModel = getModelForClass(User)

export async function findOrCreateUser(telegramId: number) {
  const user = await UserModel.findOne({ telegramId })
  if (!user) {
    return await UserModel.create({
      telegramId,
      language: 'ru',
    })
  }
  return user
}

function defaultTime(): Date {
  const time = new Date()
  time.setHours(19)
  time.setMinutes(0)
  return time
}

function getRandomIndex(min: number, max: number) {
  return random() * (max - min) + min
}
