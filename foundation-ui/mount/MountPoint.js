import React, {PropTypes} from 'react';

import hooks from './hooks';

const METHODS_TO_BIND = [
  'updateState'
];

/**
 * A component to use as a mount point for changing default behavior by packages
 * or events.
 * Use MountService to listen for events and return changed or new content to be
 * displayed at the mount point at a given id.
 *
 * @example
 * import {MountPoint, MountService} from 'foundation-ui/mount';
 *
 * class ServiceDetailPlugin {
 *   getContents(children, props) {
 *     return <ServiceDetail {...props} />;
 *   }
 *
 *   initialize() {
 *     // priority order is from [-Inifinity, Inifinity]
 *     MountService.on('serviceDetail', this.getContents, 0);
 *   }
 * }
 *
 * class MyComponent extends React.Component {
 *   render() {
 *     return (
 *       <MountPoint id="serviceDetail">
 *         // What to show when serviceDetail doesn't mount
 *         <EmptyPage />
 *       </MountPoint>
 *     );
 *   }
 * };
 */
class MountPoint extends React.Component {
  constructor() {
    super(...arguments);

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  getChildContext() {
    // Get context passed down from parent MountPoint if one exists
    // and add to it so we can create a render tree chain of nested IDs.
    // This should just be an Array of string IDs. We can use the IDs
    // to look up each MountPoint Component on the page and see debug info about it
    // like which package inserted the component, what the priorities were for
    // each component if multiple components were registered for a id etc.
    const {mountChain = []} = this.context || {};

    return {mountChain: [...mountChain, this.props.id]};
  }

  componentWillMount() {
    this.updateState();
    // Register for changes in MountService specific to this id.
    // Whenever MountService has a change it will end up invoking updateState
    // so we can get the newly filtered children.
    hooks.addAction(this.props.id, this.updateState);
  }

  componentWillReceiveProps(nextProps) {
    // Update mount contents when new props are received
    this.updateState(nextProps);
  }

  componentWillUnmount() {
    hooks.removeAction(this.props.id, this.updateState);
  }

  updateState(props = this.props) {
    let {children, id} = props;
    let blackList = ['children', ...Object.keys(MountPoint.propTypes)];
    // Filter props consumed by MountPoint to create childProps
    let childProps = Object.keys(props).filter(function (key) {
      return !blackList.includes(key);
    }).reduce(function (memo, key) {
      memo[key] = props[key];

      return memo;
    }, {});

    let filteredChildren = hooks.applyFilter(
      id,
      React.Children.toArray(children),
      childProps
    );

    this.setState({children: filteredChildren});
  }

  render() {
    let {alwaysWrap} = this.props;
    let {children} = this.state;

    // TODO: implement solution for debugging

    // Don't wrap, if not necessary
    if (React.isValidElement(children) && !alwaysWrap) {
      return children;
    }

    // Don't wrap, if not necessary
    if (Array.isArray(children) && children.length === 1 && !alwaysWrap) {
      return children[0];
    }

    // Wrap array of children in chosen wrapperComponent.
    // e.g. for table row, this would be <tr/> and children would be a set
    // of filtered <td/>'s
    return (
      <this.props.wrapperComponent>
        {children}
      </this.props.wrapperComponent>
    );
  }
}

// Consume mountChain from parent MountPoint(s)
MountPoint.contextTypes = {
  mountChain: PropTypes.array
};

// Pass down mountChain context to children MountPoint(s)
MountPoint.childContextTypes = {
  mountChain: PropTypes.array
};

MountPoint.defaultProps = {
  wrapperComponent: 'div',
  alwaysWrap: false
};

MountPoint.propTypes = {
  id: PropTypes.string.isRequired,
  wrapperComponent: PropTypes.node,
  alwaysWrap: PropTypes.bool
};

module.exports = MountPoint;
