import * as React from 'react'
import { useState } from 'react'
import { Redirect } from 'react-router-dom'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'

interface State {
  redirect?: string
  newGridName?: string
}

@observer
export class ListGrids extends React.Component<{}, State> {
  constructor(props) {
    super(props)
    this.state = {}
    this.onClick = this.onClick.bind(this)
    this.onChange = this.onChange.bind(this)
    this.goInGrid = this.goInGrid.bind(this)
  }

  onClick(event) {
    api.createCardWithGrid(this.state.newGridName, 3, 3)
  }

  onChange(event) {
    this.setState({ newGridName: event.target.value })
  }

  goInGrid(taskId: string) {
    this.setState({
      redirect: '/task/' + taskId
    })
  }

  render() {
    return (
      <div>
        <h2>Grids</h2>
        <ul>
          {aoStore.state.tasks.map((task, i) =>
            task.grid !== undefined ? (
              <li
                key={i}
                onClick={() => this.goInGrid(task.taskId)}
                style={{ cursor: 'pointer', padding: '0.5em' }}>
                {task.name}
              </li>
            ) : (
              ''
            )
          )}
        </ul>
        <div>
          Add Grid
          <input
            type="text"
            value={this.state.newGridName}
            onChange={this.onChange}
          />
          <button type="button" onClick={this.onClick}>
            Add Grid
          </button>
        </div>
        {this.state.redirect && <Redirect to={this.state.redirect} />}
      </div>
    )
  }
}

const AoGrids: React.FunctionComponent<{}> = observer(({}) => {
  return <ListGrids />
})

export default AoGrids
