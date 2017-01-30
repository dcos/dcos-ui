## Unversioned

## v0.1.8 - 20-01-2017
### Added
- Adding `Type.clone()` support for enabling runtime customizations
- Adding `errorMessages` as a customizable property in the `.clone` function
- Adding support for functions as error message
- Adding `type` and `variables` to the error message

### Fixed
- Accepting webpack queries to configure generator options
- Adding eslint rules to the project
- Using double brackets for error message variables (ex: `Missing {{name}}`)
- Extracted all error messages to a separate constants file

## v0.1.7 - 10-01-2017
### Fixed
- Using `new RegExp('...')` instead of `/.../` to properly escape regexp strings


## v0.1.6 - 02-12-2016
### Fixed
- The path of missing property errors now points to the actual missing field.
- This feature is controlled through the `missingPropertiesOnTheirPath` option flag


## v0.1.5 - 28-11-2016
### Fixed
- Fixed a bug that incorrectly resolved supertype name
- Renaming `ctx` to `context` in the internal variables


## v0.1.4 - 28-11-2016
### Added
- Exposing error messages, making them overridable by the user

### Fixed
- Handling some cases that ended up creating validators with `null` name
- Assuming `null` not to be a valid object value
- Re-arranging tests code


## v0.1.3 - 21-11-2016
### Added
- Introducing compiler flags
- Setting `patternPropertiesAreOptional: true` by default, so empty objects with pattern properties does not raise an error


## v0.1.2 - 21-11-2016
### Added
- Hiding all dynamically-generated types in an internal object and exposing only types present in the raml file

### Fixed
- Making the `path` and `message` properties of the `RAMLError` enumerable so they can be compared with `deepEqual`
