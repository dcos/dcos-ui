jest.dontMock('../middleware/ActionsPubSub');

import {APPLICATION} from '../../constants/PluginConstants';
import * as SDK from 'PluginSDK';

describe('#ActionsPubSub', function () {
  beforeEach(function () {
    this.mockFn = jest.genMockFunction();
    this.mockFn1 = jest.genMockFunction();
    this.unsubscribe = SDK.onDispatch(this.mockFn);
    this.unsubscribe1 = SDK.onDispatch(this.mockFn1);
  });

  it('should receive actions after subscribing', function () {
    SDK.dispatch({type: 'foo'});
    expect(this.mockFn.mock.calls.length).toEqual(1);
    expect(this.mockFn1.mock.calls.length).toEqual(1);
    expect(this.mockFn.mock.calls[0][0]).toEqual({type: 'foo', __origin: APPLICATION});
  });

  it('should stop receiving actions after unsubscribing', function () {
    this.unsubscribe();
    SDK.dispatch({type: 'foo'});
    expect(this.mockFn.mock.calls.length).toEqual(0);
    expect(this.mockFn1.mock.calls.length).toEqual(1);
  });
});
