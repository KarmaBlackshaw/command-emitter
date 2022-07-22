// libs
const inquirer = require('inquirer')
const chalk = require('chalk')

// node core
const { exec } = require('node:child_process')
const path = require('path')
const fs = require('fs')

// config
require('dotenv').config()
const redis = require('./config/redis')

// constants
const CONSTANTS = {
  stop_command: 'cmd:stop',
  list_command: 'cmd:list'
}

const redisPathMaker = event => {
  return `server:command-emitter:${process.env.PROJECT_KEY}:${event}`
}

/**
 * PUBLISHER
 */
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

/**
 * PUBLISHER LOGGER
 */
const publisherListenStdEvents = async () => {
  await redis.subscribe(redisPathMaker('stderr'), msg => {
    console.log(msg)
  })

  await redis.subscribe(redisPathMaker('stdout'), msg => {
    console.log(msg)
  })

  await redis.subscribe(redisPathMaker('cwd'), msg => {
    console.log(chalk.cyan(`cwd: ${msg}`))
  })

  await redis.subscribe(redisPathMaker('list'), msg => {
    console.log(chalk.cyan(`listener: ${msg}`))
  })
}

/**
 * COMMAND LISTENER
 */
const listenForCommands = async () => {
  console.log(chalk.cyan('Listening for publisher commands...'))

  let cwd = process.cwd()
  await redis.subscribe(redisPathMaker('command'), command => {
    if (command === CONSTANTS.list_command) {
      redis.publisher.publish(redisPathMaker('list'), process.env.INSTANCE_NAME)
      return
    }

    if ((/^cd/g).test(command)) {
      const newCwd = path.join(cwd, command.replace(/cd /gi, ''))

      if (fs.existsSync(newCwd)) {
        redis.publisher.publish(redisPathMaker('cwd'), newCwd)
        cwd = newCwd
        return
      }
    }

    exec(command, { cwd }, (error, stdout, stderr) => {
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
