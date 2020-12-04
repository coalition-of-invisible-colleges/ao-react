import * as React from 'react'
import aoStore from '../client/store'
import api from '../client/api'
import { Redirect } from 'react-router-dom'

export default async function AoMember() {
	const [hubId, setHubId] = React.useState()

	React.useEffect(() => {
		let communityCard = aoStore.cardByName.get('community hub')
		if (!communityCard) {
			return await api.createCard('community hub').then(result => {
				const newTaskId = JSON.parse(res.text).event.taskId
				setHubId(newTaskId)
			})
		}
	}, [])
	if (hubId) {
		const redirect = <Redirect to={'/task/' + hubId} />
		return redirect
	}
}
