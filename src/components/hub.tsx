import * as React from 'react'
import { Redirect } from 'react-router-dom'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import AoStack from './stack'
import Sun from '../assets/images/sun.svg'
import AoContextCard from './contextCard'
import api from '../client/api'
import AoPopupPanel from './popupPanel'
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
    this.addCommunityCard = this.addCommunityCard.bind(this)
    this.goHub = this.goHub.bind(this)
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.redirect !== undefined) {
      this.setState({ redirect: undefined })
    }
  }

  addCommunityCard() {
    api.createCard('community hub')
    console.log('community hub card created')
  }

  goHub() {
    event.stopPropagation()
    hideAllTippys()
    aoStore.closeAllCloseables()

    let card = aoStore.cardByName.get('community hub')
    if (!card) {
      api.createCard('community hub').then(() => {
        this.goHub()
      })
      return
    }
    const taskId = card.taskId

    if (aoStore.currentCard === taskId) {
      let redirectCard
      if (aoStore.context.length <= 0) {
        redirectCard = aoStore.memberCard.taskId
      } else {
        redirectCard = aoStore.context[aoStore.context.length - 1]
      }
      aoStore.setCurrentCard(redirectCard)
      aoStore.removeFromContext(redirectCard)
      this.setState({
        redirect: redirectCard
      })
    } else {
      console.log('goInCard taskId is ', taskId)
      aoStore.addToContext([aoStore.currentCard])
      aoStore.setCurrentCard(taskId)
      aoStore.removeFromContext(taskId)
      this.setState({
        redirect: taskId
      })
    }
  }

  render() {
    if (this.state.redirect) {
      return <Redirect to={this.state.redirect} />
    }

    let communityCard = aoStore.cardByName.get('community hub')
    let topMissions = aoStore.topMissions
    let topCards = aoStore.topCards

    return (
      <div id={'hub'}>
        <Tippy
          zIndex={4}
          theme="translucent"
          content="Community Hub"
          placement="right">
          <img
            src={Sun}
            onClick={this.goHub}
            className={
              communityCard && aoStore.currentCard === communityCard.taskId
                ? 'open'
                : undefined
            }
          />
        </Tippy>
      </div>
    )
  }
}
