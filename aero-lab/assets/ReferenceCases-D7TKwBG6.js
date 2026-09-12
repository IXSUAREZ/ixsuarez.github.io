import{r as u,j as e}from"./index-BgeCPl-6.js";import{c as I,C as P}from"./App-bAJb-xzN.js";/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const E=I("ExternalLink",[["path",{d:"M15 3h6v6",key:"1q9fwt"}],["path",{d:"M10 14 21 3",key:"gplh6r"}],["path",{d:"M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6",key:"a6xqqp"}]]),U=`# Data from Ladson, NASA TM 4074, 1988
# Re=6 million, with transition tripped
# M=0.15
variables="alpha, deg","cl","cd"
zone, t="80 grit"
-4.04  -.4417  .00871
-2.14  -.2385  .00800
-.05   -.0126  .00809
2.05    .2125  .00816
4.04    .4316  .00823
6.09    .6546  .00885
8.30    .8873  .01050
10.12  1.0707  .01201
11.13  1.1685  .01239
12.12  1.2605  .01332
13.08  1.3455  .01503
14.22  1.4365  .01625
15.26  1.5129  .01900
16.30  1.5739  .02218
17.13  1.6116  .02560
18.02   .9967  .18785
19.08  1.1358  .27292
zone, t="120 grit"
-4.01  -.4466  .00843
-2.12  -.2425  .00789
-.01   -.0120  .00811
.01    -.0122  .00804
2.15    .2236  .00823
4.11    .4397  .00879
6.01    .6487  .00842
8.08    .8701  .00995
10.10  1.0775  .01175
11.23  1.1849  .01248
12.13  1.2720  .01282
13.26  1.3699  .01408
14.30  1.4571  .01628
15.27  1.5280  .01790
16.16  1.5838  .02093
17.24  1.6347  .02519
18.18  1.1886  .25194
19.25  1.1888  .28015
zone, t="180 grit"
-3.99  -.4363  .00871
-1.98  -.2213  .00792
-.03   -.0115  .00803
.04    -.0013  .00811
2.00    .2213  .00814
4.06    .4365  .00814
6.09    .6558  .00851
8.09    .8689  .00985
10.18  1.0809  .01165
11.13  1.1731  .01247
12.10  1.2644  .01299
13.31  1.3676  .01408
14.08  1.4316  .01533
15.24  1.5169  .01870
16.33  1.5855  .02186
17.13  1.6219  .02513
18.21  1.0104  .25899
19.27  1.0664  .43446
`,T=`# Data from Gregory & O'Reilly, NASA R&M 3726, Jan 1970
# Re=2.88 million
# Data was digitized from a photocopy - hence is only approximate
# Data for upper airfoil surface only
variables="x/c","cp"
zone, t="alpha=0"
0 1
0.0023497 0.847673
0.00496048 0.456198
0.00526903 0.173569
0.0142406 -0.044407
0.0209337 -0.175278
0.0473501 -0.372653
0.0779437 -0.396388
0.0976194 -0.41941
0.128166 -0.418874
0.150001 -0.411087
0.178387 -0.402938
0.289702 -0.36672
0.322431 -0.347115
0.387891 -0.307906
0.448983 -0.268412
0.514442 -0.229203
0.579902 -0.189994
0.638834 -0.159098
0.704317 -0.114629
0.767593 -0.065278
0.835236 -0.026211
0.896305 0.03502
0.959533 0.0978565
1.0009 0.173854
zone, t="alpha=10"
0 -3.66423
0.00218341 -5.04375
0.00873362 -5.24068
0.0131004 -4.67125
0.0174672 -4.32079
0.0480349 -2.74347
0.0742358 -2.26115
0.0982533 -1.95405
0.124454 -1.7345
0.146288 -1.55884
0.176856 -1.36109
0.28821 -1.00829
0.320961 -0.941877
0.384279 -0.787206
0.447598 -0.654432
0.515284 -0.543461
0.576419 -0.432633
0.637555 -0.343703
0.700873 -0.254725
0.766376 -0.1657
0.831878 -0.098572
0.893013 -0.00964205
0.958515 0.0793835
1 0.124088
zone, t="alpha=15"
-7.59438e-05 -8.65066
0.0024302 -10.1789
0.00450442 -9.72033
0.00870506 -9.04329
0.0129722 -8.67192
0.0167741 -6.16084
0.0467387 -3.99796
0.0769928 -3.16694
0.0964534 -2.68574
0.146315 -2.05038
0.174528 -1.83081
0.287443 -1.23636
0.317853 -1.12586
0.380854 -0.9266
0.443854 -0.727343
0.509042 -0.593492
0.576404 -0.459546
0.635076 -0.347813
0.698095 -0.235891
0.761123 -0.167637
0.8285 -0.0991921
0.893707 -0.0526765
0.954576 -0.0500185
1.00022 -0.00435728
`;function z(t,a){const l=t.split(/(?=^zone,)/m).filter(s=>s.trimStart().startsWith("zone,"));if(l.length===0)throw new Error(`${a}: no data zones found`);return l}function G(t,a,l){return t.split(/\r?\n/).map(s=>s.trim()).filter(s=>s&&!s.startsWith("#")&&!s.startsWith("variables")&&!s.startsWith("zone")).map(s=>{const i=s.split(/\s+/).map(Number);if(i.length!==a||i.some(x=>!Number.isFinite(x)))throw new Error(`${l}: malformed numeric row: ${s}`);return i})}const w=z(U,"CLCD_Ladson_expdata.dat").map(t=>{const a=t.match(/zone, t="([^"]+)"/);if(!a)throw new Error("CLCD_Ladson_expdata.dat: missing roughness-series header");return{grit:a[1],reMillion:6,mach:.15,points:G(t,3,`CLCD_Ladson_expdata.dat ${a[1]}`).map(([l,s,i])=>({alpha:l,cl:s,cd:i}))}}),L=z(T,"CP_Gregory_expdata.dat").map(t=>{const a=t.match(/alpha=([\d.-]+)/),l=a?Number(a[1]):Number.NaN;if(!Number.isFinite(l))throw new Error("CP_Gregory_expdata.dat: missing angle-of-attack header");return{alpha:l,reMillion:2.88,digitizedApproximate:!0,surface:"upper",points:G(t,2,`CP_Gregory_expdata.dat alpha=${l}`).map(([s,i])=>({x:s,cp:i}))}}),D=t=>2*Math.PI*t*Math.PI/180,m={sourceUrl:"https://tmbwg.github.io/turbmodels/naca0012_val.html",ladsonSourceUrl:"https://ntrs.nasa.gov/citations/19880019495",gregorySourceUrl:"https://reports.aerade.cranfield.ac.uk/handle/1826.2/1250",ladsonRaw:"CLCD_Ladson_expdata.dat",gregoryRaw:"CP_Gregory_expdata.dat"};function N({kind:t,points:a,xKey:l,yKey:s,label:i,xLabel:x,yLabel:h,yZero:g=!1,invertY:c=!1,compare:d}){const n=[...a,...d||[]],p=n.map(r=>r[l]),A=n.map(r=>r[s]),y=Math.min(...p),k=Math.max(...p),b=Math.min(...A),R=Math.max(...A),C=r=>42+(r-y)/(k-y||1)*476,f=r=>{const o=(r-b)/(R-b||1);return c?42+o*156:198-o*156},S=(r,o)=>[r,r+(o-r)/2,o],$=r=>Number(r.toFixed(2)).toString(),_=r=>r.map(o=>`${C(o[l])},${f(o[s])}`).join(" ");return e.jsxs("svg",{className:"reference-plot",viewBox:"0 0 560 240",role:"img","aria-label":i,children:[e.jsx("path",{d:"M42 198H518M42 42V198",stroke:"currentColor",opacity:".25"}),g&&e.jsx("path",{d:`M42 ${f(0)}H518`,stroke:"currentColor",strokeDasharray:"4 4",opacity:".35"}),S(y,k).map(r=>e.jsx("text",{x:C(r),y:213,textAnchor:"middle",children:$(r)},`x-${r}`)),S(b,R).map(r=>e.jsx("text",{x:35,y:f(r)+3,textAnchor:"end",children:$(r)},`y-${r}`)),e.jsx("polyline",{points:_(a),fill:"none",stroke:"#4d856f",strokeWidth:"2"}),d&&e.jsx("polyline",{points:_(d),fill:"none",stroke:"#c0834f",strokeWidth:"2",strokeDasharray:"5 4"}),a.map((r,o)=>e.jsx("circle",{cx:C(r[l]),cy:f(r[s]),r:"2.5",fill:"#4d856f"},o)),e.jsx("text",{x:560/2,y:235,textAnchor:"middle",children:x}),e.jsx("text",{x:"12",y:240/2,textAnchor:"middle",transform:`rotate(-90 12 ${240/2})`,children:h}),e.jsx("text",{x:518,y:28,textAnchor:"end",className:"reference-plot-label",children:t})]})}function F(t){return t.filter(a=>Math.abs(a.alpha)<=10).map(a=>({...a,ideal:D(a.alpha),delta:a.cl-D(a.alpha)}))}function K(){const[t,a]=u.useState(!1),[l,s]=u.useState("80 grit"),[i,x]=u.useState(10),[h,g]=u.useState(!1),c=w.find(n=>n.grit===l)||w[0],d=L.find(n=>n.alpha===i)||L[0],j=F(c.points),v=c.points.map(n=>({alpha:n.alpha,cl:n.cl})),M=j.map(n=>({alpha:n.alpha,cl:n.ideal}));return e.jsxs("section",{className:"reference-cases",children:[e.jsxs("button",{className:"reference-toggle",onClick:()=>a(n=>!n),"aria-expanded":t,children:[e.jsxs("span",{children:[e.jsx("span",{className:"reference-eyebrow",children:"NASA VALIDATION CASES"}),e.jsx("strong",{children:"Reference data: NACA 0012"})]}),e.jsx(P,{size:18,className:t?"reference-rotated":""})]}),t&&e.jsxs("div",{className:"reference-body",children:[e.jsx("p",{className:"reference-intro",children:"Independent wind-tunnel references are shown as separate cases. They are not merged with the current finite-wing model and do not establish C172S performance."}),e.jsx("p",{className:"reference-links",children:e.jsxs("a",{href:m.sourceUrl,target:"_blank",rel:"noreferrer",children:["NASA Turbulence Modeling Resource validation page"," ",e.jsx(E,{size:13})]})}),e.jsxs("details",{className:"reference-source-details",children:[e.jsx("summary",{children:"Source, geometry, and provenance details"}),e.jsx("p",{children:"Ladson is NASA TM 4074 experimental NACA 0012 CL/CD data at Re 6 million, M 0.15, with transition tripped. Gregory and O'Reilly is UK R&M 3726 digitized approximate upper-surface Cp at Re 2.88 million. The source data describe an experimental nominal NACA 0012; the browser benchmark uses its own sharp-trailing-edge geometry recipe, so those geometries, facilities, and transition conditions are not interchangeable."}),e.jsxs("p",{children:[e.jsx("a",{href:m.ladsonSourceUrl,target:"_blank",rel:"noreferrer",children:"NASA TM 4074 record"})," ","·"," ",e.jsx("a",{href:m.gregorySourceUrl,target:"_blank",rel:"noreferrer",children:"UK R&M 3726 record"})]})]}),e.jsxs("div",{className:"reference-grid",children:[e.jsxs("article",{children:[e.jsx("h3",{children:"Ladson · CL/CD"}),e.jsx("p",{children:"Re = 6 million · M = 0.15 · transition tripped. Choose one roughness series."}),e.jsx("select",{"aria-label":"Ladson roughness series",value:l,onChange:n=>s(n.target.value),children:w.map(n=>e.jsx("option",{children:n.grit},n.grit))}),e.jsx(N,{kind:`${c.grit} · Re 6M · M .15`,points:v,compare:h?M:void 0,xKey:"alpha",yKey:"cl",xLabel:"α (deg)",yLabel:"CL",label:"Ladson lift coefficient versus angle of attack; optional ideal comparison"}),h&&e.jsxs("div",{className:"reference-legend",children:[e.jsx("span",{className:"reference-legend-measured",children:"Measured CL"}),e.jsx("span",{className:"reference-legend-ideal",children:"Ideal 2π CL"})]}),e.jsx(N,{kind:"Drag",points:c.points.map(n=>({alpha:n.alpha,cd:n.cd})),xKey:"alpha",yKey:"cd",xLabel:"α (deg)",yLabel:"CD",label:"Ladson drag coefficient versus angle of attack"}),e.jsxs("label",{className:"reference-theory-toggle",children:[e.jsx("input",{type:"checkbox",checked:h,onChange:n=>g(n.target.checked)})," ","Show ideal thin-airfoil CL comparison"]}),h&&e.jsxs(e.Fragment,{children:[e.jsx("p",{className:"reference-theory-note",children:"Ideal thin-airfoil lift slope, 2π per radian; force-only comparison for |α| ≤ 10°. It excludes finite-wing effects, flap effects, stall, and drag."}),e.jsxs("table",{className:"reference-comparison-table",children:[e.jsx("caption",{children:"Measured versus ideal CL (selected series; only |α| ≤ 10°)"}),e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"α°"}),e.jsx("th",{children:"Measured CL"}),e.jsx("th",{children:"Ideal 2π CL"}),e.jsx("th",{children:"ΔCL measured−ideal"})]})}),e.jsx("tbody",{children:j.map(n=>e.jsxs("tr",{children:[e.jsx("td",{children:n.alpha}),e.jsx("td",{children:n.cl.toFixed(4)}),e.jsx("td",{children:n.ideal.toFixed(4)}),e.jsx("td",{children:n.delta.toFixed(4)})]},n.alpha))})]})]}),e.jsxs("details",{children:[e.jsxs("summary",{children:["Point table (",c.points.length,")"]}),e.jsxs("table",{children:[e.jsxs("caption",{children:["Ladson ",c.grit," raw points"]}),e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"α°"}),e.jsx("th",{children:"CL"}),e.jsx("th",{children:"CD"})]})}),e.jsx("tbody",{children:c.points.map((n,p)=>e.jsxs("tr",{children:[e.jsx("td",{children:n.alpha}),e.jsx("td",{children:n.cl}),e.jsx("td",{children:n.cd})]},p))})]})]})]}),e.jsxs("article",{children:[e.jsx("h3",{children:"Gregory & O'Reilly · upper-surface Cp"}),e.jsx("p",{children:"Re = 2.88 million · digitized approximate · upper surface only."}),e.jsx("select",{"aria-label":"Gregory angle",value:i,onChange:n=>x(Number(n.target.value)),children:L.map(n=>e.jsxs("option",{value:n.alpha,children:["α = ",n.alpha,"°"]},n.alpha))}),e.jsx(N,{kind:`Upper Cp · α ${d.alpha}°`,points:d.points.map(n=>({x:n.x,cp:n.cp})),xKey:"x",yKey:"cp",xLabel:"x/c",yLabel:"Cp (negative upward)",invertY:!0,label:"Gregory upper surface pressure coefficient versus x/c; negative Cp is upward"}),e.jsxs("details",{children:[e.jsxs("summary",{children:["Point table (",d.points.length,")"]}),e.jsxs("table",{children:[e.jsxs("caption",{children:["Gregory upper surface Cp α ",d.alpha,"°"]}),e.jsx("thead",{children:e.jsxs("tr",{children:[e.jsx("th",{children:"x/c"}),e.jsx("th",{children:"Cp"})]})}),e.jsx("tbody",{children:d.points.map((n,p)=>e.jsxs("tr",{children:[e.jsx("td",{children:n.x}),e.jsx("td",{children:n.cp})]},p))})]})]})]})]}),e.jsxs("small",{className:"reference-provenance",children:["Raw files retained: ",m.ladsonRaw,","," ",m.gregoryRaw,". Parsed values are checked for finite numeric rows; no lower-surface Cp is invented."]})]})]})}export{K as default};
