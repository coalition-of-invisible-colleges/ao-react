<template lang='pug'>

#home
    nodes
    manage
    changer
    img#whales(src='../assets/images/cryptowhales.jpg')
    rollsafe
</template>

<script>

import SharedTitle from './slotUtils/SharedTitle'
import Auth from './Auth'
import Manage from './Manage'
import Changer from './MyPage/Changer'
import TaskCreate from './forms/TaskCreate'
import PreviewDeck from './Deck/PreviewDeck'
import Calendar from './MemberCalendar'
import Nodes from './Nodes'
import Panels from './Deck/Panels'
import WhyLightning from './Nodes/WhyLightning'
import Rollsafe from './Deck/Rollsafe'
export default {
    components:{
        SharedTitle, Auth, Manage, Changer,
        TaskCreate, PreviewDeck, Calendar, Nodes,
        Panels, WhyLightning, Rollsafe
    },
}

</script>

<style lang='stylus' scoped>

@import '../styles/colours'

.intro
    padding: 5em 0;

p
    font-size:1.1em
    color:white
    font-family: 'Open Sans', light, sans-serif;

h3
    text-align: center
    color:accent1
    font-family: 'Open Sans', light, sans-serif;
    font-size:3em

a
    color: accent2
    text-decoration: none;

a:visited
    color: accent1

#whales
    width: 100%
    opacity: 0.234567

</style>
