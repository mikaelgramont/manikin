(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var AnimationInfo = (function () {
	function AnimationInfo(animationInfo, duration, parentPart) {
		_classCallCheck(this, AnimationInfo);

		this.duration = duration;
		this.rotation = animationInfo.rotation;
		this.parentPart = parentPart;
	}

	_createClass(AnimationInfo, [{
		key: 'getInterpolatedLocalRotation',
		value: function getInterpolatedLocalRotation(frameId) {
			if (frameId < 0) {
				throw new Error("Negative frameId not allowed.");
			}

			if (typeof this.rotation[frameId] !== 'undefined') {
				return this.rotation[frameId];
			}

			// 1. Find the previous keyframe.
			var previousId = frameId;
			var previousKeyFrameValue = this.rotation[previousId];
			while (typeof previousKeyFrameValue == 'undefined' && previousId > 0) {
				previousId--;
				previousKeyFrameValue = this.rotation[previousId];
			}

			// 2. Find the next keyframe.
			var nextId = frameId + 1;
			var nextKeyFrameValue = this.rotation[nextId];
			while (typeof nextKeyFrameValue == 'undefined') {
				nextId++;

				if (nextId >= this.duration - 1) {
					nextId = 0;
					break;
				}
			}
			nextKeyFrameValue = this.rotation[nextId];

			// 3. Return the interpolated value.
			var ratio = undefined;
			if (nextId === 0) {
				ratio = (frameId - previousId) / (this.duration - previousId);
			} else {
				ratio = (frameId - previousId) / (nextId - previousId);
			}
			return previousKeyFrameValue + ratio * (nextKeyFrameValue - previousKeyFrameValue);
		}
	}]);

	return AnimationInfo;
})();

module.exports = AnimationInfo;

},{}],2:[function(require,module,exports){
'use strict';

var Body = require('./body');
var Logger = require('./logger');
var ProxyDebugger = require('./proxydebugger');

var logger = new Logger();
logger.enabled = false;
var manikin = new Body('default', 'default', [100, 100], logger);

var gridCtx = document.getElementById('grid').getContext('2d');
var ctx = document.getElementById('manikin').getContext('2d');
// ctx = ProxyDebugger.instrumentContext(ctx, 'ctx', logger, {
// 	'rotate': (argsIn) => {
// 		return [argsIn[0] * 180 / Math.PI]
// 	}
// });

function drawGrid(ctx) {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	logger.groupCollapsed('Drawing grid');
	for (var i = 0; i <= 200; i += 10) {
		var strokeStyle = '#000000';
		if (i == 100) {
			strokeStyle = '#ff0000';
		}
		ctx.strokeStyle = strokeStyle;
		ctx.beginPath();
		ctx.moveTo(0, i);
		ctx.lineTo(200, i);
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(i, 0);
		ctx.lineTo(i, 200);
		ctx.stroke();
	}
	logger.groupEnd('Drawing grid');
}

function render(frameId) {
	console.log('rendering ' + frameId);
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	manikin.renderFrame(frameId || 0, ctx);
}

window.go = function () {
	var i = 0;
	var fps = 1;
	function anim() {
		render(i % 40);
		i++;
		if (i <= 400) {
			handle = setTimeout(anim, 1 / fps * 1000);
		} else {
			clearTimeout(handle);
		}
	}
	var handle = setTimeout(anim, 1 / fps * 1000);
	window.handle = handle;
};

window.logger = logger;
window.render = render;
window.manikin = manikin;

drawGrid(gridCtx);

},{"./body":3,"./logger":5,"./proxydebugger":6}],3:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var BodyPart = require('./bodypart');
var Stack = require('./stack');

var ANIMATIONS_PATH = './animations';
var BODIES_PATH = './bodies';

var Body = (function () {
	function Body(bodyConfigFilename, animationConfigFilename, absolutePosition, logger) {
		_classCallCheck(this, Body);

		this.absolutePosition = absolutePosition;
		this.logger = logger;

		this.root = null;
		this.duration = null;
		this.looping = null;

		var promises = [];
		promises.push(this.jsonLoadPromiseFactory(BODIES_PATH + '/' + bodyConfigFilename + '.json', this.setBodyConfig));
		promises.push(this.jsonLoadPromiseFactory(ANIMATIONS_PATH + '/' + animationConfigFilename + '.json', this.setAnimationConfig));

		Promise.all(promises).then(this.onReady.bind(this));
	}

	_createClass(Body, [{
		key: 'onReady',
		value: function onReady() {
			this.createParts();
			this.loadAnimation();
			this.calculateFrames();
		}
	}, {
		key: 'setBodyConfig',
		value: function setBodyConfig(bodyConfig) {
			this.bodyConfig = bodyConfig;
			this.name = this.bodyConfig.name;
		}
	}, {
		key: 'setAnimationConfig',
		value: function setAnimationConfig(animationConfig) {
			this.animationConfig = animationConfig;
		}
	}, {
		key: 'jsonLoadPromiseFactory',
		value: function jsonLoadPromiseFactory(relativePath, onSuccess) {
			var _this = this;

			var p = new Promise((function (resolve, reject) {
				var req = new XMLHttpRequest();
				req.open('GET', relativePath);
				req.onload = (function () {
					if (req.status == 200) {
						onSuccess.bind(_this)(JSON.parse(req.response));
						resolve();
					} else {
						reject(Error(req.statusText));
					}
				}).bind(_this);
				req.onerror = (function () {
					reject();
				}).bind(_this);
				req.send();
			}).bind(this));
			return p;
		}
	}, {
		key: 'createParts',
		value: function createParts() {
			var parts = {};
			// Step 1: build all parts.
			for (var partName in this.bodyConfig.parts) {
				var partConfig = this.bodyConfig.parts[partName];
				parts[partName] = new BodyPart(partName, partConfig.relativePosition, partConfig.centerOffset, partConfig.sprite, partConfig.layer, this.logger);

				if (partName == 'root') {
					this.root = parts[partName];
				}
			}

			// Step 2: setup parent-child relationships.
			for (var partName in parts) {
				if (partName == 'root') {
					continue;
				}
				var partConfig = this.bodyConfig.parts[partName];
				var childPart = parts[partName];
				var parentPart = parts[partConfig.parentName];

				if (!parentPart) {
					throw new Error('Cannot find parent element by name ' + partConfig.parentName + ' for child ' + partName);
				}

				parentPart.addChild(childPart);
			}
		}
	}, {
		key: 'forEachPart',
		value: function forEachPart(fn, beforeLoopOverChildrenFn, afterLoopOverChildrenFn) {
			var explored = [];
			var storage = new Stack();
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
		value: function loadAnimation() {
			var _this2 = this;

			var animObject = this.animationConfig;
			this.duration = animObject.duration;
			this.looping = animObject.looping;

			this.forEachPart(function (part, name) {
				if (!animObject.frames[name]) {
					//throw new Error(`No frame info for body part ${name} in animation object:`, animObject);
					return;
				}
				part.loadAnimationInfo(_this2.duration, animObject.frames[name]);
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
			var _this3 = this;

			ctx.save();
			ctx.translate(this.absolutePosition[0], this.absolutePosition[1]);

			// Build a list of parts, ordered by layer.
			var parts = [];
			this.forEachPart(function (part, name) {
				parts.push(part);
			});

			parts.sort(function (a, b) {
				return a.layer - b.layer;
			});

			parts.forEach(function (part) {
				var name = part.getName();
				_this3.logger.groupCollapsed('rendering ' + name);
				ctx.save();
				part.positionContextForFrame(frameId, ctx);
				part.drawSpriteForFrame(frameId, ctx);
				ctx.restore();
				_this3.logger.groupEnd();
			});

			ctx.restore();
		}
	}]);

	return Body;
})();

module.exports = Body;

},{"./bodypart":4,"./stack":7}],4:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var AnimationInfo = require('./animationInfo');

var BodyPart = (function () {
	function BodyPart(name, relativePosition, centerOffset, sprite, layer, logger) {
		var _this = this;

		_classCallCheck(this, BodyPart);

		this.name = name;

		// Vector going from parent to this part.
		this.relativePosition = relativePosition;

		// Offset to allow parts to rotate around the joints.
		this.centerOffset = centerOffset;

		this.layer = layer;

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
			this.animationInfo = new AnimationInfo(animationInfo, duration, this);
		}
	}, {
		key: 'getCalculatedFrame',
		value: function getCalculatedFrame(frameId) {
			if (frameId >= this.duration) {
				throw new Error('Requested frameId (' + frameId + ') too high. Duration is ' + this.duration + '.');
			}
			return this.calculatedFrames[frameId];
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
			if (frameId >= this.duration) {
				throw new Error('Requested frameId (' + frameId + ') too high. Duration is ' + this.duration + '.');
			}
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
				var frameInfo = parentPart.getCalculatedFrame(frameId);
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
			var frameInfo = this.getCalculatedFrame(frameId);
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

module.exports = Logger;

},{}],6:[function(require,module,exports){
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
