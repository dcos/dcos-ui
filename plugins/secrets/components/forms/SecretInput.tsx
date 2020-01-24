import * as React from "react";
import PropTypes from "prop-types";
import { withI18n, i18nMark } from "@lingui/react";
import { Typeahead } from "@dcos/ui-kit";

import FieldInput from "#SRC/js/components/form/FieldInput";

interface Props {
  name: string;
  value: string;
  secrets: string[];
  i18n?: { _: (id: string) => string };
}

interface State {
  secretOptions: string[];
}

class SecretInput extends React.PureComponent<Props, State> {
  public static propTypes = {
    name: PropTypes.string.isRequired,
    value: PropTypes.string,
    secrets: PropTypes.arrayOf(PropTypes.string).isRequired
  };

  private readonly inputRef = React.createRef<HTMLInputElement>();

  constructor(props: Props) {
    super(props);

    this.handleSelect = this.handleSelect.bind(this);
    this.filterList = this.filterList.bind(this);

    this.state = {
      secretOptions: props.secrets || []
    };
  }

  public handleSelect(selectedItems: string[]) {
    // If a user selects a value from a list, we need to manually trigger
    // an `onChange` event on the <input />, so the event bubbles up to
    // the parent form, calling `CreateServiceModalForm.handleFormChange`.

    // This technique for manually triggering an onChange taken from here:
    // https://hustle.bizongo.in/simulate-react-on-change-on-controlled-components-baa336920e04

    const valFromPrototype = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value"
    ) as PropertyDescriptor;
    const nativeInputValueSetter: ((v: any) => void) | undefined =
      valFromPrototype.set;
    const event = new Event("input", { bubbles: true });

    if (
      nativeInputValueSetter === undefined ||
      this.inputRef.current === null
    ) {
      return;
    }

    nativeInputValueSetter.call(this.inputRef.current, selectedItems[0]);
    this.inputRef.current.dispatchEvent(event);
  }

  public filterList(e: any) {
    const val = e.target.value;
    const { secrets } = this.props;

    if (!val) {
      this.setState({ secretOptions: secrets });
    } else {
      this.setState({
        secretOptions: secrets.filter(secret =>
          secret.match(new RegExp(val, "i"))
        )
      });
    }
  }

  public render() {
    const { name, value, secrets } = this.props;
    let placeHolderText = "";
    if (secrets.length > 0) {
      placeHolderText = i18nMark("Enter or Select");
      if (this.props.i18n) {
        placeHolderText = this.props.i18n._(placeHolderText);
      }
    }
    return (
      <Typeahead
        items={this.state.secretOptions.map(secret => ({
          label: secret,
          value: secret
        }))}
        textField={
          <FieldInput
            name={name}
            type="text"
            value={value}
            autoComplete="off"
            placeholder={placeHolderText}
            inputRef={this.inputRef}
            onChange={this.filterList}
          />
        }
        onSelect={this.handleSelect}
        overlayRoot={
          (document.querySelector(".modal-full-screen") as HTMLElement) ||
          undefined
        }
      />
    );
  }
}

// @ts-ignore
export default withI18n()(SecretInput);
