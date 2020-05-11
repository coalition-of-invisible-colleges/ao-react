import * as React from 'react'
import { useState } from 'react'
import { observer } from 'mobx-react'
import { Redirect } from 'react-router-dom'
import aoStore from '../client/store'
import { delay, cancelablePromise, noop } from '../utils'
import api from '../client/api'
import AoSmartCard from './smartCard'

interface State {
  redirect?: string
  text: string
}

export const defaultState: State = {
  text: '',
  redirect: undefined
}

@observer
export default class AoMembers extends React.Component<{}, State> {
  constructor(props) {
    super(props)
    this.state = defaultState
    this.onChange = this.onChange.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
    this.onClick = this.onClick.bind(this)
  }

  onChange(event) {
    this.setState({ text: event.target.value })
  }

  onKeyDown(event) {
    if (event.key === 'Enter') {
      this.onClick(event)
    }
  }
  onClick(event) {
    api.createMember(this.state.text)
  }

  render() {
    if (this.state.redirect !== undefined) {
      this.setState({ redirect: undefined })
      return <Redirect to={this.state.redirect} />
    }

    return (
      <div>
        <h1>Members</h1>
        <div style={{ width: '30em', margin: '0.5em auto' }}>
          {aoStore.state.members.map((member, i) => (
            <div
              onDoubleClick={event =>
                this.setState({
                  redirect: '/task/' + member.memberId
                })
              }>
              <AoSmartCard
                taskId={member.memberId}
                cardStyle="priority"
                key={i}>
                {member.name}
              </AoSmartCard>
            </div>
          ))}
        </div>
        <div>
          Add Member
          <input
            type="text"
            value={this.state.text}
            onChange={this.onChange}
            onKeyDown={this.onKeyDown}
          />
          <button type="button" onClick={this.onClick}>
            Add Member
          </button>
        </div>
      </div>
    )
  }
}
