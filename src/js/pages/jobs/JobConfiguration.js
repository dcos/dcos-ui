import React from 'react';

import ChronosStore from '../../stores/ChronosStore';
import DescriptionList from '../../components/DescriptionList';

class JobRunHistoryTable extends React.Component {
  render() {
    let job = ChronosStore.getJobDetail(this.props.jobID);

    return (
      <DescriptionList
        hash={{
          Command: job.getCommand(),
          Schedule: job.getSchedule().schedule
        }} />
    );
  }
}

module.exports = JobRunHistoryTable;
