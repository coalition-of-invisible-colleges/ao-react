import * as React from 'react'
import { observer } from 'mobx-react'
import { Redirect } from 'react-router-dom'
import aoStore, { AoState } from '../client/store'
import api from '../client/api'
import { ObservableMap } from 'mobx'
import { delay, cancelablePromise, noop } from '../utils'
import Muted from '../assets/images/muted.svg'
import Unmuted from '../assets/images/unmuted.svg'
@observer
export class AoVolume extends React.Component<{}> {
  constructor(props) {
    super(props)
    this.toggleMute = this.toggleMute.bind(this)
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

  toggleMute() {
    if (aoStore.member.muted) {
      api.unmute()
    } else {
      api.mute()
    }
  }

  render() {
    return (
      <img
        id="volume"
        src={aoStore.member.muted ? Muted : Unmuted}
        onDoubleClick={this.toggleMute}
      />
    )
  }
}
