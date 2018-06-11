import { Component } from "react";

interface ToggleButtonProps {
  checked: boolean;
  children: any;
  onChange: () => void;
  checkboxClassName: string[] | object | string;
  className: string[] | object | string;
}

export default class ToggleButton extends Component<ToggleButtonProps, {}> {}
