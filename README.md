<a href="/walmartlabs/blammo"><img src="https://raw.github.com/walmartlabs/blammo/master/images/from.png" align="right" /></a>
![hoek Logo](https://raw.github.com/walmartlabs/hoek/master/images/hoek.png)

General purpose node utilities

[![Build Status](https://secure.travis-ci.org/walmartlabs/hoek.png)](http://travis-ci.org/walmartlabs/hoek)

# Table of Contents

* [Introduction](#introduction "Introduction")
* [Array](#array "Array")
* [Object](#object "Object")
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