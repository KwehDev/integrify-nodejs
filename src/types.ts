import RequestHandler from './handlers/RequestHandler'
import ResponseHandler from './handlers/ResponseHandler'

export type ServerRequestHandler = (
  req: RequestHandler,
  res: ResponseHandler
) => void

export type HttpMethods = 'GET' | 'POST' | 'DELETE' | 'PUT'

export type HttpRequest = {
  endpoint: string
  handler: ServerRequestHandler
  method: HttpMethods
  queryKey?: string | undefined
}

export type Param = {
  [key: string]: string
}
