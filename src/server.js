require('dotenv').config()

const Hapi = require('@hapi/hapi')

// error handling
const ClientError = require('./exceptions/ClientError')

// Albums
const albums = require('./api/albums')
const AlbumsServices = require('./service/postgres/AlbumsService')
const AlbumsValidator = require('./validator/albums')

// songs
const songs = require('./api/songs')
const SongsServices = require('./service/postgres/SongsService')
const Songsvalidator = require('./validator/songs')

const init = async () => {
  const albumsService = new AlbumsServices()
  const songsService = new SongsServices()

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*']
      }
    }
  })

  // register albums plugins
  await server.register({
    plugin: albums,
    options: {
      service: albumsService,
      validator: AlbumsValidator
    }
  })

  // register songs plugins
  await server.register({
    plugin: songs,
    options: {
      service: songsService,
      validator: Songsvalidator
    }
  })

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
        console.log(newResponse)
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
