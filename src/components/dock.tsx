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
      console.log('missing card')

      api
        .createCard(dockCardName)
        .then(() => {
          const taskId = JSON.parse(res.text).event.taskId
          api.addGridToCard(taskId, 1, 6)
        })
        .then(() => {
          api.pinCardToGrid(0, 0, 'drop bookmarks here', taskId)
        })
    } else if (!myBookmarks.hasOwnProperty('grid')) {
      console.log('missing grid')

      api.addGridToCard(myBookmarks.taskId, 1, 6).then(() => {
        api.pinCardToGrid(0, 0, 'drop bookmarks here', myBookmarks.taskId)
      })
    } else if (!_.has(myBookmarks, 'grid.rows.0')) {
      console.log('missing row')

      api.pinCardToGrid(0, 0, 'drop bookmarks here', myBookmarks.taskId)
    }
    console.log('exists')
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
