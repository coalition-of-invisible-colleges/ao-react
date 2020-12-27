# AO API Documentation

This reference contains a complete list of planned [ao-react](https://github.com/coalition-of-invisible-colleges/ao-react/) 1.0 supported API calls. These are calls made by an AO client in a web browser such as ao-react (React client), [ao-3](https://github.com/AutonomousOrganization/ao-3) (Vue client), or any client which can correctly make well-formed calls to the server.

This API details the planned refactoring of the API; the current API is close to this but has not yet been refactored.

All API calls return the Promise of the REST request made to the server. This Promise, when it resolves, contains the result data, if any, from the request.

Parameters and and Examples have been omitted where there are no parameters and so the example is trivial.

API calls with a triple asterisk (\*\*\*) are reducible to another API call and therefore may be removed to clean up the API.

## Session-handling methods

These methods allow a user to log in, fetch the state of the server, and log out.

### createSession(user: string, pass: string)

Creates a new session, attempting to log a user in.

**Parameters:** `user` is the username of the user attempting to sign in. `pass` is their password (the API call will hash it before sending it to the server).

**Example:** `api.createSession('doge', 'wowsuchpassword')`

**See Also:**

### fetchState()

Fetches the entire state object from the server, including all cards on the server (but not their attachments). This is the bottleneck.

**Parameters:** None

**See Also:**

## AO methods

These methods are for handling the server as a whole.

### nameAo(newName: string)

Renames the AO server.

**Parameters:** `newName` is the new name for the server.

**Example:** `newName('Home Media Center')`

**See Also:**

### connectToAo(address: string, secret: string)

Adds another AO to this AO's list of peer connected AOs, and attempts to connect over tor.

**Parameters:** `address` is the tor hostname (address) of the other AO server (including '.onion'). `secret` is the secret string provided on the p2p connect tab of the Bull panel of the other AO server.

**Example:**

**See Also:**

### linkCardOnAo(taskId: string, address: string)

Links the given card to the same card on another AO server. The contents of linked cards syncs both ways across AOs every few minutes (add only, no delete).

**Parameters:** `taskId` is the taskId of the card. `address` is the tor address of the other server.

**Example:** `newName('Home Media Center')`

**See Also:**

### setQuorum(quorum: number)

Sets the global quorum for votes for the AO server. This affects which proposals are marked as "Passed" in the Proposals box. It has no server-side effect.

**Parameters:** `quorum` is the new number of people required to sign a proposal for it to be considered passed on the server.

**Example:** `setQuorum(aoStore.members.length * Math.floor(0.6)) // set quorum to 60% of current population, rounded down`

**See Also:** createMember

## Member methods

These methods are used to handle member accounts on a server.

### createMember(name: string, fob: string = '')

Create a new member.

**Parameters:** `name` is a name for the new member. Member creation will fail if a member with the specified name already exists. `fob` is an option RFID fob code, to link the account with a fob.

**Example:**

**See Also:**

### purgeMember(memberId: string)

Deletes a member from the AO server (requires three senpais to invoke).

Senpai function: Only a senpai may use this function on another member.

Voting function: Three senpais must call the function before it activates..

**Parameters:** `memberId` is the `.memberId` of the member to delete.

**Example:**

**See Also:** createMember

### updateMemberField(field: string, newValue: string)

Sets the specified field of a member's account to the specified value. This can be used to set arbitrary values and extend an AO server with new features, without having to add new mutations.

**Parameters:** `field` is the name of the field. `newValue` is a value to replace the previous value of the member's `.field` property.

**Example:** updateMemberField('banned', true) is a trick to ban a member without having to vote on it.

**See Also:**

### bark(taskId?: string)

Immediately announces your presence to other AO members on the same server.

Planned: Bark with a taskId to check-in to that card. When you visit the Community Hub or join a card's video call room, you also bark there so other members can know where you went and join you. Your avatar icon will be moved to the card where you bark and remain there until you bark somewhere else. Other users will also see a radar ping animation and hear a sound if they haven't muted sound effects.

**Parameters:** Optional `taskId` of the card where you are barking.

**Example:** `bark(aoStore.memberCard.taskId) // bark on your member card, i.e., "Go home"`

**See Also:** unmute

### mute()\*\*\*

Mutes sound effects and bark notifications displayed to the member. This sets a property in their account, so it will persist across logins and on multiple devices.

**See Also:** unmute

### unmute()\*\*\*

Unmutes sound effects and bark notifications displayed to the member.

**See Also:** mute

### activateMember(memberId: string)\*\*\*

Sets a member's membership status to active.

**Parameters:** `memberId` is the `.memberId` of the member to re-activate.

**Example:**

**See Also:** deactivateMember

### deactivateMember(memberId: string)\*\*\*

Sets a member's membership status to inactive.

**Parameters:** `memberId` is the `.memberId` of the member to deactivate.

**Example:**

**See Also:** activateMember

### resetPassword(memberId: string)

Resets the member's password (requires three senpais to invoke).

Senpai function: Only a senpai may use this function on another member.

Voting function: Three senpais must call the function before it activates.

**Parameters:** `memberId` is the `.memberId` of the member whose password will be reset.

**Example:**

**See Also:** updateMemberField

### promoteMember(memberId: string)

Promotes the specified member above you in the list of members. This list can be seen in the members popup under "Order". Unless modified with `promoteMember`, the order of this list is the order that members were created in.

**Parameters:** `memberId` is the `.memberId` of a member currently below you in the list who will be moved above you.

**Example:**

**See Also:** grabCard (how you vouch for other members)

### banMember(memberId: string)

Sets a members ban status to true (requires three senpais to invoke).

Senpai function: Only a senpai may use this function on another member.

Voting function: Three senpais must call the function before it activates.

**Parameters:** `memberId` is the `.memberId` of the member to ban.

**Example:**

**See Also:** unbanMember

### unbanMember(memberId: string)

Unbans a member (requires three senpais to invoke).

Senpai function: Only a senpai may use this function on another member.

Voting function: Three senpais must call the function before it activates.

**Parameters:** `memberId` is the `.memberId` of the member to unban.

**Example:**

**See Also:** banMember

### setTicker(fromCoin: string, toCoin: string, tickerListIndex: number)\*\*\*

Adds a crypto ticker to a member's list of crypto tickers. These display on the right side of the screen when the member is logged in. The exchange rate of the `fromCoin` to the `toCoin` is display.

**Parameters:** `fromCoin` is the abbreviation (such as USD or BTC) of a currency, or the address (0x...) of an ERC-20 smart contract. `toCoin` is the same. `tickerListIndex` is the index number to replace in the list of tickers.

**Example:**

**See Also:**

## Card methods

These methods are for creating and working with cards on the AO.

### createCard(name: string, anonymous?: boolean)

Creates a new card on the server, held by you. The card is timestamped. If the card already exists, nothing happens. The new card will be placed in the `.subTasks` of your member card (unless anonymous).

**Parameters:** `name` is the text of the card to create. `anonymous`, if `true`, will cause the card to be created anonymously, without creator info and without putting the card in your member card.

**Example:** createCard(aoStore.member.name + "'s secret stash") // create stash card for current user

**See Also:** findOrCreateCardInCard, createCardWithGrid, createResource, createMember

### findOrCreateCardInCard(name: string, inId: string, prioritized: boolean = false, color: string = blue', anonymous?: boolean)

If the card is already in the current card, it moves it to the top of the stack. A card can be in both the priorities the stack below the grid, if it is explicitly done using findOrCreateCardInCard. However, most clients make this difficult to do in the GUI, because having the same card in multiple places within another card can be confusing.

Cards match on their `.name` property. Cards match case-insensitively, so a card already exists called "My Card" and you called findOrCreateCardInCard with `name` of "my card", it will find the existing card and add it within card specified by `inId`.

**Parameters:** `name` is the name of the card to create. `inId` is the taskId of the card where the card will be placed or created. `prioritized` is whether the card will be in the prioritized cards above the grid (`true`), or the stack below the grid (`false`). `color` is the color of the new card to create. `anonymous`, if set to true, will create the card anonymously (note that anonymity is not yet supported, as there is no way to purge mutation history yet).

**Example:**

**See Also:** createCard

### emptyCard(taskId: string)

Empties the `.priorities` and `.subTasks` lists of cards within the specified card. The `.parents` field of other cards will be correctly updated, if they are removed from this card.

This could be extended to also clear the grid, but currently doesn't for performance reasons.

**Parameters:** `taskId` is the `.taskId` of the card to empty.

**Example:**

**See Also:**

### colorCard(taskId: string, color: string)\*\*\*

Changes the color of a card.

**Parameters:** `taskId` is the taskId of the card that will have its `.color` changed. `color` is the new color and is normally "blue", "red", "yellow", "green", "purple", or "black".

**Example:**

**See Also:**

### grabCard(taskId: string)

Grabs a or "moons" a card to your collection. Grabbing a card lights up the moon on the card. If a card is held by at least one member on the server, it cannot be deleted.

Which members are holding (or "hodling") which cards is separate from which cards are in other cards.

**Parameters:** `taskId` is the `.taskId` of the card to grab.

**Example:**

**See Also:** findOrCreateCardInCard

### grabPile(taskId: string)

Grabs the specified card and all the cards in that card, recursively, to your collection. This includes cards in `.priorities`, `.subTasks`, and `.completed`, but not currently the grid.

**Parameters:** `taskId` is the `.taskId` of the parent card of all the cards that will be grabbed.

**Example:**

**See Also:** dropPile, pilePrioritized, pileRefocused

### dropCard(taskId: string)

Drops a card from your collection.

**Parameters:** `taskId` is the `.taskId` of the card to drop.

**Example:**

**See Also:** dropPile

### removeCards(taskIds: string[])

Deletes the specified cards from the server. Cards can be deleted even if they are in someone's collection (maybe this should change).

**Parameters:** `taskIds` is an array of taskIds of cards to delete.

**Example:**

**See Also:**

### dropPile(taskId: string)

Drops the specified card and all the cards in it, recursively. This includes cards in `.priorities`, `.subTasks`, and `.completed`, but not currently the grid.

**Parameters:** `taskId` is the `.taskId` of the parent card of all the cards that will be dropped.

**Example:**

**See Also:** dropCard

### prioritizePile(inId: string)

Prioritizes all of the cards in the pile below the grid (to above the grid).

**Parameters:** `inId` is the `.taskId` of the card in which to prioritize all the `.subTasks`.

**Example:**

**See Also:** prioritizeCard

### refocusCard(taskId: string, inId: string)

Deprioritizes (refocuses) the card within another card, moving it from the `.priorities` above the grid to the `.subTasks` below the grid.

**Parameters:** `taskId` is the `.taskId` of the card to be deprioritized. `inId` is the card within which to deprioritize it.

**Example:**

**See Also:** refocusPile

### refocusPile(inId: string)

Refocuses (deprioritizes) all of the priorities in the specified card, moving them from above to below the grid.

**Parameters:** `inId` is the `.taskId` of the card within which to dump all the priorities.

**Example:** refocusPile(aoStore.member.memberId) // dump all member priorities

**See Also:** refocusCard

### completeCard(taskId: string)

Checks off a card, marking it as completed and claiming its bounty, if any. Each member can check off the same card.

**Parameters:** `taskId` is the `.taskId` of the card to check off and claim.

**Example:**

**See Also:**

### uncheckCard(taskId: string)

Unchecks a card. (Bounties previously claimed will NOT be reversed.)

**Parameters:** `taskId` is the `.taskId` of the card to uncheck.

**Example:**

**See Also:**

### clockTime(seconds, taskId, date)

Clocks time on the server. This will be replaced by more realtime API calls that clock in and out with the server.

**Parameters:**

**Example:**

**See Also:**

### signCard(taskId: string, opinion = 1)

Signs a card with the specified opinion.

**Parameters:** `taskId` is the `.taskId` of the card to sign. `opinion` is 1 for For/Agree/Support, 0 for "Decline to Sign", with -1 planned as Against. `opinion` can also be a string, so an opinin can be written-in, or the field used for more complex functionality, as is the case with the senpai voting API calls.

**Example:**

**See Also:** resetPassword, banMember, unbanMember, purgeMember

### markSeen(taskId)

Marks a card as read.

**Parameters:** `taskId` is the `.taskId` of the card to mark as read.

**Example:**

**See Also:**

### discardCardFromCard(taskId: string, inId: string)

Removes a card from within the specified parent card. If prioritized, the card will not be removed but just dropped below the grid to the `.subTasks` pile. If the card was checked, it will not be discarded, but will instead move to `.completed`.

**Parameters:** `taskId` is the `.taskId` of the card to remove. `inId` is the `.taskId` of the card from which to remove the card specified by the first argument.

**Example:**

**See Also:** findOrCreateCardInCard

### passCard(taskId: string, toMemberId: string)

Sends a card to another member on the same AO server. The card will show up in their inbox as a "gift". They can accept the card with grabCard or reject it with dropCard or discardCardFromCard.

**Parameters:** `taskId` is the `.taskId` of the card to send. `toMemberId` is the `.memberId` of the member to whom to send the card.

**Example:**

**See Also:** grabCard, discardCardFromCard

### swapCard(inId: string, taskId1: string, taskId2: string)

Swaps two cards wherever they are (except the grid) within another card.

**Parameters:** `inId` is the `.taskId`

**Example:**

**See Also:** bumpCard

### bumpCard(taskId: string, inId: string, direction: number)

Moves a card from the top (front) of the subTasks to the bottom (back), or the bottom (back) to the top (front).

**Parameters:** `taskId` is the `.taskId` of the card to move. `inId` is the `.taskId` of the parent card. `direction` is 1 to move the card forward, or -1 to move it backward.

**Example:**

**See Also:** swapCard

### prioritizeCard(taskId: string, inId: string, position: number = 0)

Moves a card from `.subTasks` to `.priorities` within another card.

**Parameters:** `taskId` is the `.taskId` of the card to prioritize. `inId` is the `.taskId` of the card within which to prioritize the card. position is currently unused, but is intended to allow drag-and-drop of priorities to specific indices within the priorities list.

**Example:**

**See Also:**

### titleMissionCard(taskId: string, newTitle: string)\*\*\*

Sets a mission title for the card, upgrading the card to a mission and listing it in the Missions Index.

**Parameters:** `taskId` is the `.taskId` of the card to set a mission title on. `newTitle` is a new mission title for the card.

**Example:**

**See Also:**

### visitCard(taskId: string, inChat: boolean)\*\*\*

Moves your avatar to a card, so others can see where you are.

**Parameters:** `taskId` is the `.taskId` of the card where your avatar will be moved. `inChat` is whether you are in the chatroom (true) or visiting the card without being in the video chatroom (false).

**Example:**

**See Also:**

### setCardProperty(taskId: string, property: string, value: any)

Sets the specified property to the specified value on a card. This is the card equivalent of updateMemberField() (named "property" instead of "field" to distinguish cards from members).

**Parameters:** `taskId` is the `.taskId` of the card to modify. `property` is the name of the property to update. `value` is the new value of the property.

**Example:** setCardProperty(aoStore.memberCard.taskId, 'color', 'red') is equivalent to colorCard(aoStore.memberCard.taskId, 'red')

**See Also:** updateMemberField

## Card grid methods

These methods are for working with grids of cards on the AO, which are themselves part of a card.

### createCardWithGrid(name: string, height: number, width: number)

Creates a new card with a grid of the specified size.

**Parameters:** `name` is the text of the new card. `height` and `width` are the dimension of the grid to create.

**Example:** createCardWithGrid("chess", 8, 8) // make a chessboard

**See Also:**

### addGridToCard(taskId: string, height: number, width: number)

Adds a grid to an existing card. If the card already has a grid, it will be RESET TO BLANK (change this).

**Parameters:** `taskId` is the `.taskId` of the card to add a grid to. `height` and `width` are the starting size of the new grid.

**Example:**

**See Also:**

### resizeGrid(taskId: string, newHeight: number, newWidth: number)

Resize the grid on a card. If the new size is smaller than the old size, any cards that get dumped off the side will fall down into the `.subTasks` of the resized card, rather than being lost.

**Parameters:** `taskId` is the `.taskId` of the card with the grid to resize. `newHeight` and `newWidth` are the new height and width to resize the grid to.

**Example:**

**See Also:**

### removeGridFromCard(taskId: string)

Deletes the grid from a card, dumping all the cards that were on the grid into `.subTasks`.

**Parameters:** `taskId` is the `.taskId` of the card that will have its grid removed.

**Example:**

**See Also:**

### pinCardToGrid(x: number, y: number, name: string, inId: string)

Pins the card to the grid of another card at the specified coordinates.

**Parameters:** `x` and `y` are coordinates specifying the column (leftmost = 0) and row (topmost = 0), respectively, of the a square on the grid. `name` is the text of the card to pin there. `inId` is the `.taskId` of the card in which to pin the other card.

**Example:**

**See Also:**

### unpinCardFromGrid(x: number, y: number, inId: string)

Unpins a card from a grid, dropping it below to the `.subTasks`.

**Parameters:** `x` and `y` are the coordinates of the card to unpin. `inId` is the `.taskId` of the card within which to unpin the card.

**Example:**

**See Also:**

## Attachment methods

These methods are for working with card attachments.

### fetchMeme(memeHash: string)

Gets an attachment from the server for display on a webpage.

**Parameters:** `memeHash` is the hash of the attachment file.

**Example:**

**See Also:** downloadMeme, uploadMemes

### downloadMeme(memeHash: string)

Downloads an attachment using the Save As... dialog.

**Parameters:** `memeHash` is the hash of the attachment file.

**Example:**

**See Also:** fetchMeme, uploadMemes

### uploadMemes(formData)

Uploads the attachments in the form data.

**Parameters:** `formData` is form data with one or more attached files.

**Example:**

**See Also:**

## Resource methods

These methods are for connecting, using, and restocking hardware resources.

### createResource(resourceId: string, name: string, charged: number, secret: string, trackStock: boolean)

Creates a new resource on the server.

**Parameters:** `resourceId` is a new UUID for the resource. `name` is a new name for the resource. `charged` is how many points will be charged each time the resource is used. `secret` is a secret string for the resource. `trackStack` is a boolean specifying whether or not the resource tracks finite stock (e.g., for a vending machine).

**Example:**

**See Also:** purgeResource, useResource

### purgeResource(resourceId: string)

Deletes a resource from the server. A deleted resource must be re-added using the pi repo's iniatilize.js script before it can be used again.

**Parameters:** `resourceId` is the `.resourceId` of the resource to delete.

**Example:**

**See Also:**

### useResource(resourceId: string, amount: number, charged: number, notes: string = '')

Uses the resource, charging you the resouce's `.charged` and triggering the resource to activate. Only active members with enough points can use a resource.

**Parameters:** `resourceId` is the `.resourceId` of the resource to use. `amount` is the number of units to use. `charged` is how many to charge per unit. `notes` is a field for specifying additional information the hardware resource might need, such as which hopper/flavor to activate on a vending machine.

**Example:**

**See Also:**

### stockResource(resourceId: string, amount: number, paid: number, notes: string = '')

Increases the stock on a resource.

**Parameters:** `resourceId` is the `.resourceId` of the resource to restock. `amount` is how much the stock will be increased. `paid` is how much the member doing the restocking paid for the supplies being restocked into the machine (?). `notes` is a field for additional information that may be needed by certain hardware, for example which hopper was restocked on a vending machine.

**Example:**

**See Also:**

### bookResource(taskId: string, startTime: number, endTime: number)

Books a resource as an event. (Every resource has an associated card which can be booked.)

**Parameters:** `taskId` is the `.taskId` of the card or resource to be booked. `startTime` and `endTime` are the start and end time of the event (Unix timestamps?).

**Example:**

**See Also:**

# AO Data Model Documentation

The AO has a few basic data types. The exact type definitions are in store.ts. This document describes conceptually how the different sorts of data objects that the AO handles fit together.

Array and list are used as synonyms.

## Cards

"Everything is a card". A card is a Task object (as defined by the Task class in store.ts). A blank card has:

- `.taskId`: A randomly-generated UUID to identify the card uniquely (will be deprecated in favor of hash).

- `.name`: The text of the card.

- `.color`: Every card can be 'red', 'yellow', 'blue', 'green', 'purple', or 'black'; color has no effect yet and is just for appearance.

- `.hash`: The hash of the text of the card.

- `.created`: The Unix timestamp when the card was created.

### Grabbing cards to your deck

Each member has a deck of cards, also known as their collection, library, or moonbag. To grab a card and add it to your collection, click the moon (aka coin) icon on the card. This grabs (aka "moons" or "coins") the card.

Cards have the following property that allows them to be grabbed:

- `.deck`: An array of memberIds who have grabbed the card.

So, a member's list of cards is not stored in their Member object. Instead, every card keeps track of who is hodling it. This is for efficiency.

### Cards in other cards

There are five ways that cards can point or link to other cards. In the GUI, this is usually represented as cards being stored within other cards, to create a physical metaphor of paper being kept in different locations.

Just like the basic card properties above, each of these is a property a card can have. Each of these lists of other cards is an Array of taskIds which refer to other cards (Task objects). All blank cards are created with an empty Array for each of these, but in your code you should not assume that a card will be created correctly and double-check before attempting to access the `.priorities` or other lists of subcards on a card.

- `.priorities`: A list of taskIds of cards which have been prioritized within the current card. Priorities appear above the grid with a checkmark and (planned) timeclock, presented as immediately actionable.

- `.grid`: A Grid object which has a `.height` and `.width` property as well as a third `.rows` property. `.rows` is an Object that is indexed like an array. Each key contains another Object which is the column; each index of the column contains a taskId, if any, of the card contained in that square of the grid.

- `.subTasks`: A list of taskIds of cards stored within the current card. This is the "main stack" below the grid within each card.

- `.completed`: A list of taskIds of cards which were completed (checked off) and then discarded from within this card. Completed cards are not discarded but instead saved in this list as a history of accomplishments. This is displayed as checkmarks in a leaderboard below the main stack in a card.

- `.parents`: This is a list of taskIds of the cards this card is within. Any card which is in the `.priorities`, `.subTasks`, or the grid of another card is considered within that card. The parents list is kept perfectly updated and in sync with where cards are actually located; however there might still be bugs in this. The list of parents a card has can be seen by hovering over its moon in the GUI.

Cards being within other cards is completely separate from whether a card is in a member's deck or not. The Archive feature is designed to deal with this discrepency by returning "lost cards" that are grabbed.

### Passing cards to other members

Using the Gifts panel on the left edge of the screen or the Bird icon in the top left corner of every card, members can give (aka pass, send) cards to each other.

Cards have the following property allowing them to be passed:

- `.passed`: An Array of two-element Arrays, the first element containing the memberId of the sender, the second element the recipient. That is, `.passed[0][0]` is the memberId of the first pass currently pending on a card, and `passed[0][1]` is the recipient of the first pass pending on a card. The second pass pending is `.passed[1]`, a similar two-element Array.

Cards that are passed show the list of pending passes on the bird. When the card is accepted or rejected by the recipient, the pass is removed. This design decision balances respecting the privacy of user history, while also sharing activity in real time within the local community for social purposes.

### Adding points on a card with bitcoin or lightning

- `.address`: The generated wallet QR code on the card.

- `.bolt11`: Unknown

- `.payment_hash`: Unknown, possibly QR for lightning.

### Checking off cards to claim the bounty

The AO includes a local bounty economy that allows members to put up bounties in community points and claim bounties immediately by checking off bounty cards.

Any card that has a `.boost` value above 0 has had points put on it as a bounty, and will show up in the Bounties panel. On the server, points are carefully conserved to prevent double-spending issues, so if `.boost` is increased on a card, the source of those points will be decreased by the same amount.

Points from a bounty are disbursed immediately when the card is checked in order to enhance the sense of immediacy and responsibility in the local community.

If a card has no bounty, it can still be checked/claimed, but no points will be disbursed.

A card gains the following properties to allow it to function as a bounty:

- `.claimed`: An Array of memberIds of members who have checked off the card and claimed the bounty that was on the task at the time (if any)

- `.boost`: The current bounty on the task, in points.

- `.lastClaimed`: The UNIX timestamp of the last time the bounty was claimed by anyone.

### Upgrading cards to missions (groups)

Missions, also known as groups or guilds, are cards that have been given an additional title beyond their card text. This title is searchable and is listed in the Missions Index.

Missions do many different things, acting as interest groups, hubs of card-trading, and as bookmarks in the alphabetical Index.

The `.name` text of a card cannot currently be edited, but the mission title can be, making it a useful way to add tags, synonyms, or a more accurate title to a card.

A mission is defined as a card with the following property set:

- `.guild`: The title of the mission.

### Booking an event on a card

Each card can store one calendar event, which can be set in the card's menu in the GUI. Cards with an event set are considered agenda items and show up in the Calendar panel.

The bookings system is integrated with hardware resources; the idea is that you book a room or other hardware resource which is assigned a resourceId.

An event is defined as a card that has the following property set:

- `.book:` An object containing the `.resourceId` of the resource to be booked, the `.memberId` of the member booking the resource, the `.startTs` UNIX timestamp of the start of the event, and the `.endTs` timestamp of when the event ends.

### Signing a card as a proposal

Members can sign cards to designate their agreement with, approval of, support for, or recommendation of a card. In the GUI, hover over a card's moon to display a tooltip containing the list of signers and buttons to "sign" or "decline to sign" the card.

Any card that has ever been signed at least once shows up in the Proposals panel. Proposals that have at least as many (for/approve) signatures as the `quorum` on a server are separated into a "Passed Proposals" section.

A badge appears on the Proposals panel button showing how many proposals you haven't signed. Every proposal is presented to every member, so this feature is a good way to broadcast cards to the server and build a shared history of cards many have signed.

A proposal is defined as a card that has the following property set:

- `.signed`: A list of all the times the card was signed or re-signed—an Array of Signature Objects. A Signature is an object containing the `.memberId` of the signer, the `.timestamp` of when the signing event occured, as well as a `.opinion` of the signer. The `.opinion` can be 1 (signed/approved), 0 (declined to sign/unsign), or a String describing a textual opinion (more options such as -1 for signing against a proposal are planned).

### Leaderboard

- `.highlights`: Something for the leaderboard

### Marking a card as read

Cards that you haven't seen yet have a red dot on them. If you hover your cursor over a card for two seconds, it will be marked as seen. Cards keep track of who has seen them.

The following card property is used for the unread marker feature:

- `.seen`: A list of memberIds of who has seen the card

In terms of privacy, seen is not used for anything else; the full list of which members on the server have seen the card is available in the client, but is not currently displayed anywhere to the user. This could be cleaned up later to increase privacy. (The purpose of this feature is to provide individual users with unread dots, not a social feature.)

### Clocking time on a card with the timeclock

Cards that are in the priorities list of another card are displayed with a checkbox as well as a (planned) play/pause or "Do It!" button that starts and stops a timeclock on that task. This is intended to seamlessly integrate personal time-tracking with social time-tracking, bounty, and telepresence features. For example, when you click "Do It!", your avatar will move to the current card, so people can see where you are on the AO and what you are doing. By integrating these features as seamless, fun, and convenient everyday features, we can prevent them from becoming dominating parts of our lives ("the Timeclock").

Cards use the following property to track time clocked on them:

. `.time`: A list of Usertime objects, each of which contains the timelog for a single member. Each Usertime object has a `.memberId` of the member, a `.timelog` Array of numbers of millisecends clocked, and another array of `.date` Date objects of the events when these times were clocked. `.timelog` and `.date` are kept in lockstep by the server, so `.timelog[2]` and `.date[2]` are the amount of time clocked and when it was clocked, for the third item in the log (index 2).

### Member cards

Every Member object has created in lockstep with it a corresponding member card. Member cards are just like any other card, except that their `.name` is the memberId of the Member object that the card is associated with. This means that if the card were to be displayed without modification, it would show a confusing UUID to the user instead of the member's name. The member's username is stored in the Member object; member cards must be detected by the client and the member name looked up to display them correctly. All of this is also true of Resource cards.

All member cards can be accessed on the client via `aoStore.members` (an Array of Member objects). The member card for the current user card be accessed at `aoStore.memberCard` (a Task object). The Member object for the current user (not the card), can be accessed at `aoStore.member`.

This means that there are multiple valid ways to get the taskId of the currently logged-in member. You can use `aoStore.member.memberId` or `aoStore.memberCard.taskId` and it should always return the same string. However, to be on the safe side, it's good practice to use the more accurate one depending on what is intended in the context. For example, if you are comparing a list of cards to see if any of them is the current member's member card, use `aoStore.memberCard.taskId` to guarantee an identical match; whereas, if you are comparing a list of cards to see if any of them is in the current user's collection, use `aoStore.member.memberId`.

### Resource cards

Resource cards are created in lockstep with Resource objects, and are special in exactly the same ways as Member cards, except that instead of the `.name` of the resource card matching the `memberId` of a Member object, it matches the `.resourceId` of the corresponding Resource object.

Hardware resources can be connected to the AO using the [AO pi](https://github.com/AutonomousOrganization/pi) and [sidewalk](https://github.com/DctrlVan/sidewalk) repositories. When a resource connects to the AO, it uses an existing username and password to log in, and then it invokes the resource-created event. This creates the Resource object on the server and the corresponding resource card. Then, the resource can log back in to the AO server whenever it reboots to stay connected for when it is used. When a resource is used, it generates a resource-used event.

## Other core classes

## Members

Member objects (not cards) have the following properties:

- `memberId`: A unique UUID identifier, randomly-generated when the user is created.

- `name`: The name of the member.

- `address`: Their lightning address?

- `active`: A number indicating how long the member has been continuously active in months. Any number 1 or higher indicates the member is currently active.

- `balance`: The member's current point balance (deprecated?).

- `badges`: A list of the member's badges (planned).

- `tickers`: A list of Ticker objects, each containing information on a crypto pair to look up via CoinGecko.

- `info`: Deprecated.

- `timestamp`: The UNIX timestamp of when the member was created.

- `lastUsed`: The UNIX timestamp of when the member last used a resource (for the Recent Activity list).

- `muted`: A boolean of whether the member has muted notifications and sounds.

- `fob`: A String containing the RFID fob number associated with the member's account.

- `potentials`: A list of Signature objects, the opinion of which contains an action (mutation type) that can be executed if three such signatures accrue (e.g., three votes to ban).

- `banned`: A boolean of whether the member is currently banned.

## Resources

Resource objects (not their associated cards) have the following properties:

- `resourceId`: A randomly-generated UUID to identify the resource.

- `name`: The name of the resource (set during the initialize.js step of [resource creation](https://github.com/AutonomousOrganization/pi))

- `charged`: The number of points charged each time the resource is used.

- `secret`: Deprecated?

- `trackStock`: A boolean of whether to track finite stock on the resource (e.g., sodas in the soda machine).

- `stock`: Current stock, if tracked.

## Memes

Memes, also known as attachments, are files stored in the ~/.ao/memes folder of the AO server. When the AO server starts, it scans the ~/.ao/memes folder and adds every file it finds there as a card, based on a hash of the file (to prevent duplicates). When a user uploads a file, a card is also created. The card that is created has text that is the same as the filename.

The Meme object is the attachment part of a card and has the following properties:

- `memeId`: The taskId of the card associated with this attachment.

- `filename`: The filename of the meme, including file extension.

- `hash`: Hash of the file's contents.

- `filetype`: A string containing the filetype, e.g., 'jpg', 'avi', 'pdf'. This can be used to manually set how the file will be displayed without altering its filename.

## Connected peer AOs

The AO helps install and correctly configure tor, and the tor address of the AO server will display in the AO p2p tab of the Bull panel for members to see and share. When you enter the hostname and secret of another AO into the AO p2p tab, it attempts to connect to that AO privately over tor.

When two AOs are connected, they can see each other's AO server name. They can also sync the contents of specified cards over tor, allowing the syndication of content through multiple secure hops within an AO network.

- `address`: The tor address (aka hostname) of the AO server.

- `outboundSecret`: The server secret (password) for outbound connections to the server, or `false`.

- `inboundSecret`: The server secret (password) for inbound connections to the server.

- `lastContact`: The UNIX timestamp of the last time contact was had with this server.

- `links`: Linked cards across the two AOs (?). Their contents are kept in sync (append-only).

# ao-react Component Model

React and other reactive web frameworks structure the page as a hierarchy of nested components. ao-react shares most of its server code with <a href=https://github.com/AutonomousOrganization/ao-3>ao-3</a>, but the front-end application, composed of components, has been rewritten from the ground up. Following is a list of the components in ao-react, including their purpose, an explanation of the props (arguments) they take, and which other components they are used with. The components are the most rapidly-changing part of the codebase, and also the most specific to the GUI of ao-react, so this is less of a standard and more a description of how this version of the AO looks and acts (whereas the API is meant to evolve into a standard).

The **Used By** and **Uses** fields denote which other ao-react components refer to or are referred to by the current component.

# Components on cards

These components are part of a card, e.g., the bonus points on a card.

### AoAttachment

If the card has a meme (file attachment) associated with it, the attachment component displays a preview of the meme associated with a card, if the filetype is supported. Below this, its filename is displayed as a link, which can be clicked to download the file. The attachment displays below the card's name (main text).

**Props:**

- **taskId (string):** The `.taskId` of the card that may have an attachment to display.
- **onNextTrack?: (taskId: string) => void:** Currently unused. Plans for a playlist feature.

**Used By:** AoContextCard

**Uses:** None

### AoBirdAutocomplete

A dropdown autocomplete component containing a list of all members who are not currently holding the card, and to whom a pass is not pending. (You can still send a card to someone who is already holding it, but you must type their full username exactly without aid of this autocomplete.)

The component uses [Google's Material UI Autocomplete component](https://material-ui.com/api/autocomplete/).

Currently, only one name can be entered at a time, however, by extending the AO API call `passCard()` using the labels feature of the Material UI autocomplete, it should be possible to extend the component the allow multiple usernames to be entered.

**Props:**

- **taskId? (string):** An optional taskId of the card to use to filter the list of member names. If omitted, the full list of members will display in the autocomplete.
- **onChange: ((memberId: string) => void):** A callback function for when a member is selected from the list.

**Used By:** AoBird, AoGifts

**Uses:** None

### AoBird

An icon of a bird in the top-left corner of every card. Tap the bird to pop up a box (AoBirdAutocomplete) where you can type a member's name and click Give to send them the card. The bird displays next to it the the number of pending passes that have not yet been accepted. Hovering on the bird shows a tooltip listing who has passed the card to whom. Anyone can see this list, and passes are removed from the list when the card is accepted or rejected by the recipient.

**Props:**

- **taskId (string):** The `.taskId` of the card on which to put a bird.

**Used By:** AoCardHud, AoContextCard (to show bird in place of coin when grabbed)

**Uses:** AoMemberIcon

### AoCardHud

The card's H.U.D. (Heads-Up Display) is a container component that displays an informational overlay for the card, made up of a number of other smaller components. The card's HUD is the part of the card that is an overlay about the current card, not its contents.

**Props:**

- **taskId (string):** The `.taskId` of the card for which to display an informational overlay.
- **hudStyle (HudStyle):** A HudStyle describing which type of HUD to display. Some card styles, such as 'full' have their HUD split into a top and bottom section with HudStyles 'full before' and 'full after'. The AoCardHud should be included twice on these cards, before and after the content, with the appropriate HudStyle passed in.
- **prioritiesShown? (boolean):** Whether to show the priorities on the `collapsed`-style card. Can be omitted for other styles of card.
- **onTogglePriorities? ((any) => void):** Callback function that is triggered when the button to expand priorities is tapped on the `collapsed`-style card.
- **noPopups? (boolean):** For deeply nested cards, send `true` to disable Tippy popups, which can otherwise nest recursively.
- **inId? (string):** For `face before` style cards, you must include this, the `.taskId` of the parent card, so that the boat can activate properly in-context.

**Used By:** AoContextCard

**Uses:** AoPalette, AoBird, AoUnread, AoCoin, AoCheckbox, AoValue, AoCrowdfund, AoCountdown, AoTimeClock, AoCardMenu, AoPreview, AoMission, AoBark, AoTally, AoLilypad

### AoCardMenu

The card menu is three vertical dots that show up in the bottom-right corner of every card. Tapping the menu icon opens a menu with additional card operations that don't fit well on the face of the card.

**Props:**

- **taskId (string):** The `.taskId` of the card's menu to display.
- **hudStyle: HudStyle):** The style of card being displayed, which will modify the appearance and class of the menu button.
- **noPopups? (boolean):** For deeply nested cards, send `true` to disable Tippy popups, which can otherwise nest recursively.

**Used By:** AoCardHud

**Uses:** AoCardHud, with hudStyle="menu", is used to display the contents of a card's menu. The menu components are simply expanded versions of the components displayed on the face of the card.

### AoCheckbox

The interactive checkbox that displays in the top-right corner of every card. The checkbox only displays if you are holding the card (by clicking the moon; see grabCard() in API). When checked, the checkbox sends an a `task-claimed` event to the server using the API method completeCard(). This checks off the card for the current member and claim any bounty on the card.

On grid cards displayed in `mini` style, the intention is to merge the checkbox and the moon, so that a click on the moon will reveal the checkbox.

**Props:**

- **taskId (string):** The `.taskId` of the card's menu to display.
- **hudStyle: HudStyle):** The style of card being displayed, which will modify the appearance and class of the menu button.

**Used By:** AoCardHud

**Uses:** None

### AoCheckmark

A non-interactive checkmark that can be used throughout the AO to display checkmarks that members have made. The checkmark uses a hard-coded inline SVG so the color can be set at runtime (this was not working any other way). On hover a tooltip preview of the card in `compact` style is shown.

**Props:**

- **taskId (string):** The `.taskId` of the card's menu to display. This affects the color and whether it is checked. If omitted, the default color is white.
- **color?: (string):** The color to display the checkmark in. If set, takes precedence over the card's color.
- **onGoIn?: ((event) => void):** A callback function that will be executed when the checkmark is double-clicked. If omitted, nothing will happen when the checkmark is double-clicked.

**Used By:** AoContextCard, to display a whole card as in `checkmark`-style; AoScore, as a graphic to designate a member's score; AoTally, as a graphic to designate that a member completed the task

**Uses:** AoContextCard is used to display the card preview on hover.

### AoCoin

The moon, or coin, that appears on every card in the bottom center, allows the card to be grabbed and dropped. Grabbing a card adds it to your collection so it can't be lost or deleted by other members. When you click the coin, the API method grabCard() triggers a `task-grabbed` event on the server, and the card is grabbed and the coin lights up. When clicked a second time, the API method dropCard triggers a `task-dropped` event, toggling the coin back off. Doing other actions to a card, such as placing it somewhere, will also grab the card automatically (since you can't move something without picking it up first).

**Props:**

- **taskId (string):** The `.taskId` of the card for which to display a coin.
- **noPopups? (boolean):** For deeply nested cards, send `true` to disable Tippy popups, which can otherwise nest recursively.

**Used By:** AoCardHud, AoContextCard

**Uses:** AoStack, to display the list of members holding the card.

### AoCompleted

**Props:**

**Used By:**

**Uses:**

### AoCountdown

**Props:**

**Used By:**

**Uses:**

### AoCrowdfund

**Props:**

**Used By:**

**Uses:**

## Panel components

### AoBounties

**Props:**

**Used By:**

**Uses:**

### AoCalendar

**Props:**

**Used By:**

**Uses:**

### AoCardComposer

**Props:**

**Used By:**

**Uses:**

### AoCard

**Props:**

**Used By:**

**Uses:**

### AoChatroom

**Props:**

**Used By:**

**Uses:**

### AoChatStack

**Props:**

**Used By:**

**Uses:**

### AoConnect

**Props:**

**Used By:**

**Uses:**

### AoContextCard

**Props:**

**Used By:**

**Uses:**

### AoControls

**Props:**

**Used By:**

**Uses:**

### AoDiscard

**Props:**

**Used By:**

**Uses:**

### AoDock

**Props:**

**Used By:**

**Uses:**

### AoDragZone

**Props:**

**Used By:**

**Uses:**

### AoDropZone

**Props:**

**Used By:**

**Uses:**

### AoFob

**Props:**

**Used By:**

**Uses:**

### AoGem

**Props:**

**Used By:**

**Uses:**

### AoGifts

**Props:**

**Used By:**

**Uses:**

### AoGridResizer

**Props:**

**Used By:**

**Uses:**

### AoGrid

**Props:**

**Used By:**

**Uses:**

### AoHome

**Props:**

**Used By:**

**Uses:**

### AoHub

**Props:**

**Used By:**

**Uses:**

### AoHud

**Props:**

**Used By:**

**Uses:**

### AoLazyTippy

**Props:**

**Used By:**

**Uses:**

### AoLightning

**Props:**

**Used By:**

**Uses:**

### AoLilypad

**Props:**

**Used By:**

**Uses:**

### AoLogin

**Props:**

**Used By:**

**Uses:**

### AoMemberIcon

**Props:**

**Used By:**

**Uses:**

### AoMembers

**Props:**

**Used By:**

**Uses:**

### AoMember

**Props:**

**Used By:**

**Uses:**

### AoMissions

**Props:**

**Used By:**

**Uses:**

### AoMission

**Props:**

**Used By:**

**Uses:**

### AoOptions

**Props:**

**Used By:**

**Uses:**

### AoPalette

**Props:**

**Used By:**

**Uses:**

### AoPaper

**Props:**

**Used By:**

**Uses:**

### AoPassword

**Props:**

**Used By:**

**Uses:**

### AoPopupPanel

**Props:**

**Used By:**

**Uses:**

### AoPreview

**Props:**

**Used By:**

**Uses:**

### AoProposals

**Props:**

**Used By:**

**Uses:**

### AoQuorum

**Props:**

**Used By:**

**Uses:**

### AoReactivator

**Props:**

**Used By:**

**Uses:**

### AoRent

**Props:**

**Used By:**

**Uses:**

### AoReserve

**Props:**

**Used By:**

**Uses:**

### AoResourcePanel

**Props:**

**Used By:**

**Uses:**

### AoResources

**Props:**

**Used By:**

**Uses:**

### AoReturnPile

**Props:**

**Used By:**

**Uses:**

### AoScore

**Props:**

**Used By:**

**Uses:**

### AoSearch

**Props:**

**Used By:**

**Uses:**

### AoServerName

**Props:**

**Used By:**

**Uses:**

### AoShitposts

**Props:**

**Used By:**

**Uses:**

### AoStack

**Props:**

**Used By:**

**Uses:**

### AoStatus

**Props:**

**Used By:**

**Uses:**

### AoTally

**Props:**

**Used By:**

**Uses:**

### AoTickerHud

**Props:**

**Used By:**

**Uses:**

### AoTimeclock

**Props:**

**Used By:**

**Uses:**

### AoTip

**Props:**

**Used By:**

**Uses:**

### AoTour

**Props:**

**Used By:**

**Uses:**

### AoUnread

**Props:**

**Used By:**

**Uses:**

### AoUsername

**Props:**

**Used By:**

**Uses:**

### AoValue

**Props:**

**Used By:**

**Uses:**

### AoVolume

**Props:**

**Used By:**

**Uses:**

## Components not currently in use

### AoBark

**Props:**

**Used By:**

**Uses:**

# Misc Reference info

export type HudStyle =
| 'context'
| 'full before'
| 'full after'
| 'face before'
| 'face after'
| 'collapsed'
| 'collapsed-mission'
| 'mini before'
| 'mini after'
| 'badge'
| 'menu'
