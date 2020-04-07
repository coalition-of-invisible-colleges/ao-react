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
  payload: UserSession
}

export class GetStateStream implements Stream<StateLoadedEvent> {
  constructor(private act$: Stream<LoadStateAction>) {}
  run(sink: Sink<StateLoadedEvent>, scheduler: Scheduler): Disposable {
    const getStateSink = new GetStateSink(sink)
    return this.act$.run(getStateSink, scheduler)
  }
}

class GetStateSink extends Pipe<LoadStateAction, StateLoadedEvent>
  implements Sink<LoadStateAction> {
  constructor(sink: Sink<StateLoadedEvent>) {
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
          .post('http://localhost:8003/state')
          .set('Authorization', act.payload.token)
          .then(res => {
            return {
              type: 'state-loaded',
              payload: { ...res.body, session: act.payload } as State
            } as StateLoadedEvent
          })
    }
  }
}
