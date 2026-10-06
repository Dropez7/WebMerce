import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid/db'

/**
 * Database connection configuration.
 *
 * • Development (default) uses SQLite – the file will be created in the
 *   `tmp/` folder. The pool's `afterCreate` hook ensures the directory
 *   exists before SQLite tries to open it.
 * • Production (Vercel) uses PostgreSQL – the connection string is read from
 *   the `DATABASE_URL` environment variable.
 * • MySQL is also available if you ever need it – it reads the classic
 *   set of DB_* variables.
 */
export default defineConfig({
  // The default connection key. It can be overridden via the DB_CONNECTION env var.
  connection: env.get('DB_CONNECTION', 'sqlite'),

  connections: {
    // -----------------------------------------------------------------
    // SQLite – local development only (read‑only on Vercel).
    // -----------------------------------------------------------------
    sqlite: {
      client: 'sqlite3',
      connection: {
        filename: env.get('SQLITE_DB_PATH', 'tmp/sqlite.db'),
      },
      // Ensure the directory for the SQLite file exists before opening.
      pool: {
        afterCreate: (conn, cb) => {
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

    // -----------------------------------------------------------------
    // PostgreSQL – production (e.g., Supabase, Neon, etc.)
    // -----------------------------------------------------------------
    pg: {
      client: 'pg',
      connection: env.get('DATABASE_URL'),
    },

    // -----------------------------------------------------------------
    // MySQL – optional, if you ever need it.
    // -----------------------------------------------------------------
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
