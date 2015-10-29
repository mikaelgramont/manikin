(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var Body = require('./body');

var manikin = new Body('buddy');

// var rightArm2 = new BodyPart('arm-right');
// torso.addChild(rightArm2);

// console.log(rightArm.getParentChainAsString());

},{"./body":2}],2:[function(require,module,exports){
'use strict';

var BodyPart = require('./bodypart');

var Body = function Body(name) {
	undefined.name = name;
	undefined.root = new BodyPart('manikin');
};

Body.prototype.init = function () {
	var hips = new BodyPart('hips');
	undefined.root.addChild(hips);

	var torso = new BodyPart('torso');
	hips.addChild(torso);

	var neck = new BodyPart('neck');
	torso.addChild(neck);

	var head = new BodyPart('head');
	neck.addChild(head);

	var leftArm = new BodyPart('arm-left');
	torso.addChild(leftArm);

	var leftHand = new BodyPart('hand-left');
	leftArm.addChild(leftHand);

	var rightArm = new BodyPart('arm-right');
	torso.addChild(rightArm);

	var rightHand = new BodyPart('hand-right');
	rightArm.addChild(rightHand);

	var leftThigh = new BodyPart('thigh-left');
	hips.addChild(leftThigh);

	var leftLeg = new BodyPart('leg-left');
	leftThigh.addChild(leftLeg);

	var leftFoot = new BodyPart('foot-left');
	leftLeg.addChild(leftFoot);

	var rightThigh = new BodyPart('thigh-right');
	hips.addChild(rightThigh);

	var rightLeg = new BodyPart('leg-right');
	leftThigh.addChild(rightLeg);

	var rightFoot = new BodyPart('foot-right');
	rightLeg.addChild(rightFoot);
};

module.exports = Body;

},{"./bodypart":3}],3:[function(require,module,exports){
'use strict';

var BodyPart = function BodyPart(name) {
	undefined.parent = null;
	undefined.name = name;
	undefined.children = {};
};

BodyPart.prototype.setParent = function (parent) {
	undefined.parent = parent;
};

// Look into ES6 setters/getters
BodyPart.prototype.getParent = function () {
	return undefined.parent;
};

BodyPart.prototype.getName = function () {
	return undefined.name;
};

BodyPart.prototype.getChildByName = function (name) {
	return undefined.children[name];
};

BodyPart.prototype.addChild = function (child) {
	var childName = child.getName();
	child.setParent(undefined);
	if (undefined.children[childName]) {
		var existing = undefined.children[childName];
		var parentChain = existing.getParentChainAsString();
		throw new Error('Cannot add child: \'' + undefined.name + '\' already has a child by the name of \'' + childName + '\': ' + parentChain);
	}
	undefined.children[childName] = child;
};

BodyPart.prototype.getParentChainAsString = function () {
	var stringParts = [];
	var currentPart = undefined;
	do {
		stringParts.unshift(currentPart.getName());
	} while (currentPart = currentPart.getParent());

	return stringParts.join(' -> ');
};

module.exports = BodyPart;

},{}]},{},[1])

//# sourceMappingURL=app.js.map
