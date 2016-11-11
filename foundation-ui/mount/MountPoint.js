import React, {PropTypes} from 'react';

import MountService from './MountService';
import {CHANGE} from './MountEvent';
import ReactUtil from '../utils/ReactUtil';

const METHODS_TO_BIND = [
  'handleMountServiceChange'
];

/**
 * A component to use as a mount point to incorporate views/components provided
 * by packages. It renders with a/components registered to the `MountService`
 * with a matching `type`.
 * It provides a property to configure the wrapping component (`wrapper`) as
 * well as a property to `limit` the number of rendered elements.
 *
 * @example
 *
 * <MountPoint type="widget" limit={10} wrapper={MyWidgetsWrapper}>
 *     <span className="help-text"></span>
 * </MountPoint>
 *
 */
class MountPoint extends React.Component {
  constructor() {
    super(...arguments);

    // Get components and init state
    this.state = {
      components: MountService.findComponentsWithType(this.props.type)
    };

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentWillMount() {
    MountService.addListener(CHANGE, this.handleMountServiceChange);
  }

  componentWillReceiveProps({type}) {
    if (this.props.type === type) {
      return;
    }

    this.setState({components: MountService.findComponentsWithType(type)});
  }

  componentWillUnmount() {
    MountService.removeListener(CHANGE, this.handleMountServiceChange);
  }

  handleMountServiceChange(type) {
    if (this.props.type !== type) {
      return;
    }

    this.setState({components: MountService.findComponentsWithType(type)});
  }

  render() {
    const {alwaysWrap, children, limit, wrapper} = this.props;
    const {components} = this.state;

    // Filter consumed props to only pass on a "clean" set of props
    const filteredProps = Object.keys(this.props).reduce((props, key) => {
      if (!Object.prototype.hasOwnProperty.call(MountPoint.propTypes, key)) {
        props[key] = this.props[key];
      }

      return props;
    }, {});

    // Limit the number of components as configured and create elements
    const elements = components.slice(0, limit).map((Component, index) => {
      return (<Component {...filteredProps} key={index} />);
    });

    // Don't render prop.children if elements is defined
    if (elements.length > 0) {

      // Wrap array of children in chosen wrapperComponent (default: div)
      // e.g. for table row, this would be <tr/> and elements could be a
      // set of  <td/>'s
      return ReactUtil.wrapElements(elements, wrapper, alwaysWrap);
    }

    return ReactUtil.wrapElements(children, wrapper, alwaysWrap);
  }
}

MountPoint.defaultProps = {
  alwaysWrap: false,
  limit: Number.MAX_SAFE_INTEGER,
  wrapper: 'div'
};

MountPoint.propTypes = {
  alwaysWrap: PropTypes.bool,
  limit: PropTypes.number,
  children: PropTypes.element,
  type: PropTypes.string.isRequired,
  wrapper: PropTypes.node
};

module.exports = MountPoint;
