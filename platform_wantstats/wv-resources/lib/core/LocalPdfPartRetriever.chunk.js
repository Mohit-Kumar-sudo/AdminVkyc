/** Notice * This file contains works from many authors under various (but compatible) licenses. Please see core.txt for more information. **/
(function(){(window.wpCoreControlsBundle=window.wpCoreControlsBundle||[]).push([[12],{387:function(ia,y,e){e.r(y);var fa=e(1);ia=e(48);var x=e(316),ha=e(405),ea=e(19),da=window;e=function(){function e(e){var w=this;this.K7=function(e){return e&&("image"===e.type.split("/")[0].toLowerCase()||e.name&&!!e.name.match(/.(jpg|jpeg|png|gif)$/i))};this.file=e;this.X7=new Promise(function(r){return Object(fa.b)(w,void 0,void 0,function(){var h;return Object(fa.d)(this,function(f){switch(f.label){case 0:return this.K7(this.file)?
[4,Object(ha.a)(e)]:[3,2];case 1:h=f.ea(),this.file=ea.o?new Blob([h],{type:e.type}):new File([h],null===e||void 0===e?void 0:e.name,{type:e.type}),f.label=2;case 2:return r(!0),[2]}})})})}e.prototype.getFileData=function(w){var x=this,r=new FileReader;r.onload=function(h){x.trigger(e.Events.DOCUMENT_LOADING_PROGRESS,[h.loaded,h.loaded]);w(new Uint8Array(h.target.result))};r.onprogress=function(h){h.lengthComputable&&x.trigger(e.Events.DOCUMENT_LOADING_PROGRESS,[h.loaded,0<h.total?h.total:0])};r.readAsArrayBuffer(this.file)};
e.prototype.getFile=function(){return Object(fa.b)(this,void 0,Promise,function(){return Object(fa.d)(this,function(e){switch(e.label){case 0:return[4,this.X7];case 1:return e.ea(),da.utils.isJSWorker?[2,this.file.path]:[2,this.file]}})})};e.Events={DOCUMENT_LOADING_PROGRESS:"documentLoadingProgress"};return e}();Object(ia.a)(e);Object(x.a)(e);Object(x.b)(e);y["default"]=e}}]);}).call(this || window)