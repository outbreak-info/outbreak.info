<template>
<div class="at-a-glance box-shadow p-2">
  <router-link class="no-underline" :data-tippy-info="`view ${data.name} over time`" :to="{
          name: 'Epidemiology',
          query: { location: data.location_id }
        }">
    <h5 class="underline m-0">{{data.name}}</h5>
    <div class="text-muted badge bg-grey__lightest">
      {{updatedDate}}
    </div>

<div class="d-flex">
    <div class="d-flex align-items-end justify-content-start router-link-black mr-2 p-1">

      <div class="d-flex flex-column text-left">
        <h6>cases</h6>
        <div>
          {{cases}}: today
        </div>
        <div>
          {{casesYesterday}}: yesterday
        </div>
      </div>
        <svg class="mx-1" height="3em" width="20px">
          <defs>
            <marker id="arrow" markerWidth="13" markerHeight="10" refX="9" refY="5" orient="auto" markerUnits="strokeWidth">
              <path d="M5,0 L12,5 L5,10" class="swoopy-arrowhead" />
            </marker>
          </defs>
          <path marker-end="url(#arrow)" d="M 5, 40 C 20, 35 20, 10 5, 10" class="swoopy-arrow"></path>
        </svg>
      <div class="d-flex flex-column number-changes">
        <div>
          + {{casesIncrease}}
        </div>
        <div>
          <font-awesome-icon class="increasing" :icon="['fas', 'arrow-up']" v-if="data.confirmed_currentPctIncrease > 0" /> {{casesPct}}
        </div>
      </div>
    </div>

    <div class="d-flex align-items-end justify-content-start router-link-black ml-2 p-1 pl-2" id="deaths">

      <div class="d-flex flex-column text-left">
        <h6>deaths</h6>
        <div>
          {{deaths}}: today
        </div>
        <div>
          {{deadYesterday}}: yesterday
        </div>
      </div>
      <svg class="mx-1" height="3em" width="20px">
        <defs>
          <marker id="arrow" markerWidth="13" markerHeight="10" refX="9" refY="5" orient="auto" markerUnits="strokeWidth">
            <path d="M5,0 L12,5 L5,10" class="swoopy-arrowhead" />
          </marker>
        </defs>
        <path marker-end="url(#arrow)" d="M 5, 40 C 20, 35 20, 10 5, 10" class="swoopy-arrow"></path>
      </svg>
      <div class="d-flex flex-column number-changes">
        <div>
          + {{deadIncrease}}
        </div>
        <div>
        <font-awesome-icon class="increasing" :icon="['fas', 'arrow-up']" v-if="data.dead_currentPctIncrease > 0" /> {{deadPct}}
        </div>
      </div>
    </div>
    </div>
    <div class="d-flex router-link-black mini-graphs mt-2 p-1">
      <div class="d-flex flex-column">
        <h6>cumulative cases</h6>
          <Sparkline :data="[data.longitudinal]" variable="confirmed" :width="150" :height="40" :id="idx" :color="'#126B93'" />
      </div>
      <div class="d-flex flex-column ml-4">
        <h6>new cases per day</h6>
          <Bargraph :data="data.longitudinal" variable="confirmed_numIncrease" :width="150" :height="40" :id="idx" :color="'#126B93'" />
      </div>
    </div>
  </router-link>

</div>
</template>

<script lang="ts">
import Vue from "vue";
import {
  format
} from "d3";

// --- font awesome --
import {
  FontAwesomeIcon
} from "@fortawesome/vue-fontawesome";
import {
  library
} from "@fortawesome/fontawesome-svg-core";
import {
  faArrowUp
} from "@fortawesome/free-solid-svg-icons";

library.add(faArrowUp);

import Sparkline from "@/components/Sparkline.vue";
import Bargraph from "@/components/Bargraph.vue";

export default Vue.extend({
  name: "GlanceSummary",
  props: {
    data: Object,
    idx: Number
  },
  data() {
    return {};
  },
  watch: {},
  components: {
    FontAwesomeIcon,
    Sparkline,
    Bargraph
  },
  methods: {
    formatPct(value) {
      return (format(".0%")(value))
    }
  },
  computed: {
    updatedDate() {
      return this.data.confirmed_currentToday
    },
    cases() {
      return this.data.confirmed_currentCases.toLocaleString();
    },
    casesIncrease() {
      return this.data.confirmed_currentIncrease.toLocaleString();
    },
    casesPct() {
      return this.formatPct(this.data.confirmed_currentPctIncrease);
    },
    casesYesterday() {
      return (this.data.confirmed_currentCases - this.data.confirmed_currentIncrease).toLocaleString();
    },
    deaths() {
      return this.data.dead_currentCases.toLocaleString();
    },
    deadIncrease() {
      return this.data.dead_currentIncrease.toLocaleString();
    },
    deadPct() {
      return this.formatPct(this.data.dead_currentPctIncrease);
    },
    deadYesterday() {
      return (this.data.dead_currentCases - this.data.dead_currentIncrease).toLocaleString();
    }
  }
});
</script>


<style lang="scss" scoped>
.at-a-glance {
  background: white;
}
.underline:hover {
    text-decoration: underline;
}
#deaths {
  border-left: 1px dashed $base-grey;
}
.number-changes {
  color: $warning-color;
}
.mini-graphs {
  border-top: 1px dashed $grey-40;
}
</style>
