import * as findorcreate from 'mongoose-findorcreate'
import {
  DocumentType,
  getModelForClass,
  modelOptions,
  plugin,
  prop,
} from '@typegoose/typegoose'
import { FindOrCreate } from '@typegoose/typegoose/lib/defaultClasses'

import { floor, random } from 'mathjs'

export interface Example {
  englishExample: string
  russianExample: string
}
export interface testQuestion {
  question: string
  example: string
  incorrectAnswer1: string | undefined
  incorrectAnswer2: string | undefined
  rightAnswer: string | undefined
}

@plugin(findorcreate)
@modelOptions({ schemaOptions: { collection: 'words_new' } })
export class Words_new extends FindOrCreate {
  @prop({ required: true, index: true, unique: true })
  englishWord!: string

  @prop({ index: true })
  transcription?: string

  @prop({ default: [], type: String })
  translates?: string[]

  @prop({ required: true, default: [] })
  examples!: Example[]

  @prop()
  testQuestion?: testQuestion

  public async makeTestQuestion(
    this: DocumentType<Words_new>
  ): Promise<testQuestion> {
    const question = 'Как перевести слово: ' + this.englishWord + '?'
    let example = ''
    if (this.examples[0]) {
      example = this.examples[0].englishExample
    }

    const answer1 = await findRandomWord()
    let incorrectAnswer1
    if (answer1.translates) {
      incorrectAnswer1 = answer1.translates[0]
    }
    const answer2 = await findRandomWord()
    let incorrectAnswer2
    if (answer2.translates) {
      incorrectAnswer2 = answer2.translates[0]
    }
    const translate = this.translates
    let rightAnswer
    if (translate) {
      rightAnswer = translate[0]
    }
    return {
      question,
      example,
      incorrectAnswer1,
      incorrectAnswer2,
      rightAnswer,
    }
  }
}

export const Words_newModel = getModelForClass(Words_new)

export async function findRandomWord(): Promise<DocumentType<Words_new>> {
  const words = await Words_newModel.find({})
  const randomIndex = floor(random() * 2800)
  return words[randomIndex]
}

export async function findOrCreateWord(
  englishWord: string,
  transcription: string | undefined,
  translates: string[] | string | undefined,
  examples: { englishExample: string; russianExample: string }[]
) {
  return await Words_newModel.findOrCreate({
    englishWord,
    transcription,
    translates,
    examples,
  })
}
