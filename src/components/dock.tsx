import * as React from 'react'
import { computed, comparer, reaction, observable } from 'mobx'
import { observer, Observer } from 'mobx-react'
import aoStore from '../client/store'
import { Task } from '../interfaces'
import { onDropToPinboard } from './contextCard'
import api from '../client/api'
import AoHome from './home'
import AoHopper from './hopper'
import AoGem from './gem'
import AoPinboard from './grid'
import AoPopupPanel from './popupPanel'
import AoDropZoneSimple from './dropZoneSimple'
import { CardLocation, CardPlay } from '../cardTypes'
import { gloss } from '../semantics'
import _ from 'lodash'

interface State {
  bookmarksTaskId?: string
  renderMeNowPlease?: boolean
  firstClick?: boolean
}

@observer
export default class AoDock extends React.Component<{}, State> {
  constructor(props) {
    super(props)
    this.state = {}
  }

  executeOnUnmount_list = []
  componentDidMount() {
    const dockCardName = aoStore.member.memberId + '-bookmarks'
    // let myBookmarks =
    aoStore.getTaskByName_async(dockCardName, myBookmarks => {
      // console.log('myBookmarks is', myBookmarks)
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
    const hasBookmarksCard =
      card && card.hasOwnProperty('pins') && card?.pinboard?.height >= 1
    
    if (!hasBookmarksCard) {
      return null
    }
    
    const expandDock = () => {
      if(!this.state.firstClick) {
        this.setState({firstClick: true})
        return null
      }
      const pinboard = card.pinboard
      const newWidth = pinboard.width + 1
      return api.resizeGrid(this.state.bookmarksTaskId, pinboard.height, newWidth, pinboard.size)
    }
    
    const onDropToDock = (from: CardLocation) => {
      const cardFrom = aoStore.hashMap.get(from.taskId)
      if(!cardFrom) {
        return
      }
      const pinboard = card.pinboard
      const newWidth = pinboard.width + 1
      api.resizeGrid(this.state.bookmarksTaskId, pinboard.height, newWidth, pinboard.size).then(() => {
        const toLocation: CardLocation = {
          taskId: cardFrom.taskId,
          inId: card.taskId,
          zone: 'grid',
          coords: { y: 0, x: newWidth - 1}
        }
        api.playCard(from, toLocation).then(() => {
          this.setState({renderMeNowPlease: true})
        })
      })
    }
    
    const onNewDockCard = (name, coords, callbackToClear) => {
      return api.createAndPlayCard(name, 'blue', false, {
          inId: this.state.bookmarksTaskId,
          zone: 'grid',
          coords: coords
        }).then(callbackToClear)
    }
    
    const onDropToPinboardCaller = (from, to) => {
      onDropToPinboard(from, to).then(() => this.setState({ renderMeNowPlease: true}))
    }
    
    const gridHasContents = card.pinboard && card.pinboard.height >= 1 && (card.pinboard.width > 1 || (card.pins && card.pins.length >= 1))
    return (
      <div id="dock">
        <AoHopper />
        <AoGem />
        <div id="dock-tour">
          {(gridHasContents || this.state.firstClick) && <Observer>
            {() => {
              return (
                <AoPinboard
                  pins={card.pins}
                  height={card.pinboard.height}
                  width={card.pinboard.width}
                  size={card.pinboard?.size || 9}
                  spread="grid"
                  onDropToSquare={onDropToPinboard}
                  onNewCard={onNewDockCard}
                  inId={this.state.bookmarksTaskId}
                  isPinboardResizing={aoStore.isPinboardResizing}
                  dimChecked={card.dimChecked}
                />
              )
            }}
          </Observer>}
          <AoDropZoneSimple onDrop={onDropToDock} dropHoverMessage="bookmark on dock" className='dockDropZone'>
            <div onClick={expandDock} className="action">+</div>
          </AoDropZoneSimple>
        </div>
      </div>
    )
  }
}
