import * as io from 'socket.io-client'
import { Sink, Stream, Time, Disposable, Scheduler } from '@most/types'
import { AoAction } from '../../lib/actions'
import { UserSession } from './types'
import Pipe from './Pipe'
export type SocketEvent =
  | { type: 'ao-action'; payload: AoAction }
  | { type: 'socket-connected' }
  | { type: 'socket-authenticated' }

export type SocketAction = {
  type: 'start-socket'
}

export class SocketStream implements Stream<SocketEvent> {
  constructor(
    private ev$: Stream<SocketAction>,
    private session: UserSession
  ) {}
  run(sink: Sink<SocketEvent>, scheduler: Scheduler): Disposable {
    console.log('socket sink', sink)
    const socketSink = new SocketSink(sink, this.session)
    return this.ev$.run(socketSink, scheduler)
  }
}

class SocketSink extends Pipe<SocketAction, SocketEvent>
  implements Sink<SocketAction> {
  public socket: any
  constructor(
    readonly sink: Sink<SocketEvent>,
    private session: UserSession,
    url?
  ) {
    super(sink)
    console.log('socket sink', sink)
    this.socket = io.connect('http://localhost:8003', {
      autoConnect: false
    })
  }
  event(t: Time, act: SocketAction) {
    console.log('event socket sink', act)
    const { sink, socket } = this
    switch (act.type) {
      case 'start-socket':
        const { session, token } = this.session
        this.socket.open()
        this.socket.on('connect', function() {
          console.log('connected')
          console.log('connected socket sink')
          sink.event(t, { type: 'socket-connected' })
          socket.emit('authentication', {
            session,
            token
          })
        })
        socket.on('authenticated', () => {
          console.log('authenticated')
          console.log('authenticated socket sink', sink)
          sink.event(t, { type: 'socket-authenticated' })
          socket.on('eventstream', ev => {
            console.log('got event, ev')
            console.log('event stream socket sink')
            sink.event(t, { type: 'ao-action', payload: ev })
          })
        })
    }
  }
}
