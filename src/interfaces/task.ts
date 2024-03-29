export type Color = 'red' | 'yellow' | 'green' | 'purple' | 'blue' | 'black'
export type GridStyle = 'grid' | 'pyramid'

export interface Task {
    taskId: string              // ao-react: Random UUID | ao-3: CRC-32 hash of the content
    name: string                // The text of the card, the main content. Can be plain text, Markdown, or HTML and JavaScript, optimized for injection.
    color: Color                // Color of the card as a word | Future: Could be any color word or hex code paired with a word naming the color
    deck: string[]              // *Array of memberIds of members who grabbed and are holding the card in their deck
    guild: string               // Optional guild / pin / tag title for the card. This is editable (unlike cards currently). Guild cards are indexed in Guilds sidebar on left.
    address: string             // 
    bolt11: string              // 
    payment_hash: string        // 
    book: {                     // Book/schedule this card as an event on the calendar
        memberId: string        // The member that scheduled the event (?)
        startTs: number         // The start of the event (Unix timestamp)
        endTs: number           // The end time of the event. Optional—but if omitted behavior is undefined. (Unix timestamp)
    }
    priorities: string[]        // *Array of taskIds of cards prioritized within this card
    subTasks: string[]          // *Array of taskIds of cards within this card
    completed: string[]         // *Array of taskIds of checked-off completed cards within this cards. Cards saved here when discarded with any checkmarks on them.
    gridStyle?: GridStyle       // Current layout/spread for the card's pinboard. Switching it dumps cards that don't fit the new layout into .subTasks
    grid?: Grid                 // *Grid object, will be replaced by new more flexible canvas-style pinboard indexing paradigm
    pins: Pin[]                 // *New way of doing the Grid, Pyramid, and upcoming Rune layouts for the card
    parents: string[]           // *List of this cards parents, ought to be kept updated by mutations.
    claimed: string[]           // 
    claimInterval?: number      // Automatic uncheck timer in milliseconds
    signed: Signature[]         // Members can explicitly sign cards to endorse them (future option to counter-sign as -1 is already built-in)
    passed: string[][]          // Array of [senderMemberId, receiverMemberId] pairs of pending gifts sent to the receiving member. Cleared when opened.
    giftCount?: number          // Count of unopened gift cards that ought to be kept automatically updated, for showing this number ot other members
    lastClaimed: number         // The last time someone checked this card off (Unix timestamp)
    allocations: Allocation[]   // List of points temporarily allocated to this card from parent cards, making this card a claimable bounty
    boost: number               // Bonus points on the card (?)
    goal?: number               // Optional points goal shows after the current number of points on a card, e.g., 8/10 points raised in the crowdfund.
    highlights: number[]        
    seen: Userseen[]            // Array of events marking the first (?) or most recent (?) time they looked at the card. Used for unread markers.
    timelog: LabourTime[]       // Arary of timelog events on the card
    created: number             // When the card was created (Unix timestamp)
    showChatroom?: boolean      // Whether or not to show the chatroom tab. Only allowed on cards with a .guild set for simplicity and transparency's sake.
    avatars?: AvatarLocation[]  // When a member joins a chatroom, it shows they are "at" that card. | Future: Little avator icons that can be moved from card to card or clicked to follow.
    memberships: Membership[]   // Members can "join" a card as members. The first member is automatically Level 2 and can boss the Level 1's around. You can decrease your level and lose your power.
    showStash?: boolean         // Whether or not to show the stash tab. Only allowed on cards with a .guild set for simplicity and transparency's sake.
    stash: {}                   // *Stash of more cards associated with this card. Members have access to stashes of their level and below.
    unionHours: number          // Number of estimated hours for the task
    unionSkill: number          // Skill level required for the task (0-5)
    unionHazard: number         // Hazard level for the task (0-5)
    loadedFromServer?: boolean  // True if the card has been loaded from the server, false if empty placeholder taskId object
    aoGridToolDoNotUpdateUI?: boolean // Rendering hack, maybe this can be improved and removed
    // *These properties contain taskIds of cards that are within or closely associated with this card, for the purposes of search, content buffering, etc.
    // There are four main zones within a card: the priorities, the optional pinboard (grid/pyramid), the subTasks (main pile), and completed cards
}

export interface Grid { // Old way of doing grid, will be replaced by Pinboard
    rows: {}
    height: number
    width: number
    size: number
}

// Defines the dimensions and other properties of a spread or layout of cards.
// Could be expanded or inherited from to create new types of spreads such as a freeform canvas or non-euclidian pinboard.
export interface Pinboard {
  height: number
  width?: number
  size: number                  // Size of squares, roughly in ems
}

// A card pinned to a pinboard
export interface Pin {
  taskId: string
  y: number
  x?: number
}

export interface Allocation {
    type?: string
    taskId: string
    allocatedId: string
    amount: number
    blame?: string
}

export interface Signature {
    memberId: string
    timestamp: Date
    opinion: number | string
}

export interface Userseen {
    memberId: string
    timestamp: Date
}

export interface LabourTime {
    memberId: string
    taskId: string
    inId: string
    start: number
    stop: number
}

export interface AvatarLocation {
    memberId: string
    timestamp: number
    area: number
}

export interface Membership {
    memberId: string
    level: number
}
