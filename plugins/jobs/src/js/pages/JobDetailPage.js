/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */
import { routerShape } from "react-router";
import PropTypes from "prop-types";

import mixin from "reactjs-mixin";

import JobFormModalContainer from "#PLUGINS/jobs/src/js/JobFormModalContainer";

import Page from "#SRC/js/components/Page";
import TabsMixin from "#SRC/js/mixins/TabsMixin";
import Job from "#SRC/js/structs/Job";
import JobConfiguration from "./JobConfiguration";
import { DIALOGS } from "./JobDetailPageContainer";
import JobRunHistoryTable from "./JobRunHistoryTable";

class JobDetailPage extends mixin(TabsMixin) {
  constructor() {
    super(...arguments);

    this.tabs_tabs = {
      runHistory: "Run History",
      configuration: "Configuration"
    };

    this.state = {
      currentTab: Object.keys(this.tabs_tabs).shift()
    };
  }

  getNavigationTabs() {
    return <ul className="menu-tabbed">{this.tabs_getUnroutedTabs()}</ul>;
  }

  getDestroyConfirmDialog() {
    return null;
  }

  renderConfigurationTabView(job) {
    return <JobConfiguration job={job} />;
  }

  renderRunHistoryTabView(job) {
    return <JobRunHistoryTable job={job} />;
  }

  getActions() {
    return [
      {
        label: "Edit",
        onItemSelect: this.props.handleEditButtonClick
      }
    ];
  }

  getTabs() {
    const activeTab = this.state.currentTab;

    return [
      {
        label: "Run History",
        callback: () => {
          this.setState({ currentTab: "runHistory" });
        },
        isActive: activeTab === "runHistory"
      },
      {
        label: "Configuration",
        callback: () => {
          this.setState({ currentTab: "configuration" });
        },
        isActive: activeTab === "configuration"
      }
    ];
  }

  render() {
    if (this.props.params.taskID) {
      return this.props.children;
    }

    const { job } = this.props;

    return (
      <Page>
        <Page.Header
          actions={this.getActions()}
          breadcrumbs={null}
          tabs={this.getTabs()}
        />
        {this.tabs_getTabView(job)}
        <JobFormModalContainer
          isEdit={true}
          job={new Job(JSON.parse(job.json))}
          open={this.props.jobActionDialog === DIALOGS.EDIT}
          onClose={this.props.closeDialog}
        />
        {this.getDestroyConfirmDialog()}
      </Page>
    );
  }
}

JobDetailPage.contextTypes = {
  router: routerShape
};

JobDetailPage.propTypes = {
  children: PropTypes.any,
  closeDialog: PropTypes.func,
  job: PropTypes.shape({
    json: PropTypes.string.isRequired
  }),
  jobActionDialog: PropTypes.any
};

module.exports = JobDetailPage;
