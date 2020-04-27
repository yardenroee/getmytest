<template>
      <side-bar>
      <!-- <user-menu></user-menu> -->
      <!-- <mobile-menu></mobile-menu> -->
      <template slot="links">
        <sidebar-item :link="{ name: 'Dashboard', icon: 'dashboard', path:'/dashboard' }"></sidebar-item>
        <!-- <sidebar-item :link="{ name: 'Private Dining', icon: 'store', path: '/restaurants' }"></sidebar-item> -->
        <!-- <sidebar-item :link="{ name: 'Catering', icon: 'local_bar', path: '/catering' }"></sidebar-item> -->
        <!-- <sidebar-item :link="{ name: 'Wifi', icon: 'rss_feed', path: '/wifi' }"></sidebar-item> -->
        <!-- <sidebar-item :link="{ name: 'Register', icon: 'add_circle_outline' }"> -->
        <!-- <sidebar-item :link="{ name: 'Register', path: '/register' }"></sidebar-item> -->
        </sidebar-item>
      </template>
    </side-bar>
</template>

<script>
export default {

}
</script>

<style>

</style>