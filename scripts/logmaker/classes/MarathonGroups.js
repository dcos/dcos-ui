import Util from '../Util.js';

class MarathonGroups {
	constructor(marathonTasks) {
		this.id = '/';
		this.dependencies = [];
		this.version = 'current date';
		this.apps = marathonTasks;
		this.groups = [];
	}

	write() {
		Util.write('marathonGroups.json', this);
	}
}

module.exports = MarathonGroups;
