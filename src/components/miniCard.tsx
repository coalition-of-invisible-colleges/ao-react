import * as React from 'react'
import { observer } from 'mobx-react'
import { Redirect } from 'react-router-dom'
import aoStore, { Task } from '../client/store'
import api from '../client/api'
import { ObservableMap } from 'mobx'
import { delay, cancelablePromise, noop } from '../utils'

import AoPaper from './paper'
import Markdown from 'markdown-to-jsx'
import { useDropzone } from 'react-dropzone'

interface MiniCardProps {
	taskId: string
}

const AoMiniCard: React.FunctionComponent<MiniCardProps> = observer(
	({ taskId }) => {
		const card: Task = aoStore.hashMap.get(taskId)
		return (
			<div className={'miniCard'}>
				{card.color ? <AoPaper taskId={card.taskId} /> : ''}
				<div className="miniCardSummary">
					{card.seen.some(t => {
						return t.memberId === aoStore.member.memberId
					}) ? (
						''
					) : (
						<div className={'seen'} />
					)}
					{card.claimed.indexOf(aoStore.member.memberId) >= 0 ? (
						<img
							className="miniCheckbox"
							src="../assets/images/completed.svg"
						/>
					) : null}
					{card.completeValue > 0 ? (
						<span className="miniValue">{card.completeValue}</span>
					) : null}
				</div>
				<Markdown options={{ forceBlock: true }}>{card.name}</Markdown>
			</div>
		)
	}
)

export default AoMiniCard
