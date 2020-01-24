import * as React from "react";
import PropTypes from "prop-types";

class ClusterLinkingModalContent extends React.Component {
  render() {
    const { clusters } = this.props;

    return (
      <div>
        {clusters.map((cluster, key) => {
          return (
            <a
              className="link-list-item flex"
              href={cluster.getLoginUrl()}
              key={key}
            >
              <div className="flex-item-grow-2">
                <div className="link-list-primary flush-bottom">
                  {cluster.getName()}
                </div>
                <div className="link-list-secondary flush-bottom">
                  {cluster.getUrl()}
                </div>
              </div>
            </a>
          );
        })}
      </div>
    );
  }
}

ClusterLinkingModalContent.propTypes = {
  clusters: PropTypes.array
};

export default ClusterLinkingModalContent;
