
/**
 * Module dependencies.
 */
var Stream = require('stream');

/**
 * Expose `wrap`.
 */
module.exports = {
  'try':  _try,
  'catch': _catch
};

/**
 * try.
 *
 * @param {Stream} destination of the pipe.
 * @return {Stream}
 * @api public
 */
function _try(stream) {

  if (!stream._trycatch_native_pipe) {

    // keep a reference to native pipe method
    stream._trycatch_native_pipe = stream.pipe;

    // replace the pipe method
    stream.pipe  = _propagate;
    stream.catch = _catch;

  }

  return stream;
}


function _propagate(dest, opt) { 

  // propagation 'error' to dest
  var fw = dest.emit.bind(dest, 'error')  
  this.on('error', fw) 
  var self = this 
  dest.on('unpipe', function (src) { 
    if (src === self) { 
      dest.removeListener('error', fw) 
    }
  })

  // add try_catch to the dest
  dest = _try(dest);

  // native pipe
  return this._trycatch_native_pipe(dest, opt) 
} 

function _catch(stream, onerror) {

  if (!onerror) {
    onerror = stream;
    stream = this;
  }

  // stop propagation
  if (stream._trycatch_native_pipe) {
    delete stream.catch;
    stream.pipe = stream._trycatch_native_pipe;
    delete stream._trycatch_native_pipe;
  }

  // catch errors
  stream.on('error', onerror);

  return stream;
}

