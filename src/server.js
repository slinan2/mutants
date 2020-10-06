'use strict'

require('dotenv').config()

const Hapi = require('hapi')
const Boom = require('@hapi/boom')
const mongoUtil = require('./persistence')

const server = Hapi.server({
  port: 3030,
  host: '0.0.0.0',
  router: {
    stripTrailingSlash: true
  }
})

const addAPIs = async () => {
  await server.register([
    require('./api/mutant'),
    require('./api/stats')
  ])
}
const init = async () => {
  // connect to DB
  await mongoUtil.connectToServer()
  server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => {
      return 'API is running'
    }
  })
  server.route({
    method: '*',
    path: '/{any*}',
    handler: (request, h) => {
      return Boom.notFound('That path doesn\'t exist!')
    }
  })
  await addAPIs()
  await mongoUtil.createIndexes()
  try {
    if (!module.parent) {
      console.log('Server up on %s', server.info.uri)
      await server.start()
    } else {
      await server.initialize()
    }
    return server
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

process.on('unhandledRejection', (err) => {
  console.error(err)
  process.exit(1)
})

void (async function () {
  if (!module.parent) {
    await init()
  }
}())

module.exports = {
  init
}
