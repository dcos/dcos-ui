import { Link } from "react-router";
import React from "react";

import Breadcrumb from "../../components/Breadcrumb";
import BreadcrumbTextContent from "../../components/BreadcrumbTextContent";
import Page from "../../components/Page";
import UnitsHealthNodeDetail from "../../components/UnitsHealthNodeDetail";
import UnitHealthStore from "../../stores/UnitHealthStore";

const UnitHealthNodeDetailBreadcrumbs = ({ node, unit }) => {
  const crumbs = [
    <Breadcrumb key={0} title="Components">
      <BreadcrumbTextContent>
        <Link to="/components">Components</Link>
      </BreadcrumbTextContent>
    </Breadcrumb>
  ];

  if (unit != null) {
    const unitTitle = unit.getTitle();

    crumbs.push(
      <Breadcrumb key={1} title={unitTitle}>
        <BreadcrumbTextContent>
          <Link to={`/components/${unit.get("id")}`}>{unitTitle}</Link>
        </BreadcrumbTextContent>
      </Breadcrumb>
    );
  }

  if (node != null && unit != null) {
    const nodeIP = node.get("host_ip");
    const healthStatus = node.getHealth();

    crumbs.push(
      <Breadcrumb key={2} title={nodeIP}>
        <BreadcrumbTextContent>
          <Link to={`/components/${unit.get("id")}/${nodeIP}`}>
            {`${nodeIP} `}
            <span className={healthStatus.classNames}>
              ({healthStatus.title})
            </span>
          </Link>
        </BreadcrumbTextContent>
      </Breadcrumb>
    );
  }

  return <Page.Header.Breadcrumbs iconID="components" breadcrumbs={crumbs} />;
};

class ComponentsUnitHealthDetailPage extends React.Component {
  render() {
    const { unitID, unitNodeID } = this.props.params;

    const node = UnitHealthStore.getNode(unitNodeID);
    const unit = UnitHealthStore.getUnit(unitID);

    return (
      <Page>
        <Page.Header
          breadcrumbs={
            <UnitHealthNodeDetailBreadcrumbs node={node} unit={unit} />
          }
        />
        <UnitsHealthNodeDetail params={this.props.params} />
      </Page>
    );
  }
}

module.exports = ComponentsUnitHealthDetailPage;
