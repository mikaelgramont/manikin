(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var BodyPart = require('./bodypart');

var root = new BodyPart('manikin');
var torso = new BodyPart('torso');
root.addChild(torso);

var leftArm = new BodyPart('arm-left');
var rightArm = new BodyPart('arm-right');
torso.addChild(leftArm);
torso.addChild(rightArm);

var rightArm2 = new BodyPart('arm-right');
torso.addChild(rightArm2);

console.log(rightArm.getParentChainAsString());

},{"./bodypart":2}],2:[function(require,module,exports){
'use strict';

var BodyPart = function BodyPart(name) {
	this.parent = null;
	this.name = name;
	this.children = {};
};

BodyPart.prototype.setParent = function (parent) {
	this.parent = parent;
};

// Look into ES6 setters/getters
BodyPart.prototype.getParent = function () {
	return this.parent;
};

BodyPart.prototype.getName = function () {
	return this.name;
};

BodyPart.prototype.getChildByName = function (name) {
	return this.children[name];
};

BodyPart.prototype.addChild = function (child) {
	var childName = child.getName();
	child.setParent(this);
	if (this.children[childName]) {
		var existing = this.children[childName];
		var parentChain = existing.getParentChainAsString();
		throw new Error('\'' + this.name + '\' already has a child by the name of \'' + childName + '\': ' + parentChain);
	}
	this.children[childName] = child;
};

BodyPart.prototype.getParentChainAsString = function () {
	var stringParts = [];
	var currentPart = this;
	do {
		stringParts.unshift(currentPart.getName());
	} while (currentPart = currentPart.getParent());

	return stringParts.join(' -> ');
};

module.exports = BodyPart;

},{}]},{},[1])

//# sourceMappingURL=app.js.map
