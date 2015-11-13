class AnimationRenderer {
	constructor(duration, renderFn) {
		this.duration_ = duration;
		this.renderFn_ = renderFn;

		this.frameId_ = 0;
	}

	nextFrame() {
		this.renderFn_(this.frameId_);

		this.frameId_ += 1;
		if (this.frameId_ >= this.duration_) {
			this.frameId_ = 0;
		}
	}

	setFrameId(frameId) {
		this.frameId_ = frameId;
	}
}
module.exports = AnimationRenderer;