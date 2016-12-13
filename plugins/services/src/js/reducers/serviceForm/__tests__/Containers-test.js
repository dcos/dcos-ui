const Containers = require('../Containers');
const Batch = require('../../../../../../../src/js/structs/Batch');
const Transaction = require('../../../../../../../src/js/structs/Transaction');
const {ADD_ITEM} = require('../../../../../../../src/js/constants/TransactionTypes');
const {DEFAULT_POD_CONTAINER} = require('../../../constants/DefaultPod');

describe('Containers', function () {

  describe('#JSONReducer', function () {

    it('should pass through state as default', function () {
      let batch = new Batch();

      expect(batch.reduce(Containers.JSONReducer.bind({}), []))
      .toEqual([]);
    });

    it('returns an array as default with a container path Transaction', function () {
      let batch = new Batch();
      batch = batch.add(new Transaction(['containers'], 0, ADD_ITEM));

      expect(batch.reduce(Containers.JSONReducer.bind({})))
        .toEqual([DEFAULT_POD_CONTAINER]);
    });

    describe('endpoints', function () {
      describe('Host Mode', function () {

        it('should have one endpoint', function () {
          let batch = new Batch();

          batch = batch.add(new Transaction(['containers'], 0, ADD_ITEM));

          batch =
              batch.add(new Transaction([
                'containers',
                0,
                'endpoints'
              ], 0, ADD_ITEM));

          expect(batch.reduce(Containers.JSONReducer.bind({})))
          .toEqual([
            {
              name: 'container 1',
              endpoints: [
                {
                  name: null,
                  hostPort: 0,
                  protocol: [
                    'tcp'
                  ]
                }
              ]
            }
          ]);
        });

        it('should have one endpoint with name', function () {
          let batch = new Batch();

          batch = batch.add(new Transaction(['containers'], 0, ADD_ITEM));

          batch =
              batch.add(new Transaction([
                'containers',
                0,
                'endpoints'
              ], 0, ADD_ITEM));

          batch =
              batch.add(new Transaction([
                'containers',
                0,
                'endpoints',
                0,
                'name'
              ], 'foo'));

          expect(batch.reduce(Containers.JSONReducer.bind({})))
          .toEqual([
            {
              name: 'container 1',
              endpoints: [
                {
                  name: 'foo',
                  hostPort: 0,
                  protocol: [
                    'tcp'
                  ]
                }
              ]
            }
          ]);
        });

        it('should have one endpoint with name and a hostport', function () {
          let batch = new Batch();

          batch = batch.add(new Transaction(['containers'], 0, ADD_ITEM));

          batch = batch.add(new Transaction(['network'], 'HOST'));

          batch =
              batch.add(new Transaction([
                'containers',
                0,
                'endpoints'
              ], 0, ADD_ITEM));

          batch =
              batch.add(new Transaction([
                'containers',
                0,
                'endpoints',
                0,
                'name'
              ], 'foo'));

          batch =
              batch.add(new Transaction([
                'containers',
                0,
                'endpoints',
                0,
                'automaticPort'
              ], false));

          batch =
              batch.add(new Transaction([
                'containers',
                0,
                'endpoints',
                0,
                'hostPort'
              ], 8080));

          expect(batch.reduce(Containers.JSONReducer.bind({})))
          .toEqual([
            {
              name: 'container 1',
              endpoints: [
                {
                  name: 'foo',
                  hostPort: 8080,
                  protocol: [
                    'tcp'
                  ]
                }
              ]
            }
          ]);
        });

        it('should set the protocol right', function () {
          let batch = new Batch();

          batch = batch.add(new Transaction(['containers'], 0, ADD_ITEM));

          batch = batch.add(new Transaction(['network'], 'HOST'));

          batch =
              batch.add(new Transaction([
                'containers',
                0,
                'endpoints'
              ], 0, ADD_ITEM));

          batch =
              batch.add(new Transaction([
                'containers',
                0,
                'endpoints',
                0,
                'protocol'
              ], 'udp'));

          expect(batch.reduce(Containers.JSONReducer.bind({})))
          .toEqual([
            {
              name: 'container 1',
              endpoints: [
                {
                  name: null,
                  hostPort: 0,
                  protocol: [
                    'udp'
                  ]
                }
              ]
            }
          ]);
        });

        it('should set protocol to unknown value', function () {
          let batch = new Batch();

          batch = batch.add(new Transaction(['containers'], 0, ADD_ITEM));

          batch = batch.add(new Transaction(['network'], 'HOST'));

          batch =
              batch.add(new Transaction([
                'containers',
                0,
                'endpoints'
              ], 0, ADD_ITEM));

          batch =
              batch.add(new Transaction([
                'containers',
                0,
                'endpoints',
                0,
                'protocol'
              ], 'foo'));

          expect(batch.reduce(Containers.JSONReducer.bind({})))
          .toEqual([
            {
              name: 'container 1',
              endpoints: [
                {
                  name: null,
                  hostPort: 0,
                  protocol: [
                    'foo'
                  ]
                }
              ]
            }
          ]);
        });

      });

      describe('container Mode', function () {

        it('should have one endpoint', function () {
          let batch = new Batch();

          batch = batch.add(new Transaction(['containers'], 0, ADD_ITEM));

          batch = batch.add(new Transaction(['network'], 'CONTAINER.foo'));

          batch =
              batch.add(new Transaction([
                'containers',
                0,
                'endpoints'
              ], 0, ADD_ITEM));

          expect(batch.reduce(Containers.JSONReducer.bind({})))
          .toEqual([
            {
              name: 'container 1',
              endpoints: [
                {
                  name: null,
                  hostPort: 0,
                  containerPort: null,
                  labels: null,
                  protocol: [
                    'tcp'
                  ]
                }
              ]
            }
          ]);
        });

        it('should have one endpoint with name', function () {
          let batch = new Batch();

          batch = batch.add(new Transaction(['containers'], 0, ADD_ITEM));

          batch = batch.add(new Transaction(['network'], 'CONTAINER.foo'));

          batch =
              batch.add(new Transaction([
                'containers',
                0,
                'endpoints'
              ], 0, ADD_ITEM));

          batch =
              batch.add(new Transaction([
                'containers',
                0,
                'endpoints',
                0,
                'name'
              ], 'foo'));

          expect(batch.reduce(Containers.JSONReducer.bind({})))
          .toEqual([
            {
              name: 'container 1',
              endpoints: [
                {
                  name: 'foo',
                  containerPort: null,
                  labels: null,
                  hostPort: 0,
                  protocol: [
                    'tcp'
                  ]
                }
              ]
            }
          ]);
        });

        it('should have one endpoint with name and a hostport', function () {
          let batch = new Batch();

          batch = batch.add(new Transaction(['containers'], 0, ADD_ITEM));

          batch = batch.add(new Transaction(['network'], 'CONTAINER.foo'));

          batch =
              batch.add(new Transaction([
                'containers',
                0,
                'endpoints'
              ], 0, ADD_ITEM));

          batch =
              batch.add(new Transaction([
                'containers',
                0,
                'endpoints',
                0,
                'name'
              ], 'foo'));

          batch =
              batch.add(new Transaction([
                'containers',
                0,
                'endpoints',
                0,
                'automaticPort'
              ], false));

          batch =
              batch.add(new Transaction([
                'containers',
                0,
                'endpoints',
                0,
                'hostPort'
              ], 8080));

          expect(batch.reduce(Containers.JSONReducer.bind({})))
          .toEqual([
            {
              name: 'container 1',
              endpoints: [
                {
                  name: 'foo',
                  containerPort: null,
                  labels: null,
                  hostPort: 8080,
                  protocol: [
                    'tcp'
                  ]
                }
              ]
            }
          ]);
        });

        it('should set the protocol right', function () {
          let batch = new Batch();

          batch = batch.add(new Transaction(['containers'], 0, ADD_ITEM));

          batch = batch.add(new Transaction(['network'], 'CONTAINER.foo'));

          batch =
              batch.add(new Transaction([
                'containers',
                0,
                'endpoints'
              ], 0, ADD_ITEM));

          batch =
              batch.add(new Transaction([
                'containers',
                0,
                'endpoints',
                0,
                'protocol'
              ], 'udp'));

          expect(batch.reduce(Containers.JSONReducer.bind({})))
          .toEqual([
            {
              name: 'container 1',
              endpoints: [
                {
                  name: null,
                  containerPort: null,
                  labels: null,
                  hostPort: 0,
                  protocol: [
                    'udp'
                  ]
                }
              ]
            }
          ]);
        });

        it('should set protocol to unknown value', function () {
          let batch = new Batch();

          batch = batch.add(new Transaction(['containers'], 0, ADD_ITEM));

          batch = batch.add(new Transaction(['network'], 'CONTAINER.foo'));

          batch =
              batch.add(new Transaction([
                'containers',
                0,
                'endpoints'
              ], 0, ADD_ITEM));

          batch =
              batch.add(new Transaction([
                'containers',
                0,
                'endpoints',
                0,
                'protocol'
              ], 'foo'));

          expect(batch.reduce(Containers.JSONReducer.bind({})))
          .toEqual([
            {
              name: 'container 1',
              endpoints: [
                {
                  name: null,
                  containerPort: null,
                  labels: null,
                  hostPort: 0,
                  protocol: [
                    'foo'
                  ]
                }
              ]
            }
          ]);
        });

        it('should set the right contianer Port', function () {
          let batch = new Batch();

          batch = batch.add(new Transaction(['containers'], 0, ADD_ITEM));

          batch = batch.add(new Transaction(['network'], 'CONTAINER.foo'));

          batch =
              batch.add(new Transaction([
                'containers',
                0,
                'endpoints'
              ], 0, ADD_ITEM));

          batch =
              batch.add(new Transaction([
                'containers',
                0,
                'endpoints',
                0,
                'containerPort'
              ], '8080'));

          expect(batch.reduce(Containers.JSONReducer.bind({})))
          .toEqual([
            {
              name: 'container 1',
              endpoints: [
                {
                  name: null,
                  containerPort: 8080,
                  labels: null,
                  hostPort: 0,
                  protocol: [
                    'tcp'
                  ]
                }
              ]
            }
          ]);
        });

        it('should set the right vip', function () {
          let batch = new Batch();

          batch = batch.add(new Transaction(['containers'], 0, ADD_ITEM));

          batch = batch.add(new Transaction(['network'], 'CONTAINER.foo'));
          batch = batch.add(new Transaction(['id'], '/foobar'));

          batch =
              batch.add(new Transaction([
                'containers',
                0,
                'endpoints'
              ], 0, ADD_ITEM));

          batch =
              batch.add(new Transaction([
                'containers',
                0,
                'endpoints',
                0,
                'containerPort'
              ], '8080'));

          batch =
              batch.add(new Transaction([
                'containers',
                0,
                'endpoints',
                0,
                'loadBalanced'
              ], true));

          expect(batch.reduce(Containers.JSONReducer.bind({})))
          .toEqual([
            {
              name: 'container 1',
              endpoints: [
                {
                  name: null,
                  containerPort: 8080,
                  labels: {
                    'VIP_0': '/foobar:8080'
                  },
                  hostPort: 0,
                  protocol: [
                    'tcp'
                  ]
                }
              ]
            }
          ]);
        });

        it('should set the right custom vip', function () {
          let batch = new Batch();

          batch = batch.add(new Transaction(['containers'], 0, ADD_ITEM));

          batch = batch.add(new Transaction(['network'], 'CONTAINER.foo'));
          batch = batch.add(new Transaction(['id'], '/foobar'));

          batch =
              batch.add(new Transaction([
                'containers',
                0,
                'endpoints'
              ], 0, ADD_ITEM));

          batch =
              batch.add(new Transaction([
                'containers',
                0,
                'endpoints',
                0,
                'containerPort'
              ], '8080'));

          batch =
              batch.add(new Transaction([
                'containers',
                0,
                'endpoints',
                0,
                'loadBalanced'
              ], true));

          batch =
              batch.add(new Transaction([
                'containers',
                0,
                'endpoints',
                0,
                'vip'
              ], '1.3.3.7:8080'));

          expect(batch.reduce(Containers.JSONReducer.bind({})))
          .toEqual([
            {
              name: 'container 1',
              endpoints: [
                {
                  name: null,
                  containerPort: 8080,
                  labels: {
                    'VIP_0': '1.3.3.7:8080'
                  },
                  hostPort: 0,
                  protocol: [
                    'tcp'
                  ]
                }
              ]
            }
          ]);
        });

        it('should set the right vip after id change', function () {
          let batch = new Batch();

          batch = batch.add(new Transaction(['containers'], 0, ADD_ITEM));

          batch = batch.add(new Transaction(['network'], 'CONTAINER.foo'));
          batch = batch.add(new Transaction(['id'], '/foobar'));

          batch =
              batch.add(new Transaction([
                'containers',
                0,
                'endpoints'
              ], 0, ADD_ITEM));

          batch =
              batch.add(new Transaction([
                'containers',
                0,
                'endpoints',
                0,
                'containerPort'
              ], '8080'));

          batch =
              batch.add(new Transaction([
                'containers',
                0,
                'endpoints',
                0,
                'loadBalanced'
              ], true));

          batch = batch.add(new Transaction(['id'], '/barfoo'));

          expect(batch.reduce(Containers.JSONReducer.bind({})))
          .toEqual([
            {
              name: 'container 1',
              endpoints: [
                {
                  name: null,
                  containerPort: 8080,
                  labels: {
                    'VIP_0': '/barfoo:8080'
                  },
                  hostPort: 0,
                  protocol: [
                    'tcp'
                  ]
                }
              ]
            }
          ]);
        });

        it('should set the right custom vip even after id change', function () {
          let batch = new Batch();

          batch = batch.add(new Transaction(['containers'], 0, ADD_ITEM));

          batch = batch.add(new Transaction(['network'], 'CONTAINER.foo'));
          batch = batch.add(new Transaction(['id'], '/foobar'));

          batch =
              batch.add(new Transaction([
                'containers',
                0,
                'endpoints'
              ], 0, ADD_ITEM));

          batch =
              batch.add(new Transaction([
                'containers',
                0,
                'endpoints',
                0,
                'containerPort'
              ], '8080'));

          batch =
              batch.add(new Transaction([
                'containers',
                0,
                'endpoints',
                0,
                'loadBalanced'
              ], true));

          batch =
              batch.add(new Transaction([
                'containers',
                0,
                'endpoints',
                0,
                'vip'
              ], '1.3.3.7:8080'));

          batch = batch.add(new Transaction(['id'], '/barfoo'));

          expect(batch.reduce(Containers.JSONReducer.bind({})))
          .toEqual([
            {
              name: 'container 1',
              endpoints: [
                {
                  name: null,
                  containerPort: 8080,
                  labels: {
                    'VIP_0': '1.3.3.7:8080'
                  },
                  hostPort: 0,
                  protocol: [
                    'tcp'
                  ]
                }
              ]
            }
          ]);
        });

      });
    });
  });

  // FormReducer is the same as JSONReducer
});
