'use strict';
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
/**
 * @license Angular v<unknown>
 * (c) 2010-2022 Google LLC. https://angular.io/
 * License: MIT
 */
(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
        factory();
})((function () {
    'use strict';
    ((function (global) {
        var _this = this;
        var _a;
        var performance = global['performance'];
        function mark(name) {
            performance && performance['mark'] && performance['mark'](name);
        }
        function performanceMeasure(name, label) {
            performance && performance['measure'] && performance['measure'](name, label);
        }
        mark('Zone');
        // Initialize before it's accessed below.
        // __Zone_symbol_prefix global can be used to override the default zone
        // symbol prefix with a custom one if needed.
        var symbolPrefix = global['__Zone_symbol_prefix'] || '__zone_symbol__';
        function __symbol__(name) {
            return symbolPrefix + name;
        }
        var checkDuplicate = global[__symbol__('forceDuplicateZoneCheck')] === true;
        if (global['Zone']) {
            // if global['Zone'] already exists (maybe zone.js was already loaded or
            // some other lib also registered a global object named Zone), we may need
            // to throw an error, but sometimes user may not want this error.
            // For example,
            // we have two web pages, page1 includes zone.js, page2 doesn't.
            // and the 1st time user load page1 and page2, everything work fine,
            // but when user load page2 again, error occurs because global['Zone'] already exists.
            // so we add a flag to let user choose whether to throw this error or not.
            // By default, if existing Zone is from zone.js, we will not throw the error.
            if (checkDuplicate || typeof global['Zone'].__symbol__ !== 'function') {
                throw new Error('Zone already loaded.');
            }
            else {
                return global['Zone'];
            }
        }
        var Zone = /** @class */ (function () {
            function Zone(parent, zoneSpec) {
                this._parent = parent;
                this._name = zoneSpec ? zoneSpec.name || 'unnamed' : '<root>';
                this._properties = zoneSpec && zoneSpec.properties || {};
                this._zoneDelegate =
                    new _ZoneDelegate(this, this._parent && this._parent._zoneDelegate, zoneSpec);
            }
            Zone.assertZonePatched = function () {
                if (global['Promise'] !== patches['ZoneAwarePromise']) {
                    throw new Error('Zone.js has detected that ZoneAwarePromise `(window|global).Promise` ' +
                        'has been overwritten.\n' +
                        'Most likely cause is that a Promise polyfill has been loaded ' +
                        'after Zone.js (Polyfilling Promise api is not necessary when zone.js is loaded. ' +
                        'If you must load one, do so before loading zone.js.)');
                }
            };
            Object.defineProperty(Zone, "root", {
                get: function () {
                    var zone = Zone.current;
                    while (zone.parent) {
                        zone = zone.parent;
                    }
                    return zone;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(Zone, "current", {
                get: function () {
                    return _currentZoneFrame.zone;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(Zone, "currentTask", {
                get: function () {
                    return _currentTask;
                },
                enumerable: false,
                configurable: true
            });
            // tslint:disable-next-line:require-internal-with-underscore
            Zone.__load_patch = function (name, fn, ignoreDuplicate) {
                if (ignoreDuplicate === void 0) { ignoreDuplicate = false; }
                if (patches.hasOwnProperty(name)) {
                    // `checkDuplicate` option is defined from global variable
                    // so it works for all modules.
                    // `ignoreDuplicate` can work for the specified module
                    if (!ignoreDuplicate && checkDuplicate) {
                        throw Error('Already loaded patch: ' + name);
                    }
                }
                else if (!global['__Zone_disable_' + name]) {
                    var perfName = 'Zone:' + name;
                    mark(perfName);
                    patches[name] = fn(global, Zone, _api);
                    performanceMeasure(perfName, perfName);
                }
            };
            Object.defineProperty(Zone.prototype, "parent", {
                get: function () {
                    return this._parent;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(Zone.prototype, "name", {
                get: function () {
                    return this._name;
                },
                enumerable: false,
                configurable: true
            });
            Zone.prototype.get = function (key) {
                var zone = this.getZoneWith(key);
                if (zone)
                    return zone._properties[key];
            };
            Zone.prototype.getZoneWith = function (key) {
                var current = this;
                while (current) {
                    if (current._properties.hasOwnProperty(key)) {
                        return current;
                    }
                    current = current._parent;
                }
                return null;
            };
            Zone.prototype.fork = function (zoneSpec) {
                if (!zoneSpec)
                    throw new Error('ZoneSpec required!');
                return this._zoneDelegate.fork(this, zoneSpec);
            };
            Zone.prototype.wrap = function (callback, source) {
                if (typeof callback !== 'function') {
                    throw new Error('Expecting function got: ' + callback);
                }
                var _callback = this._zoneDelegate.intercept(this, callback, source);
                var zone = this;
                return function () {
                    return zone.runGuarded(_callback, this, arguments, source);
                };
            };
            Zone.prototype.run = function (callback, applyThis, applyArgs, source) {
                _currentZoneFrame = { parent: _currentZoneFrame, zone: this };
                try {
                    return this._zoneDelegate.invoke(this, callback, applyThis, applyArgs, source);
                }
                finally {
                    _currentZoneFrame = _currentZoneFrame.parent;
                }
            };
            Zone.prototype.runGuarded = function (callback, applyThis, applyArgs, source) {
                if (applyThis === void 0) { applyThis = null; }
                _currentZoneFrame = { parent: _currentZoneFrame, zone: this };
                try {
                    try {
                        return this._zoneDelegate.invoke(this, callback, applyThis, applyArgs, source);
                    }
                    catch (error) {
                        if (this._zoneDelegate.handleError(this, error)) {
                            throw error;
                        }
                    }
                }
                finally {
                    _currentZoneFrame = _currentZoneFrame.parent;
                }
            };
            Zone.prototype.runTask = function (task, applyThis, applyArgs) {
                if (task.zone != this) {
                    throw new Error('A task can only be run in the zone of creation! (Creation: ' +
                        (task.zone || NO_ZONE).name + '; Execution: ' + this.name + ')');
                }
                // https://github.com/angular/zone.js/issues/778, sometimes eventTask
                // will run in notScheduled(canceled) state, we should not try to
                // run such kind of task but just return
                if (task.state === notScheduled && (task.type === eventTask || task.type === macroTask)) {
                    return;
                }
                var reEntryGuard = task.state != running;
                reEntryGuard && task._transitionTo(running, scheduled);
                task.runCount++;
                var previousTask = _currentTask;
                _currentTask = task;
                _currentZoneFrame = { parent: _currentZoneFrame, zone: this };
                try {
                    if (task.type == macroTask && task.data && !task.data.isPeriodic) {
                        task.cancelFn = undefined;
                    }
                    try {
                        return this._zoneDelegate.invokeTask(this, task, applyThis, applyArgs);
                    }
                    catch (error) {
                        if (this._zoneDelegate.handleError(this, error)) {
                            throw error;
                        }
                    }
                }
                finally {
                    // if the task's state is notScheduled or unknown, then it has already been cancelled
                    // we should not reset the state to scheduled
                    if (task.state !== notScheduled && task.state !== unknown) {
                        if (task.type == eventTask || (task.data && task.data.isPeriodic)) {
                            reEntryGuard && task._transitionTo(scheduled, running);
                        }
                        else {
                            task.runCount = 0;
                            this._updateTaskCount(task, -1);
                            reEntryGuard &&
                                task._transitionTo(notScheduled, running, notScheduled);
                        }
                    }
                    _currentZoneFrame = _currentZoneFrame.parent;
                    _currentTask = previousTask;
                }
            };
            Zone.prototype.scheduleTask = function (task) {
                if (task.zone && task.zone !== this) {
                    // check if the task was rescheduled, the newZone
                    // should not be the children of the original zone
                    var newZone = this;
                    while (newZone) {
                        if (newZone === task.zone) {
                            throw Error("can not reschedule task to ".concat(this.name, " which is descendants of the original zone ").concat(task.zone.name));
                        }
                        newZone = newZone.parent;
                    }
                }
                task._transitionTo(scheduling, notScheduled);
                var zoneDelegates = [];
                task._zoneDelegates = zoneDelegates;
                task._zone = this;
                try {
                    task = this._zoneDelegate.scheduleTask(this, task);
                }
                catch (err) {
                    // should set task's state to unknown when scheduleTask throw error
                    // because the err may from reschedule, so the fromState maybe notScheduled
                    task._transitionTo(unknown, scheduling, notScheduled);
                    // TODO: @JiaLiPassion, should we check the result from handleError?
                    this._zoneDelegate.handleError(this, err);
                    throw err;
                }
                if (task._zoneDelegates === zoneDelegates) {
                    // we have to check because internally the delegate can reschedule the task.
                    this._updateTaskCount(task, 1);
                }
                if (task.state == scheduling) {
                    task._transitionTo(scheduled, scheduling);
                }
                return task;
            };
            Zone.prototype.scheduleMicroTask = function (source, callback, data, customSchedule) {
                return this.scheduleTask(new ZoneTask(microTask, source, callback, data, customSchedule, undefined));
            };
            Zone.prototype.scheduleMacroTask = function (source, callback, data, customSchedule, customCancel) {
                return this.scheduleTask(new ZoneTask(macroTask, source, callback, data, customSchedule, customCancel));
            };
            Zone.prototype.scheduleEventTask = function (source, callback, data, customSchedule, customCancel) {
                return this.scheduleTask(new ZoneTask(eventTask, source, callback, data, customSchedule, customCancel));
            };
            Zone.prototype.cancelTask = function (task) {
                if (task.zone != this)
                    throw new Error('A task can only be cancelled in the zone of creation! (Creation: ' +
                        (task.zone || NO_ZONE).name + '; Execution: ' + this.name + ')');
                if (task.state !== scheduled && task.state !== running) {
                    return;
                }
                task._transitionTo(canceling, scheduled, running);
                try {
                    this._zoneDelegate.cancelTask(this, task);
                }
                catch (err) {
                    // if error occurs when cancelTask, transit the state to unknown
                    task._transitionTo(unknown, canceling);
                    this._zoneDelegate.handleError(this, err);
                    throw err;
                }
                this._updateTaskCount(task, -1);
                task._transitionTo(notScheduled, canceling);
                task.runCount = 0;
                return task;
            };
            Zone.prototype._updateTaskCount = function (task, count) {
                var zoneDelegates = task._zoneDelegates;
                if (count == -1) {
                    task._zoneDelegates = null;
                }
                for (var i = 0; i < zoneDelegates.length; i++) {
                    zoneDelegates[i]._updateTaskCount(task.type, count);
                }
            };
            return Zone;
        }());
        _a = Zone;
        // tslint:disable-next-line:require-internal-with-underscore
        (function () {
            _a.__symbol__ = __symbol__;
        })();
        var DELEGATE_ZS = {
            name: '',
            onHasTask: function (delegate, _, target, hasTaskState) { return delegate.hasTask(target, hasTaskState); },
            onScheduleTask: function (delegate, _, target, task) { return delegate.scheduleTask(target, task); },
            onInvokeTask: function (delegate, _, target, task, applyThis, applyArgs) { return delegate.invokeTask(target, task, applyThis, applyArgs); },
            onCancelTask: function (delegate, _, target, task) { return delegate.cancelTask(target, task); }
        };
        var _ZoneDelegate = /** @class */ (function () {
            function _ZoneDelegate(zone, parentDelegate, zoneSpec) {
                this._taskCounts = { 'microTask': 0, 'macroTask': 0, 'eventTask': 0 };
                this.zone = zone;
                this._parentDelegate = parentDelegate;
                this._forkZS = zoneSpec && (zoneSpec && zoneSpec.onFork ? zoneSpec : parentDelegate._forkZS);
                this._forkDlgt = zoneSpec && (zoneSpec.onFork ? parentDelegate : parentDelegate._forkDlgt);
                this._forkCurrZone =
                    zoneSpec && (zoneSpec.onFork ? this.zone : parentDelegate._forkCurrZone);
                this._interceptZS =
                    zoneSpec && (zoneSpec.onIntercept ? zoneSpec : parentDelegate._interceptZS);
                this._interceptDlgt =
                    zoneSpec && (zoneSpec.onIntercept ? parentDelegate : parentDelegate._interceptDlgt);
                this._interceptCurrZone =
                    zoneSpec && (zoneSpec.onIntercept ? this.zone : parentDelegate._interceptCurrZone);
                this._invokeZS = zoneSpec && (zoneSpec.onInvoke ? zoneSpec : parentDelegate._invokeZS);
                this._invokeDlgt =
                    zoneSpec && (zoneSpec.onInvoke ? parentDelegate : parentDelegate._invokeDlgt);
                this._invokeCurrZone =
                    zoneSpec && (zoneSpec.onInvoke ? this.zone : parentDelegate._invokeCurrZone);
                this._handleErrorZS =
                    zoneSpec && (zoneSpec.onHandleError ? zoneSpec : parentDelegate._handleErrorZS);
                this._handleErrorDlgt =
                    zoneSpec && (zoneSpec.onHandleError ? parentDelegate : parentDelegate._handleErrorDlgt);
                this._handleErrorCurrZone =
                    zoneSpec && (zoneSpec.onHandleError ? this.zone : parentDelegate._handleErrorCurrZone);
                this._scheduleTaskZS =
                    zoneSpec && (zoneSpec.onScheduleTask ? zoneSpec : parentDelegate._scheduleTaskZS);
                this._scheduleTaskDlgt = zoneSpec &&
                    (zoneSpec.onScheduleTask ? parentDelegate : parentDelegate._scheduleTaskDlgt);
                this._scheduleTaskCurrZone =
                    zoneSpec && (zoneSpec.onScheduleTask ? this.zone : parentDelegate._scheduleTaskCurrZone);
                this._invokeTaskZS =
                    zoneSpec && (zoneSpec.onInvokeTask ? zoneSpec : parentDelegate._invokeTaskZS);
                this._invokeTaskDlgt =
                    zoneSpec && (zoneSpec.onInvokeTask ? parentDelegate : parentDelegate._invokeTaskDlgt);
                this._invokeTaskCurrZone =
                    zoneSpec && (zoneSpec.onInvokeTask ? this.zone : parentDelegate._invokeTaskCurrZone);
                this._cancelTaskZS =
                    zoneSpec && (zoneSpec.onCancelTask ? zoneSpec : parentDelegate._cancelTaskZS);
                this._cancelTaskDlgt =
                    zoneSpec && (zoneSpec.onCancelTask ? parentDelegate : parentDelegate._cancelTaskDlgt);
                this._cancelTaskCurrZone =
                    zoneSpec && (zoneSpec.onCancelTask ? this.zone : parentDelegate._cancelTaskCurrZone);
                this._hasTaskZS = null;
                this._hasTaskDlgt = null;
                this._hasTaskDlgtOwner = null;
                this._hasTaskCurrZone = null;
                var zoneSpecHasTask = zoneSpec && zoneSpec.onHasTask;
                var parentHasTask = parentDelegate && parentDelegate._hasTaskZS;
                if (zoneSpecHasTask || parentHasTask) {
                    // If we need to report hasTask, than this ZS needs to do ref counting on tasks. In such
                    // a case all task related interceptors must go through this ZD. We can't short circuit it.
                    this._hasTaskZS = zoneSpecHasTask ? zoneSpec : DELEGATE_ZS;
                    this._hasTaskDlgt = parentDelegate;
                    this._hasTaskDlgtOwner = this;
                    this._hasTaskCurrZone = zone;
                    if (!zoneSpec.onScheduleTask) {
                        this._scheduleTaskZS = DELEGATE_ZS;
                        this._scheduleTaskDlgt = parentDelegate;
                        this._scheduleTaskCurrZone = this.zone;
                    }
                    if (!zoneSpec.onInvokeTask) {
                        this._invokeTaskZS = DELEGATE_ZS;
                        this._invokeTaskDlgt = parentDelegate;
                        this._invokeTaskCurrZone = this.zone;
                    }
                    if (!zoneSpec.onCancelTask) {
                        this._cancelTaskZS = DELEGATE_ZS;
                        this._cancelTaskDlgt = parentDelegate;
                        this._cancelTaskCurrZone = this.zone;
                    }
                }
            }
            _ZoneDelegate.prototype.fork = function (targetZone, zoneSpec) {
                return this._forkZS ? this._forkZS.onFork(this._forkDlgt, this.zone, targetZone, zoneSpec) :
                    new Zone(targetZone, zoneSpec);
            };
            _ZoneDelegate.prototype.intercept = function (targetZone, callback, source) {
                return this._interceptZS ?
                    this._interceptZS.onIntercept(this._interceptDlgt, this._interceptCurrZone, targetZone, callback, source) :
                    callback;
            };
            _ZoneDelegate.prototype.invoke = function (targetZone, callback, applyThis, applyArgs, source) {
                return this._invokeZS ? this._invokeZS.onInvoke(this._invokeDlgt, this._invokeCurrZone, targetZone, callback, applyThis, applyArgs, source) :
                    callback.apply(applyThis, applyArgs);
            };
            _ZoneDelegate.prototype.handleError = function (targetZone, error) {
                return this._handleErrorZS ?
                    this._handleErrorZS.onHandleError(this._handleErrorDlgt, this._handleErrorCurrZone, targetZone, error) :
                    true;
            };
            _ZoneDelegate.prototype.scheduleTask = function (targetZone, task) {
                var returnTask = task;
                if (this._scheduleTaskZS) {
                    if (this._hasTaskZS) {
                        returnTask._zoneDelegates.push(this._hasTaskDlgtOwner);
                    }
                    // clang-format off
                    returnTask = this._scheduleTaskZS.onScheduleTask(this._scheduleTaskDlgt, this._scheduleTaskCurrZone, targetZone, task);
                    // clang-format on
                    if (!returnTask)
                        returnTask = task;
                }
                else {
                    if (task.scheduleFn) {
                        task.scheduleFn(task);
                    }
                    else if (task.type == microTask) {
                        scheduleMicroTask(task);
                    }
                    else {
                        throw new Error('Task is missing scheduleFn.');
                    }
                }
                return returnTask;
            };
            _ZoneDelegate.prototype.invokeTask = function (targetZone, task, applyThis, applyArgs) {
                return this._invokeTaskZS ? this._invokeTaskZS.onInvokeTask(this._invokeTaskDlgt, this._invokeTaskCurrZone, targetZone, task, applyThis, applyArgs) :
                    task.callback.apply(applyThis, applyArgs);
            };
            _ZoneDelegate.prototype.cancelTask = function (targetZone, task) {
                var value;
                if (this._cancelTaskZS) {
                    value = this._cancelTaskZS.onCancelTask(this._cancelTaskDlgt, this._cancelTaskCurrZone, targetZone, task);
                }
                else {
                    if (!task.cancelFn) {
                        throw Error('Task is not cancelable');
                    }
                    value = task.cancelFn(task);
                }
                return value;
            };
            _ZoneDelegate.prototype.hasTask = function (targetZone, isEmpty) {
                // hasTask should not throw error so other ZoneDelegate
                // can still trigger hasTask callback
                try {
                    this._hasTaskZS &&
                        this._hasTaskZS.onHasTask(this._hasTaskDlgt, this._hasTaskCurrZone, targetZone, isEmpty);
                }
                catch (err) {
                    this.handleError(targetZone, err);
                }
            };
            // tslint:disable-next-line:require-internal-with-underscore
            _ZoneDelegate.prototype._updateTaskCount = function (type, count) {
                var counts = this._taskCounts;
                var prev = counts[type];
                var next = counts[type] = prev + count;
                if (next < 0) {
                    throw new Error('More tasks executed then were scheduled.');
                }
                if (prev == 0 || next == 0) {
                    var isEmpty = {
                        microTask: counts['microTask'] > 0,
                        macroTask: counts['macroTask'] > 0,
                        eventTask: counts['eventTask'] > 0,
                        change: type
                    };
                    this.hasTask(this.zone, isEmpty);
                }
            };
            return _ZoneDelegate;
        }());
        var ZoneTask = /** @class */ (function () {
            function ZoneTask(type, source, callback, options, scheduleFn, cancelFn) {
                // tslint:disable-next-line:require-internal-with-underscore
                this._zone = null;
                this.runCount = 0;
                // tslint:disable-next-line:require-internal-with-underscore
                this._zoneDelegates = null;
                // tslint:disable-next-line:require-internal-with-underscore
                this._state = 'notScheduled';
                this.type = type;
                this.source = source;
                this.data = options;
                this.scheduleFn = scheduleFn;
                this.cancelFn = cancelFn;
                if (!callback) {
                    throw new Error('callback is not defined');
                }
                this.callback = callback;
                var self = this;
                // TODO: @JiaLiPassion options should have interface
                if (type === eventTask && options && options.useG) {
                    this.invoke = ZoneTask.invokeTask;
                }
                else {
                    this.invoke = function () {
                        return ZoneTask.invokeTask.call(global, self, this, arguments);
                    };
                }
            }
            ZoneTask.invokeTask = function (task, target, args) {
                if (!task) {
                    task = this;
                }
                _numberOfNestedTaskFrames++;
                try {
                    task.runCount++;
                    return task.zone.runTask(task, target, args);
                }
                finally {
                    if (_numberOfNestedTaskFrames == 1) {
                        drainMicroTaskQueue();
                    }
                    _numberOfNestedTaskFrames--;
                }
            };
            Object.defineProperty(ZoneTask.prototype, "zone", {
                get: function () {
                    return this._zone;
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ZoneTask.prototype, "state", {
                get: function () {
                    return this._state;
                },
                enumerable: false,
                configurable: true
            });
            ZoneTask.prototype.cancelScheduleRequest = function () {
                this._transitionTo(notScheduled, scheduling);
            };
            // tslint:disable-next-line:require-internal-with-underscore
            ZoneTask.prototype._transitionTo = function (toState, fromState1, fromState2) {
                if (this._state === fromState1 || this._state === fromState2) {
                    this._state = toState;
                    if (toState == notScheduled) {
                        this._zoneDelegates = null;
                    }
                }
                else {
                    throw new Error("".concat(this.type, " '").concat(this.source, "': can not transition to '").concat(toState, "', expecting state '").concat(fromState1, "'").concat(fromState2 ? ' or \'' + fromState2 + '\'' : '', ", was '").concat(this._state, "'."));
                }
            };
            ZoneTask.prototype.toString = function () {
                if (this.data && typeof this.data.handleId !== 'undefined') {
                    return this.data.handleId.toString();
                }
                else {
                    return Object.prototype.toString.call(this);
                }
            };
            // add toJSON method to prevent cyclic error when
            // call JSON.stringify(zoneTask)
            ZoneTask.prototype.toJSON = function () {
                return {
                    type: this.type,
                    state: this.state,
                    source: this.source,
                    zone: this.zone.name,
                    runCount: this.runCount
                };
            };
            return ZoneTask;
        }());
        //////////////////////////////////////////////////////
        //////////////////////////////////////////////////////
        ///  MICROTASK QUEUE
        //////////////////////////////////////////////////////
        //////////////////////////////////////////////////////
        var symbolSetTimeout = __symbol__('setTimeout');
        var symbolPromise = __symbol__('Promise');
        var symbolThen = __symbol__('then');
        var _microTaskQueue = [];
        var _isDrainingMicrotaskQueue = false;
        var nativeMicroTaskQueuePromise;
        function nativeScheduleMicroTask(func) {
            if (!nativeMicroTaskQueuePromise) {
                if (global[symbolPromise]) {
                    nativeMicroTaskQueuePromise = global[symbolPromise].resolve(0);
                }
            }
            if (nativeMicroTaskQueuePromise) {
                var nativeThen = nativeMicroTaskQueuePromise[symbolThen];
                if (!nativeThen) {
                    // native Promise is not patchable, we need to use `then` directly
                    // issue 1078
                    nativeThen = nativeMicroTaskQueuePromise['then'];
                }
                nativeThen.call(nativeMicroTaskQueuePromise, func);
            }
            else {
                global[symbolSetTimeout](func, 0);
            }
        }
        function scheduleMicroTask(task) {
            // if we are not running in any task, and there has not been anything scheduled
            // we must bootstrap the initial task creation by manually scheduling the drain
            if (_numberOfNestedTaskFrames === 0 && _microTaskQueue.length === 0) {
                // We are not running in Task, so we need to kickstart the microtask queue.
                nativeScheduleMicroTask(drainMicroTaskQueue);
            }
            task && _microTaskQueue.push(task);
        }
        function drainMicroTaskQueue() {
            if (!_isDrainingMicrotaskQueue) {
                _isDrainingMicrotaskQueue = true;
                while (_microTaskQueue.length) {
                    var queue = _microTaskQueue;
                    _microTaskQueue = [];
                    for (var i = 0; i < queue.length; i++) {
                        var task = queue[i];
                        try {
                            task.zone.runTask(task, null, null);
                        }
                        catch (error) {
                            _api.onUnhandledError(error);
                        }
                    }
                }
                _api.microtaskDrainDone();
                _isDrainingMicrotaskQueue = false;
            }
        }
        //////////////////////////////////////////////////////
        //////////////////////////////////////////////////////
        ///  BOOTSTRAP
        //////////////////////////////////////////////////////
        //////////////////////////////////////////////////////
        var NO_ZONE = { name: 'NO ZONE' };
        var notScheduled = 'notScheduled', scheduling = 'scheduling', scheduled = 'scheduled', running = 'running', canceling = 'canceling', unknown = 'unknown';
        var microTask = 'microTask', macroTask = 'macroTask', eventTask = 'eventTask';
        var patches = {};
        var _api = {
            symbol: __symbol__,
            currentZoneFrame: function () { return _currentZoneFrame; },
            onUnhandledError: noop,
            microtaskDrainDone: noop,
            scheduleMicroTask: scheduleMicroTask,
            showUncaughtError: function () { return !Zone[__symbol__('ignoreConsoleErrorUncaughtError')]; },
            patchEventTarget: function () { return []; },
            patchOnProperties: noop,
            patchMethod: function () { return noop; },
            bindArguments: function () { return []; },
            patchThen: function () { return noop; },
            patchMacroTask: function () { return noop; },
            patchEventPrototype: function () { return noop; },
            isIEOrEdge: function () { return false; },
            getGlobalObjects: function () { return undefined; },
            ObjectDefineProperty: function () { return noop; },
            ObjectGetOwnPropertyDescriptor: function () { return undefined; },
            ObjectCreate: function () { return undefined; },
            ArraySlice: function () { return []; },
            patchClass: function () { return noop; },
            wrapWithCurrentZone: function () { return noop; },
            filterProperties: function () { return []; },
            attachOriginToPatched: function () { return noop; },
            _redefineProperty: function () { return noop; },
            patchCallbacks: function () { return noop; },
            nativeScheduleMicroTask: nativeScheduleMicroTask
        };
        var _currentZoneFrame = { parent: null, zone: new Zone(null, null) };
        var _currentTask = null;
        var _numberOfNestedTaskFrames = 0;
        function noop() { }
        performanceMeasure('Zone', 'Zone');
        return global['Zone'] = Zone;
    }))(typeof window !== 'undefined' && window || typeof self !== 'undefined' && self || global);
    /**
     * Suppress closure compiler errors about unknown 'Zone' variable
     * @fileoverview
     * @suppress {undefinedVars,globalThis,missingRequire}
     */
    /// <reference types="node"/>
    // issue #989, to reduce bundle size, use short name
    /** Object.getOwnPropertyDescriptor */
    var ObjectGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
    /** Object.defineProperty */
    var ObjectDefineProperty = Object.defineProperty;
    /** Object.getPrototypeOf */
    var ObjectGetPrototypeOf = Object.getPrototypeOf;
    /** Object.create */
    var ObjectCreate = Object.create;
    /** Array.prototype.slice */
    var ArraySlice = Array.prototype.slice;
    /** addEventListener string const */
    var ADD_EVENT_LISTENER_STR = 'addEventListener';
    /** removeEventListener string const */
    var REMOVE_EVENT_LISTENER_STR = 'removeEventListener';
    /** zoneSymbol addEventListener */
    var ZONE_SYMBOL_ADD_EVENT_LISTENER = Zone.__symbol__(ADD_EVENT_LISTENER_STR);
    /** zoneSymbol removeEventListener */
    var ZONE_SYMBOL_REMOVE_EVENT_LISTENER = Zone.__symbol__(REMOVE_EVENT_LISTENER_STR);
    /** true string const */
    var TRUE_STR = 'true';
    /** false string const */
    var FALSE_STR = 'false';
    /** Zone symbol prefix string const. */
    var ZONE_SYMBOL_PREFIX = Zone.__symbol__('');
    function wrapWithCurrentZone(callback, source) {
        return Zone.current.wrap(callback, source);
    }
    function scheduleMacroTaskWithCurrentZone(source, callback, data, customSchedule, customCancel) {
        return Zone.current.scheduleMacroTask(source, callback, data, customSchedule, customCancel);
    }
    var zoneSymbol = Zone.__symbol__;
    var isWindowExists = typeof window !== 'undefined';
    var internalWindow = isWindowExists ? window : undefined;
    var _global = isWindowExists && internalWindow || typeof self === 'object' && self || global;
    var REMOVE_ATTRIBUTE = 'removeAttribute';
    function bindArguments(args, source) {
        for (var i = args.length - 1; i >= 0; i--) {
            if (typeof args[i] === 'function') {
                args[i] = wrapWithCurrentZone(args[i], source + '_' + i);
            }
        }
        return args;
    }
    function patchPrototype(prototype, fnNames) {
        var source = prototype.constructor['name'];
        var _loop_1 = function (i) {
            var name_1 = fnNames[i];
            var delegate = prototype[name_1];
            if (delegate) {
                var prototypeDesc = ObjectGetOwnPropertyDescriptor(prototype, name_1);
                if (!isPropertyWritable(prototypeDesc)) {
                    return "continue";
                }
                prototype[name_1] = (function (delegate) {
                    var patched = function () {
                        return delegate.apply(this, bindArguments(arguments, source + '.' + name_1));
                    };
                    attachOriginToPatched(patched, delegate);
                    return patched;
                })(delegate);
            }
        };
        for (var i = 0; i < fnNames.length; i++) {
            _loop_1(i);
        }
    }
    function isPropertyWritable(propertyDesc) {
        if (!propertyDesc) {
            return true;
        }
        if (propertyDesc.writable === false) {
            return false;
        }
        return !(typeof propertyDesc.get === 'function' && typeof propertyDesc.set === 'undefined');
    }
    var isWebWorker = (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope);
    // Make sure to access `process` through `_global` so that WebPack does not accidentally browserify
    // this code.
    var isNode = (!('nw' in _global) && typeof _global.process !== 'undefined' &&
        {}.toString.call(_global.process) === '[object process]');
    var isBrowser = !isNode && !isWebWorker && !!(isWindowExists && internalWindow['HTMLElement']);
    // we are in electron of nw, so we are both browser and nodejs
    // Make sure to access `process` through `_global` so that WebPack does not accidentally browserify
    // this code.
    var isMix = typeof _global.process !== 'undefined' &&
        {}.toString.call(_global.process) === '[object process]' && !isWebWorker &&
        !!(isWindowExists && internalWindow['HTMLElement']);
    var zoneSymbolEventNames$1 = {};
    var wrapFn = function (event) {
        // https://github.com/angular/zone.js/issues/911, in IE, sometimes
        // event will be undefined, so we need to use window.event
        event = event || _global.event;
        if (!event) {
            return;
        }
        var eventNameSymbol = zoneSymbolEventNames$1[event.type];
        if (!eventNameSymbol) {
            eventNameSymbol = zoneSymbolEventNames$1[event.type] = zoneSymbol('ON_PROPERTY' + event.type);
        }
        var target = this || event.target || _global;
        var listener = target[eventNameSymbol];
        var result;
        if (isBrowser && target === internalWindow && event.type === 'error') {
            // window.onerror have different signature
            // https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onerror#window.onerror
            // and onerror callback will prevent default when callback return true
            var errorEvent = event;
            result = listener &&
                listener.call(this, errorEvent.message, errorEvent.filename, errorEvent.lineno, errorEvent.colno, errorEvent.error);
            if (result === true) {
                event.preventDefault();
            }
        }
        else {
            result = listener && listener.apply(this, arguments);
            if (result != undefined && !result) {
                event.preventDefault();
            }
        }
        return result;
    };
    function patchProperty(obj, prop, prototype) {
        var desc = ObjectGetOwnPropertyDescriptor(obj, prop);
        if (!desc && prototype) {
            // when patch window object, use prototype to check prop exist or not
            var prototypeDesc = ObjectGetOwnPropertyDescriptor(prototype, prop);
            if (prototypeDesc) {
                desc = { enumerable: true, configurable: true };
            }
        }
        // if the descriptor not exists or is not configurable
        // just return
        if (!desc || !desc.configurable) {
            return;
        }
        var onPropPatchedSymbol = zoneSymbol('on' + prop + 'patched');
        if (obj.hasOwnProperty(onPropPatchedSymbol) && obj[onPropPatchedSymbol]) {
            return;
        }
        // A property descriptor cannot have getter/setter and be writable
        // deleting the writable and value properties avoids this error:
        //
        // TypeError: property descriptors must not specify a value or be writable when a
        // getter or setter has been specified
        delete desc.writable;
        delete desc.value;
        var originalDescGet = desc.get;
        var originalDescSet = desc.set;
        // slice(2) cuz 'onclick' -> 'click', etc
        var eventName = prop.slice(2);
        var eventNameSymbol = zoneSymbolEventNames$1[eventName];
        if (!eventNameSymbol) {
            eventNameSymbol = zoneSymbolEventNames$1[eventName] = zoneSymbol('ON_PROPERTY' + eventName);
        }
        desc.set = function (newValue) {
            // in some of windows's onproperty callback, this is undefined
            // so we need to check it
            var target = this;
            if (!target && obj === _global) {
                target = _global;
            }
            if (!target) {
                return;
            }
            var previousValue = target[eventNameSymbol];
            if (typeof previousValue === 'function') {
                target.removeEventListener(eventName, wrapFn);
            }
            // issue #978, when onload handler was added before loading zone.js
            // we should remove it with originalDescSet
            originalDescSet && originalDescSet.call(target, null);
            target[eventNameSymbol] = newValue;
            if (typeof newValue === 'function') {
                target.addEventListener(eventName, wrapFn, false);
            }
        };
        // The getter would return undefined for unassigned properties but the default value of an
        // unassigned property is null
        desc.get = function () {
            // in some of windows's onproperty callback, this is undefined
            // so we need to check it
            var target = this;
            if (!target && obj === _global) {
                target = _global;
            }
            if (!target) {
                return null;
            }
            var listener = target[eventNameSymbol];
            if (listener) {
                return listener;
            }
            else if (originalDescGet) {
                // result will be null when use inline event attribute,
                // such as <button onclick="func();">OK</button>
                // because the onclick function is internal raw uncompiled handler
                // the onclick will be evaluated when first time event was triggered or
                // the property is accessed, https://github.com/angular/zone.js/issues/525
                // so we should use original native get to retrieve the handler
                var value = originalDescGet.call(this);
                if (value) {
                    desc.set.call(this, value);
                    if (typeof target[REMOVE_ATTRIBUTE] === 'function') {
                        target.removeAttribute(prop);
                    }
                    return value;
                }
            }
            return null;
        };
        ObjectDefineProperty(obj, prop, desc);
        obj[onPropPatchedSymbol] = true;
    }
    function patchOnProperties(obj, properties, prototype) {
        if (properties) {
            for (var i = 0; i < properties.length; i++) {
                patchProperty(obj, 'on' + properties[i], prototype);
            }
        }
        else {
            var onProperties = [];
            for (var prop in obj) {
                if (prop.slice(0, 2) == 'on') {
                    onProperties.push(prop);
                }
            }
            for (var j = 0; j < onProperties.length; j++) {
                patchProperty(obj, onProperties[j], prototype);
            }
        }
    }
    var originalInstanceKey = zoneSymbol('originalInstance');
    // wrap some native API on `window`
    function patchClass(className) {
        var OriginalClass = _global[className];
        if (!OriginalClass)
            return;
        // keep original class in global
        _global[zoneSymbol(className)] = OriginalClass;
        _global[className] = function () {
            var a = bindArguments(arguments, className);
            switch (a.length) {
                case 0:
                    this[originalInstanceKey] = new OriginalClass();
                    break;
                case 1:
                    this[originalInstanceKey] = new OriginalClass(a[0]);
                    break;
                case 2:
                    this[originalInstanceKey] = new OriginalClass(a[0], a[1]);
                    break;
                case 3:
                    this[originalInstanceKey] = new OriginalClass(a[0], a[1], a[2]);
                    break;
                case 4:
                    this[originalInstanceKey] = new OriginalClass(a[0], a[1], a[2], a[3]);
                    break;
                default:
                    throw new Error('Arg list too long.');
            }
        };
        // attach original delegate to patched function
        attachOriginToPatched(_global[className], OriginalClass);
        var instance = new OriginalClass(function () { });
        var prop;
        for (prop in instance) {
            // https://bugs.webkit.org/show_bug.cgi?id=44721
            if (className === 'XMLHttpRequest' && prop === 'responseBlob')
                continue;
            (function (prop) {
                if (typeof instance[prop] === 'function') {
                    _global[className].prototype[prop] = function () {
                        return this[originalInstanceKey][prop].apply(this[originalInstanceKey], arguments);
                    };
                }
                else {
                    ObjectDefineProperty(_global[className].prototype, prop, {
                        set: function (fn) {
                            if (typeof fn === 'function') {
                                this[originalInstanceKey][prop] = wrapWithCurrentZone(fn, className + '.' + prop);
                                // keep callback in wrapped function so we can
                                // use it in Function.prototype.toString to return
                                // the native one.
                                attachOriginToPatched(this[originalInstanceKey][prop], fn);
                            }
                            else {
                                this[originalInstanceKey][prop] = fn;
                            }
                        },
                        get: function () {
                            return this[originalInstanceKey][prop];
                        }
                    });
                }
            }(prop));
        }
        for (prop in OriginalClass) {
            if (prop !== 'prototype' && OriginalClass.hasOwnProperty(prop)) {
                _global[className][prop] = OriginalClass[prop];
            }
        }
    }
    function patchMethod(target, name, patchFn) {
        var proto = target;
        while (proto && !proto.hasOwnProperty(name)) {
            proto = ObjectGetPrototypeOf(proto);
        }
        if (!proto && target[name]) {
            // somehow we did not find it, but we can see it. This happens on IE for Window properties.
            proto = target;
        }
        var delegateName = zoneSymbol(name);
        var delegate = null;
        if (proto && (!(delegate = proto[delegateName]) || !proto.hasOwnProperty(delegateName))) {
            delegate = proto[delegateName] = proto[name];
            // check whether proto[name] is writable
            // some property is readonly in safari, such as HtmlCanvasElement.prototype.toBlob
            var desc = proto && ObjectGetOwnPropertyDescriptor(proto, name);
            if (isPropertyWritable(desc)) {
                var patchDelegate_1 = patchFn(delegate, delegateName, name);
                proto[name] = function () {
                    return patchDelegate_1(this, arguments);
                };
                attachOriginToPatched(proto[name], delegate);
            }
        }
        return delegate;
    }
    // TODO: @JiaLiPassion, support cancel task later if necessary
    function patchMacroTask(obj, funcName, metaCreator) {
        var setNative = null;
        function scheduleTask(task) {
            var data = task.data;
            data.args[data.cbIdx] = function () {
                task.invoke.apply(this, arguments);
            };
            setNative.apply(data.target, data.args);
            return task;
        }
        setNative = patchMethod(obj, funcName, function (delegate) { return function (self, args) {
            var meta = metaCreator(self, args);
            if (meta.cbIdx >= 0 && typeof args[meta.cbIdx] === 'function') {
                return scheduleMacroTaskWithCurrentZone(meta.name, args[meta.cbIdx], meta, scheduleTask);
            }
            else {
                // cause an error by calling it directly.
                return delegate.apply(self, args);
            }
        }; });
    }
    function attachOriginToPatched(patched, original) {
        patched[zoneSymbol('OriginalDelegate')] = original;
    }
    var isDetectedIEOrEdge = false;
    var ieOrEdge = false;
    function isIE() {
        try {
            var ua = internalWindow.navigator.userAgent;
            if (ua.indexOf('MSIE ') !== -1 || ua.indexOf('Trident/') !== -1) {
                return true;
            }
        }
        catch (error) {
        }
        return false;
    }
    function isIEOrEdge() {
        if (isDetectedIEOrEdge) {
            return ieOrEdge;
        }
        isDetectedIEOrEdge = true;
        try {
            var ua = internalWindow.navigator.userAgent;
            if (ua.indexOf('MSIE ') !== -1 || ua.indexOf('Trident/') !== -1 || ua.indexOf('Edge/') !== -1) {
                ieOrEdge = true;
            }
        }
        catch (error) {
        }
        return ieOrEdge;
    }
    Zone.__load_patch('ZoneAwarePromise', function (global, Zone, api) {
        var ObjectGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
        var ObjectDefineProperty = Object.defineProperty;
        function readableObjectToString(obj) {
            if (obj && obj.toString === Object.prototype.toString) {
                var className = obj.constructor && obj.constructor.name;
                return (className ? className : '') + ': ' + JSON.stringify(obj);
            }
            return obj ? obj.toString() : Object.prototype.toString.call(obj);
        }
        var __symbol__ = api.symbol;
        var _uncaughtPromiseErrors = [];
        var isDisableWrappingUncaughtPromiseRejection = global[__symbol__('DISABLE_WRAPPING_UNCAUGHT_PROMISE_REJECTION')] === true;
        var symbolPromise = __symbol__('Promise');
        var symbolThen = __symbol__('then');
        var creationTrace = '__creationTrace__';
        api.onUnhandledError = function (e) {
            if (api.showUncaughtError()) {
                var rejection = e && e.rejection;
                if (rejection) {
                    console.error('Unhandled Promise rejection:', rejection instanceof Error ? rejection.message : rejection, '; Zone:', e.zone.name, '; Task:', e.task && e.task.source, '; Value:', rejection, rejection instanceof Error ? rejection.stack : undefined);
                }
                else {
                    console.error(e);
                }
            }
        };
        api.microtaskDrainDone = function () {
            var _loop_2 = function () {
                var uncaughtPromiseError = _uncaughtPromiseErrors.shift();
                try {
                    uncaughtPromiseError.zone.runGuarded(function () {
                        if (uncaughtPromiseError.throwOriginal) {
                            throw uncaughtPromiseError.rejection;
                        }
                        throw uncaughtPromiseError;
                    });
                }
                catch (error) {
                    handleUnhandledRejection(error);
                }
            };
            while (_uncaughtPromiseErrors.length) {
                _loop_2();
            }
        };
        var UNHANDLED_PROMISE_REJECTION_HANDLER_SYMBOL = __symbol__('unhandledPromiseRejectionHandler');
        function handleUnhandledRejection(e) {
            api.onUnhandledError(e);
            try {
                var handler = Zone[UNHANDLED_PROMISE_REJECTION_HANDLER_SYMBOL];
                if (typeof handler === 'function') {
                    handler.call(this, e);
                }
            }
            catch (err) {
            }
        }
        function isThenable(value) {
            return value && value.then;
        }
        function forwardResolution(value) {
            return value;
        }
        function forwardRejection(rejection) {
            return ZoneAwarePromise.reject(rejection);
        }
        var symbolState = __symbol__('state');
        var symbolValue = __symbol__('value');
        var symbolFinally = __symbol__('finally');
        var symbolParentPromiseValue = __symbol__('parentPromiseValue');
        var symbolParentPromiseState = __symbol__('parentPromiseState');
        var source = 'Promise.then';
        var UNRESOLVED = null;
        var RESOLVED = true;
        var REJECTED = false;
        var REJECTED_NO_CATCH = 0;
        function makeResolver(promise, state) {
            return function (v) {
                try {
                    resolvePromise(promise, state, v);
                }
                catch (err) {
                    resolvePromise(promise, false, err);
                }
                // Do not return value or you will break the Promise spec.
            };
        }
        var once = function () {
            var wasCalled = false;
            return function wrapper(wrappedFunction) {
                return function () {
                    if (wasCalled) {
                        return;
                    }
                    wasCalled = true;
                    wrappedFunction.apply(null, arguments);
                };
            };
        };
        var TYPE_ERROR = 'Promise resolved with itself';
        var CURRENT_TASK_TRACE_SYMBOL = __symbol__('currentTaskTrace');
        // Promise Resolution
        function resolvePromise(promise, state, value) {
            var onceWrapper = once();
            if (promise === value) {
                throw new TypeError(TYPE_ERROR);
            }
            if (promise[symbolState] === UNRESOLVED) {
                // should only get value.then once based on promise spec.
                var then = null;
                try {
                    if (typeof value === 'object' || typeof value === 'function') {
                        then = value && value.then;
                    }
                }
                catch (err) {
                    onceWrapper(function () {
                        resolvePromise(promise, false, err);
                    })();
                    return promise;
                }
                // if (value instanceof ZoneAwarePromise) {
                if (state !== REJECTED && value instanceof ZoneAwarePromise &&
                    value.hasOwnProperty(symbolState) && value.hasOwnProperty(symbolValue) &&
                    value[symbolState] !== UNRESOLVED) {
                    clearRejectedNoCatch(value);
                    resolvePromise(promise, value[symbolState], value[symbolValue]);
                }
                else if (state !== REJECTED && typeof then === 'function') {
                    try {
                        then.call(value, onceWrapper(makeResolver(promise, state)), onceWrapper(makeResolver(promise, false)));
                    }
                    catch (err) {
                        onceWrapper(function () {
                            resolvePromise(promise, false, err);
                        })();
                    }
                }
                else {
                    promise[symbolState] = state;
                    var queue = promise[symbolValue];
                    promise[symbolValue] = value;
                    if (promise[symbolFinally] === symbolFinally) {
                        // the promise is generated by Promise.prototype.finally
                        if (state === RESOLVED) {
                            // the state is resolved, should ignore the value
                            // and use parent promise value
                            promise[symbolState] = promise[symbolParentPromiseState];
                            promise[symbolValue] = promise[symbolParentPromiseValue];
                        }
                    }
                    // record task information in value when error occurs, so we can
                    // do some additional work such as render longStackTrace
                    if (state === REJECTED && value instanceof Error) {
                        // check if longStackTraceZone is here
                        var trace = Zone.currentTask && Zone.currentTask.data &&
                            Zone.currentTask.data[creationTrace];
                        if (trace) {
                            // only keep the long stack trace into error when in longStackTraceZone
                            ObjectDefineProperty(value, CURRENT_TASK_TRACE_SYMBOL, { configurable: true, enumerable: false, writable: true, value: trace });
                        }
                    }
                    for (var i = 0; i < queue.length;) {
                        scheduleResolveOrReject(promise, queue[i++], queue[i++], queue[i++], queue[i++]);
                    }
                    if (queue.length == 0 && state == REJECTED) {
                        promise[symbolState] = REJECTED_NO_CATCH;
                        var uncaughtPromiseError = value;
                        try {
                            // Here we throws a new Error to print more readable error log
                            // and if the value is not an error, zone.js builds an `Error`
                            // Object here to attach the stack information.
                            throw new Error('Uncaught (in promise): ' + readableObjectToString(value) +
                                (value && value.stack ? '\n' + value.stack : ''));
                        }
                        catch (err) {
                            uncaughtPromiseError = err;
                        }
                        if (isDisableWrappingUncaughtPromiseRejection) {
                            // If disable wrapping uncaught promise reject
                            // use the value instead of wrapping it.
                            uncaughtPromiseError.throwOriginal = true;
                        }
                        uncaughtPromiseError.rejection = value;
                        uncaughtPromiseError.promise = promise;
                        uncaughtPromiseError.zone = Zone.current;
                        uncaughtPromiseError.task = Zone.currentTask;
                        _uncaughtPromiseErrors.push(uncaughtPromiseError);
                        api.scheduleMicroTask(); // to make sure that it is running
                    }
                }
            }
            // Resolving an already resolved promise is a noop.
            return promise;
        }
        var REJECTION_HANDLED_HANDLER = __symbol__('rejectionHandledHandler');
        function clearRejectedNoCatch(promise) {
            if (promise[symbolState] === REJECTED_NO_CATCH) {
                // if the promise is rejected no catch status
                // and queue.length > 0, means there is a error handler
                // here to handle the rejected promise, we should trigger
                // windows.rejectionhandled eventHandler or nodejs rejectionHandled
                // eventHandler
                try {
                    var handler = Zone[REJECTION_HANDLED_HANDLER];
                    if (handler && typeof handler === 'function') {
                        handler.call(this, { rejection: promise[symbolValue], promise: promise });
                    }
                }
                catch (err) {
                }
                promise[symbolState] = REJECTED;
                for (var i = 0; i < _uncaughtPromiseErrors.length; i++) {
                    if (promise === _uncaughtPromiseErrors[i].promise) {
                        _uncaughtPromiseErrors.splice(i, 1);
                    }
                }
            }
        }
        function scheduleResolveOrReject(promise, zone, chainPromise, onFulfilled, onRejected) {
            clearRejectedNoCatch(promise);
            var promiseState = promise[symbolState];
            var delegate = promiseState ?
                (typeof onFulfilled === 'function') ? onFulfilled : forwardResolution :
                (typeof onRejected === 'function') ? onRejected :
                    forwardRejection;
            zone.scheduleMicroTask(source, function () {
                try {
                    var parentPromiseValue = promise[symbolValue];
                    var isFinallyPromise = !!chainPromise && symbolFinally === chainPromise[symbolFinally];
                    if (isFinallyPromise) {
                        // if the promise is generated from finally call, keep parent promise's state and value
                        chainPromise[symbolParentPromiseValue] = parentPromiseValue;
                        chainPromise[symbolParentPromiseState] = promiseState;
                    }
                    // should not pass value to finally callback
                    var value = zone.run(delegate, undefined, isFinallyPromise && delegate !== forwardRejection && delegate !== forwardResolution ?
                        [] :
                        [parentPromiseValue]);
                    resolvePromise(chainPromise, true, value);
                }
                catch (error) {
                    // if error occurs, should always return this error
                    resolvePromise(chainPromise, false, error);
                }
            }, chainPromise);
        }
        var ZONE_AWARE_PROMISE_TO_STRING = 'function ZoneAwarePromise() { [native code] }';
        var noop = function () { };
        var AggregateError = global.AggregateError;
        var ZoneAwarePromise = /** @class */ (function () {
            function ZoneAwarePromise(executor) {
                var promise = this;
                if (!(promise instanceof ZoneAwarePromise)) {
                    throw new Error('Must be an instanceof Promise.');
                }
                promise[symbolState] = UNRESOLVED;
                promise[symbolValue] = []; // queue;
                try {
                    var onceWrapper = once();
                    executor &&
                        executor(onceWrapper(makeResolver(promise, RESOLVED)), onceWrapper(makeResolver(promise, REJECTED)));
                }
                catch (error) {
                    resolvePromise(promise, false, error);
                }
            }
            ZoneAwarePromise.toString = function () {
                return ZONE_AWARE_PROMISE_TO_STRING;
            };
            ZoneAwarePromise.resolve = function (value) {
                return resolvePromise(new this(null), RESOLVED, value);
            };
            ZoneAwarePromise.reject = function (error) {
                return resolvePromise(new this(null), REJECTED, error);
            };
            ZoneAwarePromise.any = function (values) {
                if (!values || typeof values[Symbol.iterator] !== 'function') {
                    return Promise.reject(new AggregateError([], 'All promises were rejected'));
                }
                var promises = [];
                var count = 0;
                try {
                    for (var _i = 0, values_1 = values; _i < values_1.length; _i++) {
                        var v = values_1[_i];
                        count++;
                        promises.push(ZoneAwarePromise.resolve(v));
                    }
                }
                catch (err) {
                    return Promise.reject(new AggregateError([], 'All promises were rejected'));
                }
                if (count === 0) {
                    return Promise.reject(new AggregateError([], 'All promises were rejected'));
                }
                var finished = false;
                var errors = [];
                return new ZoneAwarePromise(function (resolve, reject) {
                    for (var i = 0; i < promises.length; i++) {
                        promises[i].then(function (v) {
                            if (finished) {
                                return;
                            }
                            finished = true;
                            resolve(v);
                        }, function (err) {
                            errors.push(err);
                            count--;
                            if (count === 0) {
                                finished = true;
                                reject(new AggregateError(errors, 'All promises were rejected'));
                            }
                        });
                    }
                });
            };
            ;
            ZoneAwarePromise.race = function (values) {
                var resolve;
                var reject;
                var promise = new this(function (res, rej) {
                    resolve = res;
                    reject = rej;
                });
                function onResolve(value) {
                    resolve(value);
                }
                function onReject(error) {
                    reject(error);
                }
                for (var _i = 0, values_2 = values; _i < values_2.length; _i++) {
                    var value = values_2[_i];
                    if (!isThenable(value)) {
                        value = this.resolve(value);
                    }
                    value.then(onResolve, onReject);
                }
                return promise;
            };
            ZoneAwarePromise.all = function (values) {
                return ZoneAwarePromise.allWithCallback(values);
            };
            ZoneAwarePromise.allSettled = function (values) {
                var P = this && this.prototype instanceof ZoneAwarePromise ? this : ZoneAwarePromise;
                return P.allWithCallback(values, {
                    thenCallback: function (value) { return ({ status: 'fulfilled', value: value }); },
                    errorCallback: function (err) { return ({ status: 'rejected', reason: err }); }
                });
            };
            ZoneAwarePromise.allWithCallback = function (values, callback) {
                var resolve;
                var reject;
                var promise = new this(function (res, rej) {
                    resolve = res;
                    reject = rej;
                });
                // Start at 2 to prevent prematurely resolving if .then is called immediately.
                var unresolvedCount = 2;
                var valueIndex = 0;
                var resolvedValues = [];
                var _loop_3 = function (value) {
                    if (!isThenable(value)) {
                        value = this_1.resolve(value);
                    }
                    var curValueIndex = valueIndex;
                    try {
                        value.then(function (value) {
                            resolvedValues[curValueIndex] = callback ? callback.thenCallback(value) : value;
                            unresolvedCount--;
                            if (unresolvedCount === 0) {
                                resolve(resolvedValues);
                            }
                        }, function (err) {
                            if (!callback) {
                                reject(err);
                            }
                            else {
                                resolvedValues[curValueIndex] = callback.errorCallback(err);
                                unresolvedCount--;
                                if (unresolvedCount === 0) {
                                    resolve(resolvedValues);
                                }
                            }
                        });
                    }
                    catch (thenErr) {
                        reject(thenErr);
                    }
                    unresolvedCount++;
                    valueIndex++;
                };
                var this_1 = this;
                for (var _i = 0, values_3 = values; _i < values_3.length; _i++) {
                    var value = values_3[_i];
                    _loop_3(value);
                }
                // Make the unresolvedCount zero-based again.
                unresolvedCount -= 2;
                if (unresolvedCount === 0) {
                    resolve(resolvedValues);
                }
                return promise;
            };
            Object.defineProperty(ZoneAwarePromise.prototype, Symbol.toStringTag, {
                get: function () {
                    return 'Promise';
                },
                enumerable: false,
                configurable: true
            });
            Object.defineProperty(ZoneAwarePromise.prototype, Symbol.species, {
                get: function () {
                    return ZoneAwarePromise;
                },
                enumerable: false,
                configurable: true
            });
            ZoneAwarePromise.prototype.then = function (onFulfilled, onRejected) {
                var _a;
                // We must read `Symbol.species` safely because `this` may be anything. For instance, `this`
                // may be an object without a prototype (created through `Object.create(null)`); thus
                // `this.constructor` will be undefined. One of the use cases is SystemJS creating
                // prototype-less objects (modules) via `Object.create(null)`. The SystemJS creates an empty
                // object and copies promise properties into that object (within the `getOrCreateLoad`
                // function). The zone.js then checks if the resolved value has the `then` method and invokes
                // it with the `value` context. Otherwise, this will throw an error: `TypeError: Cannot read
                // properties of undefined (reading 'Symbol(Symbol.species)')`.
                var C = (_a = this.constructor) === null || _a === void 0 ? void 0 : _a[Symbol.species];
                if (!C || typeof C !== 'function') {
                    C = this.constructor || ZoneAwarePromise;
                }
                var chainPromise = new C(noop);
                var zone = Zone.current;
                if (this[symbolState] == UNRESOLVED) {
                    this[symbolValue].push(zone, chainPromise, onFulfilled, onRejected);
                }
                else {
                    scheduleResolveOrReject(this, zone, chainPromise, onFulfilled, onRejected);
                }
                return chainPromise;
            };
            ZoneAwarePromise.prototype.catch = function (onRejected) {
                return this.then(null, onRejected);
            };
            ZoneAwarePromise.prototype.finally = function (onFinally) {
                var _a;
                // See comment on the call to `then` about why thee `Symbol.species` is safely accessed.
                var C = (_a = this.constructor) === null || _a === void 0 ? void 0 : _a[Symbol.species];
                if (!C || typeof C !== 'function') {
                    C = ZoneAwarePromise;
                }
                var chainPromise = new C(noop);
                chainPromise[symbolFinally] = symbolFinally;
                var zone = Zone.current;
                if (this[symbolState] == UNRESOLVED) {
                    this[symbolValue].push(zone, chainPromise, onFinally, onFinally);
                }
                else {
                    scheduleResolveOrReject(this, zone, chainPromise, onFinally, onFinally);
                }
                return chainPromise;
            };
            return ZoneAwarePromise;
        }());
        // Protect against aggressive optimizers dropping seemingly unused properties.
        // E.g. Closure Compiler in advanced mode.
        ZoneAwarePromise['resolve'] = ZoneAwarePromise.resolve;
        ZoneAwarePromise['reject'] = ZoneAwarePromise.reject;
        ZoneAwarePromise['race'] = ZoneAwarePromise.race;
        ZoneAwarePromise['all'] = ZoneAwarePromise.all;
        var NativePromise = global[symbolPromise] = global['Promise'];
        global['Promise'] = ZoneAwarePromise;
        var symbolThenPatched = __symbol__('thenPatched');
        function patchThen(Ctor) {
            var proto = Ctor.prototype;
            var prop = ObjectGetOwnPropertyDescriptor(proto, 'then');
            if (prop && (prop.writable === false || !prop.configurable)) {
                // check Ctor.prototype.then propertyDescriptor is writable or not
                // in meteor env, writable is false, we should ignore such case
                return;
            }
            var originalThen = proto.then;
            // Keep a reference to the original method.
            proto[symbolThen] = originalThen;
            Ctor.prototype.then = function (onResolve, onReject) {
                var _this = this;
                var wrapped = new ZoneAwarePromise(function (resolve, reject) {
                    originalThen.call(_this, resolve, reject);
                });
                return wrapped.then(onResolve, onReject);
            };
            Ctor[symbolThenPatched] = true;
        }
        api.patchThen = patchThen;
        function zoneify(fn) {
            return function (self, args) {
                var resultPromise = fn.apply(self, args);
                if (resultPromise instanceof ZoneAwarePromise) {
                    return resultPromise;
                }
                var ctor = resultPromise.constructor;
                if (!ctor[symbolThenPatched]) {
                    patchThen(ctor);
                }
                return resultPromise;
            };
        }
        if (NativePromise) {
            patchThen(NativePromise);
            patchMethod(global, 'fetch', function (delegate) { return zoneify(delegate); });
        }
        // This is not part of public API, but it is useful for tests, so we expose it.
        Promise[Zone.__symbol__('uncaughtPromiseErrors')] = _uncaughtPromiseErrors;
        return ZoneAwarePromise;
    });
    // override Function.prototype.toString to make zone.js patched function
    // look like native function
    Zone.__load_patch('toString', function (global) {
        // patch Func.prototype.toString to let them look like native
        var originalFunctionToString = Function.prototype.toString;
        var ORIGINAL_DELEGATE_SYMBOL = zoneSymbol('OriginalDelegate');
        var PROMISE_SYMBOL = zoneSymbol('Promise');
        var ERROR_SYMBOL = zoneSymbol('Error');
        var newFunctionToString = function toString() {
            if (typeof this === 'function') {
                var originalDelegate = this[ORIGINAL_DELEGATE_SYMBOL];
                if (originalDelegate) {
                    if (typeof originalDelegate === 'function') {
                        return originalFunctionToString.call(originalDelegate);
                    }
                    else {
                        return Object.prototype.toString.call(originalDelegate);
                    }
                }
                if (this === Promise) {
                    var nativePromise = global[PROMISE_SYMBOL];
                    if (nativePromise) {
                        return originalFunctionToString.call(nativePromise);
                    }
                }
                if (this === Error) {
                    var nativeError = global[ERROR_SYMBOL];
                    if (nativeError) {
                        return originalFunctionToString.call(nativeError);
                    }
                }
            }
            return originalFunctionToString.call(this);
        };
        newFunctionToString[ORIGINAL_DELEGATE_SYMBOL] = originalFunctionToString;
        Function.prototype.toString = newFunctionToString;
        // patch Object.prototype.toString to let them look like native
        var originalObjectToString = Object.prototype.toString;
        var PROMISE_OBJECT_TO_STRING = '[object Promise]';
        Object.prototype.toString = function () {
            if (typeof Promise === 'function' && this instanceof Promise) {
                return PROMISE_OBJECT_TO_STRING;
            }
            return originalObjectToString.call(this);
        };
    });
    /**
     * @fileoverview
     * @suppress {missingRequire}
     */
    var passiveSupported = false;
    if (typeof window !== 'undefined') {
        try {
            var options = Object.defineProperty({}, 'passive', {
                get: function () {
                    passiveSupported = true;
                }
            });
            // Note: We pass the `options` object as the event handler too. This is not compatible with the
            // signature of `addEventListener` or `removeEventListener` but enables us to remove the handler
            // without an actual handler.
            window.addEventListener('test', options, options);
            window.removeEventListener('test', options, options);
        }
        catch (err) {
            passiveSupported = false;
        }
    }
    // an identifier to tell ZoneTask do not create a new invoke closure
    var OPTIMIZED_ZONE_EVENT_TASK_DATA = {
        useG: true
    };
    var zoneSymbolEventNames = {};
    var globalSources = {};
    var EVENT_NAME_SYMBOL_REGX = new RegExp('^' + ZONE_SYMBOL_PREFIX + '(\\w+)(true|false)$');
    var IMMEDIATE_PROPAGATION_SYMBOL = zoneSymbol('propagationStopped');
    function prepareEventNames(eventName, eventNameToString) {
        var falseEventName = (eventNameToString ? eventNameToString(eventName) : eventName) + FALSE_STR;
        var trueEventName = (eventNameToString ? eventNameToString(eventName) : eventName) + TRUE_STR;
        var symbol = ZONE_SYMBOL_PREFIX + falseEventName;
        var symbolCapture = ZONE_SYMBOL_PREFIX + trueEventName;
        zoneSymbolEventNames[eventName] = {};
        zoneSymbolEventNames[eventName][FALSE_STR] = symbol;
        zoneSymbolEventNames[eventName][TRUE_STR] = symbolCapture;
    }
    function patchEventTarget(_global, api, apis, patchOptions) {
        var ADD_EVENT_LISTENER = (patchOptions && patchOptions.add) || ADD_EVENT_LISTENER_STR;
        var REMOVE_EVENT_LISTENER = (patchOptions && patchOptions.rm) || REMOVE_EVENT_LISTENER_STR;
        var LISTENERS_EVENT_LISTENER = (patchOptions && patchOptions.listeners) || 'eventListeners';
        var REMOVE_ALL_LISTENERS_EVENT_LISTENER = (patchOptions && patchOptions.rmAll) || 'removeAllListeners';
        var zoneSymbolAddEventListener = zoneSymbol(ADD_EVENT_LISTENER);
        var ADD_EVENT_LISTENER_SOURCE = '.' + ADD_EVENT_LISTENER + ':';
        var PREPEND_EVENT_LISTENER = 'prependListener';
        var PREPEND_EVENT_LISTENER_SOURCE = '.' + PREPEND_EVENT_LISTENER + ':';
        var invokeTask = function (task, target, event) {
            // for better performance, check isRemoved which is set
            // by removeEventListener
            if (task.isRemoved) {
                return;
            }
            var delegate = task.callback;
            if (typeof delegate === 'object' && delegate.handleEvent) {
                // create the bind version of handleEvent when invoke
                task.callback = function (event) { return delegate.handleEvent(event); };
                task.originalDelegate = delegate;
            }
            // invoke static task.invoke
            // need to try/catch error here, otherwise, the error in one event listener
            // will break the executions of the other event listeners. Also error will
            // not remove the event listener when `once` options is true.
            var error;
            try {
                task.invoke(task, target, [event]);
            }
            catch (err) {
                error = err;
            }
            var options = task.options;
            if (options && typeof options === 'object' && options.once) {
                // if options.once is true, after invoke once remove listener here
                // only browser need to do this, nodejs eventEmitter will cal removeListener
                // inside EventEmitter.once
                var delegate_1 = task.originalDelegate ? task.originalDelegate : task.callback;
                target[REMOVE_EVENT_LISTENER].call(target, event.type, delegate_1, options);
            }
            return error;
        };
        function globalCallback(context, event, isCapture) {
            // https://github.com/angular/zone.js/issues/911, in IE, sometimes
            // event will be undefined, so we need to use window.event
            event = event || _global.event;
            if (!event) {
                return;
            }
            // event.target is needed for Samsung TV and SourceBuffer
            // || global is needed https://github.com/angular/zone.js/issues/190
            var target = context || event.target || _global;
            var tasks = target[zoneSymbolEventNames[event.type][isCapture ? TRUE_STR : FALSE_STR]];
            if (tasks) {
                var errors = [];
                // invoke all tasks which attached to current target with given event.type and capture = false
                // for performance concern, if task.length === 1, just invoke
                if (tasks.length === 1) {
                    var err = invokeTask(tasks[0], target, event);
                    err && errors.push(err);
                }
                else {
                    // https://github.com/angular/zone.js/issues/836
                    // copy the tasks array before invoke, to avoid
                    // the callback will remove itself or other listener
                    var copyTasks = tasks.slice();
                    for (var i = 0; i < copyTasks.length; i++) {
                        if (event && event[IMMEDIATE_PROPAGATION_SYMBOL] === true) {
                            break;
                        }
                        var err = invokeTask(copyTasks[i], target, event);
                        err && errors.push(err);
                    }
                }
                // Since there is only one error, we don't need to schedule microTask
                // to throw the error.
                if (errors.length === 1) {
                    throw errors[0];
                }
                else {
                    var _loop_4 = function (i) {
                        var err = errors[i];
                        api.nativeScheduleMicroTask(function () {
                            throw err;
                        });
                    };
                    for (var i = 0; i < errors.length; i++) {
                        _loop_4(i);
                    }
                }
            }
        }
        // global shared zoneAwareCallback to handle all event callback with capture = false
        var globalZoneAwareCallback = function (event) {
            return globalCallback(this, event, false);
        };
        // global shared zoneAwareCallback to handle all event callback with capture = true
        var globalZoneAwareCaptureCallback = function (event) {
            return globalCallback(this, event, true);
        };
        function patchEventTargetMethods(obj, patchOptions) {
            if (!obj) {
                return false;
            }
            var useGlobalCallback = true;
            if (patchOptions && patchOptions.useG !== undefined) {
                useGlobalCallback = patchOptions.useG;
            }
            var validateHandler = patchOptions && patchOptions.vh;
            var checkDuplicate = true;
            if (patchOptions && patchOptions.chkDup !== undefined) {
                checkDuplicate = patchOptions.chkDup;
            }
            var returnTarget = false;
            if (patchOptions && patchOptions.rt !== undefined) {
                returnTarget = patchOptions.rt;
            }
            var proto = obj;
            while (proto && !proto.hasOwnProperty(ADD_EVENT_LISTENER)) {
                proto = ObjectGetPrototypeOf(proto);
            }
            if (!proto && obj[ADD_EVENT_LISTENER]) {
                // somehow we did not find it, but we can see it. This happens on IE for Window properties.
                proto = obj;
            }
            if (!proto) {
                return false;
            }
            if (proto[zoneSymbolAddEventListener]) {
                return false;
            }
            var eventNameToString = patchOptions && patchOptions.eventNameToString;
            // a shared global taskData to pass data for scheduleEventTask
            // so we do not need to create a new object just for pass some data
            var taskData = {};
            var nativeAddEventListener = proto[zoneSymbolAddEventListener] = proto[ADD_EVENT_LISTENER];
            var nativeRemoveEventListener = proto[zoneSymbol(REMOVE_EVENT_LISTENER)] =
                proto[REMOVE_EVENT_LISTENER];
            var nativeListeners = proto[zoneSymbol(LISTENERS_EVENT_LISTENER)] =
                proto[LISTENERS_EVENT_LISTENER];
            var nativeRemoveAllListeners = proto[zoneSymbol(REMOVE_ALL_LISTENERS_EVENT_LISTENER)] =
                proto[REMOVE_ALL_LISTENERS_EVENT_LISTENER];
            var nativePrependEventListener;
            if (patchOptions && patchOptions.prepend) {
                nativePrependEventListener = proto[zoneSymbol(patchOptions.prepend)] =
                    proto[patchOptions.prepend];
            }
            /**
             * This util function will build an option object with passive option
             * to handle all possible input from the user.
             */
            function buildEventListenerOptions(options, passive) {
                if (!passiveSupported && typeof options === 'object' && options) {
                    // doesn't support passive but user want to pass an object as options.
                    // this will not work on some old browser, so we just pass a boolean
                    // as useCapture parameter
                    return !!options.capture;
                }
                if (!passiveSupported || !passive) {
                    return options;
                }
                if (typeof options === 'boolean') {
                    return { capture: options, passive: true };
                }
                if (!options) {
                    return { passive: true };
                }
                if (typeof options === 'object' && options.passive !== false) {
                    return __assign(__assign({}, options), { passive: true });
                }
                return options;
            }
            var customScheduleGlobal = function (task) {
                // if there is already a task for the eventName + capture,
                // just return, because we use the shared globalZoneAwareCallback here.
                if (taskData.isExisting) {
                    return;
                }
                return nativeAddEventListener.call(taskData.target, taskData.eventName, taskData.capture ? globalZoneAwareCaptureCallback : globalZoneAwareCallback, taskData.options);
            };
            var customCancelGlobal = function (task) {
                // if task is not marked as isRemoved, this call is directly
                // from Zone.prototype.cancelTask, we should remove the task
                // from tasksList of target first
                if (!task.isRemoved) {
                    var symbolEventNames = zoneSymbolEventNames[task.eventName];
                    var symbolEventName = void 0;
                    if (symbolEventNames) {
                        symbolEventName = symbolEventNames[task.capture ? TRUE_STR : FALSE_STR];
                    }
                    var existingTasks = symbolEventName && task.target[symbolEventName];
                    if (existingTasks) {
                        for (var i = 0; i < existingTasks.length; i++) {
                            var existingTask = existingTasks[i];
                            if (existingTask === task) {
                                existingTasks.splice(i, 1);
                                // set isRemoved to data for faster invokeTask check
                                task.isRemoved = true;
                                if (existingTasks.length === 0) {
                                    // all tasks for the eventName + capture have gone,
                                    // remove globalZoneAwareCallback and remove the task cache from target
                                    task.allRemoved = true;
                                    task.target[symbolEventName] = null;
                                }
                                break;
                            }
                        }
                    }
                }
                // if all tasks for the eventName + capture have gone,
                // we will really remove the global event callback,
                // if not, return
                if (!task.allRemoved) {
                    return;
                }
                return nativeRemoveEventListener.call(task.target, task.eventName, task.capture ? globalZoneAwareCaptureCallback : globalZoneAwareCallback, task.options);
            };
            var customScheduleNonGlobal = function (task) {
                return nativeAddEventListener.call(taskData.target, taskData.eventName, task.invoke, taskData.options);
            };
            var customSchedulePrepend = function (task) {
                return nativePrependEventListener.call(taskData.target, taskData.eventName, task.invoke, taskData.options);
            };
            var customCancelNonGlobal = function (task) {
                return nativeRemoveEventListener.call(task.target, task.eventName, task.invoke, task.options);
            };
            var customSchedule = useGlobalCallback ? customScheduleGlobal : customScheduleNonGlobal;
            var customCancel = useGlobalCallback ? customCancelGlobal : customCancelNonGlobal;
            var compareTaskCallbackVsDelegate = function (task, delegate) {
                var typeOfDelegate = typeof delegate;
                return (typeOfDelegate === 'function' && task.callback === delegate) ||
                    (typeOfDelegate === 'object' && task.originalDelegate === delegate);
            };
            var compare = (patchOptions && patchOptions.diff) ? patchOptions.diff : compareTaskCallbackVsDelegate;
            var unpatchedEvents = Zone[zoneSymbol('UNPATCHED_EVENTS')];
            var passiveEvents = _global[zoneSymbol('PASSIVE_EVENTS')];
            var makeAddListener = function (nativeListener, addSource, customScheduleFn, customCancelFn, returnTarget, prepend) {
                if (returnTarget === void 0) { returnTarget = false; }
                if (prepend === void 0) { prepend = false; }
                return function () {
                    var target = this || _global;
                    var eventName = arguments[0];
                    if (patchOptions && patchOptions.transferEventName) {
                        eventName = patchOptions.transferEventName(eventName);
                    }
                    var delegate = arguments[1];
                    if (!delegate) {
                        return nativeListener.apply(this, arguments);
                    }
                    if (isNode && eventName === 'uncaughtException') {
                        // don't patch uncaughtException of nodejs to prevent endless loop
                        return nativeListener.apply(this, arguments);
                    }
                    // don't create the bind delegate function for handleEvent
                    // case here to improve addEventListener performance
                    // we will create the bind delegate when invoke
                    var isHandleEvent = false;
                    if (typeof delegate !== 'function') {
                        if (!delegate.handleEvent) {
                            return nativeListener.apply(this, arguments);
                        }
                        isHandleEvent = true;
                    }
                    if (validateHandler && !validateHandler(nativeListener, delegate, target, arguments)) {
                        return;
                    }
                    var passive = passiveSupported && !!passiveEvents && passiveEvents.indexOf(eventName) !== -1;
                    var options = buildEventListenerOptions(arguments[2], passive);
                    if (unpatchedEvents) {
                        // check unpatched list
                        for (var i = 0; i < unpatchedEvents.length; i++) {
                            if (eventName === unpatchedEvents[i]) {
                                if (passive) {
                                    return nativeListener.call(target, eventName, delegate, options);
                                }
                                else {
                                    return nativeListener.apply(this, arguments);
                                }
                            }
                        }
                    }
                    var capture = !options ? false : typeof options === 'boolean' ? true : options.capture;
                    var once = options && typeof options === 'object' ? options.once : false;
                    var zone = Zone.current;
                    var symbolEventNames = zoneSymbolEventNames[eventName];
                    if (!symbolEventNames) {
                        prepareEventNames(eventName, eventNameToString);
                        symbolEventNames = zoneSymbolEventNames[eventName];
                    }
                    var symbolEventName = symbolEventNames[capture ? TRUE_STR : FALSE_STR];
                    var existingTasks = target[symbolEventName];
                    var isExisting = false;
                    if (existingTasks) {
                        // already have task registered
                        isExisting = true;
                        if (checkDuplicate) {
                            for (var i = 0; i < existingTasks.length; i++) {
                                if (compare(existingTasks[i], delegate)) {
                                    // same callback, same capture, same event name, just return
                                    return;
                                }
                            }
                        }
                    }
                    else {
                        existingTasks = target[symbolEventName] = [];
                    }
                    var source;
                    var constructorName = target.constructor['name'];
                    var targetSource = globalSources[constructorName];
                    if (targetSource) {
                        source = targetSource[eventName];
                    }
                    if (!source) {
                        source = constructorName + addSource +
                            (eventNameToString ? eventNameToString(eventName) : eventName);
                    }
                    // do not create a new object as task.data to pass those things
                    // just use the global shared one
                    taskData.options = options;
                    if (once) {
                        // if addEventListener with once options, we don't pass it to
                        // native addEventListener, instead we keep the once setting
                        // and handle ourselves.
                        taskData.options.once = false;
                    }
                    taskData.target = target;
                    taskData.capture = capture;
                    taskData.eventName = eventName;
                    taskData.isExisting = isExisting;
                    var data = useGlobalCallback ? OPTIMIZED_ZONE_EVENT_TASK_DATA : undefined;
                    // keep taskData into data to allow onScheduleEventTask to access the task information
                    if (data) {
                        data.taskData = taskData;
                    }
                    var task = zone.scheduleEventTask(source, delegate, data, customScheduleFn, customCancelFn);
                    // should clear taskData.target to avoid memory leak
                    // issue, https://github.com/angular/angular/issues/20442
                    taskData.target = null;
                    // need to clear up taskData because it is a global object
                    if (data) {
                        data.taskData = null;
                    }
                    // have to save those information to task in case
                    // application may call task.zone.cancelTask() directly
                    if (once) {
                        options.once = true;
                    }
                    if (!(!passiveSupported && typeof task.options === 'boolean')) {
                        // if not support passive, and we pass an option object
                        // to addEventListener, we should save the options to task
                        task.options = options;
                    }
                    task.target = target;
                    task.capture = capture;
                    task.eventName = eventName;
                    if (isHandleEvent) {
                        // save original delegate for compare to check duplicate
                        task.originalDelegate = delegate;
                    }
                    if (!prepend) {
                        existingTasks.push(task);
                    }
                    else {
                        existingTasks.unshift(task);
                    }
                    if (returnTarget) {
                        return target;
                    }
                };
            };
            proto[ADD_EVENT_LISTENER] = makeAddListener(nativeAddEventListener, ADD_EVENT_LISTENER_SOURCE, customSchedule, customCancel, returnTarget);
            if (nativePrependEventListener) {
                proto[PREPEND_EVENT_LISTENER] = makeAddListener(nativePrependEventListener, PREPEND_EVENT_LISTENER_SOURCE, customSchedulePrepend, customCancel, returnTarget, true);
            }
            proto[REMOVE_EVENT_LISTENER] = function () {
                var target = this || _global;
                var eventName = arguments[0];
                if (patchOptions && patchOptions.transferEventName) {
                    eventName = patchOptions.transferEventName(eventName);
                }
                var options = arguments[2];
                var capture = !options ? false : typeof options === 'boolean' ? true : options.capture;
                var delegate = arguments[1];
                if (!delegate) {
                    return nativeRemoveEventListener.apply(this, arguments);
                }
                if (validateHandler &&
                    !validateHandler(nativeRemoveEventListener, delegate, target, arguments)) {
                    return;
                }
                var symbolEventNames = zoneSymbolEventNames[eventName];
                var symbolEventName;
                if (symbolEventNames) {
                    symbolEventName = symbolEventNames[capture ? TRUE_STR : FALSE_STR];
                }
                var existingTasks = symbolEventName && target[symbolEventName];
                if (existingTasks) {
                    for (var i = 0; i < existingTasks.length; i++) {
                        var existingTask = existingTasks[i];
                        if (compare(existingTask, delegate)) {
                            existingTasks.splice(i, 1);
                            // set isRemoved to data for faster invokeTask check
                            existingTask.isRemoved = true;
                            if (existingTasks.length === 0) {
                                // all tasks for the eventName + capture have gone,
                                // remove globalZoneAwareCallback and remove the task cache from target
                                existingTask.allRemoved = true;
                                target[symbolEventName] = null;
                                // in the target, we have an event listener which is added by on_property
                                // such as target.onclick = function() {}, so we need to clear this internal
                                // property too if all delegates all removed
                                if (typeof eventName === 'string') {
                                    var onPropertySymbol = ZONE_SYMBOL_PREFIX + 'ON_PROPERTY' + eventName;
                                    target[onPropertySymbol] = null;
                                }
                            }
                            existingTask.zone.cancelTask(existingTask);
                            if (returnTarget) {
                                return target;
                            }
                            return;
                        }
                    }
                }
                // issue 930, didn't find the event name or callback
                // from zone kept existingTasks, the callback maybe
                // added outside of zone, we need to call native removeEventListener
                // to try to remove it.
                return nativeRemoveEventListener.apply(this, arguments);
            };
            proto[LISTENERS_EVENT_LISTENER] = function () {
                var target = this || _global;
                var eventName = arguments[0];
                if (patchOptions && patchOptions.transferEventName) {
                    eventName = patchOptions.transferEventName(eventName);
                }
                var listeners = [];
                var tasks = findEventTasks(target, eventNameToString ? eventNameToString(eventName) : eventName);
                for (var i = 0; i < tasks.length; i++) {
                    var task = tasks[i];
                    var delegate = task.originalDelegate ? task.originalDelegate : task.callback;
                    listeners.push(delegate);
                }
                return listeners;
            };
            proto[REMOVE_ALL_LISTENERS_EVENT_LISTENER] = function () {
                var target = this || _global;
                var eventName = arguments[0];
                if (!eventName) {
                    var keys = Object.keys(target);
                    for (var i = 0; i < keys.length; i++) {
                        var prop = keys[i];
                        var match = EVENT_NAME_SYMBOL_REGX.exec(prop);
                        var evtName = match && match[1];
                        // in nodejs EventEmitter, removeListener event is
                        // used for monitoring the removeListener call,
                        // so just keep removeListener eventListener until
                        // all other eventListeners are removed
                        if (evtName && evtName !== 'removeListener') {
                            this[REMOVE_ALL_LISTENERS_EVENT_LISTENER].call(this, evtName);
                        }
                    }
                    // remove removeListener listener finally
                    this[REMOVE_ALL_LISTENERS_EVENT_LISTENER].call(this, 'removeListener');
                }
                else {
                    if (patchOptions && patchOptions.transferEventName) {
                        eventName = patchOptions.transferEventName(eventName);
                    }
                    var symbolEventNames = zoneSymbolEventNames[eventName];
                    if (symbolEventNames) {
                        var symbolEventName = symbolEventNames[FALSE_STR];
                        var symbolCaptureEventName = symbolEventNames[TRUE_STR];
                        var tasks = target[symbolEventName];
                        var captureTasks = target[symbolCaptureEventName];
                        if (tasks) {
                            var removeTasks = tasks.slice();
                            for (var i = 0; i < removeTasks.length; i++) {
                                var task = removeTasks[i];
                                var delegate = task.originalDelegate ? task.originalDelegate : task.callback;
                                this[REMOVE_EVENT_LISTENER].call(this, eventName, delegate, task.options);
                            }
                        }
                        if (captureTasks) {
                            var removeTasks = captureTasks.slice();
                            for (var i = 0; i < removeTasks.length; i++) {
                                var task = removeTasks[i];
                                var delegate = task.originalDelegate ? task.originalDelegate : task.callback;
                                this[REMOVE_EVENT_LISTENER].call(this, eventName, delegate, task.options);
                            }
                        }
                    }
                }
                if (returnTarget) {
                    return this;
                }
            };
            // for native toString patch
            attachOriginToPatched(proto[ADD_EVENT_LISTENER], nativeAddEventListener);
            attachOriginToPatched(proto[REMOVE_EVENT_LISTENER], nativeRemoveEventListener);
            if (nativeRemoveAllListeners) {
                attachOriginToPatched(proto[REMOVE_ALL_LISTENERS_EVENT_LISTENER], nativeRemoveAllListeners);
            }
            if (nativeListeners) {
                attachOriginToPatched(proto[LISTENERS_EVENT_LISTENER], nativeListeners);
            }
            return true;
        }
        var results = [];
        for (var i = 0; i < apis.length; i++) {
            results[i] = patchEventTargetMethods(apis[i], patchOptions);
        }
        return results;
    }
    function findEventTasks(target, eventName) {
        if (!eventName) {
            var foundTasks = [];
            for (var prop in target) {
                var match = EVENT_NAME_SYMBOL_REGX.exec(prop);
                var evtName = match && match[1];
                if (evtName && (!eventName || evtName === eventName)) {
                    var tasks = target[prop];
                    if (tasks) {
                        for (var i = 0; i < tasks.length; i++) {
                            foundTasks.push(tasks[i]);
                        }
                    }
                }
            }
            return foundTasks;
        }
        var symbolEventName = zoneSymbolEventNames[eventName];
        if (!symbolEventName) {
            prepareEventNames(eventName);
            symbolEventName = zoneSymbolEventNames[eventName];
        }
        var captureFalseTasks = target[symbolEventName[FALSE_STR]];
        var captureTrueTasks = target[symbolEventName[TRUE_STR]];
        if (!captureFalseTasks) {
            return captureTrueTasks ? captureTrueTasks.slice() : [];
        }
        else {
            return captureTrueTasks ? captureFalseTasks.concat(captureTrueTasks) :
                captureFalseTasks.slice();
        }
    }
    function patchEventPrototype(global, api) {
        var Event = global['Event'];
        if (Event && Event.prototype) {
            api.patchMethod(Event.prototype, 'stopImmediatePropagation', function (delegate) { return function (self, args) {
                self[IMMEDIATE_PROPAGATION_SYMBOL] = true;
                // we need to call the native stopImmediatePropagation
                // in case in some hybrid application, some part of
                // application will be controlled by zone, some are not
                delegate && delegate.apply(self, args);
            }; });
        }
    }
    function patchCallbacks(api, target, targetName, method, callbacks) {
        var symbol = Zone.__symbol__(method);
        if (target[symbol]) {
            return;
        }
        var nativeDelegate = target[symbol] = target[method];
        target[method] = function (name, opts, options) {
            if (opts && opts.prototype) {
                callbacks.forEach(function (callback) {
                    var source = "".concat(targetName, ".").concat(method, "::") + callback;
                    var prototype = opts.prototype;
                    // Note: the `patchCallbacks` is used for patching the `document.registerElement` and
                    // `customElements.define`. We explicitly wrap the patching code into try-catch since
                    // callbacks may be already patched by other web components frameworks (e.g. LWC), and they
                    // make those properties non-writable. This means that patching callback will throw an error
                    // `cannot assign to read-only property`. See this code as an example:
                    // https://github.com/salesforce/lwc/blob/master/packages/@lwc/engine-core/src/framework/base-bridge-element.ts#L180-L186
                    // We don't want to stop the application rendering if we couldn't patch some
                    // callback, e.g. `attributeChangedCallback`.
                    try {
                        if (prototype.hasOwnProperty(callback)) {
                            var descriptor = api.ObjectGetOwnPropertyDescriptor(prototype, callback);
                            if (descriptor && descriptor.value) {
                                descriptor.value = api.wrapWithCurrentZone(descriptor.value, source);
                                api._redefineProperty(opts.prototype, callback, descriptor);
                            }
                            else if (prototype[callback]) {
                                prototype[callback] = api.wrapWithCurrentZone(prototype[callback], source);
                            }
                        }
                        else if (prototype[callback]) {
                            prototype[callback] = api.wrapWithCurrentZone(prototype[callback], source);
                        }
                    }
                    catch (_a) {
                        // Note: we leave the catch block empty since there's no way to handle the error related
                        // to non-writable property.
                    }
                });
            }
            return nativeDelegate.call(target, name, opts, options);
        };
        api.attachOriginToPatched(target[method], nativeDelegate);
    }
    /**
     * @fileoverview
     * @suppress {globalThis}
     */
    function filterProperties(target, onProperties, ignoreProperties) {
        if (!ignoreProperties || ignoreProperties.length === 0) {
            return onProperties;
        }
        var tip = ignoreProperties.filter(function (ip) { return ip.target === target; });
        if (!tip || tip.length === 0) {
            return onProperties;
        }
        var targetIgnoreProperties = tip[0].ignoreProperties;
        return onProperties.filter(function (op) { return targetIgnoreProperties.indexOf(op) === -1; });
    }
    function patchFilteredProperties(target, onProperties, ignoreProperties, prototype) {
        // check whether target is available, sometimes target will be undefined
        // because different browser or some 3rd party plugin.
        if (!target) {
            return;
        }
        var filteredProperties = filterProperties(target, onProperties, ignoreProperties);
        patchOnProperties(target, filteredProperties, prototype);
    }
    /**
     * Get all event name properties which the event name startsWith `on`
     * from the target object itself, inherited properties are not considered.
     */
    function getOnEventNames(target) {
        return Object.getOwnPropertyNames(target)
            .filter(function (name) { return name.startsWith('on') && name.length > 2; })
            .map(function (name) { return name.substring(2); });
    }
    function propertyDescriptorPatch(api, _global) {
        if (isNode && !isMix) {
            return;
        }
        if (Zone[api.symbol('patchEvents')]) {
            // events are already been patched by legacy patch.
            return;
        }
        var ignoreProperties = _global['__Zone_ignore_on_properties'];
        // for browsers that we can patch the descriptor:  Chrome & Firefox
        var patchTargets = [];
        if (isBrowser) {
            var internalWindow_1 = window;
            patchTargets = patchTargets.concat([
                'Document', 'SVGElement', 'Element', 'HTMLElement', 'HTMLBodyElement', 'HTMLMediaElement',
                'HTMLFrameSetElement', 'HTMLFrameElement', 'HTMLIFrameElement', 'HTMLMarqueeElement', 'Worker'
            ]);
            var ignoreErrorProperties = isIE() ? [{ target: internalWindow_1, ignoreProperties: ['error'] }] : [];
            // in IE/Edge, onProp not exist in window object, but in WindowPrototype
            // so we need to pass WindowPrototype to check onProp exist or not
            patchFilteredProperties(internalWindow_1, getOnEventNames(internalWindow_1), ignoreProperties ? ignoreProperties.concat(ignoreErrorProperties) : ignoreProperties, ObjectGetPrototypeOf(internalWindow_1));
        }
        patchTargets = patchTargets.concat([
            'XMLHttpRequest', 'XMLHttpRequestEventTarget', 'IDBIndex', 'IDBRequest', 'IDBOpenDBRequest',
            'IDBDatabase', 'IDBTransaction', 'IDBCursor', 'WebSocket'
        ]);
        for (var i = 0; i < patchTargets.length; i++) {
            var target = _global[patchTargets[i]];
            target && target.prototype &&
                patchFilteredProperties(target.prototype, getOnEventNames(target.prototype), ignoreProperties);
        }
    }
    Zone.__load_patch('util', function (global, Zone, api) {
        // Collect native event names by looking at properties
        // on the global namespace, e.g. 'onclick'.
        var eventNames = getOnEventNames(global);
        api.patchOnProperties = patchOnProperties;
        api.patchMethod = patchMethod;
        api.bindArguments = bindArguments;
        api.patchMacroTask = patchMacroTask;
        // In earlier version of zone.js (<0.9.0), we use env name `__zone_symbol__BLACK_LISTED_EVENTS` to
        // define which events will not be patched by `Zone.js`.
        // In newer version (>=0.9.0), we change the env name to `__zone_symbol__UNPATCHED_EVENTS` to keep
        // the name consistent with angular repo.
        // The  `__zone_symbol__BLACK_LISTED_EVENTS` is deprecated, but it is still be supported for
        // backwards compatibility.
        var SYMBOL_BLACK_LISTED_EVENTS = Zone.__symbol__('BLACK_LISTED_EVENTS');
        var SYMBOL_UNPATCHED_EVENTS = Zone.__symbol__('UNPATCHED_EVENTS');
        if (global[SYMBOL_UNPATCHED_EVENTS]) {
            global[SYMBOL_BLACK_LISTED_EVENTS] = global[SYMBOL_UNPATCHED_EVENTS];
        }
        if (global[SYMBOL_BLACK_LISTED_EVENTS]) {
            Zone[SYMBOL_BLACK_LISTED_EVENTS] = Zone[SYMBOL_UNPATCHED_EVENTS] =
                global[SYMBOL_BLACK_LISTED_EVENTS];
        }
        api.patchEventPrototype = patchEventPrototype;
        api.patchEventTarget = patchEventTarget;
        api.isIEOrEdge = isIEOrEdge;
        api.ObjectDefineProperty = ObjectDefineProperty;
        api.ObjectGetOwnPropertyDescriptor = ObjectGetOwnPropertyDescriptor;
        api.ObjectCreate = ObjectCreate;
        api.ArraySlice = ArraySlice;
        api.patchClass = patchClass;
        api.wrapWithCurrentZone = wrapWithCurrentZone;
        api.filterProperties = filterProperties;
        api.attachOriginToPatched = attachOriginToPatched;
        api._redefineProperty = Object.defineProperty;
        api.patchCallbacks = patchCallbacks;
        api.getGlobalObjects = function () { return ({
            globalSources: globalSources,
            zoneSymbolEventNames: zoneSymbolEventNames,
            eventNames: eventNames,
            isBrowser: isBrowser,
            isMix: isMix,
            isNode: isNode,
            TRUE_STR: TRUE_STR,
            FALSE_STR: FALSE_STR,
            ZONE_SYMBOL_PREFIX: ZONE_SYMBOL_PREFIX,
            ADD_EVENT_LISTENER_STR: ADD_EVENT_LISTENER_STR,
            REMOVE_EVENT_LISTENER_STR: REMOVE_EVENT_LISTENER_STR
        }); };
    });
    /**
     * @fileoverview
     * @suppress {missingRequire}
     */
    function patchQueueMicrotask(global, api) {
        api.patchMethod(global, 'queueMicrotask', function (delegate) {
            return function (self, args) {
                Zone.current.scheduleMicroTask('queueMicrotask', args[0]);
            };
        });
    }
    /**
     * @fileoverview
     * @suppress {missingRequire}
     */
    var taskSymbol = zoneSymbol('zoneTask');
    function patchTimer(window, setName, cancelName, nameSuffix) {
        var setNative = null;
        var clearNative = null;
        setName += nameSuffix;
        cancelName += nameSuffix;
        var tasksByHandleId = {};
        function scheduleTask(task) {
            var data = task.data;
            data.args[0] = function () {
                return task.invoke.apply(this, arguments);
            };
            data.handleId = setNative.apply(window, data.args);
            return task;
        }
        function clearTask(task) {
            return clearNative.call(window, task.data.handleId);
        }
        setNative =
            patchMethod(window, setName, function (delegate) { return function (self, args) {
                if (typeof args[0] === 'function') {
                    var options_1 = {
                        isPeriodic: nameSuffix === 'Interval',
                        delay: (nameSuffix === 'Timeout' || nameSuffix === 'Interval') ? args[1] || 0 :
                            undefined,
                        args: args
                    };
                    var callback_1 = args[0];
                    args[0] = function timer() {
                        try {
                            return callback_1.apply(this, arguments);
                        }
                        finally {
                            // issue-934, task will be cancelled
                            // even it is a periodic task such as
                            // setInterval
                            // https://github.com/angular/angular/issues/40387
                            // Cleanup tasksByHandleId should be handled before scheduleTask
                            // Since some zoneSpec may intercept and doesn't trigger
                            // scheduleFn(scheduleTask) provided here.
                            if (!(options_1.isPeriodic)) {
                                if (typeof options_1.handleId === 'number') {
                                    // in non-nodejs env, we remove timerId
                                    // from local cache
                                    delete tasksByHandleId[options_1.handleId];
                                }
                                else if (options_1.handleId) {
                                    // Node returns complex objects as handleIds
                                    // we remove task reference from timer object
                                    options_1.handleId[taskSymbol] = null;
                                }
                            }
                        }
                    };
                    var task = scheduleMacroTaskWithCurrentZone(setName, args[0], options_1, scheduleTask, clearTask);
                    if (!task) {
                        return task;
                    }
                    // Node.js must additionally support the ref and unref functions.
                    var handle = task.data.handleId;
                    if (typeof handle === 'number') {
                        // for non nodejs env, we save handleId: task
                        // mapping in local cache for clearTimeout
                        tasksByHandleId[handle] = task;
                    }
                    else if (handle) {
                        // for nodejs env, we save task
                        // reference in timerId Object for clearTimeout
                        handle[taskSymbol] = task;
                    }
                    // check whether handle is null, because some polyfill or browser
                    // may return undefined from setTimeout/setInterval/setImmediate/requestAnimationFrame
                    if (handle && handle.ref && handle.unref && typeof handle.ref === 'function' &&
                        typeof handle.unref === 'function') {
                        task.ref = handle.ref.bind(handle);
                        task.unref = handle.unref.bind(handle);
                    }
                    if (typeof handle === 'number' || handle) {
                        return handle;
                    }
                    return task;
                }
                else {
                    // cause an error by calling it directly.
                    return delegate.apply(window, args);
                }
            }; });
        clearNative =
            patchMethod(window, cancelName, function (delegate) { return function (self, args) {
                var id = args[0];
                var task;
                if (typeof id === 'number') {
                    // non nodejs env.
                    task = tasksByHandleId[id];
                }
                else {
                    // nodejs env.
                    task = id && id[taskSymbol];
                    // other environments.
                    if (!task) {
                        task = id;
                    }
                }
                if (task && typeof task.type === 'string') {
                    if (task.state !== 'notScheduled' &&
                        (task.cancelFn && task.data.isPeriodic || task.runCount === 0)) {
                        if (typeof id === 'number') {
                            delete tasksByHandleId[id];
                        }
                        else if (id) {
                            id[taskSymbol] = null;
                        }
                        // Do not cancel already canceled functions
                        task.zone.cancelTask(task);
                    }
                }
                else {
                    // cause an error by calling it directly.
                    delegate.apply(window, args);
                }
            }; });
    }
    function patchCustomElements(_global, api) {
        var _a = api.getGlobalObjects(), isBrowser = _a.isBrowser, isMix = _a.isMix;
        if ((!isBrowser && !isMix) || !_global['customElements'] || !('customElements' in _global)) {
            return;
        }
        var callbacks = ['connectedCallback', 'disconnectedCallback', 'adoptedCallback', 'attributeChangedCallback'];
        api.patchCallbacks(api, _global.customElements, 'customElements', 'define', callbacks);
    }
    function eventTargetPatch(_global, api) {
        if (Zone[api.symbol('patchEventTarget')]) {
            // EventTarget is already patched.
            return;
        }
        var _a = api.getGlobalObjects(), eventNames = _a.eventNames, zoneSymbolEventNames = _a.zoneSymbolEventNames, TRUE_STR = _a.TRUE_STR, FALSE_STR = _a.FALSE_STR, ZONE_SYMBOL_PREFIX = _a.ZONE_SYMBOL_PREFIX;
        //  predefine all __zone_symbol__ + eventName + true/false string
        for (var i = 0; i < eventNames.length; i++) {
            var eventName = eventNames[i];
            var falseEventName = eventName + FALSE_STR;
            var trueEventName = eventName + TRUE_STR;
            var symbol = ZONE_SYMBOL_PREFIX + falseEventName;
            var symbolCapture = ZONE_SYMBOL_PREFIX + trueEventName;
            zoneSymbolEventNames[eventName] = {};
            zoneSymbolEventNames[eventName][FALSE_STR] = symbol;
            zoneSymbolEventNames[eventName][TRUE_STR] = symbolCapture;
        }
        var EVENT_TARGET = _global['EventTarget'];
        if (!EVENT_TARGET || !EVENT_TARGET.prototype) {
            return;
        }
        api.patchEventTarget(_global, api, [EVENT_TARGET && EVENT_TARGET.prototype]);
        return true;
    }
    function patchEvent(global, api) {
        api.patchEventPrototype(global, api);
    }
    /**
     * @fileoverview
     * @suppress {missingRequire}
     */
    Zone.__load_patch('legacy', function (global) {
        var legacyPatch = global[Zone.__symbol__('legacyPatch')];
        if (legacyPatch) {
            legacyPatch();
        }
    });
    Zone.__load_patch('timers', function (global) {
        var set = 'set';
        var clear = 'clear';
        patchTimer(global, set, clear, 'Timeout');
        patchTimer(global, set, clear, 'Interval');
        patchTimer(global, set, clear, 'Immediate');
    });
    Zone.__load_patch('requestAnimationFrame', function (global) {
        patchTimer(global, 'request', 'cancel', 'AnimationFrame');
        patchTimer(global, 'mozRequest', 'mozCancel', 'AnimationFrame');
        patchTimer(global, 'webkitRequest', 'webkitCancel', 'AnimationFrame');
    });
    Zone.__load_patch('blocking', function (global, Zone) {
        var blockingMethods = ['alert', 'prompt', 'confirm'];
        for (var i = 0; i < blockingMethods.length; i++) {
            var name_2 = blockingMethods[i];
            patchMethod(global, name_2, function (delegate, symbol, name) {
                return function (s, args) {
                    return Zone.current.run(delegate, global, args, name);
                };
            });
        }
    });
    Zone.__load_patch('EventTarget', function (global, Zone, api) {
        patchEvent(global, api);
        eventTargetPatch(global, api);
        // patch XMLHttpRequestEventTarget's addEventListener/removeEventListener
        var XMLHttpRequestEventTarget = global['XMLHttpRequestEventTarget'];
        if (XMLHttpRequestEventTarget && XMLHttpRequestEventTarget.prototype) {
            api.patchEventTarget(global, api, [XMLHttpRequestEventTarget.prototype]);
        }
    });
    Zone.__load_patch('MutationObserver', function (global, Zone, api) {
        patchClass('MutationObserver');
        patchClass('WebKitMutationObserver');
    });
    Zone.__load_patch('IntersectionObserver', function (global, Zone, api) {
        patchClass('IntersectionObserver');
    });
    Zone.__load_patch('FileReader', function (global, Zone, api) {
        patchClass('FileReader');
    });
    Zone.__load_patch('on_property', function (global, Zone, api) {
        propertyDescriptorPatch(api, global);
    });
    Zone.__load_patch('customElements', function (global, Zone, api) {
        patchCustomElements(global, api);
    });
    Zone.__load_patch('XHR', function (global, Zone) {
        // Treat XMLHttpRequest as a macrotask.
        patchXHR(global);
        var XHR_TASK = zoneSymbol('xhrTask');
        var XHR_SYNC = zoneSymbol('xhrSync');
        var XHR_LISTENER = zoneSymbol('xhrListener');
        var XHR_SCHEDULED = zoneSymbol('xhrScheduled');
        var XHR_URL = zoneSymbol('xhrURL');
        var XHR_ERROR_BEFORE_SCHEDULED = zoneSymbol('xhrErrorBeforeScheduled');
        function patchXHR(window) {
            var XMLHttpRequest = window['XMLHttpRequest'];
            if (!XMLHttpRequest) {
                // XMLHttpRequest is not available in service worker
                return;
            }
            var XMLHttpRequestPrototype = XMLHttpRequest.prototype;
            function findPendingTask(target) {
                return target[XHR_TASK];
            }
            var oriAddListener = XMLHttpRequestPrototype[ZONE_SYMBOL_ADD_EVENT_LISTENER];
            var oriRemoveListener = XMLHttpRequestPrototype[ZONE_SYMBOL_REMOVE_EVENT_LISTENER];
            if (!oriAddListener) {
                var XMLHttpRequestEventTarget_1 = window['XMLHttpRequestEventTarget'];
                if (XMLHttpRequestEventTarget_1) {
                    var XMLHttpRequestEventTargetPrototype = XMLHttpRequestEventTarget_1.prototype;
                    oriAddListener = XMLHttpRequestEventTargetPrototype[ZONE_SYMBOL_ADD_EVENT_LISTENER];
                    oriRemoveListener = XMLHttpRequestEventTargetPrototype[ZONE_SYMBOL_REMOVE_EVENT_LISTENER];
                }
            }
            var READY_STATE_CHANGE = 'readystatechange';
            var SCHEDULED = 'scheduled';
            function scheduleTask(task) {
                var data = task.data;
                var target = data.target;
                target[XHR_SCHEDULED] = false;
                target[XHR_ERROR_BEFORE_SCHEDULED] = false;
                // remove existing event listener
                var listener = target[XHR_LISTENER];
                if (!oriAddListener) {
                    oriAddListener = target[ZONE_SYMBOL_ADD_EVENT_LISTENER];
                    oriRemoveListener = target[ZONE_SYMBOL_REMOVE_EVENT_LISTENER];
                }
                if (listener) {
                    oriRemoveListener.call(target, READY_STATE_CHANGE, listener);
                }
                var newListener = target[XHR_LISTENER] = function () {
                    if (target.readyState === target.DONE) {
                        // sometimes on some browsers XMLHttpRequest will fire onreadystatechange with
                        // readyState=4 multiple times, so we need to check task state here
                        if (!data.aborted && target[XHR_SCHEDULED] && task.state === SCHEDULED) {
                            // check whether the xhr has registered onload listener
                            // if that is the case, the task should invoke after all
                            // onload listeners finish.
                            // Also if the request failed without response (status = 0), the load event handler
                            // will not be triggered, in that case, we should also invoke the placeholder callback
                            // to close the XMLHttpRequest::send macroTask.
                            // https://github.com/angular/angular/issues/38795
                            var loadTasks = target[Zone.__symbol__('loadfalse')];
                            if (target.status !== 0 && loadTasks && loadTasks.length > 0) {
                                var oriInvoke_1 = task.invoke;
                                task.invoke = function () {
                                    // need to load the tasks again, because in other
                                    // load listener, they may remove themselves
                                    var loadTasks = target[Zone.__symbol__('loadfalse')];
                                    for (var i = 0; i < loadTasks.length; i++) {
                                        if (loadTasks[i] === task) {
                                            loadTasks.splice(i, 1);
                                        }
                                    }
                                    if (!data.aborted && task.state === SCHEDULED) {
                                        oriInvoke_1.call(task);
                                    }
                                };
                                loadTasks.push(task);
                            }
                            else {
                                task.invoke();
                            }
                        }
                        else if (!data.aborted && target[XHR_SCHEDULED] === false) {
                            // error occurs when xhr.send()
                            target[XHR_ERROR_BEFORE_SCHEDULED] = true;
                        }
                    }
                };
                oriAddListener.call(target, READY_STATE_CHANGE, newListener);
                var storedTask = target[XHR_TASK];
                if (!storedTask) {
                    target[XHR_TASK] = task;
                }
                sendNative.apply(target, data.args);
                target[XHR_SCHEDULED] = true;
                return task;
            }
            function placeholderCallback() { }
            function clearTask(task) {
                var data = task.data;
                // Note - ideally, we would call data.target.removeEventListener here, but it's too late
                // to prevent it from firing. So instead, we store info for the event listener.
                data.aborted = true;
                return abortNative.apply(data.target, data.args);
            }
            var openNative = patchMethod(XMLHttpRequestPrototype, 'open', function () { return function (self, args) {
                self[XHR_SYNC] = args[2] == false;
                self[XHR_URL] = args[1];
                return openNative.apply(self, args);
            }; });
            var XMLHTTPREQUEST_SOURCE = 'XMLHttpRequest.send';
            var fetchTaskAborting = zoneSymbol('fetchTaskAborting');
            var fetchTaskScheduling = zoneSymbol('fetchTaskScheduling');
            var sendNative = patchMethod(XMLHttpRequestPrototype, 'send', function () { return function (self, args) {
                if (Zone.current[fetchTaskScheduling] === true) {
                    // a fetch is scheduling, so we are using xhr to polyfill fetch
                    // and because we already schedule macroTask for fetch, we should
                    // not schedule a macroTask for xhr again
                    return sendNative.apply(self, args);
                }
                if (self[XHR_SYNC]) {
                    // if the XHR is sync there is no task to schedule, just execute the code.
                    return sendNative.apply(self, args);
                }
                else {
                    var options = { target: self, url: self[XHR_URL], isPeriodic: false, args: args, aborted: false };
                    var task = scheduleMacroTaskWithCurrentZone(XMLHTTPREQUEST_SOURCE, placeholderCallback, options, scheduleTask, clearTask);
                    if (self && self[XHR_ERROR_BEFORE_SCHEDULED] === true && !options.aborted &&
                        task.state === SCHEDULED) {
                        // xhr request throw error when send
                        // we should invoke task instead of leaving a scheduled
                        // pending macroTask
                        task.invoke();
                    }
                }
            }; });
            var abortNative = patchMethod(XMLHttpRequestPrototype, 'abort', function () { return function (self, args) {
                var task = findPendingTask(self);
                if (task && typeof task.type == 'string') {
                    // If the XHR has already completed, do nothing.
                    // If the XHR has already been aborted, do nothing.
                    // Fix #569, call abort multiple times before done will cause
                    // macroTask task count be negative number
                    if (task.cancelFn == null || (task.data && task.data.aborted)) {
                        return;
                    }
                    task.zone.cancelTask(task);
                }
                else if (Zone.current[fetchTaskAborting] === true) {
                    // the abort is called from fetch polyfill, we need to call native abort of XHR.
                    return abortNative.apply(self, args);
                }
                // Otherwise, we are trying to abort an XHR which has not yet been sent, so there is no
                // task
                // to cancel. Do nothing.
            }; });
        }
    });
    Zone.__load_patch('geolocation', function (global) {
        /// GEO_LOCATION
        if (global['navigator'] && global['navigator'].geolocation) {
            patchPrototype(global['navigator'].geolocation, ['getCurrentPosition', 'watchPosition']);
        }
    });
    Zone.__load_patch('PromiseRejectionEvent', function (global, Zone) {
        // handle unhandled promise rejection
        function findPromiseRejectionHandler(evtName) {
            return function (e) {
                var eventTasks = findEventTasks(global, evtName);
                eventTasks.forEach(function (eventTask) {
                    // windows has added unhandledrejection event listener
                    // trigger the event listener
                    var PromiseRejectionEvent = global['PromiseRejectionEvent'];
                    if (PromiseRejectionEvent) {
                        var evt = new PromiseRejectionEvent(evtName, { promise: e.promise, reason: e.rejection });
                        eventTask.invoke(evt);
                    }
                });
            };
        }
        if (global['PromiseRejectionEvent']) {
            Zone[zoneSymbol('unhandledPromiseRejectionHandler')] =
                findPromiseRejectionHandler('unhandledrejection');
            Zone[zoneSymbol('rejectionHandledHandler')] =
                findPromiseRejectionHandler('rejectionhandled');
        }
    });
    Zone.__load_patch('queueMicrotask', function (global, Zone, api) {
        patchQueueMicrotask(global, api);
    });
}));

;/*!
 * Quill Editor v1.3.7
 * https://quilljs.com/
 * Copyright (c) 2014, Jason Chen
 * Copyright (c) 2013, salesforce.com
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Quill"] = factory();
	else
		root["Quill"] = factory();
})(typeof self !== 'undefined' ? self : this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 109);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var container_1 = __webpack_require__(17);
var format_1 = __webpack_require__(18);
var leaf_1 = __webpack_require__(19);
var scroll_1 = __webpack_require__(45);
var inline_1 = __webpack_require__(46);
var block_1 = __webpack_require__(47);
var embed_1 = __webpack_require__(48);
var text_1 = __webpack_require__(49);
var attributor_1 = __webpack_require__(12);
var class_1 = __webpack_require__(32);
var style_1 = __webpack_require__(33);
var store_1 = __webpack_require__(31);
var Registry = __webpack_require__(1);
var Parchment = {
    Scope: Registry.Scope,
    create: Registry.create,
    find: Registry.find,
    query: Registry.query,
    register: Registry.register,
    Container: container_1.default,
    Format: format_1.default,
    Leaf: leaf_1.default,
    Embed: embed_1.default,
    Scroll: scroll_1.default,
    Block: block_1.default,
    Inline: inline_1.default,
    Text: text_1.default,
    Attributor: {
        Attribute: attributor_1.default,
        Class: class_1.default,
        Style: style_1.default,
        Store: store_1.default,
    },
};
exports.default = Parchment;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var ParchmentError = /** @class */ (function (_super) {
    __extends(ParchmentError, _super);
    function ParchmentError(message) {
        var _this = this;
        message = '[Parchment] ' + message;
        _this = _super.call(this, message) || this;
        _this.message = message;
        _this.name = _this.constructor.name;
        return _this;
    }
    return ParchmentError;
}(Error));
exports.ParchmentError = ParchmentError;
var attributes = {};
var classes = {};
var tags = {};
var types = {};
exports.DATA_KEY = '__blot';
var Scope;
(function (Scope) {
    Scope[Scope["TYPE"] = 3] = "TYPE";
    Scope[Scope["LEVEL"] = 12] = "LEVEL";
    Scope[Scope["ATTRIBUTE"] = 13] = "ATTRIBUTE";
    Scope[Scope["BLOT"] = 14] = "BLOT";
    Scope[Scope["INLINE"] = 7] = "INLINE";
    Scope[Scope["BLOCK"] = 11] = "BLOCK";
    Scope[Scope["BLOCK_BLOT"] = 10] = "BLOCK_BLOT";
    Scope[Scope["INLINE_BLOT"] = 6] = "INLINE_BLOT";
    Scope[Scope["BLOCK_ATTRIBUTE"] = 9] = "BLOCK_ATTRIBUTE";
    Scope[Scope["INLINE_ATTRIBUTE"] = 5] = "INLINE_ATTRIBUTE";
    Scope[Scope["ANY"] = 15] = "ANY";
})(Scope = exports.Scope || (exports.Scope = {}));
function create(input, value) {
    var match = query(input);
    if (match == null) {
        throw new ParchmentError("Unable to create " + input + " blot");
    }
    var BlotClass = match;
    var node = 
    // @ts-ignore
    input instanceof Node || input['nodeType'] === Node.TEXT_NODE ? input : BlotClass.create(value);
    return new BlotClass(node, value);
}
exports.create = create;
function find(node, bubble) {
    if (bubble === void 0) { bubble = false; }
    if (node == null)
        return null;
    // @ts-ignore
    if (node[exports.DATA_KEY] != null)
        return node[exports.DATA_KEY].blot;
    if (bubble)
        return find(node.parentNode, bubble);
    return null;
}
exports.find = find;
function query(query, scope) {
    if (scope === void 0) { scope = Scope.ANY; }
    var match;
    if (typeof query === 'string') {
        match = types[query] || attributes[query];
        // @ts-ignore
    }
    else if (query instanceof Text || query['nodeType'] === Node.TEXT_NODE) {
        match = types['text'];
    }
    else if (typeof query === 'number') {
        if (query & Scope.LEVEL & Scope.BLOCK) {
            match = types['block'];
        }
        else if (query & Scope.LEVEL & Scope.INLINE) {
            match = types['inline'];
        }
    }
    else if (query instanceof HTMLElement) {
        var names = (query.getAttribute('class') || '').split(/\s+/);
        for (var i in names) {
            match = classes[names[i]];
            if (match)
                break;
        }
        match = match || tags[query.tagName];
    }
    if (match == null)
        return null;
    // @ts-ignore
    if (scope & Scope.LEVEL & match.scope && scope & Scope.TYPE & match.scope)
        return match;
    return null;
}
exports.query = query;
function register() {
    var Definitions = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        Definitions[_i] = arguments[_i];
    }
    if (Definitions.length > 1) {
        return Definitions.map(function (d) {
            return register(d);
        });
    }
    var Definition = Definitions[0];
    if (typeof Definition.blotName !== 'string' && typeof Definition.attrName !== 'string') {
        throw new ParchmentError('Invalid definition');
    }
    else if (Definition.blotName === 'abstract') {
        throw new ParchmentError('Cannot register abstract class');
    }
    types[Definition.blotName || Definition.attrName] = Definition;
    if (typeof Definition.keyName === 'string') {
        attributes[Definition.keyName] = Definition;
    }
    else {
        if (Definition.className != null) {
            classes[Definition.className] = Definition;
        }
        if (Definition.tagName != null) {
            if (Array.isArray(Definition.tagName)) {
                Definition.tagName = Definition.tagName.map(function (tagName) {
                    return tagName.toUpperCase();
                });
            }
            else {
                Definition.tagName = Definition.tagName.toUpperCase();
            }
            var tagNames = Array.isArray(Definition.tagName) ? Definition.tagName : [Definition.tagName];
            tagNames.forEach(function (tag) {
                if (tags[tag] == null || Definition.className == null) {
                    tags[tag] = Definition;
                }
            });
        }
    }
    return Definition;
}
exports.register = register;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

var diff = __webpack_require__(51);
var equal = __webpack_require__(11);
var extend = __webpack_require__(3);
var op = __webpack_require__(20);


var NULL_CHARACTER = String.fromCharCode(0);  // Placeholder char for embed in diff()


var Delta = function (ops) {
  // Assume we are given a well formed ops
  if (Array.isArray(ops)) {
    this.ops = ops;
  } else if (ops != null && Array.isArray(ops.ops)) {
    this.ops = ops.ops;
  } else {
    this.ops = [];
  }
};


Delta.prototype.insert = function (text, attributes) {
  var newOp = {};
  if (text.length === 0) return this;
  newOp.insert = text;
  if (attributes != null && typeof attributes === 'object' && Object.keys(attributes).length > 0) {
    newOp.attributes = attributes;
  }
  return this.push(newOp);
};

Delta.prototype['delete'] = function (length) {
  if (length <= 0) return this;
  return this.push({ 'delete': length });
};

Delta.prototype.retain = function (length, attributes) {
  if (length <= 0) return this;
  var newOp = { retain: length };
  if (attributes != null && typeof attributes === 'object' && Object.keys(attributes).length > 0) {
    newOp.attributes = attributes;
  }
  return this.push(newOp);
};

Delta.prototype.push = function (newOp) {
  var index = this.ops.length;
  var lastOp = this.ops[index - 1];
  newOp = extend(true, {}, newOp);
  if (typeof lastOp === 'object') {
    if (typeof newOp['delete'] === 'number' && typeof lastOp['delete'] === 'number') {
      this.ops[index - 1] = { 'delete': lastOp['delete'] + newOp['delete'] };
      return this;
    }
    // Since it does not matter if we insert before or after deleting at the same index,
    // always prefer to insert first
    if (typeof lastOp['delete'] === 'number' && newOp.insert != null) {
      index -= 1;
      lastOp = this.ops[index - 1];
      if (typeof lastOp !== 'object') {
        this.ops.unshift(newOp);
        return this;
      }
    }
    if (equal(newOp.attributes, lastOp.attributes)) {
      if (typeof newOp.insert === 'string' && typeof lastOp.insert === 'string') {
        this.ops[index - 1] = { insert: lastOp.insert + newOp.insert };
        if (typeof newOp.attributes === 'object') this.ops[index - 1].attributes = newOp.attributes
        return this;
      } else if (typeof newOp.retain === 'number' && typeof lastOp.retain === 'number') {
        this.ops[index - 1] = { retain: lastOp.retain + newOp.retain };
        if (typeof newOp.attributes === 'object') this.ops[index - 1].attributes = newOp.attributes
        return this;
      }
    }
  }
  if (index === this.ops.length) {
    this.ops.push(newOp);
  } else {
    this.ops.splice(index, 0, newOp);
  }
  return this;
};

Delta.prototype.chop = function () {
  var lastOp = this.ops[this.ops.length - 1];
  if (lastOp && lastOp.retain && !lastOp.attributes) {
    this.ops.pop();
  }
  return this;
};

Delta.prototype.filter = function (predicate) {
  return this.ops.filter(predicate);
};

Delta.prototype.forEach = function (predicate) {
  this.ops.forEach(predicate);
};

Delta.prototype.map = function (predicate) {
  return this.ops.map(predicate);
};

Delta.prototype.partition = function (predicate) {
  var passed = [], failed = [];
  this.forEach(function(op) {
    var target = predicate(op) ? passed : failed;
    target.push(op);
  });
  return [passed, failed];
};

Delta.prototype.reduce = function (predicate, initial) {
  return this.ops.reduce(predicate, initial);
};

Delta.prototype.changeLength = function () {
  return this.reduce(function (length, elem) {
    if (elem.insert) {
      return length + op.length(elem);
    } else if (elem.delete) {
      return length - elem.delete;
    }
    return length;
  }, 0);
};

Delta.prototype.length = function () {
  return this.reduce(function (length, elem) {
    return length + op.length(elem);
  }, 0);
};

Delta.prototype.slice = function (start, end) {
  start = start || 0;
  if (typeof end !== 'number') end = Infinity;
  var ops = [];
  var iter = op.iterator(this.ops);
  var index = 0;
  while (index < end && iter.hasNext()) {
    var nextOp;
    if (index < start) {
      nextOp = iter.next(start - index);
    } else {
      nextOp = iter.next(end - index);
      ops.push(nextOp);
    }
    index += op.length(nextOp);
  }
  return new Delta(ops);
};


Delta.prototype.compose = function (other) {
  var thisIter = op.iterator(this.ops);
  var otherIter = op.iterator(other.ops);
  var ops = [];
  var firstOther = otherIter.peek();
  if (firstOther != null && typeof firstOther.retain === 'number' && firstOther.attributes == null) {
    var firstLeft = firstOther.retain;
    while (thisIter.peekType() === 'insert' && thisIter.peekLength() <= firstLeft) {
      firstLeft -= thisIter.peekLength();
      ops.push(thisIter.next());
    }
    if (firstOther.retain - firstLeft > 0) {
      otherIter.next(firstOther.retain - firstLeft);
    }
  }
  var delta = new Delta(ops);
  while (thisIter.hasNext() || otherIter.hasNext()) {
    if (otherIter.peekType() === 'insert') {
      delta.push(otherIter.next());
    } else if (thisIter.peekType() === 'delete') {
      delta.push(thisIter.next());
    } else {
      var length = Math.min(thisIter.peekLength(), otherIter.peekLength());
      var thisOp = thisIter.next(length);
      var otherOp = otherIter.next(length);
      if (typeof otherOp.retain === 'number') {
        var newOp = {};
        if (typeof thisOp.retain === 'number') {
          newOp.retain = length;
        } else {
          newOp.insert = thisOp.insert;
        }
        // Preserve null when composing with a retain, otherwise remove it for inserts
        var attributes = op.attributes.compose(thisOp.attributes, otherOp.attributes, typeof thisOp.retain === 'number');
        if (attributes) newOp.attributes = attributes;
        delta.push(newOp);

        // Optimization if rest of other is just retain
        if (!otherIter.hasNext() && equal(delta.ops[delta.ops.length - 1], newOp)) {
          var rest = new Delta(thisIter.rest());
          return delta.concat(rest).chop();
        }

      // Other op should be delete, we could be an insert or retain
      // Insert + delete cancels out
      } else if (typeof otherOp['delete'] === 'number' && typeof thisOp.retain === 'number') {
        delta.push(otherOp);
      }
    }
  }
  return delta.chop();
};

Delta.prototype.concat = function (other) {
  var delta = new Delta(this.ops.slice());
  if (other.ops.length > 0) {
    delta.push(other.ops[0]);
    delta.ops = delta.ops.concat(other.ops.slice(1));
  }
  return delta;
};

Delta.prototype.diff = function (other, index) {
  if (this.ops === other.ops) {
    return new Delta();
  }
  var strings = [this, other].map(function (delta) {
    return delta.map(function (op) {
      if (op.insert != null) {
        return typeof op.insert === 'string' ? op.insert : NULL_CHARACTER;
      }
      var prep = (delta === other) ? 'on' : 'with';
      throw new Error('diff() called ' + prep + ' non-document');
    }).join('');
  });
  var delta = new Delta();
  var diffResult = diff(strings[0], strings[1], index);
  var thisIter = op.iterator(this.ops);
  var otherIter = op.iterator(other.ops);
  diffResult.forEach(function (component) {
    var length = component[1].length;
    while (length > 0) {
      var opLength = 0;
      switch (component[0]) {
        case diff.INSERT:
          opLength = Math.min(otherIter.peekLength(), length);
          delta.push(otherIter.next(opLength));
          break;
        case diff.DELETE:
          opLength = Math.min(length, thisIter.peekLength());
          thisIter.next(opLength);
          delta['delete'](opLength);
          break;
        case diff.EQUAL:
          opLength = Math.min(thisIter.peekLength(), otherIter.peekLength(), length);
          var thisOp = thisIter.next(opLength);
          var otherOp = otherIter.next(opLength);
          if (equal(thisOp.insert, otherOp.insert)) {
            delta.retain(opLength, op.attributes.diff(thisOp.attributes, otherOp.attributes));
          } else {
            delta.push(otherOp)['delete'](opLength);
          }
          break;
      }
      length -= opLength;
    }
  });
  return delta.chop();
};

Delta.prototype.eachLine = function (predicate, newline) {
  newline = newline || '\n';
  var iter = op.iterator(this.ops);
  var line = new Delta();
  var i = 0;
  while (iter.hasNext()) {
    if (iter.peekType() !== 'insert') return;
    var thisOp = iter.peek();
    var start = op.length(thisOp) - iter.peekLength();
    var index = typeof thisOp.insert === 'string' ?
      thisOp.insert.indexOf(newline, start) - start : -1;
    if (index < 0) {
      line.push(iter.next());
    } else if (index > 0) {
      line.push(iter.next(index));
    } else {
      if (predicate(line, iter.next(1).attributes || {}, i) === false) {
        return;
      }
      i += 1;
      line = new Delta();
    }
  }
  if (line.length() > 0) {
    predicate(line, {}, i);
  }
};

Delta.prototype.transform = function (other, priority) {
  priority = !!priority;
  if (typeof other === 'number') {
    return this.transformPosition(other, priority);
  }
  var thisIter = op.iterator(this.ops);
  var otherIter = op.iterator(other.ops);
  var delta = new Delta();
  while (thisIter.hasNext() || otherIter.hasNext()) {
    if (thisIter.peekType() === 'insert' && (priority || otherIter.peekType() !== 'insert')) {
      delta.retain(op.length(thisIter.next()));
    } else if (otherIter.peekType() === 'insert') {
      delta.push(otherIter.next());
    } else {
      var length = Math.min(thisIter.peekLength(), otherIter.peekLength());
      var thisOp = thisIter.next(length);
      var otherOp = otherIter.next(length);
      if (thisOp['delete']) {
        // Our delete either makes their delete redundant or removes their retain
        continue;
      } else if (otherOp['delete']) {
        delta.push(otherOp);
      } else {
        // We retain either their retain or insert
        delta.retain(length, op.attributes.transform(thisOp.attributes, otherOp.attributes, priority));
      }
    }
  }
  return delta.chop();
};

Delta.prototype.transformPosition = function (index, priority) {
  priority = !!priority;
  var thisIter = op.iterator(this.ops);
  var offset = 0;
  while (thisIter.hasNext() && offset <= index) {
    var length = thisIter.peekLength();
    var nextType = thisIter.peekType();
    thisIter.next();
    if (nextType === 'delete') {
      index -= Math.min(length, index - offset);
      continue;
    } else if (nextType === 'insert' && (offset < index || !priority)) {
      index += length;
    }
    offset += length;
  }
  return index;
};


module.exports = Delta;


/***/ }),
/* 3 */
/***/ (function(module, exports) {

'use strict';

var hasOwn = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;
var defineProperty = Object.defineProperty;
var gOPD = Object.getOwnPropertyDescriptor;

var isArray = function isArray(arr) {
	if (typeof Array.isArray === 'function') {
		return Array.isArray(arr);
	}

	return toStr.call(arr) === '[object Array]';
};

var isPlainObject = function isPlainObject(obj) {
	if (!obj || toStr.call(obj) !== '[object Object]') {
		return false;
	}

	var hasOwnConstructor = hasOwn.call(obj, 'constructor');
	var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for (key in obj) { /**/ }

	return typeof key === 'undefined' || hasOwn.call(obj, key);
};

// If name is '__proto__', and Object.defineProperty is available, define __proto__ as an own property on target
var setProperty = function setProperty(target, options) {
	if (defineProperty && options.name === '__proto__') {
		defineProperty(target, options.name, {
			enumerable: true,
			configurable: true,
			value: options.newValue,
			writable: true
		});
	} else {
		target[options.name] = options.newValue;
	}
};

// Return undefined instead of __proto__ if '__proto__' is not an own property
var getProperty = function getProperty(obj, name) {
	if (name === '__proto__') {
		if (!hasOwn.call(obj, name)) {
			return void 0;
		} else if (gOPD) {
			// In early versions of node, obj['__proto__'] is buggy when obj has
			// __proto__ as an own property. Object.getOwnPropertyDescriptor() works.
			return gOPD(obj, name).value;
		}
	}

	return obj[name];
};

module.exports = function extend() {
	var options, name, src, copy, copyIsArray, clone;
	var target = arguments[0];
	var i = 1;
	var length = arguments.length;
	var deep = false;

	// Handle a deep copy situation
	if (typeof target === 'boolean') {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}
	if (target == null || (typeof target !== 'object' && typeof target !== 'function')) {
		target = {};
	}

	for (; i < length; ++i) {
		options = arguments[i];
		// Only deal with non-null/undefined values
		if (options != null) {
			// Extend the base object
			for (name in options) {
				src = getProperty(target, name);
				copy = getProperty(options, name);

				// Prevent never-ending loop
				if (target !== copy) {
					// Recurse if we're merging plain objects or arrays
					if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
						if (copyIsArray) {
							copyIsArray = false;
							clone = src && isArray(src) ? src : [];
						} else {
							clone = src && isPlainObject(src) ? src : {};
						}

						// Never move original objects, clone them
						setProperty(target, { name: name, newValue: extend(deep, clone, copy) });

					// Don't bring in undefined values
					} else if (typeof copy !== 'undefined') {
						setProperty(target, { name: name, newValue: copy });
					}
				}
			}
		}
	}

	// Return the modified object
	return target;
};


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.BlockEmbed = exports.bubbleFormats = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _extend = __webpack_require__(3);

var _extend2 = _interopRequireDefault(_extend);

var _quillDelta = __webpack_require__(2);

var _quillDelta2 = _interopRequireDefault(_quillDelta);

var _parchment = __webpack_require__(0);

var _parchment2 = _interopRequireDefault(_parchment);

var _break = __webpack_require__(16);

var _break2 = _interopRequireDefault(_break);

var _inline = __webpack_require__(6);

var _inline2 = _interopRequireDefault(_inline);

var _text = __webpack_require__(7);

var _text2 = _interopRequireDefault(_text);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var NEWLINE_LENGTH = 1;

var BlockEmbed = function (_Parchment$Embed) {
  _inherits(BlockEmbed, _Parchment$Embed);

  function BlockEmbed() {
    _classCallCheck(this, BlockEmbed);

    return _possibleConstructorReturn(this, (BlockEmbed.__proto__ || Object.getPrototypeOf(BlockEmbed)).apply(this, arguments));
  }

  _createClass(BlockEmbed, [{
    key: 'attach',
    value: function attach() {
      _get(BlockEmbed.prototype.__proto__ || Object.getPrototypeOf(BlockEmbed.prototype), 'attach', this).call(this);
      this.attributes = new _parchment2.default.Attributor.Store(this.domNode);
    }
  }, {
    key: 'delta',
    value: function delta() {
      return new _quillDelta2.default().insert(this.value(), (0, _extend2.default)(this.formats(), this.attributes.values()));
    }
  }, {
    key: 'format',
    value: function format(name, value) {
      var attribute = _parchment2.default.query(name, _parchment2.default.Scope.BLOCK_ATTRIBUTE);
      if (attribute != null) {
        this.attributes.attribute(attribute, value);
      }
    }
  }, {
    key: 'formatAt',
    value: function formatAt(index, length, name, value) {
      this.format(name, value);
    }
  }, {
    key: 'insertAt',
    value: function insertAt(index, value, def) {
      if (typeof value === 'string' && value.endsWith('\n')) {
        var block = _parchment2.default.create(Block.blotName);
        this.parent.insertBefore(block, index === 0 ? this : this.next);
        block.insertAt(0, value.slice(0, -1));
      } else {
        _get(BlockEmbed.prototype.__proto__ || Object.getPrototypeOf(BlockEmbed.prototype), 'insertAt', this).call(this, index, value, def);
      }
    }
  }]);

  return BlockEmbed;
}(_parchment2.default.Embed);

BlockEmbed.scope = _parchment2.default.Scope.BLOCK_BLOT;
// It is important for cursor behavior BlockEmbeds use tags that are block level elements


var Block = function (_Parchment$Block) {
  _inherits(Block, _Parchment$Block);

  function Block(domNode) {
    _classCallCheck(this, Block);

    var _this2 = _possibleConstructorReturn(this, (Block.__proto__ || Object.getPrototypeOf(Block)).call(this, domNode));

    _this2.cache = {};
    return _this2;
  }

  _createClass(Block, [{
    key: 'delta',
    value: function delta() {
      if (this.cache.delta == null) {
        this.cache.delta = this.descendants(_parchment2.default.Leaf).reduce(function (delta, leaf) {
          if (leaf.length() === 0) {
            return delta;
          } else {
            return delta.insert(leaf.value(), bubbleFormats(leaf));
          }
        }, new _quillDelta2.default()).insert('\n', bubbleFormats(this));
      }
      return this.cache.delta;
    }
  }, {
    key: 'deleteAt',
    value: function deleteAt(index, length) {
      _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'deleteAt', this).call(this, index, length);
      this.cache = {};
    }
  }, {
    key: 'formatAt',
    value: function formatAt(index, length, name, value) {
      if (length <= 0) return;
      if (_parchment2.default.query(name, _parchment2.default.Scope.BLOCK)) {
        if (index + length === this.length()) {
          this.format(name, value);
        }
      } else {
        _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'formatAt', this).call(this, index, Math.min(length, this.length() - index - 1), name, value);
      }
      this.cache = {};
    }
  }, {
    key: 'insertAt',
    value: function insertAt(index, value, def) {
      if (def != null) return _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'insertAt', this).call(this, index, value, def);
      if (value.length === 0) return;
      var lines = value.split('\n');
      var text = lines.shift();
      if (text.length > 0) {
        if (index < this.length() - 1 || this.children.tail == null) {
          _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'insertAt', this).call(this, Math.min(index, this.length() - 1), text);
        } else {
          this.children.tail.insertAt(this.children.tail.length(), text);
        }
        this.cache = {};
      }
      var block = this;
      lines.reduce(function (index, line) {
        block = block.split(index, true);
        block.insertAt(0, line);
        return line.length;
      }, index + text.length);
    }
  }, {
    key: 'insertBefore',
    value: function insertBefore(blot, ref) {
      var head = this.children.head;
      _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'insertBefore', this).call(this, blot, ref);
      if (head instanceof _break2.default) {
        head.remove();
      }
      this.cache = {};
    }
  }, {
    key: 'length',
    value: function length() {
      if (this.cache.length == null) {
        this.cache.length = _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'length', this).call(this) + NEWLINE_LENGTH;
      }
      return this.cache.length;
    }
  }, {
    key: 'moveChildren',
    value: function moveChildren(target, ref) {
      _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'moveChildren', this).call(this, target, ref);
      this.cache = {};
    }
  }, {
    key: 'optimize',
    value: function optimize(context) {
      _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'optimize', this).call(this, context);
      this.cache = {};
    }
  }, {
    key: 'path',
    value: function path(index) {
      return _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'path', this).call(this, index, true);
    }
  }, {
    key: 'removeChild',
    value: function removeChild(child) {
      _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'removeChild', this).call(this, child);
      this.cache = {};
    }
  }, {
    key: 'split',
    value: function split(index) {
      var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      if (force && (index === 0 || index >= this.length() - NEWLINE_LENGTH)) {
        var clone = this.clone();
        if (index === 0) {
          this.parent.insertBefore(clone, this);
          return this;
        } else {
          this.parent.insertBefore(clone, this.next);
          return clone;
        }
      } else {
        var next = _get(Block.prototype.__proto__ || Object.getPrototypeOf(Block.prototype), 'split', this).call(this, index, force);
        this.cache = {};
        return next;
      }
    }
  }]);

  return Block;
}(_parchment2.default.Block);

Block.blotName = 'block';
Block.tagName = 'P';
Block.defaultChild = 'break';
Block.allowedChildren = [_inline2.default, _parchment2.default.Embed, _text2.default];

function bubbleFormats(blot) {
  var formats = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (blot == null) return formats;
  if (typeof blot.formats === 'function') {
    formats = (0, _extend2.default)(formats, blot.formats());
  }
  if (blot.parent == null || blot.parent.blotName == 'scroll' || blot.parent.statics.scope !== blot.statics.scope) {
    return formats;
  }
  return bubbleFormats(blot.parent, formats);
}

exports.bubbleFormats = bubbleFormats;
exports.BlockEmbed = BlockEmbed;
exports.default = Block;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.overload = exports.expandConfig = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

__webpack_require__(50);

var _quillDelta = __webpack_require__(2);

var _quillDelta2 = _interopRequireDefault(_quillDelta);

var _editor = __webpack_require__(14);

var _editor2 = _interopRequireDefault(_editor);

var _emitter3 = __webpack_require__(8);

var _emitter4 = _interopRequireDefault(_emitter3);

var _module = __webpack_require__(9);

var _module2 = _interopRequireDefault(_module);

var _parchment = __webpack_require__(0);

var _parchment2 = _interopRequireDefault(_parchment);

var _selection = __webpack_require__(15);

var _selection2 = _interopRequireDefault(_selection);

var _extend = __webpack_require__(3);

var _extend2 = _interopRequireDefault(_extend);

var _logger = __webpack_require__(10);

var _logger2 = _interopRequireDefault(_logger);

var _theme = __webpack_require__(34);

var _theme2 = _interopRequireDefault(_theme);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var debug = (0, _logger2.default)('quill');

var Quill = function () {
  _createClass(Quill, null, [{
    key: 'debug',
    value: function debug(limit) {
      if (limit === true) {
        limit = 'log';
      }
      _logger2.default.level(limit);
    }
  }, {
    key: 'find',
    value: function find(node) {
      return node.__quill || _parchment2.default.find(node);
    }
  }, {
    key: 'import',
    value: function _import(name) {
      if (this.imports[name] == null) {
        debug.error('Cannot import ' + name + '. Are you sure it was registered?');
      }
      return this.imports[name];
    }
  }, {
    key: 'register',
    value: function register(path, target) {
      var _this = this;

      var overwrite = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      if (typeof path !== 'string') {
        var name = path.attrName || path.blotName;
        if (typeof name === 'string') {
          // register(Blot | Attributor, overwrite)
          this.register('formats/' + name, path, target);
        } else {
          Object.keys(path).forEach(function (key) {
            _this.register(key, path[key], target);
          });
        }
      } else {
        if (this.imports[path] != null && !overwrite) {
          debug.warn('Overwriting ' + path + ' with', target);
        }
        this.imports[path] = target;
        if ((path.startsWith('blots/') || path.startsWith('formats/')) && target.blotName !== 'abstract') {
          _parchment2.default.register(target);
        } else if (path.startsWith('modules') && typeof target.register === 'function') {
          target.register();
        }
      }
    }
  }]);

  function Quill(container) {
    var _this2 = this;

    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, Quill);

    this.options = expandConfig(container, options);
    this.container = this.options.container;
    if (this.container == null) {
      return debug.error('Invalid Quill container', container);
    }
    if (this.options.debug) {
      Quill.debug(this.options.debug);
    }
    var html = this.container.innerHTML.trim();
    this.container.classList.add('ql-container');
    this.container.innerHTML = '';
    this.container.__quill = this;
    this.root = this.addContainer('ql-editor');
    this.root.classList.add('ql-blank');
    this.root.setAttribute('data-gramm', false);
    this.scrollingContainer = this.options.scrollingContainer || this.root;
    this.emitter = new _emitter4.default();
    this.scroll = _parchment2.default.create(this.root, {
      emitter: this.emitter,
      whitelist: this.options.formats
    });
    this.editor = new _editor2.default(this.scroll);
    this.selection = new _selection2.default(this.scroll, this.emitter);
    this.theme = new this.options.theme(this, this.options);
    this.keyboard = this.theme.addModule('keyboard');
    this.clipboard = this.theme.addModule('clipboard');
    this.history = this.theme.addModule('history');
    this.theme.init();
    this.emitter.on(_emitter4.default.events.EDITOR_CHANGE, function (type) {
      if (type === _emitter4.default.events.TEXT_CHANGE) {
        _this2.root.classList.toggle('ql-blank', _this2.editor.isBlank());
      }
    });
    this.emitter.on(_emitter4.default.events.SCROLL_UPDATE, function (source, mutations) {
      var range = _this2.selection.lastRange;
      var index = range && range.length === 0 ? range.index : undefined;
      modify.call(_this2, function () {
        return _this2.editor.update(null, mutations, index);
      }, source);
    });
    var contents = this.clipboard.convert('<div class=\'ql-editor\' style="white-space: normal;">' + html + '<p><br></p></div>');
    this.setContents(contents);
    this.history.clear();
    if (this.options.placeholder) {
      this.root.setAttribute('data-placeholder', this.options.placeholder);
    }
    if (this.options.readOnly) {
      this.disable();
    }
  }

  _createClass(Quill, [{
    key: 'addContainer',
    value: function addContainer(container) {
      var refNode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      if (typeof container === 'string') {
        var className = container;
        container = document.createElement('div');
        container.classList.add(className);
      }
      this.container.insertBefore(container, refNode);
      return container;
    }
  }, {
    key: 'blur',
    value: function blur() {
      this.selection.setRange(null);
    }
  }, {
    key: 'deleteText',
    value: function deleteText(index, length, source) {
      var _this3 = this;

      var _overload = overload(index, length, source);

      var _overload2 = _slicedToArray(_overload, 4);

      index = _overload2[0];
      length = _overload2[1];
      source = _overload2[3];

      return modify.call(this, function () {
        return _this3.editor.deleteText(index, length);
      }, source, index, -1 * length);
    }
  }, {
    key: 'disable',
    value: function disable() {
      this.enable(false);
    }
  }, {
    key: 'enable',
    value: function enable() {
      var enabled = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      this.scroll.enable(enabled);
      this.container.classList.toggle('ql-disabled', !enabled);
    }
  }, {
    key: 'focus',
    value: function focus() {
      var scrollTop = this.scrollingContainer.scrollTop;
      this.selection.focus();
      this.scrollingContainer.scrollTop = scrollTop;
      this.scrollIntoView();
    }
  }, {
    key: 'format',
    value: function format(name, value) {
      var _this4 = this;

      var source = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _emitter4.default.sources.API;

      return modify.call(this, function () {
        var range = _this4.getSelection(true);
        var change = new _quillDelta2.default();
        if (range == null) {
          return change;
        } else if (_parchment2.default.query(name, _parchment2.default.Scope.BLOCK)) {
          change = _this4.editor.formatLine(range.index, range.length, _defineProperty({}, name, value));
        } else if (range.length === 0) {
          _this4.selection.format(name, value);
          return change;
        } else {
          change = _this4.editor.formatText(range.index, range.length, _defineProperty({}, name, value));
        }
        _this4.setSelection(range, _emitter4.default.sources.SILENT);
        return change;
      }, source);
    }
  }, {
    key: 'formatLine',
    value: function formatLine(index, length, name, value, source) {
      var _this5 = this;

      var formats = void 0;

      var _overload3 = overload(index, length, name, value, source);

      var _overload4 = _slicedToArray(_overload3, 4);

      index = _overload4[0];
      length = _overload4[1];
      formats = _overload4[2];
      source = _overload4[3];

      return modify.call(this, function () {
        return _this5.editor.formatLine(index, length, formats);
      }, source, index, 0);
    }
  }, {
    key: 'formatText',
    value: function formatText(index, length, name, value, source) {
      var _this6 = this;

      var formats = void 0;

      var _overload5 = overload(index, length, name, value, source);

      var _overload6 = _slicedToArray(_overload5, 4);

      index = _overload6[0];
      length = _overload6[1];
      formats = _overload6[2];
      source = _overload6[3];

      return modify.call(this, function () {
        return _this6.editor.formatText(index, length, formats);
      }, source, index, 0);
    }
  }, {
    key: 'getBounds',
    value: function getBounds(index) {
      var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      var bounds = void 0;
      if (typeof index === 'number') {
        bounds = this.selection.getBounds(index, length);
      } else {
        bounds = this.selection.getBounds(index.index, index.length);
      }
      var containerBounds = this.container.getBoundingClientRect();
      return {
        bottom: bounds.bottom - containerBounds.top,
        height: bounds.height,
        left: bounds.left - containerBounds.left,
        right: bounds.right - containerBounds.left,
        top: bounds.top - containerBounds.top,
        width: bounds.width
      };
    }
  }, {
    key: 'getContents',
    value: function getContents() {
      var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.getLength() - index;

      var _overload7 = overload(index, length);

      var _overload8 = _slicedToArray(_overload7, 2);

      index = _overload8[0];
      length = _overload8[1];

      return this.editor.getContents(index, length);
    }
  }, {
    key: 'getFormat',
    value: function getFormat() {
      var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.getSelection(true);
      var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      if (typeof index === 'number') {
        return this.editor.getFormat(index, length);
      } else {
        return this.editor.getFormat(index.index, index.length);
      }
    }
  }, {
    key: 'getIndex',
    value: function getIndex(blot) {
      return blot.offset(this.scroll);
    }
  }, {
    key: 'getLength',
    value: function getLength() {
      return this.scroll.length();
    }
  }, {
    key: 'getLeaf',
    value: function getLeaf(index) {
      return this.scroll.leaf(index);
    }
  }, {
    key: 'getLine',
    value: function getLine(index) {
      return this.scroll.line(index);
    }
  }, {
    key: 'getLines',
    value: function getLines() {
      var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Number.MAX_VALUE;

      if (typeof index !== 'number') {
        return this.scroll.lines(index.index, index.length);
      } else {
        return this.scroll.lines(index, length);
      }
    }
  }, {
    key: 'getModule',
    value: function getModule(name) {
      return this.theme.modules[name];
    }
  }, {
    key: 'getSelection',
    value: function getSelection() {
      var focus = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      if (focus) this.focus();
      this.update(); // Make sure we access getRange with editor in consistent state
      return this.selection.getRange()[0];
    }
  }, {
    key: 'getText',
    value: function getText() {
      var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.getLength() - index;

      var _overload9 = overload(index, length);

      var _overload10 = _slicedToArray(_overload9, 2);

      index = _overload10[0];
      length = _overload10[1];

      return this.editor.getText(index, length);
    }
  }, {
    key: 'hasFocus',
    value: function hasFocus() {
      return this.selection.hasFocus();
    }
  }, {
    key: 'insertEmbed',
    value: function insertEmbed(index, embed, value) {
      var _this7 = this;

      var source = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : Quill.sources.API;

      return modify.call(this, function () {
        return _this7.editor.insertEmbed(index, embed, value);
      }, source, index);
    }
  }, {
    key: 'insertText',
    value: function insertText(index, text, name, value, source) {
      var _this8 = this;

      var formats = void 0;

      var _overload11 = overload(index, 0, name, value, source);

      var _overload12 = _slicedToArray(_overload11, 4);

      index = _overload12[0];
      formats = _overload12[2];
      source = _overload12[3];

      return modify.call(this, function () {
        return _this8.editor.insertText(index, text, formats);
      }, source, index, text.length);
    }
  }, {
    key: 'isEnabled',
    value: function isEnabled() {
      return !this.container.classList.contains('ql-disabled');
    }
  }, {
    key: 'off',
    value: function off() {
      return this.emitter.off.apply(this.emitter, arguments);
    }
  }, {
    key: 'on',
    value: function on() {
      return this.emitter.on.apply(this.emitter, arguments);
    }
  }, {
    key: 'once',
    value: function once() {
      return this.emitter.once.apply(this.emitter, arguments);
    }
  }, {
    key: 'pasteHTML',
    value: function pasteHTML(index, html, source) {
      this.clipboard.dangerouslyPasteHTML(index, html, source);
    }
  }, {
    key: 'removeFormat',
    value: function removeFormat(index, length, source) {
      var _this9 = this;

      var _overload13 = overload(index, length, source);

      var _overload14 = _slicedToArray(_overload13, 4);

      index = _overload14[0];
      length = _overload14[1];
      source = _overload14[3];

      return modify.call(this, function () {
        return _this9.editor.removeFormat(index, length);
      }, source, index);
    }
  }, {
    key: 'scrollIntoView',
    value: function scrollIntoView() {
      this.selection.scrollIntoView(this.scrollingContainer);
    }
  }, {
    key: 'setContents',
    value: function setContents(delta) {
      var _this10 = this;

      var source = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _emitter4.default.sources.API;

      return modify.call(this, function () {
        delta = new _quillDelta2.default(delta);
        var length = _this10.getLength();
        var deleted = _this10.editor.deleteText(0, length);
        var applied = _this10.editor.applyDelta(delta);
        var lastOp = applied.ops[applied.ops.length - 1];
        if (lastOp != null && typeof lastOp.insert === 'string' && lastOp.insert[lastOp.insert.length - 1] === '\n') {
          _this10.editor.deleteText(_this10.getLength() - 1, 1);
          applied.delete(1);
        }
        var ret = deleted.compose(applied);
        return ret;
      }, source);
    }
  }, {
    key: 'setSelection',
    value: function setSelection(index, length, source) {
      if (index == null) {
        this.selection.setRange(null, length || Quill.sources.API);
      } else {
        var _overload15 = overload(index, length, source);

        var _overload16 = _slicedToArray(_overload15, 4);

        index = _overload16[0];
        length = _overload16[1];
        source = _overload16[3];

        this.selection.setRange(new _selection.Range(index, length), source);
        if (source !== _emitter4.default.sources.SILENT) {
          this.selection.scrollIntoView(this.scrollingContainer);
        }
      }
    }
  }, {
    key: 'setText',
    value: function setText(text) {
      var source = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _emitter4.default.sources.API;

      var delta = new _quillDelta2.default().insert(text);
      return this.setContents(delta, source);
    }
  }, {
    key: 'update',
    value: function update() {
      var source = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _emitter4.default.sources.USER;

      var change = this.scroll.update(source); // Will update selection before selection.update() does if text changes
      this.selection.update(source);
      return change;
    }
  }, {
    key: 'updateContents',
    value: function updateContents(delta) {
      var _this11 = this;

      var source = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _emitter4.default.sources.API;

      return modify.call(this, function () {
        delta = new _quillDelta2.default(delta);
        return _this11.editor.applyDelta(delta, source);
      }, source, true);
    }
  }]);

  return Quill;
}();

Quill.DEFAULTS = {
  bounds: null,
  formats: null,
  modules: {},
  placeholder: '',
  readOnly: false,
  scrollingContainer: null,
  strict: true,
  theme: 'default'
};
Quill.events = _emitter4.default.events;
Quill.sources = _emitter4.default.sources;
// eslint-disable-next-line no-undef
Quill.version =  false ? 'dev' : "1.3.7";

Quill.imports = {
  'delta': _quillDelta2.default,
  'parchment': _parchment2.default,
  'core/module': _module2.default,
  'core/theme': _theme2.default
};

function expandConfig(container, userConfig) {
  userConfig = (0, _extend2.default)(true, {
    container: container,
    modules: {
      clipboard: true,
      keyboard: true,
      history: true
    }
  }, userConfig);
  if (!userConfig.theme || userConfig.theme === Quill.DEFAULTS.theme) {
    userConfig.theme = _theme2.default;
  } else {
    userConfig.theme = Quill.import('themes/' + userConfig.theme);
    if (userConfig.theme == null) {
      throw new Error('Invalid theme ' + userConfig.theme + '. Did you register it?');
    }
  }
  var themeConfig = (0, _extend2.default)(true, {}, userConfig.theme.DEFAULTS);
  [themeConfig, userConfig].forEach(function (config) {
    config.modules = config.modules || {};
    Object.keys(config.modules).forEach(function (module) {
      if (config.modules[module] === true) {
        config.modules[module] = {};
      }
    });
  });
  var moduleNames = Object.keys(themeConfig.modules).concat(Object.keys(userConfig.modules));
  var moduleConfig = moduleNames.reduce(function (config, name) {
    var moduleClass = Quill.import('modules/' + name);
    if (moduleClass == null) {
      debug.error('Cannot load ' + name + ' module. Are you sure you registered it?');
    } else {
      config[name] = moduleClass.DEFAULTS || {};
    }
    return config;
  }, {});
  // Special case toolbar shorthand
  if (userConfig.modules != null && userConfig.modules.toolbar && userConfig.modules.toolbar.constructor !== Object) {
    userConfig.modules.toolbar = {
      container: userConfig.modules.toolbar
    };
  }
  userConfig = (0, _extend2.default)(true, {}, Quill.DEFAULTS, { modules: moduleConfig }, themeConfig, userConfig);
  ['bounds', 'container', 'scrollingContainer'].forEach(function (key) {
    if (typeof userConfig[key] === 'string') {
      userConfig[key] = document.querySelector(userConfig[key]);
    }
  });
  userConfig.modules = Object.keys(userConfig.modules).reduce(function (config, name) {
    if (userConfig.modules[name]) {
      config[name] = userConfig.modules[name];
    }
    return config;
  }, {});
  return userConfig;
}

// Handle selection preservation and TEXT_CHANGE emission
// common to modification APIs
function modify(modifier, source, index, shift) {
  if (this.options.strict && !this.isEnabled() && source === _emitter4.default.sources.USER) {
    return new _quillDelta2.default();
  }
  var range = index == null ? null : this.getSelection();
  var oldDelta = this.editor.delta;
  var change = modifier();
  if (range != null) {
    if (index === true) index = range.index;
    if (shift == null) {
      range = shiftRange(range, change, source);
    } else if (shift !== 0) {
      range = shiftRange(range, index, shift, source);
    }
    this.setSelection(range, _emitter4.default.sources.SILENT);
  }
  if (change.length() > 0) {
    var _emitter;

    var args = [_emitter4.default.events.TEXT_CHANGE, change, oldDelta, source];
    (_emitter = this.emitter).emit.apply(_emitter, [_emitter4.default.events.EDITOR_CHANGE].concat(args));
    if (source !== _emitter4.default.sources.SILENT) {
      var _emitter2;

      (_emitter2 = this.emitter).emit.apply(_emitter2, args);
    }
  }
  return change;
}

function overload(index, length, name, value, source) {
  var formats = {};
  if (typeof index.index === 'number' && typeof index.length === 'number') {
    // Allow for throwaway end (used by insertText/insertEmbed)
    if (typeof length !== 'number') {
      source = value, value = name, name = length, length = index.length, index = index.index;
    } else {
      length = index.length, index = index.index;
    }
  } else if (typeof length !== 'number') {
    source = value, value = name, name = length, length = 0;
  }
  // Handle format being object, two format name/value strings or excluded
  if ((typeof name === 'undefined' ? 'undefined' : _typeof(name)) === 'object') {
    formats = name;
    source = value;
  } else if (typeof name === 'string') {
    if (value != null) {
      formats[name] = value;
    } else {
      source = name;
    }
  }
  // Handle optional source
  source = source || _emitter4.default.sources.API;
  return [index, length, formats, source];
}

function shiftRange(range, index, length, source) {
  if (range == null) return null;
  var start = void 0,
      end = void 0;
  if (index instanceof _quillDelta2.default) {
    var _map = [range.index, range.index + range.length].map(function (pos) {
      return index.transformPosition(pos, source !== _emitter4.default.sources.USER);
    });

    var _map2 = _slicedToArray(_map, 2);

    start = _map2[0];
    end = _map2[1];
  } else {
    var _map3 = [range.index, range.index + range.length].map(function (pos) {
      if (pos < index || pos === index && source === _emitter4.default.sources.USER) return pos;
      if (length >= 0) {
        return pos + length;
      } else {
        return Math.max(index, pos + length);
      }
    });

    var _map4 = _slicedToArray(_map3, 2);

    start = _map4[0];
    end = _map4[1];
  }
  return new _selection.Range(start, end - start);
}

exports.expandConfig = expandConfig;
exports.overload = overload;
exports.default = Quill;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _text = __webpack_require__(7);

var _text2 = _interopRequireDefault(_text);

var _parchment = __webpack_require__(0);

var _parchment2 = _interopRequireDefault(_parchment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Inline = function (_Parchment$Inline) {
  _inherits(Inline, _Parchment$Inline);

  function Inline() {
    _classCallCheck(this, Inline);

    return _possibleConstructorReturn(this, (Inline.__proto__ || Object.getPrototypeOf(Inline)).apply(this, arguments));
  }

  _createClass(Inline, [{
    key: 'formatAt',
    value: function formatAt(index, length, name, value) {
      if (Inline.compare(this.statics.blotName, name) < 0 && _parchment2.default.query(name, _parchment2.default.Scope.BLOT)) {
        var blot = this.isolate(index, length);
        if (value) {
          blot.wrap(name, value);
        }
      } else {
        _get(Inline.prototype.__proto__ || Object.getPrototypeOf(Inline.prototype), 'formatAt', this).call(this, index, length, name, value);
      }
    }
  }, {
    key: 'optimize',
    value: function optimize(context) {
      _get(Inline.prototype.__proto__ || Object.getPrototypeOf(Inline.prototype), 'optimize', this).call(this, context);
      if (this.parent instanceof Inline && Inline.compare(this.statics.blotName, this.parent.statics.blotName) > 0) {
        var parent = this.parent.isolate(this.offset(), this.length());
        this.moveChildren(parent);
        parent.wrap(this);
      }
    }
  }], [{
    key: 'compare',
    value: function compare(self, other) {
      var selfIndex = Inline.order.indexOf(self);
      var otherIndex = Inline.order.indexOf(other);
      if (selfIndex >= 0 || otherIndex >= 0) {
        return selfIndex - otherIndex;
      } else if (self === other) {
        return 0;
      } else if (self < other) {
        return -1;
      } else {
        return 1;
      }
    }
  }]);

  return Inline;
}(_parchment2.default.Inline);

Inline.allowedChildren = [Inline, _parchment2.default.Embed, _text2.default];
// Lower index means deeper in the DOM tree, since not found (-1) is for embeds
Inline.order = ['cursor', 'inline', // Must be lower
'underline', 'strike', 'italic', 'bold', 'script', 'link', 'code' // Must be higher
];

exports.default = Inline;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _parchment = __webpack_require__(0);

var _parchment2 = _interopRequireDefault(_parchment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TextBlot = function (_Parchment$Text) {
  _inherits(TextBlot, _Parchment$Text);

  function TextBlot() {
    _classCallCheck(this, TextBlot);

    return _possibleConstructorReturn(this, (TextBlot.__proto__ || Object.getPrototypeOf(TextBlot)).apply(this, arguments));
  }

  return TextBlot;
}(_parchment2.default.Text);

exports.default = TextBlot;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _eventemitter = __webpack_require__(54);

var _eventemitter2 = _interopRequireDefault(_eventemitter);

var _logger = __webpack_require__(10);

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var debug = (0, _logger2.default)('quill:events');

var EVENTS = ['selectionchange', 'mousedown', 'mouseup', 'click'];

EVENTS.forEach(function (eventName) {
  document.addEventListener(eventName, function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    [].slice.call(document.querySelectorAll('.ql-container')).forEach(function (node) {
      // TODO use WeakMap
      if (node.__quill && node.__quill.emitter) {
        var _node$__quill$emitter;

        (_node$__quill$emitter = node.__quill.emitter).handleDOM.apply(_node$__quill$emitter, args);
      }
    });
  });
});

var Emitter = function (_EventEmitter) {
  _inherits(Emitter, _EventEmitter);

  function Emitter() {
    _classCallCheck(this, Emitter);

    var _this = _possibleConstructorReturn(this, (Emitter.__proto__ || Object.getPrototypeOf(Emitter)).call(this));

    _this.listeners = {};
    _this.on('error', debug.error);
    return _this;
  }

  _createClass(Emitter, [{
    key: 'emit',
    value: function emit() {
      debug.log.apply(debug, arguments);
      _get(Emitter.prototype.__proto__ || Object.getPrototypeOf(Emitter.prototype), 'emit', this).apply(this, arguments);
    }
  }, {
    key: 'handleDOM',
    value: function handleDOM(event) {
      for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      (this.listeners[event.type] || []).forEach(function (_ref) {
        var node = _ref.node,
            handler = _ref.handler;

        if (event.target === node || node.contains(event.target)) {
          handler.apply(undefined, [event].concat(args));
        }
      });
    }
  }, {
    key: 'listenDOM',
    value: function listenDOM(eventName, node, handler) {
      if (!this.listeners[eventName]) {
        this.listeners[eventName] = [];
      }
      this.listeners[eventName].push({ node: node, handler: handler });
    }
  }]);

  return Emitter;
}(_eventemitter2.default);

Emitter.events = {
  EDITOR_CHANGE: 'editor-change',
  SCROLL_BEFORE_UPDATE: 'scroll-before-update',
  SCROLL_OPTIMIZE: 'scroll-optimize',
  SCROLL_UPDATE: 'scroll-update',
  SELECTION_CHANGE: 'selection-change',
  TEXT_CHANGE: 'text-change'
};
Emitter.sources = {
  API: 'api',
  SILENT: 'silent',
  USER: 'user'
};

exports.default = Emitter;

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Module = function Module(quill) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  _classCallCheck(this, Module);

  this.quill = quill;
  this.options = options;
};

Module.DEFAULTS = {};

exports.default = Module;

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var levels = ['error', 'warn', 'log', 'info'];
var level = 'warn';

function debug(method) {
  if (levels.indexOf(method) <= levels.indexOf(level)) {
    var _console;

    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    (_console = console)[method].apply(_console, args); // eslint-disable-line no-console
  }
}

function namespace(ns) {
  return levels.reduce(function (logger, method) {
    logger[method] = debug.bind(console, method, ns);
    return logger;
  }, {});
}

debug.level = namespace.level = function (newLevel) {
  level = newLevel;
};

exports.default = namespace;

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

var pSlice = Array.prototype.slice;
var objectKeys = __webpack_require__(52);
var isArguments = __webpack_require__(53);

var deepEqual = module.exports = function (actual, expected, opts) {
  if (!opts) opts = {};
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (actual instanceof Date && expected instanceof Date) {
    return actual.getTime() === expected.getTime();

  // 7.3. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!actual || !expected || typeof actual != 'object' && typeof expected != 'object') {
    return opts.strict ? actual === expected : actual == expected;

  // 7.4. For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected, opts);
  }
}

function isUndefinedOrNull(value) {
  return value === null || value === undefined;
}

function isBuffer (x) {
  if (!x || typeof x !== 'object' || typeof x.length !== 'number') return false;
  if (typeof x.copy !== 'function' || typeof x.slice !== 'function') {
    return false;
  }
  if (x.length > 0 && typeof x[0] !== 'number') return false;
  return true;
}

function objEquiv(a, b, opts) {
  var i, key;
  if (isUndefinedOrNull(a) || isUndefinedOrNull(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return deepEqual(a, b, opts);
  }
  if (isBuffer(a)) {
    if (!isBuffer(b)) {
      return false;
    }
    if (a.length !== b.length) return false;
    for (i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }
  try {
    var ka = objectKeys(a),
        kb = objectKeys(b);
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!deepEqual(a[key], b[key], opts)) return false;
  }
  return typeof a === typeof b;
}


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Registry = __webpack_require__(1);
var Attributor = /** @class */ (function () {
    function Attributor(attrName, keyName, options) {
        if (options === void 0) { options = {}; }
        this.attrName = attrName;
        this.keyName = keyName;
        var attributeBit = Registry.Scope.TYPE & Registry.Scope.ATTRIBUTE;
        if (options.scope != null) {
            // Ignore type bits, force attribute bit
            this.scope = (options.scope & Registry.Scope.LEVEL) | attributeBit;
        }
        else {
            this.scope = Registry.Scope.ATTRIBUTE;
        }
        if (options.whitelist != null)
            this.whitelist = options.whitelist;
    }
    Attributor.keys = function (node) {
        return [].map.call(node.attributes, function (item) {
            return item.name;
        });
    };
    Attributor.prototype.add = function (node, value) {
        if (!this.canAdd(node, value))
            return false;
        node.setAttribute(this.keyName, value);
        return true;
    };
    Attributor.prototype.canAdd = function (node, value) {
        var match = Registry.query(node, Registry.Scope.BLOT & (this.scope | Registry.Scope.TYPE));
        if (match == null)
            return false;
        if (this.whitelist == null)
            return true;
        if (typeof value === 'string') {
            return this.whitelist.indexOf(value.replace(/["']/g, '')) > -1;
        }
        else {
            return this.whitelist.indexOf(value) > -1;
        }
    };
    Attributor.prototype.remove = function (node) {
        node.removeAttribute(this.keyName);
    };
    Attributor.prototype.value = function (node) {
        var value = node.getAttribute(this.keyName);
        if (this.canAdd(node, value) && value) {
            return value;
        }
        return '';
    };
    return Attributor;
}());
exports.default = Attributor;


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Code = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _quillDelta = __webpack_require__(2);

var _quillDelta2 = _interopRequireDefault(_quillDelta);

var _parchment = __webpack_require__(0);

var _parchment2 = _interopRequireDefault(_parchment);

var _block = __webpack_require__(4);

var _block2 = _interopRequireDefault(_block);

var _inline = __webpack_require__(6);

var _inline2 = _interopRequireDefault(_inline);

var _text = __webpack_require__(7);

var _text2 = _interopRequireDefault(_text);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Code = function (_Inline) {
  _inherits(Code, _Inline);

  function Code() {
    _classCallCheck(this, Code);

    return _possibleConstructorReturn(this, (Code.__proto__ || Object.getPrototypeOf(Code)).apply(this, arguments));
  }

  return Code;
}(_inline2.default);

Code.blotName = 'code';
Code.tagName = 'CODE';

var CodeBlock = function (_Block) {
  _inherits(CodeBlock, _Block);

  function CodeBlock() {
    _classCallCheck(this, CodeBlock);

    return _possibleConstructorReturn(this, (CodeBlock.__proto__ || Object.getPrototypeOf(CodeBlock)).apply(this, arguments));
  }

  _createClass(CodeBlock, [{
    key: 'delta',
    value: function delta() {
      var _this3 = this;

      var text = this.domNode.textContent;
      if (text.endsWith('\n')) {
        // Should always be true
        text = text.slice(0, -1);
      }
      return text.split('\n').reduce(function (delta, frag) {
        return delta.insert(frag).insert('\n', _this3.formats());
      }, new _quillDelta2.default());
    }
  }, {
    key: 'format',
    value: function format(name, value) {
      if (name === this.statics.blotName && value) return;

      var _descendant = this.descendant(_text2.default, this.length() - 1),
          _descendant2 = _slicedToArray(_descendant, 1),
          text = _descendant2[0];

      if (text != null) {
        text.deleteAt(text.length() - 1, 1);
      }
      _get(CodeBlock.prototype.__proto__ || Object.getPrototypeOf(CodeBlock.prototype), 'format', this).call(this, name, value);
    }
  }, {
    key: 'formatAt',
    value: function formatAt(index, length, name, value) {
      if (length === 0) return;
      if (_parchment2.default.query(name, _parchment2.default.Scope.BLOCK) == null || name === this.statics.blotName && value === this.statics.formats(this.domNode)) {
        return;
      }
      var nextNewline = this.newlineIndex(index);
      if (nextNewline < 0 || nextNewline >= index + length) return;
      var prevNewline = this.newlineIndex(index, true) + 1;
      var isolateLength = nextNewline - prevNewline + 1;
      var blot = this.isolate(prevNewline, isolateLength);
      var next = blot.next;
      blot.format(name, value);
      if (next instanceof CodeBlock) {
        next.formatAt(0, index - prevNewline + length - isolateLength, name, value);
      }
    }
  }, {
    key: 'insertAt',
    value: function insertAt(index, value, def) {
      if (def != null) return;

      var _descendant3 = this.descendant(_text2.default, index),
          _descendant4 = _slicedToArray(_descendant3, 2),
          text = _descendant4[0],
          offset = _descendant4[1];

      text.insertAt(offset, value);
    }
  }, {
    key: 'length',
    value: function length() {
      var length = this.domNode.textContent.length;
      if (!this.domNode.textContent.endsWith('\n')) {
        return length + 1;
      }
      return length;
    }
  }, {
    key: 'newlineIndex',
    value: function newlineIndex(searchIndex) {
      var reverse = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      if (!reverse) {
        var offset = this.domNode.textContent.slice(searchIndex).indexOf('\n');
        return offset > -1 ? searchIndex + offset : -1;
      } else {
        return this.domNode.textContent.slice(0, searchIndex).lastIndexOf('\n');
      }
    }
  }, {
    key: 'optimize',
    value: function optimize(context) {
      if (!this.domNode.textContent.endsWith('\n')) {
        this.appendChild(_parchment2.default.create('text', '\n'));
      }
      _get(CodeBlock.prototype.__proto__ || Object.getPrototypeOf(CodeBlock.prototype), 'optimize', this).call(this, context);
      var next = this.next;
      if (next != null && next.prev === this && next.statics.blotName === this.statics.blotName && this.statics.formats(this.domNode) === next.statics.formats(next.domNode)) {
        next.optimize(context);
        next.moveChildren(this);
        next.remove();
      }
    }
  }, {
    key: 'replace',
    value: function replace(target) {
      _get(CodeBlock.prototype.__proto__ || Object.getPrototypeOf(CodeBlock.prototype), 'replace', this).call(this, target);
      [].slice.call(this.domNode.querySelectorAll('*')).forEach(function (node) {
        var blot = _parchment2.default.find(node);
        if (blot == null) {
          node.parentNode.removeChild(node);
        } else if (blot instanceof _parchment2.default.Embed) {
          blot.remove();
        } else {
          blot.unwrap();
        }
      });
    }
  }], [{
    key: 'create',
    value: function create(value) {
      var domNode = _get(CodeBlock.__proto__ || Object.getPrototypeOf(CodeBlock), 'create', this).call(this, value);
      domNode.setAttribute('spellcheck', false);
      return domNode;
    }
  }, {
    key: 'formats',
    value: function formats() {
      return true;
    }
  }]);

  return CodeBlock;
}(_block2.default);

CodeBlock.blotName = 'code-block';
CodeBlock.tagName = 'PRE';
CodeBlock.TAB = '  ';

exports.Code = Code;
exports.default = CodeBlock;

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _quillDelta = __webpack_require__(2);

var _quillDelta2 = _interopRequireDefault(_quillDelta);

var _op = __webpack_require__(20);

var _op2 = _interopRequireDefault(_op);

var _parchment = __webpack_require__(0);

var _parchment2 = _interopRequireDefault(_parchment);

var _code = __webpack_require__(13);

var _code2 = _interopRequireDefault(_code);

var _cursor = __webpack_require__(24);

var _cursor2 = _interopRequireDefault(_cursor);

var _block = __webpack_require__(4);

var _block2 = _interopRequireDefault(_block);

var _break = __webpack_require__(16);

var _break2 = _interopRequireDefault(_break);

var _clone = __webpack_require__(21);

var _clone2 = _interopRequireDefault(_clone);

var _deepEqual = __webpack_require__(11);

var _deepEqual2 = _interopRequireDefault(_deepEqual);

var _extend = __webpack_require__(3);

var _extend2 = _interopRequireDefault(_extend);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ASCII = /^[ -~]*$/;

var Editor = function () {
  function Editor(scroll) {
    _classCallCheck(this, Editor);

    this.scroll = scroll;
    this.delta = this.getDelta();
  }

  _createClass(Editor, [{
    key: 'applyDelta',
    value: function applyDelta(delta) {
      var _this = this;

      var consumeNextNewline = false;
      this.scroll.update();
      var scrollLength = this.scroll.length();
      this.scroll.batchStart();
      delta = normalizeDelta(delta);
      delta.reduce(function (index, op) {
        var length = op.retain || op.delete || op.insert.length || 1;
        var attributes = op.attributes || {};
        if (op.insert != null) {
          if (typeof op.insert === 'string') {
            var text = op.insert;
            if (text.endsWith('\n') && consumeNextNewline) {
              consumeNextNewline = false;
              text = text.slice(0, -1);
            }
            if (index >= scrollLength && !text.endsWith('\n')) {
              consumeNextNewline = true;
            }
            _this.scroll.insertAt(index, text);

            var _scroll$line = _this.scroll.line(index),
                _scroll$line2 = _slicedToArray(_scroll$line, 2),
                line = _scroll$line2[0],
                offset = _scroll$line2[1];

            var formats = (0, _extend2.default)({}, (0, _block.bubbleFormats)(line));
            if (line instanceof _block2.default) {
              var _line$descendant = line.descendant(_parchment2.default.Leaf, offset),
                  _line$descendant2 = _slicedToArray(_line$descendant, 1),
                  leaf = _line$descendant2[0];

              formats = (0, _extend2.default)(formats, (0, _block.bubbleFormats)(leaf));
            }
            attributes = _op2.default.attributes.diff(formats, attributes) || {};
          } else if (_typeof(op.insert) === 'object') {
            var key = Object.keys(op.insert)[0]; // There should only be one key
            if (key == null) return index;
            _this.scroll.insertAt(index, key, op.insert[key]);
          }
          scrollLength += length;
        }
        Object.keys(attributes).forEach(function (name) {
          _this.scroll.formatAt(index, length, name, attributes[name]);
        });
        return index + length;
      }, 0);
      delta.reduce(function (index, op) {
        if (typeof op.delete === 'number') {
          _this.scroll.deleteAt(index, op.delete);
          return index;
        }
        return index + (op.retain || op.insert.length || 1);
      }, 0);
      this.scroll.batchEnd();
      return this.update(delta);
    }
  }, {
    key: 'deleteText',
    value: function deleteText(index, length) {
      this.scroll.deleteAt(index, length);
      return this.update(new _quillDelta2.default().retain(index).delete(length));
    }
  }, {
    key: 'formatLine',
    value: function formatLine(index, length) {
      var _this2 = this;

      var formats = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      this.scroll.update();
      Object.keys(formats).forEach(function (format) {
        if (_this2.scroll.whitelist != null && !_this2.scroll.whitelist[format]) return;
        var lines = _this2.scroll.lines(index, Math.max(length, 1));
        var lengthRemaining = length;
        lines.forEach(function (line) {
          var lineLength = line.length();
          if (!(line instanceof _code2.default)) {
            line.format(format, formats[format]);
          } else {
            var codeIndex = index - line.offset(_this2.scroll);
            var codeLength = line.newlineIndex(codeIndex + lengthRemaining) - codeIndex + 1;
            line.formatAt(codeIndex, codeLength, format, formats[format]);
          }
          lengthRemaining -= lineLength;
        });
      });
      this.scroll.optimize();
      return this.update(new _quillDelta2.default().retain(index).retain(length, (0, _clone2.default)(formats)));
    }
  }, {
    key: 'formatText',
    value: function formatText(index, length) {
      var _this3 = this;

      var formats = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      Object.keys(formats).forEach(function (format) {
        _this3.scroll.formatAt(index, length, format, formats[format]);
      });
      return this.update(new _quillDelta2.default().retain(index).retain(length, (0, _clone2.default)(formats)));
    }
  }, {
    key: 'getContents',
    value: function getContents(index, length) {
      return this.delta.slice(index, index + length);
    }
  }, {
    key: 'getDelta',
    value: function getDelta() {
      return this.scroll.lines().reduce(function (delta, line) {
        return delta.concat(line.delta());
      }, new _quillDelta2.default());
    }
  }, {
    key: 'getFormat',
    value: function getFormat(index) {
      var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      var lines = [],
          leaves = [];
      if (length === 0) {
        this.scroll.path(index).forEach(function (path) {
          var _path = _slicedToArray(path, 1),
              blot = _path[0];

          if (blot instanceof _block2.default) {
            lines.push(blot);
          } else if (blot instanceof _parchment2.default.Leaf) {
            leaves.push(blot);
          }
        });
      } else {
        lines = this.scroll.lines(index, length);
        leaves = this.scroll.descendants(_parchment2.default.Leaf, index, length);
      }
      var formatsArr = [lines, leaves].map(function (blots) {
        if (blots.length === 0) return {};
        var formats = (0, _block.bubbleFormats)(blots.shift());
        while (Object.keys(formats).length > 0) {
          var blot = blots.shift();
          if (blot == null) return formats;
          formats = combineFormats((0, _block.bubbleFormats)(blot), formats);
        }
        return formats;
      });
      return _extend2.default.apply(_extend2.default, formatsArr);
    }
  }, {
    key: 'getText',
    value: function getText(index, length) {
      return this.getContents(index, length).filter(function (op) {
        return typeof op.insert === 'string';
      }).map(function (op) {
        return op.insert;
      }).join('');
    }
  }, {
    key: 'insertEmbed',
    value: function insertEmbed(index, embed, value) {
      this.scroll.insertAt(index, embed, value);
      return this.update(new _quillDelta2.default().retain(index).insert(_defineProperty({}, embed, value)));
    }
  }, {
    key: 'insertText',
    value: function insertText(index, text) {
      var _this4 = this;

      var formats = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      this.scroll.insertAt(index, text);
      Object.keys(formats).forEach(function (format) {
        _this4.scroll.formatAt(index, text.length, format, formats[format]);
      });
      return this.update(new _quillDelta2.default().retain(index).insert(text, (0, _clone2.default)(formats)));
    }
  }, {
    key: 'isBlank',
    value: function isBlank() {
      if (this.scroll.children.length == 0) return true;
      if (this.scroll.children.length > 1) return false;
      var block = this.scroll.children.head;
      if (block.statics.blotName !== _block2.default.blotName) return false;
      if (block.children.length > 1) return false;
      return block.children.head instanceof _break2.default;
    }
  }, {
    key: 'removeFormat',
    value: function removeFormat(index, length) {
      var text = this.getText(index, length);

      var _scroll$line3 = this.scroll.line(index + length),
          _scroll$line4 = _slicedToArray(_scroll$line3, 2),
          line = _scroll$line4[0],
          offset = _scroll$line4[1];

      var suffixLength = 0,
          suffix = new _quillDelta2.default();
      if (line != null) {
        if (!(line instanceof _code2.default)) {
          suffixLength = line.length() - offset;
        } else {
          suffixLength = line.newlineIndex(offset) - offset + 1;
        }
        suffix = line.delta().slice(offset, offset + suffixLength - 1).insert('\n');
      }
      var contents = this.getContents(index, length + suffixLength);
      var diff = contents.diff(new _quillDelta2.default().insert(text).concat(suffix));
      var delta = new _quillDelta2.default().retain(index).concat(diff);
      return this.applyDelta(delta);
    }
  }, {
    key: 'update',
    value: function update(change) {
      var mutations = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      var cursorIndex = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;

      var oldDelta = this.delta;
      if (mutations.length === 1 && mutations[0].type === 'characterData' && mutations[0].target.data.match(ASCII) && _parchment2.default.find(mutations[0].target)) {
        // Optimization for character changes
        var textBlot = _parchment2.default.find(mutations[0].target);
        var formats = (0, _block.bubbleFormats)(textBlot);
        var index = textBlot.offset(this.scroll);
        var oldValue = mutations[0].oldValue.replace(_cursor2.default.CONTENTS, '');
        var oldText = new _quillDelta2.default().insert(oldValue);
        var newText = new _quillDelta2.default().insert(textBlot.value());
        var diffDelta = new _quillDelta2.default().retain(index).concat(oldText.diff(newText, cursorIndex));
        change = diffDelta.reduce(function (delta, op) {
          if (op.insert) {
            return delta.insert(op.insert, formats);
          } else {
            return delta.push(op);
          }
        }, new _quillDelta2.default());
        this.delta = oldDelta.compose(change);
      } else {
        this.delta = this.getDelta();
        if (!change || !(0, _deepEqual2.default)(oldDelta.compose(change), this.delta)) {
          change = oldDelta.diff(this.delta, cursorIndex);
        }
      }
      return change;
    }
  }]);

  return Editor;
}();

function combineFormats(formats, combined) {
  return Object.keys(combined).reduce(function (merged, name) {
    if (formats[name] == null) return merged;
    if (combined[name] === formats[name]) {
      merged[name] = combined[name];
    } else if (Array.isArray(combined[name])) {
      if (combined[name].indexOf(formats[name]) < 0) {
        merged[name] = combined[name].concat([formats[name]]);
      }
    } else {
      merged[name] = [combined[name], formats[name]];
    }
    return merged;
  }, {});
}

function normalizeDelta(delta) {
  return delta.reduce(function (delta, op) {
    if (op.insert === 1) {
      var attributes = (0, _clone2.default)(op.attributes);
      delete attributes['image'];
      return delta.insert({ image: op.attributes.image }, attributes);
    }
    if (op.attributes != null && (op.attributes.list === true || op.attributes.bullet === true)) {
      op = (0, _clone2.default)(op);
      if (op.attributes.list) {
        op.attributes.list = 'ordered';
      } else {
        op.attributes.list = 'bullet';
        delete op.attributes.bullet;
      }
    }
    if (typeof op.insert === 'string') {
      var text = op.insert.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      return delta.insert(text, op.attributes);
    }
    return delta.push(op);
  }, new _quillDelta2.default());
}

exports.default = Editor;

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.Range = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _parchment = __webpack_require__(0);

var _parchment2 = _interopRequireDefault(_parchment);

var _clone = __webpack_require__(21);

var _clone2 = _interopRequireDefault(_clone);

var _deepEqual = __webpack_require__(11);

var _deepEqual2 = _interopRequireDefault(_deepEqual);

var _emitter3 = __webpack_require__(8);

var _emitter4 = _interopRequireDefault(_emitter3);

var _logger = __webpack_require__(10);

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var debug = (0, _logger2.default)('quill:selection');

var Range = function Range(index) {
  var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

  _classCallCheck(this, Range);

  this.index = index;
  this.length = length;
};

var Selection = function () {
  function Selection(scroll, emitter) {
    var _this = this;

    _classCallCheck(this, Selection);

    this.emitter = emitter;
    this.scroll = scroll;
    this.composing = false;
    this.mouseDown = false;
    this.root = this.scroll.domNode;
    this.cursor = _parchment2.default.create('cursor', this);
    // savedRange is last non-null range
    this.lastRange = this.savedRange = new Range(0, 0);
    this.handleComposition();
    this.handleDragging();
    this.emitter.listenDOM('selectionchange', document, function () {
      if (!_this.mouseDown) {
        setTimeout(_this.update.bind(_this, _emitter4.default.sources.USER), 1);
      }
    });
    this.emitter.on(_emitter4.default.events.EDITOR_CHANGE, function (type, delta) {
      if (type === _emitter4.default.events.TEXT_CHANGE && delta.length() > 0) {
        _this.update(_emitter4.default.sources.SILENT);
      }
    });
    this.emitter.on(_emitter4.default.events.SCROLL_BEFORE_UPDATE, function () {
      if (!_this.hasFocus()) return;
      var native = _this.getNativeRange();
      if (native == null) return;
      if (native.start.node === _this.cursor.textNode) return; // cursor.restore() will handle
      // TODO unclear if this has negative side effects
      _this.emitter.once(_emitter4.default.events.SCROLL_UPDATE, function () {
        try {
          _this.setNativeRange(native.start.node, native.start.offset, native.end.node, native.end.offset);
        } catch (ignored) {}
      });
    });
    this.emitter.on(_emitter4.default.events.SCROLL_OPTIMIZE, function (mutations, context) {
      if (context.range) {
        var _context$range = context.range,
            startNode = _context$range.startNode,
            startOffset = _context$range.startOffset,
            endNode = _context$range.endNode,
            endOffset = _context$range.endOffset;

        _this.setNativeRange(startNode, startOffset, endNode, endOffset);
      }
    });
    this.update(_emitter4.default.sources.SILENT);
  }

  _createClass(Selection, [{
    key: 'handleComposition',
    value: function handleComposition() {
      var _this2 = this;

      this.root.addEventListener('compositionstart', function () {
        _this2.composing = true;
      });
      this.root.addEventListener('compositionend', function () {
        _this2.composing = false;
        if (_this2.cursor.parent) {
          var range = _this2.cursor.restore();
          if (!range) return;
          setTimeout(function () {
            _this2.setNativeRange(range.startNode, range.startOffset, range.endNode, range.endOffset);
          }, 1);
        }
      });
    }
  }, {
    key: 'handleDragging',
    value: function handleDragging() {
      var _this3 = this;

      this.emitter.listenDOM('mousedown', document.body, function () {
        _this3.mouseDown = true;
      });
      this.emitter.listenDOM('mouseup', document.body, function () {
        _this3.mouseDown = false;
        _this3.update(_emitter4.default.sources.USER);
      });
    }
  }, {
    key: 'focus',
    value: function focus() {
      if (this.hasFocus()) return;
      this.root.focus();
      this.setRange(this.savedRange);
    }
  }, {
    key: 'format',
    value: function format(_format, value) {
      if (this.scroll.whitelist != null && !this.scroll.whitelist[_format]) return;
      this.scroll.update();
      var nativeRange = this.getNativeRange();
      if (nativeRange == null || !nativeRange.native.collapsed || _parchment2.default.query(_format, _parchment2.default.Scope.BLOCK)) return;
      if (nativeRange.start.node !== this.cursor.textNode) {
        var blot = _parchment2.default.find(nativeRange.start.node, false);
        if (blot == null) return;
        // TODO Give blot ability to not split
        if (blot instanceof _parchment2.default.Leaf) {
          var after = blot.split(nativeRange.start.offset);
          blot.parent.insertBefore(this.cursor, after);
        } else {
          blot.insertBefore(this.cursor, nativeRange.start.node); // Should never happen
        }
        this.cursor.attach();
      }
      this.cursor.format(_format, value);
      this.scroll.optimize();
      this.setNativeRange(this.cursor.textNode, this.cursor.textNode.data.length);
      this.update();
    }
  }, {
    key: 'getBounds',
    value: function getBounds(index) {
      var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      var scrollLength = this.scroll.length();
      index = Math.min(index, scrollLength - 1);
      length = Math.min(index + length, scrollLength - 1) - index;
      var node = void 0,
          _scroll$leaf = this.scroll.leaf(index),
          _scroll$leaf2 = _slicedToArray(_scroll$leaf, 2),
          leaf = _scroll$leaf2[0],
          offset = _scroll$leaf2[1];
      if (leaf == null) return null;

      var _leaf$position = leaf.position(offset, true);

      var _leaf$position2 = _slicedToArray(_leaf$position, 2);

      node = _leaf$position2[0];
      offset = _leaf$position2[1];

      var range = document.createRange();
      if (length > 0) {
        range.setStart(node, offset);

        var _scroll$leaf3 = this.scroll.leaf(index + length);

        var _scroll$leaf4 = _slicedToArray(_scroll$leaf3, 2);

        leaf = _scroll$leaf4[0];
        offset = _scroll$leaf4[1];

        if (leaf == null) return null;

        var _leaf$position3 = leaf.position(offset, true);

        var _leaf$position4 = _slicedToArray(_leaf$position3, 2);

        node = _leaf$position4[0];
        offset = _leaf$position4[1];

        range.setEnd(node, offset);
        return range.getBoundingClientRect();
      } else {
        var side = 'left';
        var rect = void 0;
        if (node instanceof Text) {
          if (offset < node.data.length) {
            range.setStart(node, offset);
            range.setEnd(node, offset + 1);
          } else {
            range.setStart(node, offset - 1);
            range.setEnd(node, offset);
            side = 'right';
          }
          rect = range.getBoundingClientRect();
        } else {
          rect = leaf.domNode.getBoundingClientRect();
          if (offset > 0) side = 'right';
        }
        return {
          bottom: rect.top + rect.height,
          height: rect.height,
          left: rect[side],
          right: rect[side],
          top: rect.top,
          width: 0
        };
      }
    }
  }, {
    key: 'getNativeRange',
    value: function getNativeRange() {
      var selection = document.getSelection();
      if (selection == null || selection.rangeCount <= 0) return null;
      var nativeRange = selection.getRangeAt(0);
      if (nativeRange == null) return null;
      var range = this.normalizeNative(nativeRange);
      debug.info('getNativeRange', range);
      return range;
    }
  }, {
    key: 'getRange',
    value: function getRange() {
      var normalized = this.getNativeRange();
      if (normalized == null) return [null, null];
      var range = this.normalizedToRange(normalized);
      return [range, normalized];
    }
  }, {
    key: 'hasFocus',
    value: function hasFocus() {
      return document.activeElement === this.root;
    }
  }, {
    key: 'normalizedToRange',
    value: function normalizedToRange(range) {
      var _this4 = this;

      var positions = [[range.start.node, range.start.offset]];
      if (!range.native.collapsed) {
        positions.push([range.end.node, range.end.offset]);
      }
      var indexes = positions.map(function (position) {
        var _position = _slicedToArray(position, 2),
            node = _position[0],
            offset = _position[1];

        var blot = _parchment2.default.find(node, true);
        var index = blot.offset(_this4.scroll);
        if (offset === 0) {
          return index;
        } else if (blot instanceof _parchment2.default.Container) {
          return index + blot.length();
        } else {
          return index + blot.index(node, offset);
        }
      });
      var end = Math.min(Math.max.apply(Math, _toConsumableArray(indexes)), this.scroll.length() - 1);
      var start = Math.min.apply(Math, [end].concat(_toConsumableArray(indexes)));
      return new Range(start, end - start);
    }
  }, {
    key: 'normalizeNative',
    value: function normalizeNative(nativeRange) {
      if (!contains(this.root, nativeRange.startContainer) || !nativeRange.collapsed && !contains(this.root, nativeRange.endContainer)) {
        return null;
      }
      var range = {
        start: { node: nativeRange.startContainer, offset: nativeRange.startOffset },
        end: { node: nativeRange.endContainer, offset: nativeRange.endOffset },
        native: nativeRange
      };
      [range.start, range.end].forEach(function (position) {
        var node = position.node,
            offset = position.offset;
        while (!(node instanceof Text) && node.childNodes.length > 0) {
          if (node.childNodes.length > offset) {
            node = node.childNodes[offset];
            offset = 0;
          } else if (node.childNodes.length === offset) {
            node = node.lastChild;
            offset = node instanceof Text ? node.data.length : node.childNodes.length + 1;
          } else {
            break;
          }
        }
        position.node = node, position.offset = offset;
      });
      return range;
    }
  }, {
    key: 'rangeToNative',
    value: function rangeToNative(range) {
      var _this5 = this;

      var indexes = range.collapsed ? [range.index] : [range.index, range.index + range.length];
      var args = [];
      var scrollLength = this.scroll.length();
      indexes.forEach(function (index, i) {
        index = Math.min(scrollLength - 1, index);
        var node = void 0,
            _scroll$leaf5 = _this5.scroll.leaf(index),
            _scroll$leaf6 = _slicedToArray(_scroll$leaf5, 2),
            leaf = _scroll$leaf6[0],
            offset = _scroll$leaf6[1];
        var _leaf$position5 = leaf.position(offset, i !== 0);

        var _leaf$position6 = _slicedToArray(_leaf$position5, 2);

        node = _leaf$position6[0];
        offset = _leaf$position6[1];

        args.push(node, offset);
      });
      if (args.length < 2) {
        args = args.concat(args);
      }
      return args;
    }
  }, {
    key: 'scrollIntoView',
    value: function scrollIntoView(scrollingContainer) {
      var range = this.lastRange;
      if (range == null) return;
      var bounds = this.getBounds(range.index, range.length);
      if (bounds == null) return;
      var limit = this.scroll.length() - 1;

      var _scroll$line = this.scroll.line(Math.min(range.index, limit)),
          _scroll$line2 = _slicedToArray(_scroll$line, 1),
          first = _scroll$line2[0];

      var last = first;
      if (range.length > 0) {
        var _scroll$line3 = this.scroll.line(Math.min(range.index + range.length, limit));

        var _scroll$line4 = _slicedToArray(_scroll$line3, 1);

        last = _scroll$line4[0];
      }
      if (first == null || last == null) return;
      var scrollBounds = scrollingContainer.getBoundingClientRect();
      if (bounds.top < scrollBounds.top) {
        scrollingContainer.scrollTop -= scrollBounds.top - bounds.top;
      } else if (bounds.bottom > scrollBounds.bottom) {
        scrollingContainer.scrollTop += bounds.bottom - scrollBounds.bottom;
      }
    }
  }, {
    key: 'setNativeRange',
    value: function setNativeRange(startNode, startOffset) {
      var endNode = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : startNode;
      var endOffset = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : startOffset;
      var force = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

      debug.info('setNativeRange', startNode, startOffset, endNode, endOffset);
      if (startNode != null && (this.root.parentNode == null || startNode.parentNode == null || endNode.parentNode == null)) {
        return;
      }
      var selection = document.getSelection();
      if (selection == null) return;
      if (startNode != null) {
        if (!this.hasFocus()) this.root.focus();
        var native = (this.getNativeRange() || {}).native;
        if (native == null || force || startNode !== native.startContainer || startOffset !== native.startOffset || endNode !== native.endContainer || endOffset !== native.endOffset) {

          if (startNode.tagName == "BR") {
            startOffset = [].indexOf.call(startNode.parentNode.childNodes, startNode);
            startNode = startNode.parentNode;
          }
          if (endNode.tagName == "BR") {
            endOffset = [].indexOf.call(endNode.parentNode.childNodes, endNode);
            endNode = endNode.parentNode;
          }
          var range = document.createRange();
          range.setStart(startNode, startOffset);
          range.setEnd(endNode, endOffset);
          selection.removeAllRanges();
          selection.addRange(range);
        }
      } else {
        selection.removeAllRanges();
        this.root.blur();
        document.body.focus(); // root.blur() not enough on IE11+Travis+SauceLabs (but not local VMs)
      }
    }
  }, {
    key: 'setRange',
    value: function setRange(range) {
      var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var source = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _emitter4.default.sources.API;

      if (typeof force === 'string') {
        source = force;
        force = false;
      }
      debug.info('setRange', range);
      if (range != null) {
        var args = this.rangeToNative(range);
        this.setNativeRange.apply(this, _toConsumableArray(args).concat([force]));
      } else {
        this.setNativeRange(null);
      }
      this.update(source);
    }
  }, {
    key: 'update',
    value: function update() {
      var source = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _emitter4.default.sources.USER;

      var oldRange = this.lastRange;

      var _getRange = this.getRange(),
          _getRange2 = _slicedToArray(_getRange, 2),
          lastRange = _getRange2[0],
          nativeRange = _getRange2[1];

      this.lastRange = lastRange;
      if (this.lastRange != null) {
        this.savedRange = this.lastRange;
      }
      if (!(0, _deepEqual2.default)(oldRange, this.lastRange)) {
        var _emitter;

        if (!this.composing && nativeRange != null && nativeRange.native.collapsed && nativeRange.start.node !== this.cursor.textNode) {
          this.cursor.restore();
        }
        var args = [_emitter4.default.events.SELECTION_CHANGE, (0, _clone2.default)(this.lastRange), (0, _clone2.default)(oldRange), source];
        (_emitter = this.emitter).emit.apply(_emitter, [_emitter4.default.events.EDITOR_CHANGE].concat(args));
        if (source !== _emitter4.default.sources.SILENT) {
          var _emitter2;

          (_emitter2 = this.emitter).emit.apply(_emitter2, args);
        }
      }
    }
  }]);

  return Selection;
}();

function contains(parent, descendant) {
  try {
    // Firefox inserts inaccessible nodes around video elements
    descendant.parentNode;
  } catch (e) {
    return false;
  }
  // IE11 has bug with Text nodes
  // https://connect.microsoft.com/IE/feedback/details/780874/node-contains-is-incorrect
  if (descendant instanceof Text) {
    descendant = descendant.parentNode;
  }
  return parent.contains(descendant);
}

exports.Range = Range;
exports.default = Selection;

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _parchment = __webpack_require__(0);

var _parchment2 = _interopRequireDefault(_parchment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Break = function (_Parchment$Embed) {
  _inherits(Break, _Parchment$Embed);

  function Break() {
    _classCallCheck(this, Break);

    return _possibleConstructorReturn(this, (Break.__proto__ || Object.getPrototypeOf(Break)).apply(this, arguments));
  }

  _createClass(Break, [{
    key: 'insertInto',
    value: function insertInto(parent, ref) {
      if (parent.children.length === 0) {
        _get(Break.prototype.__proto__ || Object.getPrototypeOf(Break.prototype), 'insertInto', this).call(this, parent, ref);
      } else {
        this.remove();
      }
    }
  }, {
    key: 'length',
    value: function length() {
      return 0;
    }
  }, {
    key: 'value',
    value: function value() {
      return '';
    }
  }], [{
    key: 'value',
    value: function value() {
      return undefined;
    }
  }]);

  return Break;
}(_parchment2.default.Embed);

Break.blotName = 'break';
Break.tagName = 'BR';

exports.default = Break;

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var linked_list_1 = __webpack_require__(44);
var shadow_1 = __webpack_require__(30);
var Registry = __webpack_require__(1);
var ContainerBlot = /** @class */ (function (_super) {
    __extends(ContainerBlot, _super);
    function ContainerBlot(domNode) {
        var _this = _super.call(this, domNode) || this;
        _this.build();
        return _this;
    }
    ContainerBlot.prototype.appendChild = function (other) {
        this.insertBefore(other);
    };
    ContainerBlot.prototype.attach = function () {
        _super.prototype.attach.call(this);
        this.children.forEach(function (child) {
            child.attach();
        });
    };
    ContainerBlot.prototype.build = function () {
        var _this = this;
        this.children = new linked_list_1.default();
        // Need to be reversed for if DOM nodes already in order
        [].slice
            .call(this.domNode.childNodes)
            .reverse()
            .forEach(function (node) {
            try {
                var child = makeBlot(node);
                _this.insertBefore(child, _this.children.head || undefined);
            }
            catch (err) {
                if (err instanceof Registry.ParchmentError)
                    return;
                else
                    throw err;
            }
        });
    };
    ContainerBlot.prototype.deleteAt = function (index, length) {
        if (index === 0 && length === this.length()) {
            return this.remove();
        }
        this.children.forEachAt(index, length, function (child, offset, length) {
            child.deleteAt(offset, length);
        });
    };
    ContainerBlot.prototype.descendant = function (criteria, index) {
        var _a = this.children.find(index), child = _a[0], offset = _a[1];
        if ((criteria.blotName == null && criteria(child)) ||
            (criteria.blotName != null && child instanceof criteria)) {
            return [child, offset];
        }
        else if (child instanceof ContainerBlot) {
            return child.descendant(criteria, offset);
        }
        else {
            return [null, -1];
        }
    };
    ContainerBlot.prototype.descendants = function (criteria, index, length) {
        if (index === void 0) { index = 0; }
        if (length === void 0) { length = Number.MAX_VALUE; }
        var descendants = [];
        var lengthLeft = length;
        this.children.forEachAt(index, length, function (child, index, length) {
            if ((criteria.blotName == null && criteria(child)) ||
                (criteria.blotName != null && child instanceof criteria)) {
                descendants.push(child);
            }
            if (child instanceof ContainerBlot) {
                descendants = descendants.concat(child.descendants(criteria, index, lengthLeft));
            }
            lengthLeft -= length;
        });
        return descendants;
    };
    ContainerBlot.prototype.detach = function () {
        this.children.forEach(function (child) {
            child.detach();
        });
        _super.prototype.detach.call(this);
    };
    ContainerBlot.prototype.formatAt = function (index, length, name, value) {
        this.children.forEachAt(index, length, function (child, offset, length) {
            child.formatAt(offset, length, name, value);
        });
    };
    ContainerBlot.prototype.insertAt = function (index, value, def) {
        var _a = this.children.find(index), child = _a[0], offset = _a[1];
        if (child) {
            child.insertAt(offset, value, def);
        }
        else {
            var blot = def == null ? Registry.create('text', value) : Registry.create(value, def);
            this.appendChild(blot);
        }
    };
    ContainerBlot.prototype.insertBefore = function (childBlot, refBlot) {
        if (this.statics.allowedChildren != null &&
            !this.statics.allowedChildren.some(function (child) {
                return childBlot instanceof child;
            })) {
            throw new Registry.ParchmentError("Cannot insert " + childBlot.statics.blotName + " into " + this.statics.blotName);
        }
        childBlot.insertInto(this, refBlot);
    };
    ContainerBlot.prototype.length = function () {
        return this.children.reduce(function (memo, child) {
            return memo + child.length();
        }, 0);
    };
    ContainerBlot.prototype.moveChildren = function (targetParent, refNode) {
        this.children.forEach(function (child) {
            targetParent.insertBefore(child, refNode);
        });
    };
    ContainerBlot.prototype.optimize = function (context) {
        _super.prototype.optimize.call(this, context);
        if (this.children.length === 0) {
            if (this.statics.defaultChild != null) {
                var child = Registry.create(this.statics.defaultChild);
                this.appendChild(child);
                child.optimize(context);
            }
            else {
                this.remove();
            }
        }
    };
    ContainerBlot.prototype.path = function (index, inclusive) {
        if (inclusive === void 0) { inclusive = false; }
        var _a = this.children.find(index, inclusive), child = _a[0], offset = _a[1];
        var position = [[this, index]];
        if (child instanceof ContainerBlot) {
            return position.concat(child.path(offset, inclusive));
        }
        else if (child != null) {
            position.push([child, offset]);
        }
        return position;
    };
    ContainerBlot.prototype.removeChild = function (child) {
        this.children.remove(child);
    };
    ContainerBlot.prototype.replace = function (target) {
        if (target instanceof ContainerBlot) {
            target.moveChildren(this);
        }
        _super.prototype.replace.call(this, target);
    };
    ContainerBlot.prototype.split = function (index, force) {
        if (force === void 0) { force = false; }
        if (!force) {
            if (index === 0)
                return this;
            if (index === this.length())
                return this.next;
        }
        var after = this.clone();
        this.parent.insertBefore(after, this.next);
        this.children.forEachAt(index, this.length(), function (child, offset, length) {
            child = child.split(offset, force);
            after.appendChild(child);
        });
        return after;
    };
    ContainerBlot.prototype.unwrap = function () {
        this.moveChildren(this.parent, this.next);
        this.remove();
    };
    ContainerBlot.prototype.update = function (mutations, context) {
        var _this = this;
        var addedNodes = [];
        var removedNodes = [];
        mutations.forEach(function (mutation) {
            if (mutation.target === _this.domNode && mutation.type === 'childList') {
                addedNodes.push.apply(addedNodes, mutation.addedNodes);
                removedNodes.push.apply(removedNodes, mutation.removedNodes);
            }
        });
        removedNodes.forEach(function (node) {
            // Check node has actually been removed
            // One exception is Chrome does not immediately remove IFRAMEs
            // from DOM but MutationRecord is correct in its reported removal
            if (node.parentNode != null &&
                // @ts-ignore
                node.tagName !== 'IFRAME' &&
                document.body.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_CONTAINED_BY) {
                return;
            }
            var blot = Registry.find(node);
            if (blot == null)
                return;
            if (blot.domNode.parentNode == null || blot.domNode.parentNode === _this.domNode) {
                blot.detach();
            }
        });
        addedNodes
            .filter(function (node) {
            return node.parentNode == _this.domNode;
        })
            .sort(function (a, b) {
            if (a === b)
                return 0;
            if (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) {
                return 1;
            }
            return -1;
        })
            .forEach(function (node) {
            var refBlot = null;
            if (node.nextSibling != null) {
                refBlot = Registry.find(node.nextSibling);
            }
            var blot = makeBlot(node);
            if (blot.next != refBlot || blot.next == null) {
                if (blot.parent != null) {
                    blot.parent.removeChild(_this);
                }
                _this.insertBefore(blot, refBlot || undefined);
            }
        });
    };
    return ContainerBlot;
}(shadow_1.default));
function makeBlot(node) {
    var blot = Registry.find(node);
    if (blot == null) {
        try {
            blot = Registry.create(node);
        }
        catch (e) {
            blot = Registry.create(Registry.Scope.INLINE);
            [].slice.call(node.childNodes).forEach(function (child) {
                // @ts-ignore
                blot.domNode.appendChild(child);
            });
            if (node.parentNode) {
                node.parentNode.replaceChild(blot.domNode, node);
            }
            blot.attach();
        }
    }
    return blot;
}
exports.default = ContainerBlot;


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var attributor_1 = __webpack_require__(12);
var store_1 = __webpack_require__(31);
var container_1 = __webpack_require__(17);
var Registry = __webpack_require__(1);
var FormatBlot = /** @class */ (function (_super) {
    __extends(FormatBlot, _super);
    function FormatBlot(domNode) {
        var _this = _super.call(this, domNode) || this;
        _this.attributes = new store_1.default(_this.domNode);
        return _this;
    }
    FormatBlot.formats = function (domNode) {
        if (typeof this.tagName === 'string') {
            return true;
        }
        else if (Array.isArray(this.tagName)) {
            return domNode.tagName.toLowerCase();
        }
        return undefined;
    };
    FormatBlot.prototype.format = function (name, value) {
        var format = Registry.query(name);
        if (format instanceof attributor_1.default) {
            this.attributes.attribute(format, value);
        }
        else if (value) {
            if (format != null && (name !== this.statics.blotName || this.formats()[name] !== value)) {
                this.replaceWith(name, value);
            }
        }
    };
    FormatBlot.prototype.formats = function () {
        var formats = this.attributes.values();
        var format = this.statics.formats(this.domNode);
        if (format != null) {
            formats[this.statics.blotName] = format;
        }
        return formats;
    };
    FormatBlot.prototype.replaceWith = function (name, value) {
        var replacement = _super.prototype.replaceWith.call(this, name, value);
        this.attributes.copy(replacement);
        return replacement;
    };
    FormatBlot.prototype.update = function (mutations, context) {
        var _this = this;
        _super.prototype.update.call(this, mutations, context);
        if (mutations.some(function (mutation) {
            return mutation.target === _this.domNode && mutation.type === 'attributes';
        })) {
            this.attributes.build();
        }
    };
    FormatBlot.prototype.wrap = function (name, value) {
        var wrapper = _super.prototype.wrap.call(this, name, value);
        if (wrapper instanceof FormatBlot && wrapper.statics.scope === this.statics.scope) {
            this.attributes.move(wrapper);
        }
        return wrapper;
    };
    return FormatBlot;
}(container_1.default));
exports.default = FormatBlot;


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var shadow_1 = __webpack_require__(30);
var Registry = __webpack_require__(1);
var LeafBlot = /** @class */ (function (_super) {
    __extends(LeafBlot, _super);
    function LeafBlot() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    LeafBlot.value = function (domNode) {
        return true;
    };
    LeafBlot.prototype.index = function (node, offset) {
        if (this.domNode === node ||
            this.domNode.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_CONTAINED_BY) {
            return Math.min(offset, 1);
        }
        return -1;
    };
    LeafBlot.prototype.position = function (index, inclusive) {
        var offset = [].indexOf.call(this.parent.domNode.childNodes, this.domNode);
        if (index > 0)
            offset += 1;
        return [this.parent.domNode, offset];
    };
    LeafBlot.prototype.value = function () {
        var _a;
        return _a = {}, _a[this.statics.blotName] = this.statics.value(this.domNode) || true, _a;
    };
    LeafBlot.scope = Registry.Scope.INLINE_BLOT;
    return LeafBlot;
}(shadow_1.default));
exports.default = LeafBlot;


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

var equal = __webpack_require__(11);
var extend = __webpack_require__(3);


var lib = {
  attributes: {
    compose: function (a, b, keepNull) {
      if (typeof a !== 'object') a = {};
      if (typeof b !== 'object') b = {};
      var attributes = extend(true, {}, b);
      if (!keepNull) {
        attributes = Object.keys(attributes).reduce(function (copy, key) {
          if (attributes[key] != null) {
            copy[key] = attributes[key];
          }
          return copy;
        }, {});
      }
      for (var key in a) {
        if (a[key] !== undefined && b[key] === undefined) {
          attributes[key] = a[key];
        }
      }
      return Object.keys(attributes).length > 0 ? attributes : undefined;
    },

    diff: function(a, b) {
      if (typeof a !== 'object') a = {};
      if (typeof b !== 'object') b = {};
      var attributes = Object.keys(a).concat(Object.keys(b)).reduce(function (attributes, key) {
        if (!equal(a[key], b[key])) {
          attributes[key] = b[key] === undefined ? null : b[key];
        }
        return attributes;
      }, {});
      return Object.keys(attributes).length > 0 ? attributes : undefined;
    },

    transform: function (a, b, priority) {
      if (typeof a !== 'object') return b;
      if (typeof b !== 'object') return undefined;
      if (!priority) return b;  // b simply overwrites us without priority
      var attributes = Object.keys(b).reduce(function (attributes, key) {
        if (a[key] === undefined) attributes[key] = b[key];  // null is a valid value
        return attributes;
      }, {});
      return Object.keys(attributes).length > 0 ? attributes : undefined;
    }
  },

  iterator: function (ops) {
    return new Iterator(ops);
  },

  length: function (op) {
    if (typeof op['delete'] === 'number') {
      return op['delete'];
    } else if (typeof op.retain === 'number') {
      return op.retain;
    } else {
      return typeof op.insert === 'string' ? op.insert.length : 1;
    }
  }
};


function Iterator(ops) {
  this.ops = ops;
  this.index = 0;
  this.offset = 0;
};

Iterator.prototype.hasNext = function () {
  return this.peekLength() < Infinity;
};

Iterator.prototype.next = function (length) {
  if (!length) length = Infinity;
  var nextOp = this.ops[this.index];
  if (nextOp) {
    var offset = this.offset;
    var opLength = lib.length(nextOp)
    if (length >= opLength - offset) {
      length = opLength - offset;
      this.index += 1;
      this.offset = 0;
    } else {
      this.offset += length;
    }
    if (typeof nextOp['delete'] === 'number') {
      return { 'delete': length };
    } else {
      var retOp = {};
      if (nextOp.attributes) {
        retOp.attributes = nextOp.attributes;
      }
      if (typeof nextOp.retain === 'number') {
        retOp.retain = length;
      } else if (typeof nextOp.insert === 'string') {
        retOp.insert = nextOp.insert.substr(offset, length);
      } else {
        // offset should === 0, length should === 1
        retOp.insert = nextOp.insert;
      }
      return retOp;
    }
  } else {
    return { retain: Infinity };
  }
};

Iterator.prototype.peek = function () {
  return this.ops[this.index];
};

Iterator.prototype.peekLength = function () {
  if (this.ops[this.index]) {
    // Should never return 0 if our index is being managed correctly
    return lib.length(this.ops[this.index]) - this.offset;
  } else {
    return Infinity;
  }
};

Iterator.prototype.peekType = function () {
  if (this.ops[this.index]) {
    if (typeof this.ops[this.index]['delete'] === 'number') {
      return 'delete';
    } else if (typeof this.ops[this.index].retain === 'number') {
      return 'retain';
    } else {
      return 'insert';
    }
  }
  return 'retain';
};

Iterator.prototype.rest = function () {
  if (!this.hasNext()) {
    return [];
  } else if (this.offset === 0) {
    return this.ops.slice(this.index);
  } else {
    var offset = this.offset;
    var index = this.index;
    var next = this.next();
    var rest = this.ops.slice(this.index);
    this.offset = offset;
    this.index = index;
    return [next].concat(rest);
  }
};


module.exports = lib;


/***/ }),
/* 21 */
/***/ (function(module, exports) {

var clone = (function() {
'use strict';

function _instanceof(obj, type) {
  return type != null && obj instanceof type;
}

var nativeMap;
try {
  nativeMap = Map;
} catch(_) {
  // maybe a reference error because no `Map`. Give it a dummy value that no
  // value will ever be an instanceof.
  nativeMap = function() {};
}

var nativeSet;
try {
  nativeSet = Set;
} catch(_) {
  nativeSet = function() {};
}

var nativePromise;
try {
  nativePromise = Promise;
} catch(_) {
  nativePromise = function() {};
}

/**
 * Clones (copies) an Object using deep copying.
 *
 * This function supports circular references by default, but if you are certain
 * there are no circular references in your object, you can save some CPU time
 * by calling clone(obj, false).
 *
 * Caution: if `circular` is false and `parent` contains circular references,
 * your program may enter an infinite loop and crash.
 *
 * @param `parent` - the object to be cloned
 * @param `circular` - set to true if the object to be cloned may contain
 *    circular references. (optional - true by default)
 * @param `depth` - set to a number if the object is only to be cloned to
 *    a particular depth. (optional - defaults to Infinity)
 * @param `prototype` - sets the prototype to be used when cloning an object.
 *    (optional - defaults to parent prototype).
 * @param `includeNonEnumerable` - set to true if the non-enumerable properties
 *    should be cloned as well. Non-enumerable properties on the prototype
 *    chain will be ignored. (optional - false by default)
*/
function clone(parent, circular, depth, prototype, includeNonEnumerable) {
  if (typeof circular === 'object') {
    depth = circular.depth;
    prototype = circular.prototype;
    includeNonEnumerable = circular.includeNonEnumerable;
    circular = circular.circular;
  }
  // maintain two arrays for circular references, where corresponding parents
  // and children have the same index
  var allParents = [];
  var allChildren = [];

  var useBuffer = typeof Buffer != 'undefined';

  if (typeof circular == 'undefined')
    circular = true;

  if (typeof depth == 'undefined')
    depth = Infinity;

  // recurse this function so we don't reset allParents and allChildren
  function _clone(parent, depth) {
    // cloning null always returns null
    if (parent === null)
      return null;

    if (depth === 0)
      return parent;

    var child;
    var proto;
    if (typeof parent != 'object') {
      return parent;
    }

    if (_instanceof(parent, nativeMap)) {
      child = new nativeMap();
    } else if (_instanceof(parent, nativeSet)) {
      child = new nativeSet();
    } else if (_instanceof(parent, nativePromise)) {
      child = new nativePromise(function (resolve, reject) {
        parent.then(function(value) {
          resolve(_clone(value, depth - 1));
        }, function(err) {
          reject(_clone(err, depth - 1));
        });
      });
    } else if (clone.__isArray(parent)) {
      child = [];
    } else if (clone.__isRegExp(parent)) {
      child = new RegExp(parent.source, __getRegExpFlags(parent));
      if (parent.lastIndex) child.lastIndex = parent.lastIndex;
    } else if (clone.__isDate(parent)) {
      child = new Date(parent.getTime());
    } else if (useBuffer && Buffer.isBuffer(parent)) {
      if (Buffer.allocUnsafe) {
        // Node.js >= 4.5.0
        child = Buffer.allocUnsafe(parent.length);
      } else {
        // Older Node.js versions
        child = new Buffer(parent.length);
      }
      parent.copy(child);
      return child;
    } else if (_instanceof(parent, Error)) {
      child = Object.create(parent);
    } else {
      if (typeof prototype == 'undefined') {
        proto = Object.getPrototypeOf(parent);
        child = Object.create(proto);
      }
      else {
        child = Object.create(prototype);
        proto = prototype;
      }
    }

    if (circular) {
      var index = allParents.indexOf(parent);

      if (index != -1) {
        return allChildren[index];
      }
      allParents.push(parent);
      allChildren.push(child);
    }

    if (_instanceof(parent, nativeMap)) {
      parent.forEach(function(value, key) {
        var keyChild = _clone(key, depth - 1);
        var valueChild = _clone(value, depth - 1);
        child.set(keyChild, valueChild);
      });
    }
    if (_instanceof(parent, nativeSet)) {
      parent.forEach(function(value) {
        var entryChild = _clone(value, depth - 1);
        child.add(entryChild);
      });
    }

    for (var i in parent) {
      var attrs;
      if (proto) {
        attrs = Object.getOwnPropertyDescriptor(proto, i);
      }

      if (attrs && attrs.set == null) {
        continue;
      }
      child[i] = _clone(parent[i], depth - 1);
    }

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(parent);
      for (var i = 0; i < symbols.length; i++) {
        // Don't need to worry about cloning a symbol because it is a primitive,
        // like a number or string.
        var symbol = symbols[i];
        var descriptor = Object.getOwnPropertyDescriptor(parent, symbol);
        if (descriptor && !descriptor.enumerable && !includeNonEnumerable) {
          continue;
        }
        child[symbol] = _clone(parent[symbol], depth - 1);
        if (!descriptor.enumerable) {
          Object.defineProperty(child, symbol, {
            enumerable: false
          });
        }
      }
    }

    if (includeNonEnumerable) {
      var allPropertyNames = Object.getOwnPropertyNames(parent);
      for (var i = 0; i < allPropertyNames.length; i++) {
        var propertyName = allPropertyNames[i];
        var descriptor = Object.getOwnPropertyDescriptor(parent, propertyName);
        if (descriptor && descriptor.enumerable) {
          continue;
        }
        child[propertyName] = _clone(parent[propertyName], depth - 1);
        Object.defineProperty(child, propertyName, {
          enumerable: false
        });
      }
    }

    return child;
  }

  return _clone(parent, depth);
}

/**
 * Simple flat clone using prototype, accepts only objects, usefull for property
 * override on FLAT configuration object (no nested props).
 *
 * USE WITH CAUTION! This may not behave as you wish if you do not know how this
 * works.
 */
clone.clonePrototype = function clonePrototype(parent) {
  if (parent === null)
    return null;

  var c = function () {};
  c.prototype = parent;
  return new c();
};

// private utility functions

function __objToStr(o) {
  return Object.prototype.toString.call(o);
}
clone.__objToStr = __objToStr;

function __isDate(o) {
  return typeof o === 'object' && __objToStr(o) === '[object Date]';
}
clone.__isDate = __isDate;

function __isArray(o) {
  return typeof o === 'object' && __objToStr(o) === '[object Array]';
}
clone.__isArray = __isArray;

function __isRegExp(o) {
  return typeof o === 'object' && __objToStr(o) === '[object RegExp]';
}
clone.__isRegExp = __isRegExp;

function __getRegExpFlags(re) {
  var flags = '';
  if (re.global) flags += 'g';
  if (re.ignoreCase) flags += 'i';
  if (re.multiline) flags += 'm';
  return flags;
}
clone.__getRegExpFlags = __getRegExpFlags;

return clone;
})();

if (typeof module === 'object' && module.exports) {
  module.exports = clone;
}


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _parchment = __webpack_require__(0);

var _parchment2 = _interopRequireDefault(_parchment);

var _emitter = __webpack_require__(8);

var _emitter2 = _interopRequireDefault(_emitter);

var _block = __webpack_require__(4);

var _block2 = _interopRequireDefault(_block);

var _break = __webpack_require__(16);

var _break2 = _interopRequireDefault(_break);

var _code = __webpack_require__(13);

var _code2 = _interopRequireDefault(_code);

var _container = __webpack_require__(25);

var _container2 = _interopRequireDefault(_container);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function isLine(blot) {
  return blot instanceof _block2.default || blot instanceof _block.BlockEmbed;
}

var Scroll = function (_Parchment$Scroll) {
  _inherits(Scroll, _Parchment$Scroll);

  function Scroll(domNode, config) {
    _classCallCheck(this, Scroll);

    var _this = _possibleConstructorReturn(this, (Scroll.__proto__ || Object.getPrototypeOf(Scroll)).call(this, domNode));

    _this.emitter = config.emitter;
    if (Array.isArray(config.whitelist)) {
      _this.whitelist = config.whitelist.reduce(function (whitelist, format) {
        whitelist[format] = true;
        return whitelist;
      }, {});
    }
    // Some reason fixes composition issues with character languages in Windows/Chrome, Safari
    _this.domNode.addEventListener('DOMNodeInserted', function () {});
    _this.optimize();
    _this.enable();
    return _this;
  }

  _createClass(Scroll, [{
    key: 'batchStart',
    value: function batchStart() {
      this.batch = true;
    }
  }, {
    key: 'batchEnd',
    value: function batchEnd() {
      this.batch = false;
      this.optimize();
    }
  }, {
    key: 'deleteAt',
    value: function deleteAt(index, length) {
      var _line = this.line(index),
          _line2 = _slicedToArray(_line, 2),
          first = _line2[0],
          offset = _line2[1];

      var _line3 = this.line(index + length),
          _line4 = _slicedToArray(_line3, 1),
          last = _line4[0];

      _get(Scroll.prototype.__proto__ || Object.getPrototypeOf(Scroll.prototype), 'deleteAt', this).call(this, index, length);
      if (last != null && first !== last && offset > 0) {
        if (first instanceof _block.BlockEmbed || last instanceof _block.BlockEmbed) {
          this.optimize();
          return;
        }
        if (first instanceof _code2.default) {
          var newlineIndex = first.newlineIndex(first.length(), true);
          if (newlineIndex > -1) {
            first = first.split(newlineIndex + 1);
            if (first === last) {
              this.optimize();
              return;
            }
          }
        } else if (last instanceof _code2.default) {
          var _newlineIndex = last.newlineIndex(0);
          if (_newlineIndex > -1) {
            last.split(_newlineIndex + 1);
          }
        }
        var ref = last.children.head instanceof _break2.default ? null : last.children.head;
        first.moveChildren(last, ref);
        first.remove();
      }
      this.optimize();
    }
  }, {
    key: 'enable',
    value: function enable() {
      var enabled = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      this.domNode.setAttribute('contenteditable', enabled);
    }
  }, {
    key: 'formatAt',
    value: function formatAt(index, length, format, value) {
      if (this.whitelist != null && !this.whitelist[format]) return;
      _get(Scroll.prototype.__proto__ || Object.getPrototypeOf(Scroll.prototype), 'formatAt', this).call(this, index, length, format, value);
      this.optimize();
    }
  }, {
    key: 'insertAt',
    value: function insertAt(index, value, def) {
      if (def != null && this.whitelist != null && !this.whitelist[value]) return;
      if (index >= this.length()) {
        if (def == null || _parchment2.default.query(value, _parchment2.default.Scope.BLOCK) == null) {
          var blot = _parchment2.default.create(this.statics.defaultChild);
          this.appendChild(blot);
          if (def == null && value.endsWith('\n')) {
            value = value.slice(0, -1);
          }
          blot.insertAt(0, value, def);
        } else {
          var embed = _parchment2.default.create(value, def);
          this.appendChild(embed);
        }
      } else {
        _get(Scroll.prototype.__proto__ || Object.getPrototypeOf(Scroll.prototype), 'insertAt', this).call(this, index, value, def);
      }
      this.optimize();
    }
  }, {
    key: 'insertBefore',
    value: function insertBefore(blot, ref) {
      if (blot.statics.scope === _parchment2.default.Scope.INLINE_BLOT) {
        var wrapper = _parchment2.default.create(this.statics.defaultChild);
        wrapper.appendChild(blot);
        blot = wrapper;
      }
      _get(Scroll.prototype.__proto__ || Object.getPrototypeOf(Scroll.prototype), 'insertBefore', this).call(this, blot, ref);
    }
  }, {
    key: 'leaf',
    value: function leaf(index) {
      return this.path(index).pop() || [null, -1];
    }
  }, {
    key: 'line',
    value: function line(index) {
      if (index === this.length()) {
        return this.line(index - 1);
      }
      return this.descendant(isLine, index);
    }
  }, {
    key: 'lines',
    value: function lines() {
      var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var length = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Number.MAX_VALUE;

      var getLines = function getLines(blot, index, length) {
        var lines = [],
            lengthLeft = length;
        blot.children.forEachAt(index, length, function (child, index, length) {
          if (isLine(child)) {
            lines.push(child);
          } else if (child instanceof _parchment2.default.Container) {
            lines = lines.concat(getLines(child, index, lengthLeft));
          }
          lengthLeft -= length;
        });
        return lines;
      };
      return getLines(this, index, length);
    }
  }, {
    key: 'optimize',
    value: function optimize() {
      var mutations = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if (this.batch === true) return;
      _get(Scroll.prototype.__proto__ || Object.getPrototypeOf(Scroll.prototype), 'optimize', this).call(this, mutations, context);
      if (mutations.length > 0) {
        this.emitter.emit(_emitter2.default.events.SCROLL_OPTIMIZE, mutations, context);
      }
    }
  }, {
    key: 'path',
    value: function path(index) {
      return _get(Scroll.prototype.__proto__ || Object.getPrototypeOf(Scroll.prototype), 'path', this).call(this, index).slice(1); // Exclude self
    }
  }, {
    key: 'update',
    value: function update(mutations) {
      if (this.batch === true) return;
      var source = _emitter2.default.sources.USER;
      if (typeof mutations === 'string') {
        source = mutations;
      }
      if (!Array.isArray(mutations)) {
        mutations = this.observer.takeRecords();
      }
      if (mutations.length > 0) {
        this.emitter.emit(_emitter2.default.events.SCROLL_BEFORE_UPDATE, source, mutations);
      }
      _get(Scroll.prototype.__proto__ || Object.getPrototypeOf(Scroll.prototype), 'update', this).call(this, mutations.concat([])); // pass copy
      if (mutations.length > 0) {
        this.emitter.emit(_emitter2.default.events.SCROLL_UPDATE, source, mutations);
      }
    }
  }]);

  return Scroll;
}(_parchment2.default.Scroll);

Scroll.blotName = 'scroll';
Scroll.className = 'ql-editor';
Scroll.tagName = 'DIV';
Scroll.defaultChild = 'block';
Scroll.allowedChildren = [_block2.default, _block.BlockEmbed, _container2.default];

exports.default = Scroll;

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SHORTKEY = exports.default = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _clone = __webpack_require__(21);

var _clone2 = _interopRequireDefault(_clone);

var _deepEqual = __webpack_require__(11);

var _deepEqual2 = _interopRequireDefault(_deepEqual);

var _extend = __webpack_require__(3);

var _extend2 = _interopRequireDefault(_extend);

var _quillDelta = __webpack_require__(2);

var _quillDelta2 = _interopRequireDefault(_quillDelta);

var _op = __webpack_require__(20);

var _op2 = _interopRequireDefault(_op);

var _parchment = __webpack_require__(0);

var _parchment2 = _interopRequireDefault(_parchment);

var _quill = __webpack_require__(5);

var _quill2 = _interopRequireDefault(_quill);

var _logger = __webpack_require__(10);

var _logger2 = _interopRequireDefault(_logger);

var _module = __webpack_require__(9);

var _module2 = _interopRequireDefault(_module);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var debug = (0, _logger2.default)('quill:keyboard');

var SHORTKEY = /Mac/i.test(navigator.platform) ? 'metaKey' : 'ctrlKey';

var Keyboard = function (_Module) {
  _inherits(Keyboard, _Module);

  _createClass(Keyboard, null, [{
    key: 'match',
    value: function match(evt, binding) {
      binding = normalize(binding);
      if (['altKey', 'ctrlKey', 'metaKey', 'shiftKey'].some(function (key) {
        return !!binding[key] !== evt[key] && binding[key] !== null;
      })) {
        return false;
      }
      return binding.key === (evt.which || evt.keyCode);
    }
  }]);

  function Keyboard(quill, options) {
    _classCallCheck(this, Keyboard);

    var _this = _possibleConstructorReturn(this, (Keyboard.__proto__ || Object.getPrototypeOf(Keyboard)).call(this, quill, options));

    _this.bindings = {};
    Object.keys(_this.options.bindings).forEach(function (name) {
      if (name === 'list autofill' && quill.scroll.whitelist != null && !quill.scroll.whitelist['list']) {
        return;
      }
      if (_this.options.bindings[name]) {
        _this.addBinding(_this.options.bindings[name]);
      }
    });
    _this.addBinding({ key: Keyboard.keys.ENTER, shiftKey: null }, handleEnter);
    _this.addBinding({ key: Keyboard.keys.ENTER, metaKey: null, ctrlKey: null, altKey: null }, function () {});
    if (/Firefox/i.test(navigator.userAgent)) {
      // Need to handle delete and backspace for Firefox in the general case #1171
      _this.addBinding({ key: Keyboard.keys.BACKSPACE }, { collapsed: true }, handleBackspace);
      _this.addBinding({ key: Keyboard.keys.DELETE }, { collapsed: true }, handleDelete);
    } else {
      _this.addBinding({ key: Keyboard.keys.BACKSPACE }, { collapsed: true, prefix: /^.?$/ }, handleBackspace);
      _this.addBinding({ key: Keyboard.keys.DELETE }, { collapsed: true, suffix: /^.?$/ }, handleDelete);
    }
    _this.addBinding({ key: Keyboard.keys.BACKSPACE }, { collapsed: false }, handleDeleteRange);
    _this.addBinding({ key: Keyboard.keys.DELETE }, { collapsed: false }, handleDeleteRange);
    _this.addBinding({ key: Keyboard.keys.BACKSPACE, altKey: null, ctrlKey: null, metaKey: null, shiftKey: null }, { collapsed: true, offset: 0 }, handleBackspace);
    _this.listen();
    return _this;
  }

  _createClass(Keyboard, [{
    key: 'addBinding',
    value: function addBinding(key) {
      var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var handler = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      var binding = normalize(key);
      if (binding == null || binding.key == null) {
        return debug.warn('Attempted to add invalid keyboard binding', binding);
      }
      if (typeof context === 'function') {
        context = { handler: context };
      }
      if (typeof handler === 'function') {
        handler = { handler: handler };
      }
      binding = (0, _extend2.default)(binding, context, handler);
      this.bindings[binding.key] = this.bindings[binding.key] || [];
      this.bindings[binding.key].push(binding);
    }
  }, {
    key: 'listen',
    value: function listen() {
      var _this2 = this;

      this.quill.root.addEventListener('keydown', function (evt) {
        if (evt.defaultPrevented) return;
        var which = evt.which || evt.keyCode;
        var bindings = (_this2.bindings[which] || []).filter(function (binding) {
          return Keyboard.match(evt, binding);
        });
        if (bindings.length === 0) return;
        var range = _this2.quill.getSelection();
        if (range == null || !_this2.quill.hasFocus()) return;

        var _quill$getLine = _this2.quill.getLine(range.index),
            _quill$getLine2 = _slicedToArray(_quill$getLine, 2),
            line = _quill$getLine2[0],
            offset = _quill$getLine2[1];

        var _quill$getLeaf = _this2.quill.getLeaf(range.index),
            _quill$getLeaf2 = _slicedToArray(_quill$getLeaf, 2),
            leafStart = _quill$getLeaf2[0],
            offsetStart = _quill$getLeaf2[1];

        var _ref = range.length === 0 ? [leafStart, offsetStart] : _this2.quill.getLeaf(range.index + range.length),
            _ref2 = _slicedToArray(_ref, 2),
            leafEnd = _ref2[0],
            offsetEnd = _ref2[1];

        var prefixText = leafStart instanceof _parchment2.default.Text ? leafStart.value().slice(0, offsetStart) : '';
        var suffixText = leafEnd instanceof _parchment2.default.Text ? leafEnd.value().slice(offsetEnd) : '';
        var curContext = {
          collapsed: range.length === 0,
          empty: range.length === 0 && line.length() <= 1,
          format: _this2.quill.getFormat(range),
          offset: offset,
          prefix: prefixText,
          suffix: suffixText
        };
        var prevented = bindings.some(function (binding) {
          if (binding.collapsed != null && binding.collapsed !== curContext.collapsed) return false;
          if (binding.empty != null && binding.empty !== curContext.empty) return false;
          if (binding.offset != null && binding.offset !== curContext.offset) return false;
          if (Array.isArray(binding.format)) {
            // any format is present
            if (binding.format.every(function (name) {
              return curContext.format[name] == null;
            })) {
              return false;
            }
          } else if (_typeof(binding.format) === 'object') {
            // all formats must match
            if (!Object.keys(binding.format).every(function (name) {
              if (binding.format[name] === true) return curContext.format[name] != null;
              if (binding.format[name] === false) return curContext.format[name] == null;
              return (0, _deepEqual2.default)(binding.format[name], curContext.format[name]);
            })) {
              return false;
            }
          }
          if (binding.prefix != null && !binding.prefix.test(curContext.prefix)) return false;
          if (binding.suffix != null && !binding.suffix.test(curContext.suffix)) return false;
          return binding.handler.call(_this2, range, curContext) !== true;
        });
        if (prevented) {
          evt.preventDefault();
        }
      });
    }
  }]);

  return Keyboard;
}(_module2.default);

Keyboard.keys = {
  BACKSPACE: 8,
  TAB: 9,
  ENTER: 13,
  ESCAPE: 27,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  DELETE: 46
};

Keyboard.DEFAULTS = {
  bindings: {
    'bold': makeFormatHandler('bold'),
    'italic': makeFormatHandler('italic'),
    'underline': makeFormatHandler('underline'),
    'indent': {
      // highlight tab or tab at beginning of list, indent or blockquote
      key: Keyboard.keys.TAB,
      format: ['blockquote', 'indent', 'list'],
      handler: function handler(range, context) {
        if (context.collapsed && context.offset !== 0) return true;
        this.quill.format('indent', '+1', _quill2.default.sources.USER);
      }
    },
    'outdent': {
      key: Keyboard.keys.TAB,
      shiftKey: true,
      format: ['blockquote', 'indent', 'list'],
      // highlight tab or tab at beginning of list, indent or blockquote
      handler: function handler(range, context) {
        if (context.collapsed && context.offset !== 0) return true;
        this.quill.format('indent', '-1', _quill2.default.sources.USER);
      }
    },
    'outdent backspace': {
      key: Keyboard.keys.BACKSPACE,
      collapsed: true,
      shiftKey: null,
      metaKey: null,
      ctrlKey: null,
      altKey: null,
      format: ['indent', 'list'],
      offset: 0,
      handler: function handler(range, context) {
        if (context.format.indent != null) {
          this.quill.format('indent', '-1', _quill2.default.sources.USER);
        } else if (context.format.list != null) {
          this.quill.format('list', false, _quill2.default.sources.USER);
        }
      }
    },
    'indent code-block': makeCodeBlockHandler(true),
    'outdent code-block': makeCodeBlockHandler(false),
    'remove tab': {
      key: Keyboard.keys.TAB,
      shiftKey: true,
      collapsed: true,
      prefix: /\t$/,
      handler: function handler(range) {
        this.quill.deleteText(range.index - 1, 1, _quill2.default.sources.USER);
      }
    },
    'tab': {
      key: Keyboard.keys.TAB,
      handler: function handler(range) {
        this.quill.history.cutoff();
        var delta = new _quillDelta2.default().retain(range.index).delete(range.length).insert('\t');
        this.quill.updateContents(delta, _quill2.default.sources.USER);
        this.quill.history.cutoff();
        this.quill.setSelection(range.index + 1, _quill2.default.sources.SILENT);
      }
    },
    'list empty enter': {
      key: Keyboard.keys.ENTER,
      collapsed: true,
      format: ['list'],
      empty: true,
      handler: function handler(range, context) {
        this.quill.format('list', false, _quill2.default.sources.USER);
        if (context.format.indent) {
          this.quill.format('indent', false, _quill2.default.sources.USER);
        }
      }
    },
    'checklist enter': {
      key: Keyboard.keys.ENTER,
      collapsed: true,
      format: { list: 'checked' },
      handler: function handler(range) {
        var _quill$getLine3 = this.quill.getLine(range.index),
            _quill$getLine4 = _slicedToArray(_quill$getLine3, 2),
            line = _quill$getLine4[0],
            offset = _quill$getLine4[1];

        var formats = (0, _extend2.default)({}, line.formats(), { list: 'checked' });
        var delta = new _quillDelta2.default().retain(range.index).insert('\n', formats).retain(line.length() - offset - 1).retain(1, { list: 'unchecked' });
        this.quill.updateContents(delta, _quill2.default.sources.USER);
        this.quill.setSelection(range.index + 1, _quill2.default.sources.SILENT);
        this.quill.scrollIntoView();
      }
    },
    'header enter': {
      key: Keyboard.keys.ENTER,
      collapsed: true,
      format: ['header'],
      suffix: /^$/,
      handler: function handler(range, context) {
        var _quill$getLine5 = this.quill.getLine(range.index),
            _quill$getLine6 = _slicedToArray(_quill$getLine5, 2),
            line = _quill$getLine6[0],
            offset = _quill$getLine6[1];

        var delta = new _quillDelta2.default().retain(range.index).insert('\n', context.format).retain(line.length() - offset - 1).retain(1, { header: null });
        this.quill.updateContents(delta, _quill2.default.sources.USER);
        this.quill.setSelection(range.index + 1, _quill2.default.sources.SILENT);
        this.quill.scrollIntoView();
      }
    },
    'list autofill': {
      key: ' ',
      collapsed: true,
      format: { list: false },
      prefix: /^\s*?(\d+\.|-|\*|\[ ?\]|\[x\])$/,
      handler: function handler(range, context) {
        var length = context.prefix.length;

        var _quill$getLine7 = this.quill.getLine(range.index),
            _quill$getLine8 = _slicedToArray(_quill$getLine7, 2),
            line = _quill$getLine8[0],
            offset = _quill$getLine8[1];

        if (offset > length) return true;
        var value = void 0;
        switch (context.prefix.trim()) {
          case '[]':case '[ ]':
            value = 'unchecked';
            break;
          case '[x]':
            value = 'checked';
            break;
          case '-':case '*':
            value = 'bullet';
            break;
          default:
            value = 'ordered';
        }
        this.quill.insertText(range.index, ' ', _quill2.default.sources.USER);
        this.quill.history.cutoff();
        var delta = new _quillDelta2.default().retain(range.index - offset).delete(length + 1).retain(line.length() - 2 - offset).retain(1, { list: value });
        this.quill.updateContents(delta, _quill2.default.sources.USER);
        this.quill.history.cutoff();
        this.quill.setSelection(range.index - length, _quill2.default.sources.SILENT);
      }
    },
    'code exit': {
      key: Keyboard.keys.ENTER,
      collapsed: true,
      format: ['code-block'],
      prefix: /\n\n$/,
      suffix: /^\s+$/,
      handler: function handler(range) {
        var _quill$getLine9 = this.quill.getLine(range.index),
            _quill$getLine10 = _slicedToArray(_quill$getLine9, 2),
            line = _quill$getLine10[0],
            offset = _quill$getLine10[1];

        var delta = new _quillDelta2.default().retain(range.index + line.length() - offset - 2).retain(1, { 'code-block': null }).delete(1);
        this.quill.updateContents(delta, _quill2.default.sources.USER);
      }
    },
    'embed left': makeEmbedArrowHandler(Keyboard.keys.LEFT, false),
    'embed left shift': makeEmbedArrowHandler(Keyboard.keys.LEFT, true),
    'embed right': makeEmbedArrowHandler(Keyboard.keys.RIGHT, false),
    'embed right shift': makeEmbedArrowHandler(Keyboard.keys.RIGHT, true)
  }
};

function makeEmbedArrowHandler(key, shiftKey) {
  var _ref3;

  var where = key === Keyboard.keys.LEFT ? 'prefix' : 'suffix';
  return _ref3 = {
    key: key,
    shiftKey: shiftKey,
    altKey: null
  }, _defineProperty(_ref3, where, /^$/), _defineProperty(_ref3, 'handler', function handler(range) {
    var index = range.index;
    if (key === Keyboard.keys.RIGHT) {
      index += range.length + 1;
    }

    var _quill$getLeaf3 = this.quill.getLeaf(index),
        _quill$getLeaf4 = _slicedToArray(_quill$getLeaf3, 1),
        leaf = _quill$getLeaf4[0];

    if (!(leaf instanceof _parchment2.default.Embed)) return true;
    if (key === Keyboard.keys.LEFT) {
      if (shiftKey) {
        this.quill.setSelection(range.index - 1, range.length + 1, _quill2.default.sources.USER);
      } else {
        this.quill.setSelection(range.index - 1, _quill2.default.sources.USER);
      }
    } else {
      if (shiftKey) {
        this.quill.setSelection(range.index, range.length + 1, _quill2.default.sources.USER);
      } else {
        this.quill.setSelection(range.index + range.length + 1, _quill2.default.sources.USER);
      }
    }
    return false;
  }), _ref3;
}

function handleBackspace(range, context) {
  if (range.index === 0 || this.quill.getLength() <= 1) return;

  var _quill$getLine11 = this.quill.getLine(range.index),
      _quill$getLine12 = _slicedToArray(_quill$getLine11, 1),
      line = _quill$getLine12[0];

  var formats = {};
  if (context.offset === 0) {
    var _quill$getLine13 = this.quill.getLine(range.index - 1),
        _quill$getLine14 = _slicedToArray(_quill$getLine13, 1),
        prev = _quill$getLine14[0];

    if (prev != null && prev.length() > 1) {
      var curFormats = line.formats();
      var prevFormats = this.quill.getFormat(range.index - 1, 1);
      formats = _op2.default.attributes.diff(curFormats, prevFormats) || {};
    }
  }
  // Check for astral symbols
  var length = /[\uD800-\uDBFF][\uDC00-\uDFFF]$/.test(context.prefix) ? 2 : 1;
  this.quill.deleteText(range.index - length, length, _quill2.default.sources.USER);
  if (Object.keys(formats).length > 0) {
    this.quill.formatLine(range.index - length, length, formats, _quill2.default.sources.USER);
  }
  this.quill.focus();
}

function handleDelete(range, context) {
  // Check for astral symbols
  var length = /^[\uD800-\uDBFF][\uDC00-\uDFFF]/.test(context.suffix) ? 2 : 1;
  if (range.index >= this.quill.getLength() - length) return;
  var formats = {},
      nextLength = 0;

  var _quill$getLine15 = this.quill.getLine(range.index),
      _quill$getLine16 = _slicedToArray(_quill$getLine15, 1),
      line = _quill$getLine16[0];

  if (context.offset >= line.length() - 1) {
    var _quill$getLine17 = this.quill.getLine(range.index + 1),
        _quill$getLine18 = _slicedToArray(_quill$getLine17, 1),
        next = _quill$getLine18[0];

    if (next) {
      var curFormats = line.formats();
      var nextFormats = this.quill.getFormat(range.index, 1);
      formats = _op2.default.attributes.diff(curFormats, nextFormats) || {};
      nextLength = next.length();
    }
  }
  this.quill.deleteText(range.index, length, _quill2.default.sources.USER);
  if (Object.keys(formats).length > 0) {
    this.quill.formatLine(range.index + nextLength - 1, length, formats, _quill2.default.sources.USER);
  }
}

function handleDeleteRange(range) {
  var lines = this.quill.getLines(range);
  var formats = {};
  if (lines.length > 1) {
    var firstFormats = lines[0].formats();
    var lastFormats = lines[lines.length - 1].formats();
    formats = _op2.default.attributes.diff(lastFormats, firstFormats) || {};
  }
  this.quill.deleteText(range, _quill2.default.sources.USER);
  if (Object.keys(formats).length > 0) {
    this.quill.formatLine(range.index, 1, formats, _quill2.default.sources.USER);
  }
  this.quill.setSelection(range.index, _quill2.default.sources.SILENT);
  this.quill.focus();
}

function handleEnter(range, context) {
  var _this3 = this;

  if (range.length > 0) {
    this.quill.scroll.deleteAt(range.index, range.length); // So we do not trigger text-change
  }
  var lineFormats = Object.keys(context.format).reduce(function (lineFormats, format) {
    if (_parchment2.default.query(format, _parchment2.default.Scope.BLOCK) && !Array.isArray(context.format[format])) {
      lineFormats[format] = context.format[format];
    }
    return lineFormats;
  }, {});
  this.quill.insertText(range.index, '\n', lineFormats, _quill2.default.sources.USER);
  // Earlier scroll.deleteAt might have messed up our selection,
  // so insertText's built in selection preservation is not reliable
  this.quill.setSelection(range.index + 1, _quill2.default.sources.SILENT);
  this.quill.focus();
  Object.keys(context.format).forEach(function (name) {
    if (lineFormats[name] != null) return;
    if (Array.isArray(context.format[name])) return;
    if (name === 'link') return;
    _this3.quill.format(name, context.format[name], _quill2.default.sources.USER);
  });
}

function makeCodeBlockHandler(indent) {
  return {
    key: Keyboard.keys.TAB,
    shiftKey: !indent,
    format: { 'code-block': true },
    handler: function handler(range) {
      var CodeBlock = _parchment2.default.query('code-block');
      var index = range.index,
          length = range.length;

      var _quill$scroll$descend = this.quill.scroll.descendant(CodeBlock, index),
          _quill$scroll$descend2 = _slicedToArray(_quill$scroll$descend, 2),
          block = _quill$scroll$descend2[0],
          offset = _quill$scroll$descend2[1];

      if (block == null) return;
      var scrollIndex = this.quill.getIndex(block);
      var start = block.newlineIndex(offset, true) + 1;
      var end = block.newlineIndex(scrollIndex + offset + length);
      var lines = block.domNode.textContent.slice(start, end).split('\n');
      offset = 0;
      lines.forEach(function (line, i) {
        if (indent) {
          block.insertAt(start + offset, CodeBlock.TAB);
          offset += CodeBlock.TAB.length;
          if (i === 0) {
            index += CodeBlock.TAB.length;
          } else {
            length += CodeBlock.TAB.length;
          }
        } else if (line.startsWith(CodeBlock.TAB)) {
          block.deleteAt(start + offset, CodeBlock.TAB.length);
          offset -= CodeBlock.TAB.length;
          if (i === 0) {
            index -= CodeBlock.TAB.length;
          } else {
            length -= CodeBlock.TAB.length;
          }
        }
        offset += line.length + 1;
      });
      this.quill.update(_quill2.default.sources.USER);
      this.quill.setSelection(index, length, _quill2.default.sources.SILENT);
    }
  };
}

function makeFormatHandler(format) {
  return {
    key: format[0].toUpperCase(),
    shortKey: true,
    handler: function handler(range, context) {
      this.quill.format(format, !context.format[format], _quill2.default.sources.USER);
    }
  };
}

function normalize(binding) {
  if (typeof binding === 'string' || typeof binding === 'number') {
    return normalize({ key: binding });
  }
  if ((typeof binding === 'undefined' ? 'undefined' : _typeof(binding)) === 'object') {
    binding = (0, _clone2.default)(binding, false);
  }
  if (typeof binding.key === 'string') {
    if (Keyboard.keys[binding.key.toUpperCase()] != null) {
      binding.key = Keyboard.keys[binding.key.toUpperCase()];
    } else if (binding.key.length === 1) {
      binding.key = binding.key.toUpperCase().charCodeAt(0);
    } else {
      return null;
    }
  }
  if (binding.shortKey) {
    binding[SHORTKEY] = binding.shortKey;
    delete binding.shortKey;
  }
  return binding;
}

exports.default = Keyboard;
exports.SHORTKEY = SHORTKEY;

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _parchment = __webpack_require__(0);

var _parchment2 = _interopRequireDefault(_parchment);

var _text = __webpack_require__(7);

var _text2 = _interopRequireDefault(_text);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Cursor = function (_Parchment$Embed) {
  _inherits(Cursor, _Parchment$Embed);

  _createClass(Cursor, null, [{
    key: 'value',
    value: function value() {
      return undefined;
    }
  }]);

  function Cursor(domNode, selection) {
    _classCallCheck(this, Cursor);

    var _this = _possibleConstructorReturn(this, (Cursor.__proto__ || Object.getPrototypeOf(Cursor)).call(this, domNode));

    _this.selection = selection;
    _this.textNode = document.createTextNode(Cursor.CONTENTS);
    _this.domNode.appendChild(_this.textNode);
    _this._length = 0;
    return _this;
  }

  _createClass(Cursor, [{
    key: 'detach',
    value: function detach() {
      // super.detach() will also clear domNode.__blot
      if (this.parent != null) this.parent.removeChild(this);
    }
  }, {
    key: 'format',
    value: function format(name, value) {
      if (this._length !== 0) {
        return _get(Cursor.prototype.__proto__ || Object.getPrototypeOf(Cursor.prototype), 'format', this).call(this, name, value);
      }
      var target = this,
          index = 0;
      while (target != null && target.statics.scope !== _parchment2.default.Scope.BLOCK_BLOT) {
        index += target.offset(target.parent);
        target = target.parent;
      }
      if (target != null) {
        this._length = Cursor.CONTENTS.length;
        target.optimize();
        target.formatAt(index, Cursor.CONTENTS.length, name, value);
        this._length = 0;
      }
    }
  }, {
    key: 'index',
    value: function index(node, offset) {
      if (node === this.textNode) return 0;
      return _get(Cursor.prototype.__proto__ || Object.getPrototypeOf(Cursor.prototype), 'index', this).call(this, node, offset);
    }
  }, {
    key: 'length',
    value: function length() {
      return this._length;
    }
  }, {
    key: 'position',
    value: function position() {
      return [this.textNode, this.textNode.data.length];
    }
  }, {
    key: 'remove',
    value: function remove() {
      _get(Cursor.prototype.__proto__ || Object.getPrototypeOf(Cursor.prototype), 'remove', this).call(this);
      this.parent = null;
    }
  }, {
    key: 'restore',
    value: function restore() {
      if (this.selection.composing || this.parent == null) return;
      var textNode = this.textNode;
      var range = this.selection.getNativeRange();
      var restoreText = void 0,
          start = void 0,
          end = void 0;
      if (range != null && range.start.node === textNode && range.end.node === textNode) {
        var _ref = [textNode, range.start.offset, range.end.offset];
        restoreText = _ref[0];
        start = _ref[1];
        end = _ref[2];
      }
      // Link format will insert text outside of anchor tag
      while (this.domNode.lastChild != null && this.domNode.lastChild !== this.textNode) {
        this.domNode.parentNode.insertBefore(this.domNode.lastChild, this.domNode);
      }
      if (this.textNode.data !== Cursor.CONTENTS) {
        var text = this.textNode.data.split(Cursor.CONTENTS).join('');
        if (this.next instanceof _text2.default) {
          restoreText = this.next.domNode;
          this.next.insertAt(0, text);
          this.textNode.data = Cursor.CONTENTS;
        } else {
          this.textNode.data = text;
          this.parent.insertBefore(_parchment2.default.create(this.textNode), this);
          this.textNode = document.createTextNode(Cursor.CONTENTS);
          this.domNode.appendChild(this.textNode);
        }
      }
      this.remove();
      if (start != null) {
        var _map = [start, end].map(function (offset) {
          return Math.max(0, Math.min(restoreText.data.length, offset - 1));
        });

        var _map2 = _slicedToArray(_map, 2);

        start = _map2[0];
        end = _map2[1];

        return {
          startNode: restoreText,
          startOffset: start,
          endNode: restoreText,
          endOffset: end
        };
      }
    }
  }, {
    key: 'update',
    value: function update(mutations, context) {
      var _this2 = this;

      if (mutations.some(function (mutation) {
        return mutation.type === 'characterData' && mutation.target === _this2.textNode;
      })) {
        var range = this.restore();
        if (range) context.range = range;
      }
    }
  }, {
    key: 'value',
    value: function value() {
      return '';
    }
  }]);

  return Cursor;
}(_parchment2.default.Embed);

Cursor.blotName = 'cursor';
Cursor.className = 'ql-cursor';
Cursor.tagName = 'span';
Cursor.CONTENTS = '\uFEFF'; // Zero width no break space


exports.default = Cursor;

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _parchment = __webpack_require__(0);

var _parchment2 = _interopRequireDefault(_parchment);

var _block = __webpack_require__(4);

var _block2 = _interopRequireDefault(_block);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Container = function (_Parchment$Container) {
  _inherits(Container, _Parchment$Container);

  function Container() {
    _classCallCheck(this, Container);

    return _possibleConstructorReturn(this, (Container.__proto__ || Object.getPrototypeOf(Container)).apply(this, arguments));
  }

  return Container;
}(_parchment2.default.Container);

Container.allowedChildren = [_block2.default, _block.BlockEmbed, Container];

exports.default = Container;

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ColorStyle = exports.ColorClass = exports.ColorAttributor = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _parchment = __webpack_require__(0);

var _parchment2 = _interopRequireDefault(_parchment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ColorAttributor = function (_Parchment$Attributor) {
  _inherits(ColorAttributor, _Parchment$Attributor);

  function ColorAttributor() {
    _classCallCheck(this, ColorAttributor);

    return _possibleConstructorReturn(this, (ColorAttributor.__proto__ || Object.getPrototypeOf(ColorAttributor)).apply(this, arguments));
  }

  _createClass(ColorAttributor, [{
    key: 'value',
    value: function value(domNode) {
      var value = _get(ColorAttributor.prototype.__proto__ || Object.getPrototypeOf(ColorAttributor.prototype), 'value', this).call(this, domNode);
      if (!value.startsWith('rgb(')) return value;
      value = value.replace(/^[^\d]+/, '').replace(/[^\d]+$/, '');
      return '#' + value.split(',').map(function (component) {
        return ('00' + parseInt(component).toString(16)).slice(-2);
      }).join('');
    }
  }]);

  return ColorAttributor;
}(_parchment2.default.Attributor.Style);

var ColorClass = new _parchment2.default.Attributor.Class('color', 'ql-color', {
  scope: _parchment2.default.Scope.INLINE
});
var ColorStyle = new ColorAttributor('color', 'color', {
  scope: _parchment2.default.Scope.INLINE
});

exports.ColorAttributor = ColorAttributor;
exports.ColorClass = ColorClass;
exports.ColorStyle = ColorStyle;

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sanitize = exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inline = __webpack_require__(6);

var _inline2 = _interopRequireDefault(_inline);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Link = function (_Inline) {
  _inherits(Link, _Inline);

  function Link() {
    _classCallCheck(this, Link);

    return _possibleConstructorReturn(this, (Link.__proto__ || Object.getPrototypeOf(Link)).apply(this, arguments));
  }

  _createClass(Link, [{
    key: 'format',
    value: function format(name, value) {
      if (name !== this.statics.blotName || !value) return _get(Link.prototype.__proto__ || Object.getPrototypeOf(Link.prototype), 'format', this).call(this, name, value);
      value = this.constructor.sanitize(value);
      this.domNode.setAttribute('href', value);
    }
  }], [{
    key: 'create',
    value: function create(value) {
      var node = _get(Link.__proto__ || Object.getPrototypeOf(Link), 'create', this).call(this, value);
      value = this.sanitize(value);
      node.setAttribute('href', value);
      node.setAttribute('rel', 'noopener noreferrer');
      node.setAttribute('target', '_blank');
      return node;
    }
  }, {
    key: 'formats',
    value: function formats(domNode) {
      return domNode.getAttribute('href');
    }
  }, {
    key: 'sanitize',
    value: function sanitize(url) {
      return _sanitize(url, this.PROTOCOL_WHITELIST) ? url : this.SANITIZED_URL;
    }
  }]);

  return Link;
}(_inline2.default);

Link.blotName = 'link';
Link.tagName = 'A';
Link.SANITIZED_URL = 'about:blank';
Link.PROTOCOL_WHITELIST = ['http', 'https', 'mailto', 'tel'];

function _sanitize(url, protocols) {
  var anchor = document.createElement('a');
  anchor.href = url;
  var protocol = anchor.href.slice(0, anchor.href.indexOf(':'));
  return protocols.indexOf(protocol) > -1;
}

exports.default = Link;
exports.sanitize = _sanitize;

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _keyboard = __webpack_require__(23);

var _keyboard2 = _interopRequireDefault(_keyboard);

var _dropdown = __webpack_require__(107);

var _dropdown2 = _interopRequireDefault(_dropdown);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var optionsCounter = 0;

function toggleAriaAttribute(element, attribute) {
  element.setAttribute(attribute, !(element.getAttribute(attribute) === 'true'));
}

var Picker = function () {
  function Picker(select) {
    var _this = this;

    _classCallCheck(this, Picker);

    this.select = select;
    this.container = document.createElement('span');
    this.buildPicker();
    this.select.style.display = 'none';
    this.select.parentNode.insertBefore(this.container, this.select);

    this.label.addEventListener('mousedown', function () {
      _this.togglePicker();
    });
    this.label.addEventListener('keydown', function (event) {
      switch (event.keyCode) {
        // Allows the "Enter" key to open the picker
        case _keyboard2.default.keys.ENTER:
          _this.togglePicker();
          break;

        // Allows the "Escape" key to close the picker
        case _keyboard2.default.keys.ESCAPE:
          _this.escape();
          event.preventDefault();
          break;
        default:
      }
    });
    this.select.addEventListener('change', this.update.bind(this));
  }

  _createClass(Picker, [{
    key: 'togglePicker',
    value: function togglePicker() {
      this.container.classList.toggle('ql-expanded');
      // Toggle aria-expanded and aria-hidden to make the picker accessible
      toggleAriaAttribute(this.label, 'aria-expanded');
      toggleAriaAttribute(this.options, 'aria-hidden');
    }
  }, {
    key: 'buildItem',
    value: function buildItem(option) {
      var _this2 = this;

      var item = document.createElement('span');
      item.tabIndex = '0';
      item.setAttribute('role', 'button');

      item.classList.add('ql-picker-item');
      if (option.hasAttribute('value')) {
        item.setAttribute('data-value', option.getAttribute('value'));
      }
      if (option.textContent) {
        item.setAttribute('data-label', option.textContent);
      }
      item.addEventListener('click', function () {
        _this2.selectItem(item, true);
      });
      item.addEventListener('keydown', function (event) {
        switch (event.keyCode) {
          // Allows the "Enter" key to select an item
          case _keyboard2.default.keys.ENTER:
            _this2.selectItem(item, true);
            event.preventDefault();
            break;

          // Allows the "Escape" key to close the picker
          case _keyboard2.default.keys.ESCAPE:
            _this2.escape();
            event.preventDefault();
            break;
          default:
        }
      });

      return item;
    }
  }, {
    key: 'buildLabel',
    value: function buildLabel() {
      var label = document.createElement('span');
      label.classList.add('ql-picker-label');
      label.innerHTML = _dropdown2.default;
      label.tabIndex = '0';
      label.setAttribute('role', 'button');
      label.setAttribute('aria-expanded', 'false');
      this.container.appendChild(label);
      return label;
    }
  }, {
    key: 'buildOptions',
    value: function buildOptions() {
      var _this3 = this;

      var options = document.createElement('span');
      options.classList.add('ql-picker-options');

      // Don't want screen readers to read this until options are visible
      options.setAttribute('aria-hidden', 'true');
      options.tabIndex = '-1';

      // Need a unique id for aria-controls
      options.id = 'ql-picker-options-' + optionsCounter;
      optionsCounter += 1;
      this.label.setAttribute('aria-controls', options.id);

      this.options = options;

      [].slice.call(this.select.options).forEach(function (option) {
        var item = _this3.buildItem(option);
        options.appendChild(item);
        if (option.selected === true) {
          _this3.selectItem(item);
        }
      });
      this.container.appendChild(options);
    }
  }, {
    key: 'buildPicker',
    value: function buildPicker() {
      var _this4 = this;

      [].slice.call(this.select.attributes).forEach(function (item) {
        _this4.container.setAttribute(item.name, item.value);
      });
      this.container.classList.add('ql-picker');
      this.label = this.buildLabel();
      this.buildOptions();
    }
  }, {
    key: 'escape',
    value: function escape() {
      var _this5 = this;

      // Close menu and return focus to trigger label
      this.close();
      // Need setTimeout for accessibility to ensure that the browser executes
      // focus on the next process thread and after any DOM content changes
      setTimeout(function () {
        return _this5.label.focus();
      }, 1);
    }
  }, {
    key: 'close',
    value: function close() {
      this.container.classList.remove('ql-expanded');
      this.label.setAttribute('aria-expanded', 'false');
      this.options.setAttribute('aria-hidden', 'true');
    }
  }, {
    key: 'selectItem',
    value: function selectItem(item) {
      var trigger = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      var selected = this.container.querySelector('.ql-selected');
      if (item === selected) return;
      if (selected != null) {
        selected.classList.remove('ql-selected');
      }
      if (item == null) return;
      item.classList.add('ql-selected');
      this.select.selectedIndex = [].indexOf.call(item.parentNode.children, item);
      if (item.hasAttribute('data-value')) {
        this.label.setAttribute('data-value', item.getAttribute('data-value'));
      } else {
        this.label.removeAttribute('data-value');
      }
      if (item.hasAttribute('data-label')) {
        this.label.setAttribute('data-label', item.getAttribute('data-label'));
      } else {
        this.label.removeAttribute('data-label');
      }
      if (trigger) {
        if (typeof Event === 'function') {
          this.select.dispatchEvent(new Event('change'));
        } else if ((typeof Event === 'undefined' ? 'undefined' : _typeof(Event)) === 'object') {
          // IE11
          var event = document.createEvent('Event');
          event.initEvent('change', true, true);
          this.select.dispatchEvent(event);
        }
        this.close();
      }
    }
  }, {
    key: 'update',
    value: function update() {
      var option = void 0;
      if (this.select.selectedIndex > -1) {
        var item = this.container.querySelector('.ql-picker-options').children[this.select.selectedIndex];
        option = this.select.options[this.select.selectedIndex];
        this.selectItem(item);
      } else {
        this.selectItem(null);
      }
      var isActive = option != null && option !== this.select.querySelector('option[selected]');
      this.label.classList.toggle('ql-active', isActive);
    }
  }]);

  return Picker;
}();

exports.default = Picker;

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _parchment = __webpack_require__(0);

var _parchment2 = _interopRequireDefault(_parchment);

var _quill = __webpack_require__(5);

var _quill2 = _interopRequireDefault(_quill);

var _block = __webpack_require__(4);

var _block2 = _interopRequireDefault(_block);

var _break = __webpack_require__(16);

var _break2 = _interopRequireDefault(_break);

var _container = __webpack_require__(25);

var _container2 = _interopRequireDefault(_container);

var _cursor = __webpack_require__(24);

var _cursor2 = _interopRequireDefault(_cursor);

var _embed = __webpack_require__(35);

var _embed2 = _interopRequireDefault(_embed);

var _inline = __webpack_require__(6);

var _inline2 = _interopRequireDefault(_inline);

var _scroll = __webpack_require__(22);

var _scroll2 = _interopRequireDefault(_scroll);

var _text = __webpack_require__(7);

var _text2 = _interopRequireDefault(_text);

var _clipboard = __webpack_require__(55);

var _clipboard2 = _interopRequireDefault(_clipboard);

var _history = __webpack_require__(42);

var _history2 = _interopRequireDefault(_history);

var _keyboard = __webpack_require__(23);

var _keyboard2 = _interopRequireDefault(_keyboard);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_quill2.default.register({
  'blots/block': _block2.default,
  'blots/block/embed': _block.BlockEmbed,
  'blots/break': _break2.default,
  'blots/container': _container2.default,
  'blots/cursor': _cursor2.default,
  'blots/embed': _embed2.default,
  'blots/inline': _inline2.default,
  'blots/scroll': _scroll2.default,
  'blots/text': _text2.default,

  'modules/clipboard': _clipboard2.default,
  'modules/history': _history2.default,
  'modules/keyboard': _keyboard2.default
});

_parchment2.default.register(_block2.default, _break2.default, _cursor2.default, _inline2.default, _scroll2.default, _text2.default);

exports.default = _quill2.default;

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Registry = __webpack_require__(1);
var ShadowBlot = /** @class */ (function () {
    function ShadowBlot(domNode) {
        this.domNode = domNode;
        // @ts-ignore
        this.domNode[Registry.DATA_KEY] = { blot: this };
    }
    Object.defineProperty(ShadowBlot.prototype, "statics", {
        // Hack for accessing inherited static methods
        get: function () {
            return this.constructor;
        },
        enumerable: true,
        configurable: true
    });
    ShadowBlot.create = function (value) {
        if (this.tagName == null) {
            throw new Registry.ParchmentError('Blot definition missing tagName');
        }
        var node;
        if (Array.isArray(this.tagName)) {
            if (typeof value === 'string') {
                value = value.toUpperCase();
                if (parseInt(value).toString() === value) {
                    value = parseInt(value);
                }
            }
            if (typeof value === 'number') {
                node = document.createElement(this.tagName[value - 1]);
            }
            else if (this.tagName.indexOf(value) > -1) {
                node = document.createElement(value);
            }
            else {
                node = document.createElement(this.tagName[0]);
            }
        }
        else {
            node = document.createElement(this.tagName);
        }
        if (this.className) {
            node.classList.add(this.className);
        }
        return node;
    };
    ShadowBlot.prototype.attach = function () {
        if (this.parent != null) {
            this.scroll = this.parent.scroll;
        }
    };
    ShadowBlot.prototype.clone = function () {
        var domNode = this.domNode.cloneNode(false);
        return Registry.create(domNode);
    };
    ShadowBlot.prototype.detach = function () {
        if (this.parent != null)
            this.parent.removeChild(this);
        // @ts-ignore
        delete this.domNode[Registry.DATA_KEY];
    };
    ShadowBlot.prototype.deleteAt = function (index, length) {
        var blot = this.isolate(index, length);
        blot.remove();
    };
    ShadowBlot.prototype.formatAt = function (index, length, name, value) {
        var blot = this.isolate(index, length);
        if (Registry.query(name, Registry.Scope.BLOT) != null && value) {
            blot.wrap(name, value);
        }
        else if (Registry.query(name, Registry.Scope.ATTRIBUTE) != null) {
            var parent = Registry.create(this.statics.scope);
            blot.wrap(parent);
            parent.format(name, value);
        }
    };
    ShadowBlot.prototype.insertAt = function (index, value, def) {
        var blot = def == null ? Registry.create('text', value) : Registry.create(value, def);
        var ref = this.split(index);
        this.parent.insertBefore(blot, ref);
    };
    ShadowBlot.prototype.insertInto = function (parentBlot, refBlot) {
        if (refBlot === void 0) { refBlot = null; }
        if (this.parent != null) {
            this.parent.children.remove(this);
        }
        var refDomNode = null;
        parentBlot.children.insertBefore(this, refBlot);
        if (refBlot != null) {
            refDomNode = refBlot.domNode;
        }
        if (this.domNode.parentNode != parentBlot.domNode ||
            this.domNode.nextSibling != refDomNode) {
            parentBlot.domNode.insertBefore(this.domNode, refDomNode);
        }
        this.parent = parentBlot;
        this.attach();
    };
    ShadowBlot.prototype.isolate = function (index, length) {
        var target = this.split(index);
        target.split(length);
        return target;
    };
    ShadowBlot.prototype.length = function () {
        return 1;
    };
    ShadowBlot.prototype.offset = function (root) {
        if (root === void 0) { root = this.parent; }
        if (this.parent == null || this == root)
            return 0;
        return this.parent.children.offset(this) + this.parent.offset(root);
    };
    ShadowBlot.prototype.optimize = function (context) {
        // TODO clean up once we use WeakMap
        // @ts-ignore
        if (this.domNode[Registry.DATA_KEY] != null) {
            // @ts-ignore
            delete this.domNode[Registry.DATA_KEY].mutations;
        }
    };
    ShadowBlot.prototype.remove = function () {
        if (this.domNode.parentNode != null) {
            this.domNode.parentNode.removeChild(this.domNode);
        }
        this.detach();
    };
    ShadowBlot.prototype.replace = function (target) {
        if (target.parent == null)
            return;
        target.parent.insertBefore(this, target.next);
        target.remove();
    };
    ShadowBlot.prototype.replaceWith = function (name, value) {
        var replacement = typeof name === 'string' ? Registry.create(name, value) : name;
        replacement.replace(this);
        return replacement;
    };
    ShadowBlot.prototype.split = function (index, force) {
        return index === 0 ? this : this.next;
    };
    ShadowBlot.prototype.update = function (mutations, context) {
        // Nothing to do by default
    };
    ShadowBlot.prototype.wrap = function (name, value) {
        var wrapper = typeof name === 'string' ? Registry.create(name, value) : name;
        if (this.parent != null) {
            this.parent.insertBefore(wrapper, this.next);
        }
        wrapper.appendChild(this);
        return wrapper;
    };
    ShadowBlot.blotName = 'abstract';
    return ShadowBlot;
}());
exports.default = ShadowBlot;


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var attributor_1 = __webpack_require__(12);
var class_1 = __webpack_require__(32);
var style_1 = __webpack_require__(33);
var Registry = __webpack_require__(1);
var AttributorStore = /** @class */ (function () {
    function AttributorStore(domNode) {
        this.attributes = {};
        this.domNode = domNode;
        this.build();
    }
    AttributorStore.prototype.attribute = function (attribute, value) {
        // verb
        if (value) {
            if (attribute.add(this.domNode, value)) {
                if (attribute.value(this.domNode) != null) {
                    this.attributes[attribute.attrName] = attribute;
                }
                else {
                    delete this.attributes[attribute.attrName];
                }
            }
        }
        else {
            attribute.remove(this.domNode);
            delete this.attributes[attribute.attrName];
        }
    };
    AttributorStore.prototype.build = function () {
        var _this = this;
        this.attributes = {};
        var attributes = attributor_1.default.keys(this.domNode);
        var classes = class_1.default.keys(this.domNode);
        var styles = style_1.default.keys(this.domNode);
        attributes
            .concat(classes)
            .concat(styles)
            .forEach(function (name) {
            var attr = Registry.query(name, Registry.Scope.ATTRIBUTE);
            if (attr instanceof attributor_1.default) {
                _this.attributes[attr.attrName] = attr;
            }
        });
    };
    AttributorStore.prototype.copy = function (target) {
        var _this = this;
        Object.keys(this.attributes).forEach(function (key) {
            var value = _this.attributes[key].value(_this.domNode);
            target.format(key, value);
        });
    };
    AttributorStore.prototype.move = function (target) {
        var _this = this;
        this.copy(target);
        Object.keys(this.attributes).forEach(function (key) {
            _this.attributes[key].remove(_this.domNode);
        });
        this.attributes = {};
    };
    AttributorStore.prototype.values = function () {
        var _this = this;
        return Object.keys(this.attributes).reduce(function (attributes, name) {
            attributes[name] = _this.attributes[name].value(_this.domNode);
            return attributes;
        }, {});
    };
    return AttributorStore;
}());
exports.default = AttributorStore;


/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var attributor_1 = __webpack_require__(12);
function match(node, prefix) {
    var className = node.getAttribute('class') || '';
    return className.split(/\s+/).filter(function (name) {
        return name.indexOf(prefix + "-") === 0;
    });
}
var ClassAttributor = /** @class */ (function (_super) {
    __extends(ClassAttributor, _super);
    function ClassAttributor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ClassAttributor.keys = function (node) {
        return (node.getAttribute('class') || '').split(/\s+/).map(function (name) {
            return name
                .split('-')
                .slice(0, -1)
                .join('-');
        });
    };
    ClassAttributor.prototype.add = function (node, value) {
        if (!this.canAdd(node, value))
            return false;
        this.remove(node);
        node.classList.add(this.keyName + "-" + value);
        return true;
    };
    ClassAttributor.prototype.remove = function (node) {
        var matches = match(node, this.keyName);
        matches.forEach(function (name) {
            node.classList.remove(name);
        });
        if (node.classList.length === 0) {
            node.removeAttribute('class');
        }
    };
    ClassAttributor.prototype.value = function (node) {
        var result = match(node, this.keyName)[0] || '';
        var value = result.slice(this.keyName.length + 1); // +1 for hyphen
        return this.canAdd(node, value) ? value : '';
    };
    return ClassAttributor;
}(attributor_1.default));
exports.default = ClassAttributor;


/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var attributor_1 = __webpack_require__(12);
function camelize(name) {
    var parts = name.split('-');
    var rest = parts
        .slice(1)
        .map(function (part) {
        return part[0].toUpperCase() + part.slice(1);
    })
        .join('');
    return parts[0] + rest;
}
var StyleAttributor = /** @class */ (function (_super) {
    __extends(StyleAttributor, _super);
    function StyleAttributor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    StyleAttributor.keys = function (node) {
        return (node.getAttribute('style') || '').split(';').map(function (value) {
            var arr = value.split(':');
            return arr[0].trim();
        });
    };
    StyleAttributor.prototype.add = function (node, value) {
        if (!this.canAdd(node, value))
            return false;
        // @ts-ignore
        node.style[camelize(this.keyName)] = value;
        return true;
    };
    StyleAttributor.prototype.remove = function (node) {
        // @ts-ignore
        node.style[camelize(this.keyName)] = '';
        if (!node.getAttribute('style')) {
            node.removeAttribute('style');
        }
    };
    StyleAttributor.prototype.value = function (node) {
        // @ts-ignore
        var value = node.style[camelize(this.keyName)];
        return this.canAdd(node, value) ? value : '';
    };
    return StyleAttributor;
}(attributor_1.default));
exports.default = StyleAttributor;


/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Theme = function () {
  function Theme(quill, options) {
    _classCallCheck(this, Theme);

    this.quill = quill;
    this.options = options;
    this.modules = {};
  }

  _createClass(Theme, [{
    key: 'init',
    value: function init() {
      var _this = this;

      Object.keys(this.options.modules).forEach(function (name) {
        if (_this.modules[name] == null) {
          _this.addModule(name);
        }
      });
    }
  }, {
    key: 'addModule',
    value: function addModule(name) {
      var moduleClass = this.quill.constructor.import('modules/' + name);
      this.modules[name] = new moduleClass(this.quill, this.options.modules[name] || {});
      return this.modules[name];
    }
  }]);

  return Theme;
}();

Theme.DEFAULTS = {
  modules: {}
};
Theme.themes = {
  'default': Theme
};

exports.default = Theme;

/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _parchment = __webpack_require__(0);

var _parchment2 = _interopRequireDefault(_parchment);

var _text = __webpack_require__(7);

var _text2 = _interopRequireDefault(_text);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var GUARD_TEXT = '\uFEFF';

var Embed = function (_Parchment$Embed) {
  _inherits(Embed, _Parchment$Embed);

  function Embed(node) {
    _classCallCheck(this, Embed);

    var _this = _possibleConstructorReturn(this, (Embed.__proto__ || Object.getPrototypeOf(Embed)).call(this, node));

    _this.contentNode = document.createElement('span');
    _this.contentNode.setAttribute('contenteditable', false);
    [].slice.call(_this.domNode.childNodes).forEach(function (childNode) {
      _this.contentNode.appendChild(childNode);
    });
    _this.leftGuard = document.createTextNode(GUARD_TEXT);
    _this.rightGuard = document.createTextNode(GUARD_TEXT);
    _this.domNode.appendChild(_this.leftGuard);
    _this.domNode.appendChild(_this.contentNode);
    _this.domNode.appendChild(_this.rightGuard);
    return _this;
  }

  _createClass(Embed, [{
    key: 'index',
    value: function index(node, offset) {
      if (node === this.leftGuard) return 0;
      if (node === this.rightGuard) return 1;
      return _get(Embed.prototype.__proto__ || Object.getPrototypeOf(Embed.prototype), 'index', this).call(this, node, offset);
    }
  }, {
    key: 'restore',
    value: function restore(node) {
      var range = void 0,
          textNode = void 0;
      var text = node.data.split(GUARD_TEXT).join('');
      if (node === this.leftGuard) {
        if (this.prev instanceof _text2.default) {
          var prevLength = this.prev.length();
          this.prev.insertAt(prevLength, text);
          range = {
            startNode: this.prev.domNode,
            startOffset: prevLength + text.length
          };
        } else {
          textNode = document.createTextNode(text);
          this.parent.insertBefore(_parchment2.default.create(textNode), this);
          range = {
            startNode: textNode,
            startOffset: text.length
          };
        }
      } else if (node === this.rightGuard) {
        if (this.next instanceof _text2.default) {
          this.next.insertAt(0, text);
          range = {
            startNode: this.next.domNode,
            startOffset: text.length
          };
        } else {
          textNode = document.createTextNode(text);
          this.parent.insertBefore(_parchment2.default.create(textNode), this.next);
          range = {
            startNode: textNode,
            startOffset: text.length
          };
        }
      }
      node.data = GUARD_TEXT;
      return range;
    }
  }, {
    key: 'update',
    value: function update(mutations, context) {
      var _this2 = this;

      mutations.forEach(function (mutation) {
        if (mutation.type === 'characterData' && (mutation.target === _this2.leftGuard || mutation.target === _this2.rightGuard)) {
          var range = _this2.restore(mutation.target);
          if (range) context.range = range;
        }
      });
    }
  }]);

  return Embed;
}(_parchment2.default.Embed);

exports.default = Embed;

/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AlignStyle = exports.AlignClass = exports.AlignAttribute = undefined;

var _parchment = __webpack_require__(0);

var _parchment2 = _interopRequireDefault(_parchment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var config = {
  scope: _parchment2.default.Scope.BLOCK,
  whitelist: ['right', 'center', 'justify']
};

var AlignAttribute = new _parchment2.default.Attributor.Attribute('align', 'align', config);
var AlignClass = new _parchment2.default.Attributor.Class('align', 'ql-align', config);
var AlignStyle = new _parchment2.default.Attributor.Style('align', 'text-align', config);

exports.AlignAttribute = AlignAttribute;
exports.AlignClass = AlignClass;
exports.AlignStyle = AlignStyle;

/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BackgroundStyle = exports.BackgroundClass = undefined;

var _parchment = __webpack_require__(0);

var _parchment2 = _interopRequireDefault(_parchment);

var _color = __webpack_require__(26);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BackgroundClass = new _parchment2.default.Attributor.Class('background', 'ql-bg', {
  scope: _parchment2.default.Scope.INLINE
});
var BackgroundStyle = new _color.ColorAttributor('background', 'background-color', {
  scope: _parchment2.default.Scope.INLINE
});

exports.BackgroundClass = BackgroundClass;
exports.BackgroundStyle = BackgroundStyle;

/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DirectionStyle = exports.DirectionClass = exports.DirectionAttribute = undefined;

var _parchment = __webpack_require__(0);

var _parchment2 = _interopRequireDefault(_parchment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var config = {
  scope: _parchment2.default.Scope.BLOCK,
  whitelist: ['rtl']
};

var DirectionAttribute = new _parchment2.default.Attributor.Attribute('direction', 'dir', config);
var DirectionClass = new _parchment2.default.Attributor.Class('direction', 'ql-direction', config);
var DirectionStyle = new _parchment2.default.Attributor.Style('direction', 'direction', config);

exports.DirectionAttribute = DirectionAttribute;
exports.DirectionClass = DirectionClass;
exports.DirectionStyle = DirectionStyle;

/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FontClass = exports.FontStyle = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _parchment = __webpack_require__(0);

var _parchment2 = _interopRequireDefault(_parchment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var config = {
  scope: _parchment2.default.Scope.INLINE,
  whitelist: ['serif', 'monospace']
};

var FontClass = new _parchment2.default.Attributor.Class('font', 'ql-font', config);

var FontStyleAttributor = function (_Parchment$Attributor) {
  _inherits(FontStyleAttributor, _Parchment$Attributor);

  function FontStyleAttributor() {
    _classCallCheck(this, FontStyleAttributor);

    return _possibleConstructorReturn(this, (FontStyleAttributor.__proto__ || Object.getPrototypeOf(FontStyleAttributor)).apply(this, arguments));
  }

  _createClass(FontStyleAttributor, [{
    key: 'value',
    value: function value(node) {
      return _get(FontStyleAttributor.prototype.__proto__ || Object.getPrototypeOf(FontStyleAttributor.prototype), 'value', this).call(this, node).replace(/["']/g, '');
    }
  }]);

  return FontStyleAttributor;
}(_parchment2.default.Attributor.Style);

var FontStyle = new FontStyleAttributor('font', 'font-family', config);

exports.FontStyle = FontStyle;
exports.FontClass = FontClass;

/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SizeStyle = exports.SizeClass = undefined;

var _parchment = __webpack_require__(0);

var _parchment2 = _interopRequireDefault(_parchment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SizeClass = new _parchment2.default.Attributor.Class('size', 'ql-size', {
  scope: _parchment2.default.Scope.INLINE,
  whitelist: ['small', 'large', 'huge']
});
var SizeStyle = new _parchment2.default.Attributor.Style('size', 'font-size', {
  scope: _parchment2.default.Scope.INLINE,
  whitelist: ['10px', '18px', '32px']
});

exports.SizeClass = SizeClass;
exports.SizeStyle = SizeStyle;

/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = {
  'align': {
    '': __webpack_require__(76),
    'center': __webpack_require__(77),
    'right': __webpack_require__(78),
    'justify': __webpack_require__(79)
  },
  'background': __webpack_require__(80),
  'blockquote': __webpack_require__(81),
  'bold': __webpack_require__(82),
  'clean': __webpack_require__(83),
  'code': __webpack_require__(58),
  'code-block': __webpack_require__(58),
  'color': __webpack_require__(84),
  'direction': {
    '': __webpack_require__(85),
    'rtl': __webpack_require__(86)
  },
  'float': {
    'center': __webpack_require__(87),
    'full': __webpack_require__(88),
    'left': __webpack_require__(89),
    'right': __webpack_require__(90)
  },
  'formula': __webpack_require__(91),
  'header': {
    '1': __webpack_require__(92),
    '2': __webpack_require__(93)
  },
  'italic': __webpack_require__(94),
  'image': __webpack_require__(95),
  'indent': {
    '+1': __webpack_require__(96),
    '-1': __webpack_require__(97)
  },
  'link': __webpack_require__(98),
  'list': {
    'ordered': __webpack_require__(99),
    'bullet': __webpack_require__(100),
    'check': __webpack_require__(101)
  },
  'script': {
    'sub': __webpack_require__(102),
    'super': __webpack_require__(103)
  },
  'strike': __webpack_require__(104),
  'underline': __webpack_require__(105),
  'video': __webpack_require__(106)
};

/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getLastChangeIndex = exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _parchment = __webpack_require__(0);

var _parchment2 = _interopRequireDefault(_parchment);

var _quill = __webpack_require__(5);

var _quill2 = _interopRequireDefault(_quill);

var _module = __webpack_require__(9);

var _module2 = _interopRequireDefault(_module);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var History = function (_Module) {
  _inherits(History, _Module);

  function History(quill, options) {
    _classCallCheck(this, History);

    var _this = _possibleConstructorReturn(this, (History.__proto__ || Object.getPrototypeOf(History)).call(this, quill, options));

    _this.lastRecorded = 0;
    _this.ignoreChange = false;
    _this.clear();
    _this.quill.on(_quill2.default.events.EDITOR_CHANGE, function (eventName, delta, oldDelta, source) {
      if (eventName !== _quill2.default.events.TEXT_CHANGE || _this.ignoreChange) return;
      if (!_this.options.userOnly || source === _quill2.default.sources.USER) {
        _this.record(delta, oldDelta);
      } else {
        _this.transform(delta);
      }
    });
    _this.quill.keyboard.addBinding({ key: 'Z', shortKey: true }, _this.undo.bind(_this));
    _this.quill.keyboard.addBinding({ key: 'Z', shortKey: true, shiftKey: true }, _this.redo.bind(_this));
    if (/Win/i.test(navigator.platform)) {
      _this.quill.keyboard.addBinding({ key: 'Y', shortKey: true }, _this.redo.bind(_this));
    }
    return _this;
  }

  _createClass(History, [{
    key: 'change',
    value: function change(source, dest) {
      if (this.stack[source].length === 0) return;
      var delta = this.stack[source].pop();
      this.stack[dest].push(delta);
      this.lastRecorded = 0;
      this.ignoreChange = true;
      this.quill.updateContents(delta[source], _quill2.default.sources.USER);
      this.ignoreChange = false;
      var index = getLastChangeIndex(delta[source]);
      this.quill.setSelection(index);
    }
  }, {
    key: 'clear',
    value: function clear() {
      this.stack = { undo: [], redo: [] };
    }
  }, {
    key: 'cutoff',
    value: function cutoff() {
      this.lastRecorded = 0;
    }
  }, {
    key: 'record',
    value: function record(changeDelta, oldDelta) {
      if (changeDelta.ops.length === 0) return;
      this.stack.redo = [];
      var undoDelta = this.quill.getContents().diff(oldDelta);
      var timestamp = Date.now();
      if (this.lastRecorded + this.options.delay > timestamp && this.stack.undo.length > 0) {
        var delta = this.stack.undo.pop();
        undoDelta = undoDelta.compose(delta.undo);
        changeDelta = delta.redo.compose(changeDelta);
      } else {
        this.lastRecorded = timestamp;
      }
      this.stack.undo.push({
        redo: changeDelta,
        undo: undoDelta
      });
      if (this.stack.undo.length > this.options.maxStack) {
        this.stack.undo.shift();
      }
    }
  }, {
    key: 'redo',
    value: function redo() {
      this.change('redo', 'undo');
    }
  }, {
    key: 'transform',
    value: function transform(delta) {
      this.stack.undo.forEach(function (change) {
        change.undo = delta.transform(change.undo, true);
        change.redo = delta.transform(change.redo, true);
      });
      this.stack.redo.forEach(function (change) {
        change.undo = delta.transform(change.undo, true);
        change.redo = delta.transform(change.redo, true);
      });
    }
  }, {
    key: 'undo',
    value: function undo() {
      this.change('undo', 'redo');
    }
  }]);

  return History;
}(_module2.default);

History.DEFAULTS = {
  delay: 1000,
  maxStack: 100,
  userOnly: false
};

function endsWithNewlineChange(delta) {
  var lastOp = delta.ops[delta.ops.length - 1];
  if (lastOp == null) return false;
  if (lastOp.insert != null) {
    return typeof lastOp.insert === 'string' && lastOp.insert.endsWith('\n');
  }
  if (lastOp.attributes != null) {
    return Object.keys(lastOp.attributes).some(function (attr) {
      return _parchment2.default.query(attr, _parchment2.default.Scope.BLOCK) != null;
    });
  }
  return false;
}

function getLastChangeIndex(delta) {
  var deleteLength = delta.reduce(function (length, op) {
    length += op.delete || 0;
    return length;
  }, 0);
  var changeIndex = delta.length() - deleteLength;
  if (endsWithNewlineChange(delta)) {
    changeIndex -= 1;
  }
  return changeIndex;
}

exports.default = History;
exports.getLastChangeIndex = getLastChangeIndex;

/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.BaseTooltip = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _extend = __webpack_require__(3);

var _extend2 = _interopRequireDefault(_extend);

var _quillDelta = __webpack_require__(2);

var _quillDelta2 = _interopRequireDefault(_quillDelta);

var _emitter = __webpack_require__(8);

var _emitter2 = _interopRequireDefault(_emitter);

var _keyboard = __webpack_require__(23);

var _keyboard2 = _interopRequireDefault(_keyboard);

var _theme = __webpack_require__(34);

var _theme2 = _interopRequireDefault(_theme);

var _colorPicker = __webpack_require__(59);

var _colorPicker2 = _interopRequireDefault(_colorPicker);

var _iconPicker = __webpack_require__(60);

var _iconPicker2 = _interopRequireDefault(_iconPicker);

var _picker = __webpack_require__(28);

var _picker2 = _interopRequireDefault(_picker);

var _tooltip = __webpack_require__(61);

var _tooltip2 = _interopRequireDefault(_tooltip);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ALIGNS = [false, 'center', 'right', 'justify'];

var COLORS = ["#000000", "#e60000", "#ff9900", "#ffff00", "#008a00", "#0066cc", "#9933ff", "#ffffff", "#facccc", "#ffebcc", "#ffffcc", "#cce8cc", "#cce0f5", "#ebd6ff", "#bbbbbb", "#f06666", "#ffc266", "#ffff66", "#66b966", "#66a3e0", "#c285ff", "#888888", "#a10000", "#b26b00", "#b2b200", "#006100", "#0047b2", "#6b24b2", "#444444", "#5c0000", "#663d00", "#666600", "#003700", "#002966", "#3d1466"];

var FONTS = [false, 'serif', 'monospace'];

var HEADERS = ['1', '2', '3', false];

var SIZES = ['small', false, 'large', 'huge'];

var BaseTheme = function (_Theme) {
  _inherits(BaseTheme, _Theme);

  function BaseTheme(quill, options) {
    _classCallCheck(this, BaseTheme);

    var _this = _possibleConstructorReturn(this, (BaseTheme.__proto__ || Object.getPrototypeOf(BaseTheme)).call(this, quill, options));

    var listener = function listener(e) {
      if (!document.body.contains(quill.root)) {
        return document.body.removeEventListener('click', listener);
      }
      if (_this.tooltip != null && !_this.tooltip.root.contains(e.target) && document.activeElement !== _this.tooltip.textbox && !_this.quill.hasFocus()) {
        _this.tooltip.hide();
      }
      if (_this.pickers != null) {
        _this.pickers.forEach(function (picker) {
          if (!picker.container.contains(e.target)) {
            picker.close();
          }
        });
      }
    };
    quill.emitter.listenDOM('click', document.body, listener);
    return _this;
  }

  _createClass(BaseTheme, [{
    key: 'addModule',
    value: function addModule(name) {
      var module = _get(BaseTheme.prototype.__proto__ || Object.getPrototypeOf(BaseTheme.prototype), 'addModule', this).call(this, name);
      if (name === 'toolbar') {
        this.extendToolbar(module);
      }
      return module;
    }
  }, {
    key: 'buildButtons',
    value: function buildButtons(buttons, icons) {
      buttons.forEach(function (button) {
        var className = button.getAttribute('class') || '';
        className.split(/\s+/).forEach(function (name) {
          if (!name.startsWith('ql-')) return;
          name = name.slice('ql-'.length);
          if (icons[name] == null) return;
          if (name === 'direction') {
            button.innerHTML = icons[name][''] + icons[name]['rtl'];
          } else if (typeof icons[name] === 'string') {
            button.innerHTML = icons[name];
          } else {
            var value = button.value || '';
            if (value != null && icons[name][value]) {
              button.innerHTML = icons[name][value];
            }
          }
        });
      });
    }
  }, {
    key: 'buildPickers',
    value: function buildPickers(selects, icons) {
      var _this2 = this;

      this.pickers = selects.map(function (select) {
        if (select.classList.contains('ql-align')) {
          if (select.querySelector('option') == null) {
            fillSelect(select, ALIGNS);
          }
          return new _iconPicker2.default(select, icons.align);
        } else if (select.classList.contains('ql-background') || select.classList.contains('ql-color')) {
          var format = select.classList.contains('ql-background') ? 'background' : 'color';
          if (select.querySelector('option') == null) {
            fillSelect(select, COLORS, format === 'background' ? '#ffffff' : '#000000');
          }
          return new _colorPicker2.default(select, icons[format]);
        } else {
          if (select.querySelector('option') == null) {
            if (select.classList.contains('ql-font')) {
              fillSelect(select, FONTS);
            } else if (select.classList.contains('ql-header')) {
              fillSelect(select, HEADERS);
            } else if (select.classList.contains('ql-size')) {
              fillSelect(select, SIZES);
            }
          }
          return new _picker2.default(select);
        }
      });
      var update = function update() {
        _this2.pickers.forEach(function (picker) {
          picker.update();
        });
      };
      this.quill.on(_emitter2.default.events.EDITOR_CHANGE, update);
    }
  }]);

  return BaseTheme;
}(_theme2.default);

BaseTheme.DEFAULTS = (0, _extend2.default)(true, {}, _theme2.default.DEFAULTS, {
  modules: {
    toolbar: {
      handlers: {
        formula: function formula() {
          this.quill.theme.tooltip.edit('formula');
        },
        image: function image() {
          var _this3 = this;

          var fileInput = this.container.querySelector('input.ql-image[type=file]');
          if (fileInput == null) {
            fileInput = document.createElement('input');
            fileInput.setAttribute('type', 'file');
            fileInput.setAttribute('accept', 'image/png, image/gif, image/jpeg, image/bmp, image/x-icon');
            fileInput.classList.add('ql-image');
            fileInput.addEventListener('change', function () {
              if (fileInput.files != null && fileInput.files[0] != null) {
                var reader = new FileReader();
                reader.onload = function (e) {
                  var range = _this3.quill.getSelection(true);
                  _this3.quill.updateContents(new _quillDelta2.default().retain(range.index).delete(range.length).insert({ image: e.target.result }), _emitter2.default.sources.USER);
                  _this3.quill.setSelection(range.index + 1, _emitter2.default.sources.SILENT);
                  fileInput.value = "";
                };
                reader.readAsDataURL(fileInput.files[0]);
              }
            });
            this.container.appendChild(fileInput);
          }
          fileInput.click();
        },
        video: function video() {
          this.quill.theme.tooltip.edit('video');
        }
      }
    }
  }
});

var BaseTooltip = function (_Tooltip) {
  _inherits(BaseTooltip, _Tooltip);

  function BaseTooltip(quill, boundsContainer) {
    _classCallCheck(this, BaseTooltip);

    var _this4 = _possibleConstructorReturn(this, (BaseTooltip.__proto__ || Object.getPrototypeOf(BaseTooltip)).call(this, quill, boundsContainer));

    _this4.textbox = _this4.root.querySelector('input[type="text"]');
    _this4.listen();
    return _this4;
  }

  _createClass(BaseTooltip, [{
    key: 'listen',
    value: function listen() {
      var _this5 = this;

      this.textbox.addEventListener('keydown', function (event) {
        if (_keyboard2.default.match(event, 'enter')) {
          _this5.save();
          event.preventDefault();
        } else if (_keyboard2.default.match(event, 'escape')) {
          _this5.cancel();
          event.preventDefault();
        }
      });
    }
  }, {
    key: 'cancel',
    value: function cancel() {
      this.hide();
    }
  }, {
    key: 'edit',
    value: function edit() {
      var mode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'link';
      var preview = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      this.root.classList.remove('ql-hidden');
      this.root.classList.add('ql-editing');
      if (preview != null) {
        this.textbox.value = preview;
      } else if (mode !== this.root.getAttribute('data-mode')) {
        this.textbox.value = '';
      }
      this.position(this.quill.getBounds(this.quill.selection.savedRange));
      this.textbox.select();
      this.textbox.setAttribute('placeholder', this.textbox.getAttribute('data-' + mode) || '');
      this.root.setAttribute('data-mode', mode);
    }
  }, {
    key: 'restoreFocus',
    value: function restoreFocus() {
      var scrollTop = this.quill.scrollingContainer.scrollTop;
      this.quill.focus();
      this.quill.scrollingContainer.scrollTop = scrollTop;
    }
  }, {
    key: 'save',
    value: function save() {
      var value = this.textbox.value;
      switch (this.root.getAttribute('data-mode')) {
        case 'link':
          {
            var scrollTop = this.quill.root.scrollTop;
            if (this.linkRange) {
              this.quill.formatText(this.linkRange, 'link', value, _emitter2.default.sources.USER);
              delete this.linkRange;
            } else {
              this.restoreFocus();
              this.quill.format('link', value, _emitter2.default.sources.USER);
            }
            this.quill.root.scrollTop = scrollTop;
            break;
          }
        case 'video':
          {
            value = extractVideoUrl(value);
          } // eslint-disable-next-line no-fallthrough
        case 'formula':
          {
            if (!value) break;
            var range = this.quill.getSelection(true);
            if (range != null) {
              var index = range.index + range.length;
              this.quill.insertEmbed(index, this.root.getAttribute('data-mode'), value, _emitter2.default.sources.USER);
              if (this.root.getAttribute('data-mode') === 'formula') {
                this.quill.insertText(index + 1, ' ', _emitter2.default.sources.USER);
              }
              this.quill.setSelection(index + 2, _emitter2.default.sources.USER);
            }
            break;
          }
        default:
      }
      this.textbox.value = '';
      this.hide();
    }
  }]);

  return BaseTooltip;
}(_tooltip2.default);

function extractVideoUrl(url) {
  var match = url.match(/^(?:(https?):\/\/)?(?:(?:www|m)\.)?youtube\.com\/watch.*v=([a-zA-Z0-9_-]+)/) || url.match(/^(?:(https?):\/\/)?(?:(?:www|m)\.)?youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (match) {
    return (match[1] || 'https') + '://www.youtube.com/embed/' + match[2] + '?showinfo=0';
  }
  if (match = url.match(/^(?:(https?):\/\/)?(?:www\.)?vimeo\.com\/(\d+)/)) {
    // eslint-disable-line no-cond-assign
    return (match[1] || 'https') + '://player.vimeo.com/video/' + match[2] + '/';
  }
  return url;
}

function fillSelect(select, values) {
  var defaultValue = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  values.forEach(function (value) {
    var option = document.createElement('option');
    if (value === defaultValue) {
      option.setAttribute('selected', 'selected');
    } else {
      option.setAttribute('value', value);
    }
    select.appendChild(option);
  });
}

exports.BaseTooltip = BaseTooltip;
exports.default = BaseTheme;

/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var LinkedList = /** @class */ (function () {
    function LinkedList() {
        this.head = this.tail = null;
        this.length = 0;
    }
    LinkedList.prototype.append = function () {
        var nodes = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            nodes[_i] = arguments[_i];
        }
        this.insertBefore(nodes[0], null);
        if (nodes.length > 1) {
            this.append.apply(this, nodes.slice(1));
        }
    };
    LinkedList.prototype.contains = function (node) {
        var cur, next = this.iterator();
        while ((cur = next())) {
            if (cur === node)
                return true;
        }
        return false;
    };
    LinkedList.prototype.insertBefore = function (node, refNode) {
        if (!node)
            return;
        node.next = refNode;
        if (refNode != null) {
            node.prev = refNode.prev;
            if (refNode.prev != null) {
                refNode.prev.next = node;
            }
            refNode.prev = node;
            if (refNode === this.head) {
                this.head = node;
            }
        }
        else if (this.tail != null) {
            this.tail.next = node;
            node.prev = this.tail;
            this.tail = node;
        }
        else {
            node.prev = null;
            this.head = this.tail = node;
        }
        this.length += 1;
    };
    LinkedList.prototype.offset = function (target) {
        var index = 0, cur = this.head;
        while (cur != null) {
            if (cur === target)
                return index;
            index += cur.length();
            cur = cur.next;
        }
        return -1;
    };
    LinkedList.prototype.remove = function (node) {
        if (!this.contains(node))
            return;
        if (node.prev != null)
            node.prev.next = node.next;
        if (node.next != null)
            node.next.prev = node.prev;
        if (node === this.head)
            this.head = node.next;
        if (node === this.tail)
            this.tail = node.prev;
        this.length -= 1;
    };
    LinkedList.prototype.iterator = function (curNode) {
        if (curNode === void 0) { curNode = this.head; }
        // TODO use yield when we can
        return function () {
            var ret = curNode;
            if (curNode != null)
                curNode = curNode.next;
            return ret;
        };
    };
    LinkedList.prototype.find = function (index, inclusive) {
        if (inclusive === void 0) { inclusive = false; }
        var cur, next = this.iterator();
        while ((cur = next())) {
            var length = cur.length();
            if (index < length ||
                (inclusive && index === length && (cur.next == null || cur.next.length() !== 0))) {
                return [cur, index];
            }
            index -= length;
        }
        return [null, 0];
    };
    LinkedList.prototype.forEach = function (callback) {
        var cur, next = this.iterator();
        while ((cur = next())) {
            callback(cur);
        }
    };
    LinkedList.prototype.forEachAt = function (index, length, callback) {
        if (length <= 0)
            return;
        var _a = this.find(index), startNode = _a[0], offset = _a[1];
        var cur, curIndex = index - offset, next = this.iterator(startNode);
        while ((cur = next()) && curIndex < index + length) {
            var curLength = cur.length();
            if (index > curIndex) {
                callback(cur, index - curIndex, Math.min(length, curIndex + curLength - index));
            }
            else {
                callback(cur, 0, Math.min(curLength, index + length - curIndex));
            }
            curIndex += curLength;
        }
    };
    LinkedList.prototype.map = function (callback) {
        return this.reduce(function (memo, cur) {
            memo.push(callback(cur));
            return memo;
        }, []);
    };
    LinkedList.prototype.reduce = function (callback, memo) {
        var cur, next = this.iterator();
        while ((cur = next())) {
            memo = callback(memo, cur);
        }
        return memo;
    };
    return LinkedList;
}());
exports.default = LinkedList;


/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var container_1 = __webpack_require__(17);
var Registry = __webpack_require__(1);
var OBSERVER_CONFIG = {
    attributes: true,
    characterData: true,
    characterDataOldValue: true,
    childList: true,
    subtree: true,
};
var MAX_OPTIMIZE_ITERATIONS = 100;
var ScrollBlot = /** @class */ (function (_super) {
    __extends(ScrollBlot, _super);
    function ScrollBlot(node) {
        var _this = _super.call(this, node) || this;
        _this.scroll = _this;
        _this.observer = new MutationObserver(function (mutations) {
            _this.update(mutations);
        });
        _this.observer.observe(_this.domNode, OBSERVER_CONFIG);
        _this.attach();
        return _this;
    }
    ScrollBlot.prototype.detach = function () {
        _super.prototype.detach.call(this);
        this.observer.disconnect();
    };
    ScrollBlot.prototype.deleteAt = function (index, length) {
        this.update();
        if (index === 0 && length === this.length()) {
            this.children.forEach(function (child) {
                child.remove();
            });
        }
        else {
            _super.prototype.deleteAt.call(this, index, length);
        }
    };
    ScrollBlot.prototype.formatAt = function (index, length, name, value) {
        this.update();
        _super.prototype.formatAt.call(this, index, length, name, value);
    };
    ScrollBlot.prototype.insertAt = function (index, value, def) {
        this.update();
        _super.prototype.insertAt.call(this, index, value, def);
    };
    ScrollBlot.prototype.optimize = function (mutations, context) {
        var _this = this;
        if (mutations === void 0) { mutations = []; }
        if (context === void 0) { context = {}; }
        _super.prototype.optimize.call(this, context);
        // We must modify mutations directly, cannot make copy and then modify
        var records = [].slice.call(this.observer.takeRecords());
        // Array.push currently seems to be implemented by a non-tail recursive function
        // so we cannot just mutations.push.apply(mutations, this.observer.takeRecords());
        while (records.length > 0)
            mutations.push(records.pop());
        // TODO use WeakMap
        var mark = function (blot, markParent) {
            if (markParent === void 0) { markParent = true; }
            if (blot == null || blot === _this)
                return;
            if (blot.domNode.parentNode == null)
                return;
            // @ts-ignore
            if (blot.domNode[Registry.DATA_KEY].mutations == null) {
                // @ts-ignore
                blot.domNode[Registry.DATA_KEY].mutations = [];
            }
            if (markParent)
                mark(blot.parent);
        };
        var optimize = function (blot) {
            // Post-order traversal
            if (
            // @ts-ignore
            blot.domNode[Registry.DATA_KEY] == null ||
                // @ts-ignore
                blot.domNode[Registry.DATA_KEY].mutations == null) {
                return;
            }
            if (blot instanceof container_1.default) {
                blot.children.forEach(optimize);
            }
            blot.optimize(context);
        };
        var remaining = mutations;
        for (var i = 0; remaining.length > 0; i += 1) {
            if (i >= MAX_OPTIMIZE_ITERATIONS) {
                throw new Error('[Parchment] Maximum optimize iterations reached');
            }
            remaining.forEach(function (mutation) {
                var blot = Registry.find(mutation.target, true);
                if (blot == null)
                    return;
                if (blot.domNode === mutation.target) {
                    if (mutation.type === 'childList') {
                        mark(Registry.find(mutation.previousSibling, false));
                        [].forEach.call(mutation.addedNodes, function (node) {
                            var child = Registry.find(node, false);
                            mark(child, false);
                            if (child instanceof container_1.default) {
                                child.children.forEach(function (grandChild) {
                                    mark(grandChild, false);
                                });
                            }
                        });
                    }
                    else if (mutation.type === 'attributes') {
                        mark(blot.prev);
                    }
                }
                mark(blot);
            });
            this.children.forEach(optimize);
            remaining = [].slice.call(this.observer.takeRecords());
            records = remaining.slice();
            while (records.length > 0)
                mutations.push(records.pop());
        }
    };
    ScrollBlot.prototype.update = function (mutations, context) {
        var _this = this;
        if (context === void 0) { context = {}; }
        mutations = mutations || this.observer.takeRecords();
        // TODO use WeakMap
        mutations
            .map(function (mutation) {
            var blot = Registry.find(mutation.target, true);
            if (blot == null)
                return null;
            // @ts-ignore
            if (blot.domNode[Registry.DATA_KEY].mutations == null) {
                // @ts-ignore
                blot.domNode[Registry.DATA_KEY].mutations = [mutation];
                return blot;
            }
            else {
                // @ts-ignore
                blot.domNode[Registry.DATA_KEY].mutations.push(mutation);
                return null;
            }
        })
            .forEach(function (blot) {
            if (blot == null ||
                blot === _this ||
                //@ts-ignore
                blot.domNode[Registry.DATA_KEY] == null)
                return;
            // @ts-ignore
            blot.update(blot.domNode[Registry.DATA_KEY].mutations || [], context);
        });
        // @ts-ignore
        if (this.domNode[Registry.DATA_KEY].mutations != null) {
            // @ts-ignore
            _super.prototype.update.call(this, this.domNode[Registry.DATA_KEY].mutations, context);
        }
        this.optimize(mutations, context);
    };
    ScrollBlot.blotName = 'scroll';
    ScrollBlot.defaultChild = 'block';
    ScrollBlot.scope = Registry.Scope.BLOCK_BLOT;
    ScrollBlot.tagName = 'DIV';
    return ScrollBlot;
}(container_1.default));
exports.default = ScrollBlot;


/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var format_1 = __webpack_require__(18);
var Registry = __webpack_require__(1);
// Shallow object comparison
function isEqual(obj1, obj2) {
    if (Object.keys(obj1).length !== Object.keys(obj2).length)
        return false;
    // @ts-ignore
    for (var prop in obj1) {
        // @ts-ignore
        if (obj1[prop] !== obj2[prop])
            return false;
    }
    return true;
}
var InlineBlot = /** @class */ (function (_super) {
    __extends(InlineBlot, _super);
    function InlineBlot() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    InlineBlot.formats = function (domNode) {
        if (domNode.tagName === InlineBlot.tagName)
            return undefined;
        return _super.formats.call(this, domNode);
    };
    InlineBlot.prototype.format = function (name, value) {
        var _this = this;
        if (name === this.statics.blotName && !value) {
            this.children.forEach(function (child) {
                if (!(child instanceof format_1.default)) {
                    child = child.wrap(InlineBlot.blotName, true);
                }
                _this.attributes.copy(child);
            });
            this.unwrap();
        }
        else {
            _super.prototype.format.call(this, name, value);
        }
    };
    InlineBlot.prototype.formatAt = function (index, length, name, value) {
        if (this.formats()[name] != null || Registry.query(name, Registry.Scope.ATTRIBUTE)) {
            var blot = this.isolate(index, length);
            blot.format(name, value);
        }
        else {
            _super.prototype.formatAt.call(this, index, length, name, value);
        }
    };
    InlineBlot.prototype.optimize = function (context) {
        _super.prototype.optimize.call(this, context);
        var formats = this.formats();
        if (Object.keys(formats).length === 0) {
            return this.unwrap(); // unformatted span
        }
        var next = this.next;
        if (next instanceof InlineBlot && next.prev === this && isEqual(formats, next.formats())) {
            next.moveChildren(this);
            next.remove();
        }
    };
    InlineBlot.blotName = 'inline';
    InlineBlot.scope = Registry.Scope.INLINE_BLOT;
    InlineBlot.tagName = 'SPAN';
    return InlineBlot;
}(format_1.default));
exports.default = InlineBlot;


/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var format_1 = __webpack_require__(18);
var Registry = __webpack_require__(1);
var BlockBlot = /** @class */ (function (_super) {
    __extends(BlockBlot, _super);
    function BlockBlot() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    BlockBlot.formats = function (domNode) {
        var tagName = Registry.query(BlockBlot.blotName).tagName;
        if (domNode.tagName === tagName)
            return undefined;
        return _super.formats.call(this, domNode);
    };
    BlockBlot.prototype.format = function (name, value) {
        if (Registry.query(name, Registry.Scope.BLOCK) == null) {
            return;
        }
        else if (name === this.statics.blotName && !value) {
            this.replaceWith(BlockBlot.blotName);
        }
        else {
            _super.prototype.format.call(this, name, value);
        }
    };
    BlockBlot.prototype.formatAt = function (index, length, name, value) {
        if (Registry.query(name, Registry.Scope.BLOCK) != null) {
            this.format(name, value);
        }
        else {
            _super.prototype.formatAt.call(this, index, length, name, value);
        }
    };
    BlockBlot.prototype.insertAt = function (index, value, def) {
        if (def == null || Registry.query(value, Registry.Scope.INLINE) != null) {
            // Insert text or inline
            _super.prototype.insertAt.call(this, index, value, def);
        }
        else {
            var after = this.split(index);
            var blot = Registry.create(value, def);
            after.parent.insertBefore(blot, after);
        }
    };
    BlockBlot.prototype.update = function (mutations, context) {
        if (navigator.userAgent.match(/Trident/)) {
            this.build();
        }
        else {
            _super.prototype.update.call(this, mutations, context);
        }
    };
    BlockBlot.blotName = 'block';
    BlockBlot.scope = Registry.Scope.BLOCK_BLOT;
    BlockBlot.tagName = 'P';
    return BlockBlot;
}(format_1.default));
exports.default = BlockBlot;


/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var leaf_1 = __webpack_require__(19);
var EmbedBlot = /** @class */ (function (_super) {
    __extends(EmbedBlot, _super);
    function EmbedBlot() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    EmbedBlot.formats = function (domNode) {
        return undefined;
    };
    EmbedBlot.prototype.format = function (name, value) {
        // super.formatAt wraps, which is what we want in general,
        // but this allows subclasses to overwrite for formats
        // that just apply to particular embeds
        _super.prototype.formatAt.call(this, 0, this.length(), name, value);
    };
    EmbedBlot.prototype.formatAt = function (index, length, name, value) {
        if (index === 0 && length === this.length()) {
            this.format(name, value);
        }
        else {
            _super.prototype.formatAt.call(this, index, length, name, value);
        }
    };
    EmbedBlot.prototype.formats = function () {
        return this.statics.formats(this.domNode);
    };
    return EmbedBlot;
}(leaf_1.default));
exports.default = EmbedBlot;


/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var leaf_1 = __webpack_require__(19);
var Registry = __webpack_require__(1);
var TextBlot = /** @class */ (function (_super) {
    __extends(TextBlot, _super);
    function TextBlot(node) {
        var _this = _super.call(this, node) || this;
        _this.text = _this.statics.value(_this.domNode);
        return _this;
    }
    TextBlot.create = function (value) {
        return document.createTextNode(value);
    };
    TextBlot.value = function (domNode) {
        var text = domNode.data;
        // @ts-ignore
        if (text['normalize'])
            text = text['normalize']();
        return text;
    };
    TextBlot.prototype.deleteAt = function (index, length) {
        this.domNode.data = this.text = this.text.slice(0, index) + this.text.slice(index + length);
    };
    TextBlot.prototype.index = function (node, offset) {
        if (this.domNode === node) {
            return offset;
        }
        return -1;
    };
    TextBlot.prototype.insertAt = function (index, value, def) {
        if (def == null) {
            this.text = this.text.slice(0, index) + value + this.text.slice(index);
            this.domNode.data = this.text;
        }
        else {
            _super.prototype.insertAt.call(this, index, value, def);
        }
    };
    TextBlot.prototype.length = function () {
        return this.text.length;
    };
    TextBlot.prototype.optimize = function (context) {
        _super.prototype.optimize.call(this, context);
        this.text = this.statics.value(this.domNode);
        if (this.text.length === 0) {
            this.remove();
        }
        else if (this.next instanceof TextBlot && this.next.prev === this) {
            this.insertAt(this.length(), this.next.value());
            this.next.remove();
        }
    };
    TextBlot.prototype.position = function (index, inclusive) {
        if (inclusive === void 0) { inclusive = false; }
        return [this.domNode, index];
    };
    TextBlot.prototype.split = function (index, force) {
        if (force === void 0) { force = false; }
        if (!force) {
            if (index === 0)
                return this;
            if (index === this.length())
                return this.next;
        }
        var after = Registry.create(this.domNode.splitText(index));
        this.parent.insertBefore(after, this.next);
        this.text = this.statics.value(this.domNode);
        return after;
    };
    TextBlot.prototype.update = function (mutations, context) {
        var _this = this;
        if (mutations.some(function (mutation) {
            return mutation.type === 'characterData' && mutation.target === _this.domNode;
        })) {
            this.text = this.statics.value(this.domNode);
        }
    };
    TextBlot.prototype.value = function () {
        return this.text;
    };
    TextBlot.blotName = 'text';
    TextBlot.scope = Registry.Scope.INLINE_BLOT;
    return TextBlot;
}(leaf_1.default));
exports.default = TextBlot;


/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var elem = document.createElement('div');
elem.classList.toggle('test-class', false);
if (elem.classList.contains('test-class')) {
  var _toggle = DOMTokenList.prototype.toggle;
  DOMTokenList.prototype.toggle = function (token, force) {
    if (arguments.length > 1 && !this.contains(token) === !force) {
      return force;
    } else {
      return _toggle.call(this, token);
    }
  };
}

if (!String.prototype.startsWith) {
  String.prototype.startsWith = function (searchString, position) {
    position = position || 0;
    return this.substr(position, searchString.length) === searchString;
  };
}

if (!String.prototype.endsWith) {
  String.prototype.endsWith = function (searchString, position) {
    var subjectString = this.toString();
    if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
      position = subjectString.length;
    }
    position -= searchString.length;
    var lastIndex = subjectString.indexOf(searchString, position);
    return lastIndex !== -1 && lastIndex === position;
  };
}

if (!Array.prototype.find) {
  Object.defineProperty(Array.prototype, "find", {
    value: function value(predicate) {
      if (this === null) {
        throw new TypeError('Array.prototype.find called on null or undefined');
      }
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }
      var list = Object(this);
      var length = list.length >>> 0;
      var thisArg = arguments[1];
      var value;

      for (var i = 0; i < length; i++) {
        value = list[i];
        if (predicate.call(thisArg, value, i, list)) {
          return value;
        }
      }
      return undefined;
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  // Disable resizing in Firefox
  document.execCommand("enableObjectResizing", false, false);
  // Disable automatic linkifying in IE11
  document.execCommand("autoUrlDetect", false, false);
});

/***/ }),
/* 51 */
/***/ (function(module, exports) {

/**
 * This library modifies the diff-patch-match library by Neil Fraser
 * by removing the patch and match functionality and certain advanced
 * options in the diff function. The original license is as follows:
 *
 * ===
 *
 * Diff Match and Patch
 *
 * Copyright 2006 Google Inc.
 * http://code.google.com/p/google-diff-match-patch/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


/**
 * The data structure representing a diff is an array of tuples:
 * [[DIFF_DELETE, 'Hello'], [DIFF_INSERT, 'Goodbye'], [DIFF_EQUAL, ' world.']]
 * which means: delete 'Hello', add 'Goodbye' and keep ' world.'
 */
var DIFF_DELETE = -1;
var DIFF_INSERT = 1;
var DIFF_EQUAL = 0;


/**
 * Find the differences between two texts.  Simplifies the problem by stripping
 * any common prefix or suffix off the texts before diffing.
 * @param {string} text1 Old string to be diffed.
 * @param {string} text2 New string to be diffed.
 * @param {Int} cursor_pos Expected edit position in text1 (optional)
 * @return {Array} Array of diff tuples.
 */
function diff_main(text1, text2, cursor_pos) {
  // Check for equality (speedup).
  if (text1 == text2) {
    if (text1) {
      return [[DIFF_EQUAL, text1]];
    }
    return [];
  }

  // Check cursor_pos within bounds
  if (cursor_pos < 0 || text1.length < cursor_pos) {
    cursor_pos = null;
  }

  // Trim off common prefix (speedup).
  var commonlength = diff_commonPrefix(text1, text2);
  var commonprefix = text1.substring(0, commonlength);
  text1 = text1.substring(commonlength);
  text2 = text2.substring(commonlength);

  // Trim off common suffix (speedup).
  commonlength = diff_commonSuffix(text1, text2);
  var commonsuffix = text1.substring(text1.length - commonlength);
  text1 = text1.substring(0, text1.length - commonlength);
  text2 = text2.substring(0, text2.length - commonlength);

  // Compute the diff on the middle block.
  var diffs = diff_compute_(text1, text2);

  // Restore the prefix and suffix.
  if (commonprefix) {
    diffs.unshift([DIFF_EQUAL, commonprefix]);
  }
  if (commonsuffix) {
    diffs.push([DIFF_EQUAL, commonsuffix]);
  }
  diff_cleanupMerge(diffs);
  if (cursor_pos != null) {
    diffs = fix_cursor(diffs, cursor_pos);
  }
  diffs = fix_emoji(diffs);
  return diffs;
};


/**
 * Find the differences between two texts.  Assumes that the texts do not
 * have any common prefix or suffix.
 * @param {string} text1 Old string to be diffed.
 * @param {string} text2 New string to be diffed.
 * @return {Array} Array of diff tuples.
 */
function diff_compute_(text1, text2) {
  var diffs;

  if (!text1) {
    // Just add some text (speedup).
    return [[DIFF_INSERT, text2]];
  }

  if (!text2) {
    // Just delete some text (speedup).
    return [[DIFF_DELETE, text1]];
  }

  var longtext = text1.length > text2.length ? text1 : text2;
  var shorttext = text1.length > text2.length ? text2 : text1;
  var i = longtext.indexOf(shorttext);
  if (i != -1) {
    // Shorter text is inside the longer text (speedup).
    diffs = [[DIFF_INSERT, longtext.substring(0, i)],
             [DIFF_EQUAL, shorttext],
             [DIFF_INSERT, longtext.substring(i + shorttext.length)]];
    // Swap insertions for deletions if diff is reversed.
    if (text1.length > text2.length) {
      diffs[0][0] = diffs[2][0] = DIFF_DELETE;
    }
    return diffs;
  }

  if (shorttext.length == 1) {
    // Single character string.
    // After the previous speedup, the character can't be an equality.
    return [[DIFF_DELETE, text1], [DIFF_INSERT, text2]];
  }

  // Check to see if the problem can be split in two.
  var hm = diff_halfMatch_(text1, text2);
  if (hm) {
    // A half-match was found, sort out the return data.
    var text1_a = hm[0];
    var text1_b = hm[1];
    var text2_a = hm[2];
    var text2_b = hm[3];
    var mid_common = hm[4];
    // Send both pairs off for separate processing.
    var diffs_a = diff_main(text1_a, text2_a);
    var diffs_b = diff_main(text1_b, text2_b);
    // Merge the results.
    return diffs_a.concat([[DIFF_EQUAL, mid_common]], diffs_b);
  }

  return diff_bisect_(text1, text2);
};


/**
 * Find the 'middle snake' of a diff, split the problem in two
 * and return the recursively constructed diff.
 * See Myers 1986 paper: An O(ND) Difference Algorithm and Its Variations.
 * @param {string} text1 Old string to be diffed.
 * @param {string} text2 New string to be diffed.
 * @return {Array} Array of diff tuples.
 * @private
 */
function diff_bisect_(text1, text2) {
  // Cache the text lengths to prevent multiple calls.
  var text1_length = text1.length;
  var text2_length = text2.length;
  var max_d = Math.ceil((text1_length + text2_length) / 2);
  var v_offset = max_d;
  var v_length = 2 * max_d;
  var v1 = new Array(v_length);
  var v2 = new Array(v_length);
  // Setting all elements to -1 is faster in Chrome & Firefox than mixing
  // integers and undefined.
  for (var x = 0; x < v_length; x++) {
    v1[x] = -1;
    v2[x] = -1;
  }
  v1[v_offset + 1] = 0;
  v2[v_offset + 1] = 0;
  var delta = text1_length - text2_length;
  // If the total number of characters is odd, then the front path will collide
  // with the reverse path.
  var front = (delta % 2 != 0);
  // Offsets for start and end of k loop.
  // Prevents mapping of space beyond the grid.
  var k1start = 0;
  var k1end = 0;
  var k2start = 0;
  var k2end = 0;
  for (var d = 0; d < max_d; d++) {
    // Walk the front path one step.
    for (var k1 = -d + k1start; k1 <= d - k1end; k1 += 2) {
      var k1_offset = v_offset + k1;
      var x1;
      if (k1 == -d || (k1 != d && v1[k1_offset - 1] < v1[k1_offset + 1])) {
        x1 = v1[k1_offset + 1];
      } else {
        x1 = v1[k1_offset - 1] + 1;
      }
      var y1 = x1 - k1;
      while (x1 < text1_length && y1 < text2_length &&
             text1.charAt(x1) == text2.charAt(y1)) {
        x1++;
        y1++;
      }
      v1[k1_offset] = x1;
      if (x1 > text1_length) {
        // Ran off the right of the graph.
        k1end += 2;
      } else if (y1 > text2_length) {
        // Ran off the bottom of the graph.
        k1start += 2;
      } else if (front) {
        var k2_offset = v_offset + delta - k1;
        if (k2_offset >= 0 && k2_offset < v_length && v2[k2_offset] != -1) {
          // Mirror x2 onto top-left coordinate system.
          var x2 = text1_length - v2[k2_offset];
          if (x1 >= x2) {
            // Overlap detected.
            return diff_bisectSplit_(text1, text2, x1, y1);
          }
        }
      }
    }

    // Walk the reverse path one step.
    for (var k2 = -d + k2start; k2 <= d - k2end; k2 += 2) {
      var k2_offset = v_offset + k2;
      var x2;
      if (k2 == -d || (k2 != d && v2[k2_offset - 1] < v2[k2_offset + 1])) {
        x2 = v2[k2_offset + 1];
      } else {
        x2 = v2[k2_offset - 1] + 1;
      }
      var y2 = x2 - k2;
      while (x2 < text1_length && y2 < text2_length &&
             text1.charAt(text1_length - x2 - 1) ==
             text2.charAt(text2_length - y2 - 1)) {
        x2++;
        y2++;
      }
      v2[k2_offset] = x2;
      if (x2 > text1_length) {
        // Ran off the left of the graph.
        k2end += 2;
      } else if (y2 > text2_length) {
        // Ran off the top of the graph.
        k2start += 2;
      } else if (!front) {
        var k1_offset = v_offset + delta - k2;
        if (k1_offset >= 0 && k1_offset < v_length && v1[k1_offset] != -1) {
          var x1 = v1[k1_offset];
          var y1 = v_offset + x1 - k1_offset;
          // Mirror x2 onto top-left coordinate system.
          x2 = text1_length - x2;
          if (x1 >= x2) {
            // Overlap detected.
            return diff_bisectSplit_(text1, text2, x1, y1);
          }
        }
      }
    }
  }
  // Diff took too long and hit the deadline or
  // number of diffs equals number of characters, no commonality at all.
  return [[DIFF_DELETE, text1], [DIFF_INSERT, text2]];
};


/**
 * Given the location of the 'middle snake', split the diff in two parts
 * and recurse.
 * @param {string} text1 Old string to be diffed.
 * @param {string} text2 New string to be diffed.
 * @param {number} x Index of split point in text1.
 * @param {number} y Index of split point in text2.
 * @return {Array} Array of diff tuples.
 */
function diff_bisectSplit_(text1, text2, x, y) {
  var text1a = text1.substring(0, x);
  var text2a = text2.substring(0, y);
  var text1b = text1.substring(x);
  var text2b = text2.substring(y);

  // Compute both diffs serially.
  var diffs = diff_main(text1a, text2a);
  var diffsb = diff_main(text1b, text2b);

  return diffs.concat(diffsb);
};


/**
 * Determine the common prefix of two strings.
 * @param {string} text1 First string.
 * @param {string} text2 Second string.
 * @return {number} The number of characters common to the start of each
 *     string.
 */
function diff_commonPrefix(text1, text2) {
  // Quick check for common null cases.
  if (!text1 || !text2 || text1.charAt(0) != text2.charAt(0)) {
    return 0;
  }
  // Binary search.
  // Performance analysis: http://neil.fraser.name/news/2007/10/09/
  var pointermin = 0;
  var pointermax = Math.min(text1.length, text2.length);
  var pointermid = pointermax;
  var pointerstart = 0;
  while (pointermin < pointermid) {
    if (text1.substring(pointerstart, pointermid) ==
        text2.substring(pointerstart, pointermid)) {
      pointermin = pointermid;
      pointerstart = pointermin;
    } else {
      pointermax = pointermid;
    }
    pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
  }
  return pointermid;
};


/**
 * Determine the common suffix of two strings.
 * @param {string} text1 First string.
 * @param {string} text2 Second string.
 * @return {number} The number of characters common to the end of each string.
 */
function diff_commonSuffix(text1, text2) {
  // Quick check for common null cases.
  if (!text1 || !text2 ||
      text1.charAt(text1.length - 1) != text2.charAt(text2.length - 1)) {
    return 0;
  }
  // Binary search.
  // Performance analysis: http://neil.fraser.name/news/2007/10/09/
  var pointermin = 0;
  var pointermax = Math.min(text1.length, text2.length);
  var pointermid = pointermax;
  var pointerend = 0;
  while (pointermin < pointermid) {
    if (text1.substring(text1.length - pointermid, text1.length - pointerend) ==
        text2.substring(text2.length - pointermid, text2.length - pointerend)) {
      pointermin = pointermid;
      pointerend = pointermin;
    } else {
      pointermax = pointermid;
    }
    pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
  }
  return pointermid;
};


/**
 * Do the two texts share a substring which is at least half the length of the
 * longer text?
 * This speedup can produce non-minimal diffs.
 * @param {string} text1 First string.
 * @param {string} text2 Second string.
 * @return {Array.<string>} Five element Array, containing the prefix of
 *     text1, the suffix of text1, the prefix of text2, the suffix of
 *     text2 and the common middle.  Or null if there was no match.
 */
function diff_halfMatch_(text1, text2) {
  var longtext = text1.length > text2.length ? text1 : text2;
  var shorttext = text1.length > text2.length ? text2 : text1;
  if (longtext.length < 4 || shorttext.length * 2 < longtext.length) {
    return null;  // Pointless.
  }

  /**
   * Does a substring of shorttext exist within longtext such that the substring
   * is at least half the length of longtext?
   * Closure, but does not reference any external variables.
   * @param {string} longtext Longer string.
   * @param {string} shorttext Shorter string.
   * @param {number} i Start index of quarter length substring within longtext.
   * @return {Array.<string>} Five element Array, containing the prefix of
   *     longtext, the suffix of longtext, the prefix of shorttext, the suffix
   *     of shorttext and the common middle.  Or null if there was no match.
   * @private
   */
  function diff_halfMatchI_(longtext, shorttext, i) {
    // Start with a 1/4 length substring at position i as a seed.
    var seed = longtext.substring(i, i + Math.floor(longtext.length / 4));
    var j = -1;
    var best_common = '';
    var best_longtext_a, best_longtext_b, best_shorttext_a, best_shorttext_b;
    while ((j = shorttext.indexOf(seed, j + 1)) != -1) {
      var prefixLength = diff_commonPrefix(longtext.substring(i),
                                           shorttext.substring(j));
      var suffixLength = diff_commonSuffix(longtext.substring(0, i),
                                           shorttext.substring(0, j));
      if (best_common.length < suffixLength + prefixLength) {
        best_common = shorttext.substring(j - suffixLength, j) +
            shorttext.substring(j, j + prefixLength);
        best_longtext_a = longtext.substring(0, i - suffixLength);
        best_longtext_b = longtext.substring(i + prefixLength);
        best_shorttext_a = shorttext.substring(0, j - suffixLength);
        best_shorttext_b = shorttext.substring(j + prefixLength);
      }
    }
    if (best_common.length * 2 >= longtext.length) {
      return [best_longtext_a, best_longtext_b,
              best_shorttext_a, best_shorttext_b, best_common];
    } else {
      return null;
    }
  }

  // First check if the second quarter is the seed for a half-match.
  var hm1 = diff_halfMatchI_(longtext, shorttext,
                             Math.ceil(longtext.length / 4));
  // Check again based on the third quarter.
  var hm2 = diff_halfMatchI_(longtext, shorttext,
                             Math.ceil(longtext.length / 2));
  var hm;
  if (!hm1 && !hm2) {
    return null;
  } else if (!hm2) {
    hm = hm1;
  } else if (!hm1) {
    hm = hm2;
  } else {
    // Both matched.  Select the longest.
    hm = hm1[4].length > hm2[4].length ? hm1 : hm2;
  }

  // A half-match was found, sort out the return data.
  var text1_a, text1_b, text2_a, text2_b;
  if (text1.length > text2.length) {
    text1_a = hm[0];
    text1_b = hm[1];
    text2_a = hm[2];
    text2_b = hm[3];
  } else {
    text2_a = hm[0];
    text2_b = hm[1];
    text1_a = hm[2];
    text1_b = hm[3];
  }
  var mid_common = hm[4];
  return [text1_a, text1_b, text2_a, text2_b, mid_common];
};


/**
 * Reorder and merge like edit sections.  Merge equalities.
 * Any edit section can move as long as it doesn't cross an equality.
 * @param {Array} diffs Array of diff tuples.
 */
function diff_cleanupMerge(diffs) {
  diffs.push([DIFF_EQUAL, '']);  // Add a dummy entry at the end.
  var pointer = 0;
  var count_delete = 0;
  var count_insert = 0;
  var text_delete = '';
  var text_insert = '';
  var commonlength;
  while (pointer < diffs.length) {
    switch (diffs[pointer][0]) {
      case DIFF_INSERT:
        count_insert++;
        text_insert += diffs[pointer][1];
        pointer++;
        break;
      case DIFF_DELETE:
        count_delete++;
        text_delete += diffs[pointer][1];
        pointer++;
        break;
      case DIFF_EQUAL:
        // Upon reaching an equality, check for prior redundancies.
        if (count_delete + count_insert > 1) {
          if (count_delete !== 0 && count_insert !== 0) {
            // Factor out any common prefixies.
            commonlength = diff_commonPrefix(text_insert, text_delete);
            if (commonlength !== 0) {
              if ((pointer - count_delete - count_insert) > 0 &&
                  diffs[pointer - count_delete - count_insert - 1][0] ==
                  DIFF_EQUAL) {
                diffs[pointer - count_delete - count_insert - 1][1] +=
                    text_insert.substring(0, commonlength);
              } else {
                diffs.splice(0, 0, [DIFF_EQUAL,
                                    text_insert.substring(0, commonlength)]);
                pointer++;
              }
              text_insert = text_insert.substring(commonlength);
              text_delete = text_delete.substring(commonlength);
            }
            // Factor out any common suffixies.
            commonlength = diff_commonSuffix(text_insert, text_delete);
            if (commonlength !== 0) {
              diffs[pointer][1] = text_insert.substring(text_insert.length -
                  commonlength) + diffs[pointer][1];
              text_insert = text_insert.substring(0, text_insert.length -
                  commonlength);
              text_delete = text_delete.substring(0, text_delete.length -
                  commonlength);
            }
          }
          // Delete the offending records and add the merged ones.
          if (count_delete === 0) {
            diffs.splice(pointer - count_insert,
                count_delete + count_insert, [DIFF_INSERT, text_insert]);
          } else if (count_insert === 0) {
            diffs.splice(pointer - count_delete,
                count_delete + count_insert, [DIFF_DELETE, text_delete]);
          } else {
            diffs.splice(pointer - count_delete - count_insert,
                count_delete + count_insert, [DIFF_DELETE, text_delete],
                [DIFF_INSERT, text_insert]);
          }
          pointer = pointer - count_delete - count_insert +
                    (count_delete ? 1 : 0) + (count_insert ? 1 : 0) + 1;
        } else if (pointer !== 0 && diffs[pointer - 1][0] == DIFF_EQUAL) {
          // Merge this equality with the previous one.
          diffs[pointer - 1][1] += diffs[pointer][1];
          diffs.splice(pointer, 1);
        } else {
          pointer++;
        }
        count_insert = 0;
        count_delete = 0;
        text_delete = '';
        text_insert = '';
        break;
    }
  }
  if (diffs[diffs.length - 1][1] === '') {
    diffs.pop();  // Remove the dummy entry at the end.
  }

  // Second pass: look for single edits surrounded on both sides by equalities
  // which can be shifted sideways to eliminate an equality.
  // e.g: A<ins>BA</ins>C -> <ins>AB</ins>AC
  var changes = false;
  pointer = 1;
  // Intentionally ignore the first and last element (don't need checking).
  while (pointer < diffs.length - 1) {
    if (diffs[pointer - 1][0] == DIFF_EQUAL &&
        diffs[pointer + 1][0] == DIFF_EQUAL) {
      // This is a single edit surrounded by equalities.
      if (diffs[pointer][1].substring(diffs[pointer][1].length -
          diffs[pointer - 1][1].length) == diffs[pointer - 1][1]) {
        // Shift the edit over the previous equality.
        diffs[pointer][1] = diffs[pointer - 1][1] +
            diffs[pointer][1].substring(0, diffs[pointer][1].length -
                                        diffs[pointer - 1][1].length);
        diffs[pointer + 1][1] = diffs[pointer - 1][1] + diffs[pointer + 1][1];
        diffs.splice(pointer - 1, 1);
        changes = true;
      } else if (diffs[pointer][1].substring(0, diffs[pointer + 1][1].length) ==
          diffs[pointer + 1][1]) {
        // Shift the edit over the next equality.
        diffs[pointer - 1][1] += diffs[pointer + 1][1];
        diffs[pointer][1] =
            diffs[pointer][1].substring(diffs[pointer + 1][1].length) +
            diffs[pointer + 1][1];
        diffs.splice(pointer + 1, 1);
        changes = true;
      }
    }
    pointer++;
  }
  // If shifts were made, the diff needs reordering and another shift sweep.
  if (changes) {
    diff_cleanupMerge(diffs);
  }
};


var diff = diff_main;
diff.INSERT = DIFF_INSERT;
diff.DELETE = DIFF_DELETE;
diff.EQUAL = DIFF_EQUAL;

module.exports = diff;

/*
 * Modify a diff such that the cursor position points to the start of a change:
 * E.g.
 *   cursor_normalize_diff([[DIFF_EQUAL, 'abc']], 1)
 *     => [1, [[DIFF_EQUAL, 'a'], [DIFF_EQUAL, 'bc']]]
 *   cursor_normalize_diff([[DIFF_INSERT, 'new'], [DIFF_DELETE, 'xyz']], 2)
 *     => [2, [[DIFF_INSERT, 'new'], [DIFF_DELETE, 'xy'], [DIFF_DELETE, 'z']]]
 *
 * @param {Array} diffs Array of diff tuples
 * @param {Int} cursor_pos Suggested edit position. Must not be out of bounds!
 * @return {Array} A tuple [cursor location in the modified diff, modified diff]
 */
function cursor_normalize_diff (diffs, cursor_pos) {
  if (cursor_pos === 0) {
    return [DIFF_EQUAL, diffs];
  }
  for (var current_pos = 0, i = 0; i < diffs.length; i++) {
    var d = diffs[i];
    if (d[0] === DIFF_DELETE || d[0] === DIFF_EQUAL) {
      var next_pos = current_pos + d[1].length;
      if (cursor_pos === next_pos) {
        return [i + 1, diffs];
      } else if (cursor_pos < next_pos) {
        // copy to prevent side effects
        diffs = diffs.slice();
        // split d into two diff changes
        var split_pos = cursor_pos - current_pos;
        var d_left = [d[0], d[1].slice(0, split_pos)];
        var d_right = [d[0], d[1].slice(split_pos)];
        diffs.splice(i, 1, d_left, d_right);
        return [i + 1, diffs];
      } else {
        current_pos = next_pos;
      }
    }
  }
  throw new Error('cursor_pos is out of bounds!')
}

/*
 * Modify a diff such that the edit position is "shifted" to the proposed edit location (cursor_position).
 *
 * Case 1)
 *   Check if a naive shift is possible:
 *     [0, X], [ 1, Y] -> [ 1, Y], [0, X]    (if X + Y === Y + X)
 *     [0, X], [-1, Y] -> [-1, Y], [0, X]    (if X + Y === Y + X) - holds same result
 * Case 2)
 *   Check if the following shifts are possible:
 *     [0, 'pre'], [ 1, 'prefix'] -> [ 1, 'pre'], [0, 'pre'], [ 1, 'fix']
 *     [0, 'pre'], [-1, 'prefix'] -> [-1, 'pre'], [0, 'pre'], [-1, 'fix']
 *         ^            ^
 *         d          d_next
 *
 * @param {Array} diffs Array of diff tuples
 * @param {Int} cursor_pos Suggested edit position. Must not be out of bounds!
 * @return {Array} Array of diff tuples
 */
function fix_cursor (diffs, cursor_pos) {
  var norm = cursor_normalize_diff(diffs, cursor_pos);
  var ndiffs = norm[1];
  var cursor_pointer = norm[0];
  var d = ndiffs[cursor_pointer];
  var d_next = ndiffs[cursor_pointer + 1];

  if (d == null) {
    // Text was deleted from end of original string,
    // cursor is now out of bounds in new string
    return diffs;
  } else if (d[0] !== DIFF_EQUAL) {
    // A modification happened at the cursor location.
    // This is the expected outcome, so we can return the original diff.
    return diffs;
  } else {
    if (d_next != null && d[1] + d_next[1] === d_next[1] + d[1]) {
      // Case 1)
      // It is possible to perform a naive shift
      ndiffs.splice(cursor_pointer, 2, d_next, d)
      return merge_tuples(ndiffs, cursor_pointer, 2)
    } else if (d_next != null && d_next[1].indexOf(d[1]) === 0) {
      // Case 2)
      // d[1] is a prefix of d_next[1]
      // We can assume that d_next[0] !== 0, since d[0] === 0
      // Shift edit locations..
      ndiffs.splice(cursor_pointer, 2, [d_next[0], d[1]], [0, d[1]]);
      var suffix = d_next[1].slice(d[1].length);
      if (suffix.length > 0) {
        ndiffs.splice(cursor_pointer + 2, 0, [d_next[0], suffix]);
      }
      return merge_tuples(ndiffs, cursor_pointer, 3)
    } else {
      // Not possible to perform any modification
      return diffs;
    }
  }
}

/*
 * Check diff did not split surrogate pairs.
 * Ex. [0, '\uD83D'], [-1, '\uDC36'], [1, '\uDC2F'] -> [-1, '\uD83D\uDC36'], [1, '\uD83D\uDC2F']
 *     '\uD83D\uDC36' === '🐶', '\uD83D\uDC2F' === '🐯'
 *
 * @param {Array} diffs Array of diff tuples
 * @return {Array} Array of diff tuples
 */
function fix_emoji (diffs) {
  var compact = false;
  var starts_with_pair_end = function(str) {
    return str.charCodeAt(0) >= 0xDC00 && str.charCodeAt(0) <= 0xDFFF;
  }
  var ends_with_pair_start = function(str) {
    return str.charCodeAt(str.length-1) >= 0xD800 && str.charCodeAt(str.length-1) <= 0xDBFF;
  }
  for (var i = 2; i < diffs.length; i += 1) {
    if (diffs[i-2][0] === DIFF_EQUAL && ends_with_pair_start(diffs[i-2][1]) &&
        diffs[i-1][0] === DIFF_DELETE && starts_with_pair_end(diffs[i-1][1]) &&
        diffs[i][0] === DIFF_INSERT && starts_with_pair_end(diffs[i][1])) {
      compact = true;

      diffs[i-1][1] = diffs[i-2][1].slice(-1) + diffs[i-1][1];
      diffs[i][1] = diffs[i-2][1].slice(-1) + diffs[i][1];

      diffs[i-2][1] = diffs[i-2][1].slice(0, -1);
    }
  }
  if (!compact) {
    return diffs;
  }
  var fixed_diffs = [];
  for (var i = 0; i < diffs.length; i += 1) {
    if (diffs[i][1].length > 0) {
      fixed_diffs.push(diffs[i]);
    }
  }
  return fixed_diffs;
}

/*
 * Try to merge tuples with their neigbors in a given range.
 * E.g. [0, 'a'], [0, 'b'] -> [0, 'ab']
 *
 * @param {Array} diffs Array of diff tuples.
 * @param {Int} start Position of the first element to merge (diffs[start] is also merged with diffs[start - 1]).
 * @param {Int} length Number of consecutive elements to check.
 * @return {Array} Array of merged diff tuples.
 */
function merge_tuples (diffs, start, length) {
  // Check from (start-1) to (start+length).
  for (var i = start + length - 1; i >= 0 && i >= start - 1; i--) {
    if (i + 1 < diffs.length) {
      var left_d = diffs[i];
      var right_d = diffs[i+1];
      if (left_d[0] === right_d[1]) {
        diffs.splice(i, 2, [left_d[0], left_d[1] + right_d[1]]);
      }
    }
  }
  return diffs;
}


/***/ }),
/* 52 */
/***/ (function(module, exports) {

exports = module.exports = typeof Object.keys === 'function'
  ? Object.keys : shim;

exports.shim = shim;
function shim (obj) {
  var keys = [];
  for (var key in obj) keys.push(key);
  return keys;
}


/***/ }),
/* 53 */
/***/ (function(module, exports) {

var supportsArgumentsClass = (function(){
  return Object.prototype.toString.call(arguments)
})() == '[object Arguments]';

exports = module.exports = supportsArgumentsClass ? supported : unsupported;

exports.supported = supported;
function supported(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
};

exports.unsupported = unsupported;
function unsupported(object){
  return object &&
    typeof object == 'object' &&
    typeof object.length == 'number' &&
    Object.prototype.hasOwnProperty.call(object, 'callee') &&
    !Object.prototype.propertyIsEnumerable.call(object, 'callee') ||
    false;
};


/***/ }),
/* 54 */
/***/ (function(module, exports) {

'use strict';

var has = Object.prototype.hasOwnProperty
  , prefix = '~';

/**
 * Constructor to create a storage for our `EE` objects.
 * An `Events` instance is a plain object whose properties are event names.
 *
 * @constructor
 * @api private
 */
function Events() {}

//
// We try to not inherit from `Object.prototype`. In some engines creating an
// instance in this way is faster than calling `Object.create(null)` directly.
// If `Object.create(null)` is not supported we prefix the event names with a
// character to make sure that the built-in object properties are not
// overridden or used as an attack vector.
//
if (Object.create) {
  Events.prototype = Object.create(null);

  //
  // This hack is needed because the `__proto__` property is still inherited in
  // some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
  //
  if (!new Events().__proto__) prefix = false;
}

/**
 * Representation of a single event listener.
 *
 * @param {Function} fn The listener function.
 * @param {Mixed} context The context to invoke the listener with.
 * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
 * @constructor
 * @api private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Minimal `EventEmitter` interface that is molded against the Node.js
 * `EventEmitter` interface.
 *
 * @constructor
 * @api public
 */
function EventEmitter() {
  this._events = new Events();
  this._eventsCount = 0;
}

/**
 * Return an array listing the events for which the emitter has registered
 * listeners.
 *
 * @returns {Array}
 * @api public
 */
EventEmitter.prototype.eventNames = function eventNames() {
  var names = []
    , events
    , name;

  if (this._eventsCount === 0) return names;

  for (name in (events = this._events)) {
    if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
  }

  if (Object.getOwnPropertySymbols) {
    return names.concat(Object.getOwnPropertySymbols(events));
  }

  return names;
};

/**
 * Return the listeners registered for a given event.
 *
 * @param {String|Symbol} event The event name.
 * @param {Boolean} exists Only check if there are listeners.
 * @returns {Array|Boolean}
 * @api public
 */
EventEmitter.prototype.listeners = function listeners(event, exists) {
  var evt = prefix ? prefix + event : event
    , available = this._events[evt];

  if (exists) return !!available;
  if (!available) return [];
  if (available.fn) return [available.fn];

  for (var i = 0, l = available.length, ee = new Array(l); i < l; i++) {
    ee[i] = available[i].fn;
  }

  return ee;
};

/**
 * Calls each of the listeners registered for a given event.
 *
 * @param {String|Symbol} event The event name.
 * @returns {Boolean} `true` if the event had listeners, else `false`.
 * @api public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  var evt = prefix ? prefix + event : event;

  if (!this._events[evt]) return false;

  var listeners = this._events[evt]
    , len = arguments.length
    , args
    , i;

  if (listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

    switch (len) {
      case 1: return listeners.fn.call(listeners.context), true;
      case 2: return listeners.fn.call(listeners.context, a1), true;
      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len -1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length
      , j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

      switch (len) {
        case 1: listeners[i].fn.call(listeners[i].context); break;
        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
        case 4: listeners[i].fn.call(listeners[i].context, a1, a2, a3); break;
        default:
          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Add a listener for a given event.
 *
 * @param {String|Symbol} event The event name.
 * @param {Function} fn The listener function.
 * @param {Mixed} [context=this] The context to invoke the listener with.
 * @returns {EventEmitter} `this`.
 * @api public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  var listener = new EE(fn, context || this)
    , evt = prefix ? prefix + event : event;

  if (!this._events[evt]) this._events[evt] = listener, this._eventsCount++;
  else if (!this._events[evt].fn) this._events[evt].push(listener);
  else this._events[evt] = [this._events[evt], listener];

  return this;
};

/**
 * Add a one-time listener for a given event.
 *
 * @param {String|Symbol} event The event name.
 * @param {Function} fn The listener function.
 * @param {Mixed} [context=this] The context to invoke the listener with.
 * @returns {EventEmitter} `this`.
 * @api public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  var listener = new EE(fn, context || this, true)
    , evt = prefix ? prefix + event : event;

  if (!this._events[evt]) this._events[evt] = listener, this._eventsCount++;
  else if (!this._events[evt].fn) this._events[evt].push(listener);
  else this._events[evt] = [this._events[evt], listener];

  return this;
};

/**
 * Remove the listeners of a given event.
 *
 * @param {String|Symbol} event The event name.
 * @param {Function} fn Only remove the listeners that match this function.
 * @param {Mixed} context Only remove the listeners that have this context.
 * @param {Boolean} once Only remove one-time listeners.
 * @returns {EventEmitter} `this`.
 * @api public
 */
EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
  var evt = prefix ? prefix + event : event;

  if (!this._events[evt]) return this;
  if (!fn) {
    if (--this._eventsCount === 0) this._events = new Events();
    else delete this._events[evt];
    return this;
  }

  var listeners = this._events[evt];

  if (listeners.fn) {
    if (
         listeners.fn === fn
      && (!once || listeners.once)
      && (!context || listeners.context === context)
    ) {
      if (--this._eventsCount === 0) this._events = new Events();
      else delete this._events[evt];
    }
  } else {
    for (var i = 0, events = [], length = listeners.length; i < length; i++) {
      if (
           listeners[i].fn !== fn
        || (once && !listeners[i].once)
        || (context && listeners[i].context !== context)
      ) {
        events.push(listeners[i]);
      }
    }

    //
    // Reset the array, or remove it completely if we have no more listeners.
    //
    if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
    else if (--this._eventsCount === 0) this._events = new Events();
    else delete this._events[evt];
  }

  return this;
};

/**
 * Remove all listeners, or those of the specified event.
 *
 * @param {String|Symbol} [event] The event name.
 * @returns {EventEmitter} `this`.
 * @api public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  var evt;

  if (event) {
    evt = prefix ? prefix + event : event;
    if (this._events[evt]) {
      if (--this._eventsCount === 0) this._events = new Events();
      else delete this._events[evt];
    }
  } else {
    this._events = new Events();
    this._eventsCount = 0;
  }

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// This function doesn't apply anymore.
//
EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
  return this;
};

//
// Expose the prefix.
//
EventEmitter.prefixed = prefix;

//
// Allow `EventEmitter` to be imported as module namespace.
//
EventEmitter.EventEmitter = EventEmitter;

//
// Expose the module.
//
if ('undefined' !== typeof module) {
  module.exports = EventEmitter;
}


/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.matchText = exports.matchSpacing = exports.matchNewline = exports.matchBlot = exports.matchAttributor = exports.default = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extend2 = __webpack_require__(3);

var _extend3 = _interopRequireDefault(_extend2);

var _quillDelta = __webpack_require__(2);

var _quillDelta2 = _interopRequireDefault(_quillDelta);

var _parchment = __webpack_require__(0);

var _parchment2 = _interopRequireDefault(_parchment);

var _quill = __webpack_require__(5);

var _quill2 = _interopRequireDefault(_quill);

var _logger = __webpack_require__(10);

var _logger2 = _interopRequireDefault(_logger);

var _module = __webpack_require__(9);

var _module2 = _interopRequireDefault(_module);

var _align = __webpack_require__(36);

var _background = __webpack_require__(37);

var _code = __webpack_require__(13);

var _code2 = _interopRequireDefault(_code);

var _color = __webpack_require__(26);

var _direction = __webpack_require__(38);

var _font = __webpack_require__(39);

var _size = __webpack_require__(40);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var debug = (0, _logger2.default)('quill:clipboard');

var DOM_KEY = '__ql-matcher';

var CLIPBOARD_CONFIG = [[Node.TEXT_NODE, matchText], [Node.TEXT_NODE, matchNewline], ['br', matchBreak], [Node.ELEMENT_NODE, matchNewline], [Node.ELEMENT_NODE, matchBlot], [Node.ELEMENT_NODE, matchSpacing], [Node.ELEMENT_NODE, matchAttributor], [Node.ELEMENT_NODE, matchStyles], ['li', matchIndent], ['b', matchAlias.bind(matchAlias, 'bold')], ['i', matchAlias.bind(matchAlias, 'italic')], ['style', matchIgnore]];

var ATTRIBUTE_ATTRIBUTORS = [_align.AlignAttribute, _direction.DirectionAttribute].reduce(function (memo, attr) {
  memo[attr.keyName] = attr;
  return memo;
}, {});

var STYLE_ATTRIBUTORS = [_align.AlignStyle, _background.BackgroundStyle, _color.ColorStyle, _direction.DirectionStyle, _font.FontStyle, _size.SizeStyle].reduce(function (memo, attr) {
  memo[attr.keyName] = attr;
  return memo;
}, {});

var Clipboard = function (_Module) {
  _inherits(Clipboard, _Module);

  function Clipboard(quill, options) {
    _classCallCheck(this, Clipboard);

    var _this = _possibleConstructorReturn(this, (Clipboard.__proto__ || Object.getPrototypeOf(Clipboard)).call(this, quill, options));

    _this.quill.root.addEventListener('paste', _this.onPaste.bind(_this));
    _this.container = _this.quill.addContainer('ql-clipboard');
    _this.container.setAttribute('contenteditable', true);
    _this.container.setAttribute('tabindex', -1);
    _this.matchers = [];
    CLIPBOARD_CONFIG.concat(_this.options.matchers).forEach(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          selector = _ref2[0],
          matcher = _ref2[1];

      if (!options.matchVisual && matcher === matchSpacing) return;
      _this.addMatcher(selector, matcher);
    });
    return _this;
  }

  _createClass(Clipboard, [{
    key: 'addMatcher',
    value: function addMatcher(selector, matcher) {
      this.matchers.push([selector, matcher]);
    }
  }, {
    key: 'convert',
    value: function convert(html) {
      if (typeof html === 'string') {
        this.container.innerHTML = html.replace(/\>\r?\n +\</g, '><'); // Remove spaces between tags
        return this.convert();
      }
      var formats = this.quill.getFormat(this.quill.selection.savedRange.index);
      if (formats[_code2.default.blotName]) {
        var text = this.container.innerText;
        this.container.innerHTML = '';
        return new _quillDelta2.default().insert(text, _defineProperty({}, _code2.default.blotName, formats[_code2.default.blotName]));
      }

      var _prepareMatching = this.prepareMatching(),
          _prepareMatching2 = _slicedToArray(_prepareMatching, 2),
          elementMatchers = _prepareMatching2[0],
          textMatchers = _prepareMatching2[1];

      var delta = traverse(this.container, elementMatchers, textMatchers);
      // Remove trailing newline
      if (deltaEndsWith(delta, '\n') && delta.ops[delta.ops.length - 1].attributes == null) {
        delta = delta.compose(new _quillDelta2.default().retain(delta.length() - 1).delete(1));
      }
      debug.log('convert', this.container.innerHTML, delta);
      this.container.innerHTML = '';
      return delta;
    }
  }, {
    key: 'dangerouslyPasteHTML',
    value: function dangerouslyPasteHTML(index, html) {
      var source = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _quill2.default.sources.API;

      if (typeof index === 'string') {
        this.quill.setContents(this.convert(index), html);
        this.quill.setSelection(0, _quill2.default.sources.SILENT);
      } else {
        var paste = this.convert(html);
        this.quill.updateContents(new _quillDelta2.default().retain(index).concat(paste), source);
        this.quill.setSelection(index + paste.length(), _quill2.default.sources.SILENT);
      }
    }
  }, {
    key: 'onPaste',
    value: function onPaste(e) {
      var _this2 = this;

      if (e.defaultPrevented || !this.quill.isEnabled()) return;
      var range = this.quill.getSelection();
      var delta = new _quillDelta2.default().retain(range.index);
      var scrollTop = this.quill.scrollingContainer.scrollTop;
      this.container.focus();
      this.quill.selection.update(_quill2.default.sources.SILENT);
      setTimeout(function () {
        delta = delta.concat(_this2.convert()).delete(range.length);
        _this2.quill.updateContents(delta, _quill2.default.sources.USER);
        // range.length contributes to delta.length()
        _this2.quill.setSelection(delta.length() - range.length, _quill2.default.sources.SILENT);
        _this2.quill.scrollingContainer.scrollTop = scrollTop;
        _this2.quill.focus();
      }, 1);
    }
  }, {
    key: 'prepareMatching',
    value: function prepareMatching() {
      var _this3 = this;

      var elementMatchers = [],
          textMatchers = [];
      this.matchers.forEach(function (pair) {
        var _pair = _slicedToArray(pair, 2),
            selector = _pair[0],
            matcher = _pair[1];

        switch (selector) {
          case Node.TEXT_NODE:
            textMatchers.push(matcher);
            break;
          case Node.ELEMENT_NODE:
            elementMatchers.push(matcher);
            break;
          default:
            [].forEach.call(_this3.container.querySelectorAll(selector), function (node) {
              // TODO use weakmap
              node[DOM_KEY] = node[DOM_KEY] || [];
              node[DOM_KEY].push(matcher);
            });
            break;
        }
      });
      return [elementMatchers, textMatchers];
    }
  }]);

  return Clipboard;
}(_module2.default);

Clipboard.DEFAULTS = {
  matchers: [],
  matchVisual: true
};

function applyFormat(delta, format, value) {
  if ((typeof format === 'undefined' ? 'undefined' : _typeof(format)) === 'object') {
    return Object.keys(format).reduce(function (delta, key) {
      return applyFormat(delta, key, format[key]);
    }, delta);
  } else {
    return delta.reduce(function (delta, op) {
      if (op.attributes && op.attributes[format]) {
        return delta.push(op);
      } else {
        return delta.insert(op.insert, (0, _extend3.default)({}, _defineProperty({}, format, value), op.attributes));
      }
    }, new _quillDelta2.default());
  }
}

function computeStyle(node) {
  if (node.nodeType !== Node.ELEMENT_NODE) return {};
  var DOM_KEY = '__ql-computed-style';
  return node[DOM_KEY] || (node[DOM_KEY] = window.getComputedStyle(node));
}

function deltaEndsWith(delta, text) {
  var endText = "";
  for (var i = delta.ops.length - 1; i >= 0 && endText.length < text.length; --i) {
    var op = delta.ops[i];
    if (typeof op.insert !== 'string') break;
    endText = op.insert + endText;
  }
  return endText.slice(-1 * text.length) === text;
}

function isLine(node) {
  if (node.childNodes.length === 0) return false; // Exclude embed blocks
  var style = computeStyle(node);
  return ['block', 'list-item'].indexOf(style.display) > -1;
}

function traverse(node, elementMatchers, textMatchers) {
  // Post-order
  if (node.nodeType === node.TEXT_NODE) {
    return textMatchers.reduce(function (delta, matcher) {
      return matcher(node, delta);
    }, new _quillDelta2.default());
  } else if (node.nodeType === node.ELEMENT_NODE) {
    return [].reduce.call(node.childNodes || [], function (delta, childNode) {
      var childrenDelta = traverse(childNode, elementMatchers, textMatchers);
      if (childNode.nodeType === node.ELEMENT_NODE) {
        childrenDelta = elementMatchers.reduce(function (childrenDelta, matcher) {
          return matcher(childNode, childrenDelta);
        }, childrenDelta);
        childrenDelta = (childNode[DOM_KEY] || []).reduce(function (childrenDelta, matcher) {
          return matcher(childNode, childrenDelta);
        }, childrenDelta);
      }
      return delta.concat(childrenDelta);
    }, new _quillDelta2.default());
  } else {
    return new _quillDelta2.default();
  }
}

function matchAlias(format, node, delta) {
  return applyFormat(delta, format, true);
}

function matchAttributor(node, delta) {
  var attributes = _parchment2.default.Attributor.Attribute.keys(node);
  var classes = _parchment2.default.Attributor.Class.keys(node);
  var styles = _parchment2.default.Attributor.Style.keys(node);
  var formats = {};
  attributes.concat(classes).concat(styles).forEach(function (name) {
    var attr = _parchment2.default.query(name, _parchment2.default.Scope.ATTRIBUTE);
    if (attr != null) {
      formats[attr.attrName] = attr.value(node);
      if (formats[attr.attrName]) return;
    }
    attr = ATTRIBUTE_ATTRIBUTORS[name];
    if (attr != null && (attr.attrName === name || attr.keyName === name)) {
      formats[attr.attrName] = attr.value(node) || undefined;
    }
    attr = STYLE_ATTRIBUTORS[name];
    if (attr != null && (attr.attrName === name || attr.keyName === name)) {
      attr = STYLE_ATTRIBUTORS[name];
      formats[attr.attrName] = attr.value(node) || undefined;
    }
  });
  if (Object.keys(formats).length > 0) {
    delta = applyFormat(delta, formats);
  }
  return delta;
}

function matchBlot(node, delta) {
  var match = _parchment2.default.query(node);
  if (match == null) return delta;
  if (match.prototype instanceof _parchment2.default.Embed) {
    var embed = {};
    var value = match.value(node);
    if (value != null) {
      embed[match.blotName] = value;
      delta = new _quillDelta2.default().insert(embed, match.formats(node));
    }
  } else if (typeof match.formats === 'function') {
    delta = applyFormat(delta, match.blotName, match.formats(node));
  }
  return delta;
}

function matchBreak(node, delta) {
  if (!deltaEndsWith(delta, '\n')) {
    delta.insert('\n');
  }
  return delta;
}

function matchIgnore() {
  return new _quillDelta2.default();
}

function matchIndent(node, delta) {
  var match = _parchment2.default.query(node);
  if (match == null || match.blotName !== 'list-item' || !deltaEndsWith(delta, '\n')) {
    return delta;
  }
  var indent = -1,
      parent = node.parentNode;
  while (!parent.classList.contains('ql-clipboard')) {
    if ((_parchment2.default.query(parent) || {}).blotName === 'list') {
      indent += 1;
    }
    parent = parent.parentNode;
  }
  if (indent <= 0) return delta;
  return delta.compose(new _quillDelta2.default().retain(delta.length() - 1).retain(1, { indent: indent }));
}

function matchNewline(node, delta) {
  if (!deltaEndsWith(delta, '\n')) {
    if (isLine(node) || delta.length() > 0 && node.nextSibling && isLine(node.nextSibling)) {
      delta.insert('\n');
    }
  }
  return delta;
}

function matchSpacing(node, delta) {
  if (isLine(node) && node.nextElementSibling != null && !deltaEndsWith(delta, '\n\n')) {
    var nodeHeight = node.offsetHeight + parseFloat(computeStyle(node).marginTop) + parseFloat(computeStyle(node).marginBottom);
    if (node.nextElementSibling.offsetTop > node.offsetTop + nodeHeight * 1.5) {
      delta.insert('\n');
    }
  }
  return delta;
}

function matchStyles(node, delta) {
  var formats = {};
  var style = node.style || {};
  if (style.fontStyle && computeStyle(node).fontStyle === 'italic') {
    formats.italic = true;
  }
  if (style.fontWeight && (computeStyle(node).fontWeight.startsWith('bold') || parseInt(computeStyle(node).fontWeight) >= 700)) {
    formats.bold = true;
  }
  if (Object.keys(formats).length > 0) {
    delta = applyFormat(delta, formats);
  }
  if (parseFloat(style.textIndent || 0) > 0) {
    // Could be 0.5in
    delta = new _quillDelta2.default().insert('\t').concat(delta);
  }
  return delta;
}

function matchText(node, delta) {
  var text = node.data;
  // Word represents empty line with <o:p>&nbsp;</o:p>
  if (node.parentNode.tagName === 'O:P') {
    return delta.insert(text.trim());
  }
  if (text.trim().length === 0 && node.parentNode.classList.contains('ql-clipboard')) {
    return delta;
  }
  if (!computeStyle(node.parentNode).whiteSpace.startsWith('pre')) {
    // eslint-disable-next-line func-style
    var replacer = function replacer(collapse, match) {
      match = match.replace(/[^\u00a0]/g, ''); // \u00a0 is nbsp;
      return match.length < 1 && collapse ? ' ' : match;
    };
    text = text.replace(/\r\n/g, ' ').replace(/\n/g, ' ');
    text = text.replace(/\s\s+/g, replacer.bind(replacer, true)); // collapse whitespace
    if (node.previousSibling == null && isLine(node.parentNode) || node.previousSibling != null && isLine(node.previousSibling)) {
      text = text.replace(/^\s+/, replacer.bind(replacer, false));
    }
    if (node.nextSibling == null && isLine(node.parentNode) || node.nextSibling != null && isLine(node.nextSibling)) {
      text = text.replace(/\s+$/, replacer.bind(replacer, false));
    }
  }
  return delta.insert(text);
}

exports.default = Clipboard;
exports.matchAttributor = matchAttributor;
exports.matchBlot = matchBlot;
exports.matchNewline = matchNewline;
exports.matchSpacing = matchSpacing;
exports.matchText = matchText;

/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inline = __webpack_require__(6);

var _inline2 = _interopRequireDefault(_inline);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Bold = function (_Inline) {
  _inherits(Bold, _Inline);

  function Bold() {
    _classCallCheck(this, Bold);

    return _possibleConstructorReturn(this, (Bold.__proto__ || Object.getPrototypeOf(Bold)).apply(this, arguments));
  }

  _createClass(Bold, [{
    key: 'optimize',
    value: function optimize(context) {
      _get(Bold.prototype.__proto__ || Object.getPrototypeOf(Bold.prototype), 'optimize', this).call(this, context);
      if (this.domNode.tagName !== this.statics.tagName[0]) {
        this.replaceWith(this.statics.blotName);
      }
    }
  }], [{
    key: 'create',
    value: function create() {
      return _get(Bold.__proto__ || Object.getPrototypeOf(Bold), 'create', this).call(this);
    }
  }, {
    key: 'formats',
    value: function formats() {
      return true;
    }
  }]);

  return Bold;
}(_inline2.default);

Bold.blotName = 'bold';
Bold.tagName = ['STRONG', 'B'];

exports.default = Bold;

/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addControls = exports.default = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _quillDelta = __webpack_require__(2);

var _quillDelta2 = _interopRequireDefault(_quillDelta);

var _parchment = __webpack_require__(0);

var _parchment2 = _interopRequireDefault(_parchment);

var _quill = __webpack_require__(5);

var _quill2 = _interopRequireDefault(_quill);

var _logger = __webpack_require__(10);

var _logger2 = _interopRequireDefault(_logger);

var _module = __webpack_require__(9);

var _module2 = _interopRequireDefault(_module);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var debug = (0, _logger2.default)('quill:toolbar');

var Toolbar = function (_Module) {
  _inherits(Toolbar, _Module);

  function Toolbar(quill, options) {
    _classCallCheck(this, Toolbar);

    var _this = _possibleConstructorReturn(this, (Toolbar.__proto__ || Object.getPrototypeOf(Toolbar)).call(this, quill, options));

    if (Array.isArray(_this.options.container)) {
      var container = document.createElement('div');
      addControls(container, _this.options.container);
      quill.container.parentNode.insertBefore(container, quill.container);
      _this.container = container;
    } else if (typeof _this.options.container === 'string') {
      _this.container = document.querySelector(_this.options.container);
    } else {
      _this.container = _this.options.container;
    }
    if (!(_this.container instanceof HTMLElement)) {
      var _ret;

      return _ret = debug.error('Container required for toolbar', _this.options), _possibleConstructorReturn(_this, _ret);
    }
    _this.container.classList.add('ql-toolbar');
    _this.controls = [];
    _this.handlers = {};
    Object.keys(_this.options.handlers).forEach(function (format) {
      _this.addHandler(format, _this.options.handlers[format]);
    });
    [].forEach.call(_this.container.querySelectorAll('button, select'), function (input) {
      _this.attach(input);
    });
    _this.quill.on(_quill2.default.events.EDITOR_CHANGE, function (type, range) {
      if (type === _quill2.default.events.SELECTION_CHANGE) {
        _this.update(range);
      }
    });
    _this.quill.on(_quill2.default.events.SCROLL_OPTIMIZE, function () {
      var _this$quill$selection = _this.quill.selection.getRange(),
          _this$quill$selection2 = _slicedToArray(_this$quill$selection, 1),
          range = _this$quill$selection2[0]; // quill.getSelection triggers update


      _this.update(range);
    });
    return _this;
  }

  _createClass(Toolbar, [{
    key: 'addHandler',
    value: function addHandler(format, handler) {
      this.handlers[format] = handler;
    }
  }, {
    key: 'attach',
    value: function attach(input) {
      var _this2 = this;

      var format = [].find.call(input.classList, function (className) {
        return className.indexOf('ql-') === 0;
      });
      if (!format) return;
      format = format.slice('ql-'.length);
      if (input.tagName === 'BUTTON') {
        input.setAttribute('type', 'button');
      }
      if (this.handlers[format] == null) {
        if (this.quill.scroll.whitelist != null && this.quill.scroll.whitelist[format] == null) {
          debug.warn('ignoring attaching to disabled format', format, input);
          return;
        }
        if (_parchment2.default.query(format) == null) {
          debug.warn('ignoring attaching to nonexistent format', format, input);
          return;
        }
      }
      var eventName = input.tagName === 'SELECT' ? 'change' : 'click';
      input.addEventListener(eventName, function (e) {
        var value = void 0;
        if (input.tagName === 'SELECT') {
          if (input.selectedIndex < 0) return;
          var selected = input.options[input.selectedIndex];
          if (selected.hasAttribute('selected')) {
            value = false;
          } else {
            value = selected.value || false;
          }
        } else {
          if (input.classList.contains('ql-active')) {
            value = false;
          } else {
            value = input.value || !input.hasAttribute('value');
          }
          e.preventDefault();
        }
        _this2.quill.focus();

        var _quill$selection$getR = _this2.quill.selection.getRange(),
            _quill$selection$getR2 = _slicedToArray(_quill$selection$getR, 1),
            range = _quill$selection$getR2[0];

        if (_this2.handlers[format] != null) {
          _this2.handlers[format].call(_this2, value);
        } else if (_parchment2.default.query(format).prototype instanceof _parchment2.default.Embed) {
          value = prompt('Enter ' + format);
          if (!value) return;
          _this2.quill.updateContents(new _quillDelta2.default().retain(range.index).delete(range.length).insert(_defineProperty({}, format, value)), _quill2.default.sources.USER);
        } else {
          _this2.quill.format(format, value, _quill2.default.sources.USER);
        }
        _this2.update(range);
      });
      // TODO use weakmap
      this.controls.push([format, input]);
    }
  }, {
    key: 'update',
    value: function update(range) {
      var formats = range == null ? {} : this.quill.getFormat(range);
      this.controls.forEach(function (pair) {
        var _pair = _slicedToArray(pair, 2),
            format = _pair[0],
            input = _pair[1];

        if (input.tagName === 'SELECT') {
          var option = void 0;
          if (range == null) {
            option = null;
          } else if (formats[format] == null) {
            option = input.querySelector('option[selected]');
          } else if (!Array.isArray(formats[format])) {
            var value = formats[format];
            if (typeof value === 'string') {
              value = value.replace(/\"/g, '\\"');
            }
            option = input.querySelector('option[value="' + value + '"]');
          }
          if (option == null) {
            input.value = ''; // TODO make configurable?
            input.selectedIndex = -1;
          } else {
            option.selected = true;
          }
        } else {
          if (range == null) {
            input.classList.remove('ql-active');
          } else if (input.hasAttribute('value')) {
            // both being null should match (default values)
            // '1' should match with 1 (headers)
            var isActive = formats[format] === input.getAttribute('value') || formats[format] != null && formats[format].toString() === input.getAttribute('value') || formats[format] == null && !input.getAttribute('value');
            input.classList.toggle('ql-active', isActive);
          } else {
            input.classList.toggle('ql-active', formats[format] != null);
          }
        }
      });
    }
  }]);

  return Toolbar;
}(_module2.default);

Toolbar.DEFAULTS = {};

function addButton(container, format, value) {
  var input = document.createElement('button');
  input.setAttribute('type', 'button');
  input.classList.add('ql-' + format);
  if (value != null) {
    input.value = value;
  }
  container.appendChild(input);
}

function addControls(container, groups) {
  if (!Array.isArray(groups[0])) {
    groups = [groups];
  }
  groups.forEach(function (controls) {
    var group = document.createElement('span');
    group.classList.add('ql-formats');
    controls.forEach(function (control) {
      if (typeof control === 'string') {
        addButton(group, control);
      } else {
        var format = Object.keys(control)[0];
        var value = control[format];
        if (Array.isArray(value)) {
          addSelect(group, format, value);
        } else {
          addButton(group, format, value);
        }
      }
    });
    container.appendChild(group);
  });
}

function addSelect(container, format, values) {
  var input = document.createElement('select');
  input.classList.add('ql-' + format);
  values.forEach(function (value) {
    var option = document.createElement('option');
    if (value !== false) {
      option.setAttribute('value', value);
    } else {
      option.setAttribute('selected', 'selected');
    }
    input.appendChild(option);
  });
  container.appendChild(input);
}

Toolbar.DEFAULTS = {
  container: null,
  handlers: {
    clean: function clean() {
      var _this3 = this;

      var range = this.quill.getSelection();
      if (range == null) return;
      if (range.length == 0) {
        var formats = this.quill.getFormat();
        Object.keys(formats).forEach(function (name) {
          // Clean functionality in existing apps only clean inline formats
          if (_parchment2.default.query(name, _parchment2.default.Scope.INLINE) != null) {
            _this3.quill.format(name, false);
          }
        });
      } else {
        this.quill.removeFormat(range, _quill2.default.sources.USER);
      }
    },
    direction: function direction(value) {
      var align = this.quill.getFormat()['align'];
      if (value === 'rtl' && align == null) {
        this.quill.format('align', 'right', _quill2.default.sources.USER);
      } else if (!value && align === 'right') {
        this.quill.format('align', false, _quill2.default.sources.USER);
      }
      this.quill.format('direction', value, _quill2.default.sources.USER);
    },
    indent: function indent(value) {
      var range = this.quill.getSelection();
      var formats = this.quill.getFormat(range);
      var indent = parseInt(formats.indent || 0);
      if (value === '+1' || value === '-1') {
        var modifier = value === '+1' ? 1 : -1;
        if (formats.direction === 'rtl') modifier *= -1;
        this.quill.format('indent', indent + modifier, _quill2.default.sources.USER);
      }
    },
    link: function link(value) {
      if (value === true) {
        value = prompt('Enter link URL:');
      }
      this.quill.format('link', value, _quill2.default.sources.USER);
    },
    list: function list(value) {
      var range = this.quill.getSelection();
      var formats = this.quill.getFormat(range);
      if (value === 'check') {
        if (formats['list'] === 'checked' || formats['list'] === 'unchecked') {
          this.quill.format('list', false, _quill2.default.sources.USER);
        } else {
          this.quill.format('list', 'unchecked', _quill2.default.sources.USER);
        }
      } else {
        this.quill.format('list', value, _quill2.default.sources.USER);
      }
    }
  }
};

exports.default = Toolbar;
exports.addControls = addControls;

/***/ }),
/* 58 */
/***/ (function(module, exports) {

module.exports = "<svg viewbox=\"0 0 18 18\"> <polyline class=\"ql-even ql-stroke\" points=\"5 7 3 9 5 11\"></polyline> <polyline class=\"ql-even ql-stroke\" points=\"13 7 15 9 13 11\"></polyline> <line class=ql-stroke x1=10 x2=8 y1=5 y2=13></line> </svg>";

/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _picker = __webpack_require__(28);

var _picker2 = _interopRequireDefault(_picker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ColorPicker = function (_Picker) {
  _inherits(ColorPicker, _Picker);

  function ColorPicker(select, label) {
    _classCallCheck(this, ColorPicker);

    var _this = _possibleConstructorReturn(this, (ColorPicker.__proto__ || Object.getPrototypeOf(ColorPicker)).call(this, select));

    _this.label.innerHTML = label;
    _this.container.classList.add('ql-color-picker');
    [].slice.call(_this.container.querySelectorAll('.ql-picker-item'), 0, 7).forEach(function (item) {
      item.classList.add('ql-primary');
    });
    return _this;
  }

  _createClass(ColorPicker, [{
    key: 'buildItem',
    value: function buildItem(option) {
      var item = _get(ColorPicker.prototype.__proto__ || Object.getPrototypeOf(ColorPicker.prototype), 'buildItem', this).call(this, option);
      item.style.backgroundColor = option.getAttribute('value') || '';
      return item;
    }
  }, {
    key: 'selectItem',
    value: function selectItem(item, trigger) {
      _get(ColorPicker.prototype.__proto__ || Object.getPrototypeOf(ColorPicker.prototype), 'selectItem', this).call(this, item, trigger);
      var colorLabel = this.label.querySelector('.ql-color-label');
      var value = item ? item.getAttribute('data-value') || '' : '';
      if (colorLabel) {
        if (colorLabel.tagName === 'line') {
          colorLabel.style.stroke = value;
        } else {
          colorLabel.style.fill = value;
        }
      }
    }
  }]);

  return ColorPicker;
}(_picker2.default);

exports.default = ColorPicker;

/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _picker = __webpack_require__(28);

var _picker2 = _interopRequireDefault(_picker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var IconPicker = function (_Picker) {
  _inherits(IconPicker, _Picker);

  function IconPicker(select, icons) {
    _classCallCheck(this, IconPicker);

    var _this = _possibleConstructorReturn(this, (IconPicker.__proto__ || Object.getPrototypeOf(IconPicker)).call(this, select));

    _this.container.classList.add('ql-icon-picker');
    [].forEach.call(_this.container.querySelectorAll('.ql-picker-item'), function (item) {
      item.innerHTML = icons[item.getAttribute('data-value') || ''];
    });
    _this.defaultItem = _this.container.querySelector('.ql-selected');
    _this.selectItem(_this.defaultItem);
    return _this;
  }

  _createClass(IconPicker, [{
    key: 'selectItem',
    value: function selectItem(item, trigger) {
      _get(IconPicker.prototype.__proto__ || Object.getPrototypeOf(IconPicker.prototype), 'selectItem', this).call(this, item, trigger);
      item = item || this.defaultItem;
      this.label.innerHTML = item.innerHTML;
    }
  }]);

  return IconPicker;
}(_picker2.default);

exports.default = IconPicker;

/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Tooltip = function () {
  function Tooltip(quill, boundsContainer) {
    var _this = this;

    _classCallCheck(this, Tooltip);

    this.quill = quill;
    this.boundsContainer = boundsContainer || document.body;
    this.root = quill.addContainer('ql-tooltip');
    this.root.innerHTML = this.constructor.TEMPLATE;
    if (this.quill.root === this.quill.scrollingContainer) {
      this.quill.root.addEventListener('scroll', function () {
        _this.root.style.marginTop = -1 * _this.quill.root.scrollTop + 'px';
      });
    }
    this.hide();
  }

  _createClass(Tooltip, [{
    key: 'hide',
    value: function hide() {
      this.root.classList.add('ql-hidden');
    }
  }, {
    key: 'position',
    value: function position(reference) {
      var left = reference.left + reference.width / 2 - this.root.offsetWidth / 2;
      // root.scrollTop should be 0 if scrollContainer !== root
      var top = reference.bottom + this.quill.root.scrollTop;
      this.root.style.left = left + 'px';
      this.root.style.top = top + 'px';
      this.root.classList.remove('ql-flip');
      var containerBounds = this.boundsContainer.getBoundingClientRect();
      var rootBounds = this.root.getBoundingClientRect();
      var shift = 0;
      if (rootBounds.right > containerBounds.right) {
        shift = containerBounds.right - rootBounds.right;
        this.root.style.left = left + shift + 'px';
      }
      if (rootBounds.left < containerBounds.left) {
        shift = containerBounds.left - rootBounds.left;
        this.root.style.left = left + shift + 'px';
      }
      if (rootBounds.bottom > containerBounds.bottom) {
        var height = rootBounds.bottom - rootBounds.top;
        var verticalShift = reference.bottom - reference.top + height;
        this.root.style.top = top - verticalShift + 'px';
        this.root.classList.add('ql-flip');
      }
      return shift;
    }
  }, {
    key: 'show',
    value: function show() {
      this.root.classList.remove('ql-editing');
      this.root.classList.remove('ql-hidden');
    }
  }]);

  return Tooltip;
}();

exports.default = Tooltip;

/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extend = __webpack_require__(3);

var _extend2 = _interopRequireDefault(_extend);

var _emitter = __webpack_require__(8);

var _emitter2 = _interopRequireDefault(_emitter);

var _base = __webpack_require__(43);

var _base2 = _interopRequireDefault(_base);

var _link = __webpack_require__(27);

var _link2 = _interopRequireDefault(_link);

var _selection = __webpack_require__(15);

var _icons = __webpack_require__(41);

var _icons2 = _interopRequireDefault(_icons);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TOOLBAR_CONFIG = [[{ header: ['1', '2', '3', false] }], ['bold', 'italic', 'underline', 'link'], [{ list: 'ordered' }, { list: 'bullet' }], ['clean']];

var SnowTheme = function (_BaseTheme) {
  _inherits(SnowTheme, _BaseTheme);

  function SnowTheme(quill, options) {
    _classCallCheck(this, SnowTheme);

    if (options.modules.toolbar != null && options.modules.toolbar.container == null) {
      options.modules.toolbar.container = TOOLBAR_CONFIG;
    }

    var _this = _possibleConstructorReturn(this, (SnowTheme.__proto__ || Object.getPrototypeOf(SnowTheme)).call(this, quill, options));

    _this.quill.container.classList.add('ql-snow');
    return _this;
  }

  _createClass(SnowTheme, [{
    key: 'extendToolbar',
    value: function extendToolbar(toolbar) {
      toolbar.container.classList.add('ql-snow');
      this.buildButtons([].slice.call(toolbar.container.querySelectorAll('button')), _icons2.default);
      this.buildPickers([].slice.call(toolbar.container.querySelectorAll('select')), _icons2.default);
      this.tooltip = new SnowTooltip(this.quill, this.options.bounds);
      if (toolbar.container.querySelector('.ql-link')) {
        this.quill.keyboard.addBinding({ key: 'K', shortKey: true }, function (range, context) {
          toolbar.handlers['link'].call(toolbar, !context.format.link);
        });
      }
    }
  }]);

  return SnowTheme;
}(_base2.default);

SnowTheme.DEFAULTS = (0, _extend2.default)(true, {}, _base2.default.DEFAULTS, {
  modules: {
    toolbar: {
      handlers: {
        link: function link(value) {
          if (value) {
            var range = this.quill.getSelection();
            if (range == null || range.length == 0) return;
            var preview = this.quill.getText(range);
            if (/^\S+@\S+\.\S+$/.test(preview) && preview.indexOf('mailto:') !== 0) {
              preview = 'mailto:' + preview;
            }
            var tooltip = this.quill.theme.tooltip;
            tooltip.edit('link', preview);
          } else {
            this.quill.format('link', false);
          }
        }
      }
    }
  }
});

var SnowTooltip = function (_BaseTooltip) {
  _inherits(SnowTooltip, _BaseTooltip);

  function SnowTooltip(quill, bounds) {
    _classCallCheck(this, SnowTooltip);

    var _this2 = _possibleConstructorReturn(this, (SnowTooltip.__proto__ || Object.getPrototypeOf(SnowTooltip)).call(this, quill, bounds));

    _this2.preview = _this2.root.querySelector('a.ql-preview');
    return _this2;
  }

  _createClass(SnowTooltip, [{
    key: 'listen',
    value: function listen() {
      var _this3 = this;

      _get(SnowTooltip.prototype.__proto__ || Object.getPrototypeOf(SnowTooltip.prototype), 'listen', this).call(this);
      this.root.querySelector('a.ql-action').addEventListener('click', function (event) {
        if (_this3.root.classList.contains('ql-editing')) {
          _this3.save();
        } else {
          _this3.edit('link', _this3.preview.textContent);
        }
        event.preventDefault();
      });
      this.root.querySelector('a.ql-remove').addEventListener('click', function (event) {
        if (_this3.linkRange != null) {
          var range = _this3.linkRange;
          _this3.restoreFocus();
          _this3.quill.formatText(range, 'link', false, _emitter2.default.sources.USER);
          delete _this3.linkRange;
        }
        event.preventDefault();
        _this3.hide();
      });
      this.quill.on(_emitter2.default.events.SELECTION_CHANGE, function (range, oldRange, source) {
        if (range == null) return;
        if (range.length === 0 && source === _emitter2.default.sources.USER) {
          var _quill$scroll$descend = _this3.quill.scroll.descendant(_link2.default, range.index),
              _quill$scroll$descend2 = _slicedToArray(_quill$scroll$descend, 2),
              link = _quill$scroll$descend2[0],
              offset = _quill$scroll$descend2[1];

          if (link != null) {
            _this3.linkRange = new _selection.Range(range.index - offset, link.length());
            var preview = _link2.default.formats(link.domNode);
            _this3.preview.textContent = preview;
            _this3.preview.setAttribute('href', preview);
            _this3.show();
            _this3.position(_this3.quill.getBounds(_this3.linkRange));
            return;
          }
        } else {
          delete _this3.linkRange;
        }
        _this3.hide();
      });
    }
  }, {
    key: 'show',
    value: function show() {
      _get(SnowTooltip.prototype.__proto__ || Object.getPrototypeOf(SnowTooltip.prototype), 'show', this).call(this);
      this.root.removeAttribute('data-mode');
    }
  }]);

  return SnowTooltip;
}(_base.BaseTooltip);

SnowTooltip.TEMPLATE = ['<a class="ql-preview" rel="noopener noreferrer" target="_blank" href="about:blank"></a>', '<input type="text" data-formula="e=mc^2" data-link="https://quilljs.com" data-video="Embed URL">', '<a class="ql-action"></a>', '<a class="ql-remove"></a>'].join('');

exports.default = SnowTheme;

/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _core = __webpack_require__(29);

var _core2 = _interopRequireDefault(_core);

var _align = __webpack_require__(36);

var _direction = __webpack_require__(38);

var _indent = __webpack_require__(64);

var _blockquote = __webpack_require__(65);

var _blockquote2 = _interopRequireDefault(_blockquote);

var _header = __webpack_require__(66);

var _header2 = _interopRequireDefault(_header);

var _list = __webpack_require__(67);

var _list2 = _interopRequireDefault(_list);

var _background = __webpack_require__(37);

var _color = __webpack_require__(26);

var _font = __webpack_require__(39);

var _size = __webpack_require__(40);

var _bold = __webpack_require__(56);

var _bold2 = _interopRequireDefault(_bold);

var _italic = __webpack_require__(68);

var _italic2 = _interopRequireDefault(_italic);

var _link = __webpack_require__(27);

var _link2 = _interopRequireDefault(_link);

var _script = __webpack_require__(69);

var _script2 = _interopRequireDefault(_script);

var _strike = __webpack_require__(70);

var _strike2 = _interopRequireDefault(_strike);

var _underline = __webpack_require__(71);

var _underline2 = _interopRequireDefault(_underline);

var _image = __webpack_require__(72);

var _image2 = _interopRequireDefault(_image);

var _video = __webpack_require__(73);

var _video2 = _interopRequireDefault(_video);

var _code = __webpack_require__(13);

var _code2 = _interopRequireDefault(_code);

var _formula = __webpack_require__(74);

var _formula2 = _interopRequireDefault(_formula);

var _syntax = __webpack_require__(75);

var _syntax2 = _interopRequireDefault(_syntax);

var _toolbar = __webpack_require__(57);

var _toolbar2 = _interopRequireDefault(_toolbar);

var _icons = __webpack_require__(41);

var _icons2 = _interopRequireDefault(_icons);

var _picker = __webpack_require__(28);

var _picker2 = _interopRequireDefault(_picker);

var _colorPicker = __webpack_require__(59);

var _colorPicker2 = _interopRequireDefault(_colorPicker);

var _iconPicker = __webpack_require__(60);

var _iconPicker2 = _interopRequireDefault(_iconPicker);

var _tooltip = __webpack_require__(61);

var _tooltip2 = _interopRequireDefault(_tooltip);

var _bubble = __webpack_require__(108);

var _bubble2 = _interopRequireDefault(_bubble);

var _snow = __webpack_require__(62);

var _snow2 = _interopRequireDefault(_snow);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_core2.default.register({
  'attributors/attribute/direction': _direction.DirectionAttribute,

  'attributors/class/align': _align.AlignClass,
  'attributors/class/background': _background.BackgroundClass,
  'attributors/class/color': _color.ColorClass,
  'attributors/class/direction': _direction.DirectionClass,
  'attributors/class/font': _font.FontClass,
  'attributors/class/size': _size.SizeClass,

  'attributors/style/align': _align.AlignStyle,
  'attributors/style/background': _background.BackgroundStyle,
  'attributors/style/color': _color.ColorStyle,
  'attributors/style/direction': _direction.DirectionStyle,
  'attributors/style/font': _font.FontStyle,
  'attributors/style/size': _size.SizeStyle
}, true);

_core2.default.register({
  'formats/align': _align.AlignClass,
  'formats/direction': _direction.DirectionClass,
  'formats/indent': _indent.IndentClass,

  'formats/background': _background.BackgroundStyle,
  'formats/color': _color.ColorStyle,
  'formats/font': _font.FontClass,
  'formats/size': _size.SizeClass,

  'formats/blockquote': _blockquote2.default,
  'formats/code-block': _code2.default,
  'formats/header': _header2.default,
  'formats/list': _list2.default,

  'formats/bold': _bold2.default,
  'formats/code': _code.Code,
  'formats/italic': _italic2.default,
  'formats/link': _link2.default,
  'formats/script': _script2.default,
  'formats/strike': _strike2.default,
  'formats/underline': _underline2.default,

  'formats/image': _image2.default,
  'formats/video': _video2.default,

  'formats/list/item': _list.ListItem,

  'modules/formula': _formula2.default,
  'modules/syntax': _syntax2.default,
  'modules/toolbar': _toolbar2.default,

  'themes/bubble': _bubble2.default,
  'themes/snow': _snow2.default,

  'ui/icons': _icons2.default,
  'ui/picker': _picker2.default,
  'ui/icon-picker': _iconPicker2.default,
  'ui/color-picker': _colorPicker2.default,
  'ui/tooltip': _tooltip2.default
}, true);

exports.default = _core2.default;

/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.IndentClass = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _parchment = __webpack_require__(0);

var _parchment2 = _interopRequireDefault(_parchment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var IdentAttributor = function (_Parchment$Attributor) {
  _inherits(IdentAttributor, _Parchment$Attributor);

  function IdentAttributor() {
    _classCallCheck(this, IdentAttributor);

    return _possibleConstructorReturn(this, (IdentAttributor.__proto__ || Object.getPrototypeOf(IdentAttributor)).apply(this, arguments));
  }

  _createClass(IdentAttributor, [{
    key: 'add',
    value: function add(node, value) {
      if (value === '+1' || value === '-1') {
        var indent = this.value(node) || 0;
        value = value === '+1' ? indent + 1 : indent - 1;
      }
      if (value === 0) {
        this.remove(node);
        return true;
      } else {
        return _get(IdentAttributor.prototype.__proto__ || Object.getPrototypeOf(IdentAttributor.prototype), 'add', this).call(this, node, value);
      }
    }
  }, {
    key: 'canAdd',
    value: function canAdd(node, value) {
      return _get(IdentAttributor.prototype.__proto__ || Object.getPrototypeOf(IdentAttributor.prototype), 'canAdd', this).call(this, node, value) || _get(IdentAttributor.prototype.__proto__ || Object.getPrototypeOf(IdentAttributor.prototype), 'canAdd', this).call(this, node, parseInt(value));
    }
  }, {
    key: 'value',
    value: function value(node) {
      return parseInt(_get(IdentAttributor.prototype.__proto__ || Object.getPrototypeOf(IdentAttributor.prototype), 'value', this).call(this, node)) || undefined; // Don't return NaN
    }
  }]);

  return IdentAttributor;
}(_parchment2.default.Attributor.Class);

var IndentClass = new IdentAttributor('indent', 'ql-indent', {
  scope: _parchment2.default.Scope.BLOCK,
  whitelist: [1, 2, 3, 4, 5, 6, 7, 8]
});

exports.IndentClass = IndentClass;

/***/ }),
/* 65 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _block = __webpack_require__(4);

var _block2 = _interopRequireDefault(_block);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Blockquote = function (_Block) {
  _inherits(Blockquote, _Block);

  function Blockquote() {
    _classCallCheck(this, Blockquote);

    return _possibleConstructorReturn(this, (Blockquote.__proto__ || Object.getPrototypeOf(Blockquote)).apply(this, arguments));
  }

  return Blockquote;
}(_block2.default);

Blockquote.blotName = 'blockquote';
Blockquote.tagName = 'blockquote';

exports.default = Blockquote;

/***/ }),
/* 66 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _block = __webpack_require__(4);

var _block2 = _interopRequireDefault(_block);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Header = function (_Block) {
  _inherits(Header, _Block);

  function Header() {
    _classCallCheck(this, Header);

    return _possibleConstructorReturn(this, (Header.__proto__ || Object.getPrototypeOf(Header)).apply(this, arguments));
  }

  _createClass(Header, null, [{
    key: 'formats',
    value: function formats(domNode) {
      return this.tagName.indexOf(domNode.tagName) + 1;
    }
  }]);

  return Header;
}(_block2.default);

Header.blotName = 'header';
Header.tagName = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];

exports.default = Header;

/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.ListItem = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _parchment = __webpack_require__(0);

var _parchment2 = _interopRequireDefault(_parchment);

var _block = __webpack_require__(4);

var _block2 = _interopRequireDefault(_block);

var _container = __webpack_require__(25);

var _container2 = _interopRequireDefault(_container);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ListItem = function (_Block) {
  _inherits(ListItem, _Block);

  function ListItem() {
    _classCallCheck(this, ListItem);

    return _possibleConstructorReturn(this, (ListItem.__proto__ || Object.getPrototypeOf(ListItem)).apply(this, arguments));
  }

  _createClass(ListItem, [{
    key: 'format',
    value: function format(name, value) {
      if (name === List.blotName && !value) {
        this.replaceWith(_parchment2.default.create(this.statics.scope));
      } else {
        _get(ListItem.prototype.__proto__ || Object.getPrototypeOf(ListItem.prototype), 'format', this).call(this, name, value);
      }
    }
  }, {
    key: 'remove',
    value: function remove() {
      if (this.prev == null && this.next == null) {
        this.parent.remove();
      } else {
        _get(ListItem.prototype.__proto__ || Object.getPrototypeOf(ListItem.prototype), 'remove', this).call(this);
      }
    }
  }, {
    key: 'replaceWith',
    value: function replaceWith(name, value) {
      this.parent.isolate(this.offset(this.parent), this.length());
      if (name === this.parent.statics.blotName) {
        this.parent.replaceWith(name, value);
        return this;
      } else {
        this.parent.unwrap();
        return _get(ListItem.prototype.__proto__ || Object.getPrototypeOf(ListItem.prototype), 'replaceWith', this).call(this, name, value);
      }
    }
  }], [{
    key: 'formats',
    value: function formats(domNode) {
      return domNode.tagName === this.tagName ? undefined : _get(ListItem.__proto__ || Object.getPrototypeOf(ListItem), 'formats', this).call(this, domNode);
    }
  }]);

  return ListItem;
}(_block2.default);

ListItem.blotName = 'list-item';
ListItem.tagName = 'LI';

var List = function (_Container) {
  _inherits(List, _Container);

  _createClass(List, null, [{
    key: 'create',
    value: function create(value) {
      var tagName = value === 'ordered' ? 'OL' : 'UL';
      var node = _get(List.__proto__ || Object.getPrototypeOf(List), 'create', this).call(this, tagName);
      if (value === 'checked' || value === 'unchecked') {
        node.setAttribute('data-checked', value === 'checked');
      }
      return node;
    }
  }, {
    key: 'formats',
    value: function formats(domNode) {
      if (domNode.tagName === 'OL') return 'ordered';
      if (domNode.tagName === 'UL') {
        if (domNode.hasAttribute('data-checked')) {
          return domNode.getAttribute('data-checked') === 'true' ? 'checked' : 'unchecked';
        } else {
          return 'bullet';
        }
      }
      return undefined;
    }
  }]);

  function List(domNode) {
    _classCallCheck(this, List);

    var _this2 = _possibleConstructorReturn(this, (List.__proto__ || Object.getPrototypeOf(List)).call(this, domNode));

    var listEventHandler = function listEventHandler(e) {
      if (e.target.parentNode !== domNode) return;
      var format = _this2.statics.formats(domNode);
      var blot = _parchment2.default.find(e.target);
      if (format === 'checked') {
        blot.format('list', 'unchecked');
      } else if (format === 'unchecked') {
        blot.format('list', 'checked');
      }
    };

    domNode.addEventListener('touchstart', listEventHandler);
    domNode.addEventListener('mousedown', listEventHandler);
    return _this2;
  }

  _createClass(List, [{
    key: 'format',
    value: function format(name, value) {
      if (this.children.length > 0) {
        this.children.tail.format(name, value);
      }
    }
  }, {
    key: 'formats',
    value: function formats() {
      // We don't inherit from FormatBlot
      return _defineProperty({}, this.statics.blotName, this.statics.formats(this.domNode));
    }
  }, {
    key: 'insertBefore',
    value: function insertBefore(blot, ref) {
      if (blot instanceof ListItem) {
        _get(List.prototype.__proto__ || Object.getPrototypeOf(List.prototype), 'insertBefore', this).call(this, blot, ref);
      } else {
        var index = ref == null ? this.length() : ref.offset(this);
        var after = this.split(index);
        after.parent.insertBefore(blot, after);
      }
    }
  }, {
    key: 'optimize',
    value: function optimize(context) {
      _get(List.prototype.__proto__ || Object.getPrototypeOf(List.prototype), 'optimize', this).call(this, context);
      var next = this.next;
      if (next != null && next.prev === this && next.statics.blotName === this.statics.blotName && next.domNode.tagName === this.domNode.tagName && next.domNode.getAttribute('data-checked') === this.domNode.getAttribute('data-checked')) {
        next.moveChildren(this);
        next.remove();
      }
    }
  }, {
    key: 'replace',
    value: function replace(target) {
      if (target.statics.blotName !== this.statics.blotName) {
        var item = _parchment2.default.create(this.statics.defaultChild);
        target.moveChildren(item);
        this.appendChild(item);
      }
      _get(List.prototype.__proto__ || Object.getPrototypeOf(List.prototype), 'replace', this).call(this, target);
    }
  }]);

  return List;
}(_container2.default);

List.blotName = 'list';
List.scope = _parchment2.default.Scope.BLOCK_BLOT;
List.tagName = ['OL', 'UL'];
List.defaultChild = 'list-item';
List.allowedChildren = [ListItem];

exports.ListItem = ListItem;
exports.default = List;

/***/ }),
/* 68 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bold = __webpack_require__(56);

var _bold2 = _interopRequireDefault(_bold);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Italic = function (_Bold) {
  _inherits(Italic, _Bold);

  function Italic() {
    _classCallCheck(this, Italic);

    return _possibleConstructorReturn(this, (Italic.__proto__ || Object.getPrototypeOf(Italic)).apply(this, arguments));
  }

  return Italic;
}(_bold2.default);

Italic.blotName = 'italic';
Italic.tagName = ['EM', 'I'];

exports.default = Italic;

/***/ }),
/* 69 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inline = __webpack_require__(6);

var _inline2 = _interopRequireDefault(_inline);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Script = function (_Inline) {
  _inherits(Script, _Inline);

  function Script() {
    _classCallCheck(this, Script);

    return _possibleConstructorReturn(this, (Script.__proto__ || Object.getPrototypeOf(Script)).apply(this, arguments));
  }

  _createClass(Script, null, [{
    key: 'create',
    value: function create(value) {
      if (value === 'super') {
        return document.createElement('sup');
      } else if (value === 'sub') {
        return document.createElement('sub');
      } else {
        return _get(Script.__proto__ || Object.getPrototypeOf(Script), 'create', this).call(this, value);
      }
    }
  }, {
    key: 'formats',
    value: function formats(domNode) {
      if (domNode.tagName === 'SUB') return 'sub';
      if (domNode.tagName === 'SUP') return 'super';
      return undefined;
    }
  }]);

  return Script;
}(_inline2.default);

Script.blotName = 'script';
Script.tagName = ['SUB', 'SUP'];

exports.default = Script;

/***/ }),
/* 70 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _inline = __webpack_require__(6);

var _inline2 = _interopRequireDefault(_inline);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Strike = function (_Inline) {
  _inherits(Strike, _Inline);

  function Strike() {
    _classCallCheck(this, Strike);

    return _possibleConstructorReturn(this, (Strike.__proto__ || Object.getPrototypeOf(Strike)).apply(this, arguments));
  }

  return Strike;
}(_inline2.default);

Strike.blotName = 'strike';
Strike.tagName = 'S';

exports.default = Strike;

/***/ }),
/* 71 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _inline = __webpack_require__(6);

var _inline2 = _interopRequireDefault(_inline);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Underline = function (_Inline) {
  _inherits(Underline, _Inline);

  function Underline() {
    _classCallCheck(this, Underline);

    return _possibleConstructorReturn(this, (Underline.__proto__ || Object.getPrototypeOf(Underline)).apply(this, arguments));
  }

  return Underline;
}(_inline2.default);

Underline.blotName = 'underline';
Underline.tagName = 'U';

exports.default = Underline;

/***/ }),
/* 72 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _parchment = __webpack_require__(0);

var _parchment2 = _interopRequireDefault(_parchment);

var _link = __webpack_require__(27);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ATTRIBUTES = ['alt', 'height', 'width'];

var Image = function (_Parchment$Embed) {
  _inherits(Image, _Parchment$Embed);

  function Image() {
    _classCallCheck(this, Image);

    return _possibleConstructorReturn(this, (Image.__proto__ || Object.getPrototypeOf(Image)).apply(this, arguments));
  }

  _createClass(Image, [{
    key: 'format',
    value: function format(name, value) {
      if (ATTRIBUTES.indexOf(name) > -1) {
        if (value) {
          this.domNode.setAttribute(name, value);
        } else {
          this.domNode.removeAttribute(name);
        }
      } else {
        _get(Image.prototype.__proto__ || Object.getPrototypeOf(Image.prototype), 'format', this).call(this, name, value);
      }
    }
  }], [{
    key: 'create',
    value: function create(value) {
      var node = _get(Image.__proto__ || Object.getPrototypeOf(Image), 'create', this).call(this, value);
      if (typeof value === 'string') {
        node.setAttribute('src', this.sanitize(value));
      }
      return node;
    }
  }, {
    key: 'formats',
    value: function formats(domNode) {
      return ATTRIBUTES.reduce(function (formats, attribute) {
        if (domNode.hasAttribute(attribute)) {
          formats[attribute] = domNode.getAttribute(attribute);
        }
        return formats;
      }, {});
    }
  }, {
    key: 'match',
    value: function match(url) {
      return (/\.(jpe?g|gif|png)$/.test(url) || /^data:image\/.+;base64/.test(url)
      );
    }
  }, {
    key: 'sanitize',
    value: function sanitize(url) {
      return (0, _link.sanitize)(url, ['http', 'https', 'data']) ? url : '//:0';
    }
  }, {
    key: 'value',
    value: function value(domNode) {
      return domNode.getAttribute('src');
    }
  }]);

  return Image;
}(_parchment2.default.Embed);

Image.blotName = 'image';
Image.tagName = 'IMG';

exports.default = Image;

/***/ }),
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _block = __webpack_require__(4);

var _link = __webpack_require__(27);

var _link2 = _interopRequireDefault(_link);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ATTRIBUTES = ['height', 'width'];

var Video = function (_BlockEmbed) {
  _inherits(Video, _BlockEmbed);

  function Video() {
    _classCallCheck(this, Video);

    return _possibleConstructorReturn(this, (Video.__proto__ || Object.getPrototypeOf(Video)).apply(this, arguments));
  }

  _createClass(Video, [{
    key: 'format',
    value: function format(name, value) {
      if (ATTRIBUTES.indexOf(name) > -1) {
        if (value) {
          this.domNode.setAttribute(name, value);
        } else {
          this.domNode.removeAttribute(name);
        }
      } else {
        _get(Video.prototype.__proto__ || Object.getPrototypeOf(Video.prototype), 'format', this).call(this, name, value);
      }
    }
  }], [{
    key: 'create',
    value: function create(value) {
      var node = _get(Video.__proto__ || Object.getPrototypeOf(Video), 'create', this).call(this, value);
      node.setAttribute('frameborder', '0');
      node.setAttribute('allowfullscreen', true);
      node.setAttribute('src', this.sanitize(value));
      return node;
    }
  }, {
    key: 'formats',
    value: function formats(domNode) {
      return ATTRIBUTES.reduce(function (formats, attribute) {
        if (domNode.hasAttribute(attribute)) {
          formats[attribute] = domNode.getAttribute(attribute);
        }
        return formats;
      }, {});
    }
  }, {
    key: 'sanitize',
    value: function sanitize(url) {
      return _link2.default.sanitize(url);
    }
  }, {
    key: 'value',
    value: function value(domNode) {
      return domNode.getAttribute('src');
    }
  }]);

  return Video;
}(_block.BlockEmbed);

Video.blotName = 'video';
Video.className = 'ql-video';
Video.tagName = 'IFRAME';

exports.default = Video;

/***/ }),
/* 74 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.FormulaBlot = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _embed = __webpack_require__(35);

var _embed2 = _interopRequireDefault(_embed);

var _quill = __webpack_require__(5);

var _quill2 = _interopRequireDefault(_quill);

var _module = __webpack_require__(9);

var _module2 = _interopRequireDefault(_module);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var FormulaBlot = function (_Embed) {
  _inherits(FormulaBlot, _Embed);

  function FormulaBlot() {
    _classCallCheck(this, FormulaBlot);

    return _possibleConstructorReturn(this, (FormulaBlot.__proto__ || Object.getPrototypeOf(FormulaBlot)).apply(this, arguments));
  }

  _createClass(FormulaBlot, null, [{
    key: 'create',
    value: function create(value) {
      var node = _get(FormulaBlot.__proto__ || Object.getPrototypeOf(FormulaBlot), 'create', this).call(this, value);
      if (typeof value === 'string') {
        window.katex.render(value, node, {
          throwOnError: false,
          errorColor: '#f00'
        });
        node.setAttribute('data-value', value);
      }
      return node;
    }
  }, {
    key: 'value',
    value: function value(domNode) {
      return domNode.getAttribute('data-value');
    }
  }]);

  return FormulaBlot;
}(_embed2.default);

FormulaBlot.blotName = 'formula';
FormulaBlot.className = 'ql-formula';
FormulaBlot.tagName = 'SPAN';

var Formula = function (_Module) {
  _inherits(Formula, _Module);

  _createClass(Formula, null, [{
    key: 'register',
    value: function register() {
      _quill2.default.register(FormulaBlot, true);
    }
  }]);

  function Formula() {
    _classCallCheck(this, Formula);

    var _this2 = _possibleConstructorReturn(this, (Formula.__proto__ || Object.getPrototypeOf(Formula)).call(this));

    if (window.katex == null) {
      throw new Error('Formula module requires KaTeX.');
    }
    return _this2;
  }

  return Formula;
}(_module2.default);

exports.FormulaBlot = FormulaBlot;
exports.default = Formula;

/***/ }),
/* 75 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.CodeToken = exports.CodeBlock = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _parchment = __webpack_require__(0);

var _parchment2 = _interopRequireDefault(_parchment);

var _quill = __webpack_require__(5);

var _quill2 = _interopRequireDefault(_quill);

var _module = __webpack_require__(9);

var _module2 = _interopRequireDefault(_module);

var _code = __webpack_require__(13);

var _code2 = _interopRequireDefault(_code);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SyntaxCodeBlock = function (_CodeBlock) {
  _inherits(SyntaxCodeBlock, _CodeBlock);

  function SyntaxCodeBlock() {
    _classCallCheck(this, SyntaxCodeBlock);

    return _possibleConstructorReturn(this, (SyntaxCodeBlock.__proto__ || Object.getPrototypeOf(SyntaxCodeBlock)).apply(this, arguments));
  }

  _createClass(SyntaxCodeBlock, [{
    key: 'replaceWith',
    value: function replaceWith(block) {
      this.domNode.textContent = this.domNode.textContent;
      this.attach();
      _get(SyntaxCodeBlock.prototype.__proto__ || Object.getPrototypeOf(SyntaxCodeBlock.prototype), 'replaceWith', this).call(this, block);
    }
  }, {
    key: 'highlight',
    value: function highlight(_highlight) {
      var text = this.domNode.textContent;
      if (this.cachedText !== text) {
        if (text.trim().length > 0 || this.cachedText == null) {
          this.domNode.innerHTML = _highlight(text);
          this.domNode.normalize();
          this.attach();
        }
        this.cachedText = text;
      }
    }
  }]);

  return SyntaxCodeBlock;
}(_code2.default);

SyntaxCodeBlock.className = 'ql-syntax';

var CodeToken = new _parchment2.default.Attributor.Class('token', 'hljs', {
  scope: _parchment2.default.Scope.INLINE
});

var Syntax = function (_Module) {
  _inherits(Syntax, _Module);

  _createClass(Syntax, null, [{
    key: 'register',
    value: function register() {
      _quill2.default.register(CodeToken, true);
      _quill2.default.register(SyntaxCodeBlock, true);
    }
  }]);

  function Syntax(quill, options) {
    _classCallCheck(this, Syntax);

    var _this2 = _possibleConstructorReturn(this, (Syntax.__proto__ || Object.getPrototypeOf(Syntax)).call(this, quill, options));

    if (typeof _this2.options.highlight !== 'function') {
      throw new Error('Syntax module requires highlight.js. Please include the library on the page before Quill.');
    }
    var timer = null;
    _this2.quill.on(_quill2.default.events.SCROLL_OPTIMIZE, function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        _this2.highlight();
        timer = null;
      }, _this2.options.interval);
    });
    _this2.highlight();
    return _this2;
  }

  _createClass(Syntax, [{
    key: 'highlight',
    value: function highlight() {
      var _this3 = this;

      if (this.quill.selection.composing) return;
      this.quill.update(_quill2.default.sources.USER);
      var range = this.quill.getSelection();
      this.quill.scroll.descendants(SyntaxCodeBlock).forEach(function (code) {
        code.highlight(_this3.options.highlight);
      });
      this.quill.update(_quill2.default.sources.SILENT);
      if (range != null) {
        this.quill.setSelection(range, _quill2.default.sources.SILENT);
      }
    }
  }]);

  return Syntax;
}(_module2.default);

Syntax.DEFAULTS = {
  highlight: function () {
    if (window.hljs == null) return null;
    return function (text) {
      var result = window.hljs.highlightAuto(text);
      return result.value;
    };
  }(),
  interval: 1000
};

exports.CodeBlock = SyntaxCodeBlock;
exports.CodeToken = CodeToken;
exports.default = Syntax;

/***/ }),
/* 76 */
/***/ (function(module, exports) {

module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=3 x2=15 y1=9 y2=9></line> <line class=ql-stroke x1=3 x2=13 y1=14 y2=14></line> <line class=ql-stroke x1=3 x2=9 y1=4 y2=4></line> </svg>";

/***/ }),
/* 77 */
/***/ (function(module, exports) {

module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=15 x2=3 y1=9 y2=9></line> <line class=ql-stroke x1=14 x2=4 y1=14 y2=14></line> <line class=ql-stroke x1=12 x2=6 y1=4 y2=4></line> </svg>";

/***/ }),
/* 78 */
/***/ (function(module, exports) {

module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=15 x2=3 y1=9 y2=9></line> <line class=ql-stroke x1=15 x2=5 y1=14 y2=14></line> <line class=ql-stroke x1=15 x2=9 y1=4 y2=4></line> </svg>";

/***/ }),
/* 79 */
/***/ (function(module, exports) {

module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=15 x2=3 y1=9 y2=9></line> <line class=ql-stroke x1=15 x2=3 y1=14 y2=14></line> <line class=ql-stroke x1=15 x2=3 y1=4 y2=4></line> </svg>";

/***/ }),
/* 80 */
/***/ (function(module, exports) {

module.exports = "<svg viewbox=\"0 0 18 18\"> <g class=\"ql-fill ql-color-label\"> <polygon points=\"6 6.868 6 6 5 6 5 7 5.942 7 6 6.868\"></polygon> <rect height=1 width=1 x=4 y=4></rect> <polygon points=\"6.817 5 6 5 6 6 6.38 6 6.817 5\"></polygon> <rect height=1 width=1 x=2 y=6></rect> <rect height=1 width=1 x=3 y=5></rect> <rect height=1 width=1 x=4 y=7></rect> <polygon points=\"4 11.439 4 11 3 11 3 12 3.755 12 4 11.439\"></polygon> <rect height=1 width=1 x=2 y=12></rect> <rect height=1 width=1 x=2 y=9></rect> <rect height=1 width=1 x=2 y=15></rect> <polygon points=\"4.63 10 4 10 4 11 4.192 11 4.63 10\"></polygon> <rect height=1 width=1 x=3 y=8></rect> <path d=M10.832,4.2L11,4.582V4H10.708A1.948,1.948,0,0,1,10.832,4.2Z></path> <path d=M7,4.582L7.168,4.2A1.929,1.929,0,0,1,7.292,4H7V4.582Z></path> <path d=M8,13H7.683l-0.351.8a1.933,1.933,0,0,1-.124.2H8V13Z></path> <rect height=1 width=1 x=12 y=2></rect> <rect height=1 width=1 x=11 y=3></rect> <path d=M9,3H8V3.282A1.985,1.985,0,0,1,9,3Z></path> <rect height=1 width=1 x=2 y=3></rect> <rect height=1 width=1 x=6 y=2></rect> <rect height=1 width=1 x=3 y=2></rect> <rect height=1 width=1 x=5 y=3></rect> <rect height=1 width=1 x=9 y=2></rect> <rect height=1 width=1 x=15 y=14></rect> <polygon points=\"13.447 10.174 13.469 10.225 13.472 10.232 13.808 11 14 11 14 10 13.37 10 13.447 10.174\"></polygon> <rect height=1 width=1 x=13 y=7></rect> <rect height=1 width=1 x=15 y=5></rect> <rect height=1 width=1 x=14 y=6></rect> <rect height=1 width=1 x=15 y=8></rect> <rect height=1 width=1 x=14 y=9></rect> <path d=M3.775,14H3v1H4V14.314A1.97,1.97,0,0,1,3.775,14Z></path> <rect height=1 width=1 x=14 y=3></rect> <polygon points=\"12 6.868 12 6 11.62 6 12 6.868\"></polygon> <rect height=1 width=1 x=15 y=2></rect> <rect height=1 width=1 x=12 y=5></rect> <rect height=1 width=1 x=13 y=4></rect> <polygon points=\"12.933 9 13 9 13 8 12.495 8 12.933 9\"></polygon> <rect height=1 width=1 x=9 y=14></rect> <rect height=1 width=1 x=8 y=15></rect> <path d=M6,14.926V15H7V14.316A1.993,1.993,0,0,1,6,14.926Z></path> <rect height=1 width=1 x=5 y=15></rect> <path d=M10.668,13.8L10.317,13H10v1h0.792A1.947,1.947,0,0,1,10.668,13.8Z></path> <rect height=1 width=1 x=11 y=15></rect> <path d=M14.332,12.2a1.99,1.99,0,0,1,.166.8H15V12H14.245Z></path> <rect height=1 width=1 x=14 y=15></rect> <rect height=1 width=1 x=15 y=11></rect> </g> <polyline class=ql-stroke points=\"5.5 13 9 5 12.5 13\"></polyline> <line class=ql-stroke x1=11.63 x2=6.38 y1=11 y2=11></line> </svg>";

/***/ }),
/* 81 */
/***/ (function(module, exports) {

module.exports = "<svg viewbox=\"0 0 18 18\"> <rect class=\"ql-fill ql-stroke\" height=3 width=3 x=4 y=5></rect> <rect class=\"ql-fill ql-stroke\" height=3 width=3 x=11 y=5></rect> <path class=\"ql-even ql-fill ql-stroke\" d=M7,8c0,4.031-3,5-3,5></path> <path class=\"ql-even ql-fill ql-stroke\" d=M14,8c0,4.031-3,5-3,5></path> </svg>";

/***/ }),
/* 82 */
/***/ (function(module, exports) {

module.exports = "<svg viewbox=\"0 0 18 18\"> <path class=ql-stroke d=M5,4H9.5A2.5,2.5,0,0,1,12,6.5v0A2.5,2.5,0,0,1,9.5,9H5A0,0,0,0,1,5,9V4A0,0,0,0,1,5,4Z></path> <path class=ql-stroke d=M5,9h5.5A2.5,2.5,0,0,1,13,11.5v0A2.5,2.5,0,0,1,10.5,14H5a0,0,0,0,1,0,0V9A0,0,0,0,1,5,9Z></path> </svg>";

/***/ }),
/* 83 */
/***/ (function(module, exports) {

module.exports = "<svg class=\"\" viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=5 x2=13 y1=3 y2=3></line> <line class=ql-stroke x1=6 x2=9.35 y1=12 y2=3></line> <line class=ql-stroke x1=11 x2=15 y1=11 y2=15></line> <line class=ql-stroke x1=15 x2=11 y1=11 y2=15></line> <rect class=ql-fill height=1 rx=0.5 ry=0.5 width=7 x=2 y=14></rect> </svg>";

/***/ }),
/* 84 */
/***/ (function(module, exports) {

module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=\"ql-color-label ql-stroke ql-transparent\" x1=3 x2=15 y1=15 y2=15></line> <polyline class=ql-stroke points=\"5.5 11 9 3 12.5 11\"></polyline> <line class=ql-stroke x1=11.63 x2=6.38 y1=9 y2=9></line> </svg>";

/***/ }),
/* 85 */
/***/ (function(module, exports) {

module.exports = "<svg viewbox=\"0 0 18 18\"> <polygon class=\"ql-stroke ql-fill\" points=\"3 11 5 9 3 7 3 11\"></polygon> <line class=\"ql-stroke ql-fill\" x1=15 x2=11 y1=4 y2=4></line> <path class=ql-fill d=M11,3a3,3,0,0,0,0,6h1V3H11Z></path> <rect class=ql-fill height=11 width=1 x=11 y=4></rect> <rect class=ql-fill height=11 width=1 x=13 y=4></rect> </svg>";

/***/ }),
/* 86 */
/***/ (function(module, exports) {

module.exports = "<svg viewbox=\"0 0 18 18\"> <polygon class=\"ql-stroke ql-fill\" points=\"15 12 13 10 15 8 15 12\"></polygon> <line class=\"ql-stroke ql-fill\" x1=9 x2=5 y1=4 y2=4></line> <path class=ql-fill d=M5,3A3,3,0,0,0,5,9H6V3H5Z></path> <rect class=ql-fill height=11 width=1 x=5 y=4></rect> <rect class=ql-fill height=11 width=1 x=7 y=4></rect> </svg>";

/***/ }),
/* 87 */
/***/ (function(module, exports) {

module.exports = "<svg viewbox=\"0 0 18 18\"> <path class=ql-fill d=M14,16H4a1,1,0,0,1,0-2H14A1,1,0,0,1,14,16Z /> <path class=ql-fill d=M14,4H4A1,1,0,0,1,4,2H14A1,1,0,0,1,14,4Z /> <rect class=ql-fill x=3 y=6 width=12 height=6 rx=1 ry=1 /> </svg>";

/***/ }),
/* 88 */
/***/ (function(module, exports) {

module.exports = "<svg viewbox=\"0 0 18 18\"> <path class=ql-fill d=M13,16H5a1,1,0,0,1,0-2h8A1,1,0,0,1,13,16Z /> <path class=ql-fill d=M13,4H5A1,1,0,0,1,5,2h8A1,1,0,0,1,13,4Z /> <rect class=ql-fill x=2 y=6 width=14 height=6 rx=1 ry=1 /> </svg>";

/***/ }),
/* 89 */
/***/ (function(module, exports) {

module.exports = "<svg viewbox=\"0 0 18 18\"> <path class=ql-fill d=M15,8H13a1,1,0,0,1,0-2h2A1,1,0,0,1,15,8Z /> <path class=ql-fill d=M15,12H13a1,1,0,0,1,0-2h2A1,1,0,0,1,15,12Z /> <path class=ql-fill d=M15,16H5a1,1,0,0,1,0-2H15A1,1,0,0,1,15,16Z /> <path class=ql-fill d=M15,4H5A1,1,0,0,1,5,2H15A1,1,0,0,1,15,4Z /> <rect class=ql-fill x=2 y=6 width=8 height=6 rx=1 ry=1 /> </svg>";

/***/ }),
/* 90 */
/***/ (function(module, exports) {

module.exports = "<svg viewbox=\"0 0 18 18\"> <path class=ql-fill d=M5,8H3A1,1,0,0,1,3,6H5A1,1,0,0,1,5,8Z /> <path class=ql-fill d=M5,12H3a1,1,0,0,1,0-2H5A1,1,0,0,1,5,12Z /> <path class=ql-fill d=M13,16H3a1,1,0,0,1,0-2H13A1,1,0,0,1,13,16Z /> <path class=ql-fill d=M13,4H3A1,1,0,0,1,3,2H13A1,1,0,0,1,13,4Z /> <rect class=ql-fill x=8 y=6 width=8 height=6 rx=1 ry=1 transform=\"translate(24 18) rotate(-180)\"/> </svg>";

/***/ }),
/* 91 */
/***/ (function(module, exports) {

module.exports = "<svg viewbox=\"0 0 18 18\"> <path class=ql-fill d=M11.759,2.482a2.561,2.561,0,0,0-3.53.607A7.656,7.656,0,0,0,6.8,6.2C6.109,9.188,5.275,14.677,4.15,14.927a1.545,1.545,0,0,0-1.3-.933A0.922,0.922,0,0,0,2,15.036S1.954,16,4.119,16s3.091-2.691,3.7-5.553c0.177-.826.36-1.726,0.554-2.6L8.775,6.2c0.381-1.421.807-2.521,1.306-2.676a1.014,1.014,0,0,0,1.02.56A0.966,0.966,0,0,0,11.759,2.482Z></path> <rect class=ql-fill height=1.6 rx=0.8 ry=0.8 width=5 x=5.15 y=6.2></rect> <path class=ql-fill d=M13.663,12.027a1.662,1.662,0,0,1,.266-0.276q0.193,0.069.456,0.138a2.1,2.1,0,0,0,.535.069,1.075,1.075,0,0,0,.767-0.3,1.044,1.044,0,0,0,.314-0.8,0.84,0.84,0,0,0-.238-0.619,0.8,0.8,0,0,0-.594-0.239,1.154,1.154,0,0,0-.781.3,4.607,4.607,0,0,0-.781,1q-0.091.15-.218,0.346l-0.246.38c-0.068-.288-0.137-0.582-0.212-0.885-0.459-1.847-2.494-.984-2.941-0.8-0.482.2-.353,0.647-0.094,0.529a0.869,0.869,0,0,1,1.281.585c0.217,0.751.377,1.436,0.527,2.038a5.688,5.688,0,0,1-.362.467,2.69,2.69,0,0,1-.264.271q-0.221-.08-0.471-0.147a2.029,2.029,0,0,0-.522-0.066,1.079,1.079,0,0,0-.768.3A1.058,1.058,0,0,0,9,15.131a0.82,0.82,0,0,0,.832.852,1.134,1.134,0,0,0,.787-0.3,5.11,5.11,0,0,0,.776-0.993q0.141-.219.215-0.34c0.046-.076.122-0.194,0.223-0.346a2.786,2.786,0,0,0,.918,1.726,2.582,2.582,0,0,0,2.376-.185c0.317-.181.212-0.565,0-0.494A0.807,0.807,0,0,1,14.176,15a5.159,5.159,0,0,1-.913-2.446l0,0Q13.487,12.24,13.663,12.027Z></path> </svg>";

/***/ }),
/* 92 */
/***/ (function(module, exports) {

module.exports = "<svg viewBox=\"0 0 18 18\"> <path class=ql-fill d=M10,4V14a1,1,0,0,1-2,0V10H3v4a1,1,0,0,1-2,0V4A1,1,0,0,1,3,4V8H8V4a1,1,0,0,1,2,0Zm6.06787,9.209H14.98975V7.59863a.54085.54085,0,0,0-.605-.60547h-.62744a1.01119,1.01119,0,0,0-.748.29688L11.645,8.56641a.5435.5435,0,0,0-.022.8584l.28613.30762a.53861.53861,0,0,0,.84717.0332l.09912-.08789a1.2137,1.2137,0,0,0,.2417-.35254h.02246s-.01123.30859-.01123.60547V13.209H12.041a.54085.54085,0,0,0-.605.60547v.43945a.54085.54085,0,0,0,.605.60547h4.02686a.54085.54085,0,0,0,.605-.60547v-.43945A.54085.54085,0,0,0,16.06787,13.209Z /> </svg>";

/***/ }),
/* 93 */
/***/ (function(module, exports) {

module.exports = "<svg viewBox=\"0 0 18 18\"> <path class=ql-fill d=M16.73975,13.81445v.43945a.54085.54085,0,0,1-.605.60547H11.855a.58392.58392,0,0,1-.64893-.60547V14.0127c0-2.90527,3.39941-3.42187,3.39941-4.55469a.77675.77675,0,0,0-.84717-.78125,1.17684,1.17684,0,0,0-.83594.38477c-.2749.26367-.561.374-.85791.13184l-.4292-.34082c-.30811-.24219-.38525-.51758-.1543-.81445a2.97155,2.97155,0,0,1,2.45361-1.17676,2.45393,2.45393,0,0,1,2.68408,2.40918c0,2.45312-3.1792,2.92676-3.27832,3.93848h2.79443A.54085.54085,0,0,1,16.73975,13.81445ZM9,3A.99974.99974,0,0,0,8,4V8H3V4A1,1,0,0,0,1,4V14a1,1,0,0,0,2,0V10H8v4a1,1,0,0,0,2,0V4A.99974.99974,0,0,0,9,3Z /> </svg>";

/***/ }),
/* 94 */
/***/ (function(module, exports) {

module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=7 x2=13 y1=4 y2=4></line> <line class=ql-stroke x1=5 x2=11 y1=14 y2=14></line> <line class=ql-stroke x1=8 x2=10 y1=14 y2=4></line> </svg>";

/***/ }),
/* 95 */
/***/ (function(module, exports) {

module.exports = "<svg viewbox=\"0 0 18 18\"> <rect class=ql-stroke height=10 width=12 x=3 y=4></rect> <circle class=ql-fill cx=6 cy=7 r=1></circle> <polyline class=\"ql-even ql-fill\" points=\"5 12 5 11 7 9 8 10 11 7 13 9 13 12 5 12\"></polyline> </svg>";

/***/ }),
/* 96 */
/***/ (function(module, exports) {

module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=3 x2=15 y1=14 y2=14></line> <line class=ql-stroke x1=3 x2=15 y1=4 y2=4></line> <line class=ql-stroke x1=9 x2=15 y1=9 y2=9></line> <polyline class=\"ql-fill ql-stroke\" points=\"3 7 3 11 5 9 3 7\"></polyline> </svg>";

/***/ }),
/* 97 */
/***/ (function(module, exports) {

module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=3 x2=15 y1=14 y2=14></line> <line class=ql-stroke x1=3 x2=15 y1=4 y2=4></line> <line class=ql-stroke x1=9 x2=15 y1=9 y2=9></line> <polyline class=ql-stroke points=\"5 7 5 11 3 9 5 7\"></polyline> </svg>";

/***/ }),
/* 98 */
/***/ (function(module, exports) {

module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=7 x2=11 y1=7 y2=11></line> <path class=\"ql-even ql-stroke\" d=M8.9,4.577a3.476,3.476,0,0,1,.36,4.679A3.476,3.476,0,0,1,4.577,8.9C3.185,7.5,2.035,6.4,4.217,4.217S7.5,3.185,8.9,4.577Z></path> <path class=\"ql-even ql-stroke\" d=M13.423,9.1a3.476,3.476,0,0,0-4.679-.36,3.476,3.476,0,0,0,.36,4.679c1.392,1.392,2.5,2.542,4.679.36S14.815,10.5,13.423,9.1Z></path> </svg>";

/***/ }),
/* 99 */
/***/ (function(module, exports) {

module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=7 x2=15 y1=4 y2=4></line> <line class=ql-stroke x1=7 x2=15 y1=9 y2=9></line> <line class=ql-stroke x1=7 x2=15 y1=14 y2=14></line> <line class=\"ql-stroke ql-thin\" x1=2.5 x2=4.5 y1=5.5 y2=5.5></line> <path class=ql-fill d=M3.5,6A0.5,0.5,0,0,1,3,5.5V3.085l-0.276.138A0.5,0.5,0,0,1,2.053,3c-0.124-.247-0.023-0.324.224-0.447l1-.5A0.5,0.5,0,0,1,4,2.5v3A0.5,0.5,0,0,1,3.5,6Z></path> <path class=\"ql-stroke ql-thin\" d=M4.5,10.5h-2c0-.234,1.85-1.076,1.85-2.234A0.959,0.959,0,0,0,2.5,8.156></path> <path class=\"ql-stroke ql-thin\" d=M2.5,14.846a0.959,0.959,0,0,0,1.85-.109A0.7,0.7,0,0,0,3.75,14a0.688,0.688,0,0,0,.6-0.736,0.959,0.959,0,0,0-1.85-.109></path> </svg>";

/***/ }),
/* 100 */
/***/ (function(module, exports) {

module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=6 x2=15 y1=4 y2=4></line> <line class=ql-stroke x1=6 x2=15 y1=9 y2=9></line> <line class=ql-stroke x1=6 x2=15 y1=14 y2=14></line> <line class=ql-stroke x1=3 x2=3 y1=4 y2=4></line> <line class=ql-stroke x1=3 x2=3 y1=9 y2=9></line> <line class=ql-stroke x1=3 x2=3 y1=14 y2=14></line> </svg>";

/***/ }),
/* 101 */
/***/ (function(module, exports) {

module.exports = "<svg class=\"\" viewbox=\"0 0 18 18\"> <line class=ql-stroke x1=9 x2=15 y1=4 y2=4></line> <polyline class=ql-stroke points=\"3 4 4 5 6 3\"></polyline> <line class=ql-stroke x1=9 x2=15 y1=14 y2=14></line> <polyline class=ql-stroke points=\"3 14 4 15 6 13\"></polyline> <line class=ql-stroke x1=9 x2=15 y1=9 y2=9></line> <polyline class=ql-stroke points=\"3 9 4 10 6 8\"></polyline> </svg>";

/***/ }),
/* 102 */
/***/ (function(module, exports) {

module.exports = "<svg viewbox=\"0 0 18 18\"> <path class=ql-fill d=M15.5,15H13.861a3.858,3.858,0,0,0,1.914-2.975,1.8,1.8,0,0,0-1.6-1.751A1.921,1.921,0,0,0,12.021,11.7a0.50013,0.50013,0,1,0,.957.291h0a0.914,0.914,0,0,1,1.053-.725,0.81,0.81,0,0,1,.744.762c0,1.076-1.16971,1.86982-1.93971,2.43082A1.45639,1.45639,0,0,0,12,15.5a0.5,0.5,0,0,0,.5.5h3A0.5,0.5,0,0,0,15.5,15Z /> <path class=ql-fill d=M9.65,5.241a1,1,0,0,0-1.409.108L6,7.964,3.759,5.349A1,1,0,0,0,2.192,6.59178Q2.21541,6.6213,2.241,6.649L4.684,9.5,2.241,12.35A1,1,0,0,0,3.71,13.70722q0.02557-.02768.049-0.05722L6,11.036,8.241,13.65a1,1,0,1,0,1.567-1.24277Q9.78459,12.3777,9.759,12.35L7.316,9.5,9.759,6.651A1,1,0,0,0,9.65,5.241Z /> </svg>";

/***/ }),
/* 103 */
/***/ (function(module, exports) {

module.exports = "<svg viewbox=\"0 0 18 18\"> <path class=ql-fill d=M15.5,7H13.861a4.015,4.015,0,0,0,1.914-2.975,1.8,1.8,0,0,0-1.6-1.751A1.922,1.922,0,0,0,12.021,3.7a0.5,0.5,0,1,0,.957.291,0.917,0.917,0,0,1,1.053-.725,0.81,0.81,0,0,1,.744.762c0,1.077-1.164,1.925-1.934,2.486A1.423,1.423,0,0,0,12,7.5a0.5,0.5,0,0,0,.5.5h3A0.5,0.5,0,0,0,15.5,7Z /> <path class=ql-fill d=M9.651,5.241a1,1,0,0,0-1.41.108L6,7.964,3.759,5.349a1,1,0,1,0-1.519,1.3L4.683,9.5,2.241,12.35a1,1,0,1,0,1.519,1.3L6,11.036,8.241,13.65a1,1,0,0,0,1.519-1.3L7.317,9.5,9.759,6.651A1,1,0,0,0,9.651,5.241Z /> </svg>";

/***/ }),
/* 104 */
/***/ (function(module, exports) {

module.exports = "<svg viewbox=\"0 0 18 18\"> <line class=\"ql-stroke ql-thin\" x1=15.5 x2=2.5 y1=8.5 y2=9.5></line> <path class=ql-fill d=M9.007,8C6.542,7.791,6,7.519,6,6.5,6,5.792,7.283,5,9,5c1.571,0,2.765.679,2.969,1.309a1,1,0,0,0,1.9-.617C13.356,4.106,11.354,3,9,3,6.2,3,4,4.538,4,6.5a3.2,3.2,0,0,0,.5,1.843Z></path> <path class=ql-fill d=M8.984,10C11.457,10.208,12,10.479,12,11.5c0,0.708-1.283,1.5-3,1.5-1.571,0-2.765-.679-2.969-1.309a1,1,0,1,0-1.9.617C4.644,13.894,6.646,15,9,15c2.8,0,5-1.538,5-3.5a3.2,3.2,0,0,0-.5-1.843Z></path> </svg>";

/***/ }),
/* 105 */
/***/ (function(module, exports) {

module.exports = "<svg viewbox=\"0 0 18 18\"> <path class=ql-stroke d=M5,3V9a4.012,4.012,0,0,0,4,4H9a4.012,4.012,0,0,0,4-4V3></path> <rect class=ql-fill height=1 rx=0.5 ry=0.5 width=12 x=3 y=15></rect> </svg>";

/***/ }),
/* 106 */
/***/ (function(module, exports) {

module.exports = "<svg viewbox=\"0 0 18 18\"> <rect class=ql-stroke height=12 width=12 x=3 y=3></rect> <rect class=ql-fill height=12 width=1 x=5 y=3></rect> <rect class=ql-fill height=12 width=1 x=12 y=3></rect> <rect class=ql-fill height=2 width=8 x=5 y=8></rect> <rect class=ql-fill height=1 width=3 x=3 y=5></rect> <rect class=ql-fill height=1 width=3 x=3 y=7></rect> <rect class=ql-fill height=1 width=3 x=3 y=10></rect> <rect class=ql-fill height=1 width=3 x=3 y=12></rect> <rect class=ql-fill height=1 width=3 x=12 y=5></rect> <rect class=ql-fill height=1 width=3 x=12 y=7></rect> <rect class=ql-fill height=1 width=3 x=12 y=10></rect> <rect class=ql-fill height=1 width=3 x=12 y=12></rect> </svg>";

/***/ }),
/* 107 */
/***/ (function(module, exports) {

module.exports = "<svg viewbox=\"0 0 18 18\"> <polygon class=ql-stroke points=\"7 11 9 13 11 11 7 11\"></polygon> <polygon class=ql-stroke points=\"7 7 9 5 11 7 7 7\"></polygon> </svg>";

/***/ }),
/* 108 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.BubbleTooltip = undefined;

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _extend = __webpack_require__(3);

var _extend2 = _interopRequireDefault(_extend);

var _emitter = __webpack_require__(8);

var _emitter2 = _interopRequireDefault(_emitter);

var _base = __webpack_require__(43);

var _base2 = _interopRequireDefault(_base);

var _selection = __webpack_require__(15);

var _icons = __webpack_require__(41);

var _icons2 = _interopRequireDefault(_icons);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TOOLBAR_CONFIG = [['bold', 'italic', 'link'], [{ header: 1 }, { header: 2 }, 'blockquote']];

var BubbleTheme = function (_BaseTheme) {
  _inherits(BubbleTheme, _BaseTheme);

  function BubbleTheme(quill, options) {
    _classCallCheck(this, BubbleTheme);

    if (options.modules.toolbar != null && options.modules.toolbar.container == null) {
      options.modules.toolbar.container = TOOLBAR_CONFIG;
    }

    var _this = _possibleConstructorReturn(this, (BubbleTheme.__proto__ || Object.getPrototypeOf(BubbleTheme)).call(this, quill, options));

    _this.quill.container.classList.add('ql-bubble');
    return _this;
  }

  _createClass(BubbleTheme, [{
    key: 'extendToolbar',
    value: function extendToolbar(toolbar) {
      this.tooltip = new BubbleTooltip(this.quill, this.options.bounds);
      this.tooltip.root.appendChild(toolbar.container);
      this.buildButtons([].slice.call(toolbar.container.querySelectorAll('button')), _icons2.default);
      this.buildPickers([].slice.call(toolbar.container.querySelectorAll('select')), _icons2.default);
    }
  }]);

  return BubbleTheme;
}(_base2.default);

BubbleTheme.DEFAULTS = (0, _extend2.default)(true, {}, _base2.default.DEFAULTS, {
  modules: {
    toolbar: {
      handlers: {
        link: function link(value) {
          if (!value) {
            this.quill.format('link', false);
          } else {
            this.quill.theme.tooltip.edit();
          }
        }
      }
    }
  }
});

var BubbleTooltip = function (_BaseTooltip) {
  _inherits(BubbleTooltip, _BaseTooltip);

  function BubbleTooltip(quill, bounds) {
    _classCallCheck(this, BubbleTooltip);

    var _this2 = _possibleConstructorReturn(this, (BubbleTooltip.__proto__ || Object.getPrototypeOf(BubbleTooltip)).call(this, quill, bounds));

    _this2.quill.on(_emitter2.default.events.EDITOR_CHANGE, function (type, range, oldRange, source) {
      if (type !== _emitter2.default.events.SELECTION_CHANGE) return;
      if (range != null && range.length > 0 && source === _emitter2.default.sources.USER) {
        _this2.show();
        // Lock our width so we will expand beyond our offsetParent boundaries
        _this2.root.style.left = '0px';
        _this2.root.style.width = '';
        _this2.root.style.width = _this2.root.offsetWidth + 'px';
        var lines = _this2.quill.getLines(range.index, range.length);
        if (lines.length === 1) {
          _this2.position(_this2.quill.getBounds(range));
        } else {
          var lastLine = lines[lines.length - 1];
          var index = _this2.quill.getIndex(lastLine);
          var length = Math.min(lastLine.length() - 1, range.index + range.length - index);
          var _bounds = _this2.quill.getBounds(new _selection.Range(index, length));
          _this2.position(_bounds);
        }
      } else if (document.activeElement !== _this2.textbox && _this2.quill.hasFocus()) {
        _this2.hide();
      }
    });
    return _this2;
  }

  _createClass(BubbleTooltip, [{
    key: 'listen',
    value: function listen() {
      var _this3 = this;

      _get(BubbleTooltip.prototype.__proto__ || Object.getPrototypeOf(BubbleTooltip.prototype), 'listen', this).call(this);
      this.root.querySelector('.ql-close').addEventListener('click', function () {
        _this3.root.classList.remove('ql-editing');
      });
      this.quill.on(_emitter2.default.events.SCROLL_OPTIMIZE, function () {
        // Let selection be restored by toolbar handlers before repositioning
        setTimeout(function () {
          if (_this3.root.classList.contains('ql-hidden')) return;
          var range = _this3.quill.getSelection();
          if (range != null) {
            _this3.position(_this3.quill.getBounds(range));
          }
        }, 1);
      });
    }
  }, {
    key: 'cancel',
    value: function cancel() {
      this.show();
    }
  }, {
    key: 'position',
    value: function position(reference) {
      var shift = _get(BubbleTooltip.prototype.__proto__ || Object.getPrototypeOf(BubbleTooltip.prototype), 'position', this).call(this, reference);
      var arrow = this.root.querySelector('.ql-tooltip-arrow');
      arrow.style.marginLeft = '';
      if (shift === 0) return shift;
      arrow.style.marginLeft = -1 * shift - arrow.offsetWidth / 2 + 'px';
    }
  }]);

  return BubbleTooltip;
}(_base.BaseTooltip);

BubbleTooltip.TEMPLATE = ['<span class="ql-tooltip-arrow"></span>', '<div class="ql-tooltip-editor">', '<input type="text" data-formula="e=mc^2" data-link="https://quilljs.com" data-video="Embed URL">', '<a class="ql-close"></a>', '</div>'].join('');

exports.BubbleTooltip = BubbleTooltip;
exports.default = BubbleTheme;

/***/ }),
/* 109 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(63);


/***/ })
/******/ ])["default"];
});
;var OrgChart=function(t,e){var r=this;if(this.element=t,this.config={lazyLoading:!0,enableDragDrop:!1,enableSearch:!0,enableTouch:!1,nodeMenu:null,nodeContextMenu:null,dragDropMenu:null,menu:null,toolbar:!1,sticky:!0,nodeMouseClick:OrgChart.action.details,nodeMouseDbClick:OrgChart.none,mouseScrool:OrgChart.action.zoom,showXScroll:OrgChart.none,showYScroll:OrgChart.none,template:"ana",tags:{},nodeBinding:{},linkBinding:{},searchFields:[],nodes:[],clinks:[],slinks:[],levelSeparation:60,siblingSeparation:20,subtreeSeparation:40,mixedHierarchyNodesSeparation:15,padding:30,orientation:OrgChart.orientation.top,layout:OrgChart.normal,scaleInitial:1,scaleMin:.1,scaleMax:5,orderBy:null,editUI:null,searchUI:null,xScrollUI:null,yScrollUI:null,nodeMenuUI:null,nodeContextMenuUI:null,toolbarUI:null,notifierUI:null,dragDropMenuUI:null,menuUI:null,exportUrl:"https://balkangraph.com/export",collapse:{},expand:{},align:OrgChart.CENTER,UI:null,anim:{func:OrgChart.anim.outPow,duration:200},zoom:{speed:120,smooth:12},roots:null,onUpdate:"",onRemove:"",onAdd:"",onRedraw:"",onImageUploaded:"",onUpdateTags:"",onClick:"",onDbClick:"",onExpCollClick:"",onExportStart:"",onExportEnd:"",onSearchClick:"",onReady:""},e)for(var i in this.config)"object"!=typeof e[i]||Array.isArray(e[i])?void 0!==e[i]&&(this.config[i]=e[i]):this.config[i]=OrgChart._mergeObject(this.config[i],e[i]);this._event_id=OrgChart._guid();for(var a=["onUpdate","onRemove","onAdd","onRedraw","onImageUploaded","onUpdateTags","onClick","onDbClick","onExpCollClick","onExportStart","onExportEnd","onSearchClick","onReady"],o=0;o<a.length;o++){var n=a[o];this.config[n]&&this.on(n.replace("on","").toLowerCase(),this.config[n])}null!=this.config.nodeMouseClickBehaviour&&(this.config.nodeMouseClick=this.config.nodeMouseClickBehaviour),null!=this.config.mouseScroolBehaviour&&(this.config.mouseScrool=this.config.mouseScroolBehaviour),OrgChart._validateConfig(this.config)&&(this.server=null,this._vScroll={},this.config.ui||(this.ui=OrgChart.ui),this.config.editUI?this.editUI=this.config.editUI:this.editUI=new OrgChart.editUI,this.editUI.init(this),null===this.server&&(this.server=new OrgChart.server(this.config)),this.config.searchUI?this.searchUI=this.config.searchUI:this.searchUI=new OrgChart.searchUI,this.searchUI.init(this),this.config.nodeMenuUI?this.nodeMenuUI=this.config.nodeMenuUI:this.nodeMenuUI=new OrgChart.menuUI,this.nodeMenuUI.init(this,this.config.nodeMenu),this.config.nodeContextMenuUI?this.nodeContextMenuUI=this.config.nodeContextMenuUI:this.nodeContextMenuUI=new OrgChart.menuUI,this.nodeContextMenuUI.init(this,this.config.nodeContextMenu),this.config.toolbarUI?this.toolbarUI=this.config.toolbarUI:this.toolbarUI=new OrgChart.toolbarUI,this.config.notifierUI?this.notifierUI=this.config.notifierUI:this.notifierUI=new OrgChart.notifierUI,this.notifierUI.init(this),this.config.dragDropMenuUI?this.dragDropMenuUI=this.config.dragDropMenuUI:this.dragDropMenuUI=new OrgChart.menuUI,this.dragDropMenuUI.init(this,this.config.dragDropMenu),this.config.menuUI?this.menuUI=this.config.menuUI:this.menuUI=new OrgChart.menuUI,this.menuUI.init(this,this.config.menu),this.config.xScrollUI||(this.xScrollUI=new OrgChart.xScrollUI(this.element,this.config,function(){return{boundary:r.response.boundary,scale:r.getScale(),viewBox:r.getViewBox(),padding:r.config.padding}},function(t){r.setViewBox(t)},function(){r._draw(!0,OrgChart.action.xScroll)})),this.config.yScrollUI||(this.yScrollUI=new OrgChart.yScrollUI(this.element,this.config,function(){return{boundary:r.response.boundary,scale:r.getScale(),viewBox:r.getViewBox(),padding:r.config.padding}},function(t){r.setViewBox(t)},function(){r._draw(!0,OrgChart.action.xScroll)})),this._gragStartedId=null,this._timeout=null,this._touch=null,this._initialized=!1,this.response=null,this.nodes=null,this._setInitialSizeIfNotSet(),0<this.config.nodes.length&&this._draw(!1,OrgChart.action.init))};OrgChart.prototype.load=function(t){return this.config.nodes=t,this._draw(!1,OrgChart.action.init),this},OrgChart.prototype.loadXML=function(t){var e=OrgChart._xml2json(t);this.load(e)},OrgChart.prototype.getXML=function(){return OrgChart._json2xml(this.config.nodes)},OrgChart.prototype.on=function(t,e){return OrgChart.events.on(t,e,this._event_id),this},OrgChart.prototype.draw=function(t,e,r){null==t&&(t=OrgChart.action.update),this._draw(!1,t,e,r)},OrgChart.prototype._get=function(t){for(var e=0;e<this.config.nodes.length;e++)if(this.config.nodes[e].id==t)return this.config.nodes[e];return null},OrgChart.prototype.get=function(t){for(var e=0;e<this.config.nodes.length;e++)if(this.config.nodes[e].id==t)return JSON.parse(JSON.stringify(this.config.nodes[e]));return null},OrgChart.prototype.getByParentId=function(t){for(var e=[],r=0;r<this.config.nodes.length;r++)this.config.nodes[r].pid==t&&e.push(JSON.parse(JSON.stringify(this.config.nodes[r])));return e},OrgChart.prototype._draw=function(t,O,v,x){var y=this;this._hideBeforeAnimationCompleted=!1;var e=O==OrgChart.action.init?null:this.getViewBox();this.server.read(t,this.width(),this.height(),e,O,v,function(t){O!=OrgChart.action.exporting&&(y.nodes=t.nodes),y.editUI.fields=t.allFields;var e={defs:""};OrgChart.events.publish("renderdefs",[y,e]);var r=y.ui.defs(e.defs),i=y.getScale(t.viewBox);r+=y.ui.pointer(y.config,O,i);var a=y.getViewBox(),o=t.viewBox;e={content:r,res:t};for(var n in OrgChart.events.publish("prerender",[y,e]),r=e.content,t.visibleNodes){var l=t.visibleNodes[n],s=y._get(n);r+=y.ui.node(l,s,t.animations,y.config,void 0,void 0,void 0,O,i,y),r+=y.ui.link(l,y,y.config,i),r+=y.ui.expandCollapse(y,l,y.config,O,i)}e={content:r,res:t};if(OrgChart.events.publish("render",[y,e]),r=e.content,r+=y.ui.lonely(y.config),O!==OrgChart.action.exporting){O!==OrgChart.action.centerNode&&O!==OrgChart.action.insert&&O!==OrgChart.action.expandCollapse&&O!==OrgChart.action.update||(o=a),O===OrgChart.action.init&&null!=a&&(o=a),y.response=t;m=y.ui.svg(y.width(),y.height(),o,y.config,r);if(y._initialized){var h=y.getSvg(),d=h.parentNode;d.removeChild(h),d.insertAdjacentHTML("afterbegin",m),y._attachEventHandlers(),y.xScrollUI.addListener(y.getSvg()),y.yScrollUI.addListener(y.getSvg()),y.xScrollUI.setPosition(),y.yScrollUI.setPosition()}else y.element.innerHTML=y.ui.css()+y.ui.exportMenuButton(y.config)+m,y._attachInitEventHandlers(),y._attachEventHandlers(),y.xScrollUI.create(y.width(),y.config.padding),y.xScrollUI.setPosition(),y.xScrollUI.addListener(y.getSvg()),y.yScrollUI.create(y.height(),y.config.padding),y.yScrollUI.setPosition(),y.yScrollUI.addListener(y.getSvg()),y.config.enableSearch&&y.searchUI.addSearchControl(),y.toolbarUI.init(y,y.config.toolbar);var c=!1;y.notifierUI.show(t.notif);var g=y.response.animations;if(0<g[0].length){y._hideBeforeAnimation(g[0].length);for(var p=0;p<g[0].length;p++)g[0][p]=y.getNodeElement(g[0][p]);OrgChart.anim(g[0],g[1],g[2],y.config.anim.duration,y.config.anim.func,function(){c||(x&&x(),OrgChart.events.publish("redraw",[y]),y._showAfterAnimation(),c=!0)})}O===OrgChart.action.centerNode?OrgChart.anim(y.getSvg(),{viewbox:a},{viewbox:y.response.viewBox},y.config.anim.duration,y.config.anim.func,function(){y.ripple(v.options.rippleId),c||(x&&x(),OrgChart.events.publish("redraw",[y]),y._showAfterAnimation(),c=!0)},function(){y.xScrollUI.setPosition(),y.yScrollUI.setPosition()}):!a||!y.response||a[0]==y.response.viewBox[0]&&a[1]==y.response.viewBox[1]&&a[2]==y.response.viewBox[2]&&a[3]==y.response.viewBox[3]||O!==OrgChart.action.insert&&O!==OrgChart.action.expandCollapse&&O!==OrgChart.action.update&&O!==OrgChart.action.init?0==g[0].length&&(c||(x&&x(),OrgChart.events.publish("redraw",[y]),c=!0)):OrgChart.anim(y.getSvg(),{viewbox:a},{viewbox:y.response.viewBox},500,OrgChart.anim.inOutPow,function(){y.xScrollUI.setPosition(),y.yScrollUI.setPosition(),c||(x&&x(),OrgChart.events.publish("redraw",[y]),c=!0)}),y._initialized||(y._initialized=!0,OrgChart.events.publish("init",[y]))}else{var f=t.boundary,u=f.maxX-f.minX,C=f.maxY-f.minY,m=y.ui.svg(u,C,[f.minX,f.minY,u,C],y.config,r,i);x(m)}},function(t){OrgChart.events.publish("ready",[y,t])})},OrgChart.prototype._setInitialSizeIfNotSet=function(){this.element.style.overflow="hidden",this.element.style.position="relative",0==this.element.offsetHeight&&(this.element.style.height="100%",0==this.element.offsetHeight&&(this.element.style.height="700px")),0==this.element.offsetWidth&&(this.element.style.width="100%",0==this.element.offsetWidth&&(this.element.style.width="700px"))},OrgChart.prototype.getViewBox=function(){var t=this.getSvg(),e=null;return t?(e=(e="["+(e=t.getAttribute("viewBox"))+"]").replace(/\ /g,","),e=JSON.parse(e)):null},OrgChart.prototype.setViewBox=function(t){this.getSvg().setAttribute("viewBox",t.toString())},OrgChart.prototype.width=function(){return this.element.offsetWidth},OrgChart.prototype.height=function(){return this.element.offsetHeight},OrgChart.prototype.getScale=function(t){return t||(t=this.getViewBox()),OrgChart.getScale(t,this.width(),this.height(),this.config.scaleInitial,this.config.scaleMax,this.config.scaleMin)},OrgChart.prototype.ripple=function(t,e,r){var i=this.getBGNode(t);if(null!=i){var a=this.getNodeElement(t);if(null!=a){var o=this.getScale(),n=i.w/2,l=i.h/2;if(void 0!==e&&void 0!==r){var s=a.getBoundingClientRect();n=e/o-s.left/o,l=r/o-s.top/o}var h=i.w,d=i.h,c=n<h-n?h-n:n,g=l<d-l?d-l:l,p=(g=g)<(c=c)?c:g,f=document.createElementNS("http://www.w3.org/2000/svg","g"),u=document.createElementNS("http://www.w3.org/2000/svg","clipPath"),C=document.createElementNS("http://www.w3.org/2000/svg","rect"),m=document.createElementNS("http://www.w3.org/2000/svg","circle"),O=OrgChart._randomId();u.setAttribute("id",O);var v=OrgChart.t(i.templateName,this.getScale());C.setAttribute("x",v.ripple.rect?v.ripple.rect.x:0),C.setAttribute("y",v.ripple.rect?v.ripple.rect.y:0),C.setAttribute("width",v.ripple.rect?v.ripple.rect.width:i.w),C.setAttribute("height",v.ripple.rect?v.ripple.rect.height:i.h),C.setAttribute("rx",v.ripple.radius),C.setAttribute("ry",v.ripple.radius),m.setAttribute("clip-path","url(#"+O+")"),m.setAttribute("cx",n),m.setAttribute("cy",l),m.setAttribute("r",0),m.setAttribute("fill",v.ripple.color),u.appendChild(C),f.appendChild(u),f.appendChild(m),a.appendChild(f),OrgChart.anim(m,{r:0,opacity:1},{r:p,opacity:0},500,OrgChart.anim.outPow,function(){a.removeChild(f)})}}},OrgChart.prototype.center=function(t,e,r){var i,a,o=t,n=!0,l=!0;e&&null!=e.parentState&&(i=e.parentState),e&&null!=e.childrenState&&(a=e.childrenState),e&&null!=e.rippleId&&(o=e.rippleId),e&&null!=e.vertical&&(n=e.vertical),e&&null!=e.horizontal&&(l=e.horizontal);var s={parentState:i,childrenState:a,rippleId:o,vertical:n,horizontal:l};this._draw(!1,OrgChart.action.centerNode,{id:t,options:s},r)},OrgChart.prototype.fit=function(t){this.config.scaleInitial=OrgChart.match.boundary,this._draw(!0,OrgChart.action.init,void 0,t)},OrgChart.prototype.toggleFullScreen=function(){var t=document.querySelector("[data-tlbr='fullScreen']");document.fullscreenElement==this.element||document.webkitFullscreenElement==this.element||document.mozFullScreenElement==this.element||document.msFullscreenElement==this.element?(document.exitFullscreen?document.exitFullscreen():document.mozCancelFullScreen?document.mozCancelFullScreen():document.webkitExitFullscreen?document.webkitExitFullscreen():document.msExitFullscreen&&document.msExitFullscreen(),t&&(t.innerHTML=OrgChart.toolbarUI.openFullScreenIcon)):(this.element.requestFullscreen?this.element.requestFullscreen():this.element.mozRequestFullScreen?this.element.mozRequestFullScreen():this.element.webkitRequestFullscreen?this.element.webkitRequestFullscreen():this.element.msRequestFullscreen&&this.element.msRequestFullscreen(),t&&(t.innerHTML=OrgChart.toolbarUI.closeFullScreenIcon))},OrgChart.prototype.getBGNode=function(t){var e=this.nodes[t];if(null==e)for(var r in this.nodes)for(var i=this.nodes[r].bgnodes,a=0;a<i.length;a++)if(i[a].id==t)return i[a];return e},OrgChart.prototype.setLayout=function(t){this.config.layout=t,this._draw(!1,OrgChart.action.update)},OrgChart.prototype.find=function(t){return this.server.find(t)},OrgChart.prototype._hideBeforeAnimation=function(t){if(1!=this._hideBeforeAnimationCompleted&&!(t&&t<OrgChart.ANIM_THRESHOLD)){var e=this.element.getElementsByTagName("text");if(e.length>OrgChart.TEXT_THRESHOLD)for(var r=0;r<e.length;r++)e[r].style.display="none";var i=this.element.getElementsByTagName("image");if(i.length>OrgChart.IMAGES_THRESHOLD)for(r=0;r<i.length;r++)i[r].style.display="none";var a=this.element.querySelectorAll("[link-id]");if(a.length>OrgChart.LINKS_THRESHOLD)for(r=0;r<a.length;r++)a[r].style.display="none";var o=this.element.querySelectorAll("[control-expcoll-id]");if(o.length>OrgChart.EXPCOLL_THRESHOLD)for(r=0;r<o.length;r++)o[r].style.display="none";this._hideBeforeAnimationCompleted=!0}},OrgChart.prototype._showAfterAnimation=function(){for(var t=this.element.getElementsByTagName("text"),e=0;e<t.length;e++)t[e].style.display="";var r=this.element.getElementsByTagName("image");for(e=0;e<r.length;e++)r[e].style.display="";var i=this.element.querySelectorAll("[link-id]");for(e=0;e<i.length;e++)i[e].style.display="";var a=this.element.querySelectorAll("[control-expcoll-id]");for(e=0;e<a.length;e++)a[e].style.display="";this._hideBeforeAnimationCompleted=!1},OrgChart.prototype.isChild=function(t,e){var r=this.getBGNode(t).childrenIds;if(-1!=r.indexOf(e))return!0;for(var i=0;i<r.length;i++)this.isChild(r[i],e);return!1},OrgChart.prototype.destroy=function(){this._removeEvent(window,"resize"),OrgChart.events.removeForEventId(this._event_id),this.element.innerHTML=null},OrgChart.prototype._canUpdateLink=function(t,e){return null!=e&&null!=e&&(null!=t&&null!=t&&(t!=e&&!this.isChild(t,e)))},OrgChart.prototype.link=function(t,e){if(this._canUpdateLink(t,e)){var r=this.get(t);r.pid=e,this.update(r,!0)}},OrgChart.prototype.linkNode=function(t,e){if(this._canUpdateLink(t,e)){var r=this.getBGNode(t),i=this.getBGNode(e);if(r.isGroup&&i.isGroup)for(var a=i.bgnodes[0].id,o=0;o<r.bgnodes.length;o++){(n=this.get(r.bgnodes[o].id)).pid=a,this.update(n,!0)}else if(!r.isGroup&&i.isGroup){a=i.bgnodes[0].id;(n=this.get(t)).pid=a,this.update(n,!0)}else if(r.isGroup&&!i.isGroup)for(o=0;o<r.bgnodes.length;o++){(n=this.get(r.bgnodes[o].id)).pid=e,this.update(n,!0)}else if(!r.isGroup&&!i.isGroup){var n;(n=this.get(t)).pid=e,this.update(n,!0)}r.isChildOfGroup&&(this.removeNodeTag(r.id,r._groupParentNodeId),this._removeGroupIfHasOneNode(r._groupParentNodeId,r.id));var l=this;this._draw(!1,OrgChart.action.update,{visId:t},function(){l.ripple(r.id)})}},OrgChart.prototype.updateNode=function(t,e){var r=this;if(!1===this.update(t,e))return!1;var i=t.pid;return null!=i&&null!=i&&""!=i||(i=t.id),this._draw(!1,OrgChart.action.update,{id:i},function(){r.ripple(t.id)}),!0},OrgChart.prototype.update=function(t,e){var r=this.get(t.id);if(!0===e&&!1===OrgChart.events.publish("update",[this,r,t]))return!1;for(var i=0;i<this.config.nodes.length;i++)this.config.nodes[i].id==t.id&&(this.config.nodes[i]=t);return!0},OrgChart.prototype.removeNode=function(t,e){var r=this;return!1!==this.remove(t,e)&&(this._draw(!1,OrgChart.action.update,null,function(){r.config.sticky&&OrgChart._moveToBoundaryArea(r.getSvg(),r.getViewBox(),r.response.boundary)}),!0)},OrgChart.prototype.remove=function(t,e){var r=this.getBGNode(t);if((r.isChildOfGroup&&this._removeGroupIfHasOneNode(r._groupParentNodeId,r.id),!0===e)&&!1===OrgChart.events.publish("remove",[this,t]))return!1;for(var i=null,a=this.config.nodes.length-1;0<=a;a--)if(this.config.nodes[a].id==t){i=this.config.nodes[a].pid,this.config.nodes.splice(a,1);break}var o=this.getByParentId(t);for(a=o.length-1;0<=a;a--)o[a].pid=i,this.update(o[a],e);return!0},OrgChart.prototype.addNode=function(t,e){if(!1===this.add(t,e))return!1;var r=OrgChart.action.insert;null!=t.pid&&null!=t.pid||(r=OrgChart.action.update);var i=this.getBGNode(t.pid),a=t.pid;return i&&i.isChildOfGroup&&(a=i._groupParentNodeId),this._draw(!1,r,{id:a,insertedNodeId:t.id}),!0},OrgChart.prototype.add=function(t,e){if((null==t.id&&console.error("Call addNode without id"),!0===e)&&!1===OrgChart.events.publish("add",[this,t]))return!1;return this.config.nodes.push(t),!0},OrgChart.prototype.addTag=function(t,e,r){var i=OrgChart.copy(this.config.tags);if((i[t]=e,!0===r)&&!1===OrgChart.events.publish("updatetags",[this,i]))return!1;return this.config.tags=i,!0},OrgChart.prototype.hasTag=function(t){return null!=this.config.tags[t]},OrgChart.prototype.removeTag=function(t,e){var r=JSON.parse(JSON.stringify(this.config.tags));if((delete r[t],!0===e)&&!1===OrgChart.events.publish("updatetags",[this,r]))return!1;return this.config.tags=r,!0},OrgChart.prototype._updateTag=function(t,e,r){var i=JSON.parse(JSON.stringify(this.config.tags));if(i[t][e]=r,!1===OrgChart.events.publish("updatetags",[this,i]))return!1;this.config.tags=i;var a=this;this._draw(!1,OrgChart.action.update,{id:t},function(){a.ripple(t)})},OrgChart.prototype.addNodeTag=function(t,e,r){var i=this.get(t);Array.isArray(i.tags)||(i.tags=[]),-1==i.tags.indexOf(e)&&(i.tags.push(e),this.update(i,r))},OrgChart.prototype.removeNodeTag=function(t,e,r){var i=this.get(t);if(Array.isArray(i.tags)){var a=i.tags.indexOf(e);-1!=a&&(i.tags.splice(a,1),this.update(i,r))}},OrgChart.prototype._removeGroupIfHasOneNode=function(t,e){if(OrgChart.REMOVE_GROUP_IF_HAS_ONE_NODE){var r=this.getBGNode(t);if(2==r.bgnodes.length){this.removeTag(r.id,!0);for(var i=0;i<r.bgnodes.length;i++){var a=r.bgnodes[i];a.id!=e&&this.removeNodeTag(a.id,t)}}}},OrgChart.prototype.groupNode=function(t,e,r,i){var a=this,o=this.group(t,e,r,i);this._draw(!1,OrgChart.action.update,{id:o.id},function(){a.ripple(o.rippleId)})},OrgChart.prototype.group=function(t,e,r,i){if(!0===i&&!1===OrgChart.events.publish("group",[this,t,e]))return!1;var a=this.getBGNode(t),o=this.getBGNode(e),n=o.id;if(a.isGroup||o.isGroup||a.isChildOfGroup||o.isChildOfGroup)if(a.isGroup||o.isGroup||!a.isChildOfGroup||o.isChildOfGroup)if(a.isGroup||o.isGroup||a.isChildOfGroup||!o.isChildOfGroup)if(!a.isGroup&&!o.isGroup&&a.isChildOfGroup&&o.isChildOfGroup)a._groupParentNodeId!=o._groupParentNodeId&&(this._removeGroupIfHasOneNode(a._groupParentNodeId,a.id),this.removeNodeTag(a.id,a._groupParentNodeId,!0),this.addNodeTag(a.id,o._groupParentNodeId,!0),this.link(a.id,o.pid));else if(!a.isGroup&&o.isGroup&&a.isChildOfGroup&&!o.isChildOfGroup)this._removeGroupIfHasOneNode(a._groupParentNodeId,a.id),this.removeNodeTag(a.id,a._groupParentNodeId,!0),this.addNodeTag(a.id,o.id,!0);else if(a.isGroup||!o.isGroup||a.isChildOfGroup||o.isChildOfGroup){if(a.isGroup&&o.isGroup&&!a.isChildOfGroup&&!o.isChildOfGroup)for(var l=0;l<a.bgnodes.length;l++)this.removeNodeTag(a.bgnodes[l].id,a.id,!0),this.addNodeTag(a.bgnodes[l].id,o.id,!0)}else this.addNodeTag(a.id,o.id,!0);else this.addNodeTag(a.id,o._groupParentNodeId,!0),this.link(a.id,o.pid);else{s=null!=r?r:OrgChart._randomId();this.addTag(s,{group:!0,groupName:"",groupState:OrgChart.EXPAND,template:"group_grey"},!0),this._removeGroupIfHasOneNode(a._groupParentNodeId,a.id),this.removeNodeTag(a.id,a._groupParentNodeId,!0),this.addNodeTag(a.id,s,!0),this.addNodeTag(o.id,s,!0)}else{var s=null!=r?r:OrgChart._randomId();this.addTag(s,{group:!0,groupName:"",groupState:OrgChart.EXPAND,template:"group_grey"},!0),this.addNodeTag(a.id,s,!0),this.addNodeTag(o.id,s,!0);var h=this._get(o.id).pid;this.link(a.id,h)}return{rippleId:a.id,id:n}},void 0===OrgChart&&(OrgChart={}),OrgChart._ajax=function(t,e,r,i,a){null==i&&(i="arraybuffer");var o=new XMLHttpRequest;o.onload=function(t){o.readyState==XMLHttpRequest.DONE&&200===this.status&&a(t.target.response)},o.onerror=function(t){a({error:t})},o.open(e,t),o.responseType=i,o.setRequestHeader("Content-Type","application/json"),null==r?o.send():o.send(r)},void 0===OrgChart&&(OrgChart={}),OrgChart.anim=function(c,g,p,f,u,C,m){var O,v=1,x=f/10+1;document.getElementsByTagName("g");Array.isArray(c)||(c=[c]),Array.isArray(g)||(g=[g]),Array.isArray(p)||(p=[p]),O=setInterval(function(){for(var t=0;t<c.length;t++)for(var e in p[t]){var r=OrgChart._arrayContains(["top","left","right","bottom","width","height"],e.toLowerCase())?"px":"";switch(e.toLowerCase()){case"d":var a=u((10*v-10)/f)*(p[t][e][0]-g[t][e][0])+g[t][e][0],o=u((10*v-10)/f)*(p[t][e][1]-g[t][e][1])+g[t][e][1];c[t].setAttribute("d",c[t].getAttribute("d")+" L"+a+" "+o);break;case"r":var n=u((10*v-10)/f)*(p[t][e]-g[t][e])+g[t][e];c[t].setAttribute("r",n);break;case"transform":if(p[t][e]){var l=g[t][e],s=p[t][e],h=[0,0,0,0,0,0];for(i in l)h[i]=u((10*v-10)/f)*(s[i]-l[i])+l[i];c[t].hasAttribute("transform")?c[t].setAttribute("transform","matrix("+h.toString()+")"):c[t].style.transform="matrix("+h.toString()+")"}break;case"viewbox":if(p[t][e]){for(i in l=g[t][e],s=p[t][e],h=[0,0,0,0],l)h[i]=u((10*v-10)/f)*(s[i]-l[i])+l[i];c[t].setAttribute("viewBox",h.toString())}break;case"margin":if(p[t][e]){for(i in l=g[t][e],s=p[t][e],h=[0,0,0,0],l)h[i]=u((10*v-10)/f)*(s[i]-l[i])+l[i];var d="";for(i=0;i<h.length;i++)d+=parseInt(h[i])+"px ";c[t]&&c[t].style&&(c[t].style[e]=d)}break;default:n=u((10*v-10)/f)*(p[t][e]-g[t][e])+g[t][e],c[t]&&c[t].style&&(c[t].style[e]=n+r)}}m&&m(),1+x<(v+=1)&&(clearInterval(O),C&&C(c))},10)},OrgChart.anim.inPow=function(t){return t<0?0:1<t?1:Math.pow(t,2)},OrgChart.anim.outPow=function(t){if(t<0)return 0;if(1<t)return 1;return-1*(Math.pow(t-1,2)+-1)},OrgChart.anim.inOutPow=function(t){if(t<0)return 0;if(1<t)return 1;if((t*=2)<1)return OrgChart.anim.inPow(t,2)/2;return-.5*(Math.pow(t-2,2)+-2)},OrgChart.anim.inSin=function(t){return t<0?0:1<t?1:1-Math.cos(t*(Math.PI/2))},OrgChart.anim.outSin=function(t){return t<0?0:1<t?1:Math.sin(t*(Math.PI/2))},OrgChart.anim.inOutSin=function(t){return t<0?0:1<t?1:-.5*(Math.cos(Math.PI*t)-1)},OrgChart.anim.inExp=function(t){return t<0?0:1<t?1:Math.pow(2,10*(t-1))},OrgChart.anim.outExp=function(t){return t<0?0:1<t?1:1-Math.pow(2,-10*t)},OrgChart.anim.inOutExp=function(t){return t<0?0:1<t?1:t<.5?.5*Math.pow(2,10*(2*t-1)):.5*(2-Math.pow(2,10*(-2*t+1)))},OrgChart.anim.inCirc=function(t){return t<0?0:1<t?1:-(Math.sqrt(1-t*t)-1)},OrgChart.anim.outCirc=function(t){return t<0?0:1<t?1:Math.sqrt(1-(t-1)*(t-1))},OrgChart.anim.inOutCirc=function(t){return t<0?0:1<t?1:t<1?-.5*(Math.sqrt(1-t*t)-1):.5*(Math.sqrt(1-(2*t-2)*(2*t-2))+1)},OrgChart.anim.rebound=function(t){return t<0?0:1<t?1:t<1/2.75?1-7.5625*t*t:t<2/2.75?1-(7.5625*(t-1.5/2.75)*(t-1.5/2.75)+.75):t<2.5/2.75?1-(7.5625*(t-2.25/2.75)*(t-2.25/2.75)+.9375):1-(7.5625*(t-2.625/2.75)*(t-2.625/2.75)+.984375)},OrgChart.anim.inBack=function(t){return t<0?0:1<t?1:t*t*(2.70158*t-1.70158)},OrgChart.anim.outBack=function(t){return t<0?0:1<t?1:(t-1)*(t-1)*(2.70158*(t-1)+1.70158)+1},OrgChart.anim.inOutBack=function(t){return t<0?0:1<t?1:t<.5?4*t*t*(7.1898*t-2.5949)*.5:.5*((2*t-2)*(2*t-2)*(3.5949*(2*t-2)+2.5949)+2)},OrgChart.anim.impulse=function(t){var e=2*t;return e*Math.exp(1-e)},OrgChart.anim.expPulse=function(t){return Math.exp(-2*Math.pow(t,2))},void 0===OrgChart&&(OrgChart={}),OrgChart.prototype._attachInitEventHandlers=function(t){this._addEvent(window,"resize",this._resizeHandler)},OrgChart.prototype._attachEventHandlers=function(t){t=this.getSvg();this.config.enableTouch||/Mobi/i.test(navigator.userAgent)||/Android/i.test(navigator.userAgent)?(this._addEvent(t,"touchstart",this._globalMouseDownHandler),this._addEvent(t,"touchend",this._globalClickHandler)):(this._addEvent(t,"mousedown",this._globalMouseDownHandler),this._addEvent(t,"click",this._globalClickHandler),this._addEvent(t,"contextmenu",this._globalContextHandler),this._addEvent(t,"dblclick",this._globalDbClickHandler),this.config.mouseScrool!=OrgChart.action.zoom&&this.config.mouseScrool!=OrgChart.action.ctrlZoom||(this._addEvent(t,"DOMMouseScroll",this._mouseScrollHandler),this._addEvent(t,"mousewheel",this._mouseScrollHandler)));var e=this.getExportMenuButton();e&&this._addEvent(e,"click",this._exportMenuClickHandler)},OrgChart.prototype._addEvent=function(e,t,r,i){var a,o;(i||(i=""),e.getListenerList||(e.getListenerList={}),e.getListenerList[t+i])||(a=this,o=r,r=function(){if(o)return o.apply(a,[this,arguments[0]])},e.addEventListener?e.addEventListener(t,n,!1):e.attachEvent("on"+t,function(){var t=r.call(e,window.event);return!1===t&&(window.event.returnValue=!1,window.event.cancelBubble=!0),t}),e.getListenerList[t+i]=n);function n(t){var e=r.apply(this,arguments);return!1===e&&(t.stopPropagation(),t.preventDefault()),e}},OrgChart.prototype._removeEvent=function(t,e){if(t.getListenerList[e]){var r=t.getListenerList[e];t.removeEventListener(e,r,!1),delete t.getListenerList[e]}},void 0===OrgChart&&(OrgChart={}),OrgChart.VERSION="6.4.0",OrgChart.orientation={},OrgChart.orientation.top=0,OrgChart.orientation.bottom=1,OrgChart.orientation.right=2,OrgChart.orientation.left=3,OrgChart.orientation.top_left=4,OrgChart.orientation.bottom_left=5,OrgChart.orientation.right_top=6,OrgChart.orientation.left_top=7,OrgChart.CENTER=8,OrgChart.ORIENTATION=9,OrgChart.TEXT_THRESHOLD=150,OrgChart.IMAGES_THRESHOLD=70,OrgChart.LINKS_THRESHOLD=150,OrgChart.EXPCOLL_THRESHOLD=40,OrgChart.ANIM_THRESHOLD=50,OrgChart.ID="id",OrgChart.PID="pid",OrgChart.TAGS="tags",OrgChart.NODES="nodes",OrgChart.ELASTIC="elastic",OrgChart.MAX_DEPTH=200,OrgChart.SCALE_FACTOR=1.44,OrgChart.EXPAND=0,OrgChart.COLLAPSE=1,OrgChart.LAZY_LOADING_FACTOR=500,OrgChart.action={},OrgChart.action.expandCollapse=0,OrgChart.action.groupMaxMin=100,OrgChart.action.edit=1,OrgChart.action.zoom=2,OrgChart.action.ctrlZoom=22,OrgChart.action.scroll=41,OrgChart.action.xScroll=3,OrgChart.action.yScroll=4,OrgChart.action.none=5,OrgChart.action.init=6,OrgChart.action.update=7,OrgChart.action.pan=8,OrgChart.action.centerNode=9,OrgChart.action.resize=10,OrgChart.action.insert=11,OrgChart.action.insertfirst=12,OrgChart.action.details=13,OrgChart.action.exporting=14,OrgChart.none=400001,OrgChart.scroll={},OrgChart.scroll.visible=1,OrgChart.scroll.smooth=12,OrgChart.scroll.speed=120,OrgChart.scroll.safari={smooth:12,speed:250},OrgChart.match={},OrgChart.match.height=100001,OrgChart.match.width=100002,OrgChart.match.boundary=100003,OrgChart.COLLAPSE_PARENT_NEIGHBORS=1,OrgChart.COLLAPSE_SUB_CHILDRENS=2,OrgChart.normal=0,OrgChart.mixed=1,OrgChart.tree=2,OrgChart.treeLeftOffset=3,OrgChart.treeRightOffset=4,OrgChart.nodeOpenTag='<g node-id="{id}" style="opacity: {opacity}" transform="matrix(1,0,0,1,{x},{y})" class="{class}" level="{level}">',OrgChart.linkOpenTag='<g link-id="[{id}][{child-id}]" class="{class}" level="{level}">',OrgChart.expcollOpenTag='<g control-expcoll-id="{id}" transform="matrix(1,0,0,1,{x},{y})"  style="cursor:pointer;">',OrgChart.groupNodesOpenTag='<g transform="matrix(1,0,0,1,{x},{y})">',OrgChart.linkFieldsOpenTag='<g transform="matrix(1,0,0,1,{x},{y}) rotate({rotate})">',OrgChart.grCloseTag="</g>",OrgChart.IT_IS_LONELY_HERE='<g transform="translate(-100, 0)" style="cursor:pointer;"  control-add="control-add"><text fill="#039be5">{link}</text></g>',OrgChart.RES={},OrgChart.RES.IT_IS_LONELY_HERE_LINK="It's lonely here, add your first node",OrgChart.MAXIMIZE='<g style="cursor:pointer;" transform="matrix(1,0,0,1,{x},20)" control-maxmin-id="{id}"><rect x="0" y="0" width="26" height="26" fill="#EEEEEE" stroke="#aeaeae" stroke-width="1" rx="2"></rect><polyline  stroke="#aeaeae" stroke-width="2" points="9,6 17,13 9,20" fill="none"></polyline></g>',OrgChart.MINIMIZE='<g style="cursor:pointer;" transform="matrix(1,0,0,1,{x},20)" control-maxmin-id="{id}"><rect x="0" y="0" width="26" height="26" fill="#EEEEEE" stroke="#aeaeae" stroke-width="1" rx="2"></rect><polyline stroke="#aeaeae" stroke-width="2" points="17,6 9,13 17,20" fill="none"></polyline></g>',OrgChart.MAX_NODES_MESS="The trial has expired or 200 nodes limit was reached! <br /><a style='color: #039BE5;' target='_blank' href='https://balkangraph.com/OrgChartJS/Docs/Evaluation'>See more</a>",OrgChart.OFFLINE_MESS="The evaluation version requires intermet connection! <br /><a style='color: #039BE5;' target='_blank' href='https://balkangraph.com/OrgChartJS/Docs/Evaluation'>See more</a>",OrgChart.SEARCH_PLACEHOLDER="Search",OrgChart.A4w=595,OrgChart.A4h=842,OrgChart.A3w=842,OrgChart.A3h=1191,OrgChart.A2w=1191,OrgChart.A2h=1684,OrgChart.A1w=1684,OrgChart.A1h=2384,OrgChart.MIXED_LAYOUT_ALL_NODES=!0,OrgChart.CLINK_CURVE=1,OrgChart.SEARCH_RESULT_LIMIT=10,OrgChart.REMOVE_GROUP_IF_HAS_ONE_NODE=!0,"undefined"!=typeof module&&(module.exports=OrgChart),OrgChart.input=function(t,e,r,i,a,o){null==i&&(i=!1);var n=document.createElement("div"),l=document.createElement("div"),s=document.createElement("input"),h=document.createElement("hr"),d=document.createElement("button");if(d.innerHTML="Upload",d.style.position="absolute",d.style.right=0,n.style.margin="14px 14px 7px 14px",n.style.textAlign="left",n.style.position="relative",n.setAttribute("data-field-name",t),h.style.border="1px solid #d7d7d7",h.style.backgroundColor="#d7d7d7",h.style.display="block",h.style.width="100%",l.style.color="#bcbcbc",s.style.border="none",s.style.outline="none",s.style.width="100%",s.setAttribute("val",""),a&&(s.style.width="80%"),s.style.fontSize="16px",s.readOnly=i,null!=e&&null!=e&&(s.value=e),null!=r&&null!=r&&(s.placeholder=r),null!=t&&null!=t&&(l.innerHTML=t),l.setAttribute("lbl",""),s.style.color="#7a7a7a",i||s.addEventListener("focus",function(){var t=this.parentNode.getElementsByTagName("hr")[0];t.style.border="1px solid #039BE5",OrgChart.anim(t,{width:10},{width:n.clientWidth},250,OrgChart.anim.inOutSin)}),d.addEventListener("click",function(){var e=this,t=document.createElement("INPUT");t.setAttribute("type","file"),t.style.display="none",t.onchange=function(){var t=this.files[0];OrgChart.events.publish("imageuploaded",[o,t,e.parentNode.querySelector("input")])},document.body.appendChild(t),t.click()}),s.addEventListener("blur",function(){this.parentNode.getElementsByTagName("hr")[0].style.border="1px solid #d7d7d7"}),n.appendChild(l),n.appendChild(s),a&&n.appendChild(d),n.appendChild(h),OrgChart.addValidation){var c={wrapper:n,label:l,input:s,hr:h};OrgChart.addValidation(t,e,c)}return n},OrgChart._intersects=function(t,e,r){var i=t.x-r.siblingSeparation/4,a=t.y,o=t.x+t.w+r.siblingSeparation/4,n=t.y;switch(r.orientation){case OrgChart.orientation.right:case OrgChart.orientation.right_top:case OrgChart.orientation.left:case OrgChart.orientation.left_top:i=t.x,a=t.y-r.siblingSeparation/4,o=t.x,n=t.y+t.h+r.siblingSeparation/4}var l,s,h,d=e.p,c=e.q,g=e.r,p=e.s;return 0!=(l=(o-i)*(p-c)-(g-d)*(n-a))&&(s=((a-n)*(g-i)+(o-i)*(p-a))/l,0<(h=((p-c)*(g-i)+(d-g)*(p-a))/l)&&h<1&&0<s&&s<1)},OrgChart._addPoint=function(t,e,r,i,a){switch(r.orientation){case OrgChart.orientation.top:case OrgChart.orientation.top_left:return OrgChart._addPointTop(t,e,r,i,a);case OrgChart.orientation.bottom:case OrgChart.orientation.bottom_left:return OrgChart._addPointBottom(t,e,r,i,a);case OrgChart.orientation.left:case OrgChart.orientation.left_top:return OrgChart._addPointLeft(t,e,r,i,a);case OrgChart.orientation.right:case OrgChart.orientation.right_top:return OrgChart._addPointRight(t,e,r,i,a)}},OrgChart._addPointTop=function(t,e,r,i,a){var o,n,l;return"left"==a?o=t.leftNeighbor?t.x+(t.leftNeighbor.x+t.leftNeighbor.w-t.x)/2:t.x-r.siblingSeparation/2:"right"==a&&(o=t.rightNeighbor?t.x+t.w+(t.rightNeighbor.x-(t.x+t.w))/2:t.x+t.w+r.siblingSeparation/2),e.push([o,e[e.length-1][1]]),e.push([o,t.y-r.levelSeparation/3]),n=e[e.length-1][1],l=o,i.p=o,i.q=n,i.r=l,i},OrgChart._addPointBottom=function(t,e,r,i,a){var o,n,l;return"left"==a?o=t.leftNeighbor?t.x+(t.leftNeighbor.x+t.leftNeighbor.w-t.x)/2:t.x-r.siblingSeparation/2:"right"==a&&(o=t.rightNeighbor?t.x+t.w+(t.rightNeighbor.x-(t.x+t.w))/2:t.x+t.w+r.siblingSeparation/2),e.push([o,e[e.length-1][1]]),e.push([o,t.y+t.h+r.levelSeparation/3]),n=e[e.length-1][1],l=o,i.p=o,i.q=n,i.r=l,i},OrgChart._addPointLeft=function(t,e,r,i,a){var o,n=e[e.length-1][0];return"bottom"==a?o=t.rightNeighbor?t.y+t.h+(t.rightNeighbor.y-(t.y+t.h))/2:t.y+t.h+r.siblingSeparation/2:"top"==a&&(o=t.leftNeighbor?t.y+(t.leftNeighbor.y+t.leftNeighbor.h-t.y)/2:t.y-r.siblingSeparation/2),e.push([e[e.length-1][0],o]),e.push([t.x-r.levelSeparation/3,o]),n=e[e.length-1][0],s=o,i.p=n,i.q=o,i.s=s,i},OrgChart._addPointRight=function(t,e,r,i,a){var o,n=e[e.length-1][0];return"bottom"==a?o=t.rightNeighbor?t.y+t.h+(t.rightNeighbor.y-(t.y+t.h))/2:t.y+t.h+r.siblingSeparation/2:"top"==a&&(o=t.leftNeighbor?t.y+(t.leftNeighbor.y+t.leftNeighbor.h-t.y)/2:t.y-r.siblingSeparation/2),e.push([e[e.length-1][0],o]),e.push([t.x+t.w+r.levelSeparation/3,o]),n=e[e.length-1][0],s=o,i.p=n,i.q=o,i.s=s,i},OrgChart.editUI=function(){},OrgChart.editUI.prototype.init=function(t){this.obj=t,this.fields=null,this.node=null,this._event_id=OrgChart._guid()},OrgChart.editUI.prototype.on=function(t,e){return OrgChart.events.on(t,e,this._event_id),this},OrgChart.editUI.prototype.show=function(t,e){if(this.hide(),!1===OrgChart.events.publish("show",[this,t]))return!1;this.node=this.obj.getBGNode(t),this.wrapperElement=document.getElementById("bgEditForm"),this.wrapperElement&&this.obj.element.removeChild(this.wrapperElement),this.wrapperElement=document.createElement("div"),this.wrapperElement.className="edit-wrapper";var r=document.createElement("div");r.className="edit-view";var i=document.createElement("div");i.className="details-view";var a="400px";window.matchMedia("(max-width: 1150px)").matches&&(a="100%"),Object.assign(this.wrapperElement.style,{width:a,position:"absolute",top:0,right:"-150px",opacity:0,"border-left":"1px solid #d7d7d7","text-align":"left",height:"100%","background-color":"#ffffff"}),e?this._createDetailsView(this.node,i):this._createEditView(this.node,r)},OrgChart.editUI.prototype._createDetailsView=function(t,e){var r=this,i=document.createElement("div");i.className="edit-photo";var a=document.createElement("div"),o=document.createElement("div");o.className="edit-fields";var n=document.createElement("div");n.className="edit-tags",a.innerHTML='<svg style="width: 34px; height: 34px;"><path style="fill:#ffffff;" d="M21.205,5.007c-0.429-0.444-1.143-0.444-1.587,0c-0.429,0.429-0.429,1.143,0,1.571l8.047,8.047H1.111 C0.492,14.626,0,15.118,0,15.737c0,0.619,0.492,1.127,1.111,1.127h26.554l-8.047,8.032c-0.429,0.444-0.429,1.159,0,1.587 c0.444,0.444,1.159,0.444,1.587,0l9.952-9.952c0.444-0.429,0.444-1.143,0-1.571L21.205,5.007z"></path></svg>',Object.assign(a.style,{cursor:"pointer",width:"34px",height:"34px",position:"absolute",top:"7px",right:"7px"}),Object.assign(o.style,{"overflow-x":"hidden","overflow-y":"auto"}),Object.assign(i.style,{"background-color":"#039BE5","min-height":"50px",textAlign:"center",position:"relative"}),Object.assign(n.style,{margin:"12px"}),this.wrapperElement.appendChild(e),e.appendChild(i),e.appendChild(o),o.appendChild(n),i.appendChild(a),OrgChart.htmlRipple(i);var l=this.fields,s=this.obj._get(t.id);t.isGroup&&(l=["Name"],s={Name:this.obj.config.tags[t.id].groupName});for(var h=0;h<l.length;h++){var d=s[l[h]];if(t.isGroup&&(d=this.obj.config.tags[t.id]["group"+l[h]]),OrgChart._fieldIsImg(this.obj.config,l[h])){var c=document.createElement("img");c.src=d,c.style.width="100px",c.style.margin="10px",c.style.borderRadius="50px",this._addField(i,c,l[h],"details")}else if("tags"==l[h]){if(d)for(var g=0;g<d.length;g++){var p=document.createElement("span");Object.assign(p.style,{"background-color":"#F57C00",color:"#ffffff",margin:"2px",padding:"2px 12px","border-radius":"10px",display:"inline-block",border:"1px solid #FFCA28","user-select":"none"}),p.innerHTML=d[g],this._addField(n,p,d[g],"details-tag")}}else this._addField(o,OrgChart.input(l[h],d,null,!0,void 0,r),l[h],"details")}this.obj.element.appendChild(this.wrapperElement),i.addEventListener("click",function(){r.hide(!1)}),this.obj._hideBeforeAnimation(),OrgChart.anim(this.wrapperElement,{right:-150,opacity:0},{right:0,opacity:.9},300,OrgChart.anim.inOutSin,function(){r.obj._showAfterAnimation(),o.style.height=r.obj.element.offsetHeight-i.offsetHeight+"px"})},OrgChart.editUI.prototype._addField=function(t,e,r,i){var a={name:r,field:e,type:i};!1!==OrgChart.events.publish("field",[this,a])&&t.appendChild(a.field)},OrgChart.editUI.prototype._createEditView=function(t,e){var i=this,r=document.createElement("div");r.className="edit-photo";var a=document.createElement("div"),o=document.createElement("div"),n=document.createElement("div");n.className="edit-fields";var l=document.createElement("div");l.className="edit-assistant-button-content",a.innerHTML='<svg style="width: 34px; height: 34px;"><path style="fill:#ffffff;" d="M21.205,5.007c-0.429-0.444-1.143-0.444-1.587,0c-0.429,0.429-0.429,1.143,0,1.571l8.047,8.047H1.111 C0.492,14.626,0,15.118,0,15.737c0,0.619,0.492,1.127,1.111,1.127h26.554l-8.047,8.032c-0.429,0.444-0.429,1.159,0,1.587 c0.444,0.444,1.159,0.444,1.587,0l9.952-9.952c0.444-0.429,0.444-1.143,0-1.571L21.205,5.007z"></path></svg>',this.wrapperElement.id="bgEditForm",Object.assign(a.style,{cursor:"pointer",width:"34px",height:"34px",position:"absolute",top:"7px",right:"7px"}),Object.assign(n.style,{"overflow-x":"hidden","overflow-y":"auto"}),Object.assign(r.style,{"background-color":"#039BE5","min-height":"50px",textAlign:"center",position:"relative"}),Object.assign(o.style,{margin:"14px 14px 7px",color:"#4285F4",cursor:"pointer"}),Object.assign(l.style,{margin:"14px 14px 7px",color:"rgb(188, 188, 188)"}),o.innerHTML="Add new field";var s=OrgChart._arrayContains(this.node.tags,"assistant")?"checked":"";l.setAttribute("data-field-name","isAssistant"),l.innerHTML='<div style="margin-top: 10px;display:inline-block;">Assistant</div><label class="bg-switch"><input val type="checkbox" '+s+'><span class="bg-slider round"></span></label>',this.wrapperElement.appendChild(e),e.appendChild(r),e.appendChild(n),r.appendChild(a),OrgChart.htmlRipple(r);var h=this.fields,d=this.obj._get(t.id);t.isGroup&&(h=["Name"],d={Name:this.obj.config.tags[t.id].groupName});for(var c=0;c<h.length;c++){var g=d[h[c]];if(t.isGroup&&(g=this.obj.config.tags[t.id]["group"+h[c]]),"tags"!=h[c])if(OrgChart._fieldIsImg(this.obj.config,h[c])){if(g){var p=document.createElement("img");p.src=g,p.style.width="100px",p.style.margin="10px",p.style.borderRadius="50px",r.appendChild(p)}this._addField(n,OrgChart.input(h[c],g,null,!1,!0,i),h[c],"edit")}else this._addField(n,OrgChart.input(h[c],g,null,!1,void 0,i),h[c],"edit")}t.isGroup||t.isChildOfGroup||0!=t.childrenIds.length||this._addField(n,l,"isAssistant","edit"),t.isGroup||this._addField(n,o,"Add new field","edit"),this.obj.element.appendChild(this.wrapperElement),r.addEventListener("click",function(){i.hide(!0)}),o.addEventListener("click",function(){if("Save"==o.innerHTML)OrgChart.anim(o,{opacity:1},{opacity:0},200,OrgChart.anim.inSin,function(){o.innerHTML="Add new field",o.style.textAlign="left";var t=document.getElementById("bgNewField"),e=t.getElementsByTagName("input")[0].value;if(n.removeChild(t),e&&!OrgChart._arrayContains(i.fields,e)){var r=OrgChart.input(e);r.style.opacity=0,n.insertBefore(r,o),OrgChart.anim(r,{opacity:0},{opacity:1},200,OrgChart.anim.inSin,function(){r.getElementsByTagName("input")[0].focus()})}OrgChart.anim(o,{opacity:0},{opacity:1},200,OrgChart.anim.inSin)});else{OrgChart.anim(o,{opacity:1},{opacity:0},200,OrgChart.anim.inSin,function(){o.innerHTML="Save",o.style.textAlign="right",OrgChart.anim(o,{opacity:0},{opacity:1},200,OrgChart.anim.inSin)});var t=OrgChart.input(null,null,"Field name");t.style.opacity=0,t.id="bgNewField",n.appendChild(t),OrgChart.anim(t,{opacity:0},{opacity:1},200,OrgChart.anim.inSin,function(){t.getElementsByTagName("input")[0].focus()})}}),this.obj._hideBeforeAnimation(),OrgChart.anim(this.wrapperElement,{right:-150,opacity:0},{right:0,opacity:.9},300,OrgChart.anim.inOutSin,function(){i.obj._showAfterAnimation(),n.style.height=i.obj.element.offsetHeight-r.offsetHeight+"px",1<i.wrapperElement.getElementsByTagName("input").length&&i.wrapperElement.getElementsByTagName("input")[0].focus()})},OrgChart.editUI.prototype.hide=function(t){if(this.wrapperElement){if(!1===OrgChart.events.publish("hide",[this]))return!1;var e=this.obj.get(this.node.id);if(this.node.isGroup&&(e={Name:this.obj.config.tags[this.node.id].groupName}),t){for(var r=this.wrapperElement.querySelectorAll("[data-field-name]"),i=0;i<r.length;i++){var a=r[i].getAttribute("data-field-name");if(a){var o=r[i].querySelector("[val]").value;if(a===OrgChart.TAGS)e.tags=o.split(",");else if("isAssistant"===a){var n=r[i].querySelector("[val]").checked;n&&e.tags?OrgChart._arrayContains(this.node.tags,"assistant")||e.tags.push("assistant"):n&&!e.tags?e.tags=["assistant"]:!n&&e.tags&&-1!=this.node.tags.indexOf("assistant")&&e.tags.splice(e.tags.indexOf("assistant"),1)}else null!=e[a]?e[a]=o:""!=o&&(e[a]=o)}}var l=this;this.obj._hideBeforeAnimation(),OrgChart.anim(l.wrapperElement,{right:0,opacity:1},{right:-150,opacity:0},300,OrgChart.anim.inOutSin,function(){l.obj._showAfterAnimation(),l.node.isGroup?l.obj._updateTag(l.node.id,"groupName",e.Name):l.obj.updateNode(e,!0),l.obj.element.removeChild(l.wrapperElement),l.wrapperElement=null})}else this.obj.element.removeChild(this.wrapperElement),this.wrapperElement=null}},OrgChart.prototype.getSvg=function(){var t=this.element.getElementsByTagName("svg");return t&&t.length?t[0]:null},OrgChart.prototype.getPointerElement=function(){return this.element.querySelector("g[data-pointer]")},OrgChart.prototype.getNodeElement=function(t){return this.element.querySelector("g[node-id='"+t+"']")},OrgChart.prototype.getExportMenuButton=function(){return this.element.querySelector("[control-export-menu]")},OrgChart.menuUI=function(){},OrgChart.menuUI.prototype.init=function(t,e){this.obj=t,this.wrapper=null,this.menu=e,this._event_id=OrgChart._guid()},OrgChart.menuUI.prototype.showStickIn=function(t,e,r,i){this._show(t,null,e,r,i)},OrgChart.menuUI.prototype.show=function(t,e,r,i,a){this._show(t,e,r,i,a)},OrgChart.menuUI.prototype._show=function(t,e,o,n,l){var s=this;this.hide();var r="";l||(l=this.menu);var i={firstNodeId:o,secondNodeId:n,menu:l};if(!1===OrgChart.events.publish("show",[this,i]))return!1;for(var a in l=i.menu){var h=l[a].icon,d=l[a].text;void 0===h&&(h=OrgChart.icon[a](24,24,"#7A7A7A")),"function"==typeof d&&(d=d()),"function"==typeof h&&(h=h()),r+='<div data-item="'+a+'" style="border-bottom: 1px solid #D7D7D7; padding: 7px 10px;color: #7A7A7A;">'+h+"<span>&nbsp;&nbsp;"+d+"</span></div>"}if(""!=r){if(this.wrapper=document.createElement("div"),Object.assign(this.wrapper.style,{opacity:0,"background-color":"#FFFEFF","box-shadow":"#DCDCDC 0px 1px 2px 0px",display:"inline-block",border:"1px solid #D7D7D7;border-radius:5px","z-index":1e3,position:"absolute","text-align":"left","user-select":"none"}),this.wrapper.className="chart-menu",this.wrapper.style.left="-99999px",this.wrapper.style.top="-99999px",this.wrapper.innerHTML=r,this.obj.element.appendChild(this.wrapper),null==e){var c=OrgChart._menuPosition(t,this.wrapper,this.obj.getSvg());t=c.x,e=c.y}var g=t+45;this.wrapper.style.left=g+"px",this.wrapper.style.top=e+"px",this.wrapper.style.left=g-this.wrapper.offsetWidth+"px";var p=t-this.wrapper.offsetWidth;OrgChart.anim(this.wrapper,{opacity:0,left:g-this.wrapper.offsetWidth},{opacity:1,left:p},300,OrgChart.anim.inOutPow);for(var f=this.wrapper.getElementsByTagName("div"),u=0;u<f.length;u++){(a=f[u]).addEventListener("mouseover",function(){this.style.backgroundColor="#F0F0F0"}),a.addEventListener("mouseleave",function(){this.style.backgroundColor="#FFFFFF"}),a.addEventListener("click",function(t){var e,r=this.getAttribute("data-item");if(void 0===l[r].onClick)if("add"===r){var i={id:OrgChart._randomId(),pid:o};s.obj.addNode(i,!0)}else if("edit"===r){var a=s.obj.getBGNode(o);s.obj.editUI.show(a.id)}else if("details"===r){a=s.obj.getBGNode(o);s.obj.editUI.show(a.id,!0)}else"remove"===r?s.obj.removeNode(o,!0):"svg"===r?s.obj.exportSVG({filename:"OrgChart.svg",expandChildren:!1,nodeId:o}):"pdf"===r?s.obj.exportPDF({filename:"OrgChart.pdf",expandChildren:!1,nodeId:o}):"png"===r?s.obj.exportPNG({filename:"OrgChart.png",expandChildren:!1,nodeId:o}):"csv"===r?s.obj.exportCSV():"xml"===r?s.obj.exportXML():"addInGroup"===r?s.obj.groupNode(o,n,void 0,!0):"addAsChild"===r&&s.obj.linkNode(o,n);else e=l[r].onClick.call(s.obj,o,n);0!=e&&s.hide()})}}},OrgChart.menuUI.prototype.hide=function(){null!=this.wrapper&&(this.obj.element.removeChild(this.wrapper),this.wrapper=null)},OrgChart.menuUI.prototype.on=function(t,e){return OrgChart.events.on(t,e,this._event_id),this},void 0===OrgChart&&(OrgChart={}),OrgChart.idb={version:1,dbName:"balkangraph",tableName:"orgchart-js",keyPath:"id"},OrgChart.idb.db=null,OrgChart.idb._open=function(e){if((0<navigator.userAgent.toLowerCase().indexOf("safari")||0<navigator.userAgent.toLowerCase().indexOf("firefox"))&&window.location!==window.parent.location)e&&e(!1);else{if(!window.indexedDB)return console.error("Your browser doesn't support a stable version of IndexedDB."),void(e&&e(!1));if(null==OrgChart.idb.db){var t=indexedDB.open(OrgChart.idb.dbName,OrgChart.idb.version);t.onerror=function(t){console.error("Cannot open database!"),e&&e(!1)},t.onsuccess=function(t){OrgChart.idb.db=t.target.result,e&&e(!0)},t.onupgradeneeded=function(t){var e=t.target.result;e.objectStoreNames.contains(OrgChart.idb.tableName)&&e.deleteObjectStore(OrgChart.idb.tableName);e.createObjectStore(OrgChart.idb.tableName,{keyPath:OrgChart.idb.keyPath})}}else e&&e(!0)}},OrgChart.idb.read=function(r,i){OrgChart.idb._open(function(t){if(t){var e=OrgChart.idb.db.transaction([OrgChart.idb.tableName]).objectStore(OrgChart.idb.tableName).get(r);e.onerror=function(t){console.error("Unable to retrieve data from database!"),i&&i(!1)},e.onsuccess=function(t){e.result?i&&i(!0,e.result):i&&i(null)}}else i&&i(!1)})},OrgChart.idb.write=function(r,i){OrgChart.idb.read(r.id,function(t){if(null==t){var e=OrgChart.idb.db.transaction([OrgChart.idb.tableName],"readwrite").objectStore(OrgChart.idb.tableName).add(r);e.onerror=function(t){console.error("Unable to add data to database!"),i&&i(!1)},e.onsuccess=function(t){i&&i(!0)}}else i&&i(t)})},OrgChart.toolbarUI=function(){},OrgChart.toolbarUI.expandAllIcon='<svg style="margin-bottom:7px;box-shadow: 0px 1px 4px rgba(0,0,0,0.3); border: 1px solid #cacaca;background-color: #f9f9f9;display: block;cursor: pointer;" width="32px" height="32px"><marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#757575" /></marker><line x1="11" y1="11" x2="6" y2="6" stroke="#757575" stroke-width="2" marker-end="url(#arrow)" /><line x1="21" y1="11" x2="26" y2="6" stroke="#757575" stroke-width="2" marker-end="url(#arrow)" /><line x1="21" y1="21" x2="26" y2="26" stroke="#757575" stroke-width="2" marker-end="url(#arrow)" /><line x1="11" y1="21" x2="6" y2="26" stroke="#757575" stroke-width="2" marker-end="url(#arrow)" /><rect x="12" y="12" width="8" height="8" fill="#757575"></rect></svg>',OrgChart.toolbarUI.fitIcon='<svg  style="margin-bottom:7px;box-shadow: 0px 1px 4px rgba(0,0,0,0.3); border: 1px solid #cacaca;background-color: #f9f9f9;display: block;cursor: pointer;" width="32px" height="32px"><path stroke-width="3" fill="none" stroke="#757575" d="M4,11 L4,4 L11,4"></path><path stroke-width="3" fill="none" stroke="#757575" d="M28,11 L28,4 L21,4"></path><path stroke-width="3" fill="none" stroke="#757575" d="M28,21 L28,28 L21,28"></path><path stroke-width="3" fill="none" stroke="#757575" d="M4,21 L4,28 L11,28"></path><circle cx="16" cy="16" r="5" fill="#757575"></circle></svg>',OrgChart.toolbarUI.openFullScreenIcon='<svg  style="margin-bottom:7px;box-shadow: 0px 1px 4px rgba(0,0,0,0.3); border: 1px solid #cacaca;background-color: #f9f9f9;display: block;cursor: pointer;" width="32px" height="32px"><path stroke-width="3" fill="none" stroke="#757575" d="M4,11 L4,4 L11,4"></path><path stroke-width="3" fill="none" stroke="#757575" d="M28,11 L28,4 L21,4"></path><path stroke-width="3" fill="none" stroke="#757575" d="M28,21 L28,28 L21,28"></path><path stroke-width="3" fill="none" stroke="#757575" d="M4,21 L4,28 L11,28"></path><line x1="5" y1="5" x2="27" y2="27" stroke-width="3" stroke="#757575"></line><line x1="5" y1="27" x2="27" y2="5" stroke-width="3" stroke="#757575"></line></svg>',OrgChart.toolbarUI.closeFullScreenIcon='<svg  style="margin-bottom:7px;box-shadow: 0px 1px 4px rgba(0,0,0,0.3); border: 1px solid #cacaca;background-color: #f9f9f9;display: block;cursor: pointer;" width="32px" height="32px"><path stroke-width="3" fill="none" stroke="#757575" d="M4,11 L4,4 L11,4"></path><path stroke-width="3" fill="none" stroke="#757575" d="M28,11 L28,4 L21,4"></path><path stroke-width="3" fill="none" stroke="#757575" d="M28,21 L28,28 L21,28"></path><path stroke-width="3" fill="none" stroke="#757575" d="M4,21 L4,28 L11,28"></path><rect x="11" y="11" width="10" height="10" stroke-width="3" fill="none" stroke="#757575" ></rect></svg>',OrgChart.toolbarUI.zoomInIcon='<svg style="box-shadow: 0px 1px 4px rgba(0,0,0,0.3); border-left: 1px solid #cacaca; border-right: 1px solid #cacaca; border-top: 1px solid #cacaca; background-color: #f9f9f9;display: block; cursor: pointer;" width="32px" height="32px" ><g><rect fill="#f9f9f9" x="0" y="0" width="32" height="32" ></rect><line x1="8" y1="16" x2="24" y2="16" stroke-width="3" stroke="#757575"></line><line x1="16" y1="8" x2="16" y2="24" stroke-width="3" stroke="#757575"></line></g><line x1="4" y1="32" x2="28" y2="32" stroke-width="1" stroke="#cacaca"></line></svg>',OrgChart.toolbarUI.zoomOutIcon='<svg style="box-shadow: 0px 1px 4px rgba(0,0,0,0.3); margin-bottom:7px; border-left: 1px solid #cacaca; border-right: 1px solid #cacaca; border-bottom: 1px solid #cacaca; background-color: #f9f9f9;display: block; cursor: pointer;" width="32px" height="32px" ><g><rect fill="#f9f9f9" x="0" y="0" width="32" height="32" ></rect><line x1="8" y1="16" x2="24" y2="16" stroke-width="3" stroke="#757575"></line></g></svg>',OrgChart.toolbarUI.layoutIcon='<svg data-tlbr="layout" style="box-shadow: 0px 1px 4px rgba(0,0,0,0.3); border: 1px solid #cacaca;background-color: #f9f9f9;display: block;cursor: pointer;" width="32px" height="32px"><path stroke-width="3" fill="none" stroke="#757575" d="M8,24 L16,14 L24,24"></path><path stroke-width="3" fill="none" stroke="#757575" d="M8,16 L16,8 L24,16"></path></svg>',OrgChart.toolbarUI.prototype.init=function(t,e){if(e){this.obj=t,this.toolbar=e,this._visible=!1,this.div=document.createElement("div"),this.div.classList.add("bg-toolbar-container"),Object.assign(this.div.style,{position:"absolute",padding:"3px",right:this.obj.config.padding+"px",bottom:this.obj.config.padding+"px"}),e.expandAll&&(this.div.innerHTML+='<div data-tlbr="expand">'+OrgChart.toolbarUI.expandAllIcon+"</div>"),e.fullScreen&&(this.div.innerHTML+='<div data-tlbr="fullScreen">'+OrgChart.toolbarUI.openFullScreenIcon+"</div>"),e.fit&&(this.div.innerHTML+='<div data-tlbr="fit">'+OrgChart.toolbarUI.fitIcon+"</div>"),e.zoom&&(this.div.innerHTML+='<div data-tlbr="plus">'+OrgChart.toolbarUI.zoomInIcon+"</div>",this.div.innerHTML+='<div data-tlbr="minus">'+OrgChart.toolbarUI.zoomOutIcon+"</div>"),e.layout&&(this.div.innerHTML+='<div data-tlbr="layout">'+OrgChart.toolbarUI.layoutIcon+"</div>",this.layouts=document.createElement("div"),this.layouts.innerHTML='<svg data-layout="normal" style="cursor: pointer;" width="110" height="100"><rect fill="#039BE5" x="35" y="0" width="50" height="27"></rect><rect fill="#F57C00" x="7" y="41" width="50" height="27"></rect><rect fill="#F57C00" x="63" y="41" width="50" height="27"></rect><line stroke="#000000" x1="60" x2="60" y1="27" y2="35" stroke-width="1"></line><line stroke="#000000" x1="32" x2="88" y1="35" y2="35" stroke-width="1"></line><line stroke="#000000" x1="32" x2="32" y1="35" y2="41" stroke-width="1"></line><line stroke="#000000" x1="88" x2="88" y1="35" y2="41" stroke-width="1"></line></svg><svg data-layout="treeRightOffset" style="cursor: pointer;" width="110" height="100"><rect fill="#039BE5" x="35" y="0" width="50" height="27"></rect><rect fill="#F57C00" x="40" y="41" width="50" height="27"></rect><rect fill="#F57C00" x="40" y="73" width="50" height="27"></rect><line stroke="#000000" x1="60" x2="60" y1="27" y2="35" stroke-width="1"></line><line stroke="#000000" x1="60" x2="35" y1="35" y2="35" stroke-width="1"></line><line stroke="#000000" x1="35" x2="35" y1="35" y2="86" stroke-width="1"></line><line stroke="#000000" x1="35" x2="40" y1="86" y2="86" stroke-width="1"></line><line stroke="#000000" x1="35" x2="40" y1="54" y2="54" stroke-width="1"></line></svg><svg data-layout="treeLeftOffset" style="cursor: pointer;" width="110" height="100"><rect fill="#039BE5" x="35" y="0" width="50" height="27"></rect><rect fill="#F57C00" x="30" y="41" width="50" height="27"></rect><rect fill="#F57C00" x="30" y="73" width="50" height="27"></rect><line stroke="#000000" x1="60" x2="60" y1="27" y2="35" stroke-width="1"></line><line stroke="#000000" x1="60" x2="85" y1="35" y2="35" stroke-width="1"></line><line stroke="#000000" x1="85" x2="85" y1="35" y2="86" stroke-width="1"></line><line stroke="#000000" x1="80" x2="85" y1="86" y2="86" stroke-width="1"></line><line stroke="#000000" x1="80" x2="85" y1="54" y2="54" stroke-width="1"></line></svg><svg data-layout="mixed" style="cursor: pointer;" width="110" height="100"><rect fill="#039BE5" x="35" y="0" width="50" height="27"></rect><rect fill="#F57C00" x="35" y="41" width="50" height="27"></rect><rect fill="#F57C00" x="35" y="73" width="50" height="27"></rect><line stroke="#000000" x1="60" x2="60" y1="27" y2="41" stroke-width="1"></line><line stroke="#000000" x1="60" x2="60" y1="68" y2="73" stroke-width="1"></line></svg><svg data-layout="tree" style="cursor: pointer;" width="110" height="100"><rect fill="#039BE5" x="35" y="0" width="50" height="27"></rect><rect fill="#F57C00" x="7" y="41" width="50" height="27"></rect><rect fill="#F57C00" x="7" y="73" width="50" height="27"></rect><rect fill="#F57C00" x="63" y="41" width="50" height="27"></rect><rect fill="#F57C00" x="63" y="73" width="50" height="27"></rect><line stroke="#000000" x1="60" x2="60" y1="27" y2="86" stroke-width="1"></line><line stroke="#000000" x1="57" x2="63" y1="54" y2="54" stroke-width="1"></line><line stroke="#000000" x1="57" x2="63" y1="86" y2="86" stroke-width="1"></line></svg>',this.obj.element.appendChild(this.layouts),Object.assign(this.layouts.style,{position:"absolute",width:"100%",left:"0",bottom:"-145px","box-shadow":"0px 1px 4px rgba(0,0,0,0.3)","background-color":"#f9f9f9",height:"123px","padding-top":"20px","border-top":"1px solid #cacaca"})),this.obj.element.appendChild(this.div),this.layoutBtn=this.div.querySelector('[data-tlbr="layout"]');var r=this.div.querySelector('[data-tlbr="plus"]'),i=this.div.querySelector('[data-tlbr="minus"]'),a=this.div.querySelector('[data-tlbr="fit"]'),o=this.div.querySelector('[data-tlbr="fullScreen"]'),n=this.div.querySelector('[data-tlbr="expand"]'),l=this;r&&r.addEventListener("click",function(){l.obj.zoom(!0,null,!0)}),i&&i.addEventListener("click",function(){l.obj.zoom(!1,null,!0)}),a&&a.addEventListener("click",function(){l.obj.fit()}),o&&o.addEventListener("click",function(){l.obj.toggleFullScreen()}),n&&n.addEventListener("click",function(){l.obj.expand(null,"all")}),this.layoutBtn&&this.layoutBtn.addEventListener("click",function(){l._visible?l.hideLayout():l.showLayout()}),this.layouts&&this.layouts.addEventListener("click",function(t){for(var e=t.target;e;){if(e.hasAttribute&&e.hasAttribute("data-layout")){e=e.getAttribute("data-layout"),l.obj.setLayout(OrgChart[e]);break}e=e.parentNode}})}},OrgChart.toolbarUI.prototype.showLayout=function(){this._visible=!0,this.layoutBtn.style.transform="rotate(180deg) translateX(0px) translateY(0px)",OrgChart.anim(this.div,{bottom:this.obj.config.padding},{bottom:this.obj.config.padding+145},this.obj.config.anim.duration,this.obj.config.anim.func),OrgChart.anim(this.layouts,{bottom:-145},{bottom:0},this.obj.config.anim.duration,this.obj.config.anim.func)},OrgChart.toolbarUI.prototype.hideLayout=function(){this._visible=!1,this.layoutBtn.style.transform="rotate(0deg) translateX(0px) translateY(0px)",OrgChart.anim(this.div,{bottom:this.obj.config.padding+145},{bottom:this.obj.config.padding},this.obj.config.anim.duration,this.obj.config.anim.func),OrgChart.anim(this.layouts,{bottom:0},{bottom:-145},this.obj.config.anim.duration,this.obj.config.anim.func)},OrgChart.notifierUI=function(){},OrgChart.notifierUI.prototype.init=function(t){this.obj=t},OrgChart.notifierUI.prototype.show=function(t,e){if(null!=t){1==t&&(t=OrgChart.MAX_NODES_MESS,e="#FFCA28"),2==t&&(t=OrgChart.OFFLINE_MESS,e="#FFCA28");var r=document.createElement("div");r.innerHTML=t,Object.assign(r.style,{position:"absolute","background-color":e,color:"#ffffff",padding:"15px","border-radius":"40px",opacity:0,overflow:"hidden","white-space":"nowrap","text-align":"center"}),this.obj.element.appendChild(r);var i=this.obj.width()/2-r.offsetWidth/2,a=this.obj.height()/2-r.offsetHeight/2;r.style.left=i+"px",r.style.top=a+"px";var o=r.offsetWidth;r.style.width="20px",OrgChart.anim(r,{opacity:0,width:10},{opacity:1,width:o},this.obj.config.anim.duration,this.obj.config.anim.func)}},OrgChart.icon={},OrgChart.icon.png=function(t,e,r){return'<svg width="'+t+'" height="'+e+'" viewBox="0 0 550.801 550.801"><path fill="'+r+'" d="M146.747,276.708c0-13.998-9.711-22.352-26.887-22.352c-6.99,0-11.726,0.675-14.204,1.355v44.927 c2.932,0.676,6.539,0.896,11.52,0.896C135.449,301.546,146.747,292.28,146.747,276.708z"/><path fill="'+r+'" d="M488.426,197.019H475.2v-63.816c0-0.398-0.063-0.799-0.116-1.202c-0.021-2.534-0.827-5.023-2.562-6.995L366.325,3.694 c-0.032-0.031-0.063-0.042-0.085-0.076c-0.633-0.707-1.371-1.295-2.151-1.804c-0.231-0.155-0.464-0.285-0.706-0.419 c-0.676-0.369-1.393-0.675-2.131-0.896c-0.2-0.056-0.38-0.138-0.58-0.19C359.87,0.119,359.037,0,358.193,0H97.2 c-11.918,0-21.6,9.693-21.6,21.601v175.413H62.377c-17.049,0-30.873,13.818-30.873,30.873v160.545 c0,17.043,13.824,30.87,30.873,30.87h13.224V529.2c0,11.907,9.682,21.601,21.6,21.601h356.4c11.907,0,21.6-9.693,21.6-21.601 V419.302h13.226c17.044,0,30.871-13.827,30.871-30.87v-160.54C519.297,210.838,505.47,197.019,488.426,197.019z M97.2,21.605 h250.193v110.513c0,5.967,4.841,10.8,10.8,10.8h95.407v54.108H97.2V21.605z M234.344,335.86v45.831h-31.601V229.524h40.184 l31.611,55.759c9.025,16.031,18.064,34.983,24.825,52.154h0.675c-2.257-20.103-2.933-40.643-2.933-63.44v-44.473h31.614v152.167 h-36.117l-32.516-58.703c-9.049-16.253-18.971-35.892-26.438-53.727l-0.665,0.222C233.906,289.58,234.344,311.027,234.344,335.86z M71.556,381.691V231.56c10.613-1.804,25.516-3.159,46.506-3.159c21.215,0,36.353,4.061,46.509,12.192 c9.698,7.673,16.255,20.313,16.255,35.219c0,14.897-4.959,27.549-13.999,36.123c-11.738,11.063-29.123,16.031-49.441,16.031 c-4.522,0-8.593-0.231-11.736-0.675v54.411H71.556V381.691z M453.601,523.353H97.2V419.302h356.4V523.353z M485.652,374.688 c-10.61,3.607-30.713,8.585-50.805,8.585c-27.759,0-47.872-7.003-61.857-20.545c-13.995-13.1-21.684-32.97-21.452-55.318 c0.222-50.569,37.03-79.463,86.917-79.463c19.644,0,34.783,3.829,42.219,7.446l-7.214,27.543c-8.369-3.617-18.752-6.55-35.458-6.55 c-28.656,0-50.341,16.256-50.341,49.22c0,31.382,19.649,49.892,47.872,49.892c7.895,0,14.218-0.901,16.934-2.257v-31.835h-23.493 v-26.869h56.679V374.688z"/></svg>'},OrgChart.icon.pdf=function(t,e,r){return'<svg width="'+t+'" height="'+e+'" viewBox="0 0 550.801 550.801"><path fill="'+r+'" d="M160.381,282.225c0-14.832-10.299-23.684-28.474-23.684c-7.414,0-12.437,0.715-15.071,1.432V307.6 c3.114,0.707,6.942,0.949,12.192,0.949C148.419,308.549,160.381,298.74,160.381,282.225z"/><path fill="'+r+'" d="M272.875,259.019c-8.145,0-13.397,0.717-16.519,1.435v105.523c3.116,0.729,8.142,0.729,12.69,0.729 c33.017,0.231,54.554-17.946,54.554-56.474C323.842,276.719,304.215,259.019,272.875,259.019z"/><path fill="'+r+'" d="M488.426,197.019H475.2v-63.816c0-0.398-0.063-0.799-0.116-1.202c-0.021-2.534-0.827-5.023-2.562-6.995L366.325,3.694 c-0.032-0.031-0.063-0.042-0.085-0.076c-0.633-0.707-1.371-1.295-2.151-1.804c-0.231-0.155-0.464-0.285-0.706-0.419 c-0.676-0.369-1.393-0.675-2.131-0.896c-0.2-0.056-0.38-0.138-0.58-0.19C359.87,0.119,359.037,0,358.193,0H97.2 c-11.918,0-21.6,9.693-21.6,21.601v175.413H62.377c-17.049,0-30.873,13.818-30.873,30.873v160.545 c0,17.043,13.824,30.87,30.873,30.87h13.224V529.2c0,11.907,9.682,21.601,21.6,21.601h356.4c11.907,0,21.6-9.693,21.6-21.601 V419.302h13.226c17.044,0,30.871-13.827,30.871-30.87v-160.54C519.297,210.838,505.47,197.019,488.426,197.019z M97.2,21.605 h250.193v110.513c0,5.967,4.841,10.8,10.8,10.8h95.407v54.108H97.2V21.605z M362.359,309.023c0,30.876-11.243,52.165-26.82,65.333 c-16.971,14.117-42.82,20.814-74.396,20.814c-18.9,0-32.297-1.197-41.401-2.389V234.365c13.399-2.149,30.878-3.346,49.304-3.346 c30.612,0,50.478,5.508,66.039,17.226C351.828,260.69,362.359,280.547,362.359,309.023z M80.7,393.499V234.365 c11.241-1.904,27.042-3.346,49.296-3.346c22.491,0,38.527,4.308,49.291,12.928c10.292,8.131,17.215,21.534,17.215,37.328 c0,15.799-5.25,29.198-14.829,38.285c-12.442,11.728-30.865,16.996-52.407,16.996c-4.778,0-9.1-0.243-12.435-0.723v57.67H80.7 V393.499z M453.601,523.353H97.2V419.302h356.4V523.353z M484.898,262.127h-61.989v36.851h57.913v29.674h-57.913v64.848h-36.593 V232.216h98.582V262.127z"/></svg>'},OrgChart.icon.svg=function(t,e,r){return'<svg width="'+t+'" height="'+e+'" viewBox="0 0 550.801 550.801"><path fill="'+r+'" d="M488.426,197.019H475.2v-63.816c0-0.398-0.063-0.799-0.116-1.202c-0.021-2.534-0.827-5.023-2.562-6.995L366.325,3.694 c-0.032-0.031-0.063-0.042-0.085-0.076c-0.633-0.707-1.371-1.295-2.151-1.804c-0.231-0.155-0.464-0.285-0.706-0.419 c-0.676-0.369-1.393-0.675-2.131-0.896c-0.2-0.056-0.38-0.138-0.58-0.19C359.87,0.119,359.037,0,358.193,0H97.2 c-11.918,0-21.6,9.693-21.6,21.601v175.413H62.377c-17.049,0-30.873,13.818-30.873,30.873v160.545 c0,17.043,13.824,30.87,30.873,30.87h13.224V529.2c0,11.907,9.682,21.601,21.6,21.601h356.4c11.907,0,21.6-9.693,21.6-21.601 V419.302h13.226c17.044,0,30.871-13.827,30.871-30.87v-160.54C519.297,210.838,505.47,197.019,488.426,197.019z M97.2,21.605 h250.193v110.513c0,5.967,4.841,10.8,10.8,10.8h95.407v54.108H97.2V21.605z M338.871,225.672L284.545,386.96h-42.591 l-51.69-161.288h39.967l19.617,68.196c5.508,19.143,10.531,37.567,14.36,57.67h0.717c4.061-19.385,9.089-38.527,14.592-56.953 l20.585-68.918h38.77V225.672z M68.458,379.54l7.415-30.153c9.811,5.021,24.888,10.051,40.439,10.051 c16.751,0,25.607-6.935,25.607-17.465c0-10.052-7.662-15.795-27.05-22.734c-26.8-9.328-44.263-24.168-44.263-47.611 c0-27.524,22.971-48.579,61.014-48.579c18.188,0,31.591,3.823,41.159,8.131l-8.126,29.437c-6.465-3.116-17.945-7.657-33.745-7.657 c-15.791,0-23.454,7.183-23.454,15.552c0,10.296,9.089,14.842,29.917,22.731c28.468,10.536,41.871,25.365,41.871,48.094 c0,27.042-20.812,50.013-65.09,50.013C95.731,389.349,77.538,384.571,68.458,379.54z M453.601,523.353H97.2V419.302h356.4V523.353z M488.911,379.54c-11.243,3.823-32.537,9.103-53.831,9.103c-29.437,0-50.73-7.426-65.57-21.779 c-14.839-13.875-22.971-34.942-22.738-58.625c0.253-53.604,39.255-84.235,92.137-84.235c20.81,0,36.852,4.073,44.74,7.896 l-7.657,29.202c-8.859-3.829-19.849-6.95-37.567-6.95c-30.396,0-53.357,17.233-53.357,52.173c0,33.265,20.81,52.882,50.73,52.882 c8.375,0,15.072-0.96,17.94-2.395v-33.745h-24.875v-28.471h60.049V379.54L488.911,379.54z" /></svg>'},OrgChart.icon.csv=function(t,e,r){return'<svg width="'+t+'" height="'+e+'" viewBox="0 0 548.29 548.291" ><path fill="'+r+'" d="M486.2,196.121h-13.164V132.59c0-0.399-0.064-0.795-0.116-1.2c-0.021-2.52-0.824-5-2.551-6.96L364.656,3.677 c-0.031-0.034-0.064-0.044-0.085-0.075c-0.629-0.707-1.364-1.292-2.141-1.796c-0.231-0.157-0.462-0.286-0.704-0.419 c-0.672-0.365-1.386-0.672-2.121-0.893c-0.199-0.052-0.377-0.134-0.576-0.188C358.229,0.118,357.4,0,356.562,0H96.757 C84.893,0,75.256,9.649,75.256,21.502v174.613H62.093c-16.972,0-30.733,13.756-30.733,30.73v159.81 c0,16.966,13.761,30.736,30.733,30.736h13.163V526.79c0,11.854,9.637,21.501,21.501,21.501h354.777 c11.853,0,21.502-9.647,21.502-21.501V417.392H486.2c16.966,0,30.729-13.764,30.729-30.731v-159.81 C516.93,209.872,503.166,196.121,486.2,196.121z M96.757,21.502h249.053v110.006c0,5.94,4.818,10.751,10.751,10.751h94.973v53.861 H96.757V21.502z M258.618,313.18c-26.68-9.291-44.063-24.053-44.063-47.389c0-27.404,22.861-48.368,60.733-48.368 c18.107,0,31.447,3.811,40.968,8.107l-8.09,29.3c-6.43-3.107-17.862-7.632-33.59-7.632c-15.717,0-23.339,7.149-23.339,15.485 c0,10.247,9.047,14.769,29.78,22.632c28.341,10.479,41.681,25.239,41.681,47.874c0,26.909-20.721,49.786-64.792,49.786 c-18.338,0-36.449-4.776-45.497-9.77l7.38-30.016c9.772,5.014,24.775,10.006,40.264,10.006c16.671,0,25.488-6.908,25.488-17.396 C285.536,325.789,277.909,320.078,258.618,313.18z M69.474,302.692c0-54.781,39.074-85.269,87.654-85.269 c18.822,0,33.113,3.811,39.549,7.149l-7.392,28.816c-7.38-3.084-17.632-5.939-30.491-5.939c-28.822,0-51.206,17.375-51.206,53.099 c0,32.158,19.051,52.4,51.456,52.4c10.947,0,23.097-2.378,30.241-5.238l5.483,28.346c-6.672,3.34-21.674,6.919-41.208,6.919 C98.06,382.976,69.474,348.424,69.474,302.692z M451.534,520.962H96.757v-103.57h354.777V520.962z M427.518,380.583h-42.399 l-51.45-160.536h39.787l19.526,67.894c5.479,19.046,10.479,37.386,14.299,57.397h0.709c4.048-19.298,9.045-38.352,14.526-56.693 l20.487-68.598h38.599L427.518,380.583z" /></svg>'},OrgChart.icon.excel=function(t,e,r){return'<svg width="'+t+'" height="'+e+'" viewBox="0 0 512 512"><path fill="#ECEFF1" d="M496,432.011H272c-8.832,0-16-7.168-16-16s0-311.168,0-320s7.168-16,16-16h224 c8.832,0,16,7.168,16,16v320C512,424.843,504.832,432.011,496,432.011z" /><path fill="'+r+'" d="M336,176.011h-64c-8.832,0-16-7.168-16-16s7.168-16,16-16h64c8.832,0,16,7.168,16,16 S344.832,176.011,336,176.011z" /><path fill="'+r+'" d="M336,240.011h-64c-8.832,0-16-7.168-16-16s7.168-16,16-16h64c8.832,0,16,7.168,16,16 S344.832,240.011,336,240.011z" /><path fill="'+r+'" d="M336,304.011h-64c-8.832,0-16-7.168-16-16s7.168-16,16-16h64c8.832,0,16,7.168,16,16 S344.832,304.011,336,304.011z" /><path fill="'+r+'" d="M336,368.011h-64c-8.832,0-16-7.168-16-16s7.168-16,16-16h64c8.832,0,16,7.168,16,16 S344.832,368.011,336,368.011z" /><path fill="'+r+'" d="M432,176.011h-32c-8.832,0-16-7.168-16-16s7.168-16,16-16h32c8.832,0,16,7.168,16,16 S440.832,176.011,432,176.011z" /><path fill="'+r+'" d="M432,240.011h-32c-8.832,0-16-7.168-16-16s7.168-16,16-16h32c8.832,0,16,7.168,16,16 S440.832,240.011,432,240.011z" /><path fill="'+r+'" d="M432,304.011h-32c-8.832,0-16-7.168-16-16s7.168-16,16-16h32c8.832,0,16,7.168,16,16 S440.832,304.011,432,304.011z" /><path fill="'+r+'" d="M432,368.011h-32c-8.832,0-16-7.168-16-16s7.168-16,16-16h32c8.832,0,16,7.168,16,16 S440.832,368.011,432,368.011z" /><path fill="'+r+'"  d="M282.208,19.691c-3.648-3.04-8.544-4.352-13.152-3.392l-256,48C5.472,65.707,0,72.299,0,80.011v352 c0,7.68,5.472,14.304,13.056,15.712l256,48c0.96,0.192,1.952,0.288,2.944,0.288c3.712,0,7.328-1.28,10.208-3.68 c3.68-3.04,5.792-7.584,5.792-12.32v-448C288,27.243,285.888,22.731,282.208,19.691z" /><path fill="#FAFAFA" d="M220.032,309.483l-50.592-57.824l51.168-65.792c5.44-6.976,4.16-17.024-2.784-22.464 c-6.944-5.44-16.992-4.16-22.464,2.784l-47.392,60.928l-39.936-45.632c-5.856-6.72-15.968-7.328-22.56-1.504 c-6.656,5.824-7.328,15.936-1.504,22.56l44,50.304L83.36,310.187c-5.44,6.976-4.16,17.024,2.784,22.464 c2.944,2.272,6.432,3.36,9.856,3.36c4.768,0,9.472-2.112,12.64-6.176l40.8-52.48l46.528,53.152 c3.168,3.648,7.584,5.504,12.032,5.504c3.744,0,7.488-1.312,10.528-3.968C225.184,326.219,225.856,316.107,220.032,309.483z" /></svg>'},OrgChart.icon.edit=function(t,e,r){return'<svg width="'+t+'" height="'+e+'" viewBox="0 0 528.899 528.899"><path fill="'+r+'" d="M328.883,89.125l107.59,107.589l-272.34,272.34L56.604,361.465L328.883,89.125z M518.113,63.177l-47.981-47.981 c-18.543-18.543-48.653-18.543-67.259,0l-45.961,45.961l107.59,107.59l53.611-53.611 C532.495,100.753,532.495,77.559,518.113,63.177z M0.3,512.69c-1.958,8.812,5.998,16.708,14.811,14.565l119.891-29.069 L27.473,390.597L0.3,512.69z" /></svg>'},OrgChart.icon.details=function(t,e,r){return'<svg width="'+t+'" height="'+e+'" viewBox="0 0 512 512"><path fill="'+r+'" d="M447.933,103.629c-0.034-3.076-1.224-6.09-3.485-8.352L352.683,3.511c-0.004-0.004-0.007-0.005-0.011-0.008 C350.505,1.338,347.511,0,344.206,0H89.278C75.361,0,64.04,11.32,64.04,25.237v461.525c0,13.916,11.32,25.237,25.237,25.237 h333.444c13.916,0,25.237-11.32,25.237-25.237V103.753C447.96,103.709,447.937,103.672,447.933,103.629z M356.194,40.931 l50.834,50.834h-49.572c-0.695,0-1.262-0.567-1.262-1.262V40.931z M423.983,486.763c0,0.695-0.566,1.261-1.261,1.261H89.278 c-0.695,0-1.261-0.566-1.261-1.261V25.237c0-0.695,0.566-1.261,1.261-1.261h242.94v66.527c0,13.916,11.322,25.239,25.239,25.239 h66.527V486.763z"/><path fill="'+r+'" d="M362.088,164.014H149.912c-6.62,0-11.988,5.367-11.988,11.988c0,6.62,5.368,11.988,11.988,11.988h212.175 c6.62,0,11.988-5.368,11.988-11.988C374.076,169.381,368.707,164.014,362.088,164.014z"/><path fill="'+r+'" d="M362.088,236.353H149.912c-6.62,0-11.988,5.368-11.988,11.988c0,6.62,5.368,11.988,11.988,11.988h212.175 c6.62,0,11.988-5.368,11.988-11.988C374.076,241.721,368.707,236.353,362.088,236.353z"/><path fill="'+r+'" d="M362.088,308.691H149.912c-6.62,0-11.988,5.368-11.988,11.988c0,6.621,5.368,11.988,11.988,11.988h212.175 c6.62,0,11.988-5.367,11.988-11.988C374.076,314.06,368.707,308.691,362.088,308.691z"/><path fill="'+r+'" d="M256,381.031H149.912c-6.62,0-11.988,5.368-11.988,11.988c0,6.621,5.368,11.988,11.988,11.988H256 c6.62,0,11.988-5.367,11.988-11.988C267.988,386.398,262.62,381.031,256,381.031z"/></svg>'},OrgChart.icon.remove=function(t,e,r){return'<svg width="'+t+'" height="'+e+'"  viewBox="0 0 900.5 900.5"><path fill="'+r+'" d="M176.415,880.5c0,11.046,8.954,20,20,20h507.67c11.046,0,20-8.954,20-20V232.487h-547.67V880.5L176.415,880.5z M562.75,342.766h75v436.029h-75V342.766z M412.75,342.766h75v436.029h-75V342.766z M262.75,342.766h75v436.029h-75V342.766z"/><path fill="'+r+'" d="M618.825,91.911V20c0-11.046-8.954-20-20-20h-297.15c-11.046,0-20,8.954-20,20v71.911v12.5v12.5H141.874 c-11.046,0-20,8.954-20,20v50.576c0,11.045,8.954,20,20,20h34.541h547.67h34.541c11.046,0,20-8.955,20-20v-50.576 c0-11.046-8.954-20-20-20H618.825v-12.5V91.911z M543.825,112.799h-187.15v-8.389v-12.5V75h187.15v16.911v12.5V112.799z"/></svg>'},OrgChart.icon.add=function(t,e,r){return'<svg width="'+t+'" height="'+e+'"   viewBox="0 0 922 922"><path fill="'+r+'" d="M922,453V81c0-11.046-8.954-20-20-20H410c-11.045,0-20,8.954-20,20v149h318c24.812,0,45,20.187,45,45v198h149 C913.046,473.001,922,464.046,922,453z" /><path fill="'+r+'" d="M557,667.001h151c11.046,0,20-8.954,20-20v-174v-198c0-11.046-8.954-20-20-20H390H216c-11.045,0-20,8.954-20,20v149h194 h122c24.812,0,45,20.187,45,45v4V667.001z" /><path fill="'+r+'" d="M0,469v372c0,11.046,8.955,20,20,20h492c11.046,0,20-8.954,20-20V692v-12.501V667V473v-4c0-11.046-8.954-20-20-20H390H196 h-12.5H171H20C8.955,449,0,457.955,0,469z" /></svg>'},OrgChart.icon.search=function(t,e){return'<svg width="'+t+'" height="'+e+'" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 485.213 485.213"><path fill="#757575" d="M471.882,407.567L360.567,296.243c-16.586,25.795-38.536,47.734-64.331,64.321l111.324,111.324 c17.772,17.768,46.587,17.768,64.321,0C489.654,454.149,489.654,425.334,471.882,407.567z" /><path fill="#757575" d="M363.909,181.955C363.909,81.473,282.44,0,181.956,0C81.474,0,0.001,81.473,0.001,181.955s81.473,181.951,181.955,181.951 C282.44,363.906,363.909,282.437,363.909,181.955z M181.956,318.416c-75.252,0-136.465-61.208-136.465-136.46 c0-75.252,61.213-136.465,136.465-136.465c75.25,0,136.468,61.213,136.468,136.465 C318.424,257.208,257.206,318.416,181.956,318.416z" /><path fill="#757575" d="M75.817,181.955h30.322c0-41.803,34.014-75.814,75.816-75.814V75.816C123.438,75.816,75.817,123.437,75.817,181.955z" /></svg>'},OrgChart.icon.addInGroup=function(t,e,r){return'<svg width="'+t+'" height="'+e+'"   viewBox="0 0 922 922"><path fill="'+r+'" d="M922,453V81c0-11.046-8.954-20-20-20H410c-11.045,0-20,8.954-20,20v149h318c24.812,0,45,20.187,45,45v198h149 C913.046,473.001,922,464.046,922,453z" /><path fill="'+r+'" d="M557,667.001h151c11.046,0,20-8.954,20-20v-174v-198c0-11.046-8.954-20-20-20H390H216c-11.045,0-20,8.954-20,20v149h194 h122c24.812,0,45,20.187,45,45v4V667.001z" /><path fill="'+r+'" d="M0,469v372c0,11.046,8.955,20,20,20h492c11.046,0,20-8.954,20-20V692v-12.501V667V473v-4c0-11.046-8.954-20-20-20H390H196 h-12.5H171H20C8.955,449,0,457.955,0,469z" /></svg>'},OrgChart.icon.addAsChild=function(t,e,r){return'<svg width="'+t+'" height="'+e+'" viewBox="0 0 922 922"><path fill="'+r+'" d="M922,453V81c0-11.046-8.954-20-20-20H410c-11.045,0-20,8.954-20,20v149h318c24.812,0,45,20.187,45,45v198h149 C913.046,473.001,922,464.046,922,453z" /><path fill="'+r+'" d="M557,667.001h151c11.046,0,20-8.954,20-20v-174v-198c0-11.046-8.954-20-20-20H390H216c-11.045,0-20,8.954-20,20v149h194 h122c24.812,0,45,20.187,45,45v4V667.001z" /><path fill="'+r+'" d="M0,469v372c0,11.046,8.955,20,20,20h492c11.046,0,20-8.954,20-20V692v-12.501V667V473v-4c0-11.046-8.954-20-20-20H390H196 h-12.5H171H20C8.955,449,0,457.955,0,469z" /></svg>'},OrgChart.icon.xml=function(t,e,r){return'<svg width="'+t+'" height="'+e+'" viewBox="0 0 550.801 550.801"><path fill="'+r+'"  d="M488.426,197.019H475.2v-63.816c0-0.401-0.063-0.799-0.116-1.205c-0.021-2.534-0.827-5.023-2.562-6.992L366.325,3.691 c-0.032-0.031-0.063-0.042-0.085-0.073c-0.633-0.707-1.371-1.298-2.151-1.804c-0.231-0.158-0.464-0.287-0.706-0.422 c-0.676-0.366-1.393-0.675-2.131-0.896c-0.2-0.053-0.38-0.135-0.58-0.19C359.87,0.119,359.037,0,358.193,0H97.2 c-11.918,0-21.6,9.693-21.6,21.601v175.413H62.377c-17.049,0-30.873,13.818-30.873,30.87v160.542 c0,17.044,13.824,30.876,30.873,30.876h13.224V529.2c0,11.907,9.682,21.601,21.6,21.601h356.4c11.907,0,21.6-9.693,21.6-21.601 V419.302h13.226c17.044,0,30.871-13.827,30.871-30.87V227.89C519.297,210.838,505.47,197.019,488.426,197.019z M97.2,21.605 h250.193v110.51c0,5.967,4.841,10.8,10.8,10.8h95.407v54.108H97.2V21.605z M369.531,374.53h-32.058l-2.156-55.519 c-0.644-17.434-1.298-38.518-1.298-59.611h-0.633c-4.514,18.516-10.547,39.166-16.137,56.162l-17.645,56.601h-25.618 l-15.494-56.157c-4.725-16.996-9.671-37.658-13.123-56.6h-0.43c-0.854,19.585-1.508,41.961-2.586,60.038l-2.576,55.086h-30.343 l9.26-145.035h43.677l14.207,48.421c4.517,16.774,9.041,34.847,12.258,51.843h0.654c4.081-16.77,9.038-35.923,13.774-52.064 l15.493-48.199h42.82L369.531,374.53z M69.992,374.53l41.955-73.385l-40.444-71.65h37.655l12.688,26.465 c4.316,8.828,7.533,15.928,10.99,24.092h0.422c3.438-9.242,6.23-15.694,9.893-24.092l12.274-26.465h37.434l-40.89,70.796 l43.044,74.239h-37.866l-13.134-26.257c-5.376-10.108-8.817-17.639-12.909-26.04h-0.433c-3.009,8.401-6.674,15.932-11.19,26.04 l-12.042,26.257H69.992z M453.601,523.353H97.2V419.302h356.4V523.353z M485.325,374.53h-90.608V229.495h32.933v117.497h57.682 v27.538H485.325z"/></svg>'},OrgChart.prototype.exportPDF=function(t,e){t=this._defaultExportOptions(t,"pdf"),this._export(t,e)},OrgChart.prototype.exportPNG=function(t,e){t=this._defaultExportOptions(t,"png"),this._export(t,e)},OrgChart.prototype.exportSVG=function(t,e){t=this._defaultExportOptions(t,"svg"),this._export(t,e)},OrgChart.prototype._defaultExportOptions=function(t,e){if(null==t&&(t={}),"svg"==e?(t.ext="svg",t.mime="image/svg+xml"):"pdf"==e?(t.mime="application/pdf",t.ext="pdf"):"png"==e&&(t.mime="image/png",t.ext="png"),null==t.margin&&(t.margin=[50,40,50,40]),null==t.landscape&&(t.landscape=!1),null==t.filename&&(t.filename="OrgChart."+t.ext),null==t.scale&&(t.scale="fit"),null==t.format&&(t.format="fit"),null==t.header&&(t.header=""),null==t.footer&&(t.footer=""),null==t.openInNewTab&&(t.openInNewTab=!1),null!=t.nodeId){var r=this.getBGNode(t.nodeId);r.isChildOfGroup&&(t.nodeId=r._groupParentNodeId)}return t},OrgChart.prototype._export=function(a,o){var n=this,t={id:a.nodeId,expandChildren:a.expandChildren};this._draw(!1,OrgChart.action.exporting,t,function(t){var r=document.createElement("div");if(r.innerHTML=t,"svg"==a.ext)if(o)o(a,r.innerHTML);else{var e={content:r.innerHTML,options:a},i=OrgChart.events.publish("exportstart",[n,e]);if(!1===i)return!1;if(OrgChart._downloadFile(a.mime,e.content,e.options.filename,e.options.openInNewTab),!1===(i=OrgChart.events.publish("exportend",[n,e])))return!1}else n._pages(a,r.querySelector("svg"),function(t){var e={content:r.innerHTML,options:a,pages:t};if(!1===OrgChart.events.publish("exportstart",[n,e]))return!1;o||OrgChart.loading.show(n),o?o(n,e,r.querySelector("svg")):(e=JSON.stringify(e),OrgChart._ajax(n.config.exportUrl+"/v3","POST",e,"arraybuffer",function(t){if(!1===OrgChart.events.publish("exportend",[n,t]))return!1;OrgChart.loading.hide(n),OrgChart._downloadFile(a.mime,t,a.filename,a.openInNewTab)}))})})},OrgChart.prototype.exportCSV=function(t){t||(t="OrgChart.csv");var e={ext:"csv",filename:t,nodes:JSON.parse(JSON.stringify(this.config.nodes))};if(!1===OrgChart.events.publish("exportstart",[this,e]))return!1;var r=OrgChart._json2csv(e.nodes),i={ext:e.ext,filename:e.filename,nodes:e.nodes,content:r};if(!1===OrgChart.events.publish("exportend",[this,i]))return!1;OrgChart._downloadFile("text/csv;charset=utf-8;","\ufeff"+i.content,i.filename,i.openInNewTab)},OrgChart.prototype.exportXML=function(t){t||(t="OrgChart.xml");var e={ext:"xml",filename:t,nodes:JSON.parse(JSON.stringify(this.config.nodes))};if(!1===OrgChart.events.publish("exportstart",[this,e]))return!1;var r=OrgChart._json2xml(e.nodes),i={ext:e.ext,filename:e.filename,nodes:e.nodes,content:r};if(!1===OrgChart.events.publish("exportend",[this,i]))return!1;OrgChart._downloadFile("application/xml",i.content,i.filename,i.openInNewTab)},OrgChart.prototype._pages=function(t,e,r){"fit2Levels"==t.format?this._pagesFit2Levels(t,r):"A42Levels"==t.format||"A32Levels"==t.format||"A22Levels"==t.format||"A12Levels"==t.format?this._pagesA2Levels(t,r):"A4"==t.format&&"fit"!=t.scale||"A3"==t.format&&"fit"!=t.scale||"A2"==t.format&&"fit"!=t.scale||"A1"==t.format&&"fit"!=t.scale?r(this._pagesA100(t,e,t.scale)):"A4"==t.format&&"fit"==t.scale||"A3"==t.format&&"fit"==t.scale||"A2"==t.format&&"fit"==t.scale||"A1"==t.format&&"fit"==t.scale?r(this._pagesAfit(t,e)):"fit"==t.format&&r(this._pagesFit(t,e))},OrgChart.prototype._pagesA2Levels=function(n,l){var s=this,h=this.config.collapse,d=this.config.roots;this.config.collapse={level:2};var t={id:n.nodeId,expandChildren:n.expandChildren},c=[],g=[];for(var e in this.nodes){this.destroy,(0!=(i=this.nodes[e]).childrenIds.length||0==i.childrenIds.length&&null==i.pid)&&(i.isAssistant||"split"==i.templateName||g.push(i.id))}for(var r=0;r<g.length;r++){e=g[r];var i=this.nodes[e];this.config.roots=[i.id],function(r){s._draw(!1,OrgChart.action.exporting,t,function(t){var e=document.createElement("div");e.innerHTML=t,function(t,e){for(var r=t.querySelector("svg"),i=s._pagesAfit(n,r),a=0;a<i.length;a++){var o=i[a];o.html=t.innerHTML,c.push(o)}g.length-1==e&&(s.config.collapse=h,s.config.roots=d,l(c))}(e,r)})}(r)}},OrgChart.prototype._pagesFit2Levels=function(n,l){var s=this,h=this.config.collapse,d=this.config.roots;this.config.collapse={level:2};var t={id:n.nodeId,expandChildren:n.expandChildren},c=[],g=[];for(var e in this.nodes){var r=this.nodes[e];(0!=r.childrenIds.length||0==r.childrenIds.length&&null==r.pid)&&(r.isAssistant||"split"==r.templateName||g.push(r.id))}for(var i=0;i<g.length;i++){e=g[i];this.config.roots=[e],function(r){s._draw(!1,OrgChart.action.exporting,t,function(t){var e=document.createElement("div");e.innerHTML=t,function(t,e){for(var r=t.querySelector("svg"),i=s._pagesFit(n,r),a=0;a<i.length;a++){var o=i[a];o.html=t.innerHTML,c.push(o)}g.length-1==e&&(s.config.collapse=h,s.config.roots=d,l(c))}(e,r)})}(i)}},OrgChart.prototype._pagesFit=function(t,e){var r=e.getAttribute("width"),i=e.getAttribute("height"),a=OrgChart.pdfPrevUI._getViewBox(e),o={w:parseFloat(r),h:parseFloat(i)};return[{vb:a,size:{w:o.w+(t.margin[1]+t.margin[3]),h:o.h+(t.margin[0]+t.margin[2])},innerSize:o}]},OrgChart.prototype._pagesAfit=function(t,e){var r=e.getAttribute("width"),i=e.getAttribute("height"),a=0,o=0;switch(t.format){case"A4":case"A42Levels":a=OrgChart.A4w,o=OrgChart.A4h;break;case"A3":case"A32Levels":a=OrgChart.A3w,o=OrgChart.A3h;case"A2":case"A22Levels":a=OrgChart.A2w,o=OrgChart.A2h;case"A1":case"A12Levels":a=OrgChart.A1w,o=OrgChart.A1h}var n=OrgChart.pdfPrevUI._getViewBox(e),l={w:t.landscape?o-(t.margin[1]+t.margin[3]):a-(t.margin[1]+t.margin[3]),h:t.landscape?a-(t.margin[0]+t.margin[2]):o-(t.margin[0]+t.margin[2])},s={w:t.landscape?o:a,h:t.landscape?a:o},h=r/l.w,d=i/l.h,c=d<h?h:d,g=n[0],p=n[1]/c,f=n[2],u=n[3]/c;e.setAttribute("width",l.w),e.setAttribute("height",l.h),e.setAttribute("preserveAspectRatio","xMidYMin meet");for(var C=l.h,m=g,O=p,v=[];O<u;){var x=[m,O*c,f,u];x=x.join(),v.push({vb:x,innerSize:l,size:s}),O+=l.h,i<(C+=l.h)&&(C=i)}return v},OrgChart.prototype._pagesA100=function(t,e,r){var i=OrgChart.pdfPrevUI._getViewBox(e),a=0,o=0;switch(t.format){case"A4":case"A42Levels":a=OrgChart.A4w,o=OrgChart.A4h;break;case"A3":case"A32Levels":a=OrgChart.A3w,o=OrgChart.A3h;case"A2":case"A22Levels":a=OrgChart.A2w,o=OrgChart.A2h;case"A1":case"A12Levels":a=OrgChart.A1w,o=OrgChart.A1h}var n=i[0],l=i[1],s=i[2],h=i[3],d={w:t.landscape?o-(t.margin[1]+t.margin[3]):a-(t.margin[1]+t.margin[3]),h:t.landscape?a-(t.margin[0]+t.margin[2]):o-(t.margin[0]+t.margin[2])},c={w:t.landscape?o:a,h:t.landscape?a:o};e.setAttribute("preserveAspectRatio","xMinYMin slice"),e.setAttribute("width",d.w),e.setAttribute("height",d.h);for(var g=n,p=l,f=d.w*(100/r),u=d.h*(100/r),C=[];g<s;){for(;p<h;){var m=[g,p,g+f,u];m=m.join(),C.push({vb:m,innerSize:d,size:c}),p+=u}g+=f,p=l}return C},void 0===OrgChart&&(OrgChart={}),OrgChart.events=function(){var n={};return{on:function(t,e,r){Array.isArray(n[t])||(n[t]=[]),n[t].push({listener:e,event_id:r})},removeAll:function(t){Array.isArray(n[t])||(n[t]=[]),n[t]=[]},removeForEventId:function(t){for(var e in n)if(Array.isArray(n[e]))for(var r=n[e].length-1;0<=r;r--)n[e][r].event_id==t&&n[e].splice(r,1)},publish:function(t,e){if(n[t]){for(var r=[],i=0;i<n[t].length;i++){var a=n[t][i];null!=a.event_id&&a.event_id!=e[0]._event_id||r.push(a.listener)}if(0<r.length){var o=!0;for(i=0;i<r.length;i++)1==e.length?o=r[i](e[0])&&o:2==e.length?o=r[i](e[0],e[1])&&o:3==e.length?o=r[i](e[0],e[1],e[2])&&o:4==e.length?o=r[i](e[0],e[1],e[2],e[3])&&o:5==e.length&&(o=r[i](e[0],e[1],e[2],e[3],e[4])&&o);return o}}}}}(),OrgChart.prototype.importCSV=function(){var h=this,t=document.createElement("INPUT");t.setAttribute("type","file"),t.setAttribute("accept",".csv"),t.style.display="none",t.onchange=function(t){var e=t.target,s=new FileReader;s.onload=function(){for(var t=s.result,e=OrgChart._csvToArray(t,","),r=[],i=1;i<e.length;i++){for(var a={},o=0;o<e[i].length;o++){var n=e[0][o],l=e[i][o];if("tags"==n&&""!=l)l=l.split(",");else if("tags"==n&&""==l)continue;a[n]=l}""!=a.id.trim()&&r.push(a)}0!=OrgChart.events.publish("import",[h,r])&&(h.config.nodes=r,h.draw())},s.readAsText(e.files[0])},t.click()},OrgChart.prototype.importXML=function(){var i=this,t=document.createElement("INPUT");t.setAttribute("type","file"),t.setAttribute("accept",".xml"),t.style.display="none",t.onchange=function(t){var e=t.target,r=new FileReader;r.onload=function(){var t=r.result,e=OrgChart._xml2json(t);0!=OrgChart.events.publish("import",[i,e])&&(i.config.nodes=e,i.draw())},r.readAsText(e.files[0])},t.click()},OrgChart.prototype.expand=function(t,e,r){var i={id:t,ids:e,state:OrgChart.EXPAND};this._draw(!1,OrgChart.action.expandCollapse,i,r)},OrgChart.prototype.collapse=function(t,e,r){var i={id:t,ids:e,state:OrgChart.COLLAPSE};this._draw(!1,OrgChart.action.expandCollapse,i,r)},OrgChart.prototype.expandCollapseToLevel=function(t,e,r,i){this.config.collapse=e,null==r&&(r={}),this.config.expand=r;var a={id:t,method:"expandCollapseToLevel"};this._draw(!1,OrgChart.action.expandCollapse,a,i)},OrgChart.prototype.maximize=function(t,e){var r={id:t,state:OrgChart.EXPAND};this._draw(!1,OrgChart.action.groupMaxMin,r,e)},OrgChart.prototype.minimize=function(t,e){var r={id:t,state:OrgChart.COLLAPSE};this._draw(!1,OrgChart.action.groupMaxMin,r,e)},OrgChart.prototype._expCollHandler=function(t){this.nodeMenuUI.hide(),this.nodeContextMenuUI.hide(),this.dragDropMenuUI.hide(),this.menuUI.hide();var e=this.getBGNode(t);if(e.collapsedChildrenIds.length){if(!1===OrgChart.events.publish("expcollclick",[this,OrgChart.EXPAND,t,e.collapsedChildrenIds]))return!1;this.expand(t,e.collapsedChildrenIds,!1)}else{if(!1===OrgChart.events.publish("expcollclick",[this,OrgChart.COLLAPSE,t,e.childrenIds]))return!1;this.collapse(t,e.childrenIds,!1)}},OrgChart.prototype._maxMinHandler=function(t){this.nodeMenuUI.hide(),this.nodeContextMenuUI.hide(),this.dragDropMenuUI.hide(),this.menuUI.hide();var e=this.getBGNode(t);if(e.groupState==OrgChart.EXPAND){if(!1===OrgChart.events.publish("expcollclick",[this,OrgChart.COLLAPSE,t]))return!1;this.minimize(t)}else if(e.groupState==OrgChart.COLLAPSE){if(!1===OrgChart.events.publish("expcollclick",[this,OrgChart.EXPAND,t]))return!1;this.maximize(t)}},String.prototype.replaceAll=function(t,e){return this.replace(new RegExp(t,"g"),e)},String.prototype.splice=function(t,e,r){return this.slice(0,t)+r+this.slice(t+Math.abs(e))},"function"!=typeof Object.assign&&Object.defineProperty(Object,"assign",{value:function(t,e){"use strict";if(null==t)throw new TypeError("Cannot convert undefined or null to object");for(var r=Object(t),i=1;i<arguments.length;i++){var a=arguments[i];if(null!=a)for(var o in a)Object.prototype.hasOwnProperty.call(a,o)&&(r[o]=a[o])}return r},writable:!0,configurable:!0}),"function"!=typeof String.prototype.endsWith&&(String.prototype.endsWith=function(t){return-1!==this.indexOf(t,this.length-t.length)}),OrgChart.prototype._globalMouseDownHandler=function(t,e){var r={move:"mousemove",up:"mouseup",leave:"mouseleave"};if(-1!=e.type.indexOf("touch")&&(1==e.touches.length?this._touch={x:e.touches[0].clientX,y:e.touches[0].clientY}:this._touch=null,r={move:"touchmove",up:"touchend",touchstart:"touchstart"}),t==e.target)return e.stopPropagation(),e.preventDefault(),void this._mouseDownHandler(t,e,r);if(this.config.nodeMouseClick==OrgChart.action.pan){for(var i=e.target;i!=t&&!i.hasAttribute("control-expcoll-id");)i=i.parentNode;if(!i.hasAttribute("control-expcoll-id"))return e.stopPropagation(),e.preventDefault(),void this._mouseDownHandler(t,e,r)}for(var a=e.target;a!=t;){if(a.hasAttribute("node-id"))return e.stopPropagation(),e.preventDefault(),void this._nodeMouseDownHandler(a,e,r);a=a.parentNode}},OrgChart.prototype._globalClickHandler=function(t,e){if(-1!=e.type.indexOf("touch")&&this._touch&&1==e.changedTouches.length){if(e.changedTouches.length){var r=e.changedTouches[0].clientX,i=e.changedTouches[0].clientY,a=OrgChart.t(this.config.template,this.getScale()).size,o=this.getScale(),n=Math.abs(r-this._touch.x)/o,l=Math.abs(i-this._touch.y)/o;if(this._touch=null,n>a[0]/10)return;if(l>a[1]/10)return}}else if(-1!=e.type.indexOf("touch")&&null==this._touch)return;for(var s=e.target;s!=t;){if(s.hasAttribute("control-expcoll-id")){var h=s.getAttribute("control-expcoll-id");return void this._expCollHandler(h)}if(s.hasAttribute("control-maxmin-id")){h=s.getAttribute("control-maxmin-id");return void this._maxMinHandler(h)}if(s.hasAttribute("node-id")){h=s.getAttribute("node-id");return void this._nodeClickHandler(h,e)}if(s.hasAttribute("control-node-menu-id")){h=s.getAttribute("control-node-menu-id");return void this._nodeMenuClickHandler(h,s,e)}if(s.hasAttribute("control-add"))return void this._lonelyButtonHandler();s=s.parentNode}},OrgChart.prototype._globalContextHandler=function(t,e){for(var r=e.target;r!=t;){if(r.hasAttribute("node-id")){var i=r.getAttribute("node-id");return void this._nodeContextHandler(i,e)}r=r.parentNode}},OrgChart.prototype._nodeContextHandler=function(t,e){e.preventDefault(),this.searchUI.hide(),this.nodeMenuUI.hide(),this.nodeContextMenuUI.hide(),this.dragDropMenuUI.hide(),this.menuUI.hide();var r=this.get(t),i=null;if(null!=r&&Array.isArray(r.tags))for(var a=0;a<r.tags.length;a++){var o=r.tags[a];this.config.tags[o]&&this.config.tags[o].nodeContextMenu&&(i=this.config.tags[o].nodeContextMenu)}this.nodeContextMenuUI.show(e.pageX,e.pageY,t,null,i)},OrgChart.prototype._globalDbClickHandler=function(t,e){for(var r=e.target;r!=t;){if(r.hasAttribute("node-id")){var i=r.getAttribute("node-id");return void this._nodeDbClickHandler(i,e)}r=r.parentNode}},OrgChart.prototype._mouseScrollHandler=function(t,e){if(this.config.mouseScrool!=OrgChart.action.ctrlZoom||e.ctrlKey){var r=this,i=!1,a=this.config.zoom.speed,o=this.config.zoom.smooth,n=0,l=this.getScale(),s=OrgChart._centerPointInPercent(r.getSvg(),e.pageX,e.pageY),h=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(t){setTimeout(t,20)};e.preventDefault();var d=e.delta||e.wheelDelta;void 0===d&&(d=-e.detail),d=Math.max(-1,Math.min(1,d)),n+=-d*a,i||function t(){i=!0;var e=(n-l)/o;0<e?e++:e--,l+=e,r.zoom(1-e/12/50,s),parseInt(l)==parseInt(n)?i=!1:h(t)}()}},OrgChart.prototype._nodeMouseDownHandler=function(t,e,n){if(this.config.enableDragDrop){var r=OrgChart._getClientXY(e),i=t.getAttribute("node-id"),l=this.getBGNode(i);if(!1!==OrgChart.events.publish("drag",[this,i])){var s=null,h=null;this._gragStartedId=i,document.body.style.mozUserSelect=document.body.style.webkitUserSelect=document.body.style.userSelect="none";var d=this,c=this.getSvg(),g={x:r.x,y:r.y},p=OrgChart._getTransform(t),f=p[4],u=p[5],C=d.getScale(),m=t.cloneNode(!0);if(c.insertBefore(m,c.firstChild),m.style.opacity=.7,l.isChildOfGroup){var a=this.getNodeElement(l._groupParentNodeId),o=OrgChart._getTransform(a);f+=o[4],u+=o[5],p[4]=f,p[5]=u,m.setAttribute("transform","matrix("+p.toString()+")")}var O=function(t,e){if(null!=t){var r=d.getBGNode(t);r.isChildOfGroup&&(d.getNodeElement(r._groupParentNodeId).style.opacity=1),e.style.opacity=1}},v=function(t){var e=OrgChart._getClientXY(t),r=document.elementFromPoint(e.x,e.y);if(O(s,h),h=s=null,d.config.enableDragDrop)for(;null!=r&&r!=c;){if(r.hasAttribute("node-id")){var i=r.getAttribute("node-id");if(d._gragStartedId&&i!=d._gragStartedId){s=i,h=r;break}}r=r.parentNode}if(null!=s){var a=d.getBGNode(s);a.isChildOfGroup&&(d.getNodeElement(a._groupParentNodeId).style.opacity=.8),h.style.opacity=.5}var o=(e.x-g.x)/C,n=(e.y-g.y)/C;p[4]=f+o,p[5]=u+n,m.setAttribute("transform","matrix("+p.toString()+")")},x=function(t){if(c.removeEventListener(n.move,v),c.removeEventListener(n.up,x),n.leave&&c.removeEventListener(n.leave,x),l.id==s||l.isChildOfGroup&&l._groupParentNodeId==s||null==s)return O(s,h),c.removeChild(m),void(d._gragStartedId=null);var e=d.getBGNode(s);if(e.isChildOfGroup&&l.isChildOfGroup&&e._groupParentNodeId==l._groupParentNodeId)return O(s,h),c.removeChild(m),void(d._gragStartedId=null);if(!1===OrgChart.events.publish("drop",[d,l.id,e.id]))return O(s,h),c.removeChild(m),void(d._gragStartedId=null);if(null==d.config.dragDropMenu||l.isGroup&&!e.isGroup)d._canUpdateLink(l.id,s)?d.linkNode(l.id,s):(c.removeChild(m),O(s,h));else if(d._canUpdateLink(l.id,s)){var r=OrgChart._getOffsetXY(d.element,t),i=null;if(Array.isArray(l.tags))for(var a=0;a<l.tags.length;a++){var o=l.tags[a];d.config.tags[o]&&d.config.tags[o].dragDropMenu&&(i=d.config.tags[o].dragDropMenu)}d.dragDropMenuUI.show(r.x,r.y,l.id,s,i)}else c.removeChild(m),O(s,h);d._gragStartedId=null};c.addEventListener(n.move,v),c.addEventListener(n.up,x),n.leave&&c.addEventListener(n.leave,x)}}},OrgChart.prototype._resizeHandler=function(t,e){var r=this.getViewBox(),i=this.getSvg(),a=i.getAttribute("width"),o=i.getAttribute("height"),n=a/r[2],l=o/r[3],s=l<n?l:n;i.setAttribute("width",this.width()),i.setAttribute("height",this.height()),r[2]=this.width()/s,r[3]=this.height()/s,this.setViewBox(r),this.xScrollUI.create(this.width()),this.yScrollUI.create(this.height()),this._draw(!1,OrgChart.action.resize)},OrgChart.prototype._nodeDbClickHandler=function(t,e){if(!1===OrgChart.events.publish("dbclick",[this,this.get(t)]))return!1;this._commonClickHandler(t,e,this.config.nodeMouseDbClick)},OrgChart.prototype._nodeClickHandler=function(t,e){if(!1===OrgChart.events.publish("click",[this,{node:this.getBGNode(t),event:e}]))return!1;this._commonClickHandler(t,e,this.config.nodeMouseClick)},OrgChart.prototype._commonClickHandler=function(t,e,r){this.searchUI.hide(),this.nodeMenuUI.hide(),this.nodeContextMenuUI.hide(),this.dragDropMenuUI.hide(),this.menuUI.hide();var i=this.getBGNode(t);if(r==OrgChart.action.expandCollapse){if(i.collapsedChildrenIds.length){if(!1===OrgChart.events.publish("expcollclick",[this,OrgChart.EXPAND,t,i.collapsedChildrenIds]))return!1;this.expand(t,i.collapsedChildrenIds,!1)}else{if(!1===OrgChart.events.publish("expcollclick",[this,OrgChart.COLLAPSE,t,i.childrenIds]))return!1;this.collapse(t,i.childrenIds,!1)}this.ripple(i.id,e.clientX,e.clientY)}r==OrgChart.action.edit&&(this.editUI.show(i.id),this.ripple(i.id,e.clientX,e.clientY)),r==OrgChart.action.details&&(this.editUI.show(i.id,!0),this.ripple(i.id,e.clientX,e.clientY))},OrgChart.prototype._menuHandlerMouseDownHandler=function(t,e){e.stopPropagation(),e.preventDefault()},OrgChart.prototype._nodeMenuClickHandler=function(t,e,r){this.searchUI.hide(),this.nodeMenuUI.hide(),this.nodeContextMenuUI.hide(),this.dragDropMenuUI.hide(),this.menuUI.hide();var i=this.getBGNode(t),a=null;if(Array.isArray(i.tags))for(var o=0;o<i.tags.length;o++){var n=i.tags[o];this.config.tags[n]&&this.config.tags[n].nodeMenu&&(a=this.config.tags[n].nodeMenu)}this.nodeMenuUI.showStickIn(e,t,null,a)},OrgChart.prototype._exportMenuClickHandler=function(t,e){e.stopPropagation(),e.preventDefault(),this.nodeMenuUI.hide(),this.nodeContextMenuUI.hide(),this.dragDropMenuUI.hide(),this.menuUI.show(t.offsetLeft,t.offsetTop)},OrgChart.prototype._lonelyButtonHandler=function(){var t=new OrgChart.node(OrgChart._randomId(),null,[],this.config.template);!1!==this.addNode(t,!0)&&this.center(t.id)},OrgChart.prototype._move=function(t,e,r){r[0]=e,r[1]=t,this.setViewBox(r),this.xScrollUI.setPosition(),this.yScrollUI.setPosition()},void 0===OrgChart&&(OrgChart={}),OrgChart.node=function(t,e,r,i){this.templateName=i,this.id=t,this.pid=e,this.x=null,this.y=null,this.level=null,this.leftNeighbor=null,this.rightNeighbor=null,this._prelim=0,this._modifier=0,this.children=[],this.parent=null,this.isAssistant=!1,this.tags=r,this.collapsedChildrenIds=[],this.childrenIds=[];var a=OrgChart.t(this.templateName);this.w=a&&a.size?a.size[0]:0,this.h=a&&a.size?a.size[1]:0,this.groupState=OrgChart.EXPAND,this.isChildOfGroup=!1,this.isGroup=!1,this._groupParentNodeId=null,this._groupSettings=null,this.bgnodes=[]},OrgChart.prototype._mouseDownHandler=function(t,e,r){var s=this;document.body.style.mozUserSelect=document.body.style.webkitUserSelect=document.body.style.userSelect="none",this.editUI.hide(),this.searchUI.hide(),this.nodeMenuUI.hide(),this.nodeContextMenuUI.hide(),this.dragDropMenuUI.hide(),this.menuUI.hide();var h=this.getViewBox(),d=this.getScale(),i=OrgChart._getClientTouchesXY(e,0),a=OrgChart._getClientTouchesXY(e,1),c={diffX:0,diffY:0,x0:i.x,y0:i.y,type:"pan",viewBoxLeft:h[0],viewBoxTop:h[1]};e.touches&&1<e.touches.length&&(c.type="pinch",c.dist=Math.sqrt((i.x-a.x)*(i.x-a.x)+(i.y-a.y)*(i.y-a.y)));var o=this.getPointerElement();if("pan"==c.type){this._hideBeforeAnimation();var n=OrgChart._getOffsetXY(this.element,e),l=n.x/d+h[0]-16/d,g=n.y/d+h[1]-16/d;o.style.display="inherit",o.setAttribute("transform","matrix(0,0,0,0,"+l+","+g+")"),OrgChart.anim(o,{transform:[0,0,0,0,l,g],opacity:0},{transform:[1/d,0,0,1/d,l,g],opacity:1},300,OrgChart.anim.outBack)}var p=function(t){var e=OrgChart._getClientTouchesXY(t,0);if(c&&"pan"==c.type){s._hideBeforeAnimation(),c.diffX=e.x-c.x0,c.diffY=e.y-c.y0;var r=-c.diffY/d+c.viewBoxTop,i=-c.diffX/d+c.viewBoxLeft;s._move(r,i,h)}else if(c&&"pinch"==c.type){var a=OrgChart._getClientTouchesXY(t,1),o=Math.sqrt((e.x-a.x)*(e.x-a.x)+(e.y-a.y)*(e.y-a.y)),n=1+(o-c.dist)/(c.dist/100)/100;c.dist=o;var l=OrgChart._pinchMiddlePointInPercent(s.element,s.width(),s.height(),t);s.zoom(n,l)}},f=function(){"pan"==c.type&&s.config.sticky?OrgChart._moveToBoundaryArea(t,s.getViewBox(),s.response.boundary,function(){s._draw(!0,OrgChart.action.pan)}):"pan"!=c.type||s.config.sticky||s._draw(!0,OrgChart.action.pan),c=null,o.style.display="none",t.removeEventListener(r.move,p),t.removeEventListener(r.up,f),r.leave&&t.removeEventListener(r.leave,f),r.touchstart&&t.removeEventListener(r.touchstart,f)};t.addEventListener(r.move,p),t.addEventListener(r.up,f),r.leave&&t.addEventListener(r.leave,f),r.touchstart&&t.addEventListener(r.touchstart,f)},void 0===OrgChart&&(OrgChart={}),void 0===OrgChart.remote&&(OrgChart.remote={}),OrgChart.LIMIT_NODES=!0,OrgChart.remote._fromResDTO=function(t,e,r,i){var a=e[t.id];if(t.x=a.p[0],t.y=a.p[1],t.level=a.p[2],null!=a.l){var o=OrgChart.remote._find(i,a.l);t.leftNeighbor=o}if(null!=a.r){var n=OrgChart.remote._find(i,a.r);t.rightNeighbor=n}for(var l=0;l<t.children.length;l++)OrgChart.remote._fromResDTO(t.children[l],e,r,i)},OrgChart.remote._find=function(t,r){var i;return t.some(function t(e){return e.id===r?(i=e,!0):e.children.some(t)}),i},OrgChart.remote._toReqDTO=function(t,e,r){var i={p:[t.id,null!=t.parent?t.parent.id:null,t.w,t.h]};0<t.children.length&&(i.c=OrgChart.remote._convertToIdArray(t.children)),null!=t.layout&&0!=t.layout&&(i.l=t.layout),t.isAssistant&&(i.a=1),t.templateName!=r&&(i.t=t.templateName),e.push(i);for(var a=0;a<t.children.length;a++)OrgChart.remote._toReqDTO(t.children[a],e,r)},OrgChart.remote._convertToIdArray=function(t){for(var e=[],r=0;r<t.length;r++)e.push(t[r].id);return e},OrgChart.remote._walk=function(r,t,i){for(var e=[],a=[],o=[t.orientation,t.levelSeparation,t.mixedHierarchyNodesSeparation,t.subtreeSeparation,t.siblingSeparation,t.template],n=0;n<r.length;n++)a.push(r[n].id),OrgChart.remote._toReqDTO(r[n],e,t.template);var l={n:e,c:o,r:a,v:"6.0.0"};OrgChart.LIMIT_NODES||(l.l=!0),null!=OrgChart.remote._fromReqDTO?OrgChart.remote._fromReqDTO(l.n,l.r,l.c,function(t){for(var e=0;e<r.length;e++)OrgChart.remote._fromResDTO(r[e],t,0,r);i()}):(l=JSON.stringify(l),OrgChart.idb.read(l,function(t,e){t?OrgChart.remote._proceed(r,e.res,i):OrgChart.remote._findRegion(function(t){OrgChart._ajax(t,"post",l,"json",function(t){t.error?i(2):(OrgChart.remote._proceed(r,t,i),OrgChart.idb.write({id:l,res:t}))})})}))},OrgChart.remote._proceed=function(t,e,r){if("string"==typeof e&&(e=JSON.parse(e)),e.limit&&1==e.limit)r(e.limit);else{for(var i=0;i<t.length;i++)OrgChart.remote._fromResDTO(t[i],e,0,t);r()}},OrgChart.remote.getItem=function(t){return OrgChart._browser().msie||OrgChart._browser().edge?OrgChart.remote[t]:localStorage.getItem(t)},OrgChart.remote.setItem=function(t,e){OrgChart._browser().msie||OrgChart._browser().edge?OrgChart.remote[t]=e:localStorage.setItem(t,e)},OrgChart.remote._findRegion=function(r){var t=OrgChart.remote.getItem("funcUrl");if(t)r(t);else{for(var i=["au-e","au-se","brs","ca","ca-e","easia","eus-2","eus","fr","ind","jp-e","jp-w","kr","n-eu","se-asia","s-ind","uk-s","uk-w","us","us-n-c","us-s-c","w-c-us","w-eu","w-ind","w-us-2","wus"],a=[],o=0;o<i.length;o++)a.push(new XMLHttpRequest);for(o=0;o<i.length;o++)!function(){var e="https://"+i[o]+"-balkangraph.azurewebsites.net/api/OrgChartJS",t=a[o];t.onreadystatechange=function(){if(4==this.readyState&&200==this.status){OrgChart.remote.setItem("funcUrl",e),r(e);for(var t=0;t<a.length;t++)a[t].abort()}},t.open("GET",e,!0),t.send()}()}},OrgChart.searchUI=function(){},OrgChart.searchUI.prototype.init=function(t){this.obj=t},OrgChart.searchUI.prototype.hide=function(){var t=this.obj.element.querySelector('[data-id="search"]');if(t){var e=t.querySelector('[data-id="cell-1"]'),r=this.obj.element.getElementsByTagName("input")[0],i=this.obj.element.querySelector('[data-id="container"]');r.value="",i.innerHTML="","none"!=e.style.display&&"none"!=t.style.display&&OrgChart.anim(e,{opacity:e.style.opacity},{opacity:0},200,OrgChart.anim.inOutSin,function(){e.style.display="none",OrgChart.anim(t,{width:300,opacity:1},{width:50,opacity:0},300,OrgChart.anim.inBack,function(){t.style.display="none"})})}},OrgChart.searchUI.prototype.show=function(t){var e=this.obj.element.querySelector('[data-id="search"]'),r=e.querySelector('[data-id="cell-1"]');r.style.display="none",e.style.width="50px",e.style.display="block",e.style.opacity=0,OrgChart.anim(e,{width:50,opacity:0},{width:300,opacity:1},300,OrgChart.anim.outBack,function(){r.style.display="inherit",r.style.opacity=0,OrgChart.anim(r,{opacity:0},{opacity:1},200,OrgChart.anim.inOutSin),t&&t()})},OrgChart.searchUI.prototype.addSearchControl=function(){var r=this,t=document.createElement("div");t.innerHTML=OrgChart.searchUI.createSearchIcon(this.obj.config.padding),t.innerHTML+=OrgChart.searchUI.createInputField(this.obj.config.padding),this.obj.element.appendChild(t);var e=this.obj.element.querySelector('[data-id="search-icon"]'),i=this.obj.element.querySelector('[data-id="search"]'),a=this.obj.element.getElementsByTagName("input")[0];e.addEventListener("mouseover",function(){r.show()}),i.addEventListener("mouseleave",function(){document.activeElement!=a&&r.hide()}),i.addEventListener("click",function(){a.focus()}),a.addEventListener("keyup",function(t){40==t.keyCode?o():38==t.keyCode?n():13==t.keyCode?l():27==t.keyCode?r.hide():r._serverSearch(this.value)});var o=function(){var t=i.querySelectorAll("[data-search-item-id]"),e=i.querySelector('[data-selected="yes"]');null==e&&0<t.length?(t[0].setAttribute("data-selected","yes"),t[0].style.backgroundColor="#F0F0F0"):0<t.length&&e.nextSibling&&(e.setAttribute("data-selected","no"),e.style.backgroundColor="inherit",e.nextSibling.setAttribute("data-selected","yes"),e.nextSibling.style.backgroundColor="#F0F0F0")},n=function(){var t=i.querySelectorAll("[data-search-item-id]"),e=i.querySelector('[data-selected="yes"]');null==e&&0<t.length?(t[t.length-1].setAttribute("data-selected","yes"),t[t.length-1].style.backgroundColor="#F0F0F0"):0<t.length&&e.previousSibling&&(e.setAttribute("data-selected","no"),e.style.backgroundColor="inherit",e.previousSibling.setAttribute("data-selected","yes"),e.previousSibling.style.backgroundColor="#F0F0F0")},l=function(){var t=i.querySelector('[data-selected="yes"]').getAttribute("data-search-item-id"),e=OrgChart.events.publish("searchclick",[r.obj,t]);null!=e&&1!=e||r.obj.center(t)}},OrgChart.searchUI.prototype.find=function(e){var r=this;this.show(function(){var t=r.obj.element.getElementsByTagName("input")[0];t.value=e,r._serverSearch(e),t.focus()})},OrgChart.searchUI.prototype._serverSearch=function(t){for(var e=this,r=this.obj.element.querySelector('[data-id="container"]'),i=this.obj.element.querySelector('[data-id="search"]'),a=this.obj.server.find(t),o="",n=0;n<a.length;n++){var l=a[n],s="";l.img&&(s='<img style="padding: 2px 0px  2px 7px;width:32px;height:32px;" src="'+l.img+'" / >'),o+=OrgChart.searchUI.createItem(s,l)}r.innerHTML=o;var h=i.querySelectorAll("[data-search-item-id]");for(n=0;n<h.length;n++)h[n].addEventListener("click",function(){var t=OrgChart.events.publish("searchclick",[e.obj,this.getAttribute("data-search-item-id")]);null!=t&&1!=t||e.obj.center(this.getAttribute("data-search-item-id"))}),h[n].addEventListener("mouseover",function(){this.setAttribute("data-selected","yes"),this.style.backgroundColor="#F0F0F0"}),h[n].addEventListener("mouseleave",function(){this.style.backgroundColor="inherit",this.setAttribute("data-selected","no")})},OrgChart.searchUI.createInputField=function(t){return'<div data-id="search" style="display:none;border-radius: 20px 20px;padding:5px; box-shadow: #808080 0px 1px 2px 0px; font-family:Roboto-Regular, Helvetica;color:#7a7a7a;font-size:14px;border:1px solid #d7d7d7;width:300px;position:absolute;top:'+t+"px;left:"+t+'px;background-color:#ffffff;"><div><div style="float:left;">'+OrgChart.icon.search(32,32)+'</div><div data-id="cell-1" style="float:right; width:83%"><input placeholder="'+OrgChart.SEARCH_PLACEHOLDER+'" style="font-size:14px;font-family:Roboto-Regular, Helvetica;color:#7a7a7a;width:100%;border:none;outline:none; padding-top:10px;" type="text" /></div><div style="clear:both;"></div></div><div data-id="container"></div></div>'},OrgChart.searchUI.createItem=function(t,e){return'<div data-search-item-id="'+e.id+'" style="border-top:1px solid #d7d7d7; padding: 7px 0 7px 0;cursor:pointer;"><div style="float:left;">'+t+'</div><div style="float:right; width:83%"><div style="overflow:hidden; white-space: nowrap;text-overflow:ellipsis;text-align:left;">'+e.textId+'</div><div style="overflow:hidden; white-space: nowrap;text-overflow:ellipsis;text-align:left;">'+e.textInNode+'</div></div><div style="clear:both;"></div></div>'},OrgChart.searchUI.createSearchIcon=function(t){return'<div data-id="search-icon" style="padding:5px; position:absolute;top:'+t+"px;left:"+t+'px;border:1px solid transparent;"><div><div style="float:left;">'+OrgChart.icon.search(32,32)+"</div></div></div>"},void 0===OrgChart&&(OrgChart={}),OrgChart.server=function(t){this.config=t,this.visibleNodes=null,this.viewBox=null,this.action=null,this.actionParams=null,this.groupChildren={},this.nodes={},this.oldNodes={},this.maxX=null,this.maxY=null,this.minX=null,this.minY=null,this.root=null},OrgChart.server.prototype.read=function(t,r,i,e,a,o,n,l){var s=this;this.viewBox=e,this.action=a,this.actionParams=o;var h=this.maxX,d=this.maxY,c=this.minX,g=this.minY,p=this.root,f=this.nodes,u=this.groupChildren;if(t){var C=OrgChart.server._getResponse(r,i,this.visibleNodes,this.config,h,d,c,g,this.viewBox,p,this.action,this.actionParams,f,u,this.oldNodes);a!=OrgChart.action.exporting&&(this.maxX=h,this.maxY=d,this.minX=c,this.minY=g,this.root=p,this.nodes=f,this.groupChildren=u,this.visibleNodes=C.visibleNodes),n(C)}else this.oldNodes=f||null,this._read(function(t){h=t.maxX,d=t.maxY,c=t.minX,g=t.minY,p=t.roots[0],f=t.nodes,u=t.groupChildren;var e=OrgChart.server._getResponse(r,i,s.visibleNodes,s.config,h,d,c,g,s.viewBox,p,s.action,s.actionParams,f,u,s.oldNodes);e.notif=t.limit,a!=OrgChart.action.exporting&&(s.maxX=h,s.maxY=d,s.minX=c,s.minY=g,s.root=p,s.nodes=f,s.groupChildren=u,s.visibleNodes=e.visibleNodes),n(e)},l)},OrgChart.server.prototype._read=function(a,t){var o=this,n=OrgChart.server._createNodes(this.config,this.action,this.actionParams,this.oldNodes);t(n);var l=n.nodes,s=n.roots,e=OrgChart.remote;null==e&&(e=OrgChart.local),e._walk(s,this.config,function(t){OrgChart.server._doNotChangePositionOfClickedNodeIfAny(s,l,o.action,o.actionParams,o.oldNodes,o.config.orientation);var e={minX:null,minY:null,maxX:null,maxY:null};for(var r in l){var i=l[r];OrgChart.server._setMinMaxXY(i,e)}a({minX:e.minX,minY:e.minY,maxX:e.maxX,maxY:e.maxY,nodes:l,roots:s,groupChildren:n.groupChildren,limit:t})})},OrgChart.server.prototype.find=function(t){var r=this;if(null==t||null==t||""==t)return[];t=OrgChart.accentFold(t);for(var e,i,a,o=function(t){for(var e in r.config.nodeBinding)if(r.config.nodeBinding[e]==t)return!0;return!1},n=[],l=[],s=0;s<this.config.nodes.length;s++){var h=this.config.nodes[s];for(var d in h){var c=h[d];0<this.config.searchFields.length&&-1==this.config.searchFields.indexOf(d)||c&&-1!=OrgChart.accentFold(c).indexOf(t)&&!OrgChart._fieldIsImg(this.config,d)&&n.push({id:h.id,propertyName:d,isId:d==OrgChart.ID,isNodeParam:o(d),weight:OrgChart.accentFold(c).indexOf(t),data:h})}}n.sort(function(t,e){return 1==t.isId&&0==e.isId?-1:1==e.isId&&0==t.isId?1:1==t.isNodeParam&&0==e.isNodeParam?-1:1==e.isNodeParam&&0==t.isNodeParam?1:t.weight<e.weight?-1:t.weight>e.weight?1:0});for(s=0;s<n.length&&s!=OrgChart.SEARCH_RESULT_LIMIT;s++){for(var g=!1,p=0;p<l.length;p++)if(l[p].id==n[s].id){g=!0;break}if(!g){var f="",u="",C="",m="",O=Object.getOwnPropertyNames(n[s].data);0<this.config.searchFields.length&&(O=this.config.searchFields);for(p=0;p<O.length;p++){d=O[p],c=n[s].data[d];d===n[s].propertyName&&(e=c,i=t,void 0,a=OrgChart.accentFold(e).indexOf(i),c=e.toString().splice(a+i.length,0,"</mark>").splice(a,0,"<mark>")),d!=OrgChart.TAGS&&(d==OrgChart.ID?u=u+c+", ":OrgChart._fieldIsImg(this.config,d)?m=c:o(d)&&!OrgChart._fieldIsImg(this.config,d)?f=f+c+", ":OrgChart._fieldIsImg(this.config,d)||(C=C+c+", "))}u=u.slice(0,u.length-2),f=f.slice(0,f.length-2),C=C.slice(0,C.length-2);var v=OrgChart._getTemplate(n[s].tags,this.config.tags,this.config.template);l.push({id:n[s].id,node:new OrgChart.node(n[s],null,[],v),textId:u,textInNode:f,text:C,img:m})}}return l},void 0===OrgChart&&(OrgChart={}),OrgChart.server._createNodes=function(a,t,e,r){for(var i=a.nodes,o={},n=[],l=[],s=[],h={},d=!1,c=0;c<i.length;c++){var g=i[c],p=Array.isArray(g.tags)?g.tags.slice(0):[],f=OrgChart._getGroup(p,a.tags),u=OrgChart._getTemplate(p,a.tags,a.template);if((v=new OrgChart.node(g.id,g.pid,p,u)).isAssistant=-1!=p.indexOf("assistant"),v.isAssistant&&-1==s.indexOf(v.pid)&&OrgChart.server._isNotNullEmptyUndefined(v.pid)&&s.push(v.pid),null!=f){if(!o[f.name]){n.push(f.name);var C=new OrgChart.node(f.name,g.pid,[f.name],f.tag.template);C.isGroup=!0,null!=a.orderBy&&(C.order=OrgChart.server._getOrderFieldValue(g,a.orderBy)),o[f.name]=C}v.isChildOfGroup=!0,v._groupParentNodeId=f.name,o[f.name].bgnodes.push(v),1==v.isAssistant&&(o[f.name].isAssistant=!0),h[v.id]=f.name,d=!0}else null!=a.orderBy&&(v.order=OrgChart.server._getOrderFieldValue(g,a.orderBy)),o[g.id]=v,n.push(g.id)}if(null!=a.orderBy&&n.sort(function(t,e){var r=o[t].order,i=o[e].order;return"number"==typeof r||"number"==typeof i?(null==r&&(r=-1),null==i&&(i=-1),a.orderBy.desc?i-r:r-i):"string"==typeof r||"string"==typeof i?(null==r&&(r=""),null==i&&(i=""),a.orderBy.desc?i.localeCompare(r):r.localeCompare(i)):void 0}),d)for(c=0;c<n.length;c++){h[(v=o[n[c]]).pid]&&v.id!=h[v.pid]&&(v.pid=h[v.pid])}var m=[];for(c=0;c<n.length;c++){var O=n[c],v=o[O],x=r?r[O]:null;if(OrgChart.server._isNotNullEmptyUndefined(v.pid))(H=o[v.pid])?((v.parent=H).children.push(v),H.childrenIds.push(v.id)):(v.pid=null,v.parent=null,v.isAssistant=!1,l.push(v));else v.isAssistant=!1,l.push(v);t==OrgChart.action.exporting&&null!=e.id&&(l=[o[e.id]]),x?(v.state=x.state,v.state==OrgChart.COLLAPSE&&m.push(v.id),OrgChart.server._setNodeGroupState(v,x.groupState,a.orientation)):OrgChart.server._setNodeGroupState(v,OrgChart.EXPAND,a.orientation),OrgChart.server._initStates(v,o,t,a,e,m),OrgChart.server._initGroupStates(v,o,t,a,e)}if(null!=a.roots){l=[];for(c=0;c<a.roots.length;c++){var y=o[a.roots[c]];if(y){if(y.parent)for(var b=(H=y.parent).children.length-1;0<=b;b--){(U=H.children[b])==y&&(U.parent=null,H.children.splice(b,1),H.childrenIds.splice(b,1))}y.isAssistant=!1,l.push(y)}}}for(c=0;c<s.length;c++){if(null==(H=o[s[c]]))for(var O in o){var w=o[O].bgnodes;for(b=0;b<w.length;b++)if(w[b].id==s[c]){H=o[O];break}if(H)break}if(H){var k=new OrgChart.node(H.id+"_split_0",H.id,[],"split");(o[k.id]=k).isAssistant=!0,(x=r[k.id])&&(o[k.id].state=x.state,o[k.id].state==OrgChart.COLLAPSE&&m.push(k.id)),OrgChart.server._initStates(k,o,t,a,e,m);var _=[];for(b=H.children.length-1;0<=b;b--){(U=H.children[b]).isAssistant?(U.parent=null,H.children.splice(b,1),H.childrenIds.splice(b,1),_.splice(0,0,U.id)):(U.pid=k.id,(U.parent=k).children.unshift(U),k.childrenIds.unshift(U.id),H.children.splice(b,1))}if(_.length%2){var A=o[_[_.length-1]],S=[A.w,A.h],I="transperant_"+A.templateName;OrgChart.templates[I]={linkAdjuster:{},link:"",node:"",nodeMenuButton:"",size:S},(W=new OrgChart.node(H.id+"_transperant",A.pid,[],I)).isAssistant=!0,(x=r[(o[W.id]=W).id])&&(o[W.id].state=x.state,o[W.id].state==OrgChart.COLLAPSE&&-1==m.indexOf(W.id)&&m.push(W.id)),_.splice(_.length-1,0,W.id),OrgChart.server._initStates(W,o,t,a,e,m)}var N=1;for(b=_.length-1;0<=b;b--){if(b%2&&b!=_.length-1)(J=new OrgChart.node(H.id+"_split_"+N,null,[],"split")).isAssistant=!0,o[J.id]=J,_.splice(b,0,J.id),N++;else b%2&&_.splice(b,0,k.id)}for(b=0;b<_.length;b+=3){var M=null;M=0==b?H:o[_[b-2]];var E=o[_[b]],L=o[_[b+1]],B=o[_[b+2]];E.parent=M,E.pid=M.id,L.parent=M,L.pid=M.id,B.parent=M,B.pid=M.id,M.children.push(E),M.children.push(L),M.children.push(B),M.childrenIds.push(E.id),M.childrenIds.push(L.id),M.childrenIds.push(B.id);for(var T=M;"split"==T.templateName&&(T=T.parent);)T.childrenIds.push(E.id),T.childrenIds.push(L.id),T.childrenIds.push(B.id);(x=r[L.id])&&(o[L.id].state=x.state,o[L.id].state==OrgChart.COLLAPSE&&-1==m.indexOf(L.id)&&m.push(L.id)),OrgChart.server._initStates(L,o,t,a,e,m)}}}if(t==OrgChart.action.centerNode){var P=o[e.id];P||(P=o[h[e.id]],OrgChart.server._setNodeGroupState(P,OrgChart.EXPAND,a.orientation)),P.state=OrgChart.EXPAND,-1!=(D=m.indexOf(P.id))&&m.splice(D,1);for(var H=OrgChart.server._getRealParent(P),F=P.id;null!=H;){if(-1!=(D=m.indexOf(H.id))&&m.splice(D,1),H.state=OrgChart.EXPAND,e.options.parentState===OrgChart.COLLAPSE_PARENT_NEIGHBORS)for(c=0;c<H.childrenIds.length;c++){var U=o[H.childrenIds[c]];if(!OrgChart.server._isSplit(U)&&!U.isAssistant&&U.id!=F)-1==(D=m.indexOf(H.childrenIds[c]))&&m.push(H.childrenIds[c]),U.state=OrgChart.COLLAPSE}if(H.state==OrgChart.EXPAND)for(var z=0;z<H.childrenIds.length;z++){var j=o[H.childrenIds[z]];if(OrgChart.server._isSplit(j)||j.isAssistant)-1!=(D=m.indexOf(j.id))&&m.splice(D,1),j.state=OrgChart.EXPAND}F=H.id,H=OrgChart.server._getRealParent(H)}if(e.options.childrenState===OrgChart.COLLAPSE_SUB_CHILDRENS)for(c=0;c<P.childrenIds.length;c++){if(-1!=(D=m.indexOf(P.childrenIds[c]))&&m.splice(D,1),(U=o[P.childrenIds[c]]).state=OrgChart.EXPAND,!U.isAssistant&&!OrgChart.server._isSplit(U))for(b=0;b<U.childrenIds.length;b++){var D,G=o[U.childrenIds[b]];-1==(D=m.indexOf(U.childrenIds[b]))&&m.push(U.childrenIds[b]),G.state=OrgChart.COLLAPSE}}}t==OrgChart.action.exporting&&1==e.expandChildren&&v&&(m=[]);for(c=0;c<m.length;c++){if(H=(v=o[m[c]]).parent)for(b=H.children.length-1;0<=b;b--){if(H.children[b]==v)if(-1==H.collapsedChildrenIds.indexOf(v.id)&&H.collapsedChildrenIds.push(v.id),H.children.splice(b,1),"split"==H.templateName){if(M=v.parent){for(;"split"==M.templateName;)M=M.parent;for(var R=M.childrenIds.length-1;0<=R;R--){var X=M.childrenIds[R];-1==M.collapsedChildrenIds.indexOf(X)&&M.collapsedChildrenIds.push(X)}}}else v.parent=null}}if(a.layout==OrgChart.mixed)for(c=0;c<n.length;c++){if(0==(v=o[n[c]]).childrenIds.length&&!v.isAssistant&&"split"!=v.templateName)if(H=v.parent){if(!OrgChart.server._mixedLayoutAllNodes(H))continue;for(b=H.children.length-1;0<=b;b--){if((U=H.children[b])!=v&&0==U.childrenIds.length&&!U.isAssistant&&"split"!=U.templateName){U.parent=v,U.pid=v.id,U.layout=OrgChart.mixed,H.children.splice(b,1);var Y=v.children.length;v.children[Y]=U,v.layout=OrgChart.mixed}}}}if(a.layout==OrgChart.tree||a.layout==OrgChart.treeRightOffset||a.layout==OrgChart.treeLeftOffset){var q=[];for(c=0;c<n.length;c++){if(0==(v=o[n[c]]).childrenIds.length&&!v.isAssistant&&"split"!=v.templateName)(H=v.parent)&&-1==q.indexOf(H.id)&&q.push(H.id)}for(c=0;c<q.length;c++){H=o[q[c]],k=new OrgChart.node(H.id+"_split_0",H.id,[],"split");(o[k.id]=k).layout=OrgChart.tree;var V=[];for(b=H.children.length-1;0<=b;b--){if(OrgChart.server._mixedLayoutAllNodes(H))if(0==(U=H.children[b]).childrenIds.length&&!U.isAssistant&&"split"!=U.templateName&&(U.parent&&"split"!=U.parent.templateName||U.parent.isAssistant)){if((U=H.children[b]).parent=null,U.layout=OrgChart.tree,H.children.splice(b,1),H.childrenIds.splice(b,1),a.layout==OrgChart.treeRightOffset&&V.splice(0,0,U.id),a.layout==OrgChart.treeLeftOffset||a.layout==OrgChart.treeRightOffset){var W;I="transperant_"+U.templateName;OrgChart.templates[I]={linkAdjuster:{},link:"",node:"",nodeMenuButton:"",size:[0,0]},(W=new OrgChart.node(U.id+"_transperant",null,[],I)).layout=OrgChart.tree,o[W.id]=W,V.splice(0,0,W.id)}a.layout!=OrgChart.treeRightOffset&&V.splice(0,0,U.id)}}for(N=1,b=V.length-1;0<=b;b--){var J;if(b%2&&b!=V.length-1)(J=new OrgChart.node(H.id+"_split_"+N,null,[],"split")).layout=OrgChart.tree,o[J.id]=J,V.splice(b,0,J.id),N++;else b%2&&V.splice(b,0,k.id)}for(b=0;b<V.length;b+=3){M=null;0==b&&(M=H);E=o[V[b]],L=o[V[b+1]],B=o[V[b+2]];0!=b&&(M=o[V[b-3]]),0==b||L||(M=o[V[b-2]]),E.parent=M,E.pid=M.id,M.children.push(E),H.childrenIds.push(E.id),L&&(0!=b&&(M=o[V[b-2]]),L.parent=M,L.pid=M.id,M.children.push(L),H.childrenIds.push(L.id)),B&&(0!=b&&(M=o[V[b-1]]),B.parent=M,B.pid=M.id,M.children.push(B),H.childrenIds.push(B.id))}}}return{nodes:o,roots:l,groupChildren:h}},OrgChart.server._mixedLayoutAllNodes=function(t){if(OrgChart.MIXED_LAYOUT_ALL_NODES)return!0;for(var e=t.children.length-1;0<=e;e--){var r=t.children[e];if(0<r.childrenIds.length||r.isAssistant||"split"==r.templateName)return!1}return!0},OrgChart.server._getOrderFieldValue=function(t,e){var r=e;return e.field&&(r=e.field),t[r]},OrgChart.server._isSplit=function(t){return!!t&&"split"==t.templateName},OrgChart.server._getRealParent=function(t){if(!t)return null;if(!t.parent)return null;if("split"!=t.parent.templateName)return t.parent;for(var e=t.parent;e&&"split"==e.templateName;)e=e.parent;return e},OrgChart.server._initStates=function(t,e,r,i,a,o){if(r==OrgChart.action.init&&t){if(t.tags)for(var n=0;n<t.tags.length;n++){var l=t.tags[n];i.tags&&i.tags[l]&&null!=i.tags[l].state&&(i.tags[l].state==OrgChart.COLLAPSE&&o.push(t.id),t.state=i.tags[l].state)}OrgChart.server._expandCollapseToLevel(t,e,r,i,a,o)}else if(r==OrgChart.action.expandCollapse&&"expandCollapseToLevel"==a.method){-1!=(s=o.indexOf(t.id))&&o.splice(s,1),t.state=OrgChart.EXPAND,OrgChart.server._expandCollapseToLevel(t,e,r,i,a,o)}else if(r==OrgChart.action.expandCollapse&&(-1!=a.ids.indexOf(t.id)||"all"==a.ids)){if(a.state==OrgChart.COLLAPSE)o.push(t.id);else if(a.state==OrgChart.EXPAND){var s;-1!=(s=o.indexOf(t.id))&&o.splice(s,1)}t.state=a.state}},OrgChart.server._expandCollapseToLevel=function(t,e,r,i,a,o){if(i.collapse.level){var n=0;if(!i.roots||-1==i.roots.indexOf(t.id)){for(var l=e[t.pid];OrgChart.server._isSplit(l);)l=e[l.pid];for(;null!=l&&n<=i.collapse.level;){if(l&&i.roots&&-1!=i.roots.indexOf(l.id)){n++;break}l=e[l.pid],n++}}if(n>=i.collapse.level){var s=!1;if(Array.isArray(i.expand.nodes))if(i.expand.allChildren){for(l=e[t.pid];null!=l;){if(-1!=i.expand.nodes.indexOf(l.id)){s=!0;break}l=e[l.pid]}s||(s=-1!=i.expand.nodes.indexOf(t.id))}else s=-1!=i.expand.nodes.indexOf(t.id);!s&&i.collapse.allChildren?(o.push(t.id),t.state=OrgChart.COLLAPSE):s||i.collapse.allChildren||n!=i.collapse.level||(o.push(t.id),t.state=OrgChart.COLLAPSE)}}},OrgChart.server._initGroupStates=function(t,e,r,i,a){if(r==OrgChart.action.exporting&&1==a.expandChildren&&t)OrgChart.server._setNodeGroupState(t,OrgChart.EXPAND,i.orientation);else{if(r==OrgChart.action.init&&t&&t.isGroup){var o=i.tags[t.id].groupState;OrgChart.server._setNodeGroupState(t,o,i.orientation)}r==OrgChart.action.groupMaxMin&&OrgChart.server._setNodeGroupState(e[a.id],a.state,i.orientation)}},OrgChart.server._initNodeSize=function(t,e,r){var i=OrgChart.t(e),a=i.size[0],o=i.size[1];if(t.isGroup&&t.groupState==OrgChart.EXPAND){var n=t.bgnodes.length,l=0,s=null,h=o=a=0,d=0;switch(r){case OrgChart.orientation.top:case OrgChart.orientation.bottom:case OrgChart.orientation.top_left:case OrgChart.orientation.bottom_left:if(i.columns)s=n/(l=i.columns),s=Math.ceil(s);else{for(;null==s||l<s;)s=n/++l;2==l&&1.5==s&&(l=3,s=1),s=Math.ceil(s)}for(var c=0;c<t.bgnodes.length;c++)h=Math.max(t.bgnodes[c].w,h),d=Math.max(t.bgnodes[c].h,d);a=h*l+i.groupNodesSeparation*l+i.groupNodesSeparation+i.groupPadding[1]+i.groupPadding[3],o=d*s+i.groupNodesSeparation*s+i.groupNodesSeparation+i.groupPadding[0]+i.groupPadding[2];break;case OrgChart.orientation.right:case OrgChart.orientation.left:case OrgChart.orientation.right_top:case OrgChart.orientation.left_top:if(i.columns)l=n/(s=i.columns),l=Math.ceil(l);else{for(l=null,s=0;null==l||s<l;)l=n/++s;2==s&&1.5==l&&(s=3,l=1),l=Math.ceil(l)}for(c=0;c<t.bgnodes.length;c++)h=Math.max(t.bgnodes[c].w,h),d=Math.max(t.bgnodes[c].h,d);a=h*l+i.groupNodesSeparation*l+i.groupNodesSeparation+i.groupPadding[1]+i.groupPadding[3],o=d*s+i.groupNodesSeparation*s+i.groupNodesSeparation+i.groupPadding[0]+i.groupPadding[2]}t._groupSettings={_rows:s,_columns:l,_cellWidth:h,_cellHeight:d},OrgChart.server._setGroupNodes(t,r)}t.w=a,t.h=o},OrgChart.server._setNodeGroupState=function(t,e,r){t.groupState=e,OrgChart.server._initNodeSize(t,t.templateName,r)},OrgChart.server._getNodeWidth=function(t,e){switch(e.orientation){case OrgChart.orientation.top:case OrgChart.orientation.top_left:case OrgChart.orientation.bottom:case OrgChart.orientation.bottom_left:return t.w;case OrgChart.orientation.right:case OrgChart.orientation.right_top:case OrgChart.orientation.left:case OrgChart.orientation.left_top:return t.h}return 0},OrgChart.server._isVisible=function(t,e,r,i){if(null!=t.x&&null!=t.y){if(e.lazyLoading&&i!==OrgChart.action.exporting){function a(t,e){var r=t.x,i=t.y,a=t.w,o=t.h,n=e[0]-OrgChart.LAZY_LOADING_FACTOR,l=e[2]+OrgChart.LAZY_LOADING_FACTOR+e[0],s=e[1]-OrgChart.LAZY_LOADING_FACTOR,h=e[3]+OrgChart.LAZY_LOADING_FACTOR+e[1],d=n<r+a&&r<l;return d&&(d=s<i+o&&i<h),d}if(a(t,r))return!0;for(var o=0;o<t.children.length;o++)if(a(t.children[o],r))return!0;return!1}return!0}},OrgChart.server.getAllFields=function(t){var e=[OrgChart.TAGS];for(var r in t.nodeBinding)e.push(t.nodeBinding[r]);for(r=0;r<t.nodes.length;r++)for(var i in t.nodes[r])i!==OrgChart.ID&&i!==OrgChart.TAGS&&i!==OrgChart.NODES&&i!==OrgChart.PID&&(t.nodeBinding[i]||OrgChart._arrayContains(e,i)||e.push(i));return e},OrgChart.server._doNotChangePositionOfClickedNodeIfAny=function(t,e,r,i,a,o){if(r==OrgChart.action.expandCollapse||r==OrgChart.action.groupMaxMin||r==OrgChart.action.centerNode||r==OrgChart.action.update||r==OrgChart.action.insert){if(r==OrgChart.action.update&&(!i||null==i.id)){if(!t||!t.length)return;i={id:t[0].id}}if(null!=i.id){var n=i.id;r==OrgChart.action.groupMaxMin&&e[n].pid&&(n=e[n].pid);var l=e[n];if(!l)for(var s in e)for(var h=e[s].bgnodes,d=0;d<h.length;d++)if(h[d].id==n){l=e[s];break}var c=a[n];if(!c)for(var s in a)for(h=a[s].bgnodes,d=0;d<h.length;d++)if(h[d].id==n){c=a[s];break}if(c){var g=c.x-l.x,p=c.y-l.y;for(var n in e)switch(o){case OrgChart.orientation.top:case OrgChart.orientation.top_left:case OrgChart.orientation.bottom:case OrgChart.orientation.bottom_left:e[n].x+=g;break;case OrgChart.orientation.right:case OrgChart.orientation.right_top:case OrgChart.orientation.left:case OrgChart.orientation.left_top:e[n].y+=p}}}}},OrgChart.server._getMostDeepChild=function(t){if(t){var i=t;return function t(e){e.level>i.level&&(i=e);for(var r=0;r<e.children.length;r++)t(e.children[r])}(t),i}},OrgChart.server._setGroupNodes=function(t,e){if(t.isGroup&&t.groupState==OrgChart.EXPAND)for(var r=OrgChart.t(t.templateName),i=0,a=0,o=0;o<t.bgnodes.length;o++){var n=t.bgnodes[o];n.x=t._groupSettings._cellWidth/2-n.w/2+r.groupNodesSeparation+(t._groupSettings._cellWidth*i+r.groupNodesSeparation*i),n.y=t._groupSettings._cellHeight/2-n.h/2+r.groupNodesSeparation+(t._groupSettings._cellHeight*a+r.groupNodesSeparation*a),i>=t._groupSettings._columns-1?(i=0,a++):i++}},OrgChart.server._getResponse=function(t,e,r,i,a,o,n,l,s,h,d,c,g,p,f){var u={},C={top:null,left:null,bottom:null,right:null,minX:null,maxX:null,minY:null,maxY:null},m=[[],[],[]],O=a-n+2*i.padding,v=o-l+2*i.padding,x=OrgChart.getScale(s,t,e,i.scaleInitial,i.scaleMax,i.scaleMin,O,v);if(C.top=l-i.padding,C.left=n-i.padding,C.bottom=o+i.padding-e/x,C.right=a+i.padding-t/x,C.maxX=a,C.minX=n,C.maxY=o,C.minY=l,null==s&&i.align==OrgChart.CENTER){var y=Math.ceil(t/x),b=Math.ceil(e/x),w=0,k=0;if(y-2*i.padding>=a-n)switch(w=(a+n)/2-y/2,i.orientation){case OrgChart.orientation.right:case OrgChart.orientation.right_top:w=(n-a)/2-y/2}else switch(w=h.x-y/2+OrgChart.server._getNodeWidth(h,i)/2,i.orientation){case OrgChart.orientation.right:case OrgChart.orientation.right_top:(w=-(y/2-(n-a)/2))<i.padding-y&&(w=i.padding-y);break;case OrgChart.orientation.left:case OrgChart.orientation.bottom_left:case OrgChart.orientation.top_left:case OrgChart.orientation.left_top:(w=-(y/2-(a-n)/2))>-i.padding&&(w=-i.padding)}if(b-2*i.padding>=o-l)switch(k=(o+l)/2-b/2,i.orientation){case OrgChart.orientation.bottom:case OrgChart.orientation.bottom_left:k=(l-o)/2-b/2}else switch((k=-(b/2-(o-l)/2))>-i.padding&&(k=-i.padding),i.orientation){case OrgChart.orientation.bottom:case OrgChart.orientation.bottom_left:(k=-(b/2-(l-o)/2))<i.padding-b&&(k=i.padding-b);break;case OrgChart.orientation.left:case OrgChart.orientation.right:k=h.y-b/2+OrgChart.server._getNodeWidth(h,i)/2}s=[w,k,y,b]}else if(null==s&&i.align==OrgChart.ORIENTATION){y=Math.ceil(t/x),b=Math.ceil(e/x),w=0,k=0;switch(i.orientation){case OrgChart.orientation.top:w=h.x-y/2+OrgChart.server._getNodeWidth(h,i)/2,k=-i.padding;break;case OrgChart.orientation.bottom:w=h.x-y/2+OrgChart.server._getNodeWidth(h,i)/2,k=i.padding-b;break;case OrgChart.orientation.left:w=-i.padding,k=h.y-b/2+OrgChart.server._getNodeWidth(h,i)/2;break;case OrgChart.orientation.right:w=i.padding-y,k=h.y-b/2+OrgChart.server._getNodeWidth(h,i)/2;break;case OrgChart.orientation.top_left:w=-i.padding,k=-i.padding;break;case OrgChart.orientation.right_top:w=i.padding-y,k=-i.padding;break;case OrgChart.orientation.left_top:w=-i.padding,k=-i.padding;break;case OrgChart.orientation.bottom_left:w=-i.padding,k=i.padding-b}s=[w,k,y,b]}d==OrgChart.action.centerNode&&((B=g[c.id])||(B=g[p[c.id]]),1==c.options.horizontal&&(s[0]=B.x+B.w/2-s[2]/2),1==c.options.vertical&&(s[1]=B.y+B.h/2-s[3]/2),i.sticky&&(s[0]<C.left&&s[0]<C.right&&(s[0]=C.left>C.right?C.right:C.left),s[0]>C.right&&s[0]>C.left&&(s[0]=C.left>C.right?C.left:C.right),s[1]<C.top&&s[1]<C.bottom&&(s[1]=C.top>C.bottom?C.bottom:C.top),s[1]>C.bottom&&s[1]>C.top&&(s[1]=C.top>C.bottom?C.top:C.bottom)));if(d==OrgChart.action.insert||d==OrgChart.action.expandCollapse||d==OrgChart.action.update||d==OrgChart.action.centerNode){var _=null;if(d==OrgChart.action.insert&&c&&null!=c.insertedNodeId&&null!=c.insertedNodeId)(_=g[c.insertedNodeId])||(_=g[p[c.insertedNodeId]]);else if(d==OrgChart.action.update&&c&&null!=c.visId&&null!=c.visId)(_=g[c.visId])||(_=g[p[c.visId]]);else if(d==OrgChart.action.expandCollapse&&c&&null!=c.id&&null!=c.id)(_=g[c.id])||(_=g[p[c.id]]),_=OrgChart.server._getMostDeepChild(_,g);else if(d==OrgChart.action.centerNode){switch(i.orientation){case OrgChart.orientation.top:case OrgChart.orientation.top_left:case OrgChart.orientation.bottom:case OrgChart.orientation.bottom_left:c.options.vertical||(_=g[c.id]);break;case OrgChart.orientation.right:case OrgChart.orientation.right_top:case OrgChart.orientation.left:case OrgChart.orientation.left_top:c.options.horizontal||(_=g[c.id])}_&&(_||(_=g[p[c.id]]),_=OrgChart.server._getMostDeepChild(_,g))}if(_)switch(i.orientation){case OrgChart.orientation.top:case OrgChart.orientation.top_left:var A=_.y+_.h-s[3]+i.padding;s[1]<A&&(s[1]=A);break;case OrgChart.orientation.bottom:case OrgChart.orientation.bottom_left:A=_.y-i.padding;s[1]>A&&(s[1]=A);break;case OrgChart.orientation.right:case OrgChart.orientation.right_top:A=_.x-i.padding;s[0]>A&&(s[0]=A);break;case OrgChart.orientation.left:case OrgChart.orientation.left_top:A=_.x+_.w-s[2]+i.padding;s[0]<A&&(s[0]=A)}}for(var S in g){var I=g[S];if(OrgChart.server._isVisible(I,i,s,d)){u[I.id]=I;var N=null;if(d==OrgChart.action.expandCollapse&&f&&f[I.id]&&"expandCollapseToLevel"==c.method){if(N={x:(T=f[I.id]).x,y:T.y},T){N={x:T.x,y:T.y};for(var M=I,E=null;null!=M;)f[M.id]&&f[M.id].state==OrgChart.COLLAPSE&&(E=M),M=M.parent;E&&E.parent&&(N={x:E.parent.x,y:E.parent.y})}if(L=g[c.id]){for(M=I.parent;null!=M;)M=M.parent;M&&(N={x:L.x+L.w/2-I.w/2,y:L.y+L.h/2-I.h/2})}}else if(d==OrgChart.action.expandCollapse&&f&&f[I.id]){var L;if(N={x:(T=f[I.id]).x,y:T.y},"all"==c.ids&&T){N={x:T.x,y:T.y};for(M=I,E=null;null!=M;)f[M.id]&&f[M.id].state==OrgChart.COLLAPSE&&(E=M),M=M.parent;E&&E.parent&&(N={x:E.parent.x,y:E.parent.y})}if(L=g[c.id]){for(M=I.parent;null!=M&&-1==c.ids.indexOf(I.id)&&-1==c.ids.indexOf(M.id);)M=M.parent;M&&(N={x:L.x+L.w/2-I.w/2,y:L.y+L.h/2-I.h/2})}}else if(d==OrgChart.action.centerNode&&f&&f[I.id]){var B;if(null!=(T=f[I.id]).x&&null!=T.y&&(N={x:T.x,y:T.y}),(B=g[c.id])&&B==I)(M=I.parent)&&M.id==c.id&&(N={x:B.x+B.w/2-I.w/2,y:B.y+B.h/2-I.h/2})}else if(d==OrgChart.action.groupMaxMin&&f&&f[I.id]){N={x:(T=f[I.id]).x,y:T.y}}else if(d==OrgChart.action.insert&&c&&c.insertedNodeId==I.id)N={x:I.parent.x,y:I.parent.y};else if((d==OrgChart.action.update||d==OrgChart.action.insert)&&f&&f[I.id]){var T;N={x:(T=f[I.id]).x,y:T.y}}else d!==OrgChart.action.exporting&&r&&!r[I.id]&&(m[0].push(I.id),m[1].push({opacity:0}),m[2].push({opacity:1}));null!=N&&null!=N.x&&null!=N.y&&(N.x==I.x&&N.y==I.y||(m[0].push(I.id),m[1].push({transform:[1,0,0,1,N.x,N.y]}),m[2].push({transform:[1,0,0,1,I.x,I.y]})))}}return{animations:m,boundary:C,viewBox:s,visibleNodes:u,nodes:g,allFields:OrgChart.server.getAllFields(i)}},OrgChart.server._setMinMaxXY=function(t,e){(null==e.minX||null!=t.x&&t.x<e.minX)&&(e.minX=t.x),(null==e.minY||null!=t.y&&t.y<e.minY)&&(e.minY=t.y),(null==e.maxX||null!=t.x&&t.x+t.w>e.maxX)&&(e.maxX=t.x+t.w),(null==e.maxY||null!=t.y&&t.y+t.h>e.maxY)&&(e.maxY=t.y+t.h)},OrgChart.server._isNotNullEmptyUndefined=function(t){return null!=t&&null!=t&&""!==t},void 0===OrgChart&&(OrgChart={}),OrgChart.templates={},OrgChart.templates.base={defs:"",size:[250,120],expandCollapseSize:30,linkAdjuster:{fromX:0,fromY:0,toX:0,toY:0},ripple:{radius:0,color:"#e6e6e6",rect:null},assistanseLink:'<path stroke-linejoin="round" stroke="#aeaeae" stroke-width="2px" fill="none" d="M{xa},{ya} {xb},{yb} {xc},{yc} {xd},{yd} L{xe},{ye}"/>',svg:'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="display:block;" width="{w}" height="{h}" viewBox="{viewBox}">{content}</svg>',link:'<path stroke-linejoin="round" stroke="#aeaeae" stroke-width="1px" fill="none" d="M{xa},{ya} {xb},{yb} {xc},{yc} L{xd},{yd}"/>',pointer:'<g data-pointer="pointer" transform="matrix(0,0,0,0,100,100)"><radialGradient id="pointerGradient"><stop stop-color="#ffffff" offset="0" /><stop stop-color="#C1C1C1" offset="1" /></radialGradient><circle cx="16" cy="16" r="16" stroke-width="1" stroke="#acacac" fill="url(#pointerGradient)"></circle></g>',node:'<rect x="0" y="0" height="120" width="250" fill="none" stroke-width="1" stroke="#aeaeae"></rect>',plus:'<circle cx="15" cy="15" r="15" fill="#ffffff" stroke="#aeaeae" stroke-width="1"></circle><line x1="4" y1="15" x2="26" y2="15" stroke-width="1" stroke="#aeaeae"></line><line x1="15" y1="4" x2="15" y2="26" stroke-width="1" stroke="#aeaeae"></line>',minus:'<circle cx="15" cy="15" r="15" fill="#ffffff" stroke="#aeaeae" stroke-width="1"></circle><line x1="4" y1="15" x2="26" y2="15" stroke-width="1" stroke="#aeaeae"></line>',nodeMenuButton:'<g style="cursor:pointer;" transform="matrix(1,0,0,1,225,105)" control-node-menu-id="{id}"><rect x="-4" y="-10" fill="#000000" fill-opacity="0" width="22" height="22"></rect><circle cx="0" cy="0" r="2" fill="#ffffff"></circle><circle cx="7" cy="0" r="2" fill="#ffffff"></circle><circle cx="14" cy="0" r="2" fill="#ffffff"></circle></g>',exportMenuButton:'<div style="position:absolute;right:{p}px;top:{p}px; width:40px;height:50px;cursor:pointer;" control-export-menu=""><hr style="background-color: #7A7A7A; height: 3px; border: none;"><hr style="background-color: #7A7A7A; height: 3px; border: none;"><hr style="background-color: #7A7A7A; height: 3px; border: none;"></div>',img_0:'<clipPath id="{randId}"><circle cx="60" cy="60" r="40"></circle></clipPath><image preserveAspectRatio="xMidYMid slice" clip-path="url(#{randId})" xlink:href="{val}" x="20" y="20"  width="80" height="80"></image>',link_field_0:'<text class="field_0" text-anchor="middle" fill="#aeaeae" width="290" x="0" y="0" style="font-size:10px;">{val}</text>'},OrgChart.templates.ana={defs:"",size:[250,120],linkAdjuster:{fromX:0,fromY:0,toX:0,toY:0},ripple:{radius:0,color:"#e6e6e6",rect:null},expandCollapseSize:30,svg:'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"  style="display:block;" width="{w}" height="{h}" viewBox="{viewBox}">{content}</svg>',link:'<path stroke-linejoin="round" stroke="#aeaeae" stroke-width="1px" fill="none" d="M{xa},{ya} {xb},{yb} {xc},{yc} L{xd},{yd}" />',assistanseLink:'<path stroke-linejoin="round" stroke="#aeaeae" stroke-width="2px" fill="none" d="M{xa},{ya} {xb},{yb} {xc},{yc} {xd},{yd} L{xe},{ye}"/>',pointer:'<g data-pointer="pointer" transform="matrix(0,0,0,0,100,100)"><radialGradient id="pointerGradient"><stop stop-color="#ffffff" offset="0" /><stop stop-color="#C1C1C1" offset="1" /></radialGradient><circle cx="16" cy="16" r="16" stroke-width="1" stroke="#acacac" fill="url(#pointerGradient)"></circle></g>',node:'<rect x="0" y="0" height="120" width="250" fill="#039BE5" stroke-width="1" stroke="#aeaeae" rx="5" ry="5"></rect>',plus:'<circle cx="15" cy="15" r="15" fill="#ffffff" stroke="#aeaeae" stroke-width="1"></circle><line x1="4" y1="15" x2="26" y2="15" stroke-width="1" stroke="#aeaeae"></line><line x1="15" y1="4" x2="15" y2="26" stroke-width="1" stroke="#aeaeae"></line>',minus:'<circle cx="15" cy="15" r="15" fill="#ffffff" stroke="#aeaeae" stroke-width="1"></circle><line x1="4" y1="15" x2="26" y2="15" stroke-width="1" stroke="#aeaeae"></line>',nodeMenuButton:'<g style="cursor:pointer;" transform="matrix(1,0,0,1,225,105)" control-node-menu-id="{id}"><rect x="-4" y="-10" fill="#000000" fill-opacity="0" width="22" height="22"></rect><circle cx="0" cy="0" r="2" fill="#ffffff"></circle><circle cx="7" cy="0" r="2" fill="#ffffff"></circle><circle cx="14" cy="0" r="2" fill="#ffffff"></circle></g>',exportMenuButton:'<div style="position:absolute;right:{p}px;top:{p}px; width:40px;height:50px;cursor:pointer;" control-export-menu=""><hr style="background-color: #7A7A7A; height: 3px; border: none;"><hr style="background-color: #7A7A7A; height: 3px; border: none;"><hr style="background-color: #7A7A7A; height: 3px; border: none;"></div>',img_0:'<clipPath id="{randId}"><circle cx="50" cy="30" r="40"></circle></clipPath><image preserveAspectRatio="xMidYMid slice" clip-path="url(#{randId})" xlink:href="{val}" x="10" y="-10"  width="80" height="80"></image>',link_field_0:'<text text-anchor="middle" fill="#aeaeae" width="290" x="0" y="0" style="font-size:10px;">{val}</text>',field_0:'<text width="230" class="field_0"  style="font-size: 18px;" fill="#ffffff" x="125" y="95" text-anchor="middle">{val}</text>',field_1:'<text width="130" text-overflow="multiline" class="field_1"  style="font-size: 14px;" fill="#ffffff" x="230" y="30" text-anchor="end">{val}</text>'},OrgChart.templates.split=Object.assign({},OrgChart.templates.ana),OrgChart.templates.split.size=[10,10],OrgChart.templates.split.node='<circle cx="5" cy="5" r="5" fill="none" stroke-width="1" stroke="#aeaeae"></circle>',OrgChart.templates.group_orange=Object.assign({},OrgChart.templates.base),OrgChart.templates.group_orange.size=[250,120],OrgChart.templates.group_orange.node='<rect rx="5" x="0" y="0" height="{h}" width="{w}" fill="#ffe6cc" stroke-width="1" stroke="#F57C00"></rect>',OrgChart.templates.group_orange.groupPadding=[50,10,10,10],OrgChart.templates.group_orange.groupNodesSeparation=10,OrgChart.templates.group_orange.groupName='<text width="{elastic_width}" class="groupName"  style="font-size: 24px;" fill="#F57C00" x="20" y="40">{val}</text>',OrgChart.templates.group_yellow=Object.assign({},OrgChart.templates.group_orange),OrgChart.templates.group_yellow.node='<rect rx="5" x="0" y="0" height="{h}" width="{w}" fill="#ffefbe" stroke-width="1" stroke="#FFCA28"></rect>',OrgChart.templates.group_yellow.groupName='<text width="{elastic_width}" class="groupName"  style="font-size: 24px;" fill="#FFCA28" x="20" y="40">{val}</text>',OrgChart.templates.group_grey=Object.assign({},OrgChart.templates.group_orange),OrgChart.templates.group_grey.node='<rect rx="5" x="0" y="0" height="{h}" width="{w}" fill="#eeeeee" stroke-width="1" stroke="#aeaeae"></rect>',OrgChart.templates.group_grey.groupName='<text width="{elastic_width}"  class="groupName"  style="font-size: 24px;" fill="#aeaeae" x="20" y="40">{val}</text>',OrgChart.templates.group_grey_one_column=Object.assign({},OrgChart.templates.group_grey),OrgChart.templates.group_grey_one_column.columns=1,OrgChart.templates.ula=Object.assign({},OrgChart.templates.ana),OrgChart.templates.ula.field_0='<text width="145" class="field_0" style="font-size: 18px;" fill="#039BE5" x="100" y="55">{val}</text>',OrgChart.templates.ula.field_1='<text width="145" text-overflow="multiline" class="field_1" style="font-size: 14px;" fill="#afafaf" x="100" y="76">{val}</text>',OrgChart.templates.ula.node='<rect x="0" y="0" height="120" width="250" fill="#ffffff" stroke-width="1" stroke="#aeaeae"></rect><line x1="0" y1="0" x2="250" y2="0" stroke-width="2" stroke="#039BE5"></line>',OrgChart.templates.ula.img_0='<clipPath id="{randId}"><circle cx="50" cy="60" r="40"></circle></clipPath><image preserveAspectRatio="xMidYMid slice" clip-path="url(#{randId})" xlink:href="{val}" x="10" y="20" width="80" height="80" ></image>',OrgChart.templates.ula.menu='<g style="cursor:pointer;" transform="matrix(1,0,0,1,225,12)" control-node-menu-id="{id}"><rect x="-4" y="-10" fill="#ffffff" width="22" height="22"></rect><circle cx="0" cy="0" r="2" fill="#039BE5"></circle><circle cx="7" cy="0" r="2" fill="#039BE5"></circle><circle cx="14" cy="0" r="2" fill="#039BE5"></circle></g>',OrgChart.templates.ula.nodeMenuButton='<g style="cursor:pointer;" transform="matrix(1,0,0,1,225,105)" control-node-menu-id="{id}"><rect x="-4" y="-10" fill="#000000" fill-opacity="0" width="22" height="22"></rect><circle cx="0" cy="0" r="2" fill="#AEAEAE"></circle><circle cx="7" cy="0" r="2" fill="#AEAEAE"></circle><circle cx="14" cy="0" r="2" fill="#AEAEAE"></circle></g>',OrgChart.templates.olivia=Object.assign({},OrgChart.templates.ana),OrgChart.templates.olivia.field_0='<text width="145" class="field_0" style="font-size: 18px;" fill="#757575" x="100" y="55">{val}</text>',OrgChart.templates.olivia.field_1='<text width="145" class="field_1" style="font-size: 14px;" fill="#757575" x="100" y="76">{val}</text>',OrgChart.templates.olivia.defs='<linearGradient id="{randId}" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#FDFDFD;stop-opacity:1" /><stop offset="100%" style="stop-color:#C0C0C0;stop-opacity:1" /></linearGradient>',OrgChart.templates.olivia.node='<rect fill="url(#{randId})" x="0" y="0" height="120" width="250" stroke-width="1" stroke="#aeaeae" rx="5" ry="5"></rect>',OrgChart.templates.olivia.img_0='<clipPath id="{randId}"><circle cx="50" cy="60" r="40"></circle></clipPath><image preserveAspectRatio="xMidYMid slice" clip-path="url(#{randId})" xlink:href="{val}" x="10" y="20" width="80" height="80" ></image>',OrgChart.templates.belinda=Object.assign({},OrgChart.templates.ana),OrgChart.templates.belinda.size=[180,180],OrgChart.templates.belinda.ripple={radius:90,color:"#e6e6e6",rect:null},OrgChart.templates.belinda.node='<circle cx="90" cy="90" r="90" fill="#039BE5" stroke-width="1" stroke="#aeaeae"></circle>',OrgChart.templates.belinda.img_0='<clipPath id="{randId}"><circle cx="90" cy="45" r="40"></circle></clipPath><image preserveAspectRatio="xMidYMid slice" clip-path="url(#{randId})" xlink:href="{val}" x="50" y="5" width="80" height="80" ></image>',OrgChart.templates.belinda.field_0='<text width="170" class="field_0" style="font-size: 18px;" text-anchor="middle" fill="#ffffff"  x="90" y="105">{val}</text>',OrgChart.templates.belinda.field_1='<text width="160" class="field_1" style="font-size: 14px;" text-anchor="middle" fill="#ffffff"  x="90" y="125">{val}</text>',OrgChart.templates.belinda.link='<path stroke="#aeaeae" stroke-width="1px" fill="none" d="M{xa},{ya} C{xb},{yb} {xc},{yc} {xd},{yd}"/>',OrgChart.templates.belinda.nodeMenuButton='<g style="cursor:pointer;" transform="matrix(1,0,0,1,79,5)" control-node-menu-id="{id}"><rect x="0" y="0" fill="#000000" fill-opacity="0" width="22" height="22"></rect><line stroke-width="2" stroke="#000" x1="0" y1="3" x2="22" y2="3"></line><line stroke-width="2" stroke="#000" x1="0" y1="9" x2="22" y2="9"></line><line stroke-width="2" stroke="#000" x1="0" y1="15" x2="22" y2="15"></line></g>',OrgChart.templates.rony=Object.assign({},OrgChart.templates.ana),OrgChart.templates.rony.svg='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="background-color:#E8E8E8;display:block;" width="{w}" height="{h}" viewBox="{viewBox}">{content}</svg>',OrgChart.templates.rony.defs='<filter id="{randId}" x="0" y="0" width="200%" height="200%"><feOffset result="offOut" in="SourceAlpha" dx="5" dy="5"></feOffset><feGaussianBlur result="blurOut" in="offOut" stdDeviation="5"></feGaussianBlur><feBlend in="SourceGraphic" in2="blurOut" mode="normal"></feBlend></filter>',OrgChart.templates.rony.size=[180,250],OrgChart.templates.rony.ripple={color:"#F57C00",radius:5,rect:null},OrgChart.templates.rony.img_0='<clipPath id="{randId}"><circle cx="90" cy="160" r="60"></circle></clipPath><image preserveAspectRatio="xMidYMid slice" clip-path="url(#{randId})" xlink:href="{val}" x="30" y="100"  width="120" height="120"></image>',OrgChart.templates.rony.node='<rect filter="url(#{randId})" x="0" y="0" height="250" width="180" fill="#ffffff" stroke-width="0" rx="5" ry="5"></rect>',OrgChart.templates.rony.field_0='<text width="165" class="field_0" style="font-size: 18px;" fill="#039BE5" x="90" y="40" text-anchor="middle">{val}</text>',OrgChart.templates.rony.field_1='<text width="165" class="field_1" style="font-size: 14px;" fill="#F57C00" x="90" y="60" text-anchor="middle">{val}</text>',OrgChart.templates.rony.field_2='<text width="165" style="font-size: 14px;" fill="#FFCA28" x="90" y="80" text-anchor="middle">{val}</text>',OrgChart.templates.rony.link='<path stroke="#039BE5" stroke-width="1px" fill="none" d="M{xa},{ya} {xb},{yb} {xc},{yc} L{xd},{yd}"/>',OrgChart.templates.rony.plus='<circle cx="15" cy="15" r="15" fill="#ffffff" stroke="#039BE5" stroke-width="1"></circle><line x1="4" y1="15" x2="26" y2="15" stroke-width="1" stroke="#039BE5"></line><line x1="15" y1="4" x2="15" y2="26" stroke-width="1" stroke="#039BE5"></line>',OrgChart.templates.rony.minus='<circle cx="15" cy="15" r="15" fill="#ffffff" stroke="#039BE5" stroke-width="1"></circle><line x1="4" y1="15" x2="26" y2="15" stroke-width="1" stroke="#039BE5"></line>',OrgChart.templates.rony.nodeMenuButton='<g style="cursor:pointer;" transform="matrix(1,0,0,1,155,235)" control-node-menu-id="{id}"><rect x="-4" y="-10" fill="#000000" fill-opacity="0" width="22" height="22"></rect><circle cx="0" cy="0" r="2" fill="#F57C00"></circle><circle cx="7" cy="0" r="2" fill="#F57C00"></circle><circle cx="14" cy="0" r="2" fill="#F57C00"></circle></g>',OrgChart.templates.mery=Object.assign({},OrgChart.templates.ana),OrgChart.templates.mery.ripple={color:"#e6e6e6",radius:50,rect:null},OrgChart.templates.mery.node='<rect x="0" y="0" height="120" width="250" fill="#ffffff" stroke-width="1" stroke="#686868" rx="50" ry="50"></rect><rect x="0" y="45" height="30" width="250" fill="#039BE5" stroke-width="1"></rect>',OrgChart.templates.mery.link='<path stroke="#aeaeae" stroke-width="1px" fill="none" d="M{xa},{ya} C{xb},{yb} {xc},{yc} {xd},{yd}" />',OrgChart.templates.mery.img_0='<clipPath id="{randId}"><circle cx="125" cy="60" r="24"></circle></clipPath><image preserveAspectRatio="xMidYMid slice" clip-path="url(#{randId})" xlink:href="{val}" x="95" y="33"  width="60" height="60"></image>',OrgChart.templates.mery.field_0='<text width="220" class="field_0" style="font-size: 18px;" fill="#039BE5" x="125" y="30" text-anchor="middle">{val}</text>',OrgChart.templates.mery.field_1='<text width="220" class="field_1" style="font-size: 14px;" fill="#039BE5" x="125" y="100" text-anchor="middle">{val}</text>',OrgChart.templates.mery.nodeMenuButton='<g style="cursor:pointer;" transform="matrix(1,0,0,1,225,60)" control-node-menu-id="{id}"><rect x="-4" y="-10" fill="#000000" fill-opacity="0" width="22" height="22"></rect><circle cx="0" cy="0" r="2" fill="#ffffff"></circle><circle cx="7" cy="0" r="2" fill="#ffffff"></circle><circle cx="14" cy="0" r="2" fill="#ffffff"></circle></g>',OrgChart.templates.polina=Object.assign({},OrgChart.templates.ana),OrgChart.templates.polina.size=[300,80],OrgChart.templates.polina.ripple={color:"#e6e6e6",radius:40,rect:null},OrgChart.templates.polina.node='<rect x="0" y="0" height="80" width="300" fill="#039BE5" stroke-width="1" stroke="#686868" rx="40" ry="40"></rect>',OrgChart.templates.polina.img_0='<clipPath id="{randId}"><circle  cx="40" cy="40" r="35"></circle></clipPath><image preserveAspectRatio="xMidYMid slice" clip-path="url(#{randId})" xlink:href="{val}" x="0" y="0"  width="80" height="80"></image>',OrgChart.templates.polina.field_0='<text width="210" class="field_0" style="font-size: 18px;" fill="#ffffff" x="80" y="30" text-anchor="start">{val}</text>',OrgChart.templates.polina.field_1='<text width="210" class="field_1" style="font-size: 14px;" fill="#ffffff" x="80" y="55" text-anchor="start">{val}</text>',OrgChart.templates.polina.link='<path stroke="#686868" stroke-width="1px" fill="none" d="M{xa},{ya} C{xb},{yb} {xc},{yc} {xd},{yd}" />',OrgChart.templates.polina.nodeMenuButton='<g style="cursor:pointer;" transform="matrix(1,0,0,1,285,33)" control-node-menu-id="{id}"><rect x="-4" y="-10" fill="#000000" fill-opacity="0" width="22" height="22"></rect><circle cx="0" cy="0" r="2" fill="#ffffff"></circle><circle cx="0" cy="7" r="2" fill="#ffffff"></circle><circle cx="0" cy="14" r="2" fill="#ffffff"></circle></g>',OrgChart.templates.mila=Object.assign({},OrgChart.templates.ana),OrgChart.templates.mila.node='<rect x="0" y="0" height="120" width="250" fill="#039BE5" stroke-width="1" stroke="#aeaeae"></rect><rect x="-5" y="70" height="30" width="260" fill="#ffffff" stroke-width="1" stroke="#039BE5"></rect><line x1="-5" x2="0" y1="100" y2="105" stroke-width="1" stroke="#039BE5"/><line x1="255" x2="250" y1="100" y2="105" stroke-width="1" stroke="#039BE5"/>',OrgChart.templates.mila.img_0='<image preserveAspectRatio="xMidYMid slice" xlink:href="{val}" x="20" y="5"  width="64" height="64"></image>',OrgChart.templates.mila.field_0='<text width="240" class="field_0" style="font-size: 18px;" fill="#039BE5" x="125" y="92" text-anchor="middle">{val}</text>',OrgChart.templates.mila.nodeMenuButton='<g style="cursor:pointer;" transform="matrix(1,0,0,1,225,110)" control-node-menu-id="{id}"><rect x="-4" y="-10" fill="#000000" fill-opacity="0" width="22" height="22"></rect><circle cx="0" cy="0" r="2" fill="#ffffff"></circle><circle cx="7" cy="0" r="2" fill="#ffffff"></circle><circle cx="14" cy="0" r="2" fill="#ffffff"></circle></g>',OrgChart.templates.diva=Object.assign({},OrgChart.templates.ana),OrgChart.templates.diva.size=[200,170],OrgChart.templates.diva.node='<rect x="0" y="80" height="90" width="200" fill="#039BE5"></rect><circle cx="100" cy="50" fill="#ffffff" r="50" stroke="#039BE5" stroke-width="2"></circle>',OrgChart.templates.diva.img_0='<clipPath id="{randId}"><circle cx="100" cy="50" r="45"></circle></clipPath><image preserveAspectRatio="xMidYMid slice" clip-path="url(#{randId})" xlink:href="{val}" x="50" y="0"  width="100" height="100"></image>',OrgChart.templates.diva.field_0='<text width="185" class="field_0" style="font-size: 18px;" fill="#ffffff" x="100" y="125" text-anchor="middle">{val}</text>',OrgChart.templates.diva.field_1='<text width="185" class="field_1" style="font-size: 14px;" fill="#ffffff" x="100" y="145" text-anchor="middle">{val}</text>',OrgChart.templates.diva.pointer='<g data-pointer="pointer" transform="matrix(0,0,0,0,100,100)"><radialGradient id="pointerGradient"><stop stop-color="#ffffff" offset="0" /><stop stop-color="#039BE5" offset="1" /></radialGradient><circle cx="16" cy="16" r="16" stroke-width="1" stroke="#acacac" fill="url(#pointerGradient)"></circle></g>',OrgChart.templates.diva.nodeMenuButton='<g style="cursor:pointer;" transform="matrix(1,0,0,1,175,155)" control-node-menu-id="{id}"><rect x="-4" y="-10" fill="#000000" fill-opacity="0" width="22" height="22"></rect><circle cx="0" cy="0" r="2" fill="#ffffff"></circle><circle cx="7" cy="0" r="2" fill="#ffffff"></circle><circle cx="14" cy="0" r="2" fill="#ffffff"></circle></g>',OrgChart.templates.luba=Object.assign({},OrgChart.templates.ana),OrgChart.templates.luba.svg='<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="display:block;background-color: #2E2E2E;" width="{w}" height="{h}" viewBox="{viewBox}">{content}</svg>',OrgChart.templates.luba.defs='<linearGradient id="{randId}" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#646464;stop-opacity:1" /><stop offset="100%" style="stop-color:#363636;stop-opacity:1" /></linearGradient>',OrgChart.templates.luba.node='<rect fill="url(#{randId})" x="0" y="0" height="120" width="250" stroke-width="1" stroke="#aeaeae" rx="5" ry="5"></rect>',OrgChart.templates.luba.img_0='<clipPath id="{randId}"><circle cx="50" cy="25" r="40"></circle></clipPath><image preserveAspectRatio="xMidYMid slice" clip-path="url(#{randId})" xlink:href="{val}" x="10" y="-15"  width="80" height="80"></image>',OrgChart.templates.luba.nodeMenuButton='<g style="cursor:pointer;" transform="matrix(1,0,0,1,225,105)" control-node-menu-id="{id}"><rect x="-4" y="-10" fill="#000000" fill-opacity="0" width="22" height="22"></rect><circle cx="0" cy="0" r="2" fill="#aeaeae"></circle><circle cx="7" cy="0" r="2" fill="#aeaeae"></circle><circle cx="14" cy="0" r="2" fill="#aeaeae"></circle></g>',OrgChart.templates.luba.field_0='<text width="235" class="field_0" style="font-size: 18px;" fill="#aeaeae" x="125" y="90" text-anchor="middle">{val}</text>',OrgChart.templates.luba.field_1='<text width="140" class="field_1" style="font-size: 14px;" fill="#aeaeae" x="240" y="30" text-anchor="end">{val}</text>',OrgChart.templates.luba.plus='<rect x="0" y="0" width="36" height="36" rx="12" ry="12" fill="#2E2E2E" stroke="#aeaeae" stroke-width="1"></rect><line x1="4" y1="18" x2="32" y2="18" stroke-width="1" stroke="#aeaeae"></line><line x1="18" y1="4" x2="18" y2="32" stroke-width="1" stroke="#aeaeae"></line>',OrgChart.templates.luba.minus='<rect x="0" y="0" width="36" height="36" rx="12" ry="12" fill="#2E2E2E" stroke="#aeaeae" stroke-width="1"></rect><line x1="4" y1="18" x2="32" y2="18" stroke-width="1" stroke="#aeaeae"></line>',OrgChart.templates.luba.expandCollapseSize=36,OrgChart.templates.derek=Object.assign({},OrgChart.templates.ana),OrgChart.templates.derek.link='<path stroke="#aeaeae" stroke-width="1px" fill="none" d="M{xa},{ya} C{xb},{yb} {xc},{yc} {xd},{yd}"/>',OrgChart.templates.derek.field_0='<text width="235" class="field_0"  style="font-size: 24px;" fill="#aeaeae" x="125" y="90" text-anchor="middle">{val}</text>',OrgChart.templates.derek.field_1='<text width="130" class="field_1"  style="font-size: 16px;" fill="#aeaeae" x="230" y="30" text-anchor="end">{val}</text>',OrgChart.templates.derek.node='<rect x="0" y="0" height="120" width="250" fill="#ffffff" stroke-width="0" stroke="none" rx="5" ry="5"></rect><path d="M1.0464172536455116 0.43190469224125483 C53.84241668202045 -0.788936709486018, 103.41786516460891 -0.7020837047025514, 252.36637077877316 2.5880308844586395 M2.9051048929845287 1.416953777798454 C94.33574460557007 1.0012759229446266, 189.39715875173388 0.6456731199982935, 252.78978918302985 2.4201778360648074 M253.62699063660838 2.9193391477217157 C249.73034548542307 47.55931231380586, 252.87525930998083 91.26715478378368, 253.10179184315842 121.7440626272514 M251.37132919216776 1.8733470844542213 C252.2809675089866 32.73212950193807, 251.34402714677282 62.11470833534073, 251.87050951184997 121.58550827952904 M253.33945599552268 122.05611967964798 C171.36076589155192 123.47737863766969, 88.83808249906167 125.27259840604118, 3.1999393565128846 121.26868651191393 M252.26165120810887 122.5938901158243 C192.76996487394138 123.44664377223289, 131.37122563794998 122.94880221756583, 1.2373006891045732 121.88999197324904 M2.223863211672736 121.04511533445009 C1.4438124377596486 86.38398979211773, 2.8540468486809294 55.805566409478374, 3.8890451480896644 1.7483404843613926 M2.244347335490432 122.60147677858153 C2.100672267495622 92.31058899219087, 1.6261027388218166 64.160806803772, 1.6325734600065367 1.1945909353588222" stroke="#aeaeae" ></path>',OrgChart.templates.derek.defs=' <filter id="grayscale"><feColorMatrix type="matrix" values="0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0.3333 0.3333 0.3333 0 0 0 0 0 1 0"/></filter>',OrgChart.templates.derek.img_0='<clipPath id="{randId}"><circle cx="60" cy="30" r="36"></circle></clipPath><path d="M59.27394950148486 -8.301766751084706 C67.69473471187919 -8.865443566034696, 80.29031463018414 -4.859224005049532, 87.18598909426663 0.33238763875740673 C94.08166355834912 5.523999282564345, 98.98110545022442 14.745947814116153, 100.64799628597981 22.847903111756924 C102.31488712173521 30.949858409397695, 101.71467046207992 41.576461864335656, 97.187334108799 48.944119424602036 C92.65999775551809 56.311776984868416, 82.03610997730354 64.08326918912249, 73.48397816629435 67.05384847335519 C64.93184635528516 70.02442775758789, 54.01035575000908 69.7708463163516, 45.874543242743854 66.76759512999827 C37.738730735478626 63.76434394364495, 29.04872278114092 56.18846598822666, 24.669103122702957 49.034341355235284 C20.289483464264993 41.88021672224391, 18.158053754175985 31.830144088547545, 19.596825292116065 23.84284733205002 C21.035596830056146 15.855550575552495, 25.795252700735308 6.49424361294595, 33.30173235034344 1.1105608162501355 C40.80821199995158 -4.273121980445679, 58.92971347412665 -7.0427741956040295, 64.63570318976488 -8.459249448124865 C70.34169290540312 -9.8757247006457, 67.62192977382313 -7.857597534262704, 67.53767064417285 -7.388290698874876 M62.748378255307365 -8.335850348284236 C71.26603403676657 -8.411982637093757, 83.3134559967999 -3.2332675886967737, 89.65944437868365 2.387927626929269 C96.00543276056739 8.00912284255531, 99.8018539626104 17.389209313563462, 100.82430854660979 25.39132094547202 C101.84676313060918 33.39343257738058, 100.69202080288338 43.23907526327184, 95.79417188267999 50.40059741838061 C90.8963229624766 57.56211957348938, 80.19607375493683 65.6933432424228, 71.43721502538948 68.36045387612462 C62.678356295842114 71.02756450982645, 51.31858275833087 70.03148525422704, 43.241019505395826 66.40326122059156 C35.16345625246078 62.775037186956084, 26.840434236544123 54.120081952867466, 22.971835507779204 46.59110967431175 C19.103236779014285 39.06213739575604, 17.94937086132579 28.992694575765086, 20.029427132806305 21.22942754925726 C22.10948340428682 13.466160522749433, 28.239699334668693 5.033316212766326, 35.452173136662296 0.011507515264803203 C42.6646469386559 -5.010301182236719, 59.029629541347575 -7.774813789367088, 63.30426994476793 -8.901424635751876 C67.57891034818829 -10.028035482136666, 61.20261013623477 -7.6019933587127815, 61.10001555718443 -6.748157563043929" style="stroke: #aeaeae; stroke-width: 2; fill: none;"></path><image filter="url(#grayscale)" preserveAspectRatio="xMidYMid slice" clip-path="url(#{randId})" xlink:href="{val}" x="20" y="-10"  width="80" height="80"></image>',OrgChart.templates.derek.minus='<circle cx="15" cy="15" r="15" fill="#ffffff" stroke-width="0"></circle><path d="M17.23891044927774 1.1814294501322902 C20.29160626452551 1.030769196657948, 23.947970993006972 3.1719335544839753, 26.394853759110717 5.588671983418923 C28.84173652521446 8.005410412353871, 31.246576051221126 12.511831935158815, 31.920207045900206 15.681860023741976 C32.593838040579286 18.85188811232514, 32.286699675240925 21.948848714186923, 30.436639727185195 24.60884051491789 C28.586579779129462 27.268832315648858, 24.05246578668338 30.675892912089505, 20.819847357565806 31.64181082812777 C17.58722892844823 32.60772874416604, 13.992479948405318 31.588687222722193, 11.040929152479746 30.404348011147484 C8.089378356554175 29.220008799572774, 4.476346434761303 27.363985211380037, 3.110542582012373 24.535775558679525 C1.7447387292634435 21.707565905979013, 2.0125141957866703 16.770753327135857, 2.8461060359861694 13.435090094944405 C3.6796978761856685 10.099426862752953, 4.99838568665378 6.33816589513267, 8.112093623209367 4.521796165530812 C11.225801559764953 2.7054264359289544, 18.764666760207586 2.8505106971937155, 21.528353655319687 2.5368717173332556 C24.29204055043179 2.2232327374727956, 24.87088035867136 2.534909813412478, 24.69421499388197 2.6399622863680516 M17.281640595209783 0.19007885243722633 C20.364244435145494 -0.11577004716725742, 25.135133405402318 3.2303746945812075, 27.855952721223584 5.7353294427454955 C30.57677203704485 8.240284190909783, 33.34617538156587 11.802005102645245, 33.606556490137386 15.219807341422953 C33.8669375987089 18.637609580200664, 31.337125602828454 23.632355493641384, 29.418239372652685 26.24214287541175 C27.499353142476917 28.85193025718212, 25.044077583504755 30.13224182494988, 22.093239109082777 30.87853163204516 C19.1424006346608 31.62482143914044, 14.787723024669972 31.933646092018286, 11.713208526120809 30.719881717983426 C8.638694027571646 29.506117343948567, 5.1333408130933655 26.55826769548724, 3.6461521177877945 23.595945387835997 C2.1589634224822234 20.633623080184755, 1.9785010696309286 16.25773192692332, 2.7900763542873843 12.945947872075987 C3.60165163894384 9.634163817228652, 5.999109831161897 5.87039683716568, 8.51560382572653 3.7252410587519886 C11.032097820291161 1.5800852803382974, 16.377503419445155 0.40900388408914673, 17.88904032167518 0.0750132015938405 C19.400577223905202 -0.2589774809014657, 17.448582822593046 1.2406055078364167, 17.584825239106664 1.7212969637801514" style="stroke: rgb(174, 174, 174); stroke-width: 1; fill: none;"></path><path d="M8.571186416504453 17.64803469305822 C12.085276840999553 15.452815349785006, 19.337130848197884 16.101685575250833, 26.855223350440756 18.889299472836626 M7.857231507904164 16.840024354210055 C15.011849298914942 18.06824852479784, 22.352469730756894 17.800410681835732, 26.732355140012178 16.88515873797708" style="stroke: #aeaeae; stroke-width: 1; fill: none;"></path>',OrgChart.templates.derek.plus='<circle cx="15" cy="15" r="15" fill="#ffffff" stroke-width="0"></circle><path d="M12.257463787262992 2.40166003616363 C15.548960627027807 1.1768586505919105, 20.323768339136134 1.874732142276981, 23.661947633240565 3.0864861053786417 C27.000126927344997 4.298240068480302, 30.703811226452725 6.729324000523814, 32.286539551889575 9.672183814773595 C33.86926787732643 12.615043629023376, 33.788018167397944 17.557781915741554, 33.158317585861674 20.743644990877332 C32.528617004325405 23.92950806601311, 31.137543762406274 26.899980401737224, 28.508336062671955 28.787362265588257 C25.879128362937635 30.67474412943929, 21.064677192956335 31.99302804642975, 17.383071387455747 32.06793617398354 C13.701465581955157 32.14284430153733, 9.342085269075854 31.17242931287016, 6.418701229668416 29.236811030911003 C3.4953171902609785 27.301192748951845, 0.29124975331190645 23.792422306170057, -0.15723284898887968 20.454226482228595 C-0.6057154512896659 17.116030658287134, 1.5769138742615705 12.178626667602387, 3.7278056158636996 9.207636087262241 C5.878697357465828 6.236645506922095, 10.970632450860041 3.8471017540469195, 12.748117600623896 2.6282830001877198 C14.525602750387751 1.4094642463285199, 14.289563699001825 1.9470094191022314, 14.392716514446832 1.894723564107041 M22.43549828180672 1.2256088400576157 C25.69018250895055 1.7704365119039576, 29.24546322166512 4.979269460398017, 31.051492912414023 8.188373611713667 C32.85752260316293 11.397477763029316, 33.67207918890526 17.17514768034262, 33.27167642630015 20.480233747951512 C32.871273663695035 23.785319815560406, 31.41050911947538 25.966765564166938, 28.649076336783356 28.01889001736704 C25.887643554091333 30.07101447056714, 20.094058835586818 32.38500719321419, 16.70307973014802 32.79298046715211 C13.31210062470922 33.20095374109003, 10.940906263905317 32.367748192606626, 8.303201704150565 30.46672966099454 C5.665497144395813 28.565711129382457, 2.097338248187536 24.641108687248686, 0.8768523716195098 21.386869277479594 C-0.34363350494851663 18.132629867710502, -0.763694313917872 14.0433435213021, 0.980286444742406 10.941293202379995 C2.7242672034026842 7.83924288345789, 7.945090366802328 4.317959037402062, 11.340736923581177 2.774567363946959 C14.736383480360027 1.231175690491856, 19.39979547907987 1.5862021443476335, 21.354165785415507 1.6809431616493775 C23.308536091751144 1.7756841789511215, 22.887857886273373 3.132249638930103, 23.06695876159499 3.343013467757423" style="stroke: rgb(174, 174, 174); stroke-width: 1; fill: none;"></path><path d="M7.0048103933165935 18.109075284628886 C12.152504846776358 18.486044066779655, 15.926735549928488 18.85477711845977, 26.641287664541796 15.553207106118496 M6.796084928139555 16.174781745374535 C14.085050058006614 16.53898319893461, 19.579209483395115 16.725914747038104, 27.441803598385356 17.277875712554966" style="stroke: #aeaeae; stroke-width: 1; fill: none;"></path><path d="M16.293755471804 6.234638030793387 C17.448668211406996 11.453666045700338, 16.27043554943843 18.842895411477887, 16.90423703847114 28.952046969222806 M17.809777051185264 7.011866752183222 C17.599122858612276 13.07833796918755, 16.995204905243295 18.587342115968614, 17.888568853882067 26.844926419317094" style="stroke: #aeaeae; stroke-width: 1; fill: none;"></path>',OrgChart.templates.derek.nodeMenuButton='<g style="cursor:pointer;" transform="matrix(1,0,0,1,210,80)" control-node-menu-id="{id}"><rect x="-4" y="-4" fill="#000000" fill-opacity="0" width="30" height="30"></rect><path d="M28.28024041166867 10.015533059199505 C16.45705393905741 10.81309700412131, 9.85276157405196 9.87162723980281, 3.5441213169168515 7.075531655648353 M27.551825308513525 8.923800642512257 C18.159502224784205 9.337153563754718, 7.451197502628936 9.284728719203128, 1.8548423867425456 8.753004894810802 M27.907104120536573 17.662200828300364 C18.343063985797404 18.998694042201137, 6.69417200021006 18.568117962359516, 2.7668346274558218 17.84920936843539 M26.99365966559525 17.444217688828093 C18.288291344549645 16.258053076066645, 10.047008592341617 16.913684103209345, 2.1772395910449567 17.55258716848472 M25.754130110044443 24.79648729629354 C19.716463597004157 24.059273917380096, 12.571903015673474 24.723484329803995, 1.2709092686545498 25.961416660790483 M26.031268385778997 24.853114475295413 C16.16958752624931 25.047162545233455, 7.4039608372111765 23.9169859615211, 1.4736400026930716 24.342985647697336" style="stroke: rgb(174, 174, 174); stroke-width: 1; fill: none;"></path></g>',OrgChart.templates.isla=Object.assign({},OrgChart.templates.ana),OrgChart.templates.isla.defs='<filter x="-50%" y="-50%" width="200%" height="200%" filterUnits="objectBoundingBox" id="isla-shadow"><feOffset dx="0" dy="4" in="SourceAlpha" result="shadowOffsetOuter1" /><feGaussianBlur stdDeviation="10" in="shadowOffsetOuter1" result="shadowBlurOuter1" /><feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.2 0" in="shadowBlurOuter1" type="matrix" result="shadowMatrixOuter1" /><feMerge><feMergeNode in="shadowMatrixOuter1" /><feMergeNode in="SourceGraphic" /></feMerge></filter>',OrgChart.templates.isla.size=[180,120],OrgChart.templates.isla.node='<rect filter="url(#isla-shadow)" x="0" y="20" rx="5" ry="5" height="100" width="180" fill="#FFF" stroke-width="1" stroke="#039BE5" ></rect><rect x="25" y="75" rx="10" ry="10" height="20" width="130" fill="#039BE5" stroke-width="3" stroke="#039BE5"></rect><rect fill="#ffffff" stroke="#039BE5" stroke-width="1" x="70" y="0" rx="13" ry="13" width="40" height="40"></rect><circle stroke="#FFCA28" stroke-width="3" fill="none" cx="90" cy="12" r="8"></circle><path d="M75,34 C75,17 105,17 105,34" stroke="#FFCA28" stroke-width="3" fill="none"></path>',OrgChart.templates.isla.field_0='<text width="120" style="font-size: 12px;" fill="#fff" x="90" y="90" text-anchor="middle">{val}</text>',OrgChart.templates.isla.field_1='<text width="160" style="font-size: 13px;" fill="#039BE5" x="90" y="64" text-anchor="middle">{val}</text>',OrgChart.templates.isla.img_0='<clipPath id="{randId}"><rect filter="url(#isla-shadow)" fill="#ffffff" stroke="#039BE5" stroke-width="1" x="70" y="0" rx="13" ry="13" width="40" height="40"></rect></clipPath><image preserveAspectRatio="xMidYMid slice" clip-path="url(#{randId})" xlink:href="{val}" x="70" y="0"  width="40" height="40"></image>',OrgChart.templates.isla.minus='<circle cx="15" cy="15" r="15" fill="#F57C00" stroke="#F57C00" stroke-width="1"></circle><line x1="8" y1="15" x2="22" y2="15" stroke-width="1" stroke="#ffffff"></line>',OrgChart.templates.isla.plus='<circle cx="15" cy="15" r="15" fill="#ffffff" stroke="#039BE5" stroke-width="1"></circle><line x1="4" y1="15" x2="26" y2="15" stroke-width="1" stroke="#039BE5"></line><line x1="15" y1="4" x2="15" y2="26" stroke-width="1" stroke="#039BE5"></line>',OrgChart.templates.isla.nodeMenuButton='<g style="cursor:pointer;" transform="matrix(1,0,0,1,83,45)" control-node-menu-id="{id}"><rect x="-4" y="-10" fill="#000000" fill-opacity="0" width="22" height="22"></rect><circle cx="0" cy="0" r="2" fill="#F57C00"></circle><circle cx="7" cy="0" r="2" fill="#F57C00"></circle><circle cx="14" cy="0" r="2" fill="#F57C00"></circle></g>',OrgChart.templates.isla.ripple={radius:0,color:"#F57C00",rect:{x:0,y:20,width:180,height:100}},OrgChart.templates.deborah=Object.assign({},OrgChart.templates.polina),OrgChart.templates.deborah.size=[150,150],OrgChart.templates.deborah.node='<rect x="0" y="0" height="150" width="150" fill="#039BE5" stroke-width="1" stroke="#686868" rx="15" ry="15"></rect>',OrgChart.templates.deborah.img_0='<clipPath id="{randId}"><rect fill="#ffffff" stroke="#039BE5" stroke-width="1" x="5" y="5" rx="15" ry="15" width="140" height="140"></rect></clipPath><image preserveAspectRatio="xMidYMid slice" clip-path="url(#{randId})" xlink:href="{val}" x="5" y="5"  width="140" height="140"></image><rect x="3" y="5" height="30" width="144" fill="#039BE5" opacity="0.5" rx="3" ry="3"></rect><rect x="3" y="115" height="30" width="144" fill="#039BE5" opacity="0.5" rx="3" ry="3"></rect>',OrgChart.templates.deborah.field_0='<text width="125" text-overflow="ellipsis" style="font-size: 18px;" fill="#ffffff" x="15" y="25" text-anchor="start">{val}</text>',OrgChart.templates.deborah.field_1='<text width="105" text-overflow="ellipsis" style="font-size: 11px;" fill="#ffffff" x="15" y="135" text-anchor="start">{val}</text>',OrgChart.templates.deborah.nodeMenuButton='<g style="cursor:pointer;" transform="matrix(1,0,0,1,125,130)" control-node-menu-id="{id}"><rect x="-4" y="-10" fill="#000000" fill-opacity="0" width="22" height="22"></rect><circle cx="0" cy="0" r="2" fill="#ffffff"></circle><circle cx="7" cy="0" r="2" fill="#ffffff"></circle><circle cx="14" cy="0" r="2" fill="#ffffff"></circle></g>',OrgChart.ui={_defsIds:{},defs:function(t){var e="";for(var r in OrgChart.templates){var i=OrgChart.templates[r];i.defs?(OrgChart.ui._defsIds[r]=OrgChart._randomId(),e+=i.defs.replace("{randId}",OrgChart.ui._defsIds[r])):e+=i.defs}return"<defs>"+e+t+"</defs>"},css:function(){return'<style>.bg-ripple-container {position: absolute; top: 0; right: 0; bottom: 0; left: 0; } .bg-ripple-container span {transform: scale(0);border-radius:100%;position:absolute;opacity:0.75;background-color:#fff;animation: bg-ripple 1000ms; }@-moz-keyframes bg-ripple {to {opacity: 0;transform: scale(2);}}@-webkit-keyframes bg-ripple {to {opacity: 0;transform: scale(2);}}@-o-keyframes bg-ripple {to {opacity: 0;transform: scale(2);}}@keyframes bg-ripple {to {opacity: 0;transform: scale(2);}}.bg-switch {position:relative;display:inline-block;width:60px;height:24px;float:right;}.bg-switch input {opacity:0;width:0;height:0;}.bg-slider {position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background-color: #ccc;-webkit-transition:.4s;transition: .4s;}.bg-slider:before {position:absolute;content:"";height:16px;width:16px;left:4px;bottom:4px;background-color:white;-webkit-transition:.4s;transition:.4s;}input:checked + .bg-slider {background-color:#2196F3;}input:focus + .bg-slider {box-shadow:0 0 1px #2196F3;}input:checked + .bg-slider:before {-webkit-transform:translateX(34px);-ms-transform:translateX(34px);transform:translateX(34px);}.bg-slider.round {border-radius:24px;}.bg-slider.round:before {border-radius:50%;}svg text:hover {cursor:default;}</style>'},lonely:function(t){return t.nodes&&t.nodes.length?"":OrgChart.IT_IS_LONELY_HERE.replace("{link}",OrgChart.RES.IT_IS_LONELY_HERE_LINK)},pointer:function(t,e,r){return e===OrgChart.action.exporting?"":OrgChart.t(t.template,r).pointer},node:function(t,e,r,i,a,o,n,l,s,h){var d=OrgChart.t(t.templateName,s),c=d.node.replaceAll("{w}",t.w).replaceAll("{h}",t.h);if(d.defs&&(c=c.replace("{randId}",OrgChart.ui._defsIds[t.templateName])),null==n&&(n=i.nodeBinding),t.isGroup){var g=i.tags[t.id].groupName;if(g){var p=d.groupName.replace("{elastic_width}",t.w-(d.groupPadding[3]+d.groupPadding[1]+45));g=OrgChart.wrapText(g,p),c+=p.replace("{val}",g).replaceAll("{randId}",OrgChart._randomId()).replaceAll("{randId2}",OrgChart._randomId())}}else for(var f in n){var u=n[f];if(e){var C=e[u];if("function"==typeof u&&(C=u(h,t)),null!=C&&null!=C&&null!=d[f])c+=(OrgChart._lblIsImg(i,f)||"string"!=typeof C||(C=OrgChart.wrapText(C,d[f])),d[f].replace("{val}",C)).replaceAll("{randId}",OrgChart._randomId()).replaceAll("{randId2}",OrgChart._randomId())}}var m=OrgChart._getPosition(r,t,a,o),O="node";Array.isArray(t.tags)&&t.tags.length&&(O+=" "+t.tags.join(" ")),t.layout&&(O+=" tree-layout");var v=OrgChart.nodeOpenTag.replace("{id}",t.id).replace("{class}",O).replace("{level}",t.level).replace("{x}",m.x).replace("{y}",m.y),x=OrgChart._getOpacity(r,t);v=v.replace("{opacity}",x),t.isGroup||null==i.nodeMenu||"split"==t.templateName||l===OrgChart.action.exporting||(c+=d.nodeMenuButton.replace("{id}",t.id));var y=OrgChart.ui._renderGroupedNodes(t,d,i,r,n,a,o,l,s,h);return t.isGroup&&l!=OrgChart.action.exporting&&(t.groupState==OrgChart.EXPAND?c+=OrgChart.MINIMIZE.replace("{x}",t.w-45).replace("{id}",t.id):c+=OrgChart.MAXIMIZE.replace("{x}",t.w-45).replace("{id}",t.id)),c=v+c+y+OrgChart.grCloseTag},_renderGroupedNodes:function(t,e,r,i,a,o,n,l,s,h){var d="";if(t.isGroup&&t.groupState==OrgChart.EXPAND){e.groupPadding||console.error("groupPadding is not defined in template "+t.templateName);for(var c=0;c<t.bgnodes.length;c++){for(var g=t.bgnodes[c],p=null,f=0;f<r.nodes.length;f++)r.nodes[f].id==g.id&&(p=r.nodes[f]);d+=OrgChart.ui.node(g,p,i,r,o,n,a,l,s,h)}d=OrgChart.groupNodesOpenTag.replace("{x}",e.groupPadding[3]).replace("{y}",e.groupPadding[0])+d+OrgChart.grCloseTag}return d},expandCollapse:function(t,e,r,i,a){if(i===OrgChart.action.exporting)return"";if(0==e.childrenIds.length)return"";if("split"==e.templateName)return"";var o="",n=0,l=0,s=OrgChart.t(e.templateName,a);switch(r.orientation){case OrgChart.orientation.top:case OrgChart.orientation.top_left:n=e.x+e.w/2,l=e.y+e.h;break;case OrgChart.orientation.bottom:case OrgChart.orientation.bottom_left:n=e.x+e.w/2,l=e.y;break;case OrgChart.orientation.right:case OrgChart.orientation.right_top:n=e.x,l=e.y+e.h/2;break;case OrgChart.orientation.left:case OrgChart.orientation.left_top:n=e.x+e.w,l=e.y+e.h/2}if(n-=s.expandCollapseSize/2,l-=s.expandCollapseSize/2,e.collapsedChildrenIds.length?(o+=OrgChart.expcollOpenTag.replace("{id}",e.id).replace("{x}",n).replace("{y}",l),o+=s.plus):(o+=OrgChart.expcollOpenTag.replace("{id}",e.id).replace("{x}",n).replace("{y}",l),o+=s.minus),(o+=OrgChart.grCloseTag).indexOf("{collapsed-children-count}")){var h=OrgChart.collapsedChildrenCount(t,e);o=o.replace("{collapsed-children-count}",h)}return o},link:function(t,e,r,i){var a=OrgChart.t(t.templateName,i),o=[],n=r.levelSeparation/2;t.layout!=OrgChart.mixed&&t.layout!=OrgChart.tree||(n=r.mixedHierarchyNodesSeparation/2);for(var l=0;l<t.children.length;l++){var s=t.children[l],h={xa:0,ya:0,xb:0,yb:0,xc:0,yc:0,xd:0,yd:0,x:0,y:0,rotate:0},d=(a=OrgChart.t(s.templateName,i)).link;if((s.isAssistant||2==s.layout)&&s.rightNeighbor&&"split"==s.rightNeighbor.templateName)switch(r.orientation){case OrgChart.orientation.top:case OrgChart.orientation.top_left:h=OrgChart.ui._linkRightToLeft(s.rightNeighbor,s,a,n);break;case OrgChart.orientation.bottom:case OrgChart.orientation.bottom_left:h=OrgChart.ui._linkRightToLeft(s.rightNeighbor,s,a,n);break;case OrgChart.orientation.right:case OrgChart.orientation.right_top:h=OrgChart.ui._linkBottomToTop(s.rightNeighbor,s,a,n);break;case OrgChart.orientation.left:case OrgChart.orientation.left_top:h=OrgChart.ui._linkBottomToTop(s.rightNeighbor,s,a,n)}else if((s.isAssistant||2==s.layout)&&s.leftNeighbor&&"split"==s.leftNeighbor.templateName)switch(r.orientation){case OrgChart.orientation.top:case OrgChart.orientation.top_left:h=OrgChart.ui._linkLeftToRight(s.leftNeighbor,s,a,n);break;case OrgChart.orientation.bottom:case OrgChart.orientation.bottom_left:h=OrgChart.ui._linkLeftToRight(s.leftNeighbor,s,a,n);break;case OrgChart.orientation.right:case OrgChart.orientation.right_top:h=OrgChart.ui._linkTopToBottom(s.leftNeighbor,s,a,n);break;case OrgChart.orientation.left:case OrgChart.orientation.left_top:h=OrgChart.ui._linkTopToBottom(s.leftNeighbor,s,a,n)}else switch(r.orientation){case OrgChart.orientation.top:case OrgChart.orientation.top_left:h=OrgChart.ui._linkTopToBottom(t,s,a,n);break;case OrgChart.orientation.bottom:case OrgChart.orientation.bottom_left:h=OrgChart.ui._linkBottomToTop(t,s,a,n);break;case OrgChart.orientation.right:case OrgChart.orientation.right_top:h=OrgChart.ui._linkRightToLeft(t,s,a,n);break;case OrgChart.orientation.left:case OrgChart.orientation.left_top:h=OrgChart.ui._linkLeftToRight(t,s,a,n)}d=d.replaceAll("{xa}",h.xa).replaceAll("{ya}",h.ya).replaceAll("{xb}",h.xb).replaceAll("{yb}",h.yb).replaceAll("{xc}",h.xc).replaceAll("{yc}",h.yc).replaceAll("{xd}",h.xd).replaceAll("{yd}",h.yd),o.push(OrgChart.linkOpenTag.replace("{id}",t.id).replace("{class}","link "+s.tags.join(" ")).replace("{level}",t.level).replace("{child-id}",s.id)),o.push(d);var c="";for(var g in r.linkBinding){var p=r.linkBinding[g],f=e._get(s.id);if(f){var u=f[p];null!=u&&null!=u&&null!=a[g]&&(c+=a[g].replace("{val}",u))}}""!=c&&(c=OrgChart.linkFieldsOpenTag.replace("{x}",h.x).replace("{y}",h.y).replace("{rotate}",0)+c+OrgChart.grCloseTag,o.push(c)),o.push(OrgChart.grCloseTag)}return o.join("")},svg:function(t,e,r,i,a,o){return OrgChart.t(i.template,o).svg.replace("{w}",t).replace("{h}",e).replace("{viewBox}",r).replace("{content}",a)},exportMenuButton:function(t){return null==t.menu?"":OrgChart.t(t.template).exportMenuButton.replaceAll("{p}",t.padding)},_linkTopToBottom:function(t,e,r,i){var a,o,n,l,s,h,d,c=0;return a=t.x+t.w/2+r.linkAdjuster.toX,o=t.y+t.h+r.linkAdjuster.toY,s=l=e.x+e.w/2+r.linkAdjuster.fromX,h=e.y+r.linkAdjuster.fromY,{xa:n=a,ya:o,xb:n,yb:c=t.rightNeighbor&&t.rightNeighbor.isAssistant&&"split"==e.templateName?t.rightNeighbor.y+t.rightNeighbor.h+i:"split"!=t.templateName||!e.isAssistant&&2!=e.layout?"split"==e.templateName?o+i:h-i:h,xc:d=l,yc:c,xd:s,yd:h,x:d,y:c+16,rotate:0}},_linkBottomToTop:function(t,e,r,i){var a,o,n,l,s,h,d,c=0;return a=t.x+t.w/2+r.linkAdjuster.toX,o=t.y+r.linkAdjuster.toY,s=l=e.x+e.w/2+r.linkAdjuster.fromX,h=e.y+e.h+r.linkAdjuster.fromY,{xa:n=a,ya:o,xb:n,yb:c=t.rightNeighbor&&t.rightNeighbor.isAssistant&&"split"==e.templateName?t.rightNeighbor.y-i:"split"!=t.templateName||!e.isAssistant&&2!=e.layout?"split"==e.templateName?o-i:h+i:h,xc:d=l,yc:c,xd:s,yd:h,x:d,y:c-14,rotate:0}},_linkRightToLeft:function(t,e,r,i){var a,o,n,l,s,h,d,c=0;return a=t.x+r.linkAdjuster.toX,o=t.y+t.h/2+r.linkAdjuster.toY,s=e.x+e.w+r.linkAdjuster.fromX,h=l=e.y+e.h/2+r.linkAdjuster.fromY,{xa:a,ya:n=o,xb:c=t.rightNeighbor&&t.rightNeighbor.isAssistant&&"split"==e.templateName?t.rightNeighbor.x-i:"split"!=t.templateName||!e.isAssistant&&2!=e.layout?"split"==e.templateName?a-i:s+i:s,yb:n,xc:c,yc:d=l,xd:s,yd:h,x:c-16,y:d,rotate:90}},_linkLeftToRight:function(t,e,r,i){var a,o,n,l,s,h,d,c=0;return a=t.x+t.w+r.linkAdjuster.toX,o=t.y+t.h/2+r.linkAdjuster.toY,s=e.x+r.linkAdjuster.fromX,h=l=e.y+e.h/2+r.linkAdjuster.fromY,{xa:a,ya:n=o,xb:c=t.rightNeighbor&&t.rightNeighbor.isAssistant&&"split"==e.templateName?t.rightNeighbor.x+t.rightNeighbor.w+i:"split"!=t.templateName||!e.isAssistant&&2!=e.layout?"split"==e.templateName?a+i:s-i:s,yb:n,xc:c,yc:d=l,xd:s,yd:h,x:c+14,y:d,rotate:270}}},void 0===OrgChart&&(OrgChart={}),OrgChart._validateConfig=function(t){return!!t||(console.error("config is not defined"),!1)},OrgChart._arrayContains=function(t,e){if(t&&Array.isArray(t))for(var r=t.length;r--;)if(t[r]===e)return!0;return!1},OrgChart._interceptions=function(t,e){if(!t)return[];if(!e)return[];var r=[];if(Array.isArray(t)&&Array.isArray(e))for(var i in t)for(var a in e)t[i]==e[a]&&r.push(t[i]);else if(Array.isArray(t)&&!Array.isArray(e))for(var i in t)for(var a in e)t[i]==a&&r.push(t[i]);else if(!Array.isArray(t)&&Array.isArray(e))for(var i in t)for(var a in e)i==e[a]&&r.push(e[a]);return r},OrgChart._getTags=function(t){return t.tags&&!Array.isArray(t.tags)?t.tags.split(","):t.tags&&Array.isArray(t.tags)?t.tags:[]},OrgChart._centerPointInPercent=function(t,e,r){var i=t.getBoundingClientRect(),a=e-i.left,o=r-i.top;return[a/(i.width/100),o/(i.height/100)]},OrgChart._trim=function(t){return t.replace(/^\s+|\s+$/g,"")},OrgChart._getTransform=function(t){var e=t.getAttribute("transform");return e=e.replace("matrix","").replace("(","").replace(")",""),OrgChart._browser().msie&&(e=e.replace(/ /g,",")),e="["+(e=OrgChart._trim(e))+"]",e=JSON.parse(e)},OrgChart.getScale=function(t,e,r,i,a,o,n,l){var s=1;if(t||i!==OrgChart.match.boundary)if(t||i!==OrgChart.match.width)if(t||i!==OrgChart.match.height)if(t){var h,d=e/t[2];s=(h=r/t[3])<d?h:d}else s=i;else s=r/l;else s=e/n;else s=(h=r/l)<(d=e/n)?h:d;return s&&a<s&&(s=a),s&&s<o&&(s=o),s},OrgChart._mergeObject=function(t,e){var r={};for(var i in t)r[i]=t[i];for(i in e)r[i]=e[i];return r},OrgChart._lblIsImg=function(t,e){return!(!t.nodeBinding||-1==e.indexOf("img")||!t.nodeBinding[e])},OrgChart._fieldIsImg=function(t,e){if(t.nodeBinding)for(var r in t.nodeBinding)if(t.nodeBinding[r]==e)return OrgChart._lblIsImg(t,r);return!1},OrgChart._guid=function(){function t(){return Math.floor(65536*(1+Math.random())).toString(16).substring(1)}return t()+t()+"-"+t()+"-"+t()+"-"+t()+"-"+t()+t()+t()},OrgChart.htmlRipple=function(n){var t=document.createElement("style");t.type="text/css",t.innerHTML=" .bg-ripple-container {position: absolute; top: 0; right: 0; bottom: 0; left: 0; } .bg-ripple-container span {transform: scale(0);border-radius:100%;position:absolute;opacity:0.75;background-color:#fff;animation: bg-ripple 1000ms; }@-moz-keyframes bg-ripple {to {opacity: 0;transform: scale(2);}}@-webkit-keyframes bg-ripple {to {opacity: 0;transform: scale(2);}}@-o-keyframes bg-ripple {to {opacity: 0;transform: scale(2);}}@keyframes bg-ripple {to {opacity: 0;transform: scale(2);}}",document.head.appendChild(t);var r,i,a,e=document.createElement("div");e.className="bg-ripple-container",n.addEventListener("mousedown",function(t){var e,r,i,a,o;return r=document.createElement("span"),i=this.offsetWidth,e=this.getBoundingClientRect(),o=t.pageX-e.left-i/2,a="top:"+(t.pageY-e.top-i/2)+"px; left: "+o+"px; height: "+i+"px; width: "+i+"px;",n.rippleContainer.appendChild(r),r.setAttribute("style",a)}),n.addEventListener("mouseup",(r=function(){for(;this.rippleContainer.firstChild;)this.rippleContainer.removeChild(this.rippleContainer.firstChild)},i=2e3,a=void 0,function(){var t,e;return e=this,t=arguments,clearTimeout(a),a=setTimeout(function(){return r.apply(e,t)},i)})),n.rippleContainer=e,n.appendChild(e)},OrgChart._moveToBoundaryArea=function(t,e,r,i){var a=e.slice(0);e[0]<r.left&&e[0]<r.right&&(a[0]=r.left>r.right?r.right:r.left),e[0]>r.right&&e[0]>r.left&&(a[0]=r.left>r.right?r.left:r.right),e[1]<r.top&&e[1]<r.bottom&&(a[1]=r.top>r.bottom?r.bottom:r.top),e[1]>r.bottom&&e[1]>r.top&&(a[1]=r.top>r.bottom?r.top:r.bottom),e[0]!==a[0]||e[1]!==a[1]?OrgChart.anim(t,{viewBox:e},{viewBox:a},300,OrgChart.anim.outPow,function(){i&&i()}):i&&i()},OrgChart._randomId=function(){return Math.random().toString(36).substring(2,15)+Math.random().toString(36).substring(2,15)},OrgChart._getClientXY=function(t){return-1==t.type.indexOf("touch")?{x:t.clientX,y:t.clientY}:t.changedTouches.length?{x:t.changedTouches[0].clientX,y:t.changedTouches[0].clientY}:void 0},OrgChart._getClientTouchesXY=function(t,e){return-1!=t.type.indexOf("touch")?t.touches.length<e+1?{x:null,y:null}:{x:t.touches[e].clientX,y:t.touches[e].clientY}:{x:t.clientX,y:t.clientY}},OrgChart._getOffset=function(t,e){t&&(e.x+=t.offsetLeft,e.y+=t.offsetTop,OrgChart._getOffset(t.offsetParent,e))},OrgChart._getTopLeft=function(t){var e={x:0,y:0};return OrgChart._getOffset(t,e),e},OrgChart._getOffsetXY=function(t,e){if(-1==e.type.indexOf("touch"))return{x:e.offsetX,y:e.offsetY};if(e.touches.length){var r=OrgChart._getTopLeft(t);return{x:e.touches[0].pageX-r.x,y:e.touches[0].pageY-r.y}}if(e.changedTouches.length){r=OrgChart._getTopLeft(t);return{x:e.changedTouches[0].pageX-r.x,y:e.changedTouches[0].pageY-r.y}}},OrgChart._pinchMiddlePointInPercent=function(t,e,r,i){var a=OrgChart._getTopLeft(t),o=i.touches[0].pageX-a.x,n=i.touches[0].pageY-a.y,l=i.touches[1].pageX-a.x,s=i.touches[1].pageY-a.y;return[((o-l)/2+l)/(e/100),((n-s)/2+s)/(r/100)]},OrgChart._browser=function(){var t=!!window.opr&&!!opr.addons||!!window.opera||0<=navigator.userAgent.indexOf(" OPR/"),e="undefined"!=typeof InstallTrigger,r=/constructor/i.test(window.HTMLElement)||"[object SafariRemoteNotification]"===(!window.safari||"undefined"!=typeof safari&&safari.pushNotification).toString(),i=!!document.documentMode,a=!i&&!!window.StyleMedia,o=!(!window.chrome||!window.chrome.webstore&&!window.chrome.runtime);return{opera:t,firefox:e,safari:r,msie:i,edge:a,chrome:o,blink:(o||t)&&!!window.CSS}},OrgChart._menuPosition=function(t,e,r){var i=t.getBoundingClientRect(),a=r.getBoundingClientRect(),o=e.getBoundingClientRect(),n=i.left-a.left,l=i.top-a.top;return i.top+o.height>a.top+a.height&&(l-=o.height),i.left-o.width<a.left&&(n+=o.width),{x:n,y:l}},OrgChart._getTemplate=function(t,e,r){if(Array.isArray(t))for(var i=0;i<t.length;i++){var a=e[t[i]];if(a&&!a.group&&a.template)return a.template}return r},OrgChart._getGroup=function(t,e){for(var r=0;r<t.length;r++){var i=e[t[r]];if(i&&i.group&&i.template)return{tag:i,name:t[r]}}return null},OrgChart._isHTML=function(t){var e=document.createElement("div");e.innerHTML=t;for(var r=e.childNodes,i=r.length;i--;)if(1==r[i].nodeType)return!0;return!1},OrgChart._getTestDiv=function(){var t=document.getElementById("orgchart_js_test_div");return t||((t=document.createElement("div")).id="orgchart_js_test_div",t.style.position="fixed",t.style.top="-10000px",t.style.left="-10000px",document.body.appendChild(t)),t},OrgChart._getLabelSize=function(t){var e=OrgChart._getTestDiv();return e.innerHTML="<svg>"+t+"</svg>",e.querySelector("text").getBoundingClientRect()},OrgChart.wrapText=function(t,e){if(-1==e.indexOf("<text"))return t;if(-1==e.indexOf("width"))return t;if(OrgChart._isHTML(t))return t;var r=OrgChart._getTestDiv();r.innerHTML="<svg>"+e+"</svg>";var i=(new DOMParser).parseFromString(e,"text/xml").getElementsByTagName("text")[0],a=parseFloat(i.getAttribute("x")),o=parseFloat(i.getAttribute("y")),n=i.getAttribute("text-anchor"),l=i.getAttribute("width"),s=i.getAttribute("text-overflow"),h="http://www.w3.org/2000/svg",d=r.getElementsByTagName("svg")[0].getElementsByTagName("text")[0],c=parseFloat(i.getAttribute("text-overflow-lines"));if(c||(c=0),!l)return t;if(l=parseFloat(l),a||(a=0),o||(o=0),a||(n="start"),s||(s="ellipsis"),"ellipsis"==s){d.removeChild(d.firstChild),d.textContent=t;for(var g=d.getComputedTextLength(),p=2;l<g;)d.textContent=t.substring(0,t.length-p),d.textContent+="...",g=d.getComputedTextLength(),p++;return 2<p?"<title>"+t+"</title>"+d.textContent:t}if("multiline"==s){var f=t.split(" "),u=d.getBBox().height;d.textContent="";var C=document.createElementNS(h,"tspan"),m=document.createTextNode(f[0]);C.setAttributeNS(null,"x",a),C.setAttributeNS(null,"y",o),C.setAttributeNS(null,"text-anchor",n),C.appendChild(m),d.appendChild(C);p=1;for(var O=1,v=1;v<f.length;v++){var x=C.firstChild.data.length;if(C.firstChild.data+=" "+f[v],C.getComputedTextLength()>l){if(C.firstChild.data=C.firstChild.data.slice(0,x),O++,0!==c&&c<O)break;(C=document.createElementNS(h,"tspan")).setAttributeNS(null,"x",a),C.setAttributeNS(null,"y",o+u*p),C.setAttributeNS(null,"text-anchor",n),m=document.createTextNode(f[v]),C.appendChild(m),d.appendChild(C),p++}}var y="";if(null!=d.innerHTML)y=d.innerHTML,d.innerHTML="";else{var b="";for(v=d.childNodes.length-1;0<=v;v--)b=XMLSerializer().serializeToString(d.childNodes[v])+b,d.removeChild(d.childNodes[v]);y=b}return y}},OrgChart._downloadFile=function(t,e,r,i){var a=new Blob([e],{type:t});if(1==i){var o=URL.createObjectURL(a);window.open(o,"_blank").focus()}else if(navigator.msSaveBlob)navigator.msSaveBlob(a,r);else{var n=document.createElement("a");if(void 0!==n.download){o=URL.createObjectURL(a);n.setAttribute("href",o),n.setAttribute("download",r),n.style.visibility="hidden",document.body.appendChild(n),n.click(),document.body.removeChild(n)}}},OrgChart._getPosition=function(t,e,r,i){var a={x:e.x,y:e.y};if(null!=r&&(a.x=r),null!=i&&(a.y=i),t&&3==t.length){var o=t[0].indexOf(e.id);-1!=o&&null!=t[1][o].transform&&(null==r&&(a.x=t[1][o].transform[4]),null==i&&(a.y=t[1][o].transform[5]))}return a},OrgChart._getOpacity=function(t,e){var r=1;if(t&&3==t.length){var i=t[0].indexOf(e.id);-1!=i&&null!=t[1][i].opacity&&(r=t[1][i].opacity)}return r},OrgChart.t=function(t,e){var r=OrgChart.templates[t],i=null;if(null!=e&&r.scaleLessThen){var a=[];for(var o in r.scaleLessThen){var n=parseFloat(o);e<n&&a.push(n)}if(0<a.length){a.sort(function(t,e){return t-e});var l=r.scaleLessThen[a[0]];for(var s in l)null==i&&(i=Object.assign({},r)),i[s]=l[s]}}return null==i?r:i},OrgChart._imgs2base64=function(t,e,i,a){var o=t.getElementsByTagName(e),n=o.length;0==n&&a();for(var l=0;l<n;l++)!function(){var e=l,r=o[e];OrgChart._getDataUri(r.getAttribute(i),function(t){t.success&&r.setAttribute(i,t.result),e==n-1&&a()})}()},OrgChart._getDataUri=function(t,e){if(-1!=t.indexOf("base64"))e({success:!1});else{var r=new XMLHttpRequest;r.open("GET",t),r.responseType="blob",r.onload=function(){200===r.status?i.readAsDataURL(r.response):404===r.status&&e({success:!1,result:r.status})};var i=new FileReader;i.onloadend=function(){e({success:!0,result:i.result})},r.send()}},OrgChart._csvToArray=function(t,e){e=e||",";for(var r=new RegExp("(\\"+e+'|\\r?\\n|\\r|^)(?:"([^"]*(?:""[^"]*)*)"|([^"\\'+e+"\\r\\n]*))","gi"),i=[[]],a=null;a=r.exec(t);){var o,n=a[1];n.length&&n!==e&&i.push([]),o=a[2]?a[2].replace(new RegExp('""',"g"),'"'):a[3],i[i.length-1].push(o)}return i},OrgChart._json2xml=function(t){for(var e=document.implementation.createDocument("","",null),r=e.createElement("nodes"),i=0;i<t.length;i++){var a=e.createElement("node"),o=t[i];for(var n in o){var l=o[n];"tags"==n&&(l=l.join()),a.setAttribute(n,l)}r.appendChild(a)}return e.appendChild(r),'<?xml version="1.0" encoding="utf-8" ?>'+(new XMLSerializer).serializeToString(e.documentElement)},OrgChart._xml2json=function(t){for(var e=(new DOMParser).parseFromString(t,"text/xml").getElementsByTagName("node"),r=[],i=0;i<e.length;i++){for(var a=e[i],o={},n=0;n<a.attributes.length;n++){var l=a.attributes[n],s=l.value;"tags"==l.name&&(s=s.split(",")),o[l.name]=s}r.push(o)}return r},OrgChart._json2csv=function(t){for(var o=[],e=function(t){for(var e="",r=0;r<o.length;r++){var i;(i="reportsTo"==o[r]?null:null==t[o[r]]?"":t[o[r]])instanceof Date&&(i=i.toLocaleString());var a=(i=null===i?"":i.toString()).replace(/"/g,'""');0<=a.search(/("|,|\n)/g)&&(a='"'+a+'"'),0<r&&(e+=","),e+=a}return e+"\n"},r="",i=0;i<t.length;i++)for(var a in t[i])OrgChart._arrayContains(o,a)||(o.push(a),r+=a+",");r+="\n";for(i=0;i<t.length;i++)r+=e(t[i]);return r},OrgChart.accentFold=function(t){return(t=t.toString().toLowerCase()).replace(/([Ã Ã¡Ã¢Ã£Ã¤Ã¥])|([Ã§])|([Ã¨Ã©ÃªÃ«])|([Ã¬Ã­Ã®Ã¯])|([Ã±])|([Ã²Ã³Ã´ÃµÃ¶Ã¸])|([ÃŸ])|([Ã¹ÃºÃ»Ã¼])|([Ã¿])|([Ã¦])/g,function(t,e,r,i,a,o,n,l,s,h,d){return e?"a":r?"c":i?"e":a?"i":o?"n":n?"o":l?"s":s?"u":h?"y":d?"ae":void 0})},OrgChart.copy=function(t){if(null===t||"object"!=typeof t||"isActiveClone"in t)return t;if(t instanceof Date)var e=new t.constructor;else e=t.constructor();for(var r in t)Object.prototype.hasOwnProperty.call(t,r)&&(t.isActiveClone=null,e[r]=OrgChart.copy(t[r]),delete t.isActiveClone);return e},OrgChart._getScrollSensitivity=function(){var t=OrgChart._browser();return t.msie&&OrgChart.scroll.ie?OrgChart.scroll.ie:t.edge&&OrgChart.scroll.edge?OrgChart.scroll.edge:t.safari&&OrgChart.scroll.safari?OrgChart.scroll.safari:t.chrome&&OrgChart.scroll.chrome?OrgChart.scroll.chrome:t.firefox&&OrgChart.scroll.firefox?OrgChart.scroll.firefox:t.opera&&OrgChart.scroll.opera?OrgChart.scroll.opera:{smooth:OrgChart.scroll.smooth,speed:OrgChart.scroll.speed}},OrgChart.isTrial=function(){return void 0!==OrgChart.remote},OrgChart.collapsedChildrenCount=function(t,e,r){var i=e.childrenIds;null==r&&(r=[],i=e.collapsedChildrenIds);for(var a=0;a<i.length;a++){var o=i[a];"string"==typeof o&&-1==o.indexOf("split")&&-1==o.indexOf("transperant")?-1==r.indexOf(o)&&r.push(o):"string"!=typeof o&&-1==r.indexOf(o)&&r.push(o),OrgChart.collapsedChildrenCount(t,t.nodes[o],r)}return r.length},OrgChart.xScrollUI=function(t,e,r,i,a){this.element=t,this.requestParams=r,this.config=e,this.onSetViewBoxCallback=i,this.onDrawCallback=a,this.pos=0},OrgChart.xScrollUI.prototype.addListener=function(t){var n=this;if((this.config.mouseScrool==OrgChart.action.xScroll||this.config.mouseScrool==OrgChart.action.scroll)&&this.bar){var e=OrgChart._getScrollSensitivity();!function(t,i,e){var a=!1;function o(){a=!0;var t=(n.pos-n.bar.scrollLeft)/e;0<t?t++:t--,n.bar.scrollLeft+=t,n.bar.scrollLeft==n.pos?a=!1:r(o)}t.addEventListener("wheel",function(t){var e=0;if(n.config.mouseScrool==OrgChart.action.xScroll)(e=t.deltaX||t.wheelDeltaX)||(e=t.deltaY||t.wheelDeltaY);else if(n.config.mouseScrool==OrgChart.action.scroll&&!(e=t.shiftKey?t.deltaY||t.wheelDeltaY:t.deltaX||t.wheelDeltaX))return;e=-e,t.preventDefault(),e=Math.max(-1,Math.min(1,e)),n.pos+=-e*i;var r=parseFloat(n.innerBar.clientWidth)-parseFloat(n.bar.clientWidth);n.pos<0&&(n.pos=0),n.pos>r&&(n.pos=r),a||o()},!1);var r=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(t){setTimeout(t,20)}}(t,e.speed,e.smooth)}},OrgChart.xScrollUI.prototype.create=function(t){if(this.config.showXScroll===OrgChart.scroll.visible||this.config.mouseScrool===OrgChart.action.scroll||this.config.mouseScrool===OrgChart.action.xScroll){var a=this;this.bar&&this.bar.parentNode.removeChild(this.bar),this.bar=document.createElement("div"),this.config.showXScroll!==OrgChart.scroll.visible&&(this.bar.style.visibility="hidden"),this.innerBar=document.createElement("div");this.requestParams();this.innerBar.innerHTML="&nbsp",Object.assign(this.bar.style,{position:"absolute",left:0,bottom:0,width:t+"px","overflow-x":"scroll",height:"20px"}),this.element.appendChild(this.bar),this.bar.appendChild(this.innerBar),this.bar.addEventListener("scroll",function(){if(this.ignore)this.ignore=!1;else{var t=a.requestParams(),e=(parseFloat(a.innerBar.clientWidth)-parseFloat(a.bar.clientWidth))/100,r=this.scrollLeft/e,i=(t.boundary.right-t.boundary.left)/100;t.viewBox[0]=r*i+t.boundary.left,a.onSetViewBoxCallback(t.viewBox),clearTimeout(this._timeout),this._timeout=setTimeout(function(){a.onDrawCallback()},500)}})}},OrgChart.xScrollUI.prototype.setPosition=function(){if(this.bar){var t=this.requestParams(),e=Math.abs(t.boundary.maxX-t.boundary.minX)*t.scale;switch(this.config.orientation){case OrgChart.orientation.bottom:case OrgChart.orientation.bottom_left:innerHeight=Math.abs(t.boundary.minY*t.scale);break;case OrgChart.orientation.right:case OrgChart.orientation.right_top:e=Math.abs(t.boundary.minX*t.scale)}this.innerBar.style.width=e+"px";var r=(t.boundary.right-t.boundary.left)/100,i=(t.viewBox[0]-t.boundary.left)/r;i<0?i=0:100<i&&(i=100);var a=(parseFloat(this.innerBar.clientWidth)-parseFloat(this.bar.clientWidth))/100,o=i*a;this.bar.ignore=!0,this.bar.scrollLeft=o,this.pos=this.bar.scrollLeft,this.bar.style.visibility=a<=0?"hidden":""}},OrgChart.yScrollUI=function(t,e,r,i,a){this.element=t,this.requestParams=r,this.config=e,this.onSetViewBoxCallback=i,this.onDrawCallback=a,this.pos=0},OrgChart.yScrollUI.prototype.addListener=function(t){var n=this;if(this.config.mouseScrool==OrgChart.action.yScroll||this.config.mouseScrool==OrgChart.action.scroll){var e=OrgChart._getScrollSensitivity();!function(t,i,e){var a=!1;function o(){a=!0;var t=(n.pos-n.bar.scrollTop)/e;0<t?t++:t--,n.bar.scrollTop+=t,n.bar.scrollTop==n.pos?a=!1:r(o)}t.addEventListener("wheel",function(t){var e=0;if(n.config.mouseScrool==OrgChart.action.yScroll)(e=t.deltaY||t.wheelDeltaY)||(e=t.deltaX||t.wheelDeltaX);else if(n.config.mouseScrool==OrgChart.action.scroll&&!(e=t.shiftKey?t.deltaX||t.wheelDeltaX:t.deltaY||t.wheelDeltaY))return;e=-e,t.preventDefault(),e=Math.max(-1,Math.min(1,e)),n.pos+=-e*i;var r=parseFloat(n.innerBar.clientHeight)-parseFloat(n.bar.clientHeight);n.pos<0&&(n.pos=0),n.pos>r&&(n.pos=r),a||o()},!1);var r=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.oRequestAnimationFrame||window.msRequestAnimationFrame||function(t){setTimeout(t,20)}}(t,e.speed,e.smooth)}},OrgChart.yScrollUI.prototype.create=function(t){if(this.config.showYScroll===OrgChart.scroll.visible||this.config.mouseScrool===OrgChart.action.scroll||this.config.mouseScrool===OrgChart.action.yScroll){var a=this;this.bar&&this.bar.parentNode.removeChild(this.bar),this.bar=document.createElement("div"),this.config.showYScroll!==OrgChart.scroll.visible&&(this.bar.style.visibility="hidden"),this.innerBar=document.createElement("div"),this.innerBar.innerHTML="&nbsp",Object.assign(this.bar.style,{position:"absolute",right:0,bottom:0,height:t+"px","overflow-y":"scroll",width:"20px"}),this.element.appendChild(this.bar),this.bar.appendChild(this.innerBar),this.bar.addEventListener("scroll",function(){if(this.ignore)this.ignore=!1;else{var t=a.requestParams(),e=(parseFloat(a.innerBar.clientHeight)-parseFloat(a.bar.clientHeight))/100,r=this.scrollTop/e,i=(t.boundary.bottom-t.boundary.top)/100;t.viewBox[1]=r*i+t.boundary.top,a.onSetViewBoxCallback(t.viewBox),clearTimeout(this._timeout),this._timeout=setTimeout(function(){a.onDrawCallback()},500)}})}},OrgChart.yScrollUI.prototype.setPosition=function(){if(this.bar){var t=this.requestParams(),e=t.boundary.maxY*t.scale;switch(this.config.orientation){case OrgChart.orientation.bottom:case OrgChart.orientation.bottom_left:e=Math.abs(t.boundary.minY*t.scale);break;case OrgChart.orientation.right:case OrgChart.orientation.right_top:innerWidth=Math.abs(t.boundary.minX*t.scale)}this.innerBar.style.height=e+"px";var r=(t.boundary.bottom-t.boundary.top)/100,i=(t.viewBox[1]-t.boundary.top)/Math.abs(r);i<0?i=0:100<i&&(i=100);var a=(parseFloat(this.innerBar.clientHeight)-parseFloat(this.bar.clientHeight))/100,o=i*a;this.bar.ignore=!0,this.bar.scrollTop=o,this.pos=this.bar.scrollTop,this.bar.style.visibility=a<=0?"hidden":""}},OrgChart.prototype.zoom=function(t,e,r){var i=this.getViewBox().slice(0),a=i,o=i[2],n=i[3];!0===t?(i[2]=i[2]/OrgChart.SCALE_FACTOR,i[3]=i[3]/OrgChart.SCALE_FACTOR):!1===t?(i[2]=i[2]*OrgChart.SCALE_FACTOR,i[3]=i[3]*OrgChart.SCALE_FACTOR):(i[2]=i[2]/t,i[3]=i[3]/t),e||(e=[50,50]),i[0]=a[0]-(i[2]-o)/(100/e[0]),i[1]=a[1]-(i[3]-n)/(100/e[1]);var l=this.getScale(i);if(i[2]=this.width()/l,i[3]=this.height()/l,!0===t&&l<this.config.scaleMax||!1===t&&l>this.config.scaleMin||0!=t&&1!=t&&l<this.config.scaleMax&&l>this.config.scaleMin){this._hideBeforeAnimation();var s=this;r?(clearTimeout(s._timeout),OrgChart.anim(this.getSvg(),{viewbox:this.getViewBox()},{viewbox:i},this.config.anim.duration,this.config.anim.func,function(){clearTimeout(s._timeout),s._timeout=setTimeout(function(){s._draw(!0,OrgChart.action.zoom)},500)})):(this.setViewBox(i),clearTimeout(s._timeout),s._timeout=setTimeout(function(){s._draw(!0,OrgChart.action.zoom)},500))}},OrgChart.loading={},OrgChart.loading.show=function(t){var e=document.createElement("div");e.id="bg-loading",e.innerHTML='<style>@-webkit-keyframes dot-keyframes {0% { opacity: .4; -webkit-transform: scale(1, 1);transform: scale(1, 1);}50% {opacity: 1;-webkit-transform: scale(1.2, 1.2);transform: scale(1.2, 1.2);}100% {opacity: .4;-webkit-transform: scale(1, 1);transform: scale(1, 1);}}@keyframes dot-keyframes {0% {opacity: .4;-webkit-transform: scale(1, 1);transform: scale(1, 1);}50% {opacity: 1;-webkit-transform: scale(1.2, 1.2);transform: scale(1.2, 1.2);}100% {opacity: .4;-webkit-transform: scale(1, 1);transform: scale(1, 1);}}.bg-loading-dots div {margin: 10px;}      .bg-dot-1 {background-color: #039BE5;}.bg-dot-2 {background-color: #F57C00;}.bg-dot-3 {background-color: #FFCA28;}      .bg-loading-dots {text-align: center;width: 100%; position: absolute; top: 0;}.bg-loading-dots--dot {-webkit-animation: dot-keyframes 1.5s infinite ease-in-out;animation: dot-keyframes 1.5s infinite ease-in-out;        border-radius: 10px;display: inline-block;height: 10px;width: 10px;}.bg-loading-dots--dot:nth-child(2) {-webkit-animation-delay: .5s;animation-delay: .5s;}.bg-loading-dots--dot:nth-child(3) {-webkit-animation-delay: 1s;animation-delay: 1s;}</style><div class="bg-loading-dots"><div class="bg-loading-dots--dot bg-dot-1"></div><div class="bg-loading-dots--dot bg-dot-2"></div><div class="bg-loading-dots--dot bg-dot-3"></div></div>',t.element.appendChild(e)},OrgChart.loading.hide=function(t){var e=t.element.querySelector("#bg-loading");e&&e.parentNode.removeChild(e)},OrgChart.pdfPrevUI={},OrgChart.loc||(OrgChart.loc={}),OrgChart.loc.ppdfCmdTitle="PDF Preview",OrgChart.loc.ppdfSave="Save",OrgChart.loc.ppdfCancel="Cancel",OrgChart.loc.ppdfFormat="Format",OrgChart.loc.ppdfFitToDrwaing="Fit",OrgChart.loc.ppdfFitToDrwaing2Levels="Fit (2 Levels Page)",OrgChart.loc.ppdfA4="A4",OrgChart.loc.ppdfA3="A3",OrgChart.loc.ppdfA2="A2",OrgChart.loc.ppdfA1="A1",OrgChart.loc.ppdfA42Levels="A4 (2 Levels Page)",OrgChart.loc.ppdfA32Levels="A3 (2 Levels Page)",OrgChart.loc.ppdfA22Levels="A2 (2 Levels Page)",OrgChart.loc.ppdfA12Levels="A1 (2 Levels Page)",OrgChart.loc.ppdfLayout="Layout",OrgChart.loc.ppdfPortrait="Portrait",OrgChart.loc.ppdfLandscape="Landscape",OrgChart.loc.ppdfFittopagewidth="Fit to page width",OrgChart.loc.ppdfMargin="Margin",OrgChart.loc.ppdfHeader="Header",OrgChart.loc.ppdfFooter="Footer",OrgChart.loc.ppdfScale="Scale",OrgChart.pdfPrevUI.show=function(r,i){i=r._defaultExportOptions(i,"pdf");var t=document.createElement("div");t.id="bg-ppdf-btns",Object.assign(t.style,{position:"absolute",top:0,left:0,"background-color":"#fff","z-index":5,margin:"0 0 0 -250px","box-shadow":"0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)",width:"250px",height:"100%","font-family":"Roboto,Helvetica",color:"#757575","text-align":"right",padding:"10px"}),r.element.appendChild(t),t.innerHTML="<h1>"+OrgChart.loc.ppdfCmdTitle+'</h1><div><button id="bg-prev-save" style="font-size: 14px; width: 90px;">'+OrgChart.loc.ppdfSave+'</button>&nbsp;<button id="bg-prev-cancel" style="width: 90px;font-size: 14px;">'+OrgChart.loc.ppdfCancel+'</button></div><div style="margin-top:30px; height:10px;border-bottom:1px solid #eeeeee;"></div><div style="padding-top:30px;"><label for="bg-size">'+OrgChart.loc.ppdfFormat+': </label><select id="bg-ppdf-size" style="color: #757575; width: 150px; font-size: 14px;" id="bg-size"><option value="fit">'+OrgChart.loc.ppdfFitToDrwaing+'</option><option value="A4">'+OrgChart.loc.ppdfA4+'</option><option value="A3">'+OrgChart.loc.ppdfA3+'</option><option value="A2">'+OrgChart.loc.ppdfA2+'</option><option value="A1">'+OrgChart.loc.ppdfA1+'</option><option value="fit2Levels">'+OrgChart.loc.ppdfFitToDrwaing2Levels+'</option><option value="A42Levels">'+OrgChart.loc.ppdfA42Levels+'</option><option value="A32Levels">'+OrgChart.loc.ppdfA32Levels+'</option><option value="A22Levels">'+OrgChart.loc.ppdfA22Levels+'</option><option value="A12Levels">'+OrgChart.loc.ppdfA12Levels+'</option></select></div><div style="padding-top:10px;"><label for="bg-ppdf-layout">'+OrgChart.loc.ppdfLayout+': </label><select id="bg-ppdf-layout" style="color: #757575; width: 150px;font-size: 14px;" ><option value="false">'+OrgChart.loc.ppdfPortrait+'</option><option value="true">'+OrgChart.loc.ppdfLandscape+'</option></select></div><div style="padding-top:10px;"><label for="bg-scale">'+OrgChart.loc.ppdfScale+': </label><select id="bg-ppdf-scale" style="color: #757575; width: 150px;font-size: 14px;" id="bg-scale"><option value="fit">'+OrgChart.loc.ppdfFittopagewidth+'</option><option value="10">10%</option><option value="20">20%</option><option value="30">30%</option><option value="40">40%</option><option value="50">50%</option><option value="60">60%</option><option value="70">70%</option><option value="80">80%</option><option value="90">90%</option><option value="100">100%</option><option value="110">110%</option><option value="120">120%</option><option value="130">130%</option><option value="140">140%</option><option value="150">150%</option><option value="160">160%</option><option value="170">170%</option><option value="180">180%</option><option value="190">190%</option><option value="200">200%</option></select></div><div style="margin-top:10px;margin-bottom:10px; height:10px;border-bottom:1px solid #eeeeee;"></div><div style="padding-top:10px;"><label for="bg-ppdf-header">'+OrgChart.loc.ppdfHeader+': </label><input id="bg-ppdf-header" type="text" style="color: #757575; width: 100px;font-size: 14px;" ></div><div style="padding-top:10px;"><label for="bg-ppdf-footer">'+OrgChart.loc.ppdfFooter+': </label><input id="bg-ppdf-footer" type="text" style="color: #757575; width: 100px;font-size: 14px;" ></div><div style="padding-top:10px;"><label for="bg-ppdf-margin">'+OrgChart.loc.ppdfMargin+': </label><input id="bg-ppdf-margin" type="text" style="color: #757575; width: 100px;font-size: 14px;" ></div>';var e=document.createElement("div");e.id="bg-ppdf-wrapper",Object.assign(e.style,{"overflow-y":"scroll",position:"absolute",top:0,left:"270px","background-color":"#eee",width:r.width()-270+"px",height:"100%"}),r.element.appendChild(e),e.innerHTML='<div id="bg-ppdf-content" style="width: 100%;margin-top:10px;margin-bottom:10px;opacity:0;"></div>';var a,o,n,l=r.element.querySelector("#bg-ppdf-size"),s=r.element.querySelector("#bg-ppdf-layout"),h=r.element.querySelector("#bg-ppdf-scale"),d=r.element.querySelector("#bg-ppdf-margin"),c=r.element.querySelector("#bg-ppdf-header"),g=r.element.querySelector("#bg-ppdf-footer");l.value=i.format,s.value=i.landscape,h.value=i.scale,d.value=i.margin,c.value=i.header,g.value=i.footer,OrgChart.anim(r.element.querySelector("#bg-ppdf-btns"),{margin:[0,0,0,-250]},{margin:[0,0,0,0]},300,OrgChart.anim.outSin,function(){r.exportPDF(i,OrgChart.pdfPrevUI._handler)}),r.element.querySelector("#bg-prev-cancel").addEventListener("click",function(){OrgChart.pdfPrevUI.hide(r)}),r.element.querySelector("#bg-prev-save").addEventListener("click",function(){r.exportPDF(i),OrgChart.pdfPrevUI.hide(r)}),OrgChart.pdfPrevUI._showHide(l,s,h),l.addEventListener("change",function(){OrgChart.anim(r.element.querySelector("#bg-ppdf-content"),{opacity:1},{opacity:0},300,OrgChart.anim.inSin,function(){r.element.querySelector("#bg-ppdf-content").innerHTML="",i.format=l.value,r.exportPDF(i,OrgChart.pdfPrevUI._handler),OrgChart.pdfPrevUI._showHide(l,s,h)})}),s.addEventListener("change",function(){OrgChart.anim(r.element.querySelector("#bg-ppdf-content"),{opacity:1},{opacity:0},300,OrgChart.anim.inSin,function(){r.element.querySelector("#bg-ppdf-content").innerHTML="",i.landscape="true"==s.value,r.exportPDF(i,OrgChart.pdfPrevUI._handler),OrgChart.pdfPrevUI._showHide(l,s,h)})}),h.addEventListener("change",function(){OrgChart.anim(r.element.querySelector("#bg-ppdf-content"),{opacity:1},{opacity:0},300,OrgChart.anim.inSin,function(){r.element.querySelector("#bg-ppdf-content").innerHTML="",i.scale=h.value,r.exportPDF(i,OrgChart.pdfPrevUI._handler),OrgChart.pdfPrevUI._showHide(l,s,h)})}),d.addEventListener("keyup",function(){clearTimeout(a),a=setTimeout(function(){OrgChart.anim(r.element.querySelector("#bg-ppdf-content"),{opacity:1},{opacity:0},300,OrgChart.anim.inSin,function(){r.element.querySelector("#bg-ppdf-content").innerHTML="";var t=d.value.split(",");if(4==t.length){for(var e=0;e<t.length;e++)t[e]=parseInt(t[e]);i.margin=t,r.exportPDF(i,OrgChart.pdfPrevUI._handler)}})},1e3)}),c.addEventListener("keyup",function(){clearTimeout(o),o=setTimeout(function(){OrgChart.anim(r.element.querySelector("#bg-ppdf-content"),{opacity:1},{opacity:0},300,OrgChart.anim.inSin,function(){r.element.querySelector("#bg-ppdf-content").innerHTML="",i.header=c.value,r.exportPDF(i,OrgChart.pdfPrevUI._handler)})},1e3)}),g.addEventListener("keyup",function(){clearTimeout(n),n=setTimeout(function(){OrgChart.anim(r.element.querySelector("#bg-ppdf-content"),{opacity:1},{opacity:0},300,OrgChart.anim.inSin,function(){r.element.querySelector("#bg-ppdf-content").innerHTML="",i.footer=g.value,r.exportPDF(i,OrgChart.pdfPrevUI._handler)})},1e3)})},OrgChart.pdfPrevUI._showHide=function(t,e,r){"A4"==t.value||"A3"==t.value||"A2"==t.value||"A1"==t.value?(e.parentNode.style.display="block",r.parentNode.style.display="block"):("A42Levels"==t.value||"A32Levels"==t.value||"A22Levels"==t.value||"A12Levels"==t.value?e.parentNode.style.display="block":e.parentNode.style.display="none",r.parentNode.style.display="none")},OrgChart.pdfPrevUI._handler=function(t,e,r){var i=e.options,a=e.pages,o=i.margin[0],n=i.margin[2],l=document.createElement("div");l.innerHTML=r.outerHTML;for(var s=l.querySelector("svg"),h=t.element.querySelector("#bg-ppdf-content"),d=0;d<a.length;d++){var c=document.createElement("iframe");Object.assign(c.style,{display:"block",margin:"10px auto",border:"1px solid #eeeeee","box-shadow":"0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)"}),h.appendChild(c),s&&s.style.backgroundColor?c.style.backgroundColor=s.style.backgroundColor:c.style.backgroundColor="#fff";var g=c.contentWindow.document;g.open(),c.style.width=a[d].size.w+"px",c.style.height=a[d].size.h+"px",c.style.margin="10 auto",a[d].backgroundColor&&(c.style.backgroundColor=a[d].backgroundColor);var p=i.header;a[d].header&&(p=a[d].header),p&&(p=p.replace("{current-page}",d+1).replace("{total-pages}",a.length));var f=i.footer;a[d].footer&&(f=a[d].footer),f&&(f=f.replace("{current-page}",d+1).replace("{total-pages}",a.length)),a[d].html?g.write(OrgChart._exportHtml(a[d].html,i,a[d].innerSize.w,a[d].innerSize.h,p,f)):(s.setAttribute("viewBox",a[d].vb),g.write(OrgChart._exportHtml(l.innerHTML,i,a[d].innerSize.w,a[d].innerSize.h,p,f)));var u=g.getElementById("bg-header"),C=g.getElementById("bg-footer");if(u){var m=o-u.offsetHeight-7;u.style.top=m+"px"}if(C){var O=n-C.offsetHeight-7;C.style.bottom=O+"px"}g.close()}var v=t.element.querySelector("#bg-ppdf-content");OrgChart.anim(v,{opacity:0},{opacity:1},300,OrgChart.anim.outSin)},OrgChart.pdfPrevUI._getViewBox=function(t){var e=null;return t?(e=(e="["+(e=t.getAttribute("viewBox"))+"]").replace(/\ /g,","),e=JSON.parse(e)):null},OrgChart._exportHtml=function(t,e,r,i,a,o){for(var n="",l=0;l<e.margin.length;l++)n+=e.margin[l]+"px ";var s='<!DOCTYPE html><html style="margin:0;padding:0;"><head></head><body style="margin:0; padding:0;"><div style="margin: '+n+";overflow:hidden;width:"+r+"px;height:"+i+'px">';return a&&(s+='<div id="bg-header" style="width:'+r+"px;color:#757575;position:absolute;left:"+e.margin[3]+'px;top:0;">'+a+"</div>"),s+=t,o&&(s+='<div id="bg-footer" style="width:'+r+"px;color:#757575;position:absolute;left:"+e.margin[3]+'px;bottom:0;">'+o+"</div>"),s+="</div>",s+="</body></html>"},OrgChart.pdfPrevUI.hide=function(e){var r=e.element.querySelector("#bg-ppdf-wrapper");r&&OrgChart.anim(r,{opacity:1},{opacity:0},300,OrgChart.anim.inSin,function(){r.parentNode.removeChild(r);var t=e.element.querySelector("#bg-ppdf-btns");OrgChart.anim(t,{margin:[0,0,0,0]},{margin:[0,0,0,-280]},300,OrgChart.anim.inSin,function(){t.parentNode.removeChild(t)})})},void 0===OrgChart&&(OrgChart={}),OrgChart.events.on("renderdefs",function(t,e){for(var r=0;r<t.config.clinks.length;r++){var i=t.config.clinks[r].template;i||(i="orange");var a=OrgChart.clinkTemplates[i];e.defs+=a.defs}}),OrgChart.events.on("render",function(t,e){t._clink(t,e)}),OrgChart.prototype._clink=function(t,e){for(var r,i,a,o,n,l="",s=0;s<this.config.clinks.length;s++){var h=this.config.clinks[s],d=t.getBGNode(h.from),c=t.getBGNode(h.to);if((d.isChildOfGroup||e.res.visibleNodes[d.id])&&((!d.isChildOfGroup||e.res.visibleNodes[d._groupParentNodeId])&&(c.isChildOfGroup||e.res.visibleNodes[c.id])&&(!c.isChildOfGroup||e.res.visibleNodes[c._groupParentNodeId]))){var g=d.x,p=d.y,f=c.x,u=c.y;if(d.isChildOfGroup){var C=t.getBGNode(d._groupParentNodeId),m=OrgChart.t(C.templateName);g+=C.x+m.groupPadding[3],p+=C.y+m.groupPadding[0]}if(c.isChildOfGroup){C=t.getBGNode(c._groupParentNodeId),m=OrgChart.t(C.templateName);f+=C.x+m.groupPadding[3],u+=C.y+m.groupPadding[0]}var O={},v={},x=g+d.w/2,y=f+c.w/2,b=p+d.h/2,w=u+c.h/2,k=1;switch(this.config.orientation){case OrgChart.orientation.top:case OrgChart.orientation.top_left:x<=y?(k=1,O.x=x+d.w/10,v.x=y-c.w/10):(k=-1,O.x=x-d.w/10,v.x=y+c.w/10),p==u?(k=1,O.y=p,v.y=u):u<p?(O.y=p,v.y=u+c.h):(O.y=p+d.h,v.y=u);break;case OrgChart.orientation.bottom:case OrgChart.orientation.bottom_left:O.x=x<=y?(k=-1,x+d.w/10):(k=1,x-d.w/10),v.x=y+c.w/10,p==u?(k=-1,O.y=p+d.h,v.y=u+c.h):u<p?(O.y=p,v.y=u+c.h):(O.y=p+d.h,v.y=u);break;case OrgChart.orientation.left:case OrgChart.orientation.left_top:O.y=b<=w?(k=-1,b+d.h/5):(k=1,b-d.h/5),v.y=w+c.h/5,g==f?(k=-1,O.x=g,v.x=f):f<g?(O.x=g,v.x=f+c.w):(O.x=g+d.w,v.x=f);break;case OrgChart.orientation.right:case OrgChart.orientation.right_top:O.y=b<=w?(k=1,b+d.h/5):(k=-1,b-d.h/5),v.y=w+c.h/5,g==f?(k=1,O.x=g+d.w,v.x=f+c.w):f<g?(O.x=g,v.x=f+c.w):(O.x=g+d.w,v.x=f)}var _=I(O,v,k),A=h.template;A||(A="orange");m=OrgChart.clinkTemplates[A];l+='<g c-link-from="{from}" c-link-to="{to}">'.replace("{from}",d.id).replace("{to}",c.id)+m.link.replaceAll("{d}","M{a.x},{a.y} C{a.x},{a.y} {c.x},{c.y} {b.x},{b.y}").replaceAll("{b.x}",v.x).replaceAll("{b.y}",v.y).replaceAll("{a.x}",O.x).replaceAll("{a.y}",O.y).replaceAll("{c.x}",_.x).replaceAll("{c.y}",_.y);var S=(r=O,a=_,void 0,o=((i=v).x-r.x)/2+r.x,n=(i.y-r.y)/2+r.y,{x:(o-a.x)/2+a.x,y:(n-a.y)/2+a.y});h.label&&(l+=m.label.replace("{x}",S.x).replace("{y}",S.y).replace("{val}",h.label)),l+=OrgChart.grCloseTag}function I(t,e,r){null==r&&(r=1);var i=e.x-t.x,a=e.y-t.y,o=Math.sqrt(Math.pow(e.x-t.x,2)+Math.pow(e.y-t.y,2))/3;return o=o/(Math.sqrt(i*i+a*a)*r)*OrgChart.CLINK_CURVE,{x:t.x+i/2-a*o,y:t.y+a/2+i*o}}}e.content+=l},OrgChart.prototype.addClink=function(t,e,r,i){return this.removeClink(t,e),this.config.clinks.push({from:t,to:e,label:r,template:i}),this},OrgChart.prototype.removeClink=function(t,e){for(var r=this.config.clinks.length-1;0<=r;r--){var i=this.config.clinks[r];i.from==t&&i.to==e&&this.config.clinks.splice(r,1)}return this},OrgChart.clinkTemplates={},OrgChart.clinkTemplates.orange={defs:'<marker id="arrowOrange" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path fill="#F57C00" d="M 0 0 L 10 5 L 0 10 z" /></marker><marker id="dotOrange" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5"> <circle cx="5" cy="5" r="5" fill="#F57C00" /></marker>',link:'<path marker-start="url(#dotOrange)" marker-end="url(#arrowOrange)" stroke="#F57C00" stroke-width="2" fill="none" d="{d}" />',label:'<text fill="#F57C00" text-anchor="middle" x="{x}" y="{y}">{val}</text>'},OrgChart.clinkTemplates.blue={defs:'<marker id="arrowBlue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path fill="#039BE5" d="M 0 0 L 10 5 L 0 10 z" /></marker><marker id="dotBlue" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5"> <circle cx="5" cy="5" r="5" fill="#039BE5" /></marker>',link:'<path marker-start="url(#dotBlue)" marker-end="url(#arrowBlue)" stroke="#039BE5" stroke-width="2" fill="none" d="{d}" />',label:'<text fill="#039BE5"  text-anchor="middle" x="{x}" y="{y}">{val}</text>'},OrgChart.clinkTemplates.yellow={defs:'<marker id="arrowYellow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path fill="#FFCA28" d="M 0 0 L 10 5 L 0 10 z" /></marker><marker id="dotYellow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5"> <circle cx="5" cy="5" r="5" fill="#FFCA28" /></marker>',link:'<path marker-start="url(#dotYellow)" marker-end="url(#arrowYellow)" stroke="#FFCA28" stroke-width="2" fill="none" d="{d}" />',label:'<text fill="#FFCA28"  text-anchor="middle" x="{x}" y="{y}">{val}</text>'},void 0===OrgChart&&(OrgChart={}),OrgChart.events.on("renderdefs",function(t,e){for(var r=0;r<t.config.slinks.length;r++){var i=t.config.slinks[r].template;i||(i="orange");var a=OrgChart.slinkTemplates[i];e.defs+=a.defs}}),OrgChart.events.on("render",function(t,e){t._slinks(t,e)}),OrgChart.prototype._slinks=function(k,_){var A="",S=this.getScale(),I=_.res.boundary;function t(t,e,r){var i=[],a=null,o="left";switch(k.config.orientation){case OrgChart.orientation.top:case OrgChart.orientation.top_left:case OrgChart.orientation.bottom:case OrgChart.orientation.bottom_left:e.x>t.x&&(o="right");break;case OrgChart.orientation.left:case OrgChart.orientation.left_top:case OrgChart.orientation.right:case OrgChart.orientation.right_top:o="top",e.y>t.y&&(o="bottom")}var n=OrgChart.t(t.templateName,S),l=k.config.levelSeparation;(t.parent&&t.parent.layout==OrgChart.mixed||t.parent&&t.parent.layout==OrgChart.tree)&&(l=k.config.mixedHierarchyNodesSeparation);var s={p:t.x+t.w/2+n.expandCollapseSize,q:t.y,r:t.x+t.w/2+n.expandCollapseSize,s:I.minY+l};if(t.level==e.level)switch(a=e,k.config.orientation){case OrgChart.orientation.top:case OrgChart.orientation.top_left:i.push([s.p,s.q]),i.push([s.p,s.q-l/3]),n=OrgChart.t(a.templateName,S),i.push([a.x+a.w/2+n.expandCollapseSize,i[i.length-1][1]]),i.push([i[i.length-1][0],a.y]);break;case OrgChart.orientation.bottom:case OrgChart.orientation.bottom_left:s.q=t.y+t.h,s.s=I.maxY-l,i.push([s.p,s.q]),i.push([s.r,t.y+t.h+l/3]),n=OrgChart.t(a.templateName,S),i.push([a.x+a.w/2+n.expandCollapseSize,i[i.length-1][1]]),i.push([i[i.length-1][0],a.y+a.h]);break;case OrgChart.orientation.left:case OrgChart.orientation.left_top:s.p=t.x,s.q=t.y+t.h/2+n.expandCollapseSize,s.r=I.minX-l,s.s=t.y+t.h/2+n.expandCollapseSize,i.push([s.p,s.q]),i.push([t.x-l/3,s.q]),n=OrgChart.t(a.templateName,S),i.push([i[i.length-1][0],a.y+a.h/2+n.expandCollapseSize]),i.push([a.x,i[i.length-1][1]]);break;case OrgChart.orientation.right:case OrgChart.orientation.right_top:s.p=t.x+t.w,s.q=t.y+t.h/2+n.expandCollapseSize,s.r=I.maxX+l,s.s=t.y+t.h/2+n.expandCollapseSize,i.push([s.p,s.q]),i.push([t.x+t.w+l/3,s.q]),n=OrgChart.t(a.templateName,S),i.push([i[i.length-1][0],a.y+a.h/2+n.expandCollapseSize]),i.push([a.x+a.w,i[i.length-1][1]])}else{switch(k.config.orientation){case OrgChart.orientation.top:case OrgChart.orientation.top_left:i.push([s.p,s.q]),i.push([s.r,t.y-l/3]);break;case OrgChart.orientation.bottom:case OrgChart.orientation.bottom_left:s.q=t.y+t.h,s.s=I.maxY-l,i.push([s.p,s.q]),i.push([s.r,t.y+t.h+l/3]);break;case OrgChart.orientation.left:case OrgChart.orientation.left_top:s.p=t.x,s.q=t.y+t.h/2+n.expandCollapseSize,s.r=I.minX-l,s.s=t.y+t.h/2+n.expandCollapseSize,i.push([s.p,s.q]),i.push([t.x-l/3,s.q]);break;case OrgChart.orientation.right:case OrgChart.orientation.right_top:s.p=t.x+t.w,s.q=t.y+t.h/2+n.expandCollapseSize,s.r=I.maxX+l,s.s=t.y+t.h/2+n.expandCollapseSize,i.push([s.p,s.q]),i.push([t.x+t.w+l/3,s.q])}for(var h=t;null==a;){var d=!1,c=h.parent,g=c.leftNeighbor,p=c.rightNeighbor;if(c.id==e.id?a=c:OrgChart._intersects(c,s,k.config)&&(s=OrgChart._addPoint(c,i,k.config,s,o),d=!0),c.id!=e.id){for(;g;){if(g.id==e.id){a=g;break}OrgChart._intersects(g,s,k.config)&&(s=OrgChart._addPoint(g,i,k.config,s,o),d=!0),g=g.leftNeighbor}for(;p;){if(p.id==e.id){a=p;break}OrgChart._intersects(p,s,k.config)&&(s=OrgChart._addPoint(p,i,k.config,s,o),d=!0),p=p.rightNeighbor}}if(!d){var f=i[i.length-1][0],u=0;if(c.parent)switch(l=k.config.levelSeparation,c.parent.layout!=OrgChart.mixed&&c.parent.layout!=OrgChart.tree||(l=k.config.mixedHierarchyNodesSeparation),k.config.orientation){case OrgChart.orientation.top:case OrgChart.orientation.top_left:u=c.parent.y+c.parent.h+l*(2/3);break;case OrgChart.orientation.bottom:case OrgChart.orientation.bottom_left:u=c.parent.y-l*(2/3);break;case OrgChart.orientation.left:case OrgChart.orientation.left_top:f=c.parent.x+c.parent.w+l*(2/3),u=i[i.length-1][1];break;case OrgChart.orientation.right:case OrgChart.orientation.right_top:f=c.parent.x-l*(2/3),u=i[i.length-1][1]}i.push([f,u])}h=c}switch(n=OrgChart.t(a.templateName,S),i.splice(i.length-1,1),k.config.orientation){case OrgChart.orientation.top:case OrgChart.orientation.top_left:i.push([a.x+a.w/2+n.expandCollapseSize,i[i.length-1][1]]),i.push([i[i.length-1][0],a.y+a.h]);break;case OrgChart.orientation.bottom:case OrgChart.orientation.bottom_left:i.push([a.x+a.w/2+n.expandCollapseSize,i[i.length-1][1]]),i.push([i[i.length-1][0],a.y]);break;case OrgChart.orientation.left:case OrgChart.orientation.left_top:i.push([i[i.length-1][0],a.y+a.h/2+n.expandCollapseSize]),i.push([a.x+a.w,i[i.length-1][1]]);break;case OrgChart.orientation.right:case OrgChart.orientation.right_top:i.push([i[i.length-1][0],a.y+a.h/2+n.expandCollapseSize]),i.push([a.x,i[i.length-1][1]])}}var C=N.template;C||(C="orange");var m=null;switch((n=OrgChart.slinkTemplates[C]).labelPosition){case"start":m={x:i[1][0],y:i[1][1]};break;case"middle":var O=Math.ceil(i.length/2);m=function(t,e){return{x:(t[0]+e[0])/2,y:(t[1]+e[1])/2}}(i[O],i[O-1]);break;case"end":m={x:i[i.length-2][0],y:i[i.length-2][1]}}r&&(i=i.reverse()),i[0]="M"+i[0].join(",");for(var v=1;v<i.length;v++)i[v]="L"+i[v].join(",");var x=i.join(" ");if(A+='<g c-link-from="{from}" c-link-to="{to}">'.replace("{from}",t.id).replace("{to}",e.id)+n.link.replaceAll("{d}",x),N.label){var y=n.label.replace("{x}",m.x).replace("{y}",m.y).replace("{val}",N.label),b=OrgChart._getLabelSize(y),w=-b.height/2;switch(k.config.orientation){case OrgChart.orientation.bottom:case OrgChart.orientation.bottom_left:w=b.height}A+=n.label.replace("{x}",m.x).replace("{y}",m.y+w).replace("{val}",N.label)}A+=OrgChart.grCloseTag,_.content+=A}for(var e=0;e<this.config.slinks.length;e++){var N=this.config.slinks[e];if(_.res.visibleNodes[N.from]&&_.res.visibleNodes[N.to]){var r=k.getBGNode(N.from),i=k.getBGNode(N.to);r.level>=i.level?t(r,i,!1):t(i,r,!0)}}},OrgChart.prototype.addSlink=function(t,e,r,i){return this.removeClink(t,e),this.config.slinks.push({from:t,to:e,label:r,template:i}),this},OrgChart.prototype.removeSlink=function(t,e){for(var r=this.config.slinks.length-1;0<=r;r--){var i=this.config.slinks[r];i.from==t&&i.to==e&&this.config.slinks.splice(r,1)}return this},OrgChart.slinkTemplates={},OrgChart.slinkTemplates.orange={defs:'<marker id="arrowSlinkOrange" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path fill="#F57C00" d="M 0 0 L 10 5 L 0 10 z" /></marker><marker id="dotSlinkOrange" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5"> <circle cx="5" cy="5" r="5" fill="#F57C00" /></marker>',link:'<path stroke-dasharray="4, 2" marker-start="url(#dotSlinkOrange)" marker-end="url(#arrowSlinkOrange)" stroke-linejoin="round" stroke="#F57C00" stroke-width="2" fill="none" d="{d}" />',label:'<text dominant-baseline="middle" fill="#F57C00" alignment-baseline="middle" text-anchor="middle" x="{x}" y="{y}">{val}</text>',labelPosition:"middle"},OrgChart.slinkTemplates.blue={defs:'<marker id="arrowSlinkBlue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path fill="#039BE5" d="M 0 0 L 10 5 L 0 10 z" /></marker><marker id="dotSlinkBlue" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5"> <circle cx="5" cy="5" r="5" fill="#039BE5" /></marker>',link:'<path stroke-dasharray="4, 2" marker-start="url(#dotSlinkBlue)" marker-end="url(#arrowSlinkBlue)" stroke-linejoin="round" stroke="#039BE5" stroke-width="2" fill="none" d="{d}" />',label:'<text fill="#039BE5" text-anchor="middle" x="{x}" y="{y}">{val}</text>',labelPosition:"middle"},OrgChart.slinkTemplates.yellow={defs:'<marker id="arrowSlinkYellow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path fill="#FFCA28" d="M 0 0 L 10 5 L 0 10 z" /></marker><marker id="dotSlinkYellow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5"> <circle cx="5" cy="5" r="5" fill="#FFCA28" /></marker>',link:'<path stroke-dasharray="4, 2" marker-start="url(#dotSlinkYellow)" marker-end="url(#arrowSlinkYellow)" stroke-linejoin="round" stroke="#FFCA28" stroke-width="2" fill="none" d="{d}" />',label:'<text  fill="#FFCA28" text-anchor="middle" x="{x}" y="{y}">{val}</text>',labelPosition:"middle"};
;/*
 Copyright (C) Federico Zivolo 2019
 Distributed under the MIT License (license terms are at http://opensource.org/licenses/MIT).
 */(function(e,t){'object'==typeof exports&&'undefined'!=typeof module?module.exports=t():'function'==typeof define&&define.amd?define(t):e.Popper=t()})(this,function(){'use strict';function e(e){return e&&'[object Function]'==={}.toString.call(e)}function t(e,t){if(1!==e.nodeType)return[];var o=e.ownerDocument.defaultView,n=o.getComputedStyle(e,null);return t?n[t]:n}function o(e){return'HTML'===e.nodeName?e:e.parentNode||e.host}function n(e){if(!e)return document.body;switch(e.nodeName){case'HTML':case'BODY':return e.ownerDocument.body;case'#document':return e.body;}var i=t(e),r=i.overflow,p=i.overflowX,s=i.overflowY;return /(auto|scroll|overlay)/.test(r+s+p)?e:n(o(e))}function r(e){return 11===e?pe:10===e?se:pe||se}function p(e){if(!e)return document.documentElement;for(var o=r(10)?document.body:null,n=e.offsetParent||null;n===o&&e.nextElementSibling;)n=(e=e.nextElementSibling).offsetParent;var i=n&&n.nodeName;return i&&'BODY'!==i&&'HTML'!==i?-1!==['TH','TD','TABLE'].indexOf(n.nodeName)&&'static'===t(n,'position')?p(n):n:e?e.ownerDocument.documentElement:document.documentElement}function s(e){var t=e.nodeName;return'BODY'!==t&&('HTML'===t||p(e.firstElementChild)===e)}function d(e){return null===e.parentNode?e:d(e.parentNode)}function a(e,t){if(!e||!e.nodeType||!t||!t.nodeType)return document.documentElement;var o=e.compareDocumentPosition(t)&Node.DOCUMENT_POSITION_FOLLOWING,n=o?e:t,i=o?t:e,r=document.createRange();r.setStart(n,0),r.setEnd(i,0);var l=r.commonAncestorContainer;if(e!==l&&t!==l||n.contains(i))return s(l)?l:p(l);var f=d(e);return f.host?a(f.host,t):a(e,d(t).host)}function l(e){var t=1<arguments.length&&void 0!==arguments[1]?arguments[1]:'top',o='top'===t?'scrollTop':'scrollLeft',n=e.nodeName;if('BODY'===n||'HTML'===n){var i=e.ownerDocument.documentElement,r=e.ownerDocument.scrollingElement||i;return r[o]}return e[o]}function f(e,t){var o=2<arguments.length&&void 0!==arguments[2]&&arguments[2],n=l(t,'top'),i=l(t,'left'),r=o?-1:1;return e.top+=n*r,e.bottom+=n*r,e.left+=i*r,e.right+=i*r,e}function m(e,t){var o='x'===t?'Left':'Top',n='Left'==o?'Right':'Bottom';return parseFloat(e['border'+o+'Width'],10)+parseFloat(e['border'+n+'Width'],10)}function h(e,t,o,n){return ee(t['offset'+e],t['scroll'+e],o['client'+e],o['offset'+e],o['scroll'+e],r(10)?parseInt(o['offset'+e])+parseInt(n['margin'+('Height'===e?'Top':'Left')])+parseInt(n['margin'+('Height'===e?'Bottom':'Right')]):0)}function c(e){var t=e.body,o=e.documentElement,n=r(10)&&getComputedStyle(o);return{height:h('Height',t,o,n),width:h('Width',t,o,n)}}function g(e){return fe({},e,{right:e.left+e.width,bottom:e.top+e.height})}function u(e){var o={};try{if(r(10)){o=e.getBoundingClientRect();var n=l(e,'top'),i=l(e,'left');o.top+=n,o.left+=i,o.bottom+=n,o.right+=i}else o=e.getBoundingClientRect()}catch(t){}var p={left:o.left,top:o.top,width:o.right-o.left,height:o.bottom-o.top},s='HTML'===e.nodeName?c(e.ownerDocument):{},d=s.width||e.clientWidth||p.right-p.left,a=s.height||e.clientHeight||p.bottom-p.top,f=e.offsetWidth-d,h=e.offsetHeight-a;if(f||h){var u=t(e);f-=m(u,'x'),h-=m(u,'y'),p.width-=f,p.height-=h}return g(p)}function b(e,o){var i=2<arguments.length&&void 0!==arguments[2]&&arguments[2],p=r(10),s='HTML'===o.nodeName,d=u(e),a=u(o),l=n(e),m=t(o),h=parseFloat(m.borderTopWidth,10),c=parseFloat(m.borderLeftWidth,10);i&&s&&(a.top=ee(a.top,0),a.left=ee(a.left,0));var b=g({top:d.top-a.top-h,left:d.left-a.left-c,width:d.width,height:d.height});if(b.marginTop=0,b.marginLeft=0,!p&&s){var w=parseFloat(m.marginTop,10),y=parseFloat(m.marginLeft,10);b.top-=h-w,b.bottom-=h-w,b.left-=c-y,b.right-=c-y,b.marginTop=w,b.marginLeft=y}return(p&&!i?o.contains(l):o===l&&'BODY'!==l.nodeName)&&(b=f(b,o)),b}function w(e){var t=1<arguments.length&&void 0!==arguments[1]&&arguments[1],o=e.ownerDocument.documentElement,n=b(e,o),i=ee(o.clientWidth,window.innerWidth||0),r=ee(o.clientHeight,window.innerHeight||0),p=t?0:l(o),s=t?0:l(o,'left'),d={top:p-n.top+n.marginTop,left:s-n.left+n.marginLeft,width:i,height:r};return g(d)}function y(e){var n=e.nodeName;if('BODY'===n||'HTML'===n)return!1;if('fixed'===t(e,'position'))return!0;var i=o(e);return!!i&&y(i)}function E(e){if(!e||!e.parentElement||r())return document.documentElement;for(var o=e.parentElement;o&&'none'===t(o,'transform');)o=o.parentElement;return o||document.documentElement}function v(e,t,i,r){var p=4<arguments.length&&void 0!==arguments[4]&&arguments[4],s={top:0,left:0},d=p?E(e):a(e,t);if('viewport'===r)s=w(d,p);else{var l;'scrollParent'===r?(l=n(o(t)),'BODY'===l.nodeName&&(l=e.ownerDocument.documentElement)):'window'===r?l=e.ownerDocument.documentElement:l=r;var f=b(l,d,p);if('HTML'===l.nodeName&&!y(d)){var m=c(e.ownerDocument),h=m.height,g=m.width;s.top+=f.top-f.marginTop,s.bottom=h+f.top,s.left+=f.left-f.marginLeft,s.right=g+f.left}else s=f}i=i||0;var u='number'==typeof i;return s.left+=u?i:i.left||0,s.top+=u?i:i.top||0,s.right-=u?i:i.right||0,s.bottom-=u?i:i.bottom||0,s}function x(e){var t=e.width,o=e.height;return t*o}function O(e,t,o,n,i){var r=5<arguments.length&&void 0!==arguments[5]?arguments[5]:0;if(-1===e.indexOf('auto'))return e;var p=v(o,n,r,i),s={top:{width:p.width,height:t.top-p.top},right:{width:p.right-t.right,height:p.height},bottom:{width:p.width,height:p.bottom-t.bottom},left:{width:t.left-p.left,height:p.height}},d=Object.keys(s).map(function(e){return fe({key:e},s[e],{area:x(s[e])})}).sort(function(e,t){return t.area-e.area}),a=d.filter(function(e){var t=e.width,n=e.height;return t>=o.clientWidth&&n>=o.clientHeight}),l=0<a.length?a[0].key:d[0].key,f=e.split('-')[1];return l+(f?'-'+f:'')}function L(e,t,o){var n=3<arguments.length&&void 0!==arguments[3]?arguments[3]:null,i=n?E(t):a(t,o);return b(o,i,n)}function S(e){var t=e.ownerDocument.defaultView,o=t.getComputedStyle(e),n=parseFloat(o.marginTop||0)+parseFloat(o.marginBottom||0),i=parseFloat(o.marginLeft||0)+parseFloat(o.marginRight||0),r={width:e.offsetWidth+i,height:e.offsetHeight+n};return r}function T(e){var t={left:'right',right:'left',bottom:'top',top:'bottom'};return e.replace(/left|right|bottom|top/g,function(e){return t[e]})}function C(e,t,o){o=o.split('-')[0];var n=S(e),i={width:n.width,height:n.height},r=-1!==['right','left'].indexOf(o),p=r?'top':'left',s=r?'left':'top',d=r?'height':'width',a=r?'width':'height';return i[p]=t[p]+t[d]/2-n[d]/2,i[s]=o===s?t[s]-n[a]:t[T(s)],i}function D(e,t){return Array.prototype.find?e.find(t):e.filter(t)[0]}function N(e,t,o){if(Array.prototype.findIndex)return e.findIndex(function(e){return e[t]===o});var n=D(e,function(e){return e[t]===o});return e.indexOf(n)}function P(t,o,n){var i=void 0===n?t:t.slice(0,N(t,'name',n));return i.forEach(function(t){t['function']&&console.warn('`modifier.function` is deprecated, use `modifier.fn`!');var n=t['function']||t.fn;t.enabled&&e(n)&&(o.offsets.popper=g(o.offsets.popper),o.offsets.reference=g(o.offsets.reference),o=n(o,t))}),o}function k(){if(!this.state.isDestroyed){var e={instance:this,styles:{},arrowStyles:{},attributes:{},flipped:!1,offsets:{}};e.offsets.reference=L(this.state,this.popper,this.reference,this.options.positionFixed),e.placement=O(this.options.placement,e.offsets.reference,this.popper,this.reference,this.options.modifiers.flip.boundariesElement,this.options.modifiers.flip.padding),e.originalPlacement=e.placement,e.positionFixed=this.options.positionFixed,e.offsets.popper=C(this.popper,e.offsets.reference,e.placement),e.offsets.popper.position=this.options.positionFixed?'fixed':'absolute',e=P(this.modifiers,e),this.state.isCreated?this.options.onUpdate(e):(this.state.isCreated=!0,this.options.onCreate(e))}}function W(e,t){return e.some(function(e){var o=e.name,n=e.enabled;return n&&o===t})}function B(e){for(var t=[!1,'ms','Webkit','Moz','O'],o=e.charAt(0).toUpperCase()+e.slice(1),n=0;n<t.length;n++){var i=t[n],r=i?''+i+o:e;if('undefined'!=typeof document.body.style[r])return r}return null}function H(){return this.state.isDestroyed=!0,W(this.modifiers,'applyStyle')&&(this.popper.removeAttribute('x-placement'),this.popper.style.position='',this.popper.style.top='',this.popper.style.left='',this.popper.style.right='',this.popper.style.bottom='',this.popper.style.willChange='',this.popper.style[B('transform')]=''),this.disableEventListeners(),this.options.removeOnDestroy&&this.popper.parentNode.removeChild(this.popper),this}function A(e){var t=e.ownerDocument;return t?t.defaultView:window}function M(e,t,o,i){var r='BODY'===e.nodeName,p=r?e.ownerDocument.defaultView:e;p.addEventListener(t,o,{passive:!0}),r||M(n(p.parentNode),t,o,i),i.push(p)}function F(e,t,o,i){o.updateBound=i,A(e).addEventListener('resize',o.updateBound,{passive:!0});var r=n(e);return M(r,'scroll',o.updateBound,o.scrollParents),o.scrollElement=r,o.eventsEnabled=!0,o}function I(){this.state.eventsEnabled||(this.state=F(this.reference,this.options,this.state,this.scheduleUpdate))}function R(e,t){return A(e).removeEventListener('resize',t.updateBound),t.scrollParents.forEach(function(e){e.removeEventListener('scroll',t.updateBound)}),t.updateBound=null,t.scrollParents=[],t.scrollElement=null,t.eventsEnabled=!1,t}function U(){this.state.eventsEnabled&&(cancelAnimationFrame(this.scheduleUpdate),this.state=R(this.reference,this.state))}function Y(e){return''!==e&&!isNaN(parseFloat(e))&&isFinite(e)}function V(e,t){Object.keys(t).forEach(function(o){var n='';-1!==['width','height','top','right','bottom','left'].indexOf(o)&&Y(t[o])&&(n='px'),e.style[o]=t[o]+n})}function j(e,t){Object.keys(t).forEach(function(o){var n=t[o];!1===n?e.removeAttribute(o):e.setAttribute(o,t[o])})}function q(e,t){var o=e.offsets,n=o.popper,i=o.reference,r=$,p=function(e){return e},s=r(i.width),d=r(n.width),a=-1!==['left','right'].indexOf(e.placement),l=-1!==e.placement.indexOf('-'),f=t?a||l||s%2==d%2?r:Z:p,m=t?r:p;return{left:f(1==s%2&&1==d%2&&!l&&t?n.left-1:n.left),top:m(n.top),bottom:m(n.bottom),right:f(n.right)}}function K(e,t,o){var n=D(e,function(e){var o=e.name;return o===t}),i=!!n&&e.some(function(e){return e.name===o&&e.enabled&&e.order<n.order});if(!i){var r='`'+t+'`';console.warn('`'+o+'`'+' modifier is required by '+r+' modifier in order to work, be sure to include it before '+r+'!')}return i}function z(e){return'end'===e?'start':'start'===e?'end':e}function G(e){var t=1<arguments.length&&void 0!==arguments[1]&&arguments[1],o=ce.indexOf(e),n=ce.slice(o+1).concat(ce.slice(0,o));return t?n.reverse():n}function _(e,t,o,n){var i=e.match(/((?:\-|\+)?\d*\.?\d*)(.*)/),r=+i[1],p=i[2];if(!r)return e;if(0===p.indexOf('%')){var s;switch(p){case'%p':s=o;break;case'%':case'%r':default:s=n;}var d=g(s);return d[t]/100*r}if('vh'===p||'vw'===p){var a;return a='vh'===p?ee(document.documentElement.clientHeight,window.innerHeight||0):ee(document.documentElement.clientWidth,window.innerWidth||0),a/100*r}return r}function X(e,t,o,n){var i=[0,0],r=-1!==['right','left'].indexOf(n),p=e.split(/(\+|\-)/).map(function(e){return e.trim()}),s=p.indexOf(D(p,function(e){return-1!==e.search(/,|\s/)}));p[s]&&-1===p[s].indexOf(',')&&console.warn('Offsets separated by white space(s) are deprecated, use a comma (,) instead.');var d=/\s*,\s*|\s+/,a=-1===s?[p]:[p.slice(0,s).concat([p[s].split(d)[0]]),[p[s].split(d)[1]].concat(p.slice(s+1))];return a=a.map(function(e,n){var i=(1===n?!r:r)?'height':'width',p=!1;return e.reduce(function(e,t){return''===e[e.length-1]&&-1!==['+','-'].indexOf(t)?(e[e.length-1]=t,p=!0,e):p?(e[e.length-1]+=t,p=!1,e):e.concat(t)},[]).map(function(e){return _(e,i,t,o)})}),a.forEach(function(e,t){e.forEach(function(o,n){Y(o)&&(i[t]+=o*('-'===e[n-1]?-1:1))})}),i}function J(e,t){var o,n=t.offset,i=e.placement,r=e.offsets,p=r.popper,s=r.reference,d=i.split('-')[0];return o=Y(+n)?[+n,0]:X(n,p,s,d),'left'===d?(p.top+=o[0],p.left-=o[1]):'right'===d?(p.top+=o[0],p.left+=o[1]):'top'===d?(p.left+=o[0],p.top-=o[1]):'bottom'===d&&(p.left+=o[0],p.top+=o[1]),e.popper=p,e}for(var Q=Math.min,Z=Math.floor,$=Math.round,ee=Math.max,te='undefined'!=typeof window&&'undefined'!=typeof document,oe=['Edge','Trident','Firefox'],ne=0,ie=0;ie<oe.length;ie+=1)if(te&&0<=navigator.userAgent.indexOf(oe[ie])){ne=1;break}var i=te&&window.Promise,re=i?function(e){var t=!1;return function(){t||(t=!0,window.Promise.resolve().then(function(){t=!1,e()}))}}:function(e){var t=!1;return function(){t||(t=!0,setTimeout(function(){t=!1,e()},ne))}},pe=te&&!!(window.MSInputMethodContext&&document.documentMode),se=te&&/MSIE 10/.test(navigator.userAgent),de=function(e,t){if(!(e instanceof t))throw new TypeError('Cannot call a class as a function')},ae=function(){function e(e,t){for(var o,n=0;n<t.length;n++)o=t[n],o.enumerable=o.enumerable||!1,o.configurable=!0,'value'in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}return function(t,o,n){return o&&e(t.prototype,o),n&&e(t,n),t}}(),le=function(e,t,o){return t in e?Object.defineProperty(e,t,{value:o,enumerable:!0,configurable:!0,writable:!0}):e[t]=o,e},fe=Object.assign||function(e){for(var t,o=1;o<arguments.length;o++)for(var n in t=arguments[o],t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n]);return e},me=te&&/Firefox/i.test(navigator.userAgent),he=['auto-start','auto','auto-end','top-start','top','top-end','right-start','right','right-end','bottom-end','bottom','bottom-start','left-end','left','left-start'],ce=he.slice(3),ge={FLIP:'flip',CLOCKWISE:'clockwise',COUNTERCLOCKWISE:'counterclockwise'},ue=function(){function t(o,n){var i=this,r=2<arguments.length&&void 0!==arguments[2]?arguments[2]:{};de(this,t),this.scheduleUpdate=function(){return requestAnimationFrame(i.update)},this.update=re(this.update.bind(this)),this.options=fe({},t.Defaults,r),this.state={isDestroyed:!1,isCreated:!1,scrollParents:[]},this.reference=o&&o.jquery?o[0]:o,this.popper=n&&n.jquery?n[0]:n,this.options.modifiers={},Object.keys(fe({},t.Defaults.modifiers,r.modifiers)).forEach(function(e){i.options.modifiers[e]=fe({},t.Defaults.modifiers[e]||{},r.modifiers?r.modifiers[e]:{})}),this.modifiers=Object.keys(this.options.modifiers).map(function(e){return fe({name:e},i.options.modifiers[e])}).sort(function(e,t){return e.order-t.order}),this.modifiers.forEach(function(t){t.enabled&&e(t.onLoad)&&t.onLoad(i.reference,i.popper,i.options,t,i.state)}),this.update();var p=this.options.eventsEnabled;p&&this.enableEventListeners(),this.state.eventsEnabled=p}return ae(t,[{key:'update',value:function(){return k.call(this)}},{key:'destroy',value:function(){return H.call(this)}},{key:'enableEventListeners',value:function(){return I.call(this)}},{key:'disableEventListeners',value:function(){return U.call(this)}}]),t}();return ue.Utils=('undefined'==typeof window?global:window).PopperUtils,ue.placements=he,ue.Defaults={placement:'bottom',positionFixed:!1,eventsEnabled:!0,removeOnDestroy:!1,onCreate:function(){},onUpdate:function(){},modifiers:{shift:{order:100,enabled:!0,fn:function(e){var t=e.placement,o=t.split('-')[0],n=t.split('-')[1];if(n){var i=e.offsets,r=i.reference,p=i.popper,s=-1!==['bottom','top'].indexOf(o),d=s?'left':'top',a=s?'width':'height',l={start:le({},d,r[d]),end:le({},d,r[d]+r[a]-p[a])};e.offsets.popper=fe({},p,l[n])}return e}},offset:{order:200,enabled:!0,fn:J,offset:0},preventOverflow:{order:300,enabled:!0,fn:function(e,t){var o=t.boundariesElement||p(e.instance.popper);e.instance.reference===o&&(o=p(o));var n=B('transform'),i=e.instance.popper.style,r=i.top,s=i.left,d=i[n];i.top='',i.left='',i[n]='';var a=v(e.instance.popper,e.instance.reference,t.padding,o,e.positionFixed);i.top=r,i.left=s,i[n]=d,t.boundaries=a;var l=t.priority,f=e.offsets.popper,m={primary:function(e){var o=f[e];return f[e]<a[e]&&!t.escapeWithReference&&(o=ee(f[e],a[e])),le({},e,o)},secondary:function(e){var o='right'===e?'left':'top',n=f[o];return f[e]>a[e]&&!t.escapeWithReference&&(n=Q(f[o],a[e]-('right'===e?f.width:f.height))),le({},o,n)}};return l.forEach(function(e){var t=-1===['left','top'].indexOf(e)?'secondary':'primary';f=fe({},f,m[t](e))}),e.offsets.popper=f,e},priority:['left','right','top','bottom'],padding:5,boundariesElement:'scrollParent'},keepTogether:{order:400,enabled:!0,fn:function(e){var t=e.offsets,o=t.popper,n=t.reference,i=e.placement.split('-')[0],r=Z,p=-1!==['top','bottom'].indexOf(i),s=p?'right':'bottom',d=p?'left':'top',a=p?'width':'height';return o[s]<r(n[d])&&(e.offsets.popper[d]=r(n[d])-o[a]),o[d]>r(n[s])&&(e.offsets.popper[d]=r(n[s])),e}},arrow:{order:500,enabled:!0,fn:function(e,o){var n;if(!K(e.instance.modifiers,'arrow','keepTogether'))return e;var i=o.element;if('string'==typeof i){if(i=e.instance.popper.querySelector(i),!i)return e;}else if(!e.instance.popper.contains(i))return console.warn('WARNING: `arrow.element` must be child of its popper element!'),e;var r=e.placement.split('-')[0],p=e.offsets,s=p.popper,d=p.reference,a=-1!==['left','right'].indexOf(r),l=a?'height':'width',f=a?'Top':'Left',m=f.toLowerCase(),h=a?'left':'top',c=a?'bottom':'right',u=S(i)[l];d[c]-u<s[m]&&(e.offsets.popper[m]-=s[m]-(d[c]-u)),d[m]+u>s[c]&&(e.offsets.popper[m]+=d[m]+u-s[c]),e.offsets.popper=g(e.offsets.popper);var b=d[m]+d[l]/2-u/2,w=t(e.instance.popper),y=parseFloat(w['margin'+f],10),E=parseFloat(w['border'+f+'Width'],10),v=b-e.offsets.popper[m]-y-E;return v=ee(Q(s[l]-u,v),0),e.arrowElement=i,e.offsets.arrow=(n={},le(n,m,$(v)),le(n,h,''),n),e},element:'[x-arrow]'},flip:{order:600,enabled:!0,fn:function(e,t){if(W(e.instance.modifiers,'inner'))return e;if(e.flipped&&e.placement===e.originalPlacement)return e;var o=v(e.instance.popper,e.instance.reference,t.padding,t.boundariesElement,e.positionFixed),n=e.placement.split('-')[0],i=T(n),r=e.placement.split('-')[1]||'',p=[];switch(t.behavior){case ge.FLIP:p=[n,i];break;case ge.CLOCKWISE:p=G(n);break;case ge.COUNTERCLOCKWISE:p=G(n,!0);break;default:p=t.behavior;}return p.forEach(function(s,d){if(n!==s||p.length===d+1)return e;n=e.placement.split('-')[0],i=T(n);var a=e.offsets.popper,l=e.offsets.reference,f=Z,m='left'===n&&f(a.right)>f(l.left)||'right'===n&&f(a.left)<f(l.right)||'top'===n&&f(a.bottom)>f(l.top)||'bottom'===n&&f(a.top)<f(l.bottom),h=f(a.left)<f(o.left),c=f(a.right)>f(o.right),g=f(a.top)<f(o.top),u=f(a.bottom)>f(o.bottom),b='left'===n&&h||'right'===n&&c||'top'===n&&g||'bottom'===n&&u,w=-1!==['top','bottom'].indexOf(n),y=!!t.flipVariations&&(w&&'start'===r&&h||w&&'end'===r&&c||!w&&'start'===r&&g||!w&&'end'===r&&u),E=!!t.flipVariationsByContent&&(w&&'start'===r&&c||w&&'end'===r&&h||!w&&'start'===r&&u||!w&&'end'===r&&g),v=y||E;(m||b||v)&&(e.flipped=!0,(m||b)&&(n=p[d+1]),v&&(r=z(r)),e.placement=n+(r?'-'+r:''),e.offsets.popper=fe({},e.offsets.popper,C(e.instance.popper,e.offsets.reference,e.placement)),e=P(e.instance.modifiers,e,'flip'))}),e},behavior:'flip',padding:5,boundariesElement:'viewport',flipVariations:!1,flipVariationsByContent:!1},inner:{order:700,enabled:!1,fn:function(e){var t=e.placement,o=t.split('-')[0],n=e.offsets,i=n.popper,r=n.reference,p=-1!==['left','right'].indexOf(o),s=-1===['top','left'].indexOf(o);return i[p?'left':'top']=r[o]-(s?i[p?'width':'height']:0),e.placement=T(t),e.offsets.popper=g(i),e}},hide:{order:800,enabled:!0,fn:function(e){if(!K(e.instance.modifiers,'hide','preventOverflow'))return e;var t=e.offsets.reference,o=D(e.instance.modifiers,function(e){return'preventOverflow'===e.name}).boundaries;if(t.bottom<o.top||t.left>o.right||t.top>o.bottom||t.right<o.left){if(!0===e.hide)return e;e.hide=!0,e.attributes['x-out-of-boundaries']=''}else{if(!1===e.hide)return e;e.hide=!1,e.attributes['x-out-of-boundaries']=!1}return e}},computeStyle:{order:850,enabled:!0,fn:function(e,t){var o=t.x,n=t.y,i=e.offsets.popper,r=D(e.instance.modifiers,function(e){return'applyStyle'===e.name}).gpuAcceleration;void 0!==r&&console.warn('WARNING: `gpuAcceleration` option moved to `computeStyle` modifier and will not be supported in future versions of Popper.js!');var s,d,a=void 0===r?t.gpuAcceleration:r,l=p(e.instance.popper),f=u(l),m={position:i.position},h=q(e,2>window.devicePixelRatio||!me),c='bottom'===o?'top':'bottom',g='right'===n?'left':'right',b=B('transform');if(d='bottom'==c?'HTML'===l.nodeName?-l.clientHeight+h.bottom:-f.height+h.bottom:h.top,s='right'==g?'HTML'===l.nodeName?-l.clientWidth+h.right:-f.width+h.right:h.left,a&&b)m[b]='translate3d('+s+'px, '+d+'px, 0)',m[c]=0,m[g]=0,m.willChange='transform';else{var w='bottom'==c?-1:1,y='right'==g?-1:1;m[c]=d*w,m[g]=s*y,m.willChange=c+', '+g}var E={"x-placement":e.placement};return e.attributes=fe({},E,e.attributes),e.styles=fe({},m,e.styles),e.arrowStyles=fe({},e.offsets.arrow,e.arrowStyles),e},gpuAcceleration:!0,x:'bottom',y:'right'},applyStyle:{order:900,enabled:!0,fn:function(e){return V(e.instance.popper,e.styles),j(e.instance.popper,e.attributes),e.arrowElement&&Object.keys(e.arrowStyles).length&&V(e.arrowElement,e.arrowStyles),e},onLoad:function(e,t,o,n,i){var r=L(i,t,e,o.positionFixed),p=O(o.placement,r,t,e,o.modifiers.flip.boundariesElement,o.modifiers.flip.padding);return t.setAttribute('x-placement',p),V(t,{position:o.positionFixed?'fixed':'absolute'}),o},gpuAcceleration:void 0}}},ue});
//# sourceMappingURL=popper.min.js.map

;/*!
  * Bootstrap v4.3.1 (https://getbootstrap.com/)
  * Copyright 2011-2019 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
  * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
  */
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?e(exports,require("jquery"),require("popper.js")):"function"==typeof define&&define.amd?define(["exports","jquery","popper.js"],e):e((t=t||self).bootstrap={},t.jQuery,t.Popper)}(this,function(t,g,u){"use strict";function i(t,e){for(var n=0;n<e.length;n++){var i=e[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i)}}function s(t,e,n){return e&&i(t.prototype,e),n&&i(t,n),t}function l(o){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{},e=Object.keys(r);"function"==typeof Object.getOwnPropertySymbols&&(e=e.concat(Object.getOwnPropertySymbols(r).filter(function(t){return Object.getOwnPropertyDescriptor(r,t).enumerable}))),e.forEach(function(t){var e,n,i;e=o,i=r[n=t],n in e?Object.defineProperty(e,n,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[n]=i})}return o}g=g&&g.hasOwnProperty("default")?g.default:g,u=u&&u.hasOwnProperty("default")?u.default:u;var e="transitionend";function n(t){var e=this,n=!1;return g(this).one(_.TRANSITION_END,function(){n=!0}),setTimeout(function(){n||_.triggerTransitionEnd(e)},t),this}var _={TRANSITION_END:"bsTransitionEnd",getUID:function(t){for(;t+=~~(1e6*Math.random()),document.getElementById(t););return t},getSelectorFromElement:function(t){var e=t.getAttribute("data-target");if(!e||"#"===e){var n=t.getAttribute("href");e=n&&"#"!==n?n.trim():""}try{return document.querySelector(e)?e:null}catch(t){return null}},getTransitionDurationFromElement:function(t){if(!t)return 0;var e=g(t).css("transition-duration"),n=g(t).css("transition-delay"),i=parseFloat(e),o=parseFloat(n);return i||o?(e=e.split(",")[0],n=n.split(",")[0],1e3*(parseFloat(e)+parseFloat(n))):0},reflow:function(t){return t.offsetHeight},triggerTransitionEnd:function(t){g(t).trigger(e)},supportsTransitionEnd:function(){return Boolean(e)},isElement:function(t){return(t[0]||t).nodeType},typeCheckConfig:function(t,e,n){for(var i in n)if(Object.prototype.hasOwnProperty.call(n,i)){var o=n[i],r=e[i],s=r&&_.isElement(r)?"element":(a=r,{}.toString.call(a).match(/\s([a-z]+)/i)[1].toLowerCase());if(!new RegExp(o).test(s))throw new Error(t.toUpperCase()+': Option "'+i+'" provided type "'+s+'" but expected type "'+o+'".')}var a},findShadowRoot:function(t){if(!document.documentElement.attachShadow)return null;if("function"!=typeof t.getRootNode)return t instanceof ShadowRoot?t:t.parentNode?_.findShadowRoot(t.parentNode):null;var e=t.getRootNode();return e instanceof ShadowRoot?e:null}};g.fn.emulateTransitionEnd=n,g.event.special[_.TRANSITION_END]={bindType:e,delegateType:e,handle:function(t){if(g(t.target).is(this))return t.handleObj.handler.apply(this,arguments)}};var o="alert",r="bs.alert",a="."+r,c=g.fn[o],h={CLOSE:"close"+a,CLOSED:"closed"+a,CLICK_DATA_API:"click"+a+".data-api"},f="alert",d="fade",m="show",p=function(){function i(t){this._element=t}var t=i.prototype;return t.close=function(t){var e=this._element;t&&(e=this._getRootElement(t)),this._triggerCloseEvent(e).isDefaultPrevented()||this._removeElement(e)},t.dispose=function(){g.removeData(this._element,r),this._element=null},t._getRootElement=function(t){var e=_.getSelectorFromElement(t),n=!1;return e&&(n=document.querySelector(e)),n||(n=g(t).closest("."+f)[0]),n},t._triggerCloseEvent=function(t){var e=g.Event(h.CLOSE);return g(t).trigger(e),e},t._removeElement=function(e){var n=this;if(g(e).removeClass(m),g(e).hasClass(d)){var t=_.getTransitionDurationFromElement(e);g(e).one(_.TRANSITION_END,function(t){return n._destroyElement(e,t)}).emulateTransitionEnd(t)}else this._destroyElement(e)},t._destroyElement=function(t){g(t).detach().trigger(h.CLOSED).remove()},i._jQueryInterface=function(n){return this.each(function(){var t=g(this),e=t.data(r);e||(e=new i(this),t.data(r,e)),"close"===n&&e[n](this)})},i._handleDismiss=function(e){return function(t){t&&t.preventDefault(),e.close(this)}},s(i,null,[{key:"VERSION",get:function(){return"4.3.1"}}]),i}();g(document).on(h.CLICK_DATA_API,'[data-dismiss="alert"]',p._handleDismiss(new p)),g.fn[o]=p._jQueryInterface,g.fn[o].Constructor=p,g.fn[o].noConflict=function(){return g.fn[o]=c,p._jQueryInterface};var v="button",y="bs.button",E="."+y,C=".data-api",T=g.fn[v],S="active",b="btn",I="focus",D='[data-toggle^="button"]',w='[data-toggle="buttons"]',A='input:not([type="hidden"])',N=".active",O=".btn",k={CLICK_DATA_API:"click"+E+C,FOCUS_BLUR_DATA_API:"focus"+E+C+" blur"+E+C},P=function(){function n(t){this._element=t}var t=n.prototype;return t.toggle=function(){var t=!0,e=!0,n=g(this._element).closest(w)[0];if(n){var i=this._element.querySelector(A);if(i){if("radio"===i.type)if(i.checked&&this._element.classList.contains(S))t=!1;else{var o=n.querySelector(N);o&&g(o).removeClass(S)}if(t){if(i.hasAttribute("disabled")||n.hasAttribute("disabled")||i.classList.contains("disabled")||n.classList.contains("disabled"))return;i.checked=!this._element.classList.contains(S),g(i).trigger("change")}i.focus(),e=!1}}e&&this._element.setAttribute("aria-pressed",!this._element.classList.contains(S)),t&&g(this._element).toggleClass(S)},t.dispose=function(){g.removeData(this._element,y),this._element=null},n._jQueryInterface=function(e){return this.each(function(){var t=g(this).data(y);t||(t=new n(this),g(this).data(y,t)),"toggle"===e&&t[e]()})},s(n,null,[{key:"VERSION",get:function(){return"4.3.1"}}]),n}();g(document).on(k.CLICK_DATA_API,D,function(t){t.preventDefault();var e=t.target;g(e).hasClass(b)||(e=g(e).closest(O)),P._jQueryInterface.call(g(e),"toggle")}).on(k.FOCUS_BLUR_DATA_API,D,function(t){var e=g(t.target).closest(O)[0];g(e).toggleClass(I,/^focus(in)?$/.test(t.type))}),g.fn[v]=P._jQueryInterface,g.fn[v].Constructor=P,g.fn[v].noConflict=function(){return g.fn[v]=T,P._jQueryInterface};var L="carousel",j="bs.carousel",H="."+j,R=".data-api",x=g.fn[L],F={interval:5e3,keyboard:!0,slide:!1,pause:"hover",wrap:!0,touch:!0},U={interval:"(number|boolean)",keyboard:"boolean",slide:"(boolean|string)",pause:"(string|boolean)",wrap:"boolean",touch:"boolean"},W="next",q="prev",M="left",K="right",Q={SLIDE:"slide"+H,SLID:"slid"+H,KEYDOWN:"keydown"+H,MOUSEENTER:"mouseenter"+H,MOUSELEAVE:"mouseleave"+H,TOUCHSTART:"touchstart"+H,TOUCHMOVE:"touchmove"+H,TOUCHEND:"touchend"+H,POINTERDOWN:"pointerdown"+H,POINTERUP:"pointerup"+H,DRAG_START:"dragstart"+H,LOAD_DATA_API:"load"+H+R,CLICK_DATA_API:"click"+H+R},B="carousel",V="active",Y="slide",z="carousel-item-right",X="carousel-item-left",$="carousel-item-next",G="carousel-item-prev",J="pointer-event",Z=".active",tt=".active.carousel-item",et=".carousel-item",nt=".carousel-item img",it=".carousel-item-next, .carousel-item-prev",ot=".carousel-indicators",rt="[data-slide], [data-slide-to]",st='[data-ride="carousel"]',at={TOUCH:"touch",PEN:"pen"},lt=function(){function r(t,e){this._items=null,this._interval=null,this._activeElement=null,this._isPaused=!1,this._isSliding=!1,this.touchTimeout=null,this.touchStartX=0,this.touchDeltaX=0,this._config=this._getConfig(e),this._element=t,this._indicatorsElement=this._element.querySelector(ot),this._touchSupported="ontouchstart"in document.documentElement||0<navigator.maxTouchPoints,this._pointerEvent=Boolean(window.PointerEvent||window.MSPointerEvent),this._addEventListeners()}var t=r.prototype;return t.next=function(){this._isSliding||this._slide(W)},t.nextWhenVisible=function(){!document.hidden&&g(this._element).is(":visible")&&"hidden"!==g(this._element).css("visibility")&&this.next()},t.prev=function(){this._isSliding||this._slide(q)},t.pause=function(t){t||(this._isPaused=!0),this._element.querySelector(it)&&(_.triggerTransitionEnd(this._element),this.cycle(!0)),clearInterval(this._interval),this._interval=null},t.cycle=function(t){t||(this._isPaused=!1),this._interval&&(clearInterval(this._interval),this._interval=null),this._config.interval&&!this._isPaused&&(this._interval=setInterval((document.visibilityState?this.nextWhenVisible:this.next).bind(this),this._config.interval))},t.to=function(t){var e=this;this._activeElement=this._element.querySelector(tt);var n=this._getItemIndex(this._activeElement);if(!(t>this._items.length-1||t<0))if(this._isSliding)g(this._element).one(Q.SLID,function(){return e.to(t)});else{if(n===t)return this.pause(),void this.cycle();var i=n<t?W:q;this._slide(i,this._items[t])}},t.dispose=function(){g(this._element).off(H),g.removeData(this._element,j),this._items=null,this._config=null,this._element=null,this._interval=null,this._isPaused=null,this._isSliding=null,this._activeElement=null,this._indicatorsElement=null},t._getConfig=function(t){return t=l({},F,t),_.typeCheckConfig(L,t,U),t},t._handleSwipe=function(){var t=Math.abs(this.touchDeltaX);if(!(t<=40)){var e=t/this.touchDeltaX;0<e&&this.prev(),e<0&&this.next()}},t._addEventListeners=function(){var e=this;this._config.keyboard&&g(this._element).on(Q.KEYDOWN,function(t){return e._keydown(t)}),"hover"===this._config.pause&&g(this._element).on(Q.MOUSEENTER,function(t){return e.pause(t)}).on(Q.MOUSELEAVE,function(t){return e.cycle(t)}),this._config.touch&&this._addTouchEventListeners()},t._addTouchEventListeners=function(){var n=this;if(this._touchSupported){var e=function(t){n._pointerEvent&&at[t.originalEvent.pointerType.toUpperCase()]?n.touchStartX=t.originalEvent.clientX:n._pointerEvent||(n.touchStartX=t.originalEvent.touches[0].clientX)},i=function(t){n._pointerEvent&&at[t.originalEvent.pointerType.toUpperCase()]&&(n.touchDeltaX=t.originalEvent.clientX-n.touchStartX),n._handleSwipe(),"hover"===n._config.pause&&(n.pause(),n.touchTimeout&&clearTimeout(n.touchTimeout),n.touchTimeout=setTimeout(function(t){return n.cycle(t)},500+n._config.interval))};g(this._element.querySelectorAll(nt)).on(Q.DRAG_START,function(t){return t.preventDefault()}),this._pointerEvent?(g(this._element).on(Q.POINTERDOWN,function(t){return e(t)}),g(this._element).on(Q.POINTERUP,function(t){return i(t)}),this._element.classList.add(J)):(g(this._element).on(Q.TOUCHSTART,function(t){return e(t)}),g(this._element).on(Q.TOUCHMOVE,function(t){var e;(e=t).originalEvent.touches&&1<e.originalEvent.touches.length?n.touchDeltaX=0:n.touchDeltaX=e.originalEvent.touches[0].clientX-n.touchStartX}),g(this._element).on(Q.TOUCHEND,function(t){return i(t)}))}},t._keydown=function(t){if(!/input|textarea/i.test(t.target.tagName))switch(t.which){case 37:t.preventDefault(),this.prev();break;case 39:t.preventDefault(),this.next()}},t._getItemIndex=function(t){return this._items=t&&t.parentNode?[].slice.call(t.parentNode.querySelectorAll(et)):[],this._items.indexOf(t)},t._getItemByDirection=function(t,e){var n=t===W,i=t===q,o=this._getItemIndex(e),r=this._items.length-1;if((i&&0===o||n&&o===r)&&!this._config.wrap)return e;var s=(o+(t===q?-1:1))%this._items.length;return-1===s?this._items[this._items.length-1]:this._items[s]},t._triggerSlideEvent=function(t,e){var n=this._getItemIndex(t),i=this._getItemIndex(this._element.querySelector(tt)),o=g.Event(Q.SLIDE,{relatedTarget:t,direction:e,from:i,to:n});return g(this._element).trigger(o),o},t._setActiveIndicatorElement=function(t){if(this._indicatorsElement){var e=[].slice.call(this._indicatorsElement.querySelectorAll(Z));g(e).removeClass(V);var n=this._indicatorsElement.children[this._getItemIndex(t)];n&&g(n).addClass(V)}},t._slide=function(t,e){var n,i,o,r=this,s=this._element.querySelector(tt),a=this._getItemIndex(s),l=e||s&&this._getItemByDirection(t,s),c=this._getItemIndex(l),h=Boolean(this._interval);if(o=t===W?(n=X,i=$,M):(n=z,i=G,K),l&&g(l).hasClass(V))this._isSliding=!1;else if(!this._triggerSlideEvent(l,o).isDefaultPrevented()&&s&&l){this._isSliding=!0,h&&this.pause(),this._setActiveIndicatorElement(l);var u=g.Event(Q.SLID,{relatedTarget:l,direction:o,from:a,to:c});if(g(this._element).hasClass(Y)){g(l).addClass(i),_.reflow(l),g(s).addClass(n),g(l).addClass(n);var f=parseInt(l.getAttribute("data-interval"),10);this._config.interval=f?(this._config.defaultInterval=this._config.defaultInterval||this._config.interval,f):this._config.defaultInterval||this._config.interval;var d=_.getTransitionDurationFromElement(s);g(s).one(_.TRANSITION_END,function(){g(l).removeClass(n+" "+i).addClass(V),g(s).removeClass(V+" "+i+" "+n),r._isSliding=!1,setTimeout(function(){return g(r._element).trigger(u)},0)}).emulateTransitionEnd(d)}else g(s).removeClass(V),g(l).addClass(V),this._isSliding=!1,g(this._element).trigger(u);h&&this.cycle()}},r._jQueryInterface=function(i){return this.each(function(){var t=g(this).data(j),e=l({},F,g(this).data());"object"==typeof i&&(e=l({},e,i));var n="string"==typeof i?i:e.slide;if(t||(t=new r(this,e),g(this).data(j,t)),"number"==typeof i)t.to(i);else if("string"==typeof n){if("undefined"==typeof t[n])throw new TypeError('No method named "'+n+'"');t[n]()}else e.interval&&e.ride&&(t.pause(),t.cycle())})},r._dataApiClickHandler=function(t){var e=_.getSelectorFromElement(this);if(e){var n=g(e)[0];if(n&&g(n).hasClass(B)){var i=l({},g(n).data(),g(this).data()),o=this.getAttribute("data-slide-to");o&&(i.interval=!1),r._jQueryInterface.call(g(n),i),o&&g(n).data(j).to(o),t.preventDefault()}}},s(r,null,[{key:"VERSION",get:function(){return"4.3.1"}},{key:"Default",get:function(){return F}}]),r}();g(document).on(Q.CLICK_DATA_API,rt,lt._dataApiClickHandler),g(window).on(Q.LOAD_DATA_API,function(){for(var t=[].slice.call(document.querySelectorAll(st)),e=0,n=t.length;e<n;e++){var i=g(t[e]);lt._jQueryInterface.call(i,i.data())}}),g.fn[L]=lt._jQueryInterface,g.fn[L].Constructor=lt,g.fn[L].noConflict=function(){return g.fn[L]=x,lt._jQueryInterface};var ct="collapse",ht="bs.collapse",ut="."+ht,ft=g.fn[ct],dt={toggle:!0,parent:""},gt={toggle:"boolean",parent:"(string|element)"},_t={SHOW:"show"+ut,SHOWN:"shown"+ut,HIDE:"hide"+ut,HIDDEN:"hidden"+ut,CLICK_DATA_API:"click"+ut+".data-api"},mt="show",pt="collapse",vt="collapsing",yt="collapsed",Et="width",Ct="height",Tt=".show, .collapsing",St='[data-toggle="collapse"]',bt=function(){function a(e,t){this._isTransitioning=!1,this._element=e,this._config=this._getConfig(t),this._triggerArray=[].slice.call(document.querySelectorAll('[data-toggle="collapse"][href="#'+e.id+'"],[data-toggle="collapse"][data-target="#'+e.id+'"]'));for(var n=[].slice.call(document.querySelectorAll(St)),i=0,o=n.length;i<o;i++){var r=n[i],s=_.getSelectorFromElement(r),a=[].slice.call(document.querySelectorAll(s)).filter(function(t){return t===e});null!==s&&0<a.length&&(this._selector=s,this._triggerArray.push(r))}this._parent=this._config.parent?this._getParent():null,this._config.parent||this._addAriaAndCollapsedClass(this._element,this._triggerArray),this._config.toggle&&this.toggle()}var t=a.prototype;return t.toggle=function(){g(this._element).hasClass(mt)?this.hide():this.show()},t.show=function(){var t,e,n=this;if(!this._isTransitioning&&!g(this._element).hasClass(mt)&&(this._parent&&0===(t=[].slice.call(this._parent.querySelectorAll(Tt)).filter(function(t){return"string"==typeof n._config.parent?t.getAttribute("data-parent")===n._config.parent:t.classList.contains(pt)})).length&&(t=null),!(t&&(e=g(t).not(this._selector).data(ht))&&e._isTransitioning))){var i=g.Event(_t.SHOW);if(g(this._element).trigger(i),!i.isDefaultPrevented()){t&&(a._jQueryInterface.call(g(t).not(this._selector),"hide"),e||g(t).data(ht,null));var o=this._getDimension();g(this._element).removeClass(pt).addClass(vt),this._element.style[o]=0,this._triggerArray.length&&g(this._triggerArray).removeClass(yt).attr("aria-expanded",!0),this.setTransitioning(!0);var r="scroll"+(o[0].toUpperCase()+o.slice(1)),s=_.getTransitionDurationFromElement(this._element);g(this._element).one(_.TRANSITION_END,function(){g(n._element).removeClass(vt).addClass(pt).addClass(mt),n._element.style[o]="",n.setTransitioning(!1),g(n._element).trigger(_t.SHOWN)}).emulateTransitionEnd(s),this._element.style[o]=this._element[r]+"px"}}},t.hide=function(){var t=this;if(!this._isTransitioning&&g(this._element).hasClass(mt)){var e=g.Event(_t.HIDE);if(g(this._element).trigger(e),!e.isDefaultPrevented()){var n=this._getDimension();this._element.style[n]=this._element.getBoundingClientRect()[n]+"px",_.reflow(this._element),g(this._element).addClass(vt).removeClass(pt).removeClass(mt);var i=this._triggerArray.length;if(0<i)for(var o=0;o<i;o++){var r=this._triggerArray[o],s=_.getSelectorFromElement(r);if(null!==s)g([].slice.call(document.querySelectorAll(s))).hasClass(mt)||g(r).addClass(yt).attr("aria-expanded",!1)}this.setTransitioning(!0);this._element.style[n]="";var a=_.getTransitionDurationFromElement(this._element);g(this._element).one(_.TRANSITION_END,function(){t.setTransitioning(!1),g(t._element).removeClass(vt).addClass(pt).trigger(_t.HIDDEN)}).emulateTransitionEnd(a)}}},t.setTransitioning=function(t){this._isTransitioning=t},t.dispose=function(){g.removeData(this._element,ht),this._config=null,this._parent=null,this._element=null,this._triggerArray=null,this._isTransitioning=null},t._getConfig=function(t){return(t=l({},dt,t)).toggle=Boolean(t.toggle),_.typeCheckConfig(ct,t,gt),t},t._getDimension=function(){return g(this._element).hasClass(Et)?Et:Ct},t._getParent=function(){var t,n=this;_.isElement(this._config.parent)?(t=this._config.parent,"undefined"!=typeof this._config.parent.jquery&&(t=this._config.parent[0])):t=document.querySelector(this._config.parent);var e='[data-toggle="collapse"][data-parent="'+this._config.parent+'"]',i=[].slice.call(t.querySelectorAll(e));return g(i).each(function(t,e){n._addAriaAndCollapsedClass(a._getTargetFromElement(e),[e])}),t},t._addAriaAndCollapsedClass=function(t,e){var n=g(t).hasClass(mt);e.length&&g(e).toggleClass(yt,!n).attr("aria-expanded",n)},a._getTargetFromElement=function(t){var e=_.getSelectorFromElement(t);return e?document.querySelector(e):null},a._jQueryInterface=function(i){return this.each(function(){var t=g(this),e=t.data(ht),n=l({},dt,t.data(),"object"==typeof i&&i?i:{});if(!e&&n.toggle&&/show|hide/.test(i)&&(n.toggle=!1),e||(e=new a(this,n),t.data(ht,e)),"string"==typeof i){if("undefined"==typeof e[i])throw new TypeError('No method named "'+i+'"');e[i]()}})},s(a,null,[{key:"VERSION",get:function(){return"4.3.1"}},{key:"Default",get:function(){return dt}}]),a}();g(document).on(_t.CLICK_DATA_API,St,function(t){"A"===t.currentTarget.tagName&&t.preventDefault();var n=g(this),e=_.getSelectorFromElement(this),i=[].slice.call(document.querySelectorAll(e));g(i).each(function(){var t=g(this),e=t.data(ht)?"toggle":n.data();bt._jQueryInterface.call(t,e)})}),g.fn[ct]=bt._jQueryInterface,g.fn[ct].Constructor=bt,g.fn[ct].noConflict=function(){return g.fn[ct]=ft,bt._jQueryInterface};var It="dropdown",Dt="bs.dropdown",wt="."+Dt,At=".data-api",Nt=g.fn[It],Ot=new RegExp("38|40|27"),kt={HIDE:"hide"+wt,HIDDEN:"hidden"+wt,SHOW:"show"+wt,SHOWN:"shown"+wt,CLICK:"click"+wt,CLICK_DATA_API:"click"+wt+At,KEYDOWN_DATA_API:"keydown"+wt+At,KEYUP_DATA_API:"keyup"+wt+At},Pt="disabled",Lt="show",jt="dropup",Ht="dropright",Rt="dropleft",xt="dropdown-menu-right",Ft="position-static",Ut='[data-toggle="dropdown"]',Wt=".dropdown form",qt=".dropdown-menu",Mt=".navbar-nav",Kt=".dropdown-menu .dropdown-item:not(.disabled):not(:disabled)",Qt="top-start",Bt="top-end",Vt="bottom-start",Yt="bottom-end",zt="right-start",Xt="left-start",$t={offset:0,flip:!0,boundary:"scrollParent",reference:"toggle",display:"dynamic"},Gt={offset:"(number|string|function)",flip:"boolean",boundary:"(string|element)",reference:"(string|element)",display:"string"},Jt=function(){function c(t,e){this._element=t,this._popper=null,this._config=this._getConfig(e),this._menu=this._getMenuElement(),this._inNavbar=this._detectNavbar(),this._addEventListeners()}var t=c.prototype;return t.toggle=function(){if(!this._element.disabled&&!g(this._element).hasClass(Pt)){var t=c._getParentFromElement(this._element),e=g(this._menu).hasClass(Lt);if(c._clearMenus(),!e){var n={relatedTarget:this._element},i=g.Event(kt.SHOW,n);if(g(t).trigger(i),!i.isDefaultPrevented()){if(!this._inNavbar){if("undefined"==typeof u)throw new TypeError("Bootstrap's dropdowns require Popper.js (https://popper.js.org/)");var o=this._element;"parent"===this._config.reference?o=t:_.isElement(this._config.reference)&&(o=this._config.reference,"undefined"!=typeof this._config.reference.jquery&&(o=this._config.reference[0])),"scrollParent"!==this._config.boundary&&g(t).addClass(Ft),this._popper=new u(o,this._menu,this._getPopperConfig())}"ontouchstart"in document.documentElement&&0===g(t).closest(Mt).length&&g(document.body).children().on("mouseover",null,g.noop),this._element.focus(),this._element.setAttribute("aria-expanded",!0),g(this._menu).toggleClass(Lt),g(t).toggleClass(Lt).trigger(g.Event(kt.SHOWN,n))}}}},t.show=function(){if(!(this._element.disabled||g(this._element).hasClass(Pt)||g(this._menu).hasClass(Lt))){var t={relatedTarget:this._element},e=g.Event(kt.SHOW,t),n=c._getParentFromElement(this._element);g(n).trigger(e),e.isDefaultPrevented()||(g(this._menu).toggleClass(Lt),g(n).toggleClass(Lt).trigger(g.Event(kt.SHOWN,t)))}},t.hide=function(){if(!this._element.disabled&&!g(this._element).hasClass(Pt)&&g(this._menu).hasClass(Lt)){var t={relatedTarget:this._element},e=g.Event(kt.HIDE,t),n=c._getParentFromElement(this._element);g(n).trigger(e),e.isDefaultPrevented()||(g(this._menu).toggleClass(Lt),g(n).toggleClass(Lt).trigger(g.Event(kt.HIDDEN,t)))}},t.dispose=function(){g.removeData(this._element,Dt),g(this._element).off(wt),this._element=null,(this._menu=null)!==this._popper&&(this._popper.destroy(),this._popper=null)},t.update=function(){this._inNavbar=this._detectNavbar(),null!==this._popper&&this._popper.scheduleUpdate()},t._addEventListeners=function(){var e=this;g(this._element).on(kt.CLICK,function(t){t.preventDefault(),t.stopPropagation(),e.toggle()})},t._getConfig=function(t){return t=l({},this.constructor.Default,g(this._element).data(),t),_.typeCheckConfig(It,t,this.constructor.DefaultType),t},t._getMenuElement=function(){if(!this._menu){var t=c._getParentFromElement(this._element);t&&(this._menu=t.querySelector(qt))}return this._menu},t._getPlacement=function(){var t=g(this._element.parentNode),e=Vt;return t.hasClass(jt)?(e=Qt,g(this._menu).hasClass(xt)&&(e=Bt)):t.hasClass(Ht)?e=zt:t.hasClass(Rt)?e=Xt:g(this._menu).hasClass(xt)&&(e=Yt),e},t._detectNavbar=function(){return 0<g(this._element).closest(".navbar").length},t._getOffset=function(){var e=this,t={};return"function"==typeof this._config.offset?t.fn=function(t){return t.offsets=l({},t.offsets,e._config.offset(t.offsets,e._element)||{}),t}:t.offset=this._config.offset,t},t._getPopperConfig=function(){var t={placement:this._getPlacement(),modifiers:{offset:this._getOffset(),flip:{enabled:this._config.flip},preventOverflow:{boundariesElement:this._config.boundary}}};return"static"===this._config.display&&(t.modifiers.applyStyle={enabled:!1}),t},c._jQueryInterface=function(e){return this.each(function(){var t=g(this).data(Dt);if(t||(t=new c(this,"object"==typeof e?e:null),g(this).data(Dt,t)),"string"==typeof e){if("undefined"==typeof t[e])throw new TypeError('No method named "'+e+'"');t[e]()}})},c._clearMenus=function(t){if(!t||3!==t.which&&("keyup"!==t.type||9===t.which))for(var e=[].slice.call(document.querySelectorAll(Ut)),n=0,i=e.length;n<i;n++){var o=c._getParentFromElement(e[n]),r=g(e[n]).data(Dt),s={relatedTarget:e[n]};if(t&&"click"===t.type&&(s.clickEvent=t),r){var a=r._menu;if(g(o).hasClass(Lt)&&!(t&&("click"===t.type&&/input|textarea/i.test(t.target.tagName)||"keyup"===t.type&&9===t.which)&&g.contains(o,t.target))){var l=g.Event(kt.HIDE,s);g(o).trigger(l),l.isDefaultPrevented()||("ontouchstart"in document.documentElement&&g(document.body).children().off("mouseover",null,g.noop),e[n].setAttribute("aria-expanded","false"),g(a).removeClass(Lt),g(o).removeClass(Lt).trigger(g.Event(kt.HIDDEN,s)))}}}},c._getParentFromElement=function(t){var e,n=_.getSelectorFromElement(t);return n&&(e=document.querySelector(n)),e||t.parentNode},c._dataApiKeydownHandler=function(t){if((/input|textarea/i.test(t.target.tagName)?!(32===t.which||27!==t.which&&(40!==t.which&&38!==t.which||g(t.target).closest(qt).length)):Ot.test(t.which))&&(t.preventDefault(),t.stopPropagation(),!this.disabled&&!g(this).hasClass(Pt))){var e=c._getParentFromElement(this),n=g(e).hasClass(Lt);if(n&&(!n||27!==t.which&&32!==t.which)){var i=[].slice.call(e.querySelectorAll(Kt));if(0!==i.length){var o=i.indexOf(t.target);38===t.which&&0<o&&o--,40===t.which&&o<i.length-1&&o++,o<0&&(o=0),i[o].focus()}}else{if(27===t.which){var r=e.querySelector(Ut);g(r).trigger("focus")}g(this).trigger("click")}}},s(c,null,[{key:"VERSION",get:function(){return"4.3.1"}},{key:"Default",get:function(){return $t}},{key:"DefaultType",get:function(){return Gt}}]),c}();g(document).on(kt.KEYDOWN_DATA_API,Ut,Jt._dataApiKeydownHandler).on(kt.KEYDOWN_DATA_API,qt,Jt._dataApiKeydownHandler).on(kt.CLICK_DATA_API+" "+kt.KEYUP_DATA_API,Jt._clearMenus).on(kt.CLICK_DATA_API,Ut,function(t){t.preventDefault(),t.stopPropagation(),Jt._jQueryInterface.call(g(this),"toggle")}).on(kt.CLICK_DATA_API,Wt,function(t){t.stopPropagation()}),g.fn[It]=Jt._jQueryInterface,g.fn[It].Constructor=Jt,g.fn[It].noConflict=function(){return g.fn[It]=Nt,Jt._jQueryInterface};var Zt="modal",te="bs.modal",ee="."+te,ne=g.fn[Zt],ie={backdrop:!0,keyboard:!0,focus:!0,show:!0},oe={backdrop:"(boolean|string)",keyboard:"boolean",focus:"boolean",show:"boolean"},re={HIDE:"hide"+ee,HIDDEN:"hidden"+ee,SHOW:"show"+ee,SHOWN:"shown"+ee,FOCUSIN:"focusin"+ee,RESIZE:"resize"+ee,CLICK_DISMISS:"click.dismiss"+ee,KEYDOWN_DISMISS:"keydown.dismiss"+ee,MOUSEUP_DISMISS:"mouseup.dismiss"+ee,MOUSEDOWN_DISMISS:"mousedown.dismiss"+ee,CLICK_DATA_API:"click"+ee+".data-api"},se="modal-dialog-scrollable",ae="modal-scrollbar-measure",le="modal-backdrop",ce="modal-open",he="fade",ue="show",fe=".modal-dialog",de=".modal-body",ge='[data-toggle="modal"]',_e='[data-dismiss="modal"]',me=".fixed-top, .fixed-bottom, .is-fixed, .sticky-top",pe=".sticky-top",ve=function(){function o(t,e){this._config=this._getConfig(e),this._element=t,this._dialog=t.querySelector(fe),this._backdrop=null,this._isShown=!1,this._isBodyOverflowing=!1,this._ignoreBackdropClick=!1,this._isTransitioning=!1,this._scrollbarWidth=0}var t=o.prototype;return t.toggle=function(t){return this._isShown?this.hide():this.show(t)},t.show=function(t){var e=this;if(!this._isShown&&!this._isTransitioning){g(this._element).hasClass(he)&&(this._isTransitioning=!0);var n=g.Event(re.SHOW,{relatedTarget:t});g(this._element).trigger(n),this._isShown||n.isDefaultPrevented()||(this._isShown=!0,this._checkScrollbar(),this._setScrollbar(),this._adjustDialog(),this._setEscapeEvent(),this._setResizeEvent(),g(this._element).on(re.CLICK_DISMISS,_e,function(t){return e.hide(t)}),g(this._dialog).on(re.MOUSEDOWN_DISMISS,function(){g(e._element).one(re.MOUSEUP_DISMISS,function(t){g(t.target).is(e._element)&&(e._ignoreBackdropClick=!0)})}),this._showBackdrop(function(){return e._showElement(t)}))}},t.hide=function(t){var e=this;if(t&&t.preventDefault(),this._isShown&&!this._isTransitioning){var n=g.Event(re.HIDE);if(g(this._element).trigger(n),this._isShown&&!n.isDefaultPrevented()){this._isShown=!1;var i=g(this._element).hasClass(he);if(i&&(this._isTransitioning=!0),this._setEscapeEvent(),this._setResizeEvent(),g(document).off(re.FOCUSIN),g(this._element).removeClass(ue),g(this._element).off(re.CLICK_DISMISS),g(this._dialog).off(re.MOUSEDOWN_DISMISS),i){var o=_.getTransitionDurationFromElement(this._element);g(this._element).one(_.TRANSITION_END,function(t){return e._hideModal(t)}).emulateTransitionEnd(o)}else this._hideModal()}}},t.dispose=function(){[window,this._element,this._dialog].forEach(function(t){return g(t).off(ee)}),g(document).off(re.FOCUSIN),g.removeData(this._element,te),this._config=null,this._element=null,this._dialog=null,this._backdrop=null,this._isShown=null,this._isBodyOverflowing=null,this._ignoreBackdropClick=null,this._isTransitioning=null,this._scrollbarWidth=null},t.handleUpdate=function(){this._adjustDialog()},t._getConfig=function(t){return t=l({},ie,t),_.typeCheckConfig(Zt,t,oe),t},t._showElement=function(t){var e=this,n=g(this._element).hasClass(he);this._element.parentNode&&this._element.parentNode.nodeType===Node.ELEMENT_NODE||document.body.appendChild(this._element),this._element.style.display="block",this._element.removeAttribute("aria-hidden"),this._element.setAttribute("aria-modal",!0),g(this._dialog).hasClass(se)?this._dialog.querySelector(de).scrollTop=0:this._element.scrollTop=0,n&&_.reflow(this._element),g(this._element).addClass(ue),this._config.focus&&this._enforceFocus();var i=g.Event(re.SHOWN,{relatedTarget:t}),o=function(){e._config.focus&&e._element.focus(),e._isTransitioning=!1,g(e._element).trigger(i)};if(n){var r=_.getTransitionDurationFromElement(this._dialog);g(this._dialog).one(_.TRANSITION_END,o).emulateTransitionEnd(r)}else o()},t._enforceFocus=function(){var e=this;g(document).off(re.FOCUSIN).on(re.FOCUSIN,function(t){document!==t.target&&e._element!==t.target&&0===g(e._element).has(t.target).length&&e._element.focus()})},t._setEscapeEvent=function(){var e=this;this._isShown&&this._config.keyboard?g(this._element).on(re.KEYDOWN_DISMISS,function(t){27===t.which&&(t.preventDefault(),e.hide())}):this._isShown||g(this._element).off(re.KEYDOWN_DISMISS)},t._setResizeEvent=function(){var e=this;this._isShown?g(window).on(re.RESIZE,function(t){return e.handleUpdate(t)}):g(window).off(re.RESIZE)},t._hideModal=function(){var t=this;this._element.style.display="none",this._element.setAttribute("aria-hidden",!0),this._element.removeAttribute("aria-modal"),this._isTransitioning=!1,this._showBackdrop(function(){g(document.body).removeClass(ce),t._resetAdjustments(),t._resetScrollbar(),g(t._element).trigger(re.HIDDEN)})},t._removeBackdrop=function(){this._backdrop&&(g(this._backdrop).remove(),this._backdrop=null)},t._showBackdrop=function(t){var e=this,n=g(this._element).hasClass(he)?he:"";if(this._isShown&&this._config.backdrop){if(this._backdrop=document.createElement("div"),this._backdrop.className=le,n&&this._backdrop.classList.add(n),g(this._backdrop).appendTo(document.body),g(this._element).on(re.CLICK_DISMISS,function(t){e._ignoreBackdropClick?e._ignoreBackdropClick=!1:t.target===t.currentTarget&&("static"===e._config.backdrop?e._element.focus():e.hide())}),n&&_.reflow(this._backdrop),g(this._backdrop).addClass(ue),!t)return;if(!n)return void t();var i=_.getTransitionDurationFromElement(this._backdrop);g(this._backdrop).one(_.TRANSITION_END,t).emulateTransitionEnd(i)}else if(!this._isShown&&this._backdrop){g(this._backdrop).removeClass(ue);var o=function(){e._removeBackdrop(),t&&t()};if(g(this._element).hasClass(he)){var r=_.getTransitionDurationFromElement(this._backdrop);g(this._backdrop).one(_.TRANSITION_END,o).emulateTransitionEnd(r)}else o()}else t&&t()},t._adjustDialog=function(){var t=this._element.scrollHeight>document.documentElement.clientHeight;!this._isBodyOverflowing&&t&&(this._element.style.paddingLeft=this._scrollbarWidth+"px"),this._isBodyOverflowing&&!t&&(this._element.style.paddingRight=this._scrollbarWidth+"px")},t._resetAdjustments=function(){this._element.style.paddingLeft="",this._element.style.paddingRight=""},t._checkScrollbar=function(){var t=document.body.getBoundingClientRect();this._isBodyOverflowing=t.left+t.right<window.innerWidth,this._scrollbarWidth=this._getScrollbarWidth()},t._setScrollbar=function(){var o=this;if(this._isBodyOverflowing){var t=[].slice.call(document.querySelectorAll(me)),e=[].slice.call(document.querySelectorAll(pe));g(t).each(function(t,e){var n=e.style.paddingRight,i=g(e).css("padding-right");g(e).data("padding-right",n).css("padding-right",parseFloat(i)+o._scrollbarWidth+"px")}),g(e).each(function(t,e){var n=e.style.marginRight,i=g(e).css("margin-right");g(e).data("margin-right",n).css("margin-right",parseFloat(i)-o._scrollbarWidth+"px")});var n=document.body.style.paddingRight,i=g(document.body).css("padding-right");g(document.body).data("padding-right",n).css("padding-right",parseFloat(i)+this._scrollbarWidth+"px")}g(document.body).addClass(ce)},t._resetScrollbar=function(){var t=[].slice.call(document.querySelectorAll(me));g(t).each(function(t,e){var n=g(e).data("padding-right");g(e).removeData("padding-right"),e.style.paddingRight=n||""});var e=[].slice.call(document.querySelectorAll(""+pe));g(e).each(function(t,e){var n=g(e).data("margin-right");"undefined"!=typeof n&&g(e).css("margin-right",n).removeData("margin-right")});var n=g(document.body).data("padding-right");g(document.body).removeData("padding-right"),document.body.style.paddingRight=n||""},t._getScrollbarWidth=function(){var t=document.createElement("div");t.className=ae,document.body.appendChild(t);var e=t.getBoundingClientRect().width-t.clientWidth;return document.body.removeChild(t),e},o._jQueryInterface=function(n,i){return this.each(function(){var t=g(this).data(te),e=l({},ie,g(this).data(),"object"==typeof n&&n?n:{});if(t||(t=new o(this,e),g(this).data(te,t)),"string"==typeof n){if("undefined"==typeof t[n])throw new TypeError('No method named "'+n+'"');t[n](i)}else e.show&&t.show(i)})},s(o,null,[{key:"VERSION",get:function(){return"4.3.1"}},{key:"Default",get:function(){return ie}}]),o}();g(document).on(re.CLICK_DATA_API,ge,function(t){var e,n=this,i=_.getSelectorFromElement(this);i&&(e=document.querySelector(i));var o=g(e).data(te)?"toggle":l({},g(e).data(),g(this).data());"A"!==this.tagName&&"AREA"!==this.tagName||t.preventDefault();var r=g(e).one(re.SHOW,function(t){t.isDefaultPrevented()||r.one(re.HIDDEN,function(){g(n).is(":visible")&&n.focus()})});ve._jQueryInterface.call(g(e),o,this)}),g.fn[Zt]=ve._jQueryInterface,g.fn[Zt].Constructor=ve,g.fn[Zt].noConflict=function(){return g.fn[Zt]=ne,ve._jQueryInterface};var ye=["background","cite","href","itemtype","longdesc","poster","src","xlink:href"],Ee={"*":["class","dir","id","lang","role",/^aria-[\w-]*$/i],a:["target","href","title","rel"],area:[],b:[],br:[],col:[],code:[],div:[],em:[],hr:[],h1:[],h2:[],h3:[],h4:[],h5:[],h6:[],i:[],img:["src","alt","title","width","height"],li:[],ol:[],p:[],pre:[],s:[],small:[],span:[],sub:[],sup:[],strong:[],u:[],ul:[]},Ce=/^(?:(?:https?|mailto|ftp|tel|file):|[^&:/?#]*(?:[/?#]|$))/gi,Te=/^data:(?:image\/(?:bmp|gif|jpeg|jpg|png|tiff|webp)|video\/(?:mpeg|mp4|ogg|webm)|audio\/(?:mp3|oga|ogg|opus));base64,[a-z0-9+/]+=*$/i;function Se(t,s,e){if(0===t.length)return t;if(e&&"function"==typeof e)return e(t);for(var n=(new window.DOMParser).parseFromString(t,"text/html"),a=Object.keys(s),l=[].slice.call(n.body.querySelectorAll("*")),i=function(t,e){var n=l[t],i=n.nodeName.toLowerCase();if(-1===a.indexOf(n.nodeName.toLowerCase()))return n.parentNode.removeChild(n),"continue";var o=[].slice.call(n.attributes),r=[].concat(s["*"]||[],s[i]||[]);o.forEach(function(t){(function(t,e){var n=t.nodeName.toLowerCase();if(-1!==e.indexOf(n))return-1===ye.indexOf(n)||Boolean(t.nodeValue.match(Ce)||t.nodeValue.match(Te));for(var i=e.filter(function(t){return t instanceof RegExp}),o=0,r=i.length;o<r;o++)if(n.match(i[o]))return!0;return!1})(t,r)||n.removeAttribute(t.nodeName)})},o=0,r=l.length;o<r;o++)i(o);return n.body.innerHTML}var be="tooltip",Ie="bs.tooltip",De="."+Ie,we=g.fn[be],Ae="bs-tooltip",Ne=new RegExp("(^|\\s)"+Ae+"\\S+","g"),Oe=["sanitize","whiteList","sanitizeFn"],ke={animation:"boolean",template:"string",title:"(string|element|function)",trigger:"string",delay:"(number|object)",html:"boolean",selector:"(string|boolean)",placement:"(string|function)",offset:"(number|string|function)",container:"(string|element|boolean)",fallbackPlacement:"(string|array)",boundary:"(string|element)",sanitize:"boolean",sanitizeFn:"(null|function)",whiteList:"object"},Pe={AUTO:"auto",TOP:"top",RIGHT:"right",BOTTOM:"bottom",LEFT:"left"},Le={animation:!0,template:'<div class="tooltip" role="tooltip"><div class="arrow"></div><div class="tooltip-inner"></div></div>',trigger:"hover focus",title:"",delay:0,html:!1,selector:!1,placement:"top",offset:0,container:!1,fallbackPlacement:"flip",boundary:"scrollParent",sanitize:!0,sanitizeFn:null,whiteList:Ee},je="show",He="out",Re={HIDE:"hide"+De,HIDDEN:"hidden"+De,SHOW:"show"+De,SHOWN:"shown"+De,INSERTED:"inserted"+De,CLICK:"click"+De,FOCUSIN:"focusin"+De,FOCUSOUT:"focusout"+De,MOUSEENTER:"mouseenter"+De,MOUSELEAVE:"mouseleave"+De},xe="fade",Fe="show",Ue=".tooltip-inner",We=".arrow",qe="hover",Me="focus",Ke="click",Qe="manual",Be=function(){function i(t,e){if("undefined"==typeof u)throw new TypeError("Bootstrap's tooltips require Popper.js (https://popper.js.org/)");this._isEnabled=!0,this._timeout=0,this._hoverState="",this._activeTrigger={},this._popper=null,this.element=t,this.config=this._getConfig(e),this.tip=null,this._setListeners()}var t=i.prototype;return t.enable=function(){this._isEnabled=!0},t.disable=function(){this._isEnabled=!1},t.toggleEnabled=function(){this._isEnabled=!this._isEnabled},t.toggle=function(t){if(this._isEnabled)if(t){var e=this.constructor.DATA_KEY,n=g(t.currentTarget).data(e);n||(n=new this.constructor(t.currentTarget,this._getDelegateConfig()),g(t.currentTarget).data(e,n)),n._activeTrigger.click=!n._activeTrigger.click,n._isWithActiveTrigger()?n._enter(null,n):n._leave(null,n)}else{if(g(this.getTipElement()).hasClass(Fe))return void this._leave(null,this);this._enter(null,this)}},t.dispose=function(){clearTimeout(this._timeout),g.removeData(this.element,this.constructor.DATA_KEY),g(this.element).off(this.constructor.EVENT_KEY),g(this.element).closest(".modal").off("hide.bs.modal"),this.tip&&g(this.tip).remove(),this._isEnabled=null,this._timeout=null,this._hoverState=null,(this._activeTrigger=null)!==this._popper&&this._popper.destroy(),this._popper=null,this.element=null,this.config=null,this.tip=null},t.show=function(){var e=this;if("none"===g(this.element).css("display"))throw new Error("Please use show on visible elements");var t=g.Event(this.constructor.Event.SHOW);if(this.isWithContent()&&this._isEnabled){g(this.element).trigger(t);var n=_.findShadowRoot(this.element),i=g.contains(null!==n?n:this.element.ownerDocument.documentElement,this.element);if(t.isDefaultPrevented()||!i)return;var o=this.getTipElement(),r=_.getUID(this.constructor.NAME);o.setAttribute("id",r),this.element.setAttribute("aria-describedby",r),this.setContent(),this.config.animation&&g(o).addClass(xe);var s="function"==typeof this.config.placement?this.config.placement.call(this,o,this.element):this.config.placement,a=this._getAttachment(s);this.addAttachmentClass(a);var l=this._getContainer();g(o).data(this.constructor.DATA_KEY,this),g.contains(this.element.ownerDocument.documentElement,this.tip)||g(o).appendTo(l),g(this.element).trigger(this.constructor.Event.INSERTED),this._popper=new u(this.element,o,{placement:a,modifiers:{offset:this._getOffset(),flip:{behavior:this.config.fallbackPlacement},arrow:{element:We},preventOverflow:{boundariesElement:this.config.boundary}},onCreate:function(t){t.originalPlacement!==t.placement&&e._handlePopperPlacementChange(t)},onUpdate:function(t){return e._handlePopperPlacementChange(t)}}),g(o).addClass(Fe),"ontouchstart"in document.documentElement&&g(document.body).children().on("mouseover",null,g.noop);var c=function(){e.config.animation&&e._fixTransition();var t=e._hoverState;e._hoverState=null,g(e.element).trigger(e.constructor.Event.SHOWN),t===He&&e._leave(null,e)};if(g(this.tip).hasClass(xe)){var h=_.getTransitionDurationFromElement(this.tip);g(this.tip).one(_.TRANSITION_END,c).emulateTransitionEnd(h)}else c()}},t.hide=function(t){var e=this,n=this.getTipElement(),i=g.Event(this.constructor.Event.HIDE),o=function(){e._hoverState!==je&&n.parentNode&&n.parentNode.removeChild(n),e._cleanTipClass(),e.element.removeAttribute("aria-describedby"),g(e.element).trigger(e.constructor.Event.HIDDEN),null!==e._popper&&e._popper.destroy(),t&&t()};if(g(this.element).trigger(i),!i.isDefaultPrevented()){if(g(n).removeClass(Fe),"ontouchstart"in document.documentElement&&g(document.body).children().off("mouseover",null,g.noop),this._activeTrigger[Ke]=!1,this._activeTrigger[Me]=!1,this._activeTrigger[qe]=!1,g(this.tip).hasClass(xe)){var r=_.getTransitionDurationFromElement(n);g(n).one(_.TRANSITION_END,o).emulateTransitionEnd(r)}else o();this._hoverState=""}},t.update=function(){null!==this._popper&&this._popper.scheduleUpdate()},t.isWithContent=function(){return Boolean(this.getTitle())},t.addAttachmentClass=function(t){g(this.getTipElement()).addClass(Ae+"-"+t)},t.getTipElement=function(){return this.tip=this.tip||g(this.config.template)[0],this.tip},t.setContent=function(){var t=this.getTipElement();this.setElementContent(g(t.querySelectorAll(Ue)),this.getTitle()),g(t).removeClass(xe+" "+Fe)},t.setElementContent=function(t,e){"object"!=typeof e||!e.nodeType&&!e.jquery?this.config.html?(this.config.sanitize&&(e=Se(e,this.config.whiteList,this.config.sanitizeFn)),t.html(e)):t.text(e):this.config.html?g(e).parent().is(t)||t.empty().append(e):t.text(g(e).text())},t.getTitle=function(){var t=this.element.getAttribute("data-original-title");return t||(t="function"==typeof this.config.title?this.config.title.call(this.element):this.config.title),t},t._getOffset=function(){var e=this,t={};return"function"==typeof this.config.offset?t.fn=function(t){return t.offsets=l({},t.offsets,e.config.offset(t.offsets,e.element)||{}),t}:t.offset=this.config.offset,t},t._getContainer=function(){return!1===this.config.container?document.body:_.isElement(this.config.container)?g(this.config.container):g(document).find(this.config.container)},t._getAttachment=function(t){return Pe[t.toUpperCase()]},t._setListeners=function(){var i=this;this.config.trigger.split(" ").forEach(function(t){if("click"===t)g(i.element).on(i.constructor.Event.CLICK,i.config.selector,function(t){return i.toggle(t)});else if(t!==Qe){var e=t===qe?i.constructor.Event.MOUSEENTER:i.constructor.Event.FOCUSIN,n=t===qe?i.constructor.Event.MOUSELEAVE:i.constructor.Event.FOCUSOUT;g(i.element).on(e,i.config.selector,function(t){return i._enter(t)}).on(n,i.config.selector,function(t){return i._leave(t)})}}),g(this.element).closest(".modal").on("hide.bs.modal",function(){i.element&&i.hide()}),this.config.selector?this.config=l({},this.config,{trigger:"manual",selector:""}):this._fixTitle()},t._fixTitle=function(){var t=typeof this.element.getAttribute("data-original-title");(this.element.getAttribute("title")||"string"!==t)&&(this.element.setAttribute("data-original-title",this.element.getAttribute("title")||""),this.element.setAttribute("title",""))},t._enter=function(t,e){var n=this.constructor.DATA_KEY;(e=e||g(t.currentTarget).data(n))||(e=new this.constructor(t.currentTarget,this._getDelegateConfig()),g(t.currentTarget).data(n,e)),t&&(e._activeTrigger["focusin"===t.type?Me:qe]=!0),g(e.getTipElement()).hasClass(Fe)||e._hoverState===je?e._hoverState=je:(clearTimeout(e._timeout),e._hoverState=je,e.config.delay&&e.config.delay.show?e._timeout=setTimeout(function(){e._hoverState===je&&e.show()},e.config.delay.show):e.show())},t._leave=function(t,e){var n=this.constructor.DATA_KEY;(e=e||g(t.currentTarget).data(n))||(e=new this.constructor(t.currentTarget,this._getDelegateConfig()),g(t.currentTarget).data(n,e)),t&&(e._activeTrigger["focusout"===t.type?Me:qe]=!1),e._isWithActiveTrigger()||(clearTimeout(e._timeout),e._hoverState=He,e.config.delay&&e.config.delay.hide?e._timeout=setTimeout(function(){e._hoverState===He&&e.hide()},e.config.delay.hide):e.hide())},t._isWithActiveTrigger=function(){for(var t in this._activeTrigger)if(this._activeTrigger[t])return!0;return!1},t._getConfig=function(t){var e=g(this.element).data();return Object.keys(e).forEach(function(t){-1!==Oe.indexOf(t)&&delete e[t]}),"number"==typeof(t=l({},this.constructor.Default,e,"object"==typeof t&&t?t:{})).delay&&(t.delay={show:t.delay,hide:t.delay}),"number"==typeof t.title&&(t.title=t.title.toString()),"number"==typeof t.content&&(t.content=t.content.toString()),_.typeCheckConfig(be,t,this.constructor.DefaultType),t.sanitize&&(t.template=Se(t.template,t.whiteList,t.sanitizeFn)),t},t._getDelegateConfig=function(){var t={};if(this.config)for(var e in this.config)this.constructor.Default[e]!==this.config[e]&&(t[e]=this.config[e]);return t},t._cleanTipClass=function(){var t=g(this.getTipElement()),e=t.attr("class").match(Ne);null!==e&&e.length&&t.removeClass(e.join(""))},t._handlePopperPlacementChange=function(t){var e=t.instance;this.tip=e.popper,this._cleanTipClass(),this.addAttachmentClass(this._getAttachment(t.placement))},t._fixTransition=function(){var t=this.getTipElement(),e=this.config.animation;null===t.getAttribute("x-placement")&&(g(t).removeClass(xe),this.config.animation=!1,this.hide(),this.show(),this.config.animation=e)},i._jQueryInterface=function(n){return this.each(function(){var t=g(this).data(Ie),e="object"==typeof n&&n;if((t||!/dispose|hide/.test(n))&&(t||(t=new i(this,e),g(this).data(Ie,t)),"string"==typeof n)){if("undefined"==typeof t[n])throw new TypeError('No method named "'+n+'"');t[n]()}})},s(i,null,[{key:"VERSION",get:function(){return"4.3.1"}},{key:"Default",get:function(){return Le}},{key:"NAME",get:function(){return be}},{key:"DATA_KEY",get:function(){return Ie}},{key:"Event",get:function(){return Re}},{key:"EVENT_KEY",get:function(){return De}},{key:"DefaultType",get:function(){return ke}}]),i}();g.fn[be]=Be._jQueryInterface,g.fn[be].Constructor=Be,g.fn[be].noConflict=function(){return g.fn[be]=we,Be._jQueryInterface};var Ve="popover",Ye="bs.popover",ze="."+Ye,Xe=g.fn[Ve],$e="bs-popover",Ge=new RegExp("(^|\\s)"+$e+"\\S+","g"),Je=l({},Be.Default,{placement:"right",trigger:"click",content:"",template:'<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-header"></h3><div class="popover-body"></div></div>'}),Ze=l({},Be.DefaultType,{content:"(string|element|function)"}),tn="fade",en="show",nn=".popover-header",on=".popover-body",rn={HIDE:"hide"+ze,HIDDEN:"hidden"+ze,SHOW:"show"+ze,SHOWN:"shown"+ze,INSERTED:"inserted"+ze,CLICK:"click"+ze,FOCUSIN:"focusin"+ze,FOCUSOUT:"focusout"+ze,MOUSEENTER:"mouseenter"+ze,MOUSELEAVE:"mouseleave"+ze},sn=function(t){var e,n;function i(){return t.apply(this,arguments)||this}n=t,(e=i).prototype=Object.create(n.prototype),(e.prototype.constructor=e).__proto__=n;var o=i.prototype;return o.isWithContent=function(){return this.getTitle()||this._getContent()},o.addAttachmentClass=function(t){g(this.getTipElement()).addClass($e+"-"+t)},o.getTipElement=function(){return this.tip=this.tip||g(this.config.template)[0],this.tip},o.setContent=function(){var t=g(this.getTipElement());this.setElementContent(t.find(nn),this.getTitle());var e=this._getContent();"function"==typeof e&&(e=e.call(this.element)),this.setElementContent(t.find(on),e),t.removeClass(tn+" "+en)},o._getContent=function(){return this.element.getAttribute("data-content")||this.config.content},o._cleanTipClass=function(){var t=g(this.getTipElement()),e=t.attr("class").match(Ge);null!==e&&0<e.length&&t.removeClass(e.join(""))},i._jQueryInterface=function(n){return this.each(function(){var t=g(this).data(Ye),e="object"==typeof n?n:null;if((t||!/dispose|hide/.test(n))&&(t||(t=new i(this,e),g(this).data(Ye,t)),"string"==typeof n)){if("undefined"==typeof t[n])throw new TypeError('No method named "'+n+'"');t[n]()}})},s(i,null,[{key:"VERSION",get:function(){return"4.3.1"}},{key:"Default",get:function(){return Je}},{key:"NAME",get:function(){return Ve}},{key:"DATA_KEY",get:function(){return Ye}},{key:"Event",get:function(){return rn}},{key:"EVENT_KEY",get:function(){return ze}},{key:"DefaultType",get:function(){return Ze}}]),i}(Be);g.fn[Ve]=sn._jQueryInterface,g.fn[Ve].Constructor=sn,g.fn[Ve].noConflict=function(){return g.fn[Ve]=Xe,sn._jQueryInterface};var an="scrollspy",ln="bs.scrollspy",cn="."+ln,hn=g.fn[an],un={offset:10,method:"auto",target:""},fn={offset:"number",method:"string",target:"(string|element)"},dn={ACTIVATE:"activate"+cn,SCROLL:"scroll"+cn,LOAD_DATA_API:"load"+cn+".data-api"},gn="dropdown-item",_n="active",mn='[data-spy="scroll"]',pn=".nav, .list-group",vn=".nav-link",yn=".nav-item",En=".list-group-item",Cn=".dropdown",Tn=".dropdown-item",Sn=".dropdown-toggle",bn="offset",In="position",Dn=function(){function n(t,e){var n=this;this._element=t,this._scrollElement="BODY"===t.tagName?window:t,this._config=this._getConfig(e),this._selector=this._config.target+" "+vn+","+this._config.target+" "+En+","+this._config.target+" "+Tn,this._offsets=[],this._targets=[],this._activeTarget=null,this._scrollHeight=0,g(this._scrollElement).on(dn.SCROLL,function(t){return n._process(t)}),this.refresh(),this._process()}var t=n.prototype;return t.refresh=function(){var e=this,t=this._scrollElement===this._scrollElement.window?bn:In,o="auto"===this._config.method?t:this._config.method,r=o===In?this._getScrollTop():0;this._offsets=[],this._targets=[],this._scrollHeight=this._getScrollHeight(),[].slice.call(document.querySelectorAll(this._selector)).map(function(t){var e,n=_.getSelectorFromElement(t);if(n&&(e=document.querySelector(n)),e){var i=e.getBoundingClientRect();if(i.width||i.height)return[g(e)[o]().top+r,n]}return null}).filter(function(t){return t}).sort(function(t,e){return t[0]-e[0]}).forEach(function(t){e._offsets.push(t[0]),e._targets.push(t[1])})},t.dispose=function(){g.removeData(this._element,ln),g(this._scrollElement).off(cn),this._element=null,this._scrollElement=null,this._config=null,this._selector=null,this._offsets=null,this._targets=null,this._activeTarget=null,this._scrollHeight=null},t._getConfig=function(t){if("string"!=typeof(t=l({},un,"object"==typeof t&&t?t:{})).target){var e=g(t.target).attr("id");e||(e=_.getUID(an),g(t.target).attr("id",e)),t.target="#"+e}return _.typeCheckConfig(an,t,fn),t},t._getScrollTop=function(){return this._scrollElement===window?this._scrollElement.pageYOffset:this._scrollElement.scrollTop},t._getScrollHeight=function(){return this._scrollElement.scrollHeight||Math.max(document.body.scrollHeight,document.documentElement.scrollHeight)},t._getOffsetHeight=function(){return this._scrollElement===window?window.innerHeight:this._scrollElement.getBoundingClientRect().height},t._process=function(){var t=this._getScrollTop()+this._config.offset,e=this._getScrollHeight(),n=this._config.offset+e-this._getOffsetHeight();if(this._scrollHeight!==e&&this.refresh(),n<=t){var i=this._targets[this._targets.length-1];this._activeTarget!==i&&this._activate(i)}else{if(this._activeTarget&&t<this._offsets[0]&&0<this._offsets[0])return this._activeTarget=null,void this._clear();for(var o=this._offsets.length;o--;){this._activeTarget!==this._targets[o]&&t>=this._offsets[o]&&("undefined"==typeof this._offsets[o+1]||t<this._offsets[o+1])&&this._activate(this._targets[o])}}},t._activate=function(e){this._activeTarget=e,this._clear();var t=this._selector.split(",").map(function(t){return t+'[data-target="'+e+'"],'+t+'[href="'+e+'"]'}),n=g([].slice.call(document.querySelectorAll(t.join(","))));n.hasClass(gn)?(n.closest(Cn).find(Sn).addClass(_n),n.addClass(_n)):(n.addClass(_n),n.parents(pn).prev(vn+", "+En).addClass(_n),n.parents(pn).prev(yn).children(vn).addClass(_n)),g(this._scrollElement).trigger(dn.ACTIVATE,{relatedTarget:e})},t._clear=function(){[].slice.call(document.querySelectorAll(this._selector)).filter(function(t){return t.classList.contains(_n)}).forEach(function(t){return t.classList.remove(_n)})},n._jQueryInterface=function(e){return this.each(function(){var t=g(this).data(ln);if(t||(t=new n(this,"object"==typeof e&&e),g(this).data(ln,t)),"string"==typeof e){if("undefined"==typeof t[e])throw new TypeError('No method named "'+e+'"');t[e]()}})},s(n,null,[{key:"VERSION",get:function(){return"4.3.1"}},{key:"Default",get:function(){return un}}]),n}();g(window).on(dn.LOAD_DATA_API,function(){for(var t=[].slice.call(document.querySelectorAll(mn)),e=t.length;e--;){var n=g(t[e]);Dn._jQueryInterface.call(n,n.data())}}),g.fn[an]=Dn._jQueryInterface,g.fn[an].Constructor=Dn,g.fn[an].noConflict=function(){return g.fn[an]=hn,Dn._jQueryInterface};var wn="bs.tab",An="."+wn,Nn=g.fn.tab,On={HIDE:"hide"+An,HIDDEN:"hidden"+An,SHOW:"show"+An,SHOWN:"shown"+An,CLICK_DATA_API:"click"+An+".data-api"},kn="dropdown-menu",Pn="active",Ln="disabled",jn="fade",Hn="show",Rn=".dropdown",xn=".nav, .list-group",Fn=".active",Un="> li > .active",Wn='[data-toggle="tab"], [data-toggle="pill"], [data-toggle="list"]',qn=".dropdown-toggle",Mn="> .dropdown-menu .active",Kn=function(){function i(t){this._element=t}var t=i.prototype;return t.show=function(){var n=this;if(!(this._element.parentNode&&this._element.parentNode.nodeType===Node.ELEMENT_NODE&&g(this._element).hasClass(Pn)||g(this._element).hasClass(Ln))){var t,i,e=g(this._element).closest(xn)[0],o=_.getSelectorFromElement(this._element);if(e){var r="UL"===e.nodeName||"OL"===e.nodeName?Un:Fn;i=(i=g.makeArray(g(e).find(r)))[i.length-1]}var s=g.Event(On.HIDE,{relatedTarget:this._element}),a=g.Event(On.SHOW,{relatedTarget:i});if(i&&g(i).trigger(s),g(this._element).trigger(a),!a.isDefaultPrevented()&&!s.isDefaultPrevented()){o&&(t=document.querySelector(o)),this._activate(this._element,e);var l=function(){var t=g.Event(On.HIDDEN,{relatedTarget:n._element}),e=g.Event(On.SHOWN,{relatedTarget:i});g(i).trigger(t),g(n._element).trigger(e)};t?this._activate(t,t.parentNode,l):l()}}},t.dispose=function(){g.removeData(this._element,wn),this._element=null},t._activate=function(t,e,n){var i=this,o=(!e||"UL"!==e.nodeName&&"OL"!==e.nodeName?g(e).children(Fn):g(e).find(Un))[0],r=n&&o&&g(o).hasClass(jn),s=function(){return i._transitionComplete(t,o,n)};if(o&&r){var a=_.getTransitionDurationFromElement(o);g(o).removeClass(Hn).one(_.TRANSITION_END,s).emulateTransitionEnd(a)}else s()},t._transitionComplete=function(t,e,n){if(e){g(e).removeClass(Pn);var i=g(e.parentNode).find(Mn)[0];i&&g(i).removeClass(Pn),"tab"===e.getAttribute("role")&&e.setAttribute("aria-selected",!1)}if(g(t).addClass(Pn),"tab"===t.getAttribute("role")&&t.setAttribute("aria-selected",!0),_.reflow(t),t.classList.contains(jn)&&t.classList.add(Hn),t.parentNode&&g(t.parentNode).hasClass(kn)){var o=g(t).closest(Rn)[0];if(o){var r=[].slice.call(o.querySelectorAll(qn));g(r).addClass(Pn)}t.setAttribute("aria-expanded",!0)}n&&n()},i._jQueryInterface=function(n){return this.each(function(){var t=g(this),e=t.data(wn);if(e||(e=new i(this),t.data(wn,e)),"string"==typeof n){if("undefined"==typeof e[n])throw new TypeError('No method named "'+n+'"');e[n]()}})},s(i,null,[{key:"VERSION",get:function(){return"4.3.1"}}]),i}();g(document).on(On.CLICK_DATA_API,Wn,function(t){t.preventDefault(),Kn._jQueryInterface.call(g(this),"show")}),g.fn.tab=Kn._jQueryInterface,g.fn.tab.Constructor=Kn,g.fn.tab.noConflict=function(){return g.fn.tab=Nn,Kn._jQueryInterface};var Qn="toast",Bn="bs.toast",Vn="."+Bn,Yn=g.fn[Qn],zn={CLICK_DISMISS:"click.dismiss"+Vn,HIDE:"hide"+Vn,HIDDEN:"hidden"+Vn,SHOW:"show"+Vn,SHOWN:"shown"+Vn},Xn="fade",$n="hide",Gn="show",Jn="showing",Zn={animation:"boolean",autohide:"boolean",delay:"number"},ti={animation:!0,autohide:!0,delay:500},ei='[data-dismiss="toast"]',ni=function(){function i(t,e){this._element=t,this._config=this._getConfig(e),this._timeout=null,this._setListeners()}var t=i.prototype;return t.show=function(){var t=this;g(this._element).trigger(zn.SHOW),this._config.animation&&this._element.classList.add(Xn);var e=function(){t._element.classList.remove(Jn),t._element.classList.add(Gn),g(t._element).trigger(zn.SHOWN),t._config.autohide&&t.hide()};if(this._element.classList.remove($n),this._element.classList.add(Jn),this._config.animation){var n=_.getTransitionDurationFromElement(this._element);g(this._element).one(_.TRANSITION_END,e).emulateTransitionEnd(n)}else e()},t.hide=function(t){var e=this;this._element.classList.contains(Gn)&&(g(this._element).trigger(zn.HIDE),t?this._close():this._timeout=setTimeout(function(){e._close()},this._config.delay))},t.dispose=function(){clearTimeout(this._timeout),this._timeout=null,this._element.classList.contains(Gn)&&this._element.classList.remove(Gn),g(this._element).off(zn.CLICK_DISMISS),g.removeData(this._element,Bn),this._element=null,this._config=null},t._getConfig=function(t){return t=l({},ti,g(this._element).data(),"object"==typeof t&&t?t:{}),_.typeCheckConfig(Qn,t,this.constructor.DefaultType),t},t._setListeners=function(){var t=this;g(this._element).on(zn.CLICK_DISMISS,ei,function(){return t.hide(!0)})},t._close=function(){var t=this,e=function(){t._element.classList.add($n),g(t._element).trigger(zn.HIDDEN)};if(this._element.classList.remove(Gn),this._config.animation){var n=_.getTransitionDurationFromElement(this._element);g(this._element).one(_.TRANSITION_END,e).emulateTransitionEnd(n)}else e()},i._jQueryInterface=function(n){return this.each(function(){var t=g(this),e=t.data(Bn);if(e||(e=new i(this,"object"==typeof n&&n),t.data(Bn,e)),"string"==typeof n){if("undefined"==typeof e[n])throw new TypeError('No method named "'+n+'"');e[n](this)}})},s(i,null,[{key:"VERSION",get:function(){return"4.3.1"}},{key:"DefaultType",get:function(){return Zn}},{key:"Default",get:function(){return ti}}]),i}();g.fn[Qn]=ni._jQueryInterface,g.fn[Qn].Constructor=ni,g.fn[Qn].noConflict=function(){return g.fn[Qn]=Yn,ni._jQueryInterface},function(){if("undefined"==typeof g)throw new TypeError("Bootstrap's JavaScript requires jQuery. jQuery must be included before Bootstrap's JavaScript.");var t=g.fn.jquery.split(" ")[0].split(".");if(t[0]<2&&t[1]<9||1===t[0]&&9===t[1]&&t[2]<1||4<=t[0])throw new Error("Bootstrap's JavaScript requires at least jQuery v1.9.1 but less than v4.0.0")}(),t.Util=_,t.Alert=p,t.Button=P,t.Carousel=lt,t.Collapse=bt,t.Dropdown=Jt,t.Modal=ve,t.Popover=sn,t.Scrollspy=Dn,t.Tab=Kn,t.Toast=ni,t.Tooltip=Be,Object.defineProperty(t,"__esModule",{value:!0})});
//# sourceMappingURL=bootstrap.min.js.map
;!function(e,t){if("object"==typeof exports&&"object"==typeof module)module.exports=t();else if("function"==typeof define&&define.amd)define([],t);else{var n=t();for(var o in n)("object"==typeof exports?exports:e)[o]=n[o]}}(window,(function(){return function(e){var t={};function n(o){if(t[o])return t[o].exports;var i=t[o]={i:o,l:!1,exports:{}};return e[o].call(i.exports,i,i.exports,n),i.l=!0,i.exports}return n.m=e,n.c=t,n.d=function(e,t,o){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:o})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(n.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var i in e)n.d(o,i,function(t){return e[t]}.bind(null,i));return o},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="/",n(n.s=1)}([function(e,t){var n;n=function(){return this}();try{n=n||new Function("return this")()}catch(e){"object"==typeof window&&(n=window)}e.exports=n},function(e,t,n){n(2),e.exports=n(6)},function(e,t,n){(function(o,i){var r,a;function s(e){return(s="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}!function(o,i){"object"==s(t)&&void 0!==e?i():void 0===(a="function"==typeof(r=i)?r.call(t,n,t,e):r)||(e.exports=a)}(0,(function(){"use strict";function e(e){var t=this.constructor;return this.then((function(n){return t.resolve(e()).then((function(){return n}))}),(function(n){return t.resolve(e()).then((function(){return t.reject(n)}))}))}function t(){}function n(e){if(!(this instanceof n))throw new TypeError("Promises must be constructed via new");if("function"!=typeof e)throw new TypeError("not a function");this._state=0,this._handled=!1,this._value=void 0,this._deferreds=[],d(e,this)}function r(e,t){for(;3===e._state;)e=e._value;0!==e._state?(e._handled=!0,n._immediateFn((function(){var n=1===e._state?t.onFulfilled:t.onRejected;if(null!==n){var o;try{o=n(e._value)}catch(e){return void c(t.promise,e)}a(t.promise,o)}else(1===e._state?a:c)(t.promise,e._value)}))):e._deferreds.push(t)}function a(e,t){try{if(t===e)throw new TypeError("A promise cannot be resolved with itself.");if(t&&("object"==s(t)||"function"==typeof t)){var o=t.then;if(t instanceof n)return e._state=3,e._value=t,void l(e);if("function"==typeof o)return void d(function(e,t){return function(){e.apply(t,arguments)}}(o,t),e)}e._state=1,e._value=t,l(e)}catch(t){c(e,t)}}function c(e,t){e._state=2,e._value=t,l(e)}function l(e){2===e._state&&0===e._deferreds.length&&n._immediateFn((function(){e._handled||n._unhandledRejectionFn(e._value)}));for(var t=0,o=e._deferreds.length;o>t;t++)r(e,e._deferreds[t]);e._deferreds=null}function d(e,t){var n=!1;try{e((function(e){n||(n=!0,a(t,e))}),(function(e){n||(n=!0,c(t,e))}))}catch(e){if(n)return;n=!0,c(t,e)}}var u=setTimeout;n.prototype.catch=function(e){return this.then(null,e)},n.prototype.then=function(e,n){var o=new this.constructor(t);return r(this,new function(e,t,n){this.onFulfilled="function"==typeof e?e:null,this.onRejected="function"==typeof t?t:null,this.promise=n}(e,n,o)),o},n.prototype.finally=e,n.all=function(e){return new n((function(t,n){function o(e,a){try{if(a&&("object"==s(a)||"function"==typeof a)){var c=a.then;if("function"==typeof c)return void c.call(a,(function(t){o(e,t)}),n)}i[e]=a,0==--r&&t(i)}catch(e){n(e)}}if(!e||void 0===e.length)throw new TypeError("Promise.all accepts an array");var i=Array.prototype.slice.call(e);if(0===i.length)return t([]);for(var r=i.length,a=0;i.length>a;a++)o(a,i[a])}))},n.resolve=function(e){return e&&"object"==s(e)&&e.constructor===n?e:new n((function(t){t(e)}))},n.reject=function(e){return new n((function(t,n){n(e)}))},n.race=function(e){return new n((function(t,n){for(var o=0,i=e.length;i>o;o++)e[o].then(t,n)}))},n._immediateFn="function"==typeof o&&function(e){o(e)}||function(e){u(e,0)},n._unhandledRejectionFn=function(e){void 0!==console&&console&&console.warn("Possible Unhandled Promise Rejection:",e)};var f=function(){if("undefined"!=typeof self)return self;if("undefined"!=typeof window)return window;if(void 0!==i)return i;throw Error("unable to locate global object")}();"Promise"in f?f.Promise.prototype.finally||(f.Promise.prototype.finally=e):f.Promise=n}))}).call(this,n(3).setImmediate,n(0))},function(e,t,n){(function(e){var o=void 0!==e&&e||"undefined"!=typeof self&&self||window,i=Function.prototype.apply;function r(e,t){this._id=e,this._clearFn=t}t.setTimeout=function(){return new r(i.call(setTimeout,o,arguments),clearTimeout)},t.setInterval=function(){return new r(i.call(setInterval,o,arguments),clearInterval)},t.clearTimeout=t.clearInterval=function(e){e&&e.close()},r.prototype.unref=r.prototype.ref=function(){},r.prototype.close=function(){this._clearFn.call(o,this._id)},t.enroll=function(e,t){clearTimeout(e._idleTimeoutId),e._idleTimeout=t},t.unenroll=function(e){clearTimeout(e._idleTimeoutId),e._idleTimeout=-1},t._unrefActive=t.active=function(e){clearTimeout(e._idleTimeoutId);var t=e._idleTimeout;t>=0&&(e._idleTimeoutId=setTimeout((function(){e._onTimeout&&e._onTimeout()}),t))},n(4),t.setImmediate="undefined"!=typeof self&&self.setImmediate||void 0!==e&&e.setImmediate||this&&this.setImmediate,t.clearImmediate="undefined"!=typeof self&&self.clearImmediate||void 0!==e&&e.clearImmediate||this&&this.clearImmediate}).call(this,n(0))},function(e,t,n){(function(e,t){!function(e,n){"use strict";if(!e.setImmediate){var o,i,r,a,s,c=1,l={},d=!1,u=e.document,f=Object.getPrototypeOf&&Object.getPrototypeOf(e);f=f&&f.setTimeout?f:e,"[object process]"==={}.toString.call(e.process)?o=function(e){t.nextTick((function(){h(e)}))}:!function(){if(e.postMessage&&!e.importScripts){var t=!0,n=e.onmessage;return e.onmessage=function(){t=!1},e.postMessage("","*"),e.onmessage=n,t}}()?e.MessageChannel?((r=new MessageChannel).port1.onmessage=function(e){h(e.data)},o=function(e){r.port2.postMessage(e)}):u&&"onreadystatechange"in u.createElement("script")?(i=u.documentElement,o=function(e){var t=u.createElement("script");t.onreadystatechange=function(){h(e),t.onreadystatechange=null,i.removeChild(t),t=null},i.appendChild(t)}):o=function(e){setTimeout(h,0,e)}:(a="setImmediate$"+Math.random()+"$",s=function(t){t.source===e&&"string"==typeof t.data&&0===t.data.indexOf(a)&&h(+t.data.slice(a.length))},e.addEventListener?e.addEventListener("message",s,!1):e.attachEvent("onmessage",s),o=function(t){e.postMessage(a+t,"*")}),f.setImmediate=function(e){"function"!=typeof e&&(e=new Function(""+e));for(var t=new Array(arguments.length-1),n=0;n<t.length;n++)t[n]=arguments[n+1];var i={callback:e,args:t};return l[c]=i,o(c),c++},f.clearImmediate=p}function p(e){delete l[e]}function h(e){if(d)setTimeout(h,0,e);else{var t=l[e];if(t){d=!0;try{!function(e){var t=e.callback,n=e.args;switch(n.length){case 0:t();break;case 1:t(n[0]);break;case 2:t(n[0],n[1]);break;case 3:t(n[0],n[1],n[2]);break;default:t.apply(void 0,n)}}(t)}finally{p(e),d=!1}}}}}("undefined"==typeof self?void 0===e?this:e:self)}).call(this,n(0),n(5))},function(e,t){var n,o,i=e.exports={};function r(){throw new Error("setTimeout has not been defined")}function a(){throw new Error("clearTimeout has not been defined")}function s(e){if(n===setTimeout)return setTimeout(e,0);if((n===r||!n)&&setTimeout)return n=setTimeout,setTimeout(e,0);try{return n(e,0)}catch(t){try{return n.call(null,e,0)}catch(t){return n.call(this,e,0)}}}!function(){try{n="function"==typeof setTimeout?setTimeout:r}catch(e){n=r}try{o="function"==typeof clearTimeout?clearTimeout:a}catch(e){o=a}}();var c,l=[],d=!1,u=-1;function f(){d&&c&&(d=!1,c.length?l=c.concat(l):u=-1,l.length&&p())}function p(){if(!d){var e=s(f);d=!0;for(var t=l.length;t;){for(c=l,l=[];++u<t;)c&&c[u].run();u=-1,t=l.length}c=null,d=!1,function(e){if(o===clearTimeout)return clearTimeout(e);if((o===a||!o)&&clearTimeout)return o=clearTimeout,clearTimeout(e);try{o(e)}catch(t){try{return o.call(null,e)}catch(t){return o.call(this,e)}}}(e)}}function h(e,t){this.fun=e,this.array=t}function m(){}i.nextTick=function(e){var t=new Array(arguments.length-1);if(arguments.length>1)for(var n=1;n<arguments.length;n++)t[n-1]=arguments[n];l.push(new h(e,t)),1!==l.length||d||s(p)},h.prototype.run=function(){this.fun.apply(null,this.array)},i.title="browser",i.browser=!0,i.env={},i.argv=[],i.version="",i.versions={},i.on=m,i.addListener=m,i.once=m,i.off=m,i.removeListener=m,i.removeAllListeners=m,i.emit=m,i.prependListener=m,i.prependOnceListener=m,i.listeners=function(e){return[]},i.binding=function(e){throw new Error("process.binding is not supported")},i.cwd=function(){return"/"},i.chdir=function(e){throw new Error("process.chdir is not supported")},i.umask=function(){return 0}},function(e,t,n){"use strict";n.r(t),n.d(t,"getInstance",(function(){return w}));var o={ASM:"asm",WASM:"ems",JS_WORKER:"jsworker",THREADED_WASM:"wasm-threads"};function i(e,t){if("string"!=typeof e||!t)return e;var n=t.substr(0,t.lastIndexOf("/"));return/^(\/|%2F|[a-z0-9-]+:)/i.test(e)?e:n+"/"+e}function r(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);t&&(o=o.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,o)}return n}function a(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?r(Object(n),!0).forEach((function(t){s(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function s(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}var c={},l=0;window.isPdfjs=!0,"undefined"==typeof console&&(window.console={log:function(){},warn:function(){},error:function(){}});var d=function(){for(var e=1;e<arguments.length;e++)for(var t=Object.keys(arguments[e]),n=0;n<t.length;n++)arguments[0][t[n]]=arguments[e][t[n]];return arguments[0]},u=function(e){var t=[];return e.forEach((function(e){t.push(e)})),t},f=function(e,t){var n;try{n=new CustomEvent(e,{detail:t,bubbles:!0,cancelable:!0})}catch(o){(n=document.createEvent("Event")).initEvent(e,!0,!0),n.detail=t}return n};window.PDFNet&&!c.skipPDFNetWebViewerWarning&&console.warn("PDFNet.js and WebViewer.js have been included in the same context. See https://www.pdftron.com/kb_same_context for an explanation of why this could be an error in your application.");var p=new Map,h=new Map;c.WebViewer=function(e,t){var n=this;if(h.get(t))throw new Error("Two instances of WebViewer were created on the same HTML element. Please create a new element for each instance of WebViewer");h.set(t,!0);t.addEventListener("ready",(function e(){p.get(t).instance=n.getCompleteInstance(),t.removeEventListener("ready",e)})),this._validateOptions(e);var o=e.webviewerServerURL||e.pdftronServer;e.fullAPI&&o&&(e.forceClientSideInit||console.warn("The fullAPI and webviewerServerURL options have both been set so the forceClientSideInit option is now enabled. This means that WebViewer will switch to client side rendering and processing to allow use of the full API."),e.forceClientSideInit=!0),this.options=d({},c.WebViewer.Options,e);var i=this.options.path.length-1;i>0&&"/"!==this.options.path[i]&&(this.options.path+="/"),this.options.uiPath=this.options.path+this.options.uiPath,t||console.error("ViewerElement is not defined. This may be caused by calling the WebViewer constructor before the DOM is loaded, or an invalid selector. Please see http://r.pdftron.com/guides/quick-start for an example."),this.element=t,this.element.style.overflow="hidden";var r=this;this.messageHandler=function(t){if("requestl"===t.data&&t.source&&t.source.postMessage({type:"responsel",value:e.l||e.licenseKey},"*"),"requestConfig"===t.data.type&&t.data.id===r.id&&t.source){var n=e.config?r._correctRelativePath(e.config):"";t.source.postMessage({type:"responseConfig",value:n},"*")}},window.addEventListener("message",this.messageHandler,!1),this.options.autoCreate&&this.create()};var m={licenseKey:void 0,enableAzureWorkaround:!1,isAdminUser:!1,isReadOnly:!1};c.WebViewer.prototype={version:"8.7.2",create:function(){if(this.options.initialDoc){var e=this._correctRelativePath(this.options.initialDoc);e=encodeURIComponent(JSON.stringify(e)),this.options.initialDoc=e}this._create()},_create:function(){this.id=++l,void 0===this._trigger&&(this._trigger=function(e,t){var n=f(e,t);this.element.dispatchEvent(n)});var e=this.options.type.replace(" ","").split(",");e.length<1&&(e[0]="html5"),this._createViewer(e)},_validateOptions:function(e){for(var t=Object.keys(e),n=0;n<t.length;n++){var o=t[n];o in d({},m,c.WebViewer.Options)||console.warn("".concat(o," is not a valid option name. See http://r.pdftron.com/api/options_anchor for all available options."))}var i=e.webviewerServerURL||e.pdftronServer;!e.enableRedaction||e.fullAPI||i||console.warn("FullAPI or WebViewer Server is needed to apply redactions")},_notSupportedMobile:function(){var e=document.createElement("div");e.id="webviewer-browser-unsupported",e.textContent="PDF document viewing is not supported by this browser.",this.element.appendChild(e)},_createViewer:function(e){var t,n=this;if(n.selectedType=null,this.isMobileDevice()){if(this.options.documentType&&"xod"!==this.options.documentType&&!this._testWebAssembly())return void this._notSupportedMobile();if(e=Array("html5Mobile"),n.selectedType="html5Mobile",this.options.mobileRedirect)return t=this.options.uiPath+this._getHTML5OptionsURL(),void(window.location=t)}for(var o=!1,i=!1,r=0;r<e.length;r++){if("html5mobile"===e[r].toLowerCase()){if(this.options.documentType&&"xod"!==this.options.documentType&&!this._testWebAssembly())continue;if(o=!0,n._testHTML5()){if(this.options.mobileRedirect)return n.selectedType="html5Mobile",t=this.options.uiPath+this._getHTML5OptionsURL(),void(window.location=t);if(this.options.xdomainProxyUrl||n.isSameOrigin(decodeURIComponent(n.options.initialDoc))||n._testCORS()){n.selectedType="html5Mobile";break}i=!0}}if("html5"===e[r].toLowerCase()&&(o=!0,n._testHTML5())){var a=n.isSameOrigin(decodeURIComponent(n.options.initialDoc));if(this.options.xdomainProxyUrl||a||n._testCORS()){n.selectedType="html5";break}i=!0}}if("html5"===n.selectedType)n._createHTML5();else if("html5Mobile"===n.selectedType)n._createHTML5Mobile();else{var s;if(i?s="This browser does not support cross origin requests. Please configure xdomain to support CORS.":o&&(s="Please use an HTML5 compatible browser."),s){var c=document.createElement("div");c.id="webviewer-browser-unsupported",c.textContent=s,n.element.appendChild(c)}}},_viewerLoaded:function(e){this._trigger("ready");try{var t=e.contentWindow;if(t.postMessage({type:"viewerLoaded"},"*"),void 0!==this.options.encryption){var n=decodeURIComponent(this.options.initialDoc);this.options.initialDoc&&(n=JSON.parse(n));var o={decrypt:t.Core.Encryption.decrypt,decryptOptions:this.options.encryption,documentId:this.options.documentId,extension:"xod"};this.getInstance().loadDocument(n,o)}}catch(e){console.warn("Viewer is on a different domain, the promise from WebViewer function is rejected and API functions will not work because of cross domain permissions. See http://r.pdftron.com/kb_cross_origin for more information.")}},_getHTML5OptionsURL:function(){var e,t,n,o=this.options,i=o.webviewerServerURL||o.pdftronServer,r="";if(o.initialDoc&&(r+="#d=".concat(o.initialDoc)),void 0===o.backendType&&(o.backendType=o.pdfBackend),o.documentType&&"xod"===o.documentType&&(e=o.documentType),o.preloadWorker&&"xod"===o.preloadWorker&&(e=o.preloadWorker),o.extension&&(e=o.extension),e&&(r+="&extension=".concat(e)),o.documentType&&"xod"!==o.documentType&&(t=o.documentType),o.preloadWorker&&"xod"!==o.preloadWorker&&(t=o.preloadWorker),t&&(r+="&preloadWorker=".concat(t)),o.backendType&&(r+="&pdf=".concat(o.backendType,"&office=").concat(o.backendType,"&legacyOffice=").concat(o.backendType)),o.filename&&(r+="&filename=".concat(o.filename)),void 0!==o.streaming&&(r+="&streaming=".concat(o.streaming)),o.externalPath){var a=this._correctRelativePath(o.externalPath);a=encodeURIComponent(a),r+="&p=".concat(a)}if(o.encryption&&(r+="&auto_load=false"),o.enableAnnotations&&(r+="&a=1"),o.disabledElements){var s=encodeURIComponent(o.disabledElements.join(","));r+="&disabledElements=".concat(s)}if(o.serverUrl){var c=this._correctRelativePath(o.serverUrl);c=encodeURIComponent(c),r+="&server_url=".concat(c)}if(o.serverUrlHeaders&&(r+="&serverUrlHeaders=".concat(JSON.stringify(o.serverUrlHeaders))),o.documentId&&(r+="&did=".concat(o.documentId)),o.css){var l=this._correctRelativePath(o.css);l=encodeURIComponent(l),r+="&css=".concat(l)}if(o.disableI18n&&(r+="&disableI18n=1"),o.enableOfflineMode&&(r+="&offline=1"),o.startOffline&&(r+="&startOffline=1"),(o.enableReadOnlyMode||o.isReadOnly)&&(r+="&readonly=1"),o.hideAnnotationPanel&&(r+="&hideAnnotationPanel=1"),o.disableToolGroupReordering&&(r+="&disableToolGroupReordering=1"),void 0!==o.annotationUser&&(r+="&user=".concat(o.annotationUser)),void 0===o.annotationAdmin&&void 0===o.isAdminUser||(r+="&admin=".concat(o.annotationAdmin||o.isAdminUser?1:0)),void 0!==o.custom&&(r+="&custom=".concat(encodeURIComponent(o.custom))),void 0===o.showLocalFilePicker&&void 0===o.enableFilePicker||(r+="&filepicker=".concat(o.showLocalFilePicker||o.enableFilePicker?1:0)),void 0!==o.fullAPI){if(o.fullAPI)throw new Error('"fullAPI" is not a valid constuctor option for PDF.js Express. Please make sure you are referring to the proper documentation (https://pdfjs.express/documentation)');r+="&pdfnet=".concat(o.fullAPI?1:0)}(void 0!==o.enableRedaction&&(r+="&enableRedaction=".concat(o.enableRedaction?1:0)),void 0!==o.disableVirtualDisplayMode&&(r+="&disableVirtualDisplayMode=".concat(o.disableVirtualDisplayMode?1:0)),void 0!==o.enableMeasurement&&(r+="&enableMeasurement=".concat(o.enableMeasurement?1:0)),void 0!==o.showToolbarControl&&(r+="&toolbar=".concat(o.showToolbarControl?"true":"false")),void 0!==o.showPageHistoryButtons&&(r+="&pageHistory=".concat(o.showPageHistoryButtons?1:0)),void 0!==o.notesInLeftPanel&&(r+="&notesInLeftPanel=".concat(o.notesInLeftPanel?1:0)),void 0!==o.xdomainProxyUrl)&&(n="string"==typeof o.xdomainProxyUrl?{url:o.xdomainProxyUrl}:o.xdomainProxyUrl,r+="&xdomain_urls=".concat(encodeURIComponent(JSON.stringify(n))));return(o.azureWorkaround||o.enableAzureWorkaround)&&(r+="&azureWorkaround=1"),o.enableOptimizedWorkers||(r+="&enableOptimizedWorkers=0"),o.useDownloader||(r+="&useDownloader=0"),o.disableWebsockets&&(r+="&disableWebsockets=1"),o.disableStreaming&&(r+="&disableStreaming=1"),o.forceClientSideInit&&(r+="&forceClientSideInit=1"),o.loadAsPDF&&(r+="&loadAsPDF=1"),void 0!==o.workerTransportPromise&&(r+="&useSharedWorker=".concat(o.workerTransportPromise?"true":"false")),void 0!==i&&i&&(r+="&webviewerServerURL=".concat(encodeURIComponent(i))),o.fallbackToClientSide&&(r+="&fallbackToClientSide=1"),void 0!==o.singleServerMode&&(r+="&singleServerMode=".concat(o.singleServerMode?"true":"false")),void 0!==o.accessibleMode&&(r+="&accessibleMode=".concat(o.accessibleMode?1:0)),o.disableLogs&&(r+="&disableLogs=1"),o.enableViewStateAnnotations&&(r+="&enableViewStateAnnotations=1"),o.disableFlattenedAnnotations&&(r+="&disableFlattenedAnnotations=1"),o.highContrastMode&&(r+="&highContrastMode=1"),void 0!==o.selectAnnotationOnCreation&&(r+="&selectAnnotationOnCreation=".concat(o.selectAnnotationOnCreation?1:0)),void 0!==o.autoFocusNoteOnAnnotationSelection&&(r+="&autoFocusNoteOnAnnotationSelection=".concat(o.autoFocusNoteOnAnnotationSelection?1:0)),r+="&id=".concat(this.id),(r+="&basePath=".concat(encodeURIComponent(window.location.pathname))).length>0&&"&"===r[0]&&(r="#".concat(r.slice(1))),r+="&webViewerJSVersion=".concat(this.version)},setInstanceData:function(e){p.set(this.element,{iframe:e,l:this.options.l||this.options.licenseKey,workerTransportPromise:this.options.workerTransportPromise})},_createHTML5:function(){var e=this,t=this.options.uiPath+this._getHTML5OptionsURL(),n=document.createElement("iframe");this.setInstanceData(n),n.id="webviewer-".concat(this.id),n.src=t,n.title="webviewer",n.frameBorder=0,n.width="100%",n.height="100%",n.setAttribute("allowfullscreen",!0),n.setAttribute("webkitallowfullscreen",!0),n.setAttribute("mozallowfullscreen",!0),this.iframe=n,this.options.backgroundColor&&n.setAttribute("data-bgcolor",this.options.backgroundColor),this.options.assetPath&&n.setAttribute("data-assetpath",encodeURIComponent(this.options.assetPath)),this.element.appendChild(n);window.addEventListener("message",(function t(n){if("viewerLoaded"===n.data.type&&n.data.id===e.id)try{e.instance=e.iframe.contentWindow.instance}catch(e){}finally{window.removeEventListener("message",t),e._viewerLoaded(e.iframe)}}))},_createHTML5Mobile:function(){var e=this,t=this.options.uiPath+this._getHTML5OptionsURL(),n=document.createElement("iframe");this.setInstanceData(n),n.id="webviewer-".concat(this.id),n.src=t,n.frameborder=0,this.options.assetPath&&n.setAttribute("data-assetpath",encodeURIComponent(this.options.assetPath)),n.style.width="100%",n.style.height="100%",this.iframe=n,this.element.appendChild(n);window.addEventListener("message",(function t(n){if("viewerLoaded"===n.data.type&&n.data.id===e.id)try{e.instance=e.iframe.contentWindow.instance}catch(e){}finally{window.removeEventListener("message",t),e._viewerLoaded(e.iframe)}}))},dispose:function(){p.delete(this.element),h.delete(this.element),this.instance.closeDocument(),window.removeEventListener("message",this.messageHandler),this.iframe.removeEventListener("load",this.loadListener),this.iframe=null},getInstance:function(){return this.instance},setCompleteInstance:function(e){this.completeInstance=e},getCompleteInstance:function(){return this.completeInstance},_correctRelativePath:function(e){var t=window.location.pathname;return Array.isArray(e)?e.map((function(e){return i(e,t)})):i(e,t)},_testHTML5:function(){try{var e=document.createElement("canvas");return e&&e.getContext("2d")}catch(e){return!1}},_testWebAssembly:function(){return!(!window.WebAssembly||!window.WebAssembly.validate)},_testCORS:function(){return"XMLHttpRequest"in window&&"withCredentials"in new XMLHttpRequest},isIE:function(){var e=navigator.userAgent.toLowerCase(),t=/(msie) ([\w.]+)/.exec(e)||/(trident)(?:.*? rv:([\w.]+)|)/.exec(e);return t?parseInt(t[2],10):t},isMobileDevice:function(){return!this.isIE()&&(0===this.scrollbarWidth()&&navigator.userAgent.match(/Edge/i)||navigator.userAgent.match(/Android/i)||navigator.userAgent.match(/webOS/i)||navigator.userAgent.match(/iPhone/i)||navigator.userAgent.match(/iPod/i)||navigator.userAgent.match(/iPad/i)||navigator.userAgent.match(/Touch/i)||navigator.userAgent.match(/IEMobile/i)||navigator.userAgent.match(/Silk/i))},scrollbarWidth:function(){var e=document.createElement("div");e.style.cssText="width:100px;height:100px;overflow:scroll !important;position:absolute;top:-9999px",document.body.appendChild(e);var t=e.offsetWidth-e.clientWidth;return document.body.removeChild(e),t},isSameOrigin:function(e){var t=window.location,n=document.createElement("a");n.href=e,""===n.host&&(n.href=n.href);var o=window.location.port,i=n.port;return"http:"===n.protocol?(i=i||"80",o=o||"80"):"https:"===n.protocol&&(i=i||"443",o=o||"443"),n.hostname===t.hostname&&n.protocol===t.protocol&&i===o}},c.WebViewer.Options={initialDoc:void 0,annotationAdmin:void 0,isAdminUser:void 0,annotationUser:void 0,assetPath:void 0,autoCreate:!0,autoFocusNoteOnAnnotationSelection:!0,azureWorkaround:!1,additionalTranslations:void 0,enableAzureWorkaround:!1,enableOptimizedWorkers:!0,backgroundColor:void 0,backendType:void 0,css:void 0,config:void 0,custom:void 0,documentId:void 0,documentType:void 0,preloadWorker:void 0,extension:void 0,enableAnnotations:!0,filename:void 0,disableI18n:!1,disabledElements:void 0,disableWebsockets:!1,enableOfflineMode:!1,enableReadOnlyMode:!1,isReadOnly:!1,enableRedaction:!1,disableVirtualDisplayMode:!1,enableMeasurement:!1,encryption:void 0,externalPath:void 0,hideAnnotationPanel:!1,disableToolGroupReordering:!1,uiPath:"./ui/index.html",l:void 0,licenseKey:void 0,mobileRedirect:!1,path:"",pdfBackend:void 0,webviewerServerURL:void 0,fallbackToClientSide:!1,singleServerMode:!1,fullAPI:!1,preloadPDFWorker:!0,serverUrl:void 0,serverUrlHeaders:void 0,showLocalFilePicker:!1,enableFilePicker:!1,showPageHistoryButtons:!0,showToolbarControl:void 0,startOffline:!1,streaming:void 0,type:"html5",useDownloader:!0,workerTransportPromise:void 0,xdomainProxyUrl:void 0,ui:void 0,forceClientSideInit:!1,loadAsPDF:!1,accessibleMode:void 0,disableLogs:!1,enableViewStateAnnotations:!1,highContrastMode:!1,selectAnnotationOnCreation:!1,notesInLeftPanel:!1,documentXFDFRetriever:void 0,disableFlattenedAnnotations:!1,disableStreaming:!1};var v=function(e,t){return new Promise((function(n,o){e.l=e.l||e.licenseKey,e.azureWorkaround=e.azureWorkaround||e.enableAzureWorkaround,e.annotationAdmin=e.annotationAdmin||e.isAdminUser,e.enableReadOnlyMode=e.enableReadOnlyMode||e.isReadOnly,e.showLocalFilePicker=e.showLocalFilePicker||e.enableFilePicker;t.addEventListener("ready",(function r(){t.removeEventListener("ready",r);try{var c=t.querySelector("iframe").contentWindow;if(void 0===c.Tools)throw new Error("Viewer isn't instantiated correctly. It could be caused by the 'path' option in the WebViewer constructor not being defined correctly. The 'path' option should be relative to the HTML file you're loading the script on and the lib folder needs to be publicly accessible.");var l=i.getInstance(),u={iframeWindow:c,dispose:i.dispose.bind(i)},f=d({},l,a(s({},l.UI_NAMESPACE_KEY,a(a({},l[l.UI_NAMESPACE_KEY]),u)),u));i.setCompleteInstance(f);var p=Promise.resolve();if(e.documentXFDFRetriever&&(p=f[l.CORE_NAMESPACE_KEY].documentViewer.setDocumentXFDFRetriever(e.documentXFDFRetriever)),e.additionalTranslations){var h=e.additionalTranslations;f[l.UI_NAMESPACE_KEY].setTranslations(h.language,h.translations)}p.then((function(){n(f)}))}catch(t){if("config"in e&&""!==e.config)return n();o("Viewer is on a different domain, the promise from WebViewer function is rejected and API functions will not work because of cross domain permissions. See https://www.pdftron.com/kb_cross_origin for more information.")}}));var i=new c.WebViewer(e,t)}))},b=function(e){for(var t=u(p),n=0;n<t.length;n++){var o=t[n];if(o.iframe===e)return o}return null};v.l=function(e){var t=b(e);return t&&t.l},v.workerTransportPromise=function(e){var t=b(e);return t&&t.workerTransportPromise},v.WorkerTypes={ALL:"all",OFFICE:"office",LEGACY_OFFICE:"legacyOffice",PDF:"pdf",CONTENT_EDIT:"contentEdit"},v.BackendTypes=o;var w=function(e){var t=u(p);if(!t.length||!t.filter((function(e){return e.instance})).length)return console.warn("WebViewer.getInstance() was called before any instances were available"),null;if(t.length>1&&!e)throw new Error("More than one instance of WebViewer was found, and no element was passed into getInstance(). Please specify which instance you want to get.");return e?(p.get(e)||{}).instance:(t[0]||{}).instance};v.getInstance=w,window.WebViewer=v;t.default=v}])}));
;