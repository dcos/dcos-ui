import * as React from "react";
import { Typeahead, TextInput } from "@dcos/ui-kit";

import FieldLabel from "#SRC/js/components/form/FieldLabel";
import getSecretStore from "../stores/SecretStore";
const SecretStore = getSecretStore();
import * as Events from "../constants/EventTypes";

const renderOption = ({ path }: { path: string }) => ({
  value: path,
  label: path
});

type Props = {
  fieldProps: {
    onChange: (value: string) => void;
    name: string;
    formData: string;
  };
  label: React.ReactNode;
};

type State = { secrets: Array<{ path: string }> };

class SecretsSelect extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { secrets: [] };
  }

  public componentDidMount() {
    SecretStore.addListener(
      Events.SECRET_STORE_SECRETS_SUCCESS,
      this.onFetchedSecrets
    );
    SecretStore.fetchSecrets();
  }

  public componentWillUnmount() {
    SecretStore.removeListener(
      Events.SECRET_STORE_SECRETS_SUCCESS,
      this.onFetchedSecrets
    );
  }

  public onFetchedSecrets = () => {
    this.setState({ secrets: SecretStore.getSecrets().getItems() });
  };

  public handleChange = (e: React.FormEvent<HTMLInputElement>) => {
    const { onChange, name } = this.props.fieldProps;
    if (e.currentTarget.name === name) {
      onChange(e.currentTarget.value);
    }
  };

  public handleSelect = (selected: string[]) => {
    const { onChange } = this.props.fieldProps;
    if (selected.length) {
      onChange(selected[0]);
    }
  };

  public renderSecrets = () => {
    const { secrets } = this.state;
    const { name, formData } = this.props.fieldProps;
    const overlay = document.querySelector(".modal-full-screen") as HTMLElement;
    return (
      overlay && (
        <React.Fragment>
          <div className="field-input-text-narrow">
            <Typeahead
              items={secrets.map(renderOption)}
              onSelect={this.handleSelect}
              overlayRoot={overlay}
              textField={
                <TextInput
                  name={name}
                  value={formData}
                  autoComplete="off"
                  inputLabel={<FieldLabel>{this.props.label}</FieldLabel>}
                  onChange={this.handleChange}
                />
              }
            />
          </div>
        </React.Fragment>
      )
    );
  };
  public render() {
    return <div>{this.renderSecrets()}</div>;
  }
}

export default SecretsSelect;
