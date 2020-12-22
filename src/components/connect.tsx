import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'
import AoServerName from './serverName'
import AoTip from './tip'
import config from '../../configuration'

interface State {
  open?: boolean
  address?: string
  secret?: string
}

@observer
export default class AoConnect extends React.PureComponent<{}, State> {
  constructor(props) {
    super(props)
    this.state = {}
    this.toggleOpen = this.toggleOpen.bind(this)
    this.onChangeAddress = this.onChangeAddress.bind(this)
    this.onChangeSecret = this.onChangeSecret.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
    this.newConnection = this.newConnection.bind(this)
  }

  toggleOpen() {
    this.setState({ open: !this.state.open })
  }

  onChangeAddress(event) {
    this.setState({ address: event.target.value })
  }

  onChangeSecret(event) {
    this.setState({ secret: event.target.value })
  }

  onKeyDown(event) {
    if (event.key === 'Enter') {
      this.newConnection(event)
    }
  }

  newConnection(event) {
    api.connectToAo(this.state.address, this.state.secret)
  }

  render() {
    const list = aoStore.state.ao.map(ao => <li>{ao}</li>)

    return (
      <div id="connect">
        <h3>
          Connect AOs{' '}
          <AoTip text="Connect AOs peer-to-peer securely over tor." />
        </h3>
        <div>
          Name this AO: <AoServerName />
        </div>
        <p>
          {config.hasOwnProperty('tor') && config.tor.hasOwnProperty('hostname')
            ? 'Tor address: ' + config.tor.hostname
            : 'Tor not set up.'}
        </p>
        {/*<p>Secret: {aoStore.state.loader.token}</p>*/}
        {list.length >= 1 ? (
          <React.Fragment>
            <ul>{list}</ul>
          </React.Fragment>
        ) : (
          <p>No AOs connected.</p>
        )}
        <div className="action" onClick={this.toggleOpen}>
          {this.state.open ? (
            <React.Fragment>Connect to AO &#8963;</React.Fragment>
          ) : (
            <React.Fragment>Connect to AO &#8964;</React.Fragment>
          )}
        </div>
        {this.state.open && (
          <form>
            <div className="fieldset">
              <div>
                <label>Tor address:</label>
                <input
                  type="text"
                  value={this.state.address}
                  onChange={this.onChangeAddress}
                  onKeyDown={this.onKeyDown}
                  size={32}
                />
              </div>
              <div>
                <label>Secret:</label>
                <input
                  type="text"
                  value={this.state.secret}
                  onChange={this.onChangeSecret}
                  onKeyDown={this.onKeyDown}
                  size={32}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={this.newConnection}
              className="action">
              Connect
            </button>
            <AoTip text="Connect to another AO by entering the other AO's tor address (hostname) and secret." />
          </form>
        )}
      </div>
    )
  }
}
