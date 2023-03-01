const Joi = require('joi')

const PlaylistPayloadSchema = Joi.object({
  name: Joi.string().required(),
  owner: Joi.string()
})

const PlaylistSongPayloadSchema = Joi.object({
  songId: Joi.string().required()
})

module.exports = { PlaylistPayloadSchema, PlaylistSongPayloadSchema }
