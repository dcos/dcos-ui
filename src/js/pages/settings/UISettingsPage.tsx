import * as React from "react";
import { Trans, t } from "@lingui/macro";
import { i18nMark, withI18n } from "@lingui/react";
import { Link } from "react-router";
import { MountService } from "foundation-ui";

import { ProductIcons } from "@dcos/ui-kit/dist/packages/icons/dist/product-icons-enum";

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
import Config from "#SRC/js/config/Config";
import FormModal from "#SRC/js/components/FormModal";
import UserSettingsStore from "#SRC/js/stores/UserSettingsStore";

const Loading = () => <Loader size="small" type="ballBeat" />;

const UISettingsBreadcrumbs = ({ i18n }) => {
  const crumbs = [
    <Breadcrumb key={-1} title={i18n._(t`UI Settings`)}>
      <BreadcrumbTextContent>
        <Trans render={<Link to="/settings/ui-settings" />}>UI Settings</Trans>
      </BreadcrumbTextContent>
    </Breadcrumb>,
  ];

  return (
    <Page.Header.Breadcrumbs iconID={ProductIcons.Gear} breadcrumbs={crumbs} />
  );
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
  state = { configRefreshRateOpen: false };
  constructor(props) {
    super(props);
    this.toggleRefreshModal = this.toggleRefreshModal.bind(this);
    this.saveRefreshRate = this.saveRefreshRate.bind(this);
  }
  openModal() {
    LanguageModalActions.open();
  }
  toggleRefreshModal() {
    this.setState({ configRefreshRateOpen: !this.state.configRefreshRateOpen });
  }
  saveRefreshRate(config) {
    UserSettingsStore.setRefreshRateSetting(parseInt(config.refreshRate, 10));
    location.reload();
  }

  render() {
    const { i18n } = this.props;
    return (
      <Page>
        <Page.Header breadcrumbs={<UISettingsBreadcrumbs i18n={i18n} />} />
        <div className="container">
          <ConfigurationMap>
            <ConfigurationMapHeading className="flush-top">
              <Trans>DC/OS UI Details</Trans>
            </ConfigurationMapHeading>
            <MountService.Mount type="UISettings:UIDetails:Content" />
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
            <ConfigurationMapSection>
              <ConfigurationRow
                keyValue="refreshRate"
                title={<Trans>Refresh Rate</Trans>}
                value={i18n._(t`${Config.getRefreshRate() / 1000} seconds`)}
                action={
                  <button
                    className="button button-primary-link"
                    onClick={this.toggleRefreshModal}
                  >
                    <Trans>Edit</Trans>
                  </button>
                }
              />
            </ConfigurationMapSection>
          </ConfigurationMap>
        </div>
        <FormModal
          buttonDefinition={[
            {
              text: i18n._(t`Cancel`),
              className: "button button-primary-link flush-left",
              isClose: true,
            },
            {
              text: i18n._(t`Save`),
              className: "button button-primary",
              isSubmit: true,
            },
          ]}
          definition={[
            {
              fieldType: "select",
              label: i18n._(t`Select your Refresh Rate`),
              showLabel: true,
              options: [2, 5, 10, 15, 30, 60].map((refreshRate) => ({
                html: i18n._(t`${refreshRate} seconds`),
                id: `${refreshRate}seconds`,
              })),
              value: `${Config.getRefreshRate() / 1000}seconds`,
              name: "refreshRate",
              formElementClass: "languageDropdown-wrapper",
            },
          ]}
          modalProps={{
            header: i18n._(t`Configure Refresh Rate`),
            showHeader: true,
          }}
          onClose={this.toggleRefreshModal}
          onSubmit={this.saveRefreshRate}
          open={this.state.configRefreshRateOpen}
        />
      </Page>
    );
  }
}

UISettingsPage.routeConfig = {
  label: i18nMark("UI Settings"),
  matches: /^\/settings\/ui-settings/,
};

export default withI18n()(UISettingsPage);
