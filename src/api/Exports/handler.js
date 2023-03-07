const autoBind = require('auto-bind')

class ExportsHandler {
  constructor (producerService, playlistService, validator) {
    this._producerService = producerService
    this._playlistService = playlistService
    this._validator = validator

    autoBind(this)
  }

  async postExportPlaylistsHandler (request, h) {
    this._validator.validateExportNotesPayload(request.payload)

    const { playlistId } = request.params
    const { id: userId } = request.auth.credentials

    await this._playlistService.verifyPlaylistAccess(playlistId, userId)

    const message = {
      playlistId,
      targetEmail: request.payload.targetEmail
    }

    await this._producerService.sendMessage('export:playlist', JSON.stringify(message))

    const response = h.response({
      status: 'success',
      message: 'Permintaan anda dalam antrian'
    })
    response.code(201)
    return response
  }
}

module.exports = ExportsHandler
