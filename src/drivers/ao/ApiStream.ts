import { Sink, Stream, Scheduler, Disposable, Time } from '@most/types'
import { map, combine } from '@most/core'
import * as request from 'superagent'
import { State, UserSession } from './types'
import Pipe from './Pipe'
import { AoAction, AoResponse } from '../aoStore'

export type StateLoadedEvent = {
  type: 'state-loaded'
  payload: State
}

export type LoadStateAction = {
  type: 'load-state'
}

type AoRequest = AoAction

export class AoResponseStream implements Stream<AoResponse> {
  constructor(private act$: Stream<AoAction>, private session: UserSession) {}

  run(sink: Sink<AoResponse>, scheduler: Scheduler): Disposable {
    const reqSink = new AoApiRequestSink(sink, this.session)
    return this.act$.run(reqSink, scheduler)
  }
}

class AoApiRequestSink extends Pipe<AoRequest, AoResponse>
  implements Sink<AoRequest> {
  constructor(sink: Sink<AoResponse>, private session: UserSession) {
    super(sink)
  }
  event(t: Time, act: AoRequest) {
    this.handleGetStateAction(act).then(e => this.sink.event(t, e))
  }
  private handleGetStateAction(req: AoRequest): Promise<AoResponse> {
    const { _namespace, _category, ...act } = req
    return request
      .post('http://localhost:3000/events')
      .set('Authorization', this.session.token)
      .send(act)
      .then(res => ({
        _namespace,
        _category,
        type: 'ao-response',
        payload: { ...res }
      }))
  }
}
