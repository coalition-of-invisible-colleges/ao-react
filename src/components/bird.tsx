import * as React from 'react'
import { computed } from 'mobx'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'
import Bird from '../assets/images/send.svg'
import LazyTippy from './lazyTippy'
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField'

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
    this.state = {query: ''}
    this.passCard = this.passCard.bind(this)
    this.focus = this.focus.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onChangeSelect = this.onChangeSelect.bind(this)
  }

  private birdBox = React.createRef<HTMLInputElement>()

  passCard(event) {
    console.log("passCard!")
    if(this.state.memberId !== undefined) {
      api.passCard(this.props.taskId, this.state.memberId)
    }
  }

  focus() {
    document.getElementById('autocomplete-' +this.props.taskId).focus()
  }

  onChange(event) {
    console.log("onChange", event)
    this.setState({ query: event.target.value })
  }

  onChangeSelect(event, value) {
     console.log('onChangeSelect', event, value)
     this.setState({memberId: value.memberId })
  }

  @computed get localMembers() {
    if (!aoStore.state.members || aoStore.state.members.length < 1) {
      return []
    }

    return aoStore.state.members.map(member => {return {label: member.name, memberId: member.memberId}})
  }

  render() {
    return (
      <LazyTippy
        zIndex={4}
        trigger="click"
        onShown={this.focus}
        hideOnClick="toggle"
        content={<React.Fragment><Autocomplete id={ 'autocomplete-' + this.props.taskId } onChange={this.onChangeSelect} options={this.localMembers} openOnFocus={true} style={{display: 'inline-block'}}
        getOptionLabel={option => option.label}
        renderInput={params => (
        <div ref={params.InputProps.ref}>
          <input type="text" placeholder="type member name" onChange={this.onChange} value={this.state.query} autoFocus {...params.inputProps} />
        </div>
      )} />        <div className="action inline" onClick={this.passCard}>give</div>
</React.Fragment>}
        placement="right-start"
        interactive={true}>
        <img src={Bird} className="bird" />
        </LazyTippy>
    )
  }
}
