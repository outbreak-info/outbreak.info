<template>
<div>
  <Warning :animate="false" class="mt-2" text="Case counts will increase when testing becomes more prevalent. So be careful how you interpret these doubling rates: rate of testing could confound the interpretation of doubling rates.">
  </Warning>

  <h4 class="mt-3">How quickly are <select v-model="selectedVariable" class="select-dropdown" @change="changeVariable">
      <option v-for="option in variableOptions" :value="option.value" :key="option.value">
        {{ option.label }}
      </option>
    </select> doubling?
  </h4>

  <RegionMap />

</div>
</template>


<script lang="js">
import Vue from "vue";
import {
  getAllDoubling
} from "@/api/calc-doubling.js";


import {
  selectAll
} from "d3";

import DoublingCurve from "@/components/DoublingCurve.vue";
import Warning from "@/components/Warning.vue";
import RegionMap from "@/components/RegionMap.vue";

export default Vue.extend({
  name: "DoublingRates",
  components: {
    RegionMap,
    // DoublingCurve,
    Warning,
  },
  data() {
    return {
      selectedVariable: "confirmed",
      variableOptions: [{
        label: "Cases",
        value: "confirmed"
      }, {
        label: "Deaths",
        value: "dead"
      }],
      data: null,
      dataSubscription: null,
    }
  },
  computed: {},
  methods: {
    changeParams: function(newVar) {
      this.updateData();
      this.$router.push({
        path: "doubling-rates",
        query: {
          // location: this.locationID,
          variable: this.variable
        }
      })
    },
    // setLocation: function(result) {
    //   this.locationID = result;
    //   this.updateData();
    // },
    updateData: function() {
      this.dataSubscription = getAllDoubling(this.$apiurl, this.variable).subscribe(results => {
        console.log(this.data)
        this.data = results;
      })
    }
  },
  mounted() {
    this.variable = this.$route.query.variable ? this.$route.query.variable : "confirmed";
    this.updateData();
  },
  beforeDestroy() {
    this.dataSubscription.unsubscribe();
  }
});
</script>

<style lang="scss">
.wb-region {
    cursor: pointer;
}
.east_asia {
    fill: #507ea3;
}
.north_america {
    fill: #f28e2c;
}

.africa {
    fill: #e15759;
}

.europe {
    fill: #76b7b2;
}

.middle_east {
    fill: #59a14f;
}

.lac {
    fill: #edc949;
}

.south_asia {
    fill: #b475a3;
}
</style>
