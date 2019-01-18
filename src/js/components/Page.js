import classNames from "classnames/dedupe";
import PropTypes from "prop-types";
import React from "react";
import { StoreMixin } from "mesosphere-shared-reactjs";

import { MountService } from "foundation-ui";
import BasePageHeader from "../components/PageHeader";
import FluidGeminiScrollbar from "./FluidGeminiScrollbar";
import InternalStorageMixin from "../mixins/InternalStorageMixin";
import ScrollbarUtil from "../utils/ScrollbarUtil";
import TemplateUtil from "../utils/TemplateUtil";

const PageHeader = ({
  actions,
  addButton,
  breadcrumbs,
  supplementalContent,
  tabs,
  disabledActions
}) => {
  return (
    <BasePageHeader
      actions={actions}
      addButton={addButton}
      breadcrumbs={breadcrumbs}
      supplementalContent={supplementalContent}
      tabs={tabs}
      disabledActions={disabledActions}
    />
  );
};

TemplateUtil.defineChildren(PageHeader, {
  Breadcrumbs: BasePageHeader.Breadcrumbs,
  Actions: BasePageHeader.Actions,
  Tabs: BasePageHeader.Actions
});

PageHeader.defaultProps = {
  actions: [],
  tabs: [],
  disabledActions: false
};

PageHeader.propTypes = {
  actions: PropTypes.array,
  addButton: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.object),
    PropTypes.object
  ]),
  breadcrumbs: PropTypes.node,
  supplementalContent: PropTypes.node,
  tabs: PropTypes.array,
  disabledActions: PropTypes.bool
};

const Page = React.createClass({
  displayName: "Page",

  mixins: [InternalStorageMixin, StoreMixin],

  propTypes: {
    className: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.object,
      PropTypes.string
    ]),
    dontScroll: PropTypes.bool,
    flushBottom: PropTypes.bool,
    navigation: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    title: PropTypes.oneOfType([PropTypes.object, PropTypes.string])
  },

  componentWillMount() {
    this.store_listeners = [
      {
        name: "sidebar",
        events: ["widthChange"]
      }
    ];
  },

  componentDidMount() {
    this.internalStorage_set({
      rendered: true
    });
    this.forceUpdate();
  },

  onSidebarStoreWidthChange() {
    ScrollbarUtil.updateWithRef(this.refs.gemini);
  },

  getChildren() {
    var data = this.internalStorage_get();
    if (data.rendered === true) {
      // Avoid rendering template children twice
      return TemplateUtil.filterTemplateChildren(
        this.constructor,
        this.props.children
      );
    }

    return null;
  },

  getNavigation(navigation) {
    if (!navigation) {
      return null;
    }

    return <div className="page-header-navigation">{navigation}</div>;
  },

  getPageHeader() {
    return TemplateUtil.getChildOfType(
      this.props.children,
      this.constructor.Header
    );
  },

  getContent() {
    const { dontScroll, flushBottom } = this.props;
    const contentClassSet = classNames(
      "page-body-content pod pod-tall flex",
      "flex-direction-top-to-bottom flex-item-grow-1",
      {
        "flex-item-shrink-1": dontScroll,
        "flush-bottom": flushBottom
      }
    );

    const content = <div className={contentClassSet}>{this.getChildren()}</div>;

    if (dontScroll) {
      return content;
    }

    return (
      <FluidGeminiScrollbar
        autoshow={true}
        className="page-body flex flex-direction-top-to-bottom
          flex-direction-left-to-right-screen-large flex-item-grow-1
          flex-item-shrink-1 gm-scrollbar-container-flex"
        ref="gemini"
      >
        {content}
      </FluidGeminiScrollbar>
    );
  },

  render() {
    const { className, navigation, dontScroll, title } = this.props;

    const classSet = classNames(
      "page flex flex-direction-top-to-bottom flex-item-grow-1",
      {
        "flex-item-shrink-1": dontScroll
      },
      className
    );

    return (
      <div className={classSet}>
        <MountService.Mount type="Page:TopBanner" />
        {this.getPageHeader(title, navigation)}
        {this.getContent()}
      </div>
    );
  }
});

TemplateUtil.defineChildren(Page, { Header: PageHeader });

export default Page;
export const Header = PageHeader;
