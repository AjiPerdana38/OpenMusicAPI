/* eslint-disable quotes */
const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')
const AuthorizationError = require('../../exceptions/AuthorizationError')

class PlaylistsServices {
  constructor (collaborationService) {
    this._pool = new Pool()
    this._collaborationService = collaborationService
  }

  async addPlaylist ({ name, owner }) {
    const id = `playlist-${nanoid(16)}`

    const query = {
      text: /* sql */ `INSERT INTO playlists VALUES($1, $2, $3) RETURNING id`,
      values: [id, name, owner]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new InvariantError('Playlist gagal ditambahkan')
    }

    return result.rows[0].id
  }

  async getPlaylists (owner) {
    const query = {
      text: /* sql */ `SELECT playlists.id, playlists.name, users.username
      FROM playlists
      LEFT JOIN users ON playlists.owner = users.id
      LEFT JOIN collaborations ON playlists.id  = collaborations.playlist_id
      WHERE playlists.owner = $1
      OR collaborations.user_id = $1`,
      values: [owner]
    }

    const result = await this._pool.query(query)

    return result.rows
  }

  async deletePlaylistById (id) {
    const query = {
      text: /* sql */ `DELETE FROM playlists WHERE id = $1 RETURNING id`,
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Gagal menghapus playlist, id tidak ditemukan')
    }
  }

  async addPlaylistSongs ({ playlistId, songId }) {
    const id = `playlistsong-${nanoid(16)}`

    const query = {
      text: /* sql */ `INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id`,
      values: [id, playlistId, songId]
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('lagu gagal ditambahkan pada playlist')
    }

    return result.rows[0].id
  }

  async getPlaylistSongs (id) {
    const query = {
      text: /* sql */ `SELECT playlists.*, users.username, songs.id as songs_id, songs.title, songs.performer FROM playlists
      LEFT JOIN playlist_songs ON playlist_songs.playlist_id = playlists.id
      LEFT JOIN songs ON songs.id = playlist_songs.song_id
      LEFT JOIN users ON users.id = playlists.owner
      WHERE playlists.id = $1`,
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan')
    }

    const songs = result.rows.map((song) => ({
      id: song.songs_id,
      title: song.title,
      performer: song.performer
    }))

    return {
      ...result.rows[0],
      songs
    }
  }

  async deletePlaylistSongById (playlistId, songId) {
    const query = {
      text: /* sql */ `DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id`,
      values: [playlistId, songId]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Gagal Menghapus playlist. Id tidak ditemukan')
    }
  }

  async addActivityToPlaylistSong (playlistId, songId, userId, action) {
    const id = `activity-${nanoid(16)}`

    const query = {
      text: /* sql */ `INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5) RETURNING id`,
      values: [id, playlistId, songId, userId, action]
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Aktivitas gagal ditambahkan')
    }
  }

  async getActivityToPlaylistSong (playlistId) {
    const query = {
      text: /* sql */ `SELECT users.username, songs.title, action, time
      FROM playlist_song_activities
      JOIN songs ON songs.id = playlist_song_activities.song_id
      JOIN users ON users.id = playlist_song_activities.user_id
      WHERE playlist_song_activities.playlist_id = $1`,
      values: [playlistId]
    }

    const result = await this._pool.query(query)

    return result.rows
  }

  async verifyPlaylistOwner (id, owner) {
    const query = {
      text: /* sql */ `SELECT * FROM playlists WHERE id = $1`,
      values: [id]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan')
    }

    const playlist = result.rows[0]

    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak memiliki hak untuk mengakses data ini')
    }
  }

  async verifyPlaylistAccess (playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId)
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error
      }

      // eslint-disable-next-line no-useless-catch
      try {
        await this._collaborationService.verifyCollaborator(playlistId, userId)
      } catch (error) {
        throw error
      }
    }
  }
}

module.exports = PlaylistsServices
