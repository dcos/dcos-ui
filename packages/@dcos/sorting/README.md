# DC/OS Sorting

This project provides elementary sorting building blocks, which we use in the DC/OS UI.

## Example

```ts
import {
  sort,
  reverseComparator,
  compareNumber,
  compareString
} from "@dcos/sorting";

function sortMyTable(data: Node[], isReversed) {
  function getHostname(node: Node): string {
    if (!node.host) {
      return null;
    }

    return node.host.name;
  }

  function getCpuUsage(node: Node): number {
    return node.cpuUsage;
  }

  return sort<Node>(
    [compareString(getHostname), compareNumber(getCpuUsage)].map(
      comparator => (isReversed ? reverseComparator(comparator) : comparator)
    ),
    data
  );
}
```

## Combinators

### `sort(comparatorsArray)`

Sorts by the first comparator. If it is neutral (returns 0), sorts by the second. If it is neutral, ...

### `reverseComparator(comparatorFunction)`

Takes a comparator and returns a new comparator that does the opposite

## Comparators

### `compareString(getter)`

Returns a function that uses the getter to get the values to be compared as string. It expects the values to be retrieved to be of type string, otherwise unexpected behaviour may occur.

### `compareNumber(getter)`

Returns a function that uses the getter to get the values to be compared as number. It expects the values to be retrieved to be of type number, otherwise unexpected behaviour may occur.

## When to add a new comparator

If you have a comparator which you want to use in DC/OS UI please make sure to add it here if it resembles a fundamental type. Examples for this would be number, string, health status, IP. Non-examples would be a node, a task or a service.
