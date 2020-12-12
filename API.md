# AO API Documentation

This reference contains a complete list of planned [ao-react](https://github.com/coalition-of-invisible-colleges/ao-react/) 1.0 supported API calls. These are calls made by an AO client in a web browser such as ao-react (React client), [ao-3](https://github.com/AutonomousOrganization/ao-3) (Vue client), or any client which can correctly make well-formed calls to the server.

This API details the planned refactoring of the API; the current API is close to this but has not yet been refactored.

All API calls return the Promise of the REST request made to the server. This Promise, when it resolves, contains the result data, if any, from the request.

Parameters and and Examples have been omitted where there are no parameters and so the example is trivial.

API calls with a triple asterisk (\*\*\*) are reducible to another API call and therefore may be removed to clean up the API.

## createSession(user: string, pass: string)

Creates a new session, attempting to log a user in.

**Parameters:** `user` is the username of the user attempting to sign in. `pass` is their password (the API call will hash it before sending it to the server).

**Example:** `api.createSession('doge', 'wowsuchpassword')`

**See Also:**

## fetchState()

Fetches the entire state object from the server, including all cards on the server (but not their attachments). This is the bottleneck.

**Parameters:** None

**See Also:**

## nameAo(newName: string)

Renames the AO server.

**Parameters:** `newName` is the new name for the server.

**Example:** `newName('Home Media Center')`

**See Also:**

## setQuorum(quorum: number)

Sets the global quorum for votes for the AO server. This affects which proposals are marked as "Passed" in the Proposals box. It has no server-side effect.

**Parameters:** `quorum` is the new number of people required to sign a proposal for it to be considered passed on the server.

**Example:** `setQuorum(aoStore.members.length * Math.floor(0.6)) // set quorum to 60% of current population, rounded down`

**See Also:** createMember

## bark(taskId?: string)

Immediately announces your presence to other AO members on the same server.

Planned: Bark with a taskId to check-in to that card. When you visit the Community Hub or join a card's video call room, you also bark there so other members can know where you went and join you. Your avatar icon will be moved to the card where you bark and remain there until you bark somewhere else. Other users will also see a radar ping animation and hear a sound if they haven't muted sound effects.

**Parameters:** Optional `taskId` of the card where you are barking.

**Example:** `bark(aoStore.memberCard.taskId) // bark on your member card, i.e., "Go home"`

**See Also:** unmute

## mute()

Mutes sound effects and bark notifications displayed to the member. This sets a property in their account, so it will persist across logins and on multiple devices.

**See Also:** unmute

## unmute()

Unmutes sound effects and bark notifications displayed to the member.

**See Also:** mute

## createCard(name: string)

Creates a new card on the server, held by you. The card is timestamped. If the card already exists, nothing happens.

**Parameters:** `name` is the text of the card to create.

**Example:** createCard(aoStore.member.name + "'s secret stash") // create stash card for current user

**See Also:** findOrCreateCardInCard, createCardWithGrid, createResource, createMember

## findOrCreateCardInCard(name: string, inId: string, prioritized: boolean = false, color: string = blue', anonymous?: boolean)

If the card is already in the current card, it moves it to the top of the stack. A card can be in both the priorities the stack below the grid, if it is explicitly done using findOrCreateCardInCard. However, most clients make this difficult to do in the GUI, because having the same card in multiple places within another card can be confusing.

Cards match on their `.name` property. Cards match case-insensitively, so a card already exists called "My Card" and you called findOrCreateCardInCard with `name` of "my card", it will find the existing card and add it within card specified by `inId`.

**Parameters:** `name` is the name of the card to create. `inId` is the taskId of the card where the card will be placed or created. `prioritized` is whether the card will be in the prioritized cards above the grid (`true`), or the stack below the grid (`false`). `color` is the color of the new card to create. `anonymous`, if set to true, will create the card anonymously (note that anonymity is not yet supported, as there is no way to purge mutation history yet).

**Example:**

**See Also:** createCard

## emptyCard(taskId: string)

**Parameters:**

**Example:**

**See Also:**

## colorCard(taskId: string, color: string)

**Parameters:**

**Example:**

**See Also:**

## grabCard(taskId: string)

**Parameters:**

**Example:**

**See Also:**

## grabPile(taskId: string)

**Parameters:**

**Example:**

**See Also:**

## dropCard(taskId: string)

**Parameters:**

**Example:**

**See Also:**

## removeCards(taskIds: string[])

**Parameters:**

**Example:**

**See Also:**

## dropPile(taskId: string)

**Parameters:**

**Example:**

**See Also:**

## prioritizePile(inId: string)

**Parameters:**

**Example:**

**See Also:**

## refocusCard(taskId: string, inId: string)

**Parameters:**

**Example:**

**See Also:**

## refocusPile(taskId: string, inId: string)

**Parameters:**

**Example:**

**See Also:**

## completeCard(taskId: string)

**Parameters:**

**Example:**

**See Also:**

## uncheckCard(taskId: string)

**Parameters:**

**Example:**

**See Also:**

## purgeResource(resourceId: string)

**Parameters:**

**Example:**

**See Also:**

## activateMember(memberId: string)

**Parameters:**

**Example:**

**See Also:**

## deactivateMember(memberId: string)

**Parameters:**

**Example:**

**See Also:**

## resetPassword(memberId: string)

**Parameters:**

**Example:**

**See Also:**

## promoteMember(memberId: string)

**Parameters:**

**Example:**

**See Also:**

## banMember(memberId: string)

**Parameters:**

**Example:**

**See Also:**

## unbanMember(memberId: string)

**Parameters:**

**Example:**

**See Also:**

## purgeMember(memberId: string)

**Parameters:**

**Example:**

**See Also:**

## clockTime(seconds, taskId, date)

**Parameters:**

**Example:**

**See Also:**

## signCard(taskId: string, opinion = 1)

**Parameters:**

**Example:**

**See Also:**

## markSeen(taskId)

**Parameters:**

**Example:**

**See Also:**

## fetchMeme(memeHash: string)

**Parameters:**

**Example:**

**See Also:**

## downloadMeme(memeHash: string)

**Parameters:**

**Example:**

**See Also:**

## uploadMemes(formData)

**Parameters:**

**Example:**

**See Also:**

## discardCardFromCard(taskId: string, inId: string)

**Parameters:**

**Example:**

**See Also:**

## passCard(taskId: string, toMemberId: string)

**Parameters:**

**Example:**

**See Also:**

## swapCard(inId: string, taskId1: string, taskId2: string)

**Parameters:**

**Example:**

**See Also:**

## bumpCard(taskId: string, inId: string, direction: number)

**Parameters:**

**Example:**

**See Also:**

## prioritizeCard(taskId: string, inId: string, position: number = 0)

**Parameters:**

**Example:**

**See Also:**

## titleMissionCard(taskId: string, newTitle: string)

**Parameters:**

**Example:**

**See Also:**

## setCardProperty(taskId: string, property: string, value: number)

**Parameters:**

**Example:**

**See Also:**

## createResource(resourceId: string, name: string, charged: number, secret: string, trackStock: boolean)

**Parameters:**

**Example:**

**See Also:**

## useResource(resourceId: string, amount: number, charged: number, notes: string = '')

**Parameters:**

**Example:**

**See Also:**

## stockResource(resourceId: string, amount: number, paid: number, notes: string = '')

**Parameters:**

**Example:**

**See Also:**

## bookResource(taskId: string, startTime: number, endTime: number)

**Parameters:**

**Example:**

**See Also:**

## createMember(name: string, fob: string = '')

**Parameters:**

**Example:**

**See Also:**

## updateMemberField(field: string, newValue: string)

**Parameters:**

**Example:**

**See Also:**

## setTicker(fromCoin: string, toCoin: string, tickerListIndex: number)

**Parameters:**

**Example:**

**See Also:**

## resizeGrid(taskId: string, newHeight: number, newWidth: number)

**Parameters:**

**Example:**

**See Also:**

## createCardWithGrid(name: string, height: number, width: number)

**Parameters:**

**Example:**

**See Also:**

## addGridToCard(taskId: string, height: number, width: number)

**Parameters:**

**Example:**

**See Also:**

## pinCardToGrid(x: number, y: number, name: string, inId: string)

**Parameters:**

**Example:**

**See Also:**

## unpinCardFromGrid(x: number, y: number, inId: string)

**Parameters:**

**Example:**

**See Also:**
