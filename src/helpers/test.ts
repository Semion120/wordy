require('module-alias/register')
import { WordModel } from '@/models/Word'
import startMongo from '@/helpers/startMongo'

start().catch((err) => {
  console.log(err)
})

async function start() {
  await startMongo()
  const words = await WordModel.find({})
  if (words) {
    for (const word of words) {
      if (word.testQuestion) {
        if (
          !word.testQuestion.example ||
          !word.testQuestion.incorrectAnswer1 ||
          !word.testQuestion.incorrectAnswer2 ||
          !word.testQuestion.question ||
          !word.testQuestion.rightAnswer
        ) {
          console.log(word.testQuestion)
        }
        // console.log(
        //   Boolean(word.testQuestion.example),
        //   Boolean(word.testQuestion.incorrectAnswer1),
        //   Boolean(word.testQuestion.incorrectAnswer2),
        //   Boolean(word.testQuestion.question),
        //   Boolean(word.testQuestion.rightAnswer)
        // )
        continue
      }
      word.testQuestion = await word.makeTestQuestion()
      await word.save()
      console.log(word.testQuestion)
    }
  }
}
