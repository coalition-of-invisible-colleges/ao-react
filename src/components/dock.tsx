import * as React from 'react'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import api from '../client/api'
import AoGrid from './grid'
import _ from 'lodash'

@observer
export default class AoDock extends React.Component {
  componentDidMount() {
    const dockCardName = aoStore.member.memberId + '-bookmarks'
    console.log('dockCardName is ', dockCardName)
    let myBookmarks = aoStore.cardByName.get(dockCardName)

    if (!myBookmarks) {
      api
        .createCard(dockCardName)
        .then(res => {
          const taskId = JSON.parse(res.text).event.taskId
          return api.addGridToCard(taskId, 1, 6)
        })
        .then(res => {
          const taskId = JSON.parse(res.text).event.taskId
          api.pinCardToGrid(0, 0, 'drop bookmarks here', taskId)
        })
    } else if (!myBookmarks.hasOwnProperty('grid')) {
      api.addGridToCard(myBookmarks.taskId, 1, 6).then(() => {
        api.pinCardToGrid(0, 0, 'drop bookmarks here', myBookmarks.taskId)
      })
    } else if (!_.has(myBookmarks, 'grid.rows.0')) {
      api.pinCardToGrid(0, 0, 'drop bookmarks here', myBookmarks.taskId)
    }
  }

  render() {
    const dockCardName = aoStore.member.memberId + '-bookmarks'
    let myBookmarks = aoStore.cardByName.get(dockCardName)
    if (!_.has(myBookmarks, 'grid.rows.0')) {
      console.log('no bookmarks to display')
      return null
    }
    console.log('rendering dock. card is ', myBookmarks)
    console.log('taskId is ', myBookmarks.taskId)
    return (
      <div id={'dock'}>
        <AoGrid taskId={myBookmarks.taskId} />
      </div>
    )
  }
}
