(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
class AnimationInfo {
	constructor(animationInfo, duration, parentPart) {
		this.duration = duration;
		this.rotation = animationInfo.rotation;
		this.position = animationInfo.position;
		this.parentPart = parentPart;
	}

	getInterpolatedLocalPosition(frameId) {
		return this.getInterpolatedLocalProperty_('position', frameId, [0, 0]);
	}

	getInterpolatedLocalRotation(frameId) {
		return this.getInterpolatedLocalProperty_('rotation', frameId, 0);
	}

	getInterpolatedLocalProperty_(property, frameId, defaultValue) {
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
		let previousId = frameId;
		let previousKeyFrameValue = this[property][previousId];
		while (typeof previousKeyFrameValue == 'undefined' && previousId > 0) {
			previousId--;
			previousKeyFrameValue = this[property][previousId];
		} 

		// 2. Find the next keyframe.
		let nextId = frameId + 1;
		let nextKeyFrameValue = this[property][nextId];
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
		let ratio;
		if (nextId === 0) {
			ratio = (frameId - previousId) / (this.duration - previousId);
		} else {
			ratio = (frameId - previousId) / (nextId - previousId);
		}
		if (Array.isArray(nextKeyFrameValue)) {
			return [
				previousKeyFrameValue[0] + ratio * (nextKeyFrameValue[0] - previousKeyFrameValue[0]),
				previousKeyFrameValue[1] + ratio * (nextKeyFrameValue[1] - previousKeyFrameValue[1])
			];
		} else {
			return previousKeyFrameValue + ratio * (nextKeyFrameValue - previousKeyFrameValue);		
		}
	}
}

module.exports = AnimationInfo;
},{}],2:[function(require,module,exports){
class AnimationRenderer {
	constructor(duration, doLoop, renderFn) {
		this.duration_ = duration;
		this.doLoop_ = doLoop;
		this.renderFn_ = renderFn;

		this.frameId_ = 0;
	}

	nextFrame() {
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

	setFrameId(frameId) {
		this.frameId_ = frameId;
	}

	setLoop(doLoop) {
		this.doLoop_ = doLoop;
	}
}
module.exports = AnimationRenderer;
},{}],3:[function(require,module,exports){
let AnimationRenderer = require('./animationrenderer');
let Body = require('./body');
let CompatibilityTester = require('./compatibilitytester');
let Grid = require('./grid');
let Logger = require('./logger');
let ProxyDebugger = require('./proxydebugger');
let Scheduler = require('./scheduler');
let Utils = require('./utils');

// Build a logger object.
let global = Utils.getGlobalObject();
let logger = new Logger(global);
logger.enabled = false;

// Set this to true and enable the logger to see all canvas calls.
let instrumentContext = false;

// Prepare grid.
Grid.drawGrid(document.getElementById('grid').getContext('2d'), logger);

let elements = {
	playBtn: document.getElementById('play-button'),
	stopBtn: document.getElementById('stop-button'),
	frameSlider: document.getElementById('frame-id'),
	fps: document.getElementById('fps'),
	loop: document.getElementById('loop'),
	currentFrame: document.getElementById('current-frame'),
	animationDump: document.getElementById('animation-dump'),
}

// Possibly instrument the main context oject.
let ctx = document.getElementById('manikin').getContext('2d');
if (instrumentContext) {
	ctx = ProxyDebugger.instrumentContext(ctx, 'ctx', logger, {
		'rotate': (argsIn) => {
			// Print angles in degrees.
			return [argsIn[0] * 180 / Math.PI]
		}
	});
}

let configs = global.manikinConfig;
let chosenBody = configs.bodies[0];
let bodyConfig = chosenBody.name;
let animConfig = chosenBody.compatibleAnimations[0];

let configOverrides = {};
window.location.search.substring(1).split("&").forEach((queryPart) => {
	if (queryPart.indexOf('sprite') !== -1) {
		configOverrides.sprite = queryPart.split("=")[1];
	}	
});

// TODO: load all these files with promises, and once we have them test them for compatibility.
let compatibilityTester = new CompatibilityTester(configs.bodies, configs.animations);
compatibilityTester.buildCompatibilityLists();

// Then setup some listeners to update the list of available animations when switching bodies.


// Build the body object.
let body = new Body(bodyConfig, animConfig, [100, 97], configOverrides, logger, () => {
	let duration = body.getAnimationDuration();
	elements.frameSlider.max = duration - 1;

	// Build the objects that run the show.
	let frameRenderFn = (frameId) => {
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		body.renderFrame(frameId, ctx);
		elements.frameSlider.value = frameId;
		elements.currentFrame.innerHTML = frameId;
	};
	let animationRenderer = new AnimationRenderer(duration,
		elements.loop.checked, frameRenderFn);
	let scheduler = new Scheduler(
		[animationRenderer.nextFrame.bind(animationRenderer)],
		logger, elements.fps.value);

	// Binding to UI elements.
	elements.playBtn.addEventListener('click', () => {
		elements.playBtn.classList.toggle('hidden');
		elements.stopBtn.classList.toggle('hidden');
		scheduler.run();
	});
	elements.stopBtn.addEventListener('click', () => {
		elements.playBtn.classList.toggle('hidden');
		elements.stopBtn.classList.toggle('hidden');
		scheduler.stop();
	});
	elements.frameSlider.addEventListener('input', (e) => {
		scheduler.stop();
		frameRenderFn(e.currentTarget.value);
		animationRenderer.setFrameId(e.currentTarget.value);
	});
	elements.fps.addEventListener('focus', (e) => {
		e.currentTarget.setSelectionRange(0, e.currentTarget.value.length);
	});
	elements.animationDump.addEventListener('focus', (e) => {
		e.currentTarget.setSelectionRange(0, e.currentTarget.value.length);
	});
	elements.fps.addEventListener('keyup', (e) => {
		let val = parseInt(e.currentTarget.value, 10);
		if (val > 0 && val <= 60) {
			scheduler.setFps(val);
		}
	});
	elements.loop.addEventListener('click', (e) => {
		animationRenderer.setLoop(e.currentTarget.checked);
	});
});

},{"./animationrenderer":2,"./body":4,"./compatibilitytester":6,"./grid":7,"./logger":8,"./proxydebugger":9,"./scheduler":10,"./utils":12}],4:[function(require,module,exports){
let BodyPart = require('./bodypart');
let Stack = require('./stack');

const ANIMATIONS_PATH = './animations';
const BODIES_PATH = './bodies';

class Body {
	constructor(bodyConfigFilename, animationConfigFilename, absolutePosition, configOverrides, logger, afterReady) {

		this.absolutePosition = absolutePosition;
		this.configOverrides = configOverrides;
		this.logger = logger;

		this.root = null;
		this.duration = null;
		this.looping = null;

		let promises = [];
		promises.push(this.jsonLoadPromiseFactory(
			`${BODIES_PATH}/${bodyConfigFilename}.json`, this.setBodyConfig));
		promises.push(this.jsonLoadPromiseFactory(
			`${ANIMATIONS_PATH}/${animationConfigFilename}.json`, this.setAnimationConfig));

		Promise.all(promises).then(this.onReady.bind(this)).then(afterReady);
	}

	onReady() {
		this.createParts();
		this.loadAnimation();
		this.calculateFrames();		
	}

	setBodyConfig(bodyConfig) {
		if (this.configOverrides) {
			if (this.configOverrides.sprite && bodyConfig.parts.root.sprite) {
				bodyConfig.parts.root.sprite = this.configOverrides.sprite;
			}
		}
		this.bodyConfig = bodyConfig;
		this.name = this.bodyConfig.name;
	}

	setAnimationConfig(animationConfig) {
		this.animationConfig = animationConfig;
	}

	jsonLoadPromiseFactory(relativePath, onSuccess) {
		let p = new Promise((resolve, reject) => {
			let req = new XMLHttpRequest();
    		req.open('GET', relativePath);
			req.onload = () => {
				if (req.status == 200) {
					onSuccess.bind(this)(JSON.parse(req.response));
					resolve();
				} else {
					reject(Error(req.statusText));
				}
			};
			req.onerror = () => {
				reject();
			};
			req.send();
		});
		return p;
	}

	createParts() {
		let parts = {};
		// Step 1: build all parts.
		for (let partName in this.bodyConfig.parts) {
			let isRoot = partName == 'root';
			let partConfig = this.bodyConfig.parts[partName];
			parts[partName] = new BodyPart(
				partName,
				isRoot,
				partConfig.relativePosition,
				partConfig.centerOffset,
				partConfig.sprite,
				partConfig.layer,
				this.logger);

			if (isRoot) {
				this.root = parts[partName];
			}
		}

		// Step 2: setup parent-child relationships.
		for (let partName in parts) {
			if (partName == 'root') {
				continue;
			}
			let partConfig = this.bodyConfig.parts[partName];
			let childPart = parts[partName];
			let parentPart = parts[partConfig.parentName];

			if (!parentPart) {
				throw new Error(`Cannot find parent element by name ${partConfig.parentName} for child ${partName}`);
			}

			parentPart.addChild(childPart);
		}
	}

	forEachPart(fn, beforeLoopOverChildrenFn, afterLoopOverChildrenFn) {
		var explored = [];
		let storage = new Stack();
		storage.flush();
		storage.push(this.root);
		fn(this.root, this.root.getName());
		var currentPart;

		while((currentPart = storage.pop()) !== undefined) {
			if (beforeLoopOverChildrenFn) {
				beforeLoopOverChildrenFn(currentPart);
			}

			let currentName = currentPart.getName();
			let children = currentPart.getChildren();


			for(let name in children) {
				let child = children[name];
				if (!explored[name]) {
					explored[name] = true;
					fn(child, name);
					storage.push(child);
				}
			}

			if (afterLoopOverChildrenFn) {
				afterLoopOverChildrenFn(currentPart);
			}
		}
		storage.flush();
	}

	loadAnimation() {
		let animObject = this.animationConfig;
		this.duration = animObject.duration;
		this.looping = animObject.looping;

		this.forEachPart((part, name) => {
			if (!animObject.frames[name]) {
				//throw new Error(`No frame info for body part ${name} in animation object:`, animObject);
				return;
			}
			part.loadAnimationInfo(this.duration, animObject.frames[name]);
		});
	}

	getAnimationDuration() {
		return this.duration;
	}

	calculateFrames() {
		this.forEachPart((part) => {
			part.calculateFrames();
		});
	}

	getCalculatedFrames() {
		let calculatedFrames = {};
		this.forEachPart((part, name) => {
			calculatedFrames[name] = part.getCalculatedFrames();
		});
		return calculatedFrames;
	}

	renderFrame(frameId, ctx) {
		ctx = this.instrumentContext(ctx);
	}

	renderFrame(frameId, ctx) {
		ctx.save();
		ctx.translate(this.absolutePosition[0], this.absolutePosition[1]);

		// Build a list of parts, ordered by layer.
		let parts = []
		this.forEachPart((part, name) => {
			parts.push(part);
		});

		parts.sort((a, b) => {
			return a.layer - b.layer;
		});

		parts.forEach((part) => {
			let name = part.getName();
			this.logger.groupCollapsed(`rendering ${name}`);
			ctx.save();
			part.positionContextForFrame(frameId, ctx);
			part.drawSpriteForFrame(frameId, ctx);
			ctx.restore();
			this.logger.groupEnd();

		});
		
		ctx.restore();
	}
}

module.exports = Body;
},{"./bodypart":5,"./stack":11}],5:[function(require,module,exports){
let AnimationInfo = require('./animationInfo');

class BodyPart {
	constructor(name, isRoot, relativePosition, centerOffset, sprite, layer, logger) {
		this.name = name;

		// Vector going from parent to this part.
		this.relativePosition = relativePosition;

		// Offset to allow parts to rotate around the joints.
		this.centerOffset = centerOffset;

		this.layer = layer;

		if (typeof sprite === "string") {
			// Individual sprite
			let img = document.createElement('img');
			img.src = sprite;
			img.addEventListener('load', (e) => {
				this.logger.log('image loaded', e);
			})
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

	setParent(parent) {
		this.parent = parent;
		this.root = parent.getRoot();
	}

	getParent() {
		return this.parent;
	}

	getRoot() {
		if (this.isRoot) {
			return this;
		}
		return this.root;
	}

	getName() {
		return this.name;
	}

	getChildren() {
		return this.children;
	}

	getChildByName(name) {
		return this.children[name];
	}

	addChild(child) {		
		let childName = child.getName();
		child.setParent(this);
		if (this.children[childName]) {
			let existing = this.children[childName];
			let parentChain = existing.getParentChainAsString()
			throw new Error(`Cannot add child: '${this.name}' already has a child by the name of '${childName}': ${parentChain}`);
		}
		this.children[childName] = child;
	}

	getParentChain() {
		let chain = [];
		let currentPart = this;
		while (currentPart = currentPart.getParent()) {
			chain.unshift(currentPart);
		}

		return chain;
	}

	getParentChainAsString() {
		let stringParts = [];
		let currentPart = this;
		do {
			stringParts.unshift(currentPart.getName());
		} while (currentPart = currentPart.getParent());

		return stringParts.join(' -> ');
	}

	getAnimationInfo() {
		return this.animationInfo;
	}

	loadAnimationInfo(duration, animationInfo) {
		this.duration = duration;
		this.animationInfo = new AnimationInfo(animationInfo, duration, this);
	}

	getCalculatedFrame(frameId) {
		if (frameId >= this.duration) {
			throw new Error(`Requested frameId (${frameId}) too high. Duration is ${this.duration}.`)
		}
		return this.calculatedFrames[frameId];
	}

	calculateFrames() {
		for(let f = 0; f < this.duration; f++) {

			let localRotation = this.animationInfo.getInterpolatedLocalRotation(f);
			let localPosition = this.animationInfo.getInterpolatedLocalPosition(f);
			let relativePosition = [
				this.relativePosition[0] + localPosition[0],
				this.relativePosition[1] + localPosition[1]
			];

			this.calculatedFrames[f] = {
				'position': relativePosition,
				'rotation': localRotation
			};
		}
	}

	getDrawInfoForFrame(frameId) {
		if (frameId >= this.duration) {
			throw new Error(`Requested frameId (${frameId}) too high. Duration is ${this.duration}.`)
		}
		return {
			'position': this.calculatedFrames.position[frameId],
			'rotation': this.calculatedFrames.rotation[frameId]
		}
	}

	/*
	 * Starts from the root element, and positions the context
	 * so that (0, 0) coincides with the origin of the current part.
	 */
	positionContextForFrame(frameId, ctx) {
		let parentParts = this.getParentChain();
		parentParts.forEach((parentPart) => {
			this.logger.groupCollapsed(`positioning canvas according to ${parentPart.getName()}`);
			let frameInfo = parentPart.getCalculatedFrame(frameId);
			ctx.translate(frameInfo.position[0], frameInfo.position[1]);
			ctx.translate(parentPart.centerOffset[0], parentPart.centerOffset[1]);
			ctx.rotate((Math.PI / 180) * frameInfo.rotation);
			ctx.translate(- parentPart.centerOffset[0], - parentPart.centerOffset[1]);
			this.logger.groupEnd();
		});
	}

	/*
	 * Draws the sprite for this part relative to the current
	 * context origin.
	 */
	drawSpriteForFrame(frameId, ctx) {
		if (!this.sprite) {
			return;
		}
		let frameInfo = this.getCalculatedFrame(frameId);
		ctx.translate(frameInfo.position[0], frameInfo.position[1]);
		ctx.translate(this.centerOffset[0], this.centerOffset[1]);
		ctx.rotate((Math.PI / 180) * frameInfo.rotation);
		ctx.translate(- this.centerOffset[0], - this.centerOffset[1]);
		if (typeof this.sprite === "string") {
			ctx.drawImage(this.sprite, 0, 0);
		} else {
			let sprite = this.getRoot().sprite;
			ctx.drawImage(sprite, this.sprite[0], this.sprite[1], this.sprite[2], this.sprite[3], 0, 0, this.sprite[2], this.sprite[3]);
		}
	}
}
module.exports = BodyPart;
},{"./animationInfo":1}],6:[function(require,module,exports){
class CompatibilityTester {
	constructor(bodies, animations) {
		this.bodies = bodies;
		this.animations = animations;

		this.compatibilityLists = {};
	}

	buildCompatibilityLists() {
		this.bodies.forEach((bodyName) => {
			this.compatibilityLists[bodyName] = [];
			this.animations.forEach((animationName) => {
				if (this.isCompatible(bodyName, animationName)) {
					this.compatibilityLists[bodyName].push(animationName);
				}
			});
		});
	}

	isCompatible(bodyName, animationName) {
		let isCompatible = true;
		for (let prop in this.bodies[bodyName]) {
			if (typeof this.animations[animationName][prop] === 'undefined') {
				return false;
			}
		}
		return true;		
	}
}
module.exports = CompatibilityTester;
},{}],7:[function(require,module,exports){
let Grid = {
	drawGrid: function(ctx, logger) {
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		logger.groupCollapsed('Drawing grid');
		for (let i = 0; i <= 200; i += 10) {
			let strokeStyle = '#000000';
			if (i == 100) {
				strokeStyle = '#ff0000';
			}
			ctx.strokeStyle = strokeStyle;
			ctx.beginPath();
			ctx.moveTo(0, i);
			ctx.lineTo(200,i);
			ctx.stroke();

			ctx.beginPath();
			ctx.moveTo(i, 0);
			ctx.lineTo(i, 200);
			ctx.stroke();
		}
		logger.groupEnd('Drawing grid');
	},
};

module.exports = Grid;
},{}],8:[function(require,module,exports){
let Logger = function(global) {
	this.enabled = true;

	this._logger = global.console || {
		log: function() {},
		group: function() {},
		groupCollapsed: function() {},
		groupEnd: function() {},
	};
};
Logger.prototype.log = function() {
	if (this.enabled) {
		this._logger.log.apply(console, arguments);
	}
}
Logger.prototype.group = function() {
	if (this.enabled) {
		this._logger.group.apply(console, arguments);
	}
}
Logger.prototype.groupCollapsed = function() {
	if (this.enabled) {
		this._logger.groupCollapsed.apply(console, arguments);
	}
}
Logger.prototype.groupEnd = function() {
	if (this.enabled) {
		this._logger.groupEnd.apply(console, arguments);
	}
}

module.exports = Logger;
},{}],9:[function(require,module,exports){
let ProxyDebugger = {
	instrumentContext: (original, logName, logger, modifiers) => {
		// The object that all calls will go through
		let proxyObj = {};

		for (let propName in original) {
			if (original[propName] instanceof Function) {
				// Proxying methods.
				proxyObj[propName] = (...args) => {
					let argsForLogging = args;
					if (propName in modifiers) {
						argsForLogging = modifiers[propName](args);
					}
					logger.log(`${logName}.${propName}`, argsForLogging);  
					original[propName].apply(original, args);
				};
			} else {
				// Setters and getters for proxy'ed properties.
				Object.defineProperty(proxyObj, propName, {
					set: function(value) {
					 	original[propName] = value;
						logger.log(`${logName}.${propName} = ${value}`);
					},
					get: function(name)	{
						return original[propName];
					}
				});    
			}
		}
		return proxyObj;
	}
}

module.exports = ProxyDebugger;
},{}],10:[function(require,module,exports){
const DEFAULT_FPS = 30;

const STOPPED = 'stopped';
const RUNNING = 'running';

class Scheduler {
	constructor(renderCallbacks, logger, fps) {
		this.renderCallbacks = renderCallbacks;		
		this.logger = logger;

		this.setFps(fps || DEFAULT_FPS);

		this.stop();
	}

	setState(state) {
		this.state = state;
		this.logger.log(`Scheduler - setting state ${state}`);
	}

	run() {
		this.setState(RUNNING);
		this.raf_ = requestAnimationFrame(this.step_.bind(this));
	}

	stop() {
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

	step() {
		this.raf_ = requestAnimationFrame(this.step_.bind(this));
	}

	step_(timestamp) {
  		let progress = timestamp - this.lastTimestamp_;
		this.logger.log(`Scheduler - step_ - timestamp: ${timestamp} - lastTimestamp_: ${this.lastTimestamp_} - progress: ${progress}`);
		if (progress >= this.frameDuration_) {
			this.renderCallbacks.forEach((cb) => {
				cb(timestamp);
			})
			this.lastTimestamp_ = timestamp;
		}
		if (this.state == RUNNING) {
			this.logger.log(`Scheduler - scheduling next step_`);
			this.raf_ = requestAnimationFrame(this.step_.bind(this));
		}
	}

	setFps(fps) {
		this.fps_ = fps;
		this.frameDuration_ = 1 / fps * 1000;
	}
};
module.exports = Scheduler;
},{}],11:[function(require,module,exports){
class Stack {
	constructor(onpop, onpush) {
		this.arr = [];
		this.onpop = onpop;
		this.onpush = onpush;		
	}

	push(node) {
		this.arr.push(node);
		if (this.onpush) {
			this.onpush(node);
		}
	}

	pop() {
		var node = this.arr.pop();
		if (this.onpop) {
			this.onpop(node);
		}
		return node;
	}

	flush() {
		this.arr.length = 0;
	}
}
module.exports = Stack;
},{}],12:[function(require,module,exports){
(function (global){
let Utils = {
	// From https://gist.github.com/rauschma/1bff02da66472f555c75
	getGlobalObject: function() {
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
},{}]},{},[3]);
