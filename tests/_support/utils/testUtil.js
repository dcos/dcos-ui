module.exports = {
  getSearchParameter(hash) {
    const queries = hash.split("?")[1];

    return queries.split("&").find((query) => query.split("=")[0] === "q");
  },
  getVisibleTableRows($tableRows) {
    return $tableRows
      .toArray()
      .filter(
        (tableRow) => global.getComputedStyle(tableRow).display !== "none"
      );
  },
};
