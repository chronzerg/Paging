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
var should = require('should');

beforeEach(function () {
    // Initialize the DOM
    this.dom = require('jsdom-global')();

    // Initialize jQuery
    this.$ = require('jquery');

    // Add the HTML test elements.
    this.$('body').html(body);

    // Initialize a paging instance.
    this.paging = createPaging(this.$('#pages').children());
});

afterEach(function () {
    // Deconstruct the DOM
    this.dom();
});

describe('createPaging()', function () {
    it('should hide all but the first element', function () {
        var self = this;
        checkPageVisibility(self.$('#page1')).should.be.true();
    });
});

describe('switchToPage()', function () {
    it('should hide all but the target page', function (done) {
        var self = this;

        // Check immediately transitions
        self.paging.switchToPage('page2', null, true);
        checkPageVisibility(self.$('#page2')).should.be.true();

        // Check fade transitions
        self.paging.switchToPage('page1', function () {
            checkPageVisibility(self.$('#page1')).should.be.true();
            done();
        });
    });
});

describe('before-hide callback', function () {
    it('should be called before the page is hidden', function (done) {
        var self = this;
        self.paging.addBeforeHideCallback('page1', function () {
            checkPageVisibility(self.$('#page1')).should.be.true();
            done();
        });
        self.paging.switchToPage('page2', null, true);
    });
});

describe('before-show callback', function () {
    it('should be called before the page is revealed', function (done) {
        var self = this;
        self.paging.addBeforeShowCallback('page2', function () {
            checkPageVisibility(self.$('#page1')).should.be.true();
            done();
        });
        self.paging.switchToPage('page2', null, true);
    });
});

describe('after-hide callback', function () {
    it('should be called after the page is hidden', function (done) {
        var self = this;
        self.paging.addAfterHideCallback('page1', function () {
            checkPageVisibility(self.$('#page2')).should.be.true();
            done();
        });
        self.paging.switchToPage('page2');
    });
});

describe('after-show callback', function () {
    it('should be called after the page is revealed', function (done) {
        var self = this;
        self.paging.addAfterShowCallback('page2', function () {
            checkPageVisibility(self.$('#page2')).should.be.true();
            done();
        });
        self.paging.switchToPage('page2');
    });
});