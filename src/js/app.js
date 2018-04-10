import React from "react";
import { Router, hashHistory } from "react-router";
import { Provider } from "react-redux";
import { IntlProvider } from "react-intl";
import { hot } from "react-hot-loader";
import PluginSDK from "PluginSDK";
import appRoutes from "./routes/index";
import NavigationServiceUtil from "./utils/NavigationServiceUtil";
import RouterUtil from "./utils/RouterUtil";

// Translations
import enUS from "./translations/en-US.json";

const routes = RouterUtil.buildRoutes(appRoutes.getRoutes());
NavigationServiceUtil.registerRoutesInNavigation(routes[0].childRoutes);
PluginSDK.Hooks.doAction("routes", routes);

const navigatorLanguage = "en-US";

class App extends React.Component {
  render() {
    const { store } = this.props;

    return (
      <Provider store={store}>
        <IntlProvider locale={navigatorLanguage} messages={enUS}>
          <Router history={hashHistory}>
            {routes}
          </Router>
        </IntlProvider>
      </Provider>
    );
  }
}

export default hot(module)(App);
