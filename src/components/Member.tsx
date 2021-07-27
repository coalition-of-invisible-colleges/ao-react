import * as React from 'react'
import aoStore from '../client/store'
import api from '../client/api'
import { Redirect } from 'react-router-dom'

export default function AoMember() {
	const [hubId, setHubId] = React.useState('')

	// the server should ensure that the community card exists, and is sent with the initial state
	React.useEffect(() => {
		let communityCard = aoStore.communityHubTaskItem;
		if (
			!communityCard ||
			!communityCard.hasOwnProperty('taskId') ||
			!communityCard.taskId
		) {
			api.createCard('community hub').then(result => {
				const newTaskId = JSON.parse(result.text).event.taskId
				aoStore.setCurrentCard(newTaskId)
				setHubId(newTaskId)
			})
		} else {
			aoStore.setCurrentCard(communityCard.taskId)
			setHubId(communityCard.taskId)
		}
	}, [aoStore.communityHubTaskItem])
	if (hubId) {
		const redirect = <Redirect to={'/task/' + hubId} />
		return redirect
	}
	return <div>'Loading Community Hub...'</div>
}
