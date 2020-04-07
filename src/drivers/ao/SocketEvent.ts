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
  payload: UserSession
}

export class SocketStream implements Stream<SocketEvent> {
  constructor(private ev$: Stream<SocketAction>) {}
  run(sink: Sink<SocketEvent>, scheduler: Scheduler): Disposable {
    console.log('socket sink', sink)
    const socketSink = new SocketSink(sink)
    return this.ev$.run(socketSink, scheduler)
  }
}

class SocketSink extends Pipe<SocketAction, SocketEvent>
  implements Sink<SocketAction> {
  public socket: any
  constructor(sink: Sink<SocketEvent>, url?) {
    super(sink)
    console.log('socket sink', sink)
    this.socket = io.connect('http://localhost:8003', {
      autoConnect: false
    })
  }
  event(t: Time, act: SocketAction) {
    console.log('socket sink', this.sink)
    switch (act.type) {
      case 'start-socket':
        const { session, token } = act.payload
        this.socket.open()
        this.socket.on('connect', function() {
          console.log('connected')
          console.log('socket sink', this.sink)
          this.sink.event({ type: 'socket-connected' })
          this.socket.emit('authentication', {
            session,
            token
          })
        })
        this.socket.on('authenticated', () => {
          console.log('authenticated')
          console.log('socket sink', this.sink)
          this.sink.event(t, { type: 'socket-authenticated' })
          this.socket.on('eventstream', ev => {
            console.log('got event, ev')
            console.log('socket sink', this.sink)
            this.sink.event(t, { type: 'ao-action', payload: ev })
          })
        })
    }
  }
}
