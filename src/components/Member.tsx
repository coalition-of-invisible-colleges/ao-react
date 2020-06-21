import * as React from 'react'
import aoStore from '../client/store'
import { Redirect } from 'react-router-dom'

const AoMember: React.FunctionComponent<{}> = () => {
	return <Redirect to={'/task/' + aoStore.member.memberId} />
}

export default AoMember
