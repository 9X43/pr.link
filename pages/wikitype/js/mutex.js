void function mutex() {
  let locks;
  let queue;

  void function $constructor() {
    locks = {};
    queue = {};
  }();

// @public
  evt.on({
    "lock": lock,
    "try_lock": try_lock,
    "release_lock": release
  });

// @private
  const has_prop = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);

  function lock(key, fn) {
    if (!has_prop(locks, key))
      return void fn(aquire_lock(key));

    if (!queue[key])
      queue[key] = [];

    queue[key].push(fn);
  }

  function try_lock(key, fn) {
    if (!has_prop(locks, key))
      return void fn(aquire_lock(key));
  }

  function aquire_lock(key) {
    const rnd_lock = crypto.getRandomValues(new Uint32Array(2)).join("");
    locks[key] = rnd_lock;
    return rnd_lock;
  }

  function release(key, lock) {
    if (locks[key] && locks[key] === lock) {
      delete locks[key];
      shift_queue(key);
    }
  }

  function shift_queue(key) {
    if (queue[key]) {
      const fn = queue[key].shift();

      if (queue[key].length === 0)
        delete queue[key];

      lock(key, fn);
    }
  }
}();