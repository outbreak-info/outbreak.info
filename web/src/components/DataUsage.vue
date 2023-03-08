<template>
  <div>
    <h5 class="m-0">Data usage policy</h5>
    <span class="badge bg-grey__lightest my-2 text-dark">
      <font-awesome-icon class="mr-1" :icon="['far', 'clock']" />
      updated June 2020
    </span>
    <p>
      outbreak.info combines together data and metadata from a large number of
      <router-link :to="{ name: 'Sources' }">data sources</router-link>
      , and we abide by their data usage licenses.
    </p>

    <p>
      For content that we redistribute from other sources, please follow the
      data provider's license and cite them appropriately, as shown
      <a href="#citing">below</a>
      .
    </p>

    <p class="m-0 mb-1">
      All data and content that our team creates is covered by the
      <a
        href="https://creativecommons.org/publicdomain/zero/1.0/"
        target="_blank"
        rel="noreferrer"
      >
        Creative Commons CC0 Waiver
      </a>
      , which states that you can copy, modify, distribute and perform the work,
      even for commercial purposes, all without asking permission. However,
      consistent with scientific norms, we ask that you cite
      <router-link to="/">outbreak.info</router-link>
      in any tools or publications that use
      <router-link to="/">outbreak.info</router-link>
      .
    </p>

    <small class="m-0">
      Data usage policy loosely adapted from
      <a
        href="https://covidtracking.com/license"
        target="_blank"
        rel="noreferrer"
      >
        COVID Tracking Project.
      </a>
    </small>
  </div>
</template>

<script setup></script>
