const CollaborationsHandler = require('./handler')
const routes = require('./routes')

module.exports = {
  name: 'Collaborations',
  version: '1.0.0',
  register: async (server, { collaborationsService, playlistService, userService, validator }) => {
    const collaborationsHandler = new CollaborationsHandler(collaborationsService, playlistService, userService, validator)

    server.route(routes(collaborationsHandler))
  }
}
