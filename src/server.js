require('dotenv').config()

const Hapi = require('@hapi/hapi')

const ClientError = require('./exceptions/ClientError')

const albums = require('./api/albums')
const AlbumsServices = require('./service/postgres/AlbumsService')
const AlbumsValidator = require('./validator/albums')

const songs = require('./api/songs')
const SongsServices = require('./service/postgres/SongsService')
const Songsvalidator = require('./validator/songs')

const users = require('./api/users')
const UsersServices = require('./service/postgres/UsersService')
const Usersvalidator = require('./validator/users')

const init = async () => {
  const albumsService = new AlbumsServices()
  const songsService = new SongsServices()
  const usersService = new UsersServices()

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*']
      }
    }
  })

  await server.register([
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumsValidator
      }
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: Songsvalidator
      }
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: Usersvalidator
      }
    }
  ])

  server.ext('onPreResponse', (request, h) => {
    // mendapatkan konteks response dari request
    const { response } = request
    if (response instanceof Error) {
      // penanganan client error secara internal.
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message
        })
        newResponse.code(response.statusCode)
        return newResponse
      }
      // mempertahankan penanganan client error oleh hapi secara native, seperti 404, etc.
      if (!response.isServer) {
        return h.continue
      }
      // penanganan server error sesuai kebutuhan
      const newResponse = h.response({
        status: 'error',
        message: 'terjadi kegagalan pada server kami'
      })
      newResponse.code(500)
      console.log(newResponse)
      return newResponse
    }
    // jika bukan error, lanjutkan dengan response sebelumnya (tanpa terintervensi)
    return h.continue
  })

  await server.start()
  console.log(`Server berjalan pada ${server.info.uri}`)
}

init()
