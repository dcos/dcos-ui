import React from "react";
import { Router, hashHistory } from "react-router";
import { Provider } from "react-redux";
import { IntlProvider } from "react-intl";

// Translations
import enUS from "../translations/en-US.json";

const navigatorLanguage = "en-US";

class App extends React.Component {
  render() {
    const { routes, store } = this.props;

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

export default App;
