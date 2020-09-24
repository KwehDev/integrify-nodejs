import { createServer, IncomingMessage, Server, ServerResponse } from 'http'
import url from 'url'
type HttpMethods = 'GET' | 'POST' | 'DELETE' | 'PUT'

type HttpRequest = {
  path: string
  handler: ServerRequestHandler
  method: HttpMethods
  queryKey?: string | undefined
}

type Param = {
  [key: string]: string
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
    const [pathName, queryVal] = deconstructUrl(req.url!)
    const method = req.method!.toLowerCase()
    const httpRequest = this.httpRequests.find(
      (req) =>
        req.path.toLowerCase() === pathName &&
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
    handler: ServerRequestHandler,
    queryKey: string | undefined
  ) {
    const httpRequestObj = { path, method, handler, queryKey }
    this.httpRequests.push(httpRequestObj)
  }

  get(path: string, handler: ServerRequestHandler) {
    const [pathName, queryKey] = deconstructPath(path)
    this._pushRequest(pathName, 'GET', handler, queryKey)
  }

  post(path: string, handler: ServerRequestHandler) {
    const [pathName, queryKey] = deconstructPath(path)
    this._pushRequest(pathName, 'POST', handler, queryKey)
  }

  delete(path: string, handler: ServerRequestHandler) {
    const [pathName, queryKey] = deconstructPath(path)
    this._pushRequest(pathName, 'DELETE', handler, queryKey)
  }

  put(path: string, handler: ServerRequestHandler) {
    const [pathName, queryKey] = deconstructPath(path)
    this._pushRequest(pathName, 'PUT', handler, queryKey)
  }

  listen() {
    // Configure Port/Host, print to console once connected.
    this._server.listen(this._port, this._host, () => {
      console.log(`Server is listening on ${this._host}:${this._port}`)
    })
  }
}

const deconstructUrl = (url: string): [string, string | undefined] => {
  let pathName: string
  let queryVal: string | undefined = undefined
  if (!url.endsWith('/')) {
    const arr = url.split('/')
    queryVal = arr.pop()
    pathName = arr.join('/') + '/'
  } else {
    pathName = url
  }
  return [pathName.toLowerCase(), queryVal]
}

const deconstructPath = (path: string): [string, string | undefined] => {
  let pathName: string
  let queryParam: string | undefined = undefined
  if (path.includes(':')) {
    ;[pathName, queryParam] = path.split(':')
  } else {
    pathName = path
  }
  return [pathName.toLowerCase(), queryParam]
}

type ServerRequestHandler = (req: RequestHandler, res: ResponseHandler) => void

class RequestHandler {
  private _req: IncomingMessage
  readonly payload?: any
  readonly params?: Param | undefined

  constructor(_req: IncomingMessage, params: Param | undefined, payload?: any) {
    this._req = _req
    this.payload = payload
    this.params = params
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
