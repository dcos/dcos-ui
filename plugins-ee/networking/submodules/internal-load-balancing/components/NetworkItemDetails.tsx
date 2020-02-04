import * as React from "react";

import HashMapDisplay from "#SRC/js/components/HashMapDisplay";

export default class NetworkItemDetails extends React.Component {
  render() {
    const details = this.props.details.map((detail, index) => (
      <HashMapDisplay headline={detail.name} hash={detail.labels} key={index} />
    ));

    return <div>{details}</div>;
  }
}
