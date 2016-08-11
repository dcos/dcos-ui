import Util from '../Util.js';

class Nodes {
	constructor(nodes) {
		this.nodes = nodes;
	}

	write() {
		Util.write('nodes.json', this);
	}
}

module.exports = Nodes;
