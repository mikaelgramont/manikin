class Queue {
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
		var node = this.arr.shift();
		if (this.onpop) {
			this.onpop();
		}
		return node;
	}

	flush() {
		this.arr.length = 0;
	}
}
module.exports = Queue;