import * as React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'
import AoStack from './stack'
import AoPopupPanel from './popupPanel'
import AoTip from './tip'
import AoBirdAutocomplete from './birdAutocomplete'
import AoCardComposer from './cardComposer'
import AoMemberIcon from './memberIcon'
import AoDragZone from './dragZone'
import AoContextCard from './contextCard'
import { gloss } from '../semantics'

type GiftBoxTab = 'inbox' | 'sent'
type ChangesSort = 'alphabetical' | 'hodls' | 'age'

interface State {
  memberId?: string
  name: string
  openSend?: boolean
  tab: GiftBoxTab
  sort: ChangesSort
}

@observer
export default class AoGifts extends React.Component<{}, State> {
  private composeRef = React.createRef<AoCardComposer>()

  constructor(props) {
    super(props)
    makeObservable(this)
    this.state = { name: '', tab: 'inbox', sort: 'age' }
    this.toggleSend = this.toggleSend.bind(this)
    this.onChangeTo = this.onChangeTo.bind(this)
    this.onChangeName = this.onChangeName.bind(this)
    this.onClick = this.onClick.bind(this)
    this.newGift = this.newGift.bind(this)
    this.goToTab = this.goToTab.bind(this)
    this.renderTabButton = this.renderTabButton.bind(this)
    this.sortBy = this.sortBy.bind(this)
    this.renderSortButton = this.renderSortButton.bind(this)
  }

  componentDidUpdate() {
    if (this.state.tab === 'sent' && this.mySent.length < 1) {
      this.setState({ tab: 'inbox' })
    }
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

  @computed get mySent() {
    return aoStore.state.tasks.filter(task => {
      return task.passed.some(pass => pass[0] === aoStore.member.memberId)
    })
  }

  @computed get renderGiftsList() {
    if (this.state.tab === 'sent') {
      const sent = this.mySent

      let memberCounts = {}

      sent.forEach(sentCard => {
        sentCard.passed.forEach(pass => {
          if (pass[0] === aoStore.member.memberId) {
            if (!memberCounts.hasOwnProperty(pass[1])) {
              memberCounts[pass[1]] = 0
            }
            memberCounts[pass[1]]++
          }
        })
      })

      const sorted = Object.entries(memberCounts).sort(
        ([memberIdA], [memberIdB]) => {
          return memberCounts[memberIdB] - memberCounts[memberIdA]
        }
      )

      const list = sorted.map(([memberId, count]) => {
        const member = aoStore.memberById.get(memberId)
        let name = 'deleted member'
        if (member) {
          name = member.name
        }
        return (
          <tr key={memberId}>
            <td>
              <AoMemberIcon memberId={memberId} /> {name}
            </td>
            <td>{count}</td>
          </tr>
        )
      })
      return (
        <table
          id="sent"
          style={{
            marginBottom: this.state.openSend ? '1em' : '3.5em',
          }}>
          {list}
        </table>
      )
    }

    const listForTab = aoStore.myGifts

    if (listForTab.length < 1) {
      return ''
    }

    return (
      <div
        className="results"
        style={{ marginBottom: listForTab.length === 1 ? '3em' : null }}>
        <AoStack cards={listForTab} zone="gifts" cardStyle="face" />
      </div>
    )
  }

  @computed get isValid() {
    return this.state.memberId && this.state.name
  }

  goToTab(event) {
    const tab = event.currentTarget.getAttribute('data-tab')
    if (this.state.tab === tab) {
      return
    }
    this.setState({ tab: tab })
  }

  renderTabButton(tab: GiftBoxTab, label: string) {
    if (this.state.tab === tab) {
      return <p className="action selected">{label}</p>
    } else {
      return (
        <p onClick={this.goToTab} data-tab={tab} className="action">
          {label}
        </p>
      )
    }
  }

  sortBy(event) {
    const sort = event.currentTarget.getAttribute('data-sort')
    if (this.state.sort === sort) {
      return
    }
    this.setState({ sort: sort })
  }

  renderSortButton(sort: ChangesSort, label: string) {
    if (this.state.sort === sort) {
      return <p className="action selected">{label}</p>
    } else {
      return (
        <p onClick={this.sortBy} data-sort={sort} className="action">
          {label}
        </p>
      )
    }
  }

  render() {
    const hasGifts = aoStore.myGifts.length >= 1
    if (!hasGifts) {
      return null
    }

    const renderedGifts = aoStore.myGifts.map((task, i) => {
      return (
        <AoDragZone
          taskId={task.taskId}
          dragContext={{
            zone: 'gifts',
            y: i,
          }}>
          <AoContextCard task={task} cardStyle="envelope" />
        </AoDragZone>
      )
    })

    return <div className="envelopes">{renderedGifts}</div>
  }
}
