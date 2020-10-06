'use strict'
const mutantService = require('../services/mutant')
const statsService = require('../services/stats')
const Joi = require('@hapi/joi')
const Boom = require('@hapi/boom')

const plugin = {
  name: 'mutant',
  version: '0.1.0',
  register: (server, options) => {
    server.route(
      [
        {
          method: ['POST'],
          path: '/mutant',
          config: {
            validate: {
              payload: {
                dna: Joi.array().items(Joi.string())
              }
            },
            handler: async (request, h) => {
              try {
                const result = await mutantService.getOrCreate(request.payload.dna)
                statsService.registerInteraction(!!result)
                return h.response({
                  message: result ? 'Mutant verified' : 'Not a mutant',
                  id: result.insertedId
                }).code(result ? 200 : 403)
              } catch (e) {
                if (e.name === 'MongoError' && e.code === 11000) {
                  console.log(e)
                  throw Boom.badData(`Error processing request`)
                }
              }
            }
          }
        }
      ]
    )
  }
}

module.exports = plugin
