<template lang="pug">

.app(v-bind:class="{ xAxis: !$store.state.upgrades.zoom, paintbrush: $store.state.upgrades.paintbrushColor }")
	contexts
	sun
	helm
	bull
	loader
	event-feed
	status
	task-create(:key='$router.currentRoute.path')
	portal
	router-view
</template>

<script>
  import EventFeed from './components/EventFeed'
  import Sun from './components/Sun'
  import Bull from './components/Bull'
  import Loader from './components/Loader'
  import Helm from './components/Helm'
  import Status from './components/Status'
  import Portal from './components/Portal'
  import Contexts from './components/Contexts'
  import TaskCreate from './components/TaskCreate'

  export default {
    mounted() {
      let token = window.localStorage.token
      let session = window.localStorage.session
      if (token && session) {
        this.$store.commit('setAuth', { token, session })
      }
      this.$store.dispatch('connectSocket')
      this.$store.dispatch('loadCurrent')
    },
    components: {
      EventFeed,
      Sun,
      Bull,
      Loader,
      Helm,
      Status,
      Portal,
      TaskCreate,
      Contexts
    }
  }
</script>

<style lang="stylus">
  @import './styles/normalize';
  @import './styles/colours';

  .app {
    font-weight: lighter;
  }

  .app.paintbrush {
    cursor: crosshair;
  }

  body {
    background: main;
  }

  p {
    margin-top: 0;
    margin-bottom: 0;
  }

  .xAxis {
    overflow-X: hidden;
  }
</style>
