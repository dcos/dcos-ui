import * as React from "react";

interface FilterHeadlineProps {
  className?: string;
  currentLength: number;
  inverseStyle?: boolean;
  // Optional prop used to force the "Clear" button to show even when n of n
  // items are currently displayed.
  isFiltering?: boolean;
  name: string;
  onReset: () => void;
  totalLength: number;
}
export default class FilterHeadline extends React.Component<
  FilterHeadlineProps
> {}
