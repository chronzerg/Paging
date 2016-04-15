require('should');
var $ = require('jquery');

// Dummy jQuery object. Using this instead of an
// empty jQuery object because jQuery currently
// is not working in Node.js on Win7 (4/14/2015).
var $pages = {
    hide: function () { return this; },
    show: function () { return this; },
    first: function () { return this; },
    addClass: function () { return this; }
};

describe('createPaging', function () {
    it('should return a paging instance', function () {
        var paging = require('../paging.js')($pages);
        paging.should.have.property('switchToPage');
    });
})