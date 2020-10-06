'use strict'
const mongoUtil = require('../persistence')
const db = mongoUtil.getDb()

module.exports = {
  async getStats () {
    const collection = db.collection('stats')
    let fields = {
      count_mutant_dna: true,
      count_human_dna: true,
      _id: false
    }
    const stats = await collection.findOne({}, { projection: fields })
    const ratio = (stats.count_mutant_dna / stats.count_human_dna || 0).toFixed(2)
    const formatRatio = ratio === 'Infinity' ? 'Infinity' : parseFloat(ratio)
    return { ...stats, ratio: formatRatio }
  },
  async registerInteraction (isMutant) {
    const collection = db.collection('stats')
    const update = isMutant ? { $inc: { count_mutant_dna: 1 } } : { $inc: { count_human_dna: 1 } }
    return collection.findOneAndUpdate({}, update)
  }
}
