import React from 'react';

import DescriptionList from '../../components/DescriptionList';

class JobConfiguration extends React.Component {
  getSchedule(job) {
    let lastSchedule = job.getSchedules()[0];

    if (!!lastSchedule && !!lastSchedule.cron) {
      return lastSchedule.cron;
    }

    return 'No schedule available.';
  }

  render() {
    let {job} = this.props;

    return (
      <DescriptionList
        hash={{
          Command: job.getCommand(),
          Schedule: this.getSchedule(job)
        }} />
    );
  }
}

module.exports = JobConfiguration;
