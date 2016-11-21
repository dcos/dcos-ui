const Container = require('../Container');
const Batch = require('../../../../../../../src/js/structs/Batch');
const Transaction = require('../../../../../../../src/js/structs/Transaction');
const {SET} = require('../../../../../../../src/js/constants/TransactionTypes');

describe('Container', function () {

  describe('#JSONReducer', function () {

    it('should return a mesos container as default object', function () {
      let batch = new Batch();

      expect(batch.reduce(Container.JSONReducer.bind({}), {}))
        .toEqual({type: 'MESOS'});
    });

    it('switches container name along with type', function () {
      let batch = new Batch();
      batch = batch.add(new Transaction(['container', 'type'], 'DOCKER', SET));

      expect(batch.reduce(Container.JSONReducer.bind({}), {}))
        .toEqual({type: 'DOCKER'});
    });

    it('keeps container info with type switch', function () {
      let batch = new Batch();
      batch = batch.add(new Transaction(['container', 'type'], 'DOCKER', SET));

      expect(batch.reduce(
        Container.JSONReducer.bind({}),
        {type: 'MESOS', docker: {image: 'foo'}}
      )).toEqual({type: 'DOCKER', docker: {image: 'foo'}});
    });

    it('creates new container info when there is nothing', function () {
      let batch = new Batch();
      batch = batch.add(new Transaction(['container', 'type'], 'DOCKER', SET));

      expect(batch.reduce(
        Container.JSONReducer.bind({}),
        {type: 'MESOS'}
      )).toEqual({type: 'DOCKER'});
    });

    it('keeps top-level container info with type switch', function () {
      let batch = new Batch();
      batch = batch.add(new Transaction(['container', 'type'], 'MESOS', SET));

      expect(batch.reduce(
        Container.JSONReducer.bind({}),
        {type: 'DOCKER', foo: 'bar'}
      )).toEqual({type: 'MESOS', foo: 'bar'});
    });

    it('sets privileged correctly', function () {
      let batch = new Batch();
      batch = batch.add(
        new Transaction(['container', 'docker', 'privileged'], true, SET)
      );

      expect(batch.reduce(
        Container.JSONReducer.bind({}),
        {type: 'MESOS'}
      )).toEqual({type: 'MESOS', docker: {privileged: true}});
    });

    it('sets privileged correctly to false', function () {
      let batch = new Batch();
      batch = batch.add(
        new Transaction(['container', 'docker', 'privileged'], false, SET)
      );

      expect(batch.reduce(
        Container.JSONReducer.bind({}),
        {type: 'MESOS', docker: {privileged: true}}
      )).toEqual({type: 'MESOS', docker: {privileged: false}});
    });

    it('doesn\'t set privileged if path doesn\'t match type', function () {
      let batch = new Batch();
      batch = batch.add(
        new Transaction(['container', 'foo', 'privileged'], true, SET)
      );

      expect(batch.reduce(
        Container.JSONReducer.bind({}),
        {type: 'MESOS', docker: {}}
      )).toEqual({type: 'MESOS', docker: {}});
    });

    it('sets forcePullImage correctly', function () {
      let batch = new Batch();
      batch = batch.add(
        new Transaction(['container', 'docker', 'forcePullImage'], true, SET)
      );

      expect(batch.reduce(
        Container.JSONReducer.bind({}),
        {type: 'MESOS'}
      )).toEqual({type: 'MESOS', docker: {forcePullImage: true}});
    });

    it('sets forcePullImage correctly to false', function () {
      let batch = new Batch();
      batch = batch.add(
        new Transaction(['container', 'docker', 'forcePullImage'], false, SET)
      );

      expect(batch.reduce(
        Container.JSONReducer.bind({}),
        {type: 'MESOS', docker: {forcePullImage: true}}
      )).toEqual({type: 'MESOS', docker: {forcePullImage: false}});
    });

    it('doesn\'t set forcePullImage if path doesn\'t match type', function () {
      let batch = new Batch();
      batch = batch.add(
        new Transaction(['container', 'foo', 'forcePullImage'], true, SET)
      );

      expect(batch.reduce(
        Container.JSONReducer.bind({}),
        {type: 'MESOS', docker: {}}
      )).toEqual({type: 'MESOS', docker: {}});
    });

    it('sets image correctly', function () {
      let batch = new Batch();
      batch = batch.add(
        new Transaction(['container', 'docker', 'image'], 'foo', SET)
      );

      expect(batch.reduce(
        Container.JSONReducer.bind({}),
        {type: 'MESOS'}
      )).toEqual({type: 'MESOS', docker: {image: 'foo'}});
    });

    it('changes image value correctly', function () {
      let batch = new Batch();
      batch = batch.add(
        new Transaction(['container', 'docker', 'image'], 'bar', SET)
      );

      expect(batch.reduce(
        Container.JSONReducer.bind({}),
        {type: 'MESOS', docker: {image: 'foo'}}
      )).toEqual({type: 'MESOS', docker: {image: 'bar'}});
    });

    it('doesn\'t set image if path doesn\'t match type', function () {
      let batch = new Batch();
      batch = batch.add(
        new Transaction(['container', 'foo', 'image'], 'foo', SET)
      );

      expect(batch.reduce(
        Container.JSONReducer.bind({}),
        {type: 'MESOS', docker: {}}
      )).toEqual({type: 'MESOS', docker: {}});
    });

  });

  // FormReducer is the same as JSONReducer
});
