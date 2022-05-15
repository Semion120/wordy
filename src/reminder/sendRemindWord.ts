import { DocumentType } from '@typegoose/typegoose'
import { InlineKeyboard } from 'grammy'
import { Todo } from '@/models/Todo'
import bot from '@/helpers/bot'

export function makeMenuWithAnswers(rightAnswer: number) {
  const menu = new InlineKeyboard()
  for (let i = 0; i < 3; i++) {
    const index = i + 1
    if (i == rightAnswer) {
      menu.text(index.toString(), 'true-answer-remind')
    } else {
      menu.text(index.toString(), 'false-answer-remind')
    }
  }
  return menu
}

export async function sendRemindWord(todo: DocumentType<Todo>) {
  const testQuestion = todo.getTestQuestion()
  const text = testQuestion.text
  const rightAnswerIndex = testQuestion.rightAnswerIndex
  const menuWithAnswers = makeMenuWithAnswers(rightAnswerIndex)
  return await bot.api.sendMessage(todo.telegramId, text, {
    parse_mode: 'HTML',
    reply_markup: menuWithAnswers,
  })
}
