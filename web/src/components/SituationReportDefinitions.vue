<template>
  <div>
    <h3 class="mb-0">
      Glossary of Mutations Terms
    </h3>
    <p class="text-muted mt-0">
      The gamut of
      <a href="#mutation"><b>mutations</b></a>
      ,
      <a href="#variant"><b>variants</b></a>
      ,
      <a href="#lineage"><b>lineages</b></a>
      , and
      <a href="#strain"><b>strains</b></a>
      can get confusing. Here's how they're used within outbreak.info:
    </p>
    <div class="row">
      <div class="col-sm-12 col-md-8">
        <ul>
          <li id="mutation">
            <b>Mutation</b>: an error introduced during viral replication
            <ul>
              <li>
                Without experimental testing, we don't know what effect the
                mutation has on the virus. The effect could lead to better
                outcomes (e.g. the mutation decreases the transmissibility of
                the virus), worse (e.g. the mutation increases its virulence),
                or no effect (e.g. the mutation does not create characteristics
                that differ from the original virus)
              </li>
              <li>
                <b>Substitution</b>: one
                <a href="#nucleotide">nucleotide</a>
                is replaced with another one. In a
                <b>synonymous</b>
                substitution, this does not change the amino acid sequence of
                the viral protein, while in a
                <b>non-synonymous</b>
                one, the substitution changes a
                <a href="#codon">codon</a>, which could affect the function of
                the protein.
              </li>
              <li>
                <b>Deletion</b>: one or more
                <a href="#nucleotide">nucleotides</a>
                are left out of the genetic sequence during replication. This
                can lead to an entire codon (amino acid) being removed from the
                protein, or a
                <b>frame-shifting mutation</b>, which causes all subsequent
                codons to change as well.
              </li>
              <li>
                <b>Insertion</b>: one or more extra
                <a href="#nucleotide">nucleotides</a>
                are added into the genetic sequence
              </li>
            </ul>
          </li>
        </ul>
      </div>
      <div class="col-sm-12 col-md-4">
        <img
          class="w-100 my-3"
          src="@/assets/genomics/phylo_tree.png"
          alt="mutation, variant, lineages, phylogenetic tree"
        />
      </div>
    </div>
    <div class="row">
      <div class="col-sm-12 col-md-12 col-lg-8">
        <ul>
          <li id="variant">
            <b>Variant:</b>
            A genome that contains a particular set of
            <a href="#mutation">mutations</a>
            <ul>
              <li>
                <b>Variant of Concern (VOC)</b>: (Source:
                <a
                  href="https://www.who.int/publications/m/item/covid-19-weekly-epidemiological-update"
                  target="_blank"
                >
                  WHO</a>) A variant which has been associated with at least one of the
                following:
                <ul>
                  <li>
                    Increase in transmissibility or detrimental change in
                    COVID-19 epidemiology
                  </li>
                  <li>
                    Increase in virulence or change in clinical disease
                    presentation
                  </li>
                  <li>
                    Decrease in effectiveness of public health and social
                    measures or available diagnostics, vaccines, therapeutics
                  </li>
                </ul>
              </li>
              <li>
                <b>Variant of Interest (VOI)</b>: (Source:
                <a
                  href="https://www.who.int/publications/m/item/covid-19-weekly-epidemiological-update"
                  target="_blank"
                >
                  WHO</a>) A variant which is both:
                <ul>
                  <li>
                    Phenotypically changed compared to a reference isolate or
                    has a genome with mutations that lead to amino acid changes
                    associated with established or suspected phenotypic
                    implications (including epidemiology, antigenicity, or
                    virulence or changes that have or potentially have a
                    negative impact on available diagnostics, vaccines,
                    therapeutics or public health and social measures)
                  </li>
                  <li>
                    Has been identified to cause community transmission/multiple
                    COVID-19 cases/clusters, or has been detected in multiple
                    countries
                  </li>
                  <li>
                    Also called
                    <b>Variant Under Investigation (VUI)</b>
                  </li>
                </ul>
              </li>
              <li>
                <b>Variant under Monitoring (VUM)</b>: A variant which is being
                monitored by a public health agency
                to detect if it meets the conditions of a Variant of Concern or
                Interest. It may also be used for variants which have previously
                been designated as VOCs or VOIs but have been downgraded by the
                public health agencies based on recent data.
              </li>
              <li>
                We follow Public Health Agencies in designating Variants of
                Concern and Interest, including the
                <a
                  href="https://www.who.int/csr/don/31-december-2020-sars-cov2-variants/en/"
                  target="_blank"
                >
                  World Health Organization</a>,
                <a
                  href="https://www.cdc.gov/coronavirus/2019-ncov/cases-updates/variant-surveillance/variant-info.html"
                  target="_blank"
                >
                  Centers for Disease Control and Prevention</a>, and
                <a
                  href="https://www.gov.uk/government/publications/investigation-of-novel-sars-cov-2-variant-variant-of-concern-20201201"
                  target="_blank"
                >
                  Public Health England</a>.
              </li>
              <li>
                When the same mutations show up in two variants, this can mean
                two things:
                <ul>
                  <li>
                    The virus was derived from the same parent
                    <a href="#lineage">lineage</a>
                  </li>
                  <li>
                    <a href="#convergent-evolution">Convergent evolution</a>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
          <li id="lineage">
            <b>Lineage</b>
            : All the descendants of a branch of a
            <a href="#phylogenetic-tree">phylogenetic tree</a>
            <ul>
              <li>
                Within a lineage, there may be additional
                <a href="#mutation">mutations</a>
                which revert some changes or accumulate new ones
              </li>
              <li>
                We primarily rely on PANGO lineages (<a
                  href="https://cov-lineages.org/resources/pangolin.html"
                  target="_blank"
                >Phylogenetic Assignment of Named Global Outbreak</a>)
              </li>
            </ul>
          </li>

          <li id="strain">
            <b>Strain</b>: Viral genome that has distinct properties and causes
            a specific
            immune response
          </li>

          <li class="border-top pt-2 mt-2" id="phylogenetic-tree">
            <b>Phylogenetic tree</b>: a &ldquo;family tree&rdquo; showing how
            mutations are related to
            each other based on an analysis of the virus genomic sequence. Used
            to:
            <ul>
              <li>
                Determine
                <a href="lineage">lineages</a>
              </li>
              <li>
                Understand how
                <a href="#strain">strains</a>
                of viruses are related to each other
              </li>
              <li>
                Trace how/when/where
                <a href="mutation">mutations</a>
                originated
              </li>
            </ul>
          </li>
          <li id="convergent-evolution">
            <b>Convergent evolution</b>: Selective evolutionary pressure
            <ul>
              <li>
                Randomly, two variants of a virus pop up with the same mutation
                without the cases being connected.
              </li>
              <li>
                This suggests selective pressure &ndash; the virus has mutated
                to improve biological fitness.
              </li>
            </ul>
          </li>

          <li id="apparent-prevalence">
            <b>Apparent prevalence</b>: The ratio of the sequences containing
            the
            <a href="#mutation">mutation</a>
            ,
            <a href="variant">variant</a>
            , or
            <a href="lineage">lineage</a>
            to all sequences collected since the identification of the mutation,
            variant, or lineage in a location.
            <router-link :to="{ name: 'SituationReportMethodology' }">
              Learn more about our methods
            </router-link>
          </li>

          <li class="border-top pt-2 mt-2" id="nucleotide">
            <b>Nucleotide</b>: building blocks of DNA and RNA that provide the
            code necessary to
            store and transmit genetic information
          </li>

          <li id="codon">
            <b>Codon</b>: sequence of three
            <a href="#nucleotide">nucleotides</a>
            encoding a single amino acid
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
