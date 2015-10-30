class Queue {
	constructor() {
		this.arr = [];
	}

	push(node) {
		this.arr.push(node);
	}

	pop() {
		return this.arr.shift();
	}

	flush() {
		this.arr.length = 0;
	}
}
module.exports = Queue;