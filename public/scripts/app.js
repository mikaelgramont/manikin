(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var Body = require('./body');

var appConfig = window.appConfig;

var manikin = new Body(appConfig.bodyName);
manikin.loadAnimation(appConfig.animation);

manikin.forEachPart(function (part, name) {
	console.log('Part \'' + name + '\'', part, part.getFrameInfo());
});

var frameInfo = manikin.getDrawInfoForFrame(0);
var expectedFrameInfo = {
	'root': {
		'position': [3, 5],
		'rotation': 0
	},
	'hips': {
		'position': [0, 0],
		'rotation': 20
	},
	'torso': {
		'position': [0, 0],
		'rotation': 20
	},
	'thigh-left': {
		'position': [0, 0],
		'rotation': -5
	},
	'arm-left': {
		'position': [0, 0],
		'rotation': 35
	},
	'arm-left': {
		'position': [0, 0],
		'rotation': 80
	}
};

for (var partName in expectedFrameInfo) {
	var got = frameInfo[partName];
	var expected = expectedFrameInfo[partName];
	if (got.position[0] != expected.position[0] || got.position[1] != expected.position[1]) {
		console.error('Position for ' + partName + ' does is incorrect.', 'Got:', got.position, 'expected:', expected.position);
	}
	if (got.rotation != expected.rotation) {
		console.error('Rotation for ' + partName + ' does is incorrect.', 'Got:', got.rotation, 'expected:', expected.rotation);
	}
}
console.log('Done testing');

},{"./body":2}],2:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var BodyPart = require('./bodypart');
var Queue = require('./queue');

var Body = (function () {
	function Body(name, queue) {
		_classCallCheck(this, Body);

		this.name = name;
		this.queue = new Queue();

		// TODO: create a frame information object to pass around

		this.root = new BodyPart('root');
		this.spritesheet = null;
		this.duration = null;
		this.looping = null;
		this.createParts();
	}

	_createClass(Body, [{
		key: 'createParts',
		value: function createParts() {
			var hips = new BodyPart('hips');
			this.root.addChild(hips);

			var torso = new BodyPart('torso');
			hips.addChild(torso);

			// let neck = new BodyPart('neck');
			// torso.addChild(neck);

			// let head = new BodyPart('head');
			// neck.addChild(head);

			var leftArm = new BodyPart('arm-left');
			torso.addChild(leftArm);

			var leftForeArm = new BodyPart('forearm-left');
			leftArm.addChild(leftForeArm);

			// let leftHand = new BodyPart('hand-left');
			// leftForeArm.addChild(leftHand);

			// let rightArm = new BodyPart('arm-right');
			// torso.addChild(rightArm);

			// let rightForeArm = new BodyPart('forearm-right');
			// rightArm.addChild(rightForeArm);

			// let rightHand = new BodyPart('hand-right');
			// rightForeArm.addChild(rightHand);

			var leftThigh = new BodyPart('thigh-left');
			hips.addChild(leftThigh);

			// let leftLeg = new BodyPart('leg-left');
			// leftThigh.addChild(leftLeg);

			// let leftFoot = new BodyPart('foot-left');
			// leftLeg.addChild(leftFoot);

			// let rightThigh = new BodyPart('thigh-right');
			// hips.addChild(rightThigh);

			// let rightLeg = new BodyPart('leg-right');
			// leftThigh.addChild(rightLeg);

			// let rightFoot = new BodyPart('foot-right');
			// rightLeg.addChild(rightFoot);
		}
	}, {
		key: 'forEachPart',
		value: function forEachPart(fn) {
			// TODO: build a queue of body parts, and run fn on them.
			var explored = [];
			this.queue.flush();
			this.queue.push(this.root);
			fn(this.root, this.root.getName());
			var currentPart;

			while ((currentPart = this.queue.pop()) !== undefined) {
				var currentName = currentPart.getName();
				var children = currentPart.getChildren();

				for (var _name in children) {
					var child = children[_name];
					if (!explored[_name]) {
						explored[_name] = true;
						fn(child, _name);
						this.queue.push(child);
					}
				}
			}
			this.queue.flush();
		}
	}, {
		key: 'loadAnimation',
		value: function loadAnimation(animObject) {
			this.spritesheet = animObject.spritesheet;
			this.duration = animObject.duration;
			this.looping = animObject.looping;
			this.forEachPart(function (part, name) {
				if (!animObject.frames[name]) {
					//throw new Error(`No frame info for body part ${name} in animation object:`, animObject);
					return;
				}

				part.loadFrameInfo(animObject.frames[name]);
			});
		}
	}, {
		key: 'getDrawInfoForFrame',
		value: function getDrawInfoForFrame(frameId) {
			var calculated = {};
			this.forEachPart(function (part, name) {
				calculated[name] = part.getDrawInfoForFrame(frameId);
			});
			return calculated;
		}
	}]);

	return Body;
})();

module.exports = Body;

},{"./bodypart":3,"./queue":5}],3:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var FrameInfo = require('./frameinfo');

var BodyPart = (function () {
	function BodyPart(name) {
		_classCallCheck(this, BodyPart);

		this.parent = null;
		this.name = name;
		this.children = {};
		this.frameInfo = null;
	}

	_createClass(BodyPart, [{
		key: 'setParent',
		value: function setParent(parent) {
			this.parent = parent;
		}

		// Look into ES6 setters/getters
	}, {
		key: 'getParent',
		value: function getParent() {
			return this.parent;
		}
	}, {
		key: 'getName',
		value: function getName() {
			return this.name;
		}
	}, {
		key: 'getChildren',
		value: function getChildren() {
			return this.children;
		}
	}, {
		key: 'getChildByName',
		value: function getChildByName(name) {
			return this.children[name];
		}
	}, {
		key: 'addChild',
		value: function addChild(child) {
			var childName = child.getName();
			child.setParent(this);
			if (this.children[childName]) {
				var existing = this.children[childName];
				var parentChain = existing.getParentChainAsString();
				throw new Error('Cannot add child: \'' + this.name + '\' already has a child by the name of \'' + childName + '\': ' + parentChain);
			}
			this.children[childName] = child;
		}
	}, {
		key: 'getParentChainAsString',
		value: function getParentChainAsString() {
			var stringParts = [];
			var currentPart = this;
			do {
				stringParts.unshift(currentPart.getName());
			} while (currentPart = currentPart.getParent());

			return stringParts.join(' -> ');
		}
	}, {
		key: 'loadFrameInfo',
		value: function loadFrameInfo(info) {
			this.frameInfo = new FrameInfo(info);
		}
	}, {
		key: 'getFrameInfo',
		value: function getFrameInfo() {
			return this.frameInfo;
		}
	}, {
		key: 'getDrawInfoForFrame',
		value: function getDrawInfoForFrame(frameId) {
			return {
				'position': [0, 0],
				'rotation': 0
			};
		}
	}]);

	return BodyPart;
})();

module.exports = BodyPart;

},{"./frameinfo":4}],4:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FrameInfo = function FrameInfo(info) {
	_classCallCheck(this, FrameInfo);

	// this.source = info.source;
	// this.center = info.center;
	this.rotation = info.rotation;
};

module.exports = FrameInfo;

},{}],5:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Queue = (function () {
	function Queue() {
		_classCallCheck(this, Queue);

		this.arr = [];
	}

	_createClass(Queue, [{
		key: "push",
		value: function push(node) {
			this.arr.push(node);
		}
	}, {
		key: "pop",
		value: function pop() {
			return this.arr.shift();
		}
	}, {
		key: "flush",
		value: function flush() {
			this.arr.length = 0;
		}
	}]);

	return Queue;
})();

module.exports = Queue;

},{}]},{},[1])

//# sourceMappingURL=app.js.map
