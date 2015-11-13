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
let bodyConfig = configs.bodies[0];
let animConfig = configs.animations[0];

// TODO: load all these files with promises, and once we have them test them for compatibility.
let compatibilityTester = new CompatibilityTester(configs.bodies, configs.animations);
compatibilityTester.buildCompatibilityLists();

// Then setup some listeners to update the list of available animations when switching bodies.


// Build the body object.
let body = new Body(bodyConfig, animConfig, [100, 97], logger, () => {
	let duration = body.getAnimationDuration();
	elements.frameSlider.max = duration - 1;

	// Build the objects that run the show.
	let frameRenderFn = (frameId) => {
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		body.renderFrame(frameId, ctx);
		elements.frameSlider.value = frameId;
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
