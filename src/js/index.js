/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import ReactDOM from "react-dom";
import { I18nProvider } from "@lingui/react";
import { RequestUtil } from "mesosphere-shared-reactjs";
import { Router, hashHistory } from "react-router";
import { Provider } from "react-redux";
import PluginSDK from "PluginSDK";

import en from "#LOCALE/en/messages.js";

// Load in our CSS.
// TODO - DCOS-6452 - remove component @imports from index.less and
// require them in the component.js
import "../styles/index.less";
import "./utils/MomentJSConfig";
import { CONFIG_ERROR, LANGUAGE_MODAL_CLOSE } from "./constants/EventTypes";
import ApplicationUtil from "./utils/ApplicationUtil";
import appRoutes from "./routes/index";
import ConfigStore from "./stores/ConfigStore";
import UserLanguageStore from "./stores/UserLanguageStore";
import LanguageModalStore from "./stores/LanguageModalStore";
import NavigationServiceUtil from "./utils/NavigationServiceUtil";
import RequestErrorMsg from "./components/RequestErrorMsg";
import RouterUtil from "./utils/RouterUtil";

const domElement = global.document.getElementById("application");
const initialLanguage = UserLanguageStore.get();

// TODO: Implement loader that can concat many sprites into a single one
// We opt to load the sprite after the Javscript files are parsed because it
// is quite expensive for the browser to parse a sprite file. This way we
// don't block the JS execution.
setTimeout(function() {
  var ajax = new XMLHttpRequest();
  ajax.open("GET", "sprite.svg", true);
  ajax.send();
  ajax.onload = function() {
    var div = global.document.createElement("div");
    div.innerHTML = ajax.responseText;
    div.style.height = 0;
    div.style.overflow = "hidden";
    div.style.width = 0;
    div.style.visibility = "hidden";
    global.document.body.insertBefore(div, global.document.body.childNodes[0]);
  };
});

// Patch json
const oldJSON = RequestUtil.json;
RequestUtil.json = function(options = {}) {
  // Proxy error function so that we can trigger a plugin event
  const oldHandler = options.error;
  options.error = function() {
    if (typeof oldHandler === "function") {
      oldHandler.apply(null, arguments);
    }
    PluginSDK.Hooks.doAction("AJAXRequestError", ...arguments);
  };

  oldJSON(options);
};

(function() {
  function renderApplication() {
    function renderAppToDOM(content) {
      ReactDOM.render(content, domElement, function() {
        PluginSDK.Hooks.doAction("applicationRendered");
      });
    }

    // Allow overriding of application contents
    const contents = PluginSDK.Hooks.applyFilter("applicationContents", null);
    if (contents) {
      renderAppToDOM(contents);
    } else {
      if (PluginSDK.Hooks.applyFilter("delayApplicationLoad", true)) {
        // Let's make sure we get Mesos Summary data before we render app
        // Mesos may unreachable, so we will render even on request failure
        ApplicationUtil.beginTemporaryPolling(function() {
          ApplicationUtil.invokeAfterPageLoad(renderApplicationToDOM);
        });
      } else {
        renderApplicationToDOM();
      }

      function renderApplicationToDOM() {
        const routes = RouterUtil.buildRoutes(appRoutes.getRoutes());
        NavigationServiceUtil.registerRoutesInNavigation(routes[0].childRoutes);

        renderAppToDOM(
          <Provider store={PluginSDK.Store}>
            <I18nProvider
              defaultRender="span"
              language={UserLanguageStore.get()}
              catalogs={{ en }}
            >
              <Router history={hashHistory} routes={routes} />
            </I18nProvider>
          </Provider>
        );

        PluginSDK.Hooks.doAction("routes", routes);
      }
    }
  }

  function onPluginsLoaded() {
    PluginSDK.Hooks.removeAction("pluginsConfigured", onPluginsLoaded);
    ConfigStore.removeChangeListener(CONFIG_ERROR, onConfigurationError);
    renderApplication();
  }

  function onConfigurationError() {
    // Try to find appropriate DOM element or fallback
    const element = global.document.querySelector("#canvas div") || domElement;
    const columnClasses = {
      "column-small-8": false,
      "column-small-offset-2": false,
      "column-medium-6": false,
      "column-medium-offset-3": false
    };

    ReactDOM.render(
      <RequestErrorMsg
        columnClasses={columnClasses}
        header="Error requesting UI Configuration"
      />,
      element
    );
  }

  function handleLanguageChange() {
    if (initialLanguage !== UserLanguageStore.get()) {
      global.location.reload();
    }
  }

  function startApplication() {
    // Plugins events
    PluginSDK.Hooks.addAction("pluginsConfigured", onPluginsLoaded);
    ConfigStore.addChangeListener(CONFIG_ERROR, onConfigurationError);

    // Language change
    LanguageModalStore.addChangeListener(
      LANGUAGE_MODAL_CLOSE,
      handleLanguageChange
    );

    // Load configuration
    ConfigStore.fetchConfig();
  }

  if (!global.Intl) {
    require.ensure(["intl", "intl/locale-data/jsonp/en.js"], function(require) {
      require("intl");
      require("intl/locale-data/jsonp/en.js");

      startApplication();
    });
  } else {
    startApplication();
  }
})();
