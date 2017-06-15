const timestamp01 = 1001;
const timestamp02 = 1002;
const timestamp03 = 1003;
const timestamp04 = 1004;
const timestamp05 = 1005;
const timestamp06 = 1006;
const timestamp07 = 1007;
const timestamp08 = 1008;

module.exports = {
  frameworks: [
    {
      name: "marathon",
      completed_tasks: [
        {
          id: "pod-p0.instance-inst-a1.container-c1",
          name: "c1",
          state: "TASK_RUNNING",
          resources: { cpus: 0.1, mem: 16, disk: 16 },
          statuses: [
            {
              state: "TASK_STAGING",
              timestamp: timestamp01
            },
            {
              state: "TASK_RUNNING",
              timestamp: timestamp02
            }
          ]
        },
        {
          id: "pod-p0.instance-inst-a1.container-c2",
          name: "c2",
          state: "TASK_RUNNING",
          resources: { cpus: 0.1, mem: 16, disk: 0 },
          statuses: [
            {
              state: "TASK_STAGING",
              timestamp: timestamp03
            },
            {
              state: "TASK_RUNNING",
              timestamp: timestamp04
            }
          ]
        },
        {
          id: "pod-p0.instance-inst-a1.container-c3",
          name: "c3",
          state: "TASK_RUNNING",
          resources: { cpus: 0.2, mem: 16, disk: 0 },
          statuses: [
            {
              state: "TASK_STAGING",
              timestamp: timestamp05
            },
            {
              state: "TASK_RUNNING",
              timestamp: timestamp06
            }
          ]
        },
        {
          id: "pod-p0.instance-inst-a2.container-c4",
          name: "c4",
          state: "TASK_RUNNING",
          resources: { cpus: 0.1, mem: 16, gpus: 1 },
          statuses: [
            {
              state: "TASK_RUNNING",
              timestamp: timestamp07
            }
          ]
        },
        {
          id: "pod-p1.instance-inst-a1.container-c1",
          name: "c1",
          state: "TASK_RUNNING",
          resources: { cpus: 0.1, mem: 16, disk: 0 },
          statuses: [
            {
              state: "TASK_RUNNING",
              timestamp: timestamp08
            }
          ]
        }
      ]
    }
  ]
};
