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
 * Created by yuer on 2017/5/16.
 */
function mergeOptions(o, e, vm) {
    var arr = {
        components: {},
        directives: {}
    };
    Object.keys(o).forEach(function (type) {
        if (type === 'components' && o[type]) {
            Object.keys(e[type]).forEach(function (name) {
                arr.components[name] = e[type][name];
            });
        } else {
            arr[type] = o[type];
        }
    });
    Object.keys(e).forEach(function (type) {
        if (type === 'components' && e[type]) {
            Object.keys(e[type]).forEach(function (name) {
                arr.components[name] = e[type][name];
            });
        } else if (type === 'name') {
            vm.name = e[type];
        } else if (type === '_isComponent') {
            vm._isComponent = e[type];
        } else {
            arr[type] = e[type];
        }
    });
    return arr;
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
            if (this.vm._isComponent) {
                this.vm = this.vm.$parent;
            }
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
 * Created by yuer on 2017/5/16.
 */

var directivesRE = /^v-(\w+)/;
var Vcomponent = function (Eel) {
    Eel.directives('component', {
        bind: function bind() {
            if (!this.el.__Y__) {
                var Pla = this._Pla = document.createComment('(●ˇ∀ˇ●)');
                // replace(this.el, this._Pla)
                this.insert();
            }
        },
        update: function update(val, newVal) {},
        insert: function insert() {
            var dom = document.createElement('div');
            var options = {
                el: dom,
                parent: this.vm
            };
            var com = this.component = new this.vm.$option.components[this._name](options);
            com.$replace(this.el);
            this.dir(com.$el, this.el.attributes);
        },
        dir: function dir(dom, attributes) {
            var _this = this;

            Array.prototype.slice.call(attributes).forEach(function (attr) {
                if (directivesRE.test(attr.name)) {
                    _this.component._compileDir(attr, dom);
                }
            });
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
    Vcomponent(Eel);
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
        // 组件的options是在constructor上的，所以我们要把他们和实例的options整合一下
        this.$option = mergeOptions(options, this.constructor.options, this);
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
        var el = void 0;
        if (typeof this.$option.el === 'string') {
            el = document.querySelector(this.$option.el);
        } else {
            el = this.$option.el;
        }
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
        var handle = void 0;
        if (this.$option[hook] instanceof Array) {
            for (var i in this.$option[hook]) {
                handle = this.$option[hook][i];
                handle.call(this);
            }
        } else {
            handle = this.$option[hook];
            if (handle) {
                handle.call(this);
            }
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
    if (this.$option.directives[name]) {
        console.error('\u5DF2\u7ECF\u5B58\u5728' + name + '\u6307\u4EE4');
    } else {
        this.$option.directives[name] = dir;
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
        this.literal = text.literal;
        this._name = text.name; // 指令全名
        this.modifiers = {}; // 修饰符
        this.compile(text);
        extend(this, this.vm.$option.directives[name]);
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
            if (!this.val) return;
            var get$$1 = parsePath(this.val);
            return get$$1(this.vm);
        }
    }, {
        key: 'setter',
        value: function setter(val) {
            if (!this.val) return;
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
                if (!this.val) return;
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
var directivesRE$1 = /^v-(\w+)/; // 匹配指令名称
var dirREM = /v-(.*)/; // 匹配指令名称后面的值
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
        var components = this.$option.components;
        var tag = html.tagName.toLowerCase();
        if (components[tag]) {
            this._compileComponentNode(html, tag);
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
function compileComponentNode(html, tag) {
    new Directives('component', html, this, {
        literal: true,
        name: tag
    });
}
function compileDir(attr, dom) {
    var name = directivesRE$1.exec(attr.name)[1];
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
        if (directivesRE$1.test(attr.name)) {
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
        this.$el.__Y__ = this;
        return this;
    };
    Eel.prototype.$before = function (el) {
        before(this.$el, el);
    };
    Eel.prototype.$replace = function (el) {
        replace(el, this.$el);
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
    Eel.options = {
        components: {}
    };
    Eel.version = '0.1';
    Eel.extend = function (options) {
        var Super = this;
        var Sub = creatClass();
        Sub.prototype = Object.create(Super.prototype);
        Sub.prototype.constructor = Sub;
        Sub.options = options;
        return Sub;
    };
    function creatClass() {
        return new Function('return function EelComponent (options) {this._init(options);}')();
    }
    Eel.component = function (name, options) {
        options = options || {};
        var Sub = void 0;
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

return Eel$1;

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlsL2RhdGEuanMiLCIuLi8uLi9zcmMvb2JzZXJ2ZXIvZGVwLmpzIiwiLi4vLi4vc3JjL29ic2VydmVyL2luZGV4LmpzIiwiLi4vLi4vc3JjL2luc3RhbmNlL3N0YXRlLmpzIiwiLi4vLi4vc3JjL3V0aWwvb3B0aW9uLmpzIiwiLi4vLi4vc3JjL2RpcmVjdGl2ZXMvZGVmYXVsdC90ZXh0LmpzIiwiLi4vLi4vc3JjL3V0aWwvZG9tLmpzIiwiLi4vLi4vc3JjL2RpcmVjdGl2ZXMvZGVmYXVsdC9pZi5qcyIsIi4uLy4uL3NyYy9kaXJlY3RpdmVzL2RlZmF1bHQvb24uanMiLCIuLi8uLi9zcmMvZGlyZWN0aXZlcy9kZWZhdWx0L21vZGVsLmpzIiwiLi4vLi4vc3JjL2RpcmVjdGl2ZXMvZGVmYXVsdC9jb21wb25lbnQuanMiLCIuLi8uLi9zcmMvZGlyZWN0aXZlcy9kZWZhdWx0L2luZGV4LmpzIiwiLi4vLi4vc3JjL2luc3RhbmNlL2luaXQuanMiLCIuLi8uLi9zcmMvaW5zdGFuY2UvZXZlbnQuanMiLCIuLi8uLi9zcmMvZGlyZWN0aXZlcy9pbnRhbGwuanMiLCIuLi8uLi9zcmMvaW5zdGFuY2UvZGlyZWN0aXZlcy5qcyIsIi4uLy4uL3NyYy9kaXJlY3RpdmVzL2luZGV4LmpzIiwiLi4vLi4vc3JjL2NvbXBpbGVyL2luZGV4LmpzIiwiLi4vLi4vc3JjL2luc3RhbmNlL2NvbXBpbGVyLmpzIiwiLi4vLi4vc3JjL29ic2VydmVyL3dhdGNoZXIuanMiLCIuLi8uLi9zcmMvaW5zdGFuY2UvYXBpL2RhdGEuanMiLCIuLi8uLi9zcmMvaW5zdGFuY2UvYXBpL2RvbS5qcyIsIi4uLy4uL3NyYy9pbnN0YW5jZS9pbmRleC5qcyIsIi4uLy4uL3NyYy9nbG9iYWwtYXBpLmpzIiwiLi4vLi4vc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IHl1ZXIgb24gMjAxNy81LzExLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGV4dGVuZCAodG8sIGZvcm0pIHtcclxuICAgIE9iamVjdC5rZXlzKGZvcm0pLmZvckVhY2goa2V5ID0+IHtcclxuICAgICAgICB0b1trZXldID0gZm9ybVtrZXldXHJcbiAgICB9KVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcHJveHkgKHRvLCBmb3JtKSB7XHJcbiAgICBPYmplY3Qua2V5cyhmb3JtKVxyXG4gICAgICAgIC5mb3JFYWNoKGtleSA9PiB7XHJcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0bywga2V5LCB7XHJcbiAgICAgICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgZ2V0OiAoKSA9PiBmb3JtW2tleV0sXHJcbiAgICAgICAgICAgICAgICBzZXQ6ICh2YWwpID0+IGZvcm1ba2V5XSA9IHZhbFxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0pXHJcbn1cclxuXHJcbi8qKlxyXG4gKiDnlKjkuo7ljrvojrflj5blpoLvvJonb2JqLmEn6L+Z5qC355qE5YC8XHJcbiAqIEB0eXBlIHtSZWdFeHB9XHJcbiAqL1xyXG5jb25zdCBiYWlsUkUgPSAvW15cXHcuJF0vXHJcbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVBhdGggKHBhdGgpIHtcclxuICAgIGlmIChiYWlsUkUudGVzdChwYXRoKSkge1xyXG4gICAgICAgIHJldHVyblxyXG4gICAgfVxyXG4gICAgY29uc3Qgc2VnbWVudHMgPSBwYXRoLnNwbGl0KCcuJylcclxuICAgIHJldHVybiBmdW5jdGlvbiAob2JqKSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZWdtZW50cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAoIW9iaikgcmV0dXJuXHJcbiAgICAgICAgICAgIG9iaiA9IG9ialtzZWdtZW50c1tpXV1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG9ialxyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBzZXREYXRhIChwYXRoLCBvYmopIHtcclxuICAgIGlmIChiYWlsUkUudGVzdChwYXRoKSkge1xyXG4gICAgICAgIHJldHVyblxyXG4gICAgfVxyXG4gICAgY29uc3Qgc2VnbWVudHMgPSBwYXRoLnNwbGl0KCcuJylcclxuICAgIHJldHVybiBmdW5jdGlvbiAodmFsKSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZWdtZW50cy5sZW5ndGggLSAxOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKCFvYmopIHJldHVyblxyXG4gICAgICAgICAgICBvYmogPSBvYmpbc2VnbWVudHNbaV1dXHJcbiAgICAgICAgfVxyXG4gICAgICAgIG9ialtzZWdtZW50c1tzZWdtZW50cy5sZW5ndGggLSAxXV0gPSB2YWxcclxuICAgIH1cclxufSIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IHl1ZXIgb24gMjAxNy81LzUuXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEZXAge1xyXG4gICAgY29uc3RydWN0b3IgKCkge1xyXG4gICAgICAgIHRoaXMuc3VicyA9IFtdICAvLyDorqLpmIXmlbDnu4RcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOa3u+WKoOiuoumYhVxyXG4gICAgICovXHJcbiAgICBhZGRTdWIgKHN1Yikge1xyXG4gICAgICAgIHRoaXMuc3Vicy5wdXNoKHN1YilcclxuICAgIH1cclxuICAgIG5vdGlmeSAoKSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7aSA8IHRoaXMuc3Vicy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB0aGlzLnN1YnNbaV0udXBkYXRlKClcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBkZXBlbmQgKCkge1xyXG4gICAgICAgIGlmIChEZXAudGFyZ2V0KSB7XHJcbiAgICAgICAgICAgIERlcC50YXJnZXQuYWRkRGVwKHRoaXMpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbkRlcC50YXJnZXQgPSBudWxsIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgeXVlciBvbiAyMDE3LzUvNS5cclxuICovXHJcbmltcG9ydCBEZXAgZnJvbSAnLi9kZXAnXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE9ic2VydmVyIHtcclxuICAgIGNvbnN0cnVjdG9yICh2YWx1ZSkge1xyXG4gICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZVxyXG4gICAgICAgIHRoaXMud2Fsayh2YWx1ZSlcclxuICAgICAgICB0aGlzLmRlcCA9IG5ldyBEZXAoKVxyXG4gICAgfVxyXG4gICAgd2FsayAodmFsdWUpIHtcclxuICAgICAgICBmb3IgKGxldCB2YWwgaW4gdmFsdWUpIHtcclxuICAgICAgICAgICAgZGVmaW5lUmVhY3RpdmUodGhpcy52YWx1ZSwgdGhpcy52YWx1ZVt2YWxdLCB2YWwpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbi8qKlxyXG4gKlxyXG4gKiBAcGFyYW0gdmFsdWVcclxuICogQHJldHVybnMge2FueX1cclxuICovXHJcbmZ1bmN0aW9uIG9ic2VydmUgKHZhbHVlKSB7XHJcbiAgICBpZiAodHlwZW9mKHZhbHVlKSAhPT0gJ29iamVjdCcpIHtcclxuICAgICAgICByZXR1cm5cclxuICAgIH1cclxuICAgIGxldCBvYiA9IG5ldyBPYnNlcnZlcih2YWx1ZSlcclxuICAgIHJldHVybiBvYlxyXG59XHJcbmZ1bmN0aW9uIGRlZmluZVJlYWN0aXZlIChvYmosIHZhbCwgdHlwZSkge1xyXG4gICAgY29uc3QgZGVwID0gbmV3IERlcCgpXHJcbiAgICBsZXQgbyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqLCB0eXBlKVxyXG4gICAgbGV0IGNoaWxkT2IgPSBvYnNlcnZlKHZhbClcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIHR5cGUsIHtcclxuICAgICAgICBnZXQ6IGZ1bmN0aW9uIGdldHRlciAoKSB7XHJcbiAgICAgICAgICAgIGlmIChEZXAudGFyZ2V0KSB7XHJcbiAgICAgICAgICAgICAgICBkZXAuZGVwZW5kKClcclxuICAgICAgICAgICAgICAgIGlmIChjaGlsZE9iKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2hpbGRPYi5kZXAuZGVwZW5kKClcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdmFsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXQ6IGZ1bmN0aW9uIHNldHRlciAobmV3VmFsKSB7XHJcbiAgICAgICAgICAgIGlmIChuZXdWYWwgPT09IHZhbCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGNoaWxkT2IpIHtcclxuICAgICAgICAgICAgICAgIGNoaWxkT2IuZGVwLm5vdGlmeSgpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY2hpbGRPYiA9IG9ic2VydmUobmV3VmFsKVxyXG4gICAgICAgICAgICB2YWwgPSBuZXdWYWxcclxuICAgICAgICAgICAgZGVwLm5vdGlmeSgpXHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxufSIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IHl1ZXIgb24gMjAxNy81LzYuXHJcbiAqL1xyXG5pbXBvcnQgeyBwcm94eSwgc2V0RGF0YSwgcGFyc2VQYXRoIH0gZnJvbSAnLi4vdXRpbC9kYXRhJ1xyXG5pbXBvcnQgT2JzZXJ2ZXIgZnJvbSAnLi4vb2JzZXJ2ZXIvaW5kZXgnXHJcbmV4cG9ydCBmdW5jdGlvbiBzdGF0ZU1peGluIChFZWwpIHtcclxuICAgIEVlbC5fd2F0Y2hlciA9IFtdXHJcbiAgICBFZWwucHJvdG90eXBlLl9pbml0U3RhdGUgPSBpbml0U3RhdGVcclxuICAgIEVlbC5wcm90b3R5cGUuX2luaXRXYXRjaCA9IGluaXRXYXRjaFxyXG4gICAgRWVsLnByb3RvdHlwZS5faW5pdE1ldGhvZHMgPSBpbml0TWV0aG9kc1xyXG5cclxufVxyXG5leHBvcnQgZnVuY3Rpb24gaW5pdFN0YXRlICgpIHtcclxuICAgIGxldCBkYXRhID0gdGhpcy5fZGF0YSA9IHRoaXMuJG9wdGlvbi5kYXRhIGluc3RhbmNlb2YgRnVuY3Rpb24gPyB0aGlzLiRvcHRpb24uZGF0YSgpIDogdGhpcy4kb3B0aW9uLmRhdGFcclxuICAgIHRoaXMuX29iID0gbmV3IE9ic2VydmVyKGRhdGEpXHJcbiAgICBpZiAoIWRhdGEpIHJldHVyblxyXG4gICAgcHJveHkodGhpcywgZGF0YSlcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gaW5pdFdhdGNoICgpIHtcclxuICAgIGlmICh0aGlzLiRvcHRpb24ud2F0Y2gpIHtcclxuICAgICAgICBPYmplY3Qua2V5cyh0aGlzLiRvcHRpb24ud2F0Y2gpLmZvckVhY2goa2V5ID0+IHtcclxuICAgICAgICAgICAgdGhpcy4kd2F0Y2goa2V5LCB0aGlzLiRvcHRpb24ud2F0Y2hba2V5XSlcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBpbml0TWV0aG9kcyAoKSB7XHJcbiAgICBsZXQgbWV0aG9kcyA9IHRoaXMuJG9wdGlvbi5tZXRob2RzXHJcbiAgICBpZiAoIW1ldGhvZHMpIHJldHVyblxyXG4gICAgcHJveHkodGhpcywgbWV0aG9kcylcclxufVxyXG4iLCIvKipcclxuICogQ3JlYXRlZCBieSB5dWVyIG9uIDIwMTcvNS8xNi5cclxuICovXHJcbmxldCBob29rID0gWydtb3VudGVkJywgJ2NyZWF0ZWQnXVxyXG5leHBvcnQgZnVuY3Rpb24gbWVyZ2VPcHRpb25zIChvLCBlLCB2bSkge1xyXG4gICAgbGV0IGFyciA9IHtcclxuICAgICAgICBjb21wb25lbnRzOiB7fSxcclxuICAgICAgICBkaXJlY3RpdmVzOiB7fVxyXG4gICAgfVxyXG4gICAgT2JqZWN0LmtleXMobylcclxuICAgICAgICAuZm9yRWFjaCh0eXBlID0+IHtcclxuICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdjb21wb25lbnRzJyAmJiBvW3R5cGVdKSB7XHJcbiAgICAgICAgICAgICAgICBPYmplY3Qua2V5cyhlW3R5cGVdKVxyXG4gICAgICAgICAgICAgICAgICAgIC5mb3JFYWNoKG5hbWUgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBhcnIuY29tcG9uZW50c1tuYW1lXSA9IGVbdHlwZV1bbmFtZV1cclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgYXJyW3R5cGVdID0gb1t0eXBlXVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgIE9iamVjdC5rZXlzKGUpXHJcbiAgICAgICAgLmZvckVhY2godHlwZSA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlID09PSAnY29tcG9uZW50cycgJiYgZVt0eXBlXSkge1xyXG4gICAgICAgICAgICAgICAgT2JqZWN0LmtleXMoZVt0eXBlXSlcclxuICAgICAgICAgICAgICAgICAgICAuZm9yRWFjaChuYW1lID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXJyLmNvbXBvbmVudHNbbmFtZV0gPSBlW3R5cGVdW25hbWVdXHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0eXBlID09PSAnbmFtZScpIHtcclxuICAgICAgICAgICAgICAgIHZtLm5hbWUgPSBlW3R5cGVdXHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ19pc0NvbXBvbmVudCcpIHtcclxuICAgICAgICAgICAgICAgIHZtLl9pc0NvbXBvbmVudCA9IGVbdHlwZV1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGFyclt0eXBlXSA9IGVbdHlwZV1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICByZXR1cm4gYXJyXHJcbn0iLCIvKipcclxuICogQ3JlYXRlZCBieSB5dWVyIG9uIDIwMTcvNS8xMi5cclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIChFZWwpIHtcclxuICAgIEVlbC5kaXJlY3RpdmVzKCd0ZXh0Jywge1xyXG4gICAgICAgIGJpbmQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5lbC50ZXh0Q29udGVudCA9IHRoaXMuZ2V0dGVyKClcclxuICAgICAgICB9LFxyXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24gKHZhbCwgbmV3VmFsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWwudGV4dENvbnRlbnQgPSBuZXdWYWxcclxuICAgICAgICB9XHJcbiAgICB9KVxyXG59IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgeXVlciBvbiAyMDE3LzUvMTEuXHJcbiAqL1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHJlcGxhY2UgKGVsLCB0YXIpIHtcclxuICAgIGlmIChlbC5uZXh0U2libGluZykge1xyXG4gICAgICAgIGVsLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHRhciwgZWwpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGVsLnBhcmVudE5vZGUuYXBwZW5kQ2hpbGQodGFyKVxyXG4gICAgfVxyXG4gICAgZWwucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChlbClcclxuICAgIHJldHVybiBlbFxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VEb20gKGFyZykge1xyXG4gICAgbGV0IGRvbSA9IFtdXHJcbiAgICBsZXQgb2JqRSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIilcclxuXHJcbiAgICBvYmpFLmlubmVySFRNTCA9IGFyZ1xyXG4gICAgZm9yIChsZXQgaSA9IDA7aSA8IG9iakUuY2hpbGROb2Rlcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGlmIChvYmpFLmNoaWxkTm9kZXNbaV0udGV4dENvbnRlbnQudHJpbSgpICE9PSAnXFxuJyAmJiBvYmpFLmNoaWxkTm9kZXNbaV0udGV4dENvbnRlbnQudHJpbSgpICE9PSAnJykge1xyXG4gICAgICAgICAgICBkb20ucHVzaChvYmpFLmNoaWxkTm9kZXNbaV0pXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGRvbS5sZW5ndGggPyBkb21bMF0gOiBkb21cclxuXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBiZWZvcmUgKGVsLCB0YXJnZXQpIHtcclxuICAgIHRhcmdldC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShlbCwgdGFyZ2V0KTtcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlIChlbCkge1xyXG4gICAgZWwucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChlbCk7XHJcbn0iLCIvKipcclxuICogQ3JlYXRlZCBieSB5dWVyIG9uIDIwMTcvNS8xMy5cclxuICovXHJcbmltcG9ydCB7IHJlcGxhY2UgfSBmcm9tICcuLi8uLi91dGlsL2RvbSdcclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKEVlbCkge1xyXG4gICAgRWVsLmRpcmVjdGl2ZXMoJ2lmJywge1xyXG4gICAgICAgIGJpbmQgKCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy52bS5faXNDb21wb25lbnQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudm0gPSB0aGlzLnZtLiRwYXJlbnRcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsZXQgdmFsID0gdGhpcy5nZXR0ZXIoKVxyXG4gICAgICAgICAgICBsZXQgUGxhID0gdGhpcy5fUGxhID0gZG9jdW1lbnQuY3JlYXRlQ29tbWVudCgnKOKXj8uH4oiAy4fil48pJylcclxuICAgICAgICAgICAgdGhpcy5fZWwgPSB0aGlzLmVsXHJcbiAgICAgICAgICAgIGlmICghdmFsKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhpZGUoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICB1cGRhdGUgKHZhbCwgbmV3VmFsKSB7XHJcbiAgICAgICAgICAgIGlmIChuZXdWYWwpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvdygpXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmhpZGUoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzaG93ICgpIHtcclxuICAgICAgICAgICAgcmVwbGFjZSh0aGlzLl9QbGEsIHRoaXMuX2VsKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaGlkZSAoKSB7XHJcbiAgICAgICAgICAgIHJlcGxhY2UodGhpcy5lbCwgdGhpcy5fUGxhKVxyXG4gICAgICAgIH1cclxuICAgIH0pXHJcbn0iLCIvKipcclxuICogQ3JlYXRlZCBieSB5dWVyIG9uIDIwMTcvNS8xMy5cclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIChFZWwpIHtcclxuICAgIEVlbC5kaXJlY3RpdmVzKCdvbicsIHtcclxuICAgICAgICBiaW5kOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcih0aGlzLmFyZywgZSA9PiB0aGlzLnZtW3RoaXMudmFsXS5jYWxsKHRoaXMudm0sIGUpKVxyXG4gICAgICAgICAgICAvLyB0aGlzLmVsLnRleHRDb250ZW50ID0gdGhpcy5nZXR0ZXIoKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdXBkYXRlOiBmdW5jdGlvbiAodmFsLCBuZXdWYWwpIHtcclxuICAgICAgICAgICAgLy8gdGhpcy5lbC50ZXh0Q29udGVudCA9IG5ld1ZhbFxyXG4gICAgICAgIH1cclxuICAgIH0pXHJcbn0iLCIvKipcclxuICogQ3JlYXRlZCBieSB5dWVyIG9uIDIwMTcvNS8xMy5cclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIChFZWwpIHtcclxuICAgIEVlbC5kaXJlY3RpdmVzKCdtb2RlbCcsIHtcclxuICAgICAgICBiaW5kOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIGxldCB2YWwgPSB0aGlzLmdldHRlcigpXHJcbiAgICAgICAgICAgIGxldCBjbiA9IGZhbHNlXHJcbiAgICAgICAgICAgIHRoaXMuZWwudmFsdWUgPSB2YWxcclxuICAgICAgICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKCdjb21wb3NpdGlvbnN0YXJ0JywgKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY24gPSB0cnVlXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignY29tcG9zaXRpb25lbmQnLCBlID0+IHtcclxuICAgICAgICAgICAgICAgIGNuID0gZmFsc2VcclxuICAgICAgICAgICAgICAgIHRoaXMudm0uJHNldCh0aGlzLnZhbCwgZS50YXJnZXQudmFsdWUpXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIHRoaXMuZWwuYWRkRXZlbnRMaXN0ZW5lcignaW5wdXQnLCBlID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChjbikgcmV0dXJuXHJcbiAgICAgICAgICAgICAgICB0aGlzLnZtLiRzZXQodGhpcy52YWwsIGUudGFyZ2V0LnZhbHVlKVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAvLyB0aGlzLmVsLnRleHRDb250ZW50ID0gdGhpcy5nZXR0ZXIoKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdXBkYXRlOiBmdW5jdGlvbiAodmFsLCBuZXdWYWwpIHtcclxuICAgICAgICAgICAgdGhpcy5lbC52YWx1ZSA9IG5ld1ZhbFxyXG4gICAgICAgIH1cclxuICAgIH0pXHJcbn0iLCIvKipcclxuICogQ3JlYXRlZCBieSB5dWVyIG9uIDIwMTcvNS8xNi5cclxuICovXHJcblxyXG5pbXBvcnQgeyByZXBsYWNlIH0gZnJvbSAnLi4vLi4vdXRpbC9kb20nXHJcbmNvbnN0IGRpcmVjdGl2ZXNSRSA9IC9edi0oXFx3KykvXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIChFZWwpIHtcclxuICAgIEVlbC5kaXJlY3RpdmVzKCdjb21wb25lbnQnLCB7XHJcbiAgICAgICAgYmluZCAoKSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy5lbC5fX1lfXykge1xyXG4gICAgICAgICAgICAgICAgbGV0IFBsYSA9IHRoaXMuX1BsYSA9IGRvY3VtZW50LmNyZWF0ZUNvbW1lbnQoJyjil4/Lh+KIgMuH4pePKScpXHJcbiAgICAgICAgICAgICAgICAvLyByZXBsYWNlKHRoaXMuZWwsIHRoaXMuX1BsYSlcclxuICAgICAgICAgICAgICAgIHRoaXMuaW5zZXJ0KClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdXBkYXRlICh2YWwsIG5ld1ZhbCkge1xyXG5cclxuICAgICAgICB9LFxyXG4gICAgICAgIGluc2VydCAoKSB7XHJcbiAgICAgICAgICAgIGxldCBkb20gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxyXG4gICAgICAgICAgICBsZXQgb3B0aW9ucyA9IHtcclxuICAgICAgICAgICAgICAgIGVsOiBkb20sXHJcbiAgICAgICAgICAgICAgICBwYXJlbnQ6IHRoaXMudm1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBsZXQgY29tID0gdGhpcy5jb21wb25lbnQgPSBuZXcgdGhpcy52bS4kb3B0aW9uLmNvbXBvbmVudHNbdGhpcy5fbmFtZV0ob3B0aW9ucylcclxuICAgICAgICAgICAgY29tLiRyZXBsYWNlKHRoaXMuZWwpXHJcbiAgICAgICAgICAgIHRoaXMuZGlyKGNvbS4kZWwsIHRoaXMuZWwuYXR0cmlidXRlcylcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRpciAoZG9tLCBhdHRyaWJ1dGVzKSB7XHJcbiAgICAgICAgICAgIEFycmF5LnByb3RvdHlwZVxyXG4gICAgICAgICAgICAgICAgLnNsaWNlXHJcbiAgICAgICAgICAgICAgICAuY2FsbChhdHRyaWJ1dGVzKVxyXG4gICAgICAgICAgICAgICAgLmZvckVhY2goYXR0ciA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRpcmVjdGl2ZXNSRS50ZXN0KGF0dHIubmFtZSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jb21wb25lbnQuX2NvbXBpbGVEaXIoYXR0ciwgZG9tKVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxufSIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IHl1ZXIgb24gMjAxNy81LzEyLlxyXG4gKi9cclxuaW1wb3J0IFZ0ZXh0IGZyb20gJy4vdGV4dCdcclxuaW1wb3J0IFZpZiBmcm9tICcuL2lmJ1xyXG5pbXBvcnQgVm9uIGZyb20gJy4vb24nXHJcbmltcG9ydCBWbW9kZWwgZnJvbSAnLi9tb2RlbCdcclxuaW1wb3J0IFZjb21wb25lbnQgZnJvbSAnLi9jb21wb25lbnQnXHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBpbnN0YWxsIChFZWwpIHtcclxuICAgIFZ0ZXh0KEVlbClcclxuICAgIFZpZihFZWwpXHJcbiAgICBWb24oRWVsKVxyXG4gICAgVm1vZGVsKEVlbClcclxuICAgIFZjb21wb25lbnQoRWVsKVxyXG59IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgeXVlciBvbiAyMDE3LzUvNi5cclxuICovXHJcbmltcG9ydCB7IGluaXRTdGF0ZSwgaW5pdFdhdGNoIH0gZnJvbSAnLi9zdGF0ZSdcclxuaW1wb3J0IHsgbWVyZ2VPcHRpb25zIH0gZnJvbSAnLi4vdXRpbC9vcHRpb24nXHJcbmltcG9ydCBkZWZhdWx0SW5zdGFsbERpcmVjdGl2ZXMgZnJvbSAnLi4vZGlyZWN0aXZlcy9kZWZhdWx0L2luZGV4J1xyXG5sZXQgdWlkID0gMFxyXG5leHBvcnQgZnVuY3Rpb24gaW5pdE1peGluIChFZWwpIHtcclxuICAgIEVlbC5wcm90b3R5cGUuX2luaXQgPSBmdW5jdGlvbiAob3B0aW9ucykge1xyXG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XHJcbiAgICAgICAgdGhpcy4kb3B0aW9uID0gb3B0aW9uc1xyXG4gICAgICAgIHRoaXMuX3dhdGNoZXIgPSBbXVxyXG4gICAgICAgIHRoaXMuX3VpZCA9IHVpZCsrXHJcbiAgICAgICAgdGhpcy4kZGlyZWN0aXZlcyA9IHt9XHJcbiAgICAgICAgdGhpcy4kcm9vdCA9IHt9XHJcbiAgICAgICAgdGhpcy4kcGFyZW50ID0gb3B0aW9ucy5wYXJlbnRcclxuICAgICAgICB0aGlzLiRjaGlsZHJlbiA9IFtdXHJcbiAgICAgICAgdGhpcy4kZWwgPSBudWxsXHJcbiAgICAgICAgdGhpcy5faXNDb21wb25lbnQgPSBmYWxzZVxyXG4gICAgICAgIHRoaXMuJHJvb3QgPSB0aGlzLiRwYXJlbnQgPyB0aGlzLiRwYXJlbnQuJHJvb3QgOiB0aGlzXHJcbiAgICAgICAgLy8g57uE5Lu255qEb3B0aW9uc+aYr+WcqGNvbnN0cnVjdG9y5LiK55qE77yM5omA5Lul5oiR5Lus6KaB5oqK5LuW5Lus5ZKM5a6e5L6L55qEb3B0aW9uc+aVtOWQiOS4gOS4i1xyXG4gICAgICAgIHRoaXMuJG9wdGlvbiA9IG1lcmdlT3B0aW9ucyhvcHRpb25zLCB0aGlzLmNvbnN0cnVjdG9yLm9wdGlvbnMsIHRoaXMpXHJcbiAgICAgICAgLy8gdGhpcy4kdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuJG9wdGlvbi50ZW1wbGF0ZSB8fCB0aGlzLiRvcHRpb24uZWwpXHJcbiAgICAgICAgLy8g5Zyo5a6e5L6L5Yid5aeL5YyW5LmL5ZCOLOaVsOaNrui/mOacquWIneWni+WMllxyXG4gICAgICAgIHRoaXMuX2NhbGxIb29rKCdiZWZvcmVDcmVhdGUnKVxyXG4gICAgICAgIC8vIC0t5Yid5aeL5YyW5pWw5o2u5aSE55CGXHJcbiAgICAgICAgdGhpcy5faW5pdFN0YXRlKClcclxuICAgICAgICB0aGlzLl9pbml0V2F0Y2goKVxyXG4gICAgICAgIHRoaXMuX2luaXRNZXRob2RzKClcclxuICAgICAgICAvLyDlronoo4Xoh6rluKbmjIfku6RcclxuICAgICAgICBkZWZhdWx0SW5zdGFsbERpcmVjdGl2ZXModGhpcylcclxuXHJcbiAgICAgICAgLy8g5a6e5L6L5bey57uP5Yib5bu65a6M5oiQ5LmL5ZCO6KKr6LCD55So77yMZWzov5jmsqHmnInmjILovb3nmoTnirbmgIFcclxuICAgICAgICB0aGlzLl9jYWxsSG9vaygnY3JlYXRlZCcpXHJcbiAgICAgICAgLy8g5Zyo5oyC6L295byA5aeL5LmL5YmN6KKr6LCD55SoXHJcbiAgICAgICAgdGhpcy5fY2FsbEhvb2soJ2JlZm9yZU1vdW50JylcclxuICAgICAgICBsZXQgZWxcclxuICAgICAgICBpZiAodHlwZW9mKHRoaXMuJG9wdGlvbi5lbCkgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIGVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLiRvcHRpb24uZWwpXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZWwgPSB0aGlzLiRvcHRpb24uZWxcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGVsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuJG1vdW50KGVsKVxyXG4gICAgICAgICAgICB0aGlzLl9jYWxsSG9vaygnbW91bnRlZCcpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIOaMgui9veWujOaIkOWQjuiwg+eUqFxyXG4gICAgfVxyXG59IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgeXVlciBvbiAyMDE3LzUvMTQuXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZXZlbnRNaXhpbiAoRWVsKSB7XHJcbiAgICBFZWwucHJvdG90eXBlLl9jYWxsSG9vayA9IGZ1bmN0aW9uIChob29rKSB7XHJcbiAgICAgICAgbGV0IGhhbmRsZVxyXG4gICAgICAgIGlmICh0aGlzLiRvcHRpb25baG9va10gaW5zdGFuY2VvZiBBcnJheSkge1xyXG4gICAgICAgICAgICBmb3IgKGxldCBpIGluIHRoaXMuJG9wdGlvbltob29rXSkge1xyXG4gICAgICAgICAgICAgICAgaGFuZGxlID0gdGhpcy4kb3B0aW9uW2hvb2tdW2ldXHJcbiAgICAgICAgICAgICAgICBoYW5kbGUuY2FsbCh0aGlzKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaGFuZGxlID0gdGhpcy4kb3B0aW9uW2hvb2tdXHJcbiAgICAgICAgICAgIGlmIChoYW5kbGUpIHtcclxuICAgICAgICAgICAgICAgIGhhbmRsZS5jYWxsKHRoaXMpXHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgeXVlciBvbiAyMDE3LzUvMTIuXHJcbiAqL1xyXG5cclxuLy8g5oyH5Luk5p6E6YCg5Ye95pWwXHJcbmNsYXNzIERpcmVjdGl2ZSB7XHJcbiAgICBjb25zdHJ1Y3RvciAobmFtZSkge1xyXG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWVcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaW5zdGFsbCAobmFtZSwgaG9vaykge1xyXG4gICAgbGV0IGRpciA9IHtcclxuICAgICAgICBuYW1lOiBuYW1lXHJcbiAgICB9XHJcbiAgICBPYmplY3Qua2V5cyhob29rKS5mb3JFYWNoKHR5cGUgPT4ge1xyXG4gICAgICAgIGRpclt0eXBlXSA9IGhvb2tbdHlwZV1cclxuICAgIH0pXHJcbiAgICByZXR1cm4gZGlyXHJcbn0iLCIvKipcclxuICogQ3JlYXRlZCBieSB5dWVyIG9uIDIwMTcvNS8xMi5cclxuICovXHJcbmltcG9ydCBpbnN0YWxsIGZyb20gJy4uL2RpcmVjdGl2ZXMvaW50YWxsJ1xyXG5cclxuLy8g5Yid5aeL5YyW5oyH5Luk55qE5LiA5Lqb6K6+572uXHJcbmV4cG9ydCAgZnVuY3Rpb24gZGlyZWN0aXZlc01peGluIChFZWwpIHtcclxuICAgIEVlbC5wcm90b3R5cGUuZGlyZWN0aXZlcyA9IGluc3RhbGxEaXJlY3RpdmVzXHJcbn1cclxuLy8gaW5zdGFsbCDmjIfku6RcclxuZnVuY3Rpb24gaW5zdGFsbERpcmVjdGl2ZXMgKG5hbWUsIGhvb2spIHtcclxuICAgIGxldCBkaXIgPSBpbnN0YWxsKG5hbWUsIGhvb2spXHJcbiAgICBpZiAodGhpcy4kb3B0aW9uLmRpcmVjdGl2ZXNbbmFtZV0pIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKGDlt7Lnu4/lrZjlnKgke25hbWV95oyH5LukYClcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgdGhpcy4kb3B0aW9uLmRpcmVjdGl2ZXNbbmFtZV0gPSBkaXJcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzXHJcbn0iLCIvKipcclxuICogQ3JlYXRlZCBieSB5dWVyIG9uIDIwMTcvNS8xMi5cclxuICovXHJcbmltcG9ydCB7IHBhcnNlUGF0aCwgZXh0ZW5kLCBzZXREYXRhIH0gZnJvbSAnLi4vdXRpbC9kYXRhJ1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEaXJlY3RpdmVzIHtcclxuICAgIC8qKlxyXG4gICAgICpcclxuICAgICAqIEBwYXJhbSBuYW1lIHtTdHJpbmd9IOaMh+S7pOWQjeensFxyXG4gICAgICogQHBhcmFtIGVsIHtFbGVtZW50fSDmjIfku6Tlr7nlupTnmoRkb21cclxuICAgICAqIEBwYXJhbSB2bSB7RWVsfSDmjIfku6Tlr7nlupTnmoTlrp7kvotcclxuICAgICAqIEBwYXJhbSBkZXNjcmlwdG9yIHtPYmplY3R9IOaMh+S7pOWPguaVsFxyXG4gICAgICovXHJcbiAgICBjb25zdHJ1Y3RvciAobmFtZSwgZWwsIHZtLCB0ZXh0KSB7XHJcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZSAgICAgICAgLy8g5oyH5Luk5ZCN56ewXHJcbiAgICAgICAgdGhpcy5lbCA9IGVsICAgICAgICAgICAgLy8g57uR5a6a55qEZG9tXHJcbiAgICAgICAgdGhpcy52bSA9IHZtICAgICAgICAgICAgLy9cclxuICAgICAgICB0aGlzLmFyZyA9ICcnICAgICAgICAgICAvLyDlj4LmlbBcclxuICAgICAgICB0aGlzLnZhbCA9IHRleHQudmFsXHJcbiAgICAgICAgdGhpcy5saXRlcmFsID0gdGV4dC5saXRlcmFsXHJcbiAgICAgICAgdGhpcy5fbmFtZSA9IHRleHQubmFtZSAgLy8g5oyH5Luk5YWo5ZCNXHJcbiAgICAgICAgdGhpcy5tb2RpZmllcnMgPSB7fSAgICAgLy8g5L+u6aWw56ymXHJcbiAgICAgICAgdGhpcy5jb21waWxlKHRleHQpXHJcbiAgICAgICAgZXh0ZW5kKHRoaXMsIHRoaXMudm0uJG9wdGlvbi5kaXJlY3RpdmVzW25hbWVdKVxyXG4gICAgICAgIHRoaXMuX2luaXQoKVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5aSE55CG5Y+C5pWwXHJcbiAgICAgKiBAcGFyYW0gdGV4dFxyXG4gICAgICovXHJcbiAgICBjb21waWxlICh0ZXh0KSB7XHJcbiAgICAgICAgbGV0IHRhZyA9IHRleHQudGFnXHJcbiAgICAgICAgaWYgKCF0ZXh0IHx8ICF0ZXh0LnRhZykge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcbiAgICAgICAgbGV0IGFyZ1JFID0gLzooXFx3KykvXHJcbiAgICAgICAgaWYgKGFyZ1JFLmV4ZWModGFnKSkge1xyXG4gICAgICAgICAgICBsZXQgdGFncyA9IGFyZ1JFLmV4ZWModGFnKVxyXG4gICAgICAgICAgICB0aGlzLmFyZyA9IHRhZ3NbMV1cclxuICAgICAgICAgICAgdGFnID0gdGFnLnNsaWNlKHRhZ3MuaW5kZXggKyB0aGlzLmFyZy5sZW5ndGggKyAxLCB0YWcubGVuZ3RoKVxyXG4gICAgICAgIH1cclxuICAgICAgICB0YWcuc3BsaXQoJy4nKS5mb3JFYWNoKHQgPT4ge1xyXG4gICAgICAgICAgICBpZiAodCA9PT0gJycpIHJldHVyblxyXG4gICAgICAgICAgICB0aGlzLm1vZGlmaWVyc1t0XSA9IHRydWVcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog55So5oi35Yid5aeL5pe26I635Y+W5pWw5o2u5YC8XHJcbiAgICAgKi9cclxuICAgIGdldHRlciAoKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLnZhbCkgcmV0dXJuXHJcbiAgICAgICAgbGV0IGdldCA9IHBhcnNlUGF0aCh0aGlzLnZhbClcclxuICAgICAgICByZXR1cm4gZ2V0KHRoaXMudm0pXHJcbiAgICB9XHJcbiAgICBzZXR0ZXIgKHZhbCkge1xyXG4gICAgICAgIGlmICghdGhpcy52YWwpIHJldHVyblxyXG4gICAgICAgIGxldCBzZXQgPSBzZXREYXRhKHRoaXMudmFsKVxyXG4gICAgICAgIHJldHVybiBzZXQodGhpcy52bSwgdmFsKVxyXG4gICAgfVxyXG4gICAgX2luaXQgKCkge1xyXG4gICAgICAgIHRoaXMuX25hbWUgJiYgdGhpcy5lbC5yZW1vdmVBdHRyaWJ1dGUodGhpcy5fbmFtZSlcclxuICAgICAgICAvLyB0aGlzLmVsLnJlbW92ZUF0dHJpYnV0ZSh0aGlzLl9uYW1lKVxyXG4gICAgICAgIHRoaXMuYmluZCAmJiB0aGlzLmJpbmQoKVxyXG4gICAgICAgIGlmICh0aGlzLmxpdGVyYWwpIHtcclxuICAgICAgICAgICAgdGhpcy51cGRhdGUgJiYgdGhpcy51cGRhdGUoKVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy52YWwpIHJldHVyblxyXG4gICAgICAgICAgICB0aGlzLnZtLiR3YXRjaCh0aGlzLnZhbCwgKHZhbCwgbmV3VmFsKSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZSAmJiB0aGlzLnVwZGF0ZSh2YWwsIG5ld1ZhbClcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCIvKipcclxuICogQ3JlYXRlZCBieSB5dWVyIG9uIDIwMTcvNS82LlxyXG4gKi9cclxuaW1wb3J0IHsgcGFyc2VEb20sIGJlZm9yZSwgcmVtb3ZlLCByZXBsYWNlIH0gZnJvbSAnLi4vdXRpbC9kb20nXHJcbmltcG9ydCBEaXJlY3RpdmVzIGZyb20gJy4uL2RpcmVjdGl2ZXMvaW5kZXgnXHJcbmNvbnN0IGRlZmF1bHRUYWdSRSA9IC9cXHtcXHsoKD86LnxcXG4pKz8pXFx9XFx9L2cgICAgLy8gdGFnXHJcbmNvbnN0IGRpcmVjdGl2ZXNSRSA9IC9edi0oXFx3KykvICAgICAgICAgICAgICAgICAvLyDljLnphY3mjIfku6TlkI3np7BcclxuY29uc3QgZGlyUkVNID0gL3YtKC4qKS8gICAgICAgICAgICAgICAgICAgICAgICAgLy8g5Yy56YWN5oyH5Luk5ZCN56ew5ZCO6Z2i55qE5YC8XHJcbmNvbnN0IGNvbXBvbmVudFJFID0gLzwoW1xcdzotXSspKy9cclxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlSFRNTCAoZWwpIHtcclxuICAgIGxldCB0cGwgPSBwYXJzZVRlbXBsYXRlKHRoaXMuJG9wdGlvbi50ZW1wbGF0ZSlcclxuICAgIGlmICh0eXBlb2YodHBsKSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICB0cGwgPSBwYXJzZURvbSh0cGwpXHJcbiAgICB9XHJcbiAgICBpZiAodHBsIGluc3RhbmNlb2YgQXJyYXkpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKCfpnIDopoHmoLnoioLngrknKVxyXG4gICAgfVxyXG4gICAgdGhpcy5fY29tcGlsZU5vZGUodHBsKVxyXG4gICAgZWwuYXBwZW5kQ2hpbGQodHBsKVxyXG4gICAgcmV0dXJuIHRwbFxyXG59XHJcbi8qKlxyXG4gKiDlpITnkIZvcHRpb25z55qEdGVtcGxhdGVcclxuICogQHBhcmFtIHRlbXBsYXRlXHJcbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VUZW1wbGF0ZSAodGVtcGxhdGUpIHtcclxuICAgIGlmICghdGVtcGxhdGUpIHJldHVybiBudWxsXHJcbiAgICBpZiAodHlwZW9mKHRlbXBsYXRlKSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICBpZiAodGVtcGxhdGVbMF0gPT09ICcjJykge1xyXG4gICAgICAgICAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0ZW1wbGF0ZSkuaW5uZXJIVE1MXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRlbXBsYXRlXHJcbiAgICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gdGVtcGxhdGUuaW5uZXJIVE1MXHJcbiAgICB9XHJcbn1cclxuLyoqXHJcbiAqIOWkhOeQhuaooeadv+iKgueCuVxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVOb2RlIChodG1sKSB7XHJcbiAgICBpZiAoaHRtbC5ub2RlVHlwZSA9PT0gMSkge1xyXG4gICAgICAgIGxldCBjb21wb25lbnRzID0gdGhpcy4kb3B0aW9uLmNvbXBvbmVudHNcclxuICAgICAgICBsZXQgdGFnID0gaHRtbC50YWdOYW1lLnRvTG93ZXJDYXNlKClcclxuICAgICAgICBpZiAoY29tcG9uZW50c1t0YWddKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2NvbXBpbGVDb21wb25lbnROb2RlKGh0bWwsIHRhZylcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9jb21waWxlRG9tTm9kZShodG1sKVxyXG4gICAgICAgIH1cclxuICAgIH0gZWxzZSBpZiAoaHRtbC5ub2RlVHlwZSA9PT0gMykge1xyXG4gICAgICAgIGlmIChodG1sLmRhdGEgPT09ICdcXG4nKSB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9jb21waWxlVGV4dE5vZGUoaHRtbClcclxuICAgIH1cclxufVxyXG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZUNvbXBvbmVudE5vZGUgKGh0bWwsIHRhZykge1xyXG4gICAgbmV3IERpcmVjdGl2ZXMoJ2NvbXBvbmVudCcsIGh0bWwsIHRoaXMsIHtcclxuICAgICAgICBsaXRlcmFsOiB0cnVlLFxyXG4gICAgICAgIG5hbWU6IHRhZ1xyXG4gICAgfSlcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZURpciAoYXR0ciwgZG9tKSB7XHJcbiAgICBsZXQgbmFtZSA9IGRpcmVjdGl2ZXNSRS5leGVjKGF0dHIubmFtZSlbMV1cclxuICAgIGxldCB0YWcgPSBkaXJSRU0uZXhlYyhhdHRyLm5hbWUpWzFdXHJcbiAgICBuZXcgRGlyZWN0aXZlcyhuYW1lLCBkb20sIHRoaXMsIHtcclxuICAgICAgICBuYW1lOiBhdHRyLm5hbWUsXHJcbiAgICAgICAgdGFnOiB0YWcsXHJcbiAgICAgICAgdmFsOiBhdHRyLm5vZGVWYWx1ZVxyXG4gICAgfSlcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVEb21Ob2RlIChkb20pIHtcclxuICAgIEFycmF5LnByb3RvdHlwZVxyXG4gICAgICAgIC5zbGljZVxyXG4gICAgICAgIC5jYWxsKGRvbS5hdHRyaWJ1dGVzKVxyXG4gICAgICAgIC5mb3JFYWNoKGF0dHIgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZGlyZWN0aXZlc1JFLnRlc3QoYXR0ci5uYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fY29tcGlsZURpcihhdHRyLCBkb20pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgQXJyYXkuZnJvbShkb20uY2hpbGROb2RlcykuZm9yRWFjaCh0ID0+IHtcclxuICAgICAgICB0aGlzLl9jb21waWxlTm9kZSh0KVxyXG4gICAgfSlcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZVRleHROb2RlICh0ZXh0KSB7XHJcbiAgICBsZXQgdGFnID0gcGFyc2UodGV4dC5kYXRhKVxyXG4gICAgaWYgKCF0YWcpIHtcclxuICAgICAgICByZXR1cm5cclxuICAgIH1cclxuICAgIHRhZy5mb3JFYWNoKHRhZ3MgPT4ge1xyXG4gICAgICAgIGlmICh0YWdzLnRhZykge1xyXG4gICAgICAgICAgICBsZXQgdmFsdWUgPSB0YWdzLnZhbHVlXHJcbiAgICAgICAgICAgIGxldCBlbCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcnKVxyXG4gICAgICAgICAgICBuZXcgRGlyZWN0aXZlcygndGV4dCcsIGVsLCB0aGlzLCB7XHJcbiAgICAgICAgICAgICAgICB2YWw6IHZhbHVlXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIGJlZm9yZShlbCwgdGV4dClcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBsZXQgZWwgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0YWdzLnZhbHVlKVxyXG4gICAgICAgICAgICBiZWZvcmUoZWwsIHRleHQpXHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxuICAgIHJlbW92ZSh0ZXh0KVxyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBwYXJzZSAodGV4dCkge1xyXG4gICAgaWYgKHRleHQgPT09ICcnICYmIGRlZmF1bHRUYWdSRS50ZXN0KHRleHQpKSByZXR1cm5cclxuICAgIGxldCB0YWcgPSBbXSwgbWF0Y2gsIGluZGV4LCB2YWx1ZSwgbGFzdGluZGV4ID0gMFxyXG4gICAgd2hpbGUgKG1hdGNoID0gZGVmYXVsdFRhZ1JFLmV4ZWModGV4dCkpIHtcclxuICAgICAgICBpbmRleCA9IG1hdGNoLmluZGV4XHJcbiAgICAgICAgaWYgKGluZGV4ID4gbGFzdGluZGV4KSB7XHJcbiAgICAgICAgICAgIGxldCBsYXN0ID0gdGV4dC5zbGljZShsYXN0aW5kZXgsIGluZGV4KVxyXG4gICAgICAgICAgICBpZiAobGFzdC50cmltKCkgIT09ICdcXG4nICYmIGxhc3QudHJpbSgpICE9PSAnJykge1xyXG4gICAgICAgICAgICAgICAgdGFnLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiB0ZXh0LnNsaWNlKGxhc3RpbmRleCwgaW5kZXgpXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhbHVlID0gbWF0Y2hbMV1cclxuICAgICAgICB0YWcucHVzaCh7XHJcbiAgICAgICAgICAgIHRhZzogdHJ1ZSxcclxuICAgICAgICAgICAgdmFsdWU6IHZhbHVlLnRyaW0oKVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgbGFzdGluZGV4ID0gaW5kZXggKyBtYXRjaFswXS5sZW5ndGhcclxuICAgIH1cclxuICAgIGlmIChsYXN0aW5kZXggPCB0ZXh0Lmxlbmd0aCAtIDEpIHtcclxuICAgICAgICBsZXQgbGFzdCA9IHRleHQuc2xpY2UobGFzdGluZGV4KVxyXG4gICAgICAgIGlmIChsYXN0LnRyaW0oKSAhPT0gJ1xcbicgJiYgbGFzdC50cmltKCkgIT09ICcnKSB7XHJcbiAgICAgICAgICAgIHRhZy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIHZhbHVlOiBsYXN0XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRhZ1xyXG59XHJcbiIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IHl1ZXIgb24gMjAxNy81LzYuXHJcbiAqL1xyXG5pbXBvcnQgKiBhcyBwYXJzZSBmcm9tICcuLi9jb21waWxlci9pbmRleCdcclxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVyTWl4aW4gKEVlbCkge1xyXG4gICAgRWVsLnByb3RvdHlwZS5fcGFyc2VIVE1MID0gcGFyc2UucGFyc2VIVE1MXHJcbiAgICBFZWwucHJvdG90eXBlLl9jb21waWxlRGlyID0gcGFyc2UuY29tcGlsZURpclxyXG4gICAgRWVsLnByb3RvdHlwZS5fY29tcGlsZU5vZGUgPSBwYXJzZS5jb21waWxlTm9kZVxyXG4gICAgRWVsLnByb3RvdHlwZS5fY29tcGlsZURvbU5vZGUgPSBwYXJzZS5jb21waWxlRG9tTm9kZVxyXG4gICAgRWVsLnByb3RvdHlwZS5fY29tcGlsZVRleHROb2RlID0gcGFyc2UuY29tcGlsZVRleHROb2RlXHJcbiAgICBFZWwucHJvdG90eXBlLl9jb21waWxlQ29tcG9uZW50Tm9kZSA9IHBhcnNlLmNvbXBpbGVDb21wb25lbnROb2RlXHJcbn0iLCIvKipcclxuICogQ3JlYXRlZCBieSB5dWVyIG9uIDIwMTcvNS81LlxyXG4gKi9cclxuaW1wb3J0IERlcCBmcm9tICcuL2RlcCdcclxuaW1wb3J0IHsgcGFyc2VQYXRoIH0gZnJvbSAnLi4vdXRpbC9kYXRhJ1xyXG4vLyDorqLpmIXogIVcclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgV2F0Y2hlciB7XHJcbiAgICBjb25zdHJ1Y3RvciAodm0sIGV4cE9yRm4sIGNiKSB7XHJcbiAgICAgICAgdGhpcy52bSA9IHZtICAgICAgICAgICAgLy8g5a6e5L6LXHJcbiAgICAgICAgdGhpcy5leHBPckZuID0gZXhwT3JGbiAgLy8g6KKr6K6i6ZiF55qE5pWw5o2uXHJcbiAgICAgICAgdGhpcy5jYiA9IGNiICAgICAgICAgICAgLy8g5Zue6LCDXHJcbiAgICAgICAgdGhpcy5nZXR0ZXIgPSBwYXJzZVBhdGgoZXhwT3JGbilcclxuICAgICAgICB0aGlzLnZhbCA9IHRoaXMuZ2V0KCkgICAvLyDmm7TmlrDliY3nmoTmlbBcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICog5p2l6YCa55+l566h55CG5ZGYKERlcCnosIPnlKhcclxuICAgICAqL1xyXG4gICAgZ2V0ICgpIHtcclxuICAgICAgICBEZXAudGFyZ2V0ID0gdGhpc1xyXG4gICAgICAgIGxldCB2YWwgPSB0aGlzLmdldHRlciA/IHRoaXMuZ2V0dGVyKHRoaXMudm0pIDogdGhpcy52bVt0aGlzLmV4cE9yRm5dXHJcbiAgICAgICAgRGVwLnRhcmdldCA9IG51bGxcclxuICAgICAgICByZXR1cm4gdmFsXHJcbiAgICB9XHJcbiAgICBhZGREZXAgKGRlcCkge1xyXG4gICAgICAgIGRlcC5hZGRTdWIodGhpcylcclxuICAgIH1cclxuICAgIHVwZGF0ZSAoKSB7XHJcbiAgICAgICAgY29uc3QgdmFsID0gdGhpcy5nZXR0ZXIgPyB0aGlzLmdldHRlcih0aGlzLnZtKSA6IHRoaXMudm1bdGhpcy5leHBPckZuXVxyXG4gICAgICAgIGlmICh2YWwgIT09IHRoaXMudmFsKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG9sZFZhbCA9IHRoaXMudmFsXHJcbiAgICAgICAgICAgIHRoaXMudmFsID0gdmFsXHJcbiAgICAgICAgICAgIHRoaXMuY2IuY2FsbCh0aGlzLnZtLCBvbGRWYWwsIHRoaXMudmFsKVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufSIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IHl1ZXIgb24gMjAxNy81LzEzLlxyXG4gKi9cclxuaW1wb3J0IHsgcHJveHksIHNldERhdGEsIHBhcnNlUGF0aCB9IGZyb20gJy4uLy4uL3V0aWwvZGF0YSdcclxuaW1wb3J0IFdhdGNoZXIgZnJvbSAnLi4vLi4vb2JzZXJ2ZXIvd2F0Y2hlcidcclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKEVlbCkge1xyXG4gICAgRWVsLnByb3RvdHlwZS4kd2F0Y2ggPSBmdW5jdGlvbiAoZXhwT3JGbiwgY2IpIHtcclxuICAgICAgICBsZXQgd2F0Y2hlciA9IG5ldyBXYXRjaGVyKHRoaXMsIGV4cE9yRm4sIGNiKVxyXG4gICAgICAgIHRoaXMuX3dhdGNoZXIucHVzaCh3YXRjaGVyKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcbiAgICBFZWwucHJvdG90eXBlLiRzZXQgPSBmdW5jdGlvbiAoZXhwT3JGbiwgdmFsKSB7XHJcbiAgICAgICAgbGV0IHNldCA9IHNldERhdGEoZXhwT3JGbiwgdGhpcylcclxuICAgICAgICBzZXQodmFsKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcbiAgICBFZWwucHJvdG90eXBlLiRnZXQgPSBmdW5jdGlvbiAoZXhwT3JGbiwgdmFsKSB7XHJcbiAgICAgICAgbGV0IHNldCA9IHBhcnNlUGF0aChleHBPckZuKVxyXG4gICAgICAgIHJldHVybiBzZXQodGhpcylcclxuICAgIH1cclxufSIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IHl1ZXIgb24gMjAxNy81LzE0LlxyXG4gKi9cclxuaW1wb3J0IHsgYmVmb3JlLCByZXBsYWNlIH0gZnJvbSAnLi4vLi4vdXRpbC9kb20nXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIChFZWwpIHtcclxuICAgIEVlbC5wcm90b3R5cGUuJG1vdW50ID0gZnVuY3Rpb24gKGVsLCBwYXJlbnQpIHtcclxuICAgICAgICB0aGlzLiRlbCA9IHRoaXMuX3BhcnNlSFRNTChlbClcclxuICAgICAgICB0aGlzLiRlbC5fX1lfXyA9IHRoaXNcclxuICAgICAgICByZXR1cm4gdGhpc1xyXG4gICAgfVxyXG4gICAgRWVsLnByb3RvdHlwZS4kYmVmb3JlID0gZnVuY3Rpb24gKGVsKSB7XHJcbiAgICAgICAgYmVmb3JlKHRoaXMuJGVsLCBlbClcclxuICAgIH1cclxuICAgIEVlbC5wcm90b3R5cGUuJHJlcGxhY2UgPSBmdW5jdGlvbiAoZWwpIHtcclxuICAgICAgICByZXBsYWNlKGVsLCB0aGlzLiRlbClcclxuICAgIH1cclxufSIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IHl1ZXIgb24gMjAxNy81LzYuXHJcbiAqL1xyXG5pbXBvcnQgeyBpbml0TWl4aW4gfSBmcm9tICcuL2luaXQnXHJcbmltcG9ydCB7IHN0YXRlTWl4aW4gfSBmcm9tICcuL3N0YXRlJ1xyXG5pbXBvcnQgeyBldmVudE1peGluIH0gZnJvbSAnLi9ldmVudCdcclxuaW1wb3J0IHsgZGlyZWN0aXZlc01peGluIH0gZnJvbSAnLi9kaXJlY3RpdmVzJ1xyXG5pbXBvcnQgeyBjb21waWxlck1peGluIH0gZnJvbSAnLi9jb21waWxlcidcclxuXHJcbmltcG9ydCBkYXRhQXBpIGZyb20gJy4vYXBpL2RhdGEnXHJcbmltcG9ydCBkb21BcGkgZnJvbSAnLi9hcGkvZG9tJ1xyXG5cclxuZnVuY3Rpb24gRWVsIChvcHRpb25zKSB7XHJcbiAgICBpZiAoIXRoaXMgaW5zdGFuY2VvZiBFZWwpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKCdlcnJvciBuZXcnKVxyXG4gICAgfVxyXG4gICAgdGhpcy5faW5pdChvcHRpb25zKVxyXG59XHJcbi8vIE1peGluXHJcbmluaXRNaXhpbihFZWwpXHJcbnN0YXRlTWl4aW4oRWVsKVxyXG5ldmVudE1peGluKEVlbClcclxuZGlyZWN0aXZlc01peGluKEVlbClcclxuY29tcGlsZXJNaXhpbihFZWwpXHJcbi8vIGFwaVxyXG5kYXRhQXBpKEVlbClcclxuZG9tQXBpKEVlbClcclxuZXhwb3J0IGRlZmF1bHQgRWVsIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgeXVlciBvbiAyMDE3LzUvMTQuXHJcbiAqL1xyXG5sZXQgY2lkID0gMFxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAoRWVsKSB7XHJcbiAgICBFZWwub3B0aW9ucyA9IHtcclxuICAgICAgICBjb21wb25lbnRzOiB7fVxyXG4gICAgfVxyXG4gICAgRWVsLnZlcnNpb24gPSAnMC4xJ1xyXG4gICAgRWVsLmV4dGVuZCA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XHJcbiAgICAgICAgbGV0IFN1cGVyID0gdGhpc1xyXG4gICAgICAgIGxldCBTdWIgPSBjcmVhdENsYXNzKClcclxuICAgICAgICBTdWIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShTdXBlci5wcm90b3R5cGUpXHJcbiAgICAgICAgU3ViLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFN1YlxyXG4gICAgICAgIFN1Yi5vcHRpb25zID0gb3B0aW9uc1xyXG4gICAgICAgIHJldHVybiBTdWJcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGNyZWF0Q2xhc3MgKCkge1xyXG4gICAgICAgIHJldHVybiBuZXcgRnVuY3Rpb24oXHJcbiAgICAgICAgICAgICdyZXR1cm4gZnVuY3Rpb24gRWVsQ29tcG9uZW50IChvcHRpb25zKSB7dGhpcy5faW5pdChvcHRpb25zKTt9J1xyXG4gICAgICAgICkoKVxyXG4gICAgfVxyXG4gICAgRWVsLmNvbXBvbmVudCA9IGZ1bmN0aW9uIChuYW1lLCBvcHRpb25zKSB7XHJcbiAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cclxuICAgICAgICBsZXQgU3ViXHJcbiAgICAgICAgb3B0aW9ucy5uYW1lID0gbmFtZVxyXG4gICAgICAgIG9wdGlvbnMuX2lzQ29tcG9uZW50ID0gdHJ1ZVxyXG4gICAgICAgIG9wdGlvbnMgPSBFZWwuZXh0ZW5kKG9wdGlvbnMpXHJcbiAgICAgICAgRWVsLm9wdGlvbnNbJ2NvbXBvbmVudHMnXVtuYW1lXSA9IG9wdGlvbnNcclxuICAgICAgICByZXR1cm4gb3B0aW9uc1xyXG4gICAgfVxyXG59IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgeXVlciBvbiAyMDE3LzUvNS5cclxuICovXHJcbmltcG9ydCBFZWwgZnJvbSAnLi9pbnN0YW5jZS9pbmRleCdcclxuaW1wb3J0IGdsb2JhbEFwaSBmcm9tICcuL2dsb2JhbC1hcGknXHJcblxyXG5nbG9iYWxBcGkoRWVsKVxyXG5leHBvcnQgZGVmYXVsdCBFZWwiXSwibmFtZXMiOlsiZXh0ZW5kIiwidG8iLCJmb3JtIiwia2V5cyIsImZvckVhY2giLCJrZXkiLCJwcm94eSIsImRlZmluZVByb3BlcnR5IiwidmFsIiwiYmFpbFJFIiwicGFyc2VQYXRoIiwicGF0aCIsInRlc3QiLCJzZWdtZW50cyIsInNwbGl0Iiwib2JqIiwiaSIsImxlbmd0aCIsInNldERhdGEiLCJEZXAiLCJzdWJzIiwic3ViIiwicHVzaCIsInVwZGF0ZSIsInRhcmdldCIsImFkZERlcCIsIk9ic2VydmVyIiwidmFsdWUiLCJ3YWxrIiwiZGVwIiwib2JzZXJ2ZSIsIm9iIiwiZGVmaW5lUmVhY3RpdmUiLCJ0eXBlIiwibyIsIk9iamVjdCIsImdldE93blByb3BlcnR5RGVzY3JpcHRvciIsImNoaWxkT2IiLCJnZXR0ZXIiLCJkZXBlbmQiLCJzZXR0ZXIiLCJuZXdWYWwiLCJub3RpZnkiLCJzdGF0ZU1peGluIiwiRWVsIiwiX3dhdGNoZXIiLCJwcm90b3R5cGUiLCJfaW5pdFN0YXRlIiwiaW5pdFN0YXRlIiwiX2luaXRXYXRjaCIsImluaXRXYXRjaCIsIl9pbml0TWV0aG9kcyIsImluaXRNZXRob2RzIiwiZGF0YSIsIl9kYXRhIiwiJG9wdGlvbiIsIkZ1bmN0aW9uIiwiX29iIiwid2F0Y2giLCIkd2F0Y2giLCJtZXRob2RzIiwibWVyZ2VPcHRpb25zIiwiZSIsInZtIiwiYXJyIiwiY29tcG9uZW50cyIsIm5hbWUiLCJfaXNDb21wb25lbnQiLCJkaXJlY3RpdmVzIiwiZWwiLCJ0ZXh0Q29udGVudCIsInJlcGxhY2UiLCJ0YXIiLCJuZXh0U2libGluZyIsInBhcmVudE5vZGUiLCJpbnNlcnRCZWZvcmUiLCJhcHBlbmRDaGlsZCIsInJlbW92ZUNoaWxkIiwicGFyc2VEb20iLCJhcmciLCJkb20iLCJvYmpFIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiaW5uZXJIVE1MIiwiY2hpbGROb2RlcyIsInRyaW0iLCJiZWZvcmUiLCJyZW1vdmUiLCIkcGFyZW50IiwiUGxhIiwiX1BsYSIsImNyZWF0ZUNvbW1lbnQiLCJfZWwiLCJoaWRlIiwic2hvdyIsImFkZEV2ZW50TGlzdGVuZXIiLCJjYWxsIiwiY24iLCIkc2V0IiwiZGlyZWN0aXZlc1JFIiwiX19ZX18iLCJpbnNlcnQiLCJvcHRpb25zIiwiY29tIiwiY29tcG9uZW50IiwiX25hbWUiLCIkcmVwbGFjZSIsImRpciIsIiRlbCIsImF0dHJpYnV0ZXMiLCJzbGljZSIsImF0dHIiLCJfY29tcGlsZURpciIsImluc3RhbGwiLCJ1aWQiLCJpbml0TWl4aW4iLCJfaW5pdCIsIl91aWQiLCIkZGlyZWN0aXZlcyIsIiRyb290IiwicGFyZW50IiwiJGNoaWxkcmVuIiwiY29uc3RydWN0b3IiLCJfY2FsbEhvb2siLCJxdWVyeVNlbGVjdG9yIiwiJG1vdW50IiwiZXZlbnRNaXhpbiIsImhvb2siLCJoYW5kbGUiLCJBcnJheSIsImRpcmVjdGl2ZXNNaXhpbiIsImluc3RhbGxEaXJlY3RpdmVzIiwiZXJyb3IiLCJEaXJlY3RpdmVzIiwidGV4dCIsImxpdGVyYWwiLCJtb2RpZmllcnMiLCJjb21waWxlIiwidGFnIiwiYXJnUkUiLCJleGVjIiwidGFncyIsImluZGV4IiwidCIsImdldCIsInNldCIsInJlbW92ZUF0dHJpYnV0ZSIsImJpbmQiLCJkZWZhdWx0VGFnUkUiLCJkaXJSRU0iLCJwYXJzZUhUTUwiLCJ0cGwiLCJwYXJzZVRlbXBsYXRlIiwidGVtcGxhdGUiLCJfY29tcGlsZU5vZGUiLCJjb21waWxlTm9kZSIsImh0bWwiLCJub2RlVHlwZSIsInRhZ05hbWUiLCJ0b0xvd2VyQ2FzZSIsIl9jb21waWxlQ29tcG9uZW50Tm9kZSIsIl9jb21waWxlRG9tTm9kZSIsIl9jb21waWxlVGV4dE5vZGUiLCJjb21waWxlQ29tcG9uZW50Tm9kZSIsImNvbXBpbGVEaXIiLCJub2RlVmFsdWUiLCJjb21waWxlRG9tTm9kZSIsImZyb20iLCJjb21waWxlVGV4dE5vZGUiLCJwYXJzZSIsImNyZWF0ZVRleHROb2RlIiwibWF0Y2giLCJsYXN0aW5kZXgiLCJsYXN0IiwiY29tcGlsZXJNaXhpbiIsIl9wYXJzZUhUTUwiLCJXYXRjaGVyIiwiZXhwT3JGbiIsImNiIiwiYWRkU3ViIiwib2xkVmFsIiwid2F0Y2hlciIsIiRnZXQiLCIkYmVmb3JlIiwiZGF0YUFwaSIsImRvbUFwaSIsInZlcnNpb24iLCJTdXBlciIsIlN1YiIsImNyZWF0Q2xhc3MiLCJjcmVhdGUiLCJnbG9iYWxBcGkiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUE7OztBQUdBLEFBQU8sU0FBU0EsTUFBVCxDQUFpQkMsRUFBakIsRUFBcUJDLElBQXJCLEVBQTJCO1dBQ3ZCQyxJQUFQLENBQVlELElBQVosRUFBa0JFLE9BQWxCLENBQTBCLGVBQU87V0FDMUJDLEdBQUgsSUFBVUgsS0FBS0csR0FBTCxDQUFWO0tBREo7OztBQUtKLEFBQU8sU0FBU0MsS0FBVCxDQUFnQkwsRUFBaEIsRUFBb0JDLElBQXBCLEVBQTBCO1dBQ3RCQyxJQUFQLENBQVlELElBQVosRUFDS0UsT0FETCxDQUNhLGVBQU87ZUFDTEcsY0FBUCxDQUFzQk4sRUFBdEIsRUFBMEJJLEdBQTFCLEVBQStCOzBCQUNiLElBRGE7d0JBRWYsSUFGZTtpQkFHdEI7dUJBQU1ILEtBQUtHLEdBQUwsQ0FBTjthQUhzQjtpQkFJdEIsYUFBQ0csR0FBRDt1QkFBU04sS0FBS0csR0FBTCxJQUFZRyxHQUFyQjs7U0FKVDtLQUZSOzs7Ozs7O0FBZUosSUFBTUMsU0FBUyxTQUFmO0FBQ0EsQUFBTyxTQUFTQyxTQUFULENBQW9CQyxJQUFwQixFQUEwQjtRQUN6QkYsT0FBT0csSUFBUCxDQUFZRCxJQUFaLENBQUosRUFBdUI7OztRQUdqQkUs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
