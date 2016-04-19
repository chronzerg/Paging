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

var setupUnipage = require('../unipage.js');
var cbCounter = require('callback-count');
var should = require('should');

beforeEach(function () {
    // Initialize the DOM
    this.dom = require('jsdom-global')();

    // Initialize jQuery
    this.$ = require('jquery');

    // Add the HTML test elements.
    this.$('body').html(body);

    // Initialize a paging instance.
    this.paging = setupUnipage(this.$('#pages').children());
});

afterEach(function () {
    // Deconstruct the DOM
    this.dom();
});

describe('paging constructor', function () {
    it('should hide all but the first element', function () {
        var self = this;
        checkPageVisibility(self.$('#page1')).should.be.true();
    });
});

describe('switch to page', function () {
    it('should hide all but the target page', function () {
        this.paging.switchToPage('page2', null, true);
        checkPageVisibility(this.$('#page2')).should.be.true();
    });

    it('should call its callback when complete', function (done) {
        var self = this;
        self.paging.switchToPage('page2', function () {
            checkPageVisibility(self.$('#page2')).should.be.true();
            done();
        });
    });
});

describe('callbacks', function () {
    describe('before hide', function () {
        it('should be called before the page is hidden', function (done) {
            var self = this;
            self.paging.addBeforeHideCallback('page1', function () {
                checkPageVisibility(self.$('#page1')).should.be.true();
                done();
            });
            self.paging.switchToPage('page2', null, true);
        });
    });

    describe('before show', function () {
        it('should be called before the page is revealed', function (done) {
            var self = this;
            self.paging.addBeforeShowCallback('page2', function () {
                checkPageVisibility(self.$('#page1')).should.be.true();
                done();
            });
            self.paging.switchToPage('page2', null, true);
        });
    });

    describe('after hide', function () {
        it('should be called after the page is hidden', function (done) {
            var self = this;
            self.paging.addAfterHideCallback('page1', function () {
                checkPageVisibility(self.$('#page2')).should.be.true();
                done();
            });
            self.paging.switchToPage('page2', null, true);
        });
    });

    describe('after show', function () {
        it('should be called after the page is revealed', function (done) {
            var self = this;
            self.paging.addAfterShowCallback('page2', function () {
                checkPageVisibility(self.$('#page2')).should.be.true();
                done();
            });
            self.paging.switchToPage('page2', null, true);
        });
    });

    describe('multiple of the same type', function () {
        it('should all be called upon the transition', function (done) {
            var count = cbCounter(2, done);
            this.paging.addBeforeShowCallback('page2', function cb1 () {
                count.next();
            });
            this.paging.addBeforeShowCallback('page2', function cb2 () {
                count.next();
            });
            this.paging.switchToPage('page2', null, true);
        });
    });
});

describe('data remover', function () {
    it('should remove the callback before its called', function () {
        var remover = this.paging.addBeforeHideCallback('page1', function () {
            throw new Error('Callback wasnt removed!');
        });
        remover();
        this.paging.switchToPage('page2', null, true);
    });
});

describe('child instances', function () {
    it('should have their show callbacks called', function (done) {
        var count = cbCounter(2, done);

        // Setup child
        this.$('#page2').append('<div id="child1-pages"></div>');
        this.$('#child1-pages').append('<div id="child1-page1"></div>');
        var child = setupUnipage(this.$('#child1-pages').children());
        child.addBeforeShowCallback('child1-page1', function () {
            count.next();
        });

        // Setup grandchild
        this.$('#child1-page1').append('<div id="child2-pages"></div>');
        this.$('#child2-pages').append('<div id="child2-page1"></div>');
        var grandchild = setupUnipage(this.$('#child2-pages').children());
        grandchild.addAfterShowCallback('child2-page1', function () {
            count.next();
        });

        // Setup hierarchy
        child.attachChildUnipage('child1-page1', grandchild);
        this.paging.attachChildUnipage('page2', child);

        this.paging.switchToPage('page2', null, true);
    });
});