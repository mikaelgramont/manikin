class AnimationInfo {
	constructor(animationInfo, duration, parentPart) {
		this.duration = duration;
		this.rotation = animationInfo.rotation;
		this.parentPart = parentPart;
	}

	getInterpolatedLocalRotation(frameId) {
		if (frameId < 0) {
			throw new Error("Negative frameId not allowed.");
		}

		if (typeof this.rotation[frameId] !== 'undefined') {
			return this.rotation[frameId];
		}

		// 1. Find the previous keyframe.
		let previousId = frameId;
		let previousKeyFrameValue = this.rotation[previousId];
		while (typeof previousKeyFrameValue == 'undefined' && previousId > 0) {
			previousId--;
			previousKeyFrameValue = this.rotation[previousId];
		} 

		// 2. Find the next keyframe.
		let nextId = frameId + 1;
		let nextKeyFrameValue = this.rotation[nextId];
		while (typeof nextKeyFrameValue == 'undefined') {
			nextId++;

			if (nextId >= this.duration - 1) {
				nextId = 0;
				break;
			}
		} 
		nextKeyFrameValue = this.rotation[nextId];

		// 3. Return the interpolated value.
		let ratio;
		if (nextId === 0) {
			ratio = (frameId - previousId) / (this.duration - previousId);
		} else {
			ratio = (frameId - previousId) / (nextId - previousId);
		}
		return previousKeyFrameValue + ratio * (nextKeyFrameValue - previousKeyFrameValue);
	}
}

module.exports = AnimationInfo;