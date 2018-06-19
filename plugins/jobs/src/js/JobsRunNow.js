/* eslint-disable no-unused-vars */
import React from "react";
/* eslint-enable no-unused-vars */

import { graphqlObservable } from "data-service";
import gql from "graphql-tag";

import defaultSchema from "./data/JobModel";

const runNowJobMutation = gql`
  mutation {
    runJob(id: $id) {
      id
    }
  }
`;

const runNowJobGraphql = id => {
  return graphqlObservable(runNowJobMutation, defaultSchema, id);
};

export default function(id) {
  return {
    label: "Run Now",
    onItemSelect() {
      runNowJobGraphql({ id }).subscribe();
    }
  };
}
