const autoBind = require('auto-bind')

class AlbumsHandler {
  constructor (service, storageService, validator, uploadsValidator) {
    this._service = service
    this._storageService = storageService
    this._validator = validator
    this._uploadsValidator = uploadsValidator

    autoBind(this)
  }

  async postAlbumHandler (request, h) {
    this._validator.validateAlbumPayload(request.payload)

    const albumId = await this._service.addAlbum(request.payload)

    const response = h.response({
      status: 'success',
      message: 'Album berhasil ditambahkan',
      data: {
        albumId
      }
    })
    response.code(201)
    return response
  }

  async getAlbumByIdHandler (request, h) {
    const { id } = request.params
    const album = await this._service.getAlbumById(id)

    return {
      status: 'success',
      data: {
        album
      }
    }
  }

  async putAlbumByIdHandler (request, h) {
    this._validator.validateAlbumPayload(request.payload)
    const { id } = request.params

    await this._service.editAlbumById(id, request.payload)
    return {
      status: 'success',
      message: 'Album berhasil diperbarui'
    }
  }

  async deleteAlbumByIdHandler (request, h) {
    const { id } = request.params
    await this._service.deleteAlbumById(id)
    return {
      status: 'success',
      message: 'Album berhasil dihapus'
    }
  }

  async postUploadImageHandler (request, h) {
    const { id } = request.params
    const { cover } = request.payload

    this._uploadsValidator.validateImageHeaders(cover.hapi.headers)
    const filename = await this._storageService.writeFile(cover, cover.hapi)
    const fileLocation = `http://${process.env.HOST}:${process.env.PORT}/albums/covers/${filename}`

    await this._service.editAlbumCoverById(id, fileLocation)

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil diunggah'
    })
    response.code(201)
    return response
  }

  async postAlbumLikesHandler (request, h) {
    const { id: albumId } = request.params
    const { id: userId } = request.auth.credentials

    await this._service.getAlbumById(albumId)

    const message = await this._service.likeAlbum(userId, albumId)
    const response = h.response({
      status: 'success',
      message
    })
    response.code(201)
    return response
  }

  async getAlbumLikesByIdHandler (request, h) {
    const { id } = request.params
    const { likes, dataSource } = await this._service.getAlbumLikesById(id)
    const response = h.response({
      status: 'success',
      data: {
        likes
      }
    })
    response.header('X-Data-Source', dataSource)
    response.code(200)
    return response
  }
}

module.exports = AlbumsHandler
