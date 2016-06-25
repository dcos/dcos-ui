import classNames from 'classnames';
import DeepEqual from 'deep-equal';
import React, {PropTypes} from 'react';
import ReactDOM from 'react-dom';

import BreadcrumbSegmentLink from './BreadcrumbSegmentLink';
import Icon from './Icon';

const COLLAPSE_BUFFER = 12;
const LAST_ITEM_OFFSET = 150; // Difference between scrollWidth and outerWidth
const PADDED_ICON_WIDTH = 38; // Width of icon + padding

class ManualBreadcrumbs extends React.Component {
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

    if (!lastItem || !lastItem.firstChild) {
      return LAST_ITEM_OFFSET;
    }

    let lastItemLink = lastItem.firstChild;

    return lastItemLink.scrollWidth + LAST_ITEM_OFFSET;
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
        <Icon family="small" id="caret-right" size="small" />
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

  renderCrumbs(crumbs) {
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
      'list-unstyled breadcrumb',
      {collapsed: this.state.collapsed},
      this.props.breadcrumbClasses
    );

    return (
      <ol className={classSet}>
        {this.renderCrumbs(this.props.crumbs)}
      </ol>
    );
  }
}

ManualBreadcrumbs.defaultProps = {
  breadcrumbClasses: 'inverse',
  crumbs: []
};

ManualBreadcrumbs.propTypes = {
  breadcrumbClasses: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
    PropTypes.string
  ]),
  crumbs: PropTypes.array
};

module.exports = ManualBreadcrumbs;
