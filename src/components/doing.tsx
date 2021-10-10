import * as React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import AoMetric from './metric'
import AoContextCard from './contextCard'
import {
  addHours,
  getMinutes,
  getHours,
  getSeconds,
  getMilliseconds,
} from 'date-fns'
import api from '../client/api'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/translucent.css'

const ARBITRARY_START = 1633859359993

interface State {
  clock?: React.ReactElement
  motivational?: string
}

const motivationalPhrases = [
  'GO!',
  'DO IT NOW!!!',
  'Get it done!',
  'You can do it!',
  'doge habeebs in u',
  'Go do the thing please',
  'prodoos',
  'try harder!',
]

function randomMotivational() {
  const i = Math.floor(Math.random() * motivationalPhrases.length)
  return motivationalPhrases[i]
}

export const convertToDuration = (secondsAmount: number) => {
  const normalizeTime = (time: string): string =>
    time.length === 1 ? `0${time}` : time

  const SECONDS_TO_MILLISECONDS_COEFF = 1000
  const MINUTES_IN_HOUR = 60

  const milliseconds = secondsAmount * SECONDS_TO_MILLISECONDS_COEFF

  const date = new Date(milliseconds)
  const timezoneDiff = date.getTimezoneOffset() / MINUTES_IN_HOUR
  const dateWithoutTimezoneDiff = addHours(date, timezoneDiff)

  const hours = normalizeTime(String(getHours(dateWithoutTimezoneDiff)))
  const minutes = normalizeTime(String(getMinutes(dateWithoutTimezoneDiff)))
  const seconds = normalizeTime(String(getSeconds(dateWithoutTimezoneDiff)))
  const msOutput = normalizeTime(
    String(getMilliseconds(dateWithoutTimezoneDiff))
  ).substring(0, 2)

  const hoursOutput = hours !== '00' ? `${hours}:` : ''
  const minsOutput = minutes !== '00' || hoursOutput !== '' ? `${minutes}:` : ''

  return `${hoursOutput}${minsOutput}${seconds}:${msOutput}`
}

@observer
export default class AoDoing extends React.Component<{}, State> {
  private interval
  private motivationalInterval

  constructor(props) {
    super(props)
    makeObservable(this)
    this.state = {}
    this.renderClock = this.renderClock.bind(this)
  }

  componentDidMount() {
    this.interval = setInterval(
      () => this.setState({ clock: this.renderClock() }),
      100
    )
    this.motivationalInterval = setInterval(
      () => this.setState({ motivational: randomMotivational() }),
      1000 * 20
    )
  }

  componentWillUnmount() {
    clearInterval(this.interval)
    clearInterval(this.motivationalInterval)
  }

  @computed get mostRecentStartTime() {
    const card = aoStore.hashMap.get(aoStore.taskDoingNow.taskId)
    if (!card || !card.timelog || card.timelog.length <= 0) {
      return false
    }
    for (let i = card.timelog.length - 1; i >= 0; i--) {
      if (card.timelog[i].memberId === aoStore.member.memberId) {
        if (
          card.timelog[i].start >= ARBITRARY_START &&
          (!card.timelog[i]?.stop ||
            card.timelog[i].stop <= card.timelog[i].start)
        ) {
          return card.timelog[i].start
        }
      }
    }
    return null
  }

  renderClock() {
    if (!this.mostRecentStartTime) {
      return null
    }

    const timeSoFar = (Date.now() - this.mostRecentStartTime) / 1000
    console.log('timeSoFar is', timeSoFar)
    const prettyTime = convertToDuration(timeSoFar)

    return <div className="countupClock">{prettyTime}</div>
  }

  render() {
    if (!aoStore.taskDoingNow) {
      return null
    }
    return (
      <div id="doing">
        <div id="motivational">{this.state.motivational}</div>
        <AoMetric taskId={aoStore.taskDoingNow.taskId} />
        <AoContextCard task={aoStore.taskDoingNow} cardStyle="priority" />
        {this.state.clock}
      </div>
    )
  }
}
