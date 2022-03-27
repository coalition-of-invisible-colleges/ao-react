import * as React from 'react'
import aoStore from '../client/store'
import api from '../client/api'
import { goInCard } from '../cardTypes'
import Boat from '../assets/images/boat.svg'
import RedBoat from '../assets/images/boatbtnselected.svg'
import _ from 'lodash'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/translucent.css'
import AoTip from './tip'
import { gloss } from '../semantics'
import config from '../../configuration.js'

export default function AoHopper(props: {}): JSX.Element {
	const [hop, setHop] = React.useState<number>(-1)
	const hopRef = React.useRef(hop)
	hopRef.current = hop

	const [text, setText] = React.useState('50')
	const [minutes, setMinutes] = React.useState(50)
	const minRef = React.useRef(minutes)
	minRef.current = minutes

	const [minutesError, setMinutesError] = React.useState(false)

	const [rangeText, setRangeText] = React.useState('')
	const [rangeMinutes, setRangeMinutes] = React.useState<number>()
	const rangeRef = React.useRef(rangeMinutes)
	rangeRef.current = rangeMinutes

	const [rangeMinutesError, setRangeMinutesError] = React.useState(false)

	const [nextHop, setNextHop] = React.useState<NodeJS.Timeout>()
	const nextRef = React.useRef(nextHop)
	nextRef.current = nextHop

	const [moveBoat, setMoveBoat] = React.useState(true)
	const moveBoatRef = React.useRef(moveBoat)
	moveBoatRef.current = moveBoat

	const [skipChecked, setSkipChecked] = React.useState(false)
	const skipCheckedRef = React.useRef(skipChecked)
	skipCheckedRef.current = skipChecked

	const [randomize, setRandomize] = React.useState(false)
	const randomizeRef = React.useRef(randomize)
	randomizeRef.current = randomize

	const [history, setHistory] = React.useState([])
	const historyRef = React.useRef(history)
	historyRef.current = history

	const [visitCard, setVisitCard] = React.useState(false)
	const visitRef = React.useRef(visitCard)
	visitRef.current = visitCard

	const [joinChatroom, setJoinChatroom] = React.useState(false)
	const joinRef = React.useRef(joinChatroom)
	joinRef.current = joinChatroom

	const [sendNotification, setSendNotification] = React.useState(false)
	const notifyRef = React.useRef(sendNotification)
	notifyRef.current = sendNotification

	const isHopping = !!nextHop

	React.useEffect(() => {
		return () => {
			clearTimeout(nextHop)
		}
	}, [])

	function getBookmarkTaskIds(): Array<string> {
		const dockCardName = aoStore.member.memberId + '-bookmarks'
		let myBookmarks = aoStore.cardByName.get(dockCardName)

		if (!myBookmarks || !myBookmarks.hasOwnProperty('pins')) {
			console.log('No bookmarks, cannot hop')
			return []
		}

		return myBookmarks.pins.map(pin => pin.taskId)
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

	function saveRangeMinutes(fromText = null) {
		if (text.length <= 0) {
			setRangeMinutesError(true)
			return
		}
		const newRangeMinutes = parseFloat(fromText || text)
		if (isNaN(newRangeMinutes) || newRangeMinutes === 0) {
			console.log('setting error')
			setRangeMinutesError(true)
			return
		}
		console.log('checkpoint1')
		if (newRangeMinutes === rangeMinutes) {
			console.log('no change, returning')
			return
		}
		console.log('checkpoint2')

		setRangeMinutes(newRangeMinutes)
		setRangeMinutesError(false)
		console.log('checkpoint3')
	}

	function hopTo(
		index,
		previousHop = null,
		forceHop = false,
		firstHop = false
	) {
		const safeIndex = index < 0 ? 0 : index
		setHop(safeIndex)
		const currentIsHopping = !!nextRef.current || firstHop
		const currentMoveBoat = moveBoatRef.current
		const currentRandomize = randomizeRef.current
		const currentVisitCard = visitRef.current
		const currentJoinChatroom = joinRef.current
		const currentSendNotification = notifyRef.current

		const bookmarkTaskIds = getBookmarkTaskIds()
		console.log('hop var is', hop)
		const currentHop = previousHop ? previousHop : hop >= 0 ? hop : 0
		const currentHistory = historyRef.current
		if (currentRandomize && bookmarkTaskIds[currentHop]) {
			setHistory(currentHistory.concat(bookmarkTaskIds[currentHop]))
		}

		const destinationTaskId = bookmarkTaskIds[safeIndex]
		if (forceHop || (currentIsHopping && currentMoveBoat)) {
			console.log('hoppingvars are', {
				index: index,
				safeIndex: safeIndex,
				hop: hop,
				currentHop: currentHop,
				currentCard: aoStore.currentCard,
				currentTaskId: bookmarkTaskIds[currentHop],
				destinationTaskId: destinationTaskId,
			})
			if (aoStore.currentCard !== destinationTaskId) {
				const saveAsContext = !(
					aoStore.currentCard === bookmarkTaskIds[currentHop]
				)

				goInCard(destinationTaskId, false, saveAsContext)
				// aoStore.setGlobalRedirect(destinationTaskId)
			}
		}

		if (currentIsHopping && currentVisitCard) {
			const destinationCard = aoStore.hashMap.get(destinationTaskId)
			if (
				(destinationCard.showChatroom &&
					!destinationCard.avatars.some(
						avatar => avatar.memberId === aoStore.member.memberId
					)) ||
				(currentJoinChatroom && aoStore.currentChatroom !== destinationTaskId)
			) {
				api.visitCard(destinationTaskId, currentJoinChatroom)
			}

			if (
				currentJoinChatroom &&
				destinationCard.showChatroom &&
				aoStore.currentChatroom !== destinationTaskId
			) {
				aoStore.setCurrentChatroom(destinationTaskId)
			}
		}

		if (currentIsHopping && currentSendNotification && aoStore.member.phone) {
			api.hopped(bookmarkTaskIds[index])
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
		console.log('plusHop. hop is ', hop)
		let newHop = hop + 1
		console.log('newHop is ', newHop)
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

	function onChangeRangeText(event) {
		setRangeText(event.target.value)
		saveRangeMinutes(event.target.value)
	}

	function revertText() {
		setText(minutes.toString())
	}

	function startHopping() {
		let newHop: number = hop + 1

		if (newHop <= -1 || newHop >= getBookmarkTaskIds().length) {
			newHop = 0
		}

		if (randomize) {
			newHop = getNextRandomBookmark()
		} else if (skipChecked) {
			newHop = getNextUncheckedBookmark()
		}

		hopTo(newHop, undefined, true, true)
		planHop()
	}

	function planHop() {
		if (nextHop) {
			clearTimeout(nextHop)
			setNextHop(null)
		}

		const currentMinutes = minRef.current
		const currentRangeMinutes = rangeRef.current

		const range = currentRangeMinutes - currentMinutes
		const variance =
			currentRangeMinutes && currentRangeMinutes > 0
				? Math.floor(Math.random() * (range + 1))
				: 0
		console.log('variance is ', variance)
		const countdown = (currentMinutes + variance) * 1000 * 60
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

	function onVisitCardChange(event) {
		setVisitCard(event.target.checked)
	}

	function onJoinChatroomChange(event) {
		setJoinChatroom(event.target.checked)
	}

	function onSendNotificationChange(event) {
		setSendNotification(event.target.checked)
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
				<div style={{ position: 'relative' }}>
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
							placeholder="50"
							autoFocus
						/>{' '}
						to{' '}
						<input
							type="text"
							onChange={onChangeRangeText}
							onKeyDown={onKeyDown}
							value={rangeText}
							size={2}
							className={rangeMinutesError ? 'error' : undefined}
							onBlur={revertText}
							placeholder="60"
							autoFocus
						/>{' '}
						mins
					</div>
					<div className="options">
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
							<label className="option">
								<input
									type="checkbox"
									checked={visitCard}
									onChange={onVisitCardChange}
								/>
								Move avatar{' '}
								<AoTip
									text={`When you hop, you will publicly visit the ${gloss(
										'card'
									)}, moving your ${gloss(
										'avatar'
									)} there. The number of people visiting a card displays on the chatroom icon. Right now only ${gloss(
										'guild'
									)} cards have a place to move your avatar.`}
								/>
							</label>
							<label className="option" style={{ marginLeft: '1.5em' }}>
								<input
									type="checkbox"
									checked={joinChatroom}
									onChange={onJoinChatroomChange}
									disabled={!visitCard}
								/>
								Join {gloss('guild')} chatroom{' '}
								<AoTip
									text={`When you hop to a ${gloss(
										'guild'
									)}, you will join its chatroom, if it has one.`}
								/>
							</label>
							{config.signal && (
								<label className="option">
									<input
										type="checkbox"
										checked={sendNotification}
										onChange={onSendNotificationChange}
										disabled={!aoStore.member.phone}
									/>
									Signal alert{' '}
									<AoTip
										text={`When you hop, you will receive a signal notification containing the ${gloss(
											'guild'
										)} name or ${gloss(
											'card'
										)} text, and the text of its top priority.`}
									/>
								</label>
							)}
						</div>
					</div>
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
