/* Description: Parses and generates AST + Combined Filter Function from a    */
/*              common filter description language.                           */

%{
var DSLParserUtil = require('../../js/utils/DSLParserUtil');
var Merge = DSLParserUtil.Merge;
var Operator = DSLParserUtil.Operator;
%}

/* lexical grammar */
%lex

%%
\s+                                                 return 'WS';
[,](?=\S)                                           return 'TIGHT_COMMA'
\s*[,]\s                                            return 'COMMA';
[a-z0-9_-]+\:          yytext=yytext.slice(0,-1);   return 'LABEL';
\"(?:[^\"\\]|\\.)*?\"  yytext=yytext.slice(1,-1);   return 'STRING';
\'(?:[^\'\\]|\\.)*?\'  yytext=yytext.slice(1,-1);   return 'STRING';
[^\s\(\)\:,]+                                       return 'LITERAL';
"("                                                 return '(';
")"                                                 return ')';
<<EOF>>                                             return 'EOF';

/lex /* operator associations and precedence */

%left 'TIGHT_COMMA' 'COMMA' 'WS'
%start expressions

%% /* language grammar */

expressions /* Root expression with termination condition */
    : e EOF
        {return $1;}
    ;

lv  /* Label value(s) as an array */
    : LITERAL
        {$$ = [{text:yytext, start:@1.first_column, end:@1.last_column}];}
    | STRING
        {$$ = [{text:yytext, start:@1.first_column, end:@1.last_column}];}
    | lv TIGHT_COMMA lv
        {$$ = [].concat($1, $3);}
    ;

e   /* Operators */
    : e WS e
        {$$ = Merge.and($1, $3);}
    | e COMMA e
        {$$ = Merge.or($1, $3);}

    | '(' e ')'
        {$$ = $2;}

    /* Simple operands */
    | LITERAL
        {$$ = Operator.fuzzy(yytext, @1.first_column, @1.last_column);}
    | STRING
        {$$ = Operator.exact(yytext, @1.first_column, @1.last_column);}

    /* Label operand */
    | LABEL lv
        /* NOTE: We expand the comma-separated list of values as individual
                 label:value tokens, combined with an OR operator */
        {$$ = $2.reduce(function (last_fn, v) {
            var fn = Operator.attribute($1, v.text, @1.first_column, @1.last_column, v.start, v.end);
            if (last_fn) {
                return Merge.or(last_fn, fn);
            } else {
                return fn;
            }
        }, null);}

    /* Label value */
    | LABEL
        {$$ = yytext;}
    ;
