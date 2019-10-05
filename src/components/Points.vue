<template lang='pug'>

#points
    .row
        .four.grid
            .row
                img.four.grid(src='../assets/images/loggedIn.svg')
                .eight.grid {{ $store.getters.totalPoints.totalMembers.toFixed(0) }}
            .center(v-for='n in $store.getters.taskByBoost.members')
                span {{ n.boost }}
                current(:memberId='n.taskId')
        .four.grid
            .row
                img.six.grid(src='../assets/images/badge.svg')
                .six.grid {{ $store.getters.totalPoints.totalGuilds.toFixed(0) }}
            .center(v-for='n in $store.getters.taskByBoost.guilds')
                h3 {{ n.guild }} - {{ n.boost }}
        .four.grid
            .row
                img.six.grid(src='../assets/images/kisspng-dolphin-porpoise-sticker-adhesive-5aef7f9d672f78.5792508915256452134227.png')
                .six.grid {{ $store.getters.totalPoints.totalResources.toFixed(0) }}
            //- .center(v-for='n in $store.getters.taskByBoost.resources') {{ n.boost }}
    p points: {{ $store.getters.totalPointsSum }}
    p wallet:  {{ ($store.getters.confirmedBalance + $store.getters.totalLocal).toLocaleString() }} &#12471;
    p backing: {{ $store.getters.satPoint }} &#12471;
    template(v-for='n in $store.getters.taskByBoost.cards')
        p {{ n.boost }} -- {{ n.name }}
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



</style>
