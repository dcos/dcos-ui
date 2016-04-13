jest.dontMock('../QueryParamsMixin');

var QueryParamsMixin = require('../QueryParamsMixin');

describe('QueryParamsMixin', function () {

  beforeEach(function () {
    this.instance = QueryParamsMixin;

    this.instance.context = {
      router: {
        getCurrentPathname: function () {
          return '/pathname';
        },
        getCurrentQuery: function () {
          return {
            stringValue: 'string',
            arrayValue: [
              'value1',
              'value2'
            ]
          };
        },
        transitionTo: jasmine.createSpy()
      }
    };
  });

  it('returns the current pathname', function () {
    expect(this.instance.getCurrentPathname()).toEqual('/pathname');
  });

  it('returns an Object built from the query params', function () {
    let queryParamObject = {
      stringValue: 'string',
      arrayValue: [
        'value1',
        'value2'
      ]
    };
    expect(this.instance.getQueryParamObject()).toEqual(queryParamObject);
  });

  it('returns a specific value from the query params object', function () {
    expect(this.instance.getQueryParamObject['stringValue'])
      .toEqual('string');
  });

  it('should transition to the right path with the given query params',
  function () {
    let queryObject = {
      arrayValue: [
        'value1',
        'value2'
      ],
      paramKey: 'paramValue',
      stringValue: 'string'
    };

    this.instance.setQueryParam('paramKey', 'paramValue');

    let transitionTo = this.instance.context.router.transitionTo;

    expect(transitionTo.calls.length).toEqual(1);

    let [pathname, route, queryParams] = transitionTo.calls[0].args;

    expect(pathname).toEqual('/pathname');
    expect(route).toEqual({});
    expect(queryParams).toEqual(queryObject);
  });

  it('decodes an arrayString given in the query params', function () {
    let decodedArrayString = this.instance.decodeQueryParamArray('a:b:c');
    expect(decodedArrayString).toEqual(['a', 'b', 'c']);
  });
});
