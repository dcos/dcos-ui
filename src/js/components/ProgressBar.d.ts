import { Component, ReactElement } from "react";

interface ProgressBarValue {
  value: unknown;
  className?: Array<string> | Object | string;
}

interface ProgressBarProps {
  className?: Array<string> | Object | string;
  total: number;
  data: ProgressBarValue[];
}

export default class ProgressBar extends Component<ProgressBarProps> {
  static getDataFromValue(value: number, className: string): ProgressBarValue[];
}
