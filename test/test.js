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

describe('constructor', function () {
    it('should hide all but the first element', function () {
        var self = this;
        checkPageVisibility(self.$('#page1')).should.be.true();
    });
});

describe('switch', function () {
    it('should hide all but the target page', function () {
        this.paging.switch('page2', true);
        checkPageVisibility(this.$('#page2')).should.be.true();
    });
});

describe('callbacks', function () {
    describe('before hide', function () {
        it('should be called before the page is hidden', function (done) {
            var self = this;
            self.paging.beforeHide('page1', function () {
                checkPageVisibility(self.$('#page1')).should.be.true();
                done();
            });
            self.paging.switch('page2', true);
        });
    });

    describe('before show', function () {
        it('should be called before the page is revealed', function (done) {
            var self = this;
            self.paging.beforeShow('page2', function () {
                checkPageVisibility(self.$('#page1')).should.be.true();
                done();
            });
            self.paging.switch('page2', true);
        });
    });

    describe('after hide', function () {
        it('should be called after the page is hidden', function (done) {
            var self = this;
            self.paging.afterHide('page1', function () {
                checkPageVisibility(self.$('#page2')).should.be.true();
                done();
            });
            self.paging.switch('page2', true);
        });
    });

    describe('after show', function () {
        it('should be called after the page is revealed', function (done) {
            var self = this;
            self.paging.afterShow('page2', function () {
                checkPageVisibility(self.$('#page2')).should.be.true();
                done();
            });
            self.paging.switch('page2', true);
        });
    });

    describe('multiple of the same type', function () {
        it('should all be called upon the transition', function (done) {
            var count = cbCounter(2, done);
            this.paging.beforeShow('page2', function () {
                count.next();
            });
            this.paging.beforeShow('page2', function () {
                count.next();
            });
            this.paging.switch('page2', true);
        });
    });

    describe('once', function () {
        it('should call the callback only once', function (done) {
            this.paging.beforeShow('page2', function () {
                done();
            }, true);
            this.paging.switch('page2', true);
            this.paging.switch('page1', true);
            this.paging.switch('page2', true);
        });
    });
});

describe('data remover', function () {
    it('should remove the callback before its called', function () {
        var remover = this.paging.beforeHide('page1', function () {
            throw new Error('Callback wasnt removed!');
        });
        remover();
        this.paging.switch('page2', true);
    });
});

describe('child instances', function () {
    it('should have their show callbacks called', function (done) {
        var count = cbCounter(2, done);

        // Setup child
        this.$('#page2').append('<div id="child1-pages"></div>');
        this.$('#child1-pages').append('<div id="child1-page1"></div>');
        var child = setupUnipage(this.$('#child1-pages').children());
        child.beforeShow('child1-page1', function () {
            count.next();
        });

        // Setup grandchild
        this.$('#child1-page1').append('<div id="child2-pages"></div>');
        this.$('#child2-pages').append('<div id="child2-page1"></div>');
        var grandchild = setupUnipage(this.$('#child2-pages').children());
        grandchild.afterShow('child2-page1', function () {
            count.next();
        });

        // Setup hierarchy
        child.child('child1-page1', grandchild);
        this.paging.child('page2', child);

        this.paging.switch('page2', true);
    });
});