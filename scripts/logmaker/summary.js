/*
 * Generate fixture data.  Parameters: number of agents, number of frameworks, cluster fullness
 * 
 * The maximum frameworks is 10 because that's all the unique names for frameworks in this script.
 * The cluster fullnesss is expressed between 0 and 1.0, meaning percent allocation fullness.
 *
 * This can power the DC/OS visualizer for demos where a cluster isn't available. 
 * 
 * Approximate largest size for performant visualizer is: ***50 NODES WITH 90% FULLNESS*** 
*/

import Framework from './classes/Framework.js';
import MarathonTask from './classes/MarathonTask.js';
import MarathonGroups from './classes/MarathonGroups.js';
import Nodes from './classes/Nodes.js';
import Node from './classes/Node.js';
import MesosState from './classes/MesosState.js';
import Slave from './classes/Slave.js';
import Summary from './classes/Summary.js';
import Task from './classes/Task.js';
import Units from './classes/Units.js';
import Unit from './classes/Unit.js';
import Util from './Util.js';
import yargs from 'yargs';

let argv = yargs
  .usage('Usage: $0 [options]')
  .example('$0 -a 20 -f 8 -x 0.5')
  .option('a', {
    alias: 'agents',
    demand: true,
    describe: 'Number of Agents',
    type: 'number'
  })
  .option('f', {
    alias: 'frameworks',
    default: 0,
    describe: 'Number of Frameworks',
    type: 'number'
  })
  .option('x', {
    alias: 'fullness',
    default: 0.5,
    describe: 'Allocation (1.0 is full)',
    type: 'number'
  })
  .help('h')
  .alias('h', 'help')
  .demand(['a', 'f', 'x'])
  .argv;

// calculate framework total usage based on specified fullness and number of frameworks
let slaveSize = {cpus: 6.4, gpus: 2, mem: 16000, disk: 256000}
let frameworkUsage = {
  cpus: ((slaveSize.cpus * argv.agents) * argv.fullness) / argv.frameworks,
  gpus: ((slaveSize.gpus * argv.agents) * argv.fullness) / argv.frameworks,
  mem: ((slaveSize.mem * argv.agents) * argv.fullness) / argv.frameworks,
  disk: ((slaveSize.disk * argv.agents) * argv.fullness) / argv.frameworks
}

/*********** MAKE FRAMEWORKS **************/
const tag = Util.getTag();
let frameworks = [];

let numberFrameworks = Math.min(argv.frameworks, 10);
const names = ['arangodb', 'cassandra', 'chronos', 'jenkins', 'kafka', 'spark', 'elasticsearch', 'calico', 'hdfs', 'mysql'];
for (let i = 0; i < numberFrameworks; i++) {
	let index = Util.getRandomInteger(0, names.length - 1);
  let f = new Framework(tag, frameworks.length, names[index], frameworkUsage);
  f.populateTasks(slaveSize);
	frameworks.push(f);
	names.splice(index, 1);
}

/************** MAKE SLAVES **************/
let slaves = [];
for (let i = 0; i < argv.agents; i++) {
	slaves.push(new Slave(tag, slaves.length));
}

/************* SCHEDULE ALL *************/
let tasks = [];

for (let f of frameworks) {
	tasks = tasks.concat(f.tasks);
}

let slaveIndex = 0;
while (tasks.length > 0) {
	let task = tasks.pop();

	// find slave with enough space
	let slave = slaves[slaveIndex];
	let start = slaveIndex;
	while (!slave.hasSpaceForTask(task)) {
		// circular iteration
		slaveIndex += 1;
		if (slaveIndex >= slaves.length) {
			slaveIndex = 0;
		}
		slave = slaves[slaveIndex];

		// no slaves have space for task, make a new slave and schedule task on it
		if (slaveIndex === start) {
			let emptySlave = new Slave(tag, slaves.length);
			slaves.push(emptySlave);
			slave = emptySlave;
			break;
		}
	}

	slave.scheduleTask(task);

	for (let f of frameworks) {
		if (f.id === task.framework_id && !f.slave_ids.includes(slave.id)) {
			f.slave_ids.push(slave.id);
		}
	}

	slaveIndex += 1;
	if (slaveIndex >= slaves.length) {
		slaveIndex = 0;
	}
}

/*************** SUMMARY JSON *******************/
let summary = new Summary(slaves, frameworks);
summary.write();

/*************** MARATHON GROUPS JSON *************/
let marathonTasks = [];

// one scheduler for each framework (except marathon)
for (let f of frameworks) {
	if (f.name === 'marathon') continue;
	marathonTasks.push(f.getMarathonTask());
}

let marathonGroups = new MarathonGroups(marathonTasks);
marathonGroups.write();

/**************** MESOS STATE JSON ****************/
let mesosState = new MesosState(tag, slaves, frameworks);
mesosState.write();

/**************** NODE HEALTH ****************/
// /nodes (master and all slaves)
let n = [];
let master = {
	host_ip: mesosState.hostname,
	health: 0,
	role: 'master'
};
n.push(master);
for (let ip of slaves.map((s) => s.hostname)) { // slaves
	n.push({
		host_ip: ip,
		health: 0,
		role: 'agent'
	});
}

let nodes = new Nodes(n);
nodes.write();

// nodes/<ip-of-node> (for now pick master)
let node = new Node(master);
node.write();

// nodes/<ip-of-node>/units (also pick master)
let units = new Units(mesosState.hostname);
units.write();

// node/<ip-of-node>/units/<unit-id> (also pick master first unit)
let unit = new Unit(mesosState.hostname);
unit.write();
