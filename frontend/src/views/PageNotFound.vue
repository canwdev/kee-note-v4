<template>
  <div class="page-not-found" style="padding: 50px; text-align: center">
    <h1>Page Not Found</h1>
    <div>
      <RouterLink to="/">Home</RouterLink>
    </div>
  </div>
</template>

<script lang="ts">
import {defineComponent} from 'vue'

export default defineComponent({
  name: 'PageNotFound',
})
</script>
