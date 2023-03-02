/* eslint-disable quotes */
const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')

class SongsServices {
  constructor () {
    this._pool = new Pool()
  }

  async addSong ({ title, year, performer, genre, duration, albumId }) {
    const id = `songs-${nanoid(16)}`

    const query = {
      text: 'INSERT INTO songs VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, performer, genre, duration, albumId]
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('lagu gagal ditambahkan')
    }

    return result.rows[0].id
  }

  async getSongs (title, performer) {
    let defaultQuery = 'SELECT id, title, performer FROM songs'
    const valuesDefault = []

    if (title) {
      defaultQuery += ` WHERE title ILIKE '%' ||$1|| '%'`
      valuesDefault.push(title)
    }

    if (!title && performer) {
      defaultQuery += ` WHERE performer ILIKE '%' ||$1|| '%'`
      valuesDefault.push(performer)
    }

    if (title && performer) {
      defaultQuery += ` AND performer ILIKE '%' ||$2|| '%'`
      valuesDefault.push(performer)
    }

    const query = {
      text: defaultQuery,
      values: valuesDefault
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Belum ada lagu yang di input')
    }

    return result.rows
  }

  async getSongById (id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Lagu tidak ditemukan')
    }

    return result.rows[0]
  }

  async editSongById (id, { title, year, performer, genre, duration, albumId = null }) {
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5 WHERE id = $6 RETURNING id',
      values: [title, year, performer, genre, duration, id]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Lagu gagal di edit, id tidak ditemmukan')
    }
  }

  async deleteSongById (id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Lagu gagal dihapus. Id tidak ditemukan')
    }
  }
}

module.exports = SongsServices
