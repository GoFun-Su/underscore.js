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
    		    
    		root._ = _;
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
        //a.prototype = b.prototype
        //因为a实例的__proto__会指向a.prototype，然后a.prototype又指向b.prototype
        //所以a实例的__proto__会指向b.prototype，于是a的实例可以访问b构造函数原型里定义的属性或者方法。
        Ctor.prototype = prototype;
        var result = new Ctor;
        //把Ctor.prototype置空是为了消除prototype和 Ctor.prototype之间的引用
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

    //返回查找的第一个正确的值
    _.find = _.detect = function(obj, predicate, context) {
      //判断是类数组还是对象，获取索引或者键
        var keyFinder = isArrayLike(obj) ? _.findIndex : _.findKey;
        var key = keyFinder(obj, predicate, context);
        if (key !== void 0 && key !== -1) return obj[key];
    };


    // 寻找数组或者对象中所有满足条件的元素,并返回数组
    _.filter = _.select = function(obj, predicate, context) {
        var results = [];
        //根据context返回不同的函数，也即是修改this指向而已
        predicate = cb(predicate, context);
        _.each(obj, function(value, index, list) {
          if (predicate(value, index, list)) results.push(value);
        });
        return results;
    };


    // 查找数组中所有不满足条件的，并返回数组
 
    _.reject = function(obj, predicate, context) {
        return _.filter(obj, _.negate(cb(predicate)), context);
    };

 
    //数组或者对象所有满足条件的返回true，只要一个不满足条件，返回false
    _.every = _.all = function(obj, predicate, context) {
        predicate = cb(predicate, context);
        var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
        for (var index = 0; index < length; index++) {
            var currentKey = keys ? keys[index] : index;
            if (!predicate(obj[currentKey], currentKey, obj)) return false;
        }
        return true;
    };


    //数组或者对象只要一个满足条件就返回true，否则返回false
     _.some = _.any = function(obj, predicate, context) {
        predicate = cb(predicate, context);
        var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
        for (var index = 0; index < length; index++) {
            var currentKey = keys ? keys[index] : index;
            if (predicate(obj[currentKey], currentKey, obj)) return true;
        }
        return false;
    };


    //数组或者对象中是否含有某个指定元素
     _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
        //如果是
        if (!isArrayLike(obj)) obj = _.values(obj);
        // fromIndex 表示查询起始位置
        // 如果没有指定该参数，则默认从头找起
        if (typeof fromIndex != 'number' || guard) fromIndex = 0;
        return _.indexOf(obj, item, fromIndex) >= 0;
    };


    _.invoke = restArgs(function(obj, path, args) {
        var contextPath, func;
        //如果path是函数
        if (_.isFunction(path)) {
            func = path;
            //如果path是类数组
        } else if (_.isArray(path)) {
           //返回数组从0开始到数组长度-1的部分
            contextPath = path.slice(0, -1);
            path = path[path.length - 1];
        }
        return _.map(obj, function(context) {
            var method = func;
            if (!method) {
                if (contextPath && contextPath.length) {
                    context = deepGet(context, contextPath);
                }
                if (context == null) return void 0;
                method = context[path];
            }
            return method == null ? method : method.apply(context, args);
        });
    });

    _.pluck = function(obj, key) {
        return _.map(obj, _.property(key));
    };

    //返回列表
    _.where = function(obj, attrs) {
        return _.filter(obj, _.matcher(attrs));
    };

    //返回第一个
    _.findWhere = function(obj, attrs) {
        return _.find(obj, _.matcher(attrs));
    };

    //调用①
    //var stooges = [{name: 'moe', age: 80}, {name: 'larry', age: 50}, {name: 'curly', age: 60}];
    //_.max(stooges, function(stooge){ return stooge.age; })

    //obj是对象或者数组(子元素不是对象)并且iteratee为数字，走第一个，否则走第二个
    // iteratee ---> 123(数字) 
    //obj[0] != 'object' 不是数组对象，是对象或者数组(子元素不是对象)
    _.max = function(obj, iteratee, context) {
        var result = -Infinity, lastComputed = -Infinity,
        value, computed;
        //直接比较数组或者对象键值的大小 ，返回最大的
        if (iteratee == null || (typeof iteratee == 'number' && typeof obj[0] != 'object') && obj != null) {
            obj = isArrayLike(obj) ? obj : _.values(obj);
            for (var i = 0, length = obj.length; i < length; i++) {
                value = obj[i];
                if (value != null && value > result) {
                    result = value;
                }
            }
        } else {
            //如果iteratee为函数或者obj为数组对象
            iteratee = cb(iteratee, context);
            _.each(obj, function(v, index, list) {
                computed = iteratee(v, index, list);
                if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
                    result = v;
                    lastComputed = computed;
                }
            });
        }
        return result;
    };


    //同max类似
    _.min = function(obj, iteratee, context) {
        var result = Infinity, lastComputed = Infinity,
        value, computed;
        if (iteratee == null || (typeof iteratee == 'number' && typeof obj[0] != 'object') && obj != null) {
            obj = isArrayLike(obj) ? obj : _.values(obj);
            for (var i = 0, length = obj.length; i < length; i++) {
                value = obj[i];
                if (value != null && value < result) {
                    result = value;
                }
            }
        } else {
            iteratee = cb(iteratee, context);
            _.each(obj, function(v, index, list) {
                computed = iteratee(v, index, list);
                if (computed < lastComputed || computed === Infinity && result === Infinity) {
                    result = v;
                    lastComputed = computed;
                }
             });
        }
        return result;
    };


    _.shuffle = function(obj) {
        return _.sample(obj, Infinity);
    };
    
    //随机返回数组前n个数
    //如果参数是对象，则数组由 values 组成
    _.sample = function(obj, n, guard) {
      //如果n等于null,或者guard存在
        if (n == null || guard) {
          //如果obj是对象，获取键值组成的数组
            if (!isArrayLike(obj)) obj = _.values(obj);
          //_.random(obj.length - 1)为数组长度减一，返回数组中随机一个数
            return obj[_.random(obj.length - 1)];
        }
        //如果是类数组或者对象
        var sample = isArrayLike(obj) ? _.clone(obj) : _.values(obj);
        //获取长度
        var length = getLength(sample);
        //Math.min(n, length),获取n和length的最小值
        n = Math.max(Math.min(n, length), 0);
        var last = length - 1;
        for (var index = 0; index < n; index++) {
            //rand为index-last其中的一个数
            var rand = _.random(index, last);
            //交换位置
            var temp = sample[index];
            sample[index] = sample[rand];
            sample[rand] = temp;
        }
        //返回前n个数
        return sample.slice(0, n);
    };

    //排序
    //如果是iteratee是函数的话，函数作为条件进行排序
    //iteratee = cb(iteratee, context);还是原来的函数，不变
    //_.map(obj, function(value, key, list) {})函数 返回的是一个重新组合的对象，function作为一个回调函数
    //.sort函数是对对象进行排序，然后_.pluck返回key对应value的数组
    //如果iteratee是字符串的话，或者value值进行排序 
    //iteratee = cb(iteratee, context);对于是字符串的时候
    //var cb = function(value, context, argCount) {value是字符串 eturn _.property(value);};

    //_.property = function(path) {path不是类数组 if (!_.isArray(path)) {return shallowProperty(path);}};
    //var shallowProperty = function(key) {  return function(obj) {return obj == null ? void 0 : obj[key];};};
    //最后iteratee = function(key) {  return function(obj) {return obj == null ? void 0 : obj[key];};}获取的是value值
    _.sortBy = function(obj, iteratee, context) {
        var index = 0;
        iteratee = cb(iteratee, context);
        return _.pluck(_.map(obj, function(value, key, list) {
            return {
                value: value,
                index: index++,
                criteria: iteratee(value, key, list)
            };
        }).sort(function(left, right) {
              var a = left.criteria;
              var b = right.criteria;
              if (a !== b) {
                  if (a > b || a === void 0) return 1;
                  if (a < b || b === void 0) return -1;
              }
              return left.index - right.index;
        }), 'value');
    };

   
    //如果iteratee不是函数是字符的时候
    //var cb = function(value, context, argCount) {return _.property(value);}
    //_.property = function(path) {
    // if (!_.isArray(path)) {
    //  return shallowProperty(path);
    //}
    //};
    //var shallowProperty = function(key) {
    //return function(obj) {
    //   return obj == null ? void 0 : obj[key];
    //};
    //};
    //iteratee -->function(obj) {return obj == null ? void 0 : obj[iteratee];};
    var group = function(behavior, partition) {
        return function(obj, iteratee, context) {
          //partition不存在为空对象
            var result = partition ? [[], []] : {};
            //改变this指向  
            //如果iteratee不是函数是字符的时候
            //iteratee -->function(obj) {return obj == null ? void 0 : obj[iteratee];};
            iteratee = cb(iteratee, context);
            //循环obj
            _.each(obj, function(value, index) {
              //执行iteratee函数，获取key值
              //如果iteratee不是函数是字符的时候,
              //iteratee （此时的obj不再是传入的对象，是value）-->function(obj) {return obj == null ? void 0 : obj[iteratee];};
              //var key = iteratee(value) -->获取的是value的长度，以长度分组
            var key = iteratee(value, index, obj);
              //执行最外层的函数
            behavior(result, value, key);
          });
            //返回结果
          return result;
        };
    _.groupBy = group(
        //var group = function(behavior, partition) {}
        //以下函数为behavior参数，partition不存在
        function(result, value, key) {
          //如果结果里面含有key，将数字push为key的数组中
            if (_.has(result, key)) result[key].push(value); 
          //否则result中添加属性key，设置key-value
            else result[key] = [value];
          }
      );
    };
    //_.groupBy 返回的是function(obj, iteratee, context) {...}

    //_.groupBy([1.3, 2.1, 2.4], function(num){ return Math.floor(num); });
    //=> {1: [1.3], 2: [2.1, 2.4]}

    
    _.indexBy = group(
        function(result, value, key) {
           //result返回的是一个对象，key-value形式
            result[key] = value;
        }
    );
    /*var stooges = [{name: 'moe', age: 40}, {name: 'larry', age: 50}, {name: 'curly', age: 60}];
    _.indexBy(stooges, 'age');
    => {
     "40": {name: 'moe', age: 40},
     "50": {name: 'larry', age: 50},
     "60": {name: 'curly', age: 60}
    var group = function(behavior, partition) {
        return function(obj, iteratee, context) {
          var result = partition ? [[], []] : {};
          iteratee = cb(iteratee, context);
          
          //iteratee -- >function(obj) {return obj == null ? void 0 : obj[iteratee];};
          _.each(obj, function(value, index) {
            //此时的key为age的value值
            var key = iteratee(value, index, obj);
            behavior(result, value, key);
          });
          return result;
        };
    };*/


    _.countBy = group(function(result, value, key) {
      //由前面两个函数可知，这个回调函数是返回的参数的形式，返回的是一个对象，
      //如果存在这个属性，value值加一，否则对象中添加这个属性
        if (_.has(result, key)) result[key]++; else result[key] = 1;
    });
    /* _.countBy([1, 2, 3, 4, 5], function(num) {
        return num % 2 == 0 ? 'even': 'odd';
    });
    => {odd: 3, even: 2}*/


    //UTF-16 编码  编码法在 UCS-2 第0位面字符集的基础上利用 D800-DFFF 区段的码位通过一定转换方式
    //将超出2字节的字符编码为一对16比特长的码元(即32bit,4Bytes)，称作代理码对 (surrogate pair)
    var reStrSymbol = /[^\ud800-\udfff]|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g;

     _.toArray = function(obj) {
        if (!obj) return [];
        //如果是数组，
        if (_.isArray(obj)) return slice.call(obj);
        if (_.isString(obj)) {
            return obj.match(reStrSymbol);
        }
        if (isArrayLike(obj)) return _.map(obj, _.identity);
         return _.values(obj);
    };


    _.size = function(obj) {
        if (obj == null) return 0;
        //如果是类数组返回类属租的长度，如果是对象返回属性的个数
        return isArrayLike(obj) ? obj.length : _.keys(obj).length;
    };

    //返回一个数组，只存在0或者1
    _.partition = group(function(result, value, pass) {
        result[pass ? 0 : 1].push(value);
    }, true);
    //_.partition([0, 1, 2, 3, 4, 5], function(num){return num>2});
    //[[0,1,2],[3,4,5]]

    //如果存在guard不为0返回数组的第一个元素，否则如果存在n返回数组的前n个
    _.first = _.head = _.take = function(array, n, guard) {
      if (array == null || array.length < 1) return void 0;
      //返回数组的第一个元素
      if (n == null || guard) return array[0];
      //返回长度为n的数组
      return _.initial(array, array.length - n);
    };

    //在arguments对象上特别有用？？
    _.initial = function(array, n, guard) {
        //如果guard不为0存在存在，返回数组的前array.length-1个，如果不存在n存在，返回array.length-n个
        return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
    };


    //如果存在guard不为0返回数组的最后一个元素，否则如果存在n返回数组的后n个,n为返回的的个数
    _.last = function(array, n, guard) {
        if (array == null || array.length < 1) return void 0;
        if (n == null || guard) return array[array.length - 1];
        return _.rest(array, Math.max(0, array.length - n));
    };

    _.rest = _.tail = _.drop = function(array, n, guard) {
      return slice.call(array, n == null || guard ? 1 : n);
    };

    //返回转换成布尔值为true的值组合成的数组
    _.compact = function(array) {
        return _.filter(array, Boolean);
    };

    var flatten = function(input, shallow, strict, output) {
        output = output || [];
        var idx = output.length;
        for (var i = 0, length = getLength(input); i < length; i++) {
          var value = input[i];
          //如果是数组,直接返回数组里面的内容
          if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
            //shallow为true的时候，获取n层里面的内容
            if (shallow) {
              var j = 0, len = value.length;
              while (j < len) output[idx++] = value[j++];
            } else {
              console.log(_.flatten([1, [2], [3, [[4]]]], false))
              //否则的话，返回数组仅仅只有一层无论外层还是元素内层
              flatten(value, shallow, strict, output);
              idx = output.length;
            }
          } else if (!strict) {
            output[idx++] = value;
          }
        }
        return output;
      }

      //shallow为true的时候，数组n层,剥开第n层,获取n层里面的内容，shallow为false的时候，返回数组仅仅只有一层无论外层还是元素内层
    _.flatten = function(array, shallow) {
        return flatten(array, shallow, false);
    };

    //返回数组，不包含某些元素
    _.without = restArgs(function(array, otherArrays) {
        return _.difference(array, otherArrays);
    });

    //如果isSorted等于false，iteratee不存在进行数组去重
    //如果isSorted等于true，输出数组，不进行过滤
    //如果isSorted不是布尔值，isSorted = false，iteratee等于isSorted，
    //iteratee = cb(iteratee, context)-->function(obj) { return obj == null ? void 0 : obj[key];};
    //computed一直等于undefined，所以返回数组只存在一个值，array[0]-->1
    //如果是布尔值并且iteratee存在,iteratee每次调用之后的返回值等于computed，如果新的数组不存在就push否则不push
    //_.uniq([1, 2, 1, 4, 1, 3],false,function(value){ return value})
    _.uniq = _.unique = function(array, isSorted, iteratee, context) {
            //如果isSorted不是布尔值true或者false
            //context= iteratee(存在值或者 undefined),iteratee=isSorted,isSorted = false
            //如果是布尔值
            ////context= context,iteratee=iteratee,isSorted = isSorted
            if (!_.isBoolean(isSorted)) {
                    context = iteratee;
                    iteratee = isSorted;
                    isSorted = false;
            }
             //如果iteratee存在
            if (iteratee != null) iteratee = cb(iteratee, context);
            var result = [];
            var seen = [];
            for (var i = 0, length = getLength(array); i < length; i++) {
                    var value = array[i],
                    //如果iteratee不存在，computed是数组每个元素的值
                    computed = iteratee ? iteratee(value, i, array) : value;
                    //如果isSorted传参不是布尔值的情况下，isSorted等于false,
                    //如果isSorted传参是true走第一步
                    //if (!i || seen !== computed)数组比较相等永远是不相等的，判断有问题？去重
                    if (isSorted) {
                            if (!i || seen !== computed) result.push(value);
                            seen = computed;
                    } else if (iteratee) {
                            ////如果isSorted传参不是布尔值的情况下，isSorted等于false,iteratee不等于null
                                if (!_.contains(seen, computed)) {
                                        seen.push(computed);
                                        result.push(value);
                                }
                        //如果isSorted传参是布尔值的情况下，isSorted传参是false,
                        //如果iteratee不存在，数组去重
                        } else if (!_.contains(result, value)) {
                                result.push(value);
                        }
            }
            return result;
    };

     _.union = restArgs(function(arrays) {
           //flatten(arrays, true, true)第二个参数为true的时候，数组n层,剥开第n层,获取n层里面的内容
            return _.uniq(flatten(arrays, true, true));
    });

    //_.intersection([1, 2, 3], [101, 2, 1, 10], [2, 1])
    //break 语句可用于跳出本层循环。break语句跳出本层循环后，会继续执行该层循环之后的代码（如果有的话）
    //continue 语句中断本次循环，本次循环之后的内容不再执行，继续下次循环
    //寻找数组之中公共的元素，重新组成一个新的数组
    _.intersection = function(array) {
            //array仅接受第一个实参
            var result = [];
            //获取实参的个数，arguments.length代表的是实参的个数
            var argsLength = arguments.length; 
            for (var i = 0, length = getLength(array); i < length; i++) {
                var item = array[i];
                //获取第一个实参的第一个元素，如果新数组含有当前元素的话，继续下一次i++循环
                if (_.contains(result, item)) continue;
                var j;
                for (j = 1; j < argsLength; j++) {
                    //如果其他的不含这个元素的话，跳出本层循环，执行下面的代码
                    if (!_.contains(arguments[j], item)) break;
                }
                //如果都包含，result push进去item
                if (j === argsLength) result.push(item);
            }
            return result;
    };


     _.difference = restArgs(function(array, rest) {
            rest = flatten(rest, true, true);
            return _.filter(array, function(value){
                    return !_.contains(rest, value);
            });
    });

     //_.unzip([["moe", 1,30, true], ["larry",2, 40, false], ["curly",3, 50, false]])
     _.unzip = function(array) {
            //getLength-->ƒ (obj) {return obj == null ? void 0 : obj[key]; }-->obj[key]=obj["length"]
            //获取数组里面每个元素的最大长度
            var length = array && _.max(array, getLength).length || 0;
            //根据length生成长度为length的数组
            var result = Array(length);
            //每一个元素的相同的索引值组成一个新的数组
            for (var index = 0; index < length; index++) {
                    result[index] = _.pluck(array, index);
            }
            return result;
    };

    //_.unzip行程的结果，组成一个新的数组
     _.zip = restArgs(_.unzip);

     //转换成对象形式
     //_.object([['moe', 30], ['larry', 40], ['curly', 50]])
     _.object = function(list, values) {
            var result = {};
            for (var i = 0, length = getLength(list); i < length; i++) {
                    //如果values存在，组成对象key-value形式，list[i]对应key,values[i]对应value
                    if (values) {
                            result[list[i]] = values[i];
                    } else {
                        //如果不存在value,list[i]第一个元素是key,第二个元素是value，
                            result[list[i][0]] = list[i][1];
                    }
            }
            return result;
    };


    //dir为1或者-1
    //  var users = [1,2,3,2];_.findLastIndex(users, function(value,index,arr){return value==2});
    var createPredicateIndexFinder = function(dir) {
            return function(array, predicate, context) {
                    predicate = cb(predicate, context);
                    var length = getLength(array);
                    //dir为1的时候index为0,dir为-1的时候index为length - 1，
                    //即是搜索从左还是从右开始，返回当前找到的索引,未找到返回-1
                    var index = dir > 0 ? 0 : length - 1;
                    for (; index >= 0 && index < length; index += dir) {
                            //依次循环执行predicate函数,找出匹配predicate函数的值，并返回索引
                            if (predicate(array[index], index, array)) return index;
                    }
                    return -1;
            };
    };

    //匹配的第一个索引
     _.findIndex = createPredicateIndexFinder(1);
    //匹配的最后一个索引
    _.findLastIndex = createPredicateIndexFinder(-1);


    //cb(iteratee, context, 1)
    //对于已经排好序的进行查找
    //二分查找
    _.sortedIndex = function(array, obj, iteratee, context) {
            iteratee = cb(iteratee, context, 1);

            //iteratee==value
            //iteratee是函数的时候
            //cb(iteratee, context, 1)--->return optimizeCb(iteratee, context, argCount);
            //iteratee=-->return function(value) {return iteratee.call(context, value);};    
            var value = iteratee(obj);
            var low = 0, high = getLength(array);
            while (low < high) {
                    //Math.floor向下取整
                     //获取low和high中间数
                    var mid = Math.floor((low + high) / 2);
                    //如果小于比较的值，下一个进行比较
                    if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
            }
            return low;
    };


    //dir为1或者-1
    //为1从头开始，为-1从尾开始
    //array要查找的数组，item要比较的数组,idx为要开始比较的索引

    var createIndexFinder = function(dir, predicateFind, sortedIndex) {
            return function(array, item, idx) {
                    var i = 0, length = getLength(array);
                    //如果idx为数字，即初始比较位存在
                    if (typeof idx == 'number') {
                            //如果dir大于0，从头开始比较,
                            if (dir > 0) {
                                    //如果idx大于0，即是从idx位开始，否则从正着数第idx+length位开始，即是length-|idx|位开始比较
                                    i = idx >= 0 ? idx : Math.max(idx + length, i);
                            } else {
                                    //从尾开始比较，如果idx大于0，从倒着数第idx+1位开始向前比较（长度即为idx=1），
                                    //否则小于0的时候，从length-|idx|+1位向前比较(长度为length-|idx|+1)
                                    length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
                            }
                    } else if (sortedIndex && idx && length) {
                            idx = sortedIndex(array, item);
                           // sortedIndex(array, item)-->iteratee--->ƒ (value) {return value; }
                           //-->var value = iteratee(obj)(obj==item调用)返回的是item;最后二分查找返回索引-->idx;
                           //根据返回的值进行比较是否正确
                            return array[idx] === item ? idx : -1;
                    }
                    if (item !== item) {
                            idx = predicateFind(slice.call(array, i, length), _.isNaN);
                            return idx >= 0 ? idx + i : -1;
                    }
                    //找到某个比较相等的值，返回索引
                    //idx从0或者 从0或者从尾开始
                    for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
                            if (array[idx] === item) return idx;
                    }
                    return -1;
            };
    };

    _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
    _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);
    

    //返回一个数组，如果三个参数都存在 ，返回的是(strat,stop)区间的数，step为间距，差值
    //如果stop不存在，返回的是0-start之间的值
    //如果step不存在 ，返回的是start和stop之间的值，step为1或者-1
    _.range = function(start, stop, step) {
           //如果stop不存在的情况下，stop等于start或者0，start等于0
            if (stop == null) {
              stop = start || 0;
              start = 0;
            }
            //如果step不存在的情况下，step等于1或者-1
            if (!step) {
              step = stop < start ? -1 : 1;
            }

            var length = Math.max(Math.ceil((stop - start) / step), 0);
            var range = Array(length);

            for (var idx = 0; idx < length; idx++, start += step) {
              range[idx] = start;
            }

            return range;
    };
    //返回新的数组，数组里面每一个元素为数组，长度为count
    _.chunk = function(array, count) {
            if (count == null || count < 1) return [];

            var result = [];
            var i = 0, length = array.length;
            while (i < length) {
                //Array.prototype.slice.call([1,2,3,4,3,5,6],1,4)返回新数组，索引下标从1开始到4
              result.push(slice.call(array, i, i += count));
            }
            return result;
    }; 

    //sourceFunc
    var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
            //如果callingContext不是boundFunc函数的实例
            if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
            //if (nativeCreate) return nativeCreate(prototype);-->Object.create(sourceFunc.prototype)
            //sourceFunc.prototype是self的原型，self是sourceFunc的实例
            //var o3 = Object.create(Object.prototype); // o3和{}和new Object()一样,即o3是object的实例
            var self = baseCreate(sourceFunc.prototype);
            // // 用 new 生成一个构造函数的实例
            // 正常情况下是没有返回值的，即 result 值为 undefined
            // 如果构造函数有返回值
            // 如果返回值是对象（非 null），则 new 的结果返回这个对象
            // 否则返回实例
            //function Fn1() {this.name = 'peter';return {name: 'jack'};}var p = new Fn1();console.log(obj1);--> {name: "jack"}
            //console.log(Fn1.apply(p))--->{name: "jack"}
            //apply 应用某一对象的一个方法，用另一个对象替换当前对象，继承，调用
            var result = sourceFunc.apply(self, args);
            //如果返回的是一个对象，代表函数有返回值是一个对象，否则的话，返回的是函数的实例
            if (_.isObject(result)) return result;
            return self;
    }; 



   
   //函数的 length 得到的是形参个数,arguments.length为实参的个数
    /*var func = function(greeting){ return greeting + ': ' + this.name };
        func = _.bind(func, {name: 'moe'}, 'hi');
        func();
    var callback1 = function(func, context, args) {
            if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
            var bound = restArgs(function(callArgs) {
                    return executeBound(func, bound, context, this, args.concat(callArgs));
            });
            return bound;
    };
     _.bind = restArgs(callback1); 
     var restArgs = function(func, startIndex) {
            startIndex = startIndex == null ? func.length - 1 : +startIndex;
            startIndex = 3-1=2;
            return function() {
                var length = Math.max(arguments.length - 2, 0),
                rest = Array(length),
                index = 0;
                for (; index < length; index++) {
                  rest[index] = arguments[index + 2];
                }
                switch (2) {
                    case 2: return callback1.call(this, arguments[0], arguments[1], rest);
                }
                
        };
     };
     func = _.bind(func, {name: 'moe'}, 'hi');
     _.bind = function() {
                var length = Math.max(3- 2, 0),
                rest = Array(1),
                index = 0;
                for (; index < 1; index++) {
                  rest[0] = arguments[0 + 2];
                }
                switch (2) {
                    case 2: return callback1(func, {name: 'moe'}, ['hi']);
                }
                
        };; 
    func = _.bind(func, {name: 'moe'}, ['hi']);
    //调用成功之后-->
    callback1(func, {name: 'moe'}, ['hi'])
    //改个名字
    bind2(func, {name: 'moe'}, ['hi'])


    bind2(func, {name: 'moe'}, ['hi'])
    var bind2 = function(func, context, args) {
            var bound = restArgs(function(callArgs) {
                    return executeBound(func, bound, context, this, args.concat(callArgs));
            });
            return bound;
    };
    var callback2 = function(callArgs) {
            return executeBound(func, bound, {name: 'moe'}, this, ['hi'].concat(callArgs));
    };
    bind2(func, {name: 'moe'}, ['hi'])
    var bind2 = function(func, context, args) {
            var bound = restArgs(callback2);
            return bound;
    };
    var restArgs = function(func, startIndex) {
            startIndex = startIndex == null ? func.length - 1 : +startIndex;
            startIndex = 1-1=0;
            return function() {
                var length = Math.max(arguments.length - 0, 0),
                //生成一个数组，长度为length
                rest = Array(length),
                index = 0;
                for (; index < length; index++) {
                  rest[index] = arguments[index + 0];
                }
                switch (0) {
                    case 0: return callback2.call(this, rest);
                }
            };
        };
    bind2(func, {name: 'moe'}, ['hi'])
    var bind2 = function(func, context, args) {
            var bound = function() {
                    var length = Math.max(arguments.length - 0, 0),
                    rest = Array(length),
                    index = 0;
                    for (; index < length; index++) {
                        rest[index] = arguments[index + 0];
                    }
                    
                    return callback2.call(this, rest);
                }
             };
            return bound;
    };
    var p =bind2(func, {name: 'moe'}, ['hi'])
    var bind2 = function(func, context, args) {
          return   function() {
                    var length = Math.max(arguments.length - 0, 0),
                    rest = Array(length),
                    index = 0;
                    for (; index < length; index++) {
                        rest[index] = arguments[index + 0];
                    }
                    
                    return callback2.call(this, rest);
                }
             };
    };
    function() {
        var length = Math.max(arguments.length - 0, 0),
        rest = Array(length),
        index = 0;
        for (; index < length; index++) {
            rest[index] = arguments[index + 0];
        }
        
        return callback2.call(this, rest);
    };
    p();
    function() {
        var length = Math.max(0 - 0, 0),
        rest = Array(0),
        index = 0;
        for (; index < length; index++) {
            rest[index] = arguments[index + 0];
        }
        
        return callback2([]);
    };
    -->callback2([])
    var callback2 = function(callArgs) {
            return executeBound(func, bound, {name: 'moe'}, this, ['hi']);
    };
    -->callback2([])
    -->func.apply({name: 'moe'}, ['hi'])
    -->var func = function(greeting){ return greeting + ': ' + this.name };
    -->func.apply({name: 'moe'}, ['hi'])
    "hi: moe"
*/
    _.bind = restArgs(function(func, context, args) {
            //func必须是函数形式
            if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
            var bound = restArgs(function(callArgs) {
                    return executeBound(func, bound, context, this, args.concat(callArgs));
            });
            return bound;
    });  


    _.partial = restArgs(function(func, boundArgs) {
            var placeholder = _.partial.placeholder;
            var bound = function() {
                    var position = 0, length = boundArgs.length;
                    var args = Array(length);
                    for (var i = 0; i < length; i++) {
                            args[i] = boundArgs[i] === placeholder ? arguments[position++] : boundArgs[i];
                    }
                    while (position < arguments.length) args.push(arguments[position++]);
                            return executeBound(func, bound, this, this, args);
                    };
                    return bound;
        //});      
    }());
    _.partial.placeholder = _;

    /*var subtract = function(a, b) { return b - a; };
    sub5 = _.partial(subtract, 5);
    sub5(20);

    var callback1 =function(func, boundArgs) {
            var placeholder = _.partial.placeholder;
            var bound = function() {
                    var position = 0, length = boundArgs.length;
                    var args = Array(length);
                    for (var i = 0; i < length; i++) {
                            args[i] = boundArgs[i] === placeholder ? arguments[position++] : boundArgs[i];
                    }
                    while (position < arguments.length) args.push(arguments[position++]);
                            return executeBound(func, bound, this, this, args);
                    };
                    return bound;
    };
    _.partial = restArgs(callback1());
    var restArgs = function(func, startIndex) {
        startIndex = startIndex == null ? func.length - 1 : +startIndex;
        startIndex = 2-1=1;
        return function() {
            var length = Math.max(arguments.length - 1, 0),
            rest = Array(length),
            index = 0;
            for (; index < length; index++) {
                    rest[index] = arguments[index + 1];
            }
            switch (1) {
                    case 1: return callback1.call(window, arguments[0], rest);
            }
        };
    };
    _.partial = function() {
            var length = Math.max(arguments.length - 1, 0),
            rest = Array(length),
            index = 0;
            for (; index < length; index++) {
                    rest[index] = arguments[index + 1];
            }
            switch (1) {
                    case 1: return callback1.call(window, arguments[0], rest);
            }
        };
  -->_.partial(subtract, 5);
  -->
  _.partial = function() {
   var length = Math.max(2 - 1, 0),
    rest = Array(1),
    index = 0;
    for (; index < 1; index++) {
            rest[0] = arguments[0 + 1];
    }
    switch (1) {
            case 1: return callback1.call(window,subtract, [5]);
    }
};
-->_.partial(subtract, 5);
-->callback1.call(window,subtract, [5])
-->callback1(subtract, [5])
-->
var callback1 =function(func, boundArgs) {
        var placeholder = _.partial.placeholder;
        var bound = function() {
                var position = 0, length =1;
                var args = Array(1);
                for (var i = 0; i < 1; i++) {
                        args[0] =  boundArgs[0];
                }
                while (position < arguments.length) args.push(arguments[position++]);
                        return executeBound(subtract, bound, this, this, [5]);
            };
            return bound;
};
-->var p = callback1(subtract, [5])
-->function() {
    var position = 0, length =1;
    var args = Array(1);
    for (var i = 0; i < 1; i++) {
            args[0] =  boundArgs[0];
    }
    while (position < arguments.length) args.push(arguments[position++]);
            return executeBound(subtract, bound, this, this, [5]);
 };
 p(20)
 -->function() {
    var position = 0, length =1;
    var args = Array(1);
    for (var i = 0; i < 1; i++) {
            args[0] =  boundArgs[0];
    }
    while (position < 1) args.push(arguments[position++]);//args[5,20]
            return executeBound(subtract, bound, this, this, [5,20]);
 };
 -->executeBound(subtract, bound, this, this, [5,20])
 -->subtract.apply(this, [5,20])
 //apply参数是一个数组
 -->var subtract = function(a, b) { return b - a; };



 subFrom20 = _.partial(subtract, _, 20);
 subFrom20(5);
 var callback1 =function(func, boundArgs) {
        var placeholder = _.partial.placeholder;
        var bound = function() {
                var position = 0, length = boundArgs.length;
                var args = Array(length);
                for (var i = 0; i < length; i++) {
                        args[i] = boundArgs[i] === placeholder ? arguments[position++] : boundArgs[i];
                }
                while (position < arguments.length) args.push(arguments[position++]);
                        return executeBound(func, bound, this, this, args);
                };
                return bound;
};
_.partial = restArgs(callback1());
var restArgs = function(func, startIndex) {
    startIndex = startIndex == null ? func.length - 1 : +startIndex;
    startIndex = 2-1=1;
    return function() {
        var length = Math.max(arguments.length - 1, 0),
        rest = Array(length),
        index = 0;
        for (; index < length; index++) {
                rest[index] = arguments[index + 1];
        }
        switch (1) {
                case 1: return callback1.call(window, arguments[0], rest);
        }
    };
};
_.partial =function() {
        var length = Math.max(arguments.length - 1, 0),
        rest = Array(length),
        index = 0;
        for (; index < length; index++) {
                rest[index] = arguments[index + 1];
        }
        switch (1) {
                case 1: return callback1.call(window, arguments[0], rest);
        }
};
-->_.partial(subtract, _, 20);
--> 
_.partial =function() {
        var length = Math.max(3 - 1, 0),
        rest = Array(2),
        index = 0;
        for (; index < 2; index++) {
                rest[index] = arguments[index + 1]; //rest [_,20]
        }
        switch (1) {
                case 1: return callback1(subtract, [_,20]);
        }
};
-->_.partial(subtract, _, 20); 
-->var p = callback1(subtract, [_,20])
-->var callback1 =function(func, boundArgs) {
        var placeholder = _;
        var bound = function() {
                var position = 0, length = 2;
                var args = Array(2);
                for (var i = 0; i < 2; i++) {
                        args[i] = boundArgs[i] === placeholder ? arguments[position++] : boundArgs[i];
                }//args [arguments[0],20]
                while (position < arguments.length) args.push(arguments[position++]);
                        return executeBound(subtract, bound, this, this, args);
                };
        return bound;
};
p(5)
-->function() {
    var position = 0, length =2;
    var args = Array(2);
    //args [arguments[0],20]
    //-->args [5,20]
    return executeBound(subtract, bound, this, this, args);
}
-->executeBound(subtract, bound, this, this, [5,20])
-->subtract.apply(this,[5,20])*/


 _.bindAll = restArgs(function(obj, keys) {
    keys = flatten(keys, false, false);
    var index = keys.length;
    if (index < 1) throw new Error('bindAll must be passed function names');
    while (index--) {
      var key = keys[index];
      obj[key] = _.bind(obj[key], obj);
    }
});
 /*callback = function(obj, keys) {
    keys = flatten(keys, false, false);
    var index = keys.length;
    if (index < 1) throw new Error('bindAll must be passed function names');
    while (index--) {
      var key = keys[index];
      obj[key] = _.bind(obj[key], obj);
    }
};
 _.bindAll = restArgs(callback);

var restArgs = function(func, startIndex) {
    startIndex = startIndex == null ? func.length - 1 : +startIndex;
    startIndex = 2-1=1;
    return function() {
      var length = Math.max(arguments.length - 1, 0),
          rest = Array(length),
          index = 0;
      for (; index < length; index++) {
        rest[index] = arguments[index + 1];
      }
      switch (1) {
        case 1: return func.call(this, arguments[0], rest);
      }
    };
};
 _.bindAll = function() {
      var length = Math.max(arguments.length - 1, 0),
          rest = Array(length),
          index = 0;
      for (; index < length; index++) {
        rest[index] = arguments[index + 1];
      }
      
      return callback.call(window, arguments[0], rest);
  }
-->_.bindAll(buttonView, 'onClick', 'onHover');
--> _.bindAll = function() {
      var length = Math.max(3 - 1, 0),
          rest = Array(2),
          index = 0;
      for (; index < 2; index++) {
        rest[index] = arguments[index + 1];
      }
      
      return callback.call(buttonView, ['onClick', 'onHover']);
  }
-->_.bindAll(buttonView, 'onClick', 'onHover');
-->callback.call(buttonView, ['onClick', 'onHover']);
 callback = function(obj, keys) {
    keys = flatten(keys, false, false);//keys =['onClick', 'onHover'] 
    var index = 2;
    while (index--) {
      var key = keys[index];
      obj[key] = _.bind(obj[key], obj);//修改this指向，obj[key]是一个函数，指向obj
    }
};*/

 //适用于需要大量重复求值的场景
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache; //cache ={}
      var address = '' + (hasher ? hasher.apply(this, arguments) : key); // ''+key;
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      //cache[''+key]=func.apply(this, arguments)
      return cache[address];
    };
    memoize.cache = {};
    return memoize;//返回的是cache[address]，改变this指向，对于重复求值有利
};
/*
callback = function(n) {
      return n < 2 ? n: fibonacci(n - 1) + fibonacci(n - 2);
};
var fibonacci = _.memoize(callback);
-->fibonacci = callback.apply(window, arguments)
-->fibonacci = callback.apply(arguments)
-->fibonacci(n)
-->fibonacci = callback.apply(n)
-->callback = function(n) {
      return n < 2 ? n: fibonacci(n - 1) + fibonacci(n - 2);
};
-->fibonacci(6) + fibonacci(5)
-->fibonacci(6)-->......-->
-->fibonacci(2)+fibonacci(1)+fibonacci(1)+fibonacci(0)+fibonacci(1)+fibonacci(0)+1+fibonacci(1)+fibonacci(0)+1+1+0
-->1+1+1+1+1+1+1+1
-->fibonacci(5) -->......-->
-->fibonacci(2)+fibonacci(1)+fibonacci(1)++fibonacci(0)+fibonacci(1)++fibonacci(0)+1
-->1+1+1+1+1*/



_.delay = restArgs(function(func, wait, args) {
    return setTimeout(function() {
      return func.apply(null, args);
    }, wait);
});

/*var callback = function(func, wait, args) {
    return setTimeout(function() {
      return func.apply(null, args);
    }, wait);
}
_.delay = restArgs(callback);
 var restArgs = function(func, startIndex) {
    startIndex = 2;
    return function() {
      var length = Math.max(arguments.length - 2, 0),
          rest = Array(length),
          index = 0;
      for (; index < length; index++) {
        rest[index] = arguments[index + startIndex];
      }
     return callback.call(arguments[0], arguments[1], rest);
  };
}
_.delay = function() {
      var length = Math.max(arguments.length - 2, 0),
          rest = Array(length),
          index = 0;
      for (; index < length; index++) {
        rest[index] = arguments[index + 2];
      }
     return callback.call(arguments[0], arguments[1], rest);
};
_.delay(log, 1000, 'logged later');
_.delay = function() {
      var length = Math.max(3 - 2, 0),
          rest = Array(1),
          index = 0;
      for (; index < 1; index++) {
        rest[index] = arguments[index + 2];
      }
     return callback.call(log,1000, ['logged later']);
};
_.delay(log, 1000, 'logged later');
callback(log,1000, ['logged later'])
var callback = function(func, wait, args) {
    return setTimeout(function() {
      return func.apply(null, args);
    }, wait);
}
callback(log,1000, ['logged later'])
setTimeout(function() {
      return log.apply(null, ['logged later']);
}, 1000);
log('logged later');



var log = _.bind(console.log, console);
log('logged later');
-->console.log.apply(console,['logged later'])*/
_.defer = _.partial(_.delay, _, 1);

//options.leading为false第一次调用不会立即执行
throttle(function() {}, 1500,{leading:false})
_.throttle = function(func, wait, options) {
    var timeout, context, args, result;
     // 上一次调用func的时间点
    var previous = 0;
    if (!options) options = {};

     // 两次调用时间间隔小于wait,创建一个延后执行的函数包裹住func的执行过程
    var later = function () {
        // 执行时，刷新最近一次调用时间,previous为当前时间点
        previous = options.leading === false ? 0 : new Date();
        // 清空定时器
        timeout = null;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
    };

    var throttled = function() {
      var now = _.now();
      //如果第一次调用(previous为0)，并且options.leading为false,第一次调用不会立即调用(remaining = wait )
      if (!previous && options.leading === false) previous = now;
      // 显然，如果第一次调用，且未设置options.leading = false，
      //previous=0，那么remaing= wait - now，remaing>wait,func会被立即执行
      //下次执行func等待的最短时间：预设的最小等待期-(当前时间-上次调用func的时间点)
      //一般来说第二次开始调用的最紧凑得时间是上次时间previous+wait时间之后开始调用，此时remaining等于0
      //如果第二次调用的时候不是最紧凑的时间，是上次时间previous+等待时间（小于wait）时间之后开始调用,
      //此时remaining=wait - (等待时间(小于wait))>0,不会立即执行，也即是两次调用时间间隔小于wait，此时会进入到else循环中
      //也就是在一个wait时间内触发多次事件，但是事件都会被覆盖， 只执行一次；
      var remaining = wait - (now - previous);
      // 记录之后执行时需要的上下文和参数
      context = this;
      args = arguments;

      // 如果计算后能被立即执行
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
            //清空调用
          clearTimeout(timeout);
          timeout = null;
        }
        //重新赋值上次调用func的时间点
        previous = now;
         // 执行func调用
        result = func.apply(context, args);
        //第一次的时候，timeout为null,!timeout为true，context = args = null
        if (!timeout) context = args = null;
      } 
      //如果timeout清除了，并且options.trailing不为false
      else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };

    throttled.cancel = function() {
      clearTimeout(timeout);
      previous = 0;
      timeout = context = args = null;
    };

    return throttled;
  };

   _.debounce = function (func, wait, immediate) {
        var timeout, result;

        var later = function (context, args) {
            timeout = null;
            if (args) result = func.apply(context, args);
        };


        var callback = function (args) {
            // 如果在足够的等待时间，一直调用，则不会触发，直到在足够的等待的时间内没有一次触发，则会调用一次
            if (timeout) clearTimeout(timeout);
            // 如果允许新的调用立即执行，
            if (immediate) {
                // 如果存在timeout，则等待wait之后调用，否则立即调用
                var callNow = !timeout;
                // 如果不能被立即执行等待wait时间执行，也有可能执行不成功，时间间隔小于wait个时间
                 timeout = setTimeout(later, wait);
                // 如果前面没有等待的函数，能被立即执行，立即执行
                if (callNow) result = func.apply(this, args);
            } else {
                // 否则，等待wait个时间会调用一次
                timeout =restArgs(function (func, wait, args) {
                            return setTimeout(function () {
                                return func.apply(null, args);
                            }, wait);
                        })(later, wait, this, args);
            }

            return result;
        };
        var debounced = function () {
            var length = Math.max(arguments.length, 0);
            var rest = Array(length);
            for (var index = 0; index < length; index++) {
                rest[index] = arguments[index];
            }
           return callback(rest);
        }

        debounced.cancel = function () {
            clearTimeout(timeout);
            timeout = null;
        };

        return debounced;
    };

/*_.debounce (function() {}, 1500);
--->
function () {
        var length = Math.max(arguments.length, 0);
        var rest = Array(length);
        for (var index = 0; index < length; index++) {
            rest[index] = arguments[index];
        }
       return callback(rest);
 }
-->$("p").click(p = function(event){})

类似-->p(event)
-->callback([event])

-->var callback = function(args) {
      if (timeout) clearTimeout(timeout);
      if (immediate) {
        var callNow = !timeout;
        timeout = setTimeout(later, wait);
        if (callNow) result = func.apply(this, args);
      } else {
        timeout = restArgs(function (func, wait, args) {
                     return setTimeout(function () {
                          return func.apply(null, args);
                }, wait);
               })(later, wait, this, args);;
      }
      return result;
};

//第一次
callback2 = function (func, wait, args) {
     return setTimeout(function () {
                return func.apply(null, args);
        }, wait);
};
restArgs(callback2)(later, wait, args);
function () {
    var length = Math.max(4 - 2, 0);
    var rest = Array(2);
    for (var index = 0; index < length; index++) {
        rest[index] = arguments[index + 2];
    }
   
   return callback2.call(this,later, wait, [args]);
}
callback2(later, wait, [args])
setTimeout(function () {
        return later.apply(null, [[event]]);
 }, wait);*/


   _.wrap = function(func, wrapper) {
        return _.partial(wrapper, func);
  };

   // 返回一个 predicate 方法的对立方法
   // 即该方法可以对原来的 predicate 迭代结果取非
    _.negate = function(predicate) {
        return function() {
          return !predicate.apply(this, arguments);
        };
    };


    // 多层函数调用从外到里f(g(h()))
    _.compose = function() {
        var args = arguments;//此arguments和下面的arguments并非一个arguments，所指的参数数组对象不一样
        var start = args.length - 1;
        return function() {
          var i = start;
          var result = args[start].apply(this, arguments);
          while (i--) result = args[i].call(this, result);
          return result;
        };
    };


    //var times=8;--times-->7;times-- -->8;
    //在处理同组异步请求返回结果时, 如果你要确保同组里所有异步请求完成之后才 执行这个函数, 这将非常有用。
    //var renderNotes = _.after(notes.length, render);
    //_.each(notes, function(note) {
    //note.asyncSave({success: renderNotes});
    //});
    _.after = function(times, func) {
        return function() {
            // 函数被触发了 times 了，则执行 func 函数
          if (--times < 1) {
            return func.apply(this, arguments);
          }
        };
  };


    //创建一个函数,调用不超过count 次。 当达到count次时，返回最后一个函数调用的结果。
    _.before = function(times, func) {
        var memo;
        return function() {
          if (--times > 0) {
            memo = func.apply(this, arguments);
          }
          if (times <= 1) func = null;
          return memo;
        };
    };

    //函数至多只能被调用一次,2是before的第一个参数
    _.once = _.partial(_.before, 2);

    _.restArgs = restArgs;



    //https://segmentfault.com/a/1190000009385816
    //propertyIsEnumerable() 方法返回一个布尔值，表示指定的属性是否可枚举
    //每个对象都有一个propertyIsEnumerable方法。此方法可以确定对象中指定的属性是否可以被for...in循环枚举，
    //但是通过原型链继承的属性除外
    //原型链继承
    //定义一个 Animal 构造函数，作为 Dog 的父类
        /*function Animal () {
            this.superType = 'Animal';
        }

        Animal.prototype.superSpeak = function () {
            alert(this.superType);
        }

        function Dog (name) {
            this.name = name;
            this.type = 'Dog';  
        }
        //改变Dog的prototype指针，指向一个 Animal 实例
        Dog.prototype = new Animal();
        //上面那行就相当于这么写
        //var animal = new Animal();
        //Dog.prototype = animal;

        Dog.prototype.speak = function () {
        　　alert(this.type);
        }
        var doggie = new Dog('jiwawa');
        doggie.superSpeak();  //Animal */
        /*首先定义了一个 Animal 构造函数，通过new Animal()得到实例，
        会包含一个实例属性 superType 和一个原型属性 superSpeak。
        另外又定义了一个Dog构造函数。然后情况发生变化，代码中加粗那一行，
        将Dog的原型对象覆盖成了 animal 实例。当 doggie 去访问superSpeak属性时，
        js会先在doggie的实例属性中查找，发现找不到，然后，js就会去doggie 的原型对象上去找，
        doggie的原型对象已经被我们改成了一个animal实例，那就是去animal实例上去找。
        先找animal的实例属性，发现还是没有 superSpeack, 最后去 animal 的原型对象上去找*/

    var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
    var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];



    var collectNonEnumProps = function(obj, keys) {
        var nonEnumIdx = nonEnumerableProps.length;
        var constructor = obj.constructor;
        //当constructor被重写，并且指向的不是一个函数的时候，proto = ObjProto
        var proto = _.isFunction(constructor) && constructor.prototype || ObjProto;

        var prop = 'constructor';
        // 如果 obj 有 `constructor` 这个属性
        // 并且该 属性 没有在 keys 数组中
        // 存入 keys 数组
        if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

        while (nonEnumIdx--) {
            prop = nonEnumerableProps[nonEnumIdx];
            // obj[prop] !== proto[prop] 判断该 key 是否来自于原型链
            // 即是否重写了原型链上的属性??不懂
            if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
                keys.push(prop);
            }
        }
    };

    _.keys = function(obj) {
        //如果不是对象，返回一个空数组
        if (!_.isObject(obj)) return [];
        // 如果浏览器支持 ES5 Object.key() 方法，该方法会忽略掉那些从原型链上继承到的属性
        // 则优先使用该方法
        if (nativeKeys) return nativeKeys(obj);
        var keys = [];
        /*hasOwnProperty：所有继承了 Object 的对象都会继承到 hasOwnProperty 方法。这个方法可以用来检测一个对象是否含有特定的自身属性；
        和 in 运算符不同，该方法会忽略掉那些从原型链上继承到的属性*/
        for (var key in obj) if (_.has(obj, key)) keys.push(key);
        // Ahem, IE < 9.
        // IE < 9 下不能用 for in 来枚举某些 key 值
        if (hasEnumBug) collectNonEnumProps(obj, keys);
        return keys;
    };



     // 返回一个对象的 keys 数组
    // 不仅仅是 自身属性
    // 还包括原型链上继承的属性
   /* function Stooge(name) {
      this.name = name;
    }
    Stooge.prototype.silly = true;
    _.allKeys(new Stooge("Moe"));
    => ["name", "silly"]*/
    _.allKeys = function(obj) {
        if (!_.isObject(obj)) return [];
        var keys = [];
        for (var key in obj) keys.push(key);
        // Ahem, IE < 9.??为什么和keys用同一个方法，不是就过滤掉原型链属性了吗?
        if (hasEnumBug) collectNonEnumProps(obj, keys);
        return keys;
    };



    // // 将一个对象的所有 values 值放入数组中
    // 仅限 对象自身属性上的value
    // 不包括原型链上的
    // 并返回该数组
    _.values = function(obj) {
        var keys = _.keys(obj);
        var length = keys.length;
        var values = Array(length);
        for (var i = 0; i < length; i++) {
          values[i] = obj[keys[i]];
        }
        return values;
    };


    //它类似于map，mapObject作用于对象。iteratee函数作用于每个属性值，并返回一个新的对象。
    _.mapObject = function(obj, iteratee, context) {
        iteratee = cb(iteratee, context);
        var keys = _.keys(obj),
        length = keys.length,
        results = {};
        for (var index = 0; index < length; index++) {
            var currentKey = keys[index];
            results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
        }
        return results;
    };


    //把一个对象转变为一个[key, value]形式的数组。返回数组形式[[key,value],[key,value]]
    _.pairs = function(obj) {
        var keys = _.keys(obj);
        var length = keys.length;
        var pairs = Array(length);
        for (var i = 0; i < length; i++) {
          pairs[i] = [keys[i], obj[keys[i]]];
        }
        return pairs;
    };


    //返回一个对象，使其键（keys）和值（values）对换。
    //对于这个操作，需要注意的是，value 值不能重复（不然后面的会覆盖前面的）
    _.invert = function(obj) {
        var result = {};
        var keys = _.keys(obj);
        for (var i = 0, length = keys.length; i < length; i++) {
            result[obj[keys[i]]] = keys[i];
        }
        return result;
    };

    //返回对象所有的方法名，并且已经排过序
    _.functions = _.methods = function(obj) {
        var names = [];
        for (var key in obj) {
            if (_.isFunction(obj[key])) names.push(key);
        }
        return names.sort();
    };



    var createAssigner = function(keysFunc, defaults) {
        return function(obj) {
            var length = arguments.length;
            if (defaults) obj = Object(obj);
            if (length < 2 || obj == null) return obj;
            for (var index = 1; index < length; index++) {
                var source = arguments[index],
                keys = keysFunc(source),
                l = keys.length;
                for (var i = 0; i < l; i++) {
                    var key = keys[i];
                    if (!defaults || obj[key] === void 0) obj[key] = source[key];
                }
            }
            return obj;
        };
    };


    _.extend = createAssigner(_.allKeys); 


    //_.extend(destination, *sources) 
   /* _.extend = function(obj) {
            //length为传的参数，如果不存在或者参数只要一个的话，直接返回obj
            var length = arguments.length;
            if (defaults) obj = Object(obj);
            if (length < 2 || obj == null) return obj;
            //如果参数不止一个，复制source对象中的所有属性覆盖到destination对象上，并且返回 destination 对象. 
            //复制从第二个开始到最后一个,如果后面的对象相比前面的对象有重复的属性，后面的对象属性会把前面的对象属性覆盖掉
            for (var index = 1; index < length; index++) {
                var source = arguments[index],
                keys = _.allKeys(source),
                l = keys.length;
                for (var i = 0; i < l; i++) {
                    var key = keys[i];
                    if (!defaults || obj[key] === void 0) obj[key] = source[key];
                }
            }
            return obj;
    };*/

    _.extendOwn = _.assign = createAssigner(_.keys);

    // 跟数组方法的 _.findIndex 类似
    // 找到对象中第一个满足条件的键值对
    // 并返回该键值对的key值
    _.findKey = function(obj, predicate, context) {
        predicate = cb(predicate, context);
        var keys = _.keys(obj), key;
        for (var i = 0, length = keys.length; i < length; i++) {
            key = keys[i];
            if (predicate(obj[key], key, obj)) return key;
        }
    };


    //判断对象中是否存在key值，存在返回true,否则返回false
    var keyInObj = function(value, key, obj) {
        return key in obj;
    };

    //返回一个object副本，只过滤出keys(有效的键组成的数组)参数指定的属性值。或者接受一个判断函数，指定挑选哪个key。
    _.pick = restArgs(function(obj, keys) {
        var result = {}, iteratee = keys[0];
        if (obj == null) return result;
        if (_.isFunction(iteratee)) {
            if (keys.length > 1) iteratee = optimizeCb(iteratee, keys[1]);
            keys = _.allKeys(obj);
        } else {
            iteratee = keyInObj;
            keys = flatten(keys, false, false);
            obj = Object(obj);
        }
        for (var i = 0, length = keys.length; i < length; i++) {
            var key = keys[i];
            var value = obj[key];
            if (iteratee(value, key, obj)) result[key] = value;
        }
        return result;
    });



    /* _.pick = function() {
            var length = Math.max(arguments.length - 1, 0),
            rest = Array(length),
            index = 0;
            for (; index < length; index++) {
                rest[index] = arguments[index + 1];
            }
            return func(arguments[0], rest);
    };
    func= function(obj, keys) {
        var result = {}, iteratee = keys[0];
        if (obj == null) return result;
        //判断参数是否为函数，如果是函数，并且剩余参数的个数大于一个
        if (_.isFunction(iteratee)) {
            if (keys.length > 1) iteratee = optimizeCb(iteratee, keys[1]);
            //iteratee=function(){obj1.apply(obj2, arguments)};
            -->用obj2对象来代替obj1，调用obj1的方法。即将obj1应用到obj2上，obj2继承obj1所有特性，即obj2的指针指向obj1方法
           延伸 var f1= function(value, key, object) {
              return value>40;
            };
            var f2= function(value, key, object) {
              return value<10;
            };
            iteratee=function(){return f1.apply(f2, arguments)};
            console.log(iteratee(50, name, {name: 23, age: 50, userid: 5}))
            keys = _.allKeys(obj);
        } else {
            //判断参数如果不是函数,不是函数的话用keyInObj判断真假
            iteratee = keyInObj;
            //有可能keys是多维数组，展开数组，获取keys
            keys = flatten(keys, false, false);
            obj = Object(obj);
        }
        for (var i = 0, length = keys.length; i < length; i++) {
            var key = keys[i];
            var value = obj[key];
            if (iteratee(value, key, obj)) result[key] = value;
        }
        return result;
    }
    //调用pick返回的是func(arguments[0], rest) rest为剩余参数组成的数组*/



    //过滤出除去keys(有效的键组成的数组)参数指定的属性值。 
    //或者接受一个判断函数，指定忽略哪个key。返回的是调用_.pick之后的补集
    _.omit = restArgs(function(obj, keys) {
        var iteratee = keys[0], context;
        if (_.isFunction(iteratee)) {
            iteratee = _.negate(iteratee);
            if (keys.length > 1) context = keys[1];
        } else {
            keys = _.map(flatten(keys, false, false), String);
            iteratee = function(value, key) {
                return !_.contains(keys, key);
            };
        }
        return _.pick(obj, iteratee, context);
    });

    _.defaults = createAssigner(_.allKeys, true);
     // _.defaults(object, *defaults) 
    //用defaults对象填充object 中的undefined属性。 并且返回这个object。
    //一旦这个属性被填充，再使用defaults方法将不会有任何效果。


    _.create = function(prototype, props) {
        var result = baseCreate(prototype);
         // 将 props 的键值对覆盖 result 对象
        if (props) _.extendOwn(result, props);
        return result;
    };


    //创建 一个浅复制（浅拷贝）的克隆object。任何嵌套的对象或数组都通过引用拷贝，不会复制。
    _.clone = function(obj) {
        if (!_.isObject(obj)) return obj;
        // 如果是数组，则用 obj.slice() 返回数组副本
        // 如果是对象，则提取所有 obj 的键值对覆盖空对象，返回
        return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
    };


    //_.chain([1,2,3,200])
    //   .tap(alert)没看懂 _.chain返回的是实例对象，怎么调用_.tap方法，
    //实例对象继承原型对象属性和方法，普通的函数没有继承
    /*var Fun = function(name){this.name = name;}
    Fun.get = function(){alert(this.name)}
    var p = new Fun("123");
    p.get() p.get()报错*/
    _.tap = function(obj, interceptor) {
        interceptor(obj);
        return obj;
    };


    //_.isMatch(object, properties) 
    //匹配object中是否含有properties，键值对存在
    _.isMatch = function(object, attrs) {
        var keys = _.keys(attrs), length = keys.length;
        if (object == null) return !length;
        var obj = Object(object);
        for (var i = 0; i < length; i++) {
            var key = keys[i];
            if (attrs[key] !== obj[key] || !(key in obj)) return false;
        }
        return true;
    };


    var eq, deepEq;
    eq = function(a, b, aStack, bStack) {
        //首先js数据类型一共为String、Number、Boolean、Array、Object、Null、Undefined,Function
        //能用===判断的有字符串、数字、布尔值，在这里===主要考虑的是0
        //a !== 0用来比较除0之外的，1/0！==1/-0，一个为正数，一个为负数，在js中我们一般认为正负0是不相等的， 
        if (a === b) return a !== 0 || 1 / a === 1 / b;
        //一个为null，即为false
        if (a == null || b == null) return false;
        //这里考虑的是NaN,如果a为NaN，b为NaN返回true,即认为NaN == NaN
        if (a !== a) return b !== b;
        var type = typeof a;
        if (type !== 'function' && type !== 'object' && typeof b != 'object') return false;
        //比较数组和对象
        return deepEq(a, b, aStack, bStack);
    };


    deepEq = function(a, b, aStack, bStack) {
        // 如果 a 和 b 是 underscore OOP 的对象
        // 那么比较 _wrapped 属性值（Unwrap）
        if (a instanceof _) a = a._wrapped;
        if (b instanceof _) b = b._wrapped;
        var className = toString.call(a);
        if (className !== toString.call(b)) return false;
        switch (className) {
            //'' + obj 会将 obj 强制转为 String
            // 根据 '' + a === '' + b 即可判断 a 和 b 是否相等,RegExp和String为相似类
            case '[object RegExp]':
            case '[object String]':
                return '' + a === '' + b;
            case '[object Number]':
                // 如果a = NaN，判断 b 是否也是 NaN 即可，即NaN===NaN
                if (+a !== +a) return +b !== +b;
                // 如果a =0，判断 +0和-0,被认为不相等，即NaN===NaN，
                //如果a不等于0，用 +a 将 Number() 形式转为基本类型,即 +Number(1) ==> 1
                return +a === 0 ? 1 / +a === 1 / b : +a === +b;
            case '[object Date]':
            // Object.prototype.toString.call(new Date())-->"[object Date]"
            //Object.prototype.toString.call("2017-3-12")-->"[object String]"
            case '[object Boolean]':
                //+new Date() -->1519884009188
                //+true -->1
                //+日期类型转换为毫秒数，+布尔值转换为0或者1
                return +a === +b;
            case '[object Symbol]':
                return SymbolProto.valueOf.call(a) === SymbolProto.valueOf.call(b);
        }

        var areArrays = className === '[object Array]';
        // 如果 a 不是数组类型
        if (!areArrays) {
             // 如果 a 不是 object 或者 b 不是 object
            // 则返回 false
            if (typeof a != 'object' || typeof b != 'object') return false;
            //此时a或者b均为对象
            var aCtor = a.constructor, bCtor = b.constructor;
            if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                               _.isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
                return false;
            }
        }
        
        //加入栈是为了比较多维数组或者对象的，栈是先进后出，一层一层比较，进栈比较相等出栈，
        //比较下一个，直到最后将原始数据出栈比较完毕,可以模拟进栈出栈了解
        aStack = aStack || [];
        bStack = bStack || [];
        var length = aStack.length;
        while (length--) {
            if (aStack[length] === a) return bStack[length] === b;
        }

        aStack.push(a);
        bStack.push(b);
        if (areArrays) {
            length = a.length;
            if (length !== b.length) return false;
            while (length--) {
                if (!eq(a[length], b[length], aStack, bStack)) return false;
            }
        } else {
            var keys = _.keys(a), key;
            length = keys.length;
            if (_.keys(b).length !== length) return false;
            while (length--) {
                key = keys[length];
                if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
            }
        }
        aStack.pop();
        bStack.pop();
        return true;
    };


    //0和-0不相等，NaN和NaN相等
     _.isEqual = function(a, b) {
        return eq(a, b);
    };


    _.isEmpty = function(obj) {
        if (obj == null) return true;
        //判断除对象之外(不包含类数组对象)
        if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
        //判断对象，但是不是类数组对象
        return _.keys(obj).length === 0;
    };

    //如果节点是元素节点，则 nodeType 属性将返回 1。
    //用两个感叹号的作用就在于将这些值转换为“等价”的布尔值
     _.isElement = function(obj) {
        return !!(obj && obj.nodeType === 1);
    };

    //判断是否是数组
    _.isArray = nativeIsArray || function(obj) {
        return toString.call(obj) === '[object Array]';
    };

    //判断是否是对象(包含函数或者对象)
    _.isObject = function(obj) {
        var type = typeof obj;
        return type === 'function' || type === 'object' && !!obj;
    };


    // 其他类型判断
     _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error', 'Symbol', 'Map', 'WeakMap', 'Set', 'WeakSet'], function(name) {
        _['is' + name] = function(obj) {
            return toString.call(obj) === '[object ' + name + ']';
        };
    });


    // _.isArguments 方法在 IE < 9 下的兼容
    // IE < 9 下对 arguments 调用 Object.prototype.toString.call 方法
    // 结果是[object Object], 而不是[object Arguments]。
    //allee 属性是 arguments 对象的一个成员
    if (!_.isArguments(arguments)) {
        _.isArguments = function(obj) {
            return _.has(obj, 'callee');
        };
    }

    //childNodes为body元素的子节点
    var nodelist = root.document && root.document.childNodes;
    if (typeof /./ != 'function' && typeof Int8Array != 'object' && typeof nodelist != 'function') {
        _.isFunction = function(obj) {
            return typeof obj == 'function' || false;
        };
    }


    _.isFinite = function(obj) {
        return !_.isSymbol(obj) && isFinite(obj) && !isNaN(parseFloat(obj));
    };

    _.isNaN = function(obj) {
        return _.isNumber(obj) && isNaN(obj);
    };

    _.isBoolean = function(obj) {
        return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
    };

    _.isNull = function(obj) {
        return obj === null;
    };

    // 判断是否是 undefined
    // undefined 能被改写 （IE < 9）
    // undefined 只是全局对象的一个属性
    // 在局部环境能被重新定义
    _.isUndefined = function(obj) {
        return obj === void 0;
    };



    //对象是否包含给定的键,等同于object.hasOwnProperty(key)
    //path可以是数组
    _.has = function(obj, path) {
        if (!_.isArray(path)) {
            return obj != null && hasOwnProperty.call(obj, path);
        }
        //下面的有什么用处？？？
        var length = path.length;
        for (var i = 0; i < length; i++) {
            var key = path[i];
            if (obj == null || !hasOwnProperty.call(obj, key)) {
                return false;
            }
            //obj = obj[key];??这两行的用处
        }
        //return !!length;
        return true;
    };



    // 如果全局环境中已经使用了 `_` 变量,previousUnderscore被更改过
    // 可以用该方法返回其他变量，继续使用 underscore 中的方法
    // var underscore = _.noConflict();
    // underscore.has(..);
    _.noConflict = function() {
        root._ = previousUnderscore;
        return this;
    };
   

    //返回传入的参数
    _.identity = function(value) {
        return value;
    };

    //创建一个函数，这个函数返回值是传入_.constant的参数。
    _.constant = function(value) {
        return function() {
            return value;
        };
    };

    //返回一个函数
    _.noop = function(){};


    //返回一个函数，这个函数返回任何传入的对象的key属性。
    //var stooge = {name: 'moe'}; _.property('name')(stooge);
    //var stooge = {'name':{'name1':{'name2':'moe'}}};console.log(_.property(['name','name1','name2'])(stooge))
    _.property = function(path) {
        if (!_.isArray(path)) {
            return shallowProperty(path);
        }
        return function(obj) {
            return deepGet(obj, path);
        };
    };

    //与property相反
    //var stooge = {name: 'moe'};_.propertyOf(stooge)('name');
    _.propertyOf = function(obj) {
        if (obj == null) {
            return function(){};
        }
        return function(path) {
            return !_.isArray(path) ? obj[path] : deepGet(obj, path);
        };
    };


    // 判断一个给定的对象是否有某些键值对
    _.matcher = _.matches = function(attrs) {
        attrs = _.extendOwn({}, attrs);
        return function(obj) {
            return _.isMatch(obj, attrs);
        };
    };

    _.times = function(n, iteratee, context) {
        var accum = Array(Math.max(0, n));
        iteratee = optimizeCb(iteratee, context, 1);
        for (var i = 0; i < n; i++) accum[i] = iteratee(i);
        return accum;
    };

    //Math.random()返回大于等于 0.0 且小于 1.0 
    _.random = function(min, max) {
        if (max == null) {
            max = min;
            min = 0;
        }
        //return min + Math.floor(Math.random() * (max - min + 1));这句话最后取的数不对,random不包含最大的数？？
        return min + Math.floor(Math.random() * (max - min));
    };

    //返回当前时间的 "时间戳"（单位 ms）
    _.now = Date.now || function() {
        return new Date().getTime();
    };


    var escapeMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '`': '&#x60;'
    };
     // escapeMap 用于编码，invert用于将键值对互换
    var unescapeMap = _.invert(escapeMap);

     //转义HTML字符串，替换&, <, >, ", ', 和 /字符
     //_.escape('Curly, Larry & Moe')
     //(?:X)在正则中表示所匹配的子组X不作为结果输出
     //正常情况(X)中的X会被作为新增的一个组序号输出，比如(A)(B)，A的序号1,B的序号2
     //如果(?:A)(B)，A将没有序号不输出,B的序号为1
     //string.replace(replaceRegexp, escaper)
     //replace（）方法的参数replacement可以是函数而不是字符串。在这种情况下，每个匹配都调用该函数，
     //它返回的字符串将替换文本使用。第一个参数表示匹配到的字符，
     // 第二个参数表示匹配到的字符最小索引位置（RegExp.index），第三个参数表示被匹配的字符串（RegExp.input）
    var createEscaper = function(map) {
        var escaper = function(match) {
            return map[match];
        };
        var source = '(?:' + _.keys(map).join('|') + ')'; 
        var testRegexp = RegExp(source);
        var replaceRegexp = RegExp(source, 'g');
        return function(string) {
            string = string == null ? '' : '' + string;
            return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
        };
    };
    //编码
    _.escape = createEscaper(escapeMap);
    //解码
    _.unescape = createEscaper(unescapeMap);


    
    //var object = {'cheese': {'nameP':{'name':'crumpets'}},stuff: function(){ return 'nonsense'; }};
    //console.log(_.result(object,['cheese','nameP','name'], 'cheese'));
    //如果第二个参数存在，则多层查找value值，直到返回正确的key-value值,path为obj的key组成的数组
    //如果查找不到，判断第三个参数是函数或者不是函数，如果是函数，调用fallback函数，prop.call(obj)-->obj继承prop,this指向obj
    //如果是值，返回值
    _.result = function(obj, path, fallback) {
        //如果path不是数组，返回数组
        if (!_.isArray(path)) path = [path];
        var length = path.length;
        //如果length= 0
        if (!length) {
            return _.isFunction(fallback) ? fallback.call(obj) : fallback;
        }
        //如果length不等于0
        for (var i = 0; i < length; i++) {
            //获取key-->value值
            var prop = obj == null ? void 0 : obj[path[i]];
            if (prop === void 0) {
                prop = fallback;
                i = length; 
            }
            obj = _.isFunction(prop) ? prop.call(obj) : prop;
        }
        return obj;
    };

    var idCounter = 0;
    //生成一个全局唯一的id
    _.uniqueId = function(prefix) {
        var id = ++idCounter + '';
        return prefix ? prefix + id : id;
    };

    // Underscore 默认采用 ERB-style 风格模板，也可以根据自己习惯自定义模板
    // 1. <%  %> 
    // 2. <%= %> 
    // 3. <%- %> 
    //\s 空白符 \S 非空白符 [\s\S]任意字符
    _.templateSettings = {
        evaluate: /<%([\s\S]+?)%>/g,
        interpolate: /<%=([\s\S]+?)%>/g,
        escape: /<%-([\s\S]+?)%>/g
    };

    //^是正则表达式匹配字符串开始位置
    var noMatch = /(.)^/;

    var escapes = {
        "'": "'",
        '\\': '\\',
        '\r': 'r',
        '\n': 'n',
        '\u2028': 'u2028',
        '\u2029': 'u2029'
    };

    var escapeRegExp = /\\|'|\r|\n|\u2028|\u2029/g;

    var escapeChar = function(match) {
        return '\\' + escapes[match];
    };

    //render是最后拼接成功的字符串，是一个函数
   /* render = function(obj,_){
            var _t,_p="",__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');}
            with(obj||{}){
                __p+='\n    ';
                for ( var i = 0; i < **.length; i++ ) { 
                     _p+="users[i].url";
                }
                return _p;
            }
        }调用--->render(data)*/
     _.template = function(text, settings, oldSettings) {
        if (!settings && oldSettings) settings = oldSettings;
        settings = _.defaults({}, settings, _.templateSettings);

        var matcher = RegExp([
            (settings.escape || noMatch).source,
            (settings.interpolate || noMatch).source,
            (settings.evaluate || noMatch).source
        ].join('|') + '|$', 'g');
        //matcher = /<%-([\s\S]+?)%>|<%=([\s\S]+?)%>|<%([\s\S]+?)%>|$/g -->$表示结束
        var index = 0;
        var source = "__p+='";
        text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {

            source += text.slice(index, offset).replace(escapeRegExp, escapeChar);
            index = offset + match.length;

            if (escape) {// -->/<%-([\s\S]+?)%>/g
                source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
            } else if (interpolate) {// -->/<%=([\s\S]+?)%>/g 是值
                source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
            } else if (evaluate) {// -->//<%([\s\S]+?)%>/g //<%for ( var i = 0; i <9; i++ ) { %>不是获取值
                source += "';\n" + evaluate + "\n__p+='";
            }

            return match;
        });
        source += "';\n";

        if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

        source = "var __t,__p='',__j=Array.prototype.join," +
        "print=function(){__p+=__j.call(arguments,'');};\n" +
        source + 'return __p;\n';
        var render;
        try {
            render = new Function('', source);
        } catch (e) {
            e.source = source;
            throw e;
        }

        var template = function(data) {
            return render.call(this, data, _);
        };

        var argument = settings.variable || 'obj';
        template.source = 'function(' + argument + '){\n' + source + '}';//这句的作用不明白

        return template;
    };



    // 非 OOP 调用 chain
    //_.chain([1, 2, 3])
    //.map(function(a) { return a * 2; })
    //.reverse().value(); // [6, 4, 2]
    // OOP 调用 chain
    // _([1, 2, 3])
    //.chain()
    //.map(function(a){ return a * 2; })
    //.first()
    //.value(); 


    //_.chain([1,2,3]) --->_([1,2,3]).chain()
    //_.chain([1, 2, 3]).tap(alert) 
    //实例要调用 tap 方法，其本身没有这个方法，那么应该来自原型链，也就是说 _.prototype 上应该有这个方法
    _.chain = function(obj) {
        //instance为_的实列对象, 无论是否 OOP 调用，都会转为 OOP 形式
        var instance = _(obj);
        instance._chain = true;
        return instance;
    };


    // 如果需要链式操作，则对 obj 运行 _.chain 方法，使得可以继续后续的链式操作
    // 如果不需要，直接返回 obj
    var chainResult = function(instance, obj) {
        return instance._chain ? _(obj).chain() : obj;
    };


    _.mixin = function(obj) {
        //返回obj对象所有的方法名，并且已经排过序
        _.each(_.functions(obj), function(name) {
            var func = _[name] = obj[name];
            //将obj中的方法(obj[name])一一拷贝到_的原型上(_.prototype[方法名])
            _.prototype[name] = function() {
                var args = [this._wrapped];
                //ArrayProto.push
                push.apply(args, arguments);
                return chainResult(this, func.apply(_, args));
            };
        });
        return _;
    };

    _.mixin(_);

   

    // 将 Array 原型链上有的方法都添加到 underscore 中
    _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
        var method = ArrayProto[name];
        _.prototype[name] = function() {
            var obj = this._wrapped;
            method.apply(obj, arguments);
            if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
            return chainResult(this, obj);
        };
    });

    // 添加 concat、join、slice 等数组原生方法给 Underscore
    _.each(['concat', 'join', 'slice'], function(name) {
        var method = ArrayProto[name];
        _.prototype[name] = function() {
            return chainResult(this, method.apply(this._wrapped, arguments));
        };
    });

     _.prototype.value = function() {
        return this._wrapped;
    };


    _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

    _.prototype.toString = function() {
        return String(this._wrapped);
    };


    if (typeof define == 'function' && define.amd) {
        define('underscore', [], function() {
            return _;
        });
    };

}());

    



    
  

