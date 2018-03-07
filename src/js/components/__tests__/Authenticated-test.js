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

let thisContainer,
  thisOriginalWillTransitionTo,
  thisOriginalIsLoggedIn,
  thisCallback,
  thisInstance;

describe("Authenticated", function() {
  beforeEach(function() {
    thisContainer = global.document.createElement("div");
    thisOriginalWillTransitionTo = Authenticated.willTransitionTo;
    thisOriginalIsLoggedIn = AuthStore.isLoggedIn;
    thisCallback = jasmine.createSpy();
    AuthStore.isLoggedIn = function() {
      return false;
    };

    thisInstance = new Authenticated(FakeComponent);
  });

  afterEach(function() {
    Authenticated.willTransitionTo = thisOriginalWillTransitionTo;
    AuthStore.removeAllListeners();
    AuthStore.isLoggedIn = thisOriginalIsLoggedIn;

    ReactDOM.unmountComponentAtNode(thisContainer);
  });

  it("redirects to /login if user is not logged in", function() {
    thisCallback = jasmine.createSpy();
    Hooks.addAction("redirectToLogin", function(nextState, replace) {
      replace("/login");
    });
    thisInstance.willTransitionTo(null, thisCallback);
    expect(thisCallback).toHaveBeenCalledWith("/login");
  });

  it("doesn't call redirect when user is not logged in", function() {
    AuthStore.isLoggedIn = function() {
      return true;
    };
    thisCallback = jasmine.createSpy();
    thisInstance.willTransitionTo(null, thisCallback);
    expect(thisCallback).not.toHaveBeenCalled();
  });

  it.skip("renders component when user is logged in", function() {
    var renderedComponent = ReactDOM.render(<thisInstance />, thisContainer);
    var component = TestUtils.findRenderedDOMComponentWithTag(
      renderedComponent,
      "div"
    );
    expect(ReactDOM.findDOMNode(component).textContent).toBe("fakeComponent");
  });
});
