var assert = require('assert');
var _try = require('..').try;
var _catch = require('..').catch;
var Stream = require('stream');

describe('try(a)', function(){
  it('should return a', function() {
    var a = Readable();
    var stream = _try(a);
    assert.equal(stream, a);
  });
});

describe('try(a).pipe(b)', function() {

  it('should return b', function(done) {
    var a = Readable();
    var b = Transform(done);
    var stream = _try(a).pipe(b);
    assert.equal(stream, b);
  });

  it('should catch errors on a', function(done) {
    var a = Readable();
    var b = Transform();
    var err = new Error();
    var i = 0;
    var onerror = function(_err) {
      i++;
      assert.equal(_err, err);
      assert(i <= 1);
      if (i == 1) done();
    };
    var stream = _try(a).pipe(b).catch(onerror);
    a.emit('error', err);

  });
});

describe('try(a).pipe(b).pipe(c)', function() {
  it('should pipe data through pipeline', function(done) {
    var a = Readable();
    var b = Transform();
    var c = Writable(done);
    var stream = _try(a).pipe(b).pipe(c);
  });
});

describe('try(a).pipe(b).pipe(c).catch(onerror)', function() {
  it('should propagate errors to the catch', function(done) {
    var a = Readable();
    var b = Transform();
    var c = Writable();
    var err = new Error;
    var i=0;
    var onerror = function(_err) {
      i++;
      assert.equal(_err, err);
      assert(i <= 3);
      if (i == 3) done();
    }

    var stream = _try(a).pipe(b).pipe(c).catch(onerror);

    a.emit('error', err);
    b.emit('error', err);
    c.emit('error', err);
  });
});

describe('try(a).pipe(b).catch(onerror).pipe(c)', function() {

   it('should not propage errors to c', function() {
    var a = Readable();
    var b = Transform();
    var c = Writable();
    var err = new Error;
    var i=0;
    var noop = function(){};
    var onerror = function(_err) {
      assert(false);
    }
    var stream = _try(a).pipe(b).catch(noop).pipe(c);
    c.on('error', onerror);
    a.emit('error', err);
    b.emit('error', err);
  });


});

describe('_catch(_try(a).pipe(b), onerror).pipe(c)', function() {

  it('should catch errors on a an b', function(done) {
    var a = Readable();
    var b = Transform();
    var c = Writable();
    var err = new Error();
    var i = 0;
    var onerror = function(_err) {
      i++;
      assert.equal(_err, err);
      assert(i <= 2);
      if (i == 2) done();
    };
    var stream = _catch(_try(a).pipe(b), onerror).pipe(c);
    a.emit('error', err);
    b.emit('error', err);

  });

});




function Readable(cb){
  var readable = new Stream.Readable({ objectMode: true});
  readable._read = function() {
    this.push('data');
    this.push(null); // no more data
  };
  if (cb) readable.on('end', cb);
  return readable;
}

function Transform(cb){
  var transform = new Stream.Transform({ objectMode: true });
  transform._transform = function(chunk, _, done){
    done(null, chunk.toUpperCase());
  };
  if (cb) transform.on('finish', cb);
  return transform;
}

function Writable(cb) {
  var writable = new Stream.Writable({ objectMode: true });
  writable._write = function(chunk, _, done){
    assert.equal(chunk, 'DATA');
    done();
  };
  if (cb) writable.on('finish', cb);
  return writable;
}
