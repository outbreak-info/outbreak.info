const prefix = {
  xmlns: "http://www.w3.org/2000/xmlns/",
  xlink: "http://www.w3.org/1999/xlink",
  svg: "http://www.w3.org/2000/svg"
}

// code adapted from https://github.com/nytimes/svg-crowbar (thanks, Mike Bostock)
export function getSvg(figureRef, sources, date) {
  const refs = document.getElementsByClassName(figureRef);
  var emptySvg = window.document.createElementNS(prefix.svg, 'svg');
  window.document.body.appendChild(emptySvg);
  var emptySvgDeclarationComputed = getComputedStyle(emptySvg);

  const svgObject = getSvgSources(refs, emptySvgDeclarationComputed, sources, date);
  return (svgObject)
}

function getSvgSources(svgs, emptySvgDeclarationComputed, sources, date) {
  var svgInfo = [];
  var doctype = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';

  // apparently nodes, while array-like, don't have a `forEach` property attached to them... hence this syntax
  [].forEach.call(svgs, svg => {

    svg.setAttribute("version", "1.1");

    // removing attributes so they aren't doubled up
    svg.removeAttribute("xmlns");
    svg.removeAttribute("xlink");


    // These are needed for the svg
    if (!svg.hasAttributeNS(prefix.xmlns, "xmlns")) {
      svg.setAttributeNS(prefix.xmlns, "xmlns", prefix.svg);
    }

    if (!svg.hasAttributeNS(prefix.xmlns, "xmlns:xlink")) {
      svg.setAttributeNS(prefix.xmlns, "xmlns:xlink", prefix.xlink);
    }

    // necessary to nest styles inline
    setInlineStyles(svg, emptySvgDeclarationComputed);

    var source = (new XMLSerializer()).serializeToString(svg);
    var rect = svg.getBoundingClientRect();

    const title = svg.getAttribute("name");
    const footer = getFooter(rect.width, rect.height, sources, date);
    const header = getHeader(rect.width, title);


    svgInfo.push({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      class: svg.getAttribute("class"),
      id: svg.getAttribute("id"),
      name: title,
      childElementCount: svg.childElementCount,
      source: [doctype + `<svg width="${rect.width}" height="${rect.height + 100}">` + header + '<g transform="translate(0,35)">' + source + footer + "</g></svg>"]
    });
  });
  return svgInfo;
}

function getHeader(width, title) {
  return (`<svg xmlns="http://www.w3.org/2000/svg" id="title" viewBox="0 0 ${width} 25" width="${width}" height="20" preserveAspectRatio="xMidYMid meet">
  <text x="0" y="0" transform="translate(10,10)" fill="currentColor"
    style="dominant-baseline: hanging; font-size:18px;display:block;font-family:&quot;DM Sans&quot;, Avenir, Helvetica, Arial, sans-serif;height:auto;line-height:15px;outline-color:rgb(44, 62, 80);overflow-x:visible;overflow-y:visible;text-align:center;text-decoration:none solid rgb(44, 62, 80);text-decoration-color:rgb(44, 62, 80);vertical-align:baseline;white-space:nowrap;width:auto;column-rule-color:rgb(44, 62, 80);-webkit-font-smoothing:antialiased;perspective-origin:0px 0px;-webkit-text-emphasis-color:rgb(44, 62, 80);-webkit-text-fill-color:rgb(44, 62, 80);-webkit-text-stroke-color:rgb(44, 62, 80);transform-origin:0px 0px;fill:rgb(44, 62, 80);text-anchor:start;caret-color:rgb(44, 62, 80);">
  ${title}</text>
  </svg>`)
}


function getFooter(width, height, sources, date) {
  return (`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${width} 55" width="${width}" height="50" id="footer" class="sources mt-2" transform="translate(0, ${height + 15})">
  <g id="background">
  <rect width="${width}" height="50" style="fill: #dee2e6"></rect>
  </g>

      <g id="top_border">
        <line x1="0" y1="2" x2="${width}" y2="2" stroke="#126B93" stroke-width="5"></line>
      </g>

  <g id="citation" transform="translate(10,5)">
    <g transform="translate(0, -8)" id="logo">
      <svg version="1.1" id="Layer_1" x="0px" y="0px" width="25px"
         viewBox="0 0 396.4 396.4" style="enable-background:new 0 0 396.4 396.4;" xml:space="preserve">
      <g>
        <circle cx="198.2" cy="203" r="180"/>
        <g>
          <circle style="fill:#114068;" cx="198.2" cy="204.7" r="151.6"/>
        </g>
        <linearGradient id="SVGID_1_" gradientUnits="userSpaceOnUse" x1="195.2239" y1="53.7053" x2="333.4954" y2="293.1985">
          <stop  offset="0" style="stop-color:#39C2E2"/>
          <stop  offset="0.6781" style="stop-color:#39C2E2;stop-opacity:0"/>
        </linearGradient>
        <path style="fill:url(#SVGID_1_);" d="M196.1,212.6l114.2,94c24.5-26.9,39.6-62.6,39.6-101.9c0-83.7-67.9-151.6-151.6-151.6
          c-0.7,0-1.4,0.1-2.1,0.1V212.6z"/>
        <g>
          <path style="fill:#FFFFFF;" d="M198.2,272.2c-32.4,0-58.8-26.4-58.8-58.8s26.4-58.8,58.8-58.8s58.8,26.4,58.8,58.8
            S230.6,272.2,198.2,272.2z M198.2,161.6c-28.5,0-51.7,23.2-51.7,51.7s23.2,51.7,51.7,51.7c28.5,0,51.7-23.2,51.7-51.7
            S226.7,161.6,198.2,161.6z"/>
        </g>
        <g>
          <path style="fill:#FFFFFF;" d="M198.2,330.8c-64.7,0-117.4-52.7-117.4-117.4S133.5,95.9,198.2,95.9c64.7,0,117.4,52.7,117.4,117.4
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
      <g id="outbreak-info" transform="translate(0, 22.3)">
        <text x="0" y="0" transform="translate(30,0)" style="font-size:17px; dominant-baseline: middle;font-family:&quot;DM Sans&quot;, Avenir, Helvetica, Arial, sans-serif;">outbreak.info</text>
        <text x="0" y="0" transform="translate(${width - 30},0)" style="dominant-baseline: middle; font-size:13px; text-anchor: end;font-family:&quot;DM Sans&quot;, Avenir, Helvetica, Arial, sans-serif;">${date}</text>
      </g>

      <g id="sources" transform="translate(0, 36)">
        <text x="0" y="0" transform="translate(30,0)" style="dominant-baseline: middle;font-size: 10px;fill: #6c757d;font-family:&quot;DM Sans&quot;, Avenir, Helvetica, Arial, sans-serif;">Source: ${sources}</text>
      </g>
      </g>
    </svg>`)
}

function setInlineStyles(svg, emptySvgDeclarationComputed) {

  function explicitlySetStyle(element) {
    var cSSStyleDeclarationComputed = getComputedStyle(element);
    var i, len, key, value;
    var computedStyleStr = "";
    for (i = 0, len = cSSStyleDeclarationComputed.length; i < len; i++) {
      key = cSSStyleDeclarationComputed[i];
      value = cSSStyleDeclarationComputed.getPropertyValue(key);
      if (value !== emptySvgDeclarationComputed.getPropertyValue(key)) {
        computedStyleStr += key + ":" + value + ";";
      }
    }
    element.setAttribute('style', computedStyleStr);
  }

  function traverse(obj) {
    var tree = [];
    tree.push(obj);
    visit(obj);

    function visit(node) {
      if (node && node.hasChildNodes()) {
        var child = node.firstChild;
        while (child) {
          if (child.nodeType === 1 && child.nodeName != 'SCRIPT') {
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
  var allElements = traverse(svg);
  var i = allElements.length;
  while (i--) {
    explicitlySetStyle(allElements[i]);
  }
}

// based on https://github.com/mbostock/svjimmy/blob/master/index.js
// Thanks, Mike.

export function getPng(selector, sources, date, download = false, filename = "outbreakinfo_visualization.png") {
  return new Promise((resolve, reject) => {
    const spacer = 25
    var document = global.document,
      body = document.body,
      forEach = Array.prototype.forEach,
      styles = document.querySelectorAll("style");

    const svgs = document.querySelectorAll(selector);
    const numSvgs = svgs.length;
    if (numSvgs === 0) {
      reject("Error: no svg found with that selector")
    }

    const numAcross = numSvgs > 2 ? Math.ceil(Math.sqrt(numSvgs)) : numSvgs;
    var canvasWidth = 0;


    var canvas = document.createElement("canvas"),
      context = canvas.getContext("2d"),
      ratio = global.devicePixelRatio || 1;

    forEach.call(svgs, function(svg, i) {
      if (svg.namespaceURI !== "http://www.w3.org/2000/svg") return; // Not really an SVG.
      if (svg.ownerSVGElement) return; // An SVG within another SVG.

      forEach.call(styles, function(style) {
        svg.appendChild(style.cloneNode(true));
      });

      var
        title = svg.getAttribute("name"),
        rect = svg.getBoundingClientRect(),
        width = rect.width * ratio,
        height = rect.height * ratio,
        image = new Image,
        imageHeader = new Image,
        imageFooter = new Image;

      // Can't append new SVG objects to the DOM, b/c then they would apper on the page
      const header = getHeader(rect.width, title);
      const footer = getFooter(rect.width, -15, sources, date);

      var source = (new XMLSerializer()).serializeToString(svg);

      var imageUrl = URL.createObjectURL(new Blob([source], {
        type: "image/svg+xml"
      }));

      var headerUrl = URL.createObjectURL(new Blob([header], {
        type: "image/svg+xml"
      }));

      var footerUrl = URL.createObjectURL(new Blob([footer], {
        type: "image/svg+xml"
      }));


      image.onload = function() {
        setTimeout(function() {
          // if you combine into one image, they seem to ignore the translate functionality and the images are overlaid
          context.drawImage(image, i * (width + spacer), 35, width, height);
          context.drawImage(imageHeader, i * (width + spacer), 0, width, 18 * ratio);
          // only draw the footer on the last image
          if (i === numSvgs-1) {
            context.drawImage(imageFooter, 0, height, width, 50 * ratio);
          }
          if (download && i === numSvgs - 1) {
            canvas.toBlob(function(blob) {
              var a = document.createElement("a"),
                aUrl = URL.createObjectURL(blob);
              a.download = filename;
              a.href = aUrl;
              body.appendChild(a);
              setTimeout(function() {
                a.click();
                aUrl = URL.revokeObjectURL(aUrl);
                imageUrl = URL.revokeObjectURL(imageUrl);
                body.removeChild(a);
              }, 10);
            });
          }
          // copy
          else {
            if (navigator.clipboard) {

              canvas.toBlob(blob => {
                var data = [new ClipboardItem({
                  "image/png": blob
                })];

                navigator.clipboard.write(data).then(function() {
                  resolve("copied to the clipboard")
                }, function() {
                  console.error("Unable to write to clipboard. :-(");
                  resolve("sorry; copying this figure is unavailable")
                });
              })
            }

          }
        }, 10);
      };

      canvas.width = (width+spacer)*numSvgs;
      canvas.height = height + 50 * ratio;
      image.src = imageUrl;
      imageHeader.src = headerUrl;
      imageFooter.src = footerUrl;
    });
  })
}
