/*
  THIS FILE IS (MOSTLY) GENERATED!
  THIS FILE IS (MOSTLY) GENERATED!
  THIS FILE IS (MOSTLY) GENERATED!
  THIS FILE IS (MOSTLY) GENERATED!
  THIS FILE IS (MOSTLY) GENERATED!
  Here are the steps to reproduce it. Please note that the proto-file-dependencies (the file names added in the long command below) have been collected manually. You may have to reverse-engineer all the dependencies again, if you want to recompile.
  ```
  git clone https://github.com/apache/mesos
  cd mesos/include
  npm install protobufjs
  https://raw.githubusercontent.com/protocolbuffers/protobuf/master/src/google/protobuf/duration.proto
  npx pbjs -t json-module duration.proto mesos/v1/mesos.proto mesos/v1/maintenance/maintenance.proto mesos/v1/allocator/allocator.proto mesos/v1/quota/quota.proto mesos/v1/master/master.proto -o mesos=proto.js -w es6 --keep-case
  echo "now manually edit the output-files header!"
  ```
*/

import * as $protobuf from "protobufjs/light";

const $root = (
  $protobuf.roots["default"] ||
  ($protobuf.roots["default"] = new $protobuf.Root())
).addJSON({
  google: {
    nested: {
      protobuf: {
        options: {
          csharp_namespace: "Google.Protobuf.WellKnownTypes",
          cc_enable_arenas: true,
          go_package: "github.com/golang/protobuf/ptypes/duration",
          java_package: "com.google.protobuf",
          java_outer_classname: "DurationProto",
          java_multiple_files: true,
          objc_class_prefix: "GPB"
        },
        nested: {
          Duration: {
            fields: {
              seconds: { type: "int64", id: 1 },
              nanos: { type: "int32", id: 2 }
            }
          }
        }
      }
    }
  },
  mesos: {
    nested: {
      v1: {
        options: {
          java_package: "org.apache.mesos.v1",
          java_outer_classname: "Protos"
        },
        nested: {
          Status: {
            values: {
              DRIVER_NOT_STARTED: 1,
              DRIVER_RUNNING: 2,
              DRIVER_ABORTED: 3,
              DRIVER_STOPPED: 4
            }
          },
          FrameworkID: {
            fields: { value: { rule: "required", type: "string", id: 1 } }
          },
          OfferID: {
            fields: { value: { rule: "required", type: "string", id: 1 } }
          },
          AgentID: {
            fields: { value: { rule: "required", type: "string", id: 1 } }
          },

          TaskID: {
            fields: { value: { rule: "required", type: "string", id: 1 } }
          },
          ExecutorID: {
            fields: { value: { rule: "required", type: "string", id: 1 } }
          },
          ContainerID: {
            fields: {
              value: { rule: "required", type: "string", id: 1 },
              parent: { type: "ContainerID", id: 2 }
            }
          },
          ResourceProviderID: {
            fields: { value: { rule: "required", type: "string", id: 1 } }
          },
          OperationID: {
            fields: { value: { rule: "required", type: "string", id: 1 } }
          },

          TimeInfo: {
            fields: { nanoseconds: { rule: "required", type: "int64", id: 1 } }
          },
          DurationInfo: {
            fields: { nanoseconds: { rule: "required", type: "int64", id: 1 } }
          },
          Address: {
            fields: {
              hostname: { type: "string", id: 1 },
              ip: { type: "string", id: 2 },
              port: { rule: "required", type: "int32", id: 3 }
            }
          },
          URL: {
            fields: {
              scheme: { rule: "required", type: "string", id: 1 },
              address: { rule: "required", type: "Address", id: 2 },
              path: { type: "string", id: 3 },
              query: { rule: "repeated", type: "Parameter", id: 4 },
              fragment: { type: "string", id: 5 }
            }
          },
          Unavailability: {
            fields: {
              start: { rule: "required", type: "TimeInfo", id: 1 },
              duration: { type: "DurationInfo", id: 2 }
            }
          },
          MachineID: {
            fields: {
              hostname: { type: "string", id: 1 },
              ip: { type: "string", id: 2 }
            }
          },
          MachineInfo: {
            fields: {
              id: { rule: "required", type: "MachineID", id: 1 },
              mode: { type: "Mode", id: 2 },
              unavailability: { type: "Unavailability", id: 3 }
            },
            nested: { Mode: { values: { UP: 1, DRAINING: 2, DOWN: 3 } } }
          },
          FrameworkInfo: {
            fields: {
              user: { rule: "required", type: "string", id: 1 },
              name: { rule: "required", type: "string", id: 2 },
              id: { type: "FrameworkID", id: 3 },
              failover_timeout: {
                type: "double",
                id: 4,
                options: { default: 0 }
              },
              checkpoint: { type: "bool", id: 5, options: { default: false } },
              role: {
                type: "string",
                id: 6,
                options: { default: "*", deprecated: true }
              },
              roles: { rule: "repeated", type: "string", id: 12 },
              hostname: { type: "string", id: 7 },
              principal: { type: "string", id: 8 },
              webui_url: { type: "string", id: 9 },
              capabilities: { rule: "repeated", type: "Capability", id: 10 },
              labels: { type: "Labels", id: 11 },
              offer_filters: { keyType: "string", type: "OfferFilters", id: 13 }
            },
            nested: {
              Capability: {
                fields: { type: { type: "Type", id: 1 } },
                nested: {
                  Type: {
                    values: {
                      UNKNOWN: 0,
                      REVOCABLE_RESOURCES: 1,

                      TASK_KILLING_STATE: 2,
                      GPU_RESOURCES: 3,
                      SHARED_RESOURCES: 4,
                      PARTITION_AWARE: 5,
                      MULTI_ROLE: 6,
                      RESERVATION_REFINEMENT: 7,
                      REGION_AWARE: 8
                    }
                  }
                }
              }
            }
          },
          CheckInfo: {
            fields: {
              type: { type: "Type", id: 1 },
              command: { type: "Command", id: 2 },
              http: { type: "Http", id: 3 },
              tcp: { type: "Tcp", id: 7 },
              delay_seconds: {
                type: "double",
                id: 4,
                options: { default: 15 }
              },
              interval_seconds: {
                type: "double",
                id: 5,
                options: { default: 10 }
              },
              timeout_seconds: {
                type: "double",
                id: 6,
                options: { default: 20 }
              }
            },
            nested: {
              Type: { values: { UNKNOWN: 0, COMMAND: 1, HTTP: 2, TCP: 3 } },
              Command: {
                fields: {
                  command: { rule: "required", type: "CommandInfo", id: 1 }
                }
              },
              Http: {
                fields: {
                  port: { rule: "required", type: "uint32", id: 1 },
                  path: { type: "string", id: 2 }
                }
              },

              Tcp: {
                fields: { port: { rule: "required", type: "uint32", id: 1 } }
              }
            }
          },
          HealthCheck: {
            fields: {
              delay_seconds: {
                type: "double",
                id: 2,
                options: { default: 15 }
              },
              interval_seconds: {
                type: "double",
                id: 3,
                options: { default: 10 }
              },
              timeout_seconds: {
                type: "double",
                id: 4,
                options: { default: 20 }
              },
              consecutive_failures: {
                type: "uint32",
                id: 5,
                options: { default: 3 }
              },
              grace_period_seconds: {
                type: "double",
                id: 6,
                options: { default: 10 }
              },
              type: { type: "Type", id: 8 },
              command: { type: "CommandInfo", id: 7 },
              http: { type: "HTTPCheckInfo", id: 1 },
              tcp: { type: "TCPCheckInfo", id: 9 }
            },
            nested: {
              Type: { values: { UNKNOWN: 0, COMMAND: 1, HTTP: 2, TCP: 3 } },
              HTTPCheckInfo: {
                fields: {
                  protocol: {
                    type: "NetworkInfo.Protocol",
                    id: 5,
                    options: { default: "IPv4" }
                  },
                  scheme: { type: "string", id: 3 },
                  port: { rule: "required", type: "uint32", id: 1 },
                  path: { type: "string", id: 2 },
                  statuses: {
                    rule: "repeated",
                    type: "uint32",
                    id: 4,
                    options: { packed: false }
                  }
                }
              },

              TCPCheckInfo: {
                fields: {
                  protocol: {
                    type: "NetworkInfo.Protocol",
                    id: 2,
                    options: { default: "IPv4" }
                  },
                  port: { rule: "required", type: "uint32", id: 1 }
                }
              }
            }
          },
          KillPolicy: {
            fields: { grace_period: { type: "DurationInfo", id: 1 } }
          },
          CommandInfo: {
            fields: {
              uris: { rule: "repeated", type: "URI", id: 1 },
              environment: { type: "Environment", id: 2 },
              shell: { type: "bool", id: 6, options: { default: true } },
              value: { type: "string", id: 3 },
              arguments: { rule: "repeated", type: "string", id: 7 },
              user: { type: "string", id: 5 }
            },
            nested: {
              URI: {
                fields: {
                  value: { rule: "required", type: "string", id: 1 },
                  executable: { type: "bool", id: 2 },
                  extract: { type: "bool", id: 3, options: { default: true } },
                  cache: { type: "bool", id: 4 },
                  output_file: { type: "string", id: 5 }
                }
              }
            }
          },
          ExecutorInfo: {
            fields: {
              type: { type: "Type", id: 15 },
              executor_id: { rule: "required", type: "ExecutorID", id: 1 },
              framework_id: { type: "FrameworkID", id: 8 },
              command: { type: "CommandInfo", id: 7 },
              container: { type: "ContainerInfo", id: 11 },
              resources: { rule: "repeated", type: "Resource", id: 5 },
              name: { type: "string", id: 9 },
              source: { type: "string", id: 10, options: { deprecated: true } },
              data: { type: "bytes", id: 4 },
              discovery: { type: "DiscoveryInfo", id: 12 },
              shutdown_grace_period: { type: "DurationInfo", id: 13 },
              labels: { type: "Labels", id: 14 }
            },
            nested: { Type: { values: { UNKNOWN: 0, DEFAULT: 1, CUSTOM: 2 } } }
          },
          DomainInfo: {
            fields: { fault_domain: { type: "FaultDomain", id: 1 } },
            nested: {
              FaultDomain: {
                fields: {
                  region: { rule: "required", type: "RegionInfo", id: 1 },
                  zone: { rule: "required", type: "ZoneInfo", id: 2 }
                },
                nested: {
                  RegionInfo: {
                    fields: {
                      name: { rule: "required", type: "string", id: 1 }
                    }
                  },
                  ZoneInfo: {
                    fields: {
                      name: { rule: "required", type: "string", id: 1 }
                    }
                  }
                }
              }
            }
          },
          MasterInfo: {
            fields: {
              id: { rule: "required", type: "string", id: 1 },
              ip: { rule: "required", type: "uint32", id: 2 },
              port: {
                rule: "required",
                type: "uint32",
                id: 3,
                options: { default: 5050 }
              },
              pid: { type: "string", id: 4 },
              hostname: { type: "string", id: 5 },
              version: { type: "string", id: 6 },
              address: { type: "Address", id: 7 },
              domain: { type: "DomainInfo", id: 8 },
              capabilities: { rule: "repeated", type: "Capability", id: 9 }
            },
            nested: {
              Capability: {
                fields: { type: { type: "Type", id: 1 } },
                nested: {
                  Type: {
                    values: { UNKNOWN: 0, AGENT_UPDATE: 1, AGENT_DRAINING: 2 }
                  }
                }
              }
            }
          },
          AgentInfo: {
            fields: {
              hostname: { rule: "required", type: "string", id: 1 },
              port: { type: "int32", id: 8, options: { default: 5051 } },
              resources: { rule: "repeated", type: "Resource", id: 3 },
              attributes: { rule: "repeated", type: "Attribute", id: 5 },
              id: { type: "AgentID", id: 6 },
              domain: { type: "DomainInfo", id: 10 }
            },
            nested: {
              Capability: {
                fields: { type: { type: "Type", id: 1 } },
                nested: {
                  Type: {
                    values: {
                      UNKNOWN: 0,
                      MULTI_ROLE: 1,
                      HIERARCHICAL_ROLE: 2,
                      RESERVATION_REFINEMENT: 3,
                      RESOURCE_PROVIDER: 4,
                      RESIZE_VOLUME: 5,
                      AGENT_OPERATION_FEEDBACK: 6,
                      AGENT_DRAINING: 7
                    }
                  }
                }
              }
            }
          },
          CSIPluginContainerInfo: {
            fields: {
              services: {
                rule: "repeated",
                type: "Service",
                id: 1,
                options: { packed: false }
              },
              command: { type: "CommandInfo", id: 2 },
              resources: { rule: "repeated", type: "Resource", id: 3 },
              container: { type: "ContainerInfo", id: 4 }
            },
            nested: {
              Service: {
                values: { UNKNOWN: 0, CONTROLLER_SERVICE: 1, NODE_SERVICE: 2 }
              }
            }
          },
          CSIPluginInfo: {
            fields: {
              type: { rule: "required", type: "string", id: 1 },
              name: { rule: "required", type: "string", id: 2 },
              containers: {
                rule: "repeated",
                type: "CSIPluginContainerInfo",
                id: 3
              }
            }
          },
          ResourceProviderInfo: {
            fields: {
              id: { type: "ResourceProviderID", id: 1 },
              attributes: { rule: "repeated", type: "Attribute", id: 2 },
              type: { rule: "required", type: "string", id: 3 },
              name: { rule: "required", type: "string", id: 4 },
              default_reservations: {
                rule: "repeated",
                type: "Resource.ReservationInfo",
                id: 5
              },
              storage: { type: "Storage", id: 6 }
            },
            nested: {
              Storage: {
                fields: {
                  plugin: { rule: "required", type: "CSIPluginInfo", id: 1 },
                  reconciliation_interval_seconds: { type: "double", id: 2 }
                }
              }
            }
          },
          Value: {
            fields: {
              type: { rule: "required", type: "Type", id: 1 },
              scalar: { type: "Scalar", id: 2 },
              ranges: { type: "Ranges", id: 3 },
              set: { type: "Set", id: 4 },
              text: { type: "Text", id: 5 }
            },
            nested: {
              Type: { values: { SCALAR: 0, RANGES: 1, SET: 2, TEXT: 3 } },
              Scalar: {
                fields: { value: { rule: "required", type: "double", id: 1 } }
              },
              Range: {
                fields: {
                  begin: { rule: "required", type: "uint64", id: 1 },
                  end: { rule: "required", type: "uint64", id: 2 }
                }
              },
              Ranges: {
                fields: { range: { rule: "repeated", type: "Range", id: 1 } }
              },
              Set: {
                fields: { item: { rule: "repeated", type: "string", id: 1 } }
              },

              Text: {
                fields: { value: { rule: "required", type: "string", id: 1 } }
              }
            }
          },
          Attribute: {
            fields: {
              name: { rule: "required", type: "string", id: 1 },
              type: { rule: "required", type: "Value.Type", id: 2 },
              scalar: { type: "Value.Scalar", id: 3 },
              ranges: { type: "Value.Ranges", id: 4 },
              set: { type: "Value.Set", id: 6 },
              text: { type: "Value.Text", id: 5 }
            }
          },
          Resource: {
            fields: {
              provider_id: { type: "ResourceProviderID", id: 12 },
              name: { rule: "required", type: "string", id: 1 },
              type: { rule: "required", type: "Value.Type", id: 2 },
              scalar: { type: "Value.Scalar", id: 3 },
              ranges: { type: "Value.Ranges", id: 4 },
              set: { type: "Value.Set", id: 5 },
              role: {
                type: "string",
                id: 6,
                options: { default: "*", deprecated: true }
              },
              allocation_info: { type: "AllocationInfo", id: 11 },
              reservation: { type: "ReservationInfo", id: 8 },
              reservations: {
                rule: "repeated",
                type: "ReservationInfo",
                id: 13
              },
              disk: { type: "DiskInfo", id: 7 },
              revocable: { type: "RevocableInfo", id: 9 },
              shared: { type: "SharedInfo", id: 10 }
            },
            nested: {
              AllocationInfo: { fields: { role: { type: "string", id: 1 } } },
              ReservationInfo: {
                fields: {
                  type: { type: "Type", id: 4 },
                  role: { type: "string", id: 3 },
                  principal: { type: "string", id: 1 },
                  labels: { type: "Labels", id: 2 }
                },
                nested: {
                  Type: { values: { UNKNOWN: 0, STATIC: 1, DYNAMIC: 2 } }
                }
              },
              DiskInfo: {
                fields: {
                  persistence: { type: "Persistence", id: 1 },
                  volume: { type: "Volume", id: 2 },
                  source: { type: "Source", id: 3 }
                },
                nested: {
                  Persistence: {
                    fields: {
                      id: { rule: "required", type: "string", id: 1 },
                      principal: { type: "string", id: 2 }
                    }
                  },
                  Source: {
                    fields: {
                      type: { rule: "required", type: "Type", id: 1 },
                      path: { type: "Path", id: 2 },
                      mount: { type: "Mount", id: 3 },
                      vendor: { type: "string", id: 7 },
                      id: { type: "string", id: 4 },
                      metadata: { type: "Labels", id: 5 },
                      profile: { type: "string", id: 6 }
                    },
                    nested: {
                      Type: {
                        values: {
                          UNKNOWN: 0,
                          PATH: 1,
                          MOUNT: 2,
                          BLOCK: 3,
                          RAW: 4
                        }
                      },
                      Path: { fields: { root: { type: "string", id: 1 } } },
                      Mount: { fields: { root: { type: "string", id: 1 } } }
                    }
                  }
                }
              },
              RevocableInfo: { fields: {} },
              SharedInfo: { fields: {} }
            }
          },

          TrafficControlStatistics: {
            fields: {
              id: { rule: "required", type: "string", id: 1 },
              backlog: { type: "uint64", id: 2 },
              bytes: { type: "uint64", id: 3 },
              drops: { type: "uint64", id: 4 },
              overlimits: { type: "uint64", id: 5 },
              packets: { type: "uint64", id: 6 },
              qlen: { type: "uint64", id: 7 },
              ratebps: { type: "uint64", id: 8 },
              ratepps: { type: "uint64", id: 9 },
              requeues: { type: "uint64", id: 10 }
            }
          },
          IpStatistics: {
            fields: {
              Forwarding: { type: "int64", id: 1 },
              DefaultTTL: { type: "int64", id: 2 },
              InReceives: { type: "int64", id: 3 },
              InHdrErrors: { type: "int64", id: 4 },
              InAddrErrors: { type: "int64", id: 5 },
              ForwDatagrams: { type: "int64", id: 6 },
              InUnknownProtos: { type: "int64", id: 7 },
              InDiscards: { type: "int64", id: 8 },
              InDelivers: { type: "int64", id: 9 },
              OutRequests: { type: "int64", id: 10 },
              OutDiscards: { type: "int64", id: 11 },
              OutNoRoutes: { type: "int64", id: 12 },
              ReasmTimeout: { type: "int64", id: 13 },
              ReasmReqds: { type: "int64", id: 14 },
              ReasmOKs: { type: "int64", id: 15 },
              ReasmFails: { type: "int64", id: 16 },
              FragOKs: { type: "int64", id: 17 },
              FragFails: { type: "int64", id: 18 },
              FragCreates: { type: "int64", id: 19 }
            }
          },
          IcmpStatistics: {
            fields: {
              InMsgs: { type: "int64", id: 1 },
              InErrors: { type: "int64", id: 2 },
              InCsumErrors: { type: "int64", id: 3 },
              InDestUnreachs: { type: "int64", id: 4 },
              InTimeExcds: { type: "int64", id: 5 },
              InParmProbs: { type: "int64", id: 6 },
              InSrcQuenchs: { type: "int64", id: 7 },
              InRedirects: { type: "int64", id: 8 },
              InEchos: { type: "int64", id: 9 },
              InEchoReps: { type: "int64", id: 10 },
              InTimestamps: { type: "int64", id: 11 },
              InTimestampReps: { type: "int64", id: 12 },
              InAddrMasks: { type: "int64", id: 13 },
              InAddrMaskReps: { type: "int64", id: 14 },
              OutMsgs: { type: "int64", id: 15 },
              OutErrors: { type: "int64", id: 16 },
              OutDestUnreachs: { type: "int64", id: 17 },
              OutTimeExcds: { type: "int64", id: 18 },
              OutParmProbs: { type: "int64", id: 19 },
              OutSrcQuenchs: { type: "int64", id: 20 },
              OutRedirects: { type: "int64", id: 21 },
              OutEchos: { type: "int64", id: 22 },
              OutEchoReps: { type: "int64", id: 23 },
              OutTimestamps: { type: "int64", id: 24 },
              OutTimestampReps: { type: "int64", id: 25 },
              OutAddrMasks: { type: "int64", id: 26 },
              OutAddrMaskReps: { type: "int64", id: 27 }
            }
          },

          TcpStatistics: {
            fields: {
              RtoAlgorithm: { type: "int64", id: 1 },
              RtoMin: { type: "int64", id: 2 },
              RtoMax: { type: "int64", id: 3 },
              MaxConn: { type: "int64", id: 4 },
              ActiveOpens: { type: "int64", id: 5 },
              PassiveOpens: { type: "int64", id: 6 },
              AttemptFails: { type: "int64", id: 7 },
              EstabResets: { type: "int64", id: 8 },
              CurrEstab: { type: "int64", id: 9 },
              InSegs: { type: "int64", id: 10 },
              OutSegs: { type: "int64", id: 11 },
              RetransSegs: { type: "int64", id: 12 },
              InErrs: { type: "int64", id: 13 },
              OutRsts: { type: "int64", id: 14 },
              InCsumErrors: { type: "int64", id: 15 }
            }
          },
          UdpStatistics: {
            fields: {
              InDatagrams: { type: "int64", id: 1 },
              NoPorts: { type: "int64", id: 2 },
              InErrors: { type: "int64", id: 3 },
              OutDatagrams: { type: "int64", id: 4 },
              RcvbufErrors: { type: "int64", id: 5 },
              SndbufErrors: { type: "int64", id: 6 },
              InCsumErrors: { type: "int64", id: 7 },
              IgnoredMulti: { type: "int64", id: 8 }
            }
          },
          SNMPStatistics: {
            fields: {
              ip_stats: { type: "IpStatistics", id: 1 },
              icmp_stats: { type: "IcmpStatistics", id: 2 },
              tcp_stats: { type: "TcpStatistics", id: 3 },
              udp_stats: { type: "UdpStatistics", id: 4 }
            }
          },
          DiskStatistics: {
            fields: {
              source: { type: "Resource.DiskInfo.Source", id: 1 },
              persistence: { type: "Resource.DiskInfo.Persistence", id: 2 },
              limit_bytes: { type: "uint64", id: 3 },
              used_bytes: { type: "uint64", id: 4 }
            }
          },
          ResourceStatistics: {
            fields: {
              timestamp: { rule: "required", type: "double", id: 1 },
              processes: { type: "uint32", id: 30 },
              threads: { type: "uint32", id: 31 },
              cpus_user_time_secs: { type: "double", id: 2 },
              cpus_system_time_secs: { type: "double", id: 3 },
              cpus_limit: { type: "double", id: 4 },
              cpus_nr_periods: { type: "uint32", id: 7 },
              cpus_nr_throttled: { type: "uint32", id: 8 },
              cpus_throttled_time_secs: { type: "double", id: 9 },
              mem_total_bytes: { type: "uint64", id: 36 },
              mem_total_memsw_bytes: { type: "uint64", id: 37 },
              mem_limit_bytes: { type: "uint64", id: 6 },
              mem_soft_limit_bytes: { type: "uint64", id: 38 },
              mem_file_bytes: { type: "uint64", id: 10 },
              mem_anon_bytes: { type: "uint64", id: 11 },
              mem_cache_bytes: { type: "uint64", id: 39 },
              mem_rss_bytes: { type: "uint64", id: 5 },
              mem_mapped_file_bytes: { type: "uint64", id: 12 },
              mem_swap_bytes: { type: "uint64", id: 40 },
              mem_unevictable_bytes: { type: "uint64", id: 41 },
              mem_low_pressure_counter: { type: "uint64", id: 32 },
              mem_medium_pressure_counter: { type: "uint64", id: 33 },
              mem_critical_pressure_counter: { type: "uint64", id: 34 },
              disk_limit_bytes: { type: "uint64", id: 26 },
              disk_used_bytes: { type: "uint64", id: 27 },
              disk_statistics: {
                rule: "repeated",
                type: "DiskStatistics",
                id: 43
              },
              blkio_statistics: { type: "CgroupInfo.Blkio.Statistics", id: 44 },
              perf: { type: "PerfStatistics", id: 13 },
              net_rx_packets: { type: "uint64", id: 14 },
              net_rx_bytes: { type: "uint64", id: 15 },
              net_rx_errors: { type: "uint64", id: 16 },
              net_rx_dropped: { type: "uint64", id: 17 },
              net_tx_packets: { type: "uint64", id: 18 },
              net_tx_bytes: { type: "uint64", id: 19 },
              net_tx_errors: { type: "uint64", id: 20 },
              net_tx_dropped: { type: "uint64", id: 21 },
              net_tcp_rtt_microsecs_p50: { type: "double", id: 22 },
              net_tcp_rtt_microsecs_p90: { type: "double", id: 23 },
              net_tcp_rtt_microsecs_p95: { type: "double", id: 24 },
              net_tcp_rtt_microsecs_p99: { type: "double", id: 25 },
              net_tcp_active_connections: { type: "double", id: 28 },
              net_tcp_time_wait_connections: { type: "double", id: 29 },
              net_traffic_control_statistics: {
                rule: "repeated",
                type: "TrafficControlStatistics",
                id: 35
              },
              net_snmp_statistics: { type: "SNMPStatistics", id: 42 }
            }
          },
          ResourceUsage: {
            fields: {
              executors: { rule: "repeated", type: "Executor", id: 1 },
              total: { rule: "repeated", type: "Resource", id: 2 }
            },
            nested: {
              Executor: {
                fields: {
                  executor_info: {
                    rule: "required",
                    type: "ExecutorInfo",
                    id: 1
                  },
                  allocated: { rule: "repeated", type: "Resource", id: 2 },
                  statistics: { type: "ResourceStatistics", id: 3 },
                  container_id: {
                    rule: "required",
                    type: "ContainerID",
                    id: 4
                  },
                  tasks: { rule: "repeated", type: "Task", id: 5 }
                },
                nested: {
                  Task: {
                    fields: {
                      name: { rule: "required", type: "string", id: 1 },
                      id: { rule: "required", type: "TaskID", id: 2 },
                      resources: { rule: "repeated", type: "Resource", id: 3 },
                      labels: { type: "Labels", id: 4 }
                    }
                  }
                }
              }
            }
          },
          PerfStatistics: {
            fields: {
              timestamp: { rule: "required", type: "double", id: 1 },
              duration: { rule: "required", type: "double", id: 2 },
              cycles: { type: "uint64", id: 3 },
              stalled_cycles_frontend: { type: "uint64", id: 4 },
              stalled_cycles_backend: { type: "uint64", id: 5 },
              instructions: { type: "uint64", id: 6 },
              cache_references: { type: "uint64", id: 7 },
              cache_misses: { type: "uint64", id: 8 },
              branches: { type: "uint64", id: 9 },
              branch_misses: { type: "uint64", id: 10 },
              bus_cycles: { type: "uint64", id: 11 },
              ref_cycles: { type: "uint64", id: 12 },
              cpu_clock: { type: "double", id: 13 },
              task_clock: { type: "double", id: 14 },
              page_faults: { type: "uint64", id: 15 },
              minor_faults: { type: "uint64", id: 16 },
              major_faults: { type: "uint64", id: 17 },
              context_switches: { type: "uint64", id: 18 },
              cpu_migrations: { type: "uint64", id: 19 },
              alignment_faults: { type: "uint64", id: 20 },
              emulation_faults: { type: "uint64", id: 21 },
              l1_dcache_loads: { type: "uint64", id: 22 },
              l1_dcache_load_misses: { type: "uint64", id: 23 },
              l1_dcache_stores: { type: "uint64", id: 24 },
              l1_dcache_store_misses: { type: "uint64", id: 25 },
              l1_dcache_prefetches: { type: "uint64", id: 26 },
              l1_dcache_prefetch_misses: { type: "uint64", id: 27 },
              l1_icache_loads: { type: "uint64", id: 28 },
              l1_icache_load_misses: { type: "uint64", id: 29 },
              l1_icache_prefetches: { type: "uint64", id: 30 },
              l1_icache_prefetch_misses: { type: "uint64", id: 31 },
              llc_loads: { type: "uint64", id: 32 },
              llc_load_misses: { type: "uint64", id: 33 },
              llc_stores: { type: "uint64", id: 34 },
              llc_store_misses: { type: "uint64", id: 35 },
              llc_prefetches: { type: "uint64", id: 36 },
              llc_prefetch_misses: { type: "uint64", id: 37 },
              dtlb_loads: { type: "uint64", id: 38 },
              dtlb_load_misses: { type: "uint64", id: 39 },
              dtlb_stores: { type: "uint64", id: 40 },
              dtlb_store_misses: { type: "uint64", id: 41 },
              dtlb_prefetches: { type: "uint64", id: 42 },
              dtlb_prefetch_misses: { type: "uint64", id: 43 },
              itlb_loads: { type: "uint64", id: 44 },
              itlb_load_misses: { type: "uint64", id: 45 },
              branch_loads: { type: "uint64", id: 46 },
              branch_load_misses: { type: "uint64", id: 47 },
              node_loads: { type: "uint64", id: 48 },
              node_load_misses: { type: "uint64", id: 49 },
              node_stores: { type: "uint64", id: 50 },
              node_store_misses: { type: "uint64", id: 51 },
              node_prefetches: { type: "uint64", id: 52 },
              node_prefetch_misses: { type: "uint64", id: 53 }
            }
          },
          OfferFilters: {
            fields: {
              min_allocatable_resources: {
                type: "MinAllocatableResources",
                id: 1
              }
            },
            nested: {
              ResourceQuantities: {
                fields: {
                  quantities: { keyType: "string", type: "Value.Scalar", id: 1 }
                }
              },
              MinAllocatableResources: {
                fields: {
                  quantities: {
                    rule: "repeated",
                    type: "ResourceQuantities",
                    id: 1
                  }
                }
              }
            }
          },
          Request: {
            fields: {
              agent_id: { type: "AgentID", id: 1 },
              resources: { rule: "repeated", type: "Resource", id: 2 }
            }
          },
          Offer: {
            fields: {
              id: { rule: "required", type: "OfferID", id: 1 },
              framework_id: { rule: "required", type: "FrameworkID", id: 2 },
              agent_id: { rule: "required", type: "AgentID", id: 3 },
              hostname: { rule: "required", type: "string", id: 4 },
              url: { type: "URL", id: 8 },
              domain: { type: "DomainInfo", id: 11 },
              resources: { rule: "repeated", type: "Resource", id: 5 },
              attributes: { rule: "repeated", type: "Attribute", id: 7 },
              executor_ids: { rule: "repeated", type: "ExecutorID", id: 6 },
              unavailability: { type: "Unavailability", id: 9 },
              allocation_info: { type: "Resource.AllocationInfo", id: 10 }
            },
            nested: {
              Operation: {
                fields: {
                  type: { type: "Type", id: 1 },
                  id: { type: "OperationID", id: 12 },
                  launch: { type: "Launch", id: 2 },
                  launch_group: { type: "LaunchGroup", id: 7 },
                  reserve: { type: "Reserve", id: 3 },
                  unreserve: { type: "Unreserve", id: 4 },
                  create: { type: "Create", id: 5 },
                  destroy: { type: "Destroy", id: 6 },
                  grow_volume: { type: "GrowVolume", id: 13 },
                  shrink_volume: { type: "ShrinkVolume", id: 14 },
                  create_disk: { type: "CreateDisk", id: 15 },
                  destroy_disk: { type: "DestroyDisk", id: 16 }
                },
                nested: {
                  Type: {
                    values: {
                      UNKNOWN: 0,
                      LAUNCH: 1,
                      LAUNCH_GROUP: 6,
                      RESERVE: 2,
                      UNRESERVE: 3,
                      CREATE: 4,
                      DESTROY: 5,
                      GROW_VOLUME: 11,
                      SHRINK_VOLUME: 12,
                      CREATE_DISK: 13,
                      DESTROY_DISK: 14
                    }
                  },
                  Launch: {
                    fields: {
                      task_infos: { rule: "repeated", type: "TaskInfo", id: 1 }
                    }
                  },
                  LaunchGroup: {
                    fields: {
                      executor: {
                        rule: "required",
                        type: "ExecutorInfo",
                        id: 1
                      },
                      task_group: {
                        rule: "required",
                        type: "TaskGroupInfo",
                        id: 2
                      }
                    }
                  },
                  Reserve: {
                    fields: {
                      source: { rule: "repeated", type: "Resource", id: 2 },
                      resources: { rule: "repeated", type: "Resource", id: 1 }
                    }
                  },
                  Unreserve: {
                    fields: {
                      resources: { rule: "repeated", type: "Resource", id: 1 }
                    }
                  },
                  Create: {
                    fields: {
                      volumes: { rule: "repeated", type: "Resource", id: 1 }
                    }
                  },
                  Destroy: {
                    fields: {
                      volumes: { rule: "repeated", type: "Resource", id: 1 }
                    }
                  },
                  GrowVolume: {
                    fields: {
                      volume: { rule: "required", type: "Resource", id: 1 },
                      addition: { rule: "required", type: "Resource", id: 2 }
                    }
                  },
                  ShrinkVolume: {
                    fields: {
                      volume: { rule: "required", type: "Resource", id: 1 },
                      subtract: {
                        rule: "required",
                        type: "Value.Scalar",
                        id: 2
                      }
                    }
                  },
                  CreateDisk: {
                    fields: {
                      source: { rule: "required", type: "Resource", id: 1 },
                      target_type: {
                        rule: "required",
                        type: "Resource.DiskInfo.Source.Type",
                        id: 2
                      },
                      target_profile: { type: "string", id: 3 }
                    }
                  },
                  DestroyDisk: {
                    fields: {
                      source: { rule: "required", type: "Resource", id: 1 }
                    }
                  }
                }
              }
            }
          },
          InverseOffer: {
            fields: {
              id: { rule: "required", type: "OfferID", id: 1 },
              url: { type: "URL", id: 2 },
              framework_id: { rule: "required", type: "FrameworkID", id: 3 },
              agent_id: { type: "AgentID", id: 4 },
              unavailability: {
                rule: "required",
                type: "Unavailability",
                id: 5
              },
              resources: { rule: "repeated", type: "Resource", id: 6 }
            }
          },

          TaskInfo: {
            fields: {
              name: { rule: "required", type: "string", id: 1 },
              task_id: { rule: "required", type: "TaskID", id: 2 },
              agent_id: { rule: "required", type: "AgentID", id: 3 },
              resources: { rule: "repeated", type: "Resource", id: 4 },
              executor: { type: "ExecutorInfo", id: 5 },
              command: { type: "CommandInfo", id: 7 },
              container: { type: "ContainerInfo", id: 9 },
              health_check: { type: "HealthCheck", id: 8 },
              check: { type: "CheckInfo", id: 13 },
              kill_policy: { type: "KillPolicy", id: 12 },
              data: { type: "bytes", id: 6 },
              labels: { type: "Labels", id: 10 },
              discovery: { type: "DiscoveryInfo", id: 11 },
              max_completion_time: { type: "DurationInfo", id: 14 }
            }
          },

          TaskGroupInfo: {
            fields: { tasks: { rule: "repeated", type: "TaskInfo", id: 1 } }
          },

          Task: {
            fields: {
              name: { rule: "required", type: "string", id: 1 },
              task_id: { rule: "required", type: "TaskID", id: 2 },
              framework_id: { rule: "required", type: "FrameworkID", id: 3 },
              executor_id: { type: "ExecutorID", id: 4 },
              agent_id: { rule: "required", type: "AgentID", id: 5 },
              state: { rule: "required", type: "TaskState", id: 6 },
              resources: { rule: "repeated", type: "Resource", id: 7 },
              statuses: { rule: "repeated", type: "TaskStatus", id: 8 },
              status_update_state: { type: "TaskState", id: 9 },
              status_update_uuid: { type: "bytes", id: 10 },
              labels: { type: "Labels", id: 11 },
              discovery: { type: "DiscoveryInfo", id: 12 },
              container: { type: "ContainerInfo", id: 13 },
              health_check: { type: "HealthCheck", id: 15 },
              kill_policy: { type: "KillPolicy", id: 16 },
              user: { type: "string", id: 14 }
            }
          },

          TaskState: {
            values: {
              TASK_STAGING: 6,

              TASK_STARTING: 0,

              TASK_RUNNING: 1,

              TASK_KILLING: 8,

              TASK_FINISHED: 2,

              TASK_FAILED: 3,

              TASK_KILLED: 4,

              TASK_ERROR: 7,

              TASK_LOST: 5,

              TASK_DROPPED: 9,

              TASK_UNREACHABLE: 10,

              TASK_GONE: 11,

              TASK_GONE_BY_OPERATOR: 12,

              TASK_UNKNOWN: 13
            }
          },

          TaskResourceLimitation: {
            fields: { resources: { rule: "repeated", type: "Resource", id: 1 } }
          },
          UUID: {
            fields: { value: { rule: "required", type: "bytes", id: 1 } }
          },
          Operation: {
            fields: {
              framework_id: { type: "FrameworkID", id: 1 },
              agent_id: { type: "AgentID", id: 2 },
              info: { rule: "required", type: "Offer.Operation", id: 3 },
              latest_status: {
                rule: "required",
                type: "OperationStatus",
                id: 4
              },
              statuses: { rule: "repeated", type: "OperationStatus", id: 5 },
              uuid: { rule: "required", type: "UUID", id: 6 }
            }
          },
          OperationState: {
            values: {
              OPERATION_UNSUPPORTED: 0,
              OPERATION_PENDING: 1,
              OPERATION_FINISHED: 2,
              OPERATION_FAILED: 3,
              OPERATION_ERROR: 4,
              OPERATION_DROPPED: 5,
              OPERATION_UNREACHABLE: 6,
              OPERATION_GONE_BY_OPERATOR: 7,
              OPERATION_RECOVERING: 8,
              OPERATION_UNKNOWN: 9
            }
          },
          OperationStatus: {
            fields: {
              operation_id: { type: "OperationID", id: 1 },
              state: { rule: "required", type: "OperationState", id: 2 },
              message: { type: "string", id: 3 },
              converted_resources: {
                rule: "repeated",
                type: "Resource",
                id: 4
              },
              uuid: { type: "UUID", id: 5 },
              agent_id: { type: "AgentID", id: 6 },
              resource_provider_id: { type: "ResourceProviderID", id: 7 }
            }
          },
          CheckStatusInfo: {
            fields: {
              type: { type: "CheckInfo.Type", id: 1 },
              command: { type: "Command", id: 2 },
              http: { type: "Http", id: 3 },
              tcp: { type: "Tcp", id: 4 }
            },
            nested: {
              Command: { fields: { exit_code: { type: "int32", id: 1 } } },
              Http: { fields: { status_code: { type: "uint32", id: 1 } } },

              Tcp: { fields: { succeeded: { type: "bool", id: 1 } } }
            }
          },

          TaskStatus: {
            fields: {
              task_id: { rule: "required", type: "TaskID", id: 1 },
              state: { rule: "required", type: "TaskState", id: 2 },
              message: { type: "string", id: 4 },
              source: { type: "Source", id: 9 },
              reason: { type: "Reason", id: 10 },
              data: { type: "bytes", id: 3 },
              agent_id: { type: "AgentID", id: 5 },
              executor_id: { type: "ExecutorID", id: 7 },
              timestamp: { type: "double", id: 6 },
              uuid: { type: "bytes", id: 11 },
              healthy: { type: "bool", id: 8 },
              check_status: { type: "CheckStatusInfo", id: 15 },
              labels: { type: "Labels", id: 12 },
              container_status: { type: "ContainerStatus", id: 13 },
              unreachable_time: { type: "TimeInfo", id: 14 },
              limitation: { type: "TaskResourceLimitation", id: 16 }
            },
            nested: {
              Source: {
                values: {
                  SOURCE_MASTER: 0,
                  SOURCE_AGENT: 1,
                  SOURCE_EXECUTOR: 2
                }
              },
              Reason: {
                values: {
                  REASON_COMMAND_EXECUTOR_FAILED: 0,
                  REASON_CONTAINER_LAUNCH_FAILED: 21,
                  REASON_CONTAINER_LIMITATION: 19,
                  REASON_CONTAINER_LIMITATION_DISK: 20,
                  REASON_CONTAINER_LIMITATION_MEMORY: 8,
                  REASON_CONTAINER_PREEMPTED: 17,
                  REASON_CONTAINER_UPDATE_FAILED: 22,
                  REASON_MAX_COMPLETION_TIME_REACHED: 33,
                  REASON_EXECUTOR_REGISTRATION_TIMEOUT: 23,
                  REASON_EXECUTOR_REREGISTRATION_TIMEOUT: 24,
                  REASON_EXECUTOR_TERMINATED: 1,
                  REASON_EXECUTOR_UNREGISTERED: 2,
                  REASON_FRAMEWORK_REMOVED: 3,
                  REASON_GC_ERROR: 4,
                  REASON_INVALID_FRAMEWORKID: 5,
                  REASON_INVALID_OFFERS: 6,
                  REASON_IO_SWITCHBOARD_EXITED: 27,
                  REASON_MASTER_DISCONNECTED: 7,
                  REASON_RECONCILIATION: 9,
                  REASON_RESOURCES_UNKNOWN: 18,
                  REASON_AGENT_DISCONNECTED: 10,
                  REASON_AGENT_DRAINING: 34,
                  REASON_AGENT_REMOVED: 11,
                  REASON_AGENT_REMOVED_BY_OPERATOR: 31,
                  REASON_AGENT_REREGISTERED: 32,
                  REASON_AGENT_RESTARTED: 12,
                  REASON_AGENT_UNKNOWN: 13,
                  REASON_TASK_KILLED_DURING_LAUNCH: 30,
                  REASON_TASK_CHECK_STATUS_UPDATED: 28,
                  REASON_TASK_HEALTH_CHECK_STATUS_UPDATED: 29,
                  REASON_TASK_GROUP_INVALID: 25,
                  REASON_TASK_GROUP_UNAUTHORIZED: 26,
                  REASON_TASK_INVALID: 14,
                  REASON_TASK_UNAUTHORIZED: 15,
                  REASON_TASK_UNKNOWN: 16
                }
              }
            }
          },
          Filters: {
            fields: {
              refuse_seconds: { type: "double", id: 1, options: { default: 5 } }
            }
          },
          Environment: {
            fields: {
              variables: { rule: "repeated", type: "Variable", id: 1 }
            },
            nested: {
              Variable: {
                fields: {
                  name: { rule: "required", type: "string", id: 1 },
                  type: { type: "Type", id: 3, options: { default: "VALUE" } },
                  value: { type: "string", id: 2 },
                  secret: { type: "Secret", id: 4 }
                },
                nested: {
                  Type: { values: { UNKNOWN: 0, VALUE: 1, SECRET: 2 } }
                }
              }
            }
          },
          Parameter: {
            fields: {
              key: { rule: "required", type: "string", id: 1 },
              value: { rule: "required", type: "string", id: 2 }
            }
          },
          Parameters: {
            fields: {
              parameter: { rule: "repeated", type: "Parameter", id: 1 }
            }
          },
          Credential: {
            fields: {
              principal: { rule: "required", type: "string", id: 1 },
              secret: { type: "string", id: 2 }
            }
          },
          Credentials: {
            fields: {
              credentials: { rule: "repeated", type: "Credential", id: 1 }
            }
          },
          Secret: {
            fields: {
              type: { type: "Type", id: 1 },
              reference: { type: "Reference", id: 2 },
              value: { type: "Value", id: 3 }
            },
            nested: {
              Type: { values: { UNKNOWN: 0, REFERENCE: 1, VALUE: 2 } },
              Reference: {
                fields: {
                  name: { rule: "required", type: "string", id: 1 },
                  key: { type: "string", id: 2 }
                }
              },
              Value: {
                fields: { data: { rule: "required", type: "bytes", id: 1 } }
              }
            }
          },
          RateLimit: {
            fields: {
              qps: { type: "double", id: 1 },
              principal: { rule: "required", type: "string", id: 2 },
              capacity: { type: "uint64", id: 3 }
            }
          },
          RateLimits: {
            fields: {
              limits: { rule: "repeated", type: "RateLimit", id: 1 },
              aggregate_default_qps: { type: "double", id: 2 },
              aggregate_default_capacity: { type: "uint64", id: 3 }
            }
          },
          Image: {
            fields: {
              type: { rule: "required", type: "Type", id: 1 },
              appc: { type: "Appc", id: 2 },
              docker: { type: "Docker", id: 3 },
              cached: { type: "bool", id: 4, options: { default: true } }
            },
            nested: {
              Type: { values: { APPC: 1, DOCKER: 2 } },
              Appc: {
                fields: {
                  name: { rule: "required", type: "string", id: 1 },
                  id: { type: "string", id: 2 },
                  labels: { type: "Labels", id: 3 }
                }
              },
              Docker: {
                fields: {
                  name: { rule: "required", type: "string", id: 1 },
                  credential: {
                    type: "Credential",
                    id: 2,
                    options: { deprecated: true }
                  },
                  config: { type: "Secret", id: 3 }
                }
              }
            }
          },
          MountPropagation: {
            fields: { mode: { type: "Mode", id: 1 } },
            nested: {
              Mode: {
                values: { UNKNOWN: 0, HOST_TO_CONTAINER: 1, BIDIRECTIONAL: 2 }
              }
            }
          },
          Volume: {
            fields: {
              mode: { rule: "required", type: "Mode", id: 3 },
              container_path: { rule: "required", type: "string", id: 1 },
              host_path: { type: "string", id: 2 },
              image: { type: "Image", id: 4 },
              source: { type: "Source", id: 5 }
            },
            nested: {
              Mode: { values: { RW: 1, RO: 2 } },
              Source: {
                fields: {
                  type: { type: "Type", id: 1 },
                  docker_volume: { type: "DockerVolume", id: 2 },
                  host_path: { type: "HostPath", id: 5 },
                  sandbox_path: { type: "SandboxPath", id: 3 },
                  secret: { type: "Secret", id: 4 }
                },
                nested: {
                  Type: {
                    values: {
                      UNKNOWN: 0,
                      DOCKER_VOLUME: 1,
                      HOST_PATH: 4,
                      SANDBOX_PATH: 2,
                      SECRET: 3
                    }
                  },
                  DockerVolume: {
                    fields: {
                      driver: { type: "string", id: 1 },
                      name: { rule: "required", type: "string", id: 2 },
                      driver_options: { type: "Parameters", id: 3 }
                    }
                  },
                  HostPath: {
                    fields: {
                      path: { rule: "required", type: "string", id: 1 },
                      mount_propagation: { type: "MountPropagation", id: 2 }
                    }
                  },
                  SandboxPath: {
                    fields: {
                      type: { type: "Type", id: 1 },
                      path: { rule: "required", type: "string", id: 2 }
                    },
                    nested: {
                      Type: { values: { UNKNOWN: 0, SELF: 1, PARENT: 2 } }
                    }
                  }
                }
              }
            }
          },
          NetworkInfo: {
            fields: {
              ip_addresses: { rule: "repeated", type: "IPAddress", id: 5 },
              name: { type: "string", id: 6 },
              groups: { rule: "repeated", type: "string", id: 3 },
              labels: { type: "Labels", id: 4 },
              port_mappings: { rule: "repeated", type: "PortMapping", id: 7 }
            },
            nested: {
              Protocol: { values: { IPv4: 1, IPv6: 2 } },
              IPAddress: {
                fields: {
                  protocol: {
                    type: "Protocol",
                    id: 1,
                    options: { default: "IPv4" }
                  },
                  ip_address: { type: "string", id: 2 }
                }
              },
              PortMapping: {
                fields: {
                  host_port: { rule: "required", type: "uint32", id: 1 },
                  container_port: { rule: "required", type: "uint32", id: 2 },
                  protocol: { type: "string", id: 3 }
                }
              }
            }
          },
          CapabilityInfo: {
            fields: {
              capabilities: {
                rule: "repeated",
                type: "Capability",
                id: 1,
                options: { packed: false }
              }
            },
            nested: {
              Capability: {
                values: {
                  UNKNOWN: 0,
                  CHOWN: 1000,
                  DAC_OVERRIDE: 1001,
                  DAC_READ_SEARCH: 1002,
                  FOWNER: 1003,
                  FSETID: 1004,
                  KILL: 1005,
                  SETGID: 1006,
                  SETUID: 1007,
                  SETPCAP: 1008,
                  LINUX_IMMUTABLE: 1009,
                  NET_BIND_SERVICE: 1010,
                  NET_BROADCAST: 1011,
                  NET_ADMIN: 1012,
                  NET_RAW: 1013,
                  IPC_LOCK: 1014,
                  IPC_OWNER: 1015,
                  SYS_MODULE: 1016,
                  SYS_RAWIO: 1017,
                  SYS_CHROOT: 1018,
                  SYS_PTRACE: 1019,
                  SYS_PACCT: 1020,
                  SYS_ADMIN: 1021,
                  SYS_BOOT: 1022,
                  SYS_NICE: 1023,
                  SYS_RESOURCE: 1024,
                  SYS_TIME: 1025,
                  SYS_TTY_CONFIG: 1026,
                  MKNOD: 1027,
                  LEASE: 1028,
                  AUDIT_WRITE: 1029,
                  AUDIT_CONTROL: 1030,
                  SETFCAP: 1031,
                  MAC_OVERRIDE: 1032,
                  MAC_ADMIN: 1033,
                  SYSLOG: 1034,
                  WAKE_ALARM: 1035,
                  BLOCK_SUSPEND: 1036,
                  AUDIT_READ: 1037
                }
              }
            }
          },
          SeccompInfo: {
            fields: {
              profile_name: { type: "string", id: 1 },
              unconfined: { type: "bool", id: 2 }
            }
          },
          LinuxInfo: {
            fields: {
              capability_info: {
                type: "CapabilityInfo",
                id: 1,
                options: { deprecated: true }
              },
              bounding_capabilities: { type: "CapabilityInfo", id: 2 },
              effective_capabilities: { type: "CapabilityInfo", id: 3 },
              share_pid_namespace: { type: "bool", id: 4 },
              seccomp: { type: "SeccompInfo", id: 5 },
              ipc_mode: { type: "IpcMode", id: 6 },
              shm_size: { type: "uint32", id: 7 }
            },
            nested: {
              IpcMode: { values: { UNKNOWN: 0, PRIVATE: 1, SHARE_PARENT: 2 } }
            }
          },
          RLimitInfo: {
            fields: { rlimits: { rule: "repeated", type: "RLimit", id: 1 } },
            nested: {
              RLimit: {
                fields: {
                  type: { type: "Type", id: 1 },
                  hard: { type: "uint64", id: 2 },
                  soft: { type: "uint64", id: 3 }
                },
                nested: {
                  Type: {
                    values: {
                      UNKNOWN: 0,
                      RLMT_AS: 1,
                      RLMT_CORE: 2,
                      RLMT_CPU: 3,
                      RLMT_DATA: 4,
                      RLMT_FSIZE: 5,
                      RLMT_LOCKS: 6,
                      RLMT_MEMLOCK: 7,
                      RLMT_MSGQUEUE: 8,
                      RLMT_NICE: 9,
                      RLMT_NOFILE: 10,
                      RLMT_NPROC: 11,
                      RLMT_RSS: 12,
                      RLMT_RTPRIO: 13,
                      RLMT_RTTIME: 14,
                      RLMT_SIGPENDING: 15,
                      RLMT_STACK: 16
                    }
                  }
                }
              }
            }
          },

          TTYInfo: {
            fields: { window_size: { type: "WindowSize", id: 1 } },
            nested: {
              WindowSize: {
                fields: {
                  rows: { rule: "required", type: "uint32", id: 1 },
                  columns: { rule: "required", type: "uint32", id: 2 }
                }
              }
            }
          },
          ContainerInfo: {
            fields: {
              type: { rule: "required", type: "Type", id: 1 },
              volumes: { rule: "repeated", type: "Volume", id: 2 },
              hostname: { type: "string", id: 4 },
              docker: { type: "DockerInfo", id: 3 },
              mesos: { type: "MesosInfo", id: 5 },
              network_infos: { rule: "repeated", type: "NetworkInfo", id: 7 },
              linux_info: { type: "LinuxInfo", id: 8 },
              rlimit_info: { type: "RLimitInfo", id: 9 },
              tty_info: { type: "TTYInfo", id: 10 }
            },
            nested: {
              Type: { values: { DOCKER: 1, MESOS: 2 } },
              DockerInfo: {
                fields: {
                  image: { rule: "required", type: "string", id: 1 },
                  network: {
                    type: "Network",
                    id: 2,
                    options: { default: "HOST" }
                  },
                  port_mappings: {
                    rule: "repeated",
                    type: "PortMapping",
                    id: 3
                  },
                  privileged: {
                    type: "bool",
                    id: 4,
                    options: { default: false }
                  },
                  parameters: { rule: "repeated", type: "Parameter", id: 5 },
                  force_pull_image: { type: "bool", id: 6 },
                  volume_driver: {
                    type: "string",
                    id: 7,
                    options: { deprecated: true }
                  }
                },
                nested: {
                  Network: { values: { HOST: 1, BRIDGE: 2, NONE: 3, USER: 4 } },
                  PortMapping: {
                    fields: {
                      host_port: { rule: "required", type: "uint32", id: 1 },
                      container_port: {
                        rule: "required",
                        type: "uint32",
                        id: 2
                      },
                      protocol: { type: "string", id: 3 }
                    }
                  }
                }
              },
              MesosInfo: { fields: { image: { type: "Image", id: 1 } } }
            }
          },
          ContainerStatus: {
            fields: {
              container_id: { type: "ContainerID", id: 4 },
              network_infos: { rule: "repeated", type: "NetworkInfo", id: 1 },
              cgroup_info: { type: "CgroupInfo", id: 2 },
              executor_pid: { type: "uint32", id: 3 }
            }
          },
          CgroupInfo: {
            fields: { net_cls: { type: "NetCls", id: 1 } },
            nested: {
              Blkio: {
                fields: {},
                nested: {
                  Operation: {
                    values: {
                      UNKNOWN: 0,

                      TOTAL: 1,
                      READ: 2,
                      WRITE: 3,
                      SYNC: 4,
                      ASYNC: 5,
                      DISCARD: 6
                    }
                  },
                  Value: {
                    fields: {
                      op: { type: "Operation", id: 1 },
                      value: { type: "uint64", id: 2 }
                    }
                  },
                  CFQ: {
                    fields: {},
                    nested: {
                      Statistics: {
                        fields: {
                          device: { type: "Device.Number", id: 1 },
                          sectors: { type: "uint64", id: 2 },
                          time: { type: "uint64", id: 3 },
                          io_serviced: {
                            rule: "repeated",
                            type: "Value",
                            id: 4
                          },
                          io_service_bytes: {
                            rule: "repeated",
                            type: "Value",
                            id: 5
                          },
                          io_service_time: {
                            rule: "repeated",
                            type: "Value",
                            id: 6
                          },
                          io_wait_time: {
                            rule: "repeated",
                            type: "Value",
                            id: 7
                          },
                          io_merged: { rule: "repeated", type: "Value", id: 8 },
                          io_queued: { rule: "repeated", type: "Value", id: 9 }
                        }
                      }
                    }
                  },

                  Throttling: {
                    fields: {},
                    nested: {
                      Statistics: {
                        fields: {
                          device: { type: "Device.Number", id: 1 },
                          io_serviced: {
                            rule: "repeated",
                            type: "Value",
                            id: 2
                          },
                          io_service_bytes: {
                            rule: "repeated",
                            type: "Value",
                            id: 3
                          }
                        }
                      }
                    }
                  },
                  Statistics: {
                    fields: {
                      cfq: { rule: "repeated", type: "CFQ.Statistics", id: 1 },
                      cfq_recursive: {
                        rule: "repeated",
                        type: "CFQ.Statistics",
                        id: 2
                      },
                      throttling: {
                        rule: "repeated",
                        type: "Throttling.Statistics",
                        id: 3
                      }
                    }
                  }
                }
              },
              NetCls: { fields: { classid: { type: "uint32", id: 1 } } }
            }
          },
          Labels: {
            fields: { labels: { rule: "repeated", type: "Label", id: 1 } }
          },
          Label: {
            fields: {
              key: { rule: "required", type: "string", id: 1 },
              value: { type: "string", id: 2 }
            }
          },
          Port: {
            fields: {
              number: { rule: "required", type: "uint32", id: 1 },
              name: { type: "string", id: 2 },
              protocol: { type: "string", id: 3 },
              visibility: { type: "DiscoveryInfo.Visibility", id: 4 },
              labels: { type: "Labels", id: 5 }
            }
          },
          Ports: {
            fields: { ports: { rule: "repeated", type: "Port", id: 1 } }
          },
          DiscoveryInfo: {
            fields: {
              visibility: { rule: "required", type: "Visibility", id: 1 },
              name: { type: "string", id: 2 },
              environment: { type: "string", id: 3 },
              location: { type: "string", id: 4 },
              version: { type: "string", id: 5 },
              ports: { type: "Ports", id: 6 },
              labels: { type: "Labels", id: 7 }
            },
            nested: {
              Visibility: { values: { FRAMEWORK: 0, CLUSTER: 1, EXTERNAL: 2 } }
            }
          },
          WeightInfo: {
            fields: {
              weight: { rule: "required", type: "double", id: 1 },
              role: { type: "string", id: 2 }
            }
          },
          VersionInfo: {
            fields: {
              version: { rule: "required", type: "string", id: 1 },
              build_date: { type: "string", id: 2 },
              build_time: { type: "double", id: 3 },
              build_user: { type: "string", id: 4 },
              git_sha: { type: "string", id: 5 },
              git_branch: { type: "string", id: 6 },
              git_tag: { type: "string", id: 7 }
            }
          },
          Flag: {
            fields: {
              name: { rule: "required", type: "string", id: 1 },
              value: { type: "string", id: 2 }
            }
          },
          Role: {
            fields: {
              name: { rule: "required", type: "string", id: 1 },
              weight: { rule: "required", type: "double", id: 2 },
              frameworks: { rule: "repeated", type: "FrameworkID", id: 3 },
              resources: { rule: "repeated", type: "Resource", id: 4 }
            }
          },
          Metric: {
            fields: {
              name: { rule: "required", type: "string", id: 1 },
              value: { type: "double", id: 2 }
            }
          },
          FileInfo: {
            fields: {
              path: { rule: "required", type: "string", id: 1 },
              nlink: { type: "int32", id: 2 },
              size: { type: "uint64", id: 3 },
              mtime: { type: "TimeInfo", id: 4 },
              mode: { type: "uint32", id: 5 },
              uid: { type: "string", id: 6 },
              gid: { type: "string", id: 7 }
            }
          },
          Device: {
            fields: {
              path: { type: "string", id: 1 },
              number: { type: "Number", id: 2 }
            },
            nested: {
              Number: {
                fields: {
                  major_number: { rule: "required", type: "uint64", id: 1 },
                  minor_number: { rule: "required", type: "uint64", id: 2 }
                }
              }
            }
          },
          DeviceAccess: {
            fields: {
              device: { rule: "required", type: "Device", id: 1 },
              access: { rule: "required", type: "Access", id: 2 }
            },
            nested: {
              Access: {
                fields: {
                  read: { type: "bool", id: 1 },
                  write: { type: "bool", id: 2 },
                  mknod: { type: "bool", id: 3 }
                }
              }
            }
          },
          DeviceWhitelist: {
            fields: {
              allowed_devices: { rule: "repeated", type: "DeviceAccess", id: 1 }
            }
          },
          DrainState: { values: { UNKNOWN: 0, DRAINING: 1, DRAINED: 2 } },
          DrainConfig: {
            fields: {
              max_grace_period: { type: "DurationInfo", id: 1 },
              mark_gone: { type: "bool", id: 2, options: { default: false } }
            }
          },
          DrainInfo: {
            fields: {
              state: { rule: "required", type: "DrainState", id: 1 },
              config: { rule: "required", type: "DrainConfig", id: 2 }
            }
          },
          maintenance: {
            options: {
              java_package: "org.apache.mesos.v1.maintenance",
              java_outer_classname: "Protos"
            },
            nested: {
              Window: {
                fields: {
                  machine_ids: { rule: "repeated", type: "MachineID", id: 1 },
                  unavailability: {
                    rule: "required",
                    type: "Unavailability",
                    id: 2
                  }
                }
              },
              Schedule: {
                fields: { windows: { rule: "repeated", type: "Window", id: 1 } }
              },
              ClusterStatus: {
                fields: {
                  draining_machines: {
                    rule: "repeated",
                    type: "DrainingMachine",
                    id: 1
                  },
                  down_machines: { rule: "repeated", type: "MachineID", id: 2 }
                },
                nested: {
                  DrainingMachine: {
                    fields: {
                      id: { rule: "required", type: "MachineID", id: 1 },
                      statuses: {
                        rule: "repeated",
                        type: "allocator.InverseOfferStatus",
                        id: 2
                      }
                    }
                  }
                }
              }
            }
          },
          allocator: {
            options: {
              java_package: "org.apache.mesos.v1.allocator",
              java_outer_classname: "Protos"
            },
            nested: {
              InverseOfferStatus: {
                fields: {
                  status: { rule: "required", type: "Status", id: 1 },
                  framework_id: {
                    rule: "required",
                    type: "FrameworkID",
                    id: 2
                  },
                  timestamp: { rule: "required", type: "TimeInfo", id: 3 }
                },
                nested: {
                  Status: { values: { UNKNOWN: 1, ACCEPT: 2, DECLINE: 3 } }
                }
              }
            }
          },
          quota: {
            options: {
              java_package: "org.apache.mesos.v1.quota",
              java_outer_classname: "Protos"
            },
            nested: {
              QuotaInfo: {
                fields: {
                  role: { type: "string", id: 1 },
                  principal: { type: "string", id: 2 },
                  guarantee: { rule: "repeated", type: "Resource", id: 3 }
                }
              },
              QuotaRequest: {
                fields: {
                  force: { type: "bool", id: 1 },
                  role: { type: "string", id: 2 },
                  guarantee: { rule: "repeated", type: "Resource", id: 3 }
                }
              },
              QuotaConfig: {
                fields: {
                  role: { rule: "required", type: "string", id: 1 },
                  guarantees: {
                    keyType: "string",
                    type: "Value.Scalar",
                    id: 2
                  },
                  limits: { keyType: "string", type: "Value.Scalar", id: 3 }
                }
              },
              QuotaStatus: {
                fields: {
                  infos: {
                    rule: "repeated",
                    type: "QuotaInfo",
                    id: 1,
                    options: { deprecated: true }
                  },
                  configs: { rule: "repeated", type: "QuotaConfig", id: 2 }
                }
              }
            }
          },
          master: {
            options: {
              java_package: "org.apache.mesos.v1.master",
              java_outer_classname: "Protos"
            },
            nested: {
              Call: {
                fields: {
                  type: { type: "Type", id: 1 },
                  get_metrics: { type: "GetMetrics", id: 2 },
                  set_logging_level: { type: "SetLoggingLevel", id: 3 },
                  list_files: { type: "ListFiles", id: 4 },
                  read_file: { type: "ReadFile", id: 5 },
                  update_weights: { type: "UpdateWeights", id: 6 },
                  reserve_resources: { type: "ReserveResources", id: 7 },
                  unreserve_resources: { type: "UnreserveResources", id: 8 },
                  create_volumes: { type: "CreateVolumes", id: 9 },
                  destroy_volumes: { type: "DestroyVolumes", id: 10 },
                  grow_volume: { type: "GrowVolume", id: 18 },
                  shrink_volume: { type: "ShrinkVolume", id: 19 },
                  update_maintenance_schedule: {
                    type: "UpdateMaintenanceSchedule",
                    id: 11
                  },
                  start_maintenance: { type: "StartMaintenance", id: 12 },
                  stop_maintenance: { type: "StopMaintenance", id: 13 },
                  drain_agent: { type: "DrainAgent", id: 21 },
                  deactivate_agent: { type: "DeactivateAgent", id: 22 },
                  reactivate_agent: { type: "ReactivateAgent", id: 23 },
                  update_quota: { type: "UpdateQuota", id: 20 },
                  teardown: { type: "Teardown", id: 16 },
                  mark_agent_gone: { type: "MarkAgentGone", id: 17 },
                  set_quota: {
                    type: "SetQuota",
                    id: 14,
                    options: { deprecated: true }
                  },
                  remove_quota: {
                    type: "RemoveQuota",
                    id: 15,
                    options: { deprecated: true }
                  }
                },
                nested: {
                  Type: {
                    values: {
                      UNKNOWN: 0,
                      GET_HEALTH: 1,
                      GET_FLAGS: 2,
                      GET_VERSION: 3,
                      GET_METRICS: 4,
                      GET_LOGGING_LEVEL: 5,
                      SET_LOGGING_LEVEL: 6,
                      LIST_FILES: 7,
                      READ_FILE: 8,
                      GET_STATE: 9,
                      GET_AGENTS: 10,
                      GET_FRAMEWORKS: 11,
                      GET_EXECUTORS: 12,
                      GET_OPERATIONS: 33,
                      GET_TASKS: 13,
                      GET_ROLES: 14,
                      GET_WEIGHTS: 15,
                      UPDATE_WEIGHTS: 16,
                      GET_MASTER: 17,
                      SUBSCRIBE: 18,
                      RESERVE_RESOURCES: 19,
                      UNRESERVE_RESOURCES: 20,
                      CREATE_VOLUMES: 21,
                      DESTROY_VOLUMES: 22,
                      GROW_VOLUME: 34,
                      SHRINK_VOLUME: 35,
                      GET_MAINTENANCE_STATUS: 23,
                      GET_MAINTENANCE_SCHEDULE: 24,
                      UPDATE_MAINTENANCE_SCHEDULE: 25,
                      START_MAINTENANCE: 26,
                      STOP_MAINTENANCE: 27,
                      DRAIN_AGENT: 37,
                      DEACTIVATE_AGENT: 38,
                      REACTIVATE_AGENT: 39,
                      GET_QUOTA: 28,
                      UPDATE_QUOTA: 36,
                      SET_QUOTA: 29,
                      REMOVE_QUOTA: 30,

                      TEARDOWN: 31,
                      MARK_AGENT_GONE: 32
                    }
                  },
                  GetMetrics: {
                    fields: { timeout: { type: "DurationInfo", id: 1 } }
                  },
                  SetLoggingLevel: {
                    fields: {
                      level: { rule: "required", type: "uint32", id: 1 },
                      duration: {
                        rule: "required",
                        type: "DurationInfo",
                        id: 2
                      }
                    }
                  },
                  ListFiles: {
                    fields: {
                      path: { rule: "required", type: "string", id: 1 }
                    }
                  },
                  ReadFile: {
                    fields: {
                      path: { rule: "required", type: "string", id: 1 },
                      offset: { rule: "required", type: "uint64", id: 2 },
                      length: { type: "uint64", id: 3 }
                    }
                  },
                  UpdateWeights: {
                    fields: {
                      weight_infos: {
                        rule: "repeated",
                        type: "WeightInfo",
                        id: 1
                      }
                    }
                  },
                  ReserveResources: {
                    fields: {
                      agent_id: { rule: "required", type: "AgentID", id: 1 },
                      source: { rule: "repeated", type: "Resource", id: 3 },
                      resources: { rule: "repeated", type: "Resource", id: 2 }
                    }
                  },
                  UnreserveResources: {
                    fields: {
                      agent_id: { rule: "required", type: "AgentID", id: 1 },
                      resources: { rule: "repeated", type: "Resource", id: 2 }
                    }
                  },
                  CreateVolumes: {
                    fields: {
                      agent_id: { rule: "required", type: "AgentID", id: 1 },
                      volumes: { rule: "repeated", type: "Resource", id: 2 }
                    }
                  },
                  DestroyVolumes: {
                    fields: {
                      agent_id: { rule: "required", type: "AgentID", id: 1 },
                      volumes: { rule: "repeated", type: "Resource", id: 2 }
                    }
                  },
                  GrowVolume: {
                    fields: {
                      agent_id: { type: "AgentID", id: 1 },
                      volume: { rule: "required", type: "Resource", id: 2 },
                      addition: { rule: "required", type: "Resource", id: 3 }
                    }
                  },
                  ShrinkVolume: {
                    fields: {
                      agent_id: { type: "AgentID", id: 1 },
                      volume: { rule: "required", type: "Resource", id: 2 },
                      subtract: {
                        rule: "required",
                        type: "Value.Scalar",
                        id: 3
                      }
                    }
                  },
                  UpdateMaintenanceSchedule: {
                    fields: {
                      schedule: {
                        rule: "required",
                        type: "maintenance.Schedule",
                        id: 1
                      }
                    }
                  },
                  StartMaintenance: {
                    fields: {
                      machines: { rule: "repeated", type: "MachineID", id: 1 }
                    }
                  },
                  StopMaintenance: {
                    fields: {
                      machines: { rule: "repeated", type: "MachineID", id: 1 }
                    }
                  },
                  DrainAgent: {
                    fields: {
                      agent_id: { rule: "required", type: "AgentID", id: 1 },
                      max_grace_period: {
                        type: "google.protobuf.Duration",
                        id: 2
                      },
                      mark_gone: {
                        type: "bool",
                        id: 3,
                        options: { default: false }
                      }
                    }
                  },
                  DeactivateAgent: {
                    fields: {
                      agent_id: { rule: "required", type: "AgentID", id: 1 }
                    }
                  },
                  ReactivateAgent: {
                    fields: {
                      agent_id: { rule: "required", type: "AgentID", id: 1 }
                    }
                  },
                  UpdateQuota: {
                    fields: {
                      force: { type: "bool", id: 1 },
                      quota_configs: {
                        rule: "repeated",
                        type: "quota.QuotaConfig",
                        id: 2
                      }
                    }
                  },
                  SetQuota: {
                    fields: {
                      quota_request: {
                        rule: "required",
                        type: "quota.QuotaRequest",
                        id: 1
                      }
                    }
                  },
                  RemoveQuota: {
                    fields: {
                      role: { rule: "required", type: "string", id: 1 }
                    }
                  },

                  Teardown: {
                    fields: {
                      framework_id: {
                        rule: "required",
                        type: "FrameworkID",
                        id: 1
                      }
                    }
                  },
                  MarkAgentGone: {
                    fields: {
                      agent_id: { rule: "required", type: "AgentID", id: 1 }
                    }
                  }
                }
              },
              Response: {
                fields: {
                  type: { type: "Type", id: 1 },
                  get_health: { type: "GetHealth", id: 2 },
                  get_flags: { type: "GetFlags", id: 3 },
                  get_version: { type: "GetVersion", id: 4 },
                  get_metrics: { type: "GetMetrics", id: 5 },
                  get_logging_level: { type: "GetLoggingLevel", id: 6 },
                  list_files: { type: "ListFiles", id: 7 },
                  read_file: { type: "ReadFile", id: 8 },
                  get_state: { type: "GetState", id: 9 },
                  get_agents: { type: "GetAgents", id: 10 },
                  get_frameworks: { type: "GetFrameworks", id: 11 },
                  get_executors: { type: "GetExecutors", id: 12 },
                  get_operations: { type: "GetOperations", id: 20 },
                  get_tasks: { type: "GetTasks", id: 13 },
                  get_roles: { type: "GetRoles", id: 14 },
                  get_weights: { type: "GetWeights", id: 15 },
                  get_master: { type: "GetMaster", id: 16 },
                  get_maintenance_status: {
                    type: "GetMaintenanceStatus",
                    id: 17
                  },
                  get_maintenance_schedule: {
                    type: "GetMaintenanceSchedule",
                    id: 18
                  },
                  get_quota: { type: "GetQuota", id: 19 }
                },
                nested: {
                  Type: {
                    values: {
                      UNKNOWN: 0,
                      GET_HEALTH: 1,
                      GET_FLAGS: 2,
                      GET_VERSION: 3,
                      GET_METRICS: 4,
                      GET_LOGGING_LEVEL: 5,
                      LIST_FILES: 6,
                      READ_FILE: 7,
                      GET_STATE: 8,
                      GET_AGENTS: 9,
                      GET_FRAMEWORKS: 10,
                      GET_EXECUTORS: 11,
                      GET_OPERATIONS: 19,
                      GET_TASKS: 12,
                      GET_ROLES: 13,
                      GET_WEIGHTS: 14,
                      GET_MASTER: 15,
                      GET_MAINTENANCE_STATUS: 16,
                      GET_MAINTENANCE_SCHEDULE: 17,
                      GET_QUOTA: 18
                    }
                  },
                  GetHealth: {
                    fields: {
                      healthy: { rule: "required", type: "bool", id: 1 }
                    }
                  },
                  GetFlags: {
                    fields: { flags: { rule: "repeated", type: "Flag", id: 1 } }
                  },
                  GetVersion: {
                    fields: {
                      version_info: {
                        rule: "required",
                        type: "VersionInfo",
                        id: 1
                      }
                    }
                  },
                  GetMetrics: {
                    fields: {
                      metrics: { rule: "repeated", type: "Metric", id: 1 }
                    }
                  },
                  GetLoggingLevel: {
                    fields: {
                      level: { rule: "required", type: "uint32", id: 1 }
                    }
                  },
                  ListFiles: {
                    fields: {
                      file_infos: { rule: "repeated", type: "FileInfo", id: 1 }
                    }
                  },
                  ReadFile: {
                    fields: {
                      size: { rule: "required", type: "uint64", id: 1 },
                      data: { rule: "required", type: "bytes", id: 2 }
                    }
                  },
                  GetState: {
                    fields: {
                      get_tasks: { type: "GetTasks", id: 1 },
                      get_executors: { type: "GetExecutors", id: 2 },
                      get_frameworks: { type: "GetFrameworks", id: 3 },
                      get_agents: { type: "GetAgents", id: 4 }
                    }
                  },
                  GetAgents: {
                    fields: {
                      agents: { rule: "repeated", type: "Agent", id: 1 },
                      recovered_agents: {
                        rule: "repeated",
                        type: "AgentInfo",
                        id: 2
                      }
                    },
                    nested: {
                      Agent: {
                        fields: {
                          agent_info: {
                            rule: "required",
                            type: "AgentInfo",
                            id: 1
                          },
                          active: { rule: "required", type: "bool", id: 2 },
                          deactivated: { type: "bool", id: 12 },
                          version: { rule: "required", type: "string", id: 3 },
                          pid: { type: "string", id: 4 },
                          registered_time: { type: "TimeInfo", id: 5 },
                          reregistered_time: { type: "TimeInfo", id: 6 },
                          total_resources: {
                            rule: "repeated",
                            type: "Resource",
                            id: 7
                          },
                          allocated_resources: {
                            rule: "repeated",
                            type: "Resource",
                            id: 8
                          },
                          offered_resources: {
                            rule: "repeated",
                            type: "Resource",
                            id: 9
                          },
                          capabilities: {
                            rule: "repeated",
                            type: "AgentInfo.Capability",
                            id: 10
                          },
                          resource_providers: {
                            rule: "repeated",
                            type: "ResourceProvider",
                            id: 11
                          },
                          drain_info: { type: "DrainInfo", id: 13 },
                          estimated_drain_start_time: {
                            type: "TimeInfo",
                            id: 14
                          }
                        },
                        nested: {
                          ResourceProvider: {
                            fields: {
                              resource_provider_info: {
                                rule: "required",
                                type: "ResourceProviderInfo",
                                id: 1
                              },
                              total_resources: {
                                rule: "repeated",
                                type: "Resource",
                                id: 2
                              }
                            }
                          }
                        }
                      }
                    }
                  },
                  GetFrameworks: {
                    fields: {
                      frameworks: {
                        rule: "repeated",
                        type: "Framework",
                        id: 1
                      },
                      completed_frameworks: {
                        rule: "repeated",
                        type: "Framework",
                        id: 2
                      },
                      recovered_frameworks: {
                        rule: "repeated",
                        type: "FrameworkInfo",
                        id: 3,
                        options: { deprecated: true }
                      }
                    },
                    nested: {
                      Framework: {
                        fields: {
                          framework_info: {
                            rule: "required",
                            type: "FrameworkInfo",
                            id: 1
                          },
                          active: { rule: "required", type: "bool", id: 2 },
                          connected: { rule: "required", type: "bool", id: 3 },
                          recovered: { rule: "required", type: "bool", id: 11 },
                          registered_time: { type: "TimeInfo", id: 4 },
                          reregistered_time: { type: "TimeInfo", id: 5 },
                          unregistered_time: { type: "TimeInfo", id: 6 },
                          offers: { rule: "repeated", type: "Offer", id: 7 },
                          inverse_offers: {
                            rule: "repeated",
                            type: "InverseOffer",
                            id: 8
                          },
                          allocated_resources: {
                            rule: "repeated",
                            type: "Resource",
                            id: 9
                          },
                          offered_resources: {
                            rule: "repeated",
                            type: "Resource",
                            id: 10
                          }
                        }
                      }
                    }
                  },
                  GetExecutors: {
                    fields: {
                      executors: { rule: "repeated", type: "Executor", id: 1 },
                      orphan_executors: {
                        rule: "repeated",
                        type: "Executor",
                        id: 2,
                        options: { deprecated: true }
                      }
                    },
                    nested: {
                      Executor: {
                        fields: {
                          executor_info: {
                            rule: "required",
                            type: "ExecutorInfo",
                            id: 1
                          },
                          agent_id: { rule: "required", type: "AgentID", id: 2 }
                        }
                      }
                    }
                  },
                  GetOperations: {
                    fields: {
                      operations: { rule: "repeated", type: "Operation", id: 1 }
                    }
                  },
                  GetTasks: {
                    fields: {
                      pending_tasks: { rule: "repeated", type: "Task", id: 1 },
                      tasks: { rule: "repeated", type: "Task", id: 2 },
                      unreachable_tasks: {
                        rule: "repeated",
                        type: "Task",
                        id: 5
                      },
                      completed_tasks: {
                        rule: "repeated",
                        type: "Task",
                        id: 3
                      },
                      orphan_tasks: {
                        rule: "repeated",
                        type: "Task",
                        id: 4,
                        options: { deprecated: true }
                      }
                    }
                  },
                  GetRoles: {
                    fields: { roles: { rule: "repeated", type: "Role", id: 1 } }
                  },
                  GetWeights: {
                    fields: {
                      weight_infos: {
                        rule: "repeated",
                        type: "WeightInfo",
                        id: 1
                      }
                    }
                  },
                  GetMaster: {
                    fields: {
                      master_info: { type: "MasterInfo", id: 1 },
                      start_time: { type: "double", id: 2 },
                      elected_time: { type: "double", id: 3 }
                    }
                  },
                  GetMaintenanceStatus: {
                    fields: {
                      status: {
                        rule: "required",
                        type: "maintenance.ClusterStatus",
                        id: 1
                      }
                    }
                  },
                  GetMaintenanceSchedule: {
                    fields: {
                      schedule: {
                        rule: "required",
                        type: "maintenance.Schedule",
                        id: 1
                      }
                    }
                  },
                  GetQuota: {
                    fields: {
                      status: {
                        rule: "required",
                        type: "quota.QuotaStatus",
                        id: 1
                      }
                    }
                  }
                }
              },
              Event: {
                fields: {
                  type: { type: "Type", id: 1 },
                  subscribed: { type: "Subscribed", id: 2 },
                  task_added: { type: "TaskAdded", id: 3 },
                  task_updated: { type: "TaskUpdated", id: 4 },
                  agent_added: { type: "AgentAdded", id: 5 },
                  agent_removed: { type: "AgentRemoved", id: 6 },
                  framework_added: { type: "FrameworkAdded", id: 7 },
                  framework_updated: { type: "FrameworkUpdated", id: 8 },
                  framework_removed: { type: "FrameworkRemoved", id: 9 }
                },
                nested: {
                  Type: {
                    values: {
                      UNKNOWN: 0,
                      SUBSCRIBED: 1,

                      TASK_ADDED: 2,

                      TASK_UPDATED: 3,
                      AGENT_ADDED: 4,
                      AGENT_REMOVED: 5,
                      FRAMEWORK_ADDED: 6,
                      FRAMEWORK_UPDATED: 7,
                      FRAMEWORK_REMOVED: 8,
                      HEARTBEAT: 9
                    }
                  },
                  Subscribed: {
                    fields: {
                      get_state: { type: "Response.GetState", id: 1 },
                      heartbeat_interval_seconds: { type: "double", id: 2 }
                    }
                  },

                  TaskAdded: {
                    fields: { task: { rule: "required", type: "Task", id: 1 } }
                  },

                  TaskUpdated: {
                    fields: {
                      framework_id: {
                        rule: "required",
                        type: "FrameworkID",
                        id: 1
                      },
                      status: { rule: "required", type: "TaskStatus", id: 2 },
                      state: { rule: "required", type: "TaskState", id: 3 }
                    }
                  },
                  FrameworkAdded: {
                    fields: {
                      framework: {
                        rule: "required",
                        type: "Response.GetFrameworks.Framework",
                        id: 1
                      }
                    }
                  },
                  FrameworkUpdated: {
                    fields: {
                      framework: {
                        rule: "required",
                        type: "Response.GetFrameworks.Framework",
                        id: 1
                      }
                    }
                  },
                  FrameworkRemoved: {
                    fields: {
                      framework_info: {
                        rule: "required",
                        type: "FrameworkInfo",
                        id: 1
                      }
                    }
                  },
                  AgentAdded: {
                    fields: {
                      agent: {
                        rule: "required",
                        type: "Response.GetAgents.Agent",
                        id: 1
                      }
                    }
                  },
                  AgentRemoved: {
                    fields: {
                      agent_id: { rule: "required", type: "AgentID", id: 1 }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
});
export { $root as default };
