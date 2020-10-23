import { i18nMark } from "@lingui/react";
import classNames from "classnames";
import { Link } from "react-router";
import { Table } from "reactjs-components";
import PropTypes from "prop-types";
import * as React from "react";

import ResourceTableUtil from "#SRC/js/utils/ResourceTableUtil";
import TableUtil from "#SRC/js/utils/TableUtil";

class AuthProvidersTable extends React.Component {
  static propTypes = {
    data: PropTypes.array,
  };

  getClassName(prop, sortBy, row) {
    return classNames({
      active: prop === sortBy.prop,
      clickable: row == null, // this is a header
    });
  }

  getColumns() {
    return [
      {
        className: this.getClassName,
        headerClassName: this.getClassName,
        heading: ResourceTableUtil.renderHeading({
          description: i18nMark("Name"),
        }),
        prop: "description",
        render: this.renderDescription,
      },
    ];
  }

  getColGroup() {
    return (
      <colgroup>
        <col />
      </colgroup>
    );
  }
  renderDescription = (prop, provider) => {
    const providerType = provider.getProviderType();
    const providerID = provider.getID();

    return (
      <Link
        className="table-cell-link-primary"
        to={`/settings/identity-providers/${providerType}/${providerID}`}
      >
        {provider.getDescription()}
      </Link>
    );
  };

  render() {
    const { data } = this.props;

    const tableClassSet = classNames(
      "table table-flush table-borderless-outer table-borderless-inner-columns table-hover",
      "flush-bottom"
    );

    return (
      <Table
        className={tableClassSet}
        columns={this.getColumns()}
        colGroup={this.getColGroup()}
        containerSelector=".gm-scroll-view"
        data={data}
        itemHeight={TableUtil.getRowHeight()}
        sortBy={{ prop: "description", order: "asc" }}
      />
    );
  }
}

export default AuthProvidersTable;
