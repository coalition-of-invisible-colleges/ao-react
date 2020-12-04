import * as React from 'react'
import { computed } from 'mobx'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'
import AoBirdAutocomplete from './birdAutocomplete'
import Bird from '../assets/images/send.svg'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/translucent.css'
import LazyTippy from './lazyTippy'
import AoMemberIcon from './memberIcon'

interface Props {
  taskId: string
}

interface State {
  memberId?: string
}

@observer
export default class AoBird extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props)
    this.state = {}
    this.onChange = this.onChange.bind(this)
    this.passCard = this.passCard.bind(this)
    this.focus = this.focus.bind(this)
  }

  private birdBox = React.createRef<HTMLInputElement>()

  onChange(memberId: string) {
    this.setState({ memberId })
  }

  passCard(event) {
    console.log('passCard!')
    if (this.state.memberId !== undefined) {
      api.passCard(this.props.taskId, this.state.memberId)
    }
  }

  focus() {
    document.getElementById('autocomplete-' + this.props.taskId).focus()
  }

  @computed get pendingPasses() {
    const taskId = this.props.taskId
    const card = aoStore.hashMap.get(taskId)
    return card.passed.length
  }

  @computed get renderPassList() {
    const taskId = this.props.taskId
    const card = aoStore.hashMap.get(taskId)
    if (!card) {
      return null
    }

    const renderedPasses = card.passed.map(pass => {
      const fromId = pass[0]
      const fromMember = aoStore.memberById.get(fromId)
      const fromName = fromMember ? fromMember.name : 'deleted member'
      const toId = pass[1]
      const toMember = aoStore.memberById.get(toId)
      const toName = toMember ? toMember.name : 'deleted member'
      return (
        <div key={fromId + '-' + toId}>
          <AoMemberIcon memberId={fromId} /> {fromName}{' '}
          <img src={Bird} style={{ height: '1em' }} />{' '}
          <AoMemberIcon memberId={toId} /> {toName}
        </div>
      )
    })

    if (renderedPasses.length <= 0) {
      return 'Give card'
    }

    return (
      <div className="infoTooltip">
        <h4>Pending Passes</h4>
        {renderedPasses}
      </div>
    )
  }

  render() {
    return (
      <LazyTippy
        zIndex={4}
        trigger="click"
        onShown={this.focus}
        hideOnClick="toggle"
        content={
          <React.Fragment>
            <AoBirdAutocomplete
              taskId={this.props.taskId}
              onChange={this.onChange}
            />
            <div className="action inline" onClick={this.passCard}>
              give
            </div>
          </React.Fragment>
        }
        placement="right-start"
        interactive={true}>
        <Tippy
          zIndex={4}
          theme="translucent"
          content={this.renderPassList}
          delay={[625, 200]}
          placement="right-start">
          <div className="bird">
            <img src={Bird} />
            {this.pendingPasses >= 1 && (
              <div className={'badge subscript'}>{this.pendingPasses}</div>
            )}
          </div>
        </Tippy>
      </LazyTippy>
    )
  }
}
