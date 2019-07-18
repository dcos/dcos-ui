import { Component } from "react";
import { ClassValue } from "classnames";

interface ActionItem {
  className?: ClassValue;
  label: string;
  onItemSelect: () => void;
}

interface PageHeaderProps {
  actions?: ActionItem[];
  addButton?: ActionItem[] | ActionItem;
  breadcrumbs?: React.ReactNode;
  supplementalContent?: React.ReactNode;
  tabs?: Array<{ label: string; routePath: string }>;
  actionsDisabled?: boolean;
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
