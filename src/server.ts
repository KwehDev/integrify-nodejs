import { createServer, IncomingMessage, Server, ServerResponse } from 'http'
import RequestHandler from './handlers/RequestHandler'
import ResponseHandler from './handlers/ResponseHandler'
import { HttpMethods, HttpRequest, Param, ServerRequestHandler } from './types'
import deconstructPath from './utils/deconstructPath'
import deconstructUrl from './utils/deconstructUrl'

export default class HttpServer {
  private readonly _host: string
  private readonly _port: number
  private readonly _server: Server
  private readonly httpRequests: HttpRequest[] = []

  constructor(_port: number, _host: string = 'localhost') {
    this._host = _host
    this._port = _port
    this._server = createServer(this._requestListener.bind(this))
  }

  _handlePostRequest(
    httpRequest: HttpRequest,
    req: IncomingMessage,
    res: ServerResponse,
    params: Param | undefined
  ) {
    const data: Buffer[] = []
    return req
      .on('data', (chunk) => {
        data.push(chunk)
      })
      .on('end', () => {
        try {
          const payload: any = JSON.parse(data.toString())
          return httpRequest?.handler(
            new RequestHandler(req, params, payload),
            new ResponseHandler(res)
          )
        } catch (e) {
          res.statusCode = 400
          res.end('Error: Bad Request')
        }
      })
  }

  _handleDeleteRequest(
    httpRequest: HttpRequest,
    req: IncomingMessage,
    res: ServerResponse,
    params: Param | undefined
  ) {
    return httpRequest.handler(
      new RequestHandler(req, params),
      new ResponseHandler(res)
    )
  }

  _handlePutRequest(
    httpRequest: HttpRequest,
    req: IncomingMessage,
    res: ServerResponse,
    params: Param | undefined
  ) {
    const data: Buffer[] = []
    return req
      .on('data', (chunk) => {
        data.push(chunk)
      })
      .on('end', () => {
        try {
          const payload: any = JSON.parse(data.toString())
          return httpRequest?.handler(
            new RequestHandler(req, params, payload),
            new ResponseHandler(res)
          )
        } catch (e) {
          res.statusCode = 400
          res.end('Error: Bad Request')
        }
      })
  }

  _requestListener(req: IncomingMessage, res: ServerResponse) {
    const [endpoint, queryVal] = deconstructUrl(req.url!)
    const method = req.method!.toLowerCase()
    const httpRequest = this.httpRequests.find(
      (req) =>
        req.endpoint.toLowerCase() === endpoint &&
        req.method.toLowerCase() === method
    )
    if (!httpRequest) return

    const params: Param | undefined =
      httpRequest.queryKey && queryVal
        ? Object.assign(
            {},
            {
              [httpRequest.queryKey]: queryVal,
            }
          )
        : undefined

    switch (method.toLowerCase()) {
      case 'get':
        return httpRequest?.handler(
          new RequestHandler(req, params),
          new ResponseHandler(res)
        )
      case 'post':
        return this._handlePostRequest(httpRequest, req, res, params)
      case 'delete':
        return this._handleDeleteRequest(httpRequest, req, res, params)
      case 'put':
        return this._handlePutRequest(httpRequest, req, res, params)
    }
  }

  _pushRequest(
    path: string,
    method: HttpMethods,
    handler: ServerRequestHandler
  ) {
    const [endpoint, queryKey] = deconstructPath(path)
    const httpRequestObj = { endpoint, method, handler, queryKey }
    this.httpRequests.push(httpRequestObj)
  }

  get(path: string, handler: ServerRequestHandler) {
    this._pushRequest(path, 'GET', handler)
  }

  post(path: string, handler: ServerRequestHandler) {
    this._pushRequest(path, 'POST', handler)
  }

  delete(path: string, handler: ServerRequestHandler) {
    this._pushRequest(path, 'DELETE', handler)
  }

  put(path: string, handler: ServerRequestHandler) {
    this._pushRequest(path, 'PUT', handler)
  }

  listen() {
    // Configure Port/Host, print to console once connected.
    this._server.listen(this._port, this._host, () => {
      console.log(`Server is listening on ${this._host}:${this._port}`)
    })
  }
}
