import React from 'react';
import {RouteHandler} from 'react-router';
import Page from '../../components/Page';

class UnitsHealthNodeDetailPage extends React.Component {
  render() {
    return (
      <Page
        title="Nodes">
        <RouteHandler />
      </Page>
    );
  }
}

module.exports = UnitsHealthNodeDetailPage;
