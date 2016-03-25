import classnames from 'classnames';
import React from 'react';

class UpgradeProgressBar extends React.Component {
  render() {
    let props = this.props;
    let classes = classnames(props.className, props.layoutClassName, {
      'is-erroneous': props.state === 'error',
      'is-ongoing': props.state === 'ongoing',
      'is-paused': props.state === 'paused',
      'is-waiting': props.state === 'waiting'
    });

    return (
      <div className={classes}>
        <div className={props.headerClassName}>
          <span className={props.labelClassName}>
            <span className={props.labelContentClassName}>{props.label}</span>
          </span>
          <span className={props.labelActionClassName}>
            {props.labelAction}
          </span>
        </div>
        <div className={props.fillWrapperClassName}>
          <div className={props.fillClassName} style={{
            width: `${props.progress}%`
          }} />
        </div>
      </div>
    );
  }
}

UpgradeProgressBar.defaultProps = {
  className: 'upgrade-progress-bar',
  headerClassName: 'progress-bar-header',
  fillClassName: 'progress-bar-fill',
  fillWrapperClassName: 'progress-bar-fill-wrapper',
  labelActionClassName: 'progress-bar-label-action',
  labelClassName: 'progress-bar-label',
  labelContentClassName: 'progress-bar-label-content',
  layoutClassName: '',
  progress: 0
};

UpgradeProgressBar.propTypes = {
  className: React.PropTypes.string,
  headerClassName: React.PropTypes.string,
  fillClassName: React.PropTypes.string,
  fillWrapperClassName: React.PropTypes.string,
  label: React.PropTypes.node.isRequired,
  labelAction: React.PropTypes.node,
  labelActionClassName: React.PropTypes.string,
  labelClassName: React.PropTypes.string,
  labelContentClassName: React.PropTypes.string,
  layoutClassName: React.PropTypes.string,
  progress: React.PropTypes.number.isRequired,
  state: React.PropTypes.oneOf(['error', 'ongoing', 'paused', 'waiting'])
    .isRequired
};

module.exports = UpgradeProgressBar;
