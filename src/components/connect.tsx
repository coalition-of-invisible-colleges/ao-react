import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore, { Task } from '../client/store'
import api from '../client/api'
import AoServerName from './serverName'
import AoTip from './tip'
import AoStack from './stack'
import { CardPlay } from '../cards'
import config from '../../configuration'
import { formatDistanceToNow } from 'date-fns'

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
    const list = aoStore.state.ao.map(ao => {
      let linkedCards: Task[] = ao.links?.map(tId => aoStore.hashMap.get(tId))

      const linkCard = (move: CardPlay) => {
        console.log('linkCard!')
        api.linkCardOnAo(move.from.taskId, ao.address)
      }

      const formattedLastContact = formatDistanceToNow(ao.lastContact, {
        addSuffix: true
      })

      return (
        <li key={ao.address}>
          Address: {ao.address}
          <br />
          Direction: {!ao.outboundSecret ? 'Inbound' : 'Outbound'}
          <br />
          Last seen {formattedLastContact}
          <br />
          Linked cards:{' '}
          <AoStack
            cards={linkedCards}
            cardStyle="priority"
            onDrop={ao.outboundSecret ? linkCard : null}
            alwaysShowAll={true}
          />
        </li>
      )
    })

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
        {/*{<p>Secret: {aoStore.state.loader.token}</p>}*/}
        {list.length >= 1 ? (
          <React.Fragment>
            <ul>{list}</ul>
          </React.Fragment>
        ) : (
          <p>No AOs connected.</p>
        )}
        {/*        <div className="action" onClick={this.toggleOpen}>
          {this.state.open ? (
            <React.Fragment>Connect to AO &#8963;</React.Fragment>
          ) : (
            <React.Fragment>Connect to AO &#8964;</React.Fragment>
          )}
        </div>
*/}
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
