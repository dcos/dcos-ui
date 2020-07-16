/*
  Set proxy options
 */
module.exports = {
  "*": {
    target: process.env.CLUSTER_URL,
    secure: false,
  },
};
