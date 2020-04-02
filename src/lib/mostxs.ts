// import { combine } from '@most/core'
import xs, {
  Stream as XStream,
  Listener,
  InternalProducer,
  InternalListener
} from 'xstream'
import { Stream as MostStream, Sink, Scheduler, Disposable } from '@most/types'
import { newDefaultScheduler } from '@most/scheduler'
// import { runEffects, tap } from '@most/core'

// export function mostToXs<T>(stream: MostStream<T>): XStream<T> {
//   return xs.fromObservable({})
// }

class Observer<T> implements Listener<T> {
  constructor(private _listener: InternalListener<T>) {}

  next(value: T) {
    this._listener._n(value)
  }

  error(err: any) {
    this._listener._e(err)
  }

  complete() {
    this._listener._c()
  }
}

class FromMostStream<T> implements InternalProducer<T> {
  public type = 'fromObservable'
  public ins: MostStream<T>
  public out?: XStream<T>
  private active: boolean
  private _dispose: Disposable
  private _writexs: Observer<T>

  constructor(m$: MostStream<T>) {
    this.ins = m$
    this.active = false
  }

  _start(out: XStream<T>) {
    this.out = out
    this.active = true
    this._writexs = new Observer(out)
    this._dispose = this.ins.run(
      {
        event(t, e: T) {
          this._writexs.next(e)
        },
        end(t) {
          this._writexs.complete()
        },
        error(t, e) {
          this._writexs.error(e)
        }
      },
      newDefaultScheduler()
    )
    if (!this.active) this._dispose.dispose()
  }

  _stop() {
    this._dispose.dispose()
    this.active = false
  }
}

function fromMostStream<T>(stream: MostStream<T>): XStream<T> {
  return new XStream<T>(new FromMostStream(stream))
}

// function fromObservable<T>(obs: { subscribe: any }): Stream<T> {
//   if ((obs as Stream<T>).endWhen) return obs as Stream<T>
//   const o = typeof obs[$$observable] === 'function' ? obs[$$observable]() : obs
//   return new Stream<T>(new FromObservable(o))
// }
