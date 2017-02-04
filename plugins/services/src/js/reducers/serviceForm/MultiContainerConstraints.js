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
      return {fieldName, operator: normalizedOperator, value};
    }

    return {fieldName, operator: normalizedOperator};
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

    // Will be applied in the `scheduling` object
    return {placement: {constraints: getJson(this.constraints)}};
  },

  JSONParser(state) {
    const constraints = findNestedPropertyInObject(
      state,
      'scheduling.placement.constraints'
    );
    if (constraints == null) {
      return [];
    }

    return constraints.reduce(function (memo, item, index) {
      if (typeof item !== 'object') {
        return memo;
      }

      const {fieldName, operator, value} = item;
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
      memo.push(new Transaction([
        'constraints',
        index,
        'value'
      ], value, SET));

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
