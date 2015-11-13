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