import React from 'react';

class IconUpgradeBlock extends React.Component {
  render() {
    let iconContent = (<rect width="10" height="10" />);

    if (this.props.hasDecisionPoint) {
      iconContent = (
        <rect x="1.46" y="1.46" width="7.07" height="7.07"
          transform="translate(5 -2.07) rotate(45)" />
      );
    }

    return (
      <svg
        className="icon icon-upgrade-block"
        viewBox="0 0 10 10"
        {...this.props}>
        {iconContent}
      </svg>
    );
  }
};

IconUpgradeBlock.propTypes = {
  hasDecisionPoint: React.PropTypes.bool
};

module.exports = IconUpgradeBlock;
