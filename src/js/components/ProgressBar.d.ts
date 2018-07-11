import { Component, ReactElement } from "react";

interface ProgressBarProps {
  className?: Array<string> | Object | string;
  total: number;
  data: Array<{
    className?: Array<string> | Object | string;
    value: number;
  }>;
}
export default class ProgressBar extends Component<ProgressBarProps> {}
