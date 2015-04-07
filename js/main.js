!function a(b,c,d){function e(g,h){if(!c[g]){if(!b[g]){var i="function"==typeof require&&require;if(!h&&i)return i(g,!0);if(f)return f(g,!0);var j=new Error("Cannot find module '"+g+"'");throw j.code="MODULE_NOT_FOUND",j}var k=c[g]={exports:{}};b[g][0].call(k.exports,function(a){var c=b[g][1][a];return e(c?c:a)},k,k.exports,a,b,c,d)}return c[g].exports}for(var f="function"==typeof require&&require,g=0;g<d.length;g++)e(d[g]);return e}({1:[function(){"use strict";angular.module("bikeit.auth",[]).factory("AuthService",["nonce","$location",function(a){var b;return{getNonce:function(){return a},setNonce:function(b){a=b},getUser:function(){return b},setUser:function(a){b=a}}}]).factory("authInterceptor",["$rootScope","$q","AuthService",function(a,b,c){return jQuery.ajaxSetup({beforeSend:function(a){c.getNonce()&&a.setRequestHeader("X-WP-Nonce",c.getNonce())}}),{request:function(a){return a.headers=a.headers||{},c.getNonce()&&(a.headers["X-WP-Nonce"]=c.getNonce()),a||b.when(a)}}}]).config(["$httpProvider",function(a){a.interceptors.push("authInterceptor")}]).run(["$rootScope","WPService","AuthService",function(a,b,c){a.$watch(function(){return c.getNonce()},function(a){a&&b.getUser().then(function(a){c.setUser(a)})})}]).controller("LoginForm",["$rootScope","$scope","$http","apiUrl","AuthService","WPService",function(a,b,c,d,e,f){b.login=function(b){c.post(d+"auth",_.extend({_wp_json_nonce:e.getNonce()},b)).success(function(){e.setNonce("auth"),f.getUser().then(function(a){e.setUser(a)}),a.$broadcast("bikeit.userLoggedIn")})},b.register=function(b){c.post(d+"register",_.extend({_wp_json_nonce:e.getNonce()},b)).success(function(b){e.setNonce("auth"),e.setUser(b),a.$broadcast("bikeit.userRegistered")})}}])},{}],2:[function(){"use strict";angular.module("bikeit.home",["ui.router"]).config(["$stateProvider","$urlRouterProvider",function(a,b){b.otherwise("/"),a.state("home",{url:"/",controller:"HomeController",templateUrl:window.bikeit.templateUri.split(window.location.origin)[1]+"/views/home.html",resolve:{HomeData:["WPService",function(a){return a.query({type:"place",filter:{posts_per_page:100}})}]}})}]).controller("HomeController",["HomeData","$scope",function(a,b){b.posts=a.data}])},{}],3:[function(a){a("./util/message"),a("./auth"),a("./user"),a("./map"),a("./home"),a("./page"),a("./place"),a("./review"),angular.module("bikeit",["ngDialog","ui.router","bikeit.message","bikeit.auth","bikeit.user","bikeit.map","bikeit.home","bikeit.page","bikeit.place","bikeit.review","leaflet-directive"]).constant("apiUrl",window.bikeit.apiUrl).constant("nonce",window.bikeit.nonce).constant("baseUrl",window.bikeit.url.split(window.location.origin)[1]).constant("templatePath",window.bikeit.templateUri.split(window.location.origin)[1]).constant("siteName",window.bikeit.name).constant("labels",window.bikeit.labels).config(["$locationProvider",function(a){a.html5Mode(!1),a.hashPrefix("!")}]).factory("WPService",a("./wp")).directive("tooltip",function(){return{restrict:"A",link:function(a,b,c){c.tooltip&&(b.addClass("has-tooltip"),b.append('<div class="tooltip"><span>'+c.tooltip+"</span></div>"))}}}).directive("backImg",function(){return function(a,b,c){var d=c.backImg;b.css({"background-image":"url("+d+")","background-size":"cover"})}}).factory("Labels",["labels",function(a){return function(b){return"undefined"==typeof b?"":a[b]?a[b]:b}}]).controller("SiteController",["$state","Labels","$scope",function(a,b,c){c.labels=b,c.logoutUrl=window.bikeit.logoutUrl}]).controller("SearchController",["$scope","WPService","$http",function(a,b,c){a.searchResults=[],a.addressResults=[];var d=_.debounce(function(d){if(d&&"undefined"!=typeof d){b.query({filter:{s:d},type:a.searchType||"place"}).then(function(b){a.searchResults=b.data});var e=window.bikeit.city?window.bikeit.city.boundingbox:!1;c.get("http://nominatim.openstreetmap.org/search",{params:{format:"json",q:d,bounded:e?1:"",addressdetails:1,viewbox:e?e[2]+","+e[1]+","+e[3]+","+e[0]:""}}).success(function(b){a.addressResults=_.filter(b,function(a){return"highway"!=a["class"]&&"place"!=a["class"]&&"waterway"!=a["class"]&&"landuse"!=a["class"]&&(a.address[a.type]||a.address.address29)&&window.osmLabels[a["class"]+"/"+a.type]?(a.name=a.address[a.type]||a.address.address29,a.label=window.osmLabels[a["class"]+"/"+a.type].name,window.osmIcons[a["class"]+"/"+a.type]&&(a.icon=window.osmIcons[a["class"]+"/"+a.type]),!0):!1})})}else a.searchResults=[],a.addressResults=[]},300);a.$watch("searchText",function(b){!b||"undefined"==typeof b||b.length<=2?(a.searchResults=[],a.addressResults=[]):d(b)})}]),angular.element(document).ready(function(){console.log(bikeit),angular.bootstrap(document,["bikeit"])})},{"./auth":1,"./home":2,"./map":4,"./page":5,"./place":9,"./review":12,"./user":14,"./util/message":15,"./wp":16}],4:[function(){"use strict";L.Icon.Default.imagePath=window.bikeit.templateUri+"/css/images",angular.module("bikeit.map",["leaflet-directive"]).controller("MapController",["$state","leafletData","leafletEvents","$scope",function(a,b,c,d){if(window.bikeit.city){var e=window.bikeit.city.boundingbox;d.maxbounds={northEast:{lat:parseFloat(e[0]),lng:parseFloat(e[2])},southWest:{lat:parseFloat(e[1]),lng:parseFloat(e[3])}}}d.mapDefaults={tileLayer:window.bikeit.map.tile,scrollWheelZoom:!1},d.$on("leafletDirectiveMarker.mouseover",function(a,b){b.leafletEvent.target.openPopup(),b.leafletEvent.target.setZIndexOffset(1e3)}),d.$on("leafletDirectiveMarker.mouseout",function(a,b){b.leafletEvent.target.closePopup(),b.leafletEvent.target.setZIndexOffset(0)}),d.$on("leafletDirectiveMarker.click",function(b,c){a.go("placesSingle",{placeId:c.markerName})}),d.$watch("markers",function(a){if(a&&!_.isEmpty(a)){var c=[];_.each(a,function(a){c.push([a.lat,a.lng])});var d=L.latLngBounds(c);b.getMap().then(function(a){var b=20,c=20;jQuery(".content-map").length&&(b=jQuery("body").width()-jQuery(".content-map-header").position().left-20),a.fitBounds(d,{reset:!0,paddingBottomRight:[b,20],paddingTopLeft:[c,20]})})}})}]).factory("MapMarkers",["$window",function(a){var b={};return _.each(a.bikeit.placeCategories,function(a){var c=["default","approved","failed","stamp"];_.each(c,function(c){var d,e=a.markers[c],f=a.markers.position,g=5;"center"==f?(f=[e.width/2,e.height/2],d=[0,-e.height/2+g]):"bottom_center"==f?(f=[e.width/2,e.height],d=[0,-e.height+g]):"bottom_left"==f?(f=[0,e.height],d=[e.width/2,-e.height+g]):"bottom_right"==f&&(f=[e.width,e.height],d=[-e.width/2,-e.height+g]),b["place-category-"+a.term_id+"-"+c]={iconUrl:e.url,shadowUrl:!1,shadowSize:[0,0],iconSize:[e.width,e.height],iconAnchor:f,popupAnchor:d}})}),b}])},{}],5:[function(){"use strict";angular.module("bikeit.page",["ui.router"]).config(["$stateProvider",function(a){a.state("page",{url:"/page/:pageId/",controller:"PageController",templateUrl:window.bikeit.templateUri.split(window.location.origin)[1]+"/views/page.html",resolve:{PageData:["$stateParams","WPService",function(a,b){return b.getPost(a.pageId)}]}})}]).controller("PageController",["PageData","$sce","$scope",function(a,b,c){console.log(a),c.page=a,c.getContent=function(){return b.trustAsHtml(c.page.content)}}])},{}],6:[function(){"use strict";angular.module("bikeit.place").controller("PlaceController",["$state","$scope",function(a,b){b.accessPlace=function(b){a.go("placesSingle",{placeId:b.ID})}}]).controller("PlaceSingleController",["PlaceData","PlaceReviews","$scope","$state",function(a,b,c,d){c.place=a,c.reviews=b.data,"placesSingle.review"==d.current.name&&(c.openReview=!0)}]).controller("SubmitPlaceCtrl",["templatePath","ngDialog","$scope","AuthService","WPService","$location","$timeout","$http","leafletData","$state",function(a,b,c,d,e,f,g,h,i,j){c.loginTemplate=a+"/views/login.html",c.$watch(function(){return d.getUser()},function(a){a?(c.user=a,g(function(){i.getMap("new-place-map").then(function(a){a.invalidateSize(!1)})},300)):c.user=!1}),c.categories=window.bikeit.placeCategories;var k=_.debounce(function(a){if(a&&"undefined"!=typeof a){var b=window.bikeit.city?window.bikeit.city.boundingbox:!1;h.get("http://nominatim.openstreetmap.org/search",{params:{format:"json",q:a,bounded:b?1:"",addressdetails:1,viewbox:b?b[2]+","+b[1]+","+b[3]+","+b[0]:""}}).success(function(a){c.searchResults=a})}else c.searchResults=[]},300);c.search="",c.sanitizeAddress=function(a){var b="";return a.address.road&&(b+=a.address.road),a.address.house_number&&(b+=", "+a.address.house_number),a.address.suburb&&a.address.suburb!=a.address.city_district&&(a.address.road&&(b+=" - "),b+=a.address.suburb),a.address.city_district&&(a.address.road&&(b+=" - "),b+=a.address.city_district),b},c.clearPlace=function(){c.place={}},c.selectAddress=function(a){c.place.address=a.address,c.place.lat=a.lat,c.place.lon=a.lon,c.map.center={lat:parseFloat(c.place.lat),lng:parseFloat(c.place.lon),zoom:18},g(function(){i.getMap("new-place-map").then(function(a){a.invalidateSize(!1)})},300)},c.newPlace=function(d){c.place=_.clone(d)||{},c.map={center:{lat:0,lng:0,zoom:18},defaults:{tileLayer:window.bikeit.map.tile,scrollWheelZoom:!1},controls:!1},c.place.osm_id&&(c.map.center={lat:parseFloat(c.place.lat),lng:parseFloat(c.place.lon),zoom:18}),c.searchResults=[],c.dialog=b.open({template:a+"/views/place/new.html",scope:c,controller:["$scope",function(a){a.$watch("search",function(a){!a||"undefined"==typeof a||a.length<=2?c.searchResults=[]:k(a)})}]}),g(function(){i.getMap("new-place-map").then(function(a){a.invalidateSize(!1),c.$on("leafletDirectiveMap.moveend",function(){var b=a.getCenter();c.place.lat=b.lat,c.place.lon=b.lng})})},300)},c.submit=function(a){e.post({title:a.name,content_raw:" ",type:"place",status:"publish",place_meta:{category:a.category,lat:parseFloat(a.lat),lng:parseFloat(a.lon),road:a.road||a.address.road,district:a.district||a.address.city_district,number:a.number||a.address.house_number,osm_id:a.osm_id,params:JSON.stringify(a)}}).then(function(a){c.dialog&&(c.dialog.close(),c.dialog=!1),j.go("placesSingle.review",{placeId:a.ID})},function(a){console.log(a)})}}])},{}],7:[function(){"use strict";angular.module("bikeit.place").directive("placeListItem",["Labels","templatePath",function(a,b){return{restrict:"E",scope:{place:"=",style:"@"},templateUrl:b+"/views/place/partials/list-item.html",link:function(b){b.labels=a,b.style||(b.style="row")}}}]).directive("osmListItem",["Labels","templatePath",function(a,b){return{restrict:"E",scope:{place:"=",style:"@"},templateUrl:b+"/views/place/partials/osm-list-item.html",link:function(b){b.labels=a,b.sanitizeTitle=function(a){return a.address[a.type]||a.address.address29},b.sanitizeAddress=function(a){var b="";return a.address.road&&(b+=a.address.road),a.address.house_number&&(b+=", "+a.address.house_number),a.address.city_district&&(a.address.road&&(b+=" - "),b+=a.address.city_district),b}}}}]).directive("placeIcon",function(){return{restrict:"E",scope:{place:"="},template:'<img class="place-icon" title="{{place.terms[\'place-category\'][0].name}}" alt="{{place.terms[\'place-category\'][0].name}}" ng-show="{{place.terms[\'place-category\'].length}}" ng-src="{{getPlaceIcon(place)}}" />',link:function(a){a.getPlaceIcon=function(a){var b="default";return b=parseFloat(a.scores.approved)>=.5?"approved":"failed",a.terms["place-category"]?a.terms["place-category"][0].markers[b]:""}}}}).directive("mapFilters",["templatePath","$window",function(a,b){return{restrict:"E",templateUrl:a+"/views/place/partials/map-filters.html",link:function(a){a.categoryId=!1,a.categories=b.bikeit.placeCategories,a.placeLabels=b.bikeit.placeLabels,a.filter=function(b,c){"category"==c?a.categoryId=b&&a.categoryId!=b.term_id?b.term_id:!1:"score"==c&&(a.score=b&&a.score!=b?b:!1)}}}}])},{}],8:[function(){"use strict";angular.module("bikeit.place").filter("hideFound",[function(){return function(a,b){return a.length&&b.length&&(a=_.filter(a,function(a){return!_.find(b,function(b){return a.osm_id==b.osm_id})})),a}}]).filter("placeToMarker",["leafletData","MapMarkers",function(a,b){return _.memoize(function(a){if(a.length){var c={};return _.each(a,function(a){var d="default";d=parseFloat(a.scores.approved)>=.5?"approved":"failed";var e={};if(a.terms["place-category"]){var f=a.terms["place-category"][0].ID;e=b["place-category-"+f+"-"+d]}c[a.ID]={lat:a.location.lat,lng:a.location.lng,icon:e,message:"<h2>"+a.title+"</h2><p>"+a.formatted_address+"</p>"}}),c}return{}},function(){return JSON.stringify(arguments)})}]).filter("placeCategory",function(){return function(a,b){return b?_.filter(a,function(a){return a.terms["place-category"]&&parseInt(a.terms["place-category"][0].ID)==parseInt(b)}):a}}).filter("score",function(){return function(a,b){return b?_.filter(a,function(a){var c;return c=parseFloat(a.scores.approved)>=.5?"approved":"failed",b==c}):a}})},{}],9:[function(a){"use strict";angular.module("bikeit.place",[]).config(["$stateProvider",function(a){a.state("places",{url:"/places/",controller:"PlaceIndexController",templateUrl:window.bikeit.templateUri.split(window.location.origin)[1]+"/views/place/index.html"}).state("placesSingle",{url:"/places/:placeId/",controller:"PlaceSingleController",templateUrl:window.bikeit.templateUri.split(window.location.origin)[1]+"/views/place/single.html",resolve:{PlaceData:["$q","$stateParams","WPService",function(a,b,c){return c.getPost(b.placeId)}],PlaceReviews:["$stateParams","WPService",function(a,b){return b.query({filter:{place_reviews:a.placeId}})}]}}).state("placesSingle.review",{url:"review/"})}]),a("./directives"),a("./controllers"),a("./filters")},{"./controllers":6,"./directives":7,"./filters":8}],10:[function(){"use strict";angular.module("bikeit.review").controller("SubmitReviewCtrl",["templatePath","ngDialog","$scope","AuthService","WPService","$location","$state",function(a,b,c,d,e,f,g){c.loginTemplate=a+"/views/login.html",c.$watch(function(){return d.getUser()},function(a){c.user=a?a:!1}),c.$on("bikeit.userLoggedIn",function(){c.dialog&&c.dialog.close(),g.go(g.current.name,{},{reload:!0})}),c.newReview=function(d){g.go("placesSingle.review",{}),c.place=d||!1,c.review=d.user_review?_.clone(d.user_review):{},_.isEmpty(c.review)||(c.review.rating.stampable=c.review.rating.stampable?!0:!1),c.dialog=b.open({preCloseCallback:function(){g.go("placesSingle",{},{reload:!0})},template:a+"/views/review/new.html",scope:c})},c.onLoadReview=function(a,b){a&&c.$on("userReady",function(){c.newReview(b)})},c.submit=function(a){var b={ID:a.ID||null,title:" ",content_raw:a.content,type:"review",status:"publish",review_meta:{approved:a.rating.approved,kindness:a.rating.kindness,structure:a.rating.structure,stampable:a.rating.stampable?1:0,notify:a.notify?1:0,place:c.place.ID}};a.ID?e.update(b).then(function(){c.dialog&&(c.dialog.close(),c.dialog=!1)},function(a){console.log(a)}):e.post(b).then(function(){c.dialog&&(c.dialog.close(),c.dialog=!1)},function(a){console.log(a)})}}])},{}],11:[function(){"use strict";angular.module("bikeit.review").directive("reviewListItem",["templatePath","Labels","$state","$sce","WPService","ReviewService",function(a,b,c,d,e,f){return{restrict:"E",scope:{review:"="},templateUrl:a+"/views/review/partials/list-item.html",link:function(a){var g=a.review;a.labels=b,a.accessUser=function(a){c.go("user",{userId:a.ID})},a.getReviewDate=function(){return moment(g.date).format("L")},a.getReviewContent=function(){return d.trustAsHtml(g.content)},a.getReviewApproval=function(){return b(parseInt(g.rating.approved)?"Approved":"Failed")},a.vote=function(a){g.user_vote==a?f.unvote(g.ID).success(function(){g.votes[g.user_vote]--,g.user_vote=!1}):f.vote(g.ID,a).success(function(){g.user_vote!==a&&g.votes[g.user_vote]--,g.votes[a]++,g.user_vote=a})},a.toggleComments=function(){a.comments||e.getPostComments(g.ID).then(function(b){a.comments=b}),a.displayComments=a.displayComments?!1:!0},a.getCommentContent=function(a){return d.trustAsHtml(a.content)}}}}]).directive("ratings",[function(){return{restrict:"E",scope:{type:"@",rating:"@",editable:"@",model:"="},template:'<span class="rating rating-{{type}} clearfix" title="{{rating | number:2}}/5"><span ng-repeat="i in range(5) track by $index" class="rating-item rating-{{$index+1}}" ng-click="setRating($index+1)" ng-mouseover="hoverRating($index+1)" ng-mouseleave="getRating()"><span class="rating-filled" style="width:{{filledAmount($index+1)}}%">&nbsp;</span></span></span>',link:function(a){a.rating=parseFloat(a.rating),a.range=function(a){return new Array(a)},a.setRating=function(b){a.editable&&(a.rating=b,a.model=b)},a.hoverRating=function(b){a.editable&&(a.rating=b)},a.getRating=function(){a.editable&&(a.rating=a.model)},a.filledAmount=function(b){var c=0;return b<=a.rating?c=100:b==Math.ceil(a.rating)&&(c=100*(a.rating-b+1)),c}}}}])},{}],12:[function(a){"use strict";angular.module("bikeit.review",[]).factory("ReviewService",["$http","$q","apiUrl",function(a,b,c){return{vote:function(b,d){return a.post(c+"posts/"+b+"/vote",{vote:d})},unvote:function(b){return a["delete"](c+"posts/"+b+"/vote")}}}]),a("./directives"),a("./controllers")},{"./controllers":10,"./directives":11}],13:[function(){"use strict";angular.module("bikeit.user").controller("UserController",["WPService","$scope","AuthService","ngDialog","templatePath","Labels","$state",function(a,b,c,d,e,f,g){b.loadedUser=!1,b.labels=f,b.adminUrl=window.bikeit.adminUrl,b.accessUser=function(){b.user&&g.go("user",{userId:b.user.ID})},b.loginForm=function(){b.dialog=d.open({preCloseCallback:function(){g.go(g.current,{},{reload:!0})},template:e+"/views/login.html",scope:b})},b.$watch(function(){return c.getUser()},function(a){b.loadedUser=!0,a?(b.user=a,b.dialog&&(b.dialog.close(),b.dialog=!1)):b.user=!1})}]).controller("UserSingleController",["UserData","UserPlaces","UserReviews","$scope",function(a,b,c,d){d.user=a,d.places=b.data,d.reviews=c.data,_.each(d.reviews,function(a){a.placeData=_.find(d.places,function(b){return parseInt(b.ID)==parseInt(a.place)})}),d.getUserRegistration=function(){return moment(d.user.registered).format("L")},d.getUserAvatar=function(){return d.user.avatar.replace("?s=96","?s=400")}}])},{}],14:[function(a){"use strict";angular.module("bikeit.user",[]).config(["$stateProvider",function(a){a.state("user",{url:"/user/:userId/",controller:"UserSingleController",templateUrl:window.bikeit.templateUri.split(window.location.origin)[1]+"/views/user/single.html",resolve:{UserData:["$stateParams","WPService",function(a,b){return b.getUser(a.userId)}],UserPlaces:["$stateParams","WPService",function(a,b){return b.query({filter:{user_reviewed:a.userId,posts_per_page:-1}})}],UserReviews:["$stateParams","WPService",function(a,b){return b.query({type:"review",filter:{author:a.userId}})}]}})}]),a("./controllers.js")},{"./controllers.js":13}],15:[function(){"use strict";angular.module("bikeit.message",[]).config(["$httpProvider",function(a){a.interceptors.push("MessageInterceptor")}]).factory("MessageService",["$timeout",function(a){var b=[],c=!0;return{get:function(){return b},close:function(a){b=b.filter(function(b){return b!==a})},add:function(d,e){if(c){var f=this;if("undefined"!=typeof d){var g=d;"string"==typeof g&&(g={text:g}),b.push(g),e!==!1&&(e=e?e:3e3,a(function(){f.close(g)},e))}}return g},message:function(a,b){this.add(a,b)},disable:function(){c=!1},enable:function(){c=!0}}}]).factory("MessageInterceptor",["$q","$rootScope","$timeout","MessageService",function(a,b,c,d){return{request:function(b){return b||a.when(b)},response:function(b){return b.data.length&&b.data[0].message&&d.add(b.data[0].message),b||a.when(b)},responseError:function(b){return b.data.length&&b.data[0].message&&d.add(b.data[0].message),a.reject(b)}}}]).run(["$rootScope","MessageService",function(a,b){jQuery(document).ajaxError(function(c,d){d.responseJSON.length&&jQuery.each(d.responseJSON,function(c,d){d.message&&a.$apply(function(){b.add(d.message)})}),0==d.status})}]).controller("MessageCtrl",["$scope","$sce","MessageService",function(a,b,c){a.service=c,a.$watch("service.get()",function(b){var c=document.querySelectorAll(".ngdialog");a.isDialog=c.length?!0:!1,a.messages=b}),a.getMessage=function(a){return b.trustAsHtml(a.text)},a.close=function(b){a.service.close(b)}}])},{}],16:[function(a,b){"use strict";b.exports=["$rootScope","$http","$q","$window","apiUrl",function(a,b,c,d,e){var f,g=e+"posts",h=function(b,c){b=b||{},b=_.extend({page:1,filter:{posts_per_page:10}},b),jQuery.ajax({url:g,data:b,dataType:"json",cache:!0,success:function(b,d,e){a.$apply(function(){c(b,e.getResponseHeader("x-wp-total"),e.getResponseHeader("x-wp-totalpages"))})}})},i=function(a){var b,d,e,f=c.defer();return h(a,function(g,i,j){b=i,d=j,e=a.page,f.resolve({data:g,totalPosts:function(){return parseInt(b)},totalPages:function(){return parseInt(d)},currentPage:function(){return parseInt(e)},nextPage:function(){var b=c.defer();return e==d?b.resolve(!1):h(_.extend(a,{page:e+1}),function(a){e++,b.resolve(a)}),b.promise},prevPage:function(){var b=c.defer();return 1==e?b.resolve(!1):h(_.extend(a,{page:e-1}),function(a){e--,b.resolve(a)}),b.promise}})}),f.promise};return{query:i,get:function(a,b){return b=b||1,a=a||f,f=a,i({page:b,filter:{posts_per_page:a}})},search:function(a,b,c){return c=c||1,b=b||f,i({page:c,filter:{s:a,posts_per_page:b}})},getUser:function(a){a=a||"me";var b=c.defer();return jQuery.ajax({url:e+"users/"+a,dataType:"json",cache:!0,success:function(a){b.resolve(a)},error:function(a){b.reject(a.responseJSON)}}),b.promise},getPost:function(a){var b=c.defer();return jQuery.ajax({url:g+"/"+a,dataType:"json",cache:!0,success:function(a){b.resolve(a)},error:function(a){b.reject(a.responseJSON)}}),b.promise},getPostComments:function(a){var b=c.defer();return jQuery.ajax({url:g+"/"+a+"/comments",dataType:"json",cache:!0,success:function(a){b.resolve(a)},error:function(a){b.reject(a.responseJSON)}}),b.promise},post:function(a){var b=c.defer();return jQuery.ajax({url:g,dataType:"json",type:"POST",data:{data:a},success:function(a){b.resolve(a)},error:function(a){b.reject(a.responseJSON)}}),b.promise},update:function(a){var b=c.defer();return jQuery.ajax({url:g+"/"+a.ID,dataType:"json",type:"POST",data:{data:a},success:function(a){b.resolve(a)},error:function(a){b.reject(a.responseJSON)}}),b.promise}}}]},{}]},{},[3]);