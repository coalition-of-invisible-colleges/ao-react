<template lang='pug'>
#wrex
  h1 Top
  hypercard.topmission(v-for='(t, i) in topten'  v-if='i < 11'  :b='t'  :key='t.weight'  :c='[t.taskId]'  :inId='$store.getters.member.memberId')
</template>

<script>
import CardPanel from './CardPanel'
import Hypercard from "./Card"

export default {
  components:{
      CardPanel,
      Hypercard,
  },
  mounted(){
      this.$store.commit('setMode' , 1)
      this.$store.commit('setDimension' , 1)
      this.$store.commit('stopLoading')
  },
  computed: {
      topten(){
          let guilds = []
          let uniqueG = []
          this.$store.state.tasks.forEach((c, i) => {
              if (c.guild){
                  let l = uniqueG.indexOf(c.guild)
                  if (guilds.indexOf(c.guild) === -1){
                    guilds.push(c)
                    uniqueG.push(c.guild)
                  } else {
                    let o = guilds[l]
                    if (o.deck.length <= c.deck.length){
                        guilds[l] = c
                    }
                  }
                  if(this.alldoged && this.alldoged.length >= 1) {
                      let index = this.alldoged.indexOf(guilds[l])
                      if(index > -1) {
                          guilds[l].weight = this.alldoged[index].weight
                      }
                  }
              }
          })
          guilds.sort( (a, b) => {
              let aHodls = a.deck.length
              let bHodls = b.deck.length
              if(b.weight && !a.weight) {
                  return 1
              } else if(a.weight && !b.weight) {
                  return -1
              } else if(b.weight && a.weight) {
                  if(b.weight !== a.weight) {
                      return b.weight - a.weight
                  } else {
                      return bHodls - aHodls
                  }
              }
          })

          if (guilds.length > 11){
              guilds = guilds.slice(0, 11)
          }

          return guilds
      },
      alldoged(){
          let news = []
          this.$store.getters.memberIds.forEach(mId => {
              let member = this.$store.getters.hashMap[mId]
              let lastUsed
              this.$store.state.members.forEach( m => {
                  if(m.memberId === mId){
                      lastUsed = m.lastUsed
                  }
              })
              if(member && lastUsed) {
                  let presence = (Date.now() - lastUsed) <= (3600000 * 4)
                  if(presence && member.priorities) {
                      member.priorities.forEach(p => {
                          let priority = this.$store.getters.hashMap[p]
                          if(!priority.dogers) {
                              priority.dogers = []
                          }
                          priority.dogers.push(member.name)
                          if(!news.some((sp, i) => {
                              if(sp.taskId === p) {
                                  news[i].weight += 1 / member.priorities.length
                                  return true
                              }
                              return false
                          })) {
                              priority.weight = 1 / member.priorities.length
                              news.push(priority)
                          }
                      })
                  }
              }
          })
          // news.sort((a, b) => {
          //     return b.weight - a.weight
          // })
          if(news.length < 1) return
          return news
      },
  }
}

</script>

<style lang="stylus" scoped>

@import '../styles/colours'
@import '../styles/skeleton'
@import '../styles/button'
@import '../styles/title'

h1
    color: yellow

.topmission
    max-width: 30em
    margin-left: 50%
    transform: translateX(-50%)
    margin-bottom: 1em
</style>
