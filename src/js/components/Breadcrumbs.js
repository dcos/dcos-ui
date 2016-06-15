import classNames from 'classnames';
import DeepEqual from 'deep-equal';
import mixin from 'reactjs-mixin';
/* eslint-disable no-unused-vars */
import React, {PropTypes} from 'react';
/* eslint-enable no-unused-vars */
import ReactDOM from 'react-dom';
import {StoreMixin} from 'mesosphere-shared-reactjs';

import BreadcrumbSegmentLink from './BreadcrumbSegmentLink';
import IconChevron from './icons/IconChevron';

const COLLAPSE_BUFFER = 12;
const LAST_ITEM_OFFSET = 150; // Difference between scrollWidth and outerWidth
const PADDED_ICON_WIDTH = 38; // Width of icon + padding

class Breadcrumbs extends mixin(StoreMixin) {
  constructor() {
    super(...arguments);

    this.state = {
      availableWidth: null,
      collapsed: false,
      expandedWidth: null
    };

    this.store_listeners = [
      {name: 'history', events: ['change'], listenAlways: true}
    ];

    this.handleResize = this.handleResize.bind(this);
  }

  componentDidMount() {
    super.componentDidMount(...arguments);

    if (global.window != null) {
      window.addEventListener('resize', this.handleResize);
      window.addEventListener('focus', this.handleResize);
    }
  }

  componentDidUpdate() {
    super.componentDidUpdate(...arguments);

    this.updateDimensions();
  }

  componentWillUnmount() {
    super.componentWillUnmount(...arguments);

    if (global.window != null) {
      window.removeEventListener('resize', this.handleResize);
      window.removeEventListener('focus', this.handleResize);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (nextState.availableWidth == null || nextState.expandedWidth == null) {
      this.updateDimensions();

      return false;
    }
    if (this.state.collapsed !== nextState.collapsed) {
      return true;
    }

    return !DeepEqual(this.props, nextProps);
  }

  handleResize() {
    let availableWidth = this.getAvailableWidth();

    this.setState({
      availableWidth,
      collapsed: this.shouldCollapse(availableWidth, this.state.expandedWidth)
    });
  }

  updateDimensions() {
    let availableWidth = this.getAvailableWidth();
    let expandedWidth = this.getExpandedWidth();

    this.setState({
      availableWidth,
      expandedWidth,
      collapsed: this.shouldCollapse(availableWidth, expandedWidth)
    });
  }

  getAvailableWidth() {
    return ReactDOM.findDOMNode(this).offsetWidth;
  }

  getWidthFromExpandedItem(item) {
    return item.offsetWidth + PADDED_ICON_WIDTH;
  }

  getWidthFromCollapsedItem(item) {
    let link = item.children[0];
    let textWidth = link.scrollWidth - link.offsetWidth;

    return textWidth + PADDED_ICON_WIDTH;
  }

  getExpandedWidth() {
    // array/splat casts NodeList to array
    let listItems = [...ReactDOM.findDOMNode(this).children]
      .filter(function (_, index) {
        // Filter out even nodes containing '>'
        return index % 2;
      });

    return listItems
      .map((item, index) => {
        let isFirstItem = index === 0;
        let isLastItem = index === listItems.length - 1;
        if (isFirstItem || isLastItem) {
          return this.getWidthFromExpandedItem(item);
        }

        return this.getWidthFromCollapsedItem(item);
      })
      .reduce(
        function (totalWidth, itemWidth) { return totalWidth + itemWidth },
        this.getLastItemWidth()
      );
  }

  getLastItemWidth() {
    let lastItem = ReactDOM.findDOMNode(this).lastChild;

    if (!lastItem || !lastItem.firstChild) {
      return LAST_ITEM_OFFSET;
    }

    let lastItemLink = lastItem.firstChild;

    return lastItemLink.scrollWidth + LAST_ITEM_OFFSET;
  }

  getCurrentRouteParams() {
    // Isolated for easier testing
    return this.context.router.getCurrentParams();
  }

  wrapListItem(breadcrumb, key) {
    return (
      <li key={key}>
        {breadcrumb}
      </li>
    );
  }

  getBreadcrumb(breadcrumb, key) {
    if (!React.isValidElement(breadcrumb)) {
      if (typeof breadcrumb === 'string') {
        breadcrumb = {label: breadcrumb};
      }

      breadcrumb = (<BreadcrumbSegmentLink {...breadcrumb} />);
    }

    return this.wrapListItem(breadcrumb, key);
  }

  getBreadcrumbDivider(key) {
    return (
      <li key={key} >
        <IconChevron
          className="icon icon-small"
          isForward={true} />
      </li>
    );
  }

  shouldCollapse(availableWidth, expandedWidth) {
    // Smooth collapse action to prevent flickering between states
    if (this.state.collapsed) {
      return expandedWidth >= availableWidth - COLLAPSE_BUFFER;
    }

    return expandedWidth >= availableWidth + COLLAPSE_BUFFER;
  }

  buildCrumbs(routeName) {
    let {router} = this.context;
    let {namedRoutes} = router;
    let route = namedRoutes[routeName];

    if (!route || !route.buildBreadCrumb) {
      return [];
    }

    let crumbConfiguration = route.buildBreadCrumb();
    let crumbs = crumbConfiguration.getCrumbs(router);

    if (crumbConfiguration.parentCrumb) {
      crumbs = this.buildCrumbs(crumbConfiguration.parentCrumb).concat(crumbs);
    }

    return crumbs;
  }

  renderCrumbsFromRoute() {
    let {router} = this.context;
    let routes = router.getCurrentRoutes();
    // Find the first route with a name
    let currentRoute = null;
    loop:
    for (var i = routes.length - 1; i >= 0; i--) {
      if (routes[i].name) {
        currentRoute = routes[i];
        break loop;
      }
    }

    if (!currentRoute) {
      return [];
    }

    let crumbs = this.buildCrumbs(currentRoute.name);

    crumbs = crumbs.slice(this.props.shift);

    let crumbKey = 0;

    return crumbs.reduce((memo, crumb, crumbIndex) => {
      memo.push(this.getBreadcrumb(crumb, ++crumbKey));

      if (crumbs.length - 1 !== crumbIndex) {
        memo.push(this.getBreadcrumbDivider(++crumbKey));
      }

      return memo;
    }, []);
  }

  render() {
    let classSet = classNames(
      'list-unstyled breadcrumb flex-no-shrink',
      {collapsed: this.state.collapsed},
      this.props.breadcrumbClasses
    );

    return (
      <ol className={classSet}>
        {this.renderCrumbsFromRoute()}
      </ol>
    );
  }
};

Breadcrumbs.contextTypes = {
  router: PropTypes.func
};

Breadcrumbs.defaultProps = {
  breadcrumbClasses: 'inverse',
  // Remove root '/' by default
  shift: 0
}

Breadcrumbs.propTypes = {
  breadcrumbClasses: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
    PropTypes.string
  ]),
  // Remove n crumbs from beginning of route crumbs
  shift: PropTypes.number
}

module.exports = Breadcrumbs;
