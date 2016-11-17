
## Components

### Method Order

When creating a component, there is a specific order to methods in order to quickly find what you're looking for.

1. Constructor
2. Lifecycle methods
3. Event Handlers
  1. on{Subject}{Event}
  2. handle{Subject}{Event}
4. Custom component methods
5. Render methods

### Method Naming

**Event Callbacks**

We split events into two groups. Server and User triggered events. Server events are prefixed with `on` and User events are prefixed with `handle`.

**Examples:**
* `onMarathonStoreChange` - `MarathonStore` is the subject, while `Change` is the Event.
* `onVisibilityChange` - Triggered when the browser tab becomes inactive
* `handleButtonClick` - Handles click on a button
* `handleImageHover` – Handles the user hovering an image

**Render Methods**

Typically when writing a `#render` method which renders a few bits, split the different bits into smaller ones, always prefixed with `get`.

**Example:**
```js
class Foo {
  ...

  render () {
    return (
      <div>
        {this.getBarGraph()}
        {this.getFilterBar()}
        {this.getTable()}
      </div>
    );
  }
}
```

### Binding Callbacks

Avoid binding callbacks each time they're used unless necessary. Instead bind all methods at initialization.

**Do**
```js
const METHODS_TO_BIND = [
  'handleUserClick'
];

class Foo {
  constructor () {
    METHODS_TO_BIND.forEach((method) => {
      this[method] = this[method].bind(this);
    });
  }

  handleUserClick() { ... }

  render() {
    return (
      <a onClick={this.handleUserClick}>A link</a>
    );
  }
}
```
**Don't**
```js
class Foo {
  handleUserClick() { ... }

  render() {
    return (
      <a onClick={this.handleUserClick.bind(this)}>A link</a>
    );
  }
}
```

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

API Requests should go into an Action file like [this](https://github.com/dcos/dcos-ui/blob/master/src/js/events/CosmosPackagesActions.js)

## CSS

Please review our [CSS styleguide](https://github.com/dcos/dcos-ui-common/tree/master/stylelint-config-dcos).
