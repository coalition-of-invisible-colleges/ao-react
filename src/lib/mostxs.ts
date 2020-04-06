// import { combine } from '@most/core'
import xs, {
  Stream as XStream,
  Listener,
  InternalProducer,
  InternalListener
} from 'xstream'
import fromObservable from 'most-observable'
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

  constructor(m$: MostStream<T>) {
    this.ins = m$
    this.active = false
  }

  _start(out: XStream<T>) {
    this.out = out
    this.active = true
    const _writexs = new Observer(out)
    console.log('from observable aha', this.ins)
    // if (!!(this.ins as any).sinks) {
    //   throw new Error('dammit')
    // }
    this._dispose = this.ins.run(
      {
        event(t, e: T) {
          _writexs.next(e)
        },
        end(t) {
          _writexs.complete()
        },
        error(t, e) {
          _writexs.error(e)
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

export function fromMostStream<T>(stream: MostStream<T>): XStream<T> {
  return new XStream<T>(new FromMostStream(stream))
}

export function toMostSource(source: any) {
  if (typeof (source as XStream<any>).shamefullySendNext == 'function') {
    console.log('outside xstream')
    return fromObservable(source)
  } else {
    console.log('outside proxy')
    const mostProxy = new Proxy(source, {
      get(target, prop, receiver) {
        console.log('prop', prop, target[prop])
        if (typeof target[prop] == 'function') {
          console.log('inside case function')
          return function(...args) {
            const mostSrc = toMostSource(target[prop](...args))
            console.log('inside function call', mostSrc)
            return mostSrc
          }
        } else if (
          typeof (target[prop] as XStream<any>).shamefullySendNext == 'function'
        ) {
          const mostSrc = fromObservable(target[prop])
          console.log('inside case xs', mostSrc)
          return mostSrc
        } else {
          const mostSrc = toMostSource(target[prop])
          console.log('inside case other', mostSrc)
          return mostSrc
        }
      }
    })
    console.log('most proxy', mostProxy)
    return mostProxy
  }
}

// function fromObservable<T>(obs: { subscribe: any }): Stream<T> {
//   if ((obs as Stream<T>).endWhen) return obs as Stream<T>
//   const o = typeof obs[$$observable] === 'function' ? obs[$$observable]() : obs
//   return new Stream<T>(new FromObservable(o))
// }
