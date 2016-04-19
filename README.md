# Unipage
Unipage provides a way to switch between several views on a single webpage. I implemented this to provide menu functionality for a browser game, but it can be used for a wide variety of single-paged apps. Setup and usage is simple. Let's say we have some HTML like this...

```html
<div id="page1" class="page">
    <!-- some content... -->
</div>
<div id="page2" class="page">
    <!-- more content... -->
</div>
```

If we want to switch between displaying these two DIVs, we can setup a Unipage instances with them...

```javascript
var inst = setupUnipage($('.page'));
inst.switchToPage('page2');
```

We can add callbacks to all sorts of hooks...

```javascript
inst.addBeforeShowCallback('page1', function callback () {
    // do stuff... 
});
inst.switchToPage('page1'); // fires the above callback...
```

## API
Still working on this. The source code is well documented, and the API functions can be found towards the end of the file.