
## Component method order

When creating a component, there is a specific order to methods in order to quickly find what you're looking for.

1. Constructor
2. Lifecycle methods
3. on${methodName}Change
4. handle${methodName}Change
5. Custom component methods
6. Render methods

## Mixins

We are trying to move away from mixins. Do not create mixins.

## Alphabetize

Things to alphabetize:
* Imports
* Variable declarations
* JSX props. Example:
```js
return (
  <Modal
    className="modal modal-large"
    closeByBackgroundClick={false}
    open={true} />
);
```

* Keys in an object. Example:
```js
this.state = {
  disableSubmit: false,
  openModal: false,
  services: []
};
```

## API Requests

API Requests should go into Action files like [this](https://github.com/dcos/dcos-ui/blob/master/src/js/events/CosmosPackagesActions.js)

