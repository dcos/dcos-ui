import {
  ADD_ITEM,
  REMOVE_ITEM,
  SET
} from '../../../../../../src/js/constants/TransactionTypes';
import Transaction from '../../../../../../src/js/structs/Transaction';
import {isEmpty} from '../../../../../../src/js/utils/ValidatorUtil';

const CONSTRAINT_FIELDS = ['field', 'operator', 'value'];

function getJson(constraints) {
  return constraints.filter((item) => {
    return !isEmpty(item.field) && !isEmpty(item.operator);
  }).map(({field, operator, value}) => {
    const normalisedOperator = operator.toUpperCase();

    if (!isEmpty(value)) {
      return [field, normalisedOperator, value];
    }

    return [field, normalisedOperator];
  });
}

function processTransaction(state, {type, path, value}) {
  const [field, index, name] = path;

  if (field !== 'constraints') {
    return state;
  }

  let newState = state.slice();

  if (type === ADD_ITEM) {
    newState.push({field: null, operator: null, value: null});
  }
  if (type === REMOVE_ITEM) {
    newState = newState.filter((item, index) => {
      return index !== value;
    });
  }
  if (type === SET && CONSTRAINT_FIELDS.includes(name)) {
    newState[index][name] = value;
  }

  return newState;
}

module.exports = {
  JSONReducer(state, {type, path, value}) {
    if (path == null) {
      return state;
    }
    if (this.constraints == null) {
      this.constraints = [];
    }

    this.constraints = processTransaction(this.constraints, {type, path, value});

    return getJson(this.constraints);
  },

  JSONParser(state) {
    if (state.constraints == null) {
      return [];
    }

    return state.constraints.reduce(function (memo, item, index) {
      memo.push(new Transaction(['constraints'], index, ADD_ITEM));
      memo.push(new Transaction([
        'constraints',
        index,
        'field'
      ], item[0], SET));
      memo.push(new Transaction([
        'constraints',
        index,
        'operator'
      ], item[1], SET));
      memo.push(new Transaction([
        'constraints',
        index,
        'value'
      ], item[2], SET));

      return memo;
    }, []);
  },

  FormReducer(state = [], {type, path, value}) {
    if (path == null) {
      return state;
    }

    state = processTransaction(state, {type, path, value});

    return state;
  }
};
