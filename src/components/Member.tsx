import * as React from 'react'
import aoStore from '../client/store'
import api from '../client/api'
import { Redirect } from 'react-router-dom'

export default function AoMember() {
	const [hubId, setHubId] = React.useState('')

	React.useEffect(() => {
		let communityCard = aoStore.cardByName.get('community hub')
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
	}, [])
	if (hubId) {
		const redirect = <Redirect to={'/task/' + hubId} />
		return redirect
	}
	return 'Loading Community Hub...'
}
