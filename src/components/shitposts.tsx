import * as React from 'react'
import { computed } from 'mobx'
import { observer } from 'mobx-react'
import aoStore, { AoState } from '../client/store'
import api from '../client/api'
import AoPopupPanel from './popupPanel'
import Pepe from '../assets/images/pepe.svg'
import AoStack from './stack'
// import InfiniteScroll from 'react-infinite-scroll-component'

interface State {
  page: number
}

export const defaultState: State = {
  page: 0
}

@observer
export default class AoShitposts extends React.Component<{}, State> {
  constructor(props) {
    super(props)
    this.state = defaultState
    this.purgeUnheldCards = this.purgeUnheldCards.bind(this)
  }

  purgeUnheldCards() {
    api.removeCards(this.allUnheldCards.map(task => task.taskId))
  }

  @computed get allUnheldCards() {
    // Will not catch cards that are still held by deleted members (need to filter task.deck for existing members for that)
    return aoStore.state.tasks
      .filter(task => {
        return task.deck.length <= 0 && task.name !== task.taskId
      })
      .reverse()
  }

  render() {
    if (this.allUnheldCards.length < 1) {
      return null
    }

    const renderedBadge = this.allUnheldCards.length.toString()

    // console.log('unheldcards is', this.allUnheldCards)
    return (
      <div id={'shitposts'}>
        <AoPopupPanel
          iconSrc={Pepe}
          tooltipText={'Shitposts'}
          badge={renderedBadge}
          tooltipPlacement={'left'}
          panelPlacement={'left'}>
          <button onClick={this.purgeUnheldCards}>Purge Unheld Cards</button>
          <AoStack
            cards={this.allUnheldCards}
            cardStyle={'priority'}
            alwaysShowAll={true}
          />
        </AoPopupPanel>
      </div>
    )
  }
}
