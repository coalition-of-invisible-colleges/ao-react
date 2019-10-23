<template lang='pug'>

#points
    .row
        .four.grid
            .row
                img.four.grid(src='../assets/images/loggedIn.svg')
                .eight.grid {{ totalMembers.toFixed(0) }}
            .center(v-for='n in members')
                span {{ n.boost.toFixed(0) }}
                current(:memberId='n.taskId')
        .four.grid
            .row
                img.six.grid(src='../assets/images/badge.svg')
                .six.grid {{ totalGuilds.toFixed(0) }}
            h3.center(v-for='n in guilds') {{ n.guild }} - {{ n.boost.toFixed(0) }}
            template(v-for='n in cards')
                p {{ n.boost }} -- {{ n.name }}
        .four.grid
            .row
                img.six.grid(src='../assets/images/kisspng-dolphin-porpoise-sticker-adhesive-5aef7f9d672f78.5792508915256452134227.png')
                .six.grid {{ totalResources.toFixed(0) }}
            .center(v-for='n in resources') {{ n.boost.toFixed(0) }}

    .center
        p total points: {{ totalPointsSum }}
        p wallet backing: {{ satPoint }} &#12471;
</template>

<script>

import Current from './Resources/Current'

export default {
    components: { Current },
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
    width: 100%


.center
    text-align: center


</style>
