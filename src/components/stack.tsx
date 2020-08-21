import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore, { Task } from '../client/store'
import AoContextCard, { CardStyle } from './contextCard'
import { CardZone } from '../cards'
import AoDragZone from './dragZone'
import AoDropZone from './dropZone'
import { CardPlay, Coords } from '../cards'
import AoCardComposer from './cardComposer'

interface StackProps {
  inId?: string
  cards: Task[]
  cardStyle?: CardStyle
  showAdd?: boolean
  hideAddWhenCards?: boolean
  addButtonText?: string
  alwaysShowAll?: boolean
  noFirstCard?: boolean
  descriptor?: CounterWord
  onNewCard?: (string) => void
  onDrop?: (CardPlay) => void
  zone?: CardZone
  noPopups?: boolean
  noFindOnPage?: boolean
  cardsBeforeFold?: number
}

interface StackState {
  selected?: Coords
  showAll: boolean
  showCompose: boolean
}

interface CounterWord {
  singular: string
  plural: string
}

export const defaultState: StackState = {
  selected: undefined,
  showAll: false,
  showCompose: false
}

@observer
export default class AoStack extends React.PureComponent<
  StackProps,
  StackState
> {
  constructor(props) {
    super(props)
    this.state = defaultState
    this.selectStackZone = this.selectStackZone.bind(this)
    this.show = this.show.bind(this)
    this.hide = this.hide.bind(this)
    this.toggleCompose = this.toggleCompose.bind(this)
  }

  componentDidMount() {
    aoStore.registerCloseable(this.hide)
  }

  componentWillUnmount() {
    aoStore.unregisterCloseable(this.hide)
  }

  selectStackZone(selection: Coords) {
    this.setState({ selected: selection })
  }

  show(event) {
    event.stopPropagation()
    event.nativeEvent.stopImmediatePropagation()
    this.setState({ showAll: true })
  }

  hide(event?) {
    if (event) {
      event.stopPropagation()
      event.nativeEvent.stopImmediatePropagation()
    }
    if (this.state.showAll) {
      this.setState({ showAll: false })
    }
  }

  toggleCompose() {
    this.setState({ showCompose: !this.state.showCompose })
  }

  render() {
    const cardsToRender =
      this.props.cards && this.props.cards.length >= 1
        ? this.props.cards
            .slice()
            .filter(t => {
              if (!t) {
                console.log(
                  'Missing card detected. card is ',
                  t,
                  ' and this.props.cards is ',
                  this.props.cards,
                  ' and cardStyle is ',
                  this.props.cardStyle
                )
                return false
              }
              return true
            })
            .reverse()
        : []

    let addButton
    if (this.state.showCompose) {
      addButton = (
        <AoCardComposer onNewCard={this.props.onNewCard} onBlur={this.hide} />
      )
    } else if (
      this.props.showAdd &&
      !(this.props.hideAddWhenCards && cardsToRender.length >= 1)
    ) {
      addButton = (
        <p className={'action'} onClick={this.toggleCompose}>
          {this.props.addButtonText ? this.props.addButtonText : '+card'}
        </p>
      )
    }

    let list = []
    if (this.state.showAll || this.props.alwaysShowAll) {
      list = cardsToRender.map((task, i) => {
        console.log(
          'taskId is ',
          task.hasOwnProperty('taskId') ? task.taskId : 'missing taskId',
          ' and task is ',
          task
        )

        return (
          <AoDragZone
            taskId={task.taskId}
            dragContext={{
              zone: this.props.zone ? this.props.zone : 'panel',
              inId: this.props.inId,
              y: i
            }}
            key={task.taskId + this.props.inId + this.props.cardStyle}>
            <AoContextCard
              task={task}
              cardStyle={this.props.cardStyle ? this.props.cardStyle : 'face'}
              noPopups={this.props.noPopups}
              noFindOnPage={this.props.noFindOnPage}
              inlineStyle={
                this.props.cardStyle === 'context'
                  ? {
                      maxWidth:
                        (30 - (cardsToRender.length - i)).toString() + 'em'
                    }
                  : {}
              }
            />
          </AoDragZone>
        )
      })
    } else if (this.props.noFirstCard) {
    } else if (cardsToRender.length >= 1) {
      list = cardsToRender
        .slice(0, this.props.cardsBeforeFold ? this.props.cardsBeforeFold : 1)
        .map((task, i) => (
          <AoDragZone
            taskId={task.taskId}
            dragContext={{
              zone: this.props.zone ? this.props.zone : 'panel',
              inId: this.props.inId,
              y: 0
            }}
            key={task.taskId + this.props.inId + this.props.cardStyle}>
            <AoContextCard
              task={task}
              cardStyle={this.props.cardStyle ? this.props.cardStyle : 'face'}
              noPopups={this.props.noPopups}
              noFindOnPage={this.props.noFindOnPage}
            />
          </AoDragZone>
        ))
    }

    let numCards = cardsToRender.length - 1
    if (this.props.noFirstCard) {
      numCards = cardsToRender.length
    } else if (this.props.cardsBeforeFold >= 2) {
      numCards = cardsToRender.length - this.props.cardsBeforeFold
    }

    let renderedDescriptor: string
    if (this.props.descriptor) {
      renderedDescriptor =
        cardsToRender.length >= 2
          ? this.props.descriptor.plural
          : this.props.descriptor.singular
      renderedDescriptor = renderedDescriptor + ' '
    }

    let showButton = (
      <>
        {(!this.props.alwaysShowAll && numCards >= 1) ||
        (this.props.noFirstCard && numCards >= 1) ? (
          !this.state.showAll ? (
            <div onClick={this.show} className={'action'}>
              {numCards} {renderedDescriptor}&#8964;
            </div>
          ) : (
            <div onClick={this.hide} className={'action open'}>
              {this.props.noFirstCard ? (
                <>
                  {numCards} {renderedDescriptor}
                </>
              ) : null}
              &#8963;
            </div>
          )
        ) : (
          ''
        )}
      </>
    )
    return (
      <div className={'stack' + (this.state.showAll ? ' open' : '')}>
        <AoDropZone
          inId={this.props.inId}
          y={0}
          onDrop={this.props.onDrop}
          zoneStyle={this.props.zone}>
          {addButton}
          {this.props.noFirstCard ? (
            <>
              {showButton}
              {list}
            </>
          ) : (
            <>
              {list}
              {showButton}
            </>
          )}
        </AoDropZone>
      </div>
    )
  }
}
