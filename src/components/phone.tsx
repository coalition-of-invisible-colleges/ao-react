import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/translucent.css'

interface State {
  editing: boolean
  text: string
  error?: boolean
}

export const defaultState: State = {
  editing: false,
  text: '',
}

@observer
export default class AoPhone extends React.PureComponent<{}, State> {
  constructor(props) {
    super(props)
    this.state = defaultState
    this.startEditing = this.startEditing.bind(this)
    this.saveValue = this.saveValue.bind(this)
    this.onChange = this.onChange.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
  }

  startEditing(event) {
    event.stopPropagation()
    this.setState({ editing: true })
  }

  saveValue(event) {
    event.stopPropagation()
    if (this.state.text.length <= 0) {
      this.setState({ editing: false })
      api.updateMemberField('phone', false)
      return
    }
    api.updateMemberField('phone', this.state.text)
    this.setState({ editing: false })
  }

  onKeyDown(event) {
    if (event.key === 'Enter') {
      event.stopPropagation()
      this.saveValue(event)
    } else if (event.key === 'Escape') {
      event.stopPropagation()
      this.setState({ editing: false, text: '' })
    }
  }

  onChange(event) {
    this.setState({ text: event.target.value })
    this.validate()
  }

  validate() {
    let query = '+(d){1,3}(d){10}'
    let regex = new RegExp(query, 'i')
    try {
      const isValid = regex.test(this.state.text)
      this.setState({ error: !isValid })
    } catch (err) {}
  }

  render() {
    if (this.state.editing) {
      return (
        <Tippy
          zIndex={4}
          theme="translucent"
          delay={[475, 200]}
          content={
            'Type your Signal phone number in +15557778888 format to receive notifications from the AO via Signal.'
          }
          placement="left"
          maxWidth="30em"
          showOnCreate={true}
          hideOnClick={false}
          trigger="manual">
          <div className="fob">
            <input
              type="text"
              className={this.state.error ? 'error' : ''}
              onChange={this.onChange}
              onKeyDown={this.onKeyDown}
              value={this.state.text}
              size={10}
              placeholder="+13334445555"
              autoFocus
            />
            <button type="button" onClick={this.saveValue}>
              Change Signal #
            </button>
          </div>
        </Tippy>
      )
    }
    return (
      <div className="phone menu">
        <div onClick={this.startEditing} className="action">
          Change Signal #
        </div>
      </div>
    )
  }
}
