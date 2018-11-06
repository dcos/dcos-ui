import { i18nMark } from "@lingui/react";
import React from "react";

import Icon from "../components/Icon";

class SettingsPage extends React.Component {
  render() {
    return this.props.children;
  }
}

SettingsPage.routeConfig = {
  label: i18nMark("Settings"),
  icon: <Icon id="settings-inverse" size="small" family="product" />,
  matches: /^\/settings/
};

module.exports = SettingsPage;
