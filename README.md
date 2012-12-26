<a href="/walmartlabs/blammo"><img src="https://raw.github.com/walmartlabs/blammo/master/images/from.png" align="right" /></a>
![hoek Logo](https://raw.github.com/walmartlabs/hoek/master/images/hoek.png)

General purpose node utilities

[![Build Status](https://secure.travis-ci.org/walmartlabs/hoek.png)](http://travis-ci.org/walmartlabs/hoek)

# Table of Contents

* [Introduction](#introduction "Introduction")
* [Array](#array "Array")
  *[clone](#clone "clone")
  *[merge](#merge "merge")
  *[applyToDefaults](#applyToDefaults "applyToDefaults")
  *[unique](#unique "unique")
  *[mapToObject](#mapToObject "mapToObject")
  *[intersect](#intersect "intersect")
  *[flatten](#flatten "flatten")
  *[removeKeys](#removeKeys "removeKeys")
* [Object](#object "Object")
  *[clone](#cloneObj "clone")
  *[inheritAsync](#inheritAsync "inheritAsync")
  *[rename](#rename "rename")
* [Timer](#timer "Timer")


# Introduction

The *Hoek* general purpose node utilities library is used to aid in a variety of manners. It comes with useful methods for Ararys (clone, merge, applyToDefaults), Objects (removeKeys, copy), Asserting and more. 

For example, to use Hoek to set configuration with default options:
```javascript
var Hoek = require('hoek');

var default = {url : "www.github.com", port : "8000", debug : true}

var config = Hoek.applyToDefaults(default, {port : "3000", admin : true});

// In this case, config would be { url: 'www.github.com', port: '3000', debug: true, admin: true }
```

Under each of the sections (such as Array), there are subsections which correspond to Hoek methods. Each subsection will explain how to use the corresponding method. In each js excerpt below, the var Hoek = require('hoek') is omitted for brevity.

## Array

Hoek provides several helpful methods for arrays.

### clone

This method is used to clone an object or an array. A *deep copy* is made.

```javascript

var nestedObj = {
        w: /^something$/ig,
        x: {
            a: [1, 2, 3],
            b: 123456,
            c: new Date()
        },
        y: 'y',
        z: new Date()
    };

var copy = Hoek.clone(nestedObj);

copy.x.b = 100;

console.log(copy.y)        // results in 'y'
console.log(nestedObj.x.b) // results in 123456
console.log(copy.x.b)      // results in 100
```






