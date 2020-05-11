import * as React from 'react'
import { useState } from 'react'
import { observer } from 'mobx-react'
import aoStore from '../client/store'
import { Switch, Route, Redirect, useRouteMatch } from 'react-router-dom'

const AoMember: React.FunctionComponent<{}> = () => {
	return <Redirect to={'/task/' + aoStore.member.memberId} />
}

export default AoMember
