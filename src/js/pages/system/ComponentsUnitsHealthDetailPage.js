import {Link} from 'react-router';
import React from 'react';

import Page from '../../components/Page';
import UnitsHealthNodeDetail from '../../components/UnitsHealthNodeDetail';
import UnitHealthStore from '../../stores/UnitHealthStore';

const UnitHealthNodeDetailBreadcrumbs = ({node, unit}) => {
  const crumbs = [
    <Link to="/components" key={-1}>Components</Link>
  ];

  if (unit != null) {
    const unitTitle = unit.getTitle();

    crumbs.push(
      <Link to={`/components/${unit.get('id')}`} key={-1}>{unitTitle}</Link>
    );
  }

  if (node != null && unit != null) {
    const nodeIP = node.get('host_ip');
    const healthStatus = node.getHealth();

    crumbs.push(
      <Link to={`/components/${unit.get('id')}/${nodeIP}`} key={1}>
        {`${nodeIP} `}
        <span className={healthStatus.classNames}>
          ({healthStatus.title})
        </span>
      </Link>
    );
  }

  return <Page.Header.Breadcrumbs iconID="components" breadcrumbs={crumbs} />;
};

class ComponentsUnitHealthDetailPage extends React.Component {

  render() {
    const {unitID, unitNodeID} = this.props.params;

    const node = UnitHealthStore.getNode(unitNodeID);
    const unit = UnitHealthStore.getUnit(unitID);

    return (
      <Page>
        <Page.Header breadcrumbs={
          <UnitHealthNodeDetailBreadcrumbs node={node} unit={unit} />
        } />
        <UnitsHealthNodeDetail params={this.props.params} />
      </Page>
    );
  }

};

module.exports = ComponentsUnitHealthDetailPage;
