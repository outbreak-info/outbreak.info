<template>
<div class="epi-table">
  <h5>Most recent cases</h5>
  <table>
    <tr>
      <th>
        country
      </th>
      <th>
        total cases
      </th>
      <th>
        new cases
      </th>
      <th>
        percent increase
      </th>
      <th>
        date
      </th>
    </tr>
    <tr v-for="row in cases" v-bind:key="row.metadata.country">
      <td>
        {{ row.metadata.country}}
      </td>
      <td>
        {{ row.totalNum}}
      </td>
      <td>
        {{ row.numIncrease}}
      </td>
      <td>
        {{ row.pctIncrease}}
      </td>
      <td>
        {{ row.currentDate}}
      </td>
    </tr>
  </table>
</div>
</template>

<script lang="ts">
import Vue from "vue";
import { cloneDeep } from "lodash";
import { format, timeFormat } from "d3";

const formatDate = timeFormat("%a %d %b %Y");
const formatPercent = format(".0%");

export default Vue.extend({
  name: "EpiTable",
  components: {},
  props: {
    data: Array
  },
  data() {
    return {
      formatDate,
      cases: null
    }
  },
  watch: {
    data: function() {
      console.log('data changed!')
      console.log(this.data);
      this.prepData();
    }
  },
  mounted() {
    console.log()
  },
  methods: {
    prepData() {
      this.cases = cloneDeep(this.data);

      this.cases.forEach(d => {
        const last2 = d.data.slice(-2);
        d['numIncrease'] = last2[1].cases - last2[0].cases;
        d['pctIncrease'] = formatPercent(d.numIncrease / last2[0].cases);
        d['currentDate'] = formatDate(last2[1].date);
        d['totalNum'] = last2[1].cases;
      });

      this.cases.sort((a, b) => b.numIncrease - a.numIncrease);

    }
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
</style>
