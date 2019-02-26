var response = JSON.stringify({
  type: "SUBSCRIBED",
  subscribed: {
    get_state: {
      get_executors: {
        executors: [
          {
            executor_info: {
              executor_id: {
                value: "server-2_1b100d78-f999-47ad-9a22-d7f9436f37bb_executor"
              },
              framework_id: {
                value: "b3bd182c-c6d7-463e-8bf0-06cd5807df4e-0001"
              },
              command: {
                uris: [
                  {
                    value:
                      "https://s3-us-west-2.amazonaws.com/cassandra-framework-dev/jre/linux/server-jre-8u74-linux-x64.tar.gz",
                    executable: false,
                    extract: true,
                    cache: false
                  },
                  {
                    value:
                      "https://s3-us-west-2.amazonaws.com/cassandra-framework-dev/ken/executor.zip",
                    executable: false,
                    extract: true,
                    cache: false
                  },
                  {
                    value:
                      "https://s3-us-west-2.amazonaws.com/cassandra-framework-dev/testing/apache-cassandra-2.2.5-bin.tar.gz",
                    executable: false,
                    extract: true,
                    cache: false
                  }
                ],
                environment: {
                  variables: [
                    {
                      name: "JAVA_HOME",
                      value: "./jre"
                    },
                    {
                      name: "JVM_OPTS",
                      value: "-Xmx512M"
                    },
                    {
                      name: "EXECUTOR_API_PORT",
                      value: "9000"
                    },
                    {
                      name: "EXECUTOR_ADMIN_PORT",
                      value: "9001"
                    }
                  ]
                },
                shell: true,
                value:
                  "./executor/bin/cassandra-executor server executor/conf/executor.yml"
              },
              resources: [
                {
                  name: "cpus",
                  type: "SCALAR",
                  scalar: {
                    value: 0.5
                  },
                  role: "cassandra_role",
                  reservation: {
                    principal: "cassandra_principal"
                  }
                },
                {
                  name: "mem",
                  type: "SCALAR",
                  scalar: {
                    value: 768.0
                  },
                  role: "cassandra_role",
                  reservation: {
                    principal: "cassandra_principal"
                  }
                }
              ],
              name: "server-2_1b100d78-f999-47ad-9a22-d7f9436f37bb_executor"
            },
            agent_id: {
              value: "b3bd182c-c6d7-463e-8bf0-06cd5807df4e-S5"
            }
          },
          {
            executor_info: {
              executor_id: {
                value: "server-1_486aff94-2af8-49c7-9266-b2710c9b08d9_executor"
              },
              framework_id: {
                value: "b3bd182c-c6d7-463e-8bf0-06cd5807df4e-0001"
              },
              command: {
                uris: [
                  {
                    value:
                      "https://s3-us-west-2.amazonaws.com/cassandra-framework-dev/jre/linux/server-jre-8u74-linux-x64.tar.gz",
                    executable: false,
                    extract: true,
                    cache: false
                  },
                  {
                    value:
                      "https://s3-us-west-2.amazonaws.com/cassandra-framework-dev/ken/executor.zip",
                    executable: false,
                    extract: true,
                    cache: false
                  },
                  {
                    value:
                      "https://s3-us-west-2.amazonaws.com/cassandra-framework-dev/testing/apache-cassandra-2.2.5-bin.tar.gz",
                    executable: false,
                    extract: true,
                    cache: false
                  }
                ],
                environment: {
                  variables: [
                    {
                      name: "JAVA_HOME",
                      value: "./jre"
                    },
                    {
                      name: "JVM_OPTS",
                      value: "-Xmx512M"
                    },
                    {
                      name: "EXECUTOR_API_PORT",
                      value: "9000"
                    },
                    {
                      name: "EXECUTOR_ADMIN_PORT",
                      value: "9001"
                    }
                  ]
                },
                shell: true,
                value:
                  "./executor/bin/cassandra-executor server executor/conf/executor.yml"
              },
              resources: [
                {
                  name: "cpus",
                  type: "SCALAR",
                  scalar: {
                    value: 0.5
                  },
                  role: "cassandra_role",
                  reservation: {
                    principal: "cassandra_principal"
                  }
                },
                {
                  name: "mem",
                  type: "SCALAR",
                  scalar: {
                    value: 768.0
                  },
                  role: "cassandra_role",
                  reservation: {
                    principal: "cassandra_principal"
                  }
                }
              ],
              name: "server-1_486aff94-2af8-49c7-9266-b2710c9b08d9_executor"
            },
            agent_id: {
              value: "b3bd182c-c6d7-463e-8bf0-06cd5807df4e-S4"
            }
          },
          {
            executor_info: {
              executor_id: {
                value: "server-0_10a_executor"
              },
              framework_id: {
                value: "b3bd182c-c6d7-463e-8bf0-06cd5807df4e-0001"
              },
              command: {
                uris: [
                  {
                    value:
                      "https://s3-us-west-2.amazonaws.com/cassandra-framework-dev/jre/linux/server-jre-8u74-linux-x64.tar.gz",
                    executable: false,
                    extract: true,
                    cache: false
                  },
                  {
                    value:
                      "https://s3-us-west-2.amazonaws.com/cassandra-framework-dev/ken/executor.zip",
                    executable: false,
                    extract: true,
                    cache: false
                  },
                  {
                    value:
                      "https://s3-us-west-2.amazonaws.com/cassandra-framework-dev/testing/apache-cassandra-2.2.5-bin.tar.gz",
                    executable: false,
                    extract: true,
                    cache: false
                  }
                ],
                environment: {
                  variables: [
                    {
                      name: "JAVA_HOME",
                      value: "./jre"
                    },
                    {
                      name: "JVM_OPTS",
                      value: "-Xmx512M"
                    },
                    {
                      name: "EXECUTOR_API_PORT",
                      value: "9000"
                    },
                    {
                      name: "EXECUTOR_ADMIN_PORT",
                      value: "9001"
                    }
                  ]
                },
                shell: true,
                value:
                  "./executor/bin/cassandra-executor server executor/conf/executor.yml"
              },
              resources: [
                {
                  name: "cpus",
                  type: "SCALAR",
                  scalar: {
                    value: 0.5
                  },
                  role: "cassandra_role",
                  reservation: {
                    principal: "cassandra_principal"
                  }
                },
                {
                  name: "mem",
                  type: "SCALAR",
                  scalar: {
                    value: 768.0
                  },
                  role: "cassandra_role",
                  reservation: {
                    principal: "cassandra_principal"
                  }
                }
              ],
              name: "server-0_10a_executor"
            },
            agent_id: {
              value: "b3bd182c-c6d7-463e-8bf0-06cd5807df4e-S2"
            }
          }
        ]
      },
      get_tasks: {
        tasks: [
          {
            slave_id: "b3bd182c-c6d7-463e-8bf0-06cd5807df4e-S5",
            task_id: {
              value: "cassandra.f3c25eea-da3d-11e5-af84-0242fa37187c"
            },
            name: "cassandra",
            framework_id: {
              value: "b3bd182c-c6d7-463e-8bf0-06cd5807df4e-0000"
            },
            executor_id: {
              value: ""
            },
            agent_id: {
              value: "b3bd182c-c6d7-463e-8bf0-06cd5807df4e-S0"
            },
            state: "TASK_RUNNING",
            resources: [
              {
                name: "cpus",
                type: "SCALAR",
                scalar: {
                  value: 0.5
                }
              },
              {
                name: "disk",
                type: "SCALAR",
                scalar: {
                  value: 0.0
                }
              },
              {
                name: "mem",
                type: "SCALAR",
                scalar: {
                  value: 2048.0
                }
              },
              {
                name: "ports",
                type: "RANGES",
                ranges: {
                  range: "[9000-9001]"
                }
              }
            ],
            statuses: [
              {
                state: "TASK_RUNNING",
                timestamp: 1456239657.0424,
                container_status: {
                  network_infos: [
                    {
                      ip_address: "10.0.1.110",
                      ip_addresses: [
                        {
                          ip_address: "10.0.1.110"
                        }
                      ]
                    }
                  ]
                },
                healthy: true
              }
            ],
            labels: {
              labels: [
                {
                  key: "DCOS_PACKAGE_RELEASE",
                  value: "2"
                },
                {
                  key: "DCOS_PACKAGE_SOURCE",
                  value: "file:///Users/kowens/git/universe/"
                },
                {
                  key: "DCOS_PACKAGE_COMMAND",
                  value:
                    "eyJwaXAiOiBbImRjb3M9PTAuMS4xMyIsICJnaXQraHR0cHM6Ly9naXRodWIuY29tL21lc29zcGhlcmUvZGNvcy1jYXNzYW5kcmEuZ2l0I2Rjb3MtY2Fzc2FuZHJhPTAuMS4wIl19"
                },
                {
                  key: "DCOS_PACKAGE_METADATA",
                  value:
                    "eyJkZXNjcmlwdGlvbiI6ICJBcGFjaGUgQ2Fzc2FuZHJhIHJ1bm5pbmcgb24gQXBhY2hlIE1lc29zIiwgImZyYW1ld29yayI6IHRydWUsICJpbWFnZXMiOiB7Imljb24tbGFyZ2UiOiAiaHR0cHM6Ly9kb3dubG9hZHMubWVzb3NwaGVyZS5jb20vY2Fzc2FuZHJhLW1lc29zL2Fzc2V0cy9jYXNzYW5kcmEtbGFyZ2UucG5nIiwgImljb24tbWVkaXVtIjogImh0dHBzOi8vZG93bmxvYWRzLm1lc29zcGhlcmUuY29tL2Nhc3NhbmRyYS1tZXNvcy9hc3NldHMvY2Fzc2FuZHJhLW1lZGl1bS5wbmciLCAiaWNvbi1zbWFsbCI6ICJodHRwczovL2Rvd25sb2Fkcy5tZXNvc3BoZXJlLmNvbS9jYXNzYW5kcmEtbWVzb3MvYXNzZXRzL2Nhc3NhbmRyYS1zbWFsbC5wbmcifSwgImxpY2Vuc2VzIjogW3sibmFtZSI6ICJBcGFjaGUgTGljZW5zZSBWZXJzaW9uIDIuMCIsICJ1cmwiOiAiaHR0cHM6Ly9naXRodWIuY29tL21lc29zcGhlcmUvY2Fzc2FuZHJhLW1lc29zL2Jsb2IvbWFzdGVyL0xJQ0VOU0UudHh0In1dLCAibWFpbnRhaW5lciI6ICJzdXBwb3J0QG1lc29zcGhlcmUuaW8iLCAibmFtZSI6ICJjYXNzYW5kcmEiLCAicGFja2FnaW5nVmVyc2lvbiI6ICIyLjAiLCAicG9zdEluc3RhbGxOb3RlcyI6ICJUaGFuayB5b3UgZm9yIGluc3RhbGxpbmcgdGhlIEFwYWNoZSBDYXNzYW5kcmEgRENPUyBTZXJ2aWNlLlxuXG5cdERvY3VtZW50YXRpb246IGh0dHA6Ly9tZXNvc3BoZXJlLmdpdGh1Yi5pby9jYXNzYW5kcmEtbWVzb3MvXG5cdElzc3VlczogaHR0cHM6Ly9naXRodWIuY29tL21lc29zcGhlcmUvY2Fzc2FuZHJhLW1lc29zL2lzc3VlcyIsICJwb3N0VW5pbnN0YWxsTm90ZXMiOiAiVGhlIEFwYWNoZSBDYXNzYW5kcmEgRENPUyBTZXJ2aWNlIGhhcyBiZWVuIHVuaW5zdGFsbGVkIGFuZCB3aWxsIG5vIGxvbmdlciBydW4uXG5QbGVhc2UgZm9sbG93IHRoZSBpbnN0cnVjdGlvbnMgYXQgaHR0cDovL2RvY3MubWVzb3NwaGVyZS5jb20vc2VydmljZXMvY2Fzc2FuZHJhLyN1bmluc3RhbGwgdG8gY2xlYW4gdXAgYW55IHBlcnNpc3RlZCBzdGF0ZSIsICJwcmVJbnN0YWxsTm90ZXMiOiAiVGhlIEFwYWNoZSBDYXNzYW5kcmEgRENPUyBTZXJ2aWNlIGltcGxlbWVudGF0aW9uIGlzIGFscGhhIGFuZCB0aGVyZSBtYXkgYmUgYnVncywgaW5jb21wbGV0ZSBmZWF0dXJlcywgaW5jb3JyZWN0IGRvY3VtZW50YXRpb24gb3Igb3RoZXIgZGlzY3JlcGFuY2llcy5cblRoZSBkZWZhdWx0IGNvbmZpZ3VyYXRpb24gcmVxdWlyZXMgMyBub2RlcyBlYWNoIHdpdGggMC4zIENQVSBzaGFyZXMsIDExODRNQiBvZiBtZW1vcnkgYW5kIDI3Mk1CIG9mIGRpc2suIiwgInNjbSI6ICJodHRwczovL2dpdGh1Yi5jb20vbWVzb3NwaGVyZS9jYXNzYW5kcmEtbWVzb3MuZ2l0IiwgInRhZ3MiOiBbImRhdGEiLCAiZGF0YWJhc2UiLCAibm9zcWwiXSwgInZlcnNpb24iOiAiMC4yLjAtMSJ9"
                },
                {
                  key: "DCOS_PACKAGE_REGISTRY_VERSION",
                  value: "2.0.0-rc1"
                },
                {
                  key: "DCOS_PACKAGE_FRAMEWORK_NAME",
                  value: "cassandra"
                },
                {
                  key: "DCOS_PACKAGE_VERSION",
                  value: "0.2.0-1"
                },
                {
                  key: "DCOS_PACKAGE_NAME",
                  value: "cassandra"
                }
              ]
            }
          },
          {
            task_id: {
              value: "server-2_1b100d78-f999-47ad-9a22-d7f9436f37bb"
            },
            name: "server-2",
            framework_id: {
              value: "b3bd182c-c6d7-463e-8bf0-06cd5807df4e-0001"
            },
            executor_id: {
              value: "server-2_1b100d78-f999-47ad-9a22-d7f9436f37bb_executor"
            },
            agent_id: {
              value: "b3bd182c-c6d7-463e-8bf0-06cd5807df4e-S5"
            },
            state: "TASK_RUNNING",
            resources: [
              {
                name: "cpus",
                type: "SCALAR",
                scalar: {
                  value: 0.5
                }
              },
              {
                name: "disk",
                type: "SCALAR",
                scalar: {
                  value: 9216.0
                }
              },
              {
                name: "mem",
                type: "SCALAR",
                scalar: {
                  value: 4096.0
                }
              },
              {
                name: "ports",
                type: "RANGES",
                ranges: {
                  range:
                    "[7000-7001, 7199-7199, 9000-9001, 9042-9042, 9160-9160]"
                }
              }
            ],
            statuses: [
              {
                state: "TASK_RUNNING",
                timestamp: 1456239666.7212,
                container_status: {
                  network_infos: [
                    {
                      ip_address: "10.0.1.108",
                      ip_addresses: [
                        {
                          ip_address: "10.0.1.108"
                        }
                      ]
                    }
                  ]
                }
              }
            ]
          },
          {
            task_id: { value: "server-1_486aff94-2af8-49c7-9266-b2710c9b08d9" },
            name: "server-1",
            framework_id: {
              value: "b3bd182c-c6d7-463e-8bf0-06cd5807df4e-0001"
            },
            executor_id: {
              value: "server-1_486aff94-2af8-49c7-9266-b2710c9b08d9_executor"
            },
            agent_id: {
              value: "b3bd182c-c6d7-463e-8bf0-06cd5807df4e-S4"
            },
            state: "TASK_RUNNING",
            resources: [
              {
                name: "cpus",
                type: "SCALAR",
                scalar: {
                  value: 0.5
                }
              },
              {
                name: "disk",
                type: "SCALAR",
                scalar: {
                  value: 9216.0
                }
              },
              {
                name: "mem",
                type: "SCALAR",
                scalar: {
                  value: 4096.0
                }
              },
              {
                name: "ports",
                type: "RANGES",
                ranges: {
                  range:
                    "[7000-7001, 7199-7199, 9000-9001, 9042-9042, 9160-9160]"
                }
              }
            ],
            statuses: [
              {
                state: "TASK_RUNNING",
                timestamp: 1456239605.0473,
                container_status: {
                  network_infos: [
                    {
                      ip_address: "10.0.1.107",
                      ip_addresses: [
                        {
                          ip_address: "10.0.1.107"
                        }
                      ]
                    }
                  ]
                }
              }
            ]
          },
          {
            task_id: { value: "server-0_10a" },
            name: "server-0",
            framework_id: {
              value: "b3bd182c-c6d7-463e-8bf0-06cd5807df4e-0001"
            },
            executor_id: {
              value: "server-0_10a_executor"
            },
            agent_id: {
              value: "b3bd182c-c6d7-463e-8bf0-06cd5807df4e-S2"
            },
            state: "TASK_RUNNING",
            resources: [
              {
                name: "cpus",
                type: "SCALAR",
                scalar: {
                  value: 0.5
                }
              },
              {
                name: "disk",
                type: "SCALAR",
                scalar: {
                  value: 9216.0
                }
              },
              {
                name: "mem",
                type: "SCALAR",
                scalar: {
                  value: 4096.0
                }
              },
              {
                name: "ports",
                type: "RANGES",
                ranges: {
                  range:
                    "[7000-7001, 7199-7199, 9000-9001, 9042-9042, 9160-9160]"
                }
              }
            ],
            statuses: [
              {
                state: "TASK_RUNNING",
                timestamp: 1456239578.6323,
                container_status: {
                  network_infos: [
                    {
                      ip_address: "10.0.1.109",
                      ip_addresses: [
                        {
                          ip_address: "10.0.1.109"
                        }
                      ]
                    }
                  ]
                }
              }
            ]
          }
        ]
      },
      get_frameworks: {
        frameworks: [
          {
            framework_info: {
              id: {
                value: "b3bd182c-c6d7-463e-8bf0-06cd5807df4e-0001"
              }
            },
            name: "cassandra",
            pid:
              "scheduler-d571a745-055d-4180-9eed-f7d34108b897@10.0.1.110:40153",
            used_resources: {
              cpus: 3.0,
              disk: 27648.0,
              mem: 14592.0,
              ports: "[7000-7001, 7199-7199, 9000-9001, 9042-9042, 9160-9160]"
            },
            offered_resources: {
              cpus: 0.0,
              disk: 0.0,
              mem: 0.0
            },
            capabilities: [],
            hostname: "ip-10-0-1-110.us-west-2.compute.internal",
            webui_url: "",
            active: true,
            user: "root",
            failover_timeout: 604800.0,
            checkpoint: true,
            role: "cassandra_role",
            registered_time: 1456239546.53993,
            unregistered_time: 0.0,

            principal: "cassandra_principal",
            resources: {
              cpus: 3.0,
              disk: 27648.0,
              mem: 14592.0,
              ports: "[7000-7001, 7199-7199, 9000-9001, 9042-9042, 9160-9160]"
            },
            offers: []
          },
          {
            framework_info: {
              id: {
                value: "b3bd182c-c6d7-463e-8bf0-06cd5807df4e-0000"
              }
            },
            name: "marathon",
            pid:
              "scheduler-e54619c4-9314-4d2d-9ac6-1b0790994b19@10.0.7.122:57106",
            used_resources: {
              cpus: 0.5,
              disk: 0.0,
              mem: 2048.0,
              ports: "[9000-9001]"
            },
            offered_resources: {
              cpus: 0.0,
              disk: 0.0,
              mem: 0.0
            },
            capabilities: [],
            hostname: "10.0.7.122",
            webui_url: "http://10.0.7.122:8080",
            active: true,
            user: "root",
            failover_timeout: 604800.0,
            checkpoint: true,
            role: "slave_public",
            registered_time: 1456203051.36632,
            unregistered_time: 0.0,
            resources: {
              cpus: 0.5,
              disk: 0.0,
              mem: 2048.0,
              ports: "[9000-9001]"
            },
            reregistered_time: 1456203079.72705,
            offers: []
          }
        ]
      },
      get_agents: {
        agents: [
          {
            agent_info: {
              id: { value: "b3bd182c-c6d7-463e-8bf0-06cd5807df4e-S5" }
            },
            pid: "slave(1)@10.0.1.108:5051",
            hostname: "10.0.1.108",
            registered_time: 1456203145.01885,
            resources: {
              cpus: 4.0,
              disk: 32541.0,
              mem: 14019.0,
              ports:
                "[1025-2180, 2182-3887, 3889-5049, 5052-8079, 8082-8180, 8182-32000]"
            },
            used_resources: {
              cpus: 1.0,
              disk: 9216.0,
              mem: 4864.0,
              ports: "[7000-7001, 7199-7199, 9000-9001, 9042-9042, 9160-9160]"
            },
            offered_resources: {
              cpus: 0.0,
              disk: 0.0,
              mem: 0.0
            },
            reserved_resources: {
              cassandra_role: {
                cpus: 1.0,
                disk: 9216.0,
                mem: 4864.0,
                ports: "[7000-7001, 7199-7199, 9000-9001, 9042-9042, 9160-9160]"
              }
            },
            unreserved_resources: {
              cpus: 3.0,
              disk: 23325.0,
              mem: 9155.0,
              ports:
                "[1025-2180, 2182-3887, 3889-5049, 5052-6999, 7002-7198, 7200-8079, 8082-8180, 8182-8999, 9002-9041, 9043-9159, 9161-32000]"
            },
            attributes: {},
            active: true,
            version: "0.27.0"
          },
          {
            agent_info: {
              id: { value: "b3bd182c-c6d7-463e-8bf0-06cd5807df4e-S4" }
            },
            pid: "slave(1)@10.0.1.107:5051",
            hostname: "10.0.1.107",
            registered_time: 1456203140.4612,
            resources: {
              cpus: 4.0,
              disk: 32541.0,
              mem: 14019.0,
              ports:
                "[1025-2180, 2182-3887, 3889-5049, 5052-8079, 8082-8180, 8182-32000]"
            },
            used_resources: {
              cpus: 1.0,
              disk: 9216.0,
              mem: 4864.0,
              ports: "[7000-7001, 7199-7199, 9000-9001, 9042-9042, 9160-9160]"
            },
            offered_resources: {
              cpus: 0.0,
              disk: 0.0,
              mem: 0.0
            },
            reserved_resources: {
              cassandra_role: {
                cpus: 1.0,
                disk: 9216.0,
                mem: 4864.0,
                ports: "[7000-7001, 7199-7199, 9000-9001, 9042-9042, 9160-9160]"
              }
            },
            unreserved_resources: {
              cpus: 3.0,
              disk: 23325.0,
              mem: 9155.0,
              ports:
                "[1025-2180, 2182-3887, 3889-5049, 5052-6999, 7002-7198, 7200-8079, 8082-8180, 8182-8999, 9002-9041, 9043-9159, 9161-32000]"
            },
            attributes: {},
            active: true,
            version: "0.27.0"
          },
          {
            agent_info: {
              id: { value: "b3bd182c-c6d7-463e-8bf0-06cd5807df4e-S3" }
            },
            pid: "slave(1)@10.0.1.111:5051",
            hostname: "10.0.1.111",
            registered_time: 1456203125.3873,
            resources: {
              cpus: 4.0,
              disk: 32541.0,
              mem: 14019.0,
              ports:
                "[1025-2180, 2182-3887, 3889-5049, 5052-8079, 8082-8180, 8182-32000]"
            },
            used_resources: {
              cpus: 0.0,
              disk: 0.0,
              mem: 0.0
            },
            offered_resources: {
              cpus: 0.0,
              disk: 0.0,
              mem: 0.0
            },
            reserved_resources: {},
            unreserved_resources: {
              cpus: 4.0,
              disk: 32541.0,
              mem: 14019.0,
              ports:
                "[1025-2180, 2182-3887, 3889-5049, 5052-8079, 8082-8180, 8182-32000]"
            },
            attributes: {},
            active: true,
            version: "0.27.0"
          },
          {
            agent_info: {
              id: { value: "b3bd182c-c6d7-463e-8bf0-06cd5807df4e-S2" }
            },
            pid: "slave(1)@10.0.1.109:5051",
            hostname: "10.0.1.109",
            registered_time: 1456203119.84075,
            resources: {
              cpus: 4.0,
              disk: 32541.0,
              mem: 14019.0,
              ports:
                "[1025-2180, 2182-3887, 3889-5049, 5052-8079, 8082-8180, 8182-32000]"
            },
            used_resources: {
              cpus: 1.0,
              disk: 9216.0,
              mem: 4864.0,
              ports: "[7000-7001, 7199-7199, 9000-9001, 9042-9042, 9160-9160]"
            },
            offered_resources: {
              cpus: 0.0,
              disk: 0.0,
              mem: 0.0
            },
            reserved_resources: {
              cassandra_role: {
                cpus: 1.0,
                disk: 9216.0,
                mem: 4864.0,
                ports: "[7000-7001, 7199-7199, 9000-9001, 9042-9042, 9160-9160]"
              }
            },
            unreserved_resources: {
              cpus: 3.0,
              disk: 23325.0,
              mem: 9155.0,
              ports:
                "[1025-2180, 2182-3887, 3889-5049, 5052-6999, 7002-7198, 7200-8079, 8082-8180, 8182-8999, 9002-9041, 9043-9159, 9161-32000]"
            },
            attributes: {},
            active: true,
            version: "0.27.0"
          },
          {
            agent_info: {
              id: { value: "b3bd182c-c6d7-463e-8bf0-06cd5807df4e-S1" }
            },
            pid: "slave(1)@10.0.5.136:5051",
            hostname: "10.0.5.136",
            registered_time: 1456203108.96642,
            resources: {
              cpus: 4.0,
              disk: 32541.0,
              mem: 14019.0,
              ports: "[1-21, 23-5050, 5052-32000]"
            },
            used_resources: {
              cpus: 0.0,
              disk: 0.0,
              mem: 0.0
            },
            offered_resources: {
              cpus: 0.0,
              disk: 0.0,
              mem: 0.0
            },
            reserved_resources: {
              slave_public: {
                cpus: 4.0,
                disk: 32541.0,
                mem: 14019.0,
                ports: "[1-21, 23-5050, 5052-32000]"
              }
            },
            unreserved_resources: {
              cpus: 0.0,
              disk: 0.0,
              mem: 0.0
            },
            attributes: {
              public_ip: "true"
            },
            active: true,
            version: "0.27.0"
          },
          {
            agent_info: {
              id: { value: "b3bd182c-c6d7-463e-8bf0-06cd5807df4e-S0" }
            },
            pid: "slave(1)@10.0.1.110:5051",
            hostname: "10.0.1.110",
            registered_time: 1456203090.91345,
            resources: {
              cpus: 4.0,
              disk: 32541.0,
              mem: 14019.0,
              ports:
                "[1025-2180, 2182-3887, 3889-5049, 5052-8079, 8082-8180, 8182-32000]"
            },
            used_resources: {
              cpus: 0.5,
              disk: 0.0,
              mem: 2048.0,
              ports: "[9000-9001]"
            },
            offered_resources: {
              cpus: 0.0,
              disk: 0.0,
              mem: 0.0
            },
            reserved_resources: {},
            unreserved_resources: {
              cpus: 4.0,
              disk: 32541.0,
              mem: 14019.0,
              ports:
                "[1025-2180, 2182-3887, 3889-5049, 5052-8079, 8082-8180, 8182-32000]"
            },
            attributes: {},
            active: true,
            version: "0.27.0"
          }
        ]
      }
    }
  }
});

module.exports = response.length + "\n" + response;
