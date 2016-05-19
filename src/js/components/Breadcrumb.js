import classNames from 'classnames';
import DeepEqual from 'deep-equal';
import {Link} from 'react-router';
import React from 'react';
import ReactDOM from 'react-dom';

import IconChevron from './icons/IconChevron';
import StringUtil from '../utils/StringUtil';

const COLLAPSE_BUFFER = 12;
const LAST_ITEM_OFFSET = 150; // Difference between scrollWidth and outerWidth
const PADDED_ICON_WIDTH = 38; // Width of icon + padding

const {PropTypes} = React;

class Breadcrumb extends React.Component {
  constructor() {
    super();

    this.displayName = 'Breadcrumb';

    this.state = {
      collapsed: false,
      availableWidth: null,
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

  getCurrentNamedRoutes() {
    let {router} = this.context;
    let namedRoutes = {};
    let routes = router.getCurrentRoutes();

    routes.forEach(function (route) {
      // Strip regex characters from route.path
      let path = route.path.slice().replace(/\?/g, '').replace(/\/\//g, '/');
      if (path.charAt(0) === '/') {
        path = path.slice(1);
      }
      if (path.charAt(path.length - 1) === '/') {
        path = path.slice(0, -1);
      }
      // If named path already exists, don't overwrite. Sometimes root path
      // returns a named route match and an unnamed match.
      if (!(path in namedRoutes) || (namedRoutes[path] == null)) {
        namedRoutes[path] = route.name;
      }
    });

    return namedRoutes;
  }

  getCurrentRouteParams() {
    // Isolated for easier testing
    return this.context.router.getCurrentParams();
  }

  getCrumb(label, route, params, key) {
    return (
      <li key={key}>
        <Link to={route}
            params={params}
            title={label}>
          {label}
        </Link>
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
  /**
   * Builds a crumb or multiple crumbs from the label and matching route
   * @param  {String} label Url path part
   * @param  {String} route Matching route name
   * @param {Object} routeParams Router routeParams Object
   * @param {Bool} labelIsParam Boolean indicating if the label represents a
   * route parameter.
   * @return {Array} Array of crumbs containing the label, route and route
   * params. The returned label is the text shown for the crumb. The route is
   * the route name which will be set on the Link-to attribute. The params will
   * also be set on the Link tag. Each returned crumb will be spliced into the
   * resulting breadcrumb.
   */
  buildCrumb(label, route, routeParams, labelIsParam) {
    // Split label on whitespace and -
    let splitLabelRegex = /[\s-]+/;
    let joinLabelCharacter = ' ';
    let params = {};

    if (labelIsParam) {
      // Extract param value as label e.g. (:userID -> Foo)
      // and add param to params.
      //
      // Remove colon first
      let paramName = label.slice(1);
      // Decode value
      label = decodeURIComponent(routeParams[paramName]);
      params[paramName] = label;
    } else {
      // Split Label on space and - then capitalize each word and join.
      // /foo-bar/ --> Foo Bar
      label = label.split(splitLabelRegex).map(function (word) {
        return StringUtil.capitalize(word);
      }).join(joinLabelCharacter);
    }
    // Can return multiple route objects to get rendered in crumbs.
    // Useful for splitting a route parameter like a file path.
    return [{label, route, params}];
  }

  renderCrumbsFromRoute() {
    let {buildCrumb, shift} = this.props;

    if (buildCrumb == null) {
      buildCrumb = this.buildCrumb;
    }

    let crumbKey = 1;
    let namedRoutes = this.getCurrentNamedRoutes();
    let params = this.getCurrentRouteParams();
    // Remove n items from beginning
    let paths = Object.keys(namedRoutes).slice(shift);

    return paths.reduce((crumbs, path, pathIndex) => {
      let name = namedRoutes[path];
      let pathParts = path.split('/');
      // Decode Label
      let label = decodeURIComponent(pathParts[pathParts.length - 1]);
      let labelIsParam = label.charAt(0) === ':' && label.slice(1) in params;

      let crumbObjects = buildCrumb(
        label,
        name,
        params,
        labelIsParam
      );

      crumbObjects.forEach((crumbParams, crumbIndex) => {
        let {label, route, params} = crumbParams;

        crumbs.push(this.getCrumb(label, route, params, crumbKey++));

        if (pathIndex !== paths.length - 1
          || crumbIndex !== crumbObjects.length - 1) {

          crumbs.push(this.getCrumbDivider(crumbKey++));
        }
      });

      return crumbs;
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
  shift: 1
}

Breadcrumb.propTypes = {
  // Function to override the processing of each crumb
  buildCrumb: PropTypes.func,
  breadcrumbClasses: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
    PropTypes.string
  ]),
  // Remove n crumbs from beginning of route crumbs
  shift: PropTypes.number
}

module.exports = Breadcrumb;
