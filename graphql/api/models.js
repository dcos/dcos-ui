import endpointsConnector from '../data';
import createStore from '../store';

import Agents from './agents/models';
import Frameworks from './frameworks/models';
import Groups from './groups/models';
import Tasks from './tasks/models';

export default function models(authToken) {
  // Create new instances of data loaders for the store
  const endpoints = endpointsConnector(authToken);
  // Store is where we process and cache data like e.g. merged from marathon
  // and mesos. The store allows us to lazily process the data only once
  // for optimized lookups and minimal processing and is accessible by all
  // resolvers.
  const store = createStore(endpoints);

  return {
    Agents: new Agents({ store }),
    Frameworks: new Frameworks({ store }),
    Groups: new Groups({ store }),
    Tasks: new Tasks({ store })
  };
}
