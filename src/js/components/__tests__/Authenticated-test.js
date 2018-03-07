import React from "react";
import { mount } from "enzyme";

const Authenticated = require("../Authenticated");
const AuthStore = require("../../stores/AuthStore");
const Hooks = require("PluginSDK").Hooks;

class FakeComponent extends React.Component {
  render() {
    return <div>fakeComponent</div>;
  }
}

let thisOriginalWillTransitionTo,
  thisOriginalIsLoggedIn,
  thisCallback,
  ThisInstance;

describe("Authenticated", function() {
  beforeEach(function() {
    thisOriginalWillTransitionTo = Authenticated.willTransitionTo;
    thisOriginalIsLoggedIn = AuthStore.isLoggedIn;
    thisCallback = jasmine.createSpy();
    AuthStore.isLoggedIn = function() {
      return false;
    };

    ThisInstance = new Authenticated(FakeComponent);
  });

  afterEach(function() {
    Authenticated.willTransitionTo = thisOriginalWillTransitionTo;
    AuthStore.removeAllListeners();
    AuthStore.isLoggedIn = thisOriginalIsLoggedIn;
  });

  it("redirects to /login if user is not logged in", function() {
    thisCallback = jasmine.createSpy();
    Hooks.addAction("redirectToLogin", function(nextState, replace) {
      replace("/login");
    });
    ThisInstance.willTransitionTo(null, thisCallback);
    expect(thisCallback).toHaveBeenCalledWith("/login");
  });

  it("doesn't call redirect when user is not logged in", function() {
    AuthStore.isLoggedIn = function() {
      return true;
    };
    thisCallback = jasmine.createSpy();
    ThisInstance.willTransitionTo(null, thisCallback);
    expect(thisCallback).not.toHaveBeenCalled();
  });

  it("renders component when user is logged in", function() {
    const renderedComponent = mount(<ThisInstance />);
    expect(renderedComponent.text()).toContain("fakeComponent");
  });
});
