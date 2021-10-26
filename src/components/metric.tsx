import * as React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import aoStore, { LabourTime } from '../client/store'
import api from '../client/api'
import { formatDistance } from 'date-fns'
import Play from '../assets/images/play.svg'
import Pause from '../assets/images/pause.svg'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/translucent.css'

interface Props {
  taskId: string
  inId?: string
}

interface State {
  clocked?: string
}

const ARBITRARY_START = 1633859359993

@observer
export default class AoMetric extends React.Component<Props, State> {
  constructor(props) {
    super(props)
    makeObservable(this)
    this.state = {}
    this.startTimeClock = this.startTimeClock.bind(this)
    this.stopTimeClock = this.stopTimeClock.bind(this)
  }

  private interval

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval)
    }
  }

  startTimeClock() {
    api.startTimeClock(this.props.taskId, this.props.inId)
    if (this.interval) {
      clearInterval(this.interval)
    }
    this.interval = setInterval(
      () => this.setState({ clocked: this.renderMyTimeClocked() }),
      1000
    )

    if (
      aoStore.memberCard.priorities &&
      Array.isArray(aoStore.memberCard.priorities) &&
      (aoStore.memberCard.priorities.length <= 0 ||
        aoStore.memberCard.priorities[
          aoStore.memberCard.priorities.length - 1
        ] !== this.props.taskId)
    ) {
      api.prioritizeCard(this.props.taskId, aoStore.memberCard.taskId)
    }
  }

  stopTimeClock() {
    api.stopTimeClock(this.props.taskId)
    clearInterval(this.interval)
  }

  // Returns true if the timeclock has been started for the card and not stopped yet
  @computed get started() {
    const card = aoStore.hashMap.get(this.props.taskId)
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
          return true
        } else {
          return false
        }
      }
    }

    return false
  }

  // Returns the total amount of time clocked on this card
  renderMyTimeClocked() {
    const card = aoStore.hashMap.get(this.props.taskId)
    if (!card || !card.timelog || card.timelog.length <= 0) {
      return null
    }
    let totalTime = 0
    card.timelog
      .filter((entry: LabourTime) => entry.memberId === aoStore.member.memberId)
      .forEach((entry: LabourTime) => {
        if (entry.start > ARBITRARY_START && entry.stop > entry.start) {
          totalTime += entry.stop - entry.start
        } else if (entry.start > ARBITRARY_START && !entry.stop) {
          totalTime += Date.now() - entry.start // This might  be broken because the server's time zone is different
        }
      })

    return formatDistance(totalTime, 0)
  }

  @computed get playPauseTooltip() {
    return (
      <div>
        Click to{' '}
        {!this.started && (
          <React.Fragment>
            <big>
              <span className="DOIT inline">DO IT!</span>
            </big>{' '}
            now and start the clock!!!
          </React.Fragment>
        )}
        {this.started && 'pause the clock'}
        <div>
          <small>clocked {this.state.clocked}</small>
        </div>
      </div>
    )
  }

  render() {
    // console.log('metric render')
    if (!this.started) {
      return (
        <Tippy
          zIndex={4}
          theme="translucent"
          content={this.playPauseTooltip}
          delay={[625, 200]}
          placement="right-start">
          <div className="metric">
            <img src={Play} onClick={this.startTimeClock} />
          </div>
        </Tippy>
      )
    }

    return (
      <Tippy
        zIndex={4}
        theme="translucent"
        content={this.playPauseTooltip}
        delay={[625, 200]}
        placement="right-start">
        <div className="metric" onClick={this.stopTimeClock}>
          <div className="DOIT">
            DO
            <br />
            IT!
          </div>
          <img src={Pause} />
        </div>
      </Tippy>
    )
  }
}
