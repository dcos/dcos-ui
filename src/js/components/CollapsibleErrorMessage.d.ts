import { ReactNode, Component } from "react";

interface CollapsibleErrorMessageProps {
  className?: string;
  details?: string[];
  expanded?: boolean;
  message?: ReactNode;
  onToggle?: (state: boolean) => void;
}

interface CollapsibleErrorMessageState {
  expanded: boolean;
}

export default class CollapsibleErrorMessage extends Component<
  CollapsibleErrorMessageProps,
  CollapsibleErrorMessageState
> {
  toggleExpanded(): void;
  getShowDetailsLink(): ReactNode;
  getDetailsListItems(): ReactNode[];
  getFixedMessagePart(): ReactNode;
  getCollapsibleMessagePart(): ReactNode;
}
