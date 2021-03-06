/**
 * @classdesc 过渡类。用于提供CSS3动画转换或js动画过渡回调接口
 * @class 
 */
var TRANSITIONS = {
    "transition"      : "transitionend",
    "OTransition"     : "oTransitionEnd",
    "MozTransition"   : "mozTransitionend",
    "WebkitTransition": "webkitTransitionEnd"
};

function getStyle(cs,style){
    var rs = '';

    for(var i=PREFIX.length;i--;){
        rs = cs[PREFIX[i]+style];
        if(rs)return rs;
    }
}
var PREFIX = ['-webkit-','-moz-','-o-','-ms-',''];
var TESTNODE;
function Transition (type,target,hook) {
    if(!TESTNODE){
        TESTNODE = document.createElement('div');
        document.body.appendChild(TESTNODE);
    }
    var v = target;
    if(!hook || hook.css !== false){
        TESTNODE.className = (type + '-transition');
        TESTNODE.style.left = '-9999px';
        var cs = window.getComputedStyle(TESTNODE,null);
        var durations = getStyle(cs,'transition-duration').split(',');
        var delay = getStyle(cs,'transition-delay').split(',');
        var max = -1;
        for(var i=durations.length;i--;){
            var du = parseFloat(durations[i]);
            var de = parseFloat(delay[i]);
            if(du+de > max)max = du+de;
        }

        if(max > 0){
            var expNodes = null;
            var comp = null;
            if(target instanceof Directive){
                expNodes = target.component.__expNodes;
                comp = target.component;
            }else{
                expNodes = target.__expNodes;
                comp = target;
            }
            if(expNodes.length<1 && comp.parent){
                expNodes = comp.parent.__expNodes;
            }
            for(var i=expNodes.length;i--;){
                var expNode = expNodes[i];
                if(expNode.attrName === 'class'){
                    expNode.origin += ' '+ type + '-transition';
                }
            }
            v.el.className += ' ' +type + '-transition';

            this.__longest = max;

            var te = null;
            for (var t in TRANSITIONS){
                if (v.el.style[t] !== undefined){
                    te = TRANSITIONS[t];
                    break;
                }
            }
            v.el.addEventListener(te,this.__done.bind(this),false);

            this.__css = true;
        }
    }else{
    	this.__css = false;
    }

    this.__direct = target;
    this.__view = v;
    this.__hook = hook || {};
    this.__type = type;
    
}
Transition.prototype = {
	enter:function(){
		this.__start = 'enter';

        var clsName = this.__view.el.className.replace(this.__type + '-leave','');
        this.__view.el.className = clsName;

		if(this.__css){
            clsName += ' ' +this.__type + '-enter';
            this.__view.el.className = clsName;
        }

        //exec...
        if(this.__direct.enter){
        	this.__direct.enter();
        }
        if(this.__hook.enter){
        	this.__hook.enter.call(this.__direct,this.__done.bind(this));
        }

        if(this.__css){
            this.__view.el.offsetHeight;
            var clsName = this.__view.el.className.replace(this.__type + '-enter','');
            this.__view.el.className = clsName;
        }
        
	},
	__enterDone:function(){
		if(this.__direct.postEnter){
            this.__direct.postEnter();
        }
        if(this.__hook.postEnter){
            this.__hook.postEnter.call(this.__direct,this.__done.bind(this));
        }
	},
	leave:function(){
		this.__start = 'leave';

        var clsName = this.__view.el.className.replace(this.__type + '-leave','');
        this.__view.el.className = clsName;

		if(this.__css){
            clsName += ' ' +this.__type + '-leave';
            this.__view.el.className = clsName;
        }
        //exec...
        if(this.__direct.leave){
            this.__direct.leave();
        }
        if(this.__hook.leave){
        	this.__hook.leave.call(this.__direct,this.__done.bind(this));
        }
        
	},
	__leaveDone:function(){
		if(this.__direct.postLeave){
            this.__direct.postLeave();
        }
        if(this.__hook.postLeave){
            this.__hook.postLeave.call(this.__direct,this.__done.bind(this));
        }
        if(this.__css){
            this.__view.el.offsetHeight;
            var clsName = this.__view.el.className.replace(this.__type + '-leave','');
            this.__view.el.className = clsName;
        }
	},
	__done:function(e){
		if(e && e.elapsedTime < this.__longest)return;
        if(!this.__start)return;

        switch(this.__start){
        	case 'enter':
        		this.__enterDone();
        		break;
        	case 'leave':
        		this.__leaveDone();
        		break;
        }

        this.__start = '';
	}
};