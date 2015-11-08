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
var ProxyDebugger = require('./proxydebugger');

var Logger = function Logger() {
	this.enabled = true;
};
Logger.prototype.log = function () {
	if (this.enabled) {
		console.log.apply(console, arguments);
	}
};
Logger.prototype.group = function () {
	if (this.enabled) {
		console.group.apply(console, arguments);
	}
};
Logger.prototype.groupCollapsed = function () {
	if (this.enabled) {
		console.groupCollapsed.apply(console, arguments);
	}
};
Logger.prototype.groupEnd = function () {
	if (this.enabled) {
		console.groupEnd.apply(console, arguments);
	}
};
var logger = new Logger();
var manikin = new Body(window.appConfig.bodyName, [300, 300], logger);

var ctx = document.getElementById('manikin').getContext('2d');
ctx = ProxyDebugger.instrumentContext(ctx, 'ctx', logger, {
	'rotate': function rotate(argsIn) {
		return [argsIn[0] * 180 / Math.PI];
	}
});

function render() {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	logger.groupCollapsed('Drawing grid');
	for (var i = 200; i <= 400; i += 10) {
		var strokeStyle = '#000000';
		if (i == 300) {
			strokeStyle = '#ff0000';
		}
		ctx.strokeStyle = strokeStyle;
		ctx.beginPath();
		ctx.moveTo(200, i);
		ctx.lineTo(400, i);
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(i, 200);
		ctx.lineTo(i, 400);
		ctx.stroke();
	}
	logger.groupEnd('Drawing grid');

	manikin.loadAnimation(window.appConfig.animation);
	manikin.calculateFrames();
	manikin.renderFrame(0, ctx);
}

window.logger = logger;
window.render = render;
window.manikin = manikin;

function observeNested(obj, callback) {
	for (var prop in obj) {
		if (!obj.hasOwnProperty(prop)) {
			continue;
		}
		if (obj[prop] === null) {
			continue;
		}
		if (typeof obj[prop] === 'object') {
			Object.observe(obj[prop], function (changes) {
				callback();
			});
			observeNested(obj[prop], callback);
		}
	}
}

observeNested(window.appConfig, render);

},{"./body":3,"./proxydebugger":5}],3:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var BodyPart = require('./bodypart');
var Queue = require('./queue');
var Stack = require('./stack');

var Body = (function () {
	function Body(name, absolutePosition, logger) {
		_classCallCheck(this, Body);

		this.name = name;
		this.absolutePosition = absolutePosition;
		this.logger = logger;

		this.root = new BodyPart('root', [-10, 0], [0, 0], null, this.logger);
		this.spritesheet = null;
		this.duration = null;
		this.looping = null;
		this.createParts();
	}

	_createClass(Body, [{
		key: 'createParts',
		value: function createParts() {
			// hips: 22x15
			var hips = new BodyPart('hips', [0, 0], [11, 7], './images/hips.png', this.logger);
			this.root.addChild(hips);

			// torso: 22x39
			// [0, -39]: go up to the top left corner relative to the parent.
			// Then move locally to the bottom center.
			var torso = new BodyPart('torso', [0, -39], [11, 39], './images/torso.png', this.logger);
			hips.addChild(torso);

			// head: 22x29
			var head = new BodyPart('head', [0, -29], [11, 28], './images/head.png', this.logger);
			torso.addChild(head);

			// left arm: 16x32
			var leftArm = new BodyPart('arm-left', [3, 0], [8, 3], './images/arm-left.png', this.logger);
			torso.addChild(leftArm);

			// left forearm: 14x22
			var leftForeArm = new BodyPart('forearm-left', [1, 30], [7, 2], './images/forearm-left.png', this.logger);
			leftArm.addChild(leftForeArm);

			// left hand: 10x14
			var leftHand = new BodyPart('hand-left', [2, 21], [5, 0], './images/hand-left.png', this.logger);
			leftForeArm.addChild(leftHand);

			// right arm: 16x32
			var rightArm = new BodyPart('arm-right', [3, 0], [8, 3], './images/arm-right.png', this.logger);
			torso.addChild(rightArm);

			// left forearm: 14x22
			var rightForeArm = new BodyPart('forearm-right', [1, 30], [7, 2], './images/forearm-right.png', this.logger);
			rightArm.addChild(rightForeArm);

			// left hand: 10x14
			var rightHand = new BodyPart('hand-right', [2, 21], [5, 0], './images/hand-right.png', this.logger);
			rightForeArm.addChild(rightHand);

			// left thigh: 14x22
			var leftThigh = new BodyPart('thigh-left', [3, 13], [2, 2], './images/thigh-left.png', this.logger);
			hips.addChild(leftThigh);

			// left forearm: 14x22
			var leftLeg = new BodyPart('leg-left', [1, 30], [7, 2], './images/leg-left.png', this.logger);
			leftThigh.addChild(leftLeg);

			// left foot: 27x10
			var leftFoot = new BodyPart('foot-left', [1, 21], [5, 0], './images/foot-left.png', this.logger);
			leftLeg.addChild(leftFoot);

			// right thigh: 14x22
			var rightThigh = new BodyPart('thigh-right', [3, 13], [2, 2], './images/thigh-right.png', this.logger);
			hips.addChild(rightThigh);

			// right forearm: 14x22
			var rightLeg = new BodyPart('leg-right', [1, 30], [7, 2], './images/leg-right.png', this.logger);
			rightThigh.addChild(rightLeg);

			// right foot: 27x10
			var rightFoot = new BodyPart('foot-right', [1, 21], [5, 0], './images/foot-right.png', this.logger);
			rightLeg.addChild(rightFoot);
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
			ctx = this.instrumentContext(ctx);
		}
	}, {
		key: 'renderFrame',
		value: function renderFrame(frameId, ctx) {
			var _this2 = this;

			ctx.save();
			ctx.translate(this.absolutePosition[0], this.absolutePosition[1]);

			this.forEachPart(function (part, name) {
				_this2.logger.groupCollapsed('rendering ' + name);
				ctx.save();
				part.positionContextForFrame(frameId, ctx);
				part.drawSpriteForFrame(frameId, ctx);
				ctx.restore();
				_this2.logger.groupEnd();
			});

			ctx.restore();
		}
	}]);

	return Body;
})();

module.exports = Body;

},{"./bodypart":4,"./queue":6,"./stack":7}],4:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var AnimationInfo = require('./animationInfo');

var BodyPart = (function () {
	function BodyPart(name, relativePosition, centerOffset, sprite, logger) {
		var _this = this;

		_classCallCheck(this, BodyPart);

		this.name = name;

		// Vector going from parent to this part.
		this.relativePosition = relativePosition;

		// Offset to allow parts to rotate around the joints.
		this.centerOffset = centerOffset;

		if (sprite) {
			var img = document.createElement('img');
			img.src = sprite;
			img.addEventListener('load', function (e) {
				_this.logger.log('image loaded', e);
			});
			document.getElementById('images').appendChild(img);
			this.sprite = img;
		} else {
			this.sprite = null;
		}

		this.logger = logger;

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
		key: 'getParentChain',
		value: function getParentChain() {
			var chain = [];
			var currentPart = this;
			while (currentPart = currentPart.getParent()) {
				chain.unshift(currentPart);
			}

			return chain;
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

				var localRotation = this.animationInfo.getInterpolatedLocalRotation(f);
				var relativePosition = this.relativePosition;

				this.calculatedFrames[f] = {
					'position': relativePosition,
					'rotation': localRotation
				};
			}
		}
	}, {
		key: 'getDrawInfoForFrame',
		value: function getDrawInfoForFrame(frameId) {
			return {
				'position': this.calculatedFrames.position[frameId],
				'rotation': this.calculatedFrames.rotation[frameId]
			};
		}

		/*
   * Starts from the root element, and positions the context
   * so that (0, 0) coincides with the origin of the current part.
   */
	}, {
		key: 'positionContextForFrame',
		value: function positionContextForFrame(frameId, ctx) {
			var _this2 = this;

			var parentParts = this.getParentChain();
			parentParts.forEach(function (parentPart) {
				_this2.logger.groupCollapsed('positioning canvas according to ' + parentPart.getName());
				var frameInfo = parentPart.getCalculatedFrames()[frameId];
				ctx.translate(parentPart.relativePosition[0], parentPart.relativePosition[1]);
				ctx.translate(parentPart.centerOffset[0], parentPart.centerOffset[1]);
				ctx.rotate(Math.PI / 180 * frameInfo.rotation);
				ctx.translate(-parentPart.centerOffset[0], -parentPart.centerOffset[1]);
				_this2.logger.groupEnd();
			});
		}

		/*
   * Draws the sprite for this part relative to the current
   * context origin.
   */
	}, {
		key: 'drawSpriteForFrame',
		value: function drawSpriteForFrame(frameId, ctx) {
			if (!this.sprite) {
				return;
			}
			var frameInfo = this.getCalculatedFrames()[frameId];
			ctx.translate(this.relativePosition[0], this.relativePosition[1]);
			ctx.translate(this.centerOffset[0], this.centerOffset[1]);
			ctx.rotate(Math.PI / 180 * frameInfo.rotation);
			ctx.translate(-this.centerOffset[0], -this.centerOffset[1]);
			ctx.drawImage(this.sprite, 0, 0);
		}
	}]);

	return BodyPart;
})();

module.exports = BodyPart;

},{"./animationInfo":1}],5:[function(require,module,exports){
"use strict";

var ProxyDebugger = {
	instrumentContext: function instrumentContext(original, logName, logger, modifiers) {
		// The object that all calls will go through
		var proxyObj = {};

		var _loop = function (propName) {
			if (original[propName] instanceof Function) {
				// Proxying methods.
				proxyObj[propName] = function () {
					for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
						args[_key] = arguments[_key];
					}

					var argsForLogging = args;
					if (propName in modifiers) {
						argsForLogging = modifiers[propName](args);
					}
					logger.log(logName + "." + propName, argsForLogging);
					original[propName].apply(original, args);
				};
			} else {
				// Setters and getters for proxy'ed properties.
				Object.defineProperty(proxyObj, propName, {
					set: function set(value) {
						original[propName] = value;
						logger.log(logName + "." + propName + " = " + value);
					},
					get: function get(name) {
						return original[propName];
					}
				});
			}
		};

		for (var propName in original) {
			_loop(propName);
		}
		return proxyObj;
	}
};

module.exports = ProxyDebugger;

},{}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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
