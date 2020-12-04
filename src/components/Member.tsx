import * as React from 'react'
import aoStore from '../client/store'
import api from '../client/api'
import { Redirect } from 'react-router-dom'

export default async function AoMember() {
	let communityCard = aoStore.cardByName.get('community hub')
	const redirect = <Redirect to={'/task/' + communityCard.taskId} />
	if (!communityCard) {
		return await api.createCard('community hub').then(() => redirect)
	}
	return redirect
}
