var response = JSON.stringify({
  type: "SUBSCRIBED",
  subscribed: {
    get_state: {
      get_executors: {
        executors: [
          {
            executor_info: {
              executor_id: {
                value: "broker-0__d7edb331-2d31-46ad-a1f9-5aa34bc3b1a7"
              },
              name: "broker-0",
              framework_id: {
                value: "74f1836b-6784-4030-816e-aacbdd45ff57-0002"
              },
              command: {
                value:
                  "./executor/bin/kafka-executor server ./executor/conf/executor.yml",
                argv: [],
                environment: {
                  variables: [
                    {
                      name: "KAFKA_ZOOKEEPER_URI",
                      value: "master.mesos:2181"
                    },
                    {
                      name: "JAVA_HOME",
                      value: "jre1.8.0_91"
                    },
                    {
                      name: "FRAMEWORK_NAME",
                      value: "confluent-kafka"
                    },
                    {
                      name: "CONFIG_ID",
                      value: "2e5ec32e-a6b9-4ed4-91c6-b9787c60e78f"
                    },
                    {
                      name: "KAFKA_OVERRIDE_BROKER_ID",
                      value: "0"
                    },
                    {
                      name: "API_PORT",
                      value: "1025"
                    }
                  ]
                },
                uris: [
                  {
                    value:
                      "https://downloads.mesosphere.com/kafka/assets/jre-8u91-linux-x64.tar.gz",
                    executable: false
                  },
                  {
                    value:
                      "https://packages.confluent.io/archive/3.1/confluent-oss-3.1.1-mesos.tgz",
                    executable: false
                  },
                  {
                    value:
                      "https://downloads.mesosphere.com/kafka/assets/1.1.16-0.10.0.0/overrider.zip",
                    executable: false
                  },
                  {
                    value:
                      "https://downloads.mesosphere.com/kafka/assets/1.1.16-0.10.0.0/executor.zip",
                    executable: false
                  }
                ]
              },
              resources: {
                disk: 0,
                mem: 256,
                gpus: 0,
                cpus: 0.5,
                ports: "[1025-1025]"
              }
            },
            agent_id: {
              value: "74f1836b-6784-4030-816e-aacbdd45ff57-S1"
            }
          }
        ]
      },
      get_frameworks: {
        frameworks: [
          {
            framework_info: {
              id: {
                value: "74f1836b-6784-4030-816e-aacbdd45ff57-0002"
              }
            },
            name: "confluent-kafka",
            pid:
              "scheduler-d1c33942-e677-40b5-87fb-f36885359263@10.0.2.121:44347",
            used_resources: {
              disk: 5000,
              mem: 2560,
              gpus: 0,
              cpus: 1.5,
              ports: "[1025-1025, 9234-9234]"
            },
            offered_resources: {
              disk: 0,
              mem: 0,
              gpus: 0,
              cpus: 0
            },
            capabilities: [],
            hostname: "ip-10-0-2-121.us-west-2.compute.internal",
            webui_url: "",
            active: true,
            connected: true,
            recovered: false,
            user: "root",
            failover_timeout: 1209600,
            checkpoint: true,
            registered_time: 1483992150.80836,
            unregistered_time: 0,
            principal: "confluent-kafka-principal",
            resources: {
              disk: 5000,
              mem: 2560,
              gpus: 0,
              cpus: 1.5,
              ports: "[1025-1025, 9234-9234]"
            },
            role: "confluent-kafka-role",
            offers: []
          },
          {
            framework_info: {
              id: { value: "74f1836b-6784-4030-816e-aacbdd45ff57-0001" }
            },
            name: "marathon",
            pid:
              "scheduler-2210a7de-5ddd-425e-a888-b36e3f372cec@10.0.4.58:45121",
            used_resources: {
              disk: 0,
              mem: 1262,
              gpus: 0,
              cpus: 1.01,
              ports: "[24348-24349, 29557-29557]"
            },
            offered_resources: {
              disk: 0,
              mem: 0,
              gpus: 0,
              cpus: 0
            },
            capabilities: ["TASK_KILLING_STATE", "PARTITION_AWARE"],
            hostname: "10.0.4.58",
            webui_url: "https://10.0.4.58:8443",
            active: true,
            connected: true,
            recovered: false,
            user: "root",
            failover_timeout: 604800,
            checkpoint: true,
            registered_time: 1483976588.64757,
            unregistered_time: 0,
            principal: "dcos_marathon",
            resources: {
              disk: 0,
              mem: 1262,
              gpus: 0,
              cpus: 1.01,
              ports: "[24348-24349, 29557-29557]"
            },
            role: "slave_public",
            offers: []
          },
          {
            framework_info: {
              id: { value: "74f1836b-6784-4030-816e-aacbdd45ff57-0000" }
            },
            name: "metronome",
            pid:
              "scheduler-eeefee3d-ffd9-429f-9057-17e9290b995d@10.0.4.58:41263",
            used_resources: {
              disk: 0,
              mem: 0,
              gpus: 0,
              cpus: 0
            },
            offered_resources: {
              disk: 0,
              mem: 0,
              gpus: 0,
              cpus: 0
            },
            capabilities: [],
            hostname: "10.0.4.58",
            webui_url: "http://10.0.4.58:9090",
            active: true,
            connected: true,
            recovered: false,
            user: "root",
            failover_timeout: 604800000,
            checkpoint: true,
            registered_time: 1483976588.38822,
            unregistered_time: 0,
            principal: "dcos_metronome",
            resources: {
              disk: 0,
              mem: 0,
              gpus: 0,
              cpus: 0
            },
            role: "*",
            offers: []
          }
        ]
      },
      get_tasks: {
        tasks: [
          {
            task_id: {
              value: "confluent-kafka.825e1e2e-d6a6-11e6-a564-8605ecf0a9df"
            },
            name: "confluent-kafka",
            framework_id: {
              value: "74f1836b-6784-4030-816e-aacbdd45ff57-0001"
            },
            executor_id: { value: "" },
            agent_id: { value: "74f1836b-6784-4030-816e-aacbdd45ff57-S1" },
            state: "TASK_RUNNING",
            resources: [
              {
                name: "disk",
                type: "SCALAR",
                scalar: { value: 0 }
              },
              { name: "mem", type: "SCALAR", scalar: { value: 1230 } },
              { name: "gpus", type: "SCALAR", scalar: { value: 0 } },
              { name: "cpus", type: "SCALAR", scalar: { value: 1 } },
              {
                name: "ports",
                type: "RANGES",
                ranges: { range: "[24348-24349]" }
              }
            ],
            statuses: [
              {
                state: "TASK_RUNNING",
                timestamp: 1483992146.43917,
                container_status: {
                  container_id: {
                    value: "abc0e34b-2b09-446e-b781-21cedf601885"
                  },
                  network_infos: [
                    {
                      ip_addresses: [
                        {
                          ip_address: "10.0.2.121"
                        }
                      ]
                    }
                  ]
                }
              }
            ],
            labels: {
              labels: [
                {
                  key: "DCOS_PACKAGE_RELEASE",
                  value: "10"
                },
                {
                  key: "DCOS_SERVICE_SCHEME",
                  value: "http"
                },
                {
                  key: "DCOS_PACKAGE_SOURCE",
                  value: "https://universe.mesosphere.com/repo"
                },
                {
                  key: "DCOS_PACKAGE_COMMAND",
                  value:
                    "eyJwaXAiOlsiaHR0cHM6Ly9kb3dubG9hZHMubWVzb3NwaGVyZS5jb20va2Fma2EvYXNzZXRzLzEuMS4xNi0wLjEwLjAuMC9iaW5fd3JhcHBlci0wLjAuMS1weTIucHkzLW5vbmUtYW55LndobCJdfQ=="
                },
                {
                  key: "DCOS_PACKAGE_METADATA",
                  value:
                    "eyJwYWNrYWdpbmdWZXJzaW9uIjoiMy4wIiwibmFtZSI6ImNvbmZsdWVudC1rYWZrYSIsInZlcnNpb24iOiIxLjEuMTYtMy4xLjEiLCJtYWludGFpbmVyIjoicGFydG5lci1zdXBwb3J0QGNvbmZsdWVudC5pbyIsImRlc2NyaXB0aW9uIjoiQXBhY2hlIEthZmthIGJ5IENvbmZsdWVudCIsInRhZ3MiOlsibWVzc2FnZSIsImJyb2tlciIsInB1YnN1YiIsImthZmthIiwiY29uZmx1ZW50Il0sInNlbGVjdGVkIjp0cnVlLCJmcmFtZXdvcmsiOnRydWUsInBvc3RJbnN0YWxsTm90ZXMiOiJBcGFjaGUgS2Fma2EgYnkgQ29uZmx1ZW50IGlzIGJlaW5nIGluc3RhbGxlZC5cblxuXHREb2N1bWVudGF0aW9uOiBodHRwczovL3d3dy5jb25mbHVlbnQuaW8vd2hpdGVwYXBlci9kZXBsb3lpbmctY29uZmx1ZW50LXBsYXRmb3JtLXdpdGgtbWVzb3NwaGVyZVxuXHRDb21tdW5pdHkgU3VwcG9ydDogaHR0cHM6Ly9ncm91cHMuZ29vZ2xlLmNvbS9mb3J1bS8jIWZvcnVtL2NvbmZsdWVudC1wbGF0Zm9ybSIsInBvc3RVbmluc3RhbGxOb3RlcyI6IkFwYWNoZSBLYWZrYSBieSBDb25mbHVlbnQgaGFzIGJlZW4gdW5pbnN0YWxsZWQuXG5QbGVhc2UgZm9sbG93IHRoZSBpbnN0cnVjdGlvbnMgYXQgaHR0cHM6Ly9kb2NzLm1lc29zcGhlcmUuY29tL2N1cnJlbnQvdXNhZ2Uvc2VydmljZS1ndWlkZXMva2Fma2EvdW5pbnN0YWxsIHRvIHJlbW92ZSBhbnkgcGVyc2lzdGVudCBzdGF0ZSBpZiByZXF1aXJlZC4iLCJsaWNlbnNlcyI6W3sibmFtZSI6IkFwYWNoZSBMaWNlbnNlIHYyIiwidXJsIjoiaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL2NvbmZsdWVudGluYy9rYWZrYS90cnVuay9MSUNFTlNFIn1dLCJpbWFnZXMiOnsiaWNvbi1zbWFsbCI6Imh0dHBzOi8vZG93bmxvYWRzLm1lc29zcGhlcmUuY29tL3VuaXZlcnNlL2Fzc2V0cy9pY29uLXNlcnZpY2Uta2Fma2Etc21hbGwucG5nIiwiaWNvbi1tZWRpdW0iOiJodHRwczovL2Rvd25sb2Fkcy5tZXNvc3BoZXJlLmNvbS91bml2ZXJzZS9hc3NldHMvaWNvbi1zZXJ2aWNlLWthZmthLW1lZGl1bS5wbmciLCJpY29uLWxhcmdlIjoiaHR0cHM6Ly9kb3dubG9hZHMubWVzb3NwaGVyZS5jb20vdW5pdmVyc2UvYXNzZXRzL2ljb24tc2VydmljZS1rYWZrYS1sYXJnZS5wbmcifX0="
                },
                {
                  key: "DCOS_PACKAGE_REGISTRY_VERSION",
                  value: "3.0"
                },
                {
                  key: "DCOS_SERVICE_NAME",
                  value: "confluent-kafka"
                },
                {
                  key: "DCOS_PACKAGE_FRAMEWORK_NAME",
                  value: "confluent-kafka"
                },
                {
                  key: "DCOS_SERVICE_PORT_INDEX",
                  value: "1"
                },
                {
                  key: "DCOS_PACKAGE_VERSION",
                  value: "1.1.16-3.1.1"
                },
                {
                  key: "DCOS_MIGRATION_API_PATH",
                  value: "/v1/plan"
                },
                {
                  key: "DCOS_PACKAGE_NAME",
                  value: "confluent-kafka"
                },
                {
                  key: "MARATHON_SINGLE_INSTANCE_APP",
                  value: "true"
                },
                {
                  key: "DCOS_MIGRATION_API_VERSION",
                  value: "v1"
                },
                {
                  key: "DCOS_SPACE",
                  value: "/confluent-kafka"
                }
              ]
            },
            discovery: {
              visibility: "FRAMEWORK",
              name: "confluent-kafka",
              ports: {
                ports: [
                  {
                    number: 24348,
                    name: "health",
                    protocol: "tcp"
                  },
                  {
                    number: 24349,
                    name: "api",
                    protocol: "tcp"
                  }
                ]
              }
            }
          },
          {
            task_id: {
              value: "no-healthcheck.7d61432d-d6a6-11e6-a564-8605ecf0a9df"
            },
            name: "no-healthcheck",
            framework_id: {
              value: "74f1836b-6784-4030-816e-aacbdd45ff57-0001"
            },
            executor_id: { value: "" },
            agent_id: { value: "74f1836b-6784-4030-816e-aacbdd45ff57-S1" },
            state: "TASK_RUNNING",
            resources: [
              {
                name: "disk",
                type: "SCALAR",
                scalar: { value: 0 }
              },
              { name: "mem", type: "SCALAR", scalar: { value: 32 } },
              { name: "gpus", type: "SCALAR", scalar: { value: 0 } },
              { name: "cpus", type: "SCALAR", scalar: { value: 0.01 } },
              {
                name: "ports",
                type: "RANGES",
                ranges: { range: "[29557-29557]" }
              }
            ],
            statuses: [
              {
                state: "TASK_RUNNING",
                timestamp: 1483992124.59842,
                container_status: {
                  container_id: {
                    value: "4e2be439-6091-4b43-a797-e132a4c74ce2"
                  },
                  network_infos: [
                    {
                      ip_addresses: [
                        {
                          ip_address: "10.0.2.121"
                        }
                      ]
                    }
                  ]
                }
              }
            ],
            labels: [
              {
                key: "DCOS_SPACE",
                value: "/no-healthcheck"
              }
            ],
            discovery: {
              visibility: "FRAMEWORK",
              name: "no-healthcheck",
              ports: {
                ports: [
                  {
                    number: 29557,
                    protocol: "tcp"
                  }
                ]
              }
            }
          },
          {
            task_id: {
              value: "broker-0__3c7ab984-a9b9-41fb-bb73-0569f88c657e"
            },
            name: "broker-0",
            framework_id: {
              value: "74f1836b-6784-4030-816e-aacbdd45ff57-0002"
            },
            executor_id: {
              value: "broker-0__d7edb331-2d31-46ad-a1f9-5aa34bc3b1a7"
            },
            agent_id: { value: "74f1836b-6784-4030-816e-aacbdd45ff57-S1" },
            state: "TASK_RUNNING",
            resources: [
              {
                name: "disk",
                type: "SCALAR",
                scalar: { value: 5000 }
              },
              { name: "mem", type: "SCALAR", scalar: { value: 2304 } },
              { name: "gpus", type: "SCALAR", scalar: { value: 0 } },
              { name: "cpus", type: "SCALAR", scalar: { value: 1 } },
              {
                name: "ports",
                type: "RANGES",
                ranges: { range: "[9234-9234]" }
              }
            ],
            statuses: [
              {
                state: "TASK_RUNNING",
                timestamp: 1483992176.80824,
                container_status: {
                  container_id: {
                    value: "dde2ffda-afcf-4f73-8568-bd8b11d02c76"
                  },
                  network_infos: [
                    {
                      ip_addresses: [
                        {
                          ip_address: "10.0.2.121"
                        }
                      ]
                    }
                  ]
                }
              }
            ],
            labels: {
              labels: [
                {
                  key: "target_configuration",
                  value: "2e5ec32e-a6b9-4ed4-91c6-b9787c60e78f"
                },
                {
                  key: "offer_attributes",
                  value: ""
                },
                {
                  key: "task_type",
                  value: "broker"
                }
              ]
            },
            discovery: {
              visibility: "EXTERNAL",
              name: "broker-0",
              ports: {
                ports: [
                  {
                    number: 9234,
                    protocol: "tcp",
                    labels: {
                      labels: [
                        {
                          key: "VIP_d92dae85-6e61-4aea-ae98-28595df4da28",
                          value: "broker:9092"
                        }
                      ]
                    }
                  }
                ]
              }
            }
          }
        ]
      },
      get_agents: {
        agents: [
          {
            agent_info: {
              id: { value: "74f1836b-6784-4030-816e-aacbdd45ff57-S1" }
            },
            pid: "slave(1)@10.0.2.121:5051",
            hostname: "10.0.2.121",
            registered_time: 1483977267.25785,
            resources: {
              disk: 35577,
              mem: 14018,
              gpus: 0,
              cpus: 4,
              ports:
                "[1025-2180, 2182-3887, 3889-5049, 5052-8079, 8082-8180, 8182-32000]"
            },
            used_resources: {
              disk: 5000,
              mem: 3822,
              gpus: 0,
              cpus: 2.51,
              ports: "[1025-1025, 9234-9234, 24348-24349, 29557-29557]"
            },
            offered_resources: {
              disk: 0,
              mem: 0,
              gpus: 0,
              cpus: 0
            },
            reserved_resources: {
              "confluent-kafka-role": {
                disk: 5000,
                mem: 2560,
                gpus: 0,
                cpus: 1.5,
                ports: "[1025-1025, 9234-9234]"
              }
            },
            unreserved_resources: {
              disk: 30577,
              mem: 11458,
              gpus: 0,
              cpus: 2.5,
              ports:
                "[1026-2180, 2182-3887, 3889-5049, 5052-8079, 8082-8180, 8182-9233, 9235-32000]"
            },
            attributes: {},
            active: true,
            version: "1.2.0"
          },
          {
            agent_info: {
              id: { value: "74f1836b-6784-4030-816e-aacbdd45ff57-S0" }
            },
            pid: "slave(1)@10.0.6.244:5051",
            hostname: "10.0.6.244",
            registered_time: 1483976648.5341,
            resources: {
              disk: 35577,
              mem: 14018,
              gpus: 0,
              cpus: 4,
              ports: "[1-21, 23-5050, 5052-32000]"
            },
            used_resources: {
              disk: 0,
              mem: 0,
              gpus: 0,
              cpus: 0
            },
            offered_resources: {
              disk: 0,
              mem: 0,
              gpus: 0,
              cpus: 0
            },
            reserved_resources: {
              slave_public: {
                disk: 35577,
                mem: 14018,
                gpus: 0,
                cpus: 4,
                ports: "[1-21, 23-5050, 5052-32000]"
              }
            },
            unreserved_resources: {
              disk: 0,
              mem: 0,
              gpus: 0,
              cpus: 0
            },
            attributes: {
              public_ip: "true"
            },
            active: true,
            version: "1.2.0"
          }
        ]
      }
    }
  }
});

module.exports = response.length + "\n" + response;
