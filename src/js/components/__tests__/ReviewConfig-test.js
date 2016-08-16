jest.dontMock('../ReviewConfig');

/* eslint-disable no-unused-vars */
const React = require('react');
/* eslint-enable no-unused-vars */
const ReactDOM = require('react-dom');

const ReviewConfig = require('../ReviewConfig');

describe('ReviewConfig', function () {
  beforeEach(function () {
    this.container = document.createElement('div');
  });

  afterEach(function () {
    ReactDOM.unmountComponentAtNode(this.container);
  });

  describe('#getDefinitionReview', function () {
    it('renders a subheader for a nested document', function () {
      var normalDocument = {
        'application': {
          'normal': 'value',
          'normal2': 'value2',
          'normal3': 'value3'
        }
      };

      var instance = ReactDOM.render(
        <ReviewConfig configuration={normalDocument} />,
        this.container
      );

      var result = instance.getDefinitionReview();
      expect(result.length).toEqual(4);
    });

    it('renders a subheader for a nested document', function () {
      var nestedDocument = {
        'application': {
          'nested': {
            'name': 'trueValue'
          }
        }
      };

      var instance = ReactDOM.render(
        <ReviewConfig configuration={nestedDocument} />,
        this.container
      );

      var result = instance.getDefinitionReview();
      expect(result.length).toEqual(3);
    });
  });
});
