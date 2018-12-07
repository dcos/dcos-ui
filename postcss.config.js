module.exports = ({ env }) => {
  const shouldOptimize = env === "production" ? {} : false;

  return {
    parser: false,
    plugins: {
      autoprefixer: true,
      "postcss-merge-rules": shouldOptimize,
      "postcss-discard-duplicates": shouldOptimize,
      "postcss-merge-longhand": shouldOptimize,
      "postcss-discard-comments": shouldOptimize
    }
  };
};
