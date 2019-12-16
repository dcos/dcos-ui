import React from "react";

import RequestErrorMsg from "#SRC/js/components/RequestErrorMsg";

import RepositoriesPage from "./RepositoriesPage";

const RepositoriesError = () => {
  return (
    <RepositoriesPage>
      <RequestErrorMsg />
    </RepositoriesPage>
  );
};

export default RepositoriesError;
