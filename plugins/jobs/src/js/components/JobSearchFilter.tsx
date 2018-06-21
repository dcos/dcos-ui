/* eslint-disable no-unused-vars */
import * as React from "react";

// tslint:disable-next-line:no-submodule-imports
import FilterInputText from "#SRC/js/components/FilterInputText";

interface JobSearchFilterProps {
  onChange: (searchString: string) => void;
  value?: string | null;
}

export default class JobSearchFilter extends React.Component<
  JobSearchFilterProps
> {
  render() {
    return (
      <FilterInputText
        className="flush-bottom"
        handleFilterChange={this.props.onChange}
        placeholder="Search"
        searchString={this.props.value || ""}
      />
    );
  }
}
