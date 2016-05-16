import React from 'react';

class IconUpgradeBlock extends React.Component {
  render() {
    return (
      <svg
        className="icon icon-upgrade-block"
        viewBox="0 0 10 10"
        {...this.props}>
        <rect x="1.46" y="1.46" width="7.07" height="7.07"
          transform="translate(5 -2.07) rotate(45)" />
      </svg>
    );
  }
};

module.exports = IconUpgradeBlock;
