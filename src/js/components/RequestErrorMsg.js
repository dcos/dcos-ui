var React = require('react');

import Config from '../config/Config';

function getDefaultMessage() {
  let slackLink = (
    <a
      href={Config.slackChannel}
      target="_blank">
      Slack channel
    </a>
  );
  let supportLink = (
    <a href={`mailto:${Config.supportEmail}`}>
      {Config.supportEmail}
    </a>
  );

  return (
    <p className="inverse text-align-center flush-bottom">
      We have been notified of the issue, but would love to know more. You can also join us on our {slackLink} or send us an email at {supportLink}.
    </p>
  );
}

class RequestErrorMsg extends React.Component {
  render() {
    let {header, message} = this.props;
    return (
      <div className="row">
        <div className="column-small-8 column-small-offset-2 column-medium-6 column-medium-offset-3">
          <h3 className="inverse text-align-center flush-top">
            {header}
          </h3>
          {message}
        </div>
      </div>
    );
  }
}

RequestErrorMsg.defaultProps = {
  header: 'Cannot Connect With The Server',
  message: getDefaultMessage()
};

RequestErrorMsg.propTypes = {
  header: React.PropTypes.node,
  message: React.PropTypes.node
};

module.exports = RequestErrorMsg;
