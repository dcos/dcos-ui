/*eslint-disable */
import fs from 'fs';
import {graphql} from 'graphql';
import {introspectionQuery, printSchema} from 'graphql/utilities';
import path from 'path';

import schema from '../api';

const jsonFile = path.join(__dirname, '../exports/schema.json');
const graphQLFile = path.join(__dirname, '../exports/schema.graphql');
/*

Inspect our Schema and return it compiled in JSON format for Relay Clients
to make use of when compiling their queries.

We use this schema.json to compile Relay.QL`...` statements on React Components
by using the "babel-relay-plugin".

This provides a static compile time contract between server and client where
compilation breaks if the contract is broken.

 */
async function updateSchema() {
  try {
    const json = await graphql(schema, introspectionQuery);

    fs.writeFileSync(jsonFile, JSON.stringify(json, null, 2));
    fs.writeFileSync(graphQLFile, printSchema(schema));

    console.log('Schema has been regenerated');
  } catch (err) {
    console.error(err.stack);
  }
}

// Run the function directly, if it's called from the command line.
// Have to go up the tree 2 levels because we have the transform file 'updateSchema'
if (!module.parent.parent) {
  updateSchema();
}

module.exports = updateSchema;
