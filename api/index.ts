import 'reflect-metadata'
import { Ignitor } from '@adonisjs/core'

// Resolve the root of the project (one level up from this file)
const APP_ROOT = new URL('../', import.meta.url)
const IMPORTER = (filePath: string) => {
  if (filePath.startsWith('./') || filePath.startsWith('../')) {
    return import(new URL(filePath, APP_ROOT).href)
  }
  return import(filePath)
}

/**
 * Vercel serverless handler that delegates the request to AdonisJS's
 * HttpServer instance. The Ignitor builds the server on demand and the
 * same instance is reused across invocations (Vercel caches the module).
 */
export default async function handler(req: any, res: any) {
  const ignitor = new Ignitor(APP_ROOT, { importer: IMPORTER })
  const server = await ignitor.httpServer()
  return server.handle(req, res)
}
