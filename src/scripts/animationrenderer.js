class AnimationRenderer {
	constructor(duration, doLoop, renderFn) {
		this.duration_ = duration;
		this.doLoop_ = doLoop;
		this.renderFn_ = renderFn;

		this.frameId_ = 0;
	}

	nextFrame() {
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