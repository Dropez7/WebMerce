import Serverless from '@adonisjs/serverless'

/**
 * Vercel serverless handler that uses the official AdonisJS Serverless adapter.
 * The adapter lazily boots the full Adonis application on the first invocation
 * and re‑uses the same instance for subsequent calls.
 */
export default async function handler(req: any, res: any) {
  const server = new Serverless()
  return server.handle(req, res)
}
