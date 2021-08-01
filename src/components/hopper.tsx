import * as React from 'react'
import aoStore from '../client/store'
import { goInCard } from '../cards'
import Boat from '../assets/images/boat.svg'
import RedBoat from '../assets/images/boatbtnselected.svg'
import _ from 'lodash'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/translucent.css'
import AoTip from './tip'

export default function AoHopper(props: {}): JSX.Element {
	const [hop, setHop] = React.useState<number>(-1)
	const [minutes, setMinutes] = React.useState(50)
	const [minutesError, setMinutesError] = React.useState(false)
	const [text, setText] = React.useState('50')
	const [nextHop, setNextHop] = React.useState<NodeJS.Timeout>()
	const [moveBoat, setMoveBoat] = React.useState(true)
	const [skipChecked, setSkipChecked] = React.useState(false)
	const [randomize, setRandomize] = React.useState(false)
	const [history, setHistory] = React.useState([])

	const isHopping = !!nextHop

	const hopRef = React.useRef(hop)
	hopRef.current = hop

	const nextRef = React.useRef(nextHop)
	nextRef.current = nextHop

	const moveBoatRef = React.useRef(moveBoat)
	moveBoatRef.current = moveBoat

	const skipCheckedRef = React.useRef(skipChecked)
	skipCheckedRef.current = skipChecked

	const randomizeRef = React.useRef(randomize)
	randomizeRef.current = randomize

	const historyRef = React.useRef(history)
	historyRef.current = history

	React.useEffect(() => {
		return () => {
			clearTimeout(nextHop)
		}
	}, [])

	function getBookmarkTaskIds(): Array<string> {
		const dockCardName = aoStore.member.memberId + '-bookmarks'
		let myBookmarks = aoStore.cardByName.get(dockCardName)

		if (!myBookmarks || !_.has(myBookmarks, 'grid.rows.0')) {
			console.log('No bookmarks, cannot hop')
			return []
		}

		return Object.values(myBookmarks.grid.rows[0])
	}

	function getFirstUncheckedBookmark() {
		const bookmarkTaskIds = getBookmarkTaskIds()
		let newHop = bookmarkTaskIds.findIndex(tId => {
			const card = aoStore.hashMap.get(tId)
			return card?.claimed?.indexOf(aoStore.member.memberId) < 0
		})
		if (newHop === -1) {
			return 0
		}
		return newHop
	}

	function getLastUncheckedBookmark() {
		const bookmarkTaskIds = getBookmarkTaskIds().reverse()
		let newHop = bookmarkTaskIds.findIndex(tId => {
			const card = aoStore.hashMap.get(tId)
			return card?.claimed?.indexOf(aoStore.member.memberId) < 0
		})
		if (newHop === -1) {
			return getBookmarkTaskIds().length - 1
		}
		return getBookmarkTaskIds().length - 1 - newHop
	}

	function getPreviousUncheckedBookmark() {
		const bookmarkTaskIds = getBookmarkTaskIds()
		for (
			let i = hop >= 0 ? hop - 1 : bookmarkTaskIds.length - 1;
			i != hop;
			i--
		) {
			let tId = bookmarkTaskIds[i]
			const card = aoStore.hashMap.get(tId)
			if (card?.claimed?.indexOf(aoStore.member.memberId) < 0) {
				return i
			}
			if (i <= 0) {
				i = bookmarkTaskIds.length - 1
			}
		}

		return hop - 1
	}

	function getNextUncheckedBookmark() {
		const bookmarkTaskIds = getBookmarkTaskIds()
		for (let i = hop >= 0 ? hop + 1 : 0; i != hop; i++) {
			let tId = bookmarkTaskIds[i]
			const card = aoStore.hashMap.get(tId)
			if (card?.claimed?.indexOf(aoStore.member.memberId) < 0) {
				return i
			}
			if (i >= bookmarkTaskIds.length) {
				i = 0
			}
		}

		return hop + 1
	}

	function getNextRandomBookmark() {
		const currentHop = hopRef.current
		const notCurrent = getBookmarkTaskIds().filter(tId => {
			return tId !== getBookmarkTaskIds()[currentHop]
		})
		const currentHistory = historyRef.current
		const currentSkipChecked = skipCheckedRef.current
		const onlyUnchecked = !currentSkipChecked
			? notCurrent
			: notCurrent.filter(tId => {
					const card = aoStore.hashMap.get(tId)
					// const hasIt = card.claimed?.find(aoStore.member.memberId) > 0
					if (
						card &&
						card.claimed?.some(tId => tId == aoStore.member.memberId)
					) {
						return false
					}
					return true
			  })
		let bookmarkTaskIds = onlyUnchecked.filter(tId => {
			return currentHistory.indexOf(tId) < 0
		})
		if (!bookmarkTaskIds || bookmarkTaskIds.length < 1) {
			if (getBookmarkTaskIds().length < 1) {
				return -1
			}
			bookmarkTaskIds = onlyUnchecked
			// Reset history
			const newHistory = [getBookmarkTaskIds()[currentHop]]
			setHistory(newHistory)
		}
		const randomIndex = Math.floor(Math.random() * bookmarkTaskIds.length)
		const randomTaskId = bookmarkTaskIds[randomIndex]
		const foundIndex = getBookmarkTaskIds().indexOf(randomTaskId)

		return foundIndex
	}

	function saveMinutes(fromText = null) {
		if (text.length <= 0) {
			setMinutesError(true)
			return
		}
		const newMinutes = parseFloat(fromText || text)
		if (isNaN(newMinutes) || newMinutes === 0) {
			console.log('setting error')
			setMinutesError(true)
			return
		}
		console.log('checkpoint1')
		if (newMinutes === minutes) {
			console.log('no change, returning')
			return
		}
		console.log('checkpoint2')

		setMinutes(newMinutes)
		setMinutesError(false)
		console.log('checkpoint3')
	}

	function hopTo(index, previousHop = null, forceHop = false) {
		setHop(index)
		const isHoppingCurrent = !!nextRef.current
		const currentMoveBoat = moveBoatRef.current
		const currentRandomize = randomizeRef.current
		const bookmarkTaskIds = getBookmarkTaskIds()
		let currentHop = previousHop ? previousHop : hop
		const currentHistory = historyRef.current
		if (currentRandomize && bookmarkTaskIds[currentHop]) {
			setHistory(currentHistory.concat(bookmarkTaskIds[currentHop]))
		}

		if (forceHop || (isHoppingCurrent && currentMoveBoat)) {
			const doNotSaveAsContext =
				aoStore.currentCard === bookmarkTaskIds[currentHop]
			goInCard(bookmarkTaskIds[index], false, doNotSaveAsContext)
			aoStore.setGlobalRedirect(bookmarkTaskIds[index])
		}
	}

	function resetHop() {
		let newHop
		if (skipChecked) {
			newHop = getFirstUncheckedBookmark()
		} else if (isHopping) {
			newHop = 0
		} else {
			newHop = -1
		}
		hopTo(newHop)
		setHistory([])
	}

	function minusHop() {
		let newHop = hop - 1
		if (randomize) {
			newHop = getBookmarkTaskIds().indexOf(history.pop())
			if (newHop < 0) {
				newHop = hop - 1
			}
		} else if (skipChecked) {
			newHop = getPreviousUncheckedBookmark()
		}
		if (newHop < 0) {
			if (skipChecked) {
			} else {
				newHop = getBookmarkTaskIds().length - 1
			}
		}
		hopTo(newHop)
	}

	function plusHop() {
		let newHop = hop + 1
		if (randomize) {
			newHop = getNextRandomBookmark()
		} else if (skipChecked) {
			newHop = getNextUncheckedBookmark()
		}
		if (newHop >= getBookmarkTaskIds().length) {
			newHop = 0
		}
		hopTo(newHop, hop)
	}

	function onKeyDown(event) {
		if (event.key === 'Escape') {
			event.stopPropagation()
			revertText()
		}
	}

	function onChangeText(event) {
		setText(event.target.value)
		saveMinutes(event.target.value)
	}

	function revertText() {
		setText(minutes.toString())
	}

	function startHopping() {
		let newHop: number

		if (hop === -1) {
			newHop = 0
		}

		if (randomize) {
			newHop = getNextRandomBookmark()
		} else if (skipChecked) {
			newHop = getNextUncheckedBookmark()
		}

		hopTo(newHop, undefined, true)
		planHop()
	}

	function planHop() {
		if (nextHop) {
			clearTimeout(nextHop)
			setNextHop(null)
		}

		const countdown = minutes * 1000 * 60
		const newNextHop = setTimeout(hopNow, countdown)
		setNextHop(newNextHop)
	}

	function hopNow() {
		const bookmarkTaskIds = getBookmarkTaskIds()
		const cycleLength = bookmarkTaskIds.length
		const currentHop = hopRef.current
		const currentSkipChecked = skipCheckedRef.current
		const currentRandomize = randomizeRef.current
		let newHop

		if (currentRandomize) {
			newHop = getNextRandomBookmark()
			if (newHop === -1) {
				console.log('No unchecked cards, cannot hop')
				pauseHopping()
				return
			}
		} else {
			newHop =
				currentHop === -1
					? 0
					: currentHop + 1 >= cycleLength
					? 0
					: currentHop + 1

			if (currentSkipChecked) {
				let lookAheadCard = aoStore.hashMap.get(bookmarkTaskIds[newHop])
				while (
					!lookAheadCard ||
					lookAheadCard?.claimed?.indexOf(aoStore.member.memberId) >= 0
				) {
					newHop = newHop + 1 >= cycleLength ? 0 : newHop + 1

					if (newHop === currentHop) {
						console.log('No unchecked cards, cannot hop')
						pauseHopping()
						return
					}

					lookAheadCard = aoStore.hashMap.get(bookmarkTaskIds[newHop])
				}
			}
		}

		hopTo(newHop, currentHop)
		planHop()
	}

	function pauseHopping() {
		clearTimeout(nextHop)
		setNextHop(null)
	}

	function onMoveBoatChange(event) {
		setMoveBoat(event.target.checked)
	}

	function onSkipCheckedChange(event) {
		setSkipChecked(event.target.checked)
	}

	function onRandomizeChange(event) {
		setRandomize(event.target.checked)
	}

	function renderBoat() {
		if (isHopping) {
			return <img src={RedBoat} onClick={pauseHopping} />
		}
		return <img src={Boat} onClick={startHopping} className="inPort" />
	}

	function renderSettings() {
		const sameMinutes = minutes.toString() == text
		return (
			<div className="popupPanel hopperPanel">
				<h3>Hopper</h3>
				<p>
					Automatically hop between cards.{' '}
					<AoTip
						text="Click the Play/Pause button to start the boat and automatically hop
					between the cards on the dock. Set the number of minutes between
					hops and other settings here. Useful for productivity sprints, ambient
					demo display, visiting chatrooms, holding online parties, or a quick
					overview of your cards."
					/>
				</p>
				<div>
					<div>
						Hop every{' '}
						<input
							type="text"
							onChange={onChangeText}
							onKeyDown={onKeyDown}
							value={text}
							size={2}
							className={minutesError ? 'error' : undefined}
							onBlur={revertText}
							autoFocus
						/>{' '}
						mins
					</div>
					<label className="option first">
						<input
							type="checkbox"
							checked={moveBoat}
							onChange={onMoveBoatChange}
						/>
						Navigate on hop
					</label>
					<label className="option">
						<input
							type="checkbox"
							checked={skipChecked}
							onChange={onSkipCheckedChange}
						/>
						Skip checked
					</label>
					<label className="option">
						<input
							type="checkbox"
							checked={randomize}
							onChange={onRandomizeChange}
						/>
						Randomize order
					</label>
					<div>
						<button
							type="button"
							className="action inline playPause"
							onClick={resetHop}>
							&#x23EE;
						</button>
						<button
							type="button"
							className="action inline playPause"
							onClick={minusHop}>
							&#x23EA;
						</button>
						<button
							type="button"
							className="action inline playPause"
							onClick={isHopping ? pauseHopping : startHopping}>
							{isHopping ? <span>&#x23F8;</span> : <span>&#9654;</span>}
						</button>
						<button
							type="button"
							className="action inline playPause"
							onClick={plusHop}>
							&#x23E9;
						</button>
					</div>
				</div>
			</div>
		)
	}

	const calcLeft = hop === -1 ? '0' : 5 * hop + 2.5 + 'em'

	const renderedSettings = renderSettings()

	// Note: appending the Tippy to the root element makes it display
	// correctly on top of other hud elements, but then it doesn't move
	// smoothly with the #hopper element anymore
	return (
		<div id="hopper" style={{ left: calcLeft }}>
			<Tippy
				zIndex={4}
				theme="translucent"
				content={renderedSettings}
				interactive={true}
				maxWidth="none"
				placement="top"
				appendTo={document.getElementById('root')}
				delay={[475, 200]}>
				{renderBoat()}
			</Tippy>
		</div>
	)
}
