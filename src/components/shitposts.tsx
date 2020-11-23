import * as React from 'react'
import { computed } from 'mobx'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'
import AoPopupPanel from './popupPanel'
import Pepe from '../assets/images/pepe.svg'
import AoStack from './stack'
import AoPaper from './paper'

interface State {
  page: number
  text: string
  color: string
}

export const defaultState: State = {
  page: 0,
  text: '',
  color: 'blue'
}

@observer
export default class AoShitposts extends React.PureComponent<{}, State> {
  private shitpostBox = React.createRef<HTMLInputElement>()

  constructor(props) {
    super(props)
    this.state = defaultState
    this.focusShitpostBox = this.focusShitpostBox.bind(this)
    this.shitpost = this.shitpost.bind(this)
    this.purgeUnheldCards = this.purgeUnheldCards.bind(this)
    this.setColor = this.setColor.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
  }

  focusShitpostBox(instance?) {
    this.shitpostBox.current.focus()
  }

  shitpost() {
    let shitpostCard = aoStore.cardByName.get('shitposts')

    if (!shitpostCard) {
      api.createCard('shitposts').then(res => {
        const inId = JSON.parse(res.text).event.taskId
        api.findOrCreateCardInCard(
          this.state.text,
          inId,
          false,
          this.state.color,
          true
        )
      })
      this.setState({ text: '' })
      return
    }

    api.findOrCreateCardInCard(
      this.state.text,
      shitpostCard.taskId,
      false,
      this.state.color,
      true
    )
    this.setState({ text: '' })
  }

  @computed get allShitposts() {
    let shitpostCard = aoStore.cardByName.get('shitposts')
    let shitposts = []

    if (shitpostCard) {
      shitpostCard.priorities.forEach(st => {
        shitposts.push(aoStore.hashMap.get(st))
      })
      shitpostCard.subTasks.forEach(st => {
        shitposts.push(aoStore.hashMap.get(st))
      })
    }

    console.log('found shitposts: ', shitposts.length)

    let all = [...aoStore.allUnheldCards, ...shitposts]
    all = Array.from(new Set(all))

    all.sort((a, b) => {
      return b.created - a.created
    })

    return all
  }

  purgeUnheldCards() {
    api
      .removeCards(aoStore.allUnheldCards.map(task => task.taskId))
      .then(() => {
        const shitpostCard = aoStore.cardByName.get('shitposts')
        if (shitpostCard && shitpostCard.hasOwnProperty('taskId')) {
          api.emptyCard(shitpostCard.taskId)
        }
      })
  }

  setColor(event) {
    this.setState({ color: event.currentTarget.getAttribute('data-color') })
    this.shitpostBox.current.focus()
  }

  onKeyDown(event) {
    if (event.key === 'Enter') {
      this.shitpost()
    }
  }

  onChange(event) {
    this.setState({ text: event.target.value })
  }

  render() {
    const renderedBadge =
      this.allShitposts.length >= 1 ? this.allShitposts.length.toString() : null

    const palette = ['red', 'yellow', 'green', 'blue', 'purple'].map(
      (colorName, i) => (
        <div
          onClick={this.setColor}
          data-color={colorName}
          className="swatch"
          key={i}>
          <div
            className={
              this.state.color === colorName ? 'border selected' : 'border'
            }>
            <AoPaper color={colorName} />
          </div>
        </div>
      )
    )

    return (
      <div id="shitposts">
        <AoPopupPanel
          iconSrc={Pepe}
          tooltipText="Shitposts"
          badge={renderedBadge}
          tooltipPlacement="left"
          panelPlacement="left"
          onShown={this.focusShitpostBox}>
          {this.allShitposts.length >= 1 && (
            <div onClick={this.purgeUnheldCards} className="action">
              Cull Shitposts
            </div>
          )}
          <AoStack
            cards={this.allShitposts}
            cardStyle="priority"
            alwaysShowAll={true}
          />
          <div className="palette">{palette}</div>
          <input
            type="text"
            ref={this.shitpostBox}
            onChange={this.onChange}
            onKeyDown={this.onKeyDown}
            value={this.state.text}
            size={40}
            placeholder="Write a shitpost..."
          />
        </AoPopupPanel>
      </div>
    )
  }
}
