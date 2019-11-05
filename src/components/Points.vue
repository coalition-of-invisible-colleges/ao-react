<template lang='pug'>

#points
    .center
        h4 {{ totalPointsSum.toFixed(0) }} total points ({{ satPoint.toFixed(0) }} &#12471;)
    .row
        .five.grid
            img(src='../assets/images/loggedIn.svg')
            span
                h4 {{ totalMembers.toFixed(0) }} in accounts
            div(v-for='n in members')
                span {{ n.boost.toFixed(0) }}
                current(:memberId='n.taskId')
            img(src='../assets/images/kisspng-dolphin-porpoise-sticker-adhesive-5aef7f9d672f78.5792508915256452134227.png')
            h4 {{ totalResources.toFixed(0) }} in resources
            div(v-for='n in resources')
                span {{ n.boost.toFixed(0) }}
                currentr(:resourceId='n.taskId')
        .seven.grid
            img(src='../assets/images/badge.svg')
            h4 {{ totalGuilds.toFixed(0) }} on missions
            h3(v-for='n in guilds') {{ n.boost.toFixed(0) }} - {{ n.guild }}
            img(src='../assets/images/kisspng-coconut-asian-palmyra-palm-tree-coconut-tree-5a84ba1cec05d9.1551759415186478369668.png')
            h4 {{ totalCards.toFixed(0) }} on cards
            template(v-for='n in cards')
                p {{ n.boost }} - {{ n.name }}
</template>

<script>

import Current from './Resources/Current'
import Currentr from './Resources/Currentr'

export default {
    components: { Current, Currentr },
    data(){
        let members = []
        let guilds = []
        let resources = []
        let cards = []

        this.$store.state.tasks.forEach(t => {
            if( t.boost > 0 ){
                if (this.$store.getters.memberIds.indexOf(t.taskId) > -1){
                  members.push(t)
                } else if (this.$store.getters.resourceIds.indexOf(t.taskId) > -1) {
                  resources.push(t)
                } else if (t.guild) {
                  guilds.push(t)
                } else {
                  cards.push(t)
                }
            }
        })

        members.sort((a, b) => parseInt(a.boost) < parseInt(b.boost))
        guilds.sort((a, b) => parseInt(a.boost) < parseInt(b.boost))
        resources.sort((a, b) => parseInt(a.boost) < parseInt(b.boost))
        cards.sort((a, b) => parseInt(a.boost) < parseInt(b.boost))

        let totalMembers = 0
        let totalGuilds = 0
        let totalCards = 0
        let totalResources = 0
        members.forEach(t => {
            totalMembers += parseFloat( t.boost )
        })
        guilds.forEach(t => {
            totalGuilds += parseFloat( t.boost )
        })
        resources.forEach(t => {
            totalResources += parseFloat( t.boost )
        })
        cards.forEach(t => {
            totalCards += parseFloat( t.boost )
        })
        let totalPointsSum = totalMembers + totalGuilds + totalResources + totalCards
        let satPoint = this.$store.getters.totalWallet / totalPointsSum
        return {
            totalPointsSum,
            satPoint,
            totalMembers,
            totalGuilds,
            totalResources,
            totalCards,
            members,
            guilds,
            cards,
            resources
        }
    }
}

</script>

<style lang='stylus' scoped>

@import '../styles/colours'
@import '../styles/grid'

img
    height: 3em

.fr
    float: right

.center
    text-align: center


</style>
