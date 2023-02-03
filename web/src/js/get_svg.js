const prefix = {
  xmlns: 'http://www.w3.org/2000/xmlns/',
  xlink: 'http://www.w3.org/1999/xlink',
  svg: 'http://www.w3.org/2000/svg',
};

const canvas = document.createElement('canvas'),
  context = canvas.getContext('2d'),
  ratio = 1;

import { max } from 'd3-array';
import { nest } from 'd3-collection';
import { select, selectAll } from 'd3-selection';

// code adapted from https://github.com/nytimes/svg-crowbar (thanks, Mike Bostock)
export const getSvg = (figureRef, sources, date, darkBg) => {
  // make sure no tooltips are active
  selectAll('path').style('opacity', 1);
  // selectAll("rect").style("opacity", 1);
  selectAll('text').style('opacity', 1);

  const refs = document.getElementsByClassName(figureRef);
  const emptySvg = window.document.createElementNS(prefix.svg, 'svg');
  window.document.body.appendChild(emptySvg);
  const emptySvgDeclarationComputed = getComputedStyle(emptySvg);

  return getSvgSources(
    refs,
    emptySvgDeclarationComputed,
    sources,
    date,
    darkBg,
  );
};

const getSvgSources = (
  svgs,
  emptySvgDeclarationComputed,
  sources,
  date,
  darkBg,
) => {
  const svgInfo = [];
  const doctype =
    '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';

  // apparently nodes, while array-like, don't have a `forEach` property attached to them... hence this syntax
  [].forEach.call(svgs, (svg) => {
    svg.setAttribute('version', '1.1');

    // removing attributes so they aren't doubled up
    svg.removeAttribute('xmlns');
    svg.removeAttribute('xlink');

    // These are needed for the svg
    if (!svg.hasAttributeNS(prefix.xmlns, 'xmlns')) {
      svg.setAttributeNS(prefix.xmlns, 'xmlns', prefix.svg);
    }

    if (!svg.hasAttributeNS(prefix.xmlns, 'xmlns:xlink')) {
      svg.setAttributeNS(prefix.xmlns, 'xmlns:xlink', prefix.xlink);
    }

    // necessary to nest styles inline
    setInlineStyles(svg, emptySvgDeclarationComputed);

    const source = new XMLSerializer().serializeToString(svg);
    const rect = svg.getBoundingClientRect();

    const title = svg.getAttribute('name');
    const subtitle = svg.getAttribute('subtitle');
    const footer = getFooter(rect.width, rect.height, sources, date);
    const header = getHeader(rect.width, rect.height * 0.1, title);
    const subheader = getHeader(
      rect.width,
      rect.height * 0.07,
      subtitle,
      25,
      darkBg,
    );

    svgInfo.push({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      class: svg.getAttribute('class'),
      id: svg.getAttribute('id'),
      name: title,
      childElementCount: svg.childElementCount,
      source: [
        doctype +
          `<svg width="${rect.width}" height="${rect.height + 100}">` +
          header +
          `<g transform="translate(0,${rect.height * 0.05})">` +
          subheader +
          '</g><g transform="translate(0,35)">' +
          source +
          footer.svg +
          '</g></svg>',
      ],
    });
  });
  return svgInfo;
};

const getHeader = (width, height, title, marginL = 5, darkBg = false) => {
  if (!title) {
    title = '';
  }

  const fontColor = darkBg ? '#efefef' : '#2c3e50';

  const fontSize = height * 0.95;
  // view box needs to be a bit bigger to not get cut off
  return `<svg xmlns="http://www.w3.org/2000/svg" id="title" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet">
  <text x="0" y="0" transform="translate(${marginL},5)"
    style="dominant-baseline: hanging; font-size:${fontSize}px;display:block;font-family:&quot;DM Sans&quot;, Avenir, Helvetica, Arial, sans-serif;height:auto;line-height:15px;outline-color:rgb(44, 62, 80);overflow-x:visible;overflow-y:visible;text-align:center;text-decoration:none solid rgb(44, 62, 80);text-decoration-color:rgb(44, 62, 80);vertical-align:baseline;white-space:nowrap;width:auto;column-rule-color:rgb(44, 62, 80);-webkit-font-smoothing:antialiased;perspective-origin:0px 0px;-webkit-text-emphasis-color:rgb(44, 62, 80);-webkit-text-fill-color:rgb(44, 62, 80);-webkit-text-stroke-color:rgb(44, 62, 80);transform-origin:0px 0px;fill:${fontColor};text-anchor:start;caret-color:rgb(44, 62, 80);">
  ${title
    .replace('&mdash;', '\u2014')
    .replace('&le;', '\u2264')
    .replace('&ge;', '\u2265')
    .replace('&', 'and')}</text>
  </svg>`;
};

const getFooter = (width, height, sources, date, footerHeight) => {
  const fontSize = footerHeight * 0.225;
  const outbreakFontSize = fontSize * 1.5;
  const logoWidth = footerHeight * 0.7;
  const margin = {
    x: 30,
    y: 30,
  };
  // lazy way to wrap
  let sourceString;
  if (width > 700) {
    sourceString = `<text x="0" y="0" style="dominant-baseline: middle;font-size: ${fontSize}px;fill: #6c757d;font-family:&quot;DM Sans&quot;, Avenir, Helvetica, Arial, sans-serif;">Source: ${sources}</text>`;
  } else {
    const sourceArr = sources.split(' ');
    const half = Math.floor(sourceArr.length / 2);
    sourceString = `<text x="0" y="0" style="dominant-baseline: middle;font-size: ${fontSize}px;fill: #6c757d;font-family:&quot;DM Sans&quot;, Avenir, Helvetica, Arial, sans-serif;">
    <tspan x="0" dy="0">Source: ${sourceArr.slice(0, half).join(' ')}</tspan>
    <tspan x="0" dy="1.1em" >${sourceArr.slice(half).join(' ')}</tspan>

    </text>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${width} ${footerHeight}" width="${width}" height="${footerHeight}" id="footer" class="sources mt-2" transform="translate(0, 0)">
      <g id="background">
        <rect width="${width}" height="${footerHeight}" style="fill: #dee2e6"></rect>
      </g>

      <g id="top_border">
        <line x1="0" y1="2" x2="${width}" y2="2" stroke="#126B93" stroke-width="5"></line>
      </g>

      <g id="citation" transform="translate(${margin.x},0)">
        <g transform="translate(0, ${0})" id="logo">
          <svg version="1.1" id="Layer_1" x="0px" y="0px" width="${logoWidth}px" viewBox="0 0 396.4 396.4" style="enable-background:new 0 0 396.4 396.4;" xml:space="preserve">
            <g>
              <circle cx="198.2" cy="203" r="180"/>
              <g>
                <circle style="fill:#114068;" cx="198.2" cy="204.7" r="151.6"/>
              </g>
              <linearGradient id="SVGID_1_" gradientUnits="userSpaceOnUse" x1="195.2239" y1="53.7053" x2="333.4954" y2="293.1985">
                <stop offset="0" style="stop-color:#39C2E2"/>
                <stop offset="0.6781" style="stop-color:#39C2E2;stop-opacity:0"/>
              </linearGradient>
              <path style="fill:url(#SVGID_1_);" d="M196.1,212.6l114.2,94c24.5-26.9,39.6-62.6,39.6-101.9c0-83.7-67.9-151.6-151.6-151.6
          c-0.7,0-1.4,0.1-2.1,0.1V212.6z"/>
              <g>
                <path
                  style="fill:#FFFFFF;"
                  d="M198.2,272.2c-32.4,0-58.8-26.4-58.8-58.8s26.4-58.8,58.8-58.8s58.8,26.4,58.8,58.8
            S230.6,272.2,198.2,272.2z M198.2,161.6c-28.5,0-51.7,23.2-51.7,51.7s23.2,51.7,51.7,51.7c28.5,0,51.7-23.2,51.7-51.7
            S226.7,161.6,198.2,161.6z"/>
              </g>
              <g>
                <path
                  style="fill:#FFFFFF;"
                  d="M198.2,330.8c-64.7,0-117.4-52.7-117.4-117.4S133.5,95.9,198.2,95.9c64.7,0,117.4,52.7,117.4,117.4
            S262.9,330.8,198.2,330.8z M198.2,103c-60.8,0-110.3,49.5-110.3,110.3s49.5,110.3,110.3,110.3s110.3-49.5,110.3-110.3
            S259,103,198.2,103z"/>
              </g>
              <g>
                <circle style="fill:#D13B62;" cx="269.7" cy="172.8" r="18.7"/>
              </g>
              <g>
                <circle style="fill:#D13B62;" cx="126.5" cy="259.3" r="9.4"/>
              </g>
              <g>
                <circle style="fill:#D13B62;" cx="225.3" cy="259.3" r="27.1"/>
              </g>
              <path style="fill:#FFFFFF;" d="M194.6,23c-0.3,0.6,0,2.4,0,3.1v186.4c0,2.3,1.6,4.1,3.6,4.1s3.6-1.9,3.6-4.1V26.1
          c0-0.7,0.3-2.5,0-3.1c-0.9,0-2,0-2.9,0C197.6,23,195.8,23,194.6,23z"/>
            </g>
          </svg>
        </g>
        <g id="outbreak-info" transform="translate(0, ${margin.y})">
          <text x="0" y="0" transform="translate(${
            logoWidth + margin.x / 2
          },0)" style="font-size:${outbreakFontSize}px; dominant-baseline: middle;font-family:&quot;DM Sans&quot;, Avenir, Helvetica, Arial, sans-serif;">outbreak.info</text>
          <text x="0" y="0" transform="translate(${width - 2 * margin.x},${
    height * -0.5
  })" style="dominant-baseline: middle; font-size:${outbreakFontSize}px; text-anchor: end;font-family:&quot;DM Sans&quot;, Avenir, Helvetica, Arial, sans-serif;">${date}</text>
        </g>

        <g id="sources" transform="translate(${logoWidth + margin.x / 2},${
    outbreakFontSize + margin.y
  })">
          ${sourceString}

        </g>
      </g>
    </svg>`;
};

function setInlineStyles(svg, emptySvgDeclarationComputed) {
  function explicitlySetStyle(element) {
    const cSSStyleDeclarationComputed = getComputedStyle(element);
    let i, len, key, value;
    let computedStyleStr = '';

    for (i = 0, len = cSSStyleDeclarationComputed.length; i < len; i++) {
      key = cSSStyleDeclarationComputed[i];
      value = cSSStyleDeclarationComputed.getPropertyValue(key);
      if (value !== emptySvgDeclarationComputed.getPropertyValue(key)) {
        computedStyleStr += key + ':' + value + ';';
      }
    }
    element.setAttribute('style', computedStyleStr);
  }

  function traverse(obj) {
    const tree = [];
    tree.push(obj);
    visit(obj);

    function visit(node) {
      if (node && node.hasChildNodes()) {
        let child = node.firstChild;
        while (child) {
          if (child.nodeType === 1 && child.nodeName !== 'SCRIPT') {
            tree.push(child);
            visit(child);
          }
          child = child.nextSibling;
        }
      }
    }

    return tree;
  }

  // hardcode computed css styles inside svg
  const allElements = traverse(svg);
  let i = allElements.length;
  while (i--) {
    explicitlySetStyle(allElements[i]);
  }
}

// based on https://github.com/mbostock/svjimmy/blob/master/index.js
// Thanks, Mike.
export const getPng = (
  selector,
  sources,
  date,
  vertical = false,
  darkBg = false,
  download = false,
  filename = 'outbreakinfo_visualization.png',
) => {
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

  // make sure no tooltips are active
  selectAll('path').style('opacity', 1);
  // selectAll("rect").style("opacity", 1);
  selectAll('text').style('opacity', 1);

  return new Promise((resolve, reject) => {
    const spacer = 30;
    const footerHeight = 40;
    const headerFraction = 0.05;
    const subheaderFraction = headerFraction;

    const document = global.document,
      body = document.body,
      forEach = Array.prototype.forEach,
      styles = document.querySelectorAll('style');

    const svgs = document.querySelectorAll(selector);
    const numSvgs = svgs.length;
    if (numSvgs === 0) {
      reject('Error: no svg found with that selector');
    }

    // calc number of columns
    let numAcross = numSvgs > 3 ? Math.ceil(Math.sqrt(numSvgs)) : numSvgs;

    if (vertical) {
      numAcross = 1;
    }

    let canvasWidth = 0;
    let canvasHeight = 0;
    const dims = [];
    const colCounter = 0;
    let rowCounter = 0;
    let header;
    let headerHeight;
    let subheader;
    let footer;

    forEach.call(svgs, function (svg, i) {
      if (svg.namespaceURI !== 'http://www.w3.org/2000/svg') return; // Not really an SVG.
      if (svg.ownerSVGElement) return; // An SVG within another SVG.

      // Only append the styles IF they don't exist
      if (
        !select(svg)
          .selectAll('style')

          .nodes().length
      ) {
        forEach.call(styles, function (style) {
          svg.appendChild(style.cloneNode(true));
        });
      }

      const title = svg.getAttribute('name'),
        subtitle = svg.getAttribute('subtitle'),
        rect = svg.getBoundingClientRect(),
        width = rect.width * ratio,
        height = rect.height * ratio,
        image = new Image(),
        imageHeader = new Image(),
        imageSubheader = new Image(),
        imageFooter = new Image();

      // update the width of the canvas
      const rowNum = Math.floor(i / numAcross);
      const colNum = i % numAcross;

      // stores the dims of the image Array
      if (i === 0) {
        // add the header
        headerHeight =
          height < 400 ? height * headerFraction * 3 : height * headerFraction;
        dims.push({
          w: width,
          h: headerHeight,
          rowI: 0,
          colI: 0,
          role: 'header',
        });

        rowCounter += 1;

        // add a spacer == new row
        dims.push({
          w: width,
          h: spacer,
          rowI: rowCounter,
          colI: colNum,
          role: 'spacer',
        });
        rowCounter += 1;
      }

      // Add each image; calculate how much it needs to be shifted horizontally or vertically.
      const dx = nest()
        .key((d) => d.colI)
        .rollup((values) => max(values, (x) => x.w))
        .entries(dims.filter((d) => d.colI < colNum))
        .reduce((prev, curr) => prev + curr.value, 0);

      const dy = nest()
        .key((d) => d.rowI)
        .rollup((values) => max(values, (x) => x.h))
        .entries(dims.filter((d) => d.rowI < rowNum + rowCounter))
        .reduce((prev, curr) => prev + curr.value, 0);

      if (subtitle) {
        dims.push({
          w: width,
          h: height * subheaderFraction,
          rowI: rowNum + rowCounter,
          imageI: i,
          colI: colNum,
          dx: dx,
          dy: dy,
          role: 'subhead',
        });

        subheader = getHeader(
          width,
          height * subheaderFraction,
          subtitle,
          75,
          darkBg,
        );
      }

      dims.push({
        w: width,
        h: height,
        rowI: rowNum + rowCounter,
        colI: colNum,
        role: 'image',
        imageI: i,
        dx: dx,
        dy: dy,
      });

      // Add the footer
      if (i === numSvgs - 1) {
        // canvas width = max of the cols, summed.
        canvasWidth = nest()
          .key((d) => d.colI)
          .rollup((values) => max(values, (x) => x.w))
          .entries(dims)
          .reduce((prev, curr) => prev + curr.value, 0);

        const maxRow = max(dims, (d) => d.rowI);
        dims.push({
          w: canvasWidth,
          h: spacer,
          rowI: maxRow + 1,
          colI: 0,
          role: 'spacer',
        });
        dims.push({
          w: canvasWidth,
          h: footerHeight * ratio,
          rowI: maxRow + 2,
          colI: 0,
          role: 'footer',
        });

        // canvas height = header + subhead + spacer + max(height of each row) + spacer + footerHeight
        canvasHeight = nest()
          .key((d) => d.rowI)
          .rollup((values) => max(values, (x) => x.h))
          .entries(dims)
          .reduce((prev, curr) => prev + curr.value, 0);

        // get the header/footer svg objects
        footer = getFooter(
          canvasWidth,
          -15,
          sources,
          date,
          footerHeight * ratio,
        );
        header = getHeader(canvasWidth, headerHeight, title);
      }

      // console.log(dims)

      // Can't append new SVG objects to the DOM, b/c then they would appear on the page
      const source = new XMLSerializer().serializeToString(svg);

      let imageUrl = URL.createObjectURL(
        new Blob([source], {
          type: 'image/svg+xml',
        }),
      );

      let headerUrl = URL.createObjectURL(
        new Blob([header], {
          type: 'image/svg+xml',
        }),
      );

      let subheaderUrl = URL.createObjectURL(
        new Blob([subheader], {
          type: 'image/svg+xml',
        }),
      );

      let footerUrl = URL.createObjectURL(
        new Blob([footer], {
          type: 'image/svg+xml',
        }),
      );

      image.onload = () => {
        setTimeout(() => {
          // if you combine into one image, they seem to ignore the translate functionality and the images are overlaid
          const imageDims = dims.filter((d) => d.imageI === i);

          context.drawImage(
            image,
            imageDims[0].dx,
            imageDims[0].dy,
            width,
            height,
          ); // everything else

          const subheaderDims = dims.filter(
            (d) => d.role === 'subhead' && d.imageI === i,
          );
          if (subheaderDims.length === 1) {
            context.drawImage(
              imageSubheader,
              subheaderDims[0].dx,
              subheaderDims[0].dy,
              subheaderDims[0].w,
              subheaderDims[0].h,
            );
          }

          // only draw the footer on the last image
          if (i === numSvgs - 1) {
            // add headers
            const headerDims = dims.filter((d) => d.role === 'header');

            context.drawImage(imageHeader, 0, 0, canvasWidth, headerDims[0].h);
            context.drawImage(
              imageFooter,
              0,
              canvasHeight - footerHeight - spacer,
              canvasWidth,

              footerHeight * ratio,
            );
          }
          if (download && i === numSvgs - 1) {
            setTimeout(() => {
              imageUrl = URL.revokeObjectURL(imageUrl);
              headerUrl = URL.revokeObjectURL(headerUrl);
              subheaderUrl = URL.revokeObjectURL(subheaderUrl);
              footerUrl = URL.revokeObjectURL(footerUrl);

              canvas.toBlob(function (blob) {
                let a = document.createElement('a'),
                  aUrl = URL.createObjectURL(blob);
                a.download = filename;
                a.href = aUrl;
                body.appendChild(a);
                setTimeout(() => {
                  a.click();
                  aUrl = URL.revokeObjectURL(aUrl);
                  body.removeChild(a);
                }, 10);
              });
            }, 100);
          }
          // copy
          else {
            setTimeout(() => {
              imageUrl = URL.revokeObjectURL(imageUrl);
              headerUrl = URL.revokeObjectURL(headerUrl);
              subheaderUrl = URL.revokeObjectURL(subheaderUrl);
              footerUrl = URL.revokeObjectURL(footerUrl);

              if (navigator.clipboard) {
                if (i === numSvgs - 1) {
                  // console.log("copied")
                  canvas.toBlob((blob) => {
                    const data = [
                      new ClipboardItem({
                        'image/png': blob,
                      }),
                    ];

                    navigator.clipboard.write(data).then(
                      () => {
                        // garbage collect
                        setTimeout(() => {
                          imageUrl = URL.revokeObjectURL(imageUrl);
                          headerUrl = URL.revokeObjectURL(headerUrl);
                          subheaderUrl = URL.revokeObjectURL(subheaderUrl);
                          footerUrl = URL.revokeObjectURL(footerUrl);
                        }, 10);

                        resolve('copied to the clipboard');
                      },
                      () => {
                        // garbage collect
                        setTimeout(() => {
                          imageUrl = URL.revokeObjectURL(imageUrl);
                          headerUrl = URL.revokeObjectURL(headerUrl);
                          subheaderUrl = URL.revokeObjectURL(subheaderUrl);
                          footerUrl = URL.revokeObjectURL(footerUrl);
                        }, 10);

                        console.error('Unable to write to clipboard. :-(');
                        resolve('sorry; copying this figure is unavailable');
                      },
                    );
                  });
                }
              } // end of navigator.clipboard
            }, 100); /// needs to be long enough to grab the data
          } // end else
        }, 10); // end image load timeout
      };

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      image.src = imageUrl;
      imageHeader.src = headerUrl;
      imageSubheader.src = subheaderUrl;
      imageFooter.src = footerUrl;
    });
  });
};
