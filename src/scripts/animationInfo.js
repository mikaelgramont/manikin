class AnimationInfo {
	constructor(animationInfo, duration) {
		this.duration = duration;
		this.rotation = animationInfo.rotation;
	}

	getInterpolatedLocalRotation(frameId) {
		if (frameId < 0) {
			throw new Error("Negative frameId not allowed.");
		}

		let previousId = frameId;
		let previousSpecFrame = this.rotation[previousId];

		while (typeof previousSpecFrame == 'undefined' && previousId > 0) {
			previousId--;
			previousSpecFrame = this.rotation[previousId];
		} 

		let nextId = frameId + 1;
		let nextSpecFrame = this.rotation[nextId];
		while (typeof nextSpecFrame == 'undefined'  && nextId < this.duration - 1) {
			nextId++;
			nextSpecFrame = this.rotation[nextId];
		} 

		let proportion = (frameId - previousId) / (nextId - previousId);

		return this.rotation[previousId] + proportion * (this.rotation[nextId] - this.rotation[previousId]);
	}
}

module.exports = AnimationInfo;