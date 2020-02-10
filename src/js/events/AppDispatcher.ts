import { Dispatcher } from "flux";

const AppDispatcher = Object.assign(new Dispatcher(), {
  handleServerAction(action) {
    if (!action.type) {
      console.warn("Empty action.type: you likely mistyped the action.");
    }

    this.dispatch({ action });
  }
});

export default AppDispatcher;
