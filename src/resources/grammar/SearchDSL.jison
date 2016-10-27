/* description: Parses end executes mathematical expressions. */

%{
const {merge_and, merge_or, op_fuzzy, op_attrib, op_exact}
    = require('../../js/utils/DSLParserUtil');
%}

/* lexical grammar */
%lex

%%
\s+                                                 return 'WS';
\s*[,]\s*                                           return 'COMMA';
[a-z0-9_-]+\:          yytext=yytext.slice(0,-1);   return 'LABEL';
\"(?:[^\"\\]|\\.)*?\"  yytext=yytext.slice(1,-1);   return 'STRING';
\'(?:[^\'\\]|\\.)*?\'  yytext=yytext.slice(1,-1);   return 'STRING';
[^\s\(\)\:,]+                                       return 'LITERAL';
"("                                                 return '(';
")"                                                 return ')';
<<EOF>>                                             return 'EOF';

/lex /* operator associations and precedence */

%left 'COMMA' 'WS'
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
    | lv COMMA lv
        {$$ = [].concat($1, $3);}
    ;

e   /* Operators */
    : e WS e
        {$$ = merge_and($1, $3);}
    | e COMMA e
        {$$ = merge_or($1, $3);}

    | '(' e ')'
        {$$ = $2;}

    /* Simple operands */
    | LITERAL
        {$$ = op_fuzzy(yytext, @1.first_column, @1.last_column);}
    | STRING
        {$$ = op_exact(yytext, @1.first_column, @1.last_column);}

    /* Label operand */
    | LABEL lv
        /* NOTE: We expand the comma-separated list of values as individual
                 label:value tokens, combined with an OR operator */
        {$$ = $2.reduce(function (last_fn, v) {
            let fn = op_attrib($1, v.text, @1.first_column, @1.last_column, v.start, v.end);
            if (last_fn) {
                return merge_or(last_fn, fn);
            } else {
                return fn;
            }
        }, null);}

    /* Label value */
    | LABEL
        {$$ = yytext;}
    ;
