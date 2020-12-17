import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore, { Task } from '../client/store'
import AoContextCard, { CardStyle } from './contextCard'
import { CardZone } from '../cards'
import AoStack from './stack'
import AoCardComposer from './cardComposer'

interface Props {
  inId?: string
  cards?: Task[]
  onNewCard?: (string) => void
  onDrop?: (CardPlay) => void
}

interface State {
  showAll: boolean
  showCompose: boolean
}

export const defaultState: State = {
  showAll: false,
  showCompose: false
}

@observer
export default class AoChatStack extends React.Component<Props, State> {
  constructor(props) {
    super(props)
    this.state = defaultState
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
    this.setState({ showAll: false, showCompose: false })
  }

  toggleCompose() {
    this.setState({ showCompose: !this.state.showCompose })
  }

  render() {
    let addButton
    if (this.state.showCompose) {
      addButton = <AoCardComposer onNewCard={this.props.onNewCard} />
    } else {
      addButton = (
        <p className="action" onClick={this.toggleCompose}>
          chat here
        </p>
      )
    }

    let recent = []
    let older = []
    let showButton

    if (this.props.cards && this.props.cards.length >= 1) {
      recent = this.props.cards.slice(-5).reverse()
      older = this.props.cards.slice(0, -5)

      showButton = (
        <>
          {older.length >= 1 ? (
            !this.state.showAll ? (
              <div onClick={this.show} className="action">
                {older.length} &#8963;
              </div>
            ) : (
              <div onClick={this.hide} className="action open">
                {older.length} &#8964;
              </div>
            )
          ) : (
            ''
          )}
        </>
      )
    }

    return (
      <React.Fragment>
        <div className="chatStack">
          {this.state.showAll && (
            <AoStack
              inId={this.props.inId}
              cards={older}
              alwaysShowAll={true}
              cardStyle="priority"
              zone="subTasks"
            />
          )}
          {showButton}
          <AoStack
            inId={this.props.inId}
            alwaysShowAll={true}
            cards={recent}
            cardStyle="priority"
            zone="subTasks"
          />
        </div>
        {addButton}
      </React.Fragment>
    )
  }
}
