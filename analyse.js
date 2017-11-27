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
    
    var optimizeCb = function(func, context, argCount) {
   	 	if (context === void 0) return func;
    		switch (argCount) {
      			case 1: return function(value) {
        					return func.call(context, value);
      				};
     		 	// The 2-parameter case has been omitted only because no current consumers
      			// made use of it.
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
          
  }());