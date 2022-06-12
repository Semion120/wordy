import 'module-alias/register'

import { TodoModel } from '@/models/Todo'
import { UserModel } from '@/models/User'
import startMongo from '@/helpers/startMongo'

async function resetBd() {
  await startMongo()
  await UserModel.deleteMany({})
  await TodoModel.deleteMany({})
}

resetBd()
  .then(() => {
    return console.log('Выполнена очистка БД')
  })
  .catch((err) => {
    console.log(err)
  })
