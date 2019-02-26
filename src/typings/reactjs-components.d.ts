declare module "reactjs-components" {
  import { Component, ReactElement } from "react";

  interface ModalProps {
    backdropClass: string;
    modalWrapperClass: string;
    open: boolean;
    scrollContainerClass: string;
    showHeader: boolean;
    footer: ReactElement<any>;
    header: ReactElement<any>;
    showFooter: boolean;
    useGemini: boolean;
  }

  interface MenuItem {
    className?: string;
    html?: JSX.Element;
    id: string | number;
    onClick?: () => void;
    selectable?: boolean;
    selectedHtml?: string | object;
  }

  interface DropdownProps {
    anchorRight?: boolean;
    persistentID?: string | number;
    items: MenuItem[];
    initialID?: string | number;
    matchButtonWidth?: boolean;
    onItemSelection?: (...args: any[]) => any;
    scrollContainer?: object | string;
    scrollContainerParentSelector?: string;
    transition?: boolean;
    transitionName?: string;
    transitionEnterTimeout?: number;
    transitionLeaveTimeout?: number;
    trigger?: JSX.Element;
    useGemini?: boolean;
    disabled?: boolean;
    buttonClassName?: string;
    dropdownMenuClassName?: string;
    dropdownMenuListClassName?: string;
    dropdownMenuListItemClassName?: string;
    wrapperClassName?: string;
  }

  // tslint:disable-next-line:max-classes-per-file
  export class Modal extends Component<ModalProps, {}> {}
  // tslint:disable-next-line:max-classes-per-file
  export class Dropdown extends Component<DropdownProps, {}> {}

  interface TooltipProps {
    anchor?: string;
    children: React.ReactNode;
    className?: string;
    content: React.ReactNode;
    elementTag?: string;
    interactive?: boolean;
    maxWidth?: number | string;
    position?: string;
    stayOpen?: boolean;
    suppress?: boolean;
    width?: number;
    wrapperClassName?: string;
    wrapText?: boolean;
    contentClassName?: string;
  }

  // tslint:disable-next-line:max-classes-per-file
  export class Tooltip extends Component<TooltipProps, {}> {}
}
