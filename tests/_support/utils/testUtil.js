module.exports = {
  getSearchParameter(hash) {
    const queries = hash.split("?")[1];

    return queries.split("&").find(query => {
      return query.split("=")[0] === "q";
    });
  },
  getVisibleTableRows($tableRows) {
    return $tableRows.toArray().filter(tableRow => {
      return global.getComputedStyle(tableRow).display !== "none";
    });
  }
};
