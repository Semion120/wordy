import 'module-alias/register'
import 'reflect-metadata'
import 'source-map-support/register'

import { falseRemindAnswer, trueRemindAnswer } from '@/handlers/remindAnswer'
import { ignoreOld, sequentialize } from 'grammy-middlewares'
import { learnNewWordMenu, learnStartMenu } from '@/menus/learn'
import { run } from '@grammyjs/runner'
import attachUser from '@/middlewares/attachUser'
import bot from '@/helpers/bot'
import configureI18n from '@/middlewares/configureI18n'
import handleCheck from '@/handlers/check'
import handleLanguage from '@/handlers/language'
import handleLearn from '@/handlers/learn'
import handleRemindTime from '@/handlers/remindTime'
import handleSettings from '@/handlers/settings'
import handleStats from '@/handlers/stats'
import i18n from '@/helpers/i18n'
import languageMenu from '@/menus/language'
import sendHelp from '@/handlers/help'
import settingsMenu from '@/menus/settings'
import startMongo from '@/helpers/startMongo'

async function runApp() {
  console.log('Starting app...')
  // Mongo
  await startMongo()
  console.log('Mongo connected')
  bot
    // Middlewares
    .use(sequentialize())
    .use(ignoreOld(2 * 24 * 60 * 60))
    .use(attachUser)
    .use(i18n.middleware())
    .use(configureI18n)
    // Menus
    .use(languageMenu)
    .use(settingsMenu)
    .use(learnNewWordMenu)
    .use(learnStartMenu)
  // Commands
  bot.command(['help', 'start'], sendHelp)
  bot.command('settings', handleSettings)
  bot.command('language', handleLanguage)
  bot.command('learn', handleLearn)
  bot.command('stats', handleStats)
  bot.command('check', handleCheck)
  // For Reminder
  bot.callbackQuery('true-answer-remind', trueRemindAnswer)
  bot.callbackQuery('false-answer-remind', falseRemindAnswer)
  // Words
  bot.hears(/[0-9]{2}:[0-9]{2}/, handleRemindTime)
  // Errors
  bot.catch(console.error)
  // Start bot
  await bot.init()
  run(bot)
  console.info(`Bot ${bot.botInfo.username} is up and running`)
}

void runApp()
