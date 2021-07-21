import * as React from 'react'
import aoStore from '../client/store'
import { goInCard } from '../cards'
import Boat from '../assets/images/boat.svg'
import RedBoat from '../assets/images/boatbtnselected.svg'
import _ from 'lodash'

export default function AoHopper(props: {}): JSX.Element {
	const [hop, setHop] = React.useState<number>(-1)
	const [minutes, setMinutes] = React.useState<number>()
	const [text, setText] = React.useState('')
	const [editing, setEditing] = React.useState(false)
	const [nextHop, setNextHop] = React.useState<NodeJS.Timeout>()

	React.useEffect(() => {
		console.log('minutes changed')
		planHop()
	}, [minutes])

	function startEditing() {
		setEditing(true)
	}

	function stopEditing() {
		setEditing(false)
	}

	function saveMinutes(event) {
		stopEditing()
		if (text.length <= 0) {
			setMinutes(null)
			setHop(-1)
			clearTimeout(nextHop)
			setNextHop(null)
		} else {
			const newMinutes = parseFloat(text)
			setMinutes(newMinutes)
			if (hop < 0) {
				setHop(0)
			}
			hopNow()
		}
	}

	function onKeyDown(event) {
		if (event.key === 'Enter') {
			event.stopPropagation()
			saveMinutes(event)
		} else if (event.key === 'Escape') {
			event.stopPropagation()
			setEditing(false)
			setText('')
		}
	}

	function onChange(event) {
		setText(event.target.value)
	}

	function planHop() {
		console.log('Minutes is ', minutes)
		if (!minutes || !(minutes > 0)) {
			console.log('No interval set, cannot hop')
			return
		}

		if (nextHop) {
			clearTimeout(nextHop)
			setNextHop(null)
		}

		const countdown = minutes * 1000 * 60
		console.log('minutes is ', minutes, ' and coundown is ', countdown)
		const newHop = setTimeout(hopNow, countdown)
		setNextHop(newHop)
	}

	const minutesRef = React.useRef(hop)
	minutesRef.current = minutes

	const hopRef = React.useRef(hop)
	hopRef.current = hop

	function hopNow() {
		const currentMinutes = minutesRef.current
		if (currentMinutes <= 0) {
			clearTimeout(nextHop)
			setNextHop(null)
			return
		}

		const dockCardName = aoStore.member.memberId + '-bookmarks'
		let myBookmarks = aoStore.cardByName.get(dockCardName)

		if (!myBookmarks || !_.has(myBookmarks, 'grid.rows.0')) {
			console.log('No bookmarks, cannot hop')
			return
		}

		const bookmarkCards = myBookmarks.grid.rows[0]
		const cycleLength =
			Math.max(
				...Object.keys(myBookmarks.grid.rows[0]).map(str => parseInt(str, 10))
			) + 1
		const currentHop = hopRef.current
		const newHop =
			currentHop === -1 ? 0 : currentHop + 1 >= cycleLength ? 0 : currentHop + 1
		console.log(
			'hop is ',
			hop,
			'bookmarkCards is ',
			bookmarkCards,
			' newHop is',
			newHop
		)
		setHop(newHop)
		const doNotSaveAsContext = aoStore.currentCard === bookmarkCards[currentHop]
		goInCard(bookmarkCards[newHop], false, doNotSaveAsContext)
		aoStore.setGlobalRedirect(bookmarkCards[newHop])
		planHop()
	}

	function renderBoat(onClick) {
		console.log({ nextHop, hop })
		if (nextHop || hop >= 0) {
			return <img src={RedBoat} onClick={onClick} />
		}
		return <img src={Boat} onClick={onClick} className="inPort" />
	}

	const calcLeft = !minutes || !(minutes > 0) ? '0' : 5 * hop + 2.5 + 'em'

	if (editing) {
		return (
			<div id="hopper" style={{ left: calcLeft }}>
				{renderBoat(stopEditing)}
				<input
					type="text"
					onChange={onChange}
					onKeyDown={onKeyDown}
					value={text}
					size={3}
					autoFocus
				/>
				<button type="button" onClick={saveMinutes}>
					Hop
				</button>
			</div>
		)
	}

	return (
		<div id="hopper" style={{ left: calcLeft }}>
			{renderBoat(startEditing)}
		</div>
	)
}
