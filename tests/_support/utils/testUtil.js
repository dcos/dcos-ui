module.exports = {
  getSearchParameter(hash) {
    const queries = hash.split("?")[1];

    return queries.split("&").find(function(query) {
      return query.split("=")[0] === "q";
    });
  }
};
