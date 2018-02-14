var response = JSON.stringify({
  type: "SUBSCRIBED",
  subscribed: {
    get_state: {
      get_executors: {},
      get_frameworks: {
        frameworks: [
          {
            active: true,
            checkpoint: true,
            failover_timeout: 604800,
            hostname: "dcos-01",
            framework_info: {
              id: { value: "20150827-210452-1695027628-5050-1445-0000" }
            },
            name: "marathon",
            offered_resources: {
              cpus: 0,
              disk: 0,
              mem: 0
            },
            offers: [],
            pid: "scheduler-88e0ffb7-5d54-4bc4-984b-e546d4b1ebb1@172.17.8.101:47277",
            registered_time: 1443995290.94997,
            resources: [
              { name: "cpus", type: "SCALAR", scalar: { value: 0.1 } },
              { name: "disk", type: "SCALAR", scalar: { value: 0 } },
              { name: "mem", type: "SCALAR", scalar: { value: 16 } },
              {
                name: "ports",
                type: "RANGES",
                ranges: { range: "[10000-10000]" }
              }
            ],
            role: "slave_public",
            unregistered_time: 0,
            used_resources: [
              { name: "cpus", type: "SCALAR", scalar: { value: 0.1 } },
              { name: "disk", type: "SCALAR", scalar: { value: 0 } },
              { name: "mem", type: "SCALAR", scalar: { value: 16 } },
              {
                name: "ports",
                type: "RANGES",
                ranges: { range: "[10000-10000]" }
              }
            ],
            user: "root",
            webui_url: "http://$($MESOS_IP_DISCOVERY_COMMAND):8080"
          }
        ]
      },
      get_tasks: {
        tasks: [
          {
            executor_id: { value: "" },
            framework_id: {
              value: "20150827-210452-1695027628-5050-1445-0000"
            },
            task_id: { value: "sleep.3b430455-6986-11e5-a953-08002719334a" },
            labels: [],
            name: "sleep",
            resources: [
              { name: "cpus", type: "SCALAR", scalar: { value: 0.1 } },
              { name: "disk", type: "SCALAR", scalar: { value: 0 } },
              { name: "mem", type: "SCALAR", scalar: { value: 16 } },
              {
                name: "ports",
                type: "RANGES",
                ranges: { range: "[10000-10000]" }
              }
            ],
            agent_id: { value: "20151002-000353-1695027628-5050-1177-S0" },
            state: "TASK_FINISHED",
            statuses: [
              {
                state: "TASK_RUNNING",
                timestamp: 1443846094.6048
              },
              {
                state: "TASK_FINISHED",
                timestamp: 1443996197.14069
              }
            ]
          },
          {
            executor_id: { value: "" },
            framework_id: {
              value: "20150827-210452-1695027628-5050-1445-0000"
            },
            task_id: { value: "sleep.b7fd2856-6ae3-11e5-a953-08002719334a" },
            labels: [],
            name: "sleep",
            resources: [
              { name: "cpus", type: "SCALAR", scalar: { value: 0.1 } },
              { name: "disk", type: "SCALAR", scalar: { value: 0 } },
              { name: "mem", type: "SCALAR", scalar: { value: 16 } },
              {
                name: "ports",
                type: "RANGES",
                ranges: { range: "[10000-10000]" }
              }
            ],
            agent_id: { value: "20151002-000353-1695027628-5050-1177-S0" },
            state: "TASK_FINISHED",
            statuses: [
              {
                state: "TASK_RUNNING",
                timestamp: 1443996198.21829
              },
              {
                state: "TASK_FINISHED",
                timestamp: 1443999198.2245
              }
            ]
          },
          {
            executor_id: { value: "" },
            framework_id: {
              value: "20150827-210452-1695027628-5050-1445-0000"
            },
            task_id: { value: "sleep.b4b0b847-6aea-11e5-a953-08002719334a" },
            labels: [],
            name: "sleep",
            resources: [
              { name: "cpus", type: "SCALAR", scalar: { value: 0.1 } },
              { name: "disk", type: "SCALAR", scalar: { value: 0 } },
              { name: "mem", type: "SCALAR", scalar: { value: 16 } },
              {
                name: "ports",
                type: "RANGES",
                ranges: { range: "[10000-10000]" }
              }
            ],
            agent_id: { value: "20151002-000353-1695027628-5050-1177-S0" },
            state: "TASK_FINISHED",
            statuses: [
              {
                state: "TASK_RUNNING",
                timestamp: 1443999199.15845
              },
              {
                state: "TASK_FINISHED",
                timestamp: 1444002199.18058
              }
            ]
          },
          {
            executor_id: { value: "" },
            framework_id: {
              value: "20150827-210452-1695027628-5050-1445-0000"
            },
            task_id: { value: "sleep.b0f29aa8-6af1-11e5-a953-08002719334a" },
            labels: [],
            name: "sleep",
            resources: [
              { name: "cpus", type: "SCALAR", scalar: { value: 0.1 } },
              { name: "disk", type: "SCALAR", scalar: { value: 0 } },
              { name: "mem", type: "SCALAR", scalar: { value: 16 } },
              {
                name: "ports",
                type: "RANGES",
                ranges: { range: "[10000-10000]" }
              }
            ],
            agent_id: { value: "20151002-000353-1695027628-5050-1177-S0" },
            state: "TASK_FINISHED",
            statuses: [
              {
                state: "TASK_RUNNING",
                timestamp: 1444002199.3564
              },
              {
                state: "TASK_FINISHED",
                timestamp: 1444005199.3805
              }
            ]
          },
          {
            executor_id: { value: "" },
            framework_id: {
              value: "20150827-210452-1695027628-5050-1445-0000"
            },
            task_id: { value: "sleep.ad30ac79-6af8-11e5-a953-08002719334a" },
            labels: [],
            name: "sleep",
            resources: [
              { name: "cpus", type: "SCALAR", scalar: { value: 0.1 } },
              { name: "disk", type: "SCALAR", scalar: { value: 0 } },
              { name: "mem", type: "SCALAR", scalar: { value: 16 } },
              {
                name: "ports",
                type: "RANGES",
                ranges: { range: "[10000-10000]" }
              }
            ],
            agent_id: { value: "20151002-000353-1695027628-5050-1177-S0" },
            state: "TASK_FINISHED",
            statuses: [
              {
                state: "TASK_RUNNING",
                timestamp: 1444005199.53381
              },
              {
                state: "TASK_FINISHED",
                timestamp: 1444008199.60506
              }
            ]
          },
          {
            executor_id: { value: "" },
            framework_id: {
              value: "20150827-210452-1695027628-5050-1445-0000"
            },
            task_id: { value: "sleep.a9ce918a-6aff-11e5-a953-08002719334a" },
            labels: [],
            name: "sleep",
            resources: [
              { name: "cpus", type: "SCALAR", scalar: { value: 0.1 } },
              { name: "disk", type: "SCALAR", scalar: { value: 0 } },
              { name: "mem", type: "SCALAR", scalar: { value: 16 } },
              {
                name: "ports",
                type: "RANGES",
                ranges: { range: "[10000-10000]" }
              }
            ],
            agent_id: { value: "20151002-000353-1695027628-5050-1177-S0" },
            state: "TASK_FINISHED",
            statuses: [
              {
                state: "TASK_RUNNING",
                timestamp: 1444008200.33441
              },
              {
                state: "TASK_FINISHED",
                timestamp: 1444011200.42012
              }
            ]
          },
          {
            executor_id: { value: "" },
            framework_id: {
              value: "20150827-210452-1695027628-5050-1445-0000"
            },
            task_id: { value: "sleep.a6489aeb-6b06-11e5-a953-08002719334a" },
            labels: [],
            name: "sleep",
            resources: [
              { name: "cpus", type: "SCALAR", scalar: { value: 0.1 } },
              { name: "disk", type: "SCALAR", scalar: { value: 0 } },
              { name: "mem", type: "SCALAR", scalar: { value: 16 } },
              {
                name: "ports",
                type: "RANGES",
                ranges: { range: "[10000-10000]" }
              }
            ],
            agent_id: { value: "20151002-000353-1695027628-5050-1177-S0" },
            state: "TASK_FINISHED",
            statuses: [
              {
                state: "TASK_RUNNING",
                timestamp: 1444011200.89914
              },
              {
                state: "TASK_FINISHED",
                timestamp: 1444014200.97995
              }
            ]
          },
          {
            executor_id: { value: "" },
            framework_id: {
              value: "20150827-210452-1695027628-5050-1445-0000"
            },
            task_id: { value: "sleep.a30f3dac-6b0d-11e5-a953-08002719334a" },
            labels: [],
            name: "sleep",
            resources: [
              { name: "cpus", type: "SCALAR", scalar: { value: 0.1 } },
              { name: "disk", type: "SCALAR", scalar: { value: 0 } },
              { name: "mem", type: "SCALAR", scalar: { value: 16 } },
              {
                name: "ports",
                type: "RANGES",
                ranges: { range: "[10000-10000]" }
              }
            ],
            agent_id: { value: "20151002-000353-1695027628-5050-1177-S0" },
            state: "TASK_FINISHED",
            statuses: [
              {
                state: "TASK_RUNNING",
                timestamp: 1444014201.96757
              },
              {
                state: "TASK_FINISHED",
                timestamp: 1444017201.99879
              }
            ]
          },
          {
            executor_id: { value: "" },
            framework_id: {
              value: "20150827-210452-1695027628-5050-1445-0000"
            },
            task_id: { value: "sleep.9f6ff2ad-6b14-11e5-a953-08002719334a" },
            labels: [],
            name: "sleep",
            resources: [
              { name: "cpus", type: "SCALAR", scalar: { value: 0.1 } },
              { name: "disk", type: "SCALAR", scalar: { value: 0 } },
              { name: "mem", type: "SCALAR", scalar: { value: 16 } },
              {
                name: "ports",
                type: "RANGES",
                ranges: { range: "[10000-10000]" }
              }
            ],
            agent_id: { value: "20151002-000353-1695027628-5050-1177-S0" },
            state: "TASK_FINISHED",
            statuses: [
              {
                state: "TASK_RUNNING",
                timestamp: 1444017202.36779
              },
              {
                state: "TASK_FINISHED",
                timestamp: 1444020202.4466
              }
            ]
          },
          {
            executor_id: { value: "" },
            framework_id: {
              value: "20150827-210452-1695027628-5050-1445-0000"
            },
            task_id: { value: "sleep.9c0b189e-6b1b-11e5-a953-08002719334a" },
            labels: [],
            name: "sleep",
            resources: [
              { name: "cpus", type: "SCALAR", scalar: { value: 0.1 } },
              { name: "disk", type: "SCALAR", scalar: { value: 0 } },
              { name: "mem", type: "SCALAR", scalar: { value: 16 } },
              {
                name: "ports",
                type: "RANGES",
                ranges: { range: "[10000-10000]" }
              }
            ],
            agent_id: { value: "20151002-000353-1695027628-5050-1177-S0" },
            state: "TASK_FINISHED",
            statuses: [
              {
                state: "TASK_RUNNING",
                timestamp: 1444020203.14604
              },
              {
                state: "TASK_FINISHED",
                timestamp: 1444023203.21804
              }
            ]
          },
          {
            executor_id: { value: "" },
            framework_id: {
              value: "20150827-210452-1695027628-5050-1445-0000"
            },
            task_id: { value: "sleep.98a2e32f-6b22-11e5-a953-08002719334a" },
            labels: [],
            name: "sleep",
            resources: [
              { name: "cpus", type: "SCALAR", scalar: { value: 0.1 } },
              { name: "disk", type: "SCALAR", scalar: { value: 0 } },
              { name: "mem", type: "SCALAR", scalar: { value: 16 } },
              {
                name: "ports",
                type: "RANGES",
                ranges: { range: "[10000-10000]" }
              }
            ],
            agent_id: { value: "20151002-000353-1695027628-5050-1177-S0" },
            state: "TASK_FINISHED",
            statuses: [
              {
                state: "TASK_RUNNING",
                timestamp: 1444023203.91109
              },
              {
                state: "TASK_FINISHED",
                timestamp: 1444026203.9707
              }
            ]
          },
          {
            executor_id: { value: "" },
            framework_id: {
              value: "20150827-210452-1695027628-5050-1445-0000"
            },
            task_id: { value: "sleep.9566c6d0-6b29-11e5-a953-08002719334a" },
            labels: [],
            name: "sleep",
            resources: [
              { name: "cpus", type: "SCALAR", scalar: { value: 0.1 } },
              { name: "disk", type: "SCALAR", scalar: { value: 0 } },
              { name: "mem", type: "SCALAR", scalar: { value: 16 } },
              {
                name: "ports",
                type: "RANGES",
                ranges: { range: "[10000-10000]" }
              }
            ],
            agent_id: { value: "20151002-000353-1695027628-5050-1177-S0" },
            state: "TASK_FINISHED",
            statuses: [
              {
                state: "TASK_RUNNING",
                timestamp: 1444026204.96326
              },
              {
                state: "TASK_FINISHED",
                timestamp: 1444029204.97044
              }
            ]
          },
          {
            executor_id: { value: "" },
            framework_id: {
              value: "20150827-210452-1695027628-5050-1445-0000"
            },
            task_id: { value: "sleep.91c88d41-6b30-11e5-a953-08002719334a" },
            labels: [],
            name: "sleep",
            resources: [
              { name: "cpus", type: "SCALAR", scalar: { value: 0.1 } },
              { name: "disk", type: "SCALAR", scalar: { value: 0 } },
              { name: "mem", type: "SCALAR", scalar: { value: 16 } },
              {
                name: "ports",
                type: "RANGES",
                ranges: { range: "[10000-10000]" }
              }
            ],
            agent_id: { value: "20151002-000353-1695027628-5050-1177-S0" },
            state: "TASK_FINISHED",
            statuses: [
              {
                state: "TASK_RUNNING",
                timestamp: 1444029205.36863
              },
              {
                state: "TASK_FINISHED",
                timestamp: 1444032205.46451
              }
            ]
          },
          {
            executor_id: { value: "" },
            framework_id: {
              value: "20150827-210452-1695027628-5050-1445-0000"
            },
            task_id: { value: "sleep.8e505242-6b37-11e5-a953-08002719334a" },
            labels: [],
            name: "sleep",
            resources: [
              { name: "cpus", type: "SCALAR", scalar: { value: 0.1 } },
              { name: "disk", type: "SCALAR", scalar: { value: 0 } },
              { name: "mem", type: "SCALAR", scalar: { value: 16 } },
              {
                name: "ports",
                type: "RANGES",
                ranges: { range: "[10000-10000]" }
              }
            ],
            agent_id: { value: "20151002-000353-1695027628-5050-1177-S0" },
            state: "TASK_FINISHED",
            statuses: [
              {
                state: "TASK_RUNNING",
                timestamp: 1444032206.02287
              },
              {
                state: "TASK_FINISHED",
                timestamp: 1444035206.10147
              }
            ]
          },
          {
            executor_id: { value: "" },
            framework_id: {
              value: "20150827-210452-1695027628-5050-1445-0000"
            },
            task_id: { value: "sleep.8b0e1b63-6b3e-11e5-a953-08002719334a" },
            labels: [],
            name: "sleep",
            resources: [
              { name: "cpus", type: "SCALAR", scalar: { value: 0.1 } },
              { name: "disk", type: "SCALAR", scalar: { value: 0 } },
              { name: "mem", type: "SCALAR", scalar: { value: 16 } },
              {
                name: "ports",
                type: "RANGES",
                ranges: { range: "[10000-10000]" }
              }
            ],
            agent_id: { value: "20151002-000353-1695027628-5050-1177-S0" },
            state: "TASK_FINISHED",
            statuses: [
              {
                state: "TASK_RUNNING",
                timestamp: 1444035207.03334
              },
              {
                state: "TASK_FINISHED",
                timestamp: 1444038207.10142
              }
            ]
          },
          {
            executor_id: { value: "" },
            framework_id: {
              value: "20150827-210452-1695027628-5050-1445-0000"
            },
            task_id: { value: "sleep.87d22614-6b45-11e5-a953-08002719334a" },
            labels: [],
            name: "sleep",
            resources: [
              { name: "cpus", type: "SCALAR", scalar: { value: 0.1 } },
              { name: "disk", type: "SCALAR", scalar: { value: 0 } },
              { name: "mem", type: "SCALAR", scalar: { value: 16 } },
              {
                name: "ports",
                type: "RANGES",
                ranges: { range: "[10000-10000]" }
              }
            ],
            agent_id: { value: "20151002-000353-1695027628-5050-1177-S0" },
            state: "TASK_FINISHED",
            statuses: [
              {
                state: "TASK_RUNNING",
                timestamp: 1444038208.08709
              },
              {
                state: "TASK_FINISHED",
                timestamp: 1444041208.14045
              }
            ]
          },
          {
            executor_id: { value: "" },
            framework_id: {
              value: "20150827-210452-1695027628-5050-1445-0000"
            },
            task_id: { value: "sleep.843c9f15-6b4c-11e5-a953-08002719334a" },
            labels: [],
            name: "sleep",
            resources: [
              { name: "cpus", type: "SCALAR", scalar: { value: 0.1 } },
              { name: "disk", type: "SCALAR", scalar: { value: 0 } },
              { name: "mem", type: "SCALAR", scalar: { value: 16 } },
              {
                name: "ports",
                type: "RANGES",
                ranges: { range: "[10000-10000]" }
              }
            ],
            agent_id: { value: "20151002-000353-1695027628-5050-1177-S0" },
            state: "TASK_FINISHED",
            statuses: [
              {
                state: "TASK_RUNNING",
                timestamp: 1444041208.54866
              },
              {
                state: "TASK_FINISHED",
                timestamp: 1444044208.57445
              }
            ]
          },
          {
            executor_id: { value: "" },
            framework_id: {
              value: "20150827-210452-1695027628-5050-1445-0000"
            },
            task_id: { value: "sleep.81025776-6b53-11e5-a953-08002719334a" },
            labels: [],
            name: "sleep",
            resources: [
              { name: "cpus", type: "SCALAR", scalar: { value: 0.1 } },
              { name: "disk", type: "SCALAR", scalar: { value: 0 } },
              { name: "mem", type: "SCALAR", scalar: { value: 16 } },
              {
                name: "ports",
                type: "RANGES",
                ranges: { range: "[10000-10000]" }
              }
            ],
            agent_id: { value: "20151002-000353-1695027628-5050-1177-S0" },
            state: "TASK_FINISHED",
            statuses: [
              {
                state: "TASK_RUNNING",
                timestamp: 1444044209.61482
              },
              {
                state: "TASK_FINISHED",
                timestamp: 1444047209.64726
              }
            ]
          },
          {
            executor_id: { value: "" },
            framework_id: {
              value: "20150827-210452-1695027628-5050-1445-0000"
            },
            task_id: { value: "sleep.7dcddc37-6b5a-11e5-a953-08002719334a" },
            labels: [],
            name: "sleep",
            resources: [
              { name: "cpus", type: "SCALAR", scalar: { value: 0.1 } },
              { name: "disk", type: "SCALAR", scalar: { value: 0 } },
              { name: "mem", type: "SCALAR", scalar: { value: 16 } },
              {
                name: "ports",
                type: "RANGES",
                ranges: { range: "[10000-10000]" }
              }
            ],
            agent_id: { value: "20151002-000353-1695027628-5050-1177-S0" },
            state: "TASK_FINISHED",
            statuses: [
              {
                state: "TASK_RUNNING",
                timestamp: 1444047210.71503
              },
              {
                state: "TASK_FINISHED",
                timestamp: 1444050210.77893
              }
            ]
          },
          {
            executor_id: { value: "" },
            framework_id: {
              value: "20150827-210452-1695027628-5050-1445-0000"
            },
            task_id: { value: "sleep.7a315058-6b61-11e5-a953-08002719334a" },
            labels: [],
            name: "sleep",
            resources: [
              { name: "cpus", type: "SCALAR", scalar: { value: 0.1 } },
              { name: "disk", type: "SCALAR", scalar: { value: 0 } },
              { name: "mem", type: "SCALAR", scalar: { value: 16 } },
              {
                name: "ports",
                type: "RANGES",
                ranges: { range: "[10000-10000]" }
              }
            ],
            agent_id: { value: "20151002-000353-1695027628-5050-1177-S0" },
            state: "TASK_FINISHED",
            statuses: [
              {
                state: "TASK_RUNNING",
                timestamp: 1444050211.12949
              },
              {
                state: "TASK_FINISHED",
                timestamp: 1444053211.20732
              }
            ]
          },
          {
            executor_id: { value: "" },
            framework_id: {
              value: "20150827-210452-1695027628-5050-1445-0000"
            },
            task_id: { value: "sleep.76f33829-6b68-11e5-a953-08002719334a" },
            labels: [],
            name: "sleep",
            resources: [
              { name: "cpus", type: "SCALAR", scalar: { value: 0.1 } },
              { name: "disk", type: "SCALAR", scalar: { value: 0 } },
              { name: "mem", type: "SCALAR", scalar: { value: 16 } },
              {
                name: "ports",
                type: "RANGES",
                ranges: { range: "[10000-10000]" }
              }
            ],
            agent_id: { value: "20151002-000353-1695027628-5050-1177-S0" },
            state: "TASK_FINISHED",
            statuses: [
              {
                state: "TASK_RUNNING",
                timestamp: 1444053212.16655
              },
              {
                state: "TASK_FINISHED",
                timestamp: 1444056212.25805
              }
            ]
          },
          {
            executor_id: { value: "" },
            framework_id: {
              value: "20150827-210452-1695027628-5050-1445-0000"
            },
            task_id: { value: "sleep.73c880ea-6b6f-11e5-a953-08002719334a" },
            labels: [],
            name: "sleep",
            resources: [
              { name: "cpus", type: "SCALAR", scalar: { value: 0.1 } },
              { name: "disk", type: "SCALAR", scalar: { value: 0 } },
              { name: "mem", type: "SCALAR", scalar: { value: 16 } },
              {
                name: "ports",
                type: "RANGES",
                ranges: { range: "[10000-10000]" }
              }
            ],
            agent_id: { value: "20151002-000353-1695027628-5050-1177-S0" },
            state: "TASK_FINISHED",
            statuses: [
              {
                state: "TASK_RUNNING",
                timestamp: 1444056213.33406
              },
              {
                state: "TASK_FINISHED",
                timestamp: 1444059213.41515
              }
            ]
          },
          {
            executor_id: { value: "" },
            framework_id: {
              value: "20150827-210452-1695027628-5050-1445-0000"
            },
            task_id: { value: "sleep.7084272b-6b76-11e5-a953-08002719334a" },
            labels: [],
            name: "sleep",
            resources: [
              { name: "cpus", type: "SCALAR", scalar: { value: 0.1 } },
              { name: "disk", type: "SCALAR", scalar: { value: 0 } },
              { name: "mem", type: "SCALAR", scalar: { value: 16 } },
              {
                name: "ports",
                type: "RANGES",
                ranges: { range: "[10000-10000]" }
              }
            ],
            agent_id: { value: "20151002-000353-1695027628-5050-1177-S0" },
            state: "TASK_RUNNING",
            statuses: [
              {
                state: "TASK_RUNNING",
                timestamp: 1444059214.32713,
                container_status: {
                  container_id: {
                    value: "2f6cd6c5-cc11-4ea6-adbe-a4f02439d9d2"
                  },
                  network_infos: [
                    {
                      labels: [
                        {
                          key: "DCOS_SPACE",
                          value: "/sleep"
                        }
                      ],
                      ip_addresses: [
                        {
                          protocol: "IPv4",
                          ip_address: "9.0.2.34"
                        }
                      ],
                      name: "dcos-1"
                    }
                  ]
                }
              }
            ]
          },
          {
            executor_id: { value: "" },
            framework_id: {
              value: "20150827-210452-1695027628-5050-1445-0000"
            },
            task_id: { value: "sleep.7084272b-6b76-11e5-a953-08002719334b" },
            labels: [],
            name: "sleep",
            resources: [
              { name: "cpus", type: "SCALAR", scalar: { value: 0.5 } },
              { name: "disk", type: "SCALAR", scalar: { value: 0 } },
              { name: "mem", type: "SCALAR", scalar: { value: 16 } },
              {
                name: "ports",
                type: "RANGES",
                ranges: { range: "[10000-10000]" }
              }
            ],
            agent_id: { value: "20151002-000353-1695027628-5050-1177-S1" },
            state: "TASK_RUNNING",
            statuses: [
              {
                state: "TASK_RUNNING",
                timestamp: 1444059214.32713,
                container_status: {
                  container_id: {
                    value: "2f6cd6c5-cc11-4ea6-adbe-a4f02439d9d2"
                  },
                  network_infos: [
                    {
                      labels: [
                        {
                          key: "DCOS_SPACE",
                          value: "/sleep"
                        }
                      ],
                      ip_addresses: [
                        {
                          protocol: "IPv4",
                          ip_address: "9.0.2.34"
                        }
                      ],
                      name: "dcos-1"
                    }
                  ]
                }
              }
            ]
          },
          {
            executor_id: { value: "" },
            framework_id: {
              value: "20150827-210452-1695027628-5050-1445-0000"
            },
            task_id: { value: "sleep.7084272b-6b76-11e5-a953-08002719334c" },
            labels: [],
            name: "sleep",
            resources: [
              { name: "cpus", type: "SCALAR", scalar: { value: 0.1 } },
              { name: "disk", type: "SCALAR", scalar: { value: 0 } },
              { name: "mem", type: "SCALAR", scalar: { value: 16 } },
              {
                name: "ports",
                type: "RANGES",
                ranges: { range: "[10000-10000]" }
              }
            ],
            agent_id: { value: "20151002-000353-1695027628-5050-1177-S2" },
            state: "TASK_RUNNING",
            statuses: [
              {
                state: "TASK_RUNNING",
                timestamp: 1444059214.32713,
                container_status: {
                  container_id: {
                    value: "2f6cd6c5-cc11-4ea6-adbe-a4f02439d9d2"
                  },
                  network_infos: [
                    {
                      labels: [
                        {
                          key: "DCOS_SPACE",
                          value: "/sleep"
                        }
                      ],
                      ip_addresses: [
                        {
                          protocol: "IPv4",
                          ip_address: "9.0.2.34"
                        }
                      ],
                      name: "dcos-1"
                    }
                  ]
                }
              }
            ]
          }
        ]
      },
      get_agents: {
        agents: [
          {
            active: true,
            attributes: {},
            hostname: "dcos-01",
            id: { value: "20151002-000353-1695027628-5050-1177-S0" },
            offered_resources: {
              cpus: 0,
              disk: 0,
              mem: 0
            },
            domain: {
              fault_domain: {
                region: {
                  name: "eu-central-1"
                },
                zone: { name: "eu-central-1c" }
              }
            },
            pid: "slave(1)@172.17.8.101:5051",
            registered_time: 1443995289.19971,
            reregistered_time: 1443995289.19981,
            reserved_resources: {},
            resources: {
              cpus: 4,
              disk: 10823,
              mem: 2933,
              ports: "[1025-2180, 2182-3887, 3889-5049, 5052-8079, 8082-8180, 8182-32000]"
            },
            unreserved_resources: {
              cpus: 4,
              disk: 10823,
              mem: 2933,
              ports: "[1025-2180, 2182-3887, 3889-5049, 5052-8079, 8082-8180, 8182-32000]"
            },
            used_resources: {
              cpus: 0.1,
              disk: 0,
              mem: 16,
              ports: "[10000-10000]"
            }
          },
          {
            active: true,
            attributes: {},
            hostname: "dcos-02",
            id: { value: "20151002-000353-1695027628-5050-1177-S1" },
            offered_resources: {
              cpus: 0,
              disk: 0,
              mem: 0
            },
            domain: {
              fault_domain: {
                region: {
                  name: "eu-central-1"
                },
                zone: { name: "eu-central-1b" }
              }
            },
            pid: "slave(1)@172.17.8.101:5051",
            registered_time: 1443995289.19971,
            reregistered_time: 1443995289.19981,
            reserved_resources: {},
            resources: {
              cpus: 4,
              disk: 10823,
              mem: 2933,
              ports: "[1025-2180, 2182-3887, 3889-5049, 5052-8079, 8082-8180, 8182-32000]"
            },
            unreserved_resources: {
              cpus: 4,
              disk: 10823,
              mem: 2933,
              ports: "[1025-2180, 2182-3887, 3889-5049, 5052-8079, 8082-8180, 8182-32000]"
            },
            used_resources: {
              cpus: 0.1,
              disk: 0,
              mem: 16,
              ports: "[10000-10000]"
            }
          },
          {
            active: true,
            attributes: {},
            hostname: "dcos-03",
            id: { value: "20151002-000353-1695027628-5050-1177-S2" },
            offered_resources: {
              cpus: 0,
              disk: 0,
              mem: 0
            },
            domain: {
              fault_domain: {
                region: {
                  name: "ap-northeast-1"
                },
                zone: { name: "ap-northeast-1a" }
              }
            },
            pid: "slave(1)@172.17.8.101:5051",
            registered_time: 1443995289.19971,
            reregistered_time: 1443995289.19981,
            reserved_resources: {},
            resources: {
              cpus: 4,
              disk: 10823,
              mem: 2933,
              ports: "[1025-2180, 2182-3887, 3889-5049, 5052-8079, 8082-8180, 8182-32000]"
            },
            unreserved_resources: {
              cpus: 4,
              disk: 10823,
              mem: 2933,
              ports: "[1025-2180, 2182-3887, 3889-5049, 5052-8079, 8082-8180, 8182-32000]"
            },
            used_resources: {
              cpus: 0.1,
              disk: 0,
              mem: 16,
              ports: "[10000-10000]"
            }
          }
        ]
      }
    }
  }
});

module.exports = response.length + "\n" + response;
