const Container = require('../Container');
const Batch = require('../../../../../../../src/js/structs/Batch');
const Transaction = require('../../../../../../../src/js/structs/Transaction');
const {SET} = require('../../../../../../../src/js/constants/TransactionTypes');

describe('Container', function () {

  describe('#JSONReducer', function () {

    it('should return a mesos container as default object', function () {
      let batch = new Batch();

      expect(batch.reduce(Container.JSONReducer.bind({}), {}))
        .toEqual({type: 'MESOS', mesos: {}});
    });

    it('switches container name along with type', function () {
      let batch = new Batch();
      batch.add(new Transaction(['container', 'type'], 'DOCKER', SET));

      expect(batch.reduce(Container.JSONReducer.bind({}), {}))
        .toEqual({type: 'DOCKER', docker: {}});
    });

    it('copies container info with type switch', function () {
      let batch = new Batch();
      batch.add(new Transaction(['container', 'type'], 'DOCKER', SET));

      expect(batch.reduce(
        Container.JSONReducer.bind({}),
        {type: 'MESOS', mesos: {image: 'foo'}}
      )).toEqual({type: 'DOCKER', docker: {image: 'foo'}});
    });

    it('creates new container when container name doesn\'t match', function () {
      let batch = new Batch();
      batch.add(new Transaction(['container', 'type'], 'DOCKER', SET));

      expect(batch.reduce(
        Container.JSONReducer.bind({}),
        {type: 'MESOS', docker: {image: 'foo'}}
      )).toEqual({type: 'DOCKER', docker: {}});
    });

    it('keeps top-level container info with type switch', function () {
      let batch = new Batch();
      batch.add(new Transaction(['container', 'type'], 'MESOS', SET));

      expect(batch.reduce(
        Container.JSONReducer.bind({}),
        {type: 'DOCKER', foo: 'bar'}
      )).toEqual({type: 'MESOS', foo: 'bar', mesos: {}});
    });

    it('sets privileged correctly', function () {
      let batch = new Batch();
      batch.add(
        new Transaction(['container', 'mesos', 'privileged'], true, SET)
      );

      expect(batch.reduce(
        Container.JSONReducer.bind({}),
        {type: 'MESOS'}
      )).toEqual({type: 'MESOS', mesos: {privileged: true}});
    });

    it('sets privileged correctly to false', function () {
      let batch = new Batch();
      batch.add(
        new Transaction(['container', 'mesos', 'privileged'], false, SET)
      );

      expect(batch.reduce(
        Container.JSONReducer.bind({}),
        {type: 'MESOS', mesos: {privileged: false}}
      )).toEqual({type: 'MESOS', mesos: {privileged: false}});
    });

    it('doesn\'t set privileged if path doesn\'t match type', function () {
      let batch = new Batch();
      batch.add(
        new Transaction(['container', 'foo', 'privileged'], true, SET)
      );

      expect(batch.reduce(
        Container.JSONReducer.bind({}),
        {type: 'MESOS', mesos: {}}
      )).toEqual({type: 'MESOS', mesos: {}});
    });

    it('sets forcePullImage correctly', function () {
      let batch = new Batch();
      batch.add(
        new Transaction(['container', 'mesos', 'forcePullImage'], true, SET)
      );

      expect(batch.reduce(
        Container.JSONReducer.bind({}),
        {type: 'MESOS'}
      )).toEqual({type: 'MESOS', mesos: {forcePullImage: true}});
    });

    it('sets forcePullImage correctly to false', function () {
      let batch = new Batch();
      batch.add(
        new Transaction(['container', 'mesos', 'forcePullImage'], false, SET)
      );

      expect(batch.reduce(
        Container.JSONReducer.bind({}),
        {type: 'MESOS', mesos: {forcePullImage: false}}
      )).toEqual({type: 'MESOS', mesos: {forcePullImage: false}});
    });

    it('doesn\'t set forcePullImage if path doesn\'t match type', function () {
      let batch = new Batch();
      batch.add(
        new Transaction(['container', 'foo', 'forcePullImage'], true, SET)
      );

      expect(batch.reduce(
        Container.JSONReducer.bind({}),
        {type: 'MESOS', mesos: {}}
      )).toEqual({type: 'MESOS', mesos: {}});
    });

    it('sets image correctly', function () {
      let batch = new Batch();
      batch.add(
        new Transaction(['container', 'mesos', 'image'], 'foo', SET)
      );

      expect(batch.reduce(
        Container.JSONReducer.bind({}),
        {type: 'MESOS'}
      )).toEqual({type: 'MESOS', mesos: {image: 'foo'}});
    });

    it('changes image value correctly', function () {
      let batch = new Batch();
      batch.add(
        new Transaction(['container', 'mesos', 'image'], 'bar', SET)
      );

      expect(batch.reduce(
        Container.JSONReducer.bind({}),
        {type: 'MESOS', mesos: {image: 'foo'}}
      )).toEqual({type: 'MESOS', mesos: {image: 'bar'}});
    });

    it('doesn\'t set image if path doesn\'t match type', function () {
      let batch = new Batch();
      batch.add(
        new Transaction(['container', 'foo', 'image'], 'foo', SET)
      );

      expect(batch.reduce(
        Container.JSONReducer.bind({}),
        {type: 'MESOS', mesos: {}}
      )).toEqual({type: 'MESOS', mesos: {}});
    });

  });

  // FormReducer is the same as JSONReducer
});
