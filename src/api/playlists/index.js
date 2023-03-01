const PlaylistHandler = require('./handler')
const routes = require('./routes')

module.exports = {
  name: 'playlist',
  version: '1.0.0',
  register: async (server, { service, validator, songService }) => {
    const playlistHandler = new PlaylistHandler(service, validator, songService)
    server.route(routes(playlistHandler))
  }
}
