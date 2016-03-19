(function(){function n(c){return"[Datium Option Exception]\n  "+c+"\n  See http://datium.io/documentation for documentation."}var d=this&&this.nb||function(c,a){function b(){this.constructor=c}for(var f in a)a.hasOwnProperty(f)&&(c[f]=a[f]);c.prototype=null===a?Object.create(a):(b.prototype=a.prototype,new b)};window.Datium=function(){return function(c,a){var b=new t(c,a);this.j=function(a){return b.j(a)}}}();var t=function(){function c(a,b){var c=this;this.element=a;this.options={};if(void 0===a)throw"element is required";a.setAttribute("spellcheck","false");this.input=new u(a);this.fb=new v(a);this.j(b);e.C(a,function(a){return c.C(a.b,a.level,a.update)});this.C(this.options.defaultDate,6)}c.prototype.C=function(a,b,c){void 0===c&&(c=!0);void 0===a&&(a=new Date);void 0!==this.options.da&&a.valueOf()<this.options.da.valueOf()&&(a=new Date(this.options.da.valueOf()));void 0!==this.options.ca&&a.valueOf()>this.options.ca.valueOf()&&(a=new Date(this.options.ca.valueOf()));h.F(this.element,{b:a,level:b,update:c})};c.prototype.j=function(a){void 0===a&&(a={});this.options=w.hb(a,this.options);this.input.j(this.options);this.fb.j(this.options,this.input.Pa())};return c}(),w=function(){function c(){}c.Ya=function(a,b){void 0===b&&(b="h:mma MMM D, YYYY");if(void 0===a)return b;if("string"!==typeof a)throw n('The "displayAs" option must be a string');return a};c.cb=function(a,b){void 0===b&&(b=void 0);return void 0===a?b:new Date(a)};c.$a=function(a,b){void 0===b&&(b=void 0);return void 0===a?b:new Date(a)};c.Va=function(a,b){void 0===b&&(b=this.Ka);return void 0===a?b:new Date(a)};c.S=function(a){if(void 0===a)throw n("All theme colors (primary, primary_text, secondary, secondary_text, secondary_accent) must be defined");if(!/^((\s*#[A-Fa-f0-9]{3}\s*)|(\s*#[A-Fa-f0-9]{6}\s*)|(\s*rgb\(\s*[0-9]{1,3}\s*,\s*[0-9]{1,3}\s*,\s*[0-9]{1,3}\s*\)\s*)|(\s*rgba\(\s*[0-9]{1,3}\s*,\s*[0-9]{1,3}\s*,\s*[0-9]{1,3}\s*\,\s*[0-9]*\.[0-9]+\s*\)\s*))$/.test(a))throw n("All theme colors must be valid rgb, rgba, or hex code");return a};c.qa=function(a,b){void 0===b&&(b="material");if(void 0===a)return c.qa(b,void 0);if("string"===typeof a)switch(a){case "light":return{V:"#eee",W:"#666",X:"#fff",Z:"#666",Y:"#666"};case "dark":return{V:"#444",W:"#eee",X:"#333",Z:"#eee",Y:"#fff"};case "material":return{V:"#019587",W:"#fff",X:"#fff",Z:"#888",Y:"#019587"};default:throw"Name of theme not valid.";}else{if("object"===typeof a)return{V:c.S(a.primary),X:c.S(a.secondary),W:c.S(a.primary_text),Z:c.S(a.secondary_text),Y:c.S(a.secondary_accent)};throw n('The "theme" option must be object or string');}};c.hb=function(a,b){return{oa:c.Ya(a.displayAs,b.oa),da:c.cb(a.minDate,b.da),ca:c.$a(a.maxDate,b.ca),Ja:c.Va(a.defaultDate,b.Ja),v:c.qa(a.theme,b.v)}};c.Ka=new Date;return c}(),z=function(){function c(){}c.prototype.U=function(){return"January February March April May June July August September October November December".split(" ")};c.prototype.Sa=function(){return"Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ")};c.prototype.T=function(){return"Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" ")};c.prototype.Ra=function(){return"Sun Mon Tue Wed Thu Fri Sat".split(" ")};c.prototype.getHours=function(a){a=a.getHours();0===a&&(a=12);12<a&&(a-=12);return a.toString()};c.prototype.ra=function(a){return 10*Math.floor(a.getFullYear()/10)+" - "+10*Math.ceil((a.getFullYear()+1)/10)};c.prototype.$=function(a){return 12>a.getHours()?"am":"pm"};c.prototype.o=function(a){var b;void 0===b&&(b=2);for(a=a.toString();a.length<b;)a="0"+a;return a};c.prototype.trim=function(a){for(;"0"===a[0]&&1<a.length;)a=a.substr(1,a.length);return a};return c}();CustomEvent=function(){return function(){try{var c=new CustomEvent("a",{detail:{Fa:"b"}});return"a"===c.type&&"b"===c.detail.Fa}catch(a){}return!1}()?CustomEvent:"function"===typeof document.createEvent?function(c,a){var b=document.createEvent("CustomEvent");a?b.initCustomEvent(c,a.bubbles,a.cancelable,a.detail):b.initCustomEvent(c,!1,!1,void 0);return b}:function(c,a){var b=document.createEventObject();b.type=c;a?(b.bubbles=!!a.bubbles,b.cancelable=!!a.cancelable,b.detail=a.detail):(b.bubbles=!1,b.cancelable=!1,b.detail=void 0);return b}}();var e;(function(c){function a(a,b,c){return function(f){for(var d=f.srcElement||f.target;!d.isEqualNode(a);){if(g.call(d,b)){c(f);break}d=d.parentElement}}}function b(b,c,f,g){var d=[],e;for(e in b){var r=b[e],h=a(c,f,g);d.push({element:c,za:h,event:r});c.addEventListener(r,h)}return d}function f(a,b,c){var f=[];a.forEach(function(a){f.push({element:b,za:c,event:a});b.addEventListener(a,c)});return f}var g=document.documentElement.matches||document.documentElement.msMatchesSelector;c.focus=function(a,b){return f(["focus"],a,function(a){b(a)})};c.P=function(){for(var a=[],c=0;c<arguments.length;c++)a[c-0]=arguments[c];return 3===a.length?b(["mousedown","touchstart"],a[0],a[1],function(b){a[2](b)}):f(["mousedown","touchstart"],a[0],function(b){a[1](b)})};c.aa=function(a,b){return f(["mouseup","touchend"],a,function(a){b(a)})};c.ea=function(a,b){return f(["mousedown"],a,function(a){b(a)})};c.ga=function(a,b){return f(["mouseup"],a,function(a){b(a)})};c.ha=function(a,b){return f(["paste"],a,function(a){b(a)})};c.ma=function(){function a(b,c){if(void 0===b.changedTouches)b.preventDefault(),c(b);else{var f=b.changedTouches[0].clientX-e,g=b.changedTouches[0].clientY-h;10>Math.sqrt(f*f+g*g)&&(b.preventDefault(),c(b))}}function c(a){e=a.touches[0].clientX;h=a.touches[0].clientY}for(var g=[],d=0;d<arguments.length;d++)g[d-0]=arguments[d];var e,h,d=[];3===g.length?(d=d.concat(b(["touchstart"],g[0],g[1],c)),d=d.concat(b(["touchend","click"],g[0],g[1],function(b){a(b,g[2])}))):2===g.length&&(d=d.concat(f(["touchstart"],g[0],c)),d=d.concat(f(["touchend","click"],g[0],function(b){a(b,g[1])})))};c.C=function(a,b){return f(["datium-goto"],a,function(a){b(a.detail)})};c.F=function(a,b){return f(["datium-viewchanged"],a,function(a){b(a.detail)})};c.ob=function(a){a.forEach(function(a){a.element.removeEventListener(a.event,a.za)})}})(e||(e={}));var h;(function(c){c.C=function(a,b){a.dispatchEvent(new CustomEvent("datium-goto",{bubbles:!1,cancelable:!0,detail:b}))};c.F=function(a,b){a.dispatchEvent(new CustomEvent("datium-viewchanged",{bubbles:!1,cancelable:!0,detail:b}))}})(h||(h={}));var y=function(){function c(a){this.text=a}c.prototype.N=function(){};c.prototype.K=function(){};c.prototype.u=function(){return!1};c.prototype.f=function(){return!1};c.prototype.L=function(){return null};c.prototype.c=function(){return new RegExp("["+this.text+"]")};c.prototype.ia=function(){return this};c.prototype.B=function(){return 0};c.prototype.l=function(){return 6};c.prototype.R=function(){return!1};c.prototype.toString=function(){return this.text};return c}(),p=function(){var c=function(a){function b(){a.apply(this,arguments);this.Ba=!0}d(b,a);b.prototype.L=function(){return this.b};b.prototype.ia=function(a){this.Ba=a;return this};b.prototype.R=function(){return this.Ba};return b}(z),a=function(a){function b(){a.apply(this,arguments)}d(b,a);b.prototype.N=function(){this.b.setFullYear(this.b.getFullYear()+1)};b.prototype.K=function(){this.b.setFullYear(this.b.getFullYear()-1)};b.prototype.u=function(a){return this.f(a)};b.prototype.f=function(a){return"object"===typeof a?(this.b=new Date(a.valueOf()),!0):"string"===typeof a&&this.c().test(a)?(this.b.setFullYear(parseInt(a,10)),!0):!1};b.prototype.c=function(){return/^-?\d{1,4}$/};b.prototype.B=function(){return 4};b.prototype.l=function(){return 0};b.prototype.toString=function(){return this.b.getFullYear().toString()};return b}(c),b=function(a){function b(){a.apply(this,arguments)}d(b,a);b.prototype.B=function(){return 2};b.prototype.f=function(b){return"object"===typeof b?(this.b=new Date(b.valueOf()),!0):"string"===typeof b&&this.c().test(b)?(this.b.setFullYear(parseInt(b,10)+100*Math.floor(a.prototype.L.call(this).getFullYear()/100)),!0):!1};b.prototype.c=function(){return/^-?\d{1,2}$/};b.prototype.toString=function(){return a.prototype.toString.call(this).slice(-2)};return b}(a),f=function(a){function b(){a.apply(this,arguments)}d(b,a);b.prototype.U=function(){return a.prototype.U.call(this)};b.prototype.N=function(){var a=this.b.getMonth()+1;11<a&&(a=0);for(this.b.setMonth(a);this.b.getMonth()>a;)this.b.setDate(this.b.getDate()-1)};b.prototype.K=function(){var a=this.b.getMonth()-1;0>a&&(a=11);this.b.setMonth(a)};b.prototype.u=function(a){var b=this.U().filter(function(b){return(new RegExp("^"+a+".*$","i")).test(b)})[0];return void 0!==b?this.f(b):!1};b.prototype.f=function(a){return"object"===typeof a?(this.b=new Date(a.valueOf()),!0):"string"===typeof a&&this.c().test(a)?(this.b.setMonth(this.U().indexOf(a)),!0):!1};b.prototype.c=function(){return new RegExp("^(("+this.U().join(")|(")+"))$","i")};b.prototype.B=function(){return[2,1,3,2,3,3,3,2,1,1,1,1][this.b.getMonth()]};b.prototype.l=function(){return 1};b.prototype.toString=function(){return this.U()[this.b.getMonth()]};return b}(c),g=function(a){function b(){a.apply(this,arguments)}d(b,a);b.prototype.U=function(){return a.prototype.Sa.call(this)};return b}(f),A=function(a){function b(){a.apply(this,arguments)}d(b,a);b.prototype.B=function(){return 0<this.b.getMonth()?1:2};b.prototype.u=function(a){return/^\d{1,2}$/.test(a)?this.f(this.trim("0"===a?"1":a)):!1};b.prototype.f=function(a){return"object"===typeof a?(this.b=new Date(a.valueOf()),!0):"string"===typeof a&&this.c().test(a)?(this.b.setMonth(parseInt(a,10)-1),!0):!1};b.prototype.c=function(){return/^([1-9]|(1[0-2]))$/};b.prototype.toString=function(){return(this.b.getMonth()+1).toString()};return b}(f),l=function(a){function b(){a.apply(this,arguments)}d(b,a);b.prototype.u=function(a){return/^\d{1,2}$/.test(a)?this.f(this.o("0"===a?"1":a)):!1};b.prototype.c=function(){return/^((0[1-9])|(1[0-2]))$/};b.prototype.toString=function(){return this.o(a.prototype.toString.call(this))};return b}(A),e=function(a){function b(){a.apply(this,arguments)}d(b,a);b.prototype.ba=function(){return(new Date(this.b.getFullYear(),this.b.getMonth()+1,0)).getDate()};b.prototype.N=function(){var a=this.b.getDate()+1;a>this.ba()&&(a=1);this.b.setDate(a)};b.prototype.K=function(){var a=this.b.getDate()-1;1>a&&(a=this.ba());this.b.setDate(a)};b.prototype.u=function(a){return/^\d{1,2}$/.test(a)?this.f(this.trim("0"===a?"1":a)):!1};b.prototype.f=function(a){return"object"===typeof a?(this.b=new Date(a.valueOf()),!0):"string"===typeof a&&this.c().test(a)&&parseInt(a,10)<this.ba()?(this.b.setDate(parseInt(a,10)),!0):!1};b.prototype.c=function(){return/^[1-9]|((1|2)[0-9])|(3[0-1])$/};b.prototype.B=function(){return this.b.getDate()>Math.floor(this.ba()/10)?1:2};b.prototype.l=function(){return 2};b.prototype.toString=function(){return this.b.getDate().toString()};return b}(c),h=function(a){function b(){a.apply(this,arguments)}d(b,a);b.prototype.u=function(a){return/^\d{1,2}$/.test(a)?this.f(this.o("0"===a?"1":a)):!1};b.prototype.c=function(){return/^(0[1-9])|((1|2)[0-9])|(3[0-1])$/};b.prototype.toString=function(){return this.o(this.b.getDate())};return b}(e),n=function(a){function b(){a.apply(this,arguments)}d(b,a);b.prototype.c=function(){return/^([1-9]|((1|2)[0-9])|(3[0-1]))((st)|(nd)|(rd)|(th))?$/i};b.prototype.toString=function(){var a=this.b.getDate(),b=a%10,c=a%100;return 1===b&&11!==c?a+"st":2===b&&12!==c?a+"nd":3===b&&13!==c?a+"rd":a+"th"};return b}(e),p=function(a){function b(){a.apply(this,arguments)}d(b,a);b.prototype.T=function(){return a.prototype.T.call(this)};b.prototype.N=function(){var a=this.b.getDay()+1;6<a&&(a=0);this.b.setDate(this.b.getDate()-this.b.getDay()+a)};b.prototype.K=function(){var a=this.b.getDay()-1;0>a&&(a=6);this.b.setDate(this.b.getDate()-this.b.getDay()+a)};b.prototype.u=function(a){var b=this.T().filter(function(b){return(new RegExp("^"+a+".*$","i")).test(b)})[0];return void 0!==b?this.f(b):!1};b.prototype.f=function(a){return"object"===typeof a?(this.b=new Date(a.valueOf()),!0):"string"===typeof a&&this.c().test(a)?(this.b.setDate(this.b.getDate()-this.b.getDay()+this.T().indexOf(a)),!0):!1};b.prototype.c=function(){return new RegExp("^(("+this.T().join(")|(")+"))$","i")};b.prototype.B=function(){return[2,1,2,1,2,1,2][this.b.getDay()]};b.prototype.l=function(){return 2};b.prototype.toString=function(){return this.T()[this.b.getDay()]};return b}(c),r=function(a){function b(){a.apply(this,arguments)}d(b,a);b.prototype.T=function(){return a.prototype.Ra.call(this)};return b}(p),x=function(a){function b(){a.apply(this,arguments)}d(b,a);b.prototype.N=function(){var a=this.b.getHours()+1;23<a&&(a=0);this.b.setHours(a)};b.prototype.K=function(){var a=this.b.getHours()-1;0>a&&(a=23);this.b.setHours(a)};b.prototype.u=function(a){return/^\d{1,2}$/.test(a)?this.f(this.o(a)):!1};b.prototype.f=function(a){return"object"===typeof a?(this.b=new Date(a.valueOf()),!0):"string"===typeof a&&this.c().test(a)?(this.b.setHours(parseInt(a,10)),!0):!1};b.prototype.B=function(){return 2<this.b.getHours()?1:2};b.prototype.l=function(){return 3};b.prototype.c=function(){return/^(((0|1)[0-9])|(2[0-3]))$/};b.prototype.toString=function(){return this.o(this.b.getHours())};return b}(c),t=function(a){function b(){a.apply(this,arguments)}d(b,a);b.prototype.u=function(a){return/^\d{1,2}$/.test(a)?this.f(this.trim(a)):!1};b.prototype.c=function(){return/^((1?[0-9])|(2[0-3]))$/};b.prototype.toString=function(){return this.b.getHours().toString()};return b}(x),B=function(a){function b(){a.apply(this,arguments)}d(b,a);b.prototype.u=function(a){return this.f(this.o("0"===a?"1":a))};b.prototype.f=function(a){return"object"===typeof a?(this.b=new Date(a.valueOf()),!0):"string"===typeof a&&this.c().test(a)?(a=parseInt(a,10),12>this.b.getHours()&&12===a&&(a=0),11<this.b.getHours()&&12!==a&&(a+=12),this.b.setHours(a),!0):!1};b.prototype.c=function(){return/^(0[1-9])|(1[0-2])$/};b.prototype.B=function(){return 1<parseInt(this.toString(),10)?1:2};b.prototype.toString=function(){return this.o(this.getHours(this.b))};return b}(x),u=function(a){function b(){a.apply(this,arguments)}d(b,a);b.prototype.u=function(a){return this.f(this.trim("0"===a?"1":a))};b.prototype.c=function(){return/^[1-9]|(1[0-2])$/};b.prototype.toString=function(){return this.trim(a.prototype.toString.call(this))};return b}(B),C=function(a){function b(){a.apply(this,arguments)}d(b,a);b.prototype.N=function(){var a=this.b.getMinutes()+1;59<a&&(a=0);this.b.setMinutes(a)};b.prototype.K=function(){var a=this.b.getMinutes()-1;0>a&&(a=59);this.b.setMinutes(a)};b.prototype.u=function(a){return this.f(this.o(a))};b.prototype.f=function(a){return"object"===typeof a?(this.b=new Date(a.valueOf()),!0):"string"===typeof a&&this.c().test(a)?(this.b.setMinutes(parseInt(a,10)),!0):!1};b.prototype.c=function(){return/^[0-5][0-9]$/};b.prototype.B=function(){return 5<this.b.getMinutes()?1:2};b.prototype.l=function(){return 4};b.prototype.toString=function(){return this.o(this.b.getMinutes())};return b}(c),v=function(a){function b(){a.apply(this,arguments)}d(b,a);b.prototype.u=function(a){return this.f(this.trim(a))};b.prototype.c=function(){return/^[0-5]?[0-9]$/};b.prototype.toString=function(){return this.b.getMinutes().toString()};return b}(C),D=function(a){function b(){a.apply(this,arguments)}d(b,a);b.prototype.N=function(){var a=this.b.getSeconds()+1;59<a&&(a=0);this.b.setSeconds(a)};b.prototype.K=function(){var a=this.b.getSeconds()-1;0>a&&(a=59);this.b.setSeconds(a)};b.prototype.u=function(a){return this.f(this.o(a))};b.prototype.f=function(a){return"object"===typeof a?(this.b=new Date(a.valueOf()),!0):"string"===typeof a&&this.c().test(a)?(this.b.setSeconds(parseInt(a,10)),!0):!1};b.prototype.c=function(){return/^[0-5][0-9]$/};b.prototype.B=function(){return 5<this.b.getSeconds()?1:2};b.prototype.l=function(){return 5};b.prototype.toString=function(){return this.o(this.b.getSeconds())};return b}(c),w=function(a){function b(){a.apply(this,arguments)}d(b,a);b.prototype.u=function(a){return this.f(this.trim(a))};b.prototype.c=function(){return/^[0-5]?[0-9]$/};b.prototype.toString=function(){return this.b.getSeconds().toString()};return b}(D),c=function(a){function b(){a.apply(this,arguments)}d(b,a);b.prototype.N=function(){var a=this.b.getHours()+12;23<a&&(a-=24);this.b.setHours(a)};b.prototype.K=function(){var a=this.b.getHours()-12;0>a&&(a+=24);this.b.setHours(a)};b.prototype.u=function(a){return/^((AM?)|(PM?))$/i.test(a)?this.f("A"===a[0]?"AM":"PM"):!1};b.prototype.f=function(a){return"object"===typeof a?(this.b=new Date(a.valueOf()),!0):"string"===typeof a&&this.c().test(a)?("am"===a.toLowerCase()&&11<this.b.getHours()?this.b.setHours(this.b.getHours()-12):"pm"===a.toLowerCase()&&12>this.b.getHours()&&this.b.setHours(this.b.getHours()+12),!0):!1};b.prototype.l=function(){return 3};b.prototype.B=function(){return 1};b.prototype.c=function(){return/^((am)|(pm))$/i};b.prototype.toString=function(){return this.$(this.b).toUpperCase()};return b}(c),y=function(a){function b(){a.apply(this,arguments)}d(b,a);b.prototype.toString=function(){return this.$(this.b)};return b}(c),k={};k.YYYY=a;k.YY=b;k.MMMM=f;k.MMM=g;k.MM=l;k.M=A;k.DD=h;k.Do=n;k.D=e;k.dddd=p;k.ddd=r;k.HH=x;k.hh=B;k.H=t;k.h=u;k.A=c;k.a=y;k.mm=C;k.m=v;k.ss=D;k.s=w;return k}(),u=function(){function c(a){var b=this;this.element=a;this.J="";new E(this);new F(this);new G(this);e.F(a,function(a){return b.F(a.b,a.level,a.update)})}c.prototype.Pa=function(){var a=[];this.i.forEach(function(b){-1===a.indexOf(b.l())&&b.R()&&a.push(b.l())});return a};c.prototype.ja=function(a){this.J=a;0<this.J.length&&this.kb()};c.prototype.kb=function(){if(this.g.u(this.J)){var a=this.g.L();this.J.length>=this.g.B()&&(this.J="",this.g=this.fa());h.C(this.element,{b:a,level:this.g.l()})}else this.J=this.J.slice(0,-1)};c.prototype.sa=function(){for(var a=0;a<this.i.length;a++)if(this.i[a].R())return this.i[a]};c.prototype.ta=function(){for(var a=this.i.length-1;0<=a;a--)if(this.i[a].R())return this.i[a]};c.prototype.fa=function(){for(var a=this.i.indexOf(this.g);++a<this.i.length;)if(this.i[a].R())return this.i[a];return this.g};c.prototype.ua=function(){for(var a=this.i.indexOf(this.g);0<=--a;)if(this.i[a].R())return this.i[a];return this.g};c.prototype.Qa=function(a){for(var b=Number.MAX_VALUE,c,g=0,d=0;d<this.i.length;d++){var l=this.i[d];if(l.R()){var e=a-g,h=a-(g+l.toString().length);if(0<e&&0>h)return l;e=Math.min(Math.abs(e),Math.abs(h));e<=b&&(c=l,b=e)}g+=l.toString().length}return c};c.prototype.I=function(a){this.g!==a&&(this.J="",this.g=a)};c.prototype.j=function(a){this.options=a;this.i=H.parse(a.oa);this.g=void 0;var b="^";this.i.forEach(function(a){b+="("+a.c().source.slice(1,-1)+")"});this.format=new RegExp(b+"$","i");this.Da()};c.prototype.Da=function(){var a="";this.i.forEach(function(b){void 0!==b.L()&&(a+=b.toString())});this.element.value=a;if(void 0!==this.g){for(var b=0,c=0;this.i[c]!==this.g;)b+=this.i[c++].toString().length;this.element.setSelectionRange(b,b+this.g.toString().length)}};c.prototype.F=function(a,b,c){var g=this;this.i.forEach(function(d){c&&d.f(a);d.l()===b&&void 0!==g.g&&b!==g.g.l()&&g.I(d)});this.Da()};c.prototype.O=function(){h.F(this.element,{b:this.g.L(),level:this.g.l()})};return c}(),E=function(){function c(a){var b=this;this.input=a;this.la=this.ka=!1;this.focus=function(){b.la?(b.input.I(b.input.sa()),setTimeout(function(){b.input.O()})):b.ka&&(b.input.I(b.input.ta()),setTimeout(function(){b.input.O()}))};a.element.addEventListener("keydown",function(a){return b.Za(a)});a.element.addEventListener("focus",function(){return b.focus()});document.addEventListener("keydown",function(a){return b.La(a)})}c.prototype.La=function(a){var b=this;a.shiftKey&&9===a.keyCode?this.ka=!0:9===a.keyCode&&(this.la=!0);setTimeout(function(){b.ka=!1;b.la=!1})};c.prototype.Za=function(a){var b=a.keyCode;96<=b&&105>=b&&(b-=48);if(36!==b&&35!==b||!a.shiftKey)if(37!==b&&39!==b||!a.shiftKey)if(67!==b&&65!==b&&86!==b||!a.ctrlKey){var c=!0;36===b?this.home():35===b?this.end():37===b?this.left():39===b?this.right():9===b&&a.shiftKey?c=this.jb():9===b?c=this.tab():38===b?this.aa():40===b&&this.P();c&&a.preventDefault();c=String.fromCharCode(b);/^[0-9]|[A-z]$/.test(c)?(a=this.input.J,this.input.ja(a+c)):8===b?(a=this.input.J,this.input.ja(a.slice(0,-1))):a.shiftKey||this.input.ja("")}};c.prototype.home=function(){this.input.I(this.input.sa());this.input.O()};c.prototype.end=function(){this.input.I(this.input.ta());this.input.O()};c.prototype.left=function(){this.input.I(this.input.ua());this.input.O()};c.prototype.right=function(){this.input.I(this.input.fa());this.input.O()};c.prototype.jb=function(){var a=this.input.ua();return a!==this.input.g?(this.input.I(a),this.input.O(),!0):!1};c.prototype.tab=function(){var a=this.input.fa();return a!==this.input.g?(this.input.I(a),this.input.O(),!0):!1};c.prototype.aa=function(){this.input.g.N();h.C(this.input.element,{b:this.input.g.L(),level:this.input.g.l()})};c.prototype.P=function(){this.input.g.K();h.C(this.input.element,{b:this.input.g.L(),level:this.input.g.l()})};return c}(),F=function(){function c(a){var b=this;this.input=a;this.ga=function(){b.P&&(b.P=!1,b.input.I(b.input.Qa(b.input.element.selectionStart===b.Ga?b.input.element.selectionEnd:b.input.element.selectionStart)),(0<b.input.element.selectionStart||b.input.element.selectionEnd<b.input.element.value.length)&&b.input.O())};e.ea(a.element,function(){return b.ea()});e.ga(document,function(){return b.ga()});a.element.addEventListener("dragenter",function(a){return a.preventDefault()});a.element.addEventListener("dragover",function(a){return a.preventDefault()});a.element.addEventListener("drop",function(a){return a.preventDefault()});a.element.addEventListener("cut",function(a){return a.preventDefault()})}c.prototype.ea=function(){var a=this;this.P=!0;this.input.element.setSelectionRange(void 0,void 0);setTimeout(function(){a.Ga=a.input.element.selectionStart})};return c}(),H=function(){function c(){}c.parse=function(a){function b(){0<f.length&&(g.push((new y(f)).ia(!1)),f="")}for(var f="",g=[],d=0,e=!1;d<a.length;)if(e||"["!==a[d])if(e&&"]"===a[d])e=!1,d++;else if(e)f+=a[d],d++;else{var h=!1,m;for(m in p)if(c.pa(a,d,"{"+m+"}")){b();g.push((new p[m]).ia(!1));d+=m.length+2;h=!0;break}else if(c.pa(a,d,m)){b();g.push(new p[m]);d+=m.length;h=!0;break}h||(f+=a[d],d++)}else e=!0,d++;b();return g};c.pa=function(a,b,c){return a.slice(b,b+c.length)===c};return c}(),G=function(){function c(a){var b=this;this.input=a;e.ha(a.element,function(){return b.ha()})}c.prototype.ha=function(){var a=this,b=this.input.element.value;setTimeout(function(){if(a.input.format.test(a.input.element.value)){for(var c=a.input.g.L(),d="",e=0;e<a.input.i.length;e++){var l=a.input.i[e],q=new RegExp(l.c().source.slice(1,-1),"i"),q=a.input.element.value.replace(d,"").match(q)[0],d=d+q;if(l.R())if(l.f(c),l.f(q))c=l.L();else{a.input.element.value=b;return}}h.C(a.input.element,{b:c,level:a.input.g.l()})}else a.input.element.value=b})};return c}(),I=function(c){function a(a,f){var d=this;c.call(this);this.element=a;this.w=f;e.F(a,function(a){return d.F(a.b,a.level)});this.lb=f.querySelector("datium-span-label.datium-year");this.bb=f.querySelector("datium-span-label.datium-month");this.Ia=f.querySelector("datium-span-label.datium-date");this.Ua=f.querySelector("datium-span-label.datium-hour");this.ab=f.querySelector("datium-span-label.datium-minute");this.ib=f.querySelector("datium-span-label.datium-second");this.labels=[this.lb,this.bb,this.Ia,this.Ua,this.ab,this.ib];var h=f.querySelector("datium-next"),l=f.querySelector("datium-span-label-container");e.ma(f.querySelector("datium-prev"),function(){return d.gb()});e.ma(h,function(){return d.next()});e.ma(l,function(){return d.mb()})}d(a,c);a.prototype.gb=function(){h.C(this.element,{b:this.Ca(1),level:this.level,update:!1})};a.prototype.next=function(){h.C(this.element,{b:this.Ca(0),level:this.level,update:!1})};a.prototype.mb=function(){var a=this.wa[this.wa.indexOf(this.level)-1];void 0!==a&&h.C(this.element,{b:this.b,level:a,update:!1})};a.prototype.Ca=function(a){var c=new Date(this.b.valueOf());a=0===a?1:-1;switch(this.level){case 0:c.setFullYear(c.getFullYear()+10*a);break;case 1:c.setFullYear(c.getFullYear()+a);break;case 2:c.setMonth(c.getMonth()+a);break;case 3:c.setDate(c.getDate()+a);break;case 4:c.setHours(c.getHours()+a);break;case 5:c.setMinutes(c.getMinutes()+a)}return c};a.prototype.F=function(a,c){var d=this;if(void 0===this.b||a.valueOf()!==this.b.valueOf()||c!==this.level)this.b=a,this.level=c,this.labels.forEach(function(e,h){e.classList.remove("datium-top");e.classList.remove("datium-bottom");e.classList.remove("datium-hidden");h<c?(e.classList.add("datium-top"),e.innerHTML=d.Oa(a,h)):(e.classList.add("datium-bottom"),e.innerHTML=d.Na(a,h));(h<c-1||h>c)&&e.classList.add("datium-hidden")})};a.prototype.Oa=function(a,c){switch(c){case 0:return this.ra(a);case 1:return a.getFullYear().toString();case 2:return"Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ")[a.getMonth()]+" "+a.getFullYear();case 3:case 4:return"Sun Mon Tue Wed Thu Fri Sat".split(" ")[a.getDay()]+" "+this.o(a.getDate())+" "+"Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ")[a.getMonth()]+" "+a.getFullYear()}};a.prototype.Na=function(a,c){switch(c){case 0:return this.ra(a);case 1:return a.getFullYear().toString();case 2:return"Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ")[a.getMonth()];case 3:return"Sun Mon Tue Wed Thu Fri Sat".split(" ")[a.getDay()]+" "+this.o(a.getDate())+" <datium-variable>"+this.getHours(a)+this.$(a)+"</datium-variable>";case 4:return this.getHours(a)+":<datium-variable>"+this.o(a.getMinutes())+"</datium-variable>"+this.$(a);case 5:return this.getHours(a)+":"+this.o(a.getMinutes())+":<datium-variable>"+this.o(a.getSeconds())+"</datium-variable>"+this.$(a)}};a.prototype.j=function(a,c){this.options=a;this.wa=c};return a}(z),v=function(){function c(a){var b=this;this.element=a;this.w=this.Ha();this.Wa(a,this.w);this.eb=this.w.querySelector("datium-picker-container");this.Ta=new I(a,this.w);this.Ea=new J(a);this.ya=new K(a);this.na=new L(a);this.va=new M(a);this.xa=new N(a);this.Aa=new O(a);e.P(this.w,"*",function(a){return b.P(a)});e.aa(document,function(){return b.aa()});e.ea(this.w,function(a){a.preventDefault();a.stopPropagation();return!1});e.F(a,function(a){return b.F(a.b,a.level)})}c.prototype.F=function(a,b){var c=10;switch(b){case 0:c=this.Ea.G();break;case 1:c=this.ya.G();break;case 2:c=this.na.G();break;case 3:c=this.va.G();break;case 4:c=this.xa.G();break;case 5:c=this.Aa.G();break;default:return}this.eb.style.transform="translateY("+(c-280)+"px)"};c.prototype.aa=function(){for(var a=this.w.querySelectorAll(".datium-active"),b=0;b<a.length;b++)a[b].classList.remove("datium-active");this.w.classList.remove("datium-active")};c.prototype.P=function(a){for(a=a.srcElement||a.target;a!==this.w;)a.classList.add("datium-active"),a=a.parentElement;this.w.classList.add("datium-active")};c.prototype.j=function(a,b){var c=void 0===this.options||void 0===this.options.v||this.options.v.V!==a.v.V||this.options.v.W!==a.v.W||this.options.v.X!==a.v.X||this.options.v.Y!==a.v.Y||this.options.v.Z!==a.v.Z;this.options=a;c&&this.Xa();this.Ta.j(a,b);this.Ea.j(a);this.ya.j(a);this.na.j(a);this.va.j(a);this.xa.j(a);this.Aa.j(a)};c.prototype.Ha=function(){var a=document.createElement("datium-container");a.innerHTML=P+"\n        <datium-picker-container-wrapper>\n            <datium-picker-container></datium-picker-container>\n        </datium-picker-container-wrapper>";return a};c.prototype.Wa=function(a,b){a.parentNode.insertBefore(b,a.nextSibling)};c.prototype.Xa=function(){var a=document.head||document.getElementsByTagName("head")[0],b=document.createElement("style"),d="datium-style"+c.S++,e=this.Ma();null!==e&&this.w.classList.remove(e);this.w.classList.add(d);e=Q.replace(/_primary_text/g,this.options.v.W);e=e.replace(/_primary/g,this.options.v.V);e=e.replace(/_secondary_text/g,this.options.v.Z);e=e.replace(/_secondary_accent/g,this.options.v.Y);e=e.replace(/_secondary/g,this.options.v.X);e=e.replace(/_id/g,d);b.type="text/css";b.styleSheet?b.styleSheet.cssText=e:b.appendChild(document.createTextNode(e));a.appendChild(b)};c.prototype.Ma=function(){for(var a=0;a<this.w.classList.length;a++)if(/^datium-style\d+$/.test(this.w.classList.item(a)))return this.w.classList.item(a);return null};c.S=0;return c}(),P="<datium-header-wrapper> <datium-header> <datium-span-label-container> <datium-span-label class='datium-year'></datium-span-label> <datium-span-label class='datium-month'></datium-span-label> <datium-span-label class='datium-date'></datium-span-label> <datium-span-label class='datium-hour'></datium-span-label> <datium-span-label class='datium-minute'></datium-span-label> <datium-span-label class='datium-second'></datium-span-label> </datium-span-label-container> <datium-prev></datium-prev> <datium-next></datium-next> </datium-header> </datium-header-wrapper>",L=function(){function c(a){this.element=a}c.prototype.j=function(){};c.prototype.G=function(){return 200};return c}(),M=function(){function c(a){this.element=a}c.prototype.j=function(){};c.prototype.G=function(){return 260};return c}(),N=function(){function c(a){this.element=a}c.prototype.j=function(){};c.prototype.G=function(){return 230};return c}(),K=function(){function c(a){this.element=a}c.prototype.j=function(){};c.prototype.G=function(){return 150};return c}(),O=function(){function c(a){this.element=a}c.prototype.j=function(){};c.prototype.G=function(){return 180};return c}(),J=function(){function c(a){this.element=a}c.prototype.j=function(){};c.prototype.G=function(){return 100};return c}(),Q="datium-container._id datium-header-wrapper{overflow:hidden;position:absolute;left:-7px;right:-7px;top:-7px;height:87px;display:block;pointer-events:none}datium-container._id datium-header{position:relative;display:block;overflow:hidden;height:100px;background-color:_primary;border-top-left-radius:3px;border-top-right-radius:3px;z-index:1;margin:7px;width:calc(100% - 14px);pointer-events:auto;box-shadow:0 3px 6px rgba(0,0,0,.16),0 3px 6px rgba(0,0,0,.23)}datium-container._id datium-span-label-container{position:absolute;left:40px;right:40px;top:0;bottom:0;display:block;overflow:hidden;transition:.2s ease all;transform-origin:40px 40px}datium-container._id datium-span-label{position:absolute;font-size:18pt;color:_primary_text;font-weight:700;transform-origin:0 0;white-space:nowrap;transition:all .2s ease;text-transform:uppercase}datium-container._id datium-span-label.datium-top{transform:translateY(17px) scale(.66);width:151%;opacity:.6}datium-container._id datium-span-label.datium-bottom{transform:translateY(36px) scale(1);width:100%;opacity:1}datium-container._id datium-span-label.datium-top.datium-hidden{transform:translateY(5px) scale(.4);opacity:0}datium-container._id datium-span-label.datium-bottom.datium-hidden{transform:translateY(78px) scale(1.2);opacity:.5}datium-container._id datium-span-label:after{content:'';display:inline-block;position:absolute;margin-left:10px;margin-top:6px;height:17px;width:17px;opacity:0;transition:all .2s ease;background:url(data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22_primary_text%22%3E%3Cpath%20d%3D%22M17%2015l-2%202-5-5%202-2z%22%20fill-rule%3D%22evenodd%22%2F%3E%3Cpath%20d%3D%22M7%200a7%207%200%200%200-7%207%207%207%200%200%200%207%207%207%207%200%200%200%207-7%207%207%200%200%200-7-7zm0%202a5%205%200%200%201%205%205%205%205%200%200%201-5%205%205%205%200%200%201-5-5%205%205%200%200%201%205-5z%22%2F%3E%3Cpath%20d%3D%22M4%206h6v2H4z%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E)}datium-container._id datium-span-label.datium-top:after{opacity:1}datium-container._id datium-span-label datium-variable{color:_primary;font-size:14pt;padding:0 4px;margin:0 2px;top:-2px;position:relative}datium-container._id datium-span-label datium-variable:before{content:'';position:absolute;left:0;top:0;right:0;bottom:0;border-radius:5px;background-color:_primary_text;z-index:-1;opacity:.7}datium-container._id datium-next,datium-container._id datium-prev{position:absolute;width:40px;top:0;bottom:0;transform-origin:20px 52px}datium-container._id datium-next:after,datium-container._id datium-next:before,datium-container._id datium-prev:after,datium-container._id datium-prev:before{content:'';position:absolute;display:block;width:3px;height:8px;left:50%;background-color:_primary_text;top:48px}datium-container._id datium-next.datium-active,datium-container._id datium-prev.datium-active{transform:scale(.9);opacity:.9}datium-container._id datium-prev{left:0}datium-container._id datium-prev:after,datium-container._id datium-prev:before{margin-left:-3px}datium-container._id datium-next{right:0}datium-container._id datium-prev:before{transform:rotate(45deg) translateY(-2.6px)}datium-container._id datium-prev:after{transform:rotate(-45deg) translateY(2.6px)}datium-container._id datium-next:before{transform:rotate(45deg) translateY(2.6px)}datium-container._id datium-next:after{transform:rotate(-45deg) translateY(-2.6px)}datium-container._id{display:block;position:absolute;width:280px;font-family:Roboto,Arial;margin-top:2px}datium-container._id,datium-container._id *{-webkit-touch-callout:none;-webkit-user-select:none;-khtml-user-select:none;-moz-user-select:none;-ms-user-select:none;-webkit-tap-highlight-color:transparent;cursor:default}datium-container._id datium-picker-container-wrapper{overflow:hidden;position:absolute;left:-7px;right:-7px;top:80px;height:270px;display:block;pointer-events:none}datium-container._id datium-picker-container{position:relative;width:calc(100% - 14px);height:260px;background-color:_secondary;display:block;margin:0 7px 7px;padding-top:20px;box-shadow:0 3px 6px rgba(0,0,0,.16),0 3px 6px rgba(0,0,0,.23);transform:translateY(-270px);pointer-events:auto;border-bottom-right-radius:3px;border-bottom-left-radius:3px;transition:all ease .2s}"})();