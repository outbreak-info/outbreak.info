<template>
<div>
  <VariantForm :minimalistic="minimalistic" :selectedLineage.sync="selectedLineage" :submitLabel.sync="submitLabel" :selectedMutations.sync="selectedMutations" :submitted="submitCount" />

  <div>
    <div class="d-flex align-items-center my-4 w-100">
      <div>
        <button type="submit" class="btn btn-outline-secondary mx-5"  @click="clearQuery">Clear selection</button>
        <button :disabled="!formValid" type="submit" class="btn btn-accent"  @click="submitQuery">Go</button>
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

      this.submitCount += 1;

      this.$router.push({
        name: "MutationReport",
        query: {
          pango: this.selectedLineage,
          muts: this.selectedMutations.map(d => d.mutation)
        }
      });
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
