'use strict'
const mongoUtil = require('../persistence')
const mutantLogic = require('../logic/mutant')
const db = mongoUtil.getDb()

module.exports = {
  async getOrCreate (dna) {
    const mutant = mutantLogic.isMutant(dna)
    const collection = db.collection('mutants')
    const mutantInfo = { dna: dna.toString(), mutant }
    collection.insertOne(mutantInfo).catch((e) => {
      // Existing mutant
    })
    return mutant
  }
}
