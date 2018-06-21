import * as PropTypes from "prop-types";
import * as React from "react";
import { routerShape, LocationDescriptor } from "react-router";
import JobsOverview from "#PLUGINS/jobs/src/js/JobsOverview";

interface JobsOverviewRouteProviderProps {
  params: { id: string };
  location: LocationDescriptor;
  children: React.ReactElement<any>;
}

export default class JobsOverviewRouteProvider extends React.Component<
  JobsOverviewRouteProviderProps
> {
  static contextTypes = {
    router: routerShape,
    location: PropTypes.object.isRequired
  };

  constructor() {
    super();
    this.setFilter = this.setFilter.bind(this);
  }

  setFilter(filterValue: string | null) {
    const {
      location: { pathname }
    } = this.props;
    let query = filterValue ? { searchString: filterValue } : null;

    this.context.router.push({
      pathname,
      query
    });
  }

  render() {
    return (
      <JobsOverview
        namespace={this.props.params.id ? this.props.params.id.split(".") : []}
        initialFilter={this.props.location.query.searchString || ""}
        setFilter={this.setFilter}
      />
    );
  }
}
