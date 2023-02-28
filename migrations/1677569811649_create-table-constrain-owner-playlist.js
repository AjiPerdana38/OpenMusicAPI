exports.up = pgm => {
  // foreign key playlists.owner to users.id
  pgm.addConstraint('playlists', 'fk_playlist.owner_users.id', 'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE')

  // foreign key palylist_songs.playlist_id to playlists.id
  pgm.addConstraint('playlist_songs', 'fk_playlist_songs.playlist_id_playlist.id', 'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE')

  // foreign key palylist_songs.song_id to songs.id
  pgm.addConstraint('playlist_songs', 'fk_playlist_songs.song_id_songs.id', 'FOREIGN KEY(song_id) REFERENCES songs(id) ON DELETE CASCADE')
}

exports.down = pgm => {
  pgm.dropConstraint('playlist', 'fk_playlist.owner_users.id')
  pgm.dropConstraint('playlist_songs', 'fk_playlist_songs.playlist_id_playlist.id')
  pgm.dropConstraint('playlist_songs', 'fk_playlist_songs.song_id_songs.id')
}
