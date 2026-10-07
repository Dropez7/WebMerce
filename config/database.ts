import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid/database_manager'

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

    mysql: {
      client: 'mysql2',
      connection: {
        host: env.get('DB_HOST'),
        port: env.get('DB_PORT'),
        user: env.get('DB_USER'),
        password: env.get('DB_PASSWORD'),
        database: env.get('DB_DATABASE'),
      },
    },
  },
})