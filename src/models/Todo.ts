require('module-alias/register')
import { DocumentType, Ref, getModelForClass, prop } from '@typegoose/typegoose'
import { Word, testQuestion } from '@/models/Word'
import { random } from 'mathjs'

export enum Step {
  minutes20,
  day1,
  week2,
  mounth1,
}

export class Todo {
  @prop({ required: true })
  remindTime!: Date

  @prop({ required: true, ref: Word })
  wordToRemind!: Ref<Word>

  @prop({ required: true })
  testQuestion!: testQuestion

  @prop({ required: true })
  telegramId!: number

  @prop({ required: true, default: Step.minutes20 })
  step!: Step

  public getTestQuestion(this: DocumentType<Todo>) {
    const {
      question,
      example,
      incorrectAnswer1,
      incorrectAnswer2,
      rightAnswer,
    } = this.testQuestion
    const answers = [incorrectAnswer1, incorrectAnswer2, rightAnswer]
    const randomAnswers = answers.sort(() => random() - 0.5)
    const rightAnswerIndex = randomAnswers.indexOf(rightAnswer)
    const text = `${question}\n${example}\n\nВарианты ответа:\n1) ${randomAnswers[0]}\n2) ${randomAnswers[1]}\n3) ${randomAnswers[2]}`
    return { text, rightAnswerIndex }
  }
}

export const TodoModel = getModelForClass(Todo)
