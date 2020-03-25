import { run } from '@cycle/run';
import { getDrivers, wrapMain } from './drivers';
import { Component } from './interfaces';
import { App } from './components/app';

import { keyup, click } from '@most/dom-event'
import _ from 'lodash'
import { tap, runEffects, mergeArray } from '@most/core'
import { newDefaultScheduler } from '@most/scheduler'
import useAoStream from './client/ao-stream'
import api from './client/api'
import Router, { UrlEvent } from './client/router'
import aoStore from './client/store'
import './assets/grid.css'

const main: Component<any> = wrapMain(App);

run(main as any, getDrivers());
console.log('running')
