<template lang='pug'>

#points
    .row
        .four.grid
            .row
                img.four.grid(src='../assets/images/loggedIn.svg')
                .eight.grid {{ $store.getters.totalPoints.totalMembers.toFixed(0) }}
            .center(v-for='n in $store.getters.taskByBoost.members')
                span {{ n.boost.toFixed(0) }}
                current(:memberId='n.taskId')
        .four.grid
            .row
                img.six.grid(src='../assets/images/badge.svg')
                .six.grid {{ $store.getters.totalPoints.totalGuilds.toFixed(0) }}
            h3.center(v-for='n in $store.getters.taskByBoost.guilds') {{ n.guild }} - {{ n.boost.toFixed(0) }}
        .four.grid
            .row
                img.six.grid(src='../assets/images/kisspng-dolphin-porpoise-sticker-adhesive-5aef7f9d672f78.5792508915256452134227.png')
                .six.grid {{ $store.getters.totalPoints.totalResources.toFixed(0) }}
            .center(v-for='n in $store.getters.taskByBoost.resources') {{ n.boost.toFixed(0) }}
            template(v-for='n in $store.getters.taskByBoost.cards')
                p {{ n.boost }} -- {{ n.name }}
    .center
        p total points: {{ $store.getters.totalPointsSum }}
        p wallet backing: {{ $store.getters.satPoint }} &#12471;
</template>

<script>

import Current from './Resources/Current'

export default {
    components: { Current }
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
