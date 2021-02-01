<template>
  <div class="d-flex flex-column w-100 align-items-center mt-3">
  <h5 class="">Characteristic mutations</h5>
<table>
  <thead>
    <tr class="border-bottom">
      <th>
        gene
      </th>
      <th>
        amino acid
      </th>
    </tr>
  </thead>
  <tbody class="checkbook border-bottom">
    <tr v-for="(mutation, mIdx) in mutations" :key="mIdx">
      <td>
        {{mutation.gene}}
      </td>
      <td v-if="mutation.type == 'substitution'">
        {{mutation.ref_aa}}{{mutation.codon_num}}{{mutation.alt_aa}}
      </td>
      <td v-else-if="mutation.type == 'deletion'">
        <span v-if="Array.isArray(mutation.codon_num)">&Delta;{{mutation.codon_num[0]}}-{{mutation.codon_num.slice(-1)[0]}}</span>
        <span v-else>&Delta;{{mutation.codon_num}}
          </span>
      </td>
    </tr>
  </tbody>
</table>
</div>
</template>

<script lang="js">
import Vue from "vue";
export default Vue.extend({
  name: "MutationTable",
  props: {
    mutations: Array
  }
})
</script>

<style lang="scss" scoped>
.checkbook td {
    padding: 0.5rem;
}

.checkbook tr:nth-child(2n+1) {
    background-color: $lightback;
}
</style>
