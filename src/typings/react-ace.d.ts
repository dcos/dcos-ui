import { Component, ReactElement } from "react";

interface AceProps {
  editorProps: object;
  mode: string;
  onChange: (jsonDefinition: string) => void;
  showGutter: boolean;
  showPrintMargin: boolean;
  theme: string;
  height: string;
  value: string | null;
  width: string;
}

export default class Ace extends Component<AceProps, {}> {}
