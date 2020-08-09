import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import AoStack from './stack'
import Sun from '../assets/images/sun.svg'
import AoGrid from './grid'
import AoContextCard from './contextCard'
import { TaskContext } from './taskContext'
import api from '../client/api'
import AoPopupPanel from './popupPanel'

@observer
export default class AoHub extends React.Component<{}> {
  static contextType = TaskContext

  constructor(props) {
    super(props)
    this.state = {}
    this.addCommunityCard = this.addCommunityCard.bind(this)
  }

  addCommunityCard() {
    api.createCard('community hub')
    console.log('card added')
  }

  render() {
    const { card, setRedirect } = this.context

    let topMissions = aoStore.state.tasks.filter(task => {
      return task.hasOwnProperty('guild') && task.guild.length >= 1
    })

    topMissions = topMissions.sort((a, b) => {
      return b.deck.length - a.deck.length
    })

    if (topMissions.length > 5) {
      topMissions = topMissions.slice(0, 5)
    }
    topMissions.reverse()

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
    topCards.reverse()

    // <AoGrid taskId={aoStore.state.tasks[0].taskId} />
    let communityCard = aoStore.cardByName.get('community hub')

    return (
      <div id={'hub'}>
        <AoPopupPanel
          iconSrc={Sun}
          tooltipText={'Community Hub'}
          tooltipPlacement={'right'}
          panelPlacement={'right-start'}
          id={'hub'}>
          <React.Fragment>
            <div className={'left'}>
              <h2>
                {aoStore.state.cash.alias
                  ? aoStore.state.cash.alias
                  : 'Community Hub'}
              </h2>
              {communityCard && communityCard.hasOwnProperty('taskId') ? (
                <TaskContext.Provider
                  value={{ card: communityCard, setRedirect }}>
                  <AoContextCard cardStyle={'full'} noContextOnFull={true} />
                </TaskContext.Provider>
              ) : (
                <p onClick={this.addCommunityCard} className={'action'}>
                  +H.U.B.
                </p>
              )}
            </div>
            <div className={'right'}>
              <h2>Top Missions</h2>
              <AoStack
                cards={topMissions}
                alwaysShowAll={true}
                cardStyle={'mission'}
              />
              <h2>Top Cards</h2>
              <AoStack
                cards={topCards}
                alwaysShowAll={true}
                cardStyle={'priority'}
              />
            </div>
          </React.Fragment>
        </AoPopupPanel>
      </div>
    )
  }
}
