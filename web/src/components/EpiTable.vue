<template>
<div class="epi-table">
  <h5>Most recent cases</h5>
  <table>
    <tr>
      <th class="align-left">
        location
      </th>
      <th class="px-3">
        updated
      </th>
      <th class="px-3">
        total cases
      </th>
      <th class="px-2">
        new cases today
      </th>
      <th class="px-2">
        increase from yesterday
      </th>

    </tr>
    <tr v-for="row in cases" v-bind:key="row.placeName">
      <td class="align-left px-3 location color-bar" v-bind:style="{'border-color': row.color}">
        {{ row.placeName}}
      </td>
      <td>
        {{ row.currentDate }}
      </td>
      <td>
        {{ row.totalNum}}
      </td>
      <td>
        {{ row.numIncrease.toLocaleString() }}
      </td>
      <td>
        {{ row.pctIncrease }}
      </td>

    </tr>
  </table>
</div>
</template>

<script lang="ts">
import Vue from "vue";
import {
  cloneDeep
} from "lodash";
import {
  format,
  timeFormat
} from "d3";

import store from '@/store';

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
      this.prepData();
    }
  },
  mounted() {
    if (this.data) {
      this.prepData();
    }
  },
  methods: {
    prepData() {
      this.cases = cloneDeep(this.data);

      this.cases.forEach(d => {
        const last2 = d.data.slice(-2);
        d['numIncrease'] = (last2[1].cases - last2[0].cases).toLocaleString();
        d['pctIncrease'] = formatPercent(d.numIncrease / last2[0].cases);
        d['currentDate'] = formatDate(last2[1].date);
        d['totalNum'] = last2[1].cases.toLocaleString();
        d['color'] = this.colorScale(d.placeName);
      });

      this.cases.sort((a, b) => b.numIncrease - a.numIncrease);

    },
    colorScale: function(location) {
      const scale = store.getters['colors/getColor'];
      return (scale(location))
    },
  }
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.align-left {
    text-align: left;
}

table {
    border-collapse: collapse;
    font-size: 0.85em;
}

tr {
    border-bottom: 1px solid #ececec;
    // border-bottom: 1px solid $grey-40;
}

td {
    padding: 5px 0;
}

th {
    font-size: 0.95em;
    font-weight: 400;
    color: $grey-70;
}

.color-bar {
    border-left-width: 4px;
    border-left-style: solid;
    padding-left: 5px !important;
    // background: #00BCD4;
    // width: 4px;
    // height: 100%;
}
</style>
