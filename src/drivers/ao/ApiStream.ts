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

type AoRequest = {
  act: AoAction
  session: UserSession
}

export class AoResponseStream implements Stream<AoResponse> {
  constructor(
    private act$: Stream<AoAction>,
    private session$: Stream<UserSession>
  ) {}

  run(sink: Sink<AoResponse>, scheduler: Scheduler): Disposable {
    const merged$ = combine(
      (act, session): AoRequest => ({ act, session }),
      this.act$,
      this.session$
    )
    const reqSink = new AoApiRequestSink(sink)
    return merged$.run(reqSink, scheduler)
  }
}

class AoApiRequestSink extends Pipe<AoRequest, AoResponse>
  implements Sink<AoRequest> {
  constructor(sink: Sink<AoResponse>) {
    super(sink)
  }
  event(t: Time, act: AoRequest) {
    this.handleGetStateAction(act).then(e => this.sink.event(t, e))
  }
  private handleGetStateAction(req: AoRequest): Promise<AoResponse> {
    const { _namespace, category, ...act } = req.act.payload
    console.log('got api action', act, req)
    return request
      .post('http://localhost:3000/events')
      .set('Authorization', req.session.token)
      .send(act)
      .then(res => ({
        _namespace,
        _category: category,
        type: 'ao-response',
        payload: { ...res }
      }))
  }
}
