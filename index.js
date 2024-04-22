var path        = require('path');
var Transform   = require('stream').Transform;
var Vinyl       = require('vinyl');
var vm          = require('vm');

module.exports = function(filename) {
  var files  = {};
  var deps   = {};
  var error;

  var nameRe = /[\w.]+/g;
  var extRe  = /\bextend:[ '"]+([\w.]+)/;
  var mixsRe = /\bmixins: *[[{]/;
  var mix1Re = /(?:['"]([\w.]+)['"]|[}\]])/g;
  var locRe  = /(.*[\s]){2}/;

  return new Transform({
    objectMode: true,
    transform,
    flush,
  });

  function transform(file, enc, cb) {
    var data = file.contents.toString();
    var k, ext, mixs, mix1;

    nameRe.lastIndex = 0;

    if (
      data &&
      String(nameRe.exec(data)) === 'Ext.define' &&
      (k = String(nameRe.exec(data)))
    ) {
      try {
        new vm.Script(data, path.relative(file.cwd, file.path));
      }
      catch (e) {
        (error = e).message += '\n' + e.stack.match(locRe)[0];
      }

      files[k] = file;
      deps[k]  = [];

      if ((ext = extRe.exec(data)) && ext[1]) {
        deps[k].push(ext[1]);
      }

      if ((mixs = mixsRe.exec(data))) {
        mix1Re.lastIndex = mixs.index + mixs[0].length;

        while ((mix1 = mix1Re.exec(data)) && mix1[1]) {
          deps[k].push(mix1[1]);
        }
      }
    }

    cb();
  }

  function flush(cb) {
    var a = [];

    for (var k in files) {
      push(a, k);
    }

    if (a.length > 0) {
      this.push(new Vinyl({
        path: filename,
        contents: Buffer.concat(a),
      }));
    }

    cb(error);
  }

  function push(a, k) {
    if (files[k]) {
      deps[k].forEach(k => {
        push(a, k);
      });

      a.push(files[k].contents);
      delete files[k];
    }
  }
};
