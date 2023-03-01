/* eslint-disable quotes */
const { Pool } = require('pg')
const { nanoid } = require('nanoid')
const InvariantError = require('../../exceptions/InvariantError')
const AuthorizationError = require('../../exceptions/AuthorizationError')

class CollaborationsServices {
  constructor () {
    this._pool = new Pool()
  }

  async addCollaborations (playlistId, userId) {
    const id = `collab-${nanoid(16)}`

    const query = {
      text: /* sql */ `INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id`,
      values: [id, playlistId, userId]
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new InvariantError('Kolaborasi gagal ditambahkan')
    }

    return result.rows[0].id
  }

  async deleteCollaboration (playlistId, userId) {
    const query = {
      text: /* sql */ `DELETE FROM collaborations
      WHERE playlist_id = $1
      AND user_id = $2
      RETURNING id`,
      values: [playlistId, userId]
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new InvariantError('Kolaborasi gagal dihapus')
    }
  }

  async verifyCollaborator (playlistId, userId) {
    const query = {
      text: /* sql */ `SELECT * FROM collaborations
      WHERE playlist_id = $1
      AND user_id = $2`,
      values: [playlistId, userId]
    }

    const result = await this._pool.query(query)

    if (!result.rowCount) {
      throw new AuthorizationError('Kolaborasi gagal diverifikasi')
    }
  }
}

module.exports = CollaborationsServices
