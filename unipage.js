(function (root, factory) {
	'use strict';

	// AMD Support
	if (typeof define === "function" && define.amd) {
		define(['lodash'], factory);
	}
	// NodeJS Support
	else if (typeof module === "object" && module.exports) {
		module.exports = factory(require('lodash'));
	}
	// Regular Support
	else {
		root.setupUnipage = factory(root._);
	}
})(this, function factory (_) {
	'use strict';

	// Data types
	var BH = "unipage_BeforeHideCallbacks",
		BS = "unipage_BeforeShowCallbacks",
		AH = "unipage_AfterHideCallbacks",
		AS = "unipage_AfterShowCallbacks",
		CH = "unipage_ChildInstances",

	// Open page class
		OP = "unipage-open";

	// Calling getDataId() returns the next
	// data ID to be used in identifying
	// callbacks and child instances.
	var getDataId = (function getDataIdFactory () {
		var nextId = 0;

		return function () {
			var id = nextId;
			nextId++;
			return id;
		};
	})();

	// Returns a remover function which removes the data
	// item with the given data id, of the given data type,
	// from the given $page.
	function getRemover ($page, dataType, dataId) {
		return function remover () {
			var data = $page.data(dataType);
			delete data[dataId];
			$page.data(dataType, data);
		};
	}

	// Add data of dataType to the given $page.
	function addData ($page, dataType, item) {
		var dataId = getDataId(),
			data = $page.data(dataType) || {};
		data[dataId] = item;
		$page.data(dataType, data);

		// Return a method which removes the added callback.
		return getRemover($page, dataType, dataId);
	}

	// Call the callbacks attached to the given dataType on the
	// given page.
	function callCallbacks ($page, dataType) {
		var callbacks = $page.data(dataType);
		if (callbacks !== undefined) {
			for (var dataId in callbacks) {
				callbacks[dataId]();
			}
		}
	}

	// Runs down the chain of children for the given page
	// calling the given callback on their open page.
	function callCallbacksForChildren($page, dataType) {
		var children = $page.data(CH) || {};

		(function callCallbacksRecursively (children) {
			_.forOwn(children, function callChildsCallbacks (unipage) {
				var $openPage = unipage._getOpenPage();
				unipage._callCallbacks($openPage, dataType);
				callCallbacksRecursively($openPage.data(CH) || {});
			});
		})(children);
	}

	var defaults = {
		fadeTime: 400
	};

	return function setupUnipage ($pages, options) {

		var options = _.defaults(options, defaults);

		// Get the page specified by the id.
		function getPage (id) {
			return $pages.filter('#' + id);
		}

		// Get the page that is currently open.
		function getOpenPage () {
			return $pages.filter('.' + OP);
		}

		$pages.hide();
		$pages.first().addClass(OP).show();

		return {
			
			// Open the page with the given id, close the currently open
			// page, and call all relevant callbacks.
			switchToPage: function switchToPage (id, callback, immediately) {
				var $oldPage = getOpenPage(),
				    $newPage = getPage(id);

				// If there is no page with the given id, don't do anything.
				// According to the jQuery docs, the ID selector in getPage()
				// will never return multiple pages so we don't check for
				// that case.
				if ($newPage.length === 0) {
					return;
				}

				// If this page is already open, do nothing.
				if ($newPage.is($oldPage)) {
					return;
				}

				$oldPage.removeClass(OP);
				$newPage.addClass(OP);

				callCallbacks($oldPage, BH);
				callCallbacks($newPage, BS);
				callCallbacksForChildren($newPage, BS);

				function showNewPage () {
					$newPage.show();
					callCallbacks($oldPage, AH);
					callCallbacks($newPage, AS);
					callCallbacksForChildren($newPage, AS);
					if (callback) callback();
				}

				// Stop any switch page animations that may be
				// happening now and reshow the old page. Reshowing
				// undoes any partial animation which has been
				// applied to the page.
				$pages.stop(true, true).hide();
				$oldPage.show();

				if (immediately) {
					$oldPage.hide();
					showNewPage();
				}
				else {
					$oldPage.fadeOut({
						complete: showNewPage,
						duration: options.fadeTime
					});
				}
			},

			// Add a callback to be called before the page with
			// the given id is hidden.
			addBeforeHideCallback: function (id, callback) {
				return addData(getPage(id), BH, callback);
			},

			// Add a callback to be called before the page with
			// the given id is shown.
			addBeforeShowCallback: function (id, callback) {
				return addData(getPage(id), BS, callback);
			},

			// Add a callback to be called after the page with
			// the given id is hidden.
			addAfterHideCallback: function (id, callback) {
				return addData(getPage(id), AH, callback);
			},

			// Add a callback to be called after the page with
			// the given id is shown.
			addAfterShowCallback: function (id, callback) {
				return addData(getPage(id), AS, callback);
			},

			// Attach a child unipage instance to the page with
			// the given id. When said page is shown, the open
			// page of the child instance will get its 'before
			// show' and 'after show' callbacks called. This is
			// recursively applied down the generations.
			attachChildUnipage: function (id, unipageInstance) {
				return addData(getPage(id), CH, unipageInstance);
			},

			// Internal use
			_getOpenPage: getOpenPage,
			_callCallbacks: callCallbacks
		};
	};
});