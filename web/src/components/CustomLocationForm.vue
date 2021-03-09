<template>
<form class="mx-4" @submit.prevent="submitQuery">
  <h3>Select location</h3>
  <div class="d-flex align-items-center my-3">
    <div class="input-group w-50">
      <div class="input-group-prepend">
        <span class="input-group-text bg-grey text-muted border-0" id="sb">
          <font-awesome-icon :icon="['fas', 'search']" />
        </span>
      </div>
      <TypeaheadSelect class="form-control mr-4" :isStandalone="false" :queryFunction="queryLocation" @selected="updateLocation" :apiUrl="this.$genomicsurl" placeholder="Select location" totalLabel="total sequences" :removeOnSelect="false" />
    </div>

  </div>

  <div class="d-flex flex-column justify-content-center align-items-center w-100 mt-5">
    <button :disabled="!location" type="submit" class="btn btn-accent" :class="{'btn-lg': !minimalistic }" @click="submitQuery">Create {{ location.label }} report</button>
  </div>

  <div class="my-5" v-if="includeMutations">
    <h3>Add lineages & mutations to track<span v-if="location"> in {{ location.label }}</span></h3>
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
    <div>
      <CustomReportForm />
    </div>

  </div>
</form>
</template>

<script>
import Vue from "vue";

import TypeaheadSelect from "@/components/TypeaheadSelect.vue";
import CustomReportForm from "@/components/CustomReportForm.vue";
import {
  getReportList,
  getSequenceCount,
  findLocation,
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
    CustomReportForm,
    FontAwesomeIcon
  },
  props: {
    minimalistic: {
      type: Boolean,
      default: false
    },
    includeMutations: {
      type: Boolean,
      default: true
    },
    curated: Array
  },
  methods: {
    submitQuery() {
      this.$router.push({
        name: "LocationReport",
        query: {
          loc: this.location.id
        }
      })
    },
    updateLocation(location) {
      if (location && location.id) {
        this.location = location;
      }
    }
  },
  data() {
    return {
      queryLocation: null,
      location: null
    }
  },
  mounted() {
    this.queryLocation = findLocation;
  }
}
</script>

<style lang="scss" scoped>
.max-width-400 {
    max-width: 400px !important;
}
</style>
