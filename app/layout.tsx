import type { Metadata } from "next";
import "../styles/globals.css";
import CaseStudyCursor from "@/components/CaseStudyCursor";

export const metadata: Metadata = {
  title: "Edgar Sanchez — Product Designer",
  description:
    "Senior product designer with 5 years of experience in B2B/Enterprise products. " +
    "Available for senior IC and lead design roles at product-led companies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Hotjar Tracking Code for https://www.edgarsanchez.design */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
    (function(h,o,t,j,a,r){
        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
        h._hjSettings={hjid:3837615,hjsv:6};
        a=o.getElementsByTagName('head')[0];
        r=o.createElement('script');r.async=1;
        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
        a.appendChild(r);
    })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
!function(m,n,e,t,l,o,g,y){var u,a,f=function(h){
return!(h in m)||(m.console&&m.console.log&&m.console.log("FullStory namespace conflict. Please use a different namespace."),!1)}(l)
;f&&(g=m[l]=function(){var b=function(b,d,j,r){r=r||2;var i,c=/Async$/;return c.test(b)&&(b=b.replace(c,""),
"function"==typeof Promise)?new Promise((function(i,c){h(b,d,j,i,c,r)})):h(b,d,j,i,i,r)};function h(h,d,j,r,i,c){
return b._api?b._api(h,d,j,r,i,c):(b.q&&b.q.push([h,d,j,r,i,c]),null)}return b.q=[],b}(),y=function(b){function h(h){
"function"==typeof h[4]&&h[4](new Error(b))}var d=g.q;if(d){for(var j=0;j<d.length;j++)h(d[j]);d.length=0,d.push=h}},function(){
var b="script",d=n.createElement(b);d.async=!0,d.crossOrigin="anonymous",d.src="https://"+t+"?org="+o,d.setAttribute("data-fs-namespace",l),
d.onerror=function(){y("Error loading "+t)};var c=n.getElementsByTagName(b)[0]
;c&&c.parentNode?c.parentNode.insertBefore(d,c):n.head.appendChild(d)}(),function(){function b(){}function h(b,h,d){g(b,h,d,1)}function d(b,d,j){
h("setProperties",{type:b,properties:d},j)}function j(b,h){d("user",b,h)}function r(b,h,d){j({uid:b},d),h&&j(h,d)}g.identify=r,g.setUserVars=j,
g.identifyAccount=b,g.clearUserCookie=b,g.setVars=d,g.event=function(b,d,j){h("trackEvent",{name:b,properties:d},j)},g.anonymize=function(){r(!1)
},g.shutdown=function(){h("shutdown")},g.restart=function(){h("restart")},g.log=function(b,d){h("log",{level:b,msg:d})},g.consent=function(b){
h("setIdentity",{consent:!arguments.length||b})}}(),u="fetch",a="XMLHttpRequest",g._w={},g._w[a]=m[a],g._w[u]=m[u],m[u]&&(m[u]=function(){
return g._w[u].apply(this,arguments)}),g("init",{env:{orgId:o,host:e,script:t}}),g._v="2.1.0")
}(window,document,"fullstory.com","edge.fullstory.com/s/fs.js","FS","o-2531VQ-na1");
`,
          }}
        />
      </head>
      {/*
        font-body is the default typeface (Cabinet Grotesk).
        Individual components opt-in to font-display (Clash Display)
        via the font-display Tailwind utility.
      */}
      <body className="font-body bg-surface-base antialiased">
        {children}
        <CaseStudyCursor />
      </body>
    </html>
  );
}
