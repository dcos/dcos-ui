const Container = require('../Container');
const Batch = require('../../../../../../../../src/js/structs/Batch');
const Transaction = require('../../../../../../../../src/js/structs/Transaction');
const {SET} =
  require('../../../../../../../../src/js/constants/TransactionTypes');

describe('Container', function () {

  describe('#FormReducer', function () {

    it('should return a null container as default object', function () {
      const batch = new Batch();

      expect(batch.reduce(Container.FormReducer.bind({}), {}))
        .toEqual(null);
    });

    it('switches container name along with type', function () {
      let batch = new Batch();
      batch = batch.add(new Transaction(['container', 'type'], 'DOCKER', SET));
      batch = batch.add(
        new Transaction(['container', 'docker', 'image'], 'foo', SET)
      );

      expect(batch.reduce(Container.FormReducer.bind({}), {}))
        .toEqual({
          docker: {
            image: 'foo'
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
        Container.FormReducer.bind({}),
        {}
      )).toEqual({
        docker: {
          image: 'foo'
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
        Container.FormReducer.bind({}),
        {}
      )).toEqual({
        docker: {
          image: 'foo'
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
        Container.FormReducer.bind({}),
        {}
      )).toEqual({
        docker: {
          image: 'foo',
          privileged: true
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
        Container.FormReducer.bind({}),
        {}
      )).toEqual({
        docker: {
          image: 'foo',
          privileged: false
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
        Container.FormReducer.bind({}),
        {}
      )).toEqual({
        docker: {
          image: 'foo'
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
        Container.FormReducer.bind({}),
        {}
      )).toEqual({
        docker: {
          image: 'foo',
          forcePullImage: true
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
        Container.FormReducer.bind({}),
        {}
      )).toEqual({
        docker: {
          image: 'foo',
          forcePullImage: false
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
        Container.FormReducer.bind({}),
        {}
      )).toEqual(null);
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
        Container.FormReducer.bind({}),
        {}
      )).toEqual({
        docker: {
          image: 'foo'
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
        Container.FormReducer.bind({}),
        {}
      )).toEqual({
        docker: {
          forcePullImage: true,
          image: 'foo'
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
        Container.FormReducer.bind({}),
        {}
      )).toEqual({
        docker: {
          image: 'foo'
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
        Container.FormReducer.bind({}),
        {}
      )).toEqual({
        docker: {
          image: 'bar'
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
        Container.FormReducer.bind({}),
        {}
      )).toEqual(null);
    });

  });

});
