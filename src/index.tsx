import xs from 'xstream'
// import { run as mostRun} from '@cycle/most-run'
import {
  setupReusable as xsSetup,
  Engine,
  Driver as XsDriver
} from '@cycle/run'
import regeneratorRuntime from 'regenerator-runtime/runtime.js'
import * as _ from 'lodash'
import { Stream as XStream } from 'xstream'
import { Stream as MostStream } from '@most/types'
import fromObservable from 'most-observable'
import { create } from 'most-subject'
import './css/styles.scss'
import {
  setupReusable as mostSetup,
  run,
  Driver as MostDriver
} from './lib/most2-run/src'
import { getDrivers } from './drivers'
import { Component } from './interfaces'
import { App } from './components/app'
import './assets/grid.css'
import { fromMostStream, toMostSource } from './lib/mostxs'
import { makeDOMDriver } from '@cycle/dom'
import {
  now,
  periodic,
  map,
  tap,
  scan,
  runEffects,
  startWith
} from '@most/core'
import { compose } from '@most/prelude'
import { newDefaultScheduler } from '@most/scheduler'
// const foo = R.compose(
//   scan((state, p: void) => state + 1, 0) as void => an,
//   periodic(100)
// )
// const foo =
// foo(periodic(100))
// const xsDomDriver = makeDOMDriver('#app')
// const xsDomSource = xsDomDriver(fromMostStream(now(<div>hello</div>)))
// const mostDomSource = toMostSource(xsDomSource)
// // const mostClick: MostStream<any> = source.select('.my-button').events('click')
// // const numberState = scan((state: number, p) => state + 1, 0, mostClick)
// // const domSink = viewState(numberState)

// // console.log(domSource)
// runEffects(
//   tap(x => console.log('click!'), mostDomSource),
//   newDefaultScheduler()
// )

// const main: Component<any> = wrapMain(App)
// interface XsToMostDriver<T, U> {
//   driver: T
//   toMost: (source: T) => U
// }

// type XsToMostDrivers = {
//   [name: string]: XsToMostDriver<any, any>
// }

// function run(main: any, drivers: { most: any; xs: any }) {
//   // const xsEngine: Engine<any> = xsSetup(drivers.xs)
//   const mostEngine: Engine<any> = mostSetup(drivers.most)
//   const xsMostSources: any = _.keys(xsEngine).map(key =>
//     toMostSource(drivers.xs[key])
//   )
//   const sinks = main({ ...xsMostSources, ...mostEngine.sources })
//   const xsSinks = _.chain(drivers.xs)
//     .keys()
//     .transform((acc, key) => {
//       acc[key] = sinks[key]
//     }, {})
//   const mostSinks = _.chain(drivers.most)
//     .keys()
//     .transform((acc, key) => {
//       acc[key] = sinks[key]
//     }, {})
//   // const disposeXsRun = xsEngine.run(xsSinks)
//   const disposeMostRun = mostEngine.run(mostSinks)
//   return function dispose() {
//     // disposeXsRun()
//     disposeMostRun()
//     // xsEngine.dispose()
//     mostEngine.dispose()
//   }
// }
run(App as any, getDrivers())
