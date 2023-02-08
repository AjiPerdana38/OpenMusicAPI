const autoBind = require('auto-bind')

class SongsHandler {
  constructor (service, validator) {
    this._service = service
    this._validator = validator

    autoBind(this)
  }

  async postSongsHandler (request, h) {
    this._validator.validateSongsPayload(request.payload)
    const { title, year, performer, genre, duration, albumId = null } = request.payload

    const songId = await this._service.addSong({ title, year, performer, genre, duration, albumId })

    const response = h.response({
      status: 'success',
      data: {
        songId
      }
    })
    response.code(201)
    return response
  }

  async getSongsHandler (request, h) {
    const { title = null, performer = null } = request.query
    const songs = await this._service.getSongs(title, performer)

    return {
      status: 'success',
      data: {
        songs
      }
    }
  }

  async getSongsByIdHandler (request, h) {
    const { id } = request.params
    const song = await this._service.getSongById(id)

    return {
      status: 'success',
      data: {
        song
      }
    }
  }

  async putSongsByIdHandler (request, h) {
    this._validator.validateSongsPayload(request.payload)
    const { id } = request.params

    await this._service.editSongById(id, request.payload)

    return {
      status: 'success',
      message: 'Lagu berhasil diperbarui'
    }
  }

  async deleteSongsByIdHandler (request, h) {
    const { id } = request.params
    await this._service.deleteSongById(id)
    return {
      status: 'success',
      message: 'Lagu berhasil dihapus'
    }
  }
}

module.exports = SongsHandler
