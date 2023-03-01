exports.up = pgm => {
  pgm.sql("INSERT INTO users(id, username, password, fullname) VALUES ('old_playlist', 'old_playlist', 'old_playlist', 'old_playlist')")

  pgm.sql("UPDATE playlists SET owner = 'old_playlist' WHERE owner IS NULL")
}

exports.down = pgm => {
  pgm.sql("UPDATE playlists SET owner = NULL WHERE owner = 'old_playlist'")
  pgm.sql("DELETE FROM users WHERE id = 'old_playlist'")
}
