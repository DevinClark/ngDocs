// # Docular app.js
// _An [OverDid.It](http://overdid.it) Project._

"use strict";

/*jshint noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, undef:true, unused:false, curly:true, browser:true, devel:true, jquery:true, indent:4, maxerr:50, newcap:true */
/*global Handlebars, jQuery, FastClick, angular */

// Override jQuery.error for display in Console.
$.error = console.error;

// Global Settings
var GlobalSettings = {
	tabletMin: 768,
	tabletMax: 1025,
	env: "cordova"
};

// ## Start
var Start = {
	battle: function (){
		this.inits();
		this.styling();
	},
	firstLoad: function (){
		this.battle();
		ProgressBar.load();

		switch(GlobalSettings.env) {
		case "web":
			break;
		case "cordova":
			CordovaApp.initialize();
			break;
		}
	},
	inits: function (){
		OrientationCheck.init();
		ScrollingFixes.init();
		Navigation.init();
	},
	styling: function (){
		var formElements = {
			'input[type="button"]': 'btn',
			'input[type="checkbox"]': 'checkbox',
			'input[type="file"]': 'file',
			'input[type="image"]': 'image',
			'input[type="password"]': 'password',
			'input[type="radio"]': 'radio',
			'input[type="submit"]': 'submit btn',
			'input[type="reset"]': 'reset',
			'input[type="text"]': 'text',
			'input[type="email"]': 'email',
			'input[type="url"]': 'url',
			'input[type="search"]': 'search',
			'input[type="tel"]': 'tel',
			'input[type="date"]': 'date',
			'input[type="datetime"]': 'datetime',
			'input[type="range"]': 'range'
		};
		for(var element in formElements) {
			$(element).addClass(formElements[element]);
		}
		ProgressBar.init();
		
		// Ensures the bottom bar elements are always the correct width, regardless of the number of items.
		$('.bottom-bar li').css("width", 100 / $('.bottom-bar li').length + "%");

	}
};

// ## CordovaApp
var CordovaApp = {
	initialize: function() {
		this.bind();
	},
	bind: function() {
		document.addEventListener('deviceready', CordovaApp.deviceready, false);
	},
	deviceready: function() {
		CordovaApp.report('deviceready');
	},
	report: function(id) { 
		console.log("report:" + id);
		//angular.bootstrap(document, ["angulargap"]);
		CordovaApp.InAppBrowser();
	},
	InAppBrowser: function() {
		// Open outside links in the InAppBrowser.
		$('a')
			.filter("a[href^='http://'], a[href^='https://'], a[href^='www']")
			.on('click', function(event) {
				event.preventDefault();

				window.open(
					$(this).attr("href"),
					"_blank", 
					""
				);
			});
	}
};

// ## OrientationCheck
var OrientationCheck = {
	// ### init
	// Initialize OrientationCheck and add body classes. 
	init: function() {
		$("body").addClass("landscape");
		OrientationCheck.check();
		OrientationCheck.resize();
	},
	// ### debounce
	// Postpone execution of fn until after delay milliseconds have passed since the fn's last execution.
	// 
	// * `fn` is the function to debounce
	// * `delay` is the amount of time to wait in milliseconds.
	debounce: function(fn, delay) {
		var timer = null;
		return function () {
			var context = this, args = arguments;
			clearTimeout(timer);
			timer = setTimeout(function () {
				fn.apply(context, args);
			}, delay);
		};
	},
	// ### check
	// Checks to see if the window is in portrait or landscape orientation.
	check: function() {
		if(window.innerWidth > window.innerHeight) {
			$("body").addClass("landscape").removeClass("portrait");
		} else {
			$("body").addClass("portrait").removeClass("landscape");
		}
	},
	// ### resize
	// Recheckes the orientation and fixes window scrolling.
	// 
	//  * callback a callback function to hook into `resize()` and functionality.
	resize: function(callback) {
		window.addEventListener("resize", function() {
			OrientationCheck.check();
			ScrollingFixes.setScrolling(window.innerHeight);
			if(callback) {
				callback(window.innerWidth, window.innerHeight);
			}
		}, false);
	},
	// ### isTablet
	// Returns true if the device width is in the range of tabletMin and TabletMax in GlobalSettings.
	isTablet: function() {
		return (window.innerWidth >= GlobalSettings.tabletMin && window.innerWidth <= GlobalSettings.tabletMax);
	}
};

// ## ScrollingFixes
var ScrollingFixes = {
	// ### init
	init: function (){
		this.setScrolling();
		this.disableElastic();
	},
	// ### setScrolling
	// Makes the main content area main scrolling area. Accepts a parameter that is used in `OrientationCheck` to reflow height on orientation change.
	setScrolling: function(winHeight) {
		winHeight = (typeof winHeight === "undefined") ? window.innerHeight : winHeight;
		var headerHeight = $('.js-content-wrap header').outerHeight(false);
		var footerHeight = ( $('.bottom-bar').css("display") === "none" ) ? 0 : $('.bottom-bar').outerHeight(false);
		var totalHeight = winHeight - headerHeight - footerHeight;
		$('.js-content-wrap')
		.css({
			'height': winHeight
		})
		.find('section')
		.css({
			'height': totalHeight,
			'overflow': 'scroll',
			'-webkit-overflow-scrolling': 'touch'
		});
	},
	// ### disableElastic
	// Disables the annoying and evil rubber band scrolling.
	disableElastic: function () {
		var link = $('.page section');
		
		var docHeight = $('.page #js-primary-content').outerHeight(false);
		var headerHeight = $('.js-content-wrap header').outerHeight(false);
		var footerHeight = ( $('.bottom-bar').css("display") === "none" ) ? 0 : $('.bottom-bar').outerHeight(false);
		var totalHeight = docHeight - headerHeight - footerHeight;
		$('.page #js-primary-content > div').css('min-height', totalHeight);
		

		$(window).bind('touchstart',function(){
			var scrolled = link.scrollTop();
			var winHeight = link.height();
			var contentHeight = $('.page section > div').innerHeight();
			var fromBottom = contentHeight - winHeight - scrolled;
			
			if( scrolled < 1 ) {
				link.animate({scrollTop: scrolled + 1}, 0);
			}
			if( fromBottom < 1 ) {
				link.animate({scrollTop: scrolled - 1},0);
			}
		});
	}
};

// ## ProgressBar
// Takes elements with the class of `meter` and turns them into pretty progress bars. 
var ProgressBar = {
	// ### init
	init: function() {
		$(".meter").each(function() {
			$(this).append("<span />");
			// Sets the width of the progress bar.
			$("span", this).width($(this).data("progress") + "%");
			if($(this).hasClass("show-progress")) {
				$("span", this).html("<b>" + $(this).data("progress") + "%</b>");
			}
		});
	},
	// ### load
	// Animates the load of the progress bar.
	load: function() {
		$(".meter").each(function() {
			$("span", this).width(0).animate({
				width: $(this).data("progress") + "%"
			}, 1200);
		});
	}
};

// ## Navigation
var Navigation = {
	s: {
		navWidth: $(document).width(),
		menuContainer: '#main-nav',
		menuItems: '#main-nav ul li a',
	},
	init: function (){
		// These functions are only needed on mobile. Tablet is getting a different menu.
		if(OrientationCheck.isTablet()) {
			this.sideNavInit();
		}
		else {
			$(this.s.menuContainer).removeClass("side-menu");
		}
	},
	sideNavInit: function() {
		var $nav = $(this.s.menuContainer);
		$nav.addClass("side-menu");
	}
};

$(function(){
	Start.firstLoad();
});


var Docular = angular.module('Docular', ['ngMobile', 'ngSanitize']);

Docular.config(function($httpProvider, $routeProvider, $locationProvider) {
	$routeProvider.when("/", {
		templateUrl: "views/home.html",
		controller: "MainCtrl",
		activeClass: 'home',
		bodyClass: 'home'
	})
	.when("/api", {
		templateUrl: "views/api.html",
		controller: "APICtrl",
		activeClass: 'api',
		bodyClass: 'page-api'
	})
	.when("/api/:id/", {
		templateUrl: "views/single-api.html",
		controller: "APISingleCtrl",
		activeClass: 'api',
		isSingle: true,
		bodyClass: 'single single-api'
	})
	.when("/guide", {
		templateUrl: "views/guide.html",
		controller: "APICtrl",
		activeClass: 'guide',
		bodyClass: 'page-api'
	})
	.when("/guide/:id", {
		templateUrl: "views/single-guide.html",
		controller: "APISingleCtrl",
		activeClass: 'guide',
		isSingle: true,
		bodyClass: 'single single-guide'
	})
	.when("/recent", {
		templateUrl: "views/recent.html",
		controller: "RecentCtrl",
		activeClass: 'recent',
		bodyClass: 'page-recent'
	})
	.when("/settings", {
		templateUrl: "views/settings.html",
		controller: "SettingsCtrl",
		activeClass: 'settings',
		bodyClass: 'settings'
	})
	.otherwise({redirectTo: "/"});
});

// ## Init
// This method contains defaults that need to run on each load. 

Docular.run(function($rootScope, $route, $window, PagesFactory) {

	$rootScope.settings = {};
	$rootScope.settings.version = '1.1.5'; // replace with setting loaded from local storage.

	$rootScope.goBack = function() {
		$window.history.back();
	};

	$rootScope.$on('$routeChangeSuccess', function(ev,data) {
		$rootScope.loading = true;
		$rootScope.controller = data.$$route.controller;
		$rootScope.activeClass = $route.current.$$route.activeClass;
		$rootScope.isSingle = $route.current.$$route.isSingle || false;
		$rootScope.bodyClass = $route.current.$$route.bodyClass || "";
		$rootScope.isTablet = OrientationCheck.isTablet();
	});
});
 
// ## Services

// ### Pages Factory
// Retrieves the list of pages. 
Docular.factory('PagesFactory', ['$window', '$q', '$timeout', function($window, $q, $timeout) {
	var page;

	return function() {
		var deferred = $q.defer();

		$timeout(function() {
			if(typeof page === "undefined") {
				var page = $window.NG_PAGES;
				deferred.resolve(page);
			}
			else {
				deferred.resolve(page);
			}
		}, 100);

		return deferred.promise;
	};
}]);

// ### RecentFactory
// 
Docular.factory('RecentFactory', ['PagesFactory', function(PagesFactory) {

	var db;
	var init = function init() {
		db = openDatabase('ngDocs', '1.0', 'ngDocs Database', 2 * 1024 * 1024);
		db.transaction(function request(tx) {
			//tx.executeSql('DROP TABLE recent');
			tx.executeSql('CREATE TABLE IF NOT EXISTS recent (id, section, date, PRIMARY KEY (id, section))');
		});
	};

	var add = function add(path) {
		var theTime = Math.round(new Date().valueOf() / 1000);

		var item = path.split("/");

		init();
		db.transaction(function request(tx) {
			tx.executeSql('INSERT INTO recent (id, section, date) VALUES ("' + item[2] + '", "' + item[1] + '", ' + theTime + ')');
			//console.log('INSERT INTO recent (id, section, date) VALUES ("' + item[2] + '", "' + item[1] + '", ' + theTime + ')');
		});
	};

	var clear = function clear() {
		db.transaction(function request(tx) {
			tx.executeSql('DROP TABLE recent');
		});
		init();
	};

	var list = function list(callback) {
		init();
		db.transaction(function request(tx) {
			tx.executeSql('SELECT * FROM recent ORDER BY date DESC LIMIT 50', [], function(tx, results) {
					var len = results.rows.length;
					var list = [];
					for (var i = 0; i < len; i++){
						list.push(results.rows.item(i));
					}
					if(callback) {
						callback(list);
					}
				});
		});
	};


	return {
		add: add,
		clear: clear,
		list: list
	};
}]);
 
// ## Directives
 
// ### ngEnter
Docular.directive('ngEnter', function() {
	return function(scope, element, attrs) {
		element.bind("keydown keypress", function(event) {
			if(event.which === 13) {
				$(element).blur();
				event.preventDefault();
			}
		});
	};
});

// ## Filters
Docular.filter('truncate', function () {
	return function (text, length, end) {
		if (isNaN(length)) length = 10;
		if (end === undefined) end = "...";

		if(OrientationCheck.isTablet() === true) {
			return text;
		}
		else {
			if (text.length <= length || text.length - end.length <= length)
				return text;
			else
				return String(text).substring(0, length-end.length) + end;
		}
	};
});

// ## Controllers


// ### MainCtrl
// Handles loading the home page.

Docular.controller('MainCtrl', ['$rootScope', '$scope', function($rootScope, $scope) {
	$rootScope.pageTitle = "Docular";
	$rootScope.loading = false;
}]);


// ### APICtrl
// Handles the top level API page.
// @requires PagesFactory

Docular.controller('APICtrl', ['$rootScope', '$scope', '$window', 'PagesFactory', '$location', function($rootScope, $scope, $window, PagesFactory, $location) {
	$rootScope.pageTitle = ($location.path().indexOf("api") !== -1) ? "API Reference" : "Developer Guide";
	PagesFactory().then(function(data) {
		$scope.pages = data;
		$rootScope.loading = false;
	});

}]);

// ### APISingleCtrl
// Handles the child level API and guide pages.
Docular.controller('APISingleCtrl', ['$rootScope', '$scope', '$routeParams', '$http', '$timeout', '$location', 'RecentFactory', function($rootScope, $scope, $routeParams, $http, $timeout, $location, RecentFactory) {
	$rootScope.pageTitle = $routeParams.id.replace("angular.", "").replace("dev_guide.", "");
	$rootScope.previousId = $location.path().replace(/\/$/, "");

	RecentFactory.add($location.path());

	$http.get("views/docs/1.1.5/partials" + $location.path().replace(/\/$/, "") + ".html")
		.success(function(data) {
			var $tempContents = $("<div>" + data + "</div>");

			// Fix code for PrismJS
			$(".prettyprint", $tempContents).wrapInner('<code class="language-javascript" />');
			$(".prettyprint code", $tempContents).each(function() {
				var thePre = $(this).parent("pre");
				if( thePre.html().split(/\n/).length > 2) {
					thePre.addClass("line-numbers");
				}
			});

			// Fix image links.
			$("img", $tempContents).each(function() {
				$(this).attr("src", "views/docs/1.1.5/" + $(this).attr("src"));
			});

			// Unlink relative doc links. They don't work right anyways.
			$("a", $tempContents).filter(":not(a[href^='http://'], a[href^='https://'], a[href^='www'])").removeAttr("href");

			// Removes live example.
			$(".doc-example-live", $tempContents).prev("h2").remove();
			$(".doc-example-live", $tempContents).remove();

			$("table", $tempContents).wrap("<div class='scroll-box'></div>");

			// Removes inline styling.
			$('*[style]', $tempContents).removeAttr('style');

			// TODO: Tabbed sections need a more mobile-friendly style.
			$scope.contents = $tempContents.html();
			$rootScope.loading = false;
		});

		$scope.$watch('contents', function() {
			$timeout(function() {
				Prism.highlightAll();
				$(".doc-wrap").fitVids();
				CordovaApp.InAppBrowser();
			}, 0);
		}, true);
}]);

// ### SettingsCtrl
Docular.controller('SettingsCtrl', ['$rootScope', '$scope', function($rootScope, $scope) {
	$rootScope.pageTitle = "Settings";
	$rootScope.loading = false;

	$scope.settings.versions = [
		{ id: '1.0.7' },
		{ id: '1.1.5' }
	];
	$rootScope.settings.version = $scope.version;
}]);


// ### RecentCtrl
Docular.controller('RecentCtrl', ['$rootScope', '$scope', 'RecentFactory', function($rootScope, $scope, RecentFactory) {
	$rootScope.pageTitle = "Recent";
	$rootScope.loading = false;
	$scope.pages = [];

	// pulls the recent items from a WebSQL db.
	RecentFactory.list(function(list) {
		// lets the view know the model has changed.
		$scope.$apply(function () {
			$scope.pages = list;
		});
	});
}]);
