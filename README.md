# Unipage
## WARINING: This project is no longer maintained and contains known security vulnerabilities.
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
inst.switch('page2');
```

We can add callbacks to all sorts of hooks...

```javascript
inst.beforeShow('page1', function callback () {
    // do stuff...
});
inst.switch('page1'); // fires the above callback...
```

## API
### Constructor
```javascript
var instance = setupUnipage($pages);
```
This function returns a new Unipage instance. `$pages` is a jQuery object which only contains the DIV elements representing each view. The first DIV will automatically be opened when the instance is created. Elements other than DIVs may be able to work, but are not tested.

### Switching Views
```javascript
instance.switch(id, immediately);
```
This function opens a new view, closing the currently opened view. `id` is the value of the ID attribute of the view to open. The currently open view is faded out using jQuery's fadeOut animation before the new view is displayed. `immediately` is an optional parameter that, when true, causes the switch to happen immediately without the fade out transition.

### Callback Hooks
```javascript
var remover = instance.beforeHide(id, callback, once);
var remover = instance.beforeShow(id, callback, once);
var remover = instance.afterHide(id, callback, once);
var remover = instance.afterShow(id, callback, once);
```
These functions add a callback to be called at the specified point in view transition. `id` is the ID attribute of the view to open. `callback` is the function to call. `once` is an optional parameter that, when true, causes the callback to be only called once, and then removed from the callback list. `beforeShow()` and `beforeHide()` are called before a view is opened or closed respectively, and `afterShow()` and `afterHide()` are called after a view is opened or closed respectively. These functions return a remover function. When the remover function is called, the given callback is removed from the list of callbacks.

### Child Instances
```javascript
var remover = instance.child(id, childInstance);
```
This function adds a child unipage instance to a specified view. When said view is opened, the opened page in the child instance also gets its before-show an after-show callbacks fired. This is applied recurssive down to the children of the open page of the child. This functionality is useful if you have views within a view. This function returns a remover function. When the remover function is called, the given child instance is removed from the list of children.
