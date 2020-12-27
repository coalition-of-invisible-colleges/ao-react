import React from 'react'
import { observer } from 'mobx-react'
import aoStore, { Member, Resource } from '../client/store'
import AoContextCard from './contextCard'
import AoDiscardZone from './discard'
import AoHud from './hud'
import { Helmet } from 'react-helmet'
import { ShepherdTour as Tour } from 'react-shepherd'
import { steps, tourOptions } from './tour'
import { goUp } from '../cards'

interface CardProps {
  match
}

interface RenderProps {
  taskId: string
}

@observer
class RenderCard extends React.Component<RenderProps> {
  constructor(props) {
    super(props)
  }
  render() {
    const taskId = this.props.taskId
    console.log('taskId is ', taskId)
    const card = aoStore.hashMap.get(taskId)
    if (!card) {
      return null
    }
    let cardText = ''
    if (card.name === taskId) {
      let memberOrResource: Member | Resource = aoStore.memberById.get(taskId)
      if (!memberOrResource) {
        memberOrResource = aoStore.resourceById.get(taskId)
      }
      if (memberOrResource) {
        cardText = memberOrResource.name
      }
    } else if (card.guild) {
      cardText = card.guild
    } else {
      cardText = card.name
    }

    if (cardText.length > 12) {
      cardText = cardText.substring(0, 12) + '…'
    }

    return (
      <Tour steps={steps} tourOptions={tourOptions}>
        <div id="tour-current-card">
          <Helmet>
            <title>
              {cardText} - {aoStore.state.cash.alias}
            </title>
          </Helmet>
          <AoDiscardZone />
          <AoContextCard task={card} cardStyle="full" />
          <AoHud />
        </div>
      </Tour>
    )
  }
}

@observer
export default class AoCard extends React.Component<CardProps> {
  constructor(props) {
    super(props)
    this.detectEscape = this.detectEscape.bind(this)

    const card = aoStore.hashMap.get(this.props.match.params.taskId)
    aoStore.setCurrentCard(this.props.match.params.taskId)
  }

  detectEscape(event) {
    console.log('detectEscape called!')
    if (event.key === 'Escape') {
      goUp()
    }
  }

  render() {
    return (
      <div onKeyDown={this.detectEscape} tabIndex={0}>
        <RenderCard taskId={aoStore.currentCard} />
      </div>
    )
  }
}
