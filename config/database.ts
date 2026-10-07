import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'

export default defineConfig({
  connection: env.get('DB_CONNECTION', 'sqlite'),

  connections: {
    sqlite: {
      client: 'sqlite3',
      connection: {
        filename: env.get('SQLITE_DB_PATH', 'tmp/sqlite.db'),
      },
      pool: {
        afterCreate: (conn: any, cb: any) => {
          const fs = require('fs')
          const path = require('path')
          const dir = path.dirname(conn.config.filename)
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
          }
          cb(null, conn)
        },
      },
    },

    pg: {
      client: 'pg',
      connection: env.get('DATABASE_URL'),
      pool: {
        min: 0,
        max: 1,
        idleTimeoutMillis: 1000,
      },
    },

    mysql: {
      client: 'mysql2',
      connection: {
        host: env.get('DB_HOST'),
        port: env.get('DB_PORT') ? Number(env.get('DB_PORT')) : undefined,
        user: env.get('DB_USER'),
        password: env.get('DB_PASSWORD'),
        database: env.get('DB_DATABASE'),
      },
    },
  },
})