<template>
  <div style="min-height: 75vh">
    <div class="col-sm-12 my-5">
      <div class="container text-left mb-5">
        <h1 class="text-highlight">Schema for Resources</h1>
        <section class="my-5">
          <h4>Why did we create outbreak.info schema?</h4>
          <div class="row align-items-start">
            <div class="col-sm-8">
              <p>
                In creating a searchable index of all resources related to
                COVID-19 and SARS-CoV-2, one of the largest challenges is
                getting the different resources sources to talk to each other.
                Every source has their own particular way of describing an
                individual resource, which means metadata about the resource can
                be difficult to combine.
              </p>
              <p>
                Not only do different resource types (like clinical trials,
                publications, and datasets) differ in how the describe the
                metadata of a resource, but even within a single resource type,
                different sources use different languages. For instance, one
                dataset source might refer to the name of a dataset as
                <b>name</b>
                , while other sources call it
                <b>title</b>
                .
              </p>
              <p>
                We created a reusable schema to standardize all resource
                metadata, regardless of source or type, to be consistent and
                interoperable. This standardization makes it simpler to search
                across all the different resource repositories.
              </p>
            </div>

            <div class="col-sm-4">
              <a
                href="https://discovery.biothings.io/view/outbreak/"
                target="_blank"
              >
                <img class="w-100" src="@/assets/home/schema_view.png" />
              </a>
            </div>
          </div>
        </section>

        <section class="my-5">
          <h4>How we created our schema</h4>
          <p>
            To make our schema as reusable as possible and consistent with the
            broader community, we worked from existing schemas wherever
            possible. Our schemas are based on
            <a href="http://schema.org/" target="_blank">Schema.org</a>
            , which provides a widely accepted format recognizable by major
            search engines and data portals. We incorporated portions of
            <a href="https://bioschemas.org/" target="_blank">Bioschemas</a>
            , which adapts and extends Schema.org schemas for the life sciences.
            We also consulted
            <a
              href="https://prsinfo.clinicaltrials.gov/prs-xml-schemas.html"
              target="_blank"
            >
              ClinicalTrials.gov Protocol Registration and Results (PRS)
            </a>
            schema to describe clinical trials.
          </p>
        </section>

        <section class="my-5">
          <h4>How to reuse our schema</h4>
          <div class="row align-items-start">
            <div class="col-sm-4">
              <a
                href="https://discovery.biothings.io/view/outbreak/"
                target="_blank"
              >
                <img class="w-100" src="@/assets/home/schema_example.png" />
              </a>
            </div>

            <div class="col-sm-8">
              <p>
                Our schemas are designed to be reused and adapted to particular
                use cases. All our schemas are available on the
                <a
                  href="https://discovery.biothings.io/view/outbreak"
                  target="_blank"
                >
                  Data Discovery Engine
                </a>
                , which allows you to view the schema,
                <a
                  href="https://discovery.biothings.io/schema-playground"
                  target="_blank"
                >
                  extend or modify it
                </a>
                , or create your own schema from scratch.
              </p>
              <p>
                We've created schemas for
                <a
                  href="https://discovery.biothings.io/view/outbreak/Analysis"
                  target="_blank"
                >
                  analyses
                </a>
                ,
                <a
                  href="https://discovery.biothings.io/view/outbreak/ClinicalTrial"
                  target="_blank"
                >
                  clinical trials
                </a>
                ,
                <a
                  href="https://discovery.biothings.io/view/outbreak/Dataset"
                  target="_blank"
                >
                  datasets
                </a>
                ,
                <a
                  href="https://discovery.biothings.io/view/outbreak/Protocol"
                  target="_blank"
                >
                  protocols
                </a>
                ,
                <a
                  href="https://discovery.biothings.io/view/outbreak/Publication"
                  target="_blank"
                >
                  publications
                </a>
                , and others.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { onMounted } from 'vue';
  import { useMetadataStore } from '@/stores/metadataStore';
  import { useSeoMeta } from 'unhead';

  onMounted(() => {
    const metadataStore = useMetadataStore();
    const metadata = metadataStore.defaultMetadata;
    useSeoMeta(metadata);
  });
</script>
