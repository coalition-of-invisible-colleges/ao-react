import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import AoSourceStack from './sourceStack'
import Sun from '../assets/images/sun.svg'
import AoGrid from './grid'
import AoSmartCard from './smartCard'
import api from '../client/api'

interface State {
  hubPanel: boolean
}

export const defaultState: State = {
  hubPanel: false
}

@observer
export default class AoHub extends React.Component<{}, State> {
  constructor(props) {
    super(props)
    this.state = defaultState
    this.toggleHubPanel = this.toggleHubPanel.bind(this)
    this.addCommunityCard = this.addCommunityCard.bind(this)
    this.renderHubButton = this.renderHubButton.bind(this)
  }

  toggleHubPanel() {
    this.setState({ hubPanel: !this.state.hubPanel })
  }

  addCommunityCard() {
    api.createCard('community hub')
    console.log('card added')
  }

  renderHubButton() {
    return (
      <div id={'hub'}>
        <div onClick={this.toggleHubPanel} className={'actionCircle'}>
          <img src={Sun} />
        </div>
      </div>
    )
  }

  render() {
    if (!this.state.hubPanel) {
      return this.renderHubButton()
    }

    let topMissions = aoStore.state.tasks.filter(task => {
      return task.hasOwnProperty('guild') && task.guild.length >= 1
    })

    topMissions = topMissions.sort((a, b) => {
      return b.deck.length - a.deck.length
    })

    if (topMissions.length > 5) {
      topMissions = topMissions.slice(0, 5)
    }

    let topCards = aoStore.state.tasks.filter(task => {
      return (
        !task.hasOwnProperty('guild') ||
        (task.hasOwnProperty('guild') && task.guild.length < 1)
      )
    })

    topCards = topCards.sort((a, b) => {
      return b.deck.length - a.deck.length
    })

    if (topCards.length > 5) {
      topCards = topCards.slice(0, 5)
    }

    console.log('top missions is ', topMissions, ' and top cards is ', topCards)

    // <AoGrid taskId={aoStore.state.tasks[0].taskId} />
    let communityCard = aoStore.cardByName.get('community hub')

    console.log('communityCard is ', communityCard)

    return (
      <div id={'hub'} className={'open'}>
        {this.renderHubButton()}
        <div className={'popover'}>
          <div className={'left'}>
            {communityCard && communityCard.hasOwnProperty('taskId') ? (
              <AoSmartCard taskId={communityCard.taskId} cardStyle={'full'} />
            ) : (
              <p onClick={this.addCommunityCard} className={'action'}>
                +H.U.B.
              </p>
            )}
          </div>
          <div className={'right'}>
            <h2>Top Missions</h2>
            <AoSourceStack cards={topMissions} alwaysShowAll={true} />
            <h2>Top Cards</h2>
            <AoSourceStack cards={topCards} alwaysShowAll={true} />
          </div>
        </div>
      </div>
    )
  }
}
