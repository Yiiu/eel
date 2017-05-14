/**
 * test v0.0.1
 * (c) 2017 Yiiu
 * @license MIT
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Eel = factory());
}(this, (function () { 'use strict';

/**
 * Created by yuer on 2017/5/11.
 */
function extend(to, form) {
    Object.keys(form).forEach(function (key) {
        to[key] = form[key];
    });
}

function proxy(to, form) {
    Object.keys(form).forEach(function (key) {
        Object.defineProperty(to, key, {
            configurable: true,
            enumerable: true,
            get: function get() {
                return form[key];
            },
            set: function set(val) {
                return form[key] = val;
            }
        });
    });
}

/**
 * 用于去获取如：'obj.a'这样的值
 * @type {RegExp}
 */
var bailRE = /[^\w.$]/;
function parsePath(path) {
    if (bailRE.test(path)) {
        return;
    }
    var segments = path.split('.');
    return function (obj) {
        for (var i = 0; i < segments.length; i++) {
            if (!obj) return;
            obj = obj[segments[i]];
        }
        return obj;
    };
}
function setData(path, obj) {
    if (bailRE.test(path)) {
        return;
    }
    var segments = path.split('.');
    return function (val) {
        for (var i = 0; i < segments.length - 1; i++) {
            if (!obj) return;
            obj = obj[segments[i]];
        }
        obj[segments[segments.length - 1]] = val;
    };
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

/**
 * Created by yuer on 2017/5/5.
 */
var Dep = function () {
    function Dep() {
        classCallCheck(this, Dep);

        this.subs = []; // 订阅数组
    }

    /**
     * 添加订阅
     */


    createClass(Dep, [{
        key: "addSub",
        value: function addSub(sub) {
            this.subs.push(sub);
        }
    }, {
        key: "notify",
        value: function notify() {
            for (var i = 0; i < this.subs.length; i++) {
                this.subs[i].update();
            }
        }
    }, {
        key: "depend",
        value: function depend() {
            if (Dep.target) {
                Dep.target.addDep(this);
            }
        }
    }]);
    return Dep;
}();

Dep.target = null;

/**
 * Created by yuer on 2017/5/5.
 */
var Observer = function () {
    function Observer(value) {
        classCallCheck(this, Observer);

        this.value = value;
        this.walk(value);
        this.dep = new Dep();
    }

    createClass(Observer, [{
        key: 'walk',
        value: function walk(value) {
            for (var val in value) {
                defineReactive(this.value, this.value[val], val);
            }
        }
    }]);
    return Observer;
}();
/**
 *
 * @param value
 * @returns {any}
 */


function observe(value) {
    if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) !== 'object') {
        return;
    }
    var ob = new Observer(value);
    return ob;
}
function defineReactive(obj, val, type) {
    var dep = new Dep();
    var o = Object.getOwnPropertyDescriptor(obj, type);
    var childOb = observe(val);
    Object.defineProperty(obj, type, {
        get: function getter() {
            if (Dep.target) {
                dep.depend();
                if (childOb) {
                    childOb.dep.depend();
                }
            }
            return val;
        },
        set: function setter(newVal) {
            if (newVal === val) {
                return;
            }
            if (childOb) {
                childOb.dep.notify();
            }
            childOb = observe(newVal);
            val = newVal;
            dep.notify();
        }
    });
}

/**
 * Created by yuer on 2017/5/6.
 */
function stateMixin(Eel) {
    Eel._watcher = [];
    Eel.prototype._initState = initState;
    Eel.prototype._initWatch = initWatch;
    Eel.prototype._initMethods = initMethods;
}
function initState() {
    var data = this._data = this.$option.data instanceof Function ? this.$option.data() : this.$option.data;
    this._ob = new Observer(data);
    if (!data) return;
    proxy(this, data);
}
function initWatch() {
    var _this = this;

    if (this.$option.watch) {
        Object.keys(this.$option.watch).forEach(function (key) {
            _this.$watch(key, _this.$option.watch[key]);
        });
    }
}

function initMethods() {
    var methods = this.$option.methods;
    if (!methods) return;
    proxy(this, methods);
}

/**
 * Created by yuer on 2017/5/12.
 */
var Vtext = function (Eel) {
    Eel.directives('text', {
        bind: function bind() {
            this.el.textContent = this.getter();
        },
        update: function update(val, newVal) {
            this.el.textContent = newVal;
        }
    });
};

/**
 * Created by yuer on 2017/5/11.
 */

function replace(el, tar) {
    if (el.nextSibling) {
        el.parentNode.insertBefore(tar, el);
    } else {
        el.parentNode.appendChild(tar);
    }
    el.parentNode.removeChild(el);
    return el;
}

function parseDom(arg) {
    var dom = [];
    var objE = document.createElement("div");

    objE.innerHTML = arg;
    for (var i = 0; i < objE.childNodes.length; i++) {
        if (objE.childNodes[i].textContent.trim() !== '\n' && objE.childNodes[i].textContent.trim() !== '') {
            dom.push(objE.childNodes[i]);
        }
    }
    return dom.length ? dom[0] : dom;
}

function before(el, target) {
    target.parentNode.insertBefore(el, target);
}
function remove(el) {
    el.parentNode.removeChild(el);
}

/**
 * Created by yuer on 2017/5/13.
 */
var Vif = function (Eel) {
    Eel.directives('if', {
        bind: function bind() {
            var val = this.getter();
            var Pla = this._Pla = document.createComment('(●ˇ∀ˇ●)');
            this._el = this.el;
            if (!val) {
                this.hide();
            }
        },
        update: function update(val, newVal) {
            if (newVal) {
                this.show();
            } else {
                this.hide();
            }
        },
        show: function show() {
            replace(this._Pla, this._el);
        },
        hide: function hide() {
            replace(this.el, this._Pla);
        }
    });
};

/**
 * Created by yuer on 2017/5/13.
 */
var Von = function (Eel) {
    Eel.directives('on', {
        bind: function bind() {
            var _this = this;

            this.el.addEventListener(this.arg, function (e) {
                return _this.vm[_this.val].call(_this.vm, e);
            });
            // this.el.textContent = this.getter()
        },
        update: function update(val, newVal) {
            // this.el.textContent = newVal
        }
    });
};

/**
 * Created by yuer on 2017/5/13.
 */
var Vmodel = function (Eel) {
    Eel.directives('model', {
        bind: function bind() {
            var _this = this;

            var val = this.getter();
            var cn = false;
            this.el.value = val;
            this.el.addEventListener('compositionstart', function () {
                cn = true;
            });
            this.el.addEventListener('compositionend', function (e) {
                cn = false;
                _this.vm.$set(_this.val, e.target.value);
            });
            this.el.addEventListener('input', function (e) {
                if (cn) return;
                _this.vm.$set(_this.val, e.target.value);
            });
            // this.el.textContent = this.getter()
        },
        update: function update(val, newVal) {
            this.el.value = newVal;
        }
    });
};

/**
 * Created by yuer on 2017/5/12.
 */
function install(Eel) {
    Vtext(Eel);
    Vif(Eel);
    Von(Eel);
    Vmodel(Eel);
}

/**
 * Created by yuer on 2017/5/6.
 */
var uid = 0;
function initMixin(Eel) {
    Eel.prototype._init = function (options) {
        options = options || {};
        this.$option = options;
        this._watcher = [];
        this._uid = uid++;
        this.$directives = {};
        this.$root = {};
        this.$parent = options.parent;
        this.$children = [];
        this.$el = null;
        this._isComponent = false;
        this.$root = this.$parent ? this.$parent.$root : this;
        // this.$template = document.querySelector(this.$option.template || this.$option.el)
        // 在实例初始化之后,数据还未初始化
        this._callHook('beforeCreate');
        // --初始化数据处理
        this._initState();
        this._initWatch();
        this._initMethods();
        // 安装自带指令
        install(this);

        // 实例已经创建完成之后被调用，el还没有挂载的状态
        this._callHook('created');
        // 在挂载开始之前被调用
        this._callHook('beforeMount');
        var el = document.querySelector(this.$option.el) || null;
        if (el) {
            this.$mount(el);
            this._callHook('mounted');
        }
        // 挂载完成后调用
    };
}

/**
 * Created by yuer on 2017/5/14.
 */
function eventMixin(Eel) {
    Eel.prototype._callHook = function (hook) {
        var handle = this.$option[hook];
        if (handle) {
            handle.call(this);
        }
    };
}

/**
 * Created by yuer on 2017/5/12.
 */

// 指令构造函数
function install$1(name, hook) {
    var dir = {
        name: name
    };
    Object.keys(hook).forEach(function (type) {
        dir[type] = hook[type];
    });
    return dir;
}

/**
 * Created by yuer on 2017/5/12.
 */
function directivesMixin(Eel) {
    Eel.prototype.directives = installDirectives;
}
// install 指令
function installDirectives(name, hook) {
    var dir = install$1(name, hook);
    if (this.$directives[name]) {
        console.error('\u5DF2\u7ECF\u5B58\u5728' + name + '\u6307\u4EE4');
    } else {
        this.$directives[name] = dir;
    }
    return this;
}

/**
 * Created by yuer on 2017/5/12.
 */
var Directives = function () {
    /**
     *
     * @param name {String} 指令名称
     * @param el {Element} 指令对应的dom
     * @param vm {Eel} 指令对应的实例
     * @param descriptor {Object} 指令参数
     */
    function Directives(name, el, vm, text) {
        classCallCheck(this, Directives);

        this.name = name; // 指令名称
        this.el = el; // 绑定的dom
        this.vm = vm; //
        this.arg = ''; // 参数
        this.val = text.val;
        this._name = text.name;
        this.modifiers = {}; // 修饰符
        this.compile(text);
        extend(this, this.vm.$directives[name]);
        this._init();
    }

    /**
     * 处理参数
     * @param text
     */


    createClass(Directives, [{
        key: 'compile',
        value: function compile(text) {
            var _this = this;

            var tag = text.tag;
            if (!text || !text.tag) {
                return;
            }
            var argRE = /:(\w+)/;
            if (argRE.exec(tag)) {
                var tags = argRE.exec(tag);
                this.arg = tags[1];
                tag = tag.slice(tags.index + this.arg.length + 1, tag.length);
            }
            tag.split('.').forEach(function (t) {
                if (t === '') return;
                _this.modifiers[t] = true;
            });
        }

        /**
         * 用户初始时获取数据值
         */

    }, {
        key: 'getter',
        value: function getter() {
            var get$$1 = parsePath(this.val);
            return get$$1(this.vm);
        }
    }, {
        key: 'setter',
        value: function setter(val) {
            var set$$1 = setData(this.val);
            return set$$1(this.vm, val);
        }
    }, {
        key: '_init',
        value: function _init() {
            var _this2 = this;

            this._name && this.el.removeAttribute(this._name);
            // this.el.removeAttribute(this._name)
            this.bind && this.bind();
            if (this.literal) {
                this.update && this.update();
            } else {
                this.vm.$watch(this.val, function (val, newVal) {
                    _this2.update && _this2.update(val, newVal);
                });
            }
        }
    }]);
    return Directives;
}();

/**
 * Created by yuer on 2017/5/6.
 */
var defaultTagRE = /\{\{((?:.|\n)+?)\}\}/g; // tag
var directivesRE = /^v-(\w+)/; // 匹配指令名称
var dirREM = /v-(.*)/; // 匹配指令名称后面的值
var componentRE = /<([\w:-]+)+/;
function parseHTML(el) {
    var tpl = parseTemplate(this.$option.template);
    if (typeof tpl === 'string') {
        tpl = parseDom(tpl);
    }
    if (tpl instanceof Array) {
        console.error('需要根节点');
    }
    this._compileNode(tpl);
    el.appendChild(tpl);
    return tpl;
}
/**
 * 处理options的template
 * @param template
 */
function parseTemplate(template) {
    if (!template) return null;
    if (typeof template === 'string') {
        if (template[0] === '#') {
            return document.querySelector(template).innerHTML;
        } else {
            return template;
        }
    } else {
        return template.innerHTML;
    }
}
/**
 * 处理模板节点
 */
function compileNode(html) {
    if (html.nodeType === 1) {
        var components = this.__proto__.constructor.options.components;
        var tag = componentRE.exec(html.outerHTML)[1];
        if (components[tag]) {
            this._compileComponentNode(html, components[tag]);
        } else {
            this._compileDomNode(html);
        }
    } else if (html.nodeType === 3) {
        if (html.data === '\n') {
            return;
        }
        this._compileTextNode(html);
    }
}
function compileComponentNode(html, component) {
    var fragment = document.createDocumentFragment();
    var sub = component.$mount(fragment, this);
    replace(html, fragment);
    html.attributes;
}
function compileDir(attr, dom) {
    var name = directivesRE.exec(attr.name)[1];
    var tag = dirREM.exec(attr.name)[1];
    new Directives(name, dom, this, {
        name: attr.name,
        tag: tag,
        val: attr.nodeValue
    });
}

function compileDomNode(dom) {
    var _this = this;

    Array.prototype.slice.call(dom.attributes).forEach(function (attr) {
        if (directivesRE.test(attr.name)) {
            _this._compileDir(attr, dom);
        }
    });
    Array.from(dom.childNodes).forEach(function (t) {
        _this._compileNode(t);
    });
}
function compileTextNode(text) {
    var _this2 = this;

    var tag = parse(text.data);
    if (!tag) {
        return;
    }
    tag.forEach(function (tags) {
        if (tags.tag) {
            var value = tags.value;
            var el = document.createTextNode('');
            new Directives('text', el, _this2, {
                val: value
            });
            before(el, text);
        } else {
            var _el = document.createTextNode(tags.value);
            before(_el, text);
        }
    });
    remove(text);
}
function parse(text) {
    if (text === '' && defaultTagRE.test(text)) return;
    var tag = [],
        match = void 0,
        index = void 0,
        value = void 0,
        lastindex = 0;
    while (match = defaultTagRE.exec(text)) {
        index = match.index;
        if (index > lastindex) {
            var last = text.slice(lastindex, index);
            if (last.trim() !== '\n' && last.trim() !== '') {
                tag.push({
                    value: text.slice(lastindex, index)
                });
            }
        }
        value = match[1];
        tag.push({
            tag: true,
            value: value.trim()
        });
        lastindex = index + match[0].length;
    }
    if (lastindex < text.length - 1) {
        var _last = text.slice(lastindex);
        if (_last.trim() !== '\n' && _last.trim() !== '') {
            tag.push({
                value: _last
            });
        }
    }
    return tag;
}

/**
 * Created by yuer on 2017/5/6.
 */
function compilerMixin(Eel) {
    Eel.prototype._parseHTML = parseHTML;
    Eel.prototype._compileDir = compileDir;
    Eel.prototype._compileNode = compileNode;
    Eel.prototype._compileDomNode = compileDomNode;
    Eel.prototype._compileTextNode = compileTextNode;
    Eel.prototype._compileComponentNode = compileComponentNode;
}

/**
 * Created by yuer on 2017/5/5.
 */
var Watcher = function () {
    function Watcher(vm, expOrFn, cb) {
        classCallCheck(this, Watcher);

        this.vm = vm; // 实例
        this.expOrFn = expOrFn; // 被订阅的数据
        this.cb = cb; // 回调
        this.getter = parsePath(expOrFn);
        this.val = this.get(); // 更新前的数
    }
    /**
     * 来通知管理员(Dep)调用
     */


    createClass(Watcher, [{
        key: 'get',
        value: function get$$1() {
            Dep.target = this;
            var val = this.getter ? this.getter(this.vm) : this.vm[this.expOrFn];
            Dep.target = null;
            return val;
        }
    }, {
        key: 'addDep',
        value: function addDep(dep) {
            dep.addSub(this);
        }
    }, {
        key: 'update',
        value: function update() {
            var val = this.getter ? this.getter(this.vm) : this.vm[this.expOrFn];
            if (val !== this.val) {
                var oldVal = this.val;
                this.val = val;
                this.cb.call(this.vm, oldVal, this.val);
            }
        }
    }]);
    return Watcher;
}();

/**
 * Created by yuer on 2017/5/13.
 */
var dataApi = function (Eel) {
    Eel.prototype.$watch = function (expOrFn, cb) {
        var watcher = new Watcher(this, expOrFn, cb);
        this._watcher.push(watcher);
        return this;
    };
    Eel.prototype.$set = function (expOrFn, val) {
        var set = setData(expOrFn, this);
        set(val);
        return this;
    };
    Eel.prototype.$get = function (expOrFn, val) {
        var set = parsePath(expOrFn);
        return set(this);
    };
};

/**
 * Created by yuer on 2017/5/14.
 */
var domApi = function (Eel) {
    Eel.prototype.$mount = function (el, parent) {
        this.$el = this._parseHTML(el);
        if (this._isComponent) {
            this.$parent = parent;
            this.$parent.$children.push(this);
        }
        return this;
    };
};

/**
 * Created by yuer on 2017/5/6.
 */
function Eel$1(options) {
    if (!this instanceof Eel$1) {
        console.error('error new');
    }
    this._init(options);
}
// Mixin
initMixin(Eel$1);
stateMixin(Eel$1);
eventMixin(Eel$1);
directivesMixin(Eel$1);
compilerMixin(Eel$1);
// api
dataApi(Eel$1);
domApi(Eel$1);

/**
 * Created by yuer on 2017/5/14.
 */
var globalApi = function (Eel) {
    Eel.extend = function (options) {
        var that = this;
        var Sub = function Sub(options) {
            this._init();
        };
        Sub.prototype = Object.create(Eel.prototype);
        Sub.prototype.constructor = Sub;
        this.options = {
            components: {}
        };
        Sub.extend = that.extend;
        return Sub;
    };
    Eel.component = function (name, options) {
        options = options || {};
        options.name = name;
        options._isComponent = true;
        options = Eel.extend(options);
        Eel.options['components'][name] = options;
        return options;
    };
};

/**
 * Created by yuer on 2017/5/5.
 */
globalApi(Eel$1);

Eel$1.version = '0.1';

return Eel$1;

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlsL2RhdGEuanMiLCIuLi8uLi9zcmMvb2JzZXJ2ZXIvZGVwLmpzIiwiLi4vLi4vc3JjL29ic2VydmVyL2luZGV4LmpzIiwiLi4vLi4vc3JjL2luc3RhbmNlL3N0YXRlLmpzIiwiLi4vLi4vc3JjL2RpcmVjdGl2ZXMvZGVmYXVsdC90ZXh0LmpzIiwiLi4vLi4vc3JjL3V0aWwvZG9tLmpzIiwiLi4vLi4vc3JjL2RpcmVjdGl2ZXMvZGVmYXVsdC9pZi5qcyIsIi4uLy4uL3NyYy9kaXJlY3RpdmVzL2RlZmF1bHQvb24uanMiLCIuLi8uLi9zcmMvZGlyZWN0aXZlcy9kZWZhdWx0L21vZGVsLmpzIiwiLi4vLi4vc3JjL2RpcmVjdGl2ZXMvZGVmYXVsdC9pbmRleC5qcyIsIi4uLy4uL3NyYy9pbnN0YW5jZS9pbml0LmpzIiwiLi4vLi4vc3JjL2luc3RhbmNlL2V2ZW50LmpzIiwiLi4vLi4vc3JjL2RpcmVjdGl2ZXMvaW50YWxsLmpzIiwiLi4vLi4vc3JjL2luc3RhbmNlL2RpcmVjdGl2ZXMuanMiLCIuLi8uLi9zcmMvZGlyZWN0aXZlcy9pbmRleC5qcyIsIi4uLy4uL3NyYy9jb21waWxlci9pbmRleC5qcyIsIi4uLy4uL3NyYy9pbnN0YW5jZS9jb21waWxlci5qcyIsIi4uLy4uL3NyYy9vYnNlcnZlci93YXRjaGVyLmpzIiwiLi4vLi4vc3JjL2luc3RhbmNlL2FwaS9kYXRhLmpzIiwiLi4vLi4vc3JjL2luc3RhbmNlL2FwaS9kb20uanMiLCIuLi8uLi9zcmMvaW5zdGFuY2UvaW5kZXguanMiLCIuLi8uLi9zcmMvZ2xvYmFsLWFwaS5qcyIsIi4uLy4uL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcclxuICogQ3JlYXRlZCBieSB5dWVyIG9uIDIwMTcvNS8xMS5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBleHRlbmQgKHRvLCBmb3JtKSB7XHJcbiAgICBPYmplY3Qua2V5cyhmb3JtKS5mb3JFYWNoKGtleSA9PiB7XHJcbiAgICAgICAgdG9ba2V5XSA9IGZvcm1ba2V5XVxyXG4gICAgfSlcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHByb3h5ICh0bywgZm9ybSkge1xyXG4gICAgT2JqZWN0LmtleXMoZm9ybSlcclxuICAgICAgICAuZm9yRWFjaChrZXkgPT4ge1xyXG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodG8sIGtleSwge1xyXG4gICAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgIGdldDogKCkgPT4gZm9ybVtrZXldLFxyXG4gICAgICAgICAgICAgICAgc2V0OiAodmFsKSA9PiBmb3JtW2tleV0gPSB2YWxcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9KVxyXG59XHJcblxyXG4vKipcclxuICog55So5LqO5Y676I635Y+W5aaC77yaJ29iai5hJ+i/meagt+eahOWAvFxyXG4gKiBAdHlwZSB7UmVnRXhwfVxyXG4gKi9cclxuY29uc3QgYmFpbFJFID0gL1teXFx3LiRdL1xyXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VQYXRoIChwYXRoKSB7XHJcbiAgICBpZiAoYmFpbFJFLnRlc3QocGF0aCkpIHtcclxuICAgICAgICByZXR1cm5cclxuICAgIH1cclxuICAgIGNvbnN0IHNlZ21lbnRzID0gcGF0aC5zcGxpdCgnLicpXHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKG9iaikge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2VnbWVudHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKCFvYmopIHJldHVyblxyXG4gICAgICAgICAgICBvYmogPSBvYmpbc2VnbWVudHNbaV1dXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBvYmpcclxuICAgIH1cclxufVxyXG5leHBvcnQgZnVuY3Rpb24gc2V0RGF0YSAocGF0aCwgb2JqKSB7XHJcbiAgICBpZiAoYmFpbFJFLnRlc3QocGF0aCkpIHtcclxuICAgICAgICByZXR1cm5cclxuICAgIH1cclxuICAgIGNvbnN0IHNlZ21lbnRzID0gcGF0aC5zcGxpdCgnLicpXHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKHZhbCkge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2VnbWVudHMubGVuZ3RoIC0gMTsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmICghb2JqKSByZXR1cm5cclxuICAgICAgICAgICAgb2JqID0gb2JqW3NlZ21lbnRzW2ldXVxyXG4gICAgICAgIH1cclxuICAgICAgICBvYmpbc2VnbWVudHNbc2VnbWVudHMubGVuZ3RoIC0gMV1dID0gdmFsXHJcbiAgICB9XHJcbn0iLCIvKipcclxuICogQ3JlYXRlZCBieSB5dWVyIG9uIDIwMTcvNS81LlxyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGVwIHtcclxuICAgIGNvbnN0cnVjdG9yICgpIHtcclxuICAgICAgICB0aGlzLnN1YnMgPSBbXSAgLy8g6K6i6ZiF5pWw57uEXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmt7vliqDorqLpmIVcclxuICAgICAqL1xyXG4gICAgYWRkU3ViIChzdWIpIHtcclxuICAgICAgICB0aGlzLnN1YnMucHVzaChzdWIpXHJcbiAgICB9XHJcbiAgICBub3RpZnkgKCkge1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwO2kgPCB0aGlzLnN1YnMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdGhpcy5zdWJzW2ldLnVwZGF0ZSgpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZGVwZW5kICgpIHtcclxuICAgICAgICBpZiAoRGVwLnRhcmdldCkge1xyXG4gICAgICAgICAgICBEZXAudGFyZ2V0LmFkZERlcCh0aGlzKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5EZXAudGFyZ2V0ID0gbnVsbCIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IHl1ZXIgb24gMjAxNy81LzUuXHJcbiAqL1xyXG5pbXBvcnQgRGVwIGZyb20gJy4vZGVwJ1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPYnNlcnZlciB7XHJcbiAgICBjb25zdHJ1Y3RvciAodmFsdWUpIHtcclxuICAgICAgICB0aGlzLnZhbHVlID0gdmFsdWVcclxuICAgICAgICB0aGlzLndhbGsodmFsdWUpXHJcbiAgICAgICAgdGhpcy5kZXAgPSBuZXcgRGVwKClcclxuICAgIH1cclxuICAgIHdhbGsgKHZhbHVlKSB7XHJcbiAgICAgICAgZm9yIChsZXQgdmFsIGluIHZhbHVlKSB7XHJcbiAgICAgICAgICAgIGRlZmluZVJlYWN0aXZlKHRoaXMudmFsdWUsIHRoaXMudmFsdWVbdmFsXSwgdmFsKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG4vKipcclxuICpcclxuICogQHBhcmFtIHZhbHVlXHJcbiAqIEByZXR1cm5zIHthbnl9XHJcbiAqL1xyXG5mdW5jdGlvbiBvYnNlcnZlICh2YWx1ZSkge1xyXG4gICAgaWYgKHR5cGVvZih2YWx1ZSkgIT09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICB9XHJcbiAgICBsZXQgb2IgPSBuZXcgT2JzZXJ2ZXIodmFsdWUpXHJcbiAgICByZXR1cm4gb2JcclxufVxyXG5mdW5jdGlvbiBkZWZpbmVSZWFjdGl2ZSAob2JqLCB2YWwsIHR5cGUpIHtcclxuICAgIGNvbnN0IGRlcCA9IG5ldyBEZXAoKVxyXG4gICAgbGV0IG8gPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iaiwgdHlwZSlcclxuICAgIGxldCBjaGlsZE9iID0gb2JzZXJ2ZSh2YWwpXHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCB0eXBlLCB7XHJcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiBnZXR0ZXIgKCkge1xyXG4gICAgICAgICAgICBpZiAoRGVwLnRhcmdldCkge1xyXG4gICAgICAgICAgICAgICAgZGVwLmRlcGVuZCgpXHJcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGRPYikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNoaWxkT2IuZGVwLmRlcGVuZCgpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHZhbFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2V0OiBmdW5jdGlvbiBzZXR0ZXIgKG5ld1ZhbCkge1xyXG4gICAgICAgICAgICBpZiAobmV3VmFsID09PSB2YWwpIHtcclxuICAgICAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjaGlsZE9iKSB7XHJcbiAgICAgICAgICAgICAgICBjaGlsZE9iLmRlcC5ub3RpZnkoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNoaWxkT2IgPSBvYnNlcnZlKG5ld1ZhbClcclxuICAgICAgICAgICAgdmFsID0gbmV3VmFsXHJcbiAgICAgICAgICAgIGRlcC5ub3RpZnkoKVxyXG4gICAgICAgIH1cclxuICAgIH0pXHJcbn0iLCIvKipcclxuICogQ3JlYXRlZCBieSB5dWVyIG9uIDIwMTcvNS82LlxyXG4gKi9cclxuaW1wb3J0IHsgcHJveHksIHNldERhdGEsIHBhcnNlUGF0aCB9IGZyb20gJy4uL3V0aWwvZGF0YSdcclxuaW1wb3J0IE9ic2VydmVyIGZyb20gJy4uL29ic2VydmVyL2luZGV4J1xyXG5leHBvcnQgZnVuY3Rpb24gc3RhdGVNaXhpbiAoRWVsKSB7XHJcbiAgICBFZWwuX3dhdGNoZXIgPSBbXVxyXG4gICAgRWVsLnByb3RvdHlwZS5faW5pdFN0YXRlID0gaW5pdFN0YXRlXHJcbiAgICBFZWwucHJvdG90eXBlLl9pbml0V2F0Y2ggPSBpbml0V2F0Y2hcclxuICAgIEVlbC5wcm90b3R5cGUuX2luaXRNZXRob2RzID0gaW5pdE1ldGhvZHNcclxuXHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGluaXRTdGF0ZSAoKSB7XHJcbiAgICBsZXQgZGF0YSA9IHRoaXMuX2RhdGEgPSB0aGlzLiRvcHRpb24uZGF0YSBpbnN0YW5jZW9mIEZ1bmN0aW9uID8gdGhpcy4kb3B0aW9uLmRhdGEoKSA6IHRoaXMuJG9wdGlvbi5kYXRhXHJcbiAgICB0aGlzLl9vYiA9IG5ldyBPYnNlcnZlcihkYXRhKVxyXG4gICAgaWYgKCFkYXRhKSByZXR1cm5cclxuICAgIHByb3h5KHRoaXMsIGRhdGEpXHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGluaXRXYXRjaCAoKSB7XHJcbiAgICBpZiAodGhpcy4kb3B0aW9uLndhdGNoKSB7XHJcbiAgICAgICAgT2JqZWN0LmtleXModGhpcy4kb3B0aW9uLndhdGNoKS5mb3JFYWNoKGtleSA9PiB7XHJcbiAgICAgICAgICAgIHRoaXMuJHdhdGNoKGtleSwgdGhpcy4kb3B0aW9uLndhdGNoW2tleV0pXHJcbiAgICAgICAgfSlcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gaW5pdE1ldGhvZHMgKCkge1xyXG4gICAgbGV0IG1ldGhvZHMgPSB0aGlzLiRvcHRpb24ubWV0aG9kc1xyXG4gICAgaWYgKCFtZXRob2RzKSByZXR1cm5cclxuICAgIHByb3h5KHRoaXMsIG1ldGhvZHMpXHJcbn1cclxuIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgeXVlciBvbiAyMDE3LzUvMTIuXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAoRWVsKSB7XHJcbiAgICBFZWwuZGlyZWN0aXZlcygndGV4dCcsIHtcclxuICAgICAgICBiaW5kOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWwudGV4dENvbnRlbnQgPSB0aGlzLmdldHRlcigpXHJcbiAgICAgICAgfSxcclxuICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uICh2YWwsIG5ld1ZhbCkge1xyXG4gICAgICAgICAgICB0aGlzLmVsLnRleHRDb250ZW50ID0gbmV3VmFsXHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxufSIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IHl1ZXIgb24gMjAxNy81LzExLlxyXG4gKi9cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiByZXBsYWNlIChlbCwgdGFyKSB7XHJcbiAgICBpZiAoZWwubmV4dFNpYmxpbmcpIHtcclxuICAgICAgICBlbC5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh0YXIsIGVsKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBlbC5wYXJlbnROb2RlLmFwcGVuZENoaWxkKHRhcilcclxuICAgIH1cclxuICAgIGVsLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZWwpXHJcbiAgICByZXR1cm4gZWxcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlRG9tIChhcmcpIHtcclxuICAgIGxldCBkb20gPSBbXVxyXG4gICAgbGV0IG9iakUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpXHJcblxyXG4gICAgb2JqRS5pbm5lckhUTUwgPSBhcmdcclxuICAgIGZvciAobGV0IGkgPSAwO2kgPCBvYmpFLmNoaWxkTm9kZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBpZiAob2JqRS5jaGlsZE5vZGVzW2ldLnRleHRDb250ZW50LnRyaW0oKSAhPT0gJ1xcbicgJiYgb2JqRS5jaGlsZE5vZGVzW2ldLnRleHRDb250ZW50LnRyaW0oKSAhPT0gJycpIHtcclxuICAgICAgICAgICAgZG9tLnB1c2gob2JqRS5jaGlsZE5vZGVzW2ldKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBkb20ubGVuZ3RoID8gZG9tWzBdIDogZG9tXHJcblxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gYmVmb3JlIChlbCwgdGFyZ2V0KSB7XHJcbiAgICB0YXJnZXQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoZWwsIHRhcmdldCk7XHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZSAoZWwpIHtcclxuICAgIGVsLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZWwpO1xyXG59IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgeXVlciBvbiAyMDE3LzUvMTMuXHJcbiAqL1xyXG5pbXBvcnQgeyByZXBsYWNlIH0gZnJvbSAnLi4vLi4vdXRpbC9kb20nXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIChFZWwpIHtcclxuICAgIEVlbC5kaXJlY3RpdmVzKCdpZicsIHtcclxuICAgICAgICBiaW5kICgpIHtcclxuICAgICAgICAgICAgbGV0IHZhbCA9IHRoaXMuZ2V0dGVyKClcclxuICAgICAgICAgICAgbGV0IFBsYSA9IHRoaXMuX1BsYSA9IGRvY3VtZW50LmNyZWF0ZUNvbW1lbnQoJyjil4/Lh+KIgMuH4pePKScpXHJcbiAgICAgICAgICAgIHRoaXMuX2VsID0gdGhpcy5lbFxyXG4gICAgICAgICAgICBpZiAoIXZhbCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5oaWRlKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdXBkYXRlICh2YWwsIG5ld1ZhbCkge1xyXG4gICAgICAgICAgICBpZiAobmV3VmFsKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNob3coKVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5oaWRlKClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2hvdyAoKSB7XHJcbiAgICAgICAgICAgIHJlcGxhY2UodGhpcy5fUGxhLCB0aGlzLl9lbClcclxuICAgICAgICB9LFxyXG4gICAgICAgIGhpZGUgKCkge1xyXG4gICAgICAgICAgICByZXBsYWNlKHRoaXMuZWwsIHRoaXMuX1BsYSlcclxuICAgICAgICB9XHJcbiAgICB9KVxyXG59IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgeXVlciBvbiAyMDE3LzUvMTMuXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAoRWVsKSB7XHJcbiAgICBFZWwuZGlyZWN0aXZlcygnb24nLCB7XHJcbiAgICAgICAgYmluZDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIodGhpcy5hcmcsIGUgPT4gdGhpcy52bVt0aGlzLnZhbF0uY2FsbCh0aGlzLnZtLCBlKSlcclxuICAgICAgICAgICAgLy8gdGhpcy5lbC50ZXh0Q29udGVudCA9IHRoaXMuZ2V0dGVyKClcclxuICAgICAgICB9LFxyXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24gKHZhbCwgbmV3VmFsKSB7XHJcbiAgICAgICAgICAgIC8vIHRoaXMuZWwudGV4dENvbnRlbnQgPSBuZXdWYWxcclxuICAgICAgICB9XHJcbiAgICB9KVxyXG59IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgeXVlciBvbiAyMDE3LzUvMTMuXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAoRWVsKSB7XHJcbiAgICBFZWwuZGlyZWN0aXZlcygnbW9kZWwnLCB7XHJcbiAgICAgICAgYmluZDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBsZXQgdmFsID0gdGhpcy5nZXR0ZXIoKVxyXG4gICAgICAgICAgICBsZXQgY24gPSBmYWxzZVxyXG4gICAgICAgICAgICB0aGlzLmVsLnZhbHVlID0gdmFsXHJcbiAgICAgICAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignY29tcG9zaXRpb25zdGFydCcsICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGNuID0gdHJ1ZVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NvbXBvc2l0aW9uZW5kJywgZSA9PiB7XHJcbiAgICAgICAgICAgICAgICBjbiA9IGZhbHNlXHJcbiAgICAgICAgICAgICAgICB0aGlzLnZtLiRzZXQodGhpcy52YWwsIGUudGFyZ2V0LnZhbHVlKVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgZSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoY24pIHJldHVyblxyXG4gICAgICAgICAgICAgICAgdGhpcy52bS4kc2V0KHRoaXMudmFsLCBlLnRhcmdldC52YWx1ZSlcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLy8gdGhpcy5lbC50ZXh0Q29udGVudCA9IHRoaXMuZ2V0dGVyKClcclxuICAgICAgICB9LFxyXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24gKHZhbCwgbmV3VmFsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWwudmFsdWUgPSBuZXdWYWxcclxuICAgICAgICB9XHJcbiAgICB9KVxyXG59IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgeXVlciBvbiAyMDE3LzUvMTIuXHJcbiAqL1xyXG5pbXBvcnQgVnRleHQgZnJvbSAnLi90ZXh0J1xyXG5pbXBvcnQgVmlmIGZyb20gJy4vaWYnXHJcbmltcG9ydCBWb24gZnJvbSAnLi9vbidcclxuaW1wb3J0IFZtb2RlbCBmcm9tICcuL21vZGVsJ1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaW5zdGFsbCAoRWVsKSB7XHJcbiAgICBWdGV4dChFZWwpXHJcbiAgICBWaWYoRWVsKVxyXG4gICAgVm9uKEVlbClcclxuICAgIFZtb2RlbChFZWwpXHJcbn0iLCIvKipcclxuICogQ3JlYXRlZCBieSB5dWVyIG9uIDIwMTcvNS82LlxyXG4gKi9cclxuaW1wb3J0IHsgaW5pdFN0YXRlLCBpbml0V2F0Y2ggfSBmcm9tICcuL3N0YXRlJ1xyXG5pbXBvcnQgZGVmYXVsdEluc3RhbGxEaXJlY3RpdmVzIGZyb20gJy4uL2RpcmVjdGl2ZXMvZGVmYXVsdC9pbmRleCdcclxubGV0IHVpZCA9IDBcclxuZXhwb3J0IGZ1bmN0aW9uIGluaXRNaXhpbiAoRWVsKSB7XHJcbiAgICBFZWwucHJvdG90eXBlLl9pbml0ID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcclxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxyXG4gICAgICAgIHRoaXMuJG9wdGlvbiA9IG9wdGlvbnNcclxuICAgICAgICB0aGlzLl93YXRjaGVyID0gW11cclxuICAgICAgICB0aGlzLl91aWQgPSB1aWQrK1xyXG4gICAgICAgIHRoaXMuJGRpcmVjdGl2ZXMgPSB7fVxyXG4gICAgICAgIHRoaXMuJHJvb3QgPSB7fVxyXG4gICAgICAgIHRoaXMuJHBhcmVudCA9IG9wdGlvbnMucGFyZW50XHJcbiAgICAgICAgdGhpcy4kY2hpbGRyZW4gPSBbXVxyXG4gICAgICAgIHRoaXMuJGVsID0gbnVsbFxyXG4gICAgICAgIHRoaXMuX2lzQ29tcG9uZW50ID0gZmFsc2VcclxuICAgICAgICB0aGlzLiRyb290ID0gdGhpcy4kcGFyZW50ID8gdGhpcy4kcGFyZW50LiRyb290IDogdGhpc1xyXG4gICAgICAgIC8vIHRoaXMuJHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLiRvcHRpb24udGVtcGxhdGUgfHwgdGhpcy4kb3B0aW9uLmVsKVxyXG4gICAgICAgIC8vIOWcqOWunuS+i+WIneWni+WMluS5i+WQjizmlbDmja7ov5jmnKrliJ3lp4vljJZcclxuICAgICAgICB0aGlzLl9jYWxsSG9vaygnYmVmb3JlQ3JlYXRlJylcclxuICAgICAgICAvLyAtLeWIneWni+WMluaVsOaNruWkhOeQhlxyXG4gICAgICAgIHRoaXMuX2luaXRTdGF0ZSgpXHJcbiAgICAgICAgdGhpcy5faW5pdFdhdGNoKClcclxuICAgICAgICB0aGlzLl9pbml0TWV0aG9kcygpXHJcbiAgICAgICAgLy8g5a6J6KOF6Ieq5bim5oyH5LukXHJcbiAgICAgICAgZGVmYXVsdEluc3RhbGxEaXJlY3RpdmVzKHRoaXMpXHJcblxyXG4gICAgICAgIC8vIOWunuS+i+W3sue7j+WIm+W7uuWujOaIkOS5i+WQjuiiq+iwg+eUqO+8jGVs6L+Y5rKh5pyJ5oyC6L2955qE54q25oCBXHJcbiAgICAgICAgdGhpcy5fY2FsbEhvb2soJ2NyZWF0ZWQnKVxyXG4gICAgICAgIC8vIOWcqOaMgui9veW8gOWni+S5i+WJjeiiq+iwg+eUqFxyXG4gICAgICAgIHRoaXMuX2NhbGxIb29rKCdiZWZvcmVNb3VudCcpXHJcbiAgICAgICAgbGV0IGVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLiRvcHRpb24uZWwpIHx8IG51bGxcclxuICAgICAgICBpZiAoZWwpIHtcclxuICAgICAgICAgICAgdGhpcy4kbW91bnQoZWwpXHJcbiAgICAgICAgICAgIHRoaXMuX2NhbGxIb29rKCdtb3VudGVkJylcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8g5oyC6L295a6M5oiQ5ZCO6LCD55SoXHJcbiAgICB9XHJcbn0iLCIvKipcclxuICogQ3JlYXRlZCBieSB5dWVyIG9uIDIwMTcvNS8xNC5cclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBldmVudE1peGluIChFZWwpIHtcclxuICAgIEVlbC5wcm90b3R5cGUuX2NhbGxIb29rID0gZnVuY3Rpb24gKGhvb2spIHtcclxuICAgICAgICBsZXQgaGFuZGxlID0gdGhpcy4kb3B0aW9uW2hvb2tdXHJcbiAgICAgICAgaWYgKGhhbmRsZSkge1xyXG4gICAgICAgICAgICBoYW5kbGUuY2FsbCh0aGlzKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IHl1ZXIgb24gMjAxNy81LzEyLlxyXG4gKi9cclxuXHJcbi8vIOaMh+S7pOaehOmAoOWHveaVsFxyXG5jbGFzcyBEaXJlY3RpdmUge1xyXG4gICAgY29uc3RydWN0b3IgKG5hbWUpIHtcclxuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lXHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGluc3RhbGwgKG5hbWUsIGhvb2spIHtcclxuICAgIGxldCBkaXIgPSB7XHJcbiAgICAgICAgbmFtZTogbmFtZVxyXG4gICAgfVxyXG4gICAgT2JqZWN0LmtleXMoaG9vaykuZm9yRWFjaCh0eXBlID0+IHtcclxuICAgICAgICBkaXJbdHlwZV0gPSBob29rW3R5cGVdXHJcbiAgICB9KVxyXG4gICAgcmV0dXJuIGRpclxyXG59IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgeXVlciBvbiAyMDE3LzUvMTIuXHJcbiAqL1xyXG5pbXBvcnQgaW5zdGFsbCBmcm9tICcuLi9kaXJlY3RpdmVzL2ludGFsbCdcclxuXHJcbi8vIOWIneWni+WMluaMh+S7pOeahOS4gOS6m+iuvue9rlxyXG5leHBvcnQgIGZ1bmN0aW9uIGRpcmVjdGl2ZXNNaXhpbiAoRWVsKSB7XHJcbiAgICBFZWwucHJvdG90eXBlLmRpcmVjdGl2ZXMgPSBpbnN0YWxsRGlyZWN0aXZlc1xyXG59XHJcbi8vIGluc3RhbGwg5oyH5LukXHJcbmZ1bmN0aW9uIGluc3RhbGxEaXJlY3RpdmVzIChuYW1lLCBob29rKSB7XHJcbiAgICBsZXQgZGlyID0gaW5zdGFsbChuYW1lLCBob29rKVxyXG4gICAgaWYgKHRoaXMuJGRpcmVjdGl2ZXNbbmFtZV0pIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKGDlt7Lnu4/lrZjlnKgke25hbWV95oyH5LukYClcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy4kZGlyZWN0aXZlc1tuYW1lXSA9IGRpclxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRoaXNcclxufSIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IHl1ZXIgb24gMjAxNy81LzEyLlxyXG4gKi9cclxuaW1wb3J0IHsgcGFyc2VQYXRoLCBleHRlbmQsIHNldERhdGEgfSBmcm9tICcuLi91dGlsL2RhdGEnXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERpcmVjdGl2ZXMge1xyXG4gICAgLyoqXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIG5hbWUge1N0cmluZ30g5oyH5Luk5ZCN56ewXHJcbiAgICAgKiBAcGFyYW0gZWwge0VsZW1lbnR9IOaMh+S7pOWvueW6lOeahGRvbVxyXG4gICAgICogQHBhcmFtIHZtIHtFZWx9IOaMh+S7pOWvueW6lOeahOWunuS+i1xyXG4gICAgICogQHBhcmFtIGRlc2NyaXB0b3Ige09iamVjdH0g5oyH5Luk5Y+C5pWwXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yIChuYW1lLCBlbCwgdm0sIHRleHQpIHtcclxuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lICAgICAgICAvLyDmjIfku6TlkI3np7BcclxuICAgICAgICB0aGlzLmVsID0gZWwgICAgICAgICAgICAvLyDnu5HlrprnmoRkb21cclxuICAgICAgICB0aGlzLnZtID0gdm0gICAgICAgICAgICAvL1xyXG4gICAgICAgIHRoaXMuYXJnID0gJycgICAgICAgICAgIC8vIOWPguaVsFxyXG4gICAgICAgIHRoaXMudmFsID0gdGV4dC52YWxcclxuICAgICAgICB0aGlzLl9uYW1lID0gdGV4dC5uYW1lXHJcbiAgICAgICAgdGhpcy5tb2RpZmllcnMgPSB7fSAgICAgLy8g5L+u6aWw56ymXHJcbiAgICAgICAgdGhpcy5jb21waWxlKHRleHQpXHJcbiAgICAgICAgZXh0ZW5kKHRoaXMsIHRoaXMudm0uJGRpcmVjdGl2ZXNbbmFtZV0pXHJcbiAgICAgICAgdGhpcy5faW5pdCgpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDlpITnkIblj4LmlbBcclxuICAgICAqIEBwYXJhbSB0ZXh0XHJcbiAgICAgKi9cclxuICAgIGNvbXBpbGUgKHRleHQpIHtcclxuICAgICAgICBsZXQgdGFnID0gdGV4dC50YWdcclxuICAgICAgICBpZiAoIXRleHQgfHwgIXRleHQudGFnKSB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgYXJnUkUgPSAvOihcXHcrKS9cclxuICAgICAgICBpZiAoYXJnUkUuZXhlYyh0YWcpKSB7XHJcbiAgICAgICAgICAgIGxldCB0YWdzID0gYXJnUkUuZXhlYyh0YWcpXHJcbiAgICAgICAgICAgIHRoaXMuYXJnID0gdGFnc1sxXVxyXG4gICAgICAgICAgICB0YWcgPSB0YWcuc2xpY2UodGFncy5pbmRleCArIHRoaXMuYXJnLmxlbmd0aCArIDEsIHRhZy5sZW5ndGgpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRhZy5zcGxpdCgnLicpLmZvckVhY2godCA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0ID09PSAnJykgcmV0dXJuXHJcbiAgICAgICAgICAgIHRoaXMubW9kaWZpZXJzW3RdID0gdHJ1ZVxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDnlKjmiLfliJ3lp4vml7bojrflj5bmlbDmja7lgLxcclxuICAgICAqL1xyXG4gICAgZ2V0dGVyICgpIHtcclxuICAgICAgICBsZXQgZ2V0ID0gcGFyc2VQYXRoKHRoaXMudmFsKVxyXG4gICAgICAgIHJldHVybiBnZXQodGhpcy52bSlcclxuICAgIH1cclxuICAgIHNldHRlciAodmFsKSB7XHJcbiAgICAgICAgbGV0IHNldCA9IHNldERhdGEodGhpcy52YWwpXHJcbiAgICAgICAgcmV0dXJuIHNldCh0aGlzLnZtLCB2YWwpXHJcbiAgICB9XHJcbiAgICBfaW5pdCAoKSB7XHJcbiAgICAgICAgdGhpcy5fbmFtZSAmJiB0aGlzLmVsLnJlbW92ZUF0dHJpYnV0ZSh0aGlzLl9uYW1lKVxyXG4gICAgICAgIC8vIHRoaXMuZWwucmVtb3ZlQXR0cmlidXRlKHRoaXMuX25hbWUpXHJcbiAgICAgICAgdGhpcy5iaW5kICYmIHRoaXMuYmluZCgpXHJcbiAgICAgICAgaWYgKHRoaXMubGl0ZXJhbCkge1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSAmJiB0aGlzLnVwZGF0ZSgpXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy52bS4kd2F0Y2godGhpcy52YWwsICh2YWwsIG5ld1ZhbCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGUgJiYgdGhpcy51cGRhdGUodmFsLCBuZXdWYWwpXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgeXVlciBvbiAyMDE3LzUvNi5cclxuICovXHJcbmltcG9ydCB7IHBhcnNlRG9tLCBiZWZvcmUsIHJlbW92ZSwgcmVwbGFjZSB9IGZyb20gJy4uL3V0aWwvZG9tJ1xyXG5pbXBvcnQgRGlyZWN0aXZlcyBmcm9tICcuLi9kaXJlY3RpdmVzL2luZGV4J1xyXG5jb25zdCBkZWZhdWx0VGFnUkUgPSAvXFx7XFx7KCg/Oi58XFxuKSs/KVxcfVxcfS9nICAgIC8vIHRhZ1xyXG5jb25zdCBkaXJlY3RpdmVzUkUgPSAvXnYtKFxcdyspLyAgICAgICAgICAgICAgICAgLy8g5Yy56YWN5oyH5Luk5ZCN56ewXHJcbmNvbnN0IGRpclJFTSA9IC92LSguKikvICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOWMuemFjeaMh+S7pOWQjeensOWQjumdoueahOWAvFxyXG5jb25zdCBjb21wb25lbnRSRSA9IC88KFtcXHc6LV0rKSsvXHJcbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUhUTUwgKGVsKSB7XHJcbiAgICBsZXQgdHBsID0gcGFyc2VUZW1wbGF0ZSh0aGlzLiRvcHRpb24udGVtcGxhdGUpXHJcbiAgICBpZiAodHlwZW9mKHRwbCkgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgdHBsID0gcGFyc2VEb20odHBsKVxyXG4gICAgfVxyXG4gICAgaWYgKHRwbCBpbnN0YW5jZW9mIEFycmF5KSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcign6ZyA6KaB5qC56IqC54K5JylcclxuICAgIH1cclxuICAgIHRoaXMuX2NvbXBpbGVOb2RlKHRwbClcclxuICAgIGVsLmFwcGVuZENoaWxkKHRwbClcclxuICAgIHJldHVybiB0cGxcclxufVxyXG4vKipcclxuICog5aSE55CGb3B0aW9uc+eahHRlbXBsYXRlXHJcbiAqIEBwYXJhbSB0ZW1wbGF0ZVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlVGVtcGxhdGUgKHRlbXBsYXRlKSB7XHJcbiAgICBpZiAoIXRlbXBsYXRlKSByZXR1cm4gbnVsbFxyXG4gICAgaWYgKHR5cGVvZih0ZW1wbGF0ZSkgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgaWYgKHRlbXBsYXRlWzBdID09PSAnIycpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGVtcGxhdGUpLmlubmVySFRNTFxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0ZW1wbGF0ZVxyXG4gICAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIHRlbXBsYXRlLmlubmVySFRNTFxyXG4gICAgfVxyXG59XHJcbi8qKlxyXG4gKiDlpITnkIbmqKHmnb/oioLngrlcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjb21waWxlTm9kZSAoaHRtbCkge1xyXG4gICAgaWYgKGh0bWwubm9kZVR5cGUgPT09IDEpIHtcclxuICAgICAgICBsZXQgY29tcG9uZW50cyA9IHRoaXMuX19wcm90b19fLmNvbnN0cnVjdG9yLm9wdGlvbnMuY29tcG9uZW50c1xyXG4gICAgICAgIGxldCB0YWcgPSBjb21wb25lbnRSRS5leGVjKGh0bWwub3V0ZXJIVE1MKVsxXVxyXG4gICAgICAgIGlmIChjb21wb25lbnRzW3RhZ10pIHtcclxuICAgICAgICAgICAgdGhpcy5fY29tcGlsZUNvbXBvbmVudE5vZGUoaHRtbCwgY29tcG9uZW50c1t0YWddKVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2NvbXBpbGVEb21Ob2RlKGh0bWwpXHJcbiAgICAgICAgfVxyXG4gICAgfSBlbHNlIGlmIChodG1sLm5vZGVUeXBlID09PSAzKSB7XHJcbiAgICAgICAgaWYgKGh0bWwuZGF0YSA9PT0gJ1xcbicpIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2NvbXBpbGVUZXh0Tm9kZShodG1sKVxyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBjb21waWxlQ29tcG9uZW50Tm9kZSAoaHRtbCwgY29tcG9uZW50KSB7XHJcbiAgICBjb25zdCBmcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKVxyXG4gICAgbGV0IHN1YiA9IGNvbXBvbmVudC4kbW91bnQoZnJhZ21lbnQsIHRoaXMpXHJcbiAgICByZXBsYWNlKGh0bWwsIGZyYWdtZW50KVxyXG4gICAgaHRtbC5hdHRyaWJ1dGVzXHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVEaXIgKGF0dHIsIGRvbSkge1xyXG4gICAgbGV0IG5hbWUgPSBkaXJlY3RpdmVzUkUuZXhlYyhhdHRyLm5hbWUpWzFdXHJcbiAgICBsZXQgdGFnID0gZGlyUkVNLmV4ZWMoYXR0ci5uYW1lKVsxXVxyXG4gICAgbmV3IERpcmVjdGl2ZXMobmFtZSwgZG9tLCB0aGlzLCB7XHJcbiAgICAgICAgbmFtZTogYXR0ci5uYW1lLFxyXG4gICAgICAgIHRhZzogdGFnLFxyXG4gICAgICAgIHZhbDogYXR0ci5ub2RlVmFsdWVcclxuICAgIH0pXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjb21waWxlRG9tTm9kZSAoZG9tKSB7XHJcbiAgICBBcnJheS5wcm90b3R5cGVcclxuICAgICAgICAuc2xpY2VcclxuICAgICAgICAuY2FsbChkb20uYXR0cmlidXRlcylcclxuICAgICAgICAuZm9yRWFjaChhdHRyID0+IHtcclxuICAgICAgICAgICAgaWYgKGRpcmVjdGl2ZXNSRS50ZXN0KGF0dHIubmFtZSkpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2NvbXBpbGVEaXIoYXR0ciwgZG9tKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgIEFycmF5LmZyb20oZG9tLmNoaWxkTm9kZXMpLmZvckVhY2godCA9PiB7XHJcbiAgICAgICAgdGhpcy5fY29tcGlsZU5vZGUodClcclxuICAgIH0pXHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVUZXh0Tm9kZSAodGV4dCkge1xyXG4gICAgbGV0IHRhZyA9IHBhcnNlKHRleHQuZGF0YSlcclxuICAgIGlmICghdGFnKSB7XHJcbiAgICAgICAgcmV0dXJuXHJcbiAgICB9XHJcbiAgICB0YWcuZm9yRWFjaCh0YWdzID0+IHtcclxuICAgICAgICBpZiAodGFncy50YWcpIHtcclxuICAgICAgICAgICAgbGV0IHZhbHVlID0gdGFncy52YWx1ZVxyXG4gICAgICAgICAgICBsZXQgZWwgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnJylcclxuICAgICAgICAgICAgbmV3IERpcmVjdGl2ZXMoJ3RleHQnLCBlbCwgdGhpcywge1xyXG4gICAgICAgICAgICAgICAgdmFsOiB2YWx1ZVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICBiZWZvcmUoZWwsIHRleHQpXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbGV0IGVsID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodGFncy52YWx1ZSlcclxuICAgICAgICAgICAgYmVmb3JlKGVsLCB0ZXh0KVxyXG4gICAgICAgIH1cclxuICAgIH0pXHJcbiAgICByZW1vdmUodGV4dClcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gcGFyc2UgKHRleHQpIHtcclxuICAgIGlmICh0ZXh0ID09PSAnJyAmJiBkZWZhdWx0VGFnUkUudGVzdCh0ZXh0KSkgcmV0dXJuXHJcbiAgICBsZXQgdGFnID0gW10sIG1hdGNoLCBpbmRleCwgdmFsdWUsIGxhc3RpbmRleCA9IDBcclxuICAgIHdoaWxlIChtYXRjaCA9IGRlZmF1bHRUYWdSRS5leGVjKHRleHQpKSB7XHJcbiAgICAgICAgaW5kZXggPSBtYXRjaC5pbmRleFxyXG4gICAgICAgIGlmIChpbmRleCA+IGxhc3RpbmRleCkge1xyXG4gICAgICAgICAgICBsZXQgbGFzdCA9IHRleHQuc2xpY2UobGFzdGluZGV4LCBpbmRleClcclxuICAgICAgICAgICAgaWYgKGxhc3QudHJpbSgpICE9PSAnXFxuJyAmJiBsYXN0LnRyaW0oKSAhPT0gJycpIHtcclxuICAgICAgICAgICAgICAgIHRhZy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogdGV4dC5zbGljZShsYXN0aW5kZXgsIGluZGV4KVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICB2YWx1ZSA9IG1hdGNoWzFdXHJcbiAgICAgICAgdGFnLnB1c2goe1xyXG4gICAgICAgICAgICB0YWc6IHRydWUsXHJcbiAgICAgICAgICAgIHZhbHVlOiB2YWx1ZS50cmltKClcclxuICAgICAgICB9KVxyXG4gICAgICAgIGxhc3RpbmRleCA9IGluZGV4ICsgbWF0Y2hbMF0ubGVuZ3RoXHJcbiAgICB9XHJcbiAgICBpZiAobGFzdGluZGV4IDwgdGV4dC5sZW5ndGggLSAxKSB7XHJcbiAgICAgICAgbGV0IGxhc3QgPSB0ZXh0LnNsaWNlKGxhc3RpbmRleClcclxuICAgICAgICBpZiAobGFzdC50cmltKCkgIT09ICdcXG4nICYmIGxhc3QudHJpbSgpICE9PSAnJykge1xyXG4gICAgICAgICAgICB0YWcucHVzaCh7XHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogbGFzdFxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB0YWdcclxufVxyXG4iLCIvKipcclxuICogQ3JlYXRlZCBieSB5dWVyIG9uIDIwMTcvNS82LlxyXG4gKi9cclxuaW1wb3J0ICogYXMgcGFyc2UgZnJvbSAnLi4vY29tcGlsZXIvaW5kZXgnXHJcbmV4cG9ydCBmdW5jdGlvbiBjb21waWxlck1peGluIChFZWwpIHtcclxuICAgIEVlbC5wcm90b3R5cGUuX3BhcnNlSFRNTCA9IHBhcnNlLnBhcnNlSFRNTFxyXG4gICAgRWVsLnByb3RvdHlwZS5fY29tcGlsZURpciA9IHBhcnNlLmNvbXBpbGVEaXJcclxuICAgIEVlbC5wcm90b3R5cGUuX2NvbXBpbGVOb2RlID0gcGFyc2UuY29tcGlsZU5vZGVcclxuICAgIEVlbC5wcm90b3R5cGUuX2NvbXBpbGVEb21Ob2RlID0gcGFyc2UuY29tcGlsZURvbU5vZGVcclxuICAgIEVlbC5wcm90b3R5cGUuX2NvbXBpbGVUZXh0Tm9kZSA9IHBhcnNlLmNvbXBpbGVUZXh0Tm9kZVxyXG4gICAgRWVsLnByb3RvdHlwZS5fY29tcGlsZUNvbXBvbmVudE5vZGUgPSBwYXJzZS5jb21waWxlQ29tcG9uZW50Tm9kZVxyXG59IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgeXVlciBvbiAyMDE3LzUvNS5cclxuICovXHJcbmltcG9ydCBEZXAgZnJvbSAnLi9kZXAnXHJcbmltcG9ydCB7IHBhcnNlUGF0aCB9IGZyb20gJy4uL3V0aWwvZGF0YSdcclxuLy8g6K6i6ZiF6ICFXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdhdGNoZXIge1xyXG4gICAgY29uc3RydWN0b3IgKHZtLCBleHBPckZuLCBjYikge1xyXG4gICAgICAgIHRoaXMudm0gPSB2bSAgICAgICAgICAgIC8vIOWunuS+i1xyXG4gICAgICAgIHRoaXMuZXhwT3JGbiA9IGV4cE9yRm4gIC8vIOiiq+iuoumYheeahOaVsOaNrlxyXG4gICAgICAgIHRoaXMuY2IgPSBjYiAgICAgICAgICAgIC8vIOWbnuiwg1xyXG4gICAgICAgIHRoaXMuZ2V0dGVyID0gcGFyc2VQYXRoKGV4cE9yRm4pXHJcbiAgICAgICAgdGhpcy52YWwgPSB0aGlzLmdldCgpICAgLy8g5pu05paw5YmN55qE5pWwXHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOadpemAmuefpeeuoeeQhuWRmChEZXAp6LCD55SoXHJcbiAgICAgKi9cclxuICAgIGdldCAoKSB7XHJcbiAgICAgICAgRGVwLnRhcmdldCA9IHRoaXNcclxuICAgICAgICBsZXQgdmFsID0gdGhpcy5nZXR0ZXIgPyB0aGlzLmdldHRlcih0aGlzLnZtKSA6IHRoaXMudm1bdGhpcy5leHBPckZuXVxyXG4gICAgICAgIERlcC50YXJnZXQgPSBudWxsXHJcbiAgICAgICAgcmV0dXJuIHZhbFxyXG4gICAgfVxyXG4gICAgYWRkRGVwIChkZXApIHtcclxuICAgICAgICBkZXAuYWRkU3ViKHRoaXMpXHJcbiAgICB9XHJcbiAgICB1cGRhdGUgKCkge1xyXG4gICAgICAgIGNvbnN0IHZhbCA9IHRoaXMuZ2V0dGVyID8gdGhpcy5nZXR0ZXIodGhpcy52bSkgOiB0aGlzLnZtW3RoaXMuZXhwT3JGbl1cclxuICAgICAgICBpZiAodmFsICE9PSB0aGlzLnZhbCkge1xyXG4gICAgICAgICAgICBjb25zdCBvbGRWYWwgPSB0aGlzLnZhbFxyXG4gICAgICAgICAgICB0aGlzLnZhbCA9IHZhbFxyXG4gICAgICAgICAgICB0aGlzLmNiLmNhbGwodGhpcy52bSwgb2xkVmFsLCB0aGlzLnZhbClcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCIvKipcclxuICogQ3JlYXRlZCBieSB5dWVyIG9uIDIwMTcvNS8xMy5cclxuICovXHJcbmltcG9ydCB7IHByb3h5LCBzZXREYXRhLCBwYXJzZVBhdGggfSBmcm9tICcuLi8uLi91dGlsL2RhdGEnXHJcbmltcG9ydCBXYXRjaGVyIGZyb20gJy4uLy4uL29ic2VydmVyL3dhdGNoZXInXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIChFZWwpIHtcclxuICAgIEVlbC5wcm90b3R5cGUuJHdhdGNoID0gZnVuY3Rpb24gKGV4cE9yRm4sIGNiKSB7XHJcbiAgICAgICAgbGV0IHdhdGNoZXIgPSBuZXcgV2F0Y2hlcih0aGlzLCBleHBPckZuLCBjYilcclxuICAgICAgICB0aGlzLl93YXRjaGVyLnB1c2god2F0Y2hlcilcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG4gICAgRWVsLnByb3RvdHlwZS4kc2V0ID0gZnVuY3Rpb24gKGV4cE9yRm4sIHZhbCkge1xyXG4gICAgICAgIGxldCBzZXQgPSBzZXREYXRhKGV4cE9yRm4sIHRoaXMpXHJcbiAgICAgICAgc2V0KHZhbClcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG4gICAgRWVsLnByb3RvdHlwZS4kZ2V0ID0gZnVuY3Rpb24gKGV4cE9yRm4sIHZhbCkge1xyXG4gICAgICAgIGxldCBzZXQgPSBwYXJzZVBhdGgoZXhwT3JGbilcclxuICAgICAgICByZXR1cm4gc2V0KHRoaXMpXHJcbiAgICB9XHJcbn0iLCIvKipcclxuICogQ3JlYXRlZCBieSB5dWVyIG9uIDIwMTcvNS8xNC5cclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIChFZWwpIHtcclxuICAgIEVlbC5wcm90b3R5cGUuJG1vdW50ID0gZnVuY3Rpb24gKGVsLCBwYXJlbnQpIHtcclxuICAgICAgICB0aGlzLiRlbCA9IHRoaXMuX3BhcnNlSFRNTChlbClcclxuICAgICAgICBpZiAodGhpcy5faXNDb21wb25lbnQpIHtcclxuICAgICAgICAgICAgdGhpcy4kcGFyZW50ID0gcGFyZW50XHJcbiAgICAgICAgICAgIHRoaXMuJHBhcmVudC4kY2hpbGRyZW4ucHVzaCh0aGlzKVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG59IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgeXVlciBvbiAyMDE3LzUvNi5cclxuICovXHJcbmltcG9ydCB7IGluaXRNaXhpbiB9IGZyb20gJy4vaW5pdCdcclxuaW1wb3J0IHsgc3RhdGVNaXhpbiB9IGZyb20gJy4vc3RhdGUnXHJcbmltcG9ydCB7IGV2ZW50TWl4aW4gfSBmcm9tICcuL2V2ZW50J1xyXG5pbXBvcnQgeyBkaXJlY3RpdmVzTWl4aW4gfSBmcm9tICcuL2RpcmVjdGl2ZXMnXHJcbmltcG9ydCB7IGNvbXBpbGVyTWl4aW4gfSBmcm9tICcuL2NvbXBpbGVyJ1xyXG5cclxuaW1wb3J0IGRhdGFBcGkgZnJvbSAnLi9hcGkvZGF0YSdcclxuaW1wb3J0IGRvbUFwaSBmcm9tICcuL2FwaS9kb20nXHJcblxyXG5mdW5jdGlvbiBFZWwgKG9wdGlvbnMpIHtcclxuICAgIGlmICghdGhpcyBpbnN0YW5jZW9mIEVlbCkge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ2Vycm9yIG5ldycpXHJcbiAgICB9XHJcbiAgICB0aGlzLl9pbml0KG9wdGlvbnMpXHJcbn1cclxuLy8gTWl4aW5cclxuaW5pdE1peGluKEVlbClcclxuc3RhdGVNaXhpbihFZWwpXHJcbmV2ZW50TWl4aW4oRWVsKVxyXG5kaXJlY3RpdmVzTWl4aW4oRWVsKVxyXG5jb21waWxlck1peGluKEVlbClcclxuLy8gYXBpXHJcbmRhdGFBcGkoRWVsKVxyXG5kb21BcGkoRWVsKVxyXG5leHBvcnQgZGVmYXVsdCBFZWwiLCIvKipcclxuICogQ3JlYXRlZCBieSB5dWVyIG9uIDIwMTcvNS8xNC5cclxuICovXHJcbmxldCBjaWQgPSAwXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIChFZWwpIHtcclxuICAgIEVlbC5leHRlbmQgPSBmdW5jdGlvbiAob3B0aW9ucykge1xyXG4gICAgICAgIGxldCB0aGF0ID0gdGhpc1xyXG4gICAgICAgIGxldCBTdWIgPSBmdW5jdGlvbiAob3B0aW9ucykge1xyXG4gICAgICAgICAgICB0aGlzLl9pbml0KClcclxuICAgICAgICB9XHJcbiAgICAgICAgU3ViLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRWVsLnByb3RvdHlwZSlcclxuICAgICAgICBTdWIucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU3ViXHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0ge1xyXG4gICAgICAgICAgICBjb21wb25lbnRzOiB7fVxyXG4gICAgICAgIH1cclxuICAgICAgICBTdWIuZXh0ZW5kID0gdGhhdC5leHRlbmRcclxuICAgICAgICByZXR1cm4gU3ViXHJcbiAgICB9XHJcbiAgICBFZWwuY29tcG9uZW50ID0gZnVuY3Rpb24gKG5hbWUsIG9wdGlvbnMpIHtcclxuICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxyXG4gICAgICAgIG9wdGlvbnMubmFtZSA9IG5hbWVcclxuICAgICAgICBvcHRpb25zLl9pc0NvbXBvbmVudCA9IHRydWVcclxuICAgICAgICBvcHRpb25zID0gRWVsLmV4dGVuZChvcHRpb25zKVxyXG4gICAgICAgIEVlbC5vcHRpb25zWydjb21wb25lbnRzJ11bbmFtZV0gPSBvcHRpb25zXHJcbiAgICAgICAgcmV0dXJuIG9wdGlvbnNcclxuICAgIH1cclxufSIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IHl1ZXIgb24gMjAxNy81LzUuXHJcbiAqL1xyXG5pbXBvcnQgRWVsIGZyb20gJy4vaW5zdGFuY2UvaW5kZXgnXHJcbmltcG9ydCBnbG9iYWxBcGkgZnJvbSAnLi9nbG9iYWwtYXBpJ1xyXG5cclxuZ2xvYmFsQXBpKEVlbClcclxuXHJcbkVlbC52ZXJzaW9uID0gJzAuMSdcclxuZXhwb3J0IGRlZmF1bHQgRWVsIl0sIm5hbWVzIjpbImV4dGVuZCIsInRvIiwiZm9ybSIsImtleXMiLCJmb3JFYWNoIiwia2V5IiwicHJveHkiLCJkZWZpbmVQcm9wZXJ0eSIsInZhbCIsImJhaWxSRSIsInBhcnNlUGF0aCIsInBhdGgiLCJ0ZXN0Iiwic2VnbWVudHMiLCJzcGxpdCIsIm9iaiIsImkiLCJsZW5ndGgiLCJzZXREYXRhIiwiRGVwIiwic3VicyIsInN1YiIsInB1c2giLCJ1cGRhdGUiLCJ0YXJnZXQiLCJhZGREZXAiLCJPYnNlcnZlciIsInZhbHVlIiwid2FsayIsImRlcCIsIm9ic2VydmUiLCJvYiIsImRlZmluZVJlYWN0aXZlIiwidHlwZSIsIm8iLCJPYmplY3QiLCJnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IiLCJjaGlsZE9iIiwiZ2V0dGVyIiwiZGVwZW5kIiwic2V0dGVyIiwibmV3VmFsIiwibm90aWZ5Iiwic3RhdGVNaXhpbiIsIkVlbCIsIl93YXRjaGVyIiwicHJvdG90eXBlIiwiX2luaXRTdGF0ZSIsImluaXRTdGF0ZSIsIl9pbml0V2F0Y2giLCJpbml0V2F0Y2giLCJfaW5pdE1ldGhvZHMiLCJpbml0TWV0aG9kcyIsImRhdGEiLCJfZGF0YSIsIiRvcHRpb24iLCJGdW5jdGlvbiIsIl9vYiIsIndhdGNoIiwiJHdhdGNoIiwibWV0aG9kcyIsImRpcmVjdGl2ZXMiLCJlbCIsInRleHRDb250ZW50IiwicmVwbGFjZSIsInRhciIsIm5leHRTaWJsaW5nIiwicGFyZW50Tm9kZSIsImluc2VydEJlZm9yZSIsImFwcGVuZENoaWxkIiwicmVtb3ZlQ2hpbGQiLCJwYXJzZURvbSIsImFyZyIsImRvbSIsIm9iakUiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJpbm5lckhUTUwiLCJjaGlsZE5vZGVzIiwidHJpbSIsImJlZm9yZSIsInJlbW92ZSIsIlBsYSIsIl9QbGEiLCJjcmVhdGVDb21tZW50IiwiX2VsIiwiaGlkZSIsInNob3ciLCJhZGRFdmVudExpc3RlbmVyIiwidm0iLCJjYWxsIiwiZSIsImNuIiwiJHNldCIsImluc3RhbGwiLCJ1aWQiLCJpbml0TWl4aW4iLCJfaW5pdCIsIm9wdGlvbnMiLCJfdWlkIiwiJGRpcmVjdGl2ZXMiLCIkcm9vdCIsIiRwYXJlbnQiLCJwYXJlbnQiLCIkY2hpbGRyZW4iLCIkZWwiLCJfaXNDb21wb25lbnQiLCJfY2FsbEhvb2siLCJxdWVyeVNlbGVjdG9yIiwiJG1vdW50IiwiZXZlbnRNaXhpbiIsImhvb2siLCJoYW5kbGUiLCJuYW1lIiwiZGlyIiwiZGlyZWN0aXZlc01peGluIiwiaW5zdGFsbERpcmVjdGl2ZXMiLCJlcnJvciIsIkRpcmVjdGl2ZXMiLCJ0ZXh0IiwiX25hbWUiLCJtb2RpZmllcnMiLCJjb21waWxlIiwidGFnIiwiYXJnUkUiLCJleGVjIiwidGFncyIsInNsaWNlIiwiaW5kZXgiLCJ0IiwiZ2V0Iiwic2V0IiwicmVtb3ZlQXR0cmlidXRlIiwiYmluZCIsImxpdGVyYWwiLCJkZWZhdWx0VGFnUkUiLCJkaXJlY3RpdmVzUkUiLCJkaXJSRU0iLCJjb21wb25lbnRSRSIsInBhcnNlSFRNTCIsInRwbCIsInBhcnNlVGVtcGxhdGUiLCJ0ZW1wbGF0ZSIsIkFycmF5IiwiX2NvbXBpbGVOb2RlIiwiY29tcGlsZU5vZGUiLCJodG1sIiwibm9kZVR5cGUiLCJjb21wb25lbnRzIiwiX19wcm90b19fIiwiY29uc3RydWN0b3IiLCJvdXRlckhUTUwiLCJfY29tcGlsZUNvbXBvbmVudE5vZGUiLCJfY29tcGlsZURvbU5vZGUiLCJfY29tcGlsZVRleHROb2RlIiwiY29tcGlsZUNvbXBvbmVudE5vZGUiLCJjb21wb25lbnQiLCJmcmFnbWVudCIsImNyZWF0ZURvY3VtZW50RnJhZ21lbnQiLCJhdHRyaWJ1dGVzIiwiY29tcGlsZURpciIsImF0dHIiLCJub2RlVmFsdWUiLCJjb21waWxlRG9tTm9kZSIsIl9jb21waWxlRGlyIiwiZnJvbSIsImNvbXBpbGVUZXh0Tm9kZSIsInBhcnNlIiwiY3JlYXRlVGV4dE5vZGUiLCJtYXRjaCIsImxhc3RpbmRleCIsImxhc3QiLCJjb21waWxlck1peGluIiwiX3BhcnNlSFRNTCIsIldhdGNoZXIiLCJleHBPckZuIiwiY2IiLCJhZGRTdWIiLCJvbGRWYWwiLCJ3YXRjaGVyIiwiJGdldCIsImRhdGFBcGkiLCJkb21BcGkiLCJ0aGF0IiwiU3ViIiwiY3JlYXRlIiwiZ2xvYmFsQXBpIiwidmVyc2lvbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQTs7O0FBR0EsQUFBTyxTQUFTQSxNQUFULENBQWlCQyxFQUFqQixFQUFxQkMsSUFBckIsRUFBMkI7V0FDdkJDLElBQVAsQ0FBWUQsSUFBWixFQUFrQkUsT0FBbEIsQ0FBMEIsZUFBTztXQUMxQkMsR0FBSCxJQUFVSCxLQUFLRyxHQUFMLENBQVY7S0FESjs7O0FBS0osQUFBTyxTQUFTQyxLQUFULENBQWdCTCxFQUFoQixFQUFvQkMsSUFBcEIsRUFBMEI7V0FDdEJDLElBQVAsQ0FBWUQsSUFBWixFQUNLRSxPQURMLENBQ2EsZUFBTztlQUNMRyxjQUFQLENBQXNCTixFQUF0QixFQUEwQkksR0FBMUIsRUFBK0I7MEJBQ2IsSUFEYTt3QkFFZixJQUZlO2lCQUd0Qjt1QkFBTUgsS0FBS0csR0FBTCxDQUFOO2FBSHNCO2lCQUl0QixhQUFDRyxHQUFEO3VCQUFTTixLQUFLRyxHQUFMLElBQVlHLEdBQXJCOztTQUpUO0tBRlI7Ozs7Ozs7QUFlSixJQUFNQyxTQUFTLFNBQWY7QUFDQSxBQUFPLFNBQVNDLFNBQVQsQ0FBb0JDLElBQXBCLEVBQTBCO1FBQ3pCRixPQUFPRyxJQUFQLENBQVlELElBQVosQ0FBSixFQUF1Qjs7O1FBR2pCRSxXQUFXRixLQUFLRyxLQUFMLENBQVcsR0FBWCxDQUFqQjtXQUNPLFVBQVVDLEdBQVYsRUFBZTthQUNiLElBQUlDLElBQUksQ0FBYixF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
