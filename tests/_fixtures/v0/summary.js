module.exports = {
  cluster: "Vagrant_SingleNode",
  frameworks: [
    ...[...Array(1000).keys()].map(i => ({
      TASK_ERROR: 0,
      TASK_FAILED: 0,
      TASK_FINISHED: 22,
      TASK_KILLED: 0,
      TASK_LOST: 0,
      TASK_RUNNING: 1,
      TASK_STAGING: 0,
      TASK_STARTING: 0,
      hostname: "dcos-1",
      id: `b3bd182c-c6d7-463e-8bf0-06cd5807df4e-${i}`,
      name: `framework_${i}`,
      offered_resources: {
        cpus: 0,
        disk: 0,
        mem: 0
      },
      pid: `scheduler-d571a745-055d-4180-9eed-${i}@10.0.1.110:40153`,
      slave_ids: ["b3bd182c-c6d7-463e-8bf0-06cd5807df4e-S0"],
      used_resources: {
        cpus: 0.1,
        disk: 0,
        mem: 16,
        ports: "[10000-10000]"
      },
      webui_url: "http://$($MESOS_IP_DISCOVERY_COMMAND):8080"
    })),
    {
      TASK_ERROR: 0,
      TASK_FAILED: 0,
      TASK_FINISHED: 22,
      TASK_KILLED: 0,
      TASK_LOST: 0,
      TASK_RUNNING: 1,
      TASK_STAGING: 0,
      TASK_STARTING: 0,
      hostname: "dcos-01",
      id: "20150827-210452-1695027628-5050-1445-0000",
      name: "cassandra-healthy",
      offered_resources: {
        cpus: 0,
        disk: 0,
        mem: 0
      },
      pid: "scheduler-88e0ffb7-5d54-4bc4-984b-e546d4b1ebb1@172.17.8.101:47277",
      slave_ids: ["20151002-000353-1695027628-5050-1177-S0"],
      used_resources: {
        cpus: 0.1,
        disk: 0,
        mem: 16,
        ports: "[10000-10000]"
      },
      webui_url: "http://$($MESOS_IP_DISCOVERY_COMMAND):8080"
    }
  ],
  hostname: "172.17.8.101",
  slaves: [...Array(5000).keys()].map(i => ({
    TASK_ERROR: 0,
    TASK_FAILED: 0,
    TASK_FINISHED: 22,
    TASK_KILLED: 0,
    TASK_LOST: 0,
    TASK_RUNNING: 1,
    TASK_STAGING: 0,
    TASK_STARTING: 0,
    active: true,
    attributes: {},
    framework_ids: ["20150827-210452-1695027628-5050-1445-0000"],
    hostname: `dcos-${i}`,
    id: `b3bd182c-c6d7-463e-8bf0-06cd5807df4e-S${i}`,
    offered_resources: {
      cpus: 0,
      disk: 0,
      mem: 0
    },
    domain: {
      fault_domain: {
        region: {
          name: ["aws/eu-central-1", "aws/eu-central-2", "aws/eu-central-3"][
            Math.floor(Math.random() * 3)
          ]
        },
        zone: {
          name: "aws/eu-central-1c"
        }
      }
    },
    pid: `slave(${i})@10.0.1.110:5051`,
    registered_time: 1443995289.19971,
    reregistered_time: 1443995289.19981,
    reserved_resources: {},
    resources: {
      cpus: 4,
      disk: 10823,
      mem: 2933,
      ports:
        "[1025-2180, 2182-3887, 3889-5049, 5052-8079, 8082-8180, 8182-32000]"
    },
    unreserved_resources: {
      cpus: 4,
      disk: 10823,
      mem: 2933,
      ports:
        "[1025-2180, 2182-3887, 3889-5049, 5052-8079, 8082-8180, 8182-32000]"
    },
    used_resources: {
      cpus: 0.1,
      disk: 0,
      mem: 16,
      ports: "[10000-10000]"
    }
  }))
};
