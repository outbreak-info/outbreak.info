<template>
<div>
  LOCATION REPORT
</div>
</template>

<script>
import Vue from "vue";

export default {
  name: "LocationReport",
  props: {
    country: String,
    division: String,
    muts: Array,
    pango: Array
  }
}
</script>
