import * as React from "react";

interface FilterBarProps {
  className?: string;
  children: any;
  rightAlignLastNChildren?: number;
  leftChildrenClass?: string;
  rightChildrenClass?: string;
}
export default class FilterBar extends React.Component<FilterBarProps> {}
