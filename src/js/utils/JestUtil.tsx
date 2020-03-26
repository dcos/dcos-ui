import PropTypes from "prop-types";
import * as React from "react";
import { routerShape } from "react-router";
import { I18nProvider } from "@lingui/react";

import en from "#LOCALE/en/messages.js";

// Private router stub
const RouterStub = {
  push() {},
  replace() {},
  go() {},
  goBack() {},
  goForward() {},
  setRouteLeaveHook() {},
  createPath() {},
  createHref() {},
  isActive() {},
};

// Default prototype functions when mocking timezone
const defaultGetTimezoneOffset = Date.prototype.getTimezoneOffset;
const defaultToLocaleString = Date.prototype.toLocaleString;
const defaultDateTimeFormat = Intl.DateTimeFormat;

const JestUtil = {
  /**
   * Mock a different timezone by overriding relevant Date primitive
   * prototype functions.
   *
   * This function will mock Date.getTimezoneOffset, Date.toLocaleString and Intl.DateTimeFormat
   *
   * @param {String} timezone - The IANA timezone string (ex. Europe/Athens) or 'UTC'
   */
  mockTimezone(timezone) {
    const date = new Date();
    const timezoneOffset =
      (new Date(date.toLocaleString(undefined, { timeZone: "UTC" })) -
        new Date(date.toLocaleString(undefined, { timeZone: timezone }))) /
      1000 /
      60;

    Date.prototype.getTimezoneOffset = () => timezoneOffset;
    Date.prototype.toLocaleString = function (
      locale = undefined,
      options = {}
    ) {
      options.timeZone = options.timeZone || timezone;

      return defaultToLocaleString.call(this, locale, options);
    };
    Intl.DateTimeFormat = function (locales, options) {
      options.timeZone = options.timeZone || timezone;

      return defaultDateTimeFormat.call(this, locales, options);
    };
  },

  /**
   * Helper to stub router context, based on
   * https://github.com/reactjs/react-router/blob/0.13.x/docs/guides/testing.md
   * @param {React.Component} Component
   * @param {object} [routerStubs]
   * @param {object} [contextTypes]
   * @param {object} [context]
   * @returns {React.Element} wrapped component element
   */
  stubRouterContext(
    Component,
    routerStubs = {},
    contextTypes = {},
    context = {}
  ) {
    // Create wrapper component
    return class WrappedComponent extends React.Component {
      static get childContextTypes() {
        return {
          router: routerShape,
          routeDepth: PropTypes.number,
          ...contextTypes,
        };
      }

      getChildContext() {
        return {
          router: { ...RouterStub, ...routerStubs },
          routeDepth: 0,
          ...context,
        };
      }

      render() {
        return <Component {...this.props} />;
      }
    };
  },

  withI18nProvider(Component, catalogs = { en }) {
    return class WrappedComponent extends React.Component {
      render() {
        return (
          <I18nProvider defaultRender="span" language="en" catalogs={catalogs}>
            <Component {...this.props} />
          </I18nProvider>
        );
      }
    };
  },

  /**
   * Restore the original version of the Date prototype functions, overwritten
   * by the mockTimezone function.
   */
  unmockTimezone() {
    Date.prototype.getTimezoneOffset = defaultGetTimezoneOffset;
    Date.prototype.toLocaleString = defaultToLocaleString;
    Intl.DateTimeFormat = defaultDateTimeFormat;
  },
};

export default JestUtil;
