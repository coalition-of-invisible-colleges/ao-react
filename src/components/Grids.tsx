import * as React from 'react'
import { useState } from 'react'
import { Redirect } from 'react-router-dom'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'

interface State {
  redirect?: string
  newGrid?: string
}

@observer
export class ListGrids extends React.Component<{}, State> {
  constructor(props) {
    super(props)
    this.state = {}
    this.goInGrid = this.goInGrid.bind(this)
  }

  goInGrid(gridId: string) {
    this.setState({
      redirect: '/grid/' + gridId //'/task/ab35d560-86c6-11ea-8ade-b19b69a89b74' //+ gridId
    })
  }

  setNewGrid(name: string) {
    this.setState({ newGrid: name })
  }

  render() {
    const onChange = e => this.setNewGrid(e.target.value)
    const onClick = e => api.createGrid(this.state.newGrid, 8, 8)
    return (
      <div>
        <h2>Grids</h2>
        <ul>
          {aoStore.state.grids.map((grid, i) => (
            <li key={i}>
              <div onClick={() => this.goInGrid(grid.gridId)} key={i}>
                {aoStore.hashMap.get(grid.gridId).name}
              </div>
            </li>
          ))}
        </ul>
        <div>
          Add Grid
          <input type="text" value={this.state.newGrid} onChange={onChange} />
          <button type="button" onClick={onClick}>
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
