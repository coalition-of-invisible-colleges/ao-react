import { run } from '@cycle/most-run'
import { getDrivers, wrapMain } from './drivers'
import { Component } from './interfaces'
import { App } from './components/app'
import _ from 'lodash'
import './assets/grid.css'

const main: Component<any> = wrapMain(App)

run(main as any, getDrivers())
console.log('running')
