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