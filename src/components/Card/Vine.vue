<template lang='pug'>

.vine(@click='toTop')
  router-link(:to='"/task/" + b.taskId')
    img.viney(src='../../assets/images/vinebtn.svg')
</template>

<script>

import request from 'superagent'
import FormBox from '../slotUtils/FormBox'

export default {
    props: ['b'],
    methods: {
        toTop(){
            window.scrollTo(0, 0);
        },
    },
}

</script>

<style lang="stylus" scoped>

@import '../../styles/colours';
@import '../../styles/skeleton';
@import '../../styles/grid';
@import '../../styles/button';

.vine, a, div
    width: 100%

.count
    float: right

.activated
    border-style: solid
    border-width: thick
    border-color: white

.upgrade
    height: 3em

.task
    color: white
    margin:10px 0
    padding:20px

.row
    width: 100%
    .mainColumn
      width:calc(100% - 75px - 4%)
    .secondaryColumn
      width:75px
      button
        height:75px

.btn
    width:100%
    margin-top: 2em
    max-height: 3em

select
    background-color: lightteal

select.form-control
    color: black

.curs
    cursor: pointer;

label
    color: black
    text-align: center
    padding: 0
    margin-bottom: -50px

.viney
    float: right
    height: 1.3em
</style>
