import * as React from 'react'
import { computed } from 'mobx'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'
import Bird from '../assets/images/send.svg'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/translucent.css'
import LazyTippy from './lazyTippy'
import Autocomplete from '@material-ui/lab/Autocomplete'
import TextField from '@material-ui/core/TextField'
import AoMemberIcon from './memberIcon'

interface BirdProps {
  taskId: string
}

interface State {
  query: string
  memberId?: string
}

@observer
export default class AoBird extends React.PureComponent<BirdProps, State> {
  constructor(props) {
    super(props)
    this.state = { query: '' }
    this.passCard = this.passCard.bind(this)
    this.focus = this.focus.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onChangeSelect = this.onChangeSelect.bind(this)
  }

  private birdBox = React.createRef<HTMLInputElement>()

  passCard(event) {
    console.log('passCard!')
    if (this.state.memberId !== undefined) {
      api.passCard(this.props.taskId, this.state.memberId)
    }
  }

  focus() {
    document.getElementById('autocomplete-' + this.props.taskId).focus()
  }

  onChange(event) {
    console.log('onChange', event)
    this.setState({ query: event.target.value })
  }

  onChangeSelect(event, value) {
    console.log('onChangeSelect', event, value)
    this.setState({ memberId: value.memberId })
  }

  @computed get localMembers() {
    if (!aoStore.state.members || aoStore.state.members.length < 1) {
      return []
    }

    return aoStore.state.members.map(member => {
      return { label: member.name, memberId: member.memberId }
    })
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
        <React.Fragment key={fromId + '-' + toId}>
          <AoMemberIcon memberId={fromId} /> {fromName}{' '}
          <img src={Bird} style={{ height: '1em' }} />{' '}
          <AoMemberIcon memberId={toId} /> {toName}
        </React.Fragment>
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
            <Autocomplete
              id={'autocomplete-' + this.props.taskId}
              onChange={this.onChangeSelect}
              options={this.localMembers}
              openOnFocus={true}
              style={{ display: 'inline-block' }}
              getOptionLabel={option => option.label}
              renderInput={params => (
                <div ref={params.InputProps.ref}>
                  <input
                    type="text"
                    placeholder="type member name"
                    onChange={this.onChange}
                    value={this.state.query}
                    autoFocus
                    {...params.inputProps}
                  />
                </div>
              )}
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
          theme={'translucent'}
          content={this.renderPassList}
          delay={[625, 200]}>
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
