import React from "react";
import { Trans, t } from "@lingui/macro";
import { i18nMark, withI18n } from "@lingui/react";
import { Link } from "react-router";

import Breadcrumb from "#SRC/js/components/Breadcrumb";
import BreadcrumbTextContent from "#SRC/js/components/BreadcrumbTextContent";
import ConfigurationMap from "#SRC/js/components/ConfigurationMap";
import ConfigurationMapHeading from "#SRC/js/components/ConfigurationMapHeading";
import ConfigurationMapLabel from "#SRC/js/components/ConfigurationMapLabel";
import ConfigurationMapRow from "#SRC/js/components/ConfigurationMapRow";
import ConfigurationMapSection from "#SRC/js/components/ConfigurationMapSection";
import ConfigurationMapValue from "#SRC/js/components/ConfigurationMapValue";
import Languages from "#SRC/js/constants/Languages";
import Loader from "#SRC/js/components/Loader";
import Page from "#SRC/js/components/Page";
import LanguageModalActions from "#SRC/js/events/LanguageModalActions";
import UserLanguageStore from "#SRC/js/stores/UserLanguageStore";

const Loading = () => <Loader size="small" type="ballBeat" />;

const UISettingsBreadcrumbs = ({ i18n }) => {
  const crumbs = [
    <Breadcrumb key={-1} title={i18n._(t`UI Settings`)}>
      <BreadcrumbTextContent>
        <Trans render={<Link to="/settings/ui-settings" />}>UI Settings</Trans>
      </BreadcrumbTextContent>
    </Breadcrumb>
  ];

  return <Page.Header.Breadcrumbs iconID="settings" breadcrumbs={crumbs} />;
};

const ConfigurationRow = ({ keyValue, title, value, action }) => {
  const loadedValue = value || <Loading />;

  return (
    <ConfigurationMapRow key={keyValue}>
      <ConfigurationMapLabel>{title}</ConfigurationMapLabel>
      <ConfigurationMapValue>{loadedValue}</ConfigurationMapValue>
      {action}
    </ConfigurationMapRow>
  );
};

class UISettingsPage extends React.Component {
  openModal() {
    LanguageModalActions.open();
  }

  render() {
    return (
      <Page>
        <Page.Header
          breadcrumbs={<UISettingsBreadcrumbs i18n={this.props.i18n} />}
        />
        <div className="container">
          <ConfigurationMap>
            <ConfigurationMapHeading className="flush-top">
              <Trans>DC/OS UI Details</Trans>
            </ConfigurationMapHeading>
            <ConfigurationMapSection>
              <ConfigurationRow
                keyValue="installedVersion"
                title={<Trans>Installed Version</Trans>}
                value={window.DCOS_UI_VERSION}
              />
            </ConfigurationMapSection>
            <ConfigurationMapHeading className="flush-top">
              <Trans>User Preferences</Trans>
            </ConfigurationMapHeading>
            <ConfigurationMapSection>
              <ConfigurationRow
                keyValue="language"
                title={<Trans>Language</Trans>}
                value={Languages[UserLanguageStore.get()]}
                action={
                  <button
                    className="button button-primary-link"
                    onClick={this.openModal}
                  >
                    <Trans>Edit</Trans>
                  </button>
                }
              />
            </ConfigurationMapSection>
          </ConfigurationMap>
        </div>
      </Page>
    );
  }
}

UISettingsPage.routeConfig = {
  label: i18nMark("UI Settings"),
  matches: /^\/settings\/ui-settings/
};

export default withI18n()(UISettingsPage);
