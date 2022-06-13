import 'module-alias/register'

import { UserModel } from '@/models/User'
import startMongo from '@/helpers/startMongo'

async function resetBd() {
  await startMongo()
  const users = await UserModel.find()
  for (const user of users) {
    user.todos = []
    user.todoOnCheck = undefined
    user.nextRemindForLearn = undefined
    user.nextRemindForCheck = undefined
    user.lostDaysForLearn = 0
  }
  await UserModel.deleteMany()
  await UserModel.insertMany(users)
}

resetBd()
  .then(() => {
    return console.log('Выполнена очистка БД')
  })
  .catch((err) => {
    console.log(err)
  })
