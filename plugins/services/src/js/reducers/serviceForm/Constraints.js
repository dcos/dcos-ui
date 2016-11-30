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
    if (!isEmpty(value)) {
      return [field, operator, value];
    }

    return [field, operator];
  });
}

module.exports = {
  JSONReducer(state, {type, path, value}) {
    if (path == null) {
      return state;
    }

    if (this.constraints == null) {
      this.constraints = [];
    }

    const joinedPath = path.join('.');

    if (joinedPath.search('constraints') !== -1) {
      if (joinedPath === 'constraints') {
        switch (type) {
          case ADD_ITEM:
            this.constraints.push({field: null, operator: null, value: null});
            break;
          case REMOVE_ITEM:
            this.constraints = this.constraints.filter((item, index) => {
              return index !== value;
            });
            break;
        }

        return getJson(this.constraints);
      }

      if (type !== SET) {
        return state;
      }

      const [jsonField, index, name] = path;
      if (jsonField === 'constraints' && CONSTRAINT_FIELDS.includes(name)) {
        this.constraints[index][name] = value;
      }
    }

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

    let joinedPath = path.join('.');

    if (joinedPath.search('constraints') !== -1) {
      if (joinedPath === 'constraints') {
        switch (type) {
          case ADD_ITEM:
            state.push({field: null, operator: null, value: null});
            break;
          case REMOVE_ITEM:
            state = state.filter((item, index) => {
              return index !== value;
            });
            break;
        }

        return state;
      }

      if (type !== SET) {
        return state;
      }

      const [jsonField, index, name] = path;
      if (jsonField === 'constraints' && CONSTRAINT_FIELDS.includes(name)) {
        state[index][name] = value;
      }
    }

    return state;
  }
};
