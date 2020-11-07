import React from 'react'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import AoContextCard from './contextCard'
import AoDiscardZone from './discard'
import AoHud from './hud'
import { Helmet } from 'react-helmet'
import { ShepherdTour as Tour } from 'react-shepherd'
import { steps, tourOptions } from './tour'

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
      cardText = aoStore.memberById.get(taskId).name
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
        <div id="tourCurrentCard">
          <Helmet>
            <title>
              {cardText} - {aoStore.state.cash.alias}
            </title>
          </Helmet>
          <AoDiscardZone />
          <AoContextCard task={card} cardStyle={'full'} />
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
    const card = aoStore.hashMap.get(this.props.match.params.taskId)
    aoStore.setCurrentCard(this.props.match.params.taskId)
  }

  render() {
    return <RenderCard taskId={aoStore.currentCard} />
  }
}
