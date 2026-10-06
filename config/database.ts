import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid/database'

export default defineConfig({
  connection: env.get('DB_CONNECTION', 'sqlite'),
  connections: {
    sqlite: {
      client: 'sqlite3',
      connection: {
        filename: env.get('SQLITE_DB_PATH', 'tmp/sqlite.db'),
      },
    },
    pg: {
      client: 'pg',
      connection: env.get('DATABASE_URL'),
    },
  },
})