<template>
<form class="mx-4" @submit.prevent="submitQuery">
  <h3>Select location</h3>
  <div class="d-flex align-items-center my-3">
    <div class="input-group">
      <div class="input-group-prepend">
        <span class="input-group-text bg-grey text-muted border-0" id="sb">
          <font-awesome-icon :icon="['fas', 'search']" />
        </span>
      </div>
      <TypeaheadSelect class="form-control mr-4" :isStandalone="false" :disabled="divisionSelected" :queryFunction="queryCountry" @selected="updateCountry" :apiUrl="this.$genomicsurl" placeholder="Select country" totalLabel="total sequences"
        :removeOnSelect="false" />
    </div>

    <p class="p-0 m-0 text-muted">or</p>

    <div class="input-group ml-4">
      <div class="input-group-prepend">
        <span class="input-group-text bg-grey text-muted border-0" id="sb">
          <font-awesome-icon :icon="['fas', 'search']" />
        </span>
      </div>
      <TypeaheadSelect class="form-control" :isStandalone="false" :disabled="countrySelected" :queryFunction="queryDivision" @selected="updateDivision" :apiUrl="this.$genomicsurl" placeholder="Select division (state)" totalLabel="total sequences"
        :removeOnSelect="false" />
    </div>
  </div>

  <div class="d-flex flex-column justify-content-center align-items-center w-100 mt-5">
    <button :disabled="!location" type="submit" class="btn btn-accent" :class="{'btn-lg': !minimalistic }" @click="submitQuery">Create {{location}} report</button>
  </div>

  <div class="my-5">
    <h3>Add lineages & mutations to track<span v-if="location"> in {{location}}</span></h3>
    <h6 class="text-muted">Optional: specify lineages and mutations to track in addition to the Variants of Concern and Interest we're tracking</h6>
    <b class="text-muted m-0 p-0">
      Default:
    </b>
    <div v-for="(type, tIdx) in curated" :key="tIdx" class="d-flex mb-3 align-items-center">
      <div class="mr-3">
        <small :class="{ 'VOC': type.key == 'Variant of Concern',  'VOI': type.key == 'Variant of Interest'}">{{type.key}}</small>
      </div>

      <button v-for="(variant, vIdx) in type.value" :key="vIdx" class="btn chip btn-outline-secondary bg-white">{{variant}}</button>
    </div>

    <b class="text-muted m-0 p-0">
      Custom additions:
    </b>

  </div>
</form>
</template>

<script>
import Vue from "vue";

import TypeaheadSelect from "@/components/TypeaheadSelect.vue";
import {
  getReportList,
  getSequenceCount,
  findCountry,
  findDivision
} from "@/api/genomics.js";

// --- font awesome --
import {
  FontAwesomeIcon
} from "@fortawesome/vue-fontawesome";
import {
  library
} from "@fortawesome/fontawesome-svg-core";
import {
  faSearch
} from "@fortawesome/free-solid-svg-icons";

library.add(faSearch);

export default {
  name: "CustomLocationForm",
  components: {
    TypeaheadSelect,
    FontAwesomeIcon
  },
  props: {
    minimalistic: {
      type: Boolean,
      default: false
    },
    curated: Array
  },
  methods: {
    submitQuery() {
      if (this.countrySelected) {
        this.$router.push({
          name: "LocationReport",
          query: {
            country: this.location
          }
        })
      } else if (this.divisionSelected) {
        this.$router.push({
          name: "LocationReport",
          query: {
            division: this.location
          }
        })
      }
    },
    updateCountry(country) {
      if (country && country.name) {
        this.location = country.name;
        this.countrySelected = true;
      } else {
        this.countrySelected = false;
        this.location = null;
      }
    },
    updateDivision(division) {
      if (division && division.name) {
        this.location = division.name;
        this.divisionSelected = true;
      } else {
        this.divisionSelected = false;
        this.location = null;
      }
    }
  },
  data() {
    return {
      queryCountry: null,
      queryDivision: null,
      location: null,
      countrySelected: false,
      divisionSelected: false
    }
  },
  mounted() {
    this.queryCountry = findCountry;
    this.queryDivision = findDivision;
  }
}
</script>
