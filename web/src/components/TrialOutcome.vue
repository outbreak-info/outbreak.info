<template>
<div>


  <div class="orange-title uppercase mt-2">
    Primary
  </div>
  <ul>
    <li v-for="(outcome,idx) in primary" :key="idx">
      {{outcome.outcomeMeasure}} <span v-if="outcome.outcomeTimeFrame">({{outcome.outcomeTimeFrame}})</span>
    </li>
  </ul>
  <template v-if="secondary.length">
    <div class="orange-title uppercase">
      secondary
    </div>
    <ul>
      <li v-for="(outcome,idx) in secondary" :key="idx">
        {{outcome.outcomeMeasure}} <span v-if="outcome.outcomeTimeFrame">({{outcome.outcomeTimeFrame}})</span>
      </li>
    </ul>
  </template>
</div>
</template>

<script>
export default {
  name: "TrialOutcome",
  props: {
    data: Array
  },
  computed: {
    primary() {
      return this.data.filter(d => d.outcomeType === "primary");
    },
    secondary() {
      return this.data.filter(d => d.outcomeType !== "primary");
    }
  },
  data() {
    return {}
  }
};
</script>

<style lang="scss" scoped>
</style>
