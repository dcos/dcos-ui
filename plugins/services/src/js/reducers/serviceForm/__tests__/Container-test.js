const Container = require('../Container');
const Batch = require('../../../../../../../src/js/structs/Batch');
const Transaction = require('../../../../../../../src/js/structs/Transaction');
const {ADD_ITEM, SET} =
  require('../../../../../../../src/js/constants/TransactionTypes');
const {type: {BRIDGE, HOST, USER}} =
  require('../../../../../../../src/js/constants/Networking');

describe('Container', function () {

  describe('#JSONReducer', function () {

    it('should return a null container as default object', function () {
      const batch = new Batch();

      expect(batch.reduce(Container.JSONReducer.bind({}), {}))
        .toEqual({
          docker: {
            forcePullImage: null,
            image: '',
            privileged: null,
            network: null,
            portMappings: null
          }
        });
    });

    it('switches container name along with type', function () {
      let batch = new Batch();
      batch = batch.add(new Transaction(['container', 'type'], 'DOCKER', SET));
      batch = batch.add(
        new Transaction(['container', 'docker', 'image'], 'foo', SET)
      );

      expect(batch.reduce(Container.JSONReducer.bind({}), {}))
        .toEqual({
          docker: {
            image: 'foo',
            forcePullImage: null,
            privileged: null,
            network: undefined,
            portMappings: null
          },
          type: 'DOCKER'
        });
    });

    it('creates new container info when there is nothing', function () {
      let batch = new Batch();
      batch = batch.add(new Transaction(['container', 'type'], 'DOCKER', SET));
      batch = batch.add(
        new Transaction(['container', 'docker', 'image'], 'foo', SET)
      );
      batch = batch.add(new Transaction(['container', 'type'], 'DOCKER', SET));

      expect(batch.reduce(
        Container.JSONReducer.bind({}),
        {}
      )).toEqual({
        docker: {
          image: 'foo',
          forcePullImage: null,
          privileged: null,
          network: undefined,
          portMappings: null
        },
        type: 'DOCKER'
      });
    });

    it('keeps top-level container info with type switch', function () {
      let batch = new Batch();
      batch = batch.add(
        new Transaction(['container', 'docker', 'image'], 'foo', SET)
      );
      batch = batch.add(new Transaction(['container', 'type'], 'MESOS', SET));

      expect(batch.reduce(
        Container.JSONReducer.bind({}),
        {}
      )).toEqual({
        docker: {
          image: 'foo',
          forcePullImage: null,
          privileged: null,
          network: null,
          portMappings: null
        },
        type: 'MESOS'
      });
    });

    it('sets privileged correctly', function () {
      let batch = new Batch();
      batch = batch.add(new Transaction(['container', 'type'], 'DOCKER', SET));
      batch = batch.add(
        new Transaction(['container', 'docker', 'privileged'], true, SET)
      );
      batch = batch.add(
        new Transaction(['container', 'docker', 'image'], 'foo', SET)
      );

      expect(batch.reduce(
        Container.JSONReducer.bind({}),
        {}
      )).toEqual({
        docker: {
          image: 'foo',
          privileged: true,
          forcePullImage: null,
          network: undefined,
          portMappings: null
        },
        type: 'DOCKER'
      });
    });

    it('sets privileged correctly to false', function () {
      let batch = new Batch();
      batch = batch.add(new Transaction(['container', 'type'], 'DOCKER', SET));
      batch = batch.add(
        new Transaction(['container', 'docker', 'image'], 'foo', SET)
      );
      batch = batch.add(
        new Transaction(['container', 'docker', 'privileged'], false, SET)
      );

      expect(batch.reduce(
        Container.JSONReducer.bind({}),
        {}
      )).toEqual({
        docker: {
          image: 'foo',
          privileged: false,
          forcePullImage: null,
          network: undefined,
          portMappings: null
        },
        type: 'DOCKER'
      });
    });

    it('doesn\'t set privileged if path doesn\'t match type', function () {
      let batch = new Batch();
      batch = batch.add(new Transaction(['container', 'type'], 'DOCKER', SET));
      batch = batch.add(
        new Transaction(['container', 'docker', 'image'], 'foo', SET)
      );
      batch = batch.add(
        new Transaction(['container', 'foo', 'privileged'], true, SET)
      );

      expect(batch.reduce(
        Container.JSONReducer.bind({}),
        {}
      )).toEqual({
        docker: {
          image: 'foo',
          forcePullImage: null,
          privileged: null,
          network: undefined,
          portMappings: null
        },
        type: 'DOCKER'
      });
    });

    it('sets forcePullImage correctly', function () {
      let batch = new Batch();
      batch = batch.add(new Transaction(['container', 'type'], 'DOCKER', SET));
      batch = batch.add(
        new Transaction(['container', 'docker', 'image'], 'foo', SET)
      );
      batch = batch.add(
        new Transaction(['container', 'docker', 'forcePullImage'], true, SET)
      );

      expect(batch.reduce(
        Container.JSONReducer.bind({}),
        {}
      )).toEqual({
        docker: {
          image: 'foo',
          forcePullImage: true,
          privileged: null,
          network: undefined,
          portMappings: null
        },
        type: 'DOCKER'
      });
    });

    it('sets forcePullImage correctly to false', function () {
      let batch = new Batch();
      batch = batch.add(new Transaction(['container', 'type'], 'DOCKER', SET));
      batch = batch.add(
        new Transaction(['container', 'docker', 'forcePullImage'], false, SET)
      );
      batch = batch.add(
        new Transaction(['container', 'docker', 'image'], 'foo', SET)
      );

      expect(batch.reduce(
        Container.JSONReducer.bind({}),
        {}
      )).toEqual({
        docker: {
          image: 'foo',
          forcePullImage: false,
          privileged: null,
          network: undefined,
          portMappings: null
        },
        type: 'DOCKER'
      });
    });

    it('doesn\'t set forcePullImage if path doesn\'t match type', function () {
      let batch = new Batch();
      batch = batch.add(
        new Transaction(['container', 'foo', 'forcePullImage'], true, SET)
      );

      expect(batch.reduce(
        Container.JSONReducer.bind({}),
        {}
      )).toEqual({
        docker: {
          forcePullImage: null,
          image: '',
          privileged: null,
          network: null,
          portMappings: null
        }
      });
    });

    it('removes forcePullImage when runtime is changed', function () {
      let batch = new Batch();
      batch = batch.add(new Transaction(['container', 'type'], 'DOCKER', SET));
      batch = batch.add(
        new Transaction(['container', 'docker', 'forcePullImage'], true, SET)
      );
      batch = batch.add(new Transaction(['container', 'type'], 'MESOS', SET));
      batch = batch.add(
        new Transaction(['container', 'docker', 'image'], 'foo', SET)
      );

      expect(batch.reduce(
        Container.JSONReducer.bind({}),
        {}
      )).toEqual({
        docker: {
          forcePullImage: null,
          image: 'foo',
          network: null,
          portMappings: null,
          privileged: null
        },
        type: 'MESOS'
      });
    });

    it('remembers forcePullImage from earlier setting', function () {
      let batch = new Batch();
      batch = batch.add(new Transaction(['container', 'type'], 'DOCKER', SET));
      batch = batch.add(
        new Transaction(['container', 'docker', 'forcePullImage'], true, SET)
      );
      batch = batch.add(new Transaction(['container', 'type'], 'MESOS', SET));
      batch = batch.add(
        new Transaction(['container', 'docker', 'image'], 'foo', SET)
      );
      batch = batch.add(new Transaction(['container', 'type'], 'DOCKER', SET));

      expect(batch.reduce(
        Container.JSONReducer.bind({}),
        {}
      )).toEqual({
        docker: {
          forcePullImage: true,
          image: 'foo',
          network: null,
          portMappings: null,
          privileged: null
        },
        type: 'DOCKER'
      });
    });

    it('sets image correctly', function () {
      let batch = new Batch();
      batch = batch.add(new Transaction(['container', 'type'], 'DOCKER', SET));
      batch = batch.add(
        new Transaction(['container', 'docker', 'image'], 'foo', SET)
      );

      expect(batch.reduce(
        Container.JSONReducer.bind({}),
        {}
      )).toEqual({
        docker: {
          image: 'foo',
          forcePullImage: null,
          privileged: null,
          network: undefined,
          portMappings: null
        },
        type: 'DOCKER'
      });
    });

    it('changes image value correctly', function () {
      let batch = new Batch();
      batch = batch.add(new Transaction(['container', 'type'], 'DOCKER', SET));
      batch = batch.add(
        new Transaction(['container', 'docker', 'image'], 'bar', SET)
      );

      expect(batch.reduce(
        Container.JSONReducer.bind({}),
        {}
      )).toEqual({
        docker: {
          image: 'bar',
          forcePullImage: null,
          privileged: null,
          network: undefined,
          portMappings: null
        },
        type: 'DOCKER'
      });
    });

    it('doesn\'t set image if path doesn\'t match type', function () {
      let batch = new Batch();
      batch = batch.add(
        new Transaction(['container', 'foo', 'image'], 'foo', SET)
      );

      expect(batch.reduce(
        Container.JSONReducer.bind({}),
        {}
      )).toEqual({
        docker: {
          forcePullImage: null,
          image: '',
          privileged: null,
          network: null,
          portMappings: null
        }
      });
    });

    describe('PortMappings', function () {

      it('should create default portDefinition configurations', function () {
        let batch = new Batch();
        batch = batch.add(
          new Transaction(['container', 'type'], 'DOCKER', SET)
        );
        batch = batch.add(
          new Transaction(['container', 'docker', 'network'], USER, SET)
        );
        batch = batch.add(new Transaction(['portDefinitions'], 0, ADD_ITEM));
        batch = batch.add(
          new Transaction(['portDefinitions', 0, 'portMapping'], true)
        );

        expect(batch.reduce(Container.JSONReducer.bind({}), {}))
          .toEqual({
            docker: {
              forcePullImage: null,
              image: '',
              privileged: null,
              network: USER,
              portMappings: [
                {
                  containerPort: 0,
                  hostPort: 0,
                  labels: null,
                  name: null,
                  protocol: 'tcp',
                  servicePort: null
                }
              ]
            },
            type: 'DOCKER'
          });
      });

      it('shouldn\'t include hostPort or protocol when not enabled',
        function () {
          let batch = new Batch();
          batch = batch.add(
            new Transaction(['container', 'type'], 'DOCKER', SET)
          );
          batch = batch.add(
            new Transaction(['container', 'docker', 'network'], USER, SET)
          );
          // This is default
          // batch = batch.add(
          //   new Transaction(['portDefinitions', 0, 'portMapping'], false)
          // );
          batch = batch.add(new Transaction(['portDefinitions'], 0, ADD_ITEM));
          batch = batch.add(
            new Transaction(['portDefinitions', 0, 'protocol', 'udp'], true)
          );
          batch = batch.add(
            new Transaction(['portDefinitions', 0, 'hostPort'], 100)
          );

          expect(batch.reduce(Container.JSONReducer.bind({}), {}))
            .toEqual({
              docker: {
                forcePullImage: null,
                image: '',
                privileged: null,
                network: USER,
                portMappings: [
                  {
                    containerPort: 0,
                    hostPort: null,
                    labels: null,
                    name: null,
                    protocol: null,
                    servicePort: null
                  }
                ]
              },
              type: 'DOCKER'
            });
        }
      );

      it('should include hostPort or protocol when not enabled for BRIDGE',
        function () {
          let batch = new Batch();
          batch = batch.add(
            new Transaction(['container', 'type'], 'DOCKER', SET)
          );
          batch = batch.add(
            new Transaction(['container', 'docker', 'network'], BRIDGE, SET)
          );
          // This is default
          // batch = batch.add(
          //   new Transaction(['portDefinitions',0,'portMapping'], false)
          // );
          batch = batch.add(new Transaction(['portDefinitions'], 0, ADD_ITEM));
          batch = batch.add(
            new Transaction(['portDefinitions', 0, 'protocol', 'tcp'], false)
          );
          batch = batch.add(
            new Transaction(['portDefinitions', 0, 'protocol', 'udp'], true)
          );
          batch = batch.add(
            new Transaction(['portDefinitions', 0, 'automaticPort'], false)
          );
          batch = batch.add(
            new Transaction(['portDefinitions', 0, 'hostPort'], 100)
          );

          expect(batch.reduce(Container.JSONReducer.bind({}), {}))
            .toEqual({
              docker: {
                forcePullImage: null,
                image: '',
                privileged: null,
                network: BRIDGE,
                portMappings: [
                  {
                    containerPort: 0,
                    hostPort: 100,
                    labels: null,
                    name: null,
                    protocol: 'udp',
                    servicePort: null
                  }
                ]
              },
              type: 'DOCKER'
            });
        }
      );

      it('should create default portDefinition configurations', function () {
        let batch = new Batch();
        batch = batch.add(
          new Transaction(['container', 'type'], 'DOCKER', SET)
        );
        batch = batch.add(
          new Transaction(['container', 'docker', 'network'], BRIDGE, SET)
        );
        batch = batch.add(new Transaction(['portDefinitions'], 0, ADD_ITEM));
        batch = batch.add(
          new Transaction(['portDefinitions', 0, 'portMapping'], true)
        );

        expect(batch.reduce(Container.JSONReducer.bind({}), {}))
          .toEqual({
            docker: {
              forcePullImage: null,
              image: '',
              privileged: null,
              network: BRIDGE,
              portMappings: [
                {
                  containerPort: 0,
                  hostPort: 0,
                  labels: null,
                  name: null,
                  protocol: 'tcp',
                  servicePort: null
                }
              ]
            },
            type: 'DOCKER'
          });

        it('shouldn\'t create portMappings by default', function () {
          let batch = new Batch();
          batch = batch.add(new Transaction(['portDefinitions'], 0, ADD_ITEM));

          expect(batch.reduce(Container.JSONReducer.bind({}), {}))
            .toEqual({
              docker: {
                forcePullImage: null,
                image: '',
                privileged: null,
                network: null,
                portMappings: null
              }
            });
        });

        it('shouldn\'t create portMappings for HOST', function () {
          let batch = new Batch();
          batch = batch.add(
            new Transaction(['container', 'type'], 'DOCKER', SET)
          );
          batch = batch.add(
            new Transaction(['container', 'docker', 'network'], HOST, SET)
          );
          batch = batch.add(
            new Transaction(['portDefinitions'], 0, ADD_ITEM)
          );
          batch = batch.add(
            new Transaction(['portDefinitions', 0, 'portMapping'], true)
          );

          expect(batch.reduce(Container.JSONReducer.bind({}), {}))
            .toEqual({
              docker: {
                network: HOST,
                forcePullImage: null,
                image: '',
                privileged: null,
                portMappings: null
              },
              type: 'DOCKER'
            });
        });

        it('should create two default portDefinition configurations',
          function () {
            let batch = new Batch();
            batch = batch.add(
              new Transaction(['container', 'type'], 'DOCKER', SET)
            );
            batch = batch.add(
              new Transaction(['container', 'docker', 'network'], USER, SET)
            );
            batch = batch.add(
              new Transaction(['portDefinitions'], 0, ADD_ITEM)
            );
            batch = batch.add(
              new Transaction(['portDefinitions'], 1, ADD_ITEM)
            );
            batch = batch.add(
              new Transaction(['portDefinitions', 0, 'portMapping'], true)
            );
            batch = batch.add(
              new Transaction(['portDefinitions', 1, 'portMapping'], true)
            );

            expect(batch.reduce(Container.JSONReducer.bind({}), {}))
              .toEqual({
                docker: {
                  forcePullImage: null,
                  image: '',
                  privileged: null,
                  network: USER,
                  portMappings: [
                    {
                      containerPort: 0,
                      hostPort: 0,
                      labels: null,
                      name: null,
                      protocol: 'tcp',
                      servicePort: null
                    },
                    {
                      containerPort: 0,
                      hostPort: 0,
                      labels: null,
                      name: null,
                      protocol: 'tcp',
                      servicePort: null
                    }
                  ]
                },
                type: 'DOCKER'
              });
          }
        );

        it('should set the name value', function () {
          let batch = new Batch();
          batch = batch.add(
            new Transaction(['container', 'type'], 'DOCKER', SET)
          );
          batch = batch.add(
            new Transaction(['container', 'docker', 'network'], USER, SET)
          );
          batch = batch.add(
            new Transaction(['portDefinitions'], 0, ADD_ITEM)
          );
          batch = batch.add(
            new Transaction(['portDefinitions', 0, 'portMapping'], true)
          );
          batch = batch.add(
            new Transaction(['portDefinitions', 0, 'name'], 'foo')
          );

          expect(batch.reduce(Container.JSONReducer.bind({}), {}))
            .toEqual({
              docker: {
                forcePullImage: null,
                image: '',
                privileged: null,
                network: USER,
                portMappings: [
                  {
                    containerPort: 0,
                    hostPort: 0,
                    labels: null,
                    name: 'foo',
                    protocol: 'tcp',
                    servicePort: null
                  }
                ]
              },
              type: 'DOCKER'
            });
        });

        it('should set the port value', function () {
          let batch = new Batch();
          batch = batch.add(
            new Transaction(['container', 'type'], 'DOCKER', SET)
          );
          batch = batch.add(
            new Transaction(['container', 'docker', 'network'], USER, SET)
          );
          batch = batch.add(
            new Transaction(['portDefinitions'], 0, ADD_ITEM)
          );
          batch = batch.add(
            new Transaction(['portDefinitions', 0, 'portMapping'], true)
          );
          batch = batch.add(
            new Transaction(['portDefinitions', 0, 'automaticPort'], false)
          );
          batch = batch.add(
            new Transaction(['portDefinitions', 0, 'hostPort'], 100)
          );

          expect(batch.reduce(Container.JSONReducer.bind({}), {}))
            .toEqual({
              docker: {
                forcePullImage: null,
                image: '',
                privileged: null,
                network: USER,
                portMappings: [
                  {
                    containerPort: 0,
                    hostPort: 100,
                    labels: null,
                    name: null,
                    protocol: 'tcp',
                    servicePort: null
                  }
                ]
              },
              type: 'DOCKER'
            });
        });

        it('should default port value to 0 if automaticPort', function () {
          let batch = new Batch();
          batch = batch.add(
            new Transaction(['container', 'type'], 'DOCKER', SET)
          );
          batch = batch.add(
            new Transaction(['container', 'docker', 'network'], USER, SET)
          );
          batch = batch.add(new Transaction(['portDefinitions'], 0, ADD_ITEM)
          );
          batch = batch.add(
            new Transaction(['portDefinitions', 0, 'portMapping'], true)
          );
          // This is default behavior
          // batch = batch.add(
          //  new Transaction(['portDefinitions', 0, 'automaticPort'], true)
          // );
          batch = batch.add(
            new Transaction(['portDefinitions', 0, 'hostPort'], 100)
          );

          expect(batch.reduce(Container.JSONReducer.bind({}), {}))
            .toEqual({
              docker: {
                forcePullImage: null,
                image: '',
                privileged: null,
                network: USER,
                portMappings: [
                  {
                    containerPort: 0,
                    hostPort: 0,
                    labels: null,
                    name: null,
                    protocol: 'tcp',
                    servicePort: null
                  }
                ]
              },
              type: 'DOCKER'
            });
        });

        it('should set the protocol value', function () {
          let batch = new Batch();
          batch = batch.add(
            new Transaction(['container', 'type'], 'DOCKER', SET)
          );
          batch = batch.add(
            new Transaction(['container', 'docker', 'network'], USER, SET)
          );
          batch = batch.add(
            new Transaction(['portDefinitions'], 0, ADD_ITEM)
          );
          batch = batch.add(
            new Transaction(['portDefinitions', 0, 'portMapping'], true)
          );
          batch = batch.add(
            new Transaction(['portDefinitions', 0, 'protocol', 'tcp'], true)
          );
          batch = batch.add(
            new Transaction(['portDefinitions', 0, 'protocol', 'udp'], true)
          );

          expect(batch.reduce(Container.JSONReducer.bind({}), {}))
            .toEqual({
              docker: {
                forcePullImage: null,
                image: '',
                privileged: null,
                network: USER,
                portMappings: [
                  {
                    containerPort: 0,
                    hostPort: 0,
                    labels: null,
                    name: null,
                    protocol: 'udp,tcp',
                    servicePort: null
                  }
                ]
              },
              type: 'DOCKER'
            });
        });

        it('should add the labels key if the portDefinition is load balanced',
          function () {
            let batch = new Batch();
            batch = batch.add(
              new Transaction(['container', 'type'], 'DOCKER', SET)
            );
            batch = batch.add(
              new Transaction(['container', 'docker', 'network'], USER, SET)
            );
            batch = batch.add(
              new Transaction(['portDefinitions'], 0, ADD_ITEM)
            );
            batch = batch.add(
              new Transaction(['portDefinitions'], 1, ADD_ITEM)
            );
            batch = batch.add(
              new Transaction(['portDefinitions', 0, 'portMapping'], true)
            );
            batch = batch.add(
              new Transaction(['portDefinitions', 1, 'portMapping'], true)
            );
            batch = batch.add(
              new Transaction(['portDefinitions', 1, 'loadBalanced'], true)
            );

            expect(batch.reduce(Container.JSONReducer.bind({}), {}))
              .toEqual({
                docker: {
                  forcePullImage: null,
                  image: '',
                  privileged: null,
                  network: USER,
                  portMappings: [
                    {
                      containerPort: 0,
                      hostPort: 0,
                      labels: null,
                      name: null,
                      protocol: 'tcp',
                      servicePort: null
                    },
                    {
                      containerPort: 0,
                      hostPort: 0,
                      labels: {'VIP_1': ':0'},
                      name: null,
                      protocol: 'tcp',
                      servicePort: null
                    }
                  ]
                },
                type: 'DOCKER'
              });
          }
        );

        it('should add the index of the portDefinition to the VIP keys',
          function () {
            let batch = new Batch();
            batch = batch.add(
              new Transaction(['container', 'type'], 'DOCKER', SET)
            );
            batch = batch.add(
              new Transaction(['container', 'docker', 'network'], USER, SET)
            );
            batch = batch.add(
              new Transaction(['portDefinitions'], 0, ADD_ITEM)
            );
            batch = batch.add(
              new Transaction(['portDefinitions'], 1, ADD_ITEM)
            );
            batch = batch.add(
              new Transaction(['portDefinitions', 0, 'portMapping'], true)
            );
            batch = batch.add(
              new Transaction(['portDefinitions', 1, 'portMapping'], true)
            );
            batch = batch.add(
              new Transaction(['portDefinitions', 0, 'loadBalanced'], true)
            );
            batch = batch.add(
              new Transaction(['portDefinitions', 1, 'loadBalanced'], true)
            );

            expect(batch.reduce(Container.JSONReducer.bind({}), {}))
              .toEqual({
                docker: {
                  forcePullImage: null,
                  image: '',
                  privileged: null,
                  network: USER,
                  portMappings: [
                    {
                      containerPort: 0,
                      hostPort: 0,
                      name: null,
                      protocol: 'tcp',
                      labels: {VIP_0: ':0'},
                      servicePort: null
                    },
                    {
                      containerPort: 0,
                      hostPort: 0,
                      name: null,
                      protocol: 'tcp',
                      labels: {VIP_1: ':0'},
                      servicePort: null
                    }
                  ]
                },
                type: 'DOCKER'
              });
          }
        );

        it('should add the port to the VIP string', function () {
          let batch = new Batch();
          batch = batch.add(
            new Transaction(['container', 'type'], 'DOCKER', SET)
          );
          batch = batch.add(
            new Transaction(['container', 'docker', 'network'], USER, SET)
          );
          batch = batch.add(
            new Transaction(['portDefinitions'], 0, ADD_ITEM)
          );
          batch = batch.add(
            new Transaction(['portDefinitions'], 0, ADD_ITEM)
          );
          batch = batch.add(
            new Transaction(['portDefinitions', 0, 'portMapping'], true)
          );
          batch = batch.add(
            new Transaction(['portDefinitions', 1, 'portMapping'], true)
          );
          batch = batch.add(
            new Transaction(['portDefinitions', 0, 'automaticPort'], false)
          );
          batch = batch.add(
            new Transaction(['portDefinitions', 0, 'hostPort'], 300)
          );
          batch = batch.add(
            new Transaction(['portDefinitions', 0, 'loadBalanced'], true)
          );

          expect(batch.reduce(Container.JSONReducer.bind({}), {}))
            .toEqual({
              docker: {
                forcePullImage: null,
                image: '',
                privileged: null,
                network: USER,
                portMappings: [
                  {
                    containerPort: 0,
                    hostPort: 300,
                    name: null,
                    protocol: 'tcp',
                    labels: {VIP_0: ':300'},
                    servicePort: null
                  },
                  {
                    containerPort: 0,
                    hostPort: 0,
                    labels: null,
                    name: null,
                    protocol: 'tcp',
                    servicePort: null
                  }
                ]
              },
              type: 'DOCKER'
            });
        });

        it('should add the app ID to the VIP string when it is defined',
          function () {
            let batch = new Batch();
            batch = batch.add(
              new Transaction(['container', 'type'], 'DOCKER', SET)
            );
            batch = batch.add(
              new Transaction(['container', 'docker', 'network'], USER, SET)
            );
            batch = batch.add(
              new Transaction(['portDefinitions'], 0, ADD_ITEM)
            );
            batch = batch.add(
              new Transaction(['portDefinitions'], 0, ADD_ITEM)
            );
            batch = batch.add(
              new Transaction(['portDefinitions', 0, 'portMapping'], true)
            );
            batch = batch.add(
              new Transaction(['portDefinitions', 1, 'portMapping'], true)
            );
            batch = batch.add(
              new Transaction(['portDefinitions', 0, 'automaticPort'], false)
            );
            batch = batch.add(
              new Transaction(['portDefinitions', 1, 'loadBalanced'], true)
            );
            batch = batch.add(
              new Transaction(['id'], 'foo')
            );

            expect(batch.reduce(Container.JSONReducer.bind({}), {}))
              .toEqual({
                docker: {
                  forcePullImage: null,
                  image: '',
                  privileged: null,
                  network: USER,
                  portMappings: [
                    {
                      containerPort: 0,
                      hostPort: 0,
                      labels: null,
                      name: null,
                      protocol: 'tcp',
                      servicePort: null
                    },
                    {
                      containerPort: 0,
                      hostPort: 0,
                      name: null,
                      protocol: 'tcp',
                      labels: {'VIP_1': 'foo:0'},
                      servicePort: null
                    }
                  ]
                },
                type: 'DOCKER'
              });
          }
        );

        it('should store portDefinitions even if network is HOST when recorded',
          function () {
            let batch = new Batch();
            batch = batch.add(
              new Transaction(['container', 'type'], 'DOCKER', SET)
            );
            batch = batch.add(
              new Transaction(['portDefinitions'], 0, ADD_ITEM)
            );
            batch = batch.add(
              new Transaction(['portDefinitions'], 0, ADD_ITEM)
            );
            batch = batch.add(
              new Transaction(['portDefinitions', 0, 'portMapping'], true)
            );
            batch = batch.add(
              new Transaction(['portDefinitions', 1, 'portMapping'], true)
            );
            batch = batch.add(
              new Transaction(['portDefinitions', 0, 'automaticPort'], false)
            );
            batch = batch.add(
              new Transaction(['portDefinitions', 1, 'loadBalanced'], true)
            );
            batch = batch.add(
              new Transaction(['id'], 'foo')
            );
            batch = batch.add(
              new Transaction(['container', 'docker', 'network'], USER, SET)
            );

            expect(batch.reduce(Container.JSONReducer.bind({}), {}))
              .toEqual({
                docker: {
                  forcePullImage: null,
                  image: '',
                  privileged: null,
                  network: USER,
                  portMappings: [
                    {
                      containerPort: 0,
                      hostPort: 0,
                      labels: null,
                      name: null,
                      protocol: 'tcp',
                      servicePort: null
                    },
                    {
                      containerPort: 0,
                      hostPort: 0,
                      name: null,
                      protocol: 'tcp',
                      labels: {'VIP_1': 'foo:0'},
                      servicePort: null
                    }
                  ]
                },
                type: 'DOCKER'
              });
          }
        );

        it('should\'t create portMappings when container.type is MESOS',
          function () {
            let batch = new Batch();
            batch = batch.add(
              new Transaction(['container', 'type'], 'MESOS', SET)
            );
            batch = batch.add(
              new Transaction(['container', 'docker', 'network'], USER, SET)
            );
            batch = batch.add(
              new Transaction(['portDefinitions'], 0, ADD_ITEM)
            );
            batch = batch.add(
              new Transaction(['portDefinitions', 0, 'portMapping'], true)
            );

            expect(batch.reduce(Container.JSONReducer.bind({}), {}))
              .toEqual({
                docker: {
                  forcePullImage: null,
                  image: '',
                  privileged: null,
                  network: null,
                  portMappings: null
                },
                type: 'MESOS'
              });
          }
        );

      });

    });

  });

});
