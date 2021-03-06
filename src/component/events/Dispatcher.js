/**
 * @classdesc 事件分派器。用来定义原生或自定义事件，以代理方式高效的处理事件。
 * 
 * @class 
 * @param {data} 扩展数据
 */
function Dispatcher(data) {
	/**
	 * 用来存放在当前分派器上注册的事件，优化派发性能
	 * @type {Object}
	 */
	this.__eventMap = {};

	/**
	 * 初始化回调。由系统自动调用
	 * @type {Function}
	 */
	this.onInit = null;

	Util.ext(this,data);
};
Util.ext(Dispatcher.prototype,{
	/**
	 * 派发事件
	 * @param  {String} eventStr 事件名
	 * @param  {Object} e 事件对象
	 * @param {Object} extra 事件扩展属性，属性会被扩展到对象属性中
	 */
	dispatch:function(eventStr,e,extra){
		var t = e.target;
        var events = this.__eventMap[eventStr];
        if(!events)return;
        
        do{
            if(this.fireEvent(t,events,e,eventStr,extra) === false){
                break;
            }

            t = t.parentNode;
        }while(t.tagName && t.tagName != 'HTML');
	},
    fireEvent:function(target,events,e,type,extra){
        for(var i=events.length;i--;){
            if(events[i].el === target)break;
        }
        if(i < 0)return;

        //callback
        var bubbles = Handler.evalEventExp(events[i],e,type,extra);

        return bubbles;//是否冒泡
    },
	addEvent:function(type,meta){
		var events = this.__eventMap[type];
		if(!events)events = this.__eventMap[type] = [];
		events.push(meta);
		meta.dispatcher = this;
	},
	_delEvent:function(type,meta){
		var events = this.__eventMap[type];
		for(var i=events.length;i--;){
            if(events[i].id === meta.id)break;
        }
        events.splice(i,1);
	}
});
