import * as React from "react";
import sort from "array-sort";
import { Link } from "react-router";
import { TextCell } from "@dcos/ui-kit";
import Secret from "../../structs/Secret";

export const secretPathRenderer = (data: Secret) => {
  const secretPath = encodeURIComponent(data.getPath());

  return (
    <TextCell>
      <Link className="table-cell-link-primary" to={`/secrets/${secretPath}`}>
        {data.getPath()}
      </Link>
    </TextCell>
  );
};

const compareByPath = (a: Secret, b: Secret) => {
  return a.getPath().toLowerCase().localeCompare(b.getPath().toLowerCase());
};

const comparators = [compareByPath];
export const pathSorter = (data: Secret[], sortDirection: "ASC" | "DESC") => {
  const reverse = sortDirection !== "ASC";

  return sort(data, comparators, { reverse });
};
