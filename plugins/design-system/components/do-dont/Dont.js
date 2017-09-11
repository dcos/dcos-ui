import classNames from "classnames/dedupe";
import React, { Component } from "react";

class Dont extends Component {
  getTitle() {
    return "Don't";
  }

  render() {
    const { className, description } = this.props;
    const classes = classNames("panel do-dont-panel", className);

    return (
      <div className={classes}>
        <div className="panel-cell">
          <div className="do-dont-header">
            <h3 className="do-dont-heading red">
              {this.getTitle()}
            </h3>
          </div>
          <div className="do-dont-body">
            <p>
              {description}
            </p>
          </div>
          <div className="do-dont-footer">
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
}

Dont.propTypes = {
  description: React.PropTypes.string.isRequired,
  className: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object,
    React.PropTypes.string
  ])
};

module.exports = Dont;
