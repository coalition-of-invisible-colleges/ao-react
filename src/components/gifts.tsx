import * as React from 'react'
import { computed } from 'mobx'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'
import AoStack from './stack'
import AoPopupPanel from './popupPanel'
import AoTip from './tip'
import AoBirdAutocomplete from './birdAutocomplete'
import AoCardComposer from './cardComposer'
import Bird from '../assets/images/send.svg'
import Gift from '../assets/images/gifts.svg'

type GiftBoxTab = 'inbox' | 'sent'

interface State {
  memberId?: string
  name: string
  openSend?: boolean
  tab: GiftBoxTab
}

@observer
export default class AoGifts extends React.PureComponent<{}, State> {
  private composeRef = React.createRef<AoCardComposer>()

  constructor(props) {
    super(props)
    this.state = { name: '', tab: 'inbox' }
    this.toggleSend = this.toggleSend.bind(this)
    this.onChangeTo = this.onChangeTo.bind(this)
    this.onChangeName = this.onChangeName.bind(this)
    this.onClick = this.onClick.bind(this)
    this.newGift = this.newGift.bind(this)
    this.goToTab = this.goToTab.bind(this)
    this.renderSortButton = this.renderSortButton.bind(this)
  }

  toggleSend() {
    this.setState({ openSend: !this.state.openSend })
  }

  onChangeTo(memberId: string) {
    this.setState({ memberId })
  }

  onChangeName(name: string) {
    this.setState({ name })
  }

  onClick(event) {
    this.newGift(this.state.name)
  }

  newGift(name: string) {
    if (!this.state.memberId || name.trim().length < 1) {
      return
    }
    this.composeRef.current.clear()

    api.createCard(name).then(res => {
      const newTaskId = JSON.parse(res.text).event.taskId

      api.passCard(newTaskId, this.state.memberId)
    })
  }

  @computed get myGifts() {
    return aoStore.state.tasks.filter(task => {
      return task.passed.some(pass => pass[1] === aoStore.member.memberId)
    })
  }

  @computed get mySent() {
    return aoStore.state.tasks.filter(task => {
      return task.passed.some(pass => pass[0] === aoStore.member.memberId)
    })
  }

  @computed get renderGiftsList() {
    if (this.myGifts.length < 1) {
      return ''
    }

    return (
      <div
        className="results"
        style={{ marginBottom: this.myGifts.length === 1 ? '3em' : null }}>
        <AoStack cards={this.myGifts} zone="gifts" cardStyle="face" />
      </div>
    )
  }

  @computed get isValid() {
    return this.state.memberId && this.state.name
  }

  goToTab(event) {
    const tab = event.currentTarget.getAttribute('data-sort')
    if (this.state.tab === tab) {
      return
    }
    this.setState({ tab: tab })
  }

  renderSortButton(tab: GiftBoxTab, label: string) {
    if (this.state.tab === tab) {
      return <p className="action selected">{label}</p>
    } else {
      return (
        <p onClick={this.goToTab} data-sort={tab} className="action">
          {label}
        </p>
      )
    }
  }

  render() {
    const renderedBadge = this.myGifts.length >= 1 && (
      <React.Fragment>{this.myGifts.length}</React.Fragment>
    )

    return (
      <div id="gifts">
        <AoPopupPanel
          iconSrc={this.myGifts.length <= 0 ? Bird : Gift}
          tooltipText={this.myGifts.length < 1 ? 'Send Gift' : 'Gifts'}
          badge={renderedBadge}
          tooltipPlacement="right"
          panelPlacement="right">
          <React.Fragment>
            <h2>Gifts</h2>
            <div
              style={{
                textAlign: 'center',
                position: 'relative',
                top: '-0.5em'
              }}>
              <small>
                {this.myGifts.length < 1
                  ? 'Send a gift to start a conversation.'
                  : 'Cards passed to you.'}{' '}
                <AoTip text="You can send cards as gifts to other members. Use the box below to create a new card and send it immediately, Or, click the bird in the top-left corner of any card to send it to someone else on this server." />
              </small>
            </div>
            {this.mySent.length >= 1 && (
              <div className="toolbar">
                {this.renderSortButton('inbox', 'Received')}
                {this.renderSortButton('sent', 'Given')}
              </div>
            )}
            {this.renderGiftsList}
            {this.myGifts.length >= 1 && (
              <div className="action" onClick={this.toggleSend}>
                {this.state.openSend ? (
                  <React.Fragment>Compose &#8963;</React.Fragment>
                ) : (
                  <React.Fragment>Compose &#8964;</React.Fragment>
                )}
              </div>
            )}
            {(this.state.openSend || this.myGifts.length < 1) && (
              <form>
                <label>To:</label>
                <AoBirdAutocomplete onChange={this.onChangeTo} />
                <div style={{ position: 'relative' }}>
                  <label style={{ position: 'relative', top: '-1em' }}>
                    Topic:
                  </label>
                  <AoCardComposer
                    ref={this.composeRef}
                    onNewCard={this.newGift}
                    onChange={this.onChangeName}
                  />
                </div>
                <button
                  type="button"
                  className="action"
                  onClick={this.onClick}
                  disabled={!this.isValid}>
                  give
                </button>
              </form>
            )}
          </React.Fragment>
        </AoPopupPanel>
      </div>
    )
  }
}
