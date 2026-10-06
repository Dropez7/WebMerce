import Serverless from '@adonisjs/serverless'

/**
 * Vercel serverless handler that delegates the request to AdonisJS using the
 * official serverless adapter. The Serverless class bootstraps the Adonis app on
 * the first invocation and reuses the same instance for subsequent calls.
 */
export default async function handler(req: any, res: any) {
  const server = new Serverless()
  return server.handle(req, res)
}
