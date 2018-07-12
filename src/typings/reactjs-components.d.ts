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

  export class Modal extends Component<ModalProps, {}> {}

  interface TooltipProps {
    anchor?: string;
    children: React.ReactNode;
    className?: string;
    content: React.ReactNode;
    elementTag?: string;
    interactive?: boolean;
    maxWidth?: number |  string;
    position?: string;
    stayOpen?: boolean;
    suppress?: boolean;
    width?: number;
    wrapperClassName?: string;
    wrapText?: boolean;
    contentClassName?: string;
  }

  export class Tooltip extends Component<TooltipProps, {}> {}
}
