import FormAction from './FormAction';

class SetFormAction extends FormAction {
  constructor(path, value) {
    super(path, value, 'SET');
  }
}

module.exports = SetFormAction;
