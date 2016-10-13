import classNames from 'classnames';
import GeminiScrollbar from 'react-gemini-scrollbar';
import React from 'react';

import defaultServiceImage from '../../../plugins/services/src/img/icon-service-default-small@2x.png';
import DescriptionList from './DescriptionList';
import GeminiUtil from '../utils/GeminiUtil';
import Icon from './Icon';
import Image from './Image';

class ReviewConfig extends React.Component {
  componentDidMount() {
    // Timeout necessary due to modal content height updates on did mount
    setTimeout(() => {
      GeminiUtil.updateWithRef(this.refs.gemini);
    });
  }

  getHeader() {
    let {
      configuration,
      packageIcon,
      packageName,
      packageVersion
    } = this.props;
    let fileName = 'config.json';
    let configString = JSON.stringify(configuration, null, 2);
    let ieDownloadConfig = function () {
      // Download if on IE
      if (global.navigator.msSaveOrOpenBlob) {
        let blob = new Blob([configString], {type: 'application/json'});
        global.navigator.msSaveOrOpenBlob(blob, fileName);
      }
    };

    return (
      <div className="modal-header flex-item-shrink-0">
        <div className="row">
          <div className="column-4">
            <div className="media-object-spacing-wrapper media-object-spacing-narrow media-object-offset">
              <div className="media-object media-object-align-middle">
                <div className="media-object-item">
                  <div className="icon icon-medium icon-image-container icon-app-container icon-default-white">
                    <Image
                      fallbackSrc={defaultServiceImage}
                      src={packageIcon} />
                  </div>
                </div>
                <div className="media-object-item">
                  <h4 className="flush-top flush-bottom text-color-neutral">
                    {packageName}
                  </h4>
                  <span className="side-panel-resource-label">
                    {packageVersion}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="column-8 text-align-right">
            <a
              className="button button-small button-stroke button-rounded"
              onClick={ieDownloadConfig}
              download={fileName}
              href={`data:attachment/json;content-disposition=attachment;filename=${fileName};charset=utf-8,${encodeURIComponent(configString)}`}>
              <Icon family="mini" id="download" size="mini" /> Download config.json
            </a>
          </div>
        </div>
      </div>
    );
  }

  getFieldTitle(title, index) {
    let classes = classNames({'flush-top': index === 0});

    return <h3 className={classes} key={`${title}-header`}>{title}</h3>;
  }

  getFieldSubheader(title) {
    return (<h5 key={`${title}-subheader`}>{title}</h5>);
  }

  getDefinitionReview() {
    var elementsToRender = [];
    let {configuration} = this.props;
    let fields = Object.keys(configuration);

    fields.forEach((field, i) => {
      var fieldObj = configuration[field];
      elementsToRender.push(this.getFieldTitle(field, i));

      Object.keys(fieldObj).forEach((fieldKey) => {
        let fieldValue = fieldObj[fieldKey];
        let uniqueKey = `${i}${fieldKey}`;

        if (typeof fieldValue === 'object' && !Array.isArray(fieldValue)
          && fieldValue !== null) {
          elementsToRender.push(
            this.getFieldSubheader(fieldKey),
            this.renderDescriptionList(fieldValue, uniqueKey)
          );
          return;
        }

        if (Array.isArray(fieldValue)) {
          fieldValue = fieldValue.join(' ');
        }

        elementsToRender.push(
          this.renderDescriptionList({[fieldKey]: fieldValue}, uniqueKey)
        );
      });
    });

    return elementsToRender;
  }

  renderDescriptionList(hash, key) {
    return (
      <DescriptionList
        hash={hash}
        key={key}
        ddClassName="column-6 text-color-neutral"
        dtClassName="column-6"/>
    );
  }

  render() {
    return (
      <div className={this.props.className}>
        {this.getHeader()}
        <GeminiScrollbar autoshow={true} className="review-config" ref="gemini">
          <div className="modal-body flush-top flush-bottom">
            {this.getDefinitionReview()}
          </div>
        </GeminiScrollbar>
      </div>
    );
  }
}

ReviewConfig.defaultProps = {
  className: 'modal-install-package-body-and-header'
};

ReviewConfig.propTypes = {
  className: React.PropTypes.string,
  configuration: React.PropTypes.object.isRequired,
  packageIcon: React.PropTypes.string,
  packageName: React.PropTypes.string,
  packageVersion: React.PropTypes.string
};

module.exports = ReviewConfig;
