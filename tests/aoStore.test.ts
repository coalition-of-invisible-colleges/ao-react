// // import { expect } from 'chai'
// // import xs from 'xstream'

// // import { Socket } from 'socket.io'
// // import * as io from 'socket.io-client'
// // import { combineLatest, of } from 'rxjs'
// // import {
// //   first,
// //   take,
// //   last,
// //   mergeMap,
// //   map,
// //   catchError,
// //   filter
// // } from 'rxjs/operators'
// // import { ajax } from 'rxjs/ajax'
// import * as _ from 'lodash'
// import { createActionStream, setMode } from '../src/drivers/aoStore'
// import { now, runEffects, tap } from '@most/core'
// import { newDefaultScheduler } from '@most/scheduler'
// // import * as calculation from '../src/calculations'
// // // import { setMode, =AoEvent } from '../src/drivers/aoStore'
// // function toyDriver() {
// //   return function(sink: Stream<number>) {
// //     return { src0: map(x => x * 2, sink), src2: map(x => x * 3, sink) }
// //   }
// // }
// setMode('nodejs')
// describe('calculate', function() {
//   it('add', async function() {
//     const session$ = createActionStream(now({ type: 'try-load-session' }))
//     runEffects(
//       tap(x => console.log('got session', x), session$),
//       newDefaultScheduler()
//     )
//   })
// })
