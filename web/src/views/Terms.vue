<template>
  <div style="min-height: 75vh">
    <div class="col-sm-12 my-5">
      <div class="container text-left mb-5">
        <h1 class="text-highlight">Terms of Use</h1>
        <h4>Disclaimer</h4>
        <p>
          Every effort has been made to ensure the accuracy and completeness of
          the information and data provided on this website. However,
          <a href="https://www.scripps.edu/" target="_blank" rel="noreferrer">
            Scripps Research
          </a>
          makes no warranties, expressed or implied, regarding errors or
          omissions and assume no legal liability or responsibility for loss or
          damage resulting from the use or misuse of information contained
          within. Scripps Research reserves the right to revise the data
          pursuant to further analysis and review. Please see the Scripps
          Research
          <a href="#terms-of-use">Terms of Use</a>
          below.
        </p>
      </div>

      <DataUsage class="container text-left" />
      <CiteUs class="container text-left mt-5" />
      <div id="terms-of-use" class="container text-left mt-4 mb-5">
        <h2>Terms</h2>
        <p>
          TSRI has attempted to provide accurate and current information on the
          Site. However, TSRI makes no representations or warranties that the
          information contained or published on the Site will be suitable for
          your specific purposes or for any other purposes. You assume full
          responsibility for any use of any information provided on the Site.
          You understand and agree that TSRI will not be responsible or liable
          for any claim, loss or damage arising from use of the Site, or any
          information or other content on the Site. To the fullest extent
          provided by law, you agree to indemnify, defend, and hold TSRI
          harmless from all claims, damages, liabilities and expenses, including
          without limitation reasonable attorney’s fees and costs, whether or
          not a lawsuit or other proceeding is filed, that in any way arise out
          of or relate to your use of the Site and/or use of the other third
          party websites referenced herein.
        </p>
        <p>
          ALL INFORMATION AND DATA PROVIDED ON THE SITE IS PROVIDED “AS-IS”
          WITHOUT WARRANTY OF ANY KIND. TSRI MAKES NO REPRESENTATIONS OR
          WARRANTIES CONCERNING THE SITE OR ANY OTHER MATTER WHATSOEVER,
          INCLUDING WITHOUT LIMITATION ANY EXPRESS, IMPLIED OR STATUTORY
          WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
          NON-INFRINGEMENT OF THIRD PARTY RIGHTS, TITLE, ACCURACY, COMPLETENESS
          OR ARISING OUT OF COURSE OF CONDUCT OR TRADE CUSTOM OR USAGE, AND
          DISCLAIMS ALL SUCH EXPRESS, IMPLIED OR STATUTORY WARRANTIES. TSRI
          MAKES NO WARRANTY OR REPRESENTATION THAT YOUR USE OF THE SITE WILL NOT
          INFRINGE UPON THE INTELLECTUAL PROPERTY OR OTHER RIGHTS OF ANY THIRD
          PARTY. FURTHER, TSRI SHALL NOT BE LIABLE IN ANY MANNER WHATSOEVER FOR
          ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR EXEMPLARY
          DAMAGES ARISING OUT OF OR IN ANY WAY RELATED TO THE SITE, THE USE OF,
          OR INABILITY TO USE, ANY OF THE INFORMATION OR DATA CONTAINED OR
          REFERENCED IN THIS SITE OR ANY INFORMATION OR DATA THAT IS PROVIDED
          THROUGH LINKED WEBSITES, OR ANY OTHER MATTER. THE FOREGOING EXCLUSIONS
          AND LIMITATIONS SHALL APPLY TO ALL CLAIMS AND ACTIONS OF ANY KIND AND
          ON ANY THEORY OF LIABILITY, WHETHER BASED ON CONTRACT, TORT OR ANY
          OTHER GROUNDS, AND REGARDLESS OF WHETHER A PARTY HAS BEEN ADVISED OF
          THE POSSIBILITY OF SUCH DAMAGES, AND NOTWITHSTANDING ANY FAILURE OF
          ESSENTIAL PURPOSE OF ANY LIMITED REMEDY. BY USING THIS WEBSITE, YOU
          FURTHER AGREE THAT EACH WARRANTY DISCLAIMER, EXCLUSION OF DAMAGES OR
          OTHER LIMITATION OF LIABILITY HEREIN IS INTENDED TO BE SEVERABLE AND
          INDEPENDENT OF THE OTHER CLAUSES OR SENTENCES BECAUSE THEY EACH
          REPRESENT SEPARATE ELEMENTS OF RISK ALLOCATION BETWEEN THE PARTIES.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { lazyLoad } from '@/js/lazy-load';

const DataUsage = lazyLoad('DataUsage');
const CiteUs = lazyLoad('CiteUs');
</script>
