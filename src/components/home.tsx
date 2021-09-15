import * as React from 'react'
import { computed, reaction } from 'mobx'
import { observer } from 'mobx-react'
import { goInCard } from '../cardTypes'
import aoStore from '../client/store'
import { Redirect } from 'react-router-dom'
import Unicorn from '../assets/images/uni.svg'
import { hideAll as hideAllTippys } from 'tippy.js'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/translucent.css'

interface State {
  dabbed?: boolean
}

export default class AoHome extends React.PureComponent<{}, State> {
  constructor(props) {
    super(props)

    this.state = {}

    this.dab = this.dab.bind(this)
  }

  executeOnUnmount_list = []
  holdingThisCardId = null

  componentDidMount() {
    let isDabbedReaction = reaction(
      () => {
        return aoStore.isDabbed
      },
      isDabbed => {
        if (isDabbed === true) {
          this.setState({ dabbed: true })
        } else {
          this.setState({ dabbed: false })
          this.holdingThisCardId = null
        }
      }
    )
    this.executeOnUnmount_list.push(isDabbedReaction)
  }

  componentWillUnmount() {
    this.executeOnUnmount_list.forEach(fn => fn())
  }

  dab() {
    event.stopPropagation()

    // console.log('AO: components/home.tsx: dab ', {
    //   props: this.props,
    //   state: this.state,
    //   holdingThisCardId: this.holdingThisCardId,
    // })

    if (!aoStore.isDabbed) {
      this.holdingThisCardId = aoStore.currentCard
      goInCard(aoStore.member.memberId, false, true)
    } else {
      if (this.holdingThisCardId !== null) {
        goInCard(this.holdingThisCardId, false, true)
      }
    }
  }

  render() {
    // if (
    //   aoStore.currentCard === aoStore.memberCard.taskId &&
    //   !this.state.memory
    // ) {
    //   return null
    // }

    return (
      <React.Fragment>
        <Tippy
          zIndex={4}
          theme="translucent"
          content={this.state.dabbed ? 'Dab Back' : 'Dab Home'}
          placement="top"
          hideOnClick={false}>
          <img
            id="home"
            src={Unicorn}
            onClick={this.dab}
            className={this.state.dabbed ? 'dabbed' : ''}
          />
        </Tippy>
      </React.Fragment>
    )
  }
}
