import TransactionTypes from '../constants/TransactionTypes';

/**
 * An immutable batch is an ever growing batch with a reduce capability.
 *
 * This can be used to keep action transactions that can be applied through
 * a set of reducers to a data set in order to transform it.
 *
 * Why 'Batch'? Because it's not really a `Stack`, since you cannot `pop`
 * items from it. Also not a `Log`, because it can be confused with the
 * logging utilities.
 *
 * @example <caption>Using Batch</caption>
 * class Component extends React.Component() {
 *   constructor() {
 *     super(...arguments);
 *     this.state = {
 *        batch: new Batch()
 *     }
 *   }
 *
 *   handleAction() {
 *     let {batch} = this.state;
 *     batch.add({
 *           type: 'set',
 *           path: ['foo'],
 *           value: 'bar'
 *        });
 *     this.setState({batch});
 *   }
 *
 *   render() {
 *      let data = this.state.batch.reduce(
 *            applyActionsToDataCallback,
 *            this.props.data
 *         );
 *
 *      return <Visualize data={data} />
 *   }
 * }
 *
 *
 */

class Batch {
  constructor() {
    const batch = [];

    this.add = this.add.bind(batch);
    this.reduce = this.reduce.bind(batch);
  }

  /**
   * Add an action to the batch.
   *
   * @param {Object} item
   */
  add(item) {
    // Remove previous if path is the same as current to minimize
    // number of actions
    let {path} = this[this.length - 1] || {};
    let hasEqualPaths = item && Array.isArray(path) &&
      Array.isArray(item.path) && path.join() === item.path.join();
    if (item.type === TransactionTypes.SET && hasEqualPaths) {
      this.pop();
    }

    this.push(item);
  };

  /**
   * Apply the given reducer function to the batch containing the provided data.
   *
   * This interface is exactly the same as the native Array.reduce function.
   *
   * @param {function(state, item)} callback - The callback function to use
   * @param {*} data - The initial state of the reduce function
   * @returns {any} - The resulting state of the reduce function
   */
  reduce(callback, data) {
    // Run at least once even if there are no actions in the batch
    if (this.length === 0) {
      return callback(data, {value: 'INIT'}, 0);
    }

    return this.reduce(callback, data);
  };

}

module.exports = Batch;
