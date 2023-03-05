/* eslint-disable quotes */
const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')
const { mapDBToModel } = require('../../utils/index')

class AlbumsServices {
  constructor () {
    this._pool = new Pool()
  }

  async addAlbum ({ name, year }) {
    const id = `album-${nanoid(16)}`

    const query = {
      text: 'INSERT INTO albums VALUES ($1, $2, $3) RETURNING id',
      values: [id, name, year]
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Album Gagal ditambahkan')
    }

    return result.rows[0].id
  }

  async getAlbumById (id) {
    const queryGetAlbum = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id]
    }

    const queryGetSongs = {
      text: 'SELECT songs.id, songs.title, songs.performer FROM songs INNER JOIN albums ON albums.id = songs."albumId" WHERE albums.id=$1',
      values: [id]
    }

    const albumsResult = await this._pool.query(queryGetAlbum)
    const songsResult = await this._pool.query(queryGetSongs)

    if (!albumsResult.rowCount) {
      throw new NotFoundError('Album tidak ditemukan')
    }

    return {
      ...albumsResult.rows.map(mapDBToModel)[0],
      songs: songsResult.rows
    }
  }

  async editAlbumById (id, { name, year }) {
    const queryEditAlbum = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id]
    }

    const result = await this._pool.query(queryEditAlbum)

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui albums. Id tidak ditemukan')
    }
  }

  async deleteAlbumById (id) {
    const queryDeleteAlbum = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id]
    }

    const result = await this._pool.query(queryDeleteAlbum)

    if (!result.rowCount) {
      throw new NotFoundError('Album gagal dihapus, Id tidak ditemukan')
    }
  }

  async editAlbumCoverById (id, fileLocation) {
    await this._pool.query({
      text: /* sql */ `UPDATE albums SET cover_url = $1 WHERE id = $2 RETURNING id`,
      values: [fileLocation, id]
    })
  }
}

module.exports = AlbumsServices
