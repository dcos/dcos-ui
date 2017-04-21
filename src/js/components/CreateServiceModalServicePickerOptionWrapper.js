import React from "react";

function OptionsWrapper({ children }) {
  let columnClasses = "column-12 column-small-6";
  let containerClasses =
    "column-12 column-small-10 column-small-offset-1 column-large-8 column-large-offset-2";

  // If the children are divisible evenly by 3, render 3 columns.
  // Otherwise default to 2 columns.
  if (children.length % 3 === 0) {
    columnClasses = "column-12 column-small-4";
    containerClasses = "column-12 column-medium-10 column-medium-offset-1";
  }

  const clonedChildren = React.Children.map(children, function(child) {
    return React.cloneElement(child, { columnClasses });
  });

  return (
    <div className={containerClasses}>
      <div className="row panel-grid">
        {clonedChildren}
      </div>
    </div>
  );
}

module.exports = OptionsWrapper;
