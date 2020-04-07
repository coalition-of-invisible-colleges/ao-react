import { makeDOMDriver } from '@cycle/dom'
import { makeHistoryDriver } from '@cycle/history'
import { withState } from '@cycle/state'
import { routerify } from 'cyclic-router'
import switchPath from 'switch-path'

import { Component } from './interfaces'
import { toMostSource, fromMostStream } from './lib/mostxs'
import { Driver as XsDriver } from '@cycle/run'
import { Driver as MostDriver } from './lib/most2-run/src'
import { createStateDriver } from './drivers/aoStore'
// import speechDriver from './drivers/speech';
function toMostDriver(driver: XsDriver<any, any>): MostDriver<any, any> {
  return function(sink) {
    console.log('sink', sink)
    const source = driver(fromMostStream(sink))
    // source.addListener({
    //   next(val) {
    //     console.log('sourceval', val)
    //   }
    // })
    return toMostSource(source)
  }
}

const driversFactories: any = {
  DOM: () => toMostDriver(makeDOMDriver('#app')),
  ao: () => createStateDriver(),
  abyss: () =>
    function() {
      return function(sink): void {}
    }
  // history: () => makeHistoryDriver()
  // speech: () => speechDriver
}

export function getDrivers(): any {
  const historySource: { source?: any } = {}
  function makeHistory(options) {
    return function(sinks) {
      const source = makeHistoryDriver(options)
      historySource.source = source
      return toMostSource(source)
    }
  }
  return Object.keys(driversFactories)
    .map(k => ({ [k]: driversFactories[k]() }))
    .reduce((a, c) => ({ ...a, ...c }), {})
}

export const driverNames = Object.keys(driversFactories)
  .filter(name => name !== 'history')
  .concat(['state', 'router'])

// export function wrapMain(main: Component<any>): Component<any> {
//   // return withState(routerify(main as any, switchPath as any)) as any
// }
