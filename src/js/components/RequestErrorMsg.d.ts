import { Component, ReactElement, ReactNode } from "react";

interface ErrorRequestMsgProps {
  columnClasses?: Array<string> | Object | string;
  header?: ReactNode;
  message?: ReactNode;
}
export default class ErrorRequestMsg extends Component<ErrorRequestMsgProps> {}
