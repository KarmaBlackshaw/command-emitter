// libs
const inquirer = require('inquirer')
const chalk = require('chalk')

// node core
const { exec } = require('node:child_process')

// config
require('dotenv').config()

// config
const redis = require('./config/redis')

// constants
const CONSTANTS = {
  stop_command: 'cmd:stop'
}

const redisPathMaker = event => {
  return `server:command-emitter:${process.env.PROJECT_KEY}:${event}`
}

const promptCommand = async () => {
  const { command } = await inquirer.prompt({
    type: 'string',
    name: 'command',
    message: 'Enter command to be emitted'
  })

  if (command === CONSTANTS.stop_command) {
    console.log('\nThank you for using command emitter!')
    return
  }

  redis.publisher.publish(redisPathMaker('command'), command)

  return promptCommand()
}

const publisherListenStdEvents = async () => {
  await redis.subscribe(redisPathMaker('stderr'), msg => {
    console.log(msg)
  })

  await redis.subscribe(redisPathMaker('stdout'), msg => {
    console.log(msg)
  })
}

const listenForCommands = async () => {
  console.log(chalk.cyan('Listening for publisher commands...'))

  await redis.subscribe(redisPathMaker('command'), command => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`)
        return
      }

      if (stderr) {
        console.log(`stderr: ${stderr}`)
        redis.publisher.publish(redisPathMaker('stderr'), stderr)
        return
      }

      console.log(`stdout: ${stdout}`)
      redis.publisher.publish(redisPathMaker('stdout'), stdout)
    })
  })
}

const bootstrap = async () => {
  await redis.start()

  process.on('exit', function () {
    console.log('Goodbye!')
  })

  if (Number(process.env.IS_PUBLISHER)) {
    console.log(chalk.cyan(`
      Welcome to Command Emitter.
      To stop sending command, type "${CONSTANTS.stop_command}"
    `))

    await promptCommand()
  } else if (Number(process.env.IS_PUBLISHER_LOGGER)) {
    await publisherListenStdEvents()
  } else {
    await listenForCommands()
  }
}

bootstrap()
