<template>
<div>
  <VariantForm :minimalistic="minimalistic" :selectedLineage.sync="selectedLineage" :selectedMutations.sync="selectedMutations" />

  <div class="col-sm-12">
    <div class="d-flex flex-column justify-content-center align-items-center w-100">
      <p v-if="formValid" class="text-muted font-size-2">
        Generate {{ title }} report
      </p>
      <div>
        <button :disabled="!formValid" type="submit" class="btn btn-accent" :class="{'btn-lg': !minimalistic }" @click="submitQuery">Create report</button>
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
    title() {
      if (this.selectedLineage) {
        return this.selectedMutations.length ? `${this.selectedLineage} lineage with ${this.selectedMutations.map(d => d.mutation).join(", ")}` : `${this.selectedLineage} lineage`;
      } else {
        return (this.selectedMutations.length > 1 ? this.selectedMutations.map(d => d.mutation).join(", ") + " Variant" : this.selectedMutations.map(d => d.mutation).join(", ") + " Mutation")
      }
    },
    formValid() {
      return (this.selectedMutations.length > 0 || this.selectedLineage)
    }
  },
  methods: {
    submitQuery() {
      this.$emit("exit", true);

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
      selectedLineage: null
    }
  }
})
</script>
