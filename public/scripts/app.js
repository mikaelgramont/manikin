(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var AnimationInfo = (function () {
	function AnimationInfo(animationInfo, duration, parentPart) {
		_classCallCheck(this, AnimationInfo);

		this.duration = duration;
		this.rotation = animationInfo.rotation;
		this.position = animationInfo.position;
		this.parentPart = parentPart;
	}

	_createClass(AnimationInfo, [{
		key: 'getInterpolatedLocalPosition',
		value: function getInterpolatedLocalPosition(frameId) {
			return this.getInterpolatedLocalProperty_('position', frameId, [0, 0]);
		}
	}, {
		key: 'getInterpolatedLocalRotation',
		value: function getInterpolatedLocalRotation(frameId) {
			return this.getInterpolatedLocalProperty_('rotation', frameId, 0);
		}
	}, {
		key: 'getInterpolatedLocalProperty_',
		value: function getInterpolatedLocalProperty_(property, frameId, defaultValue) {
			if (frameId < 0) {
				throw new Error("Negative frameId not allowed.");
			}

			if (typeof this[property] === 'undefined') {
				// Allow animations to skip properties.
				return defaultValue;
			}

			if (typeof this[property][frameId] !== 'undefined') {
				return this[property][frameId];
			}

			// 1. Find the previous keyframe.
			var previousId = frameId;
			var previousKeyFrameValue = this[property][previousId];
			while (typeof previousKeyFrameValue == 'undefined' && previousId > 0) {
				previousId--;
				previousKeyFrameValue = this[property][previousId];
			}

			// 2. Find the next keyframe.
			var nextId = frameId + 1;
			var nextKeyFrameValue = this[property][nextId];
			while (typeof nextKeyFrameValue == 'undefined') {
				nextId++;

				if (nextId >= this.duration - 1) {
					nextId = 0;
					nextKeyFrameValue = this[property][nextId];
					break;
				}

				nextKeyFrameValue = this[property][nextId];
			}

			// 3. Return the interpolated value.
			var ratio = undefined;
			if (nextId === 0) {
				ratio = (frameId - previousId) / (this.duration - previousId);
			} else {
				ratio = (frameId - previousId) / (nextId - previousId);
			}
			if (Array.isArray(nextKeyFrameValue)) {
				return [previousKeyFrameValue[0] + ratio * (nextKeyFrameValue[0] - previousKeyFrameValue[0]), previousKeyFrameValue[1] + ratio * (nextKeyFrameValue[1] - previousKeyFrameValue[1])];
			} else {
				return previousKeyFrameValue + ratio * (nextKeyFrameValue - previousKeyFrameValue);
			}
		}
	}]);

	return AnimationInfo;
})();

module.exports = AnimationInfo;

},{}],2:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AnimationRenderer = (function () {
	function AnimationRenderer(duration, doLoop, renderFn) {
		_classCallCheck(this, AnimationRenderer);

		this.duration_ = duration;
		this.doLoop_ = doLoop;
		this.renderFn_ = renderFn;

		this.frameId_ = 0;
	}

	_createClass(AnimationRenderer, [{
		key: "nextFrame",
		value: function nextFrame() {
			if (this.frameId_ > this.duration_) {
				this.frameId_ = this.frameId_ % this.duration_;
			}
			this.renderFn_(this.frameId_);
			if (this.frameId_ < this.duration_ - 1) {
				this.frameId_ += 1;
			} else if (this.doLoop_) {
				this.frameId_ = 0;
			}
		}
	}, {
		key: "setFrameId",
		value: function setFrameId(frameId) {
			this.frameId_ = frameId;
		}
	}, {
		key: "setLoop",
		value: function setLoop(doLoop) {
			this.doLoop_ = doLoop;
		}
	}]);

	return AnimationRenderer;
})();

module.exports = AnimationRenderer;

},{}],3:[function(require,module,exports){
'use strict';

var AnimationRenderer = require('./animationrenderer');
var Body = require('./body');
var CompatibilityTester = require('./compatibilitytester');
var Grid = require('./grid');
var Logger = require('./logger');
var ProxyDebugger = require('./proxydebugger');
var Scheduler = require('./scheduler');
var Utils = require('./utils');

// Build a logger object.
var global = Utils.getGlobalObject();
var logger = new Logger(global);
logger.enabled = false;

// Set this to true and enable the logger to see all canvas calls.
var instrumentContext = false;

// Prepare grid.
Grid.drawGrid(document.getElementById('grid').getContext('2d'), logger);

var elements = {
	playBtn: document.getElementById('play-button'),
	stopBtn: document.getElementById('stop-button'),
	frameSlider: document.getElementById('frame-id'),
	fps: document.getElementById('fps'),
	loop: document.getElementById('loop'),
	currentFrame: document.getElementById('current-frame'),
	animationDump: document.getElementById('animation-dump')
};

// Possibly instrument the main context oject.
var ctx = document.getElementById('manikin').getContext('2d');
if (instrumentContext) {
	ctx = ProxyDebugger.instrumentContext(ctx, 'ctx', logger, {
		'rotate': function rotate(argsIn) {
			// Print angles in degrees.
			return [argsIn[0] * 180 / Math.PI];
		}
	});
}

var configs = global.manikinConfig;
var chosenBody = configs.bodies[0];
var bodyConfig = chosenBody.name;
var animConfig = chosenBody.compatibleAnimations[0];

var configOverrides = {};
window.location.search.substring(1).split("&").forEach(function (queryPart) {
	if (queryPart.indexOf('sprite') !== -1) {
		configOverrides.sprite = queryPart.split("=")[1];
	}
});

// TODO: load all these files with promises, and once we have them test them for compatibility.
var compatibilityTester = new CompatibilityTester(configs.bodies, configs.animations);
compatibilityTester.buildCompatibilityLists();

// Then setup some listeners to update the list of available animations when switching bodies.

// Build the body object.
var body = new Body(bodyConfig, animConfig, [100, 97], configOverrides, logger, function () {
	var duration = body.getAnimationDuration();
	elements.frameSlider.max = duration - 1;

	// Build the objects that run the show.
	var frameRenderFn = function frameRenderFn(frameId) {
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		body.renderFrame(frameId, ctx);
		elements.frameSlider.value = frameId;
		elements.currentFrame.innerHTML = frameId;
	};
	var animationRenderer = new AnimationRenderer(duration, elements.loop.checked, frameRenderFn);
	var scheduler = new Scheduler([animationRenderer.nextFrame.bind(animationRenderer)], logger, elements.fps.value);

	// Binding to UI elements.
	elements.playBtn.addEventListener('click', function () {
		elements.playBtn.classList.toggle('hidden');
		elements.stopBtn.classList.toggle('hidden');
		scheduler.run();
	});
	elements.stopBtn.addEventListener('click', function () {
		elements.playBtn.classList.toggle('hidden');
		elements.stopBtn.classList.toggle('hidden');
		scheduler.stop();
	});
	elements.frameSlider.addEventListener('input', function (e) {
		scheduler.stop();
		frameRenderFn(e.currentTarget.value);
		animationRenderer.setFrameId(e.currentTarget.value);
	});
	elements.fps.addEventListener('focus', function (e) {
		e.currentTarget.setSelectionRange(0, e.currentTarget.value.length);
	});
	elements.animationDump.addEventListener('focus', function (e) {
		e.currentTarget.setSelectionRange(0, e.currentTarget.value.length);
	});
	elements.fps.addEventListener('keyup', function (e) {
		var val = parseInt(e.currentTarget.value, 10);
		if (val > 0 && val <= 60) {
			scheduler.setFps(val);
		}
	});
	elements.loop.addEventListener('click', function (e) {
		animationRenderer.setLoop(e.currentTarget.checked);
	});
});

},{"./animationrenderer":2,"./body":4,"./compatibilitytester":6,"./grid":7,"./logger":8,"./proxydebugger":9,"./scheduler":10,"./utils":12}],4:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var BodyPart = require('./bodypart');
var Stack = require('./stack');

var ANIMATIONS_PATH = './animations';
var BODIES_PATH = './bodies';

var Body = (function () {
	function Body(bodyConfigFilename, animationConfigFilename, absolutePosition, configOverrides, logger, afterReady) {
		_classCallCheck(this, Body);

		this.absolutePosition = absolutePosition;
		this.configOverrides = configOverrides;
		this.logger = logger;

		this.root = null;
		this.duration = null;
		this.looping = null;

		var promises = [];
		promises.push(this.jsonLoadPromiseFactory(BODIES_PATH + '/' + bodyConfigFilename + '.json', this.setBodyConfig));
		promises.push(this.jsonLoadPromiseFactory(ANIMATIONS_PATH + '/' + animationConfigFilename + '.json', this.setAnimationConfig));

		Promise.all(promises).then(this.onReady.bind(this)).then(afterReady);
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
			if (this.configOverrides) {
				if (this.configOverrides.sprite && bodyConfig.parts.root.sprite) {
					bodyConfig.parts.root.sprite = this.configOverrides.sprite;
				}
			}
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
				var isRoot = partName == 'root';
				var partConfig = this.bodyConfig.parts[partName];
				parts[partName] = new BodyPart(partName, isRoot, partConfig.relativePosition, partConfig.centerOffset, partConfig.sprite, partConfig.layer, this.logger);

				if (isRoot) {
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
		key: 'getAnimationDuration',
		value: function getAnimationDuration() {
			return this.duration;
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

},{"./bodypart":5,"./stack":11}],5:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var AnimationInfo = require('./animationInfo');

var BodyPart = (function () {
	function BodyPart(name, isRoot, relativePosition, centerOffset, sprite, layer, logger) {
		var _this = this;

		_classCallCheck(this, BodyPart);

		this.name = name;

		// Vector going from parent to this part.
		this.relativePosition = relativePosition;

		// Offset to allow parts to rotate around the joints.
		this.centerOffset = centerOffset;

		this.layer = layer;

		if (typeof sprite === "string") {
			// Individual sprite
			var img = document.createElement('img');
			img.src = sprite;
			img.addEventListener('load', function (e) {
				_this.logger.log('image loaded', e);
			});
			document.getElementById('images').appendChild(img);
			this.sprite = img;
		} else {
			// Store dimensions, we'll refer to root for the image.
			this.sprite = sprite;
		}

		this.logger = logger;

		this.parent = null;
		this.isRoot = isRoot;
		this.root = null;
		this.children = {};

		this.animationInfo = null;
		this.calculatedFrames = {};
		this.duration = 0;
	}

	_createClass(BodyPart, [{
		key: 'setParent',
		value: function setParent(parent) {
			this.parent = parent;
			this.root = parent.getRoot();
		}
	}, {
		key: 'getParent',
		value: function getParent() {
			return this.parent;
		}
	}, {
		key: 'getRoot',
		value: function getRoot() {
			if (this.isRoot) {
				return this;
			}
			return this.root;
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
				var localPosition = this.animationInfo.getInterpolatedLocalPosition(f);
				var relativePosition = [this.relativePosition[0] + localPosition[0], this.relativePosition[1] + localPosition[1]];

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
				ctx.translate(frameInfo.position[0], frameInfo.position[1]);
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
			ctx.translate(frameInfo.position[0], frameInfo.position[1]);
			ctx.translate(this.centerOffset[0], this.centerOffset[1]);
			ctx.rotate(Math.PI / 180 * frameInfo.rotation);
			ctx.translate(-this.centerOffset[0], -this.centerOffset[1]);
			if (typeof this.sprite === "string") {
				ctx.drawImage(this.sprite, 0, 0);
			} else {
				var sprite = this.getRoot().sprite;
				ctx.drawImage(sprite, this.sprite[0], this.sprite[1], this.sprite[2], this.sprite[3], 0, 0, this.sprite[2], this.sprite[3]);
			}
		}
	}]);

	return BodyPart;
})();

module.exports = BodyPart;

},{"./animationInfo":1}],6:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var CompatibilityTester = (function () {
	function CompatibilityTester(bodies, animations) {
		_classCallCheck(this, CompatibilityTester);

		this.bodies = bodies;
		this.animations = animations;

		this.compatibilityLists = {};
	}

	_createClass(CompatibilityTester, [{
		key: 'buildCompatibilityLists',
		value: function buildCompatibilityLists() {
			var _this = this;

			this.bodies.forEach(function (bodyName) {
				_this.compatibilityLists[bodyName] = [];
				_this.animations.forEach(function (animationName) {
					if (_this.isCompatible(bodyName, animationName)) {
						_this.compatibilityLists[bodyName].push(animationName);
					}
				});
			});
		}
	}, {
		key: 'isCompatible',
		value: function isCompatible(bodyName, animationName) {
			var isCompatible = true;
			for (var prop in this.bodies[bodyName]) {
				if (typeof this.animations[animationName][prop] === 'undefined') {
					return false;
				}
			}
			return true;
		}
	}]);

	return CompatibilityTester;
})();

module.exports = CompatibilityTester;

},{}],7:[function(require,module,exports){
'use strict';

var Grid = {
	drawGrid: function drawGrid(ctx, logger) {
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
};

module.exports = Grid;

},{}],8:[function(require,module,exports){
"use strict";

var Logger = function Logger(global) {
	this.enabled = true;

	this._logger = global.console || {
		log: function log() {},
		group: function group() {},
		groupCollapsed: function groupCollapsed() {},
		groupEnd: function groupEnd() {}
	};
};
Logger.prototype.log = function () {
	if (this.enabled) {
		this._logger.log.apply(console, arguments);
	}
};
Logger.prototype.group = function () {
	if (this.enabled) {
		this._logger.group.apply(console, arguments);
	}
};
Logger.prototype.groupCollapsed = function () {
	if (this.enabled) {
		this._logger.groupCollapsed.apply(console, arguments);
	}
};
Logger.prototype.groupEnd = function () {
	if (this.enabled) {
		this._logger.groupEnd.apply(console, arguments);
	}
};

module.exports = Logger;

},{}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var DEFAULT_FPS = 30;

var STOPPED = 'stopped';
var RUNNING = 'running';

var Scheduler = (function () {
	function Scheduler(renderCallbacks, logger, fps) {
		_classCallCheck(this, Scheduler);

		this.renderCallbacks = renderCallbacks;
		this.logger = logger;

		this.setFps(fps || DEFAULT_FPS);

		this.stop();
	}

	_createClass(Scheduler, [{
		key: 'setState',
		value: function setState(state) {
			this.state = state;
			this.logger.log('Scheduler - setting state ' + state);
		}
	}, {
		key: 'run',
		value: function run() {
			this.setState(RUNNING);
			this.raf_ = requestAnimationFrame(this.step_.bind(this));
		}
	}, {
		key: 'stop',
		value: function stop() {
			if (this.state == STOPPED) {
				return;
			}

			this.lastTimestamp_ = 0;
			this.setState(STOPPED);

			if (this.raf_) {
				cancelAnimationFrame(this.raf_);
			}
			this.raf_ = null;
		}
	}, {
		key: 'step',
		value: function step() {
			this.raf_ = requestAnimationFrame(this.step_.bind(this));
		}
	}, {
		key: 'step_',
		value: function step_(timestamp) {
			var progress = timestamp - this.lastTimestamp_;
			this.logger.log('Scheduler - step_ - timestamp: ' + timestamp + ' - lastTimestamp_: ' + this.lastTimestamp_ + ' - progress: ' + progress);
			if (progress >= this.frameDuration_) {
				this.renderCallbacks.forEach(function (cb) {
					cb(timestamp);
				});
				this.lastTimestamp_ = timestamp;
			}
			if (this.state == RUNNING) {
				this.logger.log('Scheduler - scheduling next step_');
				this.raf_ = requestAnimationFrame(this.step_.bind(this));
			}
		}
	}, {
		key: 'setFps',
		value: function setFps(fps) {
			this.fps_ = fps;
			this.frameDuration_ = 1 / fps * 1000;
		}
	}]);

	return Scheduler;
})();

;
module.exports = Scheduler;

},{}],11:[function(require,module,exports){
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

},{}],12:[function(require,module,exports){
(function (global){
'use strict';

var Utils = {
	// From https://gist.github.com/rauschma/1bff02da66472f555c75
	getGlobalObject: function getGlobalObject() {
		// Workers don’t have `window`, only `self`
		if (typeof self !== 'undefined') {
			return self;
		}
		if (typeof global !== 'undefined') {
			return global;
		}
		// Not all environments allow eval and Function
		// Use only as a last resort:
		return new Function('return this')();
	}
};
module.exports = Utils;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}]},{},[3])

//# sourceMappingURL=app.js.map
