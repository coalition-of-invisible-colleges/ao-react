import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import { Task } from '../interfaces'
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
export default class AoConnect extends React.Component<{}, State> {
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
    api.connectToAo(address, secret).then(response => {
      console.log("response is", response)
      if(response.text.includes('ao-connect failed')) {
        this.setState({error: "Connection attempt failed on the server"})
      }
    })
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
      
      const deleteConnection = (event) => {
        const warningMessage = 'If you delete this connection, you will have to get the connection string again from the other AO in order to reconnect. Are you sure you want to delete it?'
        if(window.confirm(warningMessage)) {
          api.deleteAoConnection(ao.address)
        }
      }

      return (
        <fieldset key={ao.address} className='connectedAo'>
          <legend>{ao?.name || ao.address.slice(0, 12)}...</legend>
          Last seen {formattedLastContact}
          <br />
          <div className="splitFlex">
            <label>Address:</label>
            <textarea readOnly={true} value={ao.address} className='torAddress' />
          </div>
          <br />
          Direction: Unknown {/* !ao.outboundSecret ? 'Inbound' : 'Outbound' */}
          <br />
          Linked cards:{' '}
          <AoStack
            cards={linkedCards}
            cardStyle="priority"
            onDrop={linkCard}
            alwaysShowAll={true}
          />
          <button onClick={deleteConnection} className='action'>Delete...</button>
        </fieldset>
      )
    })
    
    const connectionString = aoStore?.state?.cash?.address && aoStore.state?.token
              ? aoStore.state.cash.address.trim() + ':' + aoStore.state?.token.trim() : false
    return (
      <div id="connect">
        <h3>
          Connect AOs
        </h3>
        <fieldset>
          <legend>This AO</legend>
          <div>
            Name: <AoServerName />
          </div>
          <div>Connection string: 
            <div className='connectionString'>
              <textarea readOnly={true} value={
      	       connectionString ? connectionString
                  : 'Tor not set up.'
              } />
              <img className={'clippy' + (this.state.showCopied ? ' copied' : '')} src={Clipboard} onClick={(event) => this.copyConnectionStringToClipboard(event, connectionString)} />
            </div>
          </div>
        </fieldset>
        {this.state.open ? (
          <fieldset>
            <legend className="clickable" onClick={this.toggleOpen}>Connect to AO &#8963;</legend>
              <form className="connectToAo">
                <div>
                  <div>
                    <label htmlFor="connectToAo">Connection string:</label>
                    <textarea
                      value={this.state.address}
                      onChange={this.onChangeAddress}
                      onKeyDown={this.onKeyDown}
                      name="connectToAo"
                      placeholder="Paste other AO's connection string to link p2p over Tor"
                    />
                  </div>
                  {this.state.error && <p className="error redText">{this.state.error}</p>}
                </div>
                <button
                  type="button"
                  onClick={this.newConnection}
                  disabled={!this.state.address || this.state.address.length <= 0}
                  className="action">
                  Connect
                </button>
              </form>
          </fieldset>
        ) : <div className="legendAction action" onClick={this.toggleOpen}>Connect to AO &#8964;</div>}
        <h3>Connected AOs</h3>
        {list.length >= 1 ? list : (
          <p>No AOs connected.</p>
        )}
      </div>
    )
  }
}
