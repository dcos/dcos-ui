const MarathonUtil = require("../MarathonUtil");

describe("MarathonUtil", function() {
  describe("#parseGroups", function() {
    it("throws error if the provided id doesn't start with a slash", function() {
      expect(function() {
        MarathonUtil.parseGroups({ id: "malformed/id" });
      }).toThrow();
    });

    it("throws error if an app id doesn't start with a slash", function() {
      expect(function() {
        MarathonUtil.parseGroups({ id: "/", apps: [{ id: "malformed/id" }] });
      }).toThrow();
    });

    it("throws error if the provided id ends with a slash", function() {
      expect(function() {
        MarathonUtil.parseGroups({ id: "/malformed/id/" });
      }).toThrow();
    });

    it("throws error if an app id ends with a slash", function() {
      expect(function() {
        MarathonUtil.parseGroups({ id: "/", apps: [{ id: "/malformed/id/" }] });
      }).toThrow();
    });

    it("does not throw error if the provided id is only a slash (root id)", function() {
      expect(function() {
        MarathonUtil.parseGroups({ id: "/" });
      }).not.toThrow();
    });

    it("throws error if an app id is only a slash (root id)", function() {
      expect(function() {
        MarathonUtil.parseGroups({ id: "/", apps: [{ id: "/" }] });
      }).toThrow();
    });

    it("converts groups to tree", function() {
      var instance = MarathonUtil.parseGroups({
        id: "/",
        apps: [{ id: "/alpha" }],
        groups: [{ id: "/foo", apps: [{ id: "/foo/beta" }] }]
      });

      expect(instance).toEqual({
        id: "/",
        items: [{ id: "/foo", items: [{ id: "/foo/beta" }] }, { id: "/alpha" }]
      });
    });

    it("correctly parses external volumes", function() {
      var instance = MarathonUtil.parseGroups({
        id: "/",
        apps: [
          {
            id: "/alpha",
            container: {
              volumes: [
                {
                  containerPath: "path",
                  external: {
                    size: 2048,
                    name: "volume-name",
                    options: { "volume/driver": "value" },
                    provider: "volume-provide"
                  },
                  mode: "RW"
                }
              ]
            }
          }
        ]
      });

      expect(instance.items[0].volumes[0]).toEqual({
        containerPath: "path",
        id: "volume-name",
        name: "volume-name",
        mode: "RW",
        options: { "volume/driver": "value" },
        provider: "volume-provide",
        size: 2048,
        status: "Unavailable",
        type: "External"
      });
    });

    it("correctly parses persistent volumes", function() {
      var instance = MarathonUtil.parseGroups({
        id: "/",
        apps: [
          {
            id: "/alpha",
            container: {
              volumes: [
                {
                  containerPath: "path",
                  mode: "RW",
                  persistent: {
                    size: 2048,
                    type: "root"
                  }
                }
              ]
            },
            tasks: [
              {
                id: "task-id-1",
                host: "0.0.0.1",
                startedAt: "2016-06-03T16:22:30.282Z",
                localVolumes: [
                  {
                    containerPath: "path",
                    persistenceId: "volume-id-1"
                  }
                ]
              }
            ]
          }
        ]
      });

      expect(instance.items[0].volumes[0]).toEqual({
        containerPath: "path",
        host: "0.0.0.1",
        id: "volume-id-1",
        mode: "RW",
        size: 2048,
        status: "Attached",
        taskID: "task-id-1",
        type: "Persistent"
      });
    });

    it("correctly parses multiple persistent volumes", function() {
      var instance = MarathonUtil.parseGroups({
        id: "/",
        apps: [
          {
            id: "/alpha",
            container: {
              volumes: [
                {
                  containerPath: "path",
                  mode: "RW",
                  persistent: {
                    size: 2048,
                    type: "root"
                  }
                }
              ]
            },
            tasks: [
              {
                id: "task-id-1",
                host: "0.0.0.1",
                startedAt: "2016-06-03T16:22:30.282Z",
                localVolumes: [
                  {
                    containerPath: "path",
                    persistenceId: "volume-id-1"
                  }
                ]
              },
              {
                id: "task-id-2",
                host: "0.0.0.1",
                startedAt: "2016-06-03T16:22:30.282Z",
                localVolumes: [
                  {
                    containerPath: "path",
                    persistenceId: "volume-id-2"
                  }
                ]
              }
            ]
          }
        ]
      });

      expect(instance.items[0].volumes[0].id).toEqual("volume-id-1");
      expect(instance.items[0].volumes[1].id).toEqual("volume-id-2");
    });

    it("correctly determine persistent volume attached status", function() {
      var instance = MarathonUtil.parseGroups({
        id: "/",
        apps: [
          {
            id: "/alpha",
            container: {
              volumes: [
                {
                  containerPath: "path",
                  mode: "RW",
                  persistent: {
                    size: 2048
                  }
                }
              ]
            },
            tasks: [
              {
                id: "task-id",
                host: "0.0.0.1",
                startedAt: "2016-06-03T16:22:30.282Z",
                localVolumes: [
                  {
                    containerPath: "path",
                    persistenceId: "volume-id"
                  }
                ]
              }
            ]
          }
        ]
      });

      expect(instance.items[0].volumes[0].status).toEqual("Attached");
    });

    it("correctly determine persistent volume detached status", function() {
      var instance = MarathonUtil.parseGroups({
        id: "/",
        apps: [
          {
            id: "/alpha",
            container: {
              volumes: [
                {
                  containerPath: "path",
                  mode: "RW",
                  persistent: {
                    size: 2048
                  }
                }
              ]
            },
            tasks: [
              {
                id: "task-id",
                host: "0.0.0.1",
                localVolumes: [
                  {
                    containerPath: "path",
                    persistenceId: "volume-id"
                  }
                ]
              }
            ]
          }
        ]
      });

      expect(instance.items[0].volumes[0].status).toEqual("Detached");
    });

    it("doesn't throw when localVolumes is null", function() {
      var instance = MarathonUtil.parseGroups.bind(MarathonUtil, {
        id: "/",
        apps: [
          {
            id: "/alpha",
            container: {
              volumes: [
                {
                  containerPath: "path",
                  mode: "RW",
                  persistent: {
                    size: 2048
                  }
                }
              ]
            },
            tasks: [
              {
                id: "task-id",
                host: "0.0.0.1",
                localVolumes: null
              }
            ]
          }
        ]
      });

      expect(instance).not.toThrow();
    });

    it("doesn't throw when localVolumes is not present", function() {
      var instance = MarathonUtil.parseGroups.bind(MarathonUtil, {
        id: "/",
        apps: [
          {
            id: "/alpha",
            container: {
              volumes: [
                {
                  containerPath: "path",
                  mode: "RW",
                  persistent: {
                    size: 2048
                  }
                }
              ]
            },
            tasks: [
              {
                id: "task-id",
                host: "0.0.0.1"
              }
            ]
          }
        ]
      });

      expect(instance).not.toThrow();
    });

    it("doesn't adds volumes array to all services", function() {
      var instance = MarathonUtil.parseGroups({
        id: "/",
        apps: [{ id: "/alpha" }]
      });

      expect(instance.items[0]).toEqual({ id: "/alpha" });
    });
  });
  describe("#parsePods", function() {
    it("contains a pod without volumes", function() {
      const data = MarathonUtil.parseGroups({
        id: "/pod-without-volumes",
        spec: {
          id: "/pod-without-volumes",
          version: "2018-04-30T13:36:15.993Z",
          containers: [
            {
              name: "container-1",
              resources: {
                cpus: 0.1,
                mem: 128,
                disk: 0,
                gpus: 0
              },
              image: {
                kind: "DOCKER",
                id: "nginx"
              }
            }
          ],
          networks: [
            {
              mode: "host"
            }
          ],
          scaling: {
            kind: "fixed",
            instances: 1
          },
          scheduling: {
            backoff: {
              backoff: 1,
              backoffFactor: 1.15,
              maxLaunchDelay: 3600
            },
            upgrade: {
              minimumHealthCapacity: 1,
              maximumOverCapacity: 1
            },
            killSelection: "YOUNGEST_FIRST",
            unreachableStrategy: {
              inactiveAfterSeconds: 0,
              expungeAfterSeconds: 0
            }
          },
          executorResources: {
            cpus: 0.1,
            mem: 32,
            disk: 10
          }
        },
        status: "STABLE",
        statusSince: "2018-04-30T13:36:22.741Z",
        instances: [
          {
            id: "pod-without-volumes.instance-75490c65-4c7b-11e8-9c30-2641ffb20201",
            status: "STABLE",
            statusSince: "2018-04-30T13:36:22.741Z",
            conditions: [],
            resources: {
              cpus: 0.2,
              mem: 160,
              disk: 10,
              gpus: 0
            },
            networks: [
              {
                addresses: ["10.0.2.229"]
              }
            ],
            containers: [
              {
                name: "container-1",
                status: "TASK_RUNNING",
                statusSince: "2018-04-30T13:36:22.741Z",
                conditions: [],
                containerId: "pod-without-volumes.instance-75490c65-4c7b-11e8-9c30-2641ffb20201.container-1",
                endpoints: [],
                resources: {
                  cpus: 0.1,
                  mem: 128,
                  disk: 0,
                  gpus: 0
                },
                lastUpdated: "2018-04-30T13:36:22.741Z",
                lastChanged: "2018-04-30T13:36:22.741Z"
              }
            ],
            specReference: "/v2/pods/pod-without-volumes::versions/2018-04-30T13:36:15.993Z",
            localVolumes: [],
            lastUpdated: "2018-04-30T13:36:22.741Z",
            lastChanged: "2018-04-30T13:36:22.741Z"
          }
        ],
        terminationHistory: [],
        lastUpdated: "2018-04-30T13:36:51.756Z",
        lastChanged: "2018-04-30T13:36:22.741Z"
      });

      expect(data).toEqual({ id: "/pod-without-volumes", items: [] });
    });

    it("contains a pod with volumes and mounts in all containers", function() {
      const data = MarathonUtil.parseGroups({
        id: "/",
        dependencies: [],
        version: "2018-04-30T13:51:40.599Z",
        apps: [],
        groups: [],
        pods: [
          {
            id: "/pod-with-volume",
            spec: {
              id: "/pod-with-volume",
              version: "2018-04-30T13:51:40.599Z",
              containers: [
                {
                  name: "container-1",
                  resources: { cpus: 0.1, mem: 128, disk: 0, gpus: 0 },
                  image: { kind: "DOCKER", id: "nginx" },
                  volumeMounts: [
                    { name: "home", mountPath: "/var/log", readOnly: false }
                  ]
                }
              ],
              volumes: [
                {
                  name: "home",
                  persistent: { type: "root", size: 10, constraints: [] }
                }
              ],
              networks: [{ mode: "host" }],
              scaling: { kind: "fixed", instances: 1 },
              scheduling: {
                backoff: {
                  backoff: 1,
                  backoffFactor: 1.15,
                  maxLaunchDelay: 3600
                },
                upgrade: { minimumHealthCapacity: 0.5, maximumOverCapacity: 0 },
                killSelection: "YOUNGEST_FIRST",
                unreachableStrategy: "disabled"
              },
              executorResources: { cpus: 0.1, mem: 32, disk: 10 }
            },
            status: "DEGRADED",
            statusSince: "2018-04-30T13:52:01.687Z",
            instances: [
              {
                id: "pod-with-volume.instance-9bf97559-4c7d-11e8-9c30-2641ffb20201",
                status: "STAGING",
                statusSince: "2018-04-30T13:52:01.687Z",
                conditions: [],
                resources: { cpus: 0.2, mem: 160, disk: 10, gpus: 0 },
                networks: [],
                containers: [
                  {
                    name: "container-1",
                    status: "TASK_STARTING",
                    statusSince: "2018-04-30T13:52:00.698Z",
                    conditions: [],
                    containerId: "pod-with-volume.instance-9bf97559-4c7d-11e8-9c30-2641ffb20201.container-1.8",
                    endpoints: [],
                    resources: { cpus: 0.1, mem: 128, disk: 0, gpus: 0 },
                    lastUpdated: "2018-04-30T13:52:00.698Z",
                    lastChanged: "2018-04-30T13:52:00.698Z"
                  }
                ],
                specReference: "/v2/pods/pod-with-volume::versions/2018-04-30T13:51:40.599Z",
                localVolumes: [
                  {
                    runSpecId: "/pod-with-volume",
                    containerPath: "home",
                    uuid: "9bf97558-4c7d-11e8-9c30-2641ffb20201",
                    persistenceId: "pod-with-volume#home#9bf97558-4c7d-11e8-9c30-2641ffb20201"
                  }
                ],
                lastUpdated: "2018-04-30T13:52:01.687Z",
                lastChanged: "2018-04-30T13:52:01.687Z"
              }
            ],
            terminationHistory: [],
            lastUpdated: "2018-04-30T13:59:11.717Z",
            lastChanged: "2018-04-30T13:52:01.687Z"
          }
        ]
      });

      expect(data).toEqual({
        id: "/",
        items: [
          {
            id: "/pod-with-volume",
            instances: [
              {
                conditions: [],
                containers: [
                  {
                    conditions: [],
                    containerId: "pod-with-volume.instance-9bf97559-4c7d-11e8-9c30-2641ffb20201.container-1.8",
                    endpoints: [],
                    lastChanged: "2018-04-30T13:52:00.698Z",
                    lastUpdated: "2018-04-30T13:52:00.698Z",
                    name: "container-1",
                    resources: { cpus: 0.1, disk: 0, gpus: 0, mem: 128 },
                    status: "TASK_STARTING",
                    statusSince: "2018-04-30T13:52:00.698Z"
                  }
                ],
                id: "pod-with-volume.instance-9bf97559-4c7d-11e8-9c30-2641ffb20201",
                lastChanged: "2018-04-30T13:52:01.687Z",
                lastUpdated: "2018-04-30T13:52:01.687Z",
                localVolumes: [
                  {
                    containerPath: "home",
                    persistenceId: "pod-with-volume#home#9bf97558-4c7d-11e8-9c30-2641ffb20201",
                    runSpecId: "/pod-with-volume",
                    uuid: "9bf97558-4c7d-11e8-9c30-2641ffb20201"
                  }
                ],
                networks: [],
                resources: { cpus: 0.2, disk: 10, gpus: 0, mem: 160 },
                specReference: "/v2/pods/pod-with-volume::versions/2018-04-30T13:51:40.599Z",
                status: "STAGING",
                statusSince: "2018-04-30T13:52:01.687Z"
              }
            ],
            lastChanged: "2018-04-30T13:52:01.687Z",
            lastUpdated: "2018-04-30T13:59:11.717Z",
            spec: {
              containers: [
                {
                  image: { id: "nginx", kind: "DOCKER" },
                  name: "container-1",
                  resources: { cpus: 0.1, disk: 0, gpus: 0, mem: 128 },
                  volumeMounts: [
                    { mountPath: "/var/log", name: "home", readOnly: false }
                  ]
                }
              ],
              executorResources: { cpus: 0.1, disk: 10, mem: 32 },
              id: "/pod-with-volume",
              networks: [{ mode: "host" }],
              scaling: { instances: 1, kind: "fixed" },
              scheduling: {
                backoff: {
                  backoff: 1,
                  backoffFactor: 1.15,
                  maxLaunchDelay: 3600
                },
                killSelection: "YOUNGEST_FIRST",
                unreachableStrategy: "disabled",
                upgrade: { maximumOverCapacity: 0, minimumHealthCapacity: 0.5 }
              },
              version: "2018-04-30T13:51:40.599Z",
              volumes: [
                {
                  name: "home",
                  persistent: { constraints: [], size: 10, type: "root" }
                }
              ]
            },
            status: "DEGRADED",
            statusSince: "2018-04-30T13:52:01.687Z",
            terminationHistory: [],
            volumeData: [
              {
                containerPath: "home",
                host: undefined,
                id: "pod-with-volume#home#9bf97558-4c7d-11e8-9c30-2641ffb20201",
                mode: undefined,
                mounts: [
                  { containerName: "container-1", mountPath: "/var/log" }
                ],
                size: 10,
                status: "Detached",
                taskID: "pod-with-volume.instance-9bf97559-4c7d-11e8-9c30-2641ffb20201",
                type: "Persistent"
              }
            ]
          }
        ]
      });
    });
    it("contains a pod with volumes and mounts in only one container", function() {
      const data = MarathonUtil.parseGroups({
        id: "/",
        dependencies: [],
        version: "2018-04-30T13:59:05.786Z",
        apps: [],
        groups: [],
        pods: [
          {
            id: "/pod-with-volume",
            spec: {
              id: "/pod-with-volume",
              version: "2018-04-30T13:59:05.786Z",
              containers: [
                {
                  name: "container-1",
                  resources: { cpus: 0.1, mem: 128, disk: 0, gpus: 0 },
                  image: { kind: "DOCKER", id: "nginx" },
                  volumeMounts: [
                    { name: "home", mountPath: "/var/log", readOnly: false }
                  ]
                },
                {
                  name: "container-2",
                  exec: {
                    command: { shell: "while true; do: sleep 1000; done;" }
                  },
                  resources: { cpus: 0.1, mem: 128, disk: 0, gpus: 0 },
                  image: { kind: "DOCKER", id: "alpine" }
                }
              ],
              volumes: [
                {
                  name: "home",
                  persistent: { type: "root", size: 10, constraints: [] }
                }
              ],
              networks: [{ mode: "host" }],
              scaling: { kind: "fixed", instances: 1 },
              scheduling: {
                backoff: {
                  backoff: 1,
                  backoffFactor: 1.15,
                  maxLaunchDelay: 3600
                },
                upgrade: { minimumHealthCapacity: 0.5, maximumOverCapacity: 0 },
                killSelection: "YOUNGEST_FIRST",
                unreachableStrategy: "disabled"
              },
              executorResources: { cpus: 0.1, mem: 32, disk: 10 }
            },
            status: "DEGRADED",
            statusSince: "2018-04-30T13:59:08.689Z",
            instances: [
              {
                id: "pod-with-volume.instance-a643c6eb-4c7e-11e8-9c30-2641ffb20201",
                status: "STAGING",
                statusSince: "2018-04-30T13:59:08.689Z",
                conditions: [],

                resources: {
                  cpus: 0.30000000000000004,
                  mem: 288,
                  disk: 10,
                  gpus: 0
                },
                networks: [],
                containers: [
                  {
                    name: "container-1",
                    status: "TASK_STARTING",
                    statusSince: "2018-04-30T13:59:07.759Z",
                    conditions: [],
                    containerId: "pod-with-volume.instance-a643c6eb-4c7e-11e8-9c30-2641ffb20201.container-1.1",
                    endpoints: [],
                    resources: { cpus: 0.1, mem: 128, disk: 0, gpus: 0 },
                    lastUpdated: "2018-04-30T13:59:07.759Z",
                    lastChanged: "2018-04-30T13:59:07.759Z"
                  },
                  {
                    name: "container-2",
                    status: "TASK_STARTING",
                    statusSince: "2018-04-30T13:59:07.759Z",
                    conditions: [],
                    containerId: "pod-with-volume.instance-a643c6eb-4c7e-11e8-9c30-2641ffb20201.container-2.1",
                    endpoints: [],
                    resources: { cpus: 0.1, mem: 128, disk: 0, gpus: 0 },
                    lastUpdated: "2018-04-30T13:59:07.759Z",
                    lastChanged: "2018-04-30T13:59:07.759Z"
                  }
                ],
                specReference: "/v2/pods/pod-with-volume::versions/2018-04-30T13:59:05.786Z",
                localVolumes: [
                  {
                    runSpecId: "/pod-with-volume",
                    containerPath: "home",
                    uuid: "a643c6ea-4c7e-11e8-9c30-2641ffb20201",
                    persistenceId: "pod-with-volume#home#a643c6ea-4c7e-11e8-9c30-2641ffb20201"
                  }
                ],
                lastUpdated: "2018-04-30T13:59:08.689Z",
                lastChanged: "2018-04-30T13:59:08.689Z"
              }
            ],
            terminationHistory: [],
            lastUpdated: "2018-04-30T13:59:11.717Z",
            lastChanged: "2018-04-30T13:59:08.689Z"
          }
        ]
      });

      expect(data).toEqual({
        id: "/",
        items: [
          {
            id: "/pod-with-volume",
            instances: [
              {
                conditions: [],
                containers: [
                  {
                    conditions: [],
                    containerId: "pod-with-volume.instance-a643c6eb-4c7e-11e8-9c30-2641ffb20201.container-1.1",
                    endpoints: [],
                    lastChanged: "2018-04-30T13:59:07.759Z",
                    lastUpdated: "2018-04-30T13:59:07.759Z",
                    name: "container-1",
                    resources: { cpus: 0.1, disk: 0, gpus: 0, mem: 128 },
                    status: "TASK_STARTING",
                    statusSince: "2018-04-30T13:59:07.759Z"
                  },
                  {
                    conditions: [],
                    containerId: "pod-with-volume.instance-a643c6eb-4c7e-11e8-9c30-2641ffb20201.container-2.1",
                    endpoints: [],
                    lastChanged: "2018-04-30T13:59:07.759Z",
                    lastUpdated: "2018-04-30T13:59:07.759Z",
                    name: "container-2",
                    resources: { cpus: 0.1, disk: 0, gpus: 0, mem: 128 },
                    status: "TASK_STARTING",
                    statusSince: "2018-04-30T13:59:07.759Z"
                  }
                ],
                id: "pod-with-volume.instance-a643c6eb-4c7e-11e8-9c30-2641ffb20201",
                lastChanged: "2018-04-30T13:59:08.689Z",
                lastUpdated: "2018-04-30T13:59:08.689Z",
                localVolumes: [
                  {
                    containerPath: "home",
                    persistenceId: "pod-with-volume#home#a643c6ea-4c7e-11e8-9c30-2641ffb20201",
                    runSpecId: "/pod-with-volume",
                    uuid: "a643c6ea-4c7e-11e8-9c30-2641ffb20201"
                  }
                ],
                networks: [],
                resources: {
                  cpus: 0.30000000000000004,
                  disk: 10,
                  gpus: 0,
                  mem: 288
                },
                specReference: "/v2/pods/pod-with-volume::versions/2018-04-30T13:59:05.786Z",
                status: "STAGING",
                statusSince: "2018-04-30T13:59:08.689Z"
              }
            ],
            lastChanged: "2018-04-30T13:59:08.689Z",
            lastUpdated: "2018-04-30T13:59:11.717Z",
            spec: {
              containers: [
                {
                  image: { id: "nginx", kind: "DOCKER" },
                  name: "container-1",
                  resources: { cpus: 0.1, disk: 0, gpus: 0, mem: 128 },
                  volumeMounts: [
                    { mountPath: "/var/log", name: "home", readOnly: false }
                  ]
                },
                {
                  exec: {
                    command: { shell: "while true; do: sleep 1000; done;" }
                  },
                  image: { id: "alpine", kind: "DOCKER" },
                  name: "container-2",
                  resources: { cpus: 0.1, disk: 0, gpus: 0, mem: 128 }
                }
              ],
              executorResources: { cpus: 0.1, disk: 10, mem: 32 },
              id: "/pod-with-volume",
              networks: [{ mode: "host" }],
              scaling: { instances: 1, kind: "fixed" },
              scheduling: {
                backoff: {
                  backoff: 1,
                  backoffFactor: 1.15,
                  maxLaunchDelay: 3600
                },
                killSelection: "YOUNGEST_FIRST",
                unreachableStrategy: "disabled",
                upgrade: { maximumOverCapacity: 0, minimumHealthCapacity: 0.5 }
              },
              version: "2018-04-30T13:59:05.786Z",
              volumes: [
                {
                  name: "home",
                  persistent: { constraints: [], size: 10, type: "root" }
                }
              ]
            },
            status: "DEGRADED",
            statusSince: "2018-04-30T13:59:08.689Z",
            terminationHistory: [],
            volumeData: [
              {
                containerPath: "home",
                host: undefined,
                id: "pod-with-volume#home#a643c6ea-4c7e-11e8-9c30-2641ffb20201",
                mode: undefined,
                mounts: [
                  { containerName: "container-1", mountPath: "/var/log" }
                ],
                size: 10,
                status: "Detached",
                taskID: "pod-with-volume.instance-a643c6eb-4c7e-11e8-9c30-2641ffb20201",
                type: "Persistent"
              }
            ]
          }
        ]
      });
    });
  });
});
