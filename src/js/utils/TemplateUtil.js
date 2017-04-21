import React from "react";

const TemplateUtil = {
  /**
   * Defines each item in children as a template child of the parent class.
   *
   * As well as adding the component to its parent namespace, this method
   * tracks each template item together with its reference on
   *
   * @param {React.Component} Parent
   * @param {React.Children} children
   */
  defineChildren(Parent, children) {
    Object.assign(Parent, children);

    if (Parent.templateItems == null) {
      Parent.templateItems = children;
    } else {
      Object.assign(Parent.templateItems, children);
    }
  },

  /**
   * Gets all types of template children for a given component.
   *
   * @return {Array} a list of children.
   */
  getTypesOfTemplateChildren({ templateItems = {} }) {
    return Object.values(templateItems);
  },

  /**
   * Get all children of an instance which are not template children.
   *
   * @param {React.Component} T
   * @param {React.Children} children
   *
   * @return {Array} a list of children.
   */
  filterTemplateChildren(T, children) {
    const types = this.getTypesOfTemplateChildren(T);

    return React.Children
      .toArray(children)
      .filter(child => !types.includes(child.type));
  },

  /**
   * Returns the first child with
   *
   * @param {React.Children} children
   * @param {React.Component} T
   *
   * @return {React.Component} a single child of type <T>.
   */
  getChildOfType(children, T) {
    return React.Children.toArray(children).find(child => child.type === T);
  }
};

module.exports = TemplateUtil;
