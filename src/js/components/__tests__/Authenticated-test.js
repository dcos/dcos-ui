jest.dontMock('../Authenticated');
jest.dontMock('../../stores/AuthStore');
jest.dontMock('../../events/AuthActions');

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';

let Authenticated = require('../Authenticated');
let AuthStore = require('../../stores/AuthStore');
import {Hooks} from 'PluginSDK';

class FakeComponent extends React.Component {
  render() {
    return <div>fakeComponent</div>;
  }
}

describe('Authenticated', function () {
  beforeEach(function () {
    this.container = document.createElement('div');
    this.originalWillTransitionTo = Authenticated.willTransitionTo;
    this.originalIsLoggedIn = AuthStore.isLoggedIn;
    this.callback = jasmine.createSpy();
    AuthStore.isLoggedIn = function () {
      return false;
    };

    this.instance = new Authenticated(FakeComponent);
  });

  afterEach(function () {
    Authenticated.willTransitionTo = this.originalWillTransitionTo;
    AuthStore.removeAllListeners();
    AuthStore.isLoggedIn = this.originalIsLoggedIn;

    ReactDOM.unmountComponentAtNode(this.container);
  });

  it('should reditect to /login if user is not logged in', function () {
    this.callback = jasmine.createSpy();
    Hooks.addAction('redirectToLogin', function (transition) {
      transition.redirect('/login');
    });
    this.instance.willTransitionTo({
      redirect: this.callback
    });
    expect(this.callback).toHaveBeenCalledWith('/login');
  });

  it('shouldn\'t call redirect when user is not logged in', function () {
    AuthStore.isLoggedIn = function () {
      return true;
    };
    this.callback = jasmine.createSpy();
    this.instance.willTransitionTo({
      redirect: this.callback
    });
    expect(this.callback).not.toHaveBeenCalled();
  });

  it('should render component when user is logged in', function () {
    var renderedComponent = ReactDOM.render(<this.instance />, this.container);
    var component =
      TestUtils.findRenderedDOMComponentWithTag(renderedComponent, 'div');
    expect(ReactDOM.findDOMNode(component).textContent).toBe('fakeComponent');
  });

});
