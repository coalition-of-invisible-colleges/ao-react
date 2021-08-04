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

    aoStore.getTaskByName_async
        ( 'community hub',
          (communityHubCard) =>
          {
            if (!communityHubCard) {
              api.createCard('community hub').then(() => {
                this.goHub()
              })
              return
            }
            const taskId = communityHubCard.taskId

            let redirectCard;

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
              redirectCard = taskId;
            }

            aoStore.setCurrentCard(redirectCard)
            aoStore.removeFromContext(redirectCard)
          }
        )
    
  }

  render() {
    // if (this.state.redirect) {
    //   return <Redirect to={this.state.redirect} />
    // }

    let communityCard = aoStore.cardByName.get('community hub')
    let youAreHere =
      communityCard && aoStore.currentCard === communityCard.taskId

    return (
      <div id={'hub'}>
        <Tippy
          zIndex={4}
          theme="translucent"
          content={youAreHere ? 'Hide' : 'Community Hub'}
          placement="right">
          <img
            id="tour-hub"
            src={Sun}
            onClick={this.goHub}
            className={youAreHere ? 'open' : undefined}
          />
        </Tippy>
      </div>
    )
  }
}
