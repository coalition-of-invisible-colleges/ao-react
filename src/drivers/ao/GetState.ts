import { Sink, Stream, Scheduler, Disposable, Time } from '@most/types'
import * as request from 'superagent'
import { State, UserSession } from './types'
import Pipe from './Pipe'

export type StateLoadedEvent = {
  type: 'state-loaded'
  payload: State
}

export type LoadStateAction = {
  type: 'load-state'
}

export class GetStateStream implements Stream<StateLoadedEvent> {
  constructor(
    private act$: Stream<LoadStateAction>,
    private session: UserSession
  ) {}
  run(sink: Sink<StateLoadedEvent>, scheduler: Scheduler): Disposable {
    const getStateSink = new GetStateSink(sink, this.session)
    return this.act$.run(getStateSink, scheduler)
  }
}

class GetStateSink extends Pipe<LoadStateAction, StateLoadedEvent>
  implements Sink<LoadStateAction> {
  constructor(sink: Sink<StateLoadedEvent>, private session: UserSession) {
    super(sink)
  }
  event(t: Time, act: LoadStateAction) {
    this.handleGetStateAction(act).then(e => this.sink.event(t, e))
  }
  private handleGetStateAction(
    act: LoadStateAction
  ): Promise<StateLoadedEvent> {
    switch (act.type) {
      case 'load-state':
        return request
          .post('http://localhost:3000/state')
          .set('Authorization', this.session.token)
          .then(res => {
            return {
              type: 'state-loaded',
              payload: { ...res.body, session: this.session } as State
            } as StateLoadedEvent
          })
    }
  }
}
