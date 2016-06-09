import classNames from 'classnames';
import DeepEqual from 'deep-equal';
import {Link} from 'react-router';
import React, {PropTypes} from 'react';
import ReactDOM from 'react-dom';

import IconChevron from './icons/IconChevron';

const COLLAPSE_BUFFER = 12;
const LAST_ITEM_OFFSET = 150; // Difference between scrollWidth and outerWidth
const PADDED_ICON_WIDTH = 38; // Width of icon + padding

class Breadcrumb extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      availableWidth: null,
      collapsed: false,
      expandedWidth: null
    };

    this.handleResize = this.handleResize.bind(this);
  }

  componentDidMount() {
    if (global.window != null) {
      window.addEventListener('resize', this.handleResize);
      window.addEventListener('focus', this.handleResize);
    }
  }

  componentDidUpdate() {
    this.updateDimensions();
  }

  componentWillUnmount() {
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
    let lastItemLink = lastItem.firstChild;

    return lastItemLink.scrollWidth + LAST_ITEM_OFFSET;
  }

  getCurrentRouteParams() {
    // Isolated for easier testing
    return this.context.router.getCurrentParams();
  }

  getCrumb(crumb, key) {
    let content = crumb;
    let label = null;
    let route = null;

    if (crumb.hasOwnProperty('route')) {
      route = crumb.route;
    }

    if (crumb.hasOwnProperty('label')) {
      label = crumb.label;
    }

    if (route) {
      content = (
        <Link to={route.to}
            params={route.params}
            title={label}>
          {label}
        </Link>
      );
    }

    return (
      <li key={key}>
        {content}
      </li>
    );
  }

  getCrumbDivider(key) {
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
    let {namedRoutes} = this.context.router;
    let route = namedRoutes[routeName];

    if (!route || !route.buildBreadCrumb) {
      return [];
    }

    let crumbConfiguration = route.buildBreadCrumb();
    let crumbs = crumbConfiguration.getCrumbs(this.context.router);

    if (crumbConfiguration.parentCrumb) {
      crumbs = this.buildCrumbs(crumbConfiguration.parentCrumb).concat(crumbs);
    }

    return crumbs;
  }

  renderCrumbsFromRoute() {
    let {router} = this.context;
    let routes = router.getCurrentRoutes();
    let currentRoute = routes[routes.length - 1];
    let crumbs = this.buildCrumbs(currentRoute.name);

    crumbs = crumbs.slice(this.props.shift);

    let crumbKey = 0;

    return crumbs.reduce((memo, crumb, crumbIndex) => {
      memo.push(this.getCrumb(crumb, ++crumbKey));

      if (crumbs.length - 1 !== crumbIndex) {
        memo.push(this.getCrumbDivider(++crumbKey));
      }

      return memo;
    }, []);
  }

  render() {
    let classSet = classNames(
      'list-unstyled breadcrumb',
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

Breadcrumb.contextTypes = {
  router: PropTypes.func
};

Breadcrumb.defaultProps = {
  breadcrumbClasses: 'inverse',
  // Remove root '/' by default
  shift: 0
}

Breadcrumb.propTypes = {
  breadcrumbClasses: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
    PropTypes.string
  ]),
  // Remove n crumbs from beginning of route crumbs
  shift: PropTypes.number
}

module.exports = Breadcrumb;
