import { IncomingMessage } from 'http'
import { Param } from '../types'

export default class RequestHandler {
  private _req: IncomingMessage
  readonly payload?: any
  readonly params?: Param | undefined

  constructor(_req: IncomingMessage, params: Param | undefined, payload?: any) {
    this._req = _req
    this.payload = payload
    this.params = params
  }
}
