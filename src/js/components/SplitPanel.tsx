import * as React from "react";
import classNames from "classnames";
import { Icon } from "@dcos/ui-kit";
import { SystemIcons } from "@dcos/ui-kit/dist/packages/icons/dist/system-icons-enum";
import { iconSizeXxs } from "@dcos/ui-kit/dist/packages/design-tokens/build/js/designTokens";
import WindowResizeUtil from "#SRC/js/utils/WindowResizeUtil";

type SplitPanelChildren<T> = [T, T];

interface PanelProps {
  children: React.ReactNode;
  className?: string;
  isResizing?: boolean;
}

interface SidePanelProps extends PanelProps {
  initialWidth?: number;
  isActive?: boolean;
  width?: number;
}

export interface SplitPanelState {
  isResizing: boolean;
  sidePanelWidth?: number;
}

export interface SplitPanelProps {
  children: SplitPanelChildren<
    React.ReactElement<PanelProps> | React.ReactElement<SidePanelProps>
  >;
  onResize?: (resizedPanelWidth?: number) => void;
}

export const getSidePanelWidth = (
  containerRect: ClientRect,
  clientPosition: number
) => {
  const totalSize = containerRect.width;
  let offset;

  offset = clientPosition - containerRect.left;

  if (offset < 0) {
    offset = 0;
  } else if (offset > totalSize) {
    offset = totalSize;
  }

  return totalSize - offset;
};

export const getSidePanelProps = (
  panelChildren: SplitPanelChildren<
    React.ReactElement<PanelProps> | React.ReactElement<SidePanelProps>
  >
) => {
  const sidePanelChild = panelChildren.find(
    child => React.isValidElement(child) && child.type === SidePanel
  ) as React.ReactElement<SidePanelProps>;
  return sidePanelChild.props;
};

export const SidePanel = ({
  children,
  className,
  isActive,
  isResizing,
  width
}: SidePanelProps) => {
  const sidePanelClasses = classNames("modal-full-screen-side-panel", {
    "is-visible": isActive
  });
  return (
    <React.Fragment>
      <div
        className={classNames("modal-full-screen-side-panel-placeholder", {
          "is-visible": isActive
        })}
        style={{
          width: isActive ? width : undefined,
          transition: isResizing ? "none" : undefined
        }}
      />
      <div
        className={classNames(
          "splitPanels-panel",
          sidePanelClasses,
          className,
          {
            noUserSelect: isResizing
          }
        )}
        style={{
          width,
          right: isActive ? 0 : width && width * -1
        }}
      >
        {children}
      </div>
    </React.Fragment>
  );
};

export const PrimaryPanel = ({
  children,
  className,
  isResizing
}: PanelProps) => (
  <div
    className={classNames(
      "splitPanels-panel",
      "splitPanels-panel--primary",
      className,
      {
        noUserSelect: isResizing
      }
    )}
  >
    {children}
  </div>
);

function intersperse<A>(list: A[], sep: JSX.Element) {
  return Array.prototype.concat(...list.map(e => [sep, e])).slice(1);
}

export default class SplitPanel extends React.PureComponent<
  SplitPanelProps,
  SplitPanelState
> {
  public containerRef = React.createRef<HTMLDivElement>();

  constructor(props: SplitPanelProps) {
    super(props);

    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleWindowResize = this.handleWindowResize.bind(this);

    this.state = {
      isResizing: false
    };
  }

  public componentDidMount() {
    const { initialWidth } = getSidePanelProps(this.props.children);
    WindowResizeUtil.add(this.handleWindowResize);

    this.setState({ sidePanelWidth: initialWidth });
  }

  public componentWillUnmount() {
    WindowResizeUtil.remove(this.handleWindowResize);
  }

  public render() {
    const { children } = this.props;
    const { isResizing, sidePanelWidth } = this.state;
    const { isActive } = getSidePanelProps(this.props.children);
    const panelChildren = React.Children.toArray(children) as Array<
      React.ReactElement<PanelProps> & React.ReactElement<SidePanelProps>
    >;
    const panelChildrenArr = panelChildren.map(panel => {
      if (React.isValidElement(panel)) {
        if (panel.type === SidePanel) {
          return React.cloneElement(panel, {
            isResizing,
            width: sidePanelWidth,
            key: "sidePanel"
          });
        }
        if (panel.type === PrimaryPanel) {
          return React.cloneElement(panel, {
            isResizing,
            key: "primaryPanel"
          });
        }
      }
      return panel;
    });

    const panelSeparator = (
      <div
        className={classNames("splitPanels-separator", {
          "splitPanels-separator--active": isActive
        })}
        style={{
          transform: `translateX(${isActive ? 0 : sidePanelWidth}px)`,
          right: isActive ? sidePanelWidth : 0,
          transition: isResizing ? "none" : undefined
        }}
        onMouseDown={this.handleMouseDown}
        key="separator"
      >
        <div className="splitPanels-resizeIconWrapper">
          <Icon shape={SystemIcons.ResizeHorizontal} size={iconSizeXxs} />
        </div>
      </div>
    );

    return (
      <div
        className="splitPanels"
        onMouseMove={this.handleMouseMove}
        onMouseUp={this.handleMouseUp}
        ref={this.containerRef}
      >
        {intersperse(panelChildrenArr, panelSeparator)}
      </div>
    );
  }

  private handleMouseDown() {
    this.setState({ isResizing: true });
  }

  private handleMouseUp() {
    if (this.state.isResizing && this.props.onResize) {
      this.props.onResize(this.state.sidePanelWidth);
    }
    this.setState({ isResizing: false });
  }

  private handleMouseMove(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    const containerRefCurrent = this.containerRef.current;
    if (this.state.isResizing && containerRefCurrent) {
      const sidePanelWidth = getSidePanelWidth(
        containerRefCurrent.getBoundingClientRect(),
        e.clientX
      );

      this.setState({ sidePanelWidth });
    }
  }

  private handleWindowResize() {
    const { body } = document;
    const { sidePanelWidth } = this.state;

    if (sidePanelWidth && body.clientWidth < sidePanelWidth) {
      this.setState({ sidePanelWidth: body.clientWidth });
    }
  }
}
