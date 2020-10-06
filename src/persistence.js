const mongo = require('mongodb')
const MongoClient = mongo.MongoClient
const url = 'mongodb://mongodb:27017/local-mutant-analyzer'

var _db

module.exports = {
  connectToServer: async () => {
    console.log('Establishing connection to MongoDB...')
    await new Promise(resolve => setTimeout(resolve, 10000))
    const client = await MongoClient.connect(url, {
      reconnectTries: 60,
      reconnectInterval: 1000,
      autoReconnect: true,
      connectTimeoutMS: 20000,
      socketTimeoutMS: 45000,
      useNewUrlParser: true
    })
      .catch(err => { console.log(err) })
    _db = client.db('mutant-analyzer')
  },
  createIndexes: async () => {
    _db.createCollection('stats', { capped: true, size: 100000, max: 1 })
    const statsRow = await _db.collection('stats').count({}, { limit: 1 })
    if (statsRow !== 1) {
      await _db.collection('stats').findOneAndUpdate({}, {
        $set: {
          count_mutant_dna: 0,
          count_human_dna: 0
        }
      }, { upsert: true })
    }
    await _db.collection('mutants').createIndex({ dna: 1 }, { unique: true })
  },
  getDb: () => {
    return _db
  },
  buildObjectID: (stringId) => {
    return mongo.ObjectID(stringId)
  }
}
