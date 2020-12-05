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
				setHubId(newTaskId)
			})
		} else {
			setHubId(communityCard.taskId)
		}
	}, [])
	if (hubId) {
		const redirect = <Redirect to={'/task/' + hubId} />
		return redirect
	}
	return 'Creating Community Hub, please refresh page if it does not appear.'
}
