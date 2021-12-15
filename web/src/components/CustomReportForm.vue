<template>
<div>
  <VariantForm :minimalistic="minimalistic" :selectedLineage.sync="selectedLineage" :submitLabel.sync="submitLabel" :selectedMutations.sync="selectedMutations" :submitted="submitCount" />

  <div>
    <div class="d-flex align-items-center my-4 w-100">
      <div>
        <button type="submit" class="btn btn-outline-secondary mx-5" @click="clearQuery">Clear selection</button>
        <button :disabled="!formValid" type="submit" class="btn btn-accent" @click="submitQuery">Go</button>
      </div>

    </div>
  </div>

</div>
</template>

<script lang="js">
import Vue from "vue";

import VariantForm from "@/components/VariantForm.vue";

export default Vue.extend({
  name: "CustomReportForm",
  props: {
    minimalistic: {
      type: Boolean,
      default: false
    }
  },
  components: {
    VariantForm
  },
  computed: {
    formValid() {
      return (this.selectedMutations.length > 0 || this.selectedLineage)
    }
  },
  methods: {
    clearQuery() {
      // forces the form to clear
      this.submitCount += 1;
    },
    submitQuery() {
      this.$emit("exit", true);
      const routeQuery = this.$route.query;
      console.log('please', routeQuery);
      this.submitCount += 1;
      if (this.selectedLineage && this.selectedLineage.alias) {
        this.$router.push({
          name: "MutationReport",
          params: {
            alias: this.selectedLineage.name
          },
          query: {
            muts: this.selectedMutations.map(d => d.mutation),
            loc: routeQuery.loc,
            overlay: routeQuery.overlay,
            selected: routeQuery.selected
          }
        });
      } else {
        const selectedPango = this.selectedLineage ? this.selectedLineage.name : null;
        this.$router.push({
          name: "MutationReport",
          query: {
            pango: selectedPango,
            muts: this.selectedMutations.map(d => d.mutation),
            loc: routeQuery.loc,
            overlay: routeQuery.overlay,
            selected: routeQuery.selected
          }
        });
      }
    }
  },
  data() {
    return {
      selectedMutations: [],
      selectedLineage: null,
      submitCount: 0,
      submitLabel: null
    }
  }
})
</script>
