import React, {PropTypes, Component} from 'react';

const METHODS_TO_BIND = [
  'handleDragEvents',
  'handleFileResult',
  'handleOnDrop'
];

class DragAndDrop extends Component {
  constructor() {
    super(...arguments);

    this.fileReader = new FileReader();

    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  componentDidMount() {
    this.fileReader.addEventListener('load', this.handleFileResult, false);

  }

  componentWillUnmount() {
    this.fileReader.removeEventListener('load', this.handleFileResult, false);
  }

  handleFileResult() {
    this.props.handleFileContents(this.fileReader.result);
  }

  // In order to have the drop event occur on a div element, you must cancel
  // the ondragenter and ondragover events
  handleDragEvents(event) {
    event.preventDefault();
  }

  handleOnDrop(event) {

    event.preventDefault();

    const files = event.dataTransfer ? event.dataTransfer.files : event.target.files;

    if (files[0]) {
      this.fileReader.readAsText(files[0]);
    }
  }

  render() {
    return (
      <div
        className={this.props.className}
        onDragEnter={this.handleDragEvents}
        onDragOver={this.handleDragEvents}
        onDrop={this.handleOnDrop}>
        {this.props.children}
      </div>
    );
  }
}

DragAndDrop.defaultProps = {
  handleFileContents: Function.prototype
};

DragAndDrop.propTypes = {
  handleFileContents: PropTypes.func
};

module.exports = DragAndDrop;
