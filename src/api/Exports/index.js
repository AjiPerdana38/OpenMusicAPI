const ExportsHandler = require('./handler')
const routes = require('./routes')

module.exports = {
  name: 'Exports',
  version: '1.0.0',
  register: async (server, { producerService, playlistService, validator }) => {
    const exportsHander = new ExportsHandler(producerService, playlistService, validator)
    server.route(routes(exportsHander))
  }
}
