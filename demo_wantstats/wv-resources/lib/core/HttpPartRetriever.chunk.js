/** Notice * This file contains works from many authors under various (but compatible) licenses. Please see core.txt for more information. **/
(function(){(window.wpCoreControlsBundle=window.wpCoreControlsBundle||[]).push([[0],{384:function(ia,y,e){e.r(y);e.d(y,"ByteRangeRequest",function(){return ja});var fa=e(1),x=e(0);e.n(x);var ha=e(2),ea=e(132);ia=e(84);var da=e(216),ba=e(65),w=e(61),z=e(215),r=e(142);e=e(316);var h=[],f=[],n=window,ca=function(){return function(){this.Rk=1}}(),aa;(function(f){f[f.UNSENT=0]="UNSENT";f[f.DONE=4]="DONE"})(aa||(aa={}));var ja=function(){function e(f,e,h,r){var w=this;this.url=f;this.range=e;this.He=h;this.withCredentials=
r;this.zX=aa;this.request=new XMLHttpRequest;this.request.open("GET",this.url,!0);n.Uint8Array&&(this.request.responseType="arraybuffer");r&&(this.request.withCredentials=r);ka.DISABLE_RANGE_HEADER||(Object(x.isUndefined)(e.stop)?this.request.setRequestHeader("Range","bytes="+e.start):this.request.setRequestHeader("Range",["bytes=",e.start,"-",e.stop-1].join("")));h&&Object.keys(h).forEach(function(f){w.request.setRequestHeader(f,h[f])});this.request.overrideMimeType?this.request.overrideMimeType("text/plain; charset=x-user-defined"):
this.request.setRequestHeader("Accept-Charset","x-user-defined");this.status=z.a.NOT_STARTED}e.prototype.start=function(f){var e=this,h=this.request;h.onreadystatechange=function(){if(e.aborted)return e.status=z.a.ABORTED,f({code:z.a.ABORTED});if(this.readyState===e.zX.DONE){e.vz();var r=0===window.document.URL.indexOf("file:///");200===h.status||206===h.status||r&&0===h.status?(r=n.LO(this),e.Wr(r,f)):(e.status=z.a.ERROR,f({code:e.status,status:e.status}))}};this.request.send(null);this.status=z.a.STARTED};
e.prototype.Wr=function(f,e){this.status=z.a.SUCCESS;if(e)return e(!1,f)};e.prototype.abort=function(){this.vz();this.aborted=!0;this.request.abort()};e.prototype.vz=function(){var n=Object(r.c)(this.url,this.range,f);-1!==n&&f.splice(n,1);if(0<h.length){n=h.shift();var w=new e(n.url,n.range,this.He,this.withCredentials);n.request=w;f.push(n);w.start(Object(r.d)(n))}};e.prototype.extend=function(f){var e=Object.assign({},this,f.prototype);e.constructor=f;return e};return e}(),ka=function(e){function n(f,
h,n,r,w){n=e.call(this,f,n,r)||this;n.Uk={};n.hy=h;n.url=f;n.DISABLE_RANGE_HEADER=!1;n.xv=ja;n.rJ=3;n.He=w||{};return n}Object(fa.c)(n,e);n.prototype.Ft=function(f,e,h){var n=-1===f.indexOf("?")?"?":"&";switch(h){case !1:case w.a.NEVER_CACHE:f=f+n+"_="+Object(x.uniqueId)();break;case !0:case w.a.CACHE:f=f+n+"_="+e.start+","+(Object(x.isUndefined)(e.stop)?"":e.stop)}return f};n.prototype.NM=function(f,e,h,n){void 0===h&&(h={});return new this.xv(f,e,h,n)};n.prototype.i3=function(e,n,r,w,aa){for(var z=
0;z<h.length;z++)if(Object(x.isEqual)(h[z].range,n)&&Object(x.isEqual)(h[z].url,e))return h[z].eg.push(w),h[z].tA++,null;for(z=0;z<f.length;z++)if(Object(x.isEqual)(f[z].range,n)&&Object(x.isEqual)(f[z].url,e))return f[z].eg.push(w),f[z].tA++,null;r={url:e,range:n,hy:r,eg:[w],tA:1};if(0===h.length&&f.length<this.rJ)return f.push(r),r.request=this.NM(e,n,aa,this.withCredentials),r;h.push(r);return null};n.prototype.wm=function(e,n,w){var x=this.Ft(e,n,this.hy);(e=this.i3(x,n,this.hy,w,this.He))&&e.request.start(Object(r.d)(e));
return function(){var e=Object(r.c)(x,n,f);if(-1!==e){var w=--f[e].tA;0===w&&f[e].request&&f[e].request.abort()}else e=Object(r.c)(x,n,h),-1!==e&&(w=--h[e].tA,0===w&&h.splice(e,1))}};n.prototype.sO=function(){return{start:-ea.a}};n.prototype.F6=function(){var f=-(ea.a+ea.e);return{start:f-ea.d,end:f}};n.prototype.hr=function(f){var e=this;this.ny=!0;var h=ea.a;this.wm(this.url,this.sO(),function(n,r,w){function x(){var h=e.wd.oO();e.wm(e.url,h,function(n,r){if(n)return Object(ha.j)("Error loading central directory: "+
n),f(n);r=Object(ba.a)(r);if(r.length!==h.stop-h.start)return f("Invalid XOD file: Zip central directory data is wrong size! Should be "+(h.stop-h.start)+" but is "+r.length);e.wd.OR(r);e.QD=!0;e.ny=!1;return f(!1)})}if(n)return Object(ha.j)("Error loading end header: "+n),f(n,r,w);r=Object(ba.a)(r);if(r.length!==h)return f("Invalid XOD file: Zip end header data is wrong size!");try{e.wd=new da.a(r)}catch(na){return f(na)}e.wd.k8?e.wm(e.url,e.F6(),function(h,n){if(h)return Object(ha.j)("Error loading zip64 header: "+
h),f(h);n=Object(ba.a)(n);e.wd.B8(n);x()}):x()})};n.prototype.JO=function(f){f(Object.keys(this.wd.Wl))};n.prototype.lH=function(f,e){var h=this;if(this.wd.EM(f)){var n=this.wd.oz(f);if(n in this.Uk){var r=this.fh[f];r.Vp=this.Uk[n];r.Vp.Rk++;r.cancel=r.Vp.cancel}else{var w=this.wd.V4(f),x=this.wm(this.url,w,function(r,x){r?(Object(ha.j)('Error loading part "'+f+'": '+r),h.wm(h.url,w,function(r,x){if(r)return e(r,f);h.SR(x,w,n,f,e)})):h.SR(x,w,n,f,e)}),aa=this.fh[f];aa&&(aa.eU=!0,aa.cancel=function(){aa.Vp.Rk--;
0===aa.Vp.Rk&&(x(),delete h.Uk[n])},this.Uk[n]=new ca(n),aa.Vp=this.Uk[n],aa.Vp.cancel=aa.cancel)}}else delete this.fh[f],e(Error('File not found: "'+f+'"'),f)};n.prototype.SR=function(f,e,h,n,r){if(f.length!==e.stop-e.start)r(Error("Part data is wrong size!"),n);else{do{if(!this.Uk[h])return;n=this.Uk[h].Rk;for(var w=e.Po.length,x=0;x<w;++x){var aa=e.Po[x];r(!1,aa.Mo,f["string"===typeof f?"substring":"subarray"](aa.start,aa.stop),this.wd.EP(aa.Mo));aa.Mo in this.fh&&delete this.fh[aa.Mo]}}while(n!==
this.Uk[h].Rk);delete this.Uk[h]}};n.DISABLE_RANGE_HEADER=!1;n.rJ=3;return n}(ia.a);(function(f){function e(e,h,n){var r=f.call(this)||this,w;for(w in e)r[w]=e[w];r.Wja=e;r.startOffset=h;r.endOffset=n;r.NM=function(f,h,n,w){Object(x.isUndefined)(h.stop)?(h.start+=r.endOffset,h.stop=r.endOffset):(h.start+=r.startOffset,h.stop+=r.startOffset);f=r.Ft(r.url,h,r.hy);return new e.xv(f,h,n,w)};return r}Object(fa.c)(e,f);return e})(ka);Object(e.a)(ka);Object(e.b)(ka);y["default"]=ka}}]);}).call(this || window)