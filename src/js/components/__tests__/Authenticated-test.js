jest.dontMock("../Authenticated");
jest.dontMock("../../stores/AuthStore");
jest.dontMock("../../events/AuthActions");

const React = require("react");
const ReactDOM = require("react-dom");
const TestUtils = require("react-addons-test-utils");

const Authenticated = require("../Authenticated");
const AuthStore = require("../../stores/AuthStore");
const Hooks = require("PluginSDK").Hooks;

class FakeComponent extends React.Component {
  render() {
    return <div>fakeComponent</div>;
  }
}

describe("Authenticated", function() {
  beforeEach(function() {
    this.container = global.document.createElement("div");
    this.originalWillTransitionTo = Authenticated.willTransitionTo;
    this.originalIsLoggedIn = AuthStore.isLoggedIn;
    this.callback = jasmine.createSpy();
    AuthStore.isLoggedIn = function() {
      return false;
    };

    this.instance = new Authenticated(FakeComponent);
  });

  afterEach(function() {
    Authenticated.willTransitionTo = this.originalWillTransitionTo;
    AuthStore.removeAllListeners();
    AuthStore.isLoggedIn = this.originalIsLoggedIn;

    ReactDOM.unmountComponentAtNode(this.container);
  });

  it("should redirect to /login if user is not logged in", function() {
    this.callback = jasmine.createSpy();
    Hooks.addAction("redirectToLogin", function(nextState, replace) {
      replace("/login");
    });
    this.instance.willTransitionTo(null, this.callback);
    expect(this.callback).toHaveBeenCalledWith("/login");
  });

  it("shouldn't call redirect when user is not logged in", function() {
    AuthStore.isLoggedIn = function() {
      return true;
    };
    this.callback = jasmine.createSpy();
    this.instance.willTransitionTo(null, this.callback);
    expect(this.callback).not.toHaveBeenCalled();
  });

  it("should render component when user is logged in", function() {
    var renderedComponent = ReactDOM.render(<this.instance />, this.container);
    var component = TestUtils.findRenderedDOMComponentWithTag(
      renderedComponent,
      "div"
    );
    expect(ReactDOM.findDOMNode(component).textContent).toBe("fakeComponent");
  });
});
