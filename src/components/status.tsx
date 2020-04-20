import * as React from 'react'
import { observer } from 'mobx-react'
import { Redirect } from 'react-router-dom'
import aoStore, { AoState } from '../client/store'
import api from '../client/api'
import { ObservableMap } from 'mobx'
import { delay, cancelablePromise, noop } from '../utils'
import Loud from '../assets/images/loud.svg'
interface AoStatusState {
  barking?: boolean
}

@observer
export class AoStatus extends React.Component<{}, AoStatusState> {
  buttonPressTimer: NodeJS.Timeout
  constructor(props) {
    super(props)
    this.state = {}
    this.handleButtonPress = this.handleButtonPress.bind(this)
    this.handleButtonRelease = this.handleButtonRelease.bind(this)
    this.bark = this.bark.bind(this)
    // this.emitPing = this.emitPing.bind(this)
    console.log('status constructed')
  }

  componentWillUnmount() {
    // cancel all pending promises to avoid
    // side effects when the component is unmounted
    this.clearPendingPromises()
  }

  pendingPromises = []

  appendPendingPromise = promise =>
    (this.pendingPromises = [...this.pendingPromises, promise])

  removePendingPromise = promise =>
    (this.pendingPromises = this.pendingPromises.filter(p => p !== promise))

  clearPendingPromises = () => this.pendingPromises.map(p => p.cancel())

  handleButtonPress() {
    this.buttonPressTimer = setTimeout(() => this.bark(), 800)
  }

  handleButtonRelease() {
    clearTimeout(this.buttonPressTimer)
  }

  bark() {
    api.bark()
  }

  render() {
    return (
      <img
        id="status"
        src={Loud}
        onTouchStart={this.handleButtonPress}
        onTouchEnd={this.handleButtonRelease}
        onMouseDown={this.handleButtonPress}
        onMouseUp={this.handleButtonRelease}
        onMouseLeave={this.handleButtonRelease}
      />
    )
  }
}
