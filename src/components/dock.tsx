import * as React from 'react'
import { computed, comparer, reaction, observable } from 'mobx'
import { observer, Observer } from 'mobx-react'
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
  renderMeNowPlease?: boolean
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

  executeOnUnmount_list = []
  componentDidMount() {
    const dockCardName = aoStore.member.name + '-bookmarks'
    // let myBookmarks =
    aoStore.getTaskByName_async(dockCardName, myBookmarks => {
      console.log('myBookmarks is', myBookmarks)
      if (myBookmarks) {
        this.setState({ bookmarksTaskId: myBookmarks.taskId })
      }
    })

    // here we want to track the subCards and rerender when they change
    let unMountReactionFunction = reaction(
      () => {
        // console.log("AO: client/store.ts: bookmarksCard computing")
        let bookmarksTaskId = aoStore.bookmarksTaskId
        let card = aoStore.hashMap.get(bookmarksTaskId)
        let bookmarkedCardsData = []
        // card.grid.rows.forEach
        //     ( (row, y) =>
        //       {
        //         row.forEach
        //             ( (cell, x) =>
        //               { bookmarkedCardsData.push({y, x, cell})
        //               }
        //             )
        //       }
        //     )
        return bookmarkedCardsData
      },
      bookmarkedCardsData => {
        // console.log("AO: components/dock.tsx: gridChangedReaction: actionPhase")
        this.setState({ renderMeNowPlease: true })
      },
      { equals: comparer.structural }
    )
    this.executeOnUnmount_list.push(unMountReactionFunction)
  }

  componentWillUnmount() {
    // this.executeOnUnmount_list.forEach ( fn => fn() );
  }

  render() {
    // console.log("AO: components/dock.tsx: AoDock: render", {"props": this.props, "state": this.state})

    const card = aoStore.hashMap.get(this.state.bookmarksTaskId)
    if (!card) {
      return null
    }
    console.log(
      'loaded dock card is ',
      JSON.stringify(card.grid),
      'and has is ',
      _.has(card, 'grid.rows.0')
    )
    const hasBookmarksCard =
      card && _.has(card, 'grid.rows') && card?.grid?.height >= 1

    if (!hasBookmarksCard) {
      return null
    }
    return (
      <div id="dock">
        <AoHome />
        <AoHopper />
        <AoGem />
        <div id="dock-tour">
          <Observer>
            {() => {
              return (
                <AoGrid
                  taskId={this.state.bookmarksTaskId}
                  grid={card.grid}
                  dropActsLikeFolder={true}
                  height={card.grid.height}
                  width={card.grid.width}
                />
              )
            }}
          </Observer>
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
