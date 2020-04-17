<template>
<div class="d-flex flex-column">
  <div class="border-top border-bottom py-3">
    <!-- date -->
    <div class="">
      {{date}}
    </div>
    <!-- DOI -->
    <div class="text-muted" v-if="doi">
      DOI: {{doi}}
    </div>
  </div>

  <!-- link out -->
  <div class="py-4 border-bottom">
    <a class="btn btn-main" :href="url" target="_blank" rel="noreferrer">View {{type}}
    </a>
  </div>
  <!-- cite -->
  <div href="fdfs" class="py-3 border-bottom">
    <small class="text-muted section-header">download citation</small>
    <div class="citation-container flex">
      <a class="mr-3" href="">Endnote</a>
      <a class="mr-3" href="">Zenodo</a>
    </div>
  </div>
  <!-- edit -->
  <div class="pt-4 pb-3 border-bottom d-flex flex-column">
    <div>
      <a class="btn btn-main-outline router-link no-underline" role="button" target="_blank" rel="noreferrer" href="http://discovery.biothings.io/outbreak">Edit metadata
      </a>
    </div>
    <small class="mt-2 helper text-muted">Improve this record by adding additional information</small>
  </div>
  <div class="py-3 border-bottom text-muted">
    <small class="text-muted section-header">share</small>
    <div class="d-flex flex-wrap justify-content-center mt-1">
      <i class="fab fa-twitter mr-3"></i>
      <i class="fas fa-envelope mr-3"></i>
      <i class="fas fa-link mr-3"></i>
      <i class="fas fa-share mr-3"></i>
    </div>
  </div>

</div>
</template>

<script>

export default {
  name: "ResourceSidebar",
  props: {
    doi: { type: String, default: null},
    type: String,
    date: String,
    url: String
  }
}
</script>
