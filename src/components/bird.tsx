import * as React from 'react'
import { computed } from 'mobx'
import { observer } from 'mobx-react'
import aoStore, { Task, emptySearchResults } from '../client/store'
import Bird from '../assets/images/send.svg'
import LazyTippy from './lazyTippy'
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField'

interface BirdProps {
  taskId: string
}

interface State {
  query: string
}

@observer
export default class AoBird extends React.PureComponent<BirdProps, State> {
  constructor(props) {
    super(props)
    this.state = {query: ''}
    this.passCard = this.passCard.bind(this)
    this.focus = this.focus.bind(this)
    this.onChange = this.onChange.bind(this)
  }

  private birdBox = React.createRef<HTMLInputElement>()

  passCard(event) {
    console.log("passCard!")
  }

  focus() {
    console.log('focus called')
    this.birdBox.current.select()
  }

  onChange(event) {
    this.setState({ query: event.target.value })
  }

  @computed get localMembers() {
    if (!aoStore.state.members || aoStore.state.members.length < 1) {
      return []
    }

    return aoStore.state.members.map(member => member.name)
  }

  render() {
    return (
      <LazyTippy
        zIndex={4}
        trigger="click"
        content={<React.Fragment><Autocomplete options={this.localMembers} renderInput={params => {
          console.log(params)
          return (
        <div ref={params.InputProps.ref}>
          <TextField {...params.inputProps} placeholder="type member name" onChange={this.onChange} variant="outlined" style={{minWidth: '7em'}} autoFocus />
        </div>
      )}} />        <div className="action" onClick={this.passCard}>give</div>
</React.Fragment>}
        placement="right-start"
        interactive={true}>
        <img src={Bird} className="bird" />
        </LazyTippy>
    )
  }
}
