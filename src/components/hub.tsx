import * as React from 'react'
import { Redirect } from 'react-router-dom'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import AoStack from './stack'
import Sun from '../assets/images/sun.svg'
import AoContextCard from './contextCard'
import api from '../client/api'
import AoPopupPanel from './popupPanel'
import AoDropZone from './dropZone'
import { CardPlay } from '../cardTypes'
import Tippy from '@tippyjs/react'
import { hideAll as hideAllTippys } from 'tippy.js'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/translucent.css'

interface State {
  redirect?: string
}

@observer
export default class AoHub extends React.PureComponent<{}, State> {
  constructor(props) {
    super(props)
    this.state = {}
    // this.addCommunityCard = this.addCommunityCard.bind(this)
    this.goHub = this.goHub.bind(this)
    this.dropToHub = this.dropToHub.bind(this)
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.redirect !== undefined) {
      this.setState({ redirect: undefined })
    }
  }

  // addCommunityCard() {
  //   api.createCard('community hub')
  //   console.log('community hub card created')
  // }

  goHub() {
    event.stopPropagation()
    hideAllTippys()
    aoStore.closeAllCloseables()

    aoStore.getTaskByName_async('community hub', communityHubCard => {
      if (!communityHubCard) {
        // api.createCard('community hub').then(() => {
        // this.goHub()
        // })
        return
      }
      const taskId = communityHubCard.taskId

      let redirectCard

      if (aoStore.currentCard === taskId) {
        // let redirectCard
        if (aoStore.context.length <= 0) {
          redirectCard = aoStore.memberCard.taskId
        } else {
          redirectCard = aoStore.context[aoStore.context.length - 1]
        }
      } else {
        console.log('goInCard taskId is ', taskId)
        if (aoStore.currentCard) {
          aoStore.addToContext([aoStore.currentCard])
        }
        redirectCard = taskId
      }

      aoStore.setCurrentCard(redirectCard)
      aoStore.removeFromContext(redirectCard)
    })
  }

  async dropToHub(move: CardPlay) {
    console.log('dropToGridSquare move is', move)
    if (!move.from.taskId) {
      return
    }
    const cardFrom = aoStore.hashMap.get(move.from.taskId)
    if (!cardFrom) {
      return
    }
    const nameFrom = cardFrom.name

    const cardTo = aoStore.cardByName.get('community hub')
    if (!cardTo) {
      return
    }

    const nameTo = cardTo && cardTo.name ? cardTo.name : undefined

    const fromHasGuild =
      cardFrom && cardFrom.guild && cardFrom.guild.length >= 1
    const toHasGuild = cardTo && cardTo.guild && cardTo.guild.length >= 1

    console.log('fromHasGuild ', fromHasGuild, 'toHasGuild', toHasGuild)
    return new Promise((resolve, reject) => {
      api.findOrCreateCardInCard(nameFrom, move.to.taskId, true).then(resolve)
    })
  }

  render() {
    // if (this.state.redirect) {
    //   return <Redirect to={this.state.redirect} />
    // }

    let communityCard = aoStore.cardByName.get('community hub')
    let youAreHere =
      communityCard && aoStore.currentCard === communityCard.taskId

    const hubRenderedBadge = communityCard?.priorities?.length >= 1 && (
      <div className="unreadBadge red">{communityCard?.priorities.length}</div>
    )

    return (
      <div id="hub">
        <div>
          <AoDropZone
            taskId={communityCard.taskId}
            onDrop={this.dropToHub}
            zoneStyle="panel"
            dropHoverMessage="drop to send to hub card">
            <Tippy
              zIndex={4}
              theme="translucent"
              content={
                youAreHere ? (
                  'Hide'
                ) : (
                  <React.Fragment>
                    <p>Community Hub</p>
                    <p>
                      <small>Drop cards here to send to hub priorities</small>
                    </p>
                  </React.Fragment>
                )
              }
              placement="right">
              <img
                id="tour-hub"
                src={Sun}
                onClick={this.goHub}
                className={youAreHere ? 'open' : undefined}
              />
            </Tippy>
            {hubRenderedBadge}
          </AoDropZone>
        </div>
      </div>
    )
  }
}
