import React from "react";
import { Trans, t } from "@lingui/macro";
import { i18nMark, withI18n } from "@lingui/react";
import Languages from "#SRC/js/constants/Languages";
import LanguageModalActions from "#SRC/js/events/LanguageModalActions";
import FormModal from "../FormModal";
import ModalHeading from "../modals/ModalHeading";
import UserLanguageStore from "../../stores/UserLanguageStore";

export class LanguagePreferenceFormModalComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: props.isOpen || false
    };

    this.handleClose = this.handleClose.bind(this);
    this.handleLanguagePrefSubmit = this.handleLanguagePrefSubmit.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const { isOpen } = nextProps;
    if (isOpen !== this.state.isOpen) {
      this.setState({ isOpen });
    }
  }

  handleClose() {
    LanguageModalActions.close();
    this.setState({ isOpen: false });
  }

  handleLanguagePrefSubmit(formData) {
    UserLanguageStore.set(formData.language);

    this.handleClose();
  }

  getLanguagePreferenceDefinition() {
    const languages = Object.keys(Languages).map(lang => {
      return { html: Languages[lang], id: lang };
    });

    return [
      {
        fieldType: "select",
        label: this.props.i18n
          ? this.props.i18n._(t`Select your language`)
          : "Select your language",
        showLabel: true,
        options: languages,
        value: UserLanguageStore.get(),
        name: "language",
        formElementClass: "languageDropdown-wrapper"
      }
    ];
  }

  getButtonDefinition() {
    return [
      {
        text: i18nMark("Cancel"),
        className: "button button-primary-link flush-left",
        isClose: true
      },
      {
        text: i18nMark("Save"),
        className: "button button-primary",
        isSubmit: true
      }
    ];
  }

  getHeader() {
    return (
      <ModalHeading>
        <Trans render="span">Language Preference</Trans>
      </ModalHeading>
    );
  }

  render() {
    return (
      <FormModal
        buttonDefinition={this.getButtonDefinition()}
        definition={this.getLanguagePreferenceDefinition()}
        modalProps={{
          header: this.getHeader(),
          showHeader: true
        }}
        onClose={this.handleClose}
        onSubmit={this.handleLanguagePrefSubmit}
        open={this.state.isOpen}
      />
    );
  }
}

export default withI18n()(LanguagePreferenceFormModalComponent);
