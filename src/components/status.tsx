import * as React from 'react'
import { observer } from 'mobx-react'
import api from '../client/api'
import Loud from '../assets/images/loud.svg'

interface AoStatusState {
  barking?: boolean
}

@observer
export default class AoStatus extends React.PureComponent<{}, AoStatusState> {
  buttonPressTimer: NodeJS.Timeout
  constructor(props) {
    super(props)
    this.state = {}
    this.handleButtonPress = this.handleButtonPress.bind(this)
    this.handleButtonRelease = this.handleButtonRelease.bind(this)
    this.bark = this.bark.bind(this)
    // this.emitPing = this.emitPing.bind(this)
  }

  componentWillUnmount() {
    // cancel all pending promises to avoid
    // side effects when the component is unmounted
    this.clearPendingPromises()
  }

  pendingPromises = []

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
