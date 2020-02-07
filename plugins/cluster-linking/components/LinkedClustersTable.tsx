import { i18nMark, withI18n } from "@lingui/react";
import { Trans, t } from "@lingui/macro";
import * as React from "react";
import { Table, Dropdown } from "reactjs-components";
import PropTypes from "prop-types";
import { Icon } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import { iconSizeXs } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";

import TableUtil from "#SRC/js/utils/TableUtil";

class LinkedClustersTable extends React.Component {
  static propTypes = {
    clusters: PropTypes.array
  };
  constructor() {
    super();
  }

  getColGroup() {
    return (
      <colgroup>
        <col />
        <col />
        <col />
      </colgroup>
    );
  }

  getColumns() {
    return [
      {
        className: "cluster-cell",
        prop: "name",
        render: this.renderName,
        sortable: false,
        heading: this.renderHeading
      },
      {
        className: "cluster-cell",
        prop: "url",
        render: this.renderUrl,
        sortable: false,
        heading: this.renderHeading
      },
      {
        className: "cluster-actions-cell",
        prop: "actions",
        render: this.renderServiceActionsDropdown,
        sortable: false,
        heading() {
          return null;
        }
      }
    ];
  }

  renderName(prop, row) {
    return row.getName();
  }

  renderUrl(prop, row) {
    return row.getUrl();
  }

  renderHeading(prop) {
    const headingDisplayNames = {
      name: i18nMark("Name"),
      url: i18nMark("Cluster URL or Public IP")
    };

    return (
      <span>
        <Trans render="span" className="table-header-title">
          {headingDisplayNames[prop]}
        </Trans>
      </span>
    );
  }
  renderServiceActionsDropdown = (prop, row) => {
    const { i18n } = this.props;
    const actions = [];

    actions.push({
      className: "hidden",
      id: "more",
      html: "",
      selectedHtml: (
        <Icon
          shape={SystemIcons.EllipsisVertical}
          size={iconSizeXs}
          color="currentColor"
        />
      )
    });

    actions.push({
      id: "switch",
      html: <Trans render={<a href={row.getLoginUrl()} />}>Switch</Trans>
    });

    return (
      <Dropdown
        anchorRight={true}
        buttonClassName="button button-mini button-link"
        dropdownMenuClassName="dropdown-menu"
        dropdownMenuListClassName="dropdown-menu-list"
        dropdownMenuListItemClassName="clickable"
        wrapperClassName="dropdown flush-bottom table-cell-icon"
        items={actions}
        persistentID={"more"}
        scrollContainer=".gm-scroll-view"
        scrollContainerParentSelector=".gm-prevented"
        title={i18n._(t`More actions`)}
        transition={true}
        transitionName="dropdown-menu"
      />
    );
  };

  render() {
    const { clusters } = this.props;
    const columns = this.getColumns();

    return (
      <Table
        className="table table-borderless-outer table-borderless-inner-columns table-hover flush-bottom linked-clusters-table"
        columns={columns}
        colGroup={this.getColGroup()}
        containerSelector=".gm-scroll-view"
        data={clusters}
        itemHeight={TableUtil.getRowHeight()}
      />
    );
  }
}

export default withI18n()(LinkedClustersTable);
