import React from "react";

const FormRow = ({ children }) => {
  return (
    <div className="form-row row">
      {children}
    </div>
  );
};

module.exports = FormRow;
