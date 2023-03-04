const InvariantError = require('../../exceptions/InvariantError')
const ExportPlaylistsPayloadSchema = require('./schema')

const ExportsValidator = {
  validateExportNotesPayload: (payload) => {
    const validationResult = ExportPlaylistsPayloadSchema.validate(payload)

    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message)
    }
  }
}

module.exports = ExportsValidator
