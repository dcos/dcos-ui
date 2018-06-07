import * as React from "react";
import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/empty";

import * as PropTypes from "prop-types";
import { routerShape } from "react-router";

import { componentFromStream } from "data-service"; // graphqlObservable
// import gql from "graphql-tag";

import { JobTree } from "#SRC/js/structs/JobTree";
import * as MetronomeClient from "#SRC/js/events/MetronomeClient";
import * as MetronomeUtil from "#SRC/js/utils/MetronomeUtil";
import { JobsTab } from "./components/JobsTab";

interface IData {
  jobTree: JobTree;
  jobDataReceived: boolean;
  searchString: string;
}

// copied from MetronomeClient -> want to import
interface IJobResponse {
  id: string;
}

const fetchJobs$ = MetronomeClient.fetchJobs();

const pollingInterval: number = 2000;
const pollingInterval$ = Observable.interval(pollingInterval);

const data$: Observable<JobTree> = pollingInterval$
  .exhaustMap((): Observable<IJobResponse[]> => fetchJobs$)
  .map(
    (jobs): JobTree => {
      console.log(MetronomeUtil);
      return new JobTree(MetronomeUtil.parseJobs(jobs));
    }
  );

function filterJobs(item: any, searchString: string) {
  let jobs = item.getItems();

  if (searchString) {
    const filterProperties = Object.assign({}, item.getFilterProperties(), {
      name(item: any) {
        return item.getId();
      }
    });

    jobs = item.filterItemsByText(searchString, filterProperties).getItems();
  }

  return jobs;
}

const JobsList = componentFromStream((prop$: any) => {
  //figure out the right combinator
  return prop$.combineLatest(data$).map((props: any, data: IData) => {
    const id = new Number(decodeURIComponent(props.id));

    const item =
      data.jobTree.findItem(function(item: JobTree) {
        return item instanceof JobTree && item.getId() === id;
      }) || data.jobTree;

    const isLoading = data.jobDataReceived;

    const root = data.jobTree;

    const filteredJobs = filterJobs(item, data.searchString);

    const handleFilterChange = () => {}; // @TODO

    const resetFilter = () => {}; // @TODO

    const hasFilterApplied =
      data.searchString != null && data.searchString.length > 0;

    return (
      <JobsTab
        item={item}
        root={root}
        isLoading={isLoading}
        filteredJobs={filteredJobs}
        searchString={data.searchString}
        handleFilterChange={handleFilterChange}
        resetFilter={resetFilter}
        hasFilterApplied={hasFilterApplied}
      />
    );
  });
});

JobsList.contextTypes = {
  router: routerShape,
  location: PropTypes.object.isRequired
};

export default JobsList;
