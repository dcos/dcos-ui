import * as React from "react";
import { Typeahead, TextInput } from "@dcos/ui-kit";

import FieldLabel from "#SRC/js/components/form/FieldLabel";
import getACLServiceAccountsStore from "../stores/ACLServiceAccountsStore";
import * as Events from "../constants/EventTypes";

const ACLServiceAccountsStore = getACLServiceAccountsStore();

const renderOption = (uid: string) => ({ value: uid, label: uid });

type Props = {
  fieldProps: {
    onChange: (value: string) => void;
    name: string;
    formData: string;
  };
  label: React.ReactNode;
};

type State = { serviceAccounts: string[] };

export default class ServiceAccountSelect extends React.Component<
  Props,
  State
> {
  constructor(props: Props) {
    super(props);

    this.state = { serviceAccounts: [] };
  }

  public UNSAFE_componentWillMount() {
    ACLServiceAccountsStore.addListener(
      Events.ACL_SERVICE_ACCOUNTS_CHANGE,
      this.onFetchedServiceAccounts
    );
    ACLServiceAccountsStore.fetchAll();
  }

  public componentWillUnmount() {
    ACLServiceAccountsStore.removeListener(
      Events.ACL_SERVICE_ACCOUNTS_CHANGE,
      this.onFetchedServiceAccounts
    );
  }

  public onFetchedServiceAccounts = () => {
    this.setState({
      serviceAccounts: (ACLServiceAccountsStore.getServiceAccounts().getItems() as Array<{
        uid: string;
      }>)
        .filter(({ uid }) => !/^dcos_/.test(uid))
        .map(({ uid }) => uid)
    });
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

  public renderServiceAccounts() {
    const { serviceAccounts } = this.state;
    const { name, formData } = this.props.fieldProps;
    const overlay = document.querySelector(".modal-full-screen") as HTMLElement;
    return (
      overlay && (
        <React.Fragment>
          <div className="field-input-text-narrow">
            <Typeahead
              items={serviceAccounts.map(renderOption)}
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
  }

  public render() {
    return (
      <div onChange={this.handleChange}>{this.renderServiceAccounts()}</div>
    );
  }
}
