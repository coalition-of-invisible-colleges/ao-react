import React from 'react'
import { observer } from 'mobx-react'
import { computed, makeObservable } from 'mobx';
import aoStore, { Task } from '../client/store'
import { goInCard, findOrphans, findFirstCardInCard } from '../cards'
import BuddhaDoge from '../assets/images/buddadoge.svg'
import RedBoat from '../assets/images/boatbtnselected.svg'
import Badge from '../assets/images/badge.svg'
import Unicorn from '../assets/images/uni.svg'
import MoonBag from '../assets/images/archive.svg'


export default class AoDrawPile extends React.PureComponent {
  constructor(props) {
    super(props)
    makeObservable(this);
    this.state = {}
    this.meditate = this.meditate.bind(this)
    this.goTopPriority = this.goTopPriority.bind(this)
    this.goNextSquad = this.goNextSquad.bind(this)
    this.goNextCard = this.goNextCard.bind(this)
    this.goLostCard = this.goLostCard.bind(this)
    this.redirect = this.redirect.bind(this)
  }

  redirect(taskId) {
    console.log("AO: components/draw.tsx: redirect: ", {taskId})

    if (typeof taskId === 'object' && taskId !== null) taskId = taskId.taskId
    
    if (!taskId) {
      console.log("AO: components/draw.tsx: redirect: no taskId")
      return
    }
    goInCard(taskId)
    // aoStore.setGlobalRedirect(card.taskId)
    aoStore.setCurrentCard(taskId)
  }

  meditate(event) {
    const piles = [
      this.goTopPriority,
      this.goNextSquad,
      this.goNextCard,
      this.goLostCard
    ].filter(pile => !!pile)

    if (piles.length <= 0) {
      return
    }

    const whichPile = Math.floor(Math.random() * piles.length)

    piles[whichPile](event)
  }

  goTopPriority(event) {
    event.stopPropagation()
    let hub = aoStore.cardByName.get('community hub')
    if (hub) {
      aoStore.addToContext([hub.taskId], false)
    }

    this.redirect(this.topPriority)
  }

  @computed get topPriority() {
    let hub = aoStore.cardByName.get('community hub')
    if (!hub) {
      return null
    }
    return findFirstCardInCard(hub)
  }

  goNextSquad(event) {
    event.stopPropagation()
    this.redirect(this.nextSquad)
  }

  @computed get nextSquad() {
    const missions = aoStore.topLevelMissions

    if (missions.length < 1) {
      return null
    }

    missions.sort((a, b) => {
      return b.deck.length - a.deck.length
    })

    return missions[0]
  }

  goNextCard(event) {
    event.stopPropagation()
    // aoStore.dab()
    aoStore.addToContext([aoStore.memberCard.taskId])
    this.redirect(this.nextCard)
  }

  @computed get nextCard() {
    let toReturn = findFirstCardInCard(aoStore.memberCard)
    if (!toReturn) toReturn = aoStore.memberCard.taskId

    return toReturn
  }

  goLostCard(event) {
    event.stopPropagation()
    this.redirect(this.topReturnedCard)
  }

  @computed get topReturnedCard() {
    const orphans = findOrphans(1)
    if (orphans.length >= 1) {
      return orphans[0]
    }
    return null
  }

  render() {
    return (
      <div id="drawPile">
        <div className="drawSource" onClick={this.meditate}>
          <img src={BuddhaDoge} />
          <div>Draw</div>
        </div>
        <div className="drawSources" onClick={this.goTopPriority}>
          {this.topPriority && (
            <div className="drawSource">
              <img src={RedBoat} />
              <div>Top Priority</div>
            </div>
          )}
          {this.nextCard && (
            <div className="drawSource" onClick={this.goNextCard}>
              <img src={Unicorn} className={aoStore.dabbed ? 'dabbed' : null} />
              <div>Next Card</div>
            </div>
          )}
          {this.nextSquad && (
            <div className="drawSource" onClick={this.goNextSquad}>
              <img src={Badge} />
              <div>Top Squad</div>
            </div>
          )}
          {this.topReturnedCard && (
            <div className="drawSource" onClick={this.goLostCard}>
              <img src={MoonBag} />
              <div>Lost Card</div>
            </div>
          )}
        </div>
      </div>
    )
  }
}
