const PHRASING_CONTENT = [
  "a",
  "strong",
  "em",
  "sub",
  "sup",
  "cite",
  "img",
  "i",
  "svg",
  "q",
  "b",
  "br"
];

const WRAPPER_COMPONENT = "Trans";

const IMPORT_SOURCE = "@lingui/macro";

// Constructs a new <Trans /> component given a jscodeshift API
class TransBuilder {
  constructor(j) {
    this.j = j;
    this.children = [];
  }

  withChildren(children) {
    this.children = children;

    return this;
  }

  build() {
    const openIdentifier = this.j.jsxIdentifier(WRAPPER_COMPONENT);
    const openingElement = this.j.jsxOpeningElement(openIdentifier);
    const endIdentifier = Object.assign({}, openIdentifier);

    return this.j.jsxElement(
      openingElement,
      this.j.jsxClosingElement(endIdentifier),
      this.children
    );
  }
}

const METHODS_TO_BIND = [
  "isTranslatable",
  "isLiteral",
  "isLiteralExpression",
  "isLiteralOrLiteralExpression",
  "wrap",
  "alreadyWrapped"
];

class TranslatableState {
  constructor(j) {
    this.j = j;

    this.modified = false;
    METHODS_TO_BIND.forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  isTranslatable(node) {
    // A JSXElement is translatable if its children are all literals and allowed elements containing
    // only literals and literal expressions
    return (
      node.children.length > 0 &&
      node.children.every(childNode => {
        return (
          this.isLiteralOrLiteralExpression(childNode) ||
          this.isAllowedElement(childNode)
        );
      }) &&
      !this.containsOnlyWhitespaceAndExpressions(node) &&
      !this.containsOnlyWhitespaceAndAllowedElement(node)
    );
  }

  containsOnlyWhitespaceAndExpressions(node) {
    const nonWhitespaceChildren = node.children.filter(childNode => {
      return !this.isLiteral(childNode) || childNode.value.trim() !== "";
    });

    return nonWhitespaceChildren.every(this.isLiteralExpression);
  }

  containsOnlyWhitespaceAndAllowedElement(node) {
    const nonWhitespaceChildren = node.children.filter(childNode => {
      return !this.isLiteral(childNode) || childNode.value.trim() !== "";
    });

    return (
      nonWhitespaceChildren.length === 1 &&
      this.isAllowedElement(nonWhitespaceChildren[0])
    );
  }

  wrap(path) {
    this.modified = true;
    const builder = new TransBuilder(this.j);
    path.node.children = [
      this.j.jsxText("\n"),
      builder.withChildren(path.node.children).build(),
      this.j.jsxText("\n")
    ];
  }

  isTransElement(node) {
    return (
      node.type === "JSXElement" &&
      node.openingElement.name.name === WRAPPER_COMPONENT
    );
  }

  alreadyWrapped(path) {
    let tmp = path.parentPath;
    while (tmp) {
      if (
        tmp.value.type === "JSXElement" &&
        tmp.value.children.some(this.isTransElement)
      ) {
        return true;
      }
      tmp = tmp.parentPath;
    }

    return false;
  }

  isAllowedMemberExpression(node) {
    return (
      node.object.type === "Identifier" &&
      node.property.type === "Identifier" &&
      node.property.name !== "children"
    );
  }

  isAllowedExpression(node) {
    return (
      node.type === "Literal" ||
      node.type === "TemplateLiteral" ||
      (node.type === "Identifier" && node.name !== "children") ||
      (node.type === "MemberExpression" && this.isAllowedMemberExpression(node))
    );
  }

  isLiteral(node) {
    return node.type === "Literal" || node.type === "JSXText";
  }

  isLiteralExpression(node) {
    return (
      node.type === "JSXExpressionContainer" &&
      this.isAllowedExpression(node.expression)
    );
  }

  isLiteralOrLiteralExpression(node) {
    return this.isLiteral(node) || this.isLiteralExpression(node);
  }

  isAllowedElement(node) {
    return (
      node.type === "JSXElement" &&
      PHRASING_CONTENT.indexOf(node.openingElement.name.name) >= 0 &&
      node.children.every(this.isLiteralOrLiteralExpression)
    );
  }
}

function transformToImportSyntax(j, root) {
  return (
    root.find(j.ImportDeclaration, {
      importKind: "value"
    }).length > 0
  );
}

function findFirstImport(j, root) {
  let target;

  root.find(j.ImportDeclaration).forEach(n => {
    if (!target) {
      target = n;
    }
  });

  return target;
}

function addTransImport(j, root) {
  if (transformToImportSyntax(j, root)) {
    const path = findFirstImport(j, root);
    if (path) {
      const importStatement = j.importDeclaration(
        [j.importSpecifier(j.identifier(WRAPPER_COMPONENT))],
        j.literal(IMPORT_SOURCE)
      );

      // If there is a leading comment, retain it
      // https://github.com/facebook/jscodeshift/blob/master/recipes/retain-first-comment.md
      const firstNode = root.find(j.Program).get("body", 0).node;
      const { comments } = firstNode;
      if (comments) {
        delete firstNode.comments;
        importStatement.comments = comments;
      }

      j(path).insertBefore(importStatement);
    }
  }
}

module.exports = function(file, api) {
  var j = api.jscodeshift; // alias the jscodeshift API
  var root = j(file.source); // parse JS code into an AST

  const state = new TranslatableState(j);

  const wrapNode = path => {
    if (state.alreadyWrapped(path)) {
      return;
    }

    state.wrap(path);
  };

  root.find(j.JSXElement, state.isTranslatable).forEach(wrapNode);

  if (state.modified) {
    addTransImport(j, root);

    // print
    return root.toSource();
  }

  // No changes
  return null;
};
