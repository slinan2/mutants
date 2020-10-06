'use strict'

const Lab = require('lab')
const Code = require('code')
const Server = require('../src/server')
const mongoUtil = require('../src/persistence')
let server

const lab = exports.lab = Lab.script()
const before = lab.before
const after = lab.after
const describe = lab.describe
const expect = Code.expect
const it = lab.it
let db

async function cleanDatabase () {
  await db.collection('mutants').deleteMany({})
  await db.collection('stats').findOneAndUpdate({}, {
    $set: {
      count_mutant_dna: 0,
      count_human_dna: 0
    }
  })
}

describe('Mutants (Integration)', () => {
  before(async () => {
    server = await Server.init()
    db = mongoUtil.getDb()
    await cleanDatabase()
  })

  after(async () => {
    if (!server) {
      return
    }
    await server.stop()
  })

  // Validate a mutant
  it('POST /mutants - Validate mutant', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/mutant',
      payload: {
        dna: ['GAGG', 'AATG', 'GGGG', 'AAAA']
      }
    })
    expect(response.statusCode).to.equal(200)
  })

  // Validate a human
  it('POST /mutants - Validate human', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/mutant',
      payload: {
        dna: ['GATA', 'CATA', 'TACA', 'ACAT']
      }
    })
    expect(response.statusCode).to.equal(403)
  })

  // Store a mutant
  it('POST /mutants - Store a mutant', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/mutant',
      payload: {
        dna: ['GAGG', 'AATG', 'GGGG', 'AAAA']
      }
    })
    expect(response.statusCode).to.equal(200)
    const mutant = await db.collection('mutants').findOne({ dna: ['GAGG', 'AATG', 'GGGG', 'AAAA'].toString() })
    expect(mutant.dna).to.equal(['GAGG', 'AATG', 'GGGG', 'AAAA'].toString())
    expect(mutant.mutant).to.equal(true)
  })

  // Store a human
  it('POST /mutants - Store a human', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/mutant',
      payload: {
        dna: ['GAGG', 'AGTG', 'GGGA', 'TTCT']
      }
    })
    expect(response.statusCode).to.equal(403)
    const mutant = await db.collection('mutants').findOne({ dna: ['GAGG', 'AGTG', 'GGGA', 'TTCT'].toString() })
    expect(mutant.dna).to.equal(['GAGG', 'AGTG', 'GGGA', 'TTCT'].toString())
    expect(mutant.mutant).to.equal(false)
  })

  // Don't store more than once
  it('POST /mutants - Don`t store more than once', async () => {
    for (let i = 0; i < 11; i++) {
      const response = await server.inject({
        method: 'POST',
        url: '/mutant',
        payload: {
          dna: ['GAGG', 'AGTG', 'GGGA', 'TTCT']
        }
      })
      expect(response.statusCode).to.equal(403)
    }
    const mutants = await db.collection('mutants').find({ dna: ['GAGG', 'AGTG', 'GGGA', 'TTCT'].toString() }).count()
    expect(mutants).to.equal(1)
  })
})

describe('Stats (Integration)', () => {
  before(async () => {
    await cleanDatabase()
  })

  // Get empty stats
  it('GET /stats - Get empty stats', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/stats'
    })
    expect(response.statusCode).to.equal(200)
    expect(response.result.count_human_dna).to.equal(0)
    expect(response.result.count_mutant_dna).to.equal(0)
    expect(response.result.ratio).to.equal(0)
  })

  // Divide by 0 humans
  it('GET /stats - Divide by 0 humans', async () => {
    await server.inject({
      method: 'POST',
      url: '/mutant',
      payload: {
        dna: ['GTGG', 'AATG', 'AAGG', 'AAAA']
      }
    })

    await new Promise(resolve => setTimeout(resolve, 200))
    const response = await server.inject({
      method: 'GET',
      url: '/stats'
    })
    expect(response.statusCode).to.equal(200)
    expect(response.result.count_human_dna).to.equal(0)
    expect(response.result.count_mutant_dna).to.equal(1)
    expect(response.result.ratio).to.equal('Infinity')
  })

  // Validate 5 human verifications
  it('GET /stats - Validate 5 human verifications', async () => {
    await cleanDatabase()
    for (let i = 0; i < 5; i++) {
      const response = await server.inject({
        method: 'POST',
        url: '/mutant',
        payload: {
          dna: ['GAGG', 'AGTG', 'GGGA', 'TTCT']
        }
      })
      expect(response.statusCode).to.equal(403)
    }

    await new Promise(resolve => setTimeout(resolve, 200))
    const response = await server.inject({
      method: 'GET',
      url: '/stats'
    })
    expect(response.statusCode).to.equal(200)
    expect(response.result.count_human_dna).to.equal(5)
    expect(response.result.count_mutant_dna).to.equal(0)
    expect(response.result.ratio).to.equal(0)
  })

  // Validate 5 mutant verifications
  it('GET /stats - Validate 5 mutant verifications', async () => {
    await cleanDatabase()
    for (let i = 0; i < 5; i++) {
      const response = await server.inject({
        method: 'POST',
        url: '/mutant',
        payload: {
          dna: ['GAGG', 'AGTG', 'GGGA', 'AAAA']
        }
      })
      expect(response.statusCode).to.equal(200)
    }
    await new Promise(resolve => setTimeout(resolve, 200))
    const response = await server.inject({
      method: 'GET',
      url: '/stats'
    })
    expect(response.statusCode).to.equal(200)
    expect(response.result.count_human_dna).to.equal(0)
    expect(response.result.count_mutant_dna).to.equal(5)
    expect(response.result.ratio).to.equal('Infinity')
  })

  // Validate ratio variations
  it('GET /stats - Validate ratio variations', async () => {
    await cleanDatabase()
    for (let i = 0; i < 5; i++) {
      const response = await server.inject({
        method: 'POST',
        url: '/mutant',
        payload: {
          dna: ['GAGG', 'AGTG', 'GGGA', 'AAAA']
        }
      })
      expect(response.statusCode).to.equal(200)
    }

    for (let i = 0; i < 5; i++) {
      const response = await server.inject({
        method: 'POST',
        url: '/mutant',
        payload: {
          dna: ['GAGG', 'AGTG', 'GGGA', 'GATA']
        }
      })
      expect(response.statusCode).to.equal(403)
    }
    await new Promise(resolve => setTimeout(resolve, 200))
    let response = await server.inject({
      method: 'GET',
      url: '/stats'
    })
    expect(response.statusCode).to.equal(200)
    expect(response.result.count_human_dna).to.equal(5)
    expect(response.result.count_mutant_dna).to.equal(5)
    expect(response.result.ratio).to.equal(1)

    for (let i = 0; i < 5; i++) {
      const response = await server.inject({
        method: 'POST',
        url: '/mutant',
        payload: {
          dna: ['GAGG', 'AGTG', 'GGGA', 'GATA']
        }
      })
      expect(response.statusCode).to.equal(403)
    }
    await new Promise(resolve => setTimeout(resolve, 200))
    response = await server.inject({
      method: 'GET',
      url: '/stats'
    })
    expect(response.statusCode).to.equal(200)
    expect(response.result.count_human_dna).to.equal(10)
    expect(response.result.count_mutant_dna).to.equal(5)
    expect(response.result.ratio).to.equal(0.5)
  })
})
