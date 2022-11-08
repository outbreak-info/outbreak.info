<template>
  <div
    v-if="data"
    class="doubling-table my-3 d-flex flex-column align-items-center"
  >
    <h4>Doubling rates</h4>
    <SlopeComparison
      :slope1="data.fit1.slope"
      :slope2="data.fit2.slope"
      class="mb-2"
    />
    <DataUpdated class="mb-3" />

    <table class="m-auto">
      <tr>
        <th class="td-days" />
        <th class="td-doubling">
          doubling time (days)
        </th>
        <th class="td-slope">
          slope
        </th>
        <th class="td-r2">
          r
          <sup>2</sup>
        </th>
      </tr>
      <tr class="tr-current">
        <th>
          <!-- <button @click="selectPoints(1)" :class="{'disabled' : fitting2}">
          {{fitting1 ? "fit these points" : "change points to fit"}}
        </button> -->
          {{ fit2_dates }}
        </th>
        <td>
          {{ fit2_time }}
        </td>
        <td>
          {{ fit2_slope }}
        </td>
        <td>
          {{ fit2_r2 }}
        </td>
      </tr>
      <tr class="tr-previous">
        <th>
          <!-- <button @click="selectPoints(2)" :class="{'disabled' : fitting1}">
          {{fitting2 ? "fit these points" : "change points to fit"}}
        </button> -->
          {{ fit1_dates }}
        </th>
        <td>
          {{ fit1_time }}
        </td>
        <td>
          {{ fit1_slope }}
        </td>
        <td>
          {{ fit1_r2 }}
        </td>
      </tr>
      <tr class="change">
        <th>
          change from older data
        </th>
        <td :class="[change_time.worse ? 'worse' : 'better']">
          {{ change_time.label }}
          <font-awesome-icon
            v-if="!change_time.worse"
            class="better"
            :icon="['fas', 'arrow-up']"
          />
          <font-awesome-icon
            v-if="change_time.worse"
            class="worse"
            :icon="['fas', 'arrow-down']"
          />
        </td>
        <td
          class="better-worse text-left"
          colspan="2"
          :class="[change_time.worse ? 'worse' : 'better']"
        >
          {{ change_time.worse ? 'worse' : 'better' }}
          <!-- <span v-if="change_time.nearZero"> (negligible rate of change)</span> -->
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
import Vue from 'vue';
import cloneDeep from 'lodash/cloneDeep';
import { format, timeFormat } from 'd3';
import DataUpdated from '@/components/DataUpdated.vue';
import SlopeComparison from '@/components/SlopeComparison.vue';

// --- font awesome --
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faArrowUp,
  faArrowDown,
  faSort,
} from '@fortawesome/free-solid-svg-icons';

library.add(faArrowUp);
library.add(faArrowDown);
library.add(faSort);

import store from '@/store';

const formatDate = timeFormat('%d %b %Y');

export default Vue.extend({
  name: 'EpiTable',
  components: {
    FontAwesomeIcon,
    DataUpdated,
    SlopeComparison,
  },
  props: {
    data: Object,
    isFitting1: Boolean,
    isFitting2: Boolean,
  },
  data() {
    return {
      formatDate,
      fitting1: false,
      fitting2: false,
      customFit1: false,
      customFit2: false,
      cases: null,
      searchInput: '',
      filteredCases: null,
      locationSort: null,
      newSort: null,
      pctSort: null,
      totalSort: null,
      page: 0,
      numPerPage: 10,
      pageOpts: [5, 10, 50, 100],
    };
  },
  computed: {
    fit1_time() {
      return this.data.fit1.doublingTime || this.data.fit1.doublingTime === 0
        ? format(',.1f')(this.data.fit1.doublingTime)
        : 'NaN';
    },
    fit2_time() {
      return this.data.fit2.doublingTime || this.data.fit2.doublingTime === 0
        ? format(',.1f')(this.data.fit2.doublingTime)
        : 'NaN';
    },
    change_time() {
      return this.calcDiff();
    },
    fit1_dates() {
      return `${formatDate(this.data.fit1.xstart)} - ${formatDate(
        this.data.fit1.xend,
      )}`;
    },
    fit2_dates() {
      return `${formatDate(this.data.fit2.xstart)} - ${formatDate(
        this.data.fit2.xend,
      )}`;
    },
    fit1_slope() {
      return format('.2f')(this.data.fit1.slope);
    },
    fit2_slope() {
      return format('.2f')(this.data.fit2.slope);
    },
    fit1_r2() {
      return format('.2f')(Math.pow(this.data.fit1.R, 2));
    },
    fit2_r2() {
      return format('.2f')(Math.pow(this.data.fit2.R, 2));
    },
  },
  watch: {
    data() {},
    isFitting1(newValue) {
      this.fitting1 = !this.fitting1;
      this.$emit('changeFit', null);
    },
    isFitting2(newValue) {
      this.fitting2 = !this.fitting2;
      this.$emit('changeFit', null);
    },
  },
  methods: {
    selectPoints(idx) {
      const isSelecting = this[`fitting${idx}`];
      this[`fitting${idx}`] = !isSelecting;
      this[`customFit${idx}`] = true;

      if (isSelecting) {
        // selection is finished; run calculation of new data.
        this.$emit('changeFit', null);
      } else {
        this.$emit('changeFit', idx);
      }
    },
    calcDiff() {
      const diff = this.data.fit2.doublingTime - this.data.fit1.doublingTime;
      const label = diff
        ? format(',.1f')(diff)
        : 'not enough points to fit in older data';
      return {
        worse: diff < 0 || !this.data.fit1.doublingTime,
        label: label,
        nearZero: this.data.fit2.slope < 0.01,
      };
    },
    filterCases() {
      this.filteredCases = this.cases.slice(this.lowerLim, this.upperLim);
    },
    filterHits() {
      this.filteredCases = this.cases
        .filter((d) =>
          d.locationName.toLowerCase().includes(this.searchInput.toLowerCase()),
        )
        .slice(this.lowerLim, this.upperLim);
    },
    formatPercent(pct) {
      if (!pct) {
        return 'none';
      }

      if (pct < 0) {
        return 'case count corrected';
      }

      if (pct < 0.005) {
        return '< 1%';
      }

      if (!isFinite(pct)) {
        return '* first reported case *';
      }

      return format('.0%')(pct);
    },
  },
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
$fit1-color: #59a14f;
$fit2-color: #f28e2c;
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

.tr-current {
  background: lighten($fit2-color, 35%);
}
.tr-previous {
  background: lighten($fit1-color, 45%);
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
  padding: 5px;
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

.worse {
  color: $warning-color;
}

.better {
  color: $secondary-color;
}

.change {
  font-weight: 700;
}

.better-worse {
  opacity: 0.5;
  font-weight: 700;
  text-transform: uppercase;
}

// widths
.td-days {
  width: 60px;
}
.td-doubling {
  width: 75px;
}

.td-r2,
.td-slope {
  width: 50px;
}

.sortable {
  cursor: pointer;
}

.header {
  width: 100%;
}
</style>
