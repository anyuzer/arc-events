"use strict";

let $ = {
    is:require('arc-is'),
    ArcObject:require('arc-object'),
    ArcArray:require('arc-array')
};

class ArcEvents{
    constructor(){
        this.clear(); //Initialization is the same as a reset
    }

    setCatchAll(_f){
        if($.is(_f) === 'function' || _f === undefined){
            this.catchAll = _f;
        }
    }

    setCatch(_event){
        if(!this.listeners[_event] && !this.catches[_event]){
            this.catches[_event] = new $.ArcArray();
        }
    }

    on(_event,_listener,_customId){
        var heap;
        if($.is(_listener) !== 'function'){
            throw new TypeError('Events.on requires listener to be a callable function');
        }

        if(this.listeners[_event] === undefined){
            this.listeners[_event] = new $.ArcArray();
        }
        this.listeners[_event].push(_listener);

        if($.is(this.catches[_event],true) === 'ArcArray'){
            heap = this.catches[_event];
            delete this.catches[_event];
            heap.each(function(_eventTrigger){
                _listener(..._eventTrigger);
            });
        }
    }

    onState(_event,_listener,_customId){
        if($.is(_listener) !== 'function'){
            throw new TypeError('Events.onState requires listener to be a callable function');
        }
        if(this.states[_event] === true){
            _listener();
        }
        else{
            if(this.states[_event] === undefined){
                this.states[_event] = new $.ArcArray();
            }
            this.states[_event].push(_listener);
        }
    }


    once(_event,_listener,_customId){
        if($.is(_listener) !== 'function'){
            throw new TypeError('Events.once requires listener to be a callable function');
        }
        let onceListener = function(){
            this.removeListener(_event,onceListener);
            _listener(...arguments); //Not sure if I can actually do a spread on arguments yet. WE SHALL SEE (otherwise apply will work)
        }.bind(this);
        this.on(_event,onceListener);
    }

    removeListener(_event,_listener){
        if($.is(_listener) !== 'function'){
            throw new TypeError('Events.removeListener requires listener to be a callable function')
        }
        if(this.listeners[_event] !== undefined){
            var index = this.listeners[_event].indexOf(_listener);
            if(index !== -1){
                this.listeners[_event].splice(index,1);
                if(!this.listeners[_event].length){
                    delete this.listeners[_event];
                }
            }
        }
    }

    removeAllListeners(_event){
        if(_event !== undefined){
            delete this.listeners[_event];
        }
        else{
            this.listeners = new $.ArcObject();
        }
    }

    getListeners(_event){
        if(_event !== undefined){
            return this.listeners[_event] || new $.ArcArray();
        }
        else{
            return this.listeners;
        }
    }

    emit(_event,_args){
        //Hmm
        _args = ($.is(_args) === 'array' ? _args : new $.ArcArray());
        if(this.catchAll && this.listeners[_event] === undefined && this.catches[_event] === undefined){
            _args.unshift(_event);
            this.catchAll(..._args);
        }

        var listeners = this.getListeners(_event);
        listeners.each(function(_listener){
            _listener(..._args);
        });

        if(this.catches[_event] && !listeners.length){
            this.catches[_event].push(_args);
        }

        if(!this.catchAll && this.catches[_event] === undefined && this.listeners[_event] === undefined){
            //It's uncaught...
            this.uncaughtCounter++;
        }
    }

    emitState(_event){
        if(this.states[_event] !== true){
            var listeners = this.states[_event];
            this.states[_event] = true;
            if($.is(listeners,true) === 'ArcArray'){
                listeners.each(function(_listener){
                    _listener();
                });
            }
        }
    }

    clearState(_event){
        delete this.states[_event];
    }

    clear(){
        this.listeners = new $.ArcObject();
        this.states = new $.ArcObject();
        this.catches = new $.ArcObject();
        this.catchAll = undefined;
        this.idCounter = 0;
        this.uncaughtCounter = 0;
    }

    clean(_id){

    }

    toString(){
        return '[object '+this.constructor.name+']';
    }

    static mixin(_obj){
        if($.is(_obj) !== 'object'){
            throw new TypeError('ArcEvents.mixin requires an object to mixin with: '+$.is(_obj,true));
        }
        var Events = new ArcEvents();
        var fList = new $.ArcArray('setCatchAll','setCatch','on','onState','once','removeListener','removeAllListeners','getListeners','emit','emitState','clearState','clear','clean');
        fList.each(function(_fName){
            _obj[_fName] = Events[_fName];
        });
        return _obj;
    }
}

module.exports = ArcEvents;