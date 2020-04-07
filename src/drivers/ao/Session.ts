import * as request from 'superagent'
import { Sink, Stream, Time, Disposable, Scheduler } from '@most/types'
import * as uuidV1 from 'uuid/v1'
import * as cryptoUtils from '../../crypto'
import { AoAction } from '../../lib/actions'
import { UserSession } from './types'
import Pipe from './Pipe'
import { mode } from '../aoStore'

export type SessionAction =
  | { type: 'try-load-session' }
  | { type: 'try-login'; payload: { user: string; pass: string } }

export type SessionLoadedEvent = {
  type: 'session-loaded'
  payload: { user: string; token: string; session: string }
}

export class SessionStream implements Stream<SessionLoadedEvent> {
  constructor(private act$: Stream<SessionAction>) {}
  run(sink: Sink<SessionLoadedEvent>, scheduler: Scheduler): Disposable {
    // const dispose = () => sink.end(currentTime(scheduler))
    const sessionSink = new SessionSink(sink)
    return this.act$.run(sessionSink, scheduler)
  }
}

class SessionSink extends Pipe<SessionAction, SessionLoadedEvent>
  implements Sink<SessionAction> {
  constructor(sink: Sink<SessionLoadedEvent>) {
    super(sink)
  }
  event(t: Time, act: SessionAction) {
    this.sink.event(t, this.handleSessionAction(act))
  }
  private handleSessionAction(act: SessionAction): SessionLoadedEvent {
    console.log('handle session action', act)
    switch (act.type) {
      case 'try-load-session':
        if (mode == 'nodejs') {
          const session = 'c37c4fd0-77c8-11ea-89b5-97c781263ee0'
          const token =
            'cddb06c6f920cd23eecd8a7cd3bfb88bd0f55c92d4a42ed7b0835bfab313669d'
          const user = 'dctrl'
          return {
            type: 'session-loaded',
            payload: { session, token, user }
          }
        } else {
          const token = window.localStorage.getItem('token')
          const session = window.localStorage.getItem('session')
          const user = window.localStorage.getItem('user')
          console.log('session', token, session, user)

          if (token && session) {
            return {
              type: 'session-loaded',
              payload: { session, token, user }
            }
          } else {
            throw new Error('creating session not yet implemented')
          }
        }
      case 'try-login':
        const { user } = act.payload
        const session = uuidV1()
        const sessionKey = cryptoUtils.createHash(
          session + cryptoUtils.createHash(act.payload.pass)
        )
        const token = cryptoUtils.hmacHex(session, sessionKey)
        request
          .post('http://localhost:8003/session')
          .set('authorization', token)
          .set('session', session)
          .set('name', act.payload.user)
          .end((err, res) => {
            console.log('res', res)
            if (err) {
              console.log('err', err)
              return (err = err.message)
            }
          })
        return {
          type: 'session-loaded',
          payload: { user, session, token }
        }
    }
  }
}
