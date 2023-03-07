/* eslint-disable quotes */
const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')
const { mapDBToModel } = require('../../utils/index')

class AlbumsServices {
  constructor (cacheService) {
    this._pool = new Pool()
    this._cacheService = cacheService
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

  async likeAlbum (userId, albumId) {
    const id = `like-${nanoid(16)}`

    const query = {
      text: /* sql */ `SELECT * FROM user_album_likes
      WHERE user_id = $1
      AND album_id = $2`,
      values: [userId, albumId]
    }

    const result = await this._pool.query(query)

    let message = ''

    if (!result.rowCount) {
      const query = {
        text: /* sql */ `INSERT INTO user_album_likes
        VALUES($1, $2, $3)
        RETURNING id`,
        values: [id, userId, albumId]
      }

      const result = await this._pool.query(query)

      if (!result.rowCount) {
        throw new InvariantError('Gagal menyukai album')
      }
      message = 'Berhasil menyukai album'
    } else {
      const query = {
        text: /* sql */ `DELETE FROM user_album_likes
        WHERE user_id = $1
        AND album_id = $2
        RETURNING id`,
        values: [userId, albumId]
      }

      const result = await this._pool.query(query)

      if (!result.rowCount) {
        throw new InvariantError('Gagal batal menyukai album')
      }

      message = 'Batal menyukai album'
    }

    await this._cacheService.delete(`user_album_likes:${albumId}`)
    return message
  }

  async getAlbumLikesById (id) {
    try {
      const dataSource = 'cache'
      const result = await this._cacheService.get(`user_album_likes:${id}`)
      return {
        likes: +result,
        dataSource
      }
    } catch (error) {
      const query = {
        text: /* sql */ `SELECT * FROM user_album_likes
        WHERE album_id = $1`,
        values: [id]
      }

      const result = await this._pool.query(query)
      const likes = result.rowCount
      const dataSource = 'data-server'

      await this._cacheService.set(`user_album_likes:${id}`, likes)

      return {
        likes,
        dataSource
      }
    }
  }
}

module.exports = AlbumsServices
