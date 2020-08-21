import * as React from 'react'
import { computed } from 'mobx'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'
import AoPopupPanel from './popupPanel'
import Pepe from '../assets/images/pepe.svg'
import AoStack from './stack'

interface State {
  page: number
}

export const defaultState: State = {
  page: 0
}

@observer
export default class AoShitposts extends React.PureComponent<{}, State> {
  constructor(props) {
    super(props)
    this.state = defaultState
    this.purgeUnheldCards = this.purgeUnheldCards.bind(this)
  }

  purgeUnheldCards() {
    api.removeCards(aoStore.allUnheldCards.map(task => task.taskId))
  }

  render() {
    if (aoStore.allUnheldCards.length < 1) {
      return null
    }

    const renderedBadge = aoStore.allUnheldCards.length.toString()

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
            cards={aoStore.allUnheldCards}
            cardStyle={'priority'}
            alwaysShowAll={true}
          />
        </AoPopupPanel>
      </div>
    )
  }
}
