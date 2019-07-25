<template lang='pug'>

.badges
  span(v-if='isMrClean' v-b-tooltip.hover title="Mr Clean")
      img(src='../../assets/images/mrclean.jpg')
  span(v-if='memberAge > 8640' v-b-tooltip.hover title="Original Gangster")
          img(src='../../assets/images/eazy.png')
  span(v-if='memberAge < 2160' v-b-tooltip.hover title="New Member")
          img(src='../../assets/images/sayno.png')
  template(v-for='b in uniqueBadges')
      span(v-if='b.badge === "admin"' v-b-tooltip.hover title="Admin" v-bind:class="getClass(b.badge)" @click="toggleHidden(b.badge)")
          img(src='../../assets/images/admin.svg')
      span(v-if='b.badge === "secure"' to='/badges/secure' v-b-tooltip.hover title="Secure" v-bind:class="getClass(b.badge)" @click="toggleHidden(b.badge)")
          img(src='../../assets/images/secure.svg')
      span(v-if='b.badge === "bitcoin"' v-b-tooltip.hover title="Bitcoin" v-bind:class="getClass(b.badge)" @click="toggleHidden(b.badge)")
          img(src='../../assets/gifs/bitcoin.gif')
      span(v-if='b.badge === "doge"' v-b-tooltip.hover title="Doge" v-bind:class="getClass(b.badge)" @click="toggleHidden(b.badge)")
          img(src='../../assets/images/doge.png')
      span(v-if='b.badge === "bitpepsi"' v-b-tooltip.hover title="Bitpepsi" v-bind:class="getClass(b.badge)" @click="toggleHidden(b.badge)")
          img(src='../../assets/images/bitpepsi.png')
      span(v-if='b.badge === "lightning"' v-b-tooltip.hover title="Lightning" v-bind:class="getClass(b.badge)" @click="toggleHidden(b.badge)")
          img(src='../../assets/gifs/lightning.gif')
      span(v-if='b.badge === "developer"' v-b-tooltip.hover title="Developer" v-bind:class="getClass(b.badge)" @click="toggleHidden(b.badge)")
          img(src='../../assets/images/developer.png')
      span(v-if='b.badge === "zerg"' v-b-tooltip.hover title="Overlord" v-bind:class="getClass(b.badge)" @click="toggleHidden(b.badge)")
          img(src='../../assets/images/zerg.png')

</template>

<script>

export default {
    name: 'badges',
    props: ['m'],
    computed: {
        isMrClean(){
            let isMrClean = this.$store.getters.mrclean == this.m.memberId
            return isMrClean
        },
        uniqueBadges(){
            let formatted = []
            let unique = []
            return this.m.badges.filter( b => {
                if (unique.indexOf(b.badge) === -1){
                    unique.push(b.badge)
                    return true
                }
                return false
            })
        },
        memberAge(){
            let member_age = Math.round(((new Date).getTime() - this.m.timestamp)/(1000*60*60))
            return member_age
        },
        inAccount(){
            return this.$route.path == '/Account'
        }
    },
    methods: {
        toggleHidden: function(badge){
            let ourId = this.$store.getters.member.memberId
            if(ourId == this.m.memberId){
                this.$store.dispatch("makeEvent", {
                    type: 'badge-hidden',
                    memberId: this.m.memberId,
                    badge: badge
                })
            } else {
                console.log("Hey asshole! You can't hide soomeone else's badges!")
            }
        },
        getClass: function(badge){
            if(!this.m.hiddenBadges){
                return '';
            }
            if(this.m.hiddenBadges.includes(badge)){
            if(this.$route.path == '/Account'){
                return 'faded'
            }
            else if(this.$route.path == '/MEMBERS'){
                return 'hidden'
            }
            else {
                console.log('something fucked up! we shouldnt be here')
                console.log(this.$route.path)
            }
            }
            return '';
        },
    },

}

</script>

<style lang='stylus' scoped>

img
    height: 3em
    padding-left: .2345em
    padding-right: .2345em

a:nth-child(odd)
      img
          padding-top: 1.2em
.faded
      img
          opacity: 0.25
.hidden
      img
          display: none
</style>
