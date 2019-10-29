import DSLFilterTypes from "../../DSLFilterTypes";
import DSLFilter from "../../DSLFilter";
import DSLCombinerTypes from "../../DSLCombinerTypes";
import SearchDSL from "../SearchDSL";

// Handles 'attrib:?'
class AttribFilter extends DSLFilter {
  filterCanHandle(filterType, filterArguments) {
    return (
      filterType === DSLFilterTypes.ATTRIB && filterArguments.label === "attrib"
    );
  }
  filterApply(resultset, filterType, filterArguments) {
    return resultset.filter(item => {
      return item.attrib.indexOf(filterArguments.text) !== -1;
    });
  }
}

// Handles 'text'
class FuzzyTextFilter extends DSLFilter {
  filterCanHandle(filterType) {
    return filterType === DSLFilterTypes.FUZZY;
  }
  filterApply(resultset, filterType, filterArguments) {
    return resultset.filter(item => {
      return item.text.indexOf(filterArguments.text) !== -1;
    });
  }
}

// Handles '"text"'
class ExactTextFilter extends DSLFilter {
  filterCanHandle(filterType) {
    return filterType === DSLFilterTypes.EXACT;
  }
  filterApply(resultset, filterType, filterArguments) {
    return resultset.filter(item => {
      return item.text === filterArguments.text;
    });
  }
}

let thisFilters, thisMockResultset;

describe("SearchDSL", function() {
  describe("Metadata", function() {
    describe("Filters (Operands)", function() {
      it("parses fuzzy text", function() {
        const expr = SearchDSL.parse("fuzzy");
        expect(expr.ast.filterType).toEqual(DSLFilterTypes.FUZZY);
        expect(expr.ast.filterParams.text).toEqual("fuzzy");
      });

      it("parses exact text", function() {
        const expr = SearchDSL.parse('"exact string"');
        expect(expr.ast.filterType).toEqual(DSLFilterTypes.EXACT);
        expect(expr.ast.filterParams.text).toEqual("exact string");
      });

      it("parses attributes", function() {
        const expr = SearchDSL.parse("attrib:value");
        expect(expr.ast.filterType).toEqual(DSLFilterTypes.ATTRIB);
        expect(expr.ast.filterParams.text).toEqual("value");
        expect(expr.ast.filterParams.label).toEqual("attrib");
      });
    });

    describe("Combiners (Operators)", function() {
      it("uses AND operator by default", function() {
        const expr = SearchDSL.parse("text1 text2");
        expect(expr.ast.combinerType).toEqual(DSLCombinerTypes.AND);
      });

      it("uses OR operator", function() {
        const expr = SearchDSL.parse("text1, text2");
        expect(expr.ast.combinerType).toEqual(DSLCombinerTypes.OR);
      });

      it("uses OR shorthand operator on attrib", function() {
        // NOTE: attrib:value1,value2 becomes -> attrib:value1, attrib:value2
        const expr = SearchDSL.parse("attrib:value1,value2");
        expect(expr.ast.combinerType).toEqual(DSLCombinerTypes.OR);
        expect(expr.ast.children[0].filterType).toEqual(DSLFilterTypes.ATTRIB);
        expect(expr.ast.children[0].filterParams.text).toEqual("value1");
        expect(expr.ast.children[0].filterParams.label).toEqual("attrib");
        expect(expr.ast.children[1].filterType).toEqual(DSLFilterTypes.ATTRIB);
        expect(expr.ast.children[1].filterParams.text).toEqual("value2");
        expect(expr.ast.children[1].filterParams.label).toEqual("attrib");
      });

      it("handles OR shorthand + OR with other operands", function() {
        // NOTE: attrib:value1,value2 becomes -> attrib:value1, attrib:value2
        const expr = SearchDSL.parse("attrib:value1,value2, foo");
        expect(expr.ast.combinerType).toEqual(DSLCombinerTypes.OR);

        expect(expr.ast.children[0].combinerType).toEqual(DSLCombinerTypes.OR);
        expect(expr.ast.children[0].children[0].filterType).toEqual(
          DSLFilterTypes.ATTRIB
        );
        expect(expr.ast.children[0].children[0].filterParams.text).toEqual(
          "value1"
        );
        expect(expr.ast.children[0].children[0].filterParams.label).toEqual(
          "attrib"
        );
        expect(expr.ast.children[0].children[1].filterType).toEqual(
          DSLFilterTypes.ATTRIB
        );
        expect(expr.ast.children[0].children[1].filterParams.text).toEqual(
          "value2"
        );
        expect(expr.ast.children[0].children[1].filterParams.label).toEqual(
          "attrib"
        );

        expect(expr.ast.children[1].filterType).toEqual(DSLFilterTypes.FUZZY);
        expect(expr.ast.children[1].filterParams.text).toEqual("foo");
      });

      it("populates children", function() {
        const expr = SearchDSL.parse("text1 text2");
        expect(expr.ast.children[0].filterType).toEqual(DSLFilterTypes.FUZZY);
        expect(expr.ast.children[0].filterParams.text).toEqual("text1");
        expect(expr.ast.children[1].filterType).toEqual(DSLFilterTypes.FUZZY);
        expect(expr.ast.children[1].filterParams.text).toEqual("text2");
      });
    });

    describe("Complex expressions", function() {
      it("nests operations in correct order", function() {
        const expr = SearchDSL.parse(
          "text1 text2, (text3 (text4 text5), text6)"
        );

        // .       : [text1 text2] OR [(text3 (text4 text5), text6)]
        expect(expr.ast.combinerType).toEqual(DSLCombinerTypes.OR);

        // .0      : [text1] AND [text2]
        expect(expr.ast.children[0].combinerType).toEqual(DSLCombinerTypes.AND);

        // .0.0    : text1
        expect(expr.ast.children[0].children[0].filterType).toEqual(
          DSLFilterTypes.FUZZY
        );
        expect(expr.ast.children[0].children[0].filterParams.text).toEqual(
          "text1"
        );

        // .0.1    : text2
        expect(expr.ast.children[0].children[1].filterType).toEqual(
          DSLFilterTypes.FUZZY
        );
        expect(expr.ast.children[0].children[1].filterParams.text).toEqual(
          "text2"
        );

        // .1      : [text3 (text4 text5)] OR [text6]
        expect(expr.ast.children[1].combinerType).toEqual(DSLCombinerTypes.OR);

        // .1.0    : [text3] AND [text4 text5]
        expect(expr.ast.children[1].children[0].combinerType).toEqual(
          DSLCombinerTypes.AND
        );

        // .1.0.0  : text3
        expect(expr.ast.children[1].children[0].children[0].filterType).toEqual(
          DSLFilterTypes.FUZZY
        );
        expect(
          expr.ast.children[1].children[0].children[0].filterParams.text
        ).toEqual("text3");

        // .1.0.1  : [text4] AND [text5]
        expect(
          expr.ast.children[1].children[0].children[1].combinerType
        ).toEqual(DSLCombinerTypes.AND);

        // .1.0.1.0: text4
        expect(
          expr.ast.children[1].children[0].children[1].children[0].filterType
        ).toEqual(DSLFilterTypes.FUZZY);
        expect(
          expr.ast.children[1].children[0].children[1].children[0].filterParams
            .text
        ).toEqual("text4");

        // .1.0.1.1: text5
        expect(
          expr.ast.children[1].children[0].children[1].children[1].filterType
        ).toEqual(DSLFilterTypes.FUZZY);
        expect(
          expr.ast.children[1].children[0].children[1].children[1].filterParams
            .text
        ).toEqual("text5");

        // .1.1    : text6
        expect(expr.ast.children[1].children[1].filterType).toEqual(
          DSLFilterTypes.FUZZY
        );
        expect(expr.ast.children[1].children[1].filterParams.text).toEqual(
          "text6"
        );
      });
    });

    describe("Token positions", function() {
      it("tracks location of fuzzy text", function() {
        const expr = SearchDSL.parse("fuzzy");
        expect(expr.ast.position).toEqual([[0, 5]]);
      });

      it("tracks location of exact text", function() {
        const expr = SearchDSL.parse('"exact string"');
        expect(expr.ast.position).toEqual([[0, 14]]);
      });

      it("tracks location of attrib", function() {
        const expr = SearchDSL.parse("attrib:value");
        expect(expr.ast.position).toEqual([[0, 7], [7, 12]]);
      });

      it("tracks location of attrib with multi values", function() {
        const expr = SearchDSL.parse("attrib:value1,value2");
        expect(expr.ast.children[1].position).toEqual([[0, 7], [14, 20]]);
      });
    });

    describe("Filtering", function() {
      beforeEach(function() {
        thisFilters = [
          new AttribFilter(),
          new FuzzyTextFilter(),
          new ExactTextFilter()
        ];

        thisMockResultset = [
          { text: "some test string", attrib: ["a", "b"] },
          { text: "repeating test string", attrib: ["b", "c"] },
          { text: "some other string", attrib: ["c", "d"] }
        ];
      });

      it("filters by fuzzy match", function() {
        const expr = SearchDSL.parse("test");

        expect(expr.filter(thisFilters, thisMockResultset)).toEqual([
          { text: "some test string", attrib: ["a", "b"] },
          { text: "repeating test string", attrib: ["b", "c"] }
        ]);
      });

      it("filters by exact match", function() {
        const expr = SearchDSL.parse('"some other string"');

        expect(expr.filter(thisFilters, thisMockResultset)).toEqual([
          { text: "some other string", attrib: ["c", "d"] }
        ]);
      });

      it("filters by attribute", function() {
        const expr = SearchDSL.parse("attrib:b");

        expect(expr.filter(thisFilters, thisMockResultset)).toEqual([
          { text: "some test string", attrib: ["a", "b"] },
          { text: "repeating test string", attrib: ["b", "c"] }
        ]);
      });

      it("combines with OR operator with multi-value attr", function() {
        const expr = SearchDSL.parse("attrib:a,b");

        expect(expr.filter(thisFilters, thisMockResultset)).toEqual([
          { text: "some test string", attrib: ["a", "b"] },
          { text: "repeating test string", attrib: ["b", "c"] }
        ]);
      });

      it("combines with OR operator multiple attr", function() {
        const expr = SearchDSL.parse("attrib:a, attrib:b");

        expect(expr.filter(thisFilters, thisMockResultset)).toEqual([
          { text: "some test string", attrib: ["a", "b"] },
          { text: "repeating test string", attrib: ["b", "c"] }
        ]);
      });

      it("combines with AND operator multiple attr", function() {
        const expr = SearchDSL.parse("attrib:a attrib:b");

        expect(expr.filter(thisFilters, thisMockResultset)).toEqual([
          { text: "some test string", attrib: ["a", "b"] }
        ]);
      });

      it("combines with AND operator multiple attr", function() {
        const expr = SearchDSL.parse("attrib:a attrib:b");

        expect(expr.filter(thisFilters, thisMockResultset)).toEqual([
          { text: "some test string", attrib: ["a", "b"] }
        ]);
      });
    });
  });
});
