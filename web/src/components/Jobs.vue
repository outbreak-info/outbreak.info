<template>
  <div class="d-flex flex-wrap justify-content-center row">
    <div
      class="card w-30 py-2 px-4 text-left mr-4 mb-4 col-sm-11 col-md-5 col-lg-3"
      v-for="(job, jIdx) in jobs"
      :key="jIdx"
    >
      <div class="border-bottom pt-3 pb-1 mb-2">
        <h5>{{ job.title }}</h5>
        <span class="vc_sep_holder vc_sep_holder_r">
          <span class="vc_sep_line"></span>
        </span>
      </div>
      <div class="wpb_text_column wpb_content_element">
        <div class="wpb_wrapper">
          <p
            v-for="(paragraph, pIdx) in job.content"
            :key="pIdx"
            v-html="paragraph"
          ></p>
          <p v-if="job.content">
            For further details, please contact
            <a :href="`mailto:${job.contact}`">{{ job.contact }}</a>
            .
          </p>
          <p v-if="Array.isArray(job.url)">
            Read more and apply
            <span v-for="(link, lIdx) in job.url" :key="lIdx">
              <a :href="link" target="_blank" rel="noopener noreferrer">here</a>
              <span v-if="lIdx < job.url.length - 1">and</span>
            </span>
            . Qualification: {{ job.qualifications }}.
          </p>
          <p v-else>
            Read more and apply
            <a :href="job.url" target="_blank" rel="noopener noreferrer">
              here
            </a>
            . Qualification: {{ job.qualifications }}.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const jobs = ref([
  {
    title: 'Backend Engineer',
    contact: 'lhughes@scripps.edu',
    url: 'https://bit.ly/scrippsbackend',
    qualifications: 'BSc or equivalent',
    content: [
      'We are looking for a <strong>Backend Engineer</strong> to develop high-performance APIs that allows us to access data quickly & easily to accelerate the pace of research. Current projects include <a href="https://outbreak.info" target="_blank" rel="noopener">outbreak.info</a> and <a href="http://biothings.io" target="_blank" rel="noopener">BioThings API</a>.',
    ],
  },
  {
    title: 'Staff Scientist',
    contact: 'lhughes@scripps.edu',
    url: 'https://bit.ly/scrippsscientist',
    qualifications:
      'Ph.D. in Bioinformatics, Computational Biology, or related fields',
    content: [
      'We are looking for a <strong>Staff Scientist</strong> to transform dataset discovery into data analysis to address critical biomedical problems. Current projects include <a href="https://outbreak.info" target="_blank" rel="noopener">outbreak.info</a> and <a href="http://data.cvisb.org/" target="_blank" rel="noopener">Center for Viral Systems Biology Data Portal</a>.',
    ],
  },
  {
    title: 'Front-end Developer',
    contact: 'lhughes@scripps.edu',
    url: [
      'https://t.co/0UTsmdndHf?amp=1',
      'https://www.scripps.edu/careers/?gnk=job&gni=8a78859e789e32c30178a3c4765d45b8',
    ],
    qualifications: 'BSc or equivalent',
    content: [
      'We are looking for <strong>Front-end Developers</strong> to build interfaces to explore, visualize, and analyze biomedical data, including current data from the ongoing COVID-19 pandemic. Current projects include <a href="https://outbreak.info" target="_blank" rel="noopener">outbreak.info</a> and the <a href="http://data.cvisb.org/" target="_blank" rel="noopener">Center for Viral Systems Biology Data Portal</a>.',
    ],
  },
]);
</script>
