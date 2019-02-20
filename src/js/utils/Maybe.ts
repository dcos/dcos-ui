/*
  `Maybe` can help you with optional arguments, error handling, and records
  with optional fields.

  N.B. we're using a curried last-arg-style, but typescript is not yet able
  to infer the types for generic type variables then. Instead it actually lies
  about the type to be infered being "{}". See
  https://github.com/Microsoft/TypeScript/issues/30134.
*/

///////////////////////////////////////////////////////////////////////////////
//                           TYPES AND CONSTRUCTORS                          //
///////////////////////////////////////////////////////////////////////////////

/*
  Represent values that may or may not exist. It can be useful if you have a
  field that is only filled in sometimes. Or if a function takes a value
  sometimes, but does not absolutely need it.

      type Person = {
        name: string;
        age: Maybe<number>;
      }

      const sue = { name: "Sue", age: Nothing }
      const tom = { name: "Tom", age: Just(42) }

 */
type Maybe<Value> = Just<Value> | Nothing;

interface Nothing {
  readonly tag: "Nothing";
}

interface Just<Value> {
  readonly tag: "Just";
  readonly value: Value;
}

const Just = <Value>(value: Value): Maybe<Value> => ({ tag: "Just", value });

const Nothing: Nothing = { tag: "Nothing" };

///////////////////////////////////////////////////////////////////////////////
//                                 FUNCTIONS                                 //
///////////////////////////////////////////////////////////////////////////////

/*
  Convenience function to turn a value that might be undefined into a maybe.

      const unsafeResult = ["muffins", "chocolate"].find(a => a == "cake")
      const maybeCake = Maybe.fromValue(unsafeResult)
      // typeof maybeCake => Maybe<string>

*/
type fromValue = <Value>(value: Value | undefined) => Maybe<Value>;
const fromValue: fromValue = value =>
  value !== undefined ? Just(value) : Nothing;

/*
  Transform a `Maybe` value with a given function:

      Maybe.map(Math.sqrt)(Just(9)) === Just(3)
      Maybe.map(string => string.length)(Just("hallo")) === Just(5)

*/

type map = <A, B = A>(fn: (value: A) => B) => (maybe: Maybe<A>) => Maybe<B>;
const map: map = fn => maybe => {
  switch (maybe.tag) {
    case "Just":
      return Just(fn(maybe.value));
    case "Nothing":
      return Nothing;
  }
};

/*
  Provide a default value, turning an optional value into a normal
  value.

      import { pipe } from "rxjs"

      const ageInWords: (age: Maybe<number>) => string =
        pipe(
          Maybe.map(age => `is ${age} years old`),
          Maybe.withDefault("unknown")
        )
      }

*/
type withDefault = <A>(defaultValue: A) => (maybe: Maybe<A>) => A;
const withDefault: withDefault = defaultValue => maybe => {
  switch (maybe.tag) {
    case "Just":
      return maybe.value;

    case "Nothing":
      return defaultValue;
  }
};

/*
  A convenience function to fold (or unpack) a Maybe.

      Maybe.fold({
        Just: x =>
          <Person age={x} />
        Nothing:
          <FallbackMsg />
      })(person.age)

*/
type fold = <A, R>(
  config: { Just: (a: A) => R; Nothing: R }
) => (maybe: Maybe<A>) => R;
const fold: fold = ({ Just: onJust, Nothing: onNothing }) => maybe => {
  switch (maybe.tag) {
    case "Just":
      return onJust(maybe.value);

    case "Nothing":
      return onNothing;
  }
};

/*
  Chain together computations that may fail. It is helpful to see its
  definition:

      const andThen: andThen = callback => maybe => {
        switch (maybe.tag) {
          case "Just":    return callback(maybe.value);
          case "Nothing": return Nothing;
        }
      };

  We only continue with the callback if things are going well. For
  example, say you need to get entries in an array based on the value of
  indices of other arrays:

      const arrayOne = [2, 0, 1];
      const arrayTwo = [0, 1];
      const arrayThree = [42];

      type getIndex = (array: string[]) => (index: number) => Maybe<string>
      const getIndex : getIndex = array => index => {
        const value = array[index]
        return value ? Just(value) : Nothing
      }

      import { pipe } from 'rxjs'
      const computeValue = pipe(
        Maybe.andThen(getIndex(arrayOne)),
        Maybe.andThen(getIndex(arrayTwo)),
        Maybe.andThen(getIndex(arrayThree))
      )

      console.log(computeValue(Just(1))) // => Just 42
          // it is given Just(1)
          // andThen it retrieves the 1st index of arrayOne => 0
          // andThen it retrieves the 0th index of arrayTwo => 0
          // andThen it retrieves the 0th index of arrayThree => 42

      console.log(computeValue(Just(0))) // => Nothing
          // it is given Just(0)
          // andThen it retrieves the 0th index of arrayOne => 2
          // andThen it retrieves the 1st index of arrayTwo => Nothing
          // next steps are omitted and Nothing is returned immediately.

  If any operation in the chain fails, the computation will short-circuit and
  result `Nothing`. This may come in handy if we wanted to skip e.g. some
  network requests.
*/
type andThen = <A, B>(fn: (v: A) => Maybe<B>) => (maybe: Maybe<A>) => Maybe<B>;
const andThen: andThen = callback => maybe => {
  switch (maybe.tag) {
    case "Just":
      return callback(maybe.value);
    case "Nothing":
      return Nothing;
  }
};

// Exporting only the type contructors and a `Maybe` bundling the functions,
// so application code is nudged to use the functions fully qualified.
const Maybe = {
  andThen,
  fold,
  fromValue,
  map,
  withDefault
};
export { Just, Nothing, Maybe };
