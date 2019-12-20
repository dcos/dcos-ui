declare module "reactjs-components" {
  import { Component, ReactElement, ReactNode } from "react";

  interface ModalProps {
    backdropClass?: string;
    modalWrapperClass?: string;
    open?: boolean;
    scrollContainerClass?: string;
    showHeader?: boolean;
    footer?: ReactElement<any>;
    header?: ReactElement<any>;
    showFooter?: boolean;
    useGemini?: boolean;
    onClose: () => void;
    modalClass: string;
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

  export class Tooltip extends Component<TooltipProps, {}> {}

  interface SelectProps {
    className?: string;
    onChange?: (e?: any) => void;
    name?: string;
    placeholder?: string;
    value?: string | number;
  }

  export class Select extends Component<SelectProps, {}> {}

  interface SelectOptionProps {
    value?: string;
    label?: string;
    disabled?: boolean;
  }

  export class SelectOption extends Component<SelectOptionProps, {}> {}

  interface Column {
    heading: (
      prop: string,
      order: number | undefined,
      sortBy: any
    ) => ReactNode;
    prop: string;
    render?: (prop: string, row: any) => ReactNode;
    sortable?: boolean;
  }

  interface TableProps {
    columns: Column[];
    data: any[];
    className: string;
  }

  export class Table extends Component<TableProps, {}> {}
}
