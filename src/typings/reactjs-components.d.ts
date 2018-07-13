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

  export class Modal extends Component<ModalProps, {}> {}
  export class Dropdown extends Component<DropdownProps, {}> {}
}
