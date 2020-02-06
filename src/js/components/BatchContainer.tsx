import * as React from "react";

import Transaction from "#SRC/js/structs/Transaction";
import * as TransactionTypes from "#SRC/js/constants/TransactionTypes";
import Batch from "../structs/Batch";

type BatchContainerProps = {
  batch: Batch;
  onChange: (batch: Batch, fieldName?: string) => void;
};

export default class BatchContainer extends React.Component<
  BatchContainerProps
> {
  constructor(props: BatchContainerProps) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
    this.handleAddItem = this.handleAddItem.bind(this);
    this.handleRemoveItem = this.handleRemoveItem.bind(this);
  }

  handleChange(event) {
    const fieldName = event.target.getAttribute("name");
    if (!fieldName) {
      return;
    }

    const value =
      event.target.type === "checkbox"
        ? event.target.checked
        : event.target.value;

    const path = fieldName.split(".");
    const batch = this.props.batch.add(new Transaction(path, value));

    this.props.onChange(batch, fieldName);
  }

  handleAddItem(event) {
    const { value, path } = event;

    const batch = this.props.batch.add(
      new Transaction(path.split("."), value, TransactionTypes.ADD_ITEM)
    );

    this.props.onChange(batch);
  }

  handleRemoveItem(event) {
    const { value, path } = event;

    const batch = this.props.batch.add(
      new Transaction(path.split("."), value, TransactionTypes.REMOVE_ITEM)
    );

    this.props.onChange(batch);
  }

  render() {
    const { children } = this.props;

    return (
      <div onChange={this.handleChange}>
        {React.cloneElement(children, {
          onAddItem: this.handleAddItem,
          onRemoveItem: this.handleRemoveItem
        })}
      </div>
    );
  }
}
