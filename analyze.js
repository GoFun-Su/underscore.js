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

           // Create a safe reference to the Underscore object for use below.
      var _ = function(obj) {
            if (obj instanceof _) return obj;
            if (!(this instanceof _)) return new _(obj);
            this._wrapped = obj;
      };
          
  }());