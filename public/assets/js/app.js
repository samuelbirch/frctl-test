(function () {
	'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var check = function (it) {
	  return it && it.Math == Math && it;
	};

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global_1 =
	  // eslint-disable-next-line no-undef
	  check(typeof globalThis == 'object' && globalThis) ||
	  check(typeof window == 'object' && window) ||
	  check(typeof self == 'object' && self) ||
	  check(typeof commonjsGlobal == 'object' && commonjsGlobal) ||
	  // eslint-disable-next-line no-new-func
	  Function('return this')();

	var fails = function (exec) {
	  try {
	    return !!exec();
	  } catch (error) {
	    return true;
	  }
	};

	// Thank's IE8 for his funny defineProperty
	var descriptors = !fails(function () {
	  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
	});

	var nativePropertyIsEnumerable = {}.propertyIsEnumerable;
	var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

	// Nashorn ~ JDK8 bug
	var NASHORN_BUG = getOwnPropertyDescriptor && !nativePropertyIsEnumerable.call({ 1: 2 }, 1);

	// `Object.prototype.propertyIsEnumerable` method implementation
	// https://tc39.github.io/ecma262/#sec-object.prototype.propertyisenumerable
	var f = NASHORN_BUG ? function propertyIsEnumerable(V) {
	  var descriptor = getOwnPropertyDescriptor(this, V);
	  return !!descriptor && descriptor.enumerable;
	} : nativePropertyIsEnumerable;

	var objectPropertyIsEnumerable = {
		f: f
	};

	var createPropertyDescriptor = function (bitmap, value) {
	  return {
	    enumerable: !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable: !(bitmap & 4),
	    value: value
	  };
	};

	var toString = {}.toString;

	var classofRaw = function (it) {
	  return toString.call(it).slice(8, -1);
	};

	var split = ''.split;

	// fallback for non-array-like ES3 and non-enumerable old V8 strings
	var indexedObject = fails(function () {
	  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
	  // eslint-disable-next-line no-prototype-builtins
	  return !Object('z').propertyIsEnumerable(0);
	}) ? function (it) {
	  return classofRaw(it) == 'String' ? split.call(it, '') : Object(it);
	} : Object;

	// `RequireObjectCoercible` abstract operation
	// https://tc39.github.io/ecma262/#sec-requireobjectcoercible
	var requireObjectCoercible = function (it) {
	  if (it == undefined) throw TypeError("Can't call method on " + it);
	  return it;
	};

	// toObject with fallback for non-array-like ES3 strings



	var toIndexedObject = function (it) {
	  return indexedObject(requireObjectCoercible(it));
	};

	var isObject = function (it) {
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

	// `ToPrimitive` abstract operation
	// https://tc39.github.io/ecma262/#sec-toprimitive
	// instead of the ES6 spec version, we didn't implement @@toPrimitive case
	// and the second argument - flag - preferred type is a string
	var toPrimitive = function (input, PREFERRED_STRING) {
	  if (!isObject(input)) return input;
	  var fn, val;
	  if (PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
	  if (typeof (fn = input.valueOf) == 'function' && !isObject(val = fn.call(input))) return val;
	  if (!PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
	  throw TypeError("Can't convert object to primitive value");
	};

	var hasOwnProperty = {}.hasOwnProperty;

	var has = function (it, key) {
	  return hasOwnProperty.call(it, key);
	};

	var document$1 = global_1.document;
	// typeof document.createElement is 'object' in old IE
	var EXISTS = isObject(document$1) && isObject(document$1.createElement);

	var documentCreateElement = function (it) {
	  return EXISTS ? document$1.createElement(it) : {};
	};

	// Thank's IE8 for his funny defineProperty
	var ie8DomDefine = !descriptors && !fails(function () {
	  return Object.defineProperty(documentCreateElement('div'), 'a', {
	    get: function () { return 7; }
	  }).a != 7;
	});

	var nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

	// `Object.getOwnPropertyDescriptor` method
	// https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptor
	var f$1 = descriptors ? nativeGetOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
	  O = toIndexedObject(O);
	  P = toPrimitive(P, true);
	  if (ie8DomDefine) try {
	    return nativeGetOwnPropertyDescriptor(O, P);
	  } catch (error) { /* empty */ }
	  if (has(O, P)) return createPropertyDescriptor(!objectPropertyIsEnumerable.f.call(O, P), O[P]);
	};

	var objectGetOwnPropertyDescriptor = {
		f: f$1
	};

	var anObject = function (it) {
	  if (!isObject(it)) {
	    throw TypeError(String(it) + ' is not an object');
	  } return it;
	};

	var nativeDefineProperty = Object.defineProperty;

	// `Object.defineProperty` method
	// https://tc39.github.io/ecma262/#sec-object.defineproperty
	var f$2 = descriptors ? nativeDefineProperty : function defineProperty(O, P, Attributes) {
	  anObject(O);
	  P = toPrimitive(P, true);
	  anObject(Attributes);
	  if (ie8DomDefine) try {
	    return nativeDefineProperty(O, P, Attributes);
	  } catch (error) { /* empty */ }
	  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported');
	  if ('value' in Attributes) O[P] = Attributes.value;
	  return O;
	};

	var objectDefineProperty = {
		f: f$2
	};

	var createNonEnumerableProperty = descriptors ? function (object, key, value) {
	  return objectDefineProperty.f(object, key, createPropertyDescriptor(1, value));
	} : function (object, key, value) {
	  object[key] = value;
	  return object;
	};

	var setGlobal = function (key, value) {
	  try {
	    createNonEnumerableProperty(global_1, key, value);
	  } catch (error) {
	    global_1[key] = value;
	  } return value;
	};

	var SHARED = '__core-js_shared__';
	var store = global_1[SHARED] || setGlobal(SHARED, {});

	var sharedStore = store;

	var functionToString = Function.toString;

	// this helper broken in `3.4.1-3.4.4`, so we can't use `shared` helper
	if (typeof sharedStore.inspectSource != 'function') {
	  sharedStore.inspectSource = function (it) {
	    return functionToString.call(it);
	  };
	}

	var inspectSource = sharedStore.inspectSource;

	var WeakMap$1 = global_1.WeakMap;

	var nativeWeakMap = typeof WeakMap$1 === 'function' && /native code/.test(inspectSource(WeakMap$1));

	var isPure = false;

	var shared = createCommonjsModule(function (module) {
	(module.exports = function (key, value) {
	  return sharedStore[key] || (sharedStore[key] = value !== undefined ? value : {});
	})('versions', []).push({
	  version: '3.6.1',
	  mode:  'global',
	  copyright: '© 2019 Denis Pushkarev (zloirock.ru)'
	});
	});

	var id = 0;
	var postfix = Math.random();

	var uid = function (key) {
	  return 'Symbol(' + String(key === undefined ? '' : key) + ')_' + (++id + postfix).toString(36);
	};

	var keys = shared('keys');

	var sharedKey = function (key) {
	  return keys[key] || (keys[key] = uid(key));
	};

	var hiddenKeys = {};

	var WeakMap$2 = global_1.WeakMap;
	var set, get, has$1;

	var enforce = function (it) {
	  return has$1(it) ? get(it) : set(it, {});
	};

	var getterFor = function (TYPE) {
	  return function (it) {
	    var state;
	    if (!isObject(it) || (state = get(it)).type !== TYPE) {
	      throw TypeError('Incompatible receiver, ' + TYPE + ' required');
	    } return state;
	  };
	};

	if (nativeWeakMap) {
	  var store$1 = new WeakMap$2();
	  var wmget = store$1.get;
	  var wmhas = store$1.has;
	  var wmset = store$1.set;
	  set = function (it, metadata) {
	    wmset.call(store$1, it, metadata);
	    return metadata;
	  };
	  get = function (it) {
	    return wmget.call(store$1, it) || {};
	  };
	  has$1 = function (it) {
	    return wmhas.call(store$1, it);
	  };
	} else {
	  var STATE = sharedKey('state');
	  hiddenKeys[STATE] = true;
	  set = function (it, metadata) {
	    createNonEnumerableProperty(it, STATE, metadata);
	    return metadata;
	  };
	  get = function (it) {
	    return has(it, STATE) ? it[STATE] : {};
	  };
	  has$1 = function (it) {
	    return has(it, STATE);
	  };
	}

	var internalState = {
	  set: set,
	  get: get,
	  has: has$1,
	  enforce: enforce,
	  getterFor: getterFor
	};

	var redefine = createCommonjsModule(function (module) {
	var getInternalState = internalState.get;
	var enforceInternalState = internalState.enforce;
	var TEMPLATE = String(String).split('String');

	(module.exports = function (O, key, value, options) {
	  var unsafe = options ? !!options.unsafe : false;
	  var simple = options ? !!options.enumerable : false;
	  var noTargetGet = options ? !!options.noTargetGet : false;
	  if (typeof value == 'function') {
	    if (typeof key == 'string' && !has(value, 'name')) createNonEnumerableProperty(value, 'name', key);
	    enforceInternalState(value).source = TEMPLATE.join(typeof key == 'string' ? key : '');
	  }
	  if (O === global_1) {
	    if (simple) O[key] = value;
	    else setGlobal(key, value);
	    return;
	  } else if (!unsafe) {
	    delete O[key];
	  } else if (!noTargetGet && O[key]) {
	    simple = true;
	  }
	  if (simple) O[key] = value;
	  else createNonEnumerableProperty(O, key, value);
	// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
	})(Function.prototype, 'toString', function toString() {
	  return typeof this == 'function' && getInternalState(this).source || inspectSource(this);
	});
	});

	var path = global_1;

	var aFunction = function (variable) {
	  return typeof variable == 'function' ? variable : undefined;
	};

	var getBuiltIn = function (namespace, method) {
	  return arguments.length < 2 ? aFunction(path[namespace]) || aFunction(global_1[namespace])
	    : path[namespace] && path[namespace][method] || global_1[namespace] && global_1[namespace][method];
	};

	var ceil = Math.ceil;
	var floor = Math.floor;

	// `ToInteger` abstract operation
	// https://tc39.github.io/ecma262/#sec-tointeger
	var toInteger = function (argument) {
	  return isNaN(argument = +argument) ? 0 : (argument > 0 ? floor : ceil)(argument);
	};

	var min = Math.min;

	// `ToLength` abstract operation
	// https://tc39.github.io/ecma262/#sec-tolength
	var toLength = function (argument) {
	  return argument > 0 ? min(toInteger(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
	};

	var max = Math.max;
	var min$1 = Math.min;

	// Helper for a popular repeating case of the spec:
	// Let integer be ? ToInteger(index).
	// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).
	var toAbsoluteIndex = function (index, length) {
	  var integer = toInteger(index);
	  return integer < 0 ? max(integer + length, 0) : min$1(integer, length);
	};

	// `Array.prototype.{ indexOf, includes }` methods implementation
	var createMethod = function (IS_INCLUDES) {
	  return function ($this, el, fromIndex) {
	    var O = toIndexedObject($this);
	    var length = toLength(O.length);
	    var index = toAbsoluteIndex(fromIndex, length);
	    var value;
	    // Array#includes uses SameValueZero equality algorithm
	    // eslint-disable-next-line no-self-compare
	    if (IS_INCLUDES && el != el) while (length > index) {
	      value = O[index++];
	      // eslint-disable-next-line no-self-compare
	      if (value != value) return true;
	    // Array#indexOf ignores holes, Array#includes - not
	    } else for (;length > index; index++) {
	      if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
	    } return !IS_INCLUDES && -1;
	  };
	};

	var arrayIncludes = {
	  // `Array.prototype.includes` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.includes
	  includes: createMethod(true),
	  // `Array.prototype.indexOf` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.indexof
	  indexOf: createMethod(false)
	};

	var indexOf = arrayIncludes.indexOf;


	var objectKeysInternal = function (object, names) {
	  var O = toIndexedObject(object);
	  var i = 0;
	  var result = [];
	  var key;
	  for (key in O) !has(hiddenKeys, key) && has(O, key) && result.push(key);
	  // Don't enum bug & hidden keys
	  while (names.length > i) if (has(O, key = names[i++])) {
	    ~indexOf(result, key) || result.push(key);
	  }
	  return result;
	};

	// IE8- don't enum bug keys
	var enumBugKeys = [
	  'constructor',
	  'hasOwnProperty',
	  'isPrototypeOf',
	  'propertyIsEnumerable',
	  'toLocaleString',
	  'toString',
	  'valueOf'
	];

	var hiddenKeys$1 = enumBugKeys.concat('length', 'prototype');

	// `Object.getOwnPropertyNames` method
	// https://tc39.github.io/ecma262/#sec-object.getownpropertynames
	var f$3 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
	  return objectKeysInternal(O, hiddenKeys$1);
	};

	var objectGetOwnPropertyNames = {
		f: f$3
	};

	var f$4 = Object.getOwnPropertySymbols;

	var objectGetOwnPropertySymbols = {
		f: f$4
	};

	// all object keys, includes non-enumerable and symbols
	var ownKeys = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
	  var keys = objectGetOwnPropertyNames.f(anObject(it));
	  var getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
	  return getOwnPropertySymbols ? keys.concat(getOwnPropertySymbols(it)) : keys;
	};

	var copyConstructorProperties = function (target, source) {
	  var keys = ownKeys(source);
	  var defineProperty = objectDefineProperty.f;
	  var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;
	  for (var i = 0; i < keys.length; i++) {
	    var key = keys[i];
	    if (!has(target, key)) defineProperty(target, key, getOwnPropertyDescriptor(source, key));
	  }
	};

	var replacement = /#|\.prototype\./;

	var isForced = function (feature, detection) {
	  var value = data[normalize(feature)];
	  return value == POLYFILL ? true
	    : value == NATIVE ? false
	    : typeof detection == 'function' ? fails(detection)
	    : !!detection;
	};

	var normalize = isForced.normalize = function (string) {
	  return String(string).replace(replacement, '.').toLowerCase();
	};

	var data = isForced.data = {};
	var NATIVE = isForced.NATIVE = 'N';
	var POLYFILL = isForced.POLYFILL = 'P';

	var isForced_1 = isForced;

	var getOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;






	/*
	  options.target      - name of the target object
	  options.global      - target is the global object
	  options.stat        - export as static methods of target
	  options.proto       - export as prototype methods of target
	  options.real        - real prototype method for the `pure` version
	  options.forced      - export even if the native feature is available
	  options.bind        - bind methods to the target, required for the `pure` version
	  options.wrap        - wrap constructors to preventing global pollution, required for the `pure` version
	  options.unsafe      - use the simple assignment of property instead of delete + defineProperty
	  options.sham        - add a flag to not completely full polyfills
	  options.enumerable  - export as enumerable property
	  options.noTargetGet - prevent calling a getter on target
	*/
	var _export = function (options, source) {
	  var TARGET = options.target;
	  var GLOBAL = options.global;
	  var STATIC = options.stat;
	  var FORCED, target, key, targetProperty, sourceProperty, descriptor;
	  if (GLOBAL) {
	    target = global_1;
	  } else if (STATIC) {
	    target = global_1[TARGET] || setGlobal(TARGET, {});
	  } else {
	    target = (global_1[TARGET] || {}).prototype;
	  }
	  if (target) for (key in source) {
	    sourceProperty = source[key];
	    if (options.noTargetGet) {
	      descriptor = getOwnPropertyDescriptor$1(target, key);
	      targetProperty = descriptor && descriptor.value;
	    } else targetProperty = target[key];
	    FORCED = isForced_1(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
	    // contained in target
	    if (!FORCED && targetProperty !== undefined) {
	      if (typeof sourceProperty === typeof targetProperty) continue;
	      copyConstructorProperties(sourceProperty, targetProperty);
	    }
	    // add a flag to not completely full polyfills
	    if (options.sham || (targetProperty && targetProperty.sham)) {
	      createNonEnumerableProperty(sourceProperty, 'sham', true);
	    }
	    // extend global
	    redefine(target, key, sourceProperty, options);
	  }
	};

	var aFunction$1 = function (it) {
	  if (typeof it != 'function') {
	    throw TypeError(String(it) + ' is not a function');
	  } return it;
	};

	// optional / simple context binding
	var bindContext = function (fn, that, length) {
	  aFunction$1(fn);
	  if (that === undefined) return fn;
	  switch (length) {
	    case 0: return function () {
	      return fn.call(that);
	    };
	    case 1: return function (a) {
	      return fn.call(that, a);
	    };
	    case 2: return function (a, b) {
	      return fn.call(that, a, b);
	    };
	    case 3: return function (a, b, c) {
	      return fn.call(that, a, b, c);
	    };
	  }
	  return function (/* ...args */) {
	    return fn.apply(that, arguments);
	  };
	};

	// `ToObject` abstract operation
	// https://tc39.github.io/ecma262/#sec-toobject
	var toObject = function (argument) {
	  return Object(requireObjectCoercible(argument));
	};

	// `IsArray` abstract operation
	// https://tc39.github.io/ecma262/#sec-isarray
	var isArray = Array.isArray || function isArray(arg) {
	  return classofRaw(arg) == 'Array';
	};

	var nativeSymbol = !!Object.getOwnPropertySymbols && !fails(function () {
	  // Chrome 38 Symbol has incorrect toString conversion
	  // eslint-disable-next-line no-undef
	  return !String(Symbol());
	});

	var useSymbolAsUid = nativeSymbol
	  // eslint-disable-next-line no-undef
	  && !Symbol.sham
	  // eslint-disable-next-line no-undef
	  && typeof Symbol.iterator == 'symbol';

	var WellKnownSymbolsStore = shared('wks');
	var Symbol$1 = global_1.Symbol;
	var createWellKnownSymbol = useSymbolAsUid ? Symbol$1 : Symbol$1 && Symbol$1.withoutSetter || uid;

	var wellKnownSymbol = function (name) {
	  if (!has(WellKnownSymbolsStore, name)) {
	    if (nativeSymbol && has(Symbol$1, name)) WellKnownSymbolsStore[name] = Symbol$1[name];
	    else WellKnownSymbolsStore[name] = createWellKnownSymbol('Symbol.' + name);
	  } return WellKnownSymbolsStore[name];
	};

	var SPECIES = wellKnownSymbol('species');

	// `ArraySpeciesCreate` abstract operation
	// https://tc39.github.io/ecma262/#sec-arrayspeciescreate
	var arraySpeciesCreate = function (originalArray, length) {
	  var C;
	  if (isArray(originalArray)) {
	    C = originalArray.constructor;
	    // cross-realm fallback
	    if (typeof C == 'function' && (C === Array || isArray(C.prototype))) C = undefined;
	    else if (isObject(C)) {
	      C = C[SPECIES];
	      if (C === null) C = undefined;
	    }
	  } return new (C === undefined ? Array : C)(length === 0 ? 0 : length);
	};

	var push = [].push;

	// `Array.prototype.{ forEach, map, filter, some, every, find, findIndex }` methods implementation
	var createMethod$1 = function (TYPE) {
	  var IS_MAP = TYPE == 1;
	  var IS_FILTER = TYPE == 2;
	  var IS_SOME = TYPE == 3;
	  var IS_EVERY = TYPE == 4;
	  var IS_FIND_INDEX = TYPE == 6;
	  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
	  return function ($this, callbackfn, that, specificCreate) {
	    var O = toObject($this);
	    var self = indexedObject(O);
	    var boundFunction = bindContext(callbackfn, that, 3);
	    var length = toLength(self.length);
	    var index = 0;
	    var create = specificCreate || arraySpeciesCreate;
	    var target = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
	    var value, result;
	    for (;length > index; index++) if (NO_HOLES || index in self) {
	      value = self[index];
	      result = boundFunction(value, index, O);
	      if (TYPE) {
	        if (IS_MAP) target[index] = result; // map
	        else if (result) switch (TYPE) {
	          case 3: return true;              // some
	          case 5: return value;             // find
	          case 6: return index;             // findIndex
	          case 2: push.call(target, value); // filter
	        } else if (IS_EVERY) return false;  // every
	      }
	    }
	    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
	  };
	};

	var arrayIteration = {
	  // `Array.prototype.forEach` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.foreach
	  forEach: createMethod$1(0),
	  // `Array.prototype.map` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.map
	  map: createMethod$1(1),
	  // `Array.prototype.filter` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.filter
	  filter: createMethod$1(2),
	  // `Array.prototype.some` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.some
	  some: createMethod$1(3),
	  // `Array.prototype.every` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.every
	  every: createMethod$1(4),
	  // `Array.prototype.find` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.find
	  find: createMethod$1(5),
	  // `Array.prototype.findIndex` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.findIndex
	  findIndex: createMethod$1(6)
	};

	// `Object.keys` method
	// https://tc39.github.io/ecma262/#sec-object.keys
	var objectKeys = Object.keys || function keys(O) {
	  return objectKeysInternal(O, enumBugKeys);
	};

	// `Object.defineProperties` method
	// https://tc39.github.io/ecma262/#sec-object.defineproperties
	var objectDefineProperties = descriptors ? Object.defineProperties : function defineProperties(O, Properties) {
	  anObject(O);
	  var keys = objectKeys(Properties);
	  var length = keys.length;
	  var index = 0;
	  var key;
	  while (length > index) objectDefineProperty.f(O, key = keys[index++], Properties[key]);
	  return O;
	};

	var html = getBuiltIn('document', 'documentElement');

	var GT = '>';
	var LT = '<';
	var PROTOTYPE = 'prototype';
	var SCRIPT = 'script';
	var IE_PROTO = sharedKey('IE_PROTO');

	var EmptyConstructor = function () { /* empty */ };

	var scriptTag = function (content) {
	  return LT + SCRIPT + GT + content + LT + '/' + SCRIPT + GT;
	};

	// Create object with fake `null` prototype: use ActiveX Object with cleared prototype
	var NullProtoObjectViaActiveX = function (activeXDocument) {
	  activeXDocument.write(scriptTag(''));
	  activeXDocument.close();
	  var temp = activeXDocument.parentWindow.Object;
	  activeXDocument = null; // avoid memory leak
	  return temp;
	};

	// Create object with fake `null` prototype: use iframe Object with cleared prototype
	var NullProtoObjectViaIFrame = function () {
	  // Thrash, waste and sodomy: IE GC bug
	  var iframe = documentCreateElement('iframe');
	  var JS = 'java' + SCRIPT + ':';
	  var iframeDocument;
	  iframe.style.display = 'none';
	  html.appendChild(iframe);
	  // https://github.com/zloirock/core-js/issues/475
	  iframe.src = String(JS);
	  iframeDocument = iframe.contentWindow.document;
	  iframeDocument.open();
	  iframeDocument.write(scriptTag('document.F=Object'));
	  iframeDocument.close();
	  return iframeDocument.F;
	};

	// Check for document.domain and active x support
	// No need to use active x approach when document.domain is not set
	// see https://github.com/es-shims/es5-shim/issues/150
	// variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
	// avoid IE GC bug
	var activeXDocument;
	var NullProtoObject = function () {
	  try {
	    /* global ActiveXObject */
	    activeXDocument = document.domain && new ActiveXObject('htmlfile');
	  } catch (error) { /* ignore */ }
	  NullProtoObject = activeXDocument ? NullProtoObjectViaActiveX(activeXDocument) : NullProtoObjectViaIFrame();
	  var length = enumBugKeys.length;
	  while (length--) delete NullProtoObject[PROTOTYPE][enumBugKeys[length]];
	  return NullProtoObject();
	};

	hiddenKeys[IE_PROTO] = true;

	// `Object.create` method
	// https://tc39.github.io/ecma262/#sec-object.create
	var objectCreate = Object.create || function create(O, Properties) {
	  var result;
	  if (O !== null) {
	    EmptyConstructor[PROTOTYPE] = anObject(O);
	    result = new EmptyConstructor();
	    EmptyConstructor[PROTOTYPE] = null;
	    // add "__proto__" for Object.getPrototypeOf polyfill
	    result[IE_PROTO] = O;
	  } else result = NullProtoObject();
	  return Properties === undefined ? result : objectDefineProperties(result, Properties);
	};

	var UNSCOPABLES = wellKnownSymbol('unscopables');
	var ArrayPrototype = Array.prototype;

	// Array.prototype[@@unscopables]
	// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
	if (ArrayPrototype[UNSCOPABLES] == undefined) {
	  objectDefineProperty.f(ArrayPrototype, UNSCOPABLES, {
	    configurable: true,
	    value: objectCreate(null)
	  });
	}

	// add a key to Array.prototype[@@unscopables]
	var addToUnscopables = function (key) {
	  ArrayPrototype[UNSCOPABLES][key] = true;
	};

	var $find = arrayIteration.find;


	var FIND = 'find';
	var SKIPS_HOLES = true;

	// Shouldn't skip holes
	if (FIND in []) Array(1)[FIND](function () { SKIPS_HOLES = false; });

	// `Array.prototype.find` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.find
	_export({ target: 'Array', proto: true, forced: SKIPS_HOLES }, {
	  find: function find(callbackfn /* , that = undefined */) {
	    return $find(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
	addToUnscopables(FIND);

	var sloppyArrayMethod = function (METHOD_NAME, argument) {
	  var method = [][METHOD_NAME];
	  return !method || !fails(function () {
	    // eslint-disable-next-line no-useless-call,no-throw-literal
	    method.call(null, argument || function () { throw 1; }, 1);
	  });
	};

	var $indexOf = arrayIncludes.indexOf;


	var nativeIndexOf = [].indexOf;

	var NEGATIVE_ZERO = !!nativeIndexOf && 1 / [1].indexOf(1, -0) < 0;
	var SLOPPY_METHOD = sloppyArrayMethod('indexOf');

	// `Array.prototype.indexOf` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.indexof
	_export({ target: 'Array', proto: true, forced: NEGATIVE_ZERO || SLOPPY_METHOD }, {
	  indexOf: function indexOf(searchElement /* , fromIndex = 0 */) {
	    return NEGATIVE_ZERO
	      // convert -0 to +0
	      ? nativeIndexOf.apply(this, arguments) || 0
	      : $indexOf(this, searchElement, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	var aPossiblePrototype = function (it) {
	  if (!isObject(it) && it !== null) {
	    throw TypeError("Can't set " + String(it) + ' as a prototype');
	  } return it;
	};

	// `Object.setPrototypeOf` method
	// https://tc39.github.io/ecma262/#sec-object.setprototypeof
	// Works with __proto__ only. Old v8 can't work with null proto objects.
	/* eslint-disable no-proto */
	var objectSetPrototypeOf = Object.setPrototypeOf || ('__proto__' in {} ? function () {
	  var CORRECT_SETTER = false;
	  var test = {};
	  var setter;
	  try {
	    setter = Object.getOwnPropertyDescriptor(Object.prototype, '__proto__').set;
	    setter.call(test, []);
	    CORRECT_SETTER = test instanceof Array;
	  } catch (error) { /* empty */ }
	  return function setPrototypeOf(O, proto) {
	    anObject(O);
	    aPossiblePrototype(proto);
	    if (CORRECT_SETTER) setter.call(O, proto);
	    else O.__proto__ = proto;
	    return O;
	  };
	}() : undefined);

	// makes subclassing work correct for wrapped built-ins
	var inheritIfRequired = function ($this, dummy, Wrapper) {
	  var NewTarget, NewTargetPrototype;
	  if (
	    // it can work only with native `setPrototypeOf`
	    objectSetPrototypeOf &&
	    // we haven't completely correct pre-ES6 way for getting `new.target`, so use this
	    typeof (NewTarget = dummy.constructor) == 'function' &&
	    NewTarget !== Wrapper &&
	    isObject(NewTargetPrototype = NewTarget.prototype) &&
	    NewTargetPrototype !== Wrapper.prototype
	  ) objectSetPrototypeOf($this, NewTargetPrototype);
	  return $this;
	};

	// a string of all valid unicode whitespaces
	// eslint-disable-next-line max-len
	var whitespaces = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';

	var whitespace = '[' + whitespaces + ']';
	var ltrim = RegExp('^' + whitespace + whitespace + '*');
	var rtrim = RegExp(whitespace + whitespace + '*$');

	// `String.prototype.{ trim, trimStart, trimEnd, trimLeft, trimRight }` methods implementation
	var createMethod$2 = function (TYPE) {
	  return function ($this) {
	    var string = String(requireObjectCoercible($this));
	    if (TYPE & 1) string = string.replace(ltrim, '');
	    if (TYPE & 2) string = string.replace(rtrim, '');
	    return string;
	  };
	};

	var stringTrim = {
	  // `String.prototype.{ trimLeft, trimStart }` methods
	  // https://tc39.github.io/ecma262/#sec-string.prototype.trimstart
	  start: createMethod$2(1),
	  // `String.prototype.{ trimRight, trimEnd }` methods
	  // https://tc39.github.io/ecma262/#sec-string.prototype.trimend
	  end: createMethod$2(2),
	  // `String.prototype.trim` method
	  // https://tc39.github.io/ecma262/#sec-string.prototype.trim
	  trim: createMethod$2(3)
	};

	var getOwnPropertyNames = objectGetOwnPropertyNames.f;
	var getOwnPropertyDescriptor$2 = objectGetOwnPropertyDescriptor.f;
	var defineProperty = objectDefineProperty.f;
	var trim = stringTrim.trim;

	var NUMBER = 'Number';
	var NativeNumber = global_1[NUMBER];
	var NumberPrototype = NativeNumber.prototype;

	// Opera ~12 has broken Object#toString
	var BROKEN_CLASSOF = classofRaw(objectCreate(NumberPrototype)) == NUMBER;

	// `ToNumber` abstract operation
	// https://tc39.github.io/ecma262/#sec-tonumber
	var toNumber = function (argument) {
	  var it = toPrimitive(argument, false);
	  var first, third, radix, maxCode, digits, length, index, code;
	  if (typeof it == 'string' && it.length > 2) {
	    it = trim(it);
	    first = it.charCodeAt(0);
	    if (first === 43 || first === 45) {
	      third = it.charCodeAt(2);
	      if (third === 88 || third === 120) return NaN; // Number('+0x1') should be NaN, old V8 fix
	    } else if (first === 48) {
	      switch (it.charCodeAt(1)) {
	        case 66: case 98: radix = 2; maxCode = 49; break; // fast equal of /^0b[01]+$/i
	        case 79: case 111: radix = 8; maxCode = 55; break; // fast equal of /^0o[0-7]+$/i
	        default: return +it;
	      }
	      digits = it.slice(2);
	      length = digits.length;
	      for (index = 0; index < length; index++) {
	        code = digits.charCodeAt(index);
	        // parseInt parses a string to a first unavailable symbol
	        // but ToNumber should return NaN if a string contains unavailable symbols
	        if (code < 48 || code > maxCode) return NaN;
	      } return parseInt(digits, radix);
	    }
	  } return +it;
	};

	// `Number` constructor
	// https://tc39.github.io/ecma262/#sec-number-constructor
	if (isForced_1(NUMBER, !NativeNumber(' 0o1') || !NativeNumber('0b1') || NativeNumber('+0x1'))) {
	  var NumberWrapper = function Number(value) {
	    var it = arguments.length < 1 ? 0 : value;
	    var dummy = this;
	    return dummy instanceof NumberWrapper
	      // check on 1..constructor(foo) case
	      && (BROKEN_CLASSOF ? fails(function () { NumberPrototype.valueOf.call(dummy); }) : classofRaw(dummy) != NUMBER)
	        ? inheritIfRequired(new NativeNumber(toNumber(it)), dummy, NumberWrapper) : toNumber(it);
	  };
	  for (var keys$1 = descriptors ? getOwnPropertyNames(NativeNumber) : (
	    // ES3:
	    'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' +
	    // ES2015 (in case, if modules with ES2015 Number statics required before):
	    'EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,' +
	    'MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger'
	  ).split(','), j = 0, key; keys$1.length > j; j++) {
	    if (has(NativeNumber, key = keys$1[j]) && !has(NumberWrapper, key)) {
	      defineProperty(NumberWrapper, key, getOwnPropertyDescriptor$2(NativeNumber, key));
	    }
	  }
	  NumberWrapper.prototype = NumberPrototype;
	  NumberPrototype.constructor = NumberWrapper;
	  redefine(global_1, NUMBER, NumberWrapper);
	}

	var iterators = {};

	var correctPrototypeGetter = !fails(function () {
	  function F() { /* empty */ }
	  F.prototype.constructor = null;
	  return Object.getPrototypeOf(new F()) !== F.prototype;
	});

	var IE_PROTO$1 = sharedKey('IE_PROTO');
	var ObjectPrototype = Object.prototype;

	// `Object.getPrototypeOf` method
	// https://tc39.github.io/ecma262/#sec-object.getprototypeof
	var objectGetPrototypeOf = correctPrototypeGetter ? Object.getPrototypeOf : function (O) {
	  O = toObject(O);
	  if (has(O, IE_PROTO$1)) return O[IE_PROTO$1];
	  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
	    return O.constructor.prototype;
	  } return O instanceof Object ? ObjectPrototype : null;
	};

	var ITERATOR = wellKnownSymbol('iterator');
	var BUGGY_SAFARI_ITERATORS = false;

	var returnThis = function () { return this; };

	// `%IteratorPrototype%` object
	// https://tc39.github.io/ecma262/#sec-%iteratorprototype%-object
	var IteratorPrototype, PrototypeOfArrayIteratorPrototype, arrayIterator;

	if ([].keys) {
	  arrayIterator = [].keys();
	  // Safari 8 has buggy iterators w/o `next`
	  if (!('next' in arrayIterator)) BUGGY_SAFARI_ITERATORS = true;
	  else {
	    PrototypeOfArrayIteratorPrototype = objectGetPrototypeOf(objectGetPrototypeOf(arrayIterator));
	    if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype = PrototypeOfArrayIteratorPrototype;
	  }
	}

	if (IteratorPrototype == undefined) IteratorPrototype = {};

	// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
	if ( !has(IteratorPrototype, ITERATOR)) {
	  createNonEnumerableProperty(IteratorPrototype, ITERATOR, returnThis);
	}

	var iteratorsCore = {
	  IteratorPrototype: IteratorPrototype,
	  BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS
	};

	var defineProperty$1 = objectDefineProperty.f;



	var TO_STRING_TAG = wellKnownSymbol('toStringTag');

	var setToStringTag = function (it, TAG, STATIC) {
	  if (it && !has(it = STATIC ? it : it.prototype, TO_STRING_TAG)) {
	    defineProperty$1(it, TO_STRING_TAG, { configurable: true, value: TAG });
	  }
	};

	var IteratorPrototype$1 = iteratorsCore.IteratorPrototype;





	var returnThis$1 = function () { return this; };

	var createIteratorConstructor = function (IteratorConstructor, NAME, next) {
	  var TO_STRING_TAG = NAME + ' Iterator';
	  IteratorConstructor.prototype = objectCreate(IteratorPrototype$1, { next: createPropertyDescriptor(1, next) });
	  setToStringTag(IteratorConstructor, TO_STRING_TAG, false);
	  iterators[TO_STRING_TAG] = returnThis$1;
	  return IteratorConstructor;
	};

	var IteratorPrototype$2 = iteratorsCore.IteratorPrototype;
	var BUGGY_SAFARI_ITERATORS$1 = iteratorsCore.BUGGY_SAFARI_ITERATORS;
	var ITERATOR$1 = wellKnownSymbol('iterator');
	var KEYS = 'keys';
	var VALUES = 'values';
	var ENTRIES = 'entries';

	var returnThis$2 = function () { return this; };

	var defineIterator = function (Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
	  createIteratorConstructor(IteratorConstructor, NAME, next);

	  var getIterationMethod = function (KIND) {
	    if (KIND === DEFAULT && defaultIterator) return defaultIterator;
	    if (!BUGGY_SAFARI_ITERATORS$1 && KIND in IterablePrototype) return IterablePrototype[KIND];
	    switch (KIND) {
	      case KEYS: return function keys() { return new IteratorConstructor(this, KIND); };
	      case VALUES: return function values() { return new IteratorConstructor(this, KIND); };
	      case ENTRIES: return function entries() { return new IteratorConstructor(this, KIND); };
	    } return function () { return new IteratorConstructor(this); };
	  };

	  var TO_STRING_TAG = NAME + ' Iterator';
	  var INCORRECT_VALUES_NAME = false;
	  var IterablePrototype = Iterable.prototype;
	  var nativeIterator = IterablePrototype[ITERATOR$1]
	    || IterablePrototype['@@iterator']
	    || DEFAULT && IterablePrototype[DEFAULT];
	  var defaultIterator = !BUGGY_SAFARI_ITERATORS$1 && nativeIterator || getIterationMethod(DEFAULT);
	  var anyNativeIterator = NAME == 'Array' ? IterablePrototype.entries || nativeIterator : nativeIterator;
	  var CurrentIteratorPrototype, methods, KEY;

	  // fix native
	  if (anyNativeIterator) {
	    CurrentIteratorPrototype = objectGetPrototypeOf(anyNativeIterator.call(new Iterable()));
	    if (IteratorPrototype$2 !== Object.prototype && CurrentIteratorPrototype.next) {
	      if ( objectGetPrototypeOf(CurrentIteratorPrototype) !== IteratorPrototype$2) {
	        if (objectSetPrototypeOf) {
	          objectSetPrototypeOf(CurrentIteratorPrototype, IteratorPrototype$2);
	        } else if (typeof CurrentIteratorPrototype[ITERATOR$1] != 'function') {
	          createNonEnumerableProperty(CurrentIteratorPrototype, ITERATOR$1, returnThis$2);
	        }
	      }
	      // Set @@toStringTag to native iterators
	      setToStringTag(CurrentIteratorPrototype, TO_STRING_TAG, true);
	    }
	  }

	  // fix Array#{values, @@iterator}.name in V8 / FF
	  if (DEFAULT == VALUES && nativeIterator && nativeIterator.name !== VALUES) {
	    INCORRECT_VALUES_NAME = true;
	    defaultIterator = function values() { return nativeIterator.call(this); };
	  }

	  // define iterator
	  if ( IterablePrototype[ITERATOR$1] !== defaultIterator) {
	    createNonEnumerableProperty(IterablePrototype, ITERATOR$1, defaultIterator);
	  }
	  iterators[NAME] = defaultIterator;

	  // export additional methods
	  if (DEFAULT) {
	    methods = {
	      values: getIterationMethod(VALUES),
	      keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
	      entries: getIterationMethod(ENTRIES)
	    };
	    if (FORCED) for (KEY in methods) {
	      if (BUGGY_SAFARI_ITERATORS$1 || INCORRECT_VALUES_NAME || !(KEY in IterablePrototype)) {
	        redefine(IterablePrototype, KEY, methods[KEY]);
	      }
	    } else _export({ target: NAME, proto: true, forced: BUGGY_SAFARI_ITERATORS$1 || INCORRECT_VALUES_NAME }, methods);
	  }

	  return methods;
	};

	var ARRAY_ITERATOR = 'Array Iterator';
	var setInternalState = internalState.set;
	var getInternalState = internalState.getterFor(ARRAY_ITERATOR);

	// `Array.prototype.entries` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.entries
	// `Array.prototype.keys` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.keys
	// `Array.prototype.values` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.values
	// `Array.prototype[@@iterator]` method
	// https://tc39.github.io/ecma262/#sec-array.prototype-@@iterator
	// `CreateArrayIterator` internal method
	// https://tc39.github.io/ecma262/#sec-createarrayiterator
	var es_array_iterator = defineIterator(Array, 'Array', function (iterated, kind) {
	  setInternalState(this, {
	    type: ARRAY_ITERATOR,
	    target: toIndexedObject(iterated), // target
	    index: 0,                          // next index
	    kind: kind                         // kind
	  });
	// `%ArrayIteratorPrototype%.next` method
	// https://tc39.github.io/ecma262/#sec-%arrayiteratorprototype%.next
	}, function () {
	  var state = getInternalState(this);
	  var target = state.target;
	  var kind = state.kind;
	  var index = state.index++;
	  if (!target || index >= target.length) {
	    state.target = undefined;
	    return { value: undefined, done: true };
	  }
	  if (kind == 'keys') return { value: index, done: false };
	  if (kind == 'values') return { value: target[index], done: false };
	  return { value: [index, target[index]], done: false };
	}, 'values');

	// argumentsList[@@iterator] is %ArrayProto_values%
	// https://tc39.github.io/ecma262/#sec-createunmappedargumentsobject
	// https://tc39.github.io/ecma262/#sec-createmappedargumentsobject
	iterators.Arguments = iterators.Array;

	// https://tc39.github.io/ecma262/#sec-array.prototype-@@unscopables
	addToUnscopables('keys');
	addToUnscopables('values');
	addToUnscopables('entries');

	var createProperty = function (object, key, value) {
	  var propertyKey = toPrimitive(key);
	  if (propertyKey in object) objectDefineProperty.f(object, propertyKey, createPropertyDescriptor(0, value));
	  else object[propertyKey] = value;
	};

	var userAgent = getBuiltIn('navigator', 'userAgent') || '';

	var process = global_1.process;
	var versions = process && process.versions;
	var v8 = versions && versions.v8;
	var match, version;

	if (v8) {
	  match = v8.split('.');
	  version = match[0] + match[1];
	} else if (userAgent) {
	  match = userAgent.match(/Edge\/(\d+)/);
	  if (!match || match[1] >= 74) {
	    match = userAgent.match(/Chrome\/(\d+)/);
	    if (match) version = match[1];
	  }
	}

	var v8Version = version && +version;

	var SPECIES$1 = wellKnownSymbol('species');

	var arrayMethodHasSpeciesSupport = function (METHOD_NAME) {
	  // We can't use this feature detection in V8 since it causes
	  // deoptimization and serious performance degradation
	  // https://github.com/zloirock/core-js/issues/677
	  return v8Version >= 51 || !fails(function () {
	    var array = [];
	    var constructor = array.constructor = {};
	    constructor[SPECIES$1] = function () {
	      return { foo: 1 };
	    };
	    return array[METHOD_NAME](Boolean).foo !== 1;
	  });
	};

	var max$1 = Math.max;
	var min$2 = Math.min;
	var MAX_SAFE_INTEGER = 0x1FFFFFFFFFFFFF;
	var MAXIMUM_ALLOWED_LENGTH_EXCEEDED = 'Maximum allowed length exceeded';

	// `Array.prototype.splice` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.splice
	// with adding support of @@species
	_export({ target: 'Array', proto: true, forced: !arrayMethodHasSpeciesSupport('splice') }, {
	  splice: function splice(start, deleteCount /* , ...items */) {
	    var O = toObject(this);
	    var len = toLength(O.length);
	    var actualStart = toAbsoluteIndex(start, len);
	    var argumentsLength = arguments.length;
	    var insertCount, actualDeleteCount, A, k, from, to;
	    if (argumentsLength === 0) {
	      insertCount = actualDeleteCount = 0;
	    } else if (argumentsLength === 1) {
	      insertCount = 0;
	      actualDeleteCount = len - actualStart;
	    } else {
	      insertCount = argumentsLength - 2;
	      actualDeleteCount = min$2(max$1(toInteger(deleteCount), 0), len - actualStart);
	    }
	    if (len + insertCount - actualDeleteCount > MAX_SAFE_INTEGER) {
	      throw TypeError(MAXIMUM_ALLOWED_LENGTH_EXCEEDED);
	    }
	    A = arraySpeciesCreate(O, actualDeleteCount);
	    for (k = 0; k < actualDeleteCount; k++) {
	      from = actualStart + k;
	      if (from in O) createProperty(A, k, O[from]);
	    }
	    A.length = actualDeleteCount;
	    if (insertCount < actualDeleteCount) {
	      for (k = actualStart; k < len - actualDeleteCount; k++) {
	        from = k + actualDeleteCount;
	        to = k + insertCount;
	        if (from in O) O[to] = O[from];
	        else delete O[to];
	      }
	      for (k = len; k > len - actualDeleteCount + insertCount; k--) delete O[k - 1];
	    } else if (insertCount > actualDeleteCount) {
	      for (k = len - actualDeleteCount; k > actualStart; k--) {
	        from = k + actualDeleteCount - 1;
	        to = k + insertCount - 1;
	        if (from in O) O[to] = O[from];
	        else delete O[to];
	      }
	    }
	    for (k = 0; k < insertCount; k++) {
	      O[k + actualStart] = arguments[k + 2];
	    }
	    O.length = len - actualDeleteCount + insertCount;
	    return A;
	  }
	});

	var TO_STRING_TAG$1 = wellKnownSymbol('toStringTag');
	var test = {};

	test[TO_STRING_TAG$1] = 'z';

	var toStringTagSupport = String(test) === '[object z]';

	var TO_STRING_TAG$2 = wellKnownSymbol('toStringTag');
	// ES3 wrong here
	var CORRECT_ARGUMENTS = classofRaw(function () { return arguments; }()) == 'Arguments';

	// fallback for IE11 Script Access Denied error
	var tryGet = function (it, key) {
	  try {
	    return it[key];
	  } catch (error) { /* empty */ }
	};

	// getting tag from ES6+ `Object.prototype.toString`
	var classof = toStringTagSupport ? classofRaw : function (it) {
	  var O, tag, result;
	  return it === undefined ? 'Undefined' : it === null ? 'Null'
	    // @@toStringTag case
	    : typeof (tag = tryGet(O = Object(it), TO_STRING_TAG$2)) == 'string' ? tag
	    // builtinTag case
	    : CORRECT_ARGUMENTS ? classofRaw(O)
	    // ES3 arguments fallback
	    : (result = classofRaw(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : result;
	};

	// `Object.prototype.toString` method implementation
	// https://tc39.github.io/ecma262/#sec-object.prototype.tostring
	var objectToString = toStringTagSupport ? {}.toString : function toString() {
	  return '[object ' + classof(this) + ']';
	};

	// `Object.prototype.toString` method
	// https://tc39.github.io/ecma262/#sec-object.prototype.tostring
	if (!toStringTagSupport) {
	  redefine(Object.prototype, 'toString', objectToString, { unsafe: true });
	}

	// `RegExp.prototype.flags` getter implementation
	// https://tc39.github.io/ecma262/#sec-get-regexp.prototype.flags
	var regexpFlags = function () {
	  var that = anObject(this);
	  var result = '';
	  if (that.global) result += 'g';
	  if (that.ignoreCase) result += 'i';
	  if (that.multiline) result += 'm';
	  if (that.dotAll) result += 's';
	  if (that.unicode) result += 'u';
	  if (that.sticky) result += 'y';
	  return result;
	};

	// babel-minify transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError,
	// so we use an intermediate function.
	function RE(s, f) {
	  return RegExp(s, f);
	}

	var UNSUPPORTED_Y = fails(function () {
	  // babel-minify transpiles RegExp('a', 'y') -> /a/y and it causes SyntaxError
	  var re = RE('a', 'y');
	  re.lastIndex = 2;
	  return re.exec('abcd') != null;
	});

	var BROKEN_CARET = fails(function () {
	  // https://bugzilla.mozilla.org/show_bug.cgi?id=773687
	  var re = RE('^r', 'gy');
	  re.lastIndex = 2;
	  return re.exec('str') != null;
	});

	var regexpStickyHelpers = {
		UNSUPPORTED_Y: UNSUPPORTED_Y,
		BROKEN_CARET: BROKEN_CARET
	};

	var nativeExec = RegExp.prototype.exec;
	// This always refers to the native implementation, because the
	// String#replace polyfill uses ./fix-regexp-well-known-symbol-logic.js,
	// which loads this file before patching the method.
	var nativeReplace = String.prototype.replace;

	var patchedExec = nativeExec;

	var UPDATES_LAST_INDEX_WRONG = (function () {
	  var re1 = /a/;
	  var re2 = /b*/g;
	  nativeExec.call(re1, 'a');
	  nativeExec.call(re2, 'a');
	  return re1.lastIndex !== 0 || re2.lastIndex !== 0;
	})();

	var UNSUPPORTED_Y$1 = regexpStickyHelpers.UNSUPPORTED_Y || regexpStickyHelpers.BROKEN_CARET;

	// nonparticipating capturing group, copied from es5-shim's String#split patch.
	var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;

	var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED || UNSUPPORTED_Y$1;

	if (PATCH) {
	  patchedExec = function exec(str) {
	    var re = this;
	    var lastIndex, reCopy, match, i;
	    var sticky = UNSUPPORTED_Y$1 && re.sticky;
	    var flags = regexpFlags.call(re);
	    var source = re.source;
	    var charsAdded = 0;
	    var strCopy = str;

	    if (sticky) {
	      flags = flags.replace('y', '');
	      if (flags.indexOf('g') === -1) {
	        flags += 'g';
	      }

	      strCopy = String(str).slice(re.lastIndex);
	      // Support anchored sticky behavior.
	      if (re.lastIndex > 0 && (!re.multiline || re.multiline && str[re.lastIndex - 1] !== '\n')) {
	        source = '(?: ' + source + ')';
	        strCopy = ' ' + strCopy;
	        charsAdded++;
	      }
	      // ^(? + rx + ) is needed, in combination with some str slicing, to
	      // simulate the 'y' flag.
	      reCopy = new RegExp('^(?:' + source + ')', flags);
	    }

	    if (NPCG_INCLUDED) {
	      reCopy = new RegExp('^' + source + '$(?!\\s)', flags);
	    }
	    if (UPDATES_LAST_INDEX_WRONG) lastIndex = re.lastIndex;

	    match = nativeExec.call(sticky ? reCopy : re, strCopy);

	    if (sticky) {
	      if (match) {
	        match.input = match.input.slice(charsAdded);
	        match[0] = match[0].slice(charsAdded);
	        match.index = re.lastIndex;
	        re.lastIndex += match[0].length;
	      } else re.lastIndex = 0;
	    } else if (UPDATES_LAST_INDEX_WRONG && match) {
	      re.lastIndex = re.global ? match.index + match[0].length : lastIndex;
	    }
	    if (NPCG_INCLUDED && match && match.length > 1) {
	      // Fix browsers whose `exec` methods don't consistently return `undefined`
	      // for NPCG, like IE8. NOTE: This doesn' work for /(.?)?/
	      nativeReplace.call(match[0], reCopy, function () {
	        for (i = 1; i < arguments.length - 2; i++) {
	          if (arguments[i] === undefined) match[i] = undefined;
	        }
	      });
	    }

	    return match;
	  };
	}

	var regexpExec = patchedExec;

	_export({ target: 'RegExp', proto: true, forced: /./.exec !== regexpExec }, {
	  exec: regexpExec
	});

	var SPECIES$2 = wellKnownSymbol('species');

	var REPLACE_SUPPORTS_NAMED_GROUPS = !fails(function () {
	  // #replace needs built-in support for named groups.
	  // #match works fine because it just return the exec results, even if it has
	  // a "grops" property.
	  var re = /./;
	  re.exec = function () {
	    var result = [];
	    result.groups = { a: '7' };
	    return result;
	  };
	  return ''.replace(re, '$<a>') !== '7';
	});

	// IE <= 11 replaces $0 with the whole match, as if it was $&
	// https://stackoverflow.com/questions/6024666/getting-ie-to-replace-a-regex-with-the-literal-string-0
	var REPLACE_KEEPS_$0 = (function () {
	  return 'a'.replace(/./, '$0') === '$0';
	})();

	// Chrome 51 has a buggy "split" implementation when RegExp#exec !== nativeExec
	// Weex JS has frozen built-in prototypes, so use try / catch wrapper
	var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = !fails(function () {
	  var re = /(?:)/;
	  var originalExec = re.exec;
	  re.exec = function () { return originalExec.apply(this, arguments); };
	  var result = 'ab'.split(re);
	  return result.length !== 2 || result[0] !== 'a' || result[1] !== 'b';
	});

	var fixRegexpWellKnownSymbolLogic = function (KEY, length, exec, sham) {
	  var SYMBOL = wellKnownSymbol(KEY);

	  var DELEGATES_TO_SYMBOL = !fails(function () {
	    // String methods call symbol-named RegEp methods
	    var O = {};
	    O[SYMBOL] = function () { return 7; };
	    return ''[KEY](O) != 7;
	  });

	  var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL && !fails(function () {
	    // Symbol-named RegExp methods call .exec
	    var execCalled = false;
	    var re = /a/;

	    if (KEY === 'split') {
	      // We can't use real regex here since it causes deoptimization
	      // and serious performance degradation in V8
	      // https://github.com/zloirock/core-js/issues/306
	      re = {};
	      // RegExp[@@split] doesn't call the regex's exec method, but first creates
	      // a new one. We need to return the patched regex when creating the new one.
	      re.constructor = {};
	      re.constructor[SPECIES$2] = function () { return re; };
	      re.flags = '';
	      re[SYMBOL] = /./[SYMBOL];
	    }

	    re.exec = function () { execCalled = true; return null; };

	    re[SYMBOL]('');
	    return !execCalled;
	  });

	  if (
	    !DELEGATES_TO_SYMBOL ||
	    !DELEGATES_TO_EXEC ||
	    (KEY === 'replace' && !(REPLACE_SUPPORTS_NAMED_GROUPS && REPLACE_KEEPS_$0)) ||
	    (KEY === 'split' && !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC)
	  ) {
	    var nativeRegExpMethod = /./[SYMBOL];
	    var methods = exec(SYMBOL, ''[KEY], function (nativeMethod, regexp, str, arg2, forceStringMethod) {
	      if (regexp.exec === regexpExec) {
	        if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
	          // The native String method already delegates to @@method (this
	          // polyfilled function), leasing to infinite recursion.
	          // We avoid it by directly calling the native @@method method.
	          return { done: true, value: nativeRegExpMethod.call(regexp, str, arg2) };
	        }
	        return { done: true, value: nativeMethod.call(str, regexp, arg2) };
	      }
	      return { done: false };
	    }, { REPLACE_KEEPS_$0: REPLACE_KEEPS_$0 });
	    var stringMethod = methods[0];
	    var regexMethod = methods[1];

	    redefine(String.prototype, KEY, stringMethod);
	    redefine(RegExp.prototype, SYMBOL, length == 2
	      // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
	      // 21.2.5.11 RegExp.prototype[@@split](string, limit)
	      ? function (string, arg) { return regexMethod.call(string, this, arg); }
	      // 21.2.5.6 RegExp.prototype[@@match](string)
	      // 21.2.5.9 RegExp.prototype[@@search](string)
	      : function (string) { return regexMethod.call(string, this); }
	    );
	  }

	  if (sham) createNonEnumerableProperty(RegExp.prototype[SYMBOL], 'sham', true);
	};

	// `String.prototype.{ codePointAt, at }` methods implementation
	var createMethod$3 = function (CONVERT_TO_STRING) {
	  return function ($this, pos) {
	    var S = String(requireObjectCoercible($this));
	    var position = toInteger(pos);
	    var size = S.length;
	    var first, second;
	    if (position < 0 || position >= size) return CONVERT_TO_STRING ? '' : undefined;
	    first = S.charCodeAt(position);
	    return first < 0xD800 || first > 0xDBFF || position + 1 === size
	      || (second = S.charCodeAt(position + 1)) < 0xDC00 || second > 0xDFFF
	        ? CONVERT_TO_STRING ? S.charAt(position) : first
	        : CONVERT_TO_STRING ? S.slice(position, position + 2) : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
	  };
	};

	var stringMultibyte = {
	  // `String.prototype.codePointAt` method
	  // https://tc39.github.io/ecma262/#sec-string.prototype.codepointat
	  codeAt: createMethod$3(false),
	  // `String.prototype.at` method
	  // https://github.com/mathiasbynens/String.prototype.at
	  charAt: createMethod$3(true)
	};

	var charAt = stringMultibyte.charAt;

	// `AdvanceStringIndex` abstract operation
	// https://tc39.github.io/ecma262/#sec-advancestringindex
	var advanceStringIndex = function (S, index, unicode) {
	  return index + (unicode ? charAt(S, index).length : 1);
	};

	// `RegExpExec` abstract operation
	// https://tc39.github.io/ecma262/#sec-regexpexec
	var regexpExecAbstract = function (R, S) {
	  var exec = R.exec;
	  if (typeof exec === 'function') {
	    var result = exec.call(R, S);
	    if (typeof result !== 'object') {
	      throw TypeError('RegExp exec method returned something other than an Object or null');
	    }
	    return result;
	  }

	  if (classofRaw(R) !== 'RegExp') {
	    throw TypeError('RegExp#exec called on incompatible receiver');
	  }

	  return regexpExec.call(R, S);
	};

	var max$2 = Math.max;
	var min$3 = Math.min;
	var floor$1 = Math.floor;
	var SUBSTITUTION_SYMBOLS = /\$([$&'`]|\d\d?|<[^>]*>)/g;
	var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&'`]|\d\d?)/g;

	var maybeToString = function (it) {
	  return it === undefined ? it : String(it);
	};

	// @@replace logic
	fixRegexpWellKnownSymbolLogic('replace', 2, function (REPLACE, nativeReplace, maybeCallNative, reason) {
	  return [
	    // `String.prototype.replace` method
	    // https://tc39.github.io/ecma262/#sec-string.prototype.replace
	    function replace(searchValue, replaceValue) {
	      var O = requireObjectCoercible(this);
	      var replacer = searchValue == undefined ? undefined : searchValue[REPLACE];
	      return replacer !== undefined
	        ? replacer.call(searchValue, O, replaceValue)
	        : nativeReplace.call(String(O), searchValue, replaceValue);
	    },
	    // `RegExp.prototype[@@replace]` method
	    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@replace
	    function (regexp, replaceValue) {
	      if (reason.REPLACE_KEEPS_$0 || (typeof replaceValue === 'string' && replaceValue.indexOf('$0') === -1)) {
	        var res = maybeCallNative(nativeReplace, regexp, this, replaceValue);
	        if (res.done) return res.value;
	      }

	      var rx = anObject(regexp);
	      var S = String(this);

	      var functionalReplace = typeof replaceValue === 'function';
	      if (!functionalReplace) replaceValue = String(replaceValue);

	      var global = rx.global;
	      if (global) {
	        var fullUnicode = rx.unicode;
	        rx.lastIndex = 0;
	      }
	      var results = [];
	      while (true) {
	        var result = regexpExecAbstract(rx, S);
	        if (result === null) break;

	        results.push(result);
	        if (!global) break;

	        var matchStr = String(result[0]);
	        if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
	      }

	      var accumulatedResult = '';
	      var nextSourcePosition = 0;
	      for (var i = 0; i < results.length; i++) {
	        result = results[i];

	        var matched = String(result[0]);
	        var position = max$2(min$3(toInteger(result.index), S.length), 0);
	        var captures = [];
	        // NOTE: This is equivalent to
	        //   captures = result.slice(1).map(maybeToString)
	        // but for some reason `nativeSlice.call(result, 1, result.length)` (called in
	        // the slice polyfill when slicing native arrays) "doesn't work" in safari 9 and
	        // causes a crash (https://pastebin.com/N21QzeQA) when trying to debug it.
	        for (var j = 1; j < result.length; j++) captures.push(maybeToString(result[j]));
	        var namedCaptures = result.groups;
	        if (functionalReplace) {
	          var replacerArgs = [matched].concat(captures, position, S);
	          if (namedCaptures !== undefined) replacerArgs.push(namedCaptures);
	          var replacement = String(replaceValue.apply(undefined, replacerArgs));
	        } else {
	          replacement = getSubstitution(matched, S, position, captures, namedCaptures, replaceValue);
	        }
	        if (position >= nextSourcePosition) {
	          accumulatedResult += S.slice(nextSourcePosition, position) + replacement;
	          nextSourcePosition = position + matched.length;
	        }
	      }
	      return accumulatedResult + S.slice(nextSourcePosition);
	    }
	  ];

	  // https://tc39.github.io/ecma262/#sec-getsubstitution
	  function getSubstitution(matched, str, position, captures, namedCaptures, replacement) {
	    var tailPos = position + matched.length;
	    var m = captures.length;
	    var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;
	    if (namedCaptures !== undefined) {
	      namedCaptures = toObject(namedCaptures);
	      symbols = SUBSTITUTION_SYMBOLS;
	    }
	    return nativeReplace.call(replacement, symbols, function (match, ch) {
	      var capture;
	      switch (ch.charAt(0)) {
	        case '$': return '$';
	        case '&': return matched;
	        case '`': return str.slice(0, position);
	        case "'": return str.slice(tailPos);
	        case '<':
	          capture = namedCaptures[ch.slice(1, -1)];
	          break;
	        default: // \d\d?
	          var n = +ch;
	          if (n === 0) return match;
	          if (n > m) {
	            var f = floor$1(n / 10);
	            if (f === 0) return match;
	            if (f <= m) return captures[f - 1] === undefined ? ch.charAt(1) : captures[f - 1] + ch.charAt(1);
	            return match;
	          }
	          capture = captures[n - 1];
	      }
	      return capture === undefined ? '' : capture;
	    });
	  }
	});

	var non = '\u200B\u0085\u180E';

	// check that a method works with the correct list
	// of whitespaces and has a correct name
	var forcedStringTrimMethod = function (METHOD_NAME) {
	  return fails(function () {
	    return !!whitespaces[METHOD_NAME]() || non[METHOD_NAME]() != non || whitespaces[METHOD_NAME].name !== METHOD_NAME;
	  });
	};

	var $trim = stringTrim.trim;


	// `String.prototype.trim` method
	// https://tc39.github.io/ecma262/#sec-string.prototype.trim
	_export({ target: 'String', proto: true, forced: forcedStringTrimMethod('trim') }, {
	  trim: function trim() {
	    return $trim(this);
	  }
	});

	// iterable DOM collections
	// flag - `iterable` interface - 'entries', 'keys', 'values', 'forEach' methods
	var domIterables = {
	  CSSRuleList: 0,
	  CSSStyleDeclaration: 0,
	  CSSValueList: 0,
	  ClientRectList: 0,
	  DOMRectList: 0,
	  DOMStringList: 0,
	  DOMTokenList: 1,
	  DataTransferItemList: 0,
	  FileList: 0,
	  HTMLAllCollection: 0,
	  HTMLCollection: 0,
	  HTMLFormElement: 0,
	  HTMLSelectElement: 0,
	  MediaList: 0,
	  MimeTypeArray: 0,
	  NamedNodeMap: 0,
	  NodeList: 1,
	  PaintRequestList: 0,
	  Plugin: 0,
	  PluginArray: 0,
	  SVGLengthList: 0,
	  SVGNumberList: 0,
	  SVGPathSegList: 0,
	  SVGPointList: 0,
	  SVGStringList: 0,
	  SVGTransformList: 0,
	  SourceBufferList: 0,
	  StyleSheetList: 0,
	  TextTrackCueList: 0,
	  TextTrackList: 0,
	  TouchList: 0
	};

	var $forEach = arrayIteration.forEach;


	// `Array.prototype.forEach` method implementation
	// https://tc39.github.io/ecma262/#sec-array.prototype.foreach
	var arrayForEach = sloppyArrayMethod('forEach') ? function forEach(callbackfn /* , thisArg */) {
	  return $forEach(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	} : [].forEach;

	for (var COLLECTION_NAME in domIterables) {
	  var Collection = global_1[COLLECTION_NAME];
	  var CollectionPrototype = Collection && Collection.prototype;
	  // some Chrome versions have non-configurable methods on DOMTokenList
	  if (CollectionPrototype && CollectionPrototype.forEach !== arrayForEach) try {
	    createNonEnumerableProperty(CollectionPrototype, 'forEach', arrayForEach);
	  } catch (error) {
	    CollectionPrototype.forEach = arrayForEach;
	  }
	}

	var ITERATOR$2 = wellKnownSymbol('iterator');
	var TO_STRING_TAG$3 = wellKnownSymbol('toStringTag');
	var ArrayValues = es_array_iterator.values;

	for (var COLLECTION_NAME$1 in domIterables) {
	  var Collection$1 = global_1[COLLECTION_NAME$1];
	  var CollectionPrototype$1 = Collection$1 && Collection$1.prototype;
	  if (CollectionPrototype$1) {
	    // some Chrome versions have non-configurable methods on DOMTokenList
	    if (CollectionPrototype$1[ITERATOR$2] !== ArrayValues) try {
	      createNonEnumerableProperty(CollectionPrototype$1, ITERATOR$2, ArrayValues);
	    } catch (error) {
	      CollectionPrototype$1[ITERATOR$2] = ArrayValues;
	    }
	    if (!CollectionPrototype$1[TO_STRING_TAG$3]) {
	      createNonEnumerableProperty(CollectionPrototype$1, TO_STRING_TAG$3, COLLECTION_NAME$1);
	    }
	    if (domIterables[COLLECTION_NAME$1]) for (var METHOD_NAME in es_array_iterator) {
	      // some Chrome versions have non-configurable methods on DOMTokenList
	      if (CollectionPrototype$1[METHOD_NAME] !== es_array_iterator[METHOD_NAME]) try {
	        createNonEnumerableProperty(CollectionPrototype$1, METHOD_NAME, es_array_iterator[METHOD_NAME]);
	      } catch (error) {
	        CollectionPrototype$1[METHOD_NAME] = es_array_iterator[METHOD_NAME];
	      }
	    }
	  }
	}

	var loadjs_umd = createCommonjsModule(function (module, exports) {
	  (function (root, factory) {
	    {
	      module.exports = factory();
	    }
	  })(commonjsGlobal, function () {
	    /**
	     * Global dependencies.
	     * @global {Object} document - DOM
	     */
	    var devnull = function devnull() {},
	        bundleIdCache = {},
	        bundleResultCache = {},
	        bundleCallbackQueue = {},
	        config = {};
	    /**
	     * Subscribe to bundle load event.
	     * @param {string[]} bundleIds - Bundle ids
	     * @param {Function} callbackFn - The callback function
	     */


	    function subscribe(bundleIds, callbackFn) {
	      // listify
	      bundleIds = bundleIds.push ? bundleIds : [bundleIds];
	      var depsNotFound = [],
	          i = bundleIds.length,
	          numWaiting = i,
	          fn,
	          bundleId,
	          r,
	          q; // define callback function

	      fn = function fn(bundleId, pathsNotFound) {
	        if (pathsNotFound.length) depsNotFound.push(bundleId);
	        numWaiting--;
	        if (!numWaiting) callbackFn(depsNotFound);
	      }; // register callback


	      while (i--) {
	        bundleId = bundleIds[i]; // execute callback if in result cache

	        r = bundleResultCache[bundleId];

	        if (r) {
	          fn(bundleId, r);
	          continue;
	        } // add to callback queue


	        q = bundleCallbackQueue[bundleId] = bundleCallbackQueue[bundleId] || [];
	        q.push(fn);
	      }
	    }
	    /**
	     * Publish bundle load event.
	     * @param {string} bundleId - Bundle id
	     * @param {string[]} pathsNotFound - List of files not found
	     */


	    function publish(bundleId, pathsNotFound) {
	      // exit if id isn't defined
	      if (!bundleId) return;
	      var q = bundleCallbackQueue[bundleId]; // cache result

	      bundleResultCache[bundleId] = pathsNotFound; // exit if queue is empty

	      if (!q) return; // empty callback queue

	      while (q.length) {
	        q[0](bundleId, pathsNotFound);
	        q.splice(0, 1);
	      }
	    }
	    /**
	     * Load individual file.
	     * @param {string} path - The file path
	     * @param {Function} callbackFn - The callback function
	     */


	    function loadFile(path, callbackFn, args, numTries) {
	      var doc = document,
	          async = args.async,
	          maxTries = (args.numRetries || 0) + 1,
	          beforeCallbackFn = args.before || devnull,
	          isCss,
	          e;
	      numTries = numTries || 0;

	      if (/(^css!|\.css$)/.test(path)) {
	        isCss = true; // css

	        e = doc.createElement('link');
	        e.rel = 'stylesheet';
	        e.href = path.replace(/^css!/, ''); // remove "css!" prefix
	      } else {
	        // javascript
	        e = doc.createElement('script');
	        e.src = path;
	        e.async = async === undefined ? true : async;
	      }

	      e.onload = e.onerror = e.onbeforeload = function (ev) {
	        var result = ev.type[0]; // Note: The following code isolates IE using `hideFocus` and treats empty
	        // stylesheets as failures to get around lack of onerror support

	        if (isCss && 'hideFocus' in e) {
	          try {
	            if (!e.sheet.cssText.length) result = 'e';
	          } catch (x) {
	            // sheets objects created from load errors don't allow access to
	            // `cssText`
	            result = 'e';
	          }
	        } // handle retries in case of load failure


	        if (result == 'e') {
	          // increment counter
	          numTries += 1; // exit function and try again

	          if (numTries < maxTries) {
	            return loadFile(path, callbackFn, args, numTries);
	          }
	        } // execute callback


	        callbackFn(path, result, ev.defaultPrevented);
	      }; // add to document (unless callback returns `false`)


	      if (beforeCallbackFn(path, e) !== false) doc.head.appendChild(e);
	    }
	    /**
	     * Load multiple files.
	     * @param {string[]} paths - The file paths
	     * @param {Function} callbackFn - The callback function
	     */


	    function loadFiles(paths, callbackFn, args) {
	      // listify paths
	      paths = paths.push ? paths : [paths];
	      var numWaiting = paths.length,
	          x = numWaiting,
	          pathsNotFound = [],
	          fn,
	          i; // define callback function

	      fn = function fn(path, result, defaultPrevented) {
	        // handle error
	        if (result == 'e') pathsNotFound.push(path); // handle beforeload event. If defaultPrevented then that means the load
	        // will be blocked (ex. Ghostery/ABP on Safari)

	        if (result == 'b') {
	          if (defaultPrevented) pathsNotFound.push(path);else return;
	        }

	        numWaiting--;
	        if (!numWaiting) callbackFn(pathsNotFound);
	      }; // load scripts


	      for (i = 0; i < x; i++) {
	        loadFile(paths[i], fn, args);
	      }
	    }
	    /**
	     * Initiate script load and register bundle.
	     * @param {(string|string[])} paths - The file paths
	     * @param {(string|Function)} [arg1] - The bundleId or success callback
	     * @param {Function} [arg2] - The success or error callback
	     * @param {Function} [arg3] - The error callback
	     */


	    function loadjs(paths, arg1, arg2) {
	      var bundleId, args; // bundleId (if string)

	      if (arg1 && arg1.trim) bundleId = arg1; // args (default is {})

	      args = (bundleId ? arg2 : arg1) || {}; // throw error if bundle is already defined

	      if (bundleId) {
	        if (bundleId in bundleIdCache) {
	          throw 'LoadJS';
	        } else {
	          bundleIdCache[bundleId] = true;
	        }
	      } // load scripts


	      loadFiles(paths, function (pathsNotFound) {
	        // success and error callbacks
	        if (pathsNotFound.length) (args.error || devnull)(pathsNotFound);else (args.success || devnull)(); // publish bundle load event

	        publish(bundleId, pathsNotFound);
	      }, args);
	    }
	    /**
	     * Execute callbacks when dependencies have been satisfied.
	     * @param {(string|string[])} deps - List of bundle ids
	     * @param {Object} args - success/error arguments
	     */


	    loadjs.ready = function ready(deps, args) {
	      // subscribe to bundle load event
	      subscribe(deps, function (depsNotFound) {
	        // execute callbacks
	        if (depsNotFound.length) (args.error || devnull)(depsNotFound);else (args.success || devnull)();
	      });
	      return loadjs;
	    };
	    /**
	     * Manually satisfy bundle dependencies.
	     * @param {string} bundleId - The bundle id
	     */


	    loadjs.done = function done(bundleId) {
	      publish(bundleId, []);
	    };
	    /**
	     * Reset loadjs dependencies statuses
	     */


	    loadjs.reset = function reset() {
	      bundleIdCache = {};
	      bundleResultCache = {};
	      bundleCallbackQueue = {};
	    };
	    /**
	     * Determine if bundle has already been defined
	     * @param String} bundleId - The bundle id
	     */


	    loadjs.isDefined = function isDefined(bundleId) {
	      return bundleId in bundleIdCache;
	    };
	    /**
	     * load config
	     * @param String json
	     */


	    loadjs.config = function (json) {
	      config = json;
	    };
	    /**
	     * load bundle and dependencies with key
	     * @param String key
	     * @param Function Callback
	     */


	    loadjs.key = function (key, callback) {
	      try {
	        var self = this;
	        var loaded = 0;

	        if (config[key].deps) {
	          loaded = 0;
	          config[key].deps.forEach(function (value) {
	            self.key(value, function () {
	              loaded++;

	              if (loaded == config[key].deps.length) {
	                loadjs(config[key].files, key, {
	                  success: callback
	                });
	              }
	            });
	          });
	        } else {
	          if (config[key].keys) {
	            loaded = 0;
	            config[key].keys.forEach(function (value) {
	              self.key(value, function () {
	                loaded++;

	                if (loaded == config[key].keys.length) {
	                  callback();
	                }
	              });
	            });
	          } else {
	            loadjs(config[key].files, key, {
	              success: callback
	            });
	          }
	        }
	      } catch (e) {
	        loadjs.ready(key, {
	          success: callback
	        });
	      }
	    };
	    /**
	     * load bundle and dependencies by keys
	     * @param Array keys
	     * @param Function Callback
	     */


	    loadjs.keys = function (keys, callback) {
	      var loaded = 0;
	      keys.forEach(function (value) {
	        loadjs.key(value, function () {
	          loaded++;

	          if (loaded == keys.length) {
	            callback();
	          }
	        });
	      });
	    };
	    /**
	     * load bundle by url with key
	     * @param String url
	     * @param String key
	     * @param Function Callback
	     */


	    loadjs.url = function (url, key, callback) {
	      try {
	        loadjs(url, key, {
	          success: callback
	        });
	      } catch (e) {
	        loadjs.ready(key, {
	          success: callback
	        });
	      }
	    }; // export


	    return loadjs;
	  });
	});

	var TO_STRING = 'toString';
	var RegExpPrototype = RegExp.prototype;
	var nativeToString = RegExpPrototype[TO_STRING];

	var NOT_GENERIC = fails(function () { return nativeToString.call({ source: 'a', flags: 'b' }) != '/a/b'; });
	// FF44- RegExp#toString has a wrong name
	var INCORRECT_NAME = nativeToString.name != TO_STRING;

	// `RegExp.prototype.toString` method
	// https://tc39.github.io/ecma262/#sec-regexp.prototype.tostring
	if (NOT_GENERIC || INCORRECT_NAME) {
	  redefine(RegExp.prototype, TO_STRING, function toString() {
	    var R = anObject(this);
	    var p = String(R.source);
	    var rf = R.flags;
	    var f = String(rf === undefined && R instanceof RegExp && !('flags' in RegExpPrototype) ? regexpFlags.call(R) : rf);
	    return '/' + p + '/' + f;
	  }, { unsafe: true });
	}

	var func = function func($btn) {
	  var self = this,
	      $text = $btn.find('span:not(.spinner-border)'),
	      text = $text.text();

	  this.enable = function () {
	    $btn.prop('disabled', false);
	  };

	  this.disable = function () {
	    $btn.attr('disabled', true);
	  };

	  this.process = function () {
	    $btn.addClass('btn-processing');
	    self.disable();
	  };

	  this.processed = function () {
	    $btn.removeClass('btn-processing');
	    self.enable();
	  };

	  this.text = function ($txt) {
	    $text.text($txt);
	  };

	  this.resetText = function () {
	    $text.text(text);
	  };

	  this.data = function ($key, $val) {
	    if ($val) {
	      $btn.attr('data-' + $key, $val);
	    }

	    return $btn.attr('data-' + $key);
	  };
	};

	var MATCH = wellKnownSymbol('match');

	// `IsRegExp` abstract operation
	// https://tc39.github.io/ecma262/#sec-isregexp
	var isRegexp = function (it) {
	  var isRegExp;
	  return isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : classofRaw(it) == 'RegExp');
	};

	var SPECIES$3 = wellKnownSymbol('species');

	var setSpecies = function (CONSTRUCTOR_NAME) {
	  var Constructor = getBuiltIn(CONSTRUCTOR_NAME);
	  var defineProperty = objectDefineProperty.f;

	  if (descriptors && Constructor && !Constructor[SPECIES$3]) {
	    defineProperty(Constructor, SPECIES$3, {
	      configurable: true,
	      get: function () { return this; }
	    });
	  }
	};

	var defineProperty$2 = objectDefineProperty.f;
	var getOwnPropertyNames$1 = objectGetOwnPropertyNames.f;





	var setInternalState$1 = internalState.set;



	var MATCH$1 = wellKnownSymbol('match');
	var NativeRegExp = global_1.RegExp;
	var RegExpPrototype$1 = NativeRegExp.prototype;
	var re1 = /a/g;
	var re2 = /a/g;

	// "new" should create a new object, old webkit bug
	var CORRECT_NEW = new NativeRegExp(re1) !== re1;

	var UNSUPPORTED_Y$2 = regexpStickyHelpers.UNSUPPORTED_Y;

	var FORCED = descriptors && isForced_1('RegExp', (!CORRECT_NEW || UNSUPPORTED_Y$2 || fails(function () {
	  re2[MATCH$1] = false;
	  // RegExp constructor can alter flags and IsRegExp works correct with @@match
	  return NativeRegExp(re1) != re1 || NativeRegExp(re2) == re2 || NativeRegExp(re1, 'i') != '/a/i';
	})));

	// `RegExp` constructor
	// https://tc39.github.io/ecma262/#sec-regexp-constructor
	if (FORCED) {
	  var RegExpWrapper = function RegExp(pattern, flags) {
	    var thisIsRegExp = this instanceof RegExpWrapper;
	    var patternIsRegExp = isRegexp(pattern);
	    var flagsAreUndefined = flags === undefined;
	    var sticky;

	    if (!thisIsRegExp && patternIsRegExp && pattern.constructor === RegExpWrapper && flagsAreUndefined) {
	      return pattern;
	    }

	    if (CORRECT_NEW) {
	      if (patternIsRegExp && !flagsAreUndefined) pattern = pattern.source;
	    } else if (pattern instanceof RegExpWrapper) {
	      if (flagsAreUndefined) flags = regexpFlags.call(pattern);
	      pattern = pattern.source;
	    }

	    if (UNSUPPORTED_Y$2) {
	      sticky = !!flags && flags.indexOf('y') > -1;
	      if (sticky) flags = flags.replace(/y/g, '');
	    }

	    var result = inheritIfRequired(
	      CORRECT_NEW ? new NativeRegExp(pattern, flags) : NativeRegExp(pattern, flags),
	      thisIsRegExp ? this : RegExpPrototype$1,
	      RegExpWrapper
	    );

	    if (UNSUPPORTED_Y$2 && sticky) setInternalState$1(result, { sticky: sticky });

	    return result;
	  };
	  var proxy = function (key) {
	    key in RegExpWrapper || defineProperty$2(RegExpWrapper, key, {
	      configurable: true,
	      get: function () { return NativeRegExp[key]; },
	      set: function (it) { NativeRegExp[key] = it; }
	    });
	  };
	  var keys$2 = getOwnPropertyNames$1(NativeRegExp);
	  var index = 0;
	  while (keys$2.length > index) proxy(keys$2[index++]);
	  RegExpPrototype$1.constructor = RegExpWrapper;
	  RegExpWrapper.prototype = RegExpPrototype$1;
	  redefine(global_1, 'RegExp', RegExpWrapper);
	}

	// https://tc39.github.io/ecma262/#sec-get-regexp-@@species
	setSpecies('RegExp');

	var func$1 = function func(find, replace, $target) {
	  $target = $target ? $target : $(body);
	  var n,
	      walk = document.createTreeWalker($target[0], NodeFilter.SHOW_TEXT, null, false);

	  while (n = walk.nextNode()) {
	    n.textContent = n.textContent.replace(new RegExp(find, 'g'), replace);
	  }
	};

	var func$2 = function func$1($target) {
	  var $btn = new func($target.find('button[type="submit"]'));
	  var $input = $target.find('input[name^="purchasables"][name$="[qty]"]');
	  $target.on('submit', function (e) {
	    var $qty = $target.find('[name="qty"]').val();
	    $input.each(function () {
	      $(this).val(Number($(this).val()) * $qty);
	    });
	    $btn.process();
	  });
	};

	var $filter = arrayIteration.filter;



	var HAS_SPECIES_SUPPORT = arrayMethodHasSpeciesSupport('filter');
	// Edge 14- issue
	var USES_TO_LENGTH = HAS_SPECIES_SUPPORT && !fails(function () {
	  [].filter.call({ length: -1, 0: 1 }, function (it) { throw it; });
	});

	// `Array.prototype.filter` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.filter
	// with adding support of @@species
	_export({ target: 'Array', proto: true, forced: !HAS_SPECIES_SUPPORT || !USES_TO_LENGTH }, {
	  filter: function filter(callbackfn /* , thisArg */) {
	    return $filter(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	  }
	});

	var func$3 = function func$1($target) {
	  var $btn = new func($target.find('button[type="submit"]'));
	  $target.find('[name="qty"]').val(1);
	  $target.on('submit', function (e) {
	    //e.preventDefault();
	    var $qty = $target.find('[name="qty"]'),
	        $input = $(this).find('[name="purchasableId"]'),
	        qty;

	    if ($input[0].tagName == 'SELECT') {
	      qty = $input.find('option:selected').data('qty');
	    } else {
	      qty = $input.filter(':checked').data('qty');
	    }

	    if (qty) {
	      $qty.val(Number($qty.val()) * qty);
	    } //$qty.val(1);
	    // disable btn


	    $btn.process();
	  });
	};

	var func$4 = function func($target) {
	  var $modal = $('.modal#deleteAddressModal'),
	      $input = $modal.find('input#deleteAddressId');
	  $modal.on('show.bs.modal', function (e) {
	    $input.val($(e.relatedTarget).data('address-id'));
	  }).on('hidden.bs.modal', function (e) {
	    $input.val('');
	  });
	};

	var func$5 = function func($target) {
	  var $inputs = $target.find('input[data-address-input="contact"]'),
	      $checkbox = $target.find('input[type="checkbox"]');
	  $inputs.each(function () {
	    var $this = $(this);
	    $this.data('value', $this.val());
	  });
	  $checkbox.on('change', function (e) {
	    if ($checkbox.prop('checked')) {
	      $inputs.each(function () {
	        var $el = $(this);
	        $el.val($el.data('value'));
	      }).prop('readonly', true);
	    } else {
	      $inputs.prop('readonly', false).val('');
	    }
	  }).trigger('change');
	};

	var func$6 = function func($target) {
	  var autocomplete;
	  $target.on('focus', function (e) {
	    geolocate();
	  });
	  window.loader.key('maps', function () {
	    autocomplete = new google.maps.places.Autocomplete($target[0], {
	      types: ['geocode', 'establishment']
	    });
	    autocomplete.setFields(['address_component']);
	    autocomplete.addListener('place_changed', function () {
	      var place = autocomplete.getPlace();
	      console.log(place);
	      var address = {
	        address1: '',
	        address2: '',
	        city: '',
	        stateName: '',
	        zipCode: ''
	      };
	      var business = false;

	      for (var i = 0; i < place.address_components.length; i++) {
	        var addressType = place.address_components[i].types[0];

	        if (addressType == 'subpremise') {
	          address.address1 = place.address_components[i].long_name;
	        }

	        if (addressType == 'premise') {
	          business = true;
	          address.address1 += ' ' + place.address_components[i].long_name;
	        }

	        if (addressType == 'street_number') {
	          if (business) {
	            address.address2 = place.address_components[i].long_name;
	          } else {
	            address.address1 = place.address_components[i].long_name;
	          }
	        }

	        if (addressType == 'route') {
	          if (business) {
	            address.address2 += ' ' + place.address_components[i].long_name;
	          } else {
	            address.address1 += ' ' + place.address_components[i].long_name;
	          }
	        }

	        if (addressType == 'locality') {
	          if (!business) {
	            address.address2 = place.address_components[i].long_name;
	          }
	        }

	        if (addressType == 'postal_town') {
	          address.city = place.address_components[i].long_name;
	        }

	        if (addressType == 'administrative_area_level_2') {
	          address.stateName = place.address_components[i].long_name;
	        }

	        if (addressType == 'postal_code') {
	          address.zipCode = place.address_components[i].long_name;
	        }

	        if (addressType == 'country') {
	          address.country = place.address_components[i].long_name;
	        }
	      }

	      for (var property in address) {
	        $('#' + property).val(address[property]);
	      } //country


	      $('#country option').each(function (i) {
	        if (this.text == address.country) {
	          $('#country')[0].selectedIndex = i;
	        }
	      });
	    });
	  });

	  var geolocate = function geolocate() {
	    if (navigator.geolocation) {
	      navigator.geolocation.getCurrentPosition(function (position) {
	        var geolocation = {
	          lat: position.coords.latitude,
	          lng: position.coords.longitude
	        };
	        var circle = new google.maps.Circle({
	          center: geolocation,
	          radius: position.coords.accuracy
	        });
	        autocomplete.setBounds(circle.getBounds());
	      });
	    }
	  };
	};

	var func$7 = function func($target) {
	  var $tooltip = $target.find('[data-toggle="tooltip"]'),
	      $currency = $target.find('[data-toggle="dropdown"]');
	  /*var $csrf = $('#csrf'),
	  	data = { action: 'api/header' };
	  data[$csrf.data('id')] = $csrf.data('value');*/

	  $.ajax({
	    url: '/api/ecom/header',
	    dataType: 'json'
	  }).done(function (data) {
	    console.log(data); // update basket qty

	    var $qty = $target.find('[data-id="qty"]');
	    $qty.attr('class', '').text(data.cart.qty);

	    if (data.cart.qty == 1) {
	      $qty.addClass('singular');
	    } else {
	      $qty.addClass('plural');
	    } // update account tooltip


	    $tooltip.attr('title', data.user.loggedIn ? 'My Account' : 'Sign in / Register'); // update currency

	    $('[data-id="currency"]').text(data.cart.currency.symbol + data.cart.currency.iso);
	  });
	};

	var nativeJoin = [].join;

	var ES3_STRINGS = indexedObject != Object;
	var SLOPPY_METHOD$1 = sloppyArrayMethod('join', ',');

	// `Array.prototype.join` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.join
	_export({ target: 'Array', proto: true, forced: ES3_STRINGS || SLOPPY_METHOD$1 }, {
	  join: function join(separator) {
	    return nativeJoin.call(toIndexedObject(this), separator === undefined ? ',' : separator);
	  }
	});

	var func$8 = function func$1($target) {
	  // remove freeform ajax enabled callbacks
	  window.renderFormErrors = function (errors, form) {
	    console.log(errors);
	  };

	  window.renderErrors = function (errors, form) {
	    console.log(errors);
	  };

	  var $btn = new func($target.find('button[type="submit"]'));
	  var $success = $target.find('[data-id="success"]');
	  $target.find('form').on('submit', function (e) {
	    var $self = $(this); // e.preventDefault();

	    $success.addClass('d-none');

	    if (this.checkValidity() === true) {
	      $('.is-invalid', $self).removeClass('is-invalid'); //$('button[type=submit]', $self).prop('disabled', true);

	      $.ajax({
	        type: 'post',
	        dataType: 'json',
	        data: $(this).serialize(),
	        success: function success(response) {
	          // console.log(response);
	          if (response.success && response.finished) {
	            $self.addClass('d-none');
	            $self[0].reset();
	            $self.removeClass('was-validated');
	            $success.removeClass('d-none');
	            var scrollPos = $success.offset().top;
	            window.scroller.animateScroll(Number(scrollPos) - Number($('header').outerHeight()));
	          } else if (response.errors) {
	            for (var key in response.errors) {
	              //if (!response.errors.hasOwnProperty(key)) continue;
	              if (!Object.prototype.hasOwnProperty.call(response.errors, key)) continue;
	              var messages = response.errors[key];
	              var $input = $('*[name=' + key + '], *[name="' + key + '[]"]');
	              $input.next('.invalid-feedback').html(messages.join(', '));
	              $input.addClass('is-invalid');
	            }
	          } //$('button[type=submit]', $self).prop('disabled', false);


	          $btn.processed();
	        }
	      });
	      return false;
	    }
	  });
	};

	var func$9 = function func($target) {
	  var id = $target.data('product-id');
	  $target.find('.price').html('<div class="spinner-border spinner-border-sm text-success"><span class="sr-only">Loading...</span></div>');
	  $.ajax({
	    url: '/api/ecom/product/' + id,
	    dataType: 'json'
	  }).done(function (data) {
	    console.log(data);
	    $.each(data.variants, function () {
	      var $variant = $target.find('[data-variant-id="' + this.id + '"]:not([data-qty])');
	      var corrPrice = $variant.find('.price').data(data.currencyIso.toLowerCase());
	      var $sticky = $target.find('option[value="' + this.id + '"]');
	      $variant.find('.price .spinner-border').remove();
	      $sticky.text(corrPrice + ' - ' + this.title);

	      if (this.rrp) {
	        $variant.find('.price').html('<span class="rrp">RRP: <del>' + $variant.find('.price').data('rrp') + '</del></span>');
	      }

	      $variant.find('.price').append(corrPrice);

	      if (this.isAvailable) {
	        $variant.find('.in-stock').addClass('badge-success').text('in stock');
	        $target.find('input[name="purchasableId"][value="' + this.id + '"]').prop('disabled', false);
	        $sticky.prop('disabled', false);
	        $target.find('button#AddToBasketMain').prop('disabled', false);
	        $target.find('button#AddToBasketSticky').prop('disabled', false);

	        if (this.isDefault) {
	          $target.find('input[name="purchasableId"][value="' + this.id + '"]').prop('checked', true);
	          $sticky.prop('selected', true);
	        }
	      } else {
	        console.log('unavailable');
	        $variant.find('.in-stock').addClass('badge-danger').text('out of stock');
	      }
	    });
	  });
	};

	var func$a = function func($target) {
	  console.log('ajax product listing loaded');
	  var ids = [];
	  $target.find('[data-product-id]').each(function () {
	    $(this).find('.price').html('<div class="spinner-border spinner-border-sm text-primary"><span class="sr-only">Loading...</span></div>');
	    ids.push($(this).data('product-id'));
	  });
	  var data = {
	    ids: ids
	  };
	  data[window.csrfTokenName] = window.csrfTokenValue;
	  $.ajax({
	    url: '/api/ecom/products',
	    dataType: 'json',
	    data: data,
	    method: 'POST'
	  }).done(function (data) {
	    console.log(data);
	    $.each(data.products, function () {
	      var span = $target.find('[data-product-id="' + this.id + '"] .price');
	      var corrPrice = span.data(data.currencyIso.toLowerCase());
	      span.find('.spinner-border').remove();

	      if (this.rrp) {
	        span.html('<del>' + span.data('rrp') + '</del> &nbsp;');
	      }

	      span.append(corrPrice);

	      if (this.isAvailable) {
	        $target.find('[data-product-id="' + this.id + '"] :button[type=submit]').prop('disabled', false);
	      } else {
	        $target.find('[data-product-id="' + this.id + '"] :button[type=submit]').text('Out of Stock');
	      }
	    });
	  });
	};

	var func$b = function func$1($target) {
	  var $form = $target,
	      $token = $form.find('[name="gatewayToken"]'),
	      $nonce = $form.find('[name="nonce"]'),
	      amount = $form.find('[name="amount"]').val(),
	      currency = $form.find('[name="currency"]').val(),
	      email = $form.find('[name="email"]').val(),
	      address = JSON.parse($form.find('[name="address"]').val()),
	      $dropinUi = $form.find('[data-id="dropInUi"]'),
	      $submit = new func($form.find('button[type="submit"]'));

	  if ($dropinUi[0]) {
	    window.loader.key('braintree-dropinUI', function () {
	      $submit.process();

	      if ($submit.data('loading')) {
	        $submit.text($submit.data('loading'));
	      }

	      var options = {
	        authorization: $token.val(),
	        container: $dropinUi[0],
	        locale: $dropinUi.data('locale'),
	        vaultManager: $dropinUi.data('manage'),
	        card: {
	          cardholderName: {
	            required: true
	          },
	          vault: {
	            vaultCard: true,
	            allowVaultCardOverride: true
	          }
	        }
	      };

	      if ($dropinUi.attr('data-subscription') == false) {
	        options.paypal = {
	          flow: 'checkout',
	          env: $dropinUi.attr('data-sandbox') ? 'sandbox' : 'production',
	          amount: amount,
	          currency: currency,
	          buttonStyle: {
	            color: 'blue',
	            shape: 'rect',
	            size: 'responsive',
	            label: 'paypal'
	          }
	        };
	        options.applePay = {
	          displayName: $dropinUi.data('name'),
	          paymentRequest: {
	            total: {
	              label: $dropinUi.data('name'),
	              amount: amount
	            }
	          }
	        };
	        options.googlePay = {
	          displayName: $dropinUi.data('name'),
	          paymentRequest: {
	            total: {
	              label: $dropinUi.data('name'),
	              amount: amount
	            }
	          }
	        };
	      }

	      if ($dropinUi.data('threedsecure')) {
	        options.threeDSecure = {
	          amount: amount,
	          email: email,
	          billingAddress: address
	        };
	      }

	      braintree.dropin.create(options, function (err, dropinInstance) {
	        if (err) {
	          console.error(err);

	          if (window.braintreeError) {
	            window.braintreeError(err);
	          }

	          return;
	        } //reset($submit);


	        $submit.resetText();
	        $submit.processed();

	        if (dropinInstance.isPaymentMethodRequestable()) ; //reset($submit);
	        //console.log('isPaymentMethodRequestable');
	        //need for vault


	        dropinInstance.on('paymentMethodRequestable', function (e) {
	          //reset($submit);
	          //console.log('paymentMethodRequestable');
	          $submit.enable();
	        });
	        dropinInstance.on('noPaymentMethodRequestable', function (e) {
	          //processing($submit);
	          //console.log('noPaymentMethodRequestable');
	          $submit.disable();
	        });
	        dropinInstance.on('paymentOptionSelected', function (e) {//$submit.prop('disabled', false);
	          //console.log('paymentOptionSelected');
	        });
	        $form.on('submit', {
	          dropinInstance: dropinInstance,
	          threeDSecure: $dropinUi.data('threedsecure')
	        }, formSubmit);
	      });
	    });
	  }

	  function formSubmit(e) {
	    e.preventDefault(); //console.log(e)

	    var dropinInstance = e.data.dropinInstance,
	        $form = $(e.currentTarget),
	        threeDSecure = e.data.threeDSecure; //$submit = $form.find('button[type="submit"]');
	    //processing($submit);

	    $submit.process();
	    dropinInstance.requestPaymentMethod(function (err, payload) {
	      if (err) {
	        console.error(err);

	        if (window.braintreeError) {
	          window.braintreeError(err);
	        } //reset($submit);


	        $submit.processed();
	        return;
	      } //console.log(payload);


	      if (payload.liabilityShiftPossible && payload.liabilityShifted || !payload.liabilityShiftPossible || payload.type !== 'CreditCard' || !threeDSecure) {
	        //processing($submit);
	        $submit.process();
	        $form.find('input[name=nonce]').val(payload.nonce);
	        $form.find('input[name=type]').val(payload.type);
	        $form.off('submit', formSubmit);
	        $form.submit();
	      } else {
	        if (window.braintreeError) {
	          window.braintreeError('3ds failed');
	        } //dropinInstance.clearSelectedPaymentMethod();
	        //reset($submit);


	        $submit.processed(); //$submit.prop('disabled', true);
	      }
	    });
	  }
	  /*function reset($button) {
	  	$button.prop('disabled', false);
	  	$button.text($button.data('text'));
	  }
	  function processing($button) {
	  	$button.prop('disabled', true);
	  	if ($button.data('processing')) {
	  		$button.text($button.data('processing'));
	  	}
	  }*/

	};

	var func$c = function func($target) {
	  console.log('triggered');
	  var $content = $target.find('input'),
	      $button = $target.find('.btn');
	  $button.on('click touch', function (e) {
	    e.preventDefault();
	    $content.select();
	    document.execCommand('copy'); // alert('Copied to clipboard');

	    $('.alert').removeClass('d-none');
	  });
	};

	var freezing = !fails(function () {
	  return Object.isExtensible(Object.preventExtensions({}));
	});

	var internalMetadata = createCommonjsModule(function (module) {
	var defineProperty = objectDefineProperty.f;



	var METADATA = uid('meta');
	var id = 0;

	var isExtensible = Object.isExtensible || function () {
	  return true;
	};

	var setMetadata = function (it) {
	  defineProperty(it, METADATA, { value: {
	    objectID: 'O' + ++id, // object ID
	    weakData: {}          // weak collections IDs
	  } });
	};

	var fastKey = function (it, create) {
	  // return a primitive with prefix
	  if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
	  if (!has(it, METADATA)) {
	    // can't set metadata to uncaught frozen object
	    if (!isExtensible(it)) return 'F';
	    // not necessary to add metadata
	    if (!create) return 'E';
	    // add missing metadata
	    setMetadata(it);
	  // return object ID
	  } return it[METADATA].objectID;
	};

	var getWeakData = function (it, create) {
	  if (!has(it, METADATA)) {
	    // can't set metadata to uncaught frozen object
	    if (!isExtensible(it)) return true;
	    // not necessary to add metadata
	    if (!create) return false;
	    // add missing metadata
	    setMetadata(it);
	  // return the store of weak collections IDs
	  } return it[METADATA].weakData;
	};

	// add metadata on freeze-family methods calling
	var onFreeze = function (it) {
	  if (freezing && meta.REQUIRED && isExtensible(it) && !has(it, METADATA)) setMetadata(it);
	  return it;
	};

	var meta = module.exports = {
	  REQUIRED: false,
	  fastKey: fastKey,
	  getWeakData: getWeakData,
	  onFreeze: onFreeze
	};

	hiddenKeys[METADATA] = true;
	});
	var internalMetadata_1 = internalMetadata.REQUIRED;
	var internalMetadata_2 = internalMetadata.fastKey;
	var internalMetadata_3 = internalMetadata.getWeakData;
	var internalMetadata_4 = internalMetadata.onFreeze;

	var ITERATOR$3 = wellKnownSymbol('iterator');
	var ArrayPrototype$1 = Array.prototype;

	// check on default Array iterator
	var isArrayIteratorMethod = function (it) {
	  return it !== undefined && (iterators.Array === it || ArrayPrototype$1[ITERATOR$3] === it);
	};

	var ITERATOR$4 = wellKnownSymbol('iterator');

	var getIteratorMethod = function (it) {
	  if (it != undefined) return it[ITERATOR$4]
	    || it['@@iterator']
	    || iterators[classof(it)];
	};

	// call something on iterator step with safe closing on error
	var callWithSafeIterationClosing = function (iterator, fn, value, ENTRIES) {
	  try {
	    return ENTRIES ? fn(anObject(value)[0], value[1]) : fn(value);
	  // 7.4.6 IteratorClose(iterator, completion)
	  } catch (error) {
	    var returnMethod = iterator['return'];
	    if (returnMethod !== undefined) anObject(returnMethod.call(iterator));
	    throw error;
	  }
	};

	var iterate_1 = createCommonjsModule(function (module) {
	var Result = function (stopped, result) {
	  this.stopped = stopped;
	  this.result = result;
	};

	var iterate = module.exports = function (iterable, fn, that, AS_ENTRIES, IS_ITERATOR) {
	  var boundFunction = bindContext(fn, that, AS_ENTRIES ? 2 : 1);
	  var iterator, iterFn, index, length, result, next, step;

	  if (IS_ITERATOR) {
	    iterator = iterable;
	  } else {
	    iterFn = getIteratorMethod(iterable);
	    if (typeof iterFn != 'function') throw TypeError('Target is not iterable');
	    // optimisation for array iterators
	    if (isArrayIteratorMethod(iterFn)) {
	      for (index = 0, length = toLength(iterable.length); length > index; index++) {
	        result = AS_ENTRIES
	          ? boundFunction(anObject(step = iterable[index])[0], step[1])
	          : boundFunction(iterable[index]);
	        if (result && result instanceof Result) return result;
	      } return new Result(false);
	    }
	    iterator = iterFn.call(iterable);
	  }

	  next = iterator.next;
	  while (!(step = next.call(iterator)).done) {
	    result = callWithSafeIterationClosing(iterator, boundFunction, step.value, AS_ENTRIES);
	    if (typeof result == 'object' && result && result instanceof Result) return result;
	  } return new Result(false);
	};

	iterate.stop = function (result) {
	  return new Result(true, result);
	};
	});

	var anInstance = function (it, Constructor, name) {
	  if (!(it instanceof Constructor)) {
	    throw TypeError('Incorrect ' + (name ? name + ' ' : '') + 'invocation');
	  } return it;
	};

	var ITERATOR$5 = wellKnownSymbol('iterator');
	var SAFE_CLOSING = false;

	try {
	  var called = 0;
	  var iteratorWithReturn = {
	    next: function () {
	      return { done: !!called++ };
	    },
	    'return': function () {
	      SAFE_CLOSING = true;
	    }
	  };
	  iteratorWithReturn[ITERATOR$5] = function () {
	    return this;
	  };
	  // eslint-disable-next-line no-throw-literal
	  Array.from(iteratorWithReturn, function () { throw 2; });
	} catch (error) { /* empty */ }

	var checkCorrectnessOfIteration = function (exec, SKIP_CLOSING) {
	  if (!SKIP_CLOSING && !SAFE_CLOSING) return false;
	  var ITERATION_SUPPORT = false;
	  try {
	    var object = {};
	    object[ITERATOR$5] = function () {
	      return {
	        next: function () {
	          return { done: ITERATION_SUPPORT = true };
	        }
	      };
	    };
	    exec(object);
	  } catch (error) { /* empty */ }
	  return ITERATION_SUPPORT;
	};

	var collection = function (CONSTRUCTOR_NAME, wrapper, common) {
	  var IS_MAP = CONSTRUCTOR_NAME.indexOf('Map') !== -1;
	  var IS_WEAK = CONSTRUCTOR_NAME.indexOf('Weak') !== -1;
	  var ADDER = IS_MAP ? 'set' : 'add';
	  var NativeConstructor = global_1[CONSTRUCTOR_NAME];
	  var NativePrototype = NativeConstructor && NativeConstructor.prototype;
	  var Constructor = NativeConstructor;
	  var exported = {};

	  var fixMethod = function (KEY) {
	    var nativeMethod = NativePrototype[KEY];
	    redefine(NativePrototype, KEY,
	      KEY == 'add' ? function add(value) {
	        nativeMethod.call(this, value === 0 ? 0 : value);
	        return this;
	      } : KEY == 'delete' ? function (key) {
	        return IS_WEAK && !isObject(key) ? false : nativeMethod.call(this, key === 0 ? 0 : key);
	      } : KEY == 'get' ? function get(key) {
	        return IS_WEAK && !isObject(key) ? undefined : nativeMethod.call(this, key === 0 ? 0 : key);
	      } : KEY == 'has' ? function has(key) {
	        return IS_WEAK && !isObject(key) ? false : nativeMethod.call(this, key === 0 ? 0 : key);
	      } : function set(key, value) {
	        nativeMethod.call(this, key === 0 ? 0 : key, value);
	        return this;
	      }
	    );
	  };

	  // eslint-disable-next-line max-len
	  if (isForced_1(CONSTRUCTOR_NAME, typeof NativeConstructor != 'function' || !(IS_WEAK || NativePrototype.forEach && !fails(function () {
	    new NativeConstructor().entries().next();
	  })))) {
	    // create collection constructor
	    Constructor = common.getConstructor(wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER);
	    internalMetadata.REQUIRED = true;
	  } else if (isForced_1(CONSTRUCTOR_NAME, true)) {
	    var instance = new Constructor();
	    // early implementations not supports chaining
	    var HASNT_CHAINING = instance[ADDER](IS_WEAK ? {} : -0, 1) != instance;
	    // V8 ~ Chromium 40- weak-collections throws on primitives, but should return false
	    var THROWS_ON_PRIMITIVES = fails(function () { instance.has(1); });
	    // most early implementations doesn't supports iterables, most modern - not close it correctly
	    // eslint-disable-next-line no-new
	    var ACCEPT_ITERABLES = checkCorrectnessOfIteration(function (iterable) { new NativeConstructor(iterable); });
	    // for early implementations -0 and +0 not the same
	    var BUGGY_ZERO = !IS_WEAK && fails(function () {
	      // V8 ~ Chromium 42- fails only with 5+ elements
	      var $instance = new NativeConstructor();
	      var index = 5;
	      while (index--) $instance[ADDER](index, index);
	      return !$instance.has(-0);
	    });

	    if (!ACCEPT_ITERABLES) {
	      Constructor = wrapper(function (dummy, iterable) {
	        anInstance(dummy, Constructor, CONSTRUCTOR_NAME);
	        var that = inheritIfRequired(new NativeConstructor(), dummy, Constructor);
	        if (iterable != undefined) iterate_1(iterable, that[ADDER], that, IS_MAP);
	        return that;
	      });
	      Constructor.prototype = NativePrototype;
	      NativePrototype.constructor = Constructor;
	    }

	    if (THROWS_ON_PRIMITIVES || BUGGY_ZERO) {
	      fixMethod('delete');
	      fixMethod('has');
	      IS_MAP && fixMethod('get');
	    }

	    if (BUGGY_ZERO || HASNT_CHAINING) fixMethod(ADDER);

	    // weak collections should not contains .clear method
	    if (IS_WEAK && NativePrototype.clear) delete NativePrototype.clear;
	  }

	  exported[CONSTRUCTOR_NAME] = Constructor;
	  _export({ global: true, forced: Constructor != NativeConstructor }, exported);

	  setToStringTag(Constructor, CONSTRUCTOR_NAME);

	  if (!IS_WEAK) common.setStrong(Constructor, CONSTRUCTOR_NAME, IS_MAP);

	  return Constructor;
	};

	var redefineAll = function (target, src, options) {
	  for (var key in src) redefine(target, key, src[key], options);
	  return target;
	};

	var defineProperty$3 = objectDefineProperty.f;








	var fastKey = internalMetadata.fastKey;


	var setInternalState$2 = internalState.set;
	var internalStateGetterFor = internalState.getterFor;

	var collectionStrong = {
	  getConstructor: function (wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER) {
	    var C = wrapper(function (that, iterable) {
	      anInstance(that, C, CONSTRUCTOR_NAME);
	      setInternalState$2(that, {
	        type: CONSTRUCTOR_NAME,
	        index: objectCreate(null),
	        first: undefined,
	        last: undefined,
	        size: 0
	      });
	      if (!descriptors) that.size = 0;
	      if (iterable != undefined) iterate_1(iterable, that[ADDER], that, IS_MAP);
	    });

	    var getInternalState = internalStateGetterFor(CONSTRUCTOR_NAME);

	    var define = function (that, key, value) {
	      var state = getInternalState(that);
	      var entry = getEntry(that, key);
	      var previous, index;
	      // change existing entry
	      if (entry) {
	        entry.value = value;
	      // create new entry
	      } else {
	        state.last = entry = {
	          index: index = fastKey(key, true),
	          key: key,
	          value: value,
	          previous: previous = state.last,
	          next: undefined,
	          removed: false
	        };
	        if (!state.first) state.first = entry;
	        if (previous) previous.next = entry;
	        if (descriptors) state.size++;
	        else that.size++;
	        // add to index
	        if (index !== 'F') state.index[index] = entry;
	      } return that;
	    };

	    var getEntry = function (that, key) {
	      var state = getInternalState(that);
	      // fast case
	      var index = fastKey(key);
	      var entry;
	      if (index !== 'F') return state.index[index];
	      // frozen object case
	      for (entry = state.first; entry; entry = entry.next) {
	        if (entry.key == key) return entry;
	      }
	    };

	    redefineAll(C.prototype, {
	      // 23.1.3.1 Map.prototype.clear()
	      // 23.2.3.2 Set.prototype.clear()
	      clear: function clear() {
	        var that = this;
	        var state = getInternalState(that);
	        var data = state.index;
	        var entry = state.first;
	        while (entry) {
	          entry.removed = true;
	          if (entry.previous) entry.previous = entry.previous.next = undefined;
	          delete data[entry.index];
	          entry = entry.next;
	        }
	        state.first = state.last = undefined;
	        if (descriptors) state.size = 0;
	        else that.size = 0;
	      },
	      // 23.1.3.3 Map.prototype.delete(key)
	      // 23.2.3.4 Set.prototype.delete(value)
	      'delete': function (key) {
	        var that = this;
	        var state = getInternalState(that);
	        var entry = getEntry(that, key);
	        if (entry) {
	          var next = entry.next;
	          var prev = entry.previous;
	          delete state.index[entry.index];
	          entry.removed = true;
	          if (prev) prev.next = next;
	          if (next) next.previous = prev;
	          if (state.first == entry) state.first = next;
	          if (state.last == entry) state.last = prev;
	          if (descriptors) state.size--;
	          else that.size--;
	        } return !!entry;
	      },
	      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
	      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
	      forEach: function forEach(callbackfn /* , that = undefined */) {
	        var state = getInternalState(this);
	        var boundFunction = bindContext(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
	        var entry;
	        while (entry = entry ? entry.next : state.first) {
	          boundFunction(entry.value, entry.key, this);
	          // revert to the last existing entry
	          while (entry && entry.removed) entry = entry.previous;
	        }
	      },
	      // 23.1.3.7 Map.prototype.has(key)
	      // 23.2.3.7 Set.prototype.has(value)
	      has: function has(key) {
	        return !!getEntry(this, key);
	      }
	    });

	    redefineAll(C.prototype, IS_MAP ? {
	      // 23.1.3.6 Map.prototype.get(key)
	      get: function get(key) {
	        var entry = getEntry(this, key);
	        return entry && entry.value;
	      },
	      // 23.1.3.9 Map.prototype.set(key, value)
	      set: function set(key, value) {
	        return define(this, key === 0 ? 0 : key, value);
	      }
	    } : {
	      // 23.2.3.1 Set.prototype.add(value)
	      add: function add(value) {
	        return define(this, value = value === 0 ? 0 : value, value);
	      }
	    });
	    if (descriptors) defineProperty$3(C.prototype, 'size', {
	      get: function () {
	        return getInternalState(this).size;
	      }
	    });
	    return C;
	  },
	  setStrong: function (C, CONSTRUCTOR_NAME, IS_MAP) {
	    var ITERATOR_NAME = CONSTRUCTOR_NAME + ' Iterator';
	    var getInternalCollectionState = internalStateGetterFor(CONSTRUCTOR_NAME);
	    var getInternalIteratorState = internalStateGetterFor(ITERATOR_NAME);
	    // add .keys, .values, .entries, [@@iterator]
	    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
	    defineIterator(C, CONSTRUCTOR_NAME, function (iterated, kind) {
	      setInternalState$2(this, {
	        type: ITERATOR_NAME,
	        target: iterated,
	        state: getInternalCollectionState(iterated),
	        kind: kind,
	        last: undefined
	      });
	    }, function () {
	      var state = getInternalIteratorState(this);
	      var kind = state.kind;
	      var entry = state.last;
	      // revert to the last existing entry
	      while (entry && entry.removed) entry = entry.previous;
	      // get next entry
	      if (!state.target || !(state.last = entry = entry ? entry.next : state.state.first)) {
	        // or finish the iteration
	        state.target = undefined;
	        return { value: undefined, done: true };
	      }
	      // return step by kind
	      if (kind == 'keys') return { value: entry.key, done: false };
	      if (kind == 'values') return { value: entry.value, done: false };
	      return { value: [entry.key, entry.value], done: false };
	    }, IS_MAP ? 'entries' : 'values', !IS_MAP, true);

	    // add [@@species], 23.1.2.2, 23.2.2.2
	    setSpecies(CONSTRUCTOR_NAME);
	  }
	};

	// `Map` constructor
	// https://tc39.github.io/ecma262/#sec-map-objects
	var es_map = collection('Map', function (init) {
	  return function Map() { return init(this, arguments.length ? arguments[0] : undefined); };
	}, collectionStrong);

	var charAt$1 = stringMultibyte.charAt;



	var STRING_ITERATOR = 'String Iterator';
	var setInternalState$3 = internalState.set;
	var getInternalState$1 = internalState.getterFor(STRING_ITERATOR);

	// `String.prototype[@@iterator]` method
	// https://tc39.github.io/ecma262/#sec-string.prototype-@@iterator
	defineIterator(String, 'String', function (iterated) {
	  setInternalState$3(this, {
	    type: STRING_ITERATOR,
	    string: String(iterated),
	    index: 0
	  });
	// `%StringIteratorPrototype%.next` method
	// https://tc39.github.io/ecma262/#sec-%stringiteratorprototype%.next
	}, function next() {
	  var state = getInternalState$1(this);
	  var string = state.string;
	  var index = state.index;
	  var point;
	  if (index >= string.length) return { value: undefined, done: true };
	  point = charAt$1(string, index);
	  state.index += point.length;
	  return { value: point, done: false };
	});

	var getWeakData = internalMetadata.getWeakData;








	var setInternalState$4 = internalState.set;
	var internalStateGetterFor$1 = internalState.getterFor;
	var find = arrayIteration.find;
	var findIndex = arrayIteration.findIndex;
	var id$1 = 0;

	// fallback for uncaught frozen keys
	var uncaughtFrozenStore = function (store) {
	  return store.frozen || (store.frozen = new UncaughtFrozenStore());
	};

	var UncaughtFrozenStore = function () {
	  this.entries = [];
	};

	var findUncaughtFrozen = function (store, key) {
	  return find(store.entries, function (it) {
	    return it[0] === key;
	  });
	};

	UncaughtFrozenStore.prototype = {
	  get: function (key) {
	    var entry = findUncaughtFrozen(this, key);
	    if (entry) return entry[1];
	  },
	  has: function (key) {
	    return !!findUncaughtFrozen(this, key);
	  },
	  set: function (key, value) {
	    var entry = findUncaughtFrozen(this, key);
	    if (entry) entry[1] = value;
	    else this.entries.push([key, value]);
	  },
	  'delete': function (key) {
	    var index = findIndex(this.entries, function (it) {
	      return it[0] === key;
	    });
	    if (~index) this.entries.splice(index, 1);
	    return !!~index;
	  }
	};

	var collectionWeak = {
	  getConstructor: function (wrapper, CONSTRUCTOR_NAME, IS_MAP, ADDER) {
	    var C = wrapper(function (that, iterable) {
	      anInstance(that, C, CONSTRUCTOR_NAME);
	      setInternalState$4(that, {
	        type: CONSTRUCTOR_NAME,
	        id: id$1++,
	        frozen: undefined
	      });
	      if (iterable != undefined) iterate_1(iterable, that[ADDER], that, IS_MAP);
	    });

	    var getInternalState = internalStateGetterFor$1(CONSTRUCTOR_NAME);

	    var define = function (that, key, value) {
	      var state = getInternalState(that);
	      var data = getWeakData(anObject(key), true);
	      if (data === true) uncaughtFrozenStore(state).set(key, value);
	      else data[state.id] = value;
	      return that;
	    };

	    redefineAll(C.prototype, {
	      // 23.3.3.2 WeakMap.prototype.delete(key)
	      // 23.4.3.3 WeakSet.prototype.delete(value)
	      'delete': function (key) {
	        var state = getInternalState(this);
	        if (!isObject(key)) return false;
	        var data = getWeakData(key);
	        if (data === true) return uncaughtFrozenStore(state)['delete'](key);
	        return data && has(data, state.id) && delete data[state.id];
	      },
	      // 23.3.3.4 WeakMap.prototype.has(key)
	      // 23.4.3.4 WeakSet.prototype.has(value)
	      has: function has$1(key) {
	        var state = getInternalState(this);
	        if (!isObject(key)) return false;
	        var data = getWeakData(key);
	        if (data === true) return uncaughtFrozenStore(state).has(key);
	        return data && has(data, state.id);
	      }
	    });

	    redefineAll(C.prototype, IS_MAP ? {
	      // 23.3.3.3 WeakMap.prototype.get(key)
	      get: function get(key) {
	        var state = getInternalState(this);
	        if (isObject(key)) {
	          var data = getWeakData(key);
	          if (data === true) return uncaughtFrozenStore(state).get(key);
	          return data ? data[state.id] : undefined;
	        }
	      },
	      // 23.3.3.5 WeakMap.prototype.set(key, value)
	      set: function set(key, value) {
	        return define(this, key, value);
	      }
	    } : {
	      // 23.4.3.1 WeakSet.prototype.add(value)
	      add: function add(value) {
	        return define(this, value, true);
	      }
	    });

	    return C;
	  }
	};

	var es_weakMap = createCommonjsModule(function (module) {






	var enforceIternalState = internalState.enforce;


	var IS_IE11 = !global_1.ActiveXObject && 'ActiveXObject' in global_1;
	var isExtensible = Object.isExtensible;
	var InternalWeakMap;

	var wrapper = function (init) {
	  return function WeakMap() {
	    return init(this, arguments.length ? arguments[0] : undefined);
	  };
	};

	// `WeakMap` constructor
	// https://tc39.github.io/ecma262/#sec-weakmap-constructor
	var $WeakMap = module.exports = collection('WeakMap', wrapper, collectionWeak);

	// IE11 WeakMap frozen keys fix
	// We can't use feature detection because it crash some old IE builds
	// https://github.com/zloirock/core-js/issues/485
	if (nativeWeakMap && IS_IE11) {
	  InternalWeakMap = collectionWeak.getConstructor(wrapper, 'WeakMap', true);
	  internalMetadata.REQUIRED = true;
	  var WeakMapPrototype = $WeakMap.prototype;
	  var nativeDelete = WeakMapPrototype['delete'];
	  var nativeHas = WeakMapPrototype.has;
	  var nativeGet = WeakMapPrototype.get;
	  var nativeSet = WeakMapPrototype.set;
	  redefineAll(WeakMapPrototype, {
	    'delete': function (key) {
	      if (isObject(key) && !isExtensible(key)) {
	        var state = enforceIternalState(this);
	        if (!state.frozen) state.frozen = new InternalWeakMap();
	        return nativeDelete.call(this, key) || state.frozen['delete'](key);
	      } return nativeDelete.call(this, key);
	    },
	    has: function has(key) {
	      if (isObject(key) && !isExtensible(key)) {
	        var state = enforceIternalState(this);
	        if (!state.frozen) state.frozen = new InternalWeakMap();
	        return nativeHas.call(this, key) || state.frozen.has(key);
	      } return nativeHas.call(this, key);
	    },
	    get: function get(key) {
	      if (isObject(key) && !isExtensible(key)) {
	        var state = enforceIternalState(this);
	        if (!state.frozen) state.frozen = new InternalWeakMap();
	        return nativeHas.call(this, key) ? nativeGet.call(this, key) : state.frozen.get(key);
	      } return nativeGet.call(this, key);
	    },
	    set: function set(key, value) {
	      if (isObject(key) && !isExtensible(key)) {
	        var state = enforceIternalState(this);
	        if (!state.frozen) state.frozen = new InternalWeakMap();
	        nativeHas.call(this, key) ? nativeSet.call(this, key, value) : state.frozen.set(key, value);
	      } else nativeSet.call(this, key, value);
	      return this;
	    }
	  });
	}
	});

	var createCache = function createCache(lastNumberWeakMap) {
	  return function (collection, nextNumber) {
	    lastNumberWeakMap.set(collection, nextNumber);
	    return nextNumber;
	  };
	};

	// `Number.MAX_SAFE_INTEGER` constant
	// https://tc39.github.io/ecma262/#sec-number.max_safe_integer
	_export({ target: 'Number', stat: true }, {
	  MAX_SAFE_INTEGER: 0x1FFFFFFFFFFFFF
	});

	/*
	 * The value of the constant Number.MAX_SAFE_INTEGER equals (2 ** 53 - 1) but it
	 * is fairly new.
	 */
	var MAX_SAFE_INTEGER$1 = Number.MAX_SAFE_INTEGER === undefined ? 9007199254740991 : Number.MAX_SAFE_INTEGER;
	var createGenerateUniqueNumber = function createGenerateUniqueNumber(cache, lastNumberWeakMap) {
	  return function (collection) {
	    var lastNumber = lastNumberWeakMap.get(collection);
	    /*
	     * Let's try the cheapest algorithm first. It might fail to produce a new
	     * number, but it is so cheap that it is okay to take the risk. Just
	     * increase the last number by one or reset it to 0 if we reached the upper
	     * bound of SMIs (which stands for small integers). When the last number is
	     * unknown it is assumed that the collection contains zero based consecutive
	     * numbers.
	     */

	    var nextNumber = lastNumber === undefined ? collection.size : lastNumber > 2147483646 ? 0 : lastNumber + 1;

	    if (!collection.has(nextNumber)) {
	      return cache(collection, nextNumber);
	    }
	    /*
	     * If there are less than half of 2 ** 31 numbers stored in the collection,
	     * the chance to generate a new random number in the range from 0 to 2 ** 31
	     * is at least 50%. It's benifitial to use only SMIs because they perform
	     * much better in any environment based on V8.
	     */


	    if (collection.size < 1073741824) {
	      while (collection.has(nextNumber)) {
	        nextNumber = Math.floor(Math.random() * 2147483648);
	      }

	      return cache(collection, nextNumber);
	    } // Quickly check if there is a theoretical chance to generate a new number.


	    if (collection.size > MAX_SAFE_INTEGER$1) {
	      throw new Error('Congratulations, you created a collection of unique numbers which uses all available integers!');
	    } // Otherwise use the full scale of safely usable integers.


	    while (collection.has(nextNumber)) {
	      nextNumber = Math.floor(Math.random() * MAX_SAFE_INTEGER$1);
	    }

	    return cache(collection, nextNumber);
	  };
	};

	var LAST_NUMBER_WEAK_MAP = new WeakMap();
	var cache = createCache(LAST_NUMBER_WEAK_MAP);
	var generateUniqueNumber = createGenerateUniqueNumber(cache, LAST_NUMBER_WEAK_MAP);

	var isCallNotification = function isCallNotification(message) {
	  return message.method !== undefined && message.method === 'call';
	};

	var isClearResponse = function isClearResponse(message) {
	  return message.error === null && typeof message.id === 'number';
	};

	var load = function load(url) {
	  var scheduledIntervalFunctions = new Map();
	  var scheduledTimeoutFunctions = new Map();
	  var unrespondedRequests = new Map();
	  var worker = new Worker(url);
	  worker.addEventListener('message', function (_ref) {
	    var data = _ref.data;

	    if (isCallNotification(data)) {
	      var _data$params = data.params,
	          timerId = _data$params.timerId,
	          timerType = _data$params.timerType;

	      if (timerType === 'interval') {
	        var idOrFunc = scheduledIntervalFunctions.get(timerId);

	        if (typeof idOrFunc === 'number') {
	          var timerIdAndTimerType = unrespondedRequests.get(idOrFunc);

	          if (timerIdAndTimerType === undefined || timerIdAndTimerType.timerId !== timerId || timerIdAndTimerType.timerType !== timerType) {
	            throw new Error('The timer is in an undefined state.');
	          }
	        } else if (typeof idOrFunc !== 'undefined') {
	          idOrFunc();
	        } else {
	          throw new Error('The timer is in an undefined state.');
	        }
	      } else if (timerType === 'timeout') {
	        var _idOrFunc = scheduledTimeoutFunctions.get(timerId);

	        if (typeof _idOrFunc === 'number') {
	          var _timerIdAndTimerType = unrespondedRequests.get(_idOrFunc);

	          if (_timerIdAndTimerType === undefined || _timerIdAndTimerType.timerId !== timerId || _timerIdAndTimerType.timerType !== timerType) {
	            throw new Error('The timer is in an undefined state.');
	          }
	        } else if (typeof _idOrFunc !== 'undefined') {
	          _idOrFunc(); // A timeout can be savely deleted because it is only called once.


	          scheduledTimeoutFunctions.delete(timerId);
	        } else {
	          throw new Error('The timer is in an undefined state.');
	        }
	      }
	    } else if (isClearResponse(data)) {
	      var id = data.id;

	      var _timerIdAndTimerType2 = unrespondedRequests.get(id);

	      if (_timerIdAndTimerType2 === undefined) {
	        throw new Error('The timer is in an undefined state.');
	      }

	      var _timerId = _timerIdAndTimerType2.timerId,
	          _timerType = _timerIdAndTimerType2.timerType;
	      unrespondedRequests.delete(id);

	      if (_timerType === 'interval') {
	        scheduledIntervalFunctions.delete(_timerId);
	      } else {
	        scheduledTimeoutFunctions.delete(_timerId);
	      }
	    } else {
	      var message = data.error.message;
	      throw new Error(message);
	    }
	  });

	  var clearInterval = function clearInterval(timerId) {
	    var id = generateUniqueNumber(unrespondedRequests);
	    unrespondedRequests.set(id, {
	      timerId: timerId,
	      timerType: 'interval'
	    });
	    scheduledIntervalFunctions.set(timerId, id);
	    worker.postMessage({
	      id: id,
	      method: 'clear',
	      params: {
	        timerId: timerId,
	        timerType: 'interval'
	      }
	    });
	  };

	  var clearTimeout = function clearTimeout(timerId) {
	    var id = generateUniqueNumber(unrespondedRequests);
	    unrespondedRequests.set(id, {
	      timerId: timerId,
	      timerType: 'timeout'
	    });
	    scheduledTimeoutFunctions.set(timerId, id);
	    worker.postMessage({
	      id: id,
	      method: 'clear',
	      params: {
	        timerId: timerId,
	        timerType: 'timeout'
	      }
	    });
	  };

	  var setInterval = function setInterval(func, delay) {
	    var timerId = generateUniqueNumber(scheduledIntervalFunctions);
	    scheduledIntervalFunctions.set(timerId, function () {
	      func(); // Doublecheck if the interval should still be rescheduled because it could have been cleared inside of func().

	      if (typeof scheduledIntervalFunctions.get(timerId) === 'function') {
	        worker.postMessage({
	          id: null,
	          method: 'set',
	          params: {
	            delay: delay,
	            now: performance.now(),
	            timerId: timerId,
	            timerType: 'interval'
	          }
	        });
	      }
	    });
	    worker.postMessage({
	      id: null,
	      method: 'set',
	      params: {
	        delay: delay,
	        now: performance.now(),
	        timerId: timerId,
	        timerType: 'interval'
	      }
	    });
	    return timerId;
	  };

	  var setTimeout = function setTimeout(func, delay) {
	    var timerId = generateUniqueNumber(scheduledTimeoutFunctions);
	    scheduledTimeoutFunctions.set(timerId, func);
	    worker.postMessage({
	      id: null,
	      method: 'set',
	      params: {
	        delay: delay,
	        now: performance.now(),
	        timerId: timerId,
	        timerType: 'timeout'
	      }
	    });
	    return timerId;
	  };

	  return {
	    clearInterval: clearInterval,
	    clearTimeout: clearTimeout,
	    setInterval: setInterval,
	    setTimeout: setTimeout
	  };
	};

	var ITERATOR$6 = wellKnownSymbol('iterator');

	var nativeUrl = !fails(function () {
	  var url = new URL('b?a=1&b=2&c=3', 'http://a');
	  var searchParams = url.searchParams;
	  var result = '';
	  url.pathname = 'c%20d';
	  searchParams.forEach(function (value, key) {
	    searchParams['delete']('b');
	    result += key + value;
	  });
	  return (isPure && !url.toJSON)
	    || !searchParams.sort
	    || url.href !== 'http://a/c%20d?a=1&c=3'
	    || searchParams.get('c') !== '3'
	    || String(new URLSearchParams('?a=1')) !== 'a=1'
	    || !searchParams[ITERATOR$6]
	    // throws in Edge
	    || new URL('https://a@b').username !== 'a'
	    || new URLSearchParams(new URLSearchParams('a=b')).get('a') !== 'b'
	    // not punycoded in Edge
	    || new URL('http://тест').host !== 'xn--e1aybc'
	    // not escaped in Chrome 62-
	    || new URL('http://a#б').hash !== '#%D0%B1'
	    // fails in Chrome 66-
	    || result !== 'a1c3'
	    // throws in Safari
	    || new URL('http://x', undefined).host !== 'x';
	});

	var nativeAssign = Object.assign;
	var defineProperty$4 = Object.defineProperty;

	// `Object.assign` method
	// https://tc39.github.io/ecma262/#sec-object.assign
	var objectAssign = !nativeAssign || fails(function () {
	  // should have correct order of operations (Edge bug)
	  if (descriptors && nativeAssign({ b: 1 }, nativeAssign(defineProperty$4({}, 'a', {
	    enumerable: true,
	    get: function () {
	      defineProperty$4(this, 'b', {
	        value: 3,
	        enumerable: false
	      });
	    }
	  }), { b: 2 })).b !== 1) return true;
	  // should work with symbols and should have deterministic property order (V8 bug)
	  var A = {};
	  var B = {};
	  // eslint-disable-next-line no-undef
	  var symbol = Symbol();
	  var alphabet = 'abcdefghijklmnopqrst';
	  A[symbol] = 7;
	  alphabet.split('').forEach(function (chr) { B[chr] = chr; });
	  return nativeAssign({}, A)[symbol] != 7 || objectKeys(nativeAssign({}, B)).join('') != alphabet;
	}) ? function assign(target, source) { // eslint-disable-line no-unused-vars
	  var T = toObject(target);
	  var argumentsLength = arguments.length;
	  var index = 1;
	  var getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
	  var propertyIsEnumerable = objectPropertyIsEnumerable.f;
	  while (argumentsLength > index) {
	    var S = indexedObject(arguments[index++]);
	    var keys = getOwnPropertySymbols ? objectKeys(S).concat(getOwnPropertySymbols(S)) : objectKeys(S);
	    var length = keys.length;
	    var j = 0;
	    var key;
	    while (length > j) {
	      key = keys[j++];
	      if (!descriptors || propertyIsEnumerable.call(S, key)) T[key] = S[key];
	    }
	  } return T;
	} : nativeAssign;

	// `Array.from` method implementation
	// https://tc39.github.io/ecma262/#sec-array.from
	var arrayFrom = function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
	  var O = toObject(arrayLike);
	  var C = typeof this == 'function' ? this : Array;
	  var argumentsLength = arguments.length;
	  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
	  var mapping = mapfn !== undefined;
	  var index = 0;
	  var iteratorMethod = getIteratorMethod(O);
	  var length, result, step, iterator, next;
	  if (mapping) mapfn = bindContext(mapfn, argumentsLength > 2 ? arguments[2] : undefined, 2);
	  // if the target is not iterable or it's an array with the default iterator - use a simple case
	  if (iteratorMethod != undefined && !(C == Array && isArrayIteratorMethod(iteratorMethod))) {
	    iterator = iteratorMethod.call(O);
	    next = iterator.next;
	    result = new C();
	    for (;!(step = next.call(iterator)).done; index++) {
	      createProperty(result, index, mapping
	        ? callWithSafeIterationClosing(iterator, mapfn, [step.value, index], true)
	        : step.value
	      );
	    }
	  } else {
	    length = toLength(O.length);
	    result = new C(length);
	    for (;length > index; index++) {
	      createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
	    }
	  }
	  result.length = index;
	  return result;
	};

	// based on https://github.com/bestiejs/punycode.js/blob/master/punycode.js
	var maxInt = 2147483647; // aka. 0x7FFFFFFF or 2^31-1
	var base = 36;
	var tMin = 1;
	var tMax = 26;
	var skew = 38;
	var damp = 700;
	var initialBias = 72;
	var initialN = 128; // 0x80
	var delimiter = '-'; // '\x2D'
	var regexNonASCII = /[^\0-\u007E]/; // non-ASCII chars
	var regexSeparators = /[.\u3002\uFF0E\uFF61]/g; // RFC 3490 separators
	var OVERFLOW_ERROR = 'Overflow: input needs wider integers to process';
	var baseMinusTMin = base - tMin;
	var floor$2 = Math.floor;
	var stringFromCharCode = String.fromCharCode;

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 */
	var ucs2decode = function (string) {
	  var output = [];
	  var counter = 0;
	  var length = string.length;
	  while (counter < length) {
	    var value = string.charCodeAt(counter++);
	    if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
	      // It's a high surrogate, and there is a next character.
	      var extra = string.charCodeAt(counter++);
	      if ((extra & 0xFC00) == 0xDC00) { // Low surrogate.
	        output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
	      } else {
	        // It's an unmatched surrogate; only append this code unit, in case the
	        // next code unit is the high surrogate of a surrogate pair.
	        output.push(value);
	        counter--;
	      }
	    } else {
	      output.push(value);
	    }
	  }
	  return output;
	};

	/**
	 * Converts a digit/integer into a basic code point.
	 */
	var digitToBasic = function (digit) {
	  //  0..25 map to ASCII a..z or A..Z
	  // 26..35 map to ASCII 0..9
	  return digit + 22 + 75 * (digit < 26);
	};

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * https://tools.ietf.org/html/rfc3492#section-3.4
	 */
	var adapt = function (delta, numPoints, firstTime) {
	  var k = 0;
	  delta = firstTime ? floor$2(delta / damp) : delta >> 1;
	  delta += floor$2(delta / numPoints);
	  for (; delta > baseMinusTMin * tMax >> 1; k += base) {
	    delta = floor$2(delta / baseMinusTMin);
	  }
	  return floor$2(k + (baseMinusTMin + 1) * delta / (delta + skew));
	};

	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 */
	// eslint-disable-next-line  max-statements
	var encode = function (input) {
	  var output = [];

	  // Convert the input in UCS-2 to an array of Unicode code points.
	  input = ucs2decode(input);

	  // Cache the length.
	  var inputLength = input.length;

	  // Initialize the state.
	  var n = initialN;
	  var delta = 0;
	  var bias = initialBias;
	  var i, currentValue;

	  // Handle the basic code points.
	  for (i = 0; i < input.length; i++) {
	    currentValue = input[i];
	    if (currentValue < 0x80) {
	      output.push(stringFromCharCode(currentValue));
	    }
	  }

	  var basicLength = output.length; // number of basic code points.
	  var handledCPCount = basicLength; // number of code points that have been handled;

	  // Finish the basic string with a delimiter unless it's empty.
	  if (basicLength) {
	    output.push(delimiter);
	  }

	  // Main encoding loop:
	  while (handledCPCount < inputLength) {
	    // All non-basic code points < n have been handled already. Find the next larger one:
	    var m = maxInt;
	    for (i = 0; i < input.length; i++) {
	      currentValue = input[i];
	      if (currentValue >= n && currentValue < m) {
	        m = currentValue;
	      }
	    }

	    // Increase `delta` enough to advance the decoder's <n,i> state to <m,0>, but guard against overflow.
	    var handledCPCountPlusOne = handledCPCount + 1;
	    if (m - n > floor$2((maxInt - delta) / handledCPCountPlusOne)) {
	      throw RangeError(OVERFLOW_ERROR);
	    }

	    delta += (m - n) * handledCPCountPlusOne;
	    n = m;

	    for (i = 0; i < input.length; i++) {
	      currentValue = input[i];
	      if (currentValue < n && ++delta > maxInt) {
	        throw RangeError(OVERFLOW_ERROR);
	      }
	      if (currentValue == n) {
	        // Represent delta as a generalized variable-length integer.
	        var q = delta;
	        for (var k = base; /* no condition */; k += base) {
	          var t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
	          if (q < t) break;
	          var qMinusT = q - t;
	          var baseMinusT = base - t;
	          output.push(stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT)));
	          q = floor$2(qMinusT / baseMinusT);
	        }

	        output.push(stringFromCharCode(digitToBasic(q)));
	        bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
	        delta = 0;
	        ++handledCPCount;
	      }
	    }

	    ++delta;
	    ++n;
	  }
	  return output.join('');
	};

	var punycodeToAscii = function (input) {
	  var encoded = [];
	  var labels = input.toLowerCase().replace(regexSeparators, '\u002E').split('.');
	  var i, label;
	  for (i = 0; i < labels.length; i++) {
	    label = labels[i];
	    encoded.push(regexNonASCII.test(label) ? 'xn--' + encode(label) : label);
	  }
	  return encoded.join('.');
	};

	var getIterator = function (it) {
	  var iteratorMethod = getIteratorMethod(it);
	  if (typeof iteratorMethod != 'function') {
	    throw TypeError(String(it) + ' is not iterable');
	  } return anObject(iteratorMethod.call(it));
	};

	// TODO: in core-js@4, move /modules/ dependencies to public entries for better optimization by tools like `preset-env`





















	var $fetch = getBuiltIn('fetch');
	var Headers = getBuiltIn('Headers');
	var ITERATOR$7 = wellKnownSymbol('iterator');
	var URL_SEARCH_PARAMS = 'URLSearchParams';
	var URL_SEARCH_PARAMS_ITERATOR = URL_SEARCH_PARAMS + 'Iterator';
	var setInternalState$5 = internalState.set;
	var getInternalParamsState = internalState.getterFor(URL_SEARCH_PARAMS);
	var getInternalIteratorState = internalState.getterFor(URL_SEARCH_PARAMS_ITERATOR);

	var plus = /\+/g;
	var sequences = Array(4);

	var percentSequence = function (bytes) {
	  return sequences[bytes - 1] || (sequences[bytes - 1] = RegExp('((?:%[\\da-f]{2}){' + bytes + '})', 'gi'));
	};

	var percentDecode = function (sequence) {
	  try {
	    return decodeURIComponent(sequence);
	  } catch (error) {
	    return sequence;
	  }
	};

	var deserialize = function (it) {
	  var result = it.replace(plus, ' ');
	  var bytes = 4;
	  try {
	    return decodeURIComponent(result);
	  } catch (error) {
	    while (bytes) {
	      result = result.replace(percentSequence(bytes--), percentDecode);
	    }
	    return result;
	  }
	};

	var find$1 = /[!'()~]|%20/g;

	var replace = {
	  '!': '%21',
	  "'": '%27',
	  '(': '%28',
	  ')': '%29',
	  '~': '%7E',
	  '%20': '+'
	};

	var replacer = function (match) {
	  return replace[match];
	};

	var serialize = function (it) {
	  return encodeURIComponent(it).replace(find$1, replacer);
	};

	var parseSearchParams = function (result, query) {
	  if (query) {
	    var attributes = query.split('&');
	    var index = 0;
	    var attribute, entry;
	    while (index < attributes.length) {
	      attribute = attributes[index++];
	      if (attribute.length) {
	        entry = attribute.split('=');
	        result.push({
	          key: deserialize(entry.shift()),
	          value: deserialize(entry.join('='))
	        });
	      }
	    }
	  }
	};

	var updateSearchParams = function (query) {
	  this.entries.length = 0;
	  parseSearchParams(this.entries, query);
	};

	var validateArgumentsLength = function (passed, required) {
	  if (passed < required) throw TypeError('Not enough arguments');
	};

	var URLSearchParamsIterator = createIteratorConstructor(function Iterator(params, kind) {
	  setInternalState$5(this, {
	    type: URL_SEARCH_PARAMS_ITERATOR,
	    iterator: getIterator(getInternalParamsState(params).entries),
	    kind: kind
	  });
	}, 'Iterator', function next() {
	  var state = getInternalIteratorState(this);
	  var kind = state.kind;
	  var step = state.iterator.next();
	  var entry = step.value;
	  if (!step.done) {
	    step.value = kind === 'keys' ? entry.key : kind === 'values' ? entry.value : [entry.key, entry.value];
	  } return step;
	});

	// `URLSearchParams` constructor
	// https://url.spec.whatwg.org/#interface-urlsearchparams
	var URLSearchParamsConstructor = function URLSearchParams(/* init */) {
	  anInstance(this, URLSearchParamsConstructor, URL_SEARCH_PARAMS);
	  var init = arguments.length > 0 ? arguments[0] : undefined;
	  var that = this;
	  var entries = [];
	  var iteratorMethod, iterator, next, step, entryIterator, entryNext, first, second, key;

	  setInternalState$5(that, {
	    type: URL_SEARCH_PARAMS,
	    entries: entries,
	    updateURL: function () { /* empty */ },
	    updateSearchParams: updateSearchParams
	  });

	  if (init !== undefined) {
	    if (isObject(init)) {
	      iteratorMethod = getIteratorMethod(init);
	      if (typeof iteratorMethod === 'function') {
	        iterator = iteratorMethod.call(init);
	        next = iterator.next;
	        while (!(step = next.call(iterator)).done) {
	          entryIterator = getIterator(anObject(step.value));
	          entryNext = entryIterator.next;
	          if (
	            (first = entryNext.call(entryIterator)).done ||
	            (second = entryNext.call(entryIterator)).done ||
	            !entryNext.call(entryIterator).done
	          ) throw TypeError('Expected sequence with length 2');
	          entries.push({ key: first.value + '', value: second.value + '' });
	        }
	      } else for (key in init) if (has(init, key)) entries.push({ key: key, value: init[key] + '' });
	    } else {
	      parseSearchParams(entries, typeof init === 'string' ? init.charAt(0) === '?' ? init.slice(1) : init : init + '');
	    }
	  }
	};

	var URLSearchParamsPrototype = URLSearchParamsConstructor.prototype;

	redefineAll(URLSearchParamsPrototype, {
	  // `URLSearchParams.prototype.appent` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-append
	  append: function append(name, value) {
	    validateArgumentsLength(arguments.length, 2);
	    var state = getInternalParamsState(this);
	    state.entries.push({ key: name + '', value: value + '' });
	    state.updateURL();
	  },
	  // `URLSearchParams.prototype.delete` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-delete
	  'delete': function (name) {
	    validateArgumentsLength(arguments.length, 1);
	    var state = getInternalParamsState(this);
	    var entries = state.entries;
	    var key = name + '';
	    var index = 0;
	    while (index < entries.length) {
	      if (entries[index].key === key) entries.splice(index, 1);
	      else index++;
	    }
	    state.updateURL();
	  },
	  // `URLSearchParams.prototype.get` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-get
	  get: function get(name) {
	    validateArgumentsLength(arguments.length, 1);
	    var entries = getInternalParamsState(this).entries;
	    var key = name + '';
	    var index = 0;
	    for (; index < entries.length; index++) {
	      if (entries[index].key === key) return entries[index].value;
	    }
	    return null;
	  },
	  // `URLSearchParams.prototype.getAll` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-getall
	  getAll: function getAll(name) {
	    validateArgumentsLength(arguments.length, 1);
	    var entries = getInternalParamsState(this).entries;
	    var key = name + '';
	    var result = [];
	    var index = 0;
	    for (; index < entries.length; index++) {
	      if (entries[index].key === key) result.push(entries[index].value);
	    }
	    return result;
	  },
	  // `URLSearchParams.prototype.has` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-has
	  has: function has(name) {
	    validateArgumentsLength(arguments.length, 1);
	    var entries = getInternalParamsState(this).entries;
	    var key = name + '';
	    var index = 0;
	    while (index < entries.length) {
	      if (entries[index++].key === key) return true;
	    }
	    return false;
	  },
	  // `URLSearchParams.prototype.set` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-set
	  set: function set(name, value) {
	    validateArgumentsLength(arguments.length, 1);
	    var state = getInternalParamsState(this);
	    var entries = state.entries;
	    var found = false;
	    var key = name + '';
	    var val = value + '';
	    var index = 0;
	    var entry;
	    for (; index < entries.length; index++) {
	      entry = entries[index];
	      if (entry.key === key) {
	        if (found) entries.splice(index--, 1);
	        else {
	          found = true;
	          entry.value = val;
	        }
	      }
	    }
	    if (!found) entries.push({ key: key, value: val });
	    state.updateURL();
	  },
	  // `URLSearchParams.prototype.sort` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-sort
	  sort: function sort() {
	    var state = getInternalParamsState(this);
	    var entries = state.entries;
	    // Array#sort is not stable in some engines
	    var slice = entries.slice();
	    var entry, entriesIndex, sliceIndex;
	    entries.length = 0;
	    for (sliceIndex = 0; sliceIndex < slice.length; sliceIndex++) {
	      entry = slice[sliceIndex];
	      for (entriesIndex = 0; entriesIndex < sliceIndex; entriesIndex++) {
	        if (entries[entriesIndex].key > entry.key) {
	          entries.splice(entriesIndex, 0, entry);
	          break;
	        }
	      }
	      if (entriesIndex === sliceIndex) entries.push(entry);
	    }
	    state.updateURL();
	  },
	  // `URLSearchParams.prototype.forEach` method
	  forEach: function forEach(callback /* , thisArg */) {
	    var entries = getInternalParamsState(this).entries;
	    var boundFunction = bindContext(callback, arguments.length > 1 ? arguments[1] : undefined, 3);
	    var index = 0;
	    var entry;
	    while (index < entries.length) {
	      entry = entries[index++];
	      boundFunction(entry.value, entry.key, this);
	    }
	  },
	  // `URLSearchParams.prototype.keys` method
	  keys: function keys() {
	    return new URLSearchParamsIterator(this, 'keys');
	  },
	  // `URLSearchParams.prototype.values` method
	  values: function values() {
	    return new URLSearchParamsIterator(this, 'values');
	  },
	  // `URLSearchParams.prototype.entries` method
	  entries: function entries() {
	    return new URLSearchParamsIterator(this, 'entries');
	  }
	}, { enumerable: true });

	// `URLSearchParams.prototype[@@iterator]` method
	redefine(URLSearchParamsPrototype, ITERATOR$7, URLSearchParamsPrototype.entries);

	// `URLSearchParams.prototype.toString` method
	// https://url.spec.whatwg.org/#urlsearchparams-stringification-behavior
	redefine(URLSearchParamsPrototype, 'toString', function toString() {
	  var entries = getInternalParamsState(this).entries;
	  var result = [];
	  var index = 0;
	  var entry;
	  while (index < entries.length) {
	    entry = entries[index++];
	    result.push(serialize(entry.key) + '=' + serialize(entry.value));
	  } return result.join('&');
	}, { enumerable: true });

	setToStringTag(URLSearchParamsConstructor, URL_SEARCH_PARAMS);

	_export({ global: true, forced: !nativeUrl }, {
	  URLSearchParams: URLSearchParamsConstructor
	});

	// Wrap `fetch` for correct work with polyfilled `URLSearchParams`
	// https://github.com/zloirock/core-js/issues/674
	if (!nativeUrl && typeof $fetch == 'function' && typeof Headers == 'function') {
	  _export({ global: true, enumerable: true, forced: true }, {
	    fetch: function fetch(input /* , init */) {
	      var args = [input];
	      var init, body, headers;
	      if (arguments.length > 1) {
	        init = arguments[1];
	        if (isObject(init)) {
	          body = init.body;
	          if (classof(body) === URL_SEARCH_PARAMS) {
	            headers = init.headers ? new Headers(init.headers) : new Headers();
	            if (!headers.has('content-type')) {
	              headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
	            }
	            init = objectCreate(init, {
	              body: createPropertyDescriptor(0, String(body)),
	              headers: createPropertyDescriptor(0, headers)
	            });
	          }
	        }
	        args.push(init);
	      } return $fetch.apply(this, args);
	    }
	  });
	}

	var web_urlSearchParams = {
	  URLSearchParams: URLSearchParamsConstructor,
	  getState: getInternalParamsState
	};

	// TODO: in core-js@4, move /modules/ dependencies to public entries for better optimization by tools like `preset-env`











	var codeAt = stringMultibyte.codeAt;





	var NativeURL = global_1.URL;
	var URLSearchParams$1 = web_urlSearchParams.URLSearchParams;
	var getInternalSearchParamsState = web_urlSearchParams.getState;
	var setInternalState$6 = internalState.set;
	var getInternalURLState = internalState.getterFor('URL');
	var floor$3 = Math.floor;
	var pow = Math.pow;

	var INVALID_AUTHORITY = 'Invalid authority';
	var INVALID_SCHEME = 'Invalid scheme';
	var INVALID_HOST = 'Invalid host';
	var INVALID_PORT = 'Invalid port';

	var ALPHA = /[A-Za-z]/;
	var ALPHANUMERIC = /[\d+\-.A-Za-z]/;
	var DIGIT = /\d/;
	var HEX_START = /^(0x|0X)/;
	var OCT = /^[0-7]+$/;
	var DEC = /^\d+$/;
	var HEX = /^[\dA-Fa-f]+$/;
	// eslint-disable-next-line no-control-regex
	var FORBIDDEN_HOST_CODE_POINT = /[\u0000\u0009\u000A\u000D #%/:?@[\\]]/;
	// eslint-disable-next-line no-control-regex
	var FORBIDDEN_HOST_CODE_POINT_EXCLUDING_PERCENT = /[\u0000\u0009\u000A\u000D #/:?@[\\]]/;
	// eslint-disable-next-line no-control-regex
	var LEADING_AND_TRAILING_C0_CONTROL_OR_SPACE = /^[\u0000-\u001F ]+|[\u0000-\u001F ]+$/g;
	// eslint-disable-next-line no-control-regex
	var TAB_AND_NEW_LINE = /[\u0009\u000A\u000D]/g;
	var EOF;

	var parseHost = function (url, input) {
	  var result, codePoints, index;
	  if (input.charAt(0) == '[') {
	    if (input.charAt(input.length - 1) != ']') return INVALID_HOST;
	    result = parseIPv6(input.slice(1, -1));
	    if (!result) return INVALID_HOST;
	    url.host = result;
	  // opaque host
	  } else if (!isSpecial(url)) {
	    if (FORBIDDEN_HOST_CODE_POINT_EXCLUDING_PERCENT.test(input)) return INVALID_HOST;
	    result = '';
	    codePoints = arrayFrom(input);
	    for (index = 0; index < codePoints.length; index++) {
	      result += percentEncode(codePoints[index], C0ControlPercentEncodeSet);
	    }
	    url.host = result;
	  } else {
	    input = punycodeToAscii(input);
	    if (FORBIDDEN_HOST_CODE_POINT.test(input)) return INVALID_HOST;
	    result = parseIPv4(input);
	    if (result === null) return INVALID_HOST;
	    url.host = result;
	  }
	};

	var parseIPv4 = function (input) {
	  var parts = input.split('.');
	  var partsLength, numbers, index, part, radix, number, ipv4;
	  if (parts.length && parts[parts.length - 1] == '') {
	    parts.pop();
	  }
	  partsLength = parts.length;
	  if (partsLength > 4) return input;
	  numbers = [];
	  for (index = 0; index < partsLength; index++) {
	    part = parts[index];
	    if (part == '') return input;
	    radix = 10;
	    if (part.length > 1 && part.charAt(0) == '0') {
	      radix = HEX_START.test(part) ? 16 : 8;
	      part = part.slice(radix == 8 ? 1 : 2);
	    }
	    if (part === '') {
	      number = 0;
	    } else {
	      if (!(radix == 10 ? DEC : radix == 8 ? OCT : HEX).test(part)) return input;
	      number = parseInt(part, radix);
	    }
	    numbers.push(number);
	  }
	  for (index = 0; index < partsLength; index++) {
	    number = numbers[index];
	    if (index == partsLength - 1) {
	      if (number >= pow(256, 5 - partsLength)) return null;
	    } else if (number > 255) return null;
	  }
	  ipv4 = numbers.pop();
	  for (index = 0; index < numbers.length; index++) {
	    ipv4 += numbers[index] * pow(256, 3 - index);
	  }
	  return ipv4;
	};

	// eslint-disable-next-line max-statements
	var parseIPv6 = function (input) {
	  var address = [0, 0, 0, 0, 0, 0, 0, 0];
	  var pieceIndex = 0;
	  var compress = null;
	  var pointer = 0;
	  var value, length, numbersSeen, ipv4Piece, number, swaps, swap;

	  var char = function () {
	    return input.charAt(pointer);
	  };

	  if (char() == ':') {
	    if (input.charAt(1) != ':') return;
	    pointer += 2;
	    pieceIndex++;
	    compress = pieceIndex;
	  }
	  while (char()) {
	    if (pieceIndex == 8) return;
	    if (char() == ':') {
	      if (compress !== null) return;
	      pointer++;
	      pieceIndex++;
	      compress = pieceIndex;
	      continue;
	    }
	    value = length = 0;
	    while (length < 4 && HEX.test(char())) {
	      value = value * 16 + parseInt(char(), 16);
	      pointer++;
	      length++;
	    }
	    if (char() == '.') {
	      if (length == 0) return;
	      pointer -= length;
	      if (pieceIndex > 6) return;
	      numbersSeen = 0;
	      while (char()) {
	        ipv4Piece = null;
	        if (numbersSeen > 0) {
	          if (char() == '.' && numbersSeen < 4) pointer++;
	          else return;
	        }
	        if (!DIGIT.test(char())) return;
	        while (DIGIT.test(char())) {
	          number = parseInt(char(), 10);
	          if (ipv4Piece === null) ipv4Piece = number;
	          else if (ipv4Piece == 0) return;
	          else ipv4Piece = ipv4Piece * 10 + number;
	          if (ipv4Piece > 255) return;
	          pointer++;
	        }
	        address[pieceIndex] = address[pieceIndex] * 256 + ipv4Piece;
	        numbersSeen++;
	        if (numbersSeen == 2 || numbersSeen == 4) pieceIndex++;
	      }
	      if (numbersSeen != 4) return;
	      break;
	    } else if (char() == ':') {
	      pointer++;
	      if (!char()) return;
	    } else if (char()) return;
	    address[pieceIndex++] = value;
	  }
	  if (compress !== null) {
	    swaps = pieceIndex - compress;
	    pieceIndex = 7;
	    while (pieceIndex != 0 && swaps > 0) {
	      swap = address[pieceIndex];
	      address[pieceIndex--] = address[compress + swaps - 1];
	      address[compress + --swaps] = swap;
	    }
	  } else if (pieceIndex != 8) return;
	  return address;
	};

	var findLongestZeroSequence = function (ipv6) {
	  var maxIndex = null;
	  var maxLength = 1;
	  var currStart = null;
	  var currLength = 0;
	  var index = 0;
	  for (; index < 8; index++) {
	    if (ipv6[index] !== 0) {
	      if (currLength > maxLength) {
	        maxIndex = currStart;
	        maxLength = currLength;
	      }
	      currStart = null;
	      currLength = 0;
	    } else {
	      if (currStart === null) currStart = index;
	      ++currLength;
	    }
	  }
	  if (currLength > maxLength) {
	    maxIndex = currStart;
	    maxLength = currLength;
	  }
	  return maxIndex;
	};

	var serializeHost = function (host) {
	  var result, index, compress, ignore0;
	  // ipv4
	  if (typeof host == 'number') {
	    result = [];
	    for (index = 0; index < 4; index++) {
	      result.unshift(host % 256);
	      host = floor$3(host / 256);
	    } return result.join('.');
	  // ipv6
	  } else if (typeof host == 'object') {
	    result = '';
	    compress = findLongestZeroSequence(host);
	    for (index = 0; index < 8; index++) {
	      if (ignore0 && host[index] === 0) continue;
	      if (ignore0) ignore0 = false;
	      if (compress === index) {
	        result += index ? ':' : '::';
	        ignore0 = true;
	      } else {
	        result += host[index].toString(16);
	        if (index < 7) result += ':';
	      }
	    }
	    return '[' + result + ']';
	  } return host;
	};

	var C0ControlPercentEncodeSet = {};
	var fragmentPercentEncodeSet = objectAssign({}, C0ControlPercentEncodeSet, {
	  ' ': 1, '"': 1, '<': 1, '>': 1, '`': 1
	});
	var pathPercentEncodeSet = objectAssign({}, fragmentPercentEncodeSet, {
	  '#': 1, '?': 1, '{': 1, '}': 1
	});
	var userinfoPercentEncodeSet = objectAssign({}, pathPercentEncodeSet, {
	  '/': 1, ':': 1, ';': 1, '=': 1, '@': 1, '[': 1, '\\': 1, ']': 1, '^': 1, '|': 1
	});

	var percentEncode = function (char, set) {
	  var code = codeAt(char, 0);
	  return code > 0x20 && code < 0x7F && !has(set, char) ? char : encodeURIComponent(char);
	};

	var specialSchemes = {
	  ftp: 21,
	  file: null,
	  http: 80,
	  https: 443,
	  ws: 80,
	  wss: 443
	};

	var isSpecial = function (url) {
	  return has(specialSchemes, url.scheme);
	};

	var includesCredentials = function (url) {
	  return url.username != '' || url.password != '';
	};

	var cannotHaveUsernamePasswordPort = function (url) {
	  return !url.host || url.cannotBeABaseURL || url.scheme == 'file';
	};

	var isWindowsDriveLetter = function (string, normalized) {
	  var second;
	  return string.length == 2 && ALPHA.test(string.charAt(0))
	    && ((second = string.charAt(1)) == ':' || (!normalized && second == '|'));
	};

	var startsWithWindowsDriveLetter = function (string) {
	  var third;
	  return string.length > 1 && isWindowsDriveLetter(string.slice(0, 2)) && (
	    string.length == 2 ||
	    ((third = string.charAt(2)) === '/' || third === '\\' || third === '?' || third === '#')
	  );
	};

	var shortenURLsPath = function (url) {
	  var path = url.path;
	  var pathSize = path.length;
	  if (pathSize && (url.scheme != 'file' || pathSize != 1 || !isWindowsDriveLetter(path[0], true))) {
	    path.pop();
	  }
	};

	var isSingleDot = function (segment) {
	  return segment === '.' || segment.toLowerCase() === '%2e';
	};

	var isDoubleDot = function (segment) {
	  segment = segment.toLowerCase();
	  return segment === '..' || segment === '%2e.' || segment === '.%2e' || segment === '%2e%2e';
	};

	// States:
	var SCHEME_START = {};
	var SCHEME = {};
	var NO_SCHEME = {};
	var SPECIAL_RELATIVE_OR_AUTHORITY = {};
	var PATH_OR_AUTHORITY = {};
	var RELATIVE = {};
	var RELATIVE_SLASH = {};
	var SPECIAL_AUTHORITY_SLASHES = {};
	var SPECIAL_AUTHORITY_IGNORE_SLASHES = {};
	var AUTHORITY = {};
	var HOST = {};
	var HOSTNAME = {};
	var PORT = {};
	var FILE = {};
	var FILE_SLASH = {};
	var FILE_HOST = {};
	var PATH_START = {};
	var PATH = {};
	var CANNOT_BE_A_BASE_URL_PATH = {};
	var QUERY = {};
	var FRAGMENT = {};

	// eslint-disable-next-line max-statements
	var parseURL = function (url, input, stateOverride, base) {
	  var state = stateOverride || SCHEME_START;
	  var pointer = 0;
	  var buffer = '';
	  var seenAt = false;
	  var seenBracket = false;
	  var seenPasswordToken = false;
	  var codePoints, char, bufferCodePoints, failure;

	  if (!stateOverride) {
	    url.scheme = '';
	    url.username = '';
	    url.password = '';
	    url.host = null;
	    url.port = null;
	    url.path = [];
	    url.query = null;
	    url.fragment = null;
	    url.cannotBeABaseURL = false;
	    input = input.replace(LEADING_AND_TRAILING_C0_CONTROL_OR_SPACE, '');
	  }

	  input = input.replace(TAB_AND_NEW_LINE, '');

	  codePoints = arrayFrom(input);

	  while (pointer <= codePoints.length) {
	    char = codePoints[pointer];
	    switch (state) {
	      case SCHEME_START:
	        if (char && ALPHA.test(char)) {
	          buffer += char.toLowerCase();
	          state = SCHEME;
	        } else if (!stateOverride) {
	          state = NO_SCHEME;
	          continue;
	        } else return INVALID_SCHEME;
	        break;

	      case SCHEME:
	        if (char && (ALPHANUMERIC.test(char) || char == '+' || char == '-' || char == '.')) {
	          buffer += char.toLowerCase();
	        } else if (char == ':') {
	          if (stateOverride && (
	            (isSpecial(url) != has(specialSchemes, buffer)) ||
	            (buffer == 'file' && (includesCredentials(url) || url.port !== null)) ||
	            (url.scheme == 'file' && !url.host)
	          )) return;
	          url.scheme = buffer;
	          if (stateOverride) {
	            if (isSpecial(url) && specialSchemes[url.scheme] == url.port) url.port = null;
	            return;
	          }
	          buffer = '';
	          if (url.scheme == 'file') {
	            state = FILE;
	          } else if (isSpecial(url) && base && base.scheme == url.scheme) {
	            state = SPECIAL_RELATIVE_OR_AUTHORITY;
	          } else if (isSpecial(url)) {
	            state = SPECIAL_AUTHORITY_SLASHES;
	          } else if (codePoints[pointer + 1] == '/') {
	            state = PATH_OR_AUTHORITY;
	            pointer++;
	          } else {
	            url.cannotBeABaseURL = true;
	            url.path.push('');
	            state = CANNOT_BE_A_BASE_URL_PATH;
	          }
	        } else if (!stateOverride) {
	          buffer = '';
	          state = NO_SCHEME;
	          pointer = 0;
	          continue;
	        } else return INVALID_SCHEME;
	        break;

	      case NO_SCHEME:
	        if (!base || (base.cannotBeABaseURL && char != '#')) return INVALID_SCHEME;
	        if (base.cannotBeABaseURL && char == '#') {
	          url.scheme = base.scheme;
	          url.path = base.path.slice();
	          url.query = base.query;
	          url.fragment = '';
	          url.cannotBeABaseURL = true;
	          state = FRAGMENT;
	          break;
	        }
	        state = base.scheme == 'file' ? FILE : RELATIVE;
	        continue;

	      case SPECIAL_RELATIVE_OR_AUTHORITY:
	        if (char == '/' && codePoints[pointer + 1] == '/') {
	          state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
	          pointer++;
	        } else {
	          state = RELATIVE;
	          continue;
	        } break;

	      case PATH_OR_AUTHORITY:
	        if (char == '/') {
	          state = AUTHORITY;
	          break;
	        } else {
	          state = PATH;
	          continue;
	        }

	      case RELATIVE:
	        url.scheme = base.scheme;
	        if (char == EOF) {
	          url.username = base.username;
	          url.password = base.password;
	          url.host = base.host;
	          url.port = base.port;
	          url.path = base.path.slice();
	          url.query = base.query;
	        } else if (char == '/' || (char == '\\' && isSpecial(url))) {
	          state = RELATIVE_SLASH;
	        } else if (char == '?') {
	          url.username = base.username;
	          url.password = base.password;
	          url.host = base.host;
	          url.port = base.port;
	          url.path = base.path.slice();
	          url.query = '';
	          state = QUERY;
	        } else if (char == '#') {
	          url.username = base.username;
	          url.password = base.password;
	          url.host = base.host;
	          url.port = base.port;
	          url.path = base.path.slice();
	          url.query = base.query;
	          url.fragment = '';
	          state = FRAGMENT;
	        } else {
	          url.username = base.username;
	          url.password = base.password;
	          url.host = base.host;
	          url.port = base.port;
	          url.path = base.path.slice();
	          url.path.pop();
	          state = PATH;
	          continue;
	        } break;

	      case RELATIVE_SLASH:
	        if (isSpecial(url) && (char == '/' || char == '\\')) {
	          state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
	        } else if (char == '/') {
	          state = AUTHORITY;
	        } else {
	          url.username = base.username;
	          url.password = base.password;
	          url.host = base.host;
	          url.port = base.port;
	          state = PATH;
	          continue;
	        } break;

	      case SPECIAL_AUTHORITY_SLASHES:
	        state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
	        if (char != '/' || buffer.charAt(pointer + 1) != '/') continue;
	        pointer++;
	        break;

	      case SPECIAL_AUTHORITY_IGNORE_SLASHES:
	        if (char != '/' && char != '\\') {
	          state = AUTHORITY;
	          continue;
	        } break;

	      case AUTHORITY:
	        if (char == '@') {
	          if (seenAt) buffer = '%40' + buffer;
	          seenAt = true;
	          bufferCodePoints = arrayFrom(buffer);
	          for (var i = 0; i < bufferCodePoints.length; i++) {
	            var codePoint = bufferCodePoints[i];
	            if (codePoint == ':' && !seenPasswordToken) {
	              seenPasswordToken = true;
	              continue;
	            }
	            var encodedCodePoints = percentEncode(codePoint, userinfoPercentEncodeSet);
	            if (seenPasswordToken) url.password += encodedCodePoints;
	            else url.username += encodedCodePoints;
	          }
	          buffer = '';
	        } else if (
	          char == EOF || char == '/' || char == '?' || char == '#' ||
	          (char == '\\' && isSpecial(url))
	        ) {
	          if (seenAt && buffer == '') return INVALID_AUTHORITY;
	          pointer -= arrayFrom(buffer).length + 1;
	          buffer = '';
	          state = HOST;
	        } else buffer += char;
	        break;

	      case HOST:
	      case HOSTNAME:
	        if (stateOverride && url.scheme == 'file') {
	          state = FILE_HOST;
	          continue;
	        } else if (char == ':' && !seenBracket) {
	          if (buffer == '') return INVALID_HOST;
	          failure = parseHost(url, buffer);
	          if (failure) return failure;
	          buffer = '';
	          state = PORT;
	          if (stateOverride == HOSTNAME) return;
	        } else if (
	          char == EOF || char == '/' || char == '?' || char == '#' ||
	          (char == '\\' && isSpecial(url))
	        ) {
	          if (isSpecial(url) && buffer == '') return INVALID_HOST;
	          if (stateOverride && buffer == '' && (includesCredentials(url) || url.port !== null)) return;
	          failure = parseHost(url, buffer);
	          if (failure) return failure;
	          buffer = '';
	          state = PATH_START;
	          if (stateOverride) return;
	          continue;
	        } else {
	          if (char == '[') seenBracket = true;
	          else if (char == ']') seenBracket = false;
	          buffer += char;
	        } break;

	      case PORT:
	        if (DIGIT.test(char)) {
	          buffer += char;
	        } else if (
	          char == EOF || char == '/' || char == '?' || char == '#' ||
	          (char == '\\' && isSpecial(url)) ||
	          stateOverride
	        ) {
	          if (buffer != '') {
	            var port = parseInt(buffer, 10);
	            if (port > 0xFFFF) return INVALID_PORT;
	            url.port = (isSpecial(url) && port === specialSchemes[url.scheme]) ? null : port;
	            buffer = '';
	          }
	          if (stateOverride) return;
	          state = PATH_START;
	          continue;
	        } else return INVALID_PORT;
	        break;

	      case FILE:
	        url.scheme = 'file';
	        if (char == '/' || char == '\\') state = FILE_SLASH;
	        else if (base && base.scheme == 'file') {
	          if (char == EOF) {
	            url.host = base.host;
	            url.path = base.path.slice();
	            url.query = base.query;
	          } else if (char == '?') {
	            url.host = base.host;
	            url.path = base.path.slice();
	            url.query = '';
	            state = QUERY;
	          } else if (char == '#') {
	            url.host = base.host;
	            url.path = base.path.slice();
	            url.query = base.query;
	            url.fragment = '';
	            state = FRAGMENT;
	          } else {
	            if (!startsWithWindowsDriveLetter(codePoints.slice(pointer).join(''))) {
	              url.host = base.host;
	              url.path = base.path.slice();
	              shortenURLsPath(url);
	            }
	            state = PATH;
	            continue;
	          }
	        } else {
	          state = PATH;
	          continue;
	        } break;

	      case FILE_SLASH:
	        if (char == '/' || char == '\\') {
	          state = FILE_HOST;
	          break;
	        }
	        if (base && base.scheme == 'file' && !startsWithWindowsDriveLetter(codePoints.slice(pointer).join(''))) {
	          if (isWindowsDriveLetter(base.path[0], true)) url.path.push(base.path[0]);
	          else url.host = base.host;
	        }
	        state = PATH;
	        continue;

	      case FILE_HOST:
	        if (char == EOF || char == '/' || char == '\\' || char == '?' || char == '#') {
	          if (!stateOverride && isWindowsDriveLetter(buffer)) {
	            state = PATH;
	          } else if (buffer == '') {
	            url.host = '';
	            if (stateOverride) return;
	            state = PATH_START;
	          } else {
	            failure = parseHost(url, buffer);
	            if (failure) return failure;
	            if (url.host == 'localhost') url.host = '';
	            if (stateOverride) return;
	            buffer = '';
	            state = PATH_START;
	          } continue;
	        } else buffer += char;
	        break;

	      case PATH_START:
	        if (isSpecial(url)) {
	          state = PATH;
	          if (char != '/' && char != '\\') continue;
	        } else if (!stateOverride && char == '?') {
	          url.query = '';
	          state = QUERY;
	        } else if (!stateOverride && char == '#') {
	          url.fragment = '';
	          state = FRAGMENT;
	        } else if (char != EOF) {
	          state = PATH;
	          if (char != '/') continue;
	        } break;

	      case PATH:
	        if (
	          char == EOF || char == '/' ||
	          (char == '\\' && isSpecial(url)) ||
	          (!stateOverride && (char == '?' || char == '#'))
	        ) {
	          if (isDoubleDot(buffer)) {
	            shortenURLsPath(url);
	            if (char != '/' && !(char == '\\' && isSpecial(url))) {
	              url.path.push('');
	            }
	          } else if (isSingleDot(buffer)) {
	            if (char != '/' && !(char == '\\' && isSpecial(url))) {
	              url.path.push('');
	            }
	          } else {
	            if (url.scheme == 'file' && !url.path.length && isWindowsDriveLetter(buffer)) {
	              if (url.host) url.host = '';
	              buffer = buffer.charAt(0) + ':'; // normalize windows drive letter
	            }
	            url.path.push(buffer);
	          }
	          buffer = '';
	          if (url.scheme == 'file' && (char == EOF || char == '?' || char == '#')) {
	            while (url.path.length > 1 && url.path[0] === '') {
	              url.path.shift();
	            }
	          }
	          if (char == '?') {
	            url.query = '';
	            state = QUERY;
	          } else if (char == '#') {
	            url.fragment = '';
	            state = FRAGMENT;
	          }
	        } else {
	          buffer += percentEncode(char, pathPercentEncodeSet);
	        } break;

	      case CANNOT_BE_A_BASE_URL_PATH:
	        if (char == '?') {
	          url.query = '';
	          state = QUERY;
	        } else if (char == '#') {
	          url.fragment = '';
	          state = FRAGMENT;
	        } else if (char != EOF) {
	          url.path[0] += percentEncode(char, C0ControlPercentEncodeSet);
	        } break;

	      case QUERY:
	        if (!stateOverride && char == '#') {
	          url.fragment = '';
	          state = FRAGMENT;
	        } else if (char != EOF) {
	          if (char == "'" && isSpecial(url)) url.query += '%27';
	          else if (char == '#') url.query += '%23';
	          else url.query += percentEncode(char, C0ControlPercentEncodeSet);
	        } break;

	      case FRAGMENT:
	        if (char != EOF) url.fragment += percentEncode(char, fragmentPercentEncodeSet);
	        break;
	    }

	    pointer++;
	  }
	};

	// `URL` constructor
	// https://url.spec.whatwg.org/#url-class
	var URLConstructor = function URL(url /* , base */) {
	  var that = anInstance(this, URLConstructor, 'URL');
	  var base = arguments.length > 1 ? arguments[1] : undefined;
	  var urlString = String(url);
	  var state = setInternalState$6(that, { type: 'URL' });
	  var baseState, failure;
	  if (base !== undefined) {
	    if (base instanceof URLConstructor) baseState = getInternalURLState(base);
	    else {
	      failure = parseURL(baseState = {}, String(base));
	      if (failure) throw TypeError(failure);
	    }
	  }
	  failure = parseURL(state, urlString, null, baseState);
	  if (failure) throw TypeError(failure);
	  var searchParams = state.searchParams = new URLSearchParams$1();
	  var searchParamsState = getInternalSearchParamsState(searchParams);
	  searchParamsState.updateSearchParams(state.query);
	  searchParamsState.updateURL = function () {
	    state.query = String(searchParams) || null;
	  };
	  if (!descriptors) {
	    that.href = serializeURL.call(that);
	    that.origin = getOrigin.call(that);
	    that.protocol = getProtocol.call(that);
	    that.username = getUsername.call(that);
	    that.password = getPassword.call(that);
	    that.host = getHost.call(that);
	    that.hostname = getHostname.call(that);
	    that.port = getPort.call(that);
	    that.pathname = getPathname.call(that);
	    that.search = getSearch.call(that);
	    that.searchParams = getSearchParams.call(that);
	    that.hash = getHash.call(that);
	  }
	};

	var URLPrototype = URLConstructor.prototype;

	var serializeURL = function () {
	  var url = getInternalURLState(this);
	  var scheme = url.scheme;
	  var username = url.username;
	  var password = url.password;
	  var host = url.host;
	  var port = url.port;
	  var path = url.path;
	  var query = url.query;
	  var fragment = url.fragment;
	  var output = scheme + ':';
	  if (host !== null) {
	    output += '//';
	    if (includesCredentials(url)) {
	      output += username + (password ? ':' + password : '') + '@';
	    }
	    output += serializeHost(host);
	    if (port !== null) output += ':' + port;
	  } else if (scheme == 'file') output += '//';
	  output += url.cannotBeABaseURL ? path[0] : path.length ? '/' + path.join('/') : '';
	  if (query !== null) output += '?' + query;
	  if (fragment !== null) output += '#' + fragment;
	  return output;
	};

	var getOrigin = function () {
	  var url = getInternalURLState(this);
	  var scheme = url.scheme;
	  var port = url.port;
	  if (scheme == 'blob') try {
	    return new URL(scheme.path[0]).origin;
	  } catch (error) {
	    return 'null';
	  }
	  if (scheme == 'file' || !isSpecial(url)) return 'null';
	  return scheme + '://' + serializeHost(url.host) + (port !== null ? ':' + port : '');
	};

	var getProtocol = function () {
	  return getInternalURLState(this).scheme + ':';
	};

	var getUsername = function () {
	  return getInternalURLState(this).username;
	};

	var getPassword = function () {
	  return getInternalURLState(this).password;
	};

	var getHost = function () {
	  var url = getInternalURLState(this);
	  var host = url.host;
	  var port = url.port;
	  return host === null ? ''
	    : port === null ? serializeHost(host)
	    : serializeHost(host) + ':' + port;
	};

	var getHostname = function () {
	  var host = getInternalURLState(this).host;
	  return host === null ? '' : serializeHost(host);
	};

	var getPort = function () {
	  var port = getInternalURLState(this).port;
	  return port === null ? '' : String(port);
	};

	var getPathname = function () {
	  var url = getInternalURLState(this);
	  var path = url.path;
	  return url.cannotBeABaseURL ? path[0] : path.length ? '/' + path.join('/') : '';
	};

	var getSearch = function () {
	  var query = getInternalURLState(this).query;
	  return query ? '?' + query : '';
	};

	var getSearchParams = function () {
	  return getInternalURLState(this).searchParams;
	};

	var getHash = function () {
	  var fragment = getInternalURLState(this).fragment;
	  return fragment ? '#' + fragment : '';
	};

	var accessorDescriptor = function (getter, setter) {
	  return { get: getter, set: setter, configurable: true, enumerable: true };
	};

	if (descriptors) {
	  objectDefineProperties(URLPrototype, {
	    // `URL.prototype.href` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-href
	    href: accessorDescriptor(serializeURL, function (href) {
	      var url = getInternalURLState(this);
	      var urlString = String(href);
	      var failure = parseURL(url, urlString);
	      if (failure) throw TypeError(failure);
	      getInternalSearchParamsState(url.searchParams).updateSearchParams(url.query);
	    }),
	    // `URL.prototype.origin` getter
	    // https://url.spec.whatwg.org/#dom-url-origin
	    origin: accessorDescriptor(getOrigin),
	    // `URL.prototype.protocol` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-protocol
	    protocol: accessorDescriptor(getProtocol, function (protocol) {
	      var url = getInternalURLState(this);
	      parseURL(url, String(protocol) + ':', SCHEME_START);
	    }),
	    // `URL.prototype.username` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-username
	    username: accessorDescriptor(getUsername, function (username) {
	      var url = getInternalURLState(this);
	      var codePoints = arrayFrom(String(username));
	      if (cannotHaveUsernamePasswordPort(url)) return;
	      url.username = '';
	      for (var i = 0; i < codePoints.length; i++) {
	        url.username += percentEncode(codePoints[i], userinfoPercentEncodeSet);
	      }
	    }),
	    // `URL.prototype.password` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-password
	    password: accessorDescriptor(getPassword, function (password) {
	      var url = getInternalURLState(this);
	      var codePoints = arrayFrom(String(password));
	      if (cannotHaveUsernamePasswordPort(url)) return;
	      url.password = '';
	      for (var i = 0; i < codePoints.length; i++) {
	        url.password += percentEncode(codePoints[i], userinfoPercentEncodeSet);
	      }
	    }),
	    // `URL.prototype.host` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-host
	    host: accessorDescriptor(getHost, function (host) {
	      var url = getInternalURLState(this);
	      if (url.cannotBeABaseURL) return;
	      parseURL(url, String(host), HOST);
	    }),
	    // `URL.prototype.hostname` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-hostname
	    hostname: accessorDescriptor(getHostname, function (hostname) {
	      var url = getInternalURLState(this);
	      if (url.cannotBeABaseURL) return;
	      parseURL(url, String(hostname), HOSTNAME);
	    }),
	    // `URL.prototype.port` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-port
	    port: accessorDescriptor(getPort, function (port) {
	      var url = getInternalURLState(this);
	      if (cannotHaveUsernamePasswordPort(url)) return;
	      port = String(port);
	      if (port == '') url.port = null;
	      else parseURL(url, port, PORT);
	    }),
	    // `URL.prototype.pathname` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-pathname
	    pathname: accessorDescriptor(getPathname, function (pathname) {
	      var url = getInternalURLState(this);
	      if (url.cannotBeABaseURL) return;
	      url.path = [];
	      parseURL(url, pathname + '', PATH_START);
	    }),
	    // `URL.prototype.search` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-search
	    search: accessorDescriptor(getSearch, function (search) {
	      var url = getInternalURLState(this);
	      search = String(search);
	      if (search == '') {
	        url.query = null;
	      } else {
	        if ('?' == search.charAt(0)) search = search.slice(1);
	        url.query = '';
	        parseURL(url, search, QUERY);
	      }
	      getInternalSearchParamsState(url.searchParams).updateSearchParams(url.query);
	    }),
	    // `URL.prototype.searchParams` getter
	    // https://url.spec.whatwg.org/#dom-url-searchparams
	    searchParams: accessorDescriptor(getSearchParams),
	    // `URL.prototype.hash` accessors pair
	    // https://url.spec.whatwg.org/#dom-url-hash
	    hash: accessorDescriptor(getHash, function (hash) {
	      var url = getInternalURLState(this);
	      hash = String(hash);
	      if (hash == '') {
	        url.fragment = null;
	        return;
	      }
	      if ('#' == hash.charAt(0)) hash = hash.slice(1);
	      url.fragment = '';
	      parseURL(url, hash, FRAGMENT);
	    })
	  });
	}

	// `URL.prototype.toJSON` method
	// https://url.spec.whatwg.org/#dom-url-tojson
	redefine(URLPrototype, 'toJSON', function toJSON() {
	  return serializeURL.call(this);
	}, { enumerable: true });

	// `URL.prototype.toString` method
	// https://url.spec.whatwg.org/#URL-stringification-behavior
	redefine(URLPrototype, 'toString', function toString() {
	  return serializeURL.call(this);
	}, { enumerable: true });

	if (NativeURL) {
	  var nativeCreateObjectURL = NativeURL.createObjectURL;
	  var nativeRevokeObjectURL = NativeURL.revokeObjectURL;
	  // `URL.createObjectURL` method
	  // https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL
	  // eslint-disable-next-line no-unused-vars
	  if (nativeCreateObjectURL) redefine(URLConstructor, 'createObjectURL', function createObjectURL(blob) {
	    return nativeCreateObjectURL.apply(NativeURL, arguments);
	  });
	  // `URL.revokeObjectURL` method
	  // https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL
	  // eslint-disable-next-line no-unused-vars
	  if (nativeRevokeObjectURL) redefine(URLConstructor, 'revokeObjectURL', function revokeObjectURL(url) {
	    return nativeRevokeObjectURL.apply(NativeURL, arguments);
	  });
	}

	setToStringTag(URLConstructor, 'URL');

	_export({ global: true, forced: !nativeUrl, sham: !descriptors }, {
	  URL: URLConstructor
	});

	var workerTimers = null;
	var createLoadWorkerTimers = function createLoadWorkerTimers(load, worker) {
	  return function () {
	    if (workerTimers !== null) {
	      return workerTimers;
	    }

	    var blob = new Blob([worker], {
	      type: 'application/javascript; charset=utf-8'
	    });
	    var url = URL.createObjectURL(blob);
	    workerTimers = load(url); // Bug #1: Edge doesn't like the URL to be revoked directly.

	    workerTimers.setTimeout(function () {
	      return URL.revokeObjectURL(url);
	    }, 0);
	    return workerTimers;
	  };
	};

	// This is the minified and stringified code of the worker-timers-worker package.
	var worker = "!function(e){var t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){\"undefined\"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:\"Module\"}),Object.defineProperty(e,\"__esModule\",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&\"object\"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,\"default\",{enumerable:!0,value:e}),2&t&&\"string\"!=typeof e)for(var o in e)n.d(r,o,function(t){return e[t]}.bind(null,o));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,\"a\",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p=\"\",n(n.s=14)}([function(e,t,n){\"use strict\";n.d(t,\"a\",(function(){return i})),n.d(t,\"b\",(function(){return u})),n.d(t,\"c\",(function(){return a})),n.d(t,\"d\",(function(){return d}));const r=new Map,o=new Map,i=e=>{const t=r.get(e);if(void 0===t)throw new Error('There is no interval scheduled with the given id \"'.concat(e,'\".'));clearTimeout(t),r.delete(e)},u=e=>{const t=o.get(e);if(void 0===t)throw new Error('There is no timeout scheduled with the given id \"'.concat(e,'\".'));clearTimeout(t),o.delete(e)},f=(e,t)=>{let n,r;if(\"performance\"in self){const o=performance.now();n=o,r=e-Math.max(0,o-t)}else n=Date.now(),r=e;return{expected:n+r,remainingDelay:r}},c=(e,t,n,r)=>{const o=\"performance\"in self?performance.now():Date.now();o>n?postMessage({id:null,method:\"call\",params:{timerId:t,timerType:r}}):e.set(t,setTimeout(c,n-o,e,t,n,r))},a=(e,t,n)=>{const{expected:o,remainingDelay:i}=f(e,n);r.set(t,setTimeout(c,i,r,t,o,\"interval\"))},d=(e,t,n)=>{const{expected:r,remainingDelay:i}=f(e,n);o.set(t,setTimeout(c,i,o,t,r,\"timeout\"))}},function(e,t,n){\"use strict\";n.r(t);var r=n(2);for(var o in r)\"default\"!==o&&function(e){n.d(t,e,(function(){return r[e]}))}(o);var i=n(3);for(var o in i)\"default\"!==o&&function(e){n.d(t,e,(function(){return i[e]}))}(o);var u=n(4);for(var o in u)\"default\"!==o&&function(e){n.d(t,e,(function(){return u[e]}))}(o);var f=n(5);for(var o in f)\"default\"!==o&&function(e){n.d(t,e,(function(){return f[e]}))}(o);var c=n(6);for(var o in c)\"default\"!==o&&function(e){n.d(t,e,(function(){return c[e]}))}(o);var a=n(7);for(var o in a)\"default\"!==o&&function(e){n.d(t,e,(function(){return a[e]}))}(o);var d=n(8);for(var o in d)\"default\"!==o&&function(e){n.d(t,e,(function(){return d[e]}))}(o);var s=n(9);for(var o in s)\"default\"!==o&&function(e){n.d(t,e,(function(){return s[e]}))}(o)},function(e,t){},function(e,t){},function(e,t){},function(e,t){},function(e,t){},function(e,t){},function(e,t){},function(e,t){},function(e,t,n){\"use strict\";n.r(t);var r=n(11);for(var o in r)\"default\"!==o&&function(e){n.d(t,e,(function(){return r[e]}))}(o);var i=n(12);for(var o in i)\"default\"!==o&&function(e){n.d(t,e,(function(){return i[e]}))}(o);var u=n(13);for(var o in u)\"default\"!==o&&function(e){n.d(t,e,(function(){return u[e]}))}(o)},function(e,t){},function(e,t){},function(e,t){},function(e,t,n){\"use strict\";n.r(t);var r=n(0),o=n(1);for(var i in o)\"default\"!==i&&function(e){n.d(t,e,(function(){return o[e]}))}(i);var u=n(10);for(var i in u)\"default\"!==i&&function(e){n.d(t,e,(function(){return u[e]}))}(i);addEventListener(\"message\",e=>{let{data:t}=e;try{if(\"clear\"===t.method){const{id:e,params:{timerId:n,timerType:o}}=t;if(\"interval\"===o)Object(r.a)(n),postMessage({error:null,id:e});else{if(\"timeout\"!==o)throw new Error('The given type \"'.concat(o,'\" is not supported'));Object(r.b)(n),postMessage({error:null,id:e})}}else{if(\"set\"!==t.method)throw new Error('The given method \"'.concat(t.method,'\" is not supported'));{const{params:{delay:e,now:n,timerId:o,timerType:i}}=t;if(\"interval\"===i)Object(r.c)(e,o,n);else{if(\"timeout\"!==i)throw new Error('The given type \"'.concat(i,'\" is not supported'));Object(r.d)(e,o,n)}}}}catch(e){postMessage({error:{message:e.message},id:t.id,result:null})}})}]);"; // tslint:disable-line:max-line-length

	var loadWorkerTimers = createLoadWorkerTimers(load, worker);
	var setInterval = function setInterval(func, delay) {
	  return loadWorkerTimers().setInterval(func, delay);
	};

	var func$d = function func($clock) {
	  window.loader.key('moment', function () {
	    var time = moment().hours($clock.attr('data-hours')).minutes($clock.attr('data-minutes')).seconds($clock.attr('data-seconds'));
	    var intervalId = setInterval(function () {
	      time.add(1, 'second');
	      $clock.toggleClass('tock');
	      $clock.attr('style', time.format('[--start-hours:]H; [--start-minutes:]m; [--start-seconds:]s;'));
	    }, 1000);
	  });
	};

	var func$e = function func($target) {
	  var $modal = $target.find('#deleteAddressModal');
	  var $modalInput = $modal.find('input#deleteAddressId');
	  $($modal).on('show.bs.modal', function (e) {
	    $($modalInput).val($(e.relatedTarget).data('address-id'));
	  });
	  $($modal).on('hide.bs.modal', function (e) {
	    $($modalInput).val('');
	  });
	  var $contactCheck = $target.find('#contactDetailsCheck');

	  if ($($contactCheck).length && $($contactCheck).attr('checked') == false) {
	    $($target.find('input#firstName')).val('');
	    $($target.find('input#lastName')).val('');
	    $($target.find('input#phone')).val('');
	  }
	};

	var func$f = function func($target) {
	  window.loader.key('swiper', function () {
	    var $thumbs = $target.find('.gallery-thumbs'),
	        $top = $target.find('.gallery-top');
	    var thumbs = new Swiper($thumbs, {
	      slidesPerView: 4,
	      spaceBetween: 15,
	      allowTouchMove: false,
	      watchSlidesVisibility: true,
	      watchSlidesProgress: true
	    });
	    var top = new Swiper($top, {
	      slidesPerView: 1,
	      spaceBetween: 0,
	      effect: 'slide',
	      updateOnImagesReady: true,
	      navigation: {
	        nextEl: $target.find('.swiper-button-next'),
	        prevEl: $target.find('.swiper-button-prev')
	      },
	      thumbs: {
	        swiper: thumbs
	      },
	      breakpointsInverse: true,
	      breakpoints: {
	        768: {// md (and up) config here
	        }
	      },
	      on: {
	        imagesReady: function imagesReady() {
	          //fade gallery in when main/big images ready
	          $target.find('.gallery-content').addClass('show');
	          $target.removeClass('preload');
	        }
	      }
	    });
	  });
	};

	var func$g = function func($target) {
	  if ($target.find('a.cross-brand')[0]) {
	    /* add class to header on scroll - for mini version of header */
	    $(window).scroll(function () {
	      var scroll = $(window).scrollTop();

	      if (scroll >= 30) {
	        $target.addClass('mini');
	      } else {
	        $target.removeClass('mini');
	      }
	    });
	  }
	};

	var func$h = function func($target) {
	  var $confirm = $('input#' + $target.attr('id') + 'Confirm');
	  $target.on('blur', function (e) {
	    $confirm.attr('pattern', $target.val());
	  });
	  $target.on('keyup', function (e) {
	    $confirm.attr('pattern', $target.val());
	  });
	  $target.parents('form').on('submit', function (e) {
	    $confirm.attr('pattern', $target.val());
	  });
	};

	var func$i = function func($target) {
	  $target.find('input[data-url]').each(function () {
	    var $this = $(this);
	    $this.on('change', function (e) {
	      document.location = $this.data('url');
	    });
	  });
	};

	var func$j = function func($target) {
	  var $modal = $('.modal#deleteProductModal'),
	      $input = $modal.find('input#deleteLineItemId');
	  $modal.on('show.bs.modal', function (e) {
	    $input.attr('name', 'lineItems[' + $(e.relatedTarget).parents('[data-mod="lineItem"]').data('id') + '][remove]');
	  }).on('hidden.bs.modal', function (e) {
	    $input.attr('name', '');
	  });
	};

	var func$k = function func($target) {
	  $(window).on('scroll', function () {
	    var scroll = $(window).scrollTop();

	    if (scroll >= $target.parents('section').outerHeight()) {
	      $target.addClass('active');
	    } else {
	      $target.removeClass('active');
	    }
	  }).trigger('scroll');
	};

	var func$l = function func($target) {
	  var $modal = $target.find('#navModal'),
	      $toggle = $target.find('.btn-toggle'),
	      $close = $modal.find('.btn-close'),
	      $body = $('body');
	  $toggle.on('click', function (e) {
	    e.preventDefault();
	    $modal.modal({
	      keyboard: false
	    });
	  });
	  $close.on('click', function (e) {
	    e.preventDefault();
	    $modal.modal('hide');
	  });
	  $modal.on('show.bs.modal', function (e) {
	    $body.addClass('modal-backdrop-nav');
	    $toggle.attr('aria-expanded', 'true');
	    $close.attr('aria-expanded', 'true');
	  });
	  $modal.on('hidden.bs.modal', function (e) {
	    $body.removeClass('modal-backdrop-nav');
	    $toggle.attr('aria-expanded', 'false');
	    $close.attr('aria-expanded', 'false');
	  });
	};

	var func$m = function func() {//console.log('here');
	};

	var func$n = function func($target) {
	  var $window = $(window),
	      $body = $('body'),
	      $header = $('header'),
	      $submenu = $header.find('#submenu'),
	      $navDevice = $('#navDevice'),
	      $deviceHeader = $navDevice.find('.device-header'); //$style = $('<style type="text/css"></style>').appendTo($body);

	  var getHeaderHeight = function getHeaderHeight() {
	    return $header.outerHeight() - $submenu.outerHeight();
	  };

	  $window.on('resize', function (e) {
	    $target.trigger('mouseleave'); //$style.html('@media (max-width: ' + window.xsBreakpoint + 'px) { section { min-height:calc(100vh - ' + (getHeaderHeight() + 50) + 'px) !important; }}</style>');

	    $deviceHeader.height(getHeaderHeight());
	    $body.css('padding-top', getHeaderHeight());
	  }).trigger('resize');
	  window.loader.key('swiper', function () {
	    var kdNavCards,
	        $steps = $navDevice.find('.steps-clip'),
	        $deviceModalShow = $target.find('.btn-device'),
	        $deviceModalHide = $navDevice.find('.btn-device'),
	        $navDesktop = $('.desktop-primary'),
	        $megaMenu = $('.mega-container');
	    $deviceModalShow.on('click', function (e) {
	      $navDevice.modal({
	        keyboard: false
	      });
	    });
	    $deviceModalHide.on('click', function (e) {
	      $navDevice.modal('hide');
	    });
	    $navDevice.on('show.bs.modal', function (e) {
	      $body.addClass('modal-backdrop-nav');
	      $(this).attr('aria-expanded', 'true');
	      $deviceModalHide.attr('aria-expanded', 'true');
	    }).on('shown.bs.modal', function (e) {
	      kdNavCards = new Swiper('.kd-nav-cards', {
	        slidesPerView: 1.35,
	        spaceBetween: 0,
	        centeredSlides: false
	      });
	    }).on('hidden.bs.modal', function (e) {
	      $deviceModalShow.attr('aria-expanded', 'false');
	      $deviceModalHide.attr('aria-expanded', 'false');
	    }).on('hidden.bs.modal', function (e) {
	      $body.removeClass('modal-backdrop-nav');
	      $steps.removeClass('next');
	      kdNavCards.destroy();
	    });
	    $steps.find('.device-primary a[data-layout]').on('click', function (e) {
	      e.preventDefault();
	      var $this = $(this);
	      $steps.find('a.prev').text($this.text());
	      $steps.find('.step-body [id*="001-"]').removeClass('display');
	      $steps.find('#' + $this.attr('data-layout')).addClass('display');
	      $steps.find($this.attr('aria-expanded', 'true'));
	      $steps.addClass('next');
	      kdNavCards.slideTo(0, 0, false);
	      kdNavCards.update();
	    });
	    $steps.find('a.prev').on('click', function (e) {
	      e.preventDefault();
	      $steps.removeClass('next');
	      $steps.find('.device-primary a[data-layout]').attr('aria-expanded', 'false');
	    }); //kill modal for higher breakpoints for better peformance

	    $window.on('resize', function (e) {
	      if ($window.width() >= window.xsBreakpoint) {
	        //kill modal
	        if ($navDevice.hasClass('show')) {
	          $navDevice.modal('hide');
	        }
	      }
	    });

	    var clearLayouts = function clearLayouts() {
	      $megaMenu.find('[id^="001-"]').removeClass('show');
	      $navDesktop.find('a[data-layout]').removeClass('mega-active').attr('aria-expanded', 'false'); //$window.trigger('resize');
	    };

	    $navDesktop.find('a[data-layout]').on('mouseover', function (e) {
	      e.preventDefault();
	      clearLayouts();
	      var $this = $(this);
	      $this.addClass('mega-active').attr('aria-expanded', 'true');
	      $megaMenu.find('#' + $this.attr('data-layout')).addClass('show');
	      $megaMenu.addClass('show');
	    }).on('click', function (e) {
	      e.preventDefault();
	    });
	    $target.on('mouseleave', function (e) {
	      e.preventDefault();
	      $megaMenu.removeClass('show');
	      clearLayouts();
	    });
	  });
	};

	var func$o = function func($target) {
	  var $iframes = $target.find('.media iframe');
	  $iframes.each(function () {
	    var $this = $(this);
	    $this.data('src', $this.attr('src'));
	  });
	  $(window).on('resize', function () {
	    $iframes.each(function () {
	      var $this = $(this);

	      if ($this.is(':visible')) {
	        if ($this.attr('src') == '') {
	          $this.attr('src', $this.data('src'));
	        }
	      } else {
	        $this.attr('src', '');
	      }
	    });
	  });
	};

	var func$p = function func($target) {
	  window.loader.key('matchheight', function () {
	    $target.find('.title').matchHeight();
	  });
	};

	var defineProperty$5 = objectDefineProperty.f;

	var FunctionPrototype = Function.prototype;
	var FunctionPrototypeToString = FunctionPrototype.toString;
	var nameRE = /^\s*function ([^ (]*)/;
	var NAME = 'name';

	// Function instances `.name` property
	// https://tc39.github.io/ecma262/#sec-function-instances-name
	if (descriptors && !(NAME in FunctionPrototype)) {
	  defineProperty$5(FunctionPrototype, NAME, {
	    configurable: true,
	    get: function () {
	      try {
	        return FunctionPrototypeToString.call(this).match(nameRE)[1];
	      } catch (error) {
	        return '';
	      }
	    }
	  });
	}

	// @@match logic
	fixRegexpWellKnownSymbolLogic('match', 1, function (MATCH, nativeMatch, maybeCallNative) {
	  return [
	    // `String.prototype.match` method
	    // https://tc39.github.io/ecma262/#sec-string.prototype.match
	    function match(regexp) {
	      var O = requireObjectCoercible(this);
	      var matcher = regexp == undefined ? undefined : regexp[MATCH];
	      return matcher !== undefined ? matcher.call(regexp, O) : new RegExp(regexp)[MATCH](String(O));
	    },
	    // `RegExp.prototype[@@match]` method
	    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@match
	    function (regexp) {
	      var res = maybeCallNative(nativeMatch, regexp, this);
	      if (res.done) return res.value;

	      var rx = anObject(regexp);
	      var S = String(this);

	      if (!rx.global) return regexpExecAbstract(rx, S);

	      var fullUnicode = rx.unicode;
	      rx.lastIndex = 0;
	      var A = [];
	      var n = 0;
	      var result;
	      while ((result = regexpExecAbstract(rx, S)) !== null) {
	        var matchStr = String(result[0]);
	        A[n] = matchStr;
	        if (matchStr === '') rx.lastIndex = advanceStringIndex(S, toLength(rx.lastIndex), fullUnicode);
	        n++;
	      }
	      return n === 0 ? null : A;
	    }
	  ];
	});

	var func$q = function func($target) {
	  var $form = $target.find('form'),
	      $body = $('body'),
	      $modal = $form.find('.modal'),
	      $spinner = $modal.find('.modal-spinner');
	  $form.find('input[name="action"]').val('kd/forms/submit'); //#frm-start
	  //.step
	  //#frm-end
	  //step 1

	  var $firstStep = $form.find('#frm-start');
	  $firstStep.find('.btn').on('click', function (e) {
	    var $input = $firstStep.find('.form-control');
	    e.preventDefault(); //$form[0].checkValidity();

	    $form.addClass('was-validated'); //console.log($input)
	    //console.log($input[0].validity)

	    if ($input[0].validity.valid) {
	      console.log('continue');
	      window.findReplace('{' + $input.attr('name') + '}', $input.val(), $target);
	      $form.removeClass('was-validated'); //$input.removeClass('is-invalid');

	      $modal.modal({
	        keyboard: false
	      });
	      submitForm();
	    }
	  });
	  var $steps = $modal.find('.step').each(function (index) {
	    var $step = $(this);
	    $step.find('.btn[data-save="true"]').on('click', function (e) {
	      e.preventDefault();
	      var $input = $step.find('.form-control, .form-control-plaintext');
	      $form.addClass('was-validated'); //if ($input.attr('data-required') == '1' && $input.prop('required') == false) {

	      $input.prop('required', true); //}
	      //console.log(index + 1, $steps.length);

	      if ($input[0].validity.valid) {
	        window.findReplace('{' + $input.attr('name') + '}', $input.val(), $target);
	        $form.removeClass('was-validated'); //$input.removeClass('is-invalid');

	        if ($input.attr('name') == 'email') {
	          //console.log($input.val());
	          //console.log($input.val().match('(?<=@)[^]+'));
	          var domain = $input.val().match('@([^]+)')[1];
	          $target.find('input, textarea, options').each(function () {
	            var $this = $(this); //console.log($this.val(), $this.val().replace('{emailDomain}', domain));

	            $this.val($this.val().replace('{emailDomain}', 'www.' + domain));
	          });
	        }
	        /*if (index + 1 == $steps.length) {
	        	//last step
	        	//submit form
	        	$modal.modal('hide');
	        } else {
	        	$step.removeClass('show');
	        	$steps.eq(index + 1).addClass('show');
	        }*/


	        proceed(index);
	      }
	    });
	    $step.find('.btn[data-save="false"]').on('click', function (e) {
	      e.preventDefault();
	      var $input = $step.find('.form-control, .form-control-plaintext');
	      $input.prop('required', false);
	      $input.val('');
	      proceed(index);
	    });
	  });

	  function proceed(index) {
	    if (index + 1 == $steps.length) {
	      //last step
	      //submit form
	      $steps.removeClass('show');
	      $spinner.addClass('show');
	      submitForm();
	    } else {
	      submitForm();
	      $steps.removeClass('show');
	      $steps.eq(index + 1).addClass('show');
	    }
	  }

	  function submitForm() {
	    //console.log($form.serializeArray());
	    //loop through data and set any empty values to ' '?
	    //var data = $form.serializeArray();
	    $form.find('.btn-primary').addClass('btn-processing');
	    $.ajax({
	      url: '/',
	      method: 'POST',
	      data: $form.serialize(),
	      dataType: 'json'
	    }).done(function (response) {
	      console.log(response);

	      if (response.honeypot) {
	        var $honeypot = $form.find('input[name^=freeform_form_handle_]');
	        $honeypot.attr('name', response.honeypot.name);
	        $honeypot.attr('id', response.honeypot.name);
	        $honeypot.val(response.honeypot.hash);
	      }

	      if (response.hash) {
	        var $hash = $form.find('input[name="' + response.hash.name + '"]');
	        $hash.val(response.hash.value);
	      }

	      if (response.csrf) {
	        var $csrf = $form.find('input[name="' + response.csrf.name + '"]');
	        $csrf.val(response.csrf.value);
	      }

	      if (response.success && response.finished) {
	        $firstStep.removeClass('show');
	        $target.find('#frm-end').addClass('show');
	        $modal.modal('hide');
	      }

	      $form.find('.btn-primary').removeClass('btn-processing');
	    }).fail(function (data) {
	      console.log(data);
	      $form.find('.btn-primary').removeClass('btn-processing');
	    });
	  }

	  $modal.on('show.bs.modal', function (e) {
	    $body.addClass('modal-backdrop-form');
	  }).on('hide.bs.modal', function (e) {
	    $spinner.removeClass('show'); //$target.find('#frm-end').addClass('show');
	  }).on('hidden.bs.modal', function (e) {
	    $target.find('.step').removeClass('show');
	    $target.find('#step00').addClass('show');
	    $body.removeClass('modal-backdrop-form');
	    var data = $form.serialize();
	    data = data.replace('action=kd%2Fforms%2Fsubmit', 'action=kd%2Fforms%2Freset'); //console.log(data);

	    $.ajax({
	      url: '/',
	      method: 'POST',
	      data: data,
	      dataType: 'json'
	    }).done(function (response) {
	      //console.log(response);
	      if (response.honeypot) {
	        var $honeypot = $form.find('input[name^=freeform_form_handle_]');
	        $honeypot.attr('name', response.honeypot.name);
	        $honeypot.attr('id', response.honeypot.name);
	        $honeypot.attr('value', response.honeypot.hash); //console.log(response.honeypot.hash);
	        //console.log($honeypot[0]);
	      }

	      if (response.hash) {
	        var $hash = $form.find('input[name="' + response.hash.name + '"]');
	        $hash.val(response.hash.value);
	      }

	      if (response.csrf) {
	        var $csrf = $form.find('input[name="' + response.csrf.name + '"]');
	        $csrf.val(response.csrf.value);
	      }
	    });
	  }).find('.close').on('click', function (e) {
	    e.preventDefault();
	    $modal.modal('hide');
	  });
	  /*$target.find('.btn[data-step]').each(function() {
	  	$(this).click(function(e) {
	  		e.preventDefault();
	  		if ($(this).attr('data-step') == 'step04') {
	  			$modal.modal('hide');
	  		} else {
	  			$target.find('.step').removeClass('show');
	  			$target.find('#' + $(this).attr('data-step')).addClass('show');
	  		}
	  	});
	  });*/

	  /*
	     var mod008 = $('[data-kd-id="008"]'),
	         enquiryForm008 = $('#enquiryForm008');
	     //open modal
	     mod008.find('.btn').click(function(e) {
	         console.log('Modal button found');
	         e.preventDefault();
	         enquiryForm008.modal({
	             keyboard: false
	         });
	     });
	      //modal show
	     enquiryForm008.on('show.bs.modal', function() {ç
	         $body.addClass('modal-backdrop-form');
	     });
	      //close model on click
	     enquiryForm008.find('.close').click(function(e) {
	         enquiryForm008.modal('hide');
	     });
	      //modal hide
	     enquiryForm008.on('hide.bs.modal', function(e) {
	         mod008.find('#frm-start').removeClass('show');
	         mod008.find('#frm-end').addClass('show');
	     });
	      //modal hidden
	     enquiryForm008.on('hidden.bs.modal', function(e) {
	         //remove custom styling for nav modal backdrop
	         mod008.find('.step').removeClass('show');
	         mod008.find('#step00').addClass('show');
	         body.removeClass('modal-backdrop-form');
	     });
	      //steps
	     mod008.find('.btn[data-step]').each(function() {
	         $(this).click(function(e) {
	             e.preventDefault();
	             if ($(this).attr('data-step') == 'step04') {
	                 enquiryForm008.modal('hide');
	             } else {
	                 mod008.find('.step').removeClass('show');
	                 mod008.find('#' + $(this).attr('data-step')).addClass('show');
	             }
	         });
	     });*/
	};

	var func$r = function func($target) {
	  window.loader.key('maps', function () {
	    var $map = $target.find('.map');
	    var map = new google.maps.Map($map[0], {
	      center: {
	        lat: Number($map.data('lat')),
	        lng: Number($map.data('lng'))
	      },
	      zoom: Number($map.data('zoom'))
	    }); // Display the marker

	    var marker = new google.maps.Marker({
	      position: {
	        lat: Number($map.data('lat')),
	        lng: Number($map.data('lng'))
	      },
	      // A custom icon can be defined here, if desired
	      // icon: '/path/to/custom/icon.png',
	      map: map
	    });
	  });
	};

	var func$s = function func($target) {
	  window.loader.key('swiper', function () {
	    if ($target.find('.swiper-slide').length > 1) {
	      var quotes011 = new Swiper($target.find('.quotes'), {
	        slidesPerView: 1,
	        spaceBetween: 0,
	        navigation: {
	          nextEl: $target.find('.swiper-button-next'),
	          prevEl: $target.find('.swiper-button-prev')
	        },
	        on: {
	          init: function init() {
	            $('[data-kd-id="011"] .quotes').addClass('show');
	          }
	        }
	      });
	    }
	  });
	};

	var func$t = function func($target) {
	  $target.find('a').on('touchstart', function (e) {
	    if (!$(this).hasClass('linkEnabled')) {
	      e.stopPropagation();
	      $target.find('a').removeClass('linkEnabled'); //$(this).addClass('linkEnabled');
	    }
	  }).on('touchend', function (e) {
	    if (!$(this).hasClass('linkEnabled')) {
	      e.preventDefault();
	      $(this).addClass('linkEnabled');
	    }
	  });
	};

	var func$u = function func($target) {
	  var $nav = $target.find('nav ul'),
	      $active = $nav.find('.active'),
	      $tooltip = $target.find('[data-toggle="tooltip"]'),
	      $currency = $target.find('[data-toggle="dropdown"]');

	  if ($active[0]) {
	    $nav.animate({
	      scrollLeft: $active.offset().left - $(window).width() / 2 + $active.width() / 2
	    }, 250, 'swing');
	  } //$tooltip.tooltip(); - now init by app.js


	  window.loader.key('enquire', function () {
	    enquire.register('screen and (max-width: 767.98px)', {
	      match: function match() {
	        $tooltip.tooltip('disable');
	      },
	      unmatch: function unmatch() {
	        $tooltip.tooltip('enable');
	      }
	    });
	  });
	  $tooltip.on('show.bs.tooltip', function () {
	    $currency.dropdown('hide');
	  });
	};

	var func$v = function func($target) {
	  if ($target[0]) {
	    /* add class to header on scroll - for mini version of header */
	    if ($('body').hasClass('homepage')) {
	      $(window).scroll(function () {
	        var scroll = $(window).scrollTop();

	        if (scroll >= 30) {
	          $target.addClass('mini');
	        } else {
	          $target.removeClass('mini');
	        }
	      });
	    } //megamenus


	    $target.find('[data-mega]').each(function () {
	      var $this = $(this);
	      $this.on('mouseover', function (e) {
	        $target.find('.megamenus [id]').addClass('d-none');
	        $target.find($(this).attr('data-mega')).removeClass('d-none');
	        $target.find('.megamenus').removeClass('d-none');
	      }).on('click', function (e) {
	        e.preventDefault();
	      });
	    });
	    $target.on('mouseleave', function (e) {
	      $target.find('.megamenus').addClass('d-none');
	      $target.find('.megamenus [id]').addClass('d-none');
	    });
	  }
	};

	var func$w = function func($target) {
	  function reloadResults($target) {
	    var dataId = $target.attr('data-id'),
	        locator = '[data-id="' + dataId + '"] .container';
	    $($pageLinks).on('click', function (e) {
	      e.preventDefault();
	      var param = String(this.href);
	      $target.load(param + ' ' + locator, function () {
	        $pageLinks = $target.find('.pagination a');
	        reloadResults($target);
	        new LazyLoad({
	          elements_selector: '[loading=lazy]',
	          use_native: false
	        });
	      });
	      $('html, body').animate({
	        scrollTop: $target.offset().top - 20
	      }, 'fast');
	      window.history.pushState(null, null, param);
	    });
	  }

	  var $pageLinks = $target.find('.pagination a');

	  if ($pageLinks.length != 0) {
	    reloadResults($target);
	  }

	  window.addEventListener('popstate', function (e) {
	    var url = e.target.window.location.href,
	        selector = '[data-id="' + $target.attr('data-id') + '"] .container';
	    $target.load(url + ' ' + selector, function () {
	      $pageLinks = $target.find('.pagination a');
	      reloadResults($target);
	      new LazyLoad({
	        elements_selector: '[loading=lazy]',
	        use_native: false
	      });
	    });
	  });
	};

	var func$x = function func$1($target) {
	  var $form = $target.find('form'),
	      $query = $target.find('input[name="q"]'),
	      $btn = new func($target.find('button[type="submit"]')),
	      value = $query.val();
	  $btn.data('btn', 'false');
	  $form.on('submit', function (e) {
	    $btn.process();

	    if ($query.val() == value) {
	      $btn.processed();
	    }
	  });
	};

	var func$y = function func($target) {
	  window.loader.key('swiper', function () {
	    if ($target.find('.swiper-slide').length > 1) {
	      var productsSlider = new Swiper($target.find('.swiper-container'), {
	        slidesPerView: 1,
	        spaceBetween: 15,
	        effect: 'slide',
	        navigation: {
	          nextEl: '.swiper-container-wrap .swiper-button-next',
	          prevEl: '.swiper-container-wrap .swiper-button-prev'
	        },
	        breakpointsInverse: true,
	        breakpoints: {
	          768: {
	            // md (and up) config here
	            slidesPerView: 2
	          },
	          992: {
	            // lg (and up) config here
	            slidesPerView: 2
	          },
	          1200: {
	            // xl (and up) config here
	            slidesPerView: 2
	          }
	        },
	        on: {
	          init: function init() {
	            $target.find('.fade').addClass('show');
	          }
	        }
	      });
	    } else {
	      $target.find('.swiper-container').addClass('show');
	    }
	  });
	  window.loader.key('matchheight', function () {
	    $target.find('.swiper-slide').matchHeight({
	      byRow: false
	    });
	  });
	};

	// `thisNumberValue` abstract operation
	// https://tc39.github.io/ecma262/#sec-thisnumbervalue
	var thisNumberValue = function (value) {
	  if (typeof value != 'number' && classofRaw(value) != 'Number') {
	    throw TypeError('Incorrect invocation');
	  }
	  return +value;
	};

	// `String.prototype.repeat` method implementation
	// https://tc39.github.io/ecma262/#sec-string.prototype.repeat
	var stringRepeat = ''.repeat || function repeat(count) {
	  var str = String(requireObjectCoercible(this));
	  var result = '';
	  var n = toInteger(count);
	  if (n < 0 || n == Infinity) throw RangeError('Wrong number of repetitions');
	  for (;n > 0; (n >>>= 1) && (str += str)) if (n & 1) result += str;
	  return result;
	};

	var nativeToFixed = 1.0.toFixed;
	var floor$4 = Math.floor;

	var pow$1 = function (x, n, acc) {
	  return n === 0 ? acc : n % 2 === 1 ? pow$1(x, n - 1, acc * x) : pow$1(x * x, n / 2, acc);
	};

	var log = function (x) {
	  var n = 0;
	  var x2 = x;
	  while (x2 >= 4096) {
	    n += 12;
	    x2 /= 4096;
	  }
	  while (x2 >= 2) {
	    n += 1;
	    x2 /= 2;
	  } return n;
	};

	var FORCED$1 = nativeToFixed && (
	  0.00008.toFixed(3) !== '0.000' ||
	  0.9.toFixed(0) !== '1' ||
	  1.255.toFixed(2) !== '1.25' ||
	  1000000000000000128.0.toFixed(0) !== '1000000000000000128'
	) || !fails(function () {
	  // V8 ~ Android 4.3-
	  nativeToFixed.call({});
	});

	// `Number.prototype.toFixed` method
	// https://tc39.github.io/ecma262/#sec-number.prototype.tofixed
	_export({ target: 'Number', proto: true, forced: FORCED$1 }, {
	  // eslint-disable-next-line max-statements
	  toFixed: function toFixed(fractionDigits) {
	    var number = thisNumberValue(this);
	    var fractDigits = toInteger(fractionDigits);
	    var data = [0, 0, 0, 0, 0, 0];
	    var sign = '';
	    var result = '0';
	    var e, z, j, k;

	    var multiply = function (n, c) {
	      var index = -1;
	      var c2 = c;
	      while (++index < 6) {
	        c2 += n * data[index];
	        data[index] = c2 % 1e7;
	        c2 = floor$4(c2 / 1e7);
	      }
	    };

	    var divide = function (n) {
	      var index = 6;
	      var c = 0;
	      while (--index >= 0) {
	        c += data[index];
	        data[index] = floor$4(c / n);
	        c = (c % n) * 1e7;
	      }
	    };

	    var dataToString = function () {
	      var index = 6;
	      var s = '';
	      while (--index >= 0) {
	        if (s !== '' || index === 0 || data[index] !== 0) {
	          var t = String(data[index]);
	          s = s === '' ? t : s + stringRepeat.call('0', 7 - t.length) + t;
	        }
	      } return s;
	    };

	    if (fractDigits < 0 || fractDigits > 20) throw RangeError('Incorrect fraction digits');
	    // eslint-disable-next-line no-self-compare
	    if (number != number) return 'NaN';
	    if (number <= -1e21 || number >= 1e21) return String(number);
	    if (number < 0) {
	      sign = '-';
	      number = -number;
	    }
	    if (number > 1e-21) {
	      e = log(number * pow$1(2, 69, 1)) - 69;
	      z = e < 0 ? number * pow$1(2, -e, 1) : number / pow$1(2, e, 1);
	      z *= 0x10000000000000;
	      e = 52 - e;
	      if (e > 0) {
	        multiply(0, z);
	        j = fractDigits;
	        while (j >= 7) {
	          multiply(1e7, 0);
	          j -= 7;
	        }
	        multiply(pow$1(10, j, 1), 0);
	        j = e - 1;
	        while (j >= 23) {
	          divide(1 << 23);
	          j -= 23;
	        }
	        divide(1 << j);
	        multiply(1, 1);
	        divide(2);
	        result = dataToString();
	      } else {
	        multiply(0, z);
	        multiply(1 << -e, 0);
	        result = dataToString() + stringRepeat.call('0', fractDigits);
	      }
	    }
	    if (fractDigits > 0) {
	      k = result.length;
	      result = sign + (k <= fractDigits
	        ? '0.' + stringRepeat.call('0', fractDigits - k) + result
	        : result.slice(0, k - fractDigits) + '.' + result.slice(k - fractDigits));
	    } else {
	      result = sign + result;
	    } return result;
	  }
	});

	var func$z = function func($target) {
	  var $removeBtn = $target.find('[data-id="btn-remove"]'),
	      total = $target.find('[data-multiadd-total]').data('multiadd-total'),
	      $currencyTotal = $target.find('[data-id="currency-total"]');
	  $removeBtn.on('click', function (e) {
	    e.preventDefault();
	    var $this = $(this),
	        $qty = $this.parent().find('[data-id="qty"]'),
	        $container = $this.parent().find('.card'),
	        price = $this.data('price');

	    if ($qty.val() == 0) {
	      $container.css("opacity", "");
	      $qty.val(1);
	      $this.text('Remove'); // add

	      total += price;
	    } else {
	      $container.css("opacity", ".1");
	      $qty.val(0);
	      $this.text('Select'); // sub

	      total -= price;
	    }

	    $currencyTotal.text(function (i, txt) {
	      return txt.replace(/[0-9.]+/, total.toFixed(2));
	    });
	  });
	};

	var trim$1 = stringTrim.trim;


	var nativeParseInt = global_1.parseInt;
	var hex = /^[+-]?0[Xx]/;
	var FORCED$2 = nativeParseInt(whitespaces + '08') !== 8 || nativeParseInt(whitespaces + '0x16') !== 22;

	// `parseInt` method
	// https://tc39.github.io/ecma262/#sec-parseint-string-radix
	var _parseInt = FORCED$2 ? function parseInt(string, radix) {
	  var S = trim$1(String(string));
	  return nativeParseInt(S, (radix >>> 0) || (hex.test(S) ? 16 : 10));
	} : nativeParseInt;

	// `parseInt` method
	// https://tc39.github.io/ecma262/#sec-parseint-string-radix
	_export({ global: true, forced: parseInt != _parseInt }, {
	  parseInt: _parseInt
	});

	var func$A = function func$1($target) {
	  var $removeBtn = $target.find('[data-id="btn-remove"]'),
	      $atcBtn = new func($target.find('[data-id="btn-atc"]')),
	      $errorMessage = $target.find('[data-id="error-message"]'),
	      $alert = $errorMessage.find('.alert');
	  $removeBtn.on('click', function (e) {
	    e.preventDefault();
	    var $this = $(this),
	        $qty = $this.parents('.card').find('[data-id="qty"]'),
	        $image = $this.parents('.card').find('.card-img-top');
	    console.log($image);

	    if ($qty.val() == 0) {
	      $image.removeClass("inactive");
	      $qty.val(1);
	      $this.text('Remove');
	    } else {
	      $image.addClass("inactive");
	      $qty.val(0);
	      $this.text('Select');
	    }
	  });
	  $target.on('submit', function (e) {
	    var $this = $(this),
	        $gifts = $this.parents().find('[data-max-choice]'),
	        confirmedRows = 0,
	        totalOffersSelected = 0;
	    $atcBtn.process();
	    $alert.find('p').remove();
	    $gifts.each(function () {
	      var $this = $(this),
	          $max = $this.data('max-choice'),
	          $qty = $this.find('[data-id="qty"]'),
	          totalQty = 0;
	      $qty.each(function () {
	        totalQty = totalQty + parseInt($(this).val());
	      });

	      if (totalQty > 0 && totalQty <= $max) {
	        confirmedRows++;
	      }

	      if (totalQty > 0) {
	        totalOffersSelected++;
	      }
	    });

	    if ($gifts.length == confirmedRows) {
	      $errorMessage.addClass('d-none');
	    } else {
	      e.preventDefault();
	      $errorMessage.removeClass('d-none');

	      if ($gifts.length != totalOffersSelected) {
	        $alert.append("<p>Please select a free gift for each promotion</p>");
	      } else {
	        $alert.append("<p>Please select the correct number of products for each promotion</p>");
	      }
	    }

	    $atcBtn.processed();
	  });
	};

	var func$B = function func($target) {
	  if ($target[0]) {
	    window.loader.keys(['colcade'], function () {
	      var $gallery = $target.find('.gallery');
	      var $modal = $target.find('.modal');
	      $gallery.colcade({
	        columns: '.gallery-col',
	        items: '.gallery-item'
	      }); // $(window).resize(function() {
	      //     mod104Reveal.css('height', mod104Gallery.height());
	      // });
	      //custom color for modal

	      $modal.on('show.bs.modal', function (e) {
	        $('body').addClass('modal104-modal');
	        var currImgSrc = $(e.relatedTarget).data('full-src');
	        $(this).find('img').attr('src', currImgSrc);
	      });
	      $modal.on('hidden.bs.modal', function (e) {
	        $('body').removeClass('modal104-modal');
	        $(this).find('img').attr('src', '');
	      }); //update img src in modal
	      // mod104Gallery.find('[data-target]').click(function() {
	      //     var tempUrl = $(this).data('full-src');
	      //     mod104Modal.find('img').attr('src', tempUrl);
	      // });
	    });
	  }
	};

	var func$C = function func($target) {
	  window.loader.key('zxcvbn', function () {
	    var strengthScore = 0,
	        $input = $target.find('input'),
	        $meter = $target.find('.progress-bar'),
	        $text = $target.find('.meter-text');
	    var colours = {
	      0: 'bg-danger',
	      1: 'bg-danger',
	      2: 'bg-warning',
	      3: 'bg-success',
	      4: 'bg-success'
	    };
	    $input.on('input', function (e) {
	      var val = $input.val(),
	          result = zxcvbn(val);
	      strengthScore = result.score; //console.log(result);

	      if (result.score < 1) {
	        result.score = 0.2;
	        strengthScore = 0;
	      }

	      if (result.password.length == 0) {
	        result.score = 0;
	      } //if (result.score > 2) {
	      //$input.attr('pattern', '.{6,}');
	      //} else {
	      //$input.attr('pattern', '[.]');
	      //}


	      $meter.width(result.score * 25 + '%');
	      $meter.removeClass('bg-danger bg-warning bg-success').addClass(colours[strengthScore]);

	      if (val !== '') {
	        //$text.text(strength[result.score]);
	        $text.text(result.feedback.warning); //$suggestions.text(result.feedback.warning);
	      } else {
	        $text.text(''); //$suggestions.text('');
	      }
	    });
	  });
	};

	var func$D = function func($target) {
	  var $modal = $('.modal#deletePaymentModal'),
	      $input = $modal.find('input#paymentToken');
	  $modal.on('show.bs.modal', function (e) {
	    $input.val($(e.relatedTarget).data('id'));
	  }).on('hidden.bs.modal', function (e) {
	    $input.val('');
	  });
	};

	var func$E = function func($target) {
	  var $plans = $target.find('[data-toggle="modal"]'),
	      $modal = $($plans.eq(1).attr('data-target'));
	  $modal.on('show.bs.modal', function (e) {
	    var $button = $(e.relatedTarget),
	        uid = $button.data('plan-uid'),
	        name = $button.data('plan-name'),
	        amount = $button.data('plan-price');
	    $modal.find('input[name="planUid"]').val(uid);
	    $modal.find('span[data-id="planName"]').text(name);
	    $modal.find('input[name="amount"]').val(amount);
	  });
	};

	var trim$2 = stringTrim.trim;


	var nativeParseFloat = global_1.parseFloat;
	var FORCED$3 = 1 / nativeParseFloat(whitespaces + '-0') !== -Infinity;

	// `parseFloat` method
	// https://tc39.github.io/ecma262/#sec-parsefloat-string
	var _parseFloat = FORCED$3 ? function parseFloat(string) {
	  var trimmedString = trim$2(String(string));
	  var result = nativeParseFloat(trimmedString);
	  return result === 0 && trimmedString.charAt(0) == '-' ? -0 : result;
	} : nativeParseFloat;

	// `parseFloat` method
	// https://tc39.github.io/ecma262/#sec-parsefloat-string
	_export({ global: true, forced: parseFloat != _parseFloat }, {
	  parseFloat: _parseFloat
	});

	var func$F = function func($target) {
	  var gutter = 30,
	      height,
	      headerHeight,
	      padding;
	  $(window).on('resize', function () {
	    height = $target.height();
	    headerHeight = $('header').height() + gutter;
	    padding = $target.parents('section').css('padding-bottom');
	    $target.css('top', headerHeight);

	    if (height > $(window).height() - headerHeight - parseFloat(padding)) {
	      $target.css('top', 'calc(100vh - (' + height + 'px + ' + padding + '))');
	    }
	  }).trigger('resize');
	};

	var func$G = function func($target) {
	  var gutter = 30,
	      $header = $('header'),
	      $thumbs = $target.find('.gallery-thumbs a'),
	      height;
	  $(window).on('resize', function () {
	    height = $header.height() + gutter;
	    $target.css('top', height);
	  }).trigger('resize');
	  $('body').scrollspy({
	    target: $target.find('.gallery-thumbs'),
	    offset: height + gutter,
	    method: 'offset'
	  });
	  $thumbs.on('click', function (e) {
	    e.preventDefault();
	    var $this = $(this);
	    window.scroller.animateScroll($($this.attr('href')).offset().top - $header.outerHeight() - gutter);
	  });
	};

	var func$H = function func($target) {
	  window.loader.key('rangeSlider', function () {
	    var $parent = $target.parent();
	    $target.ionRangeSlider({
	      onStart: function onStart(data) {
	        $parent.addClass('show');
	      },
	      onFinish: function onFinish(data) {
	        var found = false;
	        $.each(window.uri.segment(), function (i) {
	          if (this.indexOf('price=') != -1) {
	            if (data.from == $target.data('min') && data.to == $target.data('max')) {
	              window.uri.segment(i, '');
	            } else {
	              window.uri.segment(i, 'price=' + data.from + ',' + data.to);
	            }

	            found = true;
	          }
	        });

	        if (found === false) {
	          window.uri.segment('price=' + data.from + ',' + data.to);
	        }

	        document.location = window.uri.href();
	      },
	      skin: "round"
	    });
	  });
	};

	var func$I = function func($target) {
	  window.loader.key('rateyo', function () {
	    $target.rateYo({
	      starWidth: '40px',
	      spacing: '-1px',
	      normalFill: '#dee2e6',
	      ratedFill: '#F2DC31',
	      fullStar: true,
	      starSvg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><use xlink:href="#reviewStar"></use></svg>',
	      onSet: function onSet(rating, rateYoInstance) {
	        $('[name="' + $target.data('target') + '"]').val(rating);
	      }
	    });
	  });
	};

	var func$J = function func($target) {
	  window.loader.key('swiper', function () {
	    var spv = $target.attr('data-kd-type') == 'mod' ? 1 : 2;
	    var productsSlider = new Swiper($target.find('.swiper-container'), {
	      slidesPerView: 1,
	      spaceBetween: 30,
	      effect: 'slide',
	      navigation: {
	        nextEl: '.swiper-button-next',
	        prevEl: '.swiper-button-prev'
	      },
	      breakpointsInverse: true,
	      breakpoints: {
	        768: {
	          slidesPerView: spv
	        },
	        992: {
	          slidesPerView: spv + 1
	        },
	        1200: {
	          slidesPerView: spv + 2
	        }
	      },
	      on: {
	        init: function init() {
	          $target.find('.fade').addClass('show');
	        }
	      }
	    });
	  });
	};

	var func$K = function func($target) {
	  $target.on('change', function (e) {
	    document.location = this.value;
	  });
	};

	var func$L = function func($target) {
	  var $input = $target.find('input[type="password"]'),
	      $btn = $target.find('.btn');
	  $btn.on('click', function (e) {
	    e.preventDefault;

	    if ($input.attr('type') == 'password') {
	      $input.attr('type', 'text');
	    } else {
	      $input.attr('type', 'password');
	    }
	  });
	};

	var func$M = function func($target) {
	  var $sidebar = $($target.data('target')),
	      $cols = $('[data-id="productColumns"]'),
	      $flash = $('[data-flash-ui]'),
	      $window = $(window);
	  $target.on('click', function (e) {
	    e.preventDefault();

	    if ($sidebar.hasClass('d-none')) {
	      $sidebar.removeClass('d-none');
	      $target.find('span').text('Hide Filters');
	      $cols.removeClass('lg-cols-4').addClass('lg-cols-3');
	    } else {
	      $sidebar.addClass('d-none');
	      $target.find('span').text('Show Filters');
	      $cols.removeClass('lg-cols-3').addClass('lg-cols-4');
	    }

	    $flash.each(function () {
	      var $this = $(this),
	          fadeSpeed = parseInt($this.data('flash-ui'));
	      $this.fadeOut(0).fadeIn(fadeSpeed);
	    });
	  });

	  if ($window.width() <= window.smBreakpoint) {
	    $target.trigger('click');
	  }
	};

	var SPECIES$4 = wellKnownSymbol('species');

	// `SpeciesConstructor` abstract operation
	// https://tc39.github.io/ecma262/#sec-speciesconstructor
	var speciesConstructor = function (O, defaultConstructor) {
	  var C = anObject(O).constructor;
	  var S;
	  return C === undefined || (S = anObject(C)[SPECIES$4]) == undefined ? defaultConstructor : aFunction$1(S);
	};

	var arrayPush = [].push;
	var min$4 = Math.min;
	var MAX_UINT32 = 0xFFFFFFFF;

	// babel-minify transpiles RegExp('x', 'y') -> /x/y and it causes SyntaxError
	var SUPPORTS_Y = !fails(function () { return !RegExp(MAX_UINT32, 'y'); });

	// @@split logic
	fixRegexpWellKnownSymbolLogic('split', 2, function (SPLIT, nativeSplit, maybeCallNative) {
	  var internalSplit;
	  if (
	    'abbc'.split(/(b)*/)[1] == 'c' ||
	    'test'.split(/(?:)/, -1).length != 4 ||
	    'ab'.split(/(?:ab)*/).length != 2 ||
	    '.'.split(/(.?)(.?)/).length != 4 ||
	    '.'.split(/()()/).length > 1 ||
	    ''.split(/.?/).length
	  ) {
	    // based on es5-shim implementation, need to rework it
	    internalSplit = function (separator, limit) {
	      var string = String(requireObjectCoercible(this));
	      var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
	      if (lim === 0) return [];
	      if (separator === undefined) return [string];
	      // If `separator` is not a regex, use native split
	      if (!isRegexp(separator)) {
	        return nativeSplit.call(string, separator, lim);
	      }
	      var output = [];
	      var flags = (separator.ignoreCase ? 'i' : '') +
	                  (separator.multiline ? 'm' : '') +
	                  (separator.unicode ? 'u' : '') +
	                  (separator.sticky ? 'y' : '');
	      var lastLastIndex = 0;
	      // Make `global` and avoid `lastIndex` issues by working with a copy
	      var separatorCopy = new RegExp(separator.source, flags + 'g');
	      var match, lastIndex, lastLength;
	      while (match = regexpExec.call(separatorCopy, string)) {
	        lastIndex = separatorCopy.lastIndex;
	        if (lastIndex > lastLastIndex) {
	          output.push(string.slice(lastLastIndex, match.index));
	          if (match.length > 1 && match.index < string.length) arrayPush.apply(output, match.slice(1));
	          lastLength = match[0].length;
	          lastLastIndex = lastIndex;
	          if (output.length >= lim) break;
	        }
	        if (separatorCopy.lastIndex === match.index) separatorCopy.lastIndex++; // Avoid an infinite loop
	      }
	      if (lastLastIndex === string.length) {
	        if (lastLength || !separatorCopy.test('')) output.push('');
	      } else output.push(string.slice(lastLastIndex));
	      return output.length > lim ? output.slice(0, lim) : output;
	    };
	  // Chakra, V8
	  } else if ('0'.split(undefined, 0).length) {
	    internalSplit = function (separator, limit) {
	      return separator === undefined && limit === 0 ? [] : nativeSplit.call(this, separator, limit);
	    };
	  } else internalSplit = nativeSplit;

	  return [
	    // `String.prototype.split` method
	    // https://tc39.github.io/ecma262/#sec-string.prototype.split
	    function split(separator, limit) {
	      var O = requireObjectCoercible(this);
	      var splitter = separator == undefined ? undefined : separator[SPLIT];
	      return splitter !== undefined
	        ? splitter.call(separator, O, limit)
	        : internalSplit.call(String(O), separator, limit);
	    },
	    // `RegExp.prototype[@@split]` method
	    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@split
	    //
	    // NOTE: This cannot be properly polyfilled in engines that don't support
	    // the 'y' flag.
	    function (regexp, limit) {
	      var res = maybeCallNative(internalSplit, regexp, this, limit, internalSplit !== nativeSplit);
	      if (res.done) return res.value;

	      var rx = anObject(regexp);
	      var S = String(this);
	      var C = speciesConstructor(rx, RegExp);

	      var unicodeMatching = rx.unicode;
	      var flags = (rx.ignoreCase ? 'i' : '') +
	                  (rx.multiline ? 'm' : '') +
	                  (rx.unicode ? 'u' : '') +
	                  (SUPPORTS_Y ? 'y' : 'g');

	      // ^(? + rx + ) is needed, in combination with some S slicing, to
	      // simulate the 'y' flag.
	      var splitter = new C(SUPPORTS_Y ? rx : '^(?:' + rx.source + ')', flags);
	      var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
	      if (lim === 0) return [];
	      if (S.length === 0) return regexpExecAbstract(splitter, S) === null ? [S] : [];
	      var p = 0;
	      var q = 0;
	      var A = [];
	      while (q < S.length) {
	        splitter.lastIndex = SUPPORTS_Y ? q : 0;
	        var z = regexpExecAbstract(splitter, SUPPORTS_Y ? S : S.slice(q));
	        var e;
	        if (
	          z === null ||
	          (e = min$4(toLength(splitter.lastIndex + (SUPPORTS_Y ? 0 : q)), S.length)) === p
	        ) {
	          q = advanceStringIndex(S, q, unicodeMatching);
	        } else {
	          A.push(S.slice(p, q));
	          if (A.length === lim) return A;
	          for (var i = 1; i <= z.length - 1; i++) {
	            A.push(z[i]);
	            if (A.length === lim) return A;
	          }
	          q = p = e;
	        }
	      }
	      A.push(S.slice(p));
	      return A;
	    }
	  ];
	}, !SUPPORTS_Y);

	var func$N = function func($target) {
	  console.log($target);
	  var $el = $target.find('em'),
	      delay = 2000,
	      words = $target.data('words').split(','),
	      loopNum = 0,
	      txt = '',
	      deleting = false;

	  var tick = function tick() {
	    var i = loopNum % words.length;
	    var fullTxt = words[i];

	    if (deleting) {
	      txt = fullTxt.substring(0, txt.length - 1);
	    } else {
	      txt = fullTxt.substring(0, txt.length + 1);
	    }

	    $el.html(txt);
	    $el.removeClass('end').removeClass('start');
	    var delta = 200 - Math.random() * 100;

	    if (deleting) {
	      delta /= 2;
	    }

	    if (!deleting && txt === fullTxt) {
	      delta = delay;
	      deleting = true;
	      $el.addClass('end');
	    } else if (deleting && txt === '') {
	      deleting = false;
	      loopNum++;
	      delta = 500;
	      $el.addClass('start');
	    }

	    setTimeout(tick, delta);
	  };

	  tick();
	};

	var func$O = function func($target) {
	  var $videoModal = $target.find('.modal'),
	      $body = $('body'),
	      $iframe = $videoModal.find('iframe'),
	      src = $iframe.attr('src');
	  $videoModal.on('show.bs.modal', function (e) {
	    $body.addClass('modal-backdrop-media');

	    if (src.indexOf('?') == -1) {
	      $iframe.attr('src', src + '?autoplay=1');
	    } else {
	      $iframe.attr('src', src + '&autoplay=1');
	    }
	  }).on('hidden.bs.modal', function (e) {
	    $iframe.attr('src', '');
	    $body.removeClass('modal-backdrop-media');
	  });
	};



	var modules = /*#__PURE__*/Object.freeze({
		__proto__: null,
		addBundle: func$2,
		addProduct: func$3,
		addressCard: func$4,
		addressContact: func$5,
		addressLookup: func$6,
		ajaxEcomHeader: func$7,
		ajaxForm: func$8,
		ajaxProductDetail: func$9,
		ajaxProductListing: func$a,
		braintree: func$b,
		clipboardCopy: func$c,
		clock: func$d,
		deleteModal: func$e,
		gallery: func$f,
		headerShrink: func$g,
		inputConfirm: func$h,
		inputRedirect: func$i,
		lineItem: func$j,
		miniProductBar: func$k,
		mobileNavModal: func$l,
		mod000: func$m,
		mod001: func$n,
		mod002: func$o,
		mod006: func$p,
		mod008: func$q,
		mod009: func$r,
		mod011: func$s,
		mod019: func$t,
		mod031: func$u,
		mod052: func$v,
		mod066: func$w,
		mod086: func$x,
		mod096: func$y,
		mod097: func$z,
		mod098: func$A,
		mod104: func$B,
		passwordMeter: func$C,
		paymentCard: func$D,
		plans: func$E,
		productDetail: func$F,
		productImages: func$G,
		rangeSlider: func$H,
		rating: func$I,
		relatedCarousel: func$J,
		selectRedirect: func$K,
		showPassword: func$L,
		sidebarToggle: func$M,
		typer: func$N,
		videoModal: func$O
	});

	var func$P = function func($target) {};

	var func$Q = function func($target) {
	  if ($target[0]) {
	    window.loader.keys(['colcade'], function () {
	      var $gallery = $target.find('.gallery');
	      var $modal = $target.find('.modal');
	      $gallery.colcade({
	        columns: '.gallery-col',
	        items: '.gallery-item'
	      }); // $(window).resize(function() {
	      //     mod104Reveal.css('height', mod104Gallery.height());
	      // });
	      //custom color for modal

	      $modal.on('show.bs.modal', function (e) {
	        $('body').addClass('modal104-modal');
	        var currImgSrc = $(e.relatedTarget).data('full-src');
	        $(this).find('img').attr('src', currImgSrc);
	      });
	      $modal.on('hidden.bs.modal', function (e) {
	        $('body').removeClass('modal104-modal');
	        $(this).find('img').attr('src', '');
	      }); //update img src in modal
	      // mod104Gallery.find('[data-target]').click(function() {
	      //     var tempUrl = $(this).data('full-src');
	      //     mod104Modal.find('img').attr('src', tempUrl);
	      // });
	    });
	  }
	};

	var func$R = function func() {//console.log('module: heading');
	};



	var components = /*#__PURE__*/Object.freeze({
		__proto__: null,
		example: func$P,
		gallery: func$Q,
		heading: func$R
	});

	var func$S = function func$1() {
	  $('form.needs-validation').each(function () {
	    var $form = $(this),
	        $btn = new func($form.find('button[type="submit"]'));
	    $form.on('submit', function (e) {
	      $btn.disable();

	      if ($form[0].checkValidity() === false) {
	        e.preventDefault();
	        e.stopImmediatePropagation();
	        $btn.enable();
	        var scrollPos = $form.find(':invalid').eq(0).parents('.form-group').offset().top;
	        var $kd45 = $('[data-kd-id="045"]');
	        window.scroller.animateScroll(Number(scrollPos) - Number($('header').outerHeight() + ($kd45[0] ? $kd45.outerHeight() : 0)));
	      } else {
	        $btn.process();
	      }

	      $form.addClass('was-validated');
	    });
	  });
	};

	var GMTID = '';

	function getFilename(key) {
	  {
	    return key + '.js';
	  }
	}

	function getAppKey(key) {
	  if (window.appKeys) {
	    return window.appKeys[key] || null;
	  }

	  return null;
	}

	window.loader = loadjs_umd; //console.log(window.loader);
	//window.loader = require('loadjs');

	window.loader.config({
	  livereload: {
	    files: ['//localhost:9090/livereload.js?snipver=1']
	  },
	  jquery: {
	    files: ['https://code.jquery.com/jquery-3.3.1.min.js']
	  },
	  popper: {
	    files: ['https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js']
	  },
	  bootstrap: {
	    files: ['https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js'],
	    deps: ['jquery', 'popper']
	  },
	  gsap: {
	    files: ['https://cdnjs.cloudflare.com/ajax/libs/gsap/1.20.4/TweenMax.min.js']
	  },
	  lodash: {
	    files: ['https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.10/lodash.min.js']
	  },
	  moment: {
	    files: ['https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.23.0/moment.min.js']
	  },
	  rangeSlider: {
	    files: ['https://cdnjs.cloudflare.com/ajax/libs/ion-rangeslider/2.3.0/js/ion.rangeSlider.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/ion-rangeslider/2.3.0/css/ion.rangeSlider.min.css']
	  },
	  noUiSlider: {
	    keys: ['https://cdnjs.cloudflare.com/ajax/libs/noUiSlider/11.1.0/nouislider.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/noUiSlider/11.1.0/nouislider.min.css']
	  },
	  cookies: {
	    files: ['https://cdnjs.cloudflare.com/ajax/libs/js-cookie/2.1.4/js.cookie.min.js']
	  },
	  enquire: {
	    files: ['https://cdnjs.cloudflare.com/ajax/libs/enquire.js/2.1.6/enquire.min.js']
	  },
	  uri: {
	    files: ['https://cdnjs.cloudflare.com/ajax/libs/URI.js/1.19.1/URI.min.js']
	  },
	  address: {
	    files: ['https://cdnjs.cloudflare.com/ajax/libs/jquery.address/1.6/jquery.address.min.js']
	  },
	  'numeral-core': {
	    files: ['https://cdnjs.cloudflare.com/ajax/libs/numeral.js/2.0.6/numeral.min.js']
	  },
	  numeral: {
	    files: ['https://cdnjs.cloudflare.com/ajax/libs/numeral.js/2.0.6/locales/en-gb.min.js'],
	    deps: ['numeral-core']
	  },
	  uniform: {
	    files: ['https://cdnjs.cloudflare.com/ajax/libs/Uniform.js/4.2.2/js/jquery.uniform.bundled.js']
	  },
	  swiper: {
	    files: ['https://cdnjs.cloudflare.com/ajax/libs/Swiper/4.5.0/js/swiper.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/Swiper/4.5.0/css/swiper.min.css']
	  },
	  gumshoe: {
	    files: ['https://cdnjs.cloudflare.com/ajax/libs/gumshoe/3.5.0/js/gumshoe.min.js']
	  },
	  smoothscroll: {
	    files: ['https://cdnjs.cloudflare.com/ajax/libs/smooth-scroll/16.0.3/smooth-scroll.min.js']
	  },
	  scrollbar: {
	    files: ['https://cdnjs.cloudflare.com/ajax/libs/malihu-custom-scrollbar-plugin/3.1.5/jquery.mCustomScrollbar.concat.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/malihu-custom-scrollbar-plugin/3.1.5/jquery.mCustomScrollbar.min.css'],
	    deps: ['jquery']
	  },
	  picturefill: {
	    files: ['https://cdnjs.cloudflare.com/ajax/libs/picturefill/3.0.3/picturefill.min.js']
	  },
	  lazysizes: {
	    files: ['https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.1.0/lazysizes.min.js']
	  },
	  lazyload: {
	    files: ['https://cdnjs.cloudflare.com/ajax/libs/vanilla-lazyload/12.0.0/lazyload.min.js']
	  },
	  matchheight: {
	    files: ['https://cdnjs.cloudflare.com/ajax/libs/jquery.matchHeight/0.7.2/jquery.matchHeight-min.js'],
	    deps: ['jquery']
	  },
	  'jquery-mask': {
	    files: ['https://cdnjs.cloudflare.com/ajax/libs/jquery.mask/1.14.15/jquery.mask.min.js'],
	    deps: ['jquery']
	  },
	  ga: {
	    files: ['https://www.google-analytics.com/analytics.js']
	  },
	  gtm: {
	    files: ['https://www.googletagmanager.com/gtm.js?id=' + GMTID]
	  },
	  'ga-tracker': {
	    files: ['/assets/js/' + getFilename('tracker')]
	  },
	  zxcvbn: {
	    files: ['https://cdnjs.cloudflare.com/ajax/libs/zxcvbn/4.4.2/zxcvbn.js']
	  },
	  braintree: {
	    keys: ['braintree-client', 'braintree-hosted-fields', 'braintree-three-d-secure']
	  },
	  'braintree-client': {
	    files: ['https://js.braintreegateway.com/web/3.32.1/js/client.min.js']
	  },
	  'braintree-hosted-fields': {
	    files: ['https://js.braintreegateway.com/web/3.32.1/js/hosted-fields.min.js']
	  },
	  'braintree-three-d-secure': {
	    files: ['https://js.braintreegateway.com/web/3.32.1/js/three-d-secure.min.js']
	  },
	  'braintree-dropinUI': {
	    //files: ['https://js.braintreegateway.com/web/dropin/1.13.0/js/dropin.min.js', 'https://www.paypalobjects.com/api/checkout.js', 'https://payments.developers.google.com/js/apis/pay.js']
	    files: ['https://js.braintreegateway.com/web/dropin/1.20.1/js/dropin.min.js']
	  },
	  chart: {
	    files: ['https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.2/Chart.min.js']
	  },
	  datatables: {
	    files: ['https://cdn.datatables.net/v/bs4/dt-1.10.18/b-1.5.4/b-colvis-1.5.4/cr-1.5.0/fc-3.2.5/fh-3.1.4/r-2.2.2/rg-1.1.0/rr-1.2.4/sc-1.5.0/sl-1.2.6/datatables.min.js', 'https://cdn.datatables.net/v/bs4/dt-1.10.18/b-1.5.4/b-colvis-1.5.4/cr-1.5.0/fc-3.2.5/fh-3.1.4/r-2.2.2/rg-1.1.0/rr-1.2.4/sc-1.5.0/sl-1.2.6/datatables.min.css']
	  },
	  maps: {
	    files: ['https://maps.googleapis.com/maps/api/js?key=' + getAppKey('maps') + '&libraries=places']
	  },
	  rateyo: {
	    files: ['https://cdnjs.cloudflare.com/ajax/libs/rateYo/2.3.2/jquery.rateyo.min.js'],
	    deps: ['jquery']
	  },
	  aos: {
	    files: ['https://unpkg.com/aos@2.3.1/dist/aos.js', 'https://unpkg.com/aos@2.3.1/dist/aos.css']
	  },
	  colcade: {
	    files: ['https://unpkg.com/colcade@0/colcade.js']
	  },
	  imagesLoaded: {
	    files: ['https://unpkg.com/imagesloaded@4/imagesloaded.pkgd.min.js']
	  },
	  core: {
	    keys: ['bootstrap', 'uri', 'cookies', 'smoothscroll', 'lazyload']
	  }
	});
	window.findReplace = func$1;
	window.xsBreakpoint = 576; //parseInt(window.getComputedStyle(document.body).getPropertyValue('--breakpoint-sm'));

	window.smBreakpoint = 768;
	window.loader.key('core', function () {
	  //console.log('core loaded');
	  //global vars
	  window.uri = new URI();
	  window.$body = $('body');
	  window.$window = $(window);

	  try {
	    window.scroller = new SmoothScroll('a[href*="#"]', {
	      offset: function offset(anchor, toggle) {
	        var $kd45 = $('[data-kd-id="045"]');
	        return $('header').outerHeight() + ($kd45[0] ? $kd45.outerHeight() : 0);
	      },
	      speed: 1000,
	      updateURL: false
	    });
	  } catch (err) {
	    window.scroller = {
	      animateScroll: function animateScroll(pos) {
	        window.scrollTo(0, pos);
	      }
	    };
	  } //window.scroller = new SmoothScroll();
	  //scroll on page load to hashes


	  if (location.hash) {
	    setTimeout(function () {
	      var scrollPos = Number($(location.hash).offset().top);
	      var offset = 10;
	      $('.fixed-top-md').each(function () {
	        offset += Number($(this).outerHeight());
	      });
	      scrollPos -= offset;
	      scrollPos = Math.round(scrollPos); //console.log(scrollPos, window.$window.scrollTop());

	      if (scrollPos != window.$window.scrollTop()) {
	        window.scroller.animateScroll(scrollPos);
	      }
	    }, 10);
	  }

	  $('a[href]').each(function () {
	    var $this = $(this),
	        $parent = $this.parent(),
	        aUri = new URI($this.attr('href'));

	    if (aUri.origin() && uri.origin() != aUri.origin()) {
	      $this.attr('data-external', true);
	    }

	    if (uri == aUri && !$this.hasClass('btn')) {
	      $this.addClass('active');
	    }
	  });
	  $('header [role="navigation"] a').each(function () {
	    var $this = $(this),
	        $parent = $this.parent(),
	        aUri = new URI($this.attr('href'));

	    if (uri.segment(0).indexOf(aUri.segment(0)) != -1 && !$this.hasClass('btn')) {
	      $this.addClass('active');
	    }
	  });
	  $('[data-toggle="tooltip"]').tooltip(); //load kd modules js

	  $('[data-kd-id], [data-kd-handle]').each(function () {
	    var $this = $(this);

	    if ('mod' + $this.data('kd-id') in modules) {
	      modules['mod' + $this.data('kd-id')]($this);
	    }

	    if ($this.data('kd-id') in components) {
	      components[$this.data('kd-id')]($this);
	    }

	    if ($this.data('kd-handle') in components) {
	      components[$this.data('kd-handle')]($this);
	    }
	  }); //load js modules

	  $('[data-mod]').each(function () {
	    var $this = $(this);

	    if ($this.data('mod') in modules) {
	      modules[$this.data('mod')]($this);
	    }

	    if ($this.data('mod') in components) {
	      components[$this.data('mod')]($this);
	    }
	  });
	  func$S(); //all submit buttons

	  $('button[type="submit"]:not([data-btn="false"])').each(function () {
	    var $this = $(this),
	        $btn = new func($this);
	    $this.parents('form').on('submit', function (e) {
	      $btn.process();
	    });
	  }); //auto heights

	  var $style = $('<style type="text/css"></style>').appendTo($body);
	  $window.on('resize', function () {
	    $style.html('@media (max-width: ' + window.xsBreakpoint + 'px) { [data-kd-autoheight] { min-height:calc(100vh - ' + ($('header').outerHeight() + 50) + 'px) !important; }}</style>');
	  });
	  var $cookie = $('#cookie-notification');

	  if ($cookie) {
	    if (!Cookies.get('cookieNotification')) {
	      $cookie.removeClass('d-none');
	    }

	    $cookie.find('.btn').on('click', function (e) {
	      e.preventDefault();
	      Cookies.set('cookieNotification', true, {
	        expires: 365
	      });
	      $cookie.addClass('d-none');
	    });
	  } // caching


	  var $tokens = $('input[type="hidden"][name="CRAFT_CSRF_TOKEN"]');

	  if ($tokens[0]) {
	    $.ajax({
	      url: '/actions/blitz/csrf/input',
	      method: 'get'
	    }).done(function (data) {
	      $tokens.each(function () {
	        $(this).replaceWith($(data));
	      });
	    });
	  } // honeypots


	  var $pots = $('input[name^=freeform_form_handle_]');

	  if ($pots[0]) {
	    $pots.each(function () {
	      var formId = $(this).parents('form').attr('data-id');
	      $.ajax({
	        url: '/api/forms/honeypot?id=' + formId,
	        method: 'get'
	      }).done(function (data) {
	        console.log(data);
	      });
	    });
	  } // $('input[type="hidden"][name="CRAFT_CSRF_TOKEN"]').each(function() {
	  // 	var $input = $(this);
	  // 	$.ajax({
	  // 		url: '/actions/blitz/csrf/input',
	  // 		method: 'get'
	  // 	}).done(function(data) {
	  // 		$input.replaceWith($(data));
	  // 	});
	  // });
	  //lazyload


	  window.lazyLoadImages = new LazyLoad({
	    elements_selector: '[loading=lazy]',
	    use_native: false,
	    callback_enter: function callback_enter(el) {
	      el.style.removeProperty('width');
	      el.style.removeProperty('height');
	    }
	  });
	  window.lazyLoadBgImages = new LazyLoad({
	    elements_selector: '.lazyBg'
	    /*callback_enter: function(el){
	              	el.classList.add('loaded')
	              }*/

	  });
	  $(window).trigger('resize').trigger('scroll');
	});

}());
//# sourceMappingURL=app.js.map
