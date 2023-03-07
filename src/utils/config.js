const config = {
  app: {
    host: process.env.HOST,
    port: process.env.PORT
  },
  rabbitmq: {
    server: process.env.RABBITMQ_SERVER
  },
  redisServer: {
    host: process.env.REDIS_SERVER
  }
}

module.exports = config
