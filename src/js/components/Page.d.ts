import { Component, ReactElement } from "react";

interface PageHeaderProps {
  actions?: [];
  addButton?: Array<{}> | {};
  breadcrumbs?: React.ReactNode;
  supplementalContent?: React.ReactNode;
  tabs?: [];
  disabledActions?: boolean;
}

interface PageProps {
  className?: [] | {} | string;
  dontScroll?: boolean;
  flushBottom?: boolean;
  navigation?: {} | string;
  title?: {} | string;
  children: React.ReactNode;
}

/* tslint:disable */
export class Header extends Component<PageHeaderProps> {}
export default class Page extends Component<PageProps> {}
