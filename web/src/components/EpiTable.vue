<template>
<div class="epi-table my-3" v-if="data && data.length > 0">
  <h4>Most recent cases</h4>
  <table>
    <tr>
      <th class="align-left sortable location" @click="sortLocation()">
        <div class="sort-grp">
          location
          <font-awesome-icon :class="[locationSort ? 'hidden' : 'sort-hover']" :icon="['fas', 'sort']" />
          <font-awesome-icon class="sort-btn" :icon="['fas', 'arrow-up']" v-if="locationSort === 'asc'" />
          <font-awesome-icon class="sort-btn" :icon="['fas', 'arrow-down']" v-if="locationSort === 'desc'" />
        </div>
      </th>
      <th class="px-3">
        updated
      </th>
      <th class="px-3 sortable total" @click="sortTotal()">
        <div class="sort-grp">
          total cases
          <font-awesome-icon :class="[totalSort ? 'hidden' : 'sort-hover']" :icon="['fas', 'sort']" />
          <font-awesome-icon class="sort-btn" :icon="['fas', 'arrow-up']" v-if="totalSort === 'asc'" />
          <font-awesome-icon class="sort-btn" :icon="['fas', 'arrow-down']" v-if="totalSort === 'desc'" />
        </div>
      </th>
      <th class="px-2 sortable new-cases" @click="sortNew()">
        <div class="sort-grp">
          new cases today
          <font-awesome-icon :class="[newSort ? 'hidden' : 'sort-hover']" :icon="['fas', 'sort']" />
          <font-awesome-icon class="sort-btn" :icon="['fas', 'arrow-up']" v-if="newSort === 'asc'" />
          <font-awesome-icon class="sort-btn" :icon="['fas', 'arrow-down']" v-if="newSort === 'desc'" />
        </div>
      </th>
      <th class="px-2 sortable pct-increase" @click="sortPct()">
        <div class="sort-grp">
          increase from yesterday
          <font-awesome-icon :class="[pctSort ? 'hidden' : 'sort-hover']" :icon="['fas', 'sort']" />
          <font-awesome-icon class="sort-btn" :icon="['fas', 'arrow-up']" v-if="pctSort === 'asc'" />
          <font-awesome-icon class="sort-btn" :icon="['fas', 'arrow-down']" v-if="pctSort === 'desc'" />
        </div>
      </th>

    </tr>
    <tr v-for="row in filteredCases" v-bind:key="row.placeName">
      <td class="align-left px-3 location color-bar" v-bind:style="{'border-color': row.color}">
        <router-link :to="{ name: 'Epidemiology', query: { location: row.placeName } }" class="router-link-black" v-if="routable">
          {{ row.placeName}}</router-link>
        <span v-else>{{ row.placeName }}</span>
      </td>
      <td>
        {{ row.currentDate }}
      </td>
      <td>
        {{ row.totalNumFormatted}}
      </td>
      <td>
        {{ row.numIncreaseFormatted }}
      </td>
      <td>
        {{ row.pctIncrease }}
      </td>

    </tr>
  </table>
  <div class="pagination mt-2 flex align-items-center flex-space-between">
    <button class="pagination-btn pagination-left" :class="{'disabled': page === 0}" @click="changePage(-1)">
      <font-awesome-icon :icon="['fas', 'arrow-left']" />
    </button>
    <small>viewing locations {{lowerLim + 1}} &minus; {{ upperLim }} of {{total}}</small>
    <button class="pagination-btn pagination-left" :class="{'disabled' : page === lastPage}" @click="changePage(1)">
      <font-awesome-icon :icon="['fas', 'arrow-right']" />
    </button>
  </div>
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

// --- font awesome --
import {
  FontAwesomeIcon
} from '@fortawesome/vue-fontawesome'
import {
  library
} from '@fortawesome/fontawesome-svg-core';
import {
  faArrowUp,
  faArrowDown,
  faArrowLeft,
  faArrowRight,
  faSort
} from '@fortawesome/free-solid-svg-icons';

library.add(faArrowUp);
library.add(faArrowDown);
library.add(faArrowLeft);
library.add(faArrowRight);
library.add(faSort);

import store from '@/store';

const formatDate = timeFormat("%a %d %b %Y");

export default Vue.extend({
  name: "EpiTable",
  components: {
    FontAwesomeIcon
  },
  props: {
    data: Array,
    routable: Boolean
  },
  data() {
    return {
      formatDate,
      cases: null,
      filteredCases: null,
      locationSort: null,
      newSort: null,
      pctSort: null,
      totalSort: null,
      page: 0,
      numPerPage: 10
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
  computed: {
    lowerLim: function() {
      return this.page * this.numPerPage;
    },
    upperLim: function() {
      const upper = this.page * this.numPerPage + this.numPerPage;
      return upper > this.total ? this.total : upper;
    },
    total: function() {
      return this.cases.length;
    },
    lastPage: function() {
      return Math.floor(this.cases.length / this.numPerPage);
    }
  },
  methods: {
    sortLocation() {
      // backwards, since it reflects the previous value
      if ((this.locationSort === "asc")) {
        this.cases.sort((a, b) => a.placeName > b.placeName ? -1 : 1);
        this.locationSort = "desc";
      } else {
        this.cases.sort((a, b) => a.placeName < b.placeName ? -1 : 1);
        this.locationSort = "asc";
      }
      // reset other sorting funcs
      this.newSort = null;
      this.totalSort = null;
      this.pctSort = null;
      this.filterCases();
    },
    sortTotal() {
      // backwards, since it reflects the previous value
      if ((this.totalSort === "asc")) {
        this.cases.sort((a, b) => a.totalNum - b.totalNum);
        this.totalSort = "desc";
      } else {
        this.cases.sort((a, b) => b.totalNum - a.totalNum);
        this.totalSort = "asc";
      }
      // reset other sorting funcs
      this.newSort = null;
      this.locationSort = null;
      this.pctSort = null;

      this.filterCases();
    },
    sortNew() {
      // backwards, since it reflects the previous value
      if ((this.newSort === "asc")) {
        this.cases.sort((a, b) => a.numIncrease - b.numIncrease);
        this.newSort = "desc";
      } else {
        this.cases.sort((a, b) => b.numIncrease - a.numIncrease);
        this.newSort = "asc";
      }
      // reset other sorting funcs
      this.locationSort = null;
      this.totalSort = null;
      this.pctSort = null;
      this.filterCases();
    },
    sortPct() {
      // backwards, since it reflects the previous value
      if ((this.pctSort === "asc")) {
        this.cases.sort((a, b) => a.pct - b.pct);
        this.pctSort = "desc";
      } else {
        this.cases.sort((a, b) => b.pct - a.pct);
        this.pctSort = "asc";
      }
      // reset other sorting funcs
      this.newSort = null;
      this.totalSort = null;
      this.locationSort = null;
      this.filterCases();
    },
    changePage(step) {
      this.page += step;
      this.filterCases();
    },
    prepData() {
      this.cases = cloneDeep(this.data);
      console.log(this.cases)

      this.cases.forEach(d => {
        const last2 = d.data.slice(-2);
        console.log(last2)
        d['numIncreaseFormatted'] = (last2[1].cases - last2[0].cases).toLocaleString();
        d['numIncrease'] = last2[1].cases - last2[0].cases;
        d['pct'] = d.numIncrease / last2[0].cases;
        d['pctIncrease'] = this.formatPercent(d.numIncrease / last2[0].cases);
        d['currentDate'] = formatDate(last2[1].date);
        d['totalNum'] = last2[1].cases;
        d['totalNumFormatted'] = last2[1].cases.toLocaleString();
        d['color'] = this.colorScale(d.placeName);
      });

      this.sortTotal();
    },
    filterCases() {
      this.filteredCases = this.cases.slice(this.lowerLim, this.upperLim);
    },
    formatPercent(pct) {
      if (pct === 0) {
        return ("none");
      }

      if (pct < 0.005) {
        return ("< 1%");
      }

      if (!isFinite(pct)) {
        return ("* first reported case *");
      }

      return (format(".0%")(pct));
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
h4 {
    margin: 0;
}
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
    text-align: center;
}

th {
    font-size: 0.95em;
    font-weight: 400;
    color: $grey-70;
}

.sort-hover {
    display: none;
}

.sort-grp.hover .sort-hover,
.sort-grp:hover .sort-hover {
    display: inline;
}

.color-bar {
    border-left-width: 4px;
    border-left-style: solid;
    padding-left: 5px !important;
    // background: #00BCD4;
    // width: 4px;
    // height: 100%;
}

// widths
.location {
    width: 150px;
}
.pct-increase {
    width: 160px;
}
.new-cases {
    width: 120px;
}
.total {
    width: 100px;
}

.sortable {
    cursor: pointer;
}
</style>
