## This PR introduces the GraphQL service to DCOS-UI.

I chose to write the schemas using [graphql-tools](http://dev.apollodata.com/tools/graphql-tools/index.html) by Apollostack. This allows us to write the schemas as pure GraphQL schemas instead of JS specific objects as provided by [graphql-js](https://github.com/graphql/graphql-js).

Several layers of indirection have been introduced in order to isolate concerns.

1. **Query layer with resolvers** for each field. This is the exposed API with all the resolvable schema fields. Found in `/api` directory.
2. **Models** A model fetches data from one or more stores and may have to reduce or filter it before responding to the resolver. Resolvers talk to models in order to get connected data such as an Agent's tasks. Found in `/api` directory.
3. **Stores** A store processes backend responses into meaningful data. Such as building a Map of Tasks from both the `/mesos/master/state` endpoint and the `/marathon/v2/groups` endpoint. Models talk to stores to get processed data. A store only has to process data once before it is available to all models. Found in `/stores` directory.
4. **Data** This is where data is fetched. For running in the client, this data will be fetched from our existing Actions files. On the server, this data will be fetched from cluster endpoints and for a mock situation, this data comes from mock files. When fetching data from cluster endpoints, we currently use [DataLoader](https://github.com/facebook/dataloader) as a per-request cache. Found in `/data` directory.

### Query -> resolver -> models -> store -> data -> [mock | client-side | cluster-endpoints]

**New instances of models, stores and data loaders are created on every request**

At any time, one of those pieces can alter its internals, whether it be how the data is fetched or how it is preprocessed for models.

## Getting started
1. `npm i`
2. `npm config set cluster [YOUR HTTP CLUSTER ENDPOINT]`
3. If auth is enabled on the cluster, log in and copy the `dcos-acs-auth-cookie`.
4. `npm config set dcosauthtoken [dcos-acs-auth-cookie as copied from above]`
5. `npm run graphql` or for mocked responses `npm run graphql-mock`
6. Navigate browser to [http://localhost:4000](http://localhost:4000). This will open a GraphiQL session where you can now play with queries.

### Watch for interactive example - [Link to video](https://cl.ly/3T1134292d2T/Screen%20Recording%202016-11-10%20at%2002.02%20PM.gif)

Example Query to paste in:
```
query Cluster {
  group(id: "/") {
    id
    contents {
      edges {
        node {
          __typename
          ... on Framework {
            id
          }
          ... on Application {
            id
            tasks {
              edges {
                node {
                  id
                }
              }
            }
          }
          ... on Group {
            id
          }
        }
      }
    }
  }
}
```
