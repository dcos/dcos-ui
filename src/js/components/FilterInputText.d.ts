import { Component } from "react";

interface FilterInputTextProps {
  handleFilterChange: (searchString: string) => void;
  inverseStyle?: boolean;
  placeholder?: string;
  searchString?: string;
  sideText?: Node;
  className: Array<string> | object | string;
}

interface FilterInputTextState {
  focus: boolean;
}

export default class FilterInputText extends Component<
  FilterInputTextProps,
  FilterInputTextState
> {}
