<template>
  <div v-if="data && colorScale" class="epi-table my-3">
    <div class="m-auto d-flex justify-content-center py-5">
      <div>
        <h4>Latest Data</h4>

        <!-- Pagination -->
        <div class="d-flex justify-space-between mt-4">
          <!-- <input v-model="searchInput" @input="filterHits" type="text" class="form-control mr-5" id="filter-locations" placeholder="Search" aria-label="search" aria-describedby="sb" /> -->
          <div class="region-selector d-flex mr-5">
            <label class="b-contain m-auto pr-3">
              <span>World Bank Regions</span>
              <input
                v-model.lazy="selectedAdminLevels"
                type="checkbox"
                value="-1"
              />
              <div class="b-input" />
            </label>
            <label class="b-contain m-auto pr-3">
              <span>Countries</span>
              <input
                v-model.lazy="selectedAdminLevels"
                type="checkbox"
                value="0"
              />
              <div class="b-input" />
            </label>
            <label class="b-contain m-auto pr-3">
              <span>States/Provinces</span>
              <input
                v-model.lazy="selectedAdminLevels"
                type="checkbox"
                value="1"
              />
              <div class="b-input" />
            </label>
            <label class="b-contain m-auto pr-3">
              <span>U.S. Metropolitan Areas</span>
              <input
                v-model.lazy="selectedAdminLevels"
                type="checkbox"
                value="1.5"
              />
              <div class="b-input" />
            </label>
            <label class="b-contain m-auto pr-3">
              <span>U.S. Counties</span>
              <input
                v-model.lazy="selectedAdminLevels"
                type="checkbox"
                value="2"
              />
              <div class="b-input" />
            </label>
          </div>
          <select
            v-model="numPerPage"
            class="select-dropdown"
            @change="changePageNum()"
          >
            <option v-for="option in pageOpts" :key="option" :value="option">
              {{ option }} results
            </option>
          </select>
        </div>
      </div>
    </div>

    <div class="p-2">
      <table
        v-if="data && data.length > 0"
        class="m-auto table table-responsive"
      >
        <tr class="table-header-merged">
          <th
            v-for="(column, idx) in mergedColumns"
            :key="idx"
            :colspan="column.colspan"
            :class="[column.colspan > 1 ? 'th-merged' : 'th-nomerge']"
          >
            {{ column.label }}
          </th>
          <th />
        </tr>
        <tr class="table-header">
          <th
            v-for="(column, idx) in columns"
            :id="`th-${column.value}`"
            :key="idx"
            :class="{
              sortable: column.sorted,
              'd-none d-md-table-cell': !column.essential,
            }"
            @click="sortColumn(column.sort_id)"
          >
            <div class="sort-grp">
              {{ column.label }}
              <font-awesome-icon
                :class="[column.sorted === 0 ? 'sort-hover' : 'hidden']"
                :icon="['fas', 'sort']"
              />
              <font-awesome-icon
                v-if="column.sorted === 1"
                class="sort-btn"
                :icon="['fas', 'arrow-up']"
              />
              <font-awesome-icon
                v-if="column.sorted === -1"
                class="sort-btn"
                :icon="['fas', 'arrow-down']"
              />
            </div>
          </th>
        </tr>

        <tr v-for="row in data" :key="row.location_id" class="table-data">
          <td
            v-for="(column, idx) in columns"
            :key="idx"
            :class="{
              'align-left px-3 location color-bar': column.label === 'location',
              'd-none d-md-table-cell': !column.essential,
            }"
            :style="{ 'border-color': row.color }"
          >
            <!-- location -->
            <span v-if="column.label === 'location'">
              <!-- if routable -->
              <router-link
                v-if="routable"
                :to="{
                  name: 'Epidemiology',
                  query: { location: row.location_id },
                }"
                class="router-link font-weight-bold"
              >
                {{
                  row.admin_level === 2
                    ? row[column.value] + ', ' + row.admin1
                    : row[column.value]
                }}
                <font-awesome-icon
                  :icon="['fas', 'chevron-right']"
                  :style="{ color: row.color }"
                />
              </router-link>
              <!-- not routable location name -->
              <span v-else>
                {{
                  row.admin_level === 2
                    ? row[column.value] + ', ' + row.admin1
                    : row[column.value]
                }}
              </span>
            </span>
            <!-- spacer -->
            <span v-else-if="column.value === ''" class="spacer px-2" />
            <!-- sparklines -->
            <span
              v-else-if="column.value === 'confirmed_sparkline'"
              class="align-right"
            >
              {{ row[column.value] }}
              <Sparkline
                :id="row.location_id"
                :data="[row.longitudinal]"
                variable="confirmed"
                :width="80"
                :height="23"
                :color="row.color"
              />
            </span>
            <span v-else-if="column.value === 'dead_sparkline'">
              {{ row[column.value] }}
              <Sparkline
                :id="row.location_id"
                :data="[row.longitudinal]"
                variable="dead"
                :width="80"
                :height="23"
                :color="row.color"
              />
            </span>
            <span v-else-if="column.value === 'recovered_sparkline'">
              {{ row[column.value] }}
              <Sparkline
                :id="row.location_id"
                :data="[row.longitudinal]"
                variable="recovered"
                :width="80"
                :height="23"
                :color="row.color"
              />
            </span>
            <span
              v-else-if="column.value.includes('pctIncrease')"
              class="correction-explanation"
              :data-tippy-info="
                row[column.value] === 'case count corrected'
                  ? 'total was higher yesterday'
                  : null
              "
            >
              {{ row[column.value] }}
            </span>
            <span
              v-else-if="
                column.value.includes('dead') ||
                column.value.includes('recovered') ||
                column.value.includes('_increase')
              "
            >
              {{ row[column.value] ? row[column.value] : 0 }}
            </span>
            <!-- normal -->
            <span v-else>{{ row[column.value] }}</span>
          </td>
        </tr>
      </table>
    </div>
    <br />
    <div
      class="pagination mt-2 d-flex align-items-center justify-content-between w-50 m-auto"
    >
      <button
        aria-label="previous-button"
        class="pagination-btn pagination-left"
        :class="{ disabled: page === 0 }"
        @click="changePage(-1)"
      >
        <font-awesome-icon :icon="['fas', 'arrow-left']" />
      </button>
      <small>
        viewing locations {{ lowerLim + 1 }} &minus; {{ upperLim }} of
        {{ total }}
      </small>
      <button
        aria-label="next-button"
        class="pagination-btn pagination-left"
        :class="{ disabled: page === lastPage }"
        @click="changePage(1)"
      >
        <font-awesome-icon :icon="['fas', 'arrow-right']" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, inject, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { timeFormat } from 'd3-time-format';

import {
  epiTableState$,
  getEpiTable,
  getSparklineTraces,
} from '@/api/epi-traces.js';
import { lazyLoad } from '@/js/lazy-load';

import 'tippy.js/themes/light.css';

const _formatDate = timeFormat('%a %d %b %Y');

const Sparkline = lazyLoad('Sparkline');

const props = defineProps({
  locations: Array,
  routable: Boolean,
  colorScale: Function,
  colorVar: String,
});

const apiUrl = inject('apiUrl');

const formatDate = ref(_formatDate);
const data = ref([]);
const total = ref(0);
const dataSubscription = ref(null);
const changeDataSubscription = ref(null);
const sparksSubscription = ref(null);
const selectedAdminLevels = ref([0, 1, 1.5, 2]);
const mergedColumns = ref([
  {
    label: '',
    colspan: 1,
  },
  {
    label: '',
    colspan: 1,
  },
  {
    label: '',
    colspan: 1,
  },
  {
    label: 'CASES',
    colspan: 5,
  },
  {
    label: '',
    colspan: 1,
  },
  {
    label: 'DEATHS',
    colspan: 5,
  },
]);
const columns = ref([
  {
    label: 'location',
    value: 'name',
    sort_id: 'name',
    sorted: 0,
    essential: true,
  },
  {
    label: 'country',
    value: 'country_name',
    sort_id: 'country_name',
    sorted: 0,
    essential: false,
  },
  {
    label: '',
    value: '',
    sorted: null,
    essential: false,
  },
  {
    group: 'cases',
    label: 'total',
    value: 'confirmed_cases',
    sort_id: 'confirmed',
    sorted: -1,
    essential: true,
  },
  {
    group: 'cases',
    label: 'new today',
    value: 'confirmed_increase',
    sort_id: 'confirmed_numIncrease',
    sorted: 0,
    essential: false,
  },
  {
    group: 'cases',
    label: 'increase today',
    value: 'confirmed_pctIncrease',
    sort_id: 'confirmed_pctIncrease',
    sorted: 0,
    essential: true,
  },
  {
    group: 'cases',
    label: 'per capita',
    value: 'confirmed_percapita',
    sorted: null,
    essential: false,
  },
  {
    group: 'cases',
    label: 'change over time',
    value: 'confirmed_sparkline',
    sorted: null,
    essential: true,
  },
  {
    label: '',
    value: '',
    sorted: null,
    essential: false,
  },
  {
    group: 'deaths',
    label: 'total',
    value: 'dead_cases',
    sort_id: 'dead',
    sorted: 0,
    essential: true,
  },
  {
    group: 'deaths',
    label: 'new today',
    value: 'dead_increase',
    sort_id: 'dead_numIncrease',
    sorted: 0,
    essential: false,
  },
  {
    group: 'deaths',
    label: 'increase today',
    value: 'dead_pctIncrease',
    sort_id: 'dead_pctIncrease',
    sorted: 0,
    essential: true,
  },
  {
    group: 'deaths',
    label: 'per capita',
    value: 'dead_percapita',
    sorted: null,
    essential: false,
  },
  {
    group: 'deaths',
    label: 'change over time',
    value: 'dead_sparkline',
    sorted: null,
    essential: true,
  },
]);

const sortVar = ref('-confirmed');
const page = ref(0);
const numPerPage = ref(10);
const pageOpts = ref([5, 10, 50, 100]);

const lowerLim = computed(() => {
  return page.value * numPerPage.value;
});

const upperLim = computed(() => {
  const upper = page.value * numPerPage.value + numPerPage.value;
  return upper > total.value ? total.value : upper;
});

const lastPage = computed(() => {
  return total.value ? Math.floor(total.value / numPerPage.value) : null;
});

const sortColumn = (variable) => {
  // reset other sorting funcs for arrow affordances
  const idx = columns.value.findIndex((d) => d.sort_id === variable);

  if (columns.value[idx].sorted || columns.value[idx].sorted === 0) {
    // if the sort variable is the same, switch it.
    if (sortVar.value === variable) {
      sortVar.value = `-${variable}`;
    } else if (sortVar.value === `-${variable}`) {
      sortVar.value = variable;
    } else {
      sortVar.value = `-${variable}`;
    }
    columns.value.forEach((d, i) => {
      if (i === idx) {
        d.sorted = d.sorted ? -1 * d.sorted : -1;
      } else {
        d.sorted = d.sorted || d.sorted === 0 ? 0 : null;
      }
    });

    updateData();
  }
};

const updateData = () => {
  sparksSubscription.value = getSparklineTraces(
    apiUrl,
    props.locations,
  ).subscribe((_) => null);
  changeDataSubscription.value = getEpiTable(
    apiUrl,
    props.locations,
    selectedAdminLevels.value,
    sortVar.value,
    numPerPage.value,
    numPerPage.value * page.value,
  ).subscribe((_) => null);
};

const changePage = (step) => {
  page.value += step;
  updateData();
};

const changePageNum = () => {
  page.value = 0;
  updateData();
};

const prepData = () => {
  if (data.value) {
    data.value.forEach((d) => {
      d['color'] = props.colorScale(d[props.colorVar]);
    });
  }
};

watch(
  data,
  () => {
    prepData();
  },
  { deep: true },
);

watch(selectedAdminLevels, () => {
  updateData();
});

onMounted(() => {
  dataSubscription.value = epiTableState$.subscribe((res) => {
    data.value = res['data'];
    total.value = res['total'];

    if (data.value) {
      prepData();
    }
  });

  // this.$nextTick(() => {
  //   tippy(".correction-explanation", {
  //     content: null,
  //     maxWidth: "200px",
  //     placement: "bottom",
  //     animation: "fade",
  //     theme: "light",
  //     onShow(instance) {
  //       let info = instance.reference.dataset.tippyInfo;
  //       if (info){
  //         instance.setContent(info);
  //       }
  //     }
  //   });
  // })
});

onBeforeUnmount(() => {
  if (dataSubscription.value) {
    dataSubscription.value.unsubscribe();
  }

  if (changeDataSubscription.value) {
    changeDataSubscription.value.unsubscribe();
  }

  if (sparksSubscription.value) {
    sparksSubscription.value.unsubscribe();
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
  vertical-align: middle;
  border: none;
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
  border-left-width: 10px;
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

.align-right {
  align: right;
}

.outcome-legend {
  dominant-baseline: hanging;
  font-size: 0.9em;
}
.outcome-legend-rect {
  stroke: $base-grey;
  stroke-width: 0.5;
}
</style>
