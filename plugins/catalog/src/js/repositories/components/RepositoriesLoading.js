import React from "react";

import Loader from "#SRC/js/components/Loader";

import RepositoriesPage from "./RepositoriesPage";

const RepositoriesLoading = () => {
  return (
    <RepositoriesPage>
      <Loader />
    </RepositoriesPage>
  );
};

export default RepositoriesLoading;
