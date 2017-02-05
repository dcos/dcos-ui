import {
  ADD_ITEM,
  REMOVE_ITEM,
  SET
} from '../../../../../../src/js/constants/TransactionTypes';
import {findNestedPropertyInObject} from '../../../../../../src/js/utils/Util';
import {isEmpty} from '../../../../../../src/js/utils/ValidatorUtil';
import Transaction from '../../../../../../src/js/structs/Transaction';
import {hasThirdField} from '../../constants/OperatorTypes';

const CONSTRAINT_FIELDS = ['fieldName', 'operator', 'value'];

function getJson(constraints) {
  return constraints.filter((item = {}) => {
    return !isEmpty(item.fieldName) && !isEmpty(item.operator);
  }).map(({fieldName, operator, value}) => {
    const normalizedOperator = operator.toUpperCase();

    if (!isEmpty(value)) {
      return [fieldName, normalizedOperator, value];
    }

    return [fieldName, normalizedOperator];
  });
}

function processTransaction(state, {type, path, value}) {
  const [fieldName, index, name] = path;

  if (fieldName !== 'constraints') {
    return state;
  }

  let newState = state.slice();

  if (type === ADD_ITEM) {
    newState.push({fieldName: null, operator: null, value: null});
  }
  if (type === REMOVE_ITEM) {
    newState = newState.filter((item, index) => {
      return index !== value;
    });
  }
  if (type === SET && CONSTRAINT_FIELDS.includes(name)) {
    newState[index][name] = value;
  }

  if (name === 'operator' && !hasThirdField[value]) {
    newState[index].value = null;
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

    this.constraints = processTransaction(
      this.constraints,
      {type, path, value}
    );

    return getJson(this.constraints);
  },

  JSONParser(state) {
    const constraints = findNestedPropertyInObject(state, 'constraints');

    // Ignore non-array constraints
    if (!Array.isArray(constraints)) {
      return [];
    }

    return state.constraints.reduce(function (memo, item, index) {
      if (!Array.isArray(item)) {
        return memo;
      }

      const [fieldName, operator, value] = item;
      memo.push(new Transaction(['constraints'], index, ADD_ITEM));
      memo.push(new Transaction([
        'constraints',
        index,
        'fieldName'
      ], fieldName, SET));
      memo.push(new Transaction([
        'constraints',
        index,
        'operator'
      ], operator, SET));

      // Skip if value is not set
      if (value != null) {
        memo.push(new Transaction([
          'constraints',
          index,
          'value'
        ], value, SET));
      }

      return memo;
    }, []);
  },

  FormReducer(state = [], {type, path, value}) {
    if (path == null || !Array.isArray(state)) {
      return state;
    }

    return processTransaction(state, {type, path, value});
  }
};
