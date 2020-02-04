import { i18nMark } from "@lingui/react";
import { Trans } from "@lingui/macro";
import classNames from "classnames";
import PropTypes from "prop-types";
import * as React from "react";
import { Table, Tooltip } from "reactjs-components";
import { Icon } from "@dcos/ui-kit";
import {
  greyDark,
  iconSizeXs
} from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";

import TableUtil from "#SRC/js/utils/TableUtil";

export default class SecretStoresTable extends React.Component {
  static propTypes = {
    className: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    stores: PropTypes.object
  };
  getColGroup() {
    return (
      <colgroup>
        <col />
        <col />
      </colgroup>
    );
  }

  getClassName() {
    return "";
  }

  getRowAttributes(store) {
    return {
      className: classNames({
        danger: store.getSealed() === true
      })
    };
  }

  getColumns() {
    return [
      {
        className: this.getClassName,
        headerClassName: this.getClassName,
        prop: "description",
        render: this.renderProp,
        sortable: false,
        heading: this.renderHeading
      },
      {
        className: this.getClassName,
        headerClassName: this.getClassName,
        prop: "driver",
        render: this.renderProp,
        sortable: false,
        heading: this.renderHeading
      }
    ];
  }

  renderProp(prop, row) {
    let cellValue = row[prop];

    if (prop === "description") {
      cellValue = <span className="table-cell-emphasized">{cellValue}</span>;
    }

    if (row.getSealed() && prop === "description") {
      return (
        <Tooltip anchor="start" content="This store is sealed.">
          <span className="icon-margin-right">
            <Icon
              color={greyDark}
              size={iconSizeXs}
              shape={SystemIcons.Yield}
            />
          </span>
          {cellValue}
        </Tooltip>
      );
    }

    return cellValue;
  }

  renderHeading(prop) {
    const headingDisplayNames = {
      description: i18nMark("Name"),
      driver: i18nMark("Type")
    };

    return (
      <span>
        <Trans
          render="span"
          className="table-header-title"
          id={headingDisplayNames[prop]}
        />
      </span>
    );
  }

  render() {
    const { className, stores } = this.props;
    const columns = this.getColumns();

    const tableClassSet = classNames(
      "table table-flush table-borderless-outer table-borderless-inner-columns table-hover",
      "flush-bottom",
      className
    );

    return (
      <Table
        buildRowOptions={this.getRowAttributes}
        className={tableClassSet}
        columns={columns}
        colGroup={this.getColGroup()}
        containerSelector=".gm-scroll-view"
        data={stores.getItems()}
        itemHeight={TableUtil.getRowHeight()}
        sortBy={{ prop: "description", order: "asc" }}
      />
    );
  }
}
