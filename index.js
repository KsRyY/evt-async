const EventEmitter = require('eventemitter2');
//const validate = require('aproba');
/**
 * @param {function} fn The function that you want to execute
 * @param {array} fnArgs The argument array that you want to pass to your fn
 * @returns {Object} An object that contains `event`(An instance of eventemitter2 that you can set custom listeners), `task`(The `fn` parameter), `args`(The `fnArgs` parameter) and `execute`(A function to run your task and emit the listeners)
 */
module.exports = (fn, fnArgs = []) => {
	//validate('FAB',fn,fnArgs,verboseMemoryLeak);
	var event = new EventEmitter();
	event.setMaxListeners(0);
	/**
	 * @param {function} onResolvedHandler The event handler that will be emitted once when the task returns a value(resolved status in Promises), needs a parameter that recieves the returned value
	 * @param {function} onRejectedHandler The event handler that will be emitted once when the task throws an error(rejected status in Promises), needs a parameter that recieves the throwed error instance
	 */
	var execute = function(onResolvedHandler, onRejectedHandler) {
		//validate('FF', onResolvedHandler, onRejectedHandler);
		if(!!onRejectedHandler) {
			this.event.on('rejected', onRejectedHandler);
		}
		if(!!onResolvedHandler) {
			this.event.on('resolved', onResolvedHandler);
		}
		try {
			this.event.emit('resolved', this.task.apply(this.event,this.args));
		} catch (e) {
			this.event.emit('rejected', e);
		}
	};
	var returnObj = {
		event: event,
		exec: execute,
		task: fn,
		args: fnArgs
	};
	return returnObj;
};

module.exports.promiseLike = function(fn,fnArgs) {
	var event = new EventEmitter();
	event.setMaxListeners(0);
	/**
	 * 
	 * @param {function} onResolvedHandler The event handler that will be emitted once when the task returns a value(resolved status in Promises), needs a parameter that recieves the returned value
	 * @param {function} onRejectedHandler The event handler that will be emitted once when the task throws an error(rejected status in Promises), needs a parameter that recieves the throwed error instance
	 */
	var then = function(onResolvedHandler, onRejectedHandler) {
		//validate('FF', onResolvedHandler, onRejectedHandler);
		if(!!onResolvedHandler) {
			this.event.on('resolved', onResolvedHandler);
		} else {
			throw new Error('ENORESHANDL: Resolved handler not set');
		}
		if(!!onRejectedHandler) {
			this.event.on('rejected', onRejectedHandler);
		} else {
			return;
		}
		this.task.apply(this.event,this.args);
	};
	var error = function(onRejectedHandler) {
		if(!!onRejectedHandler) {
			this.event.on('rejected', onRejectedHandler);
		} else {
			throw new Error('ENOREJHANDL: Rejected handler not set');
		}
		this.task.apply(this.event,this.args);
	}
	var returnObj = {
		event: event,
		then: then,
		task: fn,
		args: fnArgs,
		'catch': error
	};
	return returnObj;
};

module.exports.promise = function(fn,fnArgs) {
	var event = new EventEmitter();
	event.setMaxListeners(0);
	/**
	 * 
	 * @param {function} onResolvedHandler The event handler that will be emitted once when the task returns a value(resolved status in Promises), needs a parameter that recieves the returned value
	 * @param {function} onRejectedHandler The event handler that will be emitted once when the task throws an error(rejected status in Promises), needs a parameter that recieves the throwed error instance
	 */
	var rejected = function(value) {
		this.event.emit('rejected',value);
	};
	var resolved = function(value) {
		this.event.emit('resolved',value);
	};
	var then = function(onResolvedHandler, onRejectedHandler) {
		//validate('FF', onResolvedHandler, onRejectedHandler);
		if(!!onResolvedHandler) {
			this.event.once('resolved', onResolvedHandler);
		} else {
			throw new Error('ENORESHANDL: Resolved handler not set');
		}
		if(!!onRejectedHandler) {
			this.event.once('rejected', onRejectedHandler);
		} else {
			return;
		}
		this.task.apply(this.event,[resolved,rejected].concat(this.args));
	};
	var error = function(onRejectedHandler) {
		if(!!onRejectedHandler) {
			this.event.on('rejected', onRejectedHandler);
		} else {
			throw new Error('ENOREJHANDL: Rejected handler not set');
		}
		this.task.apply(this.event,[resolved,rejected].concat(this.args));
	}
	var returnObj = {
		event: event,
		then: then,
		task: fn,
		args: fnArgs,
		'catch': error
	};
	return returnObj;
};
