import MarathonTask from './MarathonTask.js';
import Task from './Task.js';
import Util from '../Util.js';

class Framework {
  constructor(tag, number, name, options = {
    cpus: 6.4, gpus: 0, mem: 4000, disk: 32000
  }) {
    this.id = tag + '0000'.substring((number + '').length) + number;
    this.name = name;
    this.hostname = Util.generateIPv4Address();
    this.pid =  'scheduler-' +
      new Array(8).fill('').map(() => Util.getChar()).join('') + '-' +
      new Array(4).fill('').map(() => Util.getChar()).join('') + '-' +
      new Array(4).fill('').map(() => Util.getChar()).join('') + '-' +
      new Array(4).fill('').map(() => Util.getChar()).join('') + '-' +
      new Array(12).fill('').map(() => Util.getChar()).join('') + '@' +
      this.hostname + ':' + Util.getRandomInteger(100, 90000);
    this.used_resources = {
      cpus: options.cpus,
      gpus: options.gpus,
      mem: options.mem,
      disk: options.disk
    };
    this.offered_resources = {
      cpus: 0,
      gpus: 0,
      mem: 0,
      disk: 0
    };
    this.webui_url = `http://${this.hostname}:8080`;
    this.capabilities = [];
    this.active = true;
    this.TASK_STAGING = 0;
    this.TASK_STARTING = 0;
    this.TASK_FINISHED = 0;
    this.TASK_KILLED = 0;
    this.TASK_FAILED = 0;
    this.TASK_LOST = 0;
    this.TASK_ERROR = 0;
    this.slave_ids = [];

    // this.tasks = makeTasks(options.cpus, 0.1, 3.2, this.id, this.name);

    this.TASK_RUNNING = 0;
  }

  populateTasks(nodeSize) {
    let maxTaskCpus = nodeSize.cpus / 2;
    let maxTaskGpus = nodeSize.gpus / 2;
    let maxTaskMem = nodeSize.mem / 2;
    let maxTaskDisk = nodeSize.disk / 2;

    let remainingCpu = this.used_resources.cpus;
    let remainingGpu = this.used_resources.gpus;
    let remainingMem = this.used_resources.mem;
    let remainingDisk = this.used_resources.disk;

    let i = 0;
    let tasks = [];
    while (1) {
      let cpu = Util.roundTenth(Util.getRandomNumber(0, maxTaskCpus));
      let gpu = Util.roundTenth(Util.getRandomNumber(0, maxTaskGpus));
      let mem = Util.roundTenth(Util.getRandomNumber(0, maxTaskMem));
      let disk = Util.roundTenth(Util.getRandomNumber(0, maxTaskDisk));

      if (cpu > remainingCpu) {
        cpu = 0;
      }
      if (gpu > remainingGpu) {
        gpu = 0;
      }
      if (mem > remainingMem) {
        mem = 0;
      }
      if (disk > remainingDisk) {
        disk = 0;
      }

      if (cpu === 0 && gpu === 0 && mem === 0 && disk === 0) {
        break;
      }

      remainingCpu -= cpu;
      remainingGpu -= gpu;
      remainingMem -= mem;
      remainingDisk -= disk;

      tasks.push(new Task(
        Util.roundTenth(cpu),
        Util.roundTenth(gpu),
        Util.roundTenth(mem),
        Util.roundTenth(disk),
        this.id, // framework id
        this.name + i // id of the task, will be unique
      ));
    }

    i += 1;

    this.tasks = tasks;
    this.TASK_RUNNING = tasks.length;
  }

  getNumberTasks() {
    return this.TASK_STAGING + this.TASK_STARTING + this.TASK_RUNNING + this.TASK_FINISHED;
  }

  addSlaveId(id) {
    if (!this.slave_ids.includes(id)) {
      this.slave_ids.push(id);
    }
  }

  // for use in marathon/v2/groups endpoint
  getMarathonTask() {
    if (this.name !== 'marathon') {
      return new MarathonTask(this.name, this.used_resources);
    } else {
      return null;
    }
  }
}

module.exports = Framework;
