# stream-try-catch

  a try-catch like library for stream pipelines

[![build status](https://secure.travis-ci.org/jeromew/stream-try-catch.png)](http://travis-ci.org/jeromew/stream-try-catch)

## Example

  try catch errors on a pipeline

```js
var _try = require('stream-try-catch').try;

// pipe streams
var stream = _try(streamA).pipe(streamB).pipe(streamC).catch(onerror);

// regular piping takes place
assert(stream == streamC);

// propagates errors
var onerror = function(err) {
  // called three times
});

streamA.emit('error', new Error);
streamB.emit('error', new Error);
streamC.emit('error', new Error);
```

## API

### try(src)

Begin the setup of try/catch sequence on a pipeline

Use with
```js
var _try = require('stream-try-catch').try;
```

Any call to try(src).pipe(dest, opt) will automatically

 * forward all 'error' events from src to dest.
 * make sure dest is instrumented in the same way (just as if try(dest) had been called)

you can catch errors on the pipeline either by adding a classic on('error', onerror) on the last stream of the pipeline or use the syntactic sugar `catch`
```js
try(streamA).pipe(streamB).pipe(streamC).catch(onerror);
```

This will :
 * forward all errors from streamA, streamB and streamC to onerror
 * close the try/catch block

For example, in

```js
var stream = try(streamA).pipe(streamB).catch(onerror).pipe(streamC);
```

the errors from A and B will bubble to `onerror` but they will not bubble to streamC.


### catch(stream, onerror)

This is another way to build the try/catch block albeit probably less elegant.

```
var _catch = require('stream-try-catch').catch;

var stream = _catch(_try(streamA).pipe(streamB), onerror).pipe(streamC);

```


## Installation

```bash
$ npm install stream-try-catch
```

# Licence

  MIT

