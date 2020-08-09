import React from 'react'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import aoStore, { Task } from '../client/store'
import { TaskContext } from './taskContext'
import Paper1 from '../assets/images/paper_1.png'
import Paper2 from '../assets/images/paper_2.svg'
import Paper3 from '../assets/images/paper_3.svg'
import Paper4 from '../assets/images/paper_4.svg'

interface PaperProps {
  color?: string
}

@observer
export default class AoPaper extends React.PureComponent<PaperProps> {
  static contextType = TaskContext

  render() {
    const { card, setRedirect } = this.context
    if (!card) {
      console.log('missing card on render paper')
    }
    const computed = observable({
      get cardColor() {
        if (this.props && this.props.color) {
          return this.props.color
        }

        const loadedColor = card.color

        switch (loadedColor) {
          case 'red':
          case 'yellow':
          case 'green':
          case 'blue':
          case 'purple':
          case 'black':
            return loadedColor
          default:
            return ''
        }
      },
      get cardAge() {
        if (!card.taskId) {
          // console.log('Attempting to display missing card. This is bad.')
          return false
        }

        const now = Date.now()

        if (!card) {
          // console.log('Missing card in database. Clean up your database.')
          return false
        }

        let timestamp = Date.now()

        if (card.name === card.taskId) {
          let member = aoStore.memberById.get(card.taskId)
          if (!member) {
            return 366
          }
          if (!member.hasOwnProperty('timestamp')) {
            return false
          }
          timestamp = member.timestamp
        } else if (card.hasOwnProperty('created')) {
          // console.log(
          //   'Card without creation date found, please correct your database. Assuming card is old.'
          // )
          timestamp = card.created
        } else {
          return 366
        }

        const msSince = now - timestamp
        const days = msSince / (1000 * 60 * 60 * 24)
        return days
      }
    })
    let filename = Paper1
    if (computed.cardAge >= 8) {
      filename = Paper2
    } else if (computed.cardAge >= 30) {
      filename = Paper3
    } else if (computed.cardAge >= 90) {
      filename = Paper4
    }
    return (
      <div className={'paper'}>
        <img src={filename} />
        <div className={'color ' + computed.cardColor} />
      </div>
    )
  }
}
