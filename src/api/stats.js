'use strict'
const statsService = require('../services/stats')

const plugin = {
  name: 'stats',
  version: '0.1.0',
  register: (server, options) => {
    server.route(
      [{
        method: ['GET'],
        path: '/stats',
        handler: async (request, h) => {
          const stats = await statsService.getStats()
          return h.response(stats).type('application/json')
        }
      }]
    )
  }
}

module.exports = plugin
