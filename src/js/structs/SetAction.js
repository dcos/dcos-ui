import Action from './Action';

class ActionSet extends Action {
  constructor(path, value) {
    super(path, value, 'SET');
  }
}

module.exports = ActionSet;
