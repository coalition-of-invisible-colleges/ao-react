import * as React from 'react'
import { computed } from 'mobx'
import { observer } from 'mobx-react'
import aoStore, { Task } from '../client/store'
import api from '../client/api'
import AoHome from './home'
import AoHopper from './hopper'
import AoGem from './gem'
import AoGrid from './grid'
import AoPopupPanel from './popupPanel'
import AoDeck from './deck'
import MoonBag from '../assets/images/moonbag.svg'
import _ from 'lodash'

interface State {
  bookmarksTaskId?: string
}

@observer
export default class AoDock extends React.Component<{}, State> {
  private deckSearchRef = React.createRef<AoDeck>()

  constructor(props) {
    super(props)
    this.state = {}
    this.focusDeckSearchbox = this.focusDeckSearchbox.bind(this)
  }

  focusDeckSearchbox() {
    this.deckSearchRef.current.focus()
  }

  componentWillMount() {
    const dockCardName = aoStore.member.memberId + '-bookmarks'
    let myBookmarks = aoStore.cardByName.get(dockCardName)

    if (!myBookmarks) {
      api
        .createCard(dockCardName)
        .then(res => {
          const taskId = JSON.parse(res.text).event.taskId
          return api.addGridToCard(taskId, 1, 6)
        })
        .then(res => {
          const taskId = JSON.parse(res.text).event.taskId
          return api.pinCardToGrid(0, 0, 'drop bookmarks here', taskId)
        })
        .then(res => {
          const taskId = JSON.parse(res.text).event.taskId
          this.setState({ bookmarksTaskId: taskId })
        })
    } else if (!myBookmarks.hasOwnProperty('grid')) {
      api
        .addGridToCard(myBookmarks.taskId, 1, 6)
        .then(() => {
          return api.pinCardToGrid(
            0,
            0,
            'drop bookmarks here',
            myBookmarks.taskId
          )
        })
        .then(res => {
          const taskId = JSON.parse(res.text).event.taskId
          this.setState({ bookmarksTaskId: taskId })
        })
    } else if (!_.has(myBookmarks, 'grid.rows.0')) {
      api
        .pinCardToGrid(0, 0, 'drop bookmarks here', myBookmarks.taskId)
        .then(res => {
          const taskId = JSON.parse(res.text).event.taskId
          this.setState({ bookmarksTaskId: taskId })
        })
    } else {
      this.setState({ bookmarksTaskId: myBookmarks.taskId })
    }
  }

  render() {
    const card = aoStore.hashMap.get(this.state.bookmarksTaskId)

    if (!card || !_.has(card, 'grid.rows.0')) {
      return null
    }
    return (
      <div id="dock">
        <AoHome />
        <AoHopper />
        <AoGem />
        <div id="dock-tour">
          <AoGrid
            taskId={this.state.bookmarksTaskId}
            grid={card.grid}
            dropActsLikeFolder={true}
            height={card.grid.height}
            width={card.grid.width}
          />
        </div>
        <div id="deck">
          <AoPopupPanel
            iconSrc={MoonBag}
            tooltipText="My Deck"
            tooltipPlacement="top"
            panelPlacement="top-start"
            onShown={this.focusDeckSearchbox}
            id="tour-deck">
            <AoDeck ref={this.deckSearchRef} />
          </AoPopupPanel>
        </div>
      </div>
    )
  }
}
