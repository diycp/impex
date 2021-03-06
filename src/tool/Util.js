/**
 * 工具类，为系统提供基础服务
 * 该类来自于soya2d.js
 */
var Util = new function () {
	/**
     * 继承
     * @param {function} child 子类
     * @param {function} parent 父类
     */
	this.inherits = function(child,parent){
        child.prototype = Object.create(parent.prototype);
        child.prototype.constructor = child;
        child.prototype._super = parent.prototype;
	}

    this.ext = function(to,from){
        var keys = Object.keys(from);
        for (var i=keys.length;i--;) {
            var k = keys[i];
            to[k] = from[k];
        }
    }

    this.isObject = function(obj){
        return typeof(obj) === 'object' && obj !== null;
    }

    /**
     * 验证对象是不是数组
     * @param  {Object}  obj 
     * @return {Boolean}
     */
    this.isArray = function(obj){
        return obj instanceof Array;
    }

    this.isString = function(obj){
        return typeof(obj) === 'string';
    }

    this.isUndefined = function(obj){
        return obj === undefined;
    }

    this.isFunction = function(obj){
        return obj instanceof Function;
    }

    var compiler = document.createElement('div');

    this.isDOMStr = function(template){
        compiler.innerHTML = template;
        if(compiler.children[0])return true;
        return false;
    }

    /**
     * 验证对象是不是DOM节点
     * @param  {Object}  obj 
     * @type {Boolean}
     */
    this.isDOM = typeof HTMLElement === 'object' ?
                function(obj){
                    return obj instanceof HTMLElement;
                } :
                function(obj){
                    return obj && typeof obj === 'object' && obj.nodeType && typeof obj.nodeName === 'string';
                }

    function loadError(){
        LOGGER.error('can not fetch remote data of : '+this.url);
    }
    function loadTimeout(){
        LOGGER.error('load timeout : '+this.url);
    }
    function onload(){
        if(this.status===0 || //native
        ((this.status >= 200 && this.status <300) || this.status === 304) ){
            var txt = this.responseText;
            compiler.innerHTML = txt;
            var tmpl = compiler.querySelector('template').innerHTML;
            var comp = compiler.querySelector('script#impex').innerHTML;
            var links = compiler.querySelectorAll('link[rel="impex"]');

            //register requires
            for(var i=links.length;i--;){
                var lk = links[i];
                var type = lk.getAttribute('type');
                var href = lk.getAttribute('href');
                impex.component(type,href);
            }

            var cbks = requirements[this.url];
            var url = this.url;
            cbks.forEach(function(cbk){
                var __impex_comp_eval = null;
                var evl = eval;
                evl('__impex_comp_eval = '+comp);//scope call
                if(!window.__impex_comp_eval)
                    LOGGER.error('can not find component defination of : '+url);
                var data = window.__impex_comp_eval();
                cbk([tmpl,data]);
            });
            requirements[this.url] = null;
        }
    }

    var requirements = {};
    this.loadComponent = function(url,cbk,timeout){
        if(!requirements[url]){
            requirements[url] = [];
            requirements[url].push(cbk);
        }else{
            requirements[url].push(cbk);
            return;
        }        

        var xhr = new XMLHttpRequest();
        xhr.open('get',url,true);
        xhr.timeout = timeout || 5000;
        xhr.ontimeout = loadTimeout;
        xhr.onerror = loadError;
        if(xhr.onload === null){
            xhr.onload = onload;
        }else{
            xhr.onreadystatechange = onload;
        }
        // xhr.cbk = cbk;
        xhr.url = url;
        xhr.send(null);
    }

    this.immutable = function(v){
        if(typeof v === 'object'){
            var o = JSON.parse(JSON.stringify(v));
            return o;
        }
        return v;
    }


    this.compileViewOf = function(component,__nodes){
        var data = Scanner.scan(__nodes,component);
        //link exp & obj
        Builder.link(component,data.exps);
        //render exps
        Renderer.renderExpNodes(data.exps);
        //init children
        var children = data.comps;
        for(var i = children.length;i--;){
            children[i].init();
        }
        //init directs
        var directs = data.directs;
        for(var i = directs.length;i--;){
            directs[i].init();
        }
        //display children
        for(var i = 0;i<children.length;i++){
            if(!children[i].__url)
                children[i].mount();
        }
        //active directs
        for(var i = directs.length;i--;){
            directs[i].active();
        }
    }
}