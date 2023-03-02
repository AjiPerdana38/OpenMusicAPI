const autoBind = require('auto-bind')

class PlaylistHandler {
  constructor (service, validator, songService) {
    this._service = service
    this._validator = validator
    this._songService = songService

    autoBind(this)
  }

  async postPlaylistHandler (request, h) {
    this._validator.validatePlaylistPayload(request.payload)

    const { name } = request.payload
    const { id: credentialId } = request.auth.credentials

    const playlistId = await this._service.addPlaylist({ name, owner: credentialId })

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId
      }
    })
    response.code(201)
    return response
  }

  async getPlaylistsHandler (request) {
    const { id: credentialId } = request.auth.credentials
    const playlists = await this._service.getPlaylists(credentialId)

    return {
      status: 'success',
      data: {
        playlists
      }
    }
  }

  async deletePlaylistByIdHandler (request) {
    const { id } = request.params
    const { id: credentialId } = request.auth.credentials

    await this._service.verifyPlaylistOwner(id, credentialId)
    await this._service.deletePlaylistById(id)

    return {
      status: 'success',
      message: 'Playlist telah berhasil dihapus'
    }
  }

  async postPlaylistSongHandler (request, h) {
    this._validator.validatePlaylistSongPayload(request.payload)

    const { id: playlistId } = request.params
    const { songId } = request.payload
    const { id: credentialId } = request.auth.credentials

    await this._songService.getSongById(songId)

    await this._service.verifyPlaylistAccess(playlistId, credentialId)
    await this._service.addPlaylistSongs({ playlistId, songId })

    const action = 'add'
    await this._service.addActivityToPlaylistSong(playlistId, songId, credentialId, action)

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan pada playlist'
    })
    response.code(201)
    return response
  }

  async getPlaylistSongByIdHandler (request) {
    const { id } = request.params
    const { id: credentialId } = request.auth.credentials

    await this._service.verifyPlaylistAccess(id, credentialId)

    const playlist = await this._service.getPlaylistSongs(id)

    return {
      status: 'success',
      data: {
        playlist
      }
    }
  }

  async getActivitiesSongPlaylistHandler (request) {
    const { id: playlistId } = request.params
    const { id: credentialId } = request.auth.credentials

    await this._service.verifyPlaylistAccess(playlistId, credentialId)

    const activities = await this._service.getActivityToPlaylistSong(playlistId)

    return {
      status: 'success',
      data: {
        playlistId,
        activities
      }
    }
  }

  async deletePlaylistSongByIdHandler (request) {
    this._validator.validatePlaylistSongPayload(request.payload)

    const { id: playlistId } = request.params
    const { songId } = request.payload

    const { id: credentialId } = request.auth.credentials

    await this._service.verifyPlaylistAccess(playlistId, credentialId)
    await this._service.deletePlaylistSongById(playlistId, songId)

    const action = 'delete'
    await this._service.addActivityToPlaylistSong(playlistId, songId, credentialId, action)

    return {
      status: 'success',
      message: 'Lagu pada playlist berhasil dihapus'
    }
  }
}

module.exports = PlaylistHandler
