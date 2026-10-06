import '#start/kernel' // carrega o kernel do Adonis
import app from '#start/app'
import { HttpServer } from '@adonisjs/core/http'

/**
 * Handler serverless para Vercel.
 * A função recebe a requisição e resposta já normalizadas pela plataforma
 * e delega ao HttpServer interno do Adonis, que já tem todas as rotas
 * configuradas (routes, middleware, etc.).
 */
export default async function handler(req: any, res: any) {
  const server = HttpServer.getInstance()
  // O Adonis já tem o router carregado; apenas encaminhamos.
  return server.handle(req, res)
}
