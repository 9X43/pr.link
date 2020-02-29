const evt = (function() {
  let listener = {};

// @private
  const get_type = x => Object.prototype.toString.call(x);
  const is_obj = obj => get_type(obj) === "[object Object]";
  const is_str = str => get_type(str) === "[object String]";
  const is_fn = fn => get_type(fn) === "[object Function]";
  const has_prop = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);

  function create_evt(name, fn, once = false) {
    return { name, fn, once };
  }

  function on(name_or_obj, maybe_fn = false, once = false) {
    if (is_obj(name_or_obj))
      return void Object.entries(name_or_obj)
                        .forEach(([name, fn]) => on(name, fn, once));

    if (!is_str(name_or_obj))
      throw Error(`Expected string, got ›${typeof name_or_obj}‹.`);

    if (has_prop(listener, name_or_obj))
      throw Error(`Listener ›${name_or_obj}‹ already exists.`);

    if (!is_fn(maybe_fn))
      throw Error(`Expected function, got ›${typeof maybe_fn}‹.`);

    listener[name_or_obj] = create_evt(name_or_obj, maybe_fn, once);
  };

  function once(name_or_obj, maybe_fn = false) {
    on(name_or_obj, maybe_fn, true);
  }

  function emit(name, ...args) {
    return void call(name, ...args);
  }

  function call(name, ...args) {
    try {
      const obj = listener[name];
      const fn = obj.fn;

      if (obj.once)
        delete listener[name];

      return fn(...args);
    } catch(_) {
      // Event doesn't exist.
    }
  };

// @public
  return { on, once, emit, call };
})();
