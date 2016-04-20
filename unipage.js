(function (root, factory) {
	'use strict';

	// AMD Support
	if (typeof define === "function" && define.amd) {
		define(factory);
	}
	// NodeJS Support
	else if (typeof module === "object" && module.exports) {
		module.exports = factory();
	}
	// Regular Support
	else {
		root.setupUnipage = factory();
	}
})(this, function factory () {
	'use strict';

	// Data types
	var BH = "unipage_BeforeHideCallbacks",
		BS = "unipage_BeforeShowCallbacks",
		AH = "unipage_AfterHideCallbacks",
		AS = "unipage_AfterShowCallbacks",
		RM = "unipage_RemoveCallbacks",
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

	// Add data of dataType to the given $page.
	function addData ($page, dataType, item) {
		var dataId = getDataId(),
			data = $page.data(dataType) || {};
		data[dataId] = item;
		$page.data(dataType, data);

		return dataId;
	}

	// Add data of the dataType to the given $page.
	function addDataWithoutId ($page, dataType, item) {
		var data = $page.data(dataType) || [];
		data.push(item);
		$page.data(dataType, data);
	}

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

	// Checks if the given dataId for a callback is in the
	// given $page's remove list.
	function checkRemoveList ($page, dataId) {
		var list = $page.data(RM) || [];
		return list.indexOf(dataId) >= 0;
	}

	function addCallback ($page, callbackType, callback, once) {
		var dataId = addData($page, callbackType, callback);
		var remover = getRemover($page, callbackType, dataId);

		// If once, we add the callback to the list of callbacks
		// to be removed. The callback will then be removed after its
		// called.
		if (once) {
			$page.addDataWithoutId($page, RM, dataId);
		}

		return remover;
	}

	// Call the callbacks attached to the given dataType on the
	// given page.
	function callCallbacks ($page, dataType) {
		var callbacks = $page.data(dataType);
		if (callbacks !== undefined) {
			for (var dataId in callbacks) {
				callbacks[dataId]();
				
				// Check if this callback is on the remove list.
				// If so, remove it so it doesn't get called again.
				if (checkRemoveList($page, dataId)) {
					delete callbacks[dataId];
				}
			}
		}
	}

	// Runs down the chain of children for the given page
	// calling the given callback on their open page.
	function callCallbacksForChildren($page, dataType) {
		var children = $page.data(CH) || {};

		(function callCallbacksRecursively (children) {
			for (var dataId in children) {
				var unipage = children[dataId];
				var $openPage = unipage._getOpenPage();
				unipage._callCallbacks($openPage, dataType);
				callCallbacksRecursively($openPage.data(CH) || {});
			}
		})(children);
	}

	// Adds defaults to the given options object, only
	// if the defaults aren't already defined.
	var addDefaults = (function () {
		var defaults = {
			fadeOut: 400
		};

		return function (options) {
			for (var key in defaults) {
				if (options[key] === undefined) {
					options[key] = defaults[key];
				}
			}
			return options;
		}
	})();

	return function setupUnipage ($pages, options) {

		options = addDefaults(options || {});

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
			switch: function (id, immediately) {
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
			beforeHide: function (id, callback, once) {
				return addCallback(getPage(id), BH, callback, once);
			},

			// Add a callback to be called before the page with
			// the given id is shown.
			beforeShow: function (id, callback, once) {
				return addCallback(getPage(id), BS, callback, once);
			},

			// Add a callback to be called after the page with
			// the given id is hidden.
			afterHide: function (id, callback, once) {
				return addCallback(getPage(id), AH, callback, once);
			},

			// Add a callback to be called after the page with
			// the given id is shown.
			afterShow: function (id, callback, once) {
				return addCallback(getPage(id), AS, callback, once);
			},

			// Attach a child unipage instance to the page with
			// the given id. When said page is shown, the open
			// page of the child instance will get its 'before
			// show' and 'after show' callbacks called. This is
			// recursively applied down the generations.
			child: function (id, unipageInstance) {
				var $page = getPage(id);
				var dataId = addData($page, CH, unipageInstance);
				return getRemover($page, CH, dataId);
			},

			// Internal use
			_getOpenPage: getOpenPage,
			_callCallbacks: callCallbacks
		};
	};
});