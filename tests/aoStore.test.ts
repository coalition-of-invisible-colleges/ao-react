// import { expect } from 'chai'
// import xs from 'xstream'

// import { Socket } from 'socket.io'
// import * as io from 'socket.io-client'
// import { combineLatest, of } from 'rxjs'
// import {
//   first,
//   take,
//   last,
//   mergeMap,
//   map,
//   catchError,
//   filter
// } from 'rxjs/operators'
// import { ajax } from 'rxjs/ajax'
import * as _ from 'lodash'
// import * as calculation from '../src/calculations'
// // import { setMode, =AoEvent } from '../src/drivers/aoStore'
// import { XMLHttpRequest } from 'xmlhttprequest'

// import { combine } from '@most/core'
import xs, {
  Stream as XStream,
  Listener,
  InternalProducer,
  InternalListener
} from 'xstream'
import { Stream, Sink, Scheduler, Disposable } from '@most/types'
import { create, attach } from 'most-subject'
import { periodic, scan, take, runEffects, tap, now, map } from '@most/core'
import fromObservable from 'most-observable'
import { fromMostStream } from '../src/lib/mostxs'
import { newDefaultScheduler } from '@most/scheduler'

function toyDriver() {
  return function(sink: Stream<number>) {
    return { src0: map(x => x * 2, sink), src2: map(x => x * 3, sink) }
  }
}

describe('calculate', function() {
  it('add', async function() {
    const s = fromMostStream(now(5))
    s.addListener({
      next(val) {
        console.log('val', val)
      }
    })
    xs.of(5).subscribe({
      next(val) {
        console.log('stupud has', val)
      }
    })
    const t = fromObservable(xs.of(3))
    runEffects(
      tap(val => console.log('from xs', val), t),
      newDefaultScheduler()
    )
    const scheduler = newDefaultScheduler()

    const [sink, stream] = create<number>()

    // Listen to our stream.
    // It will log 1, 2, and 3.
    runEffects(tap(console.log, take(3, stream)), scheduler)

    const origin = scan(x => x + 1, 0, periodic(100))

    attach(sink, origin)
  })
})
