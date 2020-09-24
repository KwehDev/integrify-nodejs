import { ServerResponse } from 'http'

export default class ResponseHandler {
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
