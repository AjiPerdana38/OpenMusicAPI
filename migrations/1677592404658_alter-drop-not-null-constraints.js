exports.up = pgm => {
  pgm.sql('ALTER TABLE playlists ALTER COLUMN owner DROP NOT NULL')
}

exports.down = pgm => {
  pgm.sql('ALTER TABLE playlists ALTER COLUMN owner SET NOT NULL')
}
