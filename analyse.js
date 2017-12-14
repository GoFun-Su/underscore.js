(function() {
       	//self 指窗口本身，对窗口自身的只读引用,它返回的对象跟window对象是一模一样的。
        	//在Node.js中全局对象表示global对象
    var root = typeof self == 'object' && self.self === self && self ||
            	typeof global == 'object' && global.global === global && global ||
            	this ||  {};

    var previousUnderscore = root._;

    // 缓存原型对象
    //Array.prototype: Array 构造函数的原型
    //Object.prototype: Object 的原型对象
    //ES6 新的原始数据类型Symbol，表示独一无二的值
  	var ArrayProto = Array.prototype, ObjProto = Object.prototype;
  	var SymbolProto = typeof Symbol !== 'undefined' ? Symbol.prototype : null;

  	// 缓存原型对象上的一些方法
  	//hasOwnProperty() 方法会返回一个布尔值，
  	//指示对象是否具有指定的属性作为自身（不继承）属性。
  	//参数是字符串 名称或者 Symbol。
  	var push = ArrayProto.push,
      	slice = ArrayProto.slice,
      	toString = ObjProto.toString,
      	hasOwnProperty = ObjProto.hasOwnProperty;

    // **ECMAScript 5** 方法
    // Array.isArray() 用于确定传递的值是否是一个 Array。
    //Array.prototype instanceof Array false
    //[] instanceof Array   true
    //Array.isArray([])    true
    //Array.isArray(Array.prototype)   true ;
    //Array.prototype 本身也是一个 Array,Array.prototype.length = 0;

    var nativeIsArray = Array.isArray,
            	nativeKeys = Object.keys,
            	nativeCreate = Object.create;

          
    var Ctor = function(){};

    //创建一个 函数，参数是obj,如果obj是_的实例，返回obj,
    //对于第二行，类似于
    //var Person = function(name){console.log(this)}
    //var person =  new Person("人名")
    //要创建 Person 的新实例,使用 new 操作符。以此方式调用构造函数经历 4
	  //个步骤：(1) 创建一个新对象；
	  //(2) 将构造函数的作用域赋给新对象（因此 this 就指向了这个新对象）；
	  //(3) 执行构造函数中的代码（为这个新对象添加属性）；
	  //(4) 返回新对象。
	  //所以如果_创建实例，this指向实例,如果_this仅仅是普通的函数，this指向window
            
    var _ = function(obj) {
          if (obj instanceof _) return obj;
          if (!(this instanceof _)) return new _(obj);
            	this._wrapped = obj;
      	  };

      	// 针对不同的宿主环境, 将Undersocre的命名变量存放到不同的对象中
  	if (typeof exports != 'undefined' && !exports.nodeType) {// Node.js环境
    		if (typeof module != 'undefined' && !module.nodeType && module.exports) {
      			exports = module.exports = _;
    		}
    		exports._ = _;
  	} else {
    		    
    		    ._ = _;
  	}

  	// 当前版本
  	_.VERSION = '1.8.3';

  	// void其实是一个函数，接受一个参数，void 0  || void (0)  || void "hello"  ||void (函数名())  返回值永远是undefined
    //使用void 0比使用undefined能够减少3个字节,但是可读性不强
    //undefined 并不是保留词，它只是全局对象的一个属性，在低版本 IE 中能被重写	
    //undefined 在 ES5 中已经是全局对象的一个只读属性了，它不能被重写。但是在局部作用域中，还是可以被重写的
    //func函数，context上下文，argCount=个数
    //apply：参数是一个数组argArray，call：参数列表形式
    //var cb = optimizeCb(name,undefined,null);调用，返回return function(){...}
    //cb(arguments参数:value,index,collection等等) 调用
    var optimizeCb = function(func, context, argCount) {
   	 	if (context === void 0) return func;
             //如果函数的上下文环境指向window,返回函数，
             //根据argCount数值的不同，返回不同的函数，参数的个数不一样
    		switch (argCount) {
      			case 1: return function(value) {
        					return func.call(context, value);
      				};                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
     		 	
      			case null:
      			case 3: return function(value, index, collection) {
        					return func.call(context, value, index, collection);
      				};
      			case 4: return function(accumulator, value, index, collection) {
        					return func.call(context, accumulator, value, index, collection);
      				};
    		}
    		return function() {
      			return func.apply(context, arguments);
    		};
  	};

    var builtinIteratee;

    //一个内部函数结果返回回调函数应用于每一个元素
    var cb = function(value, context, argCount) {
        if (_.iteratee !== builtinIteratee) return _.iteratee(value, context);
        if (value == null) return _.identity;
        if (_.isFunction(value)) return optimizeCb(value, context, argCount);
        if (_.isObject(value) && !_.isArray(value)) return _.matcher(value);
        return _.property(value);
    };

    _.iteratee = builtinIteratee = function(value, context) {
        return cb(value, context, Infinity);
    };

    var restArgs = function(func, startIndex) {
        // startIndex=+startIndex;+代表取正,
        startIndex = startIndex == null ? func.length - 1 : +startIndex;
        return function() {
            var length = Math.max(arguments.length - startIndex, 0),
            //生成一个数组，长度为length
            rest = Array(length),
            index = 0;
            for (; index < length; index++) {
              rest[index] = arguments[index + startIndex];
            }
            switch (startIndex) {
                case 0: return func.call(this, rest);
                case 1: return func.call(this, arguments[0], rest);
                case 2: return func.call(this, arguments[0], arguments[1], rest);
            }
            var args = Array(startIndex + 1);
                for (index = 0; index < startIndex; index++) {
                args[index] = arguments[index];
            }
            args[startIndex] = rest;
            return func.apply(this, args);
        };
    };
    // An internal function for creating a new object that inherits from another.
    var baseCreate = function(prototype) {
        // 如果 prototype 参数不是对象
        if (!_.isObject(prototype)) return {};
        // Object.create(proto [, propertiesObject ]) 是E5中新的对象创建方式，第一个参数是要继承的原型，
        //可以传一个null，第二个参数是对象的属性描述
        if (nativeCreate) return nativeCreate(prototype);
        //原型继承
        Ctor.prototype = prototype;
        var result = new Ctor;
        Ctor.prototype = null;
        return result;
    };


    var shallowProperty = function(key) {
       return function(obj) {
          return obj == null ? void 0 : obj[key];
        };
    };

    //深层搜索子节点deepGet({"一级":{"二级":{"三级":"name"}}},['一级',"二级","三级"])
    var deepGet = function(obj, path) {
       var length = path.length;
       for (var i = 0; i < length; i++) {
            if (obj == null) return void 0;
            obj = obj[path[i]];
        }
        return length ? obj : void 0;
    };

    // Math.pow(2, 53) - 1 是 JavaScript 中能精确表示的最大数字
    var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
    //shallowProperty函数穿入一个参数，返回一个函数，这个函数用到参数key,
    //所以对于闭包来说，key不会立即消失，因为存在引用
    //getLength --->function(obj) {return obj == null ? void 0 : obj[key];};
    //getLength(collection)获取数组的length属性
    var getLength = shallowProperty('length');
    //判断是不是含有length属性，并且number类型
    //可以是数组，可以是类数组，或者含有length属性的对象,或者是字符串
    //或者函数（函数自身的length,它是只读特性，返回的是函数需要的实参的数目)
    var isArrayLike = function(collection) {
      var length = getLength(collection);
      return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
    };



    // _.each([1,2,3],function iteratee(value,key,list){console.log(value*3)})
    //iteratee是一个函数，注意不是_.iteratee函数函数有三个参数，[value,索引或者key,数组或者对象],
    //context修改iteratee函数this指向
    /// 返回 obj 参数,供链式调用 https://www.cnblogs.com/kyo4311/p/5153314.html
    _.each = _.forEach = function(obj, iteratee, context) {
        iteratee = optimizeCb(iteratee, context);
        var i, length;
        if (isArrayLike(obj)) {//类数组
            for (i = 0, length = obj.length; i < length; i++) {
                iteratee(obj[i], i, obj);
            }
        }else {//对象
            var keys = _.keys(obj);
            for (i = 0, length = keys.length; i < length; i++) {
                iteratee(obj[keys[i]], keys[i], obj);
            }
        }
        return obj;
    };

    // 两个函数的核心区别是 是否返回计算结果---results。
    _.map = _.collect = function(obj, iteratee, context) {
       //根据不同的iteratee类型，执行不同的函数，如果iteratee是函数的时候，和_.each是一样的
       //iteratee = optimizeCb(value, context, argCount)
        iteratee = cb(iteratee, context);
        //不是类数组是对象的话，将对象的key存入keys数组里面
         var keys = !isArrayLike(obj) && _.keys(obj),
        //key存在的情况下，是对象获取keys数组的length,否则是数组，获取数组的长度
        length = (keys || obj).length,
        //长度为length的数组
        results = Array(length);
        for (var index = 0; index < length; index++) {
          //对象为key,数组为索引
          var currentKey = keys ? keys[index] : index;
          results[index] = iteratee(obj[currentKey], currentKey, obj);
        }
        //返回最后的结果
        return results;
    };


    var createReduce = function(dir) {
        var reducer = function(obj, iteratee, memo, initial) {
            //initial为布尔值
            //如果不是类数组，是对象的话，获取key组成的数组
            var keys = !isArrayLike(obj) && _.keys(obj),
            //长度(类数组的长度或者对象的key的长度)
            length = (keys || obj).length,
            //判断dir为1或者-1，为1的时候index为0，为-1的时候index为长度-1；(类似搜索是从上搜索还是从下搜索？)
            index = dir > 0 ? 0 : length - 1;
            //如果initial为false
            if (!initial) {
                //获取当前索引值或者键值
                memo = obj[keys ? keys[index] : index];
                //索引值加上dir(即是加一或者减一)，dir为1的时候是向下搜索，即是索引值加一，dir为-1
                //的时候向上，即是减一
                index += dir;
            }
            //依次循环
            for (; index >= 0 && index < length; index += dir) {
                var currentKey = keys ? keys[index] : index;
                memo = iteratee(memo, obj[currentKey], currentKey, obj);
            }
            return memo;
        };

        return function(obj, iteratee, memo, context) {
            var initial = arguments.length >= 3;
            //optimizeCb(iteratee, context, 4) context为undefined,所以还是返回原函数
            return reducer(obj, optimizeCb(iteratee, context, 4), memo, initial);
        };
    };

    _.reduce = _.foldl = _.inject = createReduce(1);、
      //_.reduce返回的是function(obj, iteratee, memo, context) {var initial = arguments.length >= 3; 
      //return reducer(obj, optimizeCb(iteratee, context, 4), memo, initial); };这个函数
    //调用
    //var sum = _.reduce([1, 2, 3], function(memo, num){ return memo + num; }, 0);
    //相当于从左到右相加1,3,6
    _.reduceRight = _.foldr = createReduce(-1);
     //var sum = _.reduce([1, 2, 3], function(memo, num){ return memo + num; }, 0);
    //相当于从右向左相加，3,5,6

          
}());