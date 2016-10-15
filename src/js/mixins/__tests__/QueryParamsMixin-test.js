jest.dontMock('../QueryParamsMixin');

const QueryParamsMixin = require('../QueryParamsMixin');

describe('QueryParamsMixin', function () {

  beforeEach(function () {
    this.instance = QueryParamsMixin;

    this.instance.context = {
      router: {
        getCurrentPathname() {
          return '/pathname';
        },
        getCurrentQuery() {
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
    expect(this.instance.getQueryParamObject()['stringValue'])
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

    expect(transitionTo.calls.count()).toEqual(1);

    let [pathname, route, queryParams] = transitionTo.calls.first().args;

    expect(pathname).toEqual('/pathname');
    expect(route).toEqual({});
    expect(queryParams).toEqual(queryObject);
  });

  it('decodes an arrayString given in the query params', function () {
    let decodedArrayString = this.instance.decodeQueryParamArray('a;b;c');
    expect(decodedArrayString).toEqual(['a', 'b', 'c']);
  });

  it('should encode nested arrays in query params', function () {
    let queryObject = {
      arrayValue: [
        'value1',
        'value2'
      ],
      nestedArray: [
        '1;2;3',
        '4;5;6',
        '',
        '7;;8',
        'non-array'
      ],
      stringValue: 'string'
    };

    this.instance.setQueryParam('nestedArray', [
      [1, 2, 3],
      [4, 5, 6],
      [],
      ['7', null, '8'],
      'non-array'
    ]);

    let transitionTo = this.instance.context.router.transitionTo;

    expect(transitionTo.calls.count()).toEqual(1);

    let [pathname, route, queryParams] = transitionTo.calls.first().args;

    expect(pathname).toEqual('/pathname');
    expect(route).toEqual({});
    expect(queryParams).toEqual(queryObject);
  });

  describe('#resetQueryParams', function () {

    it('should reset all params by default', function () {
      this.instance.resetQueryParams();
      expect(this.instance.context.router.transitionTo)
        .toHaveBeenCalledWith('/pathname', {}, {});
    });

    it('should reset only specified params, when present', function () {
      this.instance.resetQueryParams(['arrayValue']);
      expect(this.instance.context.router.transitionTo)
        .toHaveBeenCalledWith('/pathname', {}, {stringValue: 'string'});
    });

    it('should exit cleanly when called without a router', function () {
      expect(this.instance.resetQueryParams.bind({context: {}}))
          .not.toThrow();
    });

  });

});
