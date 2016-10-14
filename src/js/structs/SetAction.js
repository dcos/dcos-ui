import Action from './Action';

class SetAction extends Action {
  constructor(path, value) {
    super(path, value, 'SET');
  }
}

module.exports = SetAction;
