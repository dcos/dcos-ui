import Util from '../Util.js';

const deleteList =  ['TASK_STAGING', 'TASK_STARTING', 'TASK_RUNNING', 'TASK_FINISHED', 'TASK_KILLED', 'TASK_FAILED', 'TASK_LOST', 'TASK_ERROR', 'framework_ids'];

function _transformSlaves(slaves) {
	let slavesBasic = [];
	for (let slave of slaves) {
		let trimmed = Util.trim(slave, deleteList);
		slavesBasic.push(trimmed);
	}

	return slavesBasic;
}

function _transformFrameworks(frameworks) {
	let frameworksNew = [];
	for (let framework of frameworks) {
		// remove old props
		let trimmed = Util.trim(framework, deleteList);

		// add new props
		trimmed.failover_timeout = 604800;
		trimmed.checkpoint = true;
		trimmed.role = trimmed.name;
		trimmed.registered_time = Date.now();
		trimmed.unregistered_time = 0;
		trimmed.principal = trimmed.name;
		trimmed.completed_tasks = [];
		trimmed.offers = [];
		trimmed.executors = [];

		frameworksNew.push(trimmed);
	}

	return frameworksNew;
}

class MesosState {
	constructor(tag, slaves, frameworks) {
		this.version = '0.2';
		this.git_sha = '29292';
		this.build_date = 'some date';
		this.build_time = Date.now();
		this.build_user = '';
		this.start_time = Date.now();
		this.elected_time = Date.now();
		this.id = tag;
		this.hostname = Util.generateIPv4Address();
		this.pid = `master@${this.hostname}:5050`;
		this.activited_slaves = slaves.length;
		this.deactivated_slaves = 0;
		this.cluster = 'andrew-viz';
		this.leader = this.pid;
		this.log_dir = '/var/log/mesos'
		this.flags = {};

		this.slaves = _transformSlaves(slaves);
		this.frameworks = _transformFrameworks(frameworks);

		this.completed_frameworks = [];
		this.orphan_tasks = [];
		this.unregistered_frameworks = [];
	}

	write() {
		Util.write('mesosState.json', this);
	}
}

module.exports = MesosState;
