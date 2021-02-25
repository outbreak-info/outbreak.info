<template>
<div>
  <h3 class="mb-0">
    Glossary of Mutations Terms
  </h3>
  <p class="text-muted mt-0">
    The gamut of <a href="#mutation"><b>mutations</b></a>, <a href="#variant"><b>variants</b></a>, <a href="#lineage"><b>lineages</b></a>, and <a href="#strain"><b>strains</b></a> can get confusing. Here's how they're used within outbreak.info:
  </p>
  <div class="row">
    <div class="col-sm-12 col-md-8">
      <ul>
        <li id="mutation">
          <b>Mutant</b>: an error introduced during viral replication
          <ul>
            <li>
              Without experimental testing, we don't know what effect the mutation has on the virus. The effect could lead to better outcomes (e.g. the mutation decreases the transmissibility of the virus), worse (e.g. the mutation increases its
              virulence), or no effect
              (e.g. the mutation does not create characteristics that differ from the original virus)
            </li>
            <li>
              <b>Substitution</b>: one <a href="#nucleotide">nucleotide</a> is replaced with another one. In a <b>synonymous</b> substitution, this does not change the amino acid sequence of the viral protein, while in a <b>non-synonymous</b> one,
              the substitution changes a
              <a href="#codon">codon</a>, which could affect the function of the protein.
            </li>
            <li>
              <b>Deletion</b>: one or more <a href="#nucleotide">nucleotides</a> are left out of the genetic sequence during replication. This can lead to an entire codon (amino acid) being removed from the protein, or a <b>frame-shifting
                mutation</b>, which causes all
              subsequent
              codons to change as well.
            </li>
            <li>
              <b>Insertion</b>: one or more extra <a href="#nucleotide">nucleotides</a> are added into the genetic sequence
            </li>
          </ul>
        </li>
      </ul>
    </div>
    <div class="col-sm-12 col-md-4">
      <img class="w-100 my-3" src="@/assets/genomics/phylo_tree.png" alt="mutation, variant, lineages, phylogenetic tree" />
    </div>

  </div>
  <div class="row">
    <div class="col-sm-12 col-md-12 col-lg-8">
      <ul>
        <li id="variant">
          <b>Variant:</b> A genome that contains a particular set of <a href="#mutation">mutations</a>
          <ul>
            <li>
              <b>Variant of Concern (VOC)</b>: variants which have evidence in the literature of increased transmissibility, worse outcomes, and/or
              decreased vaccine efficacy
            </li>
            <li>
              <b>Variant of Interest (VOI)</b>: variants of increasing prevalence with mutations in biologically important regions but lacking evidence for
              increased transmissibility, virulence, and/or immune evasion, also called <b>Variant Under Investigation (VUI)</b>
            </li>
            <li>
              When the same mutations show up in two variants, this can mean two things:
              <ul>
                <li>
                  The virus was derived from the same parent <a href="#lineage">lineage</a>
                </li>
                <li>
                  <a href="#convergent-evolution">Convergent evolution</a>
                </li>
              </ul>
            </li>
          </ul>
        </li>
        <li id="lineage">
          <b>Lineage</b>: All the descendants of a branch of a <a href="#phylogenetic-tree">phylogenetic tree</a>
          <ul>
            <li>
              Within a lineage, there may be additional <a href="#mutation">mutations</a> which revert some changes or accumulate new ones
            </li>
            <li>
              We primarily rely on PANGO lineages (<a href="https://cov-lineages.org/pangolin.html" target="_blank">Phylogenetic Assignment of Named Global Outbreak</a>)
            </li>
          </ul>
        </li>

        <li id="strain">
          <b>Strain</b>: Viral genome that has distinct properties and causes a specific immune response
        </li>

        <li class="border-top pt-2 mt-2" id="phylogenetic-tree">
          <b>Phylogenetic tree</b>: a &ldquo;family tree&rdquo; showing how mutations are related to each other based on an analysis of the virus genomic sequence. Used to:
          <ul>
            <li>
              Determine <a href="lineage">lineages</a>
            </li>
            <li>
              Understand how <a href="#strain">strains</a> of viruses are related to each other
            </li>
            <li>
              Trace how/when/where <a href="mutation">mutations</a> originated
            </li>
          </ul>
        </li>
        <li id="convergent-evolution">
          <b>Convergent evolution</b>: Selective evolutionary pressure
          <ul>
            <li>
              Randomly, two variants of a virus pop up with the same mutation without the cases being connected.

            </li>
            <li>
              This suggests selective pressure &ndash; the virus
              has mutated to improve biological fitness.
            </li>
          </ul>
        </li>

        <li id="apparent-prevalence">
          <b>Apparent prevalence</b>: The ratio of the sequences containing the <a href="#mutation">mutation</a>, <a href="variant">variant</a>, or <a href="lineage">lineage</a> to all sequences collected since the identification of the mutation,
          variant, or lineage in a location. <router-link :to="{name: 'SituationReportMethodology'}">Learn more about our methods</router-link>
        </li>

        <li class="border-top pt-2 mt-2" id="nucleotide">
          <b>Nucleotide</b>: building blocks of DNA and RNA that provide the code necessary to store and transmit genetic information
        </li>

        <li id="codon">
          <b>Codon</b>: sequence of three <a href="#nucleotide">nucleotides</a> encoding a single amino acid
        </li>
      </ul>
    </div>
  </div>
</div>
</template>
