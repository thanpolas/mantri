
var expects = {
  deps: {}
};

expects.deps.defaults = [{
  cmd: 'closure-bin/build/depswriter.py  --root_with_prefix="test/todoApp ./" --output_file=test/todoApp/deps.js',
  dest: 'target'
}];

module.exports = expects;
