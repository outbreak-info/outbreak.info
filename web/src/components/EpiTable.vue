<template>
<div class="epi-table my-3">
  <div class="p-2">
    <table class="m-auto">
      <tr class="table-header-merged">
        <th v-for="(column, idx) in mergedColumns" :key="idx" :colspan="column.colspan" :class="[column.colspan > 1 ? 'th-merged' : 'th-nomerge']">
          {{column.label}}
        </th>
        <th>

        </th>
      </tr>
      <tr class="table-header">
        <th v-for="(column, idx) in columns" :key="idx" :id="`th-${column.value}`" :class="{'sortable': column.sorted}" @click="sortColumn(column.sort_id)">
          <div class="sort-grp">
            {{column.label}}
            <font-awesome-icon :class="[column.sorted === 0 ? 'sort-hover' : 'hidden']" :icon="['fas', 'sort']" />
            <font-awesome-icon class="sort-btn" :icon="['fas', 'arrow-up']" v-if="column.sorted === -1" />
            <font-awesome-icon class="sort-btn" :icon="['fas', 'arrow-down']" v-if="column.sorted === 1" />
          </div>
        </th>
        <th id="td-outcomes">
          outcomes
        </th>
      </tr>

      <tr v-for="row in data" class="table-data" :key="row.location_id">
        <td v-for="(column, idx) in columns" :key="idx" :class="{'align-left px-3 location color-bar': column.label === 'location'}" :style="{ 'border-color': row.color }">
          <span v-if="column.label === 'location'">{{row[column.value]}}</span>
          <span v-else>{{row[column.value]}}</span>
        </td>
        <td>
          <RecoveredBar :data="row" />
        </td>
      </tr>

    </table>
  </div>
</div>
</template>

<script lang="js">
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
import RecoveredBar from "@/components/RecoveredBar.vue";

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
import {
  epiTableState$,
  getEpiTable
} from "@/api/epi-traces.js";

const formatDate = timeFormat("%a %d %b %Y");

export default Vue.extend({
  name: "EpiTable",
  components: {
    FontAwesomeIcon,
    // DataUpdated,
    // Sparkline,
    RecoveredBar
  },
  props: {
    locations: Array,
    routable: Boolean,
    colorScale: Function
  },
  data() {
    return {
      formatDate,
      data: [],
      cases: [],
      dataSubscription: null,
      changeDataSubscription: null,
      mergedColumns: [{
          label: "",
          colspan: 1
        }, {
          label: "",
          colspan: 1
        },
        {
          label: "CASES",
          colspan: 4
        },
        {
          label: "",
          colspan: 1
        }, {
          label: "DEATHS",
          colspan: 4
        }, {
          label: "RECOVERIES",
          colspan: 4
        }
      ],

      columns: [{
          label: "location",
          value: "name",
          sort_id: "name",
          sorted: 0,
          essential: true
        },
        {
          label: "country",
          value: "country_name",
          sort_id: "country_name",
          sorted: 0,
          essential: false
        },
        // {
        //   label: "region",
        //   value: "region_wb",
        //   sort_id: "region_wb",
        //   sorted: 0,
        //   essential: false
        // },
        {
          group: "cases",
          label: "total",
          value: "confirmed_cases",
          sort_id: "confirmed_currentCases",
          sorted: -1,
          essential: true
        },
        {
          group: "cases",
          label: "new today",
          value: "confirmed_increase",
          sort_id: "confirmed_currentIncrease",
          sorted: 0,
          essential: false
        },
        {
          group: "cases",
          label: "increase today",
          value: "confirmed_pctIncrease",
          sort_id: "confirmed_currentPctIncrease",
          sorted: 0,
          essential: true
        },
        {
          group: "cases",
          label: "per capita",
          value: "confirmed_percapita",
          sorted: null,
          essential: false
        },
        {
          label: "days between first case and death",
          value: "first_dead-first_confirmed",
          sort_id: "first_dead-first_confirmed",
          sorted: 0,
          essential: true
        },

        {
          group: "deaths",
          label: "total",
          value: "dead_cases",
          sort_id: "dead_currentCases",
          sorted: 0,
          essential: true
        },
        {
          group: "deaths",
          label: "new today",
          value: "dead_increase",
          sort_id: "dead_currentIncrease",
          sorted: 0,
          essential: false
        },
        {
          group: "deaths",
          label: "increase today",
          value: "dead_pctIncrease",
          sort_id: "deadd_currentPctIncrease",
          sorted: 0,
          essential: true
        },
        {
          group: "deaths",
          label: "per capita",
          value: "dead_percapita",
          sorted: null,
          essential: false
        },

        {
          group: "recoveries",
          label: "total",
          value: "recovered_cases",
          sort_id: "recovered_currentCases",
          sorted: 0,
          essential: true
        },
        {
          group: "recoveries",
          label: "new today",
          value: "recovered_increase",
          sort_id: "recovered_currentIncrease",
          sorted: 0,
          essential: false
        },
        {
          group: "recoveries",
          label: "increase today",
          value: "recovered_pctIncrease",
          sort_id: "recovered_currentPctIncrease",
          sorted: 0,
          essential: true
        },
        {
          group: "recoveries",
          label: "per capita",
          value: "recovered_percapita",
          sorted: null,
          essential: false
        }
      ],
      searchInput: "",
      filteredCases: null,
      sortVar: "-confirmed_currentCases",
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
  created() {
    // set up subscription here; listen for changes and execute in the watch.
    // Strangely, w/o the watch, the subscription doesn't seem to update...
    this.dataSubscription = epiTableState$.subscribe(data => {
      console.log("subscribing")
      console.log(data)
      this.data = data;
    })
  },
  beforeDestroy() {
    this.dataSubscription.unsubscribe();
    if (this.changeDataSubscription) {
      this.changeDataSubscription.unsubscribe();
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
    sortColumn(variable) {
      // reset other sorting funcs for arrow affordances
      const idx = this.columns.findIndex(d => d.sort_id === variable);
      if (this.columns[idx].sorted || this.columns[idx].sorted === 0) {

        this.sortVar = variable === this.sortVar ? `-${variable}` : variable;


        this.columns.forEach((d, i) => {
          if (i === idx) {
            d.sorted = d.sorted ? -1 * d.sorted : 1;
          } else {
            d.sorted = d.sorted || d.sorted === 0 ? 0 : null;
          }

        })

        this.changeDataSubscription = getEpiTable(this.$apiurl, this.locations, this.sortVar, 10, 0).subscribe(_ => null);
      }
    },
    changePage(step) {
      this.page += step;
      this.filterCases();
    },
    changePageNum() {
      this.filterCases();
    },
    prepData() {
      console.log("prepping data")
      this.data.forEach(d => {
        d["color"] = this.colorScale(d.location_id);
      });

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
    border-bottom: 1px solid #cacaca;
    // border-bottom: 1px solid $grey-40;
}

tr.table-header-merged {
    border-bottom: none;
    // border-bottom: 1px solid $grey-40;
}

.th-merged {
    border-bottom: 3px solid #cacaca;
}

.th-nomerge {
    border-bottom: none !important;
}

td {
    padding: 5px;
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
#th-name {
    width: 140px;
}

#th-first_dead-first_confirmed {
    width: 100px;
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
