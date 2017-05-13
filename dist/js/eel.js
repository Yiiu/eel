/**
 * test v0.0.1
 * (c) 2017 Yiiu
 * @license MIT
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.eel = factory());
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
}
function initState(Eel) {
    initData(Eel);
    Eel._watcher = [];
}
function initWatch(Eel) {
    if (Eel.$option.watch) {
        Object.keys(Eel.$option.watch).forEach(function (key) {
            Eel.$watch(key, Eel.$option.watch[key]);
        });
    }
}

function initData(vm) {
    var data = vm._data = vm.$option.data;
    vm._ob = new Observer(data);
    proxy(vm, data);
    initMethods(vm);
}

function initMethods(vm) {
    var method = vm.$option.methods;
    proxy(vm, method);
}

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
function parseHTML(el) {
    var fragment = document.createDocumentFragment();
    var tpl = this.$root.$template;
    if (typeof tpl === 'string') {
        tpl = parseDom(tpl);
    }
    if (tpl instanceof Array) {
        console.error('需要根节点');
    }
    this._compileNode(tpl);
    this.$el.appendChild(tpl);
}
/**
 * 处理模板节点
 */
function compileNode(html) {
    if (html.nodeType === 1) {
        this._compileDomNode(html);
    } else if (html.nodeType === 3) {
        if (html.data === '\n') {
            return;
        }
        this._compileTextNode(html);
    }
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
function initCompiler(vm) {
    vm.$root = {};
    vm.$el = document.querySelector(vm.$option.el);
    vm.$root.$el = document.querySelector(vm.$option.el);
    var t = vm.$root.$tplDom = document.querySelector(vm.$option.template || vm.$option.el);
    vm.$root.$template = t.innerHTML;
    vm.__proto__._parseHTML = parseHTML;
    vm.__proto__._compileDir = compileDir;
    vm.__proto__._compileNode = compileNode;
    vm.__proto__._compileDomNode = compileDomNode;
    vm.__proto__._compileTextNode = compileTextNode;
    vm.$root.$tplDom.innerHTML = '';
    vm._parseHTML(vm.$el);
}

/**
 * Created by yuer on 2017/5/12.
 */

// 指令构造函数
function install(name, hook, vm) {
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
            this.el.value = val;
            this.el.addEventListener('input', function (e) {
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
function install$1(Eel) {
    Vtext(Eel);
    Vif(Eel);
    Von(Eel);
    Vmodel(Eel);
}

/**
 * Created by yuer on 2017/5/12.
 */
function initDirectives(vm) {
    vm.__proto__.directives = installDirectives;
    vm.$directives = {};
    install$1(vm);
}
function installDirectives(name, hook) {
    var dir = install(name, hook);
    if (this.$directives[name]) {
        console.error('\u5DF2\u7ECF\u5B58\u5728' + name + '\u6307\u4EE4');
    } else {
        this.$directives[name] = dir;
    }
    return this;
}

/**
 * Created by yuer on 2017/5/6.
 */
function initMixin(Eel) {
    Eel.prototype._init = function (options) {
        this.$option = options;
        initState(this);
        initWatch(this);
        initDirectives(this);
        initCompiler(this);
    };
}

/**
 * Created by yuer on 2017/5/6.
 */
function Eel$1(options) {
    if (!this instanceof Eel$1) {
        console.error('error new');
    }
    this._init(options);
}
initMixin(Eel$1);
stateMixin(Eel$1);

/**
 * Created by yuer on 2017/5/5.
 */

return Eel$1;

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjpudWxsLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlsL2RhdGEuanMiLCIuLi8uLi9zcmMvb2JzZXJ2ZXIvZGVwLmpzIiwiLi4vLi4vc3JjL29ic2VydmVyL3dhdGNoZXIuanMiLCIuLi8uLi9zcmMvb2JzZXJ2ZXIvaW5kZXguanMiLCIuLi8uLi9zcmMvaW5zdGFuY2Uvc3RhdGUuanMiLCIuLi8uLi9zcmMvdXRpbC9kb20uanMiLCIuLi8uLi9zcmMvZGlyZWN0aXZlcy9pbmRleC5qcyIsIi4uLy4uL3NyYy9jb21waWxlci9pbmRleC5qcyIsIi4uLy4uL3NyYy9pbnN0YW5jZS9jb21waWxlci5qcyIsIi4uLy4uL3NyYy9kaXJlY3RpdmVzL2ludGFsbC5qcyIsIi4uLy4uL3NyYy9kaXJlY3RpdmVzL2RlZmF1bHQvdGV4dC5qcyIsIi4uLy4uL3NyYy9kaXJlY3RpdmVzL2RlZmF1bHQvaWYuanMiLCIuLi8uLi9zcmMvZGlyZWN0aXZlcy9kZWZhdWx0L29uLmpzIiwiLi4vLi4vc3JjL2RpcmVjdGl2ZXMvZGVmYXVsdC9tb2RlbC5qcyIsIi4uLy4uL3NyYy9kaXJlY3RpdmVzL2RlZmF1bHQvaW5kZXguanMiLCIuLi8uLi9zcmMvaW5zdGFuY2UvZGlyZWN0aXZlcy5qcyIsIi4uLy4uL3NyYy9pbnN0YW5jZS9pbml0LmpzIiwiLi4vLi4vc3JjL2luc3RhbmNlL2luZGV4LmpzIiwiLi4vLi4vc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IHl1ZXIgb24gMjAxNy81LzExLlxyXG4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGV4dGVuZCAodG8sIGZvcm0pIHtcclxuICAgIE9iamVjdC5rZXlzKGZvcm0pLmZvckVhY2goa2V5ID0+IHtcclxuICAgICAgICB0b1trZXldID0gZm9ybVtrZXldXHJcbiAgICB9KVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcHJveHkgKHRvLCBmb3JtKSB7XHJcbiAgICBPYmplY3Qua2V5cyhmb3JtKVxyXG4gICAgICAgIC5mb3JFYWNoKGtleSA9PiB7XHJcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0bywga2V5LCB7XHJcbiAgICAgICAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgZ2V0OiAoKSA9PiBmb3JtW2tleV0sXHJcbiAgICAgICAgICAgICAgICBzZXQ6ICh2YWwpID0+IGZvcm1ba2V5XSA9IHZhbFxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0pXHJcbn1cclxuXHJcbi8qKlxyXG4gKiDnlKjkuo7ljrvojrflj5blpoLvvJonb2JqLmEn6L+Z5qC355qE5YC8XHJcbiAqIEB0eXBlIHtSZWdFeHB9XHJcbiAqL1xyXG5jb25zdCBiYWlsUkUgPSAvW15cXHcuJF0vXHJcbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVBhdGggKHBhdGgpIHtcclxuICAgIGlmIChiYWlsUkUudGVzdChwYXRoKSkge1xyXG4gICAgICAgIHJldHVyblxyXG4gICAgfVxyXG4gICAgY29uc3Qgc2VnbWVudHMgPSBwYXRoLnNwbGl0KCcuJylcclxuICAgIHJldHVybiBmdW5jdGlvbiAob2JqKSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZWdtZW50cy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAoIW9iaikgcmV0dXJuXHJcbiAgICAgICAgICAgIG9iaiA9IG9ialtzZWdtZW50c1tpXV1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG9ialxyXG4gICAgfVxyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBzZXREYXRhIChwYXRoLCBvYmopIHtcclxuICAgIGlmIChiYWlsUkUudGVzdChwYXRoKSkge1xyXG4gICAgICAgIHJldHVyblxyXG4gICAgfVxyXG4gICAgY29uc3Qgc2VnbWVudHMgPSBwYXRoLnNwbGl0KCcuJylcclxuICAgIHJldHVybiBmdW5jdGlvbiAodmFsKSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZWdtZW50cy5sZW5ndGggLSAxOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKCFvYmopIHJldHVyblxyXG4gICAgICAgICAgICBvYmogPSBvYmpbc2VnbWVudHNbaV1dXHJcbiAgICAgICAgfVxyXG4gICAgICAgIG9ialtzZWdtZW50c1tzZWdtZW50cy5sZW5ndGggLSAxXV0gPSB2YWxcclxuICAgIH1cclxufSIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IHl1ZXIgb24gMjAxNy81LzUuXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEZXAge1xyXG4gICAgY29uc3RydWN0b3IgKCkge1xyXG4gICAgICAgIHRoaXMuc3VicyA9IFtdICAvLyDorqLpmIXmlbDnu4RcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOa3u+WKoOiuoumYhVxyXG4gICAgICovXHJcbiAgICBhZGRTdWIgKHN1Yikge1xyXG4gICAgICAgIHRoaXMuc3Vicy5wdXNoKHN1YilcclxuICAgIH1cclxuICAgIG5vdGlmeSAoKSB7XHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7aSA8IHRoaXMuc3Vicy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICB0aGlzLnN1YnNbaV0udXBkYXRlKClcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBkZXBlbmQgKCkge1xyXG4gICAgICAgIGlmIChEZXAudGFyZ2V0KSB7XHJcbiAgICAgICAgICAgIERlcC50YXJnZXQuYWRkRGVwKHRoaXMpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbkRlcC50YXJnZXQgPSBudWxsIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgeXVlciBvbiAyMDE3LzUvNS5cclxuICovXHJcbmltcG9ydCBEZXAgZnJvbSAnLi9kZXAnXHJcbmltcG9ydCB7IHBhcnNlUGF0aCB9IGZyb20gJy4uL3V0aWwvZGF0YSdcclxuLy8g6K6i6ZiF6ICFXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdhdGNoZXIge1xyXG4gICAgY29uc3RydWN0b3IgKHZtLCBleHBPckZuLCBjYikge1xyXG4gICAgICAgIHRoaXMudm0gPSB2bSAgICAgICAgICAgIC8vIOWunuS+i1xyXG4gICAgICAgIHRoaXMuZXhwT3JGbiA9IGV4cE9yRm4gIC8vIOiiq+iuoumYheeahOaVsOaNrlxyXG4gICAgICAgIHRoaXMuY2IgPSBjYiAgICAgICAgICAgIC8vIOWbnuiwg1xyXG4gICAgICAgIHRoaXMuZ2V0dGVyID0gcGFyc2VQYXRoKGV4cE9yRm4pXHJcbiAgICAgICAgdGhpcy52YWwgPSB0aGlzLmdldCgpICAgLy8g5pu05paw5YmN55qE5pWwXHJcbiAgICB9XHJcbiAgICAvKipcclxuICAgICAqIOadpemAmuefpeeuoeeQhuWRmChEZXAp6LCD55SoXHJcbiAgICAgKi9cclxuICAgIGdldCAoKSB7XHJcbiAgICAgICAgRGVwLnRhcmdldCA9IHRoaXNcclxuICAgICAgICBsZXQgdmFsID0gdGhpcy5nZXR0ZXIgPyB0aGlzLmdldHRlcih0aGlzLnZtKSA6IHRoaXMudm1bdGhpcy5leHBPckZuXVxyXG4gICAgICAgIERlcC50YXJnZXQgPSBudWxsXHJcbiAgICAgICAgcmV0dXJuIHZhbFxyXG4gICAgfVxyXG4gICAgYWRkRGVwIChkZXApIHtcclxuICAgICAgICBkZXAuYWRkU3ViKHRoaXMpXHJcbiAgICB9XHJcbiAgICB1cGRhdGUgKCkge1xyXG4gICAgICAgIGNvbnN0IHZhbCA9IHRoaXMuZ2V0dGVyID8gdGhpcy5nZXR0ZXIodGhpcy52bSkgOiB0aGlzLnZtW3RoaXMuZXhwT3JGbl1cclxuICAgICAgICBpZiAodmFsICE9PSB0aGlzLnZhbCkge1xyXG4gICAgICAgICAgICBjb25zdCBvbGRWYWwgPSB0aGlzLnZhbFxyXG4gICAgICAgICAgICB0aGlzLnZhbCA9IHZhbFxyXG4gICAgICAgICAgICB0aGlzLmNiLmNhbGwodGhpcy52bSwgb2xkVmFsLCB0aGlzLnZhbClcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iLCIvKipcclxuICogQ3JlYXRlZCBieSB5dWVyIG9uIDIwMTcvNS81LlxyXG4gKi9cclxuaW1wb3J0IERlcCBmcm9tICcuL2RlcCdcclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT2JzZXJ2ZXIge1xyXG4gICAgY29uc3RydWN0b3IgKHZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlXHJcbiAgICAgICAgdGhpcy53YWxrKHZhbHVlKVxyXG4gICAgICAgIHRoaXMuZGVwID0gbmV3IERlcCgpXHJcbiAgICB9XHJcbiAgICB3YWxrICh2YWx1ZSkge1xyXG4gICAgICAgIGZvciAobGV0IHZhbCBpbiB2YWx1ZSkge1xyXG4gICAgICAgICAgICBkZWZpbmVSZWFjdGl2ZSh0aGlzLnZhbHVlLCB0aGlzLnZhbHVlW3ZhbF0sIHZhbClcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuLyoqXHJcbiAqXHJcbiAqIEBwYXJhbSB2YWx1ZVxyXG4gKiBAcmV0dXJucyB7YW55fVxyXG4gKi9cclxuZnVuY3Rpb24gb2JzZXJ2ZSAodmFsdWUpIHtcclxuICAgIGlmICh0eXBlb2YodmFsdWUpICE9PSAnb2JqZWN0Jykge1xyXG4gICAgICAgIHJldHVyblxyXG4gICAgfVxyXG4gICAgbGV0IG9iID0gbmV3IE9ic2VydmVyKHZhbHVlKVxyXG4gICAgcmV0dXJuIG9iXHJcbn1cclxuZnVuY3Rpb24gZGVmaW5lUmVhY3RpdmUgKG9iaiwgdmFsLCB0eXBlKSB7XHJcbiAgICBjb25zdCBkZXAgPSBuZXcgRGVwKClcclxuICAgIGxldCBvID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmosIHR5cGUpXHJcbiAgICBsZXQgY2hpbGRPYiA9IG9ic2VydmUodmFsKVxyXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG9iaiwgdHlwZSwge1xyXG4gICAgICAgIGdldDogZnVuY3Rpb24gZ2V0dGVyICgpIHtcclxuICAgICAgICAgICAgaWYgKERlcC50YXJnZXQpIHtcclxuICAgICAgICAgICAgICAgIGRlcC5kZXBlbmQoKVxyXG4gICAgICAgICAgICAgICAgaWYgKGNoaWxkT2IpIHtcclxuICAgICAgICAgICAgICAgICAgICBjaGlsZE9iLmRlcC5kZXBlbmQoKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB2YWxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNldDogZnVuY3Rpb24gc2V0dGVyIChuZXdWYWwpIHtcclxuICAgICAgICAgICAgaWYgKG5ld1ZhbCA9PT0gdmFsKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoY2hpbGRPYikge1xyXG4gICAgICAgICAgICAgICAgY2hpbGRPYi5kZXAubm90aWZ5KClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjaGlsZE9iID0gb2JzZXJ2ZShuZXdWYWwpXHJcbiAgICAgICAgICAgIHZhbCA9IG5ld1ZhbFxyXG4gICAgICAgICAgICBkZXAubm90aWZ5KClcclxuICAgICAgICB9XHJcbiAgICB9KVxyXG59IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgeXVlciBvbiAyMDE3LzUvNi5cclxuICovXHJcbmltcG9ydCB7IHByb3h5LCBzZXREYXRhLCBwYXJzZVBhdGggfSBmcm9tICcuLi91dGlsL2RhdGEnXHJcbmltcG9ydCBXYXRjaGVyIGZyb20gJy4uL29ic2VydmVyL3dhdGNoZXInXHJcbmltcG9ydCBPYnNlcnZlciBmcm9tICcuLi9vYnNlcnZlci9pbmRleCdcclxuZXhwb3J0IGZ1bmN0aW9uIHN0YXRlTWl4aW4gKEVlbCkge1xyXG4gICAgRWVsLnByb3RvdHlwZS4kd2F0Y2ggPSBmdW5jdGlvbiAoZXhwT3JGbiwgY2IpIHtcclxuICAgICAgICBsZXQgd2F0Y2hlciA9IG5ldyBXYXRjaGVyKHRoaXMsIGV4cE9yRm4sIGNiKVxyXG4gICAgICAgIHRoaXMuX3dhdGNoZXIucHVzaCh3YXRjaGVyKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcbiAgICBFZWwucHJvdG90eXBlLiRzZXQgPSBmdW5jdGlvbiAoZXhwT3JGbiwgdmFsKSB7XHJcbiAgICAgICAgbGV0IHNldCA9IHNldERhdGEoZXhwT3JGbiwgdGhpcylcclxuICAgICAgICBzZXQodmFsKVxyXG4gICAgICAgIHJldHVybiB0aGlzXHJcbiAgICB9XHJcbiAgICBFZWwucHJvdG90eXBlLiRnZXQgPSBmdW5jdGlvbiAoZXhwT3JGbiwgdmFsKSB7XHJcbiAgICAgICAgbGV0IHNldCA9IHBhcnNlUGF0aChleHBPckZuKVxyXG4gICAgICAgIHJldHVybiBzZXQodGhpcylcclxuICAgIH1cclxufVxyXG5leHBvcnQgZnVuY3Rpb24gaW5pdFN0YXRlIChFZWwpIHtcclxuICAgIGluaXREYXRhKEVlbClcclxuICAgIEVlbC5fd2F0Y2hlciA9IFtdXHJcbn1cclxuZXhwb3J0IGZ1bmN0aW9uIGluaXRXYXRjaCAoRWVsKSB7XHJcbiAgICBpZiAoRWVsLiRvcHRpb24ud2F0Y2gpIHtcclxuICAgICAgICBPYmplY3Qua2V5cyhFZWwuJG9wdGlvbi53YXRjaCkuZm9yRWFjaChrZXkgPT4ge1xyXG4gICAgICAgICAgICBFZWwuJHdhdGNoKGtleSwgRWVsLiRvcHRpb24ud2F0Y2hba2V5XSlcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBfcHJveHkgKHZtLCBrZXkpIHtcclxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh2bSwga2V5LCB7XHJcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxyXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXHJcbiAgICAgICAgZ2V0OiAoKSA9PiB2bS5fZGF0YVtrZXldLFxyXG4gICAgICAgIHNldDogKHZhbCkgPT4gdm0uX2RhdGFba2V5XSA9IHZhbFxyXG4gICAgfSlcclxufVxyXG5mdW5jdGlvbiBpbml0RGF0YSAodm0pIHtcclxuICAgIGxldCBkYXRhID0gdm0uX2RhdGEgPSB2bS4kb3B0aW9uLmRhdGFcclxuICAgIHZtLl9vYiA9IG5ldyBPYnNlcnZlcihkYXRhKVxyXG4gICAgcHJveHkodm0sIGRhdGEpXHJcbiAgICBpbml0TWV0aG9kcyh2bSlcclxufVxyXG5cclxuZnVuY3Rpb24gaW5pdE1ldGhvZHMgKHZtKSB7XHJcbiAgICBsZXQgbWV0aG9kID0gdm0uJG9wdGlvbi5tZXRob2RzXHJcbiAgICBwcm94eSh2bSwgbWV0aG9kKVxyXG59XHJcbiIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IHl1ZXIgb24gMjAxNy81LzExLlxyXG4gKi9cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiByZXBsYWNlIChlbCwgdGFyKSB7XHJcbiAgICBpZiAoZWwubmV4dFNpYmxpbmcpIHtcclxuICAgICAgICBlbC5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh0YXIsIGVsKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICBlbC5wYXJlbnROb2RlLmFwcGVuZENoaWxkKHRhcilcclxuICAgIH1cclxuICAgIGVsLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZWwpXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBwYXJzZURvbSAoYXJnKSB7XHJcbiAgICBsZXQgZG9tID0gW11cclxuICAgIGxldCBvYmpFID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKVxyXG5cclxuICAgIG9iakUuaW5uZXJIVE1MID0gYXJnXHJcbiAgICBmb3IgKGxldCBpID0gMDtpIDwgb2JqRS5jaGlsZE5vZGVzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgaWYgKG9iakUuY2hpbGROb2Rlc1tpXS50ZXh0Q29udGVudC50cmltKCkgIT09ICdcXG4nICYmIG9iakUuY2hpbGROb2Rlc1tpXS50ZXh0Q29udGVudC50cmltKCkgIT09ICcnKSB7XHJcbiAgICAgICAgICAgIGRvbS5wdXNoKG9iakUuY2hpbGROb2Rlc1tpXSlcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gZG9tLmxlbmd0aCA/IGRvbVswXSA6IGRvbVxyXG5cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGJlZm9yZSAoZWwsIHRhcmdldCkge1xyXG4gICAgdGFyZ2V0LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGVsLCB0YXJnZXQpO1xyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiByZW1vdmUgKGVsKSB7XHJcbiAgICBlbC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGVsKTtcclxufSIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IHl1ZXIgb24gMjAxNy81LzEyLlxyXG4gKi9cclxuaW1wb3J0IHsgcGFyc2VQYXRoLCBleHRlbmQsIHNldERhdGEgfSBmcm9tICcuLi91dGlsL2RhdGEnXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERpcmVjdGl2ZXMge1xyXG4gICAgLyoqXHJcbiAgICAgKlxyXG4gICAgICogQHBhcmFtIG5hbWUge1N0cmluZ30g5oyH5Luk5ZCN56ewXHJcbiAgICAgKiBAcGFyYW0gZWwge0VsZW1lbnR9IOaMh+S7pOWvueW6lOeahGRvbVxyXG4gICAgICogQHBhcmFtIHZtIHtFZWx9IOaMh+S7pOWvueW6lOeahOWunuS+i1xyXG4gICAgICogQHBhcmFtIGRlc2NyaXB0b3Ige09iamVjdH0g5oyH5Luk5Y+C5pWwXHJcbiAgICAgKi9cclxuICAgIGNvbnN0cnVjdG9yIChuYW1lLCBlbCwgdm0sIHRleHQpIHtcclxuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lICAgICAgICAvLyDmjIfku6TlkI3np7BcclxuICAgICAgICB0aGlzLmVsID0gZWwgICAgICAgICAgICAvLyDnu5HlrprnmoRkb21cclxuICAgICAgICB0aGlzLnZtID0gdm0gICAgICAgICAgICAvL1xyXG4gICAgICAgIHRoaXMuYXJnID0gJycgICAgICAgICAgIC8vIOWPguaVsFxyXG4gICAgICAgIHRoaXMudmFsID0gdGV4dC52YWxcclxuICAgICAgICB0aGlzLl9uYW1lID0gdGV4dC5uYW1lXHJcbiAgICAgICAgdGhpcy5tb2RpZmllcnMgPSB7fSAgICAgLy8g5L+u6aWw56ymXHJcbiAgICAgICAgdGhpcy5jb21waWxlKHRleHQpXHJcbiAgICAgICAgZXh0ZW5kKHRoaXMsIHRoaXMudm0uJGRpcmVjdGl2ZXNbbmFtZV0pXHJcbiAgICAgICAgdGhpcy5faW5pdCgpXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDlpITnkIblj4LmlbBcclxuICAgICAqIEBwYXJhbSB0ZXh0XHJcbiAgICAgKi9cclxuICAgIGNvbXBpbGUgKHRleHQpIHtcclxuICAgICAgICBsZXQgdGFnID0gdGV4dC50YWdcclxuICAgICAgICBpZiAoIXRleHQgfHwgIXRleHQudGFnKSB7XHJcbiAgICAgICAgICAgIHJldHVyblxyXG4gICAgICAgIH1cclxuICAgICAgICBsZXQgYXJnUkUgPSAvOihcXHcrKS9cclxuICAgICAgICBpZiAoYXJnUkUuZXhlYyh0YWcpKSB7XHJcbiAgICAgICAgICAgIGxldCB0YWdzID0gYXJnUkUuZXhlYyh0YWcpXHJcbiAgICAgICAgICAgIHRoaXMuYXJnID0gdGFnc1sxXVxyXG4gICAgICAgICAgICB0YWcgPSB0YWcuc2xpY2UodGFncy5pbmRleCArIHRoaXMuYXJnLmxlbmd0aCArIDEsIHRhZy5sZW5ndGgpXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRhZy5zcGxpdCgnLicpLmZvckVhY2godCA9PiB7XHJcbiAgICAgICAgICAgIGlmICh0ID09PSAnJykgcmV0dXJuXHJcbiAgICAgICAgICAgIHRoaXMubW9kaWZpZXJzW3RdID0gdHJ1ZVxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDnlKjmiLfliJ3lp4vml7bojrflj5bmlbDmja7lgLxcclxuICAgICAqL1xyXG4gICAgZ2V0dGVyICgpIHtcclxuICAgICAgICBsZXQgZ2V0ID0gcGFyc2VQYXRoKHRoaXMudmFsKVxyXG4gICAgICAgIHJldHVybiBnZXQodGhpcy52bSlcclxuICAgIH1cclxuICAgIHNldHRlciAodmFsKSB7XHJcbiAgICAgICAgbGV0IHNldCA9IHNldERhdGEodGhpcy52YWwpXHJcbiAgICAgICAgcmV0dXJuIHNldCh0aGlzLnZtLCB2YWwpXHJcbiAgICB9XHJcbiAgICBfaW5pdCAoKSB7XHJcbiAgICAgICAgdGhpcy5fbmFtZSAmJiB0aGlzLmVsLnJlbW92ZUF0dHJpYnV0ZSh0aGlzLl9uYW1lKVxyXG4gICAgICAgIC8vIHRoaXMuZWwucmVtb3ZlQXR0cmlidXRlKHRoaXMuX25hbWUpXHJcbiAgICAgICAgdGhpcy5iaW5kICYmIHRoaXMuYmluZCgpXHJcbiAgICAgICAgaWYgKHRoaXMubGl0ZXJhbCkge1xyXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSAmJiB0aGlzLnVwZGF0ZSgpXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy52bS4kd2F0Y2godGhpcy52YWwsICh2YWwsIG5ld1ZhbCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGUgJiYgdGhpcy51cGRhdGUodmFsLCBuZXdWYWwpXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgeXVlciBvbiAyMDE3LzUvNi5cclxuICovXHJcbmltcG9ydCB7IHBhcnNlRG9tLCBiZWZvcmUsIHJlbW92ZSB9IGZyb20gJy4uL3V0aWwvZG9tJ1xyXG5pbXBvcnQgRGlyZWN0aXZlcyBmcm9tICcuLi9kaXJlY3RpdmVzL2luZGV4J1xyXG5jb25zdCBkZWZhdWx0VGFnUkUgPSAvXFx7XFx7KCg/Oi58XFxuKSs/KVxcfVxcfS9nICAgIC8vIHRhZ1xyXG5jb25zdCBkaXJlY3RpdmVzUkUgPSAvXnYtKFxcdyspLyAgICAgICAgICAgICAgICAgLy8g5Yy56YWN5oyH5Luk5ZCN56ewXHJcbmNvbnN0IGRpclJFTSA9IC92LSguKikvICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOWMuemFjeaMh+S7pOWQjeensOWQjumdoueahOWAvFxyXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VIVE1MIChlbCkge1xyXG4gICAgbGV0IGZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpXHJcbiAgICBsZXQgdHBsID0gdGhpcy4kcm9vdC4kdGVtcGxhdGVcclxuICAgIGlmICh0eXBlb2YodHBsKSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICB0cGwgPSBwYXJzZURvbSh0cGwpXHJcbiAgICB9XHJcbiAgICBpZiAodHBsIGluc3RhbmNlb2YgQXJyYXkpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKCfpnIDopoHmoLnoioLngrknKVxyXG4gICAgfVxyXG4gICAgdGhpcy5fY29tcGlsZU5vZGUodHBsKVxyXG4gICAgdGhpcy4kZWwuYXBwZW5kQ2hpbGQodHBsKVxyXG59XHJcbi8qKlxyXG4gKiDlpITnkIbmqKHmnb/oioLngrlcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBjb21waWxlTm9kZSAoaHRtbCkge1xyXG4gICAgaWYgKGh0bWwubm9kZVR5cGUgPT09IDEpIHtcclxuICAgICAgICB0aGlzLl9jb21waWxlRG9tTm9kZShodG1sKVxyXG4gICAgfSBlbHNlIGlmIChodG1sLm5vZGVUeXBlID09PSAzKSB7XHJcbiAgICAgICAgaWYgKGh0bWwuZGF0YSA9PT0gJ1xcbicpIHtcclxuICAgICAgICAgICAgcmV0dXJuXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX2NvbXBpbGVUZXh0Tm9kZShodG1sKVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZURpciAoYXR0ciwgZG9tKSB7XHJcbiAgICBsZXQgbmFtZSA9IGRpcmVjdGl2ZXNSRS5leGVjKGF0dHIubmFtZSlbMV1cclxuICAgIGxldCB0YWcgPSBkaXJSRU0uZXhlYyhhdHRyLm5hbWUpWzFdXHJcbiAgICBuZXcgRGlyZWN0aXZlcyhuYW1lLCBkb20sIHRoaXMsIHtcclxuICAgICAgICBuYW1lOiBhdHRyLm5hbWUsXHJcbiAgICAgICAgdGFnOiB0YWcsXHJcbiAgICAgICAgdmFsOiBhdHRyLm5vZGVWYWx1ZVxyXG4gICAgfSlcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVEb21Ob2RlIChkb20pIHtcclxuICAgIEFycmF5LnByb3RvdHlwZVxyXG4gICAgICAgIC5zbGljZVxyXG4gICAgICAgIC5jYWxsKGRvbS5hdHRyaWJ1dGVzKVxyXG4gICAgICAgIC5mb3JFYWNoKGF0dHIgPT4ge1xyXG4gICAgICAgICAgICBpZiAoZGlyZWN0aXZlc1JFLnRlc3QoYXR0ci5uYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fY29tcGlsZURpcihhdHRyLCBkb20pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgQXJyYXkuZnJvbShkb20uY2hpbGROb2RlcykuZm9yRWFjaCh0ID0+IHtcclxuICAgICAgICB0aGlzLl9jb21waWxlTm9kZSh0KVxyXG4gICAgfSlcclxufVxyXG5leHBvcnQgZnVuY3Rpb24gY29tcGlsZVRleHROb2RlICh0ZXh0KSB7XHJcbiAgICBsZXQgdGFnID0gcGFyc2UodGV4dC5kYXRhKVxyXG4gICAgaWYgKCF0YWcpIHtcclxuICAgICAgICByZXR1cm5cclxuICAgIH1cclxuICAgIHRhZy5mb3JFYWNoKHRhZ3MgPT4ge1xyXG4gICAgICAgIGlmICh0YWdzLnRhZykge1xyXG4gICAgICAgICAgICBsZXQgdmFsdWUgPSB0YWdzLnZhbHVlXHJcbiAgICAgICAgICAgIGxldCBlbCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcnKVxyXG4gICAgICAgICAgICBuZXcgRGlyZWN0aXZlcygndGV4dCcsIGVsLCB0aGlzLCB7XHJcbiAgICAgICAgICAgICAgICB2YWw6IHZhbHVlXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIGJlZm9yZShlbCwgdGV4dClcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBsZXQgZWwgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0YWdzLnZhbHVlKVxyXG4gICAgICAgICAgICBiZWZvcmUoZWwsIHRleHQpXHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxuICAgIHJlbW92ZSh0ZXh0KVxyXG59XHJcbmV4cG9ydCBmdW5jdGlvbiBwYXJzZSAodGV4dCkge1xyXG4gICAgaWYgKHRleHQgPT09ICcnICYmIGRlZmF1bHRUYWdSRS50ZXN0KHRleHQpKSByZXR1cm5cclxuICAgIGxldCB0YWcgPSBbXSwgbWF0Y2gsIGluZGV4LCB2YWx1ZSwgbGFzdGluZGV4ID0gMFxyXG4gICAgd2hpbGUgKG1hdGNoID0gZGVmYXVsdFRhZ1JFLmV4ZWModGV4dCkpIHtcclxuICAgICAgICBpbmRleCA9IG1hdGNoLmluZGV4XHJcbiAgICAgICAgaWYgKGluZGV4ID4gbGFzdGluZGV4KSB7XHJcbiAgICAgICAgICAgIGxldCBsYXN0ID0gdGV4dC5zbGljZShsYXN0aW5kZXgsIGluZGV4KVxyXG4gICAgICAgICAgICBpZiAobGFzdC50cmltKCkgIT09ICdcXG4nICYmIGxhc3QudHJpbSgpICE9PSAnJykge1xyXG4gICAgICAgICAgICAgICAgdGFnLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiB0ZXh0LnNsaWNlKGxhc3RpbmRleCwgaW5kZXgpXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhbHVlID0gbWF0Y2hbMV1cclxuICAgICAgICB0YWcucHVzaCh7XHJcbiAgICAgICAgICAgIHRhZzogdHJ1ZSxcclxuICAgICAgICAgICAgdmFsdWU6IHZhbHVlLnRyaW0oKVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgbGFzdGluZGV4ID0gaW5kZXggKyBtYXRjaFswXS5sZW5ndGhcclxuICAgIH1cclxuICAgIGlmIChsYXN0aW5kZXggPCB0ZXh0Lmxlbmd0aCAtIDEpIHtcclxuICAgICAgICBsZXQgbGFzdCA9IHRleHQuc2xpY2UobGFzdGluZGV4KVxyXG4gICAgICAgIGlmIChsYXN0LnRyaW0oKSAhPT0gJ1xcbicgJiYgbGFzdC50cmltKCkgIT09ICcnKSB7XHJcbiAgICAgICAgICAgIHRhZy5wdXNoKHtcclxuICAgICAgICAgICAgICAgIHZhbHVlOiBsYXN0XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRhZ1xyXG59XHJcbiIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IHl1ZXIgb24gMjAxNy81LzYuXHJcbiAqL1xyXG5pbXBvcnQgKiBhcyBwYXJzZSBmcm9tICcuLi9jb21waWxlci9pbmRleCdcclxuZXhwb3J0IGZ1bmN0aW9uIGluaXRDb21waWxlciAodm0pIHtcclxuICAgIHZtLiRyb290ID0ge31cclxuICAgIHZtLiRlbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Iodm0uJG9wdGlvbi5lbClcclxuICAgIHZtLiRyb290LiRlbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Iodm0uJG9wdGlvbi5lbClcclxuICAgIGxldCB0ID0gdm0uJHJvb3QuJHRwbERvbSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Iodm0uJG9wdGlvbi50ZW1wbGF0ZSB8fCB2bS4kb3B0aW9uLmVsKVxyXG4gICAgdm0uJHJvb3QuJHRlbXBsYXRlID0gdC5pbm5lckhUTUxcclxuICAgIHZtLl9fcHJvdG9fXy5fcGFyc2VIVE1MID0gcGFyc2UucGFyc2VIVE1MXHJcbiAgICB2bS5fX3Byb3RvX18uX2NvbXBpbGVEaXIgPSBwYXJzZS5jb21waWxlRGlyXHJcbiAgICB2bS5fX3Byb3RvX18uX2NvbXBpbGVOb2RlID0gcGFyc2UuY29tcGlsZU5vZGVcclxuICAgIHZtLl9fcHJvdG9fXy5fY29tcGlsZURvbU5vZGUgPSBwYXJzZS5jb21waWxlRG9tTm9kZVxyXG4gICAgdm0uX19wcm90b19fLl9jb21waWxlVGV4dE5vZGUgPSBwYXJzZS5jb21waWxlVGV4dE5vZGVcclxuICAgIHZtLiRyb290LiR0cGxEb20uaW5uZXJIVE1MID0gJydcclxuICAgIHZtLl9wYXJzZUhUTUwodm0uJGVsKVxyXG59IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgeXVlciBvbiAyMDE3LzUvMTIuXHJcbiAqL1xyXG5cclxuLy8g5oyH5Luk5p6E6YCg5Ye95pWwXHJcbmNsYXNzIERpcmVjdGl2ZSB7XHJcbiAgICBjb25zdHJ1Y3RvciAobmFtZSkge1xyXG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWVcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaW5zdGFsbCAobmFtZSwgaG9vaywgdm0pIHtcclxuICAgIGxldCBkaXIgPSB7XHJcbiAgICAgICAgbmFtZTogbmFtZVxyXG4gICAgfVxyXG4gICAgT2JqZWN0LmtleXMoaG9vaykuZm9yRWFjaCh0eXBlID0+IHtcclxuICAgICAgICBkaXJbdHlwZV0gPSBob29rW3R5cGVdXHJcbiAgICB9KVxyXG4gICAgcmV0dXJuIGRpclxyXG59IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgeXVlciBvbiAyMDE3LzUvMTIuXHJcbiAqL1xyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAoRWVsKSB7XHJcbiAgICBFZWwuZGlyZWN0aXZlcygndGV4dCcsIHtcclxuICAgICAgICBiaW5kOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZWwudGV4dENvbnRlbnQgPSB0aGlzLmdldHRlcigpXHJcbiAgICAgICAgfSxcclxuICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uICh2YWwsIG5ld1ZhbCkge1xyXG4gICAgICAgICAgICB0aGlzLmVsLnRleHRDb250ZW50ID0gbmV3VmFsXHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxufSIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IHl1ZXIgb24gMjAxNy81LzEzLlxyXG4gKi9cclxuaW1wb3J0IHsgcmVwbGFjZSB9IGZyb20gJy4uLy4uL3V0aWwvZG9tJ1xyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAoRWVsKSB7XHJcbiAgICBFZWwuZGlyZWN0aXZlcygnaWYnLCB7XHJcbiAgICAgICAgYmluZCAoKSB7XHJcbiAgICAgICAgICAgIGxldCB2YWwgPSB0aGlzLmdldHRlcigpXHJcbiAgICAgICAgICAgIGxldCBQbGEgPSB0aGlzLl9QbGEgPSBkb2N1bWVudC5jcmVhdGVDb21tZW50KCco4pePy4fiiIDLh+KXjyknKVxyXG4gICAgICAgICAgICB0aGlzLl9lbCA9IHRoaXMuZWxcclxuICAgICAgICAgICAgaWYgKCF2YWwpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaGlkZSgpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHVwZGF0ZSAodmFsLCBuZXdWYWwpIHtcclxuICAgICAgICAgICAgaWYgKG5ld1ZhbCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zaG93KClcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaGlkZSgpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHNob3cgKCkge1xyXG4gICAgICAgICAgICByZXBsYWNlKHRoaXMuX1BsYSwgdGhpcy5fZWwpXHJcbiAgICAgICAgfSxcclxuICAgICAgICBoaWRlICgpIHtcclxuICAgICAgICAgICAgcmVwbGFjZSh0aGlzLmVsLCB0aGlzLl9QbGEpXHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxufSIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IHl1ZXIgb24gMjAxNy81LzEzLlxyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKEVlbCkge1xyXG4gICAgRWVsLmRpcmVjdGl2ZXMoJ29uJywge1xyXG4gICAgICAgIGJpbmQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5lbC5hZGRFdmVudExpc3RlbmVyKHRoaXMuYXJnLCBlID0+IHRoaXMudm1bdGhpcy52YWxdLmNhbGwodGhpcy52bSwgZSkpXHJcbiAgICAgICAgICAgIC8vIHRoaXMuZWwudGV4dENvbnRlbnQgPSB0aGlzLmdldHRlcigpXHJcbiAgICAgICAgfSxcclxuICAgICAgICB1cGRhdGU6IGZ1bmN0aW9uICh2YWwsIG5ld1ZhbCkge1xyXG4gICAgICAgICAgICAvLyB0aGlzLmVsLnRleHRDb250ZW50ID0gbmV3VmFsXHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxufSIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IHl1ZXIgb24gMjAxNy81LzEzLlxyXG4gKi9cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKEVlbCkge1xyXG4gICAgRWVsLmRpcmVjdGl2ZXMoJ21vZGVsJywge1xyXG4gICAgICAgIGJpbmQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgbGV0IHZhbCA9IHRoaXMuZ2V0dGVyKClcclxuICAgICAgICAgICAgdGhpcy5lbC52YWx1ZSA9IHZhbFxyXG4gICAgICAgICAgICB0aGlzLmVsLmFkZEV2ZW50TGlzdGVuZXIoJ2lucHV0JywgZSA9PiB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnZtLiRzZXQodGhpcy52YWwsIGUudGFyZ2V0LnZhbHVlKVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAvLyB0aGlzLmVsLnRleHRDb250ZW50ID0gdGhpcy5nZXR0ZXIoKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdXBkYXRlOiBmdW5jdGlvbiAodmFsLCBuZXdWYWwpIHtcclxuICAgICAgICAgICAgdGhpcy5lbC52YWx1ZSA9IG5ld1ZhbFxyXG4gICAgICAgIH1cclxuICAgIH0pXHJcbn0iLCIvKipcclxuICogQ3JlYXRlZCBieSB5dWVyIG9uIDIwMTcvNS8xMi5cclxuICovXHJcbmltcG9ydCBWdGV4dCBmcm9tICcuL3RleHQnXHJcbmltcG9ydCBWaWYgZnJvbSAnLi9pZidcclxuaW1wb3J0IFZvbiBmcm9tICcuL29uJ1xyXG5pbXBvcnQgVm1vZGVsIGZyb20gJy4vbW9kZWwnXHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBpbnN0YWxsIChFZWwpIHtcclxuICAgIFZ0ZXh0KEVlbClcclxuICAgIFZpZihFZWwpXHJcbiAgICBWb24oRWVsKVxyXG4gICAgVm1vZGVsKEVlbClcclxufSIsIi8qKlxyXG4gKiBDcmVhdGVkIGJ5IHl1ZXIgb24gMjAxNy81LzEyLlxyXG4gKi9cclxuaW1wb3J0IGluc3RhbGwgZnJvbSAnLi4vZGlyZWN0aXZlcy9pbnRhbGwnXHJcbmltcG9ydCBkZWZhdWx0SW5zdGFsbERpcmVjdGl2ZXMgZnJvbSAnLi4vZGlyZWN0aXZlcy9kZWZhdWx0L2luZGV4J1xyXG5leHBvcnQgZnVuY3Rpb24gaW5pdERpcmVjdGl2ZXMgKHZtKSB7XHJcbiAgICB2bS5fX3Byb3RvX18uZGlyZWN0aXZlcyA9IGluc3RhbGxEaXJlY3RpdmVzXHJcbiAgICB2bS4kZGlyZWN0aXZlcyA9IHt9XHJcbiAgICBkZWZhdWx0SW5zdGFsbERpcmVjdGl2ZXModm0pXHJcbn1cclxuZnVuY3Rpb24gaW5zdGFsbERpcmVjdGl2ZXMgKG5hbWUsIGhvb2spIHtcclxuICAgIGxldCBkaXIgPSBpbnN0YWxsKG5hbWUsIGhvb2spXHJcbiAgICBpZiAodGhpcy4kZGlyZWN0aXZlc1tuYW1lXSkge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoYOW3sue7j+WtmOWcqCR7bmFtZX3mjIfku6RgKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0aGlzLiRkaXJlY3RpdmVzW25hbWVdID0gZGlyXHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpc1xyXG59IiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgeXVlciBvbiAyMDE3LzUvNi5cclxuICovXHJcbmltcG9ydCB7IGluaXRTdGF0ZSwgaW5pdFdhdGNoIH0gZnJvbSAnLi9zdGF0ZSdcclxuaW1wb3J0IHsgaW5pdENvbXBpbGVyIH0gZnJvbSAnLi9jb21waWxlcidcclxuaW1wb3J0IHsgaW5pdERpcmVjdGl2ZXMgfSBmcm9tICcuL2RpcmVjdGl2ZXMnXHJcbmV4cG9ydCBmdW5jdGlvbiBpbml0TWl4aW4gKEVlbCkge1xyXG4gICAgRWVsLnByb3RvdHlwZS5faW5pdCA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XHJcbiAgICAgICAgdGhpcy4kb3B0aW9uID0gb3B0aW9uc1xyXG4gICAgICAgIGluaXRTdGF0ZSh0aGlzKVxyXG4gICAgICAgIGluaXRXYXRjaCh0aGlzKVxyXG4gICAgICAgIGluaXREaXJlY3RpdmVzKHRoaXMpXHJcbiAgICAgICAgaW5pdENvbXBpbGVyKHRoaXMpXHJcbiAgICB9XHJcbn0iLCIvKipcclxuICogQ3JlYXRlZCBieSB5dWVyIG9uIDIwMTcvNS82LlxyXG4gKi9cclxuaW1wb3J0IHsgaW5pdE1peGluIH0gZnJvbSAnLi9pbml0J1xyXG5pbXBvcnQgeyBzdGF0ZU1peGluIH0gZnJvbSAnLi9zdGF0ZSdcclxuXHJcbmZ1bmN0aW9uIEVlbCAob3B0aW9ucykge1xyXG4gICAgaWYgKCF0aGlzIGluc3RhbmNlb2YgRWVsKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcignZXJyb3IgbmV3JylcclxuICAgIH1cclxuICAgIHRoaXMuX2luaXQob3B0aW9ucylcclxufVxyXG5pbml0TWl4aW4oRWVsKVxyXG5zdGF0ZU1peGluKEVlbClcclxuZXhwb3J0IGRlZmF1bHQgRWVsIiwiLyoqXHJcbiAqIENyZWF0ZWQgYnkgeXVlciBvbiAyMDE3LzUvNS5cclxuICovXHJcbmltcG9ydCBFZWwgZnJvbSAnLi9pbnN0YW5jZS9pbmRleCdcclxuXHJcbmV4cG9ydCBkZWZhdWx0IEVlbCJdLCJuYW1lcyI6WyJleHRlbmQiLCJ0byIsImZvcm0iLCJrZXlzIiwiZm9yRWFjaCIsImtleSIsInByb3h5IiwiZGVmaW5lUHJvcGVydHkiLCJ2YWwiLCJiYWlsUkUiLCJwYXJzZVBhdGgiLCJwYXRoIiwidGVzdCIsInNlZ21lbnRzIiwic3BsaXQiLCJvYmoiLCJpIiwibGVuZ3RoIiwic2V0RGF0YSIsIkRlcCIsInN1YnMiLCJzdWIiLCJwdXNoIiwidXBkYXRlIiwidGFyZ2V0IiwiYWRkRGVwIiwiV2F0Y2hlciIsInZtIiwiZXhwT3JGbiIsImNiIiwiZ2V0dGVyIiwiZ2V0IiwiZGVwIiwiYWRkU3ViIiwib2xkVmFsIiwiY2FsbCIsIk9ic2VydmVyIiwidmFsdWUiLCJ3YWxrIiwib2JzZXJ2ZSIsIm9iIiwiZGVmaW5lUmVhY3RpdmUiLCJ0eXBlIiwibyIsIk9iamVjdCIsImdldE93blByb3BlcnR5RGVzY3JpcHRvciIsImNoaWxkT2IiLCJkZXBlbmQiLCJzZXR0ZXIiLCJuZXdWYWwiLCJub3RpZnkiLCJzdGF0ZU1peGluIiwiRWVsIiwicHJvdG90eXBlIiwiJHdhdGNoIiwid2F0Y2hlciIsIl93YXRjaGVyIiwiJHNldCIsInNldCIsIiRnZXQiLCJpbml0U3RhdGUiLCJpbml0V2F0Y2giLCIkb3B0aW9uIiwid2F0Y2giLCJpbml0RGF0YSIsImRhdGEiLCJfZGF0YSIsIl9vYiIsImluaXRNZXRob2RzIiwibWV0aG9kIiwibWV0aG9kcyIsInJlcGxhY2UiLCJlbCIsInRhciIsIm5leHRTaWJsaW5nIiwicGFyZW50Tm9kZSIsImluc2VydEJlZm9yZSIsImFwcGVuZENoaWxkIiwicmVtb3ZlQ2hpbGQiLCJwYXJzZURvbSIsImFyZyIsImRvbSIsIm9iakUiLCJkb2N1bWVudCIsImNyZWF0ZUVsZW1lbnQiLCJpbm5lckhUTUwiLCJjaGlsZE5vZGVzIiwidGV4dENvbnRlbnQiLCJ0cmltIiwiYmVmb3JlIiwicmVtb3ZlIiwiRGlyZWN0aXZlcyIsIm5hbWUiLCJ0ZXh0IiwiX25hbWUiLCJtb2RpZmllcnMiLCJjb21waWxlIiwiJGRpcmVjdGl2ZXMiLCJfaW5pdCIsInRhZyIsImFyZ1JFIiwiZXhlYyIsInRhZ3MiLCJzbGljZSIsImluZGV4IiwidCIsInJlbW92ZUF0dHJpYnV0ZSIsImJpbmQiLCJsaXRlcmFsIiwiZGVmYXVsdFRhZ1JFIiwiZGlyZWN0aXZlc1JFIiwiZGlyUkVNIiwicGFyc2VIVE1MIiwiZnJhZ21lbnQiLCJjcmVhdGVEb2N1bWVudEZyYWdtZW50IiwidHBsIiwiJHJvb3QiLCIkdGVtcGxhdGUiLCJBcnJheSIsImVycm9yIiwiX2NvbXBpbGVOb2RlIiwiJGVsIiwiY29tcGlsZU5vZGUiLCJodG1sIiwibm9kZVR5cGUiLCJfY29tcGlsZURvbU5vZGUiLCJfY29tcGlsZVRleHROb2RlIiwiY29tcGlsZURpciIsImF0dHIiLCJub2RlVmFsdWUiLCJjb21waWxlRG9tTm9kZSIsImF0dHJpYnV0ZXMiLCJfY29tcGlsZURpciIsImZyb20iLCJjb21waWxlVGV4dE5vZGUiLCJwYXJzZSIsImNyZWF0ZVRleHROb2RlIiwibWF0Y2giLCJsYXN0aW5kZXgiLCJsYXN0IiwiaW5pdENvbXBpbGVyIiwicXVlcnlTZWxlY3RvciIsIiR0cGxEb20iLCJ0ZW1wbGF0ZSIsIl9fcHJvdG9fXyIsIl9wYXJzZUhUTUwiLCJpbnN0YWxsIiwiaG9vayIsImRpciIsImRpcmVjdGl2ZXMiLCJQbGEiLCJfUGxhIiwiY3JlYXRlQ29tbWVudCIsIl9lbCIsImhpZGUiLCJzaG93IiwiYWRkRXZlbnRMaXN0ZW5lciIsImUiLCJpbml0RGlyZWN0aXZlcyIsImluc3RhbGxEaXJlY3RpdmVzIiwiaW5pdE1peGluIiwib3B0aW9ucyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQTs7O0FBR0EsQUFBTyxTQUFTQSxNQUFULENBQWlCQyxFQUFqQixFQUFxQkMsSUFBckIsRUFBMkI7V0FDdkJDLElBQVAsQ0FBWUQsSUFBWixFQUFrQkUsT0FBbEIsQ0FBMEIsZUFBTztXQUMxQkMsR0FBSCxJQUFVSCxLQUFLRyxHQUFMLENBQVY7S0FESjs7O0FBS0osQUFBTyxTQUFTQyxLQUFULENBQWdCTCxFQUFoQixFQUFvQkMsSUFBcEIsRUFBMEI7V0FDdEJDLElBQVAsQ0FBWUQsSUFBWixFQUNLRSxPQURMLENBQ2EsZUFBTztlQUNMRyxjQUFQLENBQXNCTixFQUF0QixFQUEwQkksR0FBMUIsRUFBK0I7MEJBQ2IsSUFEYTt3QkFFZixJQUZlO2lCQUd0Qjt1QkFBTUgsS0FBS0csR0FBTCxDQUFOO2FBSHNCO2lCQUl0QixhQUFDRyxHQUFEO3VCQUFTTixLQUFLRyxHQUFMLElBQVlHLEdBQXJCOztTQUpUO0tBRlI7Ozs7Ozs7QUFlSixJQUFNQyxTQUFTLFNBQWY7QUFDQSxBQUFPLFNBQVNDLFNBQVQsQ0FBb0JDLElBQXBCLEVB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
