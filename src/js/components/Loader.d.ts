import { Component, ReactElement } from "react";

interface LoaderProps {
  suppressHorizontalCenter?: boolean;
  className?: Array<string> | Object | string;
  flip?: string; // horizontal
  innerClassName?: Array<string> | Object | string;
  size?: string; // small | mini
  type?: string; // ballBeat | ballScale | ballSpinFadeLoader | lineSpinFadeLoader
}
export default class Loader extends Component<LoaderProps> {}
