<template>
<div class="epi-table my-3" v-if="data && data.length > 0">
  <div class="d-flex justify-content-center py-5">
    <div>
      <h4>Most Recent Cases</h4>
      <DataUpdated />
      <div class="d-flex mt-4">
        <input v-model="searchInput" @input="filterHits" type="text" class="form-control mr-5" id="filter-locations" placeholder="Search" aria-label="search" aria-describedby="sb"/>
        <select v-model="numPerPage" @change="changePageNum()">
          <option v-for="option in pageOpts" :value="option" :key="option">
            {{ option }} results
          </option>
        </select>
      </div>
    </div>
  </div>
  <table class="m-auto">
    <tr>
      <th class="align-left sortable td-location" @click="sortLocation()">
        <div class="sort-grp">
          location
          <font-awesome-icon :class="[locationSort ? 'hidden' : 'sort-hover']" :icon="['fas', 'sort']" />
          <font-awesome-icon class="sort-btn" :icon="['fas', 'arrow-up']" v-if="locationSort === 'asc'" />
          <font-awesome-icon class="sort-btn" :icon="['fas', 'arrow-down']" v-if="locationSort === 'desc'" />
        </div>
      </th>
      <!-- <th class="px-3">
          updated
        </th> -->
      <th class="px-3 sortable td-total" @click="sortTotal()">
        <div class="sort-grp">
          total cases
          <font-awesome-icon :class="[totalSort ? 'hidden' : 'sort-hover']" :icon="['fas', 'sort']" />
          <font-awesome-icon class="sort-btn" :icon="['fas', 'arrow-up']" v-if="totalSort === 'asc'" />
          <font-awesome-icon class="sort-btn" :icon="['fas', 'arrow-down']" v-if="totalSort === 'desc'" />
        </div>
      </th>
      <th class="px-2 sortable td-new-cases" @click="sortNew()">
        <div class="sort-grp">
          new cases today
          <font-awesome-icon :class="[newSort ? 'hidden' : 'sort-hover']" :icon="['fas', 'sort']" />
          <font-awesome-icon class="sort-btn" :icon="['fas', 'arrow-up']" v-if="newSort === 'asc'" />
          <font-awesome-icon class="sort-btn" :icon="['fas', 'arrow-down']" v-if="newSort === 'desc'" />
        </div>
      </th>
      <th class="px-2 sortable td-pct-increase" @click="sortPct()">
        <div class="sort-grp">
          increase from yesterday
          <font-awesome-icon :class="[pctSort ? 'hidden' : 'sort-hover']" :icon="['fas', 'sort']" />
          <font-awesome-icon class="sort-btn" :icon="['fas', 'arrow-up']" v-if="pctSort === 'asc'" />
          <font-awesome-icon class="sort-btn" :icon="['fas', 'arrow-down']" v-if="pctSort === 'desc'" />
        </div>
      </th>
      <th class="td-sparkline">
        cases over time
      </th>
    </tr>
    <tr v-for="row in filteredCases" v-bind:key="row.locationName">
      <td class="align-left px-3 location color-bar" v-bind:style="{ 'border-color': row.color }">
        <router-link :to="{
              name: 'Epidemiology',
              query: { location: row.locationName }
            }" class="router-link-black" v-if="routable">
          {{ row.locationName }}</router-link>
        <span v-else>{{ row.locationName }}</span>
      </td>
      <!-- <td>
          {{ row.currentDateFormatted }}
        </td> -->
      <td>
        {{ row.totalNumFormatted }}
      </td>
      <td>
        {{ row.numIncreaseFormatted }}
      </td>
      <td>
        {{ row.pctIncreaseFormatted }}
      </td>
      <td>
        <Sparkline :data="[row.data]" :width="100" :height="23" :id="row.id" :color="row.color" />
      </td>
    </tr>
  </table>
  <br />
  <div class="pagination mt-2 d-flex align-items-center justify-content-between w-50 m-auto">
    <button class="pagination-btn pagination-left" :class="{ disabled: page === 0 }" @click="changePage(-1)">
      <font-awesome-icon :icon="['fas', 'arrow-left']" />
    </button>
    <small>viewing locations {{ lowerLim + 1 }} &minus; {{ upperLim }} of
      {{ total }}</small>
    <button class="pagination-btn pagination-left" :class="{ disabled: page === lastPage }" @click="changePage(1)">
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
import DataUpdated from "@/components/DataUpdated.vue";
import Sparkline from "@/components/Sparkline.vue";

// --- font awesome --
import {
  FontAwesomeIcon
} from "@fortawesome/vue-fontawesome";
import {
  library
} from "@fortawesome/fontawesome-svg-core";
import {
  faArrowUp,
  faArrowDown,
  faArrowLeft,
  faArrowRight,
  faSort
} from "@fortawesome/free-solid-svg-icons";

library.add(faArrowUp);
library.add(faArrowDown);
library.add(faArrowLeft);
library.add(faArrowRight);
library.add(faSort);

import store from "@/store";

const formatDate = timeFormat("%a %d %b %Y");

export default Vue.extend({
  name: "EpiTable",
  components: {
    FontAwesomeIcon,
    DataUpdated,
    Sparkline
  },
  props: {
    data: Array,
    routable: Boolean,
    colorScale: Function
  },
  data() {
    return {
      formatDate,
      cases: null,
      searchInput: "",
      filteredCases: null,
      locationSort: null,
      newSort: null,
      pctSort: null,
      totalSort: null,
      page: 0,
      numPerPage: 10,
      pageOpts: [5, 10, 50, 100]
    };
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
      return this.cases ? this.cases.length : null;
    },
    lastPage: function() {
      return this.cases ?
        Math.floor(this.cases.length / this.numPerPage) :
        null;
    }
  },
  methods: {
    sortLocation() {
      // backwards, since it reflects the previous value
      if (this.locationSort === "asc") {
        this.cases.sort((a, b) => (a.locationName > b.locationName ? -1 : 1));
        this.locationSort = "desc";
      } else {
        this.cases.sort((a, b) => (a.locationName < b.locationName ? -1 : 1));
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
      if (this.totalSort === "asc") {
        this.cases.sort((a, b) => a.currentCases - b.currentCases);
        this.totalSort = "desc";
      } else {
        this.cases.sort((a, b) => b.currentCases - a.currentCases);
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
      if (this.newSort === "asc") {
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
      if (this.pctSort === "asc") {
        this.cases.sort((a, b) => a.pctIncrease - b.pctIncrease);
        this.pctSort = "desc";
      } else {
        this.cases.sort((a, b) => b.pctIncrease - a.pctIncrease);
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
    changePageNum() {
      this.filterCases();
    },
    prepData() {
      this.cases = cloneDeep(this.data);

      this.cases.forEach(d => {
        // d["currentDateFormatted"] = formatDate(d.currentDate);
        d["numIncreaseFormatted"] = d.numIncrease.toLocaleString();
        d["pctIncreaseFormatted"] = this.formatPercent(d.pctIncrease);
        d["totalNumFormatted"] = d.currentCases.toLocaleString();
        d["color"] = this.colorScale(d.locationName);
      });

      this.sortTotal();
    },
    filterCases() {
      this.filteredCases = this.cases.slice(this.lowerLim, this.upperLim);
    },
    filterHits() {
      this.filteredCases = this.cases.filter(d => d.locationName.toLowerCase().includes(this.searchInput.toLowerCase())).slice(this.lowerLim, this.upperLim);
    },
    formatPercent(pct) {
      if (!pct) {
        return "none";
      }

      if (pct < 0) {
        return "case count corrected";
      }

      if (pct < 0.005) {
        return "< 1%";
      }

      if (!isFinite(pct)) {
        return "* first reported case *";
      }

      return format(".0%")(pct);
    }
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
.td-location {
    width: 140px;
}
.td-pct-increase {
    width: 90px;
}
.td-new-cases {
    width: 70px;
}
.td-total {
    width: 70px;
}

.sortable {
    cursor: pointer;
}

.header {
    width: 100%;
}

</style>
