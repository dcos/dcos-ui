import internalLoadBalancingReducer from "./submodules/internal-load-balancing/Reducer";

module.exports = (state = {}, action) => ({
  internalLoadBalancing: internalLoadBalancingReducer(
    state.internalLoadBalancing,
    action
  ),
});
