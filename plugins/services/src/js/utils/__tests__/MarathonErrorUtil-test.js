jest.dontMock('../MarathonErrorUtil');

const MarathonErrorUtil = require('../MarathonErrorUtil');

describe('MarathonErrorUtil', function () {

  describe('#parseErrors', function () {

    it('should properly process string-only errors', function () {
      const marathonError = 'Some error';

      expect(MarathonErrorUtil.parseErrors(marathonError)).toEqual([
        {
          path: [],
          message: 'Some error',
          type: 'MARATHON_ERROR',
          variables: {}
        }
      ]);
    });

    it('should properly handle object errors with message-only', function () {
      const marathonError = {
        message: 'Some error'
      };

      expect(MarathonErrorUtil.parseErrors(marathonError)).toEqual([
        {
          path: [],
          message: 'Some error',
          type: 'MARATHON_ERROR',
          variables: {}
        }
      ]);
    });

    it('should properly handle object errors with string details', function () {
      const marathonError = {
        message: 'Some error',
        details: 'Some error details'
      };

      expect(MarathonErrorUtil.parseErrors(marathonError)).toEqual([
        {
          path: [],
          message: 'Some error details',
          type: 'MARATHON_ERROR',
          variables: {}
        }
      ]);
    });

    it('should properly handle object errors with array details', function () {
      const marathonError = {
        message: 'Some error',
        details: [
          {
            errors: ['First Error', 'Second Error'],
            path: '/'
          }
        ]
      };

      expect(MarathonErrorUtil.parseErrors(marathonError)).toEqual([
        {
          path: [],
          message: 'First Error',
          type: 'MARATHON_ERROR',
          variables: {}
        },
        {
          path: [],
          message: 'Second Error',
          type: 'MARATHON_ERROR',
          variables: {}
        }
      ]);
    });

    it('should properly translate marathon paths without index', function () {
      const marathonError = {
        message: 'Some error',
        details: [
          {
            errors: ['First Error'],
            path: '/some/property'
          }
        ]
      };

      expect(MarathonErrorUtil.parseErrors(marathonError)).toEqual([
        {
          path: ['some', 'property'],
          message: 'First Error',
          type: 'MARATHON_ERROR',
          variables: {}
        }
      ]);
    });

    it('should properly translate marathon paths with index', function () {
      const marathonError = {
        message: 'Some error',
        details: [
          {
            errors: ['First Error'],
            path: '/some/indexed(3)/property'
          }
        ]
      };

      expect(MarathonErrorUtil.parseErrors(marathonError)).toEqual([
        {
          path: ['some', 'indexed', 3, 'property'],
          message: 'First Error',
          type: 'MARATHON_ERROR',
          variables: {}
        }
      ]);
    });
  });

});
