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
		root.createPaging = factory();
	}
})(this, function factory () {
	'use strict';

	// Constant Keys
	var BH = "pagingBeforeHideCallbacks",
		BS = "pagingBeforeShowCallbacks",
		AH = "pagingAfterHideCallbacks",
		AS = "pagingAfterShowCallbacks",
		CH = "pagingChildInstance",
		OP = "pagingOpen",

		FADE_TIME = 200;

	// Add item to the list stored at the given
	// dataId for the given page.
	function addData ($page, dataId, item) {
		var data = $page.data(dataId) || [];
		data.push(item);
		$page.data(dataId, data);
	}

	// Call the callbacks attached to the given dataId on the
	// given page.
	function callCallbacks ($page, dataId) {
		var callbacks = $page.data(dataId);
		if (callbacks !== undefined) {
			for (var i = 0; i < callbacks.length; i++) {
				callbacks[i]();
			}
		}
	}

	// Runs down the chain of children for the given page
	// calling the given callback on their open page.
	function callCallbacksForChildren($page, dataId) {
		var children = $page.data(CH) || [];

		(function callChildrenCallbacks (children) {
			children.forEach(function (paging) {
				var openPage = paging._getOpenPage();
				paging._callCallbacks(openPage, dataId);
				callChildrenCallbacks(openPage.data(CH) || []);
			});
		})(children);
	}

	return function Paging ($pages) {

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

				// If there is no page with the given id or if there are
				// multiple pages with the given id, don't do anything.
				if ($newPage.length != 1) {
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
				// happening now.
				$pages.stop();

				if (immediately) {
					$oldPage.hide();
					showNewPage();
				}
				else {
					$oldPage.fadeOut({
						complete: showNewPage,
						duration: FADE_TIME
					});
				}
			},

			// Add a callback to be called before the page with
			// the given id is hidden.
			addBeforeHideCallback: function (id, callback) {
				addData(getPage(id), BH, callback);
			},

			// Add a callback to be called before the page with
			// the given id is shown.
			addBeforeShowCallback: function (id, callback) {
				addData(getPage(id), BS, callback);
			},

			// Add a callback to be called after the page with
			// the given id is hidden.
			addAfterHideCallback: function (id, callback) {
				addData(getPage(id), AH, callback);
			},

			// Add a callback to be called after the page with
			// the given id is shown.
			addAfterShowCallback: function (id, callback) {
				addData(getPage(id), AS, callback);
			},

			// Attach a child paging instance to the page with
			// the given id. When said page is shown, the open
			// page of the child instance will get its 'before
			// show' and 'after show' callbacks called. This is
			// recursively applied down the generations.
			attachChildPaging: function (id, pagingInstance) {
				addData(getPage(id), CH, pagingInstance);
			},

			// Internal use
			_getOpenPage: getOpenPage,
			_callCallbacks: callCallbacks
		};
	};
});