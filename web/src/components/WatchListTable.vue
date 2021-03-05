<template>
  <div class="my-5">
    <h3 class="text-center">Flagged mutations in {{location}}</h3>
    <table class="mx-auto">
      <thead>
        <tr>
          <th>
            mutation
          </th>
          <th>
            prevalent in
          </th>
          <th>
            growth rate
          </th>
          <th>
           current prevalence (fitted)
          </th>
        </tr>
      </thead>
      <tbody>
        <tr class="checkbook" v-for="(row, rIdx) in data" :key="rIdx">
          <td class="font-weight-bold">
            <router-link :to="{name: 'MutationReport', query: {muts: row.mutation}}">{{row.mutation}}
              </router-link>
          </td>
          <td class="d-flex flex-wrap">
            <router-link :to="{name: 'MutationReport', query: {pango: lineage}}" v-for="(lineage, lIdx) in row.lineages" :key="lIdx">
              <button class="btn chip btn-outline-secondary bg-white">{{lineage}}</button>
            </router-link>
          </td>
          <td>
            {{row.growth_rate}}
          </td>
          <td>
            {{row.fitted_prev}}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import Vue from "vue";

export default {
  name: "LocationReports",
  props: {
    location: String
  },
  data() {
    return({
      data: [
        { mutation: "S:N501Y", lineages:["B.1.1.7", "A.27", "B.1.136", "B.1.351", "P.1"], fitted_prev:"75%", growth_rate: "6.5%"},
        { mutation: "S:N501Y", lineages:["B.1.1.7", "A.27", "B.1.136", "B.1.351", "P.1"], fitted_prev:"75%", growth_rate: "6.5%"},
        { mutation: "S:N501Y", lineages:["B.1.1.7", "A.27", "B.1.136", "B.1.351", "P.1"], fitted_prev:"75%", growth_rate: "6.5%"},
      ]
    })
  }
}
</script>

<style lang="scss">
th {
    padding: 0.25rem 0.25rem 0.5rem;
    text-align: center;
}

.checkbook td {
    padding: 0.5rem;
    text-align: center;
}

.checkbook:nth-child(2n+1) {
    background: lighten($base-grey,70%);
}
</style>
