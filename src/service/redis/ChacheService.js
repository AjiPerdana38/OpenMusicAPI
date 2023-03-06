const redis = require('redis')
const { redisServer } = require('../../utils/config')
const { host } = redisServer

class CacheService {
  constructor () {
    this._client = redis.createClient({
      socket: {
        host
      }
    })

    this._client.on('error', error => {
      console.log(error)
    })

    this._client.connect()
  }

  async set (key, value, expirationInSecon = 1800) {
    await this._client.set(key, value, {
      EX: expirationInSecon
    })
  }

  async get (key) {
    const result = await this._client.get(key)
    if (result === null) throw new Error('Chace tidak ditemukan')
    return result
  }

  delete (key) {
    return this._client.del(key)
  }
}

module.exports = CacheService
