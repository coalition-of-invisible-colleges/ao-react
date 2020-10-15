import * as React from 'react'
import { computed } from 'mobx'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import { Redirect } from 'react-router-dom'
import Unicorn from '../assets/images/uni.svg'
import { hideAll as hideAllTippys } from 'tippy.js'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/translucent.css'

interface State {
  redirect?: string
  dabbed?: boolean
  memory?: string
}

@observer
export default class AoHome extends React.PureComponent<{}, State> {
  constructor(props) {
    super(props)
    this.state = {}
    this.goHome = this.goHome.bind(this)
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.redirect !== undefined) {
      this.setState({ redirect: undefined })
    }
  }

  goHome() {
    event.stopPropagation()
    hideAllTippys()
    aoStore.closeAllCloseables()

    let card
    let newMemory
    if (this.state.dabbed) {
      card = aoStore.hashMap.get(this.state.memory)
      newMemory = undefined
    } else {
      card = aoStore.memberCard
      newMemory = aoStore.currentCard
    }

    if (!card) {
      console.log('missing card')
      return
    }
    const taskId = card.taskId
    console.log('goInCard taskId is ', taskId)
    aoStore.addToContext([aoStore.currentCard])
    aoStore.setCurrentCard(taskId)
    aoStore.removeFromContext(taskId)
    this.setState({
      redirect: taskId,
      dabbed: !this.state.dabbed,
      memory: newMemory
    })
  }

  render() {
    if (
      (aoStore.currentCard === aoStore.memberCard.taskId &&
        !this.state.dabbed) ||
      (aoStore.currentCard === this.state.memory && this.state.dabbed)
    ) {
      return null
    }

    return (
      <React.Fragment>
        {this.state.redirect && <Redirect to={this.state.redirect} />}
        <Tippy
          zIndex={4}
          theme="translucent"
          content={this.state.dabbed ? 'Dab Back' : 'Dab Home'}
          placement="top"
          hideOnClick={false}>
          <img
            id="home"
            src={Unicorn}
            onClick={this.goHome}
            className={this.state.dabbed && 'dabbed'}
          />
        </Tippy>
      </React.Fragment>
    )
  }
}
