(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AnimationInfo = (function () {
	function AnimationInfo(animationInfo) {
		_classCallCheck(this, AnimationInfo);

		// this.source = animationInfo.source;
		this.rotation = animationInfo.rotation;
	}

	_createClass(AnimationInfo, [{
		key: "getInterpolatedLocalRotation",
		value: function getInterpolatedLocalRotation(frameId) {
			return this.rotation[frameId];
		}
	}, {
		key: "getInterpolatedLocalPosition",
		value: function getInterpolatedLocalPosition(frameId) {
			return this.center;
		}
	}]);

	return AnimationInfo;
})();

module.exports = AnimationInfo;

},{}],2:[function(require,module,exports){
'use strict';

var Body = require('./body');

var appConfig = window.appConfig;
var ctx = document.getElementById('manikin').getContext('2d');

var manikin = new Body(appConfig.bodyName, [300, 300]);
manikin.loadAnimation(appConfig.animation);
manikin.calculateFrames();

ctx.beginPath();
for (var i = 200; i <= 400; i += 10) {
	ctx.beginPath();
	ctx.moveTo(200, i);
	ctx.lineTo(400, i);
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(i, 200);
	ctx.lineTo(i, 400);
	ctx.stroke();
}

manikin.renderFrame(0, ctx);

// manikin.forEachPart((part, name) => {
// 	console.log(`Part '${name}'`, part, part.getFrameInfo());
// });

// let calculatedFrames = manikin.getCalculatedFrames();
// let expectedCalculatedFrames = {
// 	'root': {
// 		0: {
// 			'rotation': 0
// 		}
// 	},
// 	'hips': {
// 		0: {
// 			'rotation': 20
// 		}
// 	},
// 	'torso': {
// 		0: {
// 			'rotation': 20
// 		}
// 	},	
// 	'thigh-left': {
// 		0: {
// 			'rotation': -5
// 		}
// 	},
// 	'arm-left': {
// 		0: {
// 			'rotation': 55
// 		}
// 	},
// 	'forearm-left': {
// 		0: {
// 			'rotation': 100
// 		}
// 	},
// };

// for (let partName in expectedCalculatedFrames) {
// 	let got = calculatedFrames[partName][0];
// 	let expected = expectedCalculatedFrames[partName][0];

// 	if (got.position[0] != expected.position[0] || got.position[1] != expected.position[1]) {
// 		console.error(`Position for ${partName} does is incorrect.`, 'Got:', got.position, 'expected:', expected.position);
// 	}
// 	if (got.rotation != expected.rotation) {
// 		console.error(`Rotation for ${partName} does is incorrect.`, 'Got:', got.rotation, 'expected:', expected.rotation);
// 	}
// }
// console.log('Done testing');

},{"./body":3}],3:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var BodyPart = require('./bodypart');
var Queue = require('./queue');
var Stack = require('./stack');

var Body = (function () {
	function Body(name, absolutePosition) {
		_classCallCheck(this, Body);

		this.name = name;
		this.absolutePosition = absolutePosition;

		// TODO: create a frame information object to pass around

		this.root = new BodyPart('root', [0, 0], [0, 0], [0, 0], '#000000');
		this.spritesheet = null;
		this.duration = null;
		this.looping = null;
		this.createParts();
	}

	_createClass(Body, [{
		key: 'createParts',
		value: function createParts() {
			var hips = new BodyPart('hips', [20, 20], [0, 0], [0, 0], '#ff0000');
			this.root.addChild(hips);

			var torso = new BodyPart('torso', [20, 60], [0, -60], [0, 0], '#00ff00');
			hips.addChild(torso);

			// let neck = new BodyPart('neck');
			// torso.addChild(neck);

			// let head = new BodyPart('head');
			// neck.addChild(head);

			var leftArm = new BodyPart('arm-left', [10, 35], [5, 0], [0, 0], '#0000ff');
			torso.addChild(leftArm);

			var leftForeArm = new BodyPart('forearm-left', [10, 35], [0, 35], [0, 0], '#ffff00');
			leftArm.addChild(leftForeArm);

			// let leftHand = new BodyPart('hand-left');
			// leftForeArm.addChild(leftHand);

			// let rightArm = new BodyPart('arm-right');
			// torso.addChild(rightArm);

			// let rightForeArm = new BodyPart('forearm-right');
			// rightArm.addChild(rightForeArm);

			// let rightHand = new BodyPart('hand-right');
			// rightForeArm.addChild(rightHand);

			var leftThigh = new BodyPart('thigh-left', [20, 50], [0, 20], [0, 0], '#ff00ff');
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
		value: function forEachPart(fn, beforeLoopOverChildrenFn, afterLoopOverChildrenFn) {
			this.forEachPartDFS(fn, beforeLoopOverChildrenFn, afterLoopOverChildrenFn);
		}
	}, {
		key: 'forEachPartDFS',
		value: function forEachPartDFS(fn, beforeLoopOverChildrenFn, afterLoopOverChildrenFn) {
			this._forEachPart(fn, new Stack(), beforeLoopOverChildrenFn, afterLoopOverChildrenFn);
		}
	}, {
		key: 'forEachPartBFS',
		value: function forEachPartBFS(fn, beforeLoopOverChildrenFn, afterLoopOverChildrenFn) {
			this._forEachPart(fn, new Queue(), beforeLoopOverChildrenFn, afterLoopOverChildrenFn);
		}
	}, {
		key: '_forEachPart',
		value: function _forEachPart(fn, storage, beforeLoopOverChildrenFn, afterLoopOverChildrenFn) {
			var explored = [];
			storage.flush();
			storage.push(this.root);
			fn(this.root, this.root.getName());
			var currentPart;

			while ((currentPart = storage.pop()) !== undefined) {
				if (beforeLoopOverChildrenFn) {
					beforeLoopOverChildrenFn(currentPart);
				}

				var currentName = currentPart.getName();
				var children = currentPart.getChildren();

				for (var _name in children) {
					var child = children[_name];
					if (!explored[_name]) {
						explored[_name] = true;
						fn(child, _name);
						storage.push(child);
					}
				}

				if (afterLoopOverChildrenFn) {
					afterLoopOverChildrenFn(currentPart);
				}
			}
			storage.flush();
		}
	}, {
		key: 'loadAnimation',
		value: function loadAnimation(animObject) {
			var _this = this;

			this.spritesheet = animObject.spritesheet;
			this.duration = animObject.duration;
			this.looping = animObject.looping;

			this.forEachPart(function (part, name) {
				if (!animObject.frames[name]) {
					//throw new Error(`No frame info for body part ${name} in animation object:`, animObject);
					return;
				}
				part.loadAnimationInfo(_this.duration, animObject.frames[name]);
			});
		}
	}, {
		key: 'calculateFrames',
		value: function calculateFrames() {
			this.forEachPart(function (part) {
				part.calculateFrames();
			});
		}
	}, {
		key: 'getCalculatedFrames',
		value: function getCalculatedFrames() {
			var calculatedFrames = {};
			this.forEachPart(function (part, name) {
				calculatedFrames[name] = part.getCalculatedFrames();
			});
			return calculatedFrames;
		}
	}, {
		key: 'renderFrame',
		value: function renderFrame(frameId, ctx) {
			ctx.save();
			ctx.translate(this.absolutePosition[0], this.absolutePosition[1]);

			var beforeFn = function beforeFn(part) {
				var frameInfo = part.getCalculatedFrames()[frameId];
				ctx.translate(part.centerOffset[0], part.centerOffset[1]);
				ctx.rotate(Math.PI / 180 * frameInfo.rotation);
				ctx.save();
			};

			var afterFn = function afterFn(part) {
				ctx.restore();
			};

			this.forEachPart(function (part, name) {
				var frameInfo = part.getCalculatedFrames()[frameId];
				ctx.save();
				ctx.fillStyle = part.color;
				ctx.fillRect(frameInfo.absolutePosition[0], frameInfo.absolutePosition[1], part.size[0], part.size[1]);
				ctx.restore();
			}, beforeFn, afterFn);

			ctx.restore();
		}
	}]);

	return Body;
})();

module.exports = Body;

},{"./bodypart":4,"./queue":5,"./stack":6}],4:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var AnimationInfo = require('./animationInfo');

var BodyPart = (function () {
	function BodyPart(name, size, relativePosition, centerOffset, color) {
		_classCallCheck(this, BodyPart);

		this.name = name;
		// Dimensions of the body part.
		this.size = size;

		// Vector going from parent to this part.
		this.relativePosition = relativePosition;

		// Offset to allow parts to rotate around the joints.
		this.centerOffset = centerOffset;

		this.color = color;

		this.parent = null;
		this.children = {};

		this.animationInfo = null;
		this.calculatedFrames = {};
		this.duration = 0;
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
		key: 'getAnimationInfo',
		value: function getAnimationInfo() {
			return this.animationInfo;
		}
	}, {
		key: 'loadAnimationInfo',
		value: function loadAnimationInfo(duration, animationInfo) {
			this.duration = duration;
			this.animationInfo = new AnimationInfo(animationInfo);
		}
	}, {
		key: 'getCalculatedFrames',
		value: function getCalculatedFrames() {
			return this.calculatedFrames;
		}
	}, {
		key: 'calculateFrames',
		value: function calculateFrames() {
			for (var f = 0; f < this.duration; f++) {
				var rotation = undefined;
				var absolutePosition = undefined;

				var localRotation = this.animationInfo.getInterpolatedLocalRotation(f);
				var relativePosition = this.relativePosition;

				var parentPart = this.getParent();
				if (parentPart) {
					var parentCalculatedFrames = parentPart.getCalculatedFrames();
					rotation = localRotation + parentCalculatedFrames[f].rotation;
					var angleRad = rotation * Math.PI / 180;

					// TODO: implement real calculations here.
					var parentPosition = parentCalculatedFrames[f].absolutePosition;
					// let newX = Math.cos(angleRad) * (relativePosition[0] - parentPosition[0]) - Math.sin(angleRad) * (relativePosition[1] - parentPosition[1]) + parentPosition[0];
					// let newY = Math.sin(angleRad) * (relativePosition[0] - parentPosition[0]) + Math.cos(angleRad) * (relativePosition[1] - parentPosition[1]) + parentPosition[1];
					var newX = relativePosition[0] + parentPosition[0];
					var newY = relativePosition[1] + parentPosition[1];
					absolutePosition = [newX | 0, newY | 0];
				} else {
					rotation = localRotation;
					absolutePosition = relativePosition;
				}

				this.calculatedFrames[f] = {
					'absolutePosition': absolutePosition,
					'rotation': rotation
				};
			}
		}
	}, {
		key: 'getDrawInfoForFrame',
		value: function getDrawInfoForFrame(frameId) {
			return {
				'absolutePosition': this.calculatedFrames.absolutePosition[frameId],
				'rotation': this.calculatedFrames.rotation[frameId]
			};
		}
	}]);

	return BodyPart;
})();

module.exports = BodyPart;

},{"./animationInfo":1}],5:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Queue = (function () {
	function Queue(onpop, onpush) {
		_classCallCheck(this, Queue);

		this.arr = [];
		this.onpop = onpop;
		this.onpush = onpush;
	}

	_createClass(Queue, [{
		key: "push",
		value: function push(node) {
			this.arr.push(node);
			if (this.onpush) {
				this.onpush(node);
			}
		}
	}, {
		key: "pop",
		value: function pop() {
			var node = this.arr.shift();
			if (this.onpop) {
				this.onpop();
			}
			return node;
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

},{}],6:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Stack = (function () {
	function Stack(onpop, onpush) {
		_classCallCheck(this, Stack);

		this.arr = [];
		this.onpop = onpop;
		this.onpush = onpush;
	}

	_createClass(Stack, [{
		key: "push",
		value: function push(node) {
			this.arr.push(node);
			if (this.onpush) {
				this.onpush(node);
			}
		}
	}, {
		key: "pop",
		value: function pop() {
			var node = this.arr.pop();
			if (this.onpop) {
				this.onpop(node);
			}
			return node;
		}
	}, {
		key: "flush",
		value: function flush() {
			this.arr.length = 0;
		}
	}]);

	return Stack;
})();

module.exports = Stack;

},{}]},{},[2])

//# sourceMappingURL=app.js.map
