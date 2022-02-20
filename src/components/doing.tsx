import * as React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import AoMetric from './metric'
import AoContextCard from './contextCard'
import api from '../client/api'
import { convertToDuration } from '../lib/utils'
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
  'doo now!!!1',
  'get thing done!',
  'you can do it!',
  'doge habeeb in u',
  'go do the thing please',
  'prodoos',
  'try harder!',
  'wow',
  'wow',
  'very productive',
  'such productivity',
  'plz go',
  'wow',
  'much prodoos',
  'we together do',
  'very intention',
]

function randomMotivational() {
  const i = Math.floor(Math.random() * motivationalPhrases.length)
  return motivationalPhrases[i]
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
      1000
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
    if (!aoStore.taskDoingNow) {
      return false
    }

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

    const timeSoFar = (Date.now() - this.mostRecentStartTime)
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
