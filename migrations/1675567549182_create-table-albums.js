/* eslint-disable camelcase */

exports.up = pgm => {
  pgm.createTable('albums', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true
    },
    name: {
      type: 'TEXT',
      noteNull: true
    },
    year: {
      type: 'INT',
      noteNull: true
    }
  })
}

exports.down = pgm => {
  pgm.droptable('albums')
}
