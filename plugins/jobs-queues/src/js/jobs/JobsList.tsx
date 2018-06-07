import React from "react";
import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/empty";
import { componentFromStream, graphqlObservable } from "data-service";
import gql from "graphql-tag";

import JobTree from "#SRC/js/structs/JobTree";
import * as MetronomeClient from "#SRC/js/events/MetronomeClient";
import JobsTab from "./components/JobsTab";

interface IData {
  jobTree: JobTree;
  jobDataReceived: boolean;
  searchString: string;
}

// copied from MetronomeClient -> want to import
interface IJobResponse {
  id: string;
}

interface IJobCache {
  oldData?: IJobResponse;
  newData?: IJobResponse;
}

const fetchJobs$ = MetronomeClient.fetchJobs();

const pollingInterval: number = 2000;
const pollingInterval$ = Observable.interval(pollingInterval);

// change any to something
function buildJobMap(oldData: any, newData: any) {
  return new Map(
    newData
      .map((newJob: any) => {
        return oldData.jobMap.has(newJob.id)
          ? Object.assign({}, oldData.jobMap.get(newJob.id), newJob)
          : newJob;
      })
      .map((job: any) => [job.id, job])
  );
}

const data$: Observable<Map<any, any>> = pollingInterval$
  .exhaustMap((): Observable<IJobResponse> => fetchJobs$)
  .scan(
    (acc: IJobCache, jobs): IJobCache => {
      return { oldData: acc.newData, newData: jobs };
    },
    { oldData: undefined, newData: undefined }
  )
  .map(({ oldData, newData}: IJobCache) => {
    return buildJobMap(oldData, newData);
  })
  .map(jobMap => setTree)
  .startWith({ tree: null });

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

export default componentFromStream((prop$: any) => {
  //figure out the right combinator
  return prop$.combine(data$).map((props: any, data: IData) => {
    const id = decodeURIComponent(props.id); //done

    const item =
      data.jobTree.findItem(function(item: any) {
        return item instanceof JobTree && item.id === id;
      }) || data.jobTree; //done

    const isLoading = data.jobDataReceived;

    const root = data.jobTree;

    const filteredJobs = filterJobs(item, data.searchString);

    const handleFilterChange = () => {};

    const resetFilter = () => {};

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
