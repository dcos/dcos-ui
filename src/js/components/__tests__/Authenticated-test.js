import React from "react";
import { mount } from "enzyme";
import { Hooks } from "PluginSDK";

import Authenticated from "../Authenticated";
import AuthStore from "../../stores/AuthStore";

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
    AuthStore.isLoggedIn = function() {
      return true;
    };
    const wrapper = mount(<ThisInstance />);

    expect(wrapper.text()).toEqual("fakeComponent");
  });
});
