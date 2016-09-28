import React, {PropTypes} from 'react';

import hooks from './hooks';

const METHODS_TO_BIND = [
  'updateState'
];

/*
 * Example usage;
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
 *       <MountPoint mountId="serviceDetail">
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
    // and add to it so we can create a render tree chain of nested mountIds.
    // This should just be an Array of string mountIds. We can use the mountIds
    // to look up each MountPoint Component on the page and see debug info about it
    // like which package inserted the component, what the priorities were for
    // each component if multiple components were registered for a mountId etc.
    const {mountChain = []} = this.context || {};

    return {mountChain: [...mountChain, this.props.mountId]};
  }

  componentWillMount() {
    this.updateState();
    // Register for changes in MountService specific to this mountId.
    // Whenever MountService has a change it will end up invoking updateState
    // so we can get the newly filtered children.
    hooks.addAction(this.props.mountId, this.updateState);
  }

  componentWillReceiveProps(nextProps) {
    // Update mount contents when new props are received
    this.updateState(nextProps);
  }

  componentWillUnmount() {
    hooks.removeAction(this.props.mountId, this.updateState);
  }

  updateState(props = this.props) {
    let {children, mountId} = props;
    let blackList = ['children', ...Object.keys(MountPoint.propTypes)];
    // Filter props consumed by MountPoint to create childProps
    let childProps = Object.keys(props).filter(function (key) {
      return !blackList.includes(key);
    }).reduce(function (memo, key) {
      memo[key] = props[key];

      return memo;
    }, {});

    let filteredChildren = hooks.applyFilter(
      mountId,
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

// Pass down mointChain context to children MountPoint(s)
MountPoint.childContextTypes = {
  mountChain: PropTypes.array
};

MountPoint.defaultProps = {
  wrapperComponent: 'div',
  alwaysWrap: false
};

MountPoint.propTypes = {
  mountId: PropTypes.string.isRequired,
  wrapperComponent: PropTypes.node,
  alwaysWrap: PropTypes.bool
};

module.exports = MountPoint;
