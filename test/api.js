// Create the HTML string for the testing DIVs.
var body = '<div id="pages">';
for (var i=0; i<2; i++) {
    body += '<div id="page'+(i+1)+'"></div>';
}
body += '</div>';

// Returns true if the target page is visible and
// all it's sibling are hidden. Returns false
// otherwise.
function checkPageVisibility ($target) {
    return $target.is(':visible') && !$target.siblings().is(':visible');
}

var createPaging = require('../paging.js');
var $, paging;
beforeEach(function () {
    this.dom = require('jsdom-global')();
    $ = require('jquery');
    $('body').html(body);
    paging = createPaging($('#pages').children());
});

afterEach(function () {
    this.dom();
});

describe('createPaging()', function () {
    it('should hide all but the first element', function () {
        checkPageVisibility($('#page1')).should.be.true();
    });
});

describe('switchToPage()', function () {
    it('should hide all but the target page', function (done) {
        paging.switchToPage('page1', null, true);

        // Check immediately transitions
        paging.switchToPage('page2', null, true);
        checkPageVisibility($('#page2')).should.be.true();

        // Check fade transitions
        paging.switchToPage('page1', function () {
            checkPageVisibility($('#page1')).should.be.true();
            done();
        });
    });
});

describe('before-hide callback', function () {
    it('should be called before the page is hidden', function (done) {
        paging.switchToPage('page1', null, true);
        paging.addBeforeHideCallback('page1', function () {
            checkPageVisibility($('#page1')).should.be.true();
            done();
        });
        paging.switchToPage('page2', null, true);
    });
});

describe('before-show callback', function () {
    it('should be called before the page is revealed', function (done) {
        paging.switchToPage('page1', null, true);
        paging.addBeforeShowCallback('page2', function () {
            checkPageVisibility($('#page1')).should.be.true();
            done();
        });
        paging.switchToPage('page2', null, true);
    });
});

describe('after-hide callback', function () {
    it('should be called after the page is hidden', function (done) {
        paging.switchToPage('page1', null, true);
        paging.addAfterHideCallback('page1', function () {
            checkPageVisibility($('#page2')).should.be.true();
            done();
        });
        paging.switchToPage('page2');
    });
});

describe('after-show callback', function () {
    it('should be called after the page is revealed', function (done) {
        paging.switchToPage('page1', null, true);
        paging.addAfterShowCallback('page2', function () {
            checkPageVisibility($('#page2')).should.be.true();
            done();
        });
        paging.switchToPage('page2');
    });
});