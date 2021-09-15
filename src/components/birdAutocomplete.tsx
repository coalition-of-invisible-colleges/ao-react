import * as React from 'react'
import { computed, makeObservable } from 'mobx';
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import Autocomplete from '@material-ui/lab/Autocomplete'
// import TextField from '@material-ui/core/TextField'

interface Props {
  taskId?: string
  onChange: (memberId: string) => void
}

interface State {
  query: string
  memberId?: string
}

@observer
export default class AoBirdAutocomplete extends React.PureComponent<
  Props,
  State
> {
  constructor(props) {
    super(props)
    makeObservable(this);
    this.state = { query: '' }
    this.onChange = this.onChange.bind(this)
    this.onChangeSelect = this.onChangeSelect.bind(this)
  }

  onChange(event) {
    console.log('onChange', event)
    this.setState({ query: event.target.value })
  }

  onChangeSelect(event, value) {
    console.log('onChangeSelect', event, value)
    this.setState({ memberId: value.memberId })
    this.props.onChange(value.memberId)
  }

  @computed get localMembers() {
    if (!aoStore.state.members || aoStore.state.members.length < 1) {
      return []
    }

    const taskId = this.props.taskId

    if (!taskId) {
      return aoStore.state.members.map(member => {
        return { label: member.name, memberId: member.memberId }
      })
    }

    const card = aoStore.hashMap.get(taskId)

    return aoStore.state.members
      .filter(
        member =>
          !card.passed.some(p => p[1] === member.memberId) &&
          !card.deck.some(mId => mId === member.memberId)
      )
      .map(member => {
        return { label: member.name, memberId: member.memberId }
      })
  }

  render() {
    return (
      <Autocomplete
        id={'autocomplete-' + (this.props.taskId || '')}
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
              autoFocus={!!this.props.taskId}
              {...params.inputProps}
            />
          </div>
        )}
      />
    )
  }
}
