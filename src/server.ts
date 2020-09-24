import { createServer, IncomingMessage, Server, ServerResponse } from 'http'
import url from 'url'
type HttpMethods = 'GET' | 'POST' | 'DELETE'

type HttpRequest = {
  pathname: string
  handler: ServerRequestHandler
  method: HttpMethods
}

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
    res: ServerResponse
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
            new RequestHandler(req, payload),
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
    res: ServerResponse
  ) {
    return httpRequest.handler(
      new RequestHandler(req),
      new ResponseHandler(res)
    )
  }

  _requestListener(req: IncomingMessage, res: ServerResponse) {
    const path = req.url?.toLowerCase()
    const method = req.method!.toLowerCase()
    const httpRequest = this.httpRequests.find(
      (req) =>
        req.pathname.toLowerCase() === path &&
        req.method.toLowerCase() === method
    )
    if (!httpRequest) return

    switch (method.toLowerCase()) {
      case 'get':
        return httpRequest?.handler(
          new RequestHandler(req),
          new ResponseHandler(res)
        )
      case 'post':
        return this._handlePostRequest(httpRequest, req, res)
      case 'delete':
        return this._handleDeleteRequest(httpRequest, req, res)
    }
  }

  _pushRequest(
    pathname: string,
    method: HttpMethods,
    handler: ServerRequestHandler
  ) {
    const httpRequestObj = { pathname, method, handler }
    this.httpRequests.push(httpRequestObj)
  }

  get(pathname: string, handler: ServerRequestHandler) {
    this._pushRequest(pathname, 'GET', handler)
  }

  post(pathname: string, handler: ServerRequestHandler) {
    this._pushRequest(pathname, 'POST', handler)
  }

  delete(pathname: string, handler: ServerRequestHandler) {
    this._pushRequest(pathname, 'DELETE', handler)
  }

  listen() {
    // Configure Port/Host, print to console once connected.
    this._server.listen(this._port, this._host, () => {
      console.log(`Server is listening on ${this._host}:${this._port}`)
    })
  }
}

type ServerRequestHandler = (req: RequestHandler, res: ResponseHandler) => void

class RequestHandler {
  private _req: IncomingMessage
  readonly payload?: any

  constructor(_req: IncomingMessage, payload?: any) {
    this._req = _req
    this.payload = payload
  }
}

class ResponseHandler {
  private _res: ServerResponse

  constructor(_res: ServerResponse) {
    this._res = _res
  }

  status(statusCode: number) {
    this._res.statusCode === statusCode
    return this
  }

  send(body: string) {
    this._res.end(body)
    return this
  }
}
