import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore, { Task } from '../client/store'
import api from '../client/api'
import AoServerName from './serverName'
import AoTip from './tip'
import AoStack from './stack'
import { CardPlay } from '../cardTypes'
import config from '../../configuration'
import { formatDistanceToNow } from 'date-fns'
import Clipboard from '../assets/images/clipboard.svg'

interface State {
  open?: boolean
  address?: string
  secret?: string
  showCopied?: boolean
  timer?
  error?: string
}

@observer
export default class AoConnect extends React.PureComponent<{}, State> {
  constructor(props) {
    super(props)
    this.state = {}
    this.toggleOpen = this.toggleOpen.bind(this)
    this.onChangeAddress = this.onChangeAddress.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
    this.newConnection = this.newConnection.bind(this)
    this.copyConnectionStringToClipboard = this.copyConnectionStringToClipboard.bind(this)
  }

  toggleOpen() {
    this.setState({ open: !this.state.open })
  }

  onChangeAddress(event) {
    this.setState({ address: event.target.value  })
  }

  onKeyDown(event) {
    if (event.key === 'Enter') {
      event.stopPropagation()
      this.newConnection(event)
    }
  }

  newConnection(event) {
    const [address, secret] = this.state.address.split(':')
    console.log("address and secret are", {address, secret})
    if(!address || !secret) {
      this.setState({error: 'Invalid address or secret'})
      return
    }
    api.connectToAo(address, secret)
  }

  copyConnectionStringToClipboard(event, content: string | false) {
    event.stopPropagation()
    if(!content) {
      return
    }
    navigator.clipboard.writeText(content)
      .then(async () => {
          this.setState({showCopied: true})
          this.setState({timer: await setTimeout(() => this.setState({ showCopied: false }), 1000 ) })
      })
      .catch(err => {
          console.log(err, 'copy attempt failed, printing to console:')
          console.log(content)
      })
  }

  render() {
    console.log("state is", aoStore.state)
    const list = aoStore.state.ao.map(ao => {
      console.log('AO to render is: ', ao)
      let linkedCards: Task[] = ao.links?.map(tId => aoStore.hashMap.get(tId))

      const linkCard = (move: CardPlay) => {
        console.log('linkCard!')
        api.linkCardOnAo(move.from.taskId, ao.address)
      }

      const formattedLastContact = formatDistanceToNow(ao.lastContact, {
        addSuffix: true,
      })

      return (
        <li key={ao.address}>
          Address: {ao.address}
          <br />
          Direction: Unknown {/* !ao.outboundSecret ? 'Inbound' : 'Outbound' */}
          <br />
          Last seen {formattedLastContact}
          <br />
          Linked cards:{' '}
          <AoStack
            cards={linkedCards}
            cardStyle="priority"
            onDrop={linkCard}
            alwaysShowAll={true}
          />
        </li>
      )
    })
    
    const connectionString = aoStore?.state?.cash?.address && aoStore.state?.token
              ? aoStore.state.cash.address + ':' + aoStore.state?.token : false
    return (
      <div id="connect">
        <h3>
          Connect AOs{' '}
          <AoTip text="Connect AOs peer-to-peer securely over tor." />
        </h3>
        <div>
          Name this AO: <AoServerName />
        </div>
        <div className='connectionString'>
          Connection string: <input type="text" style={{width: '40em'}} readOnly={true} value={
  	       connectionString ? connectionString
              : 'Tor not set up.'
          } />
          <img className={'clippy' + (this.state.showCopied ? ' copied' : '')} src={Clipboard} onClick={(event) => this.copyConnectionStringToClipboard(event, connectionString)} />
        </div>
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
                <label>Connection string:</label>
                <input
                  type="text"
                  value={this.state.address}
                  onChange={this.onChangeAddress}
                  onKeyDown={this.onKeyDown}
                  size={64}
                />
              </div>
              {this.state.error && <p className="error">{this.state.error}</p>}
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
        <h3>Connected AOs</h3>
        {list.length >= 1 ? (
          <React.Fragment>
            <ul>{list}</ul>
          </React.Fragment>
        ) : (
          <p>No AOs connected.</p>
        )}
      </div>
    )
  }
}
