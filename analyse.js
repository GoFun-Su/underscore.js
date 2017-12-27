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

          
}());


