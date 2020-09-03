import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'

@observer
export default class AoRent extends React.PureComponent<{}> {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    if (
      !aoStore.state.cash.info ||
      !aoStore.state.cash.info.hasOwnProperty('blockheight')
    ) {
      return (
        <React.Fragment>
          <h3>Lightning Status</h3>
          <p>Install lightning-cli to connect a wallet.</p>
        </React.Fragment>
      )
    }

    return (
      <React.Fragment>
        <h3>Lightning Status</h3>
        <p>Lightning detected but lightning module doesn't exist yet.</p>
      </React.Fragment>
    )
  }
}
