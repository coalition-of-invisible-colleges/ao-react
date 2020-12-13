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

Hardware resources can be connected to the AO using the [AO pi](https://github.com/AutonomousOrganization/pi) and [sidewalk](https://github.com/DctrlVan/sidewalk) repositories. When a resource connects to the AO, it uses an existing username and password to log in, and then it invokes the resource-created event. This creates the Resource object on the server and the corresponding resource card. Then, the resource can log back in to the AO server whenever it reboots to stay connected for when it is used. When a resource it used, it generates a resource-used event.

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

The AO helps install and correctly configure tor, and the tor address of the AO server will display in the AO p2p tab of the Bull panel for members to see and share. When you enter the hostname and address of another AO into the AO p2p tab, it attempts to connect to that AO privately over tor.

When two AOs are connected, they can see each other's AO server name. They can also sync the contents of specified cards over tor, allowing the syndication of content through multiple secure hops within an AO network.

- `address`: The tor address (aka hostname) of the AO server.

- `outboundSecret`: The server secret (password) for outbound connections to the server, or `false`.

- `inboundSecret`: The server secret (password) for inbound connections to the server.

- `lastContact`: The UNIX timestamp of the last time contact was had with this server.

- `links`: Linked cards across the two AOs (?). Their contents are kept in sync (append-only).
