import React from "react";
import { mount } from "enzyme";
import Authenticated from "../Authenticated";

const AuthStore = require("../../stores/AuthStore");
const Hooks = require("PluginSDK").Hooks;

const FakeComponent = () => <div>fakeComponent</div>;

let thisOriginalWillTransitionTo,
  thisOriginalIsLoggedIn,
  thisCallback,
  ThisInstance;

describe("Authenticated", () => {
  beforeEach(() => {
    thisOriginalWillTransitionTo = Authenticated.willTransitionTo;
    thisOriginalIsLoggedIn = AuthStore.isLoggedIn;
    thisCallback = jasmine.createSpy();
    AuthStore.isLoggedIn = () => false;

    ThisInstance = new Authenticated(FakeComponent);
  });

  afterEach(() => {
    Authenticated.willTransitionTo = thisOriginalWillTransitionTo;
    AuthStore.removeAllListeners();
    AuthStore.isLoggedIn = thisOriginalIsLoggedIn;
  });

  it("redirects to /login if user is not logged in", () => {
    thisCallback = jasmine.createSpy();
    Hooks.addAction("redirectToLogin", (nextState, replace) => {
      replace("/login");
    });
    ThisInstance.willTransitionTo(null, thisCallback);
    expect(thisCallback).toHaveBeenCalledWith("/login");
  });

  it("doesn't call redirect when user is not logged in", () => {
    AuthStore.isLoggedIn = () => true;
    thisCallback = jasmine.createSpy();
    ThisInstance.willTransitionTo(null, thisCallback);
    expect(thisCallback).not.toHaveBeenCalled();
  });

  it("renders component when user is logged in", () => {
    const renderedComponent = mount(<ThisInstance />);
    expect(renderedComponent.text()).toContain("fakeComponent");
  });
});
