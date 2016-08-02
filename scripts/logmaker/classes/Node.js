import Util from '../Util.js';

class Node {
	constructor(node) {
		this.node = node;
	}

	write() {
		Util.write(`node.json`, this.node);
	}
}

module.exports = Node;
