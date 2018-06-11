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
}
