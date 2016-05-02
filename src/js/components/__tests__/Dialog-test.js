jest.dontMock('../Dialog');

/* eslint-disable no-unused-vars */
var React = require('react');
/* eslint-enable no-unused-vars */
let ReactDOM = require('react-dom');

let Dialog = require('../Dialog');

describe('#Dialog', function () {
  beforeEach(function () {
    this.container = document.createElement('div');
    this.instance = ReactDOM.render(
      <Dialog
        title="Info Dialog"
        buttons={[
          {
            text: 'Okay',
            button: 'button-success',
            onClick: function () {
              alert('test');
            }
          },
          {
            text: 'No',
            className: 'button-danger button-stroke',
            onClick: function () {
              alert('No');
            }
          }
        ]}>
        Some content
      </Dialog>,
      this.container
    );
  });

  afterEach(function () {
    ReactDOM.unmountComponentAtNode(this.container);
  });

  describe('getButtons', function () {
    it('Should return an empty array', function () {
      let instance = ReactDOM.render(
        <Dialog
          title="Info Dialog"
          >
          Some content
        </Dialog>,
        this.container
      );
      expect(instance.getButtons().length).toEqual(0);
    });

    it('Should return an array with one item', function () {
      let arrayWithOneButton = [
        {
          text: 'Okay',
          className: 'button-success',
          onClick: function () {
            alert('test');
          }
        }];

      let instance = ReactDOM.render(
        <Dialog
          title="Info Dialog"
          buttons={arrayWithOneButton}>
          Some content
        </Dialog>,
        this.container
      );

      expect(instance.getButtons().length).toEqual(1);
    });

    it('Should set the right css class', function () {
      let arrayWithOneButton = [
        {
          text: 'Okay',
          className: 'button-success',
          onClick: function () {
            alert('test');
          }
        }];

      let instance = ReactDOM.render(
        <Dialog
          title="Info Dialog"
          buttons={arrayWithOneButton}>
          Some content
        </Dialog>,
        this.container
      );

      let button = instance.getButtons()[0];

      expect(button.props.className).toEqual('button button-success');
    });

    it('Should set the right css class if no className is provided',
      function () {
        let arrayWithOneButton = [
          {
            text: 'Okay',
            onClick: function () {
              alert('test');
            }
          }];

        let instance = ReactDOM.render(
          <Dialog
            title="Info Dialog"
            buttons={arrayWithOneButton}>
            Some content
          </Dialog>,
          this.container
        );

        let button = instance.getButtons()[0];

        expect(button.props.className).toEqual('button');
      });

    it('Should set the right text', function () {
      let arrayWithOneButton = [
        {
          text: 'Okay',
          className: 'button-success',
          onClick: function () {
            alert('test');
          }
        }];

      let instance = ReactDOM.render(
        <Dialog
          title="Info Dialog"
          buttons={arrayWithOneButton}>
          Some content
        </Dialog>,
        this.container
      );

      let button = instance.getButtons()[0];

      expect(button.props.children).toEqual('Okay');
    });

    it('Should return an array with two items', function () {
      let arrayWithOneButton = [
        {
          text: 'Okay',
          className: 'button-success',
          onClick: function () {
            alert('test');
          }
        },
        {
          text: 'Nay',
          className: 'button-danger button-stroke',
          onClick: function () {
            alert('nay');
          }
        }];

      let instance = ReactDOM.render(
        <Dialog
          title="Info Dialog"
          buttons={arrayWithOneButton}>
          Some content
        </Dialog>,
        this.container
      );

      expect(instance.getButtons().length).toEqual(2);
    });
  });

  describe('getCloseByBackdropClick', function () {
    it('Should return false', function () {
      let instance = ReactDOM.render(
        <Dialog
          title="Info Dialog">
          Some content
        </Dialog>,
        this.container
      );
      expect(instance.getCloseByBackdropClick()).toBeFalsy();
    });

    it('Should return true if only one button is present', function () {
      let arrayWithOneButton = [
        {
          text: 'Okay',
          className: 'button-success',
          onClick: function () {
            alert('test');
          }
        }];

      let instance = ReactDOM.render(
        <Dialog
          title="Info Dialog"
          buttons={arrayWithOneButton}>
          Some content
        </Dialog>,
        this.container
      );

      expect(instance.getCloseByBackdropClick()).toBeTruthy();
    });

    it('Should return false if more then one button is present', function () {
      let arrayWithOneButton = [
        {
          text: 'Okay',
          className: 'button-success',
          onClick: function () {
            alert('test');
          },
        },
        {
          text: 'Nay',
          className: 'button-danger button-stroke',
          onClick: function () {
            alert('nay');
          }
        }];

      let instance = ReactDOM.render(
        <Dialog
          title="Info Dialog"
          buttons={arrayWithOneButton}>
          Some content
        </Dialog>,
        this.container
      );

      expect(instance.getCloseByBackdropClick()).toBeFalsy();
    });
  });

  describe('getFooter', function () {
    it('Should return null', function () {
      expect(this.instance.getFooter([])).toEqual(null);
    });

    it('Should return an element containing one child', function () {
      let arrayWithOneButton = [
        (<div key={0}
             className="button"
             onClick={Function.prototype}>
          Button
        </div>)
      ];
      expect(this.instance.getFooter(arrayWithOneButton).props.children.length)
        .toEqual(1);
    });
  });

});
