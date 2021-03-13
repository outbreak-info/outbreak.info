<template>
<div>
  <VariantForm :minimalistic="minimalistic" :selectedLineage.sync="selectedLineage" :selectedMutations.sync="selectedMutations" :submitted="submitCount" />

  <div>
    <div class="d-flex align-items-center my-4 w-100">
      <div class="d-flex align-items-center circle-header" v-if="formValid">
        <div class="mr-3" :class="[minimalistic ? 'circle-sm' : 'circle']">{{selectedType == 'variant' ? 5 : 4}}</div>
      </div>
      <div>
        <button :disabled="!formValid" type="submit" class="btn btn-accent"  @click="submitQuery">Create report</button>
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
      submitCount: 0
    }
  }
})
</script>
