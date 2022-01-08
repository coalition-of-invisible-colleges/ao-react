import { useEffect, useState, createRef } from 'react'
import React from 'react'
import { computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react'
import { emptySearchResults } from '../client/store'
import aoStore from '../client/store'
import { SearchResults } from '../client/store'
import InfiniteScroll from 'react-infinite-scroller'
import AoContextCard from './contextCard'
import AoDragZone from './dragZone'

type SearchSort = 'alphabetical' | 'hodls' | 'oldest' | 'newest'

interface State {
query: string
           sort: SearchSort
           items?: number
           hasMore: boolean
           debounce?
}

export const defaultState: State = {
query: '',
       sort: 'newest',
       hasMore: true,
}

const nameSort = (a, b) => {
    return a.name.localeCompare(b.name, undefined, {sensitivity: 'base'})
}

const lenSort = (a, b) => {
    return b.deck.length - a.deck.length
}


const AoSearch = observer((props) => {
    const [query, setQuery] = useState<string>('')
    const [sortedResults, setSortedResults] = useState(emptySearchResults)
    const [sort, setSort] = useState<string>('oldest')
    const [items, setItems] = useState<number>(undefined)
    const [hasMore, setHasMore] = useState<boolean>(false)

    const debounce = ( func, timeout = 500 ) => {
            let timer
            return (...args) => {
                if (timer) {
                    clearTimeout(timer)
                }
                timer = setTimeout(() => {func(args)}, timeout)
            }
    }

    const makeSearchQuery = async (query: string) => {
        const results = await aoStore.returnSearchResults(query)

        let sorted = emptySearchResults

        if (results.all.length < 1) {
            setSortedResults(emptySearchResults)
            return sorted
        }

        switch (sort) {
            case 'alphabetical':
                sorted.missions = results.missions
                .slice()
                .sort(nameSort)
                sorted.members = results.members
                .slice()
                .sort(nameSort)
                sorted.tasks = results.tasks
                .slice()
                .sort(nameSort)
                break
            case 'hodls':
                sorted.missions = results.missions
                .slice()
                .sort(lenSort)
                sorted.members = results.members
                .slice()
                .sort(lenSort)
                sorted.tasks = results.tasks
                .slice()
                .sort(lenSort)
                break
            case 'newest':
                sorted.missions = results.missions.slice().reverse()
                sorted.members = results.members.slice().reverse()
                sorted.tasks = results.tasks.slice().reverse()
                break
            default:
                sorted = results
                break
        }

        sorted.all = sorted.missions.concat(sorted.members, sorted.tasks)
        sorted.length = sorted.all.length
        setSortedResults(sorted)
        return sorted
    }

    const searchBox = createRef<HTMLInputElement>()

    useEffect(() => {
        searchBox.current.select()
    }, [])

    useEffect(() => {
        // Maintain window position
        window.scrollTo(window.scrollX, window.scrollY + 1)
        window.scrollTo(window.scrollX, window.scrollY - 1)

        // Debounce the search query
        const search = debounce(() => submitSearch())
        search()
    }, [query])

    const onKeyDown = (event) => {
        if (event.key === 'Escape') {
            event.stopPropagation()
                // this should also close the entire search box tippy
            setQuery('')
        }
    }

    const submitSearch = () => {
        if (!query || query.length < 2) {
            return
        }
    
        makeSearchQuery(query)
    }

    const scrollMore = (page: number) => {
        const newIndex = page * 5
        setHasMore(sortedResults.length > newIndex)
        setItems(newIndex)
    }

    const renderEntries = (entries) => {
        let rendered = entries.map((task, i) => (
                <AoDragZone
                    taskId={task.taskId}
                    dragContext={{ zone: 'panel', y: i, }}
                    key={task.taskId}
                >
                    <AoContextCard task={task} cardStyle="priority" noFindOnPage={true} />
                </AoDragZone>
            ))

        return rendered
    }

    const renderSearchResults = (results) => {
        if (results.length === 0) {
            if (query?.length >= 1) {
                return (
                    <div id="searchResults" className="results">
                        0 results
                    </div>
                )
            }
        }

        return (
            <>
                {results.length >= 2 ? (
                    <div className="toolbar">
                        {renderSortButton('newest', 'Newest')}
                        {renderSortButton('alphabetical', 'A-Z')}
                        {renderSortButton('hodls', 'Hodls')}
                        {renderSortButton('oldest', 'Order')}
                    </div>
                ) : (
                    <br/> 
                )}
                <div id="searchResults" className="results">
                <div>
                    {results.length}{' '}
                    {results.length === 1
                    ? 'search result'
                    : 'search results'}
                </div>
                    {
                    /* <InfiniteScroll */
                    /*     loadMore={submitSearch} */
                    /*     useWindow={false} */
                    /*     hasMore={sortedResults.length > 0} */
                    /*     loader={<h4>Loading...</h4>} */
                    /* > */
                    /*     {renderEntries(results.all.slice(0, items))} */
                    /* </InfiniteScroll> */
                    }
                    {renderEntries(results.all.slice(0, items))}
                    <button onClick={submitSearch}>More!</button>
                </div>
            </>
        )
    }

    const renderSortButton = (sortAlg: SearchSort, label: string) => {
        if (sort === sortAlg) {
            return <p className="action selected">{label}</p>
        } else {
            return (
                <p onClick={(event) => setSort(event.currentTarget.getAttribute('data-sort'))} data-sort={sortAlg} className="action">
                    {label}
                </p>
            )
        }
    }

    return (
        <div id="search">
            <h2>Search</h2>
                <input
                    ref={searchBox}
                    type="search"
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={onKeyDown}
                    value={query}
                    size={36}
                    placeholder="search for a card"
                    autoFocus
                    id="searchBox"
                />
            {renderSearchResults(sortedResults)}
        </div>
    )
})

export default AoSearch;
