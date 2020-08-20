const is = require('arc-is');
const ArcObject = require('arc-object');
const ArcArray = require('arc-array');

class ArcEvents{
    constructor(){
        this.clear(); //Initialization is the same as a reset
    }

    clear(){
        this.listeners = new ArcObject();
        this.states = new ArcObject();
        this.catches = new ArcObject();
        this.catchAll = undefined;
        this.idCounter = 0;
        this.uncaughtCounter = 0;
    }

    setCatchAll(_f){
        if(is(_f) === 'function' || is(_f) === 'asyncfunction' || _f === undefined){
            this.catchAll = _f;
        }
    }

    setCatch(_event){
        if(!this.listeners[_event] && !this.catches[_event]){
            this.catches[_event] = new ArcArray();
        }
    }

    on(_event,_listener,_customId){
        let heap;
        if(is(_listener) !== 'function' && is(_listener) !== 'asyncfunction'){
            throw new TypeError('Events.on requires listener to be a callable function');
        }

        if(this.listeners[_event] === undefined){
            this.listeners[_event] = new ArcArray();
        }

        if(!_customId){
            this.idCounter++;
            _customId = this.idCounter;
        }
        this.listeners[_event].push([_customId,_listener]);

        if(is(this.catches[_event],true) === 'ArcArray'){
            heap = this.catches[_event];
            delete this.catches[_event];
            heap.forEach((_eventTrigger)=>{
                _listener(..._eventTrigger);
            });
        }

        return _customId;
    }

    onState(_event,_listener){
        if(is(_listener) !== 'function' && is(_listener) !== 'asyncfunction'){
            throw new TypeError('Events.onState requires listener to be a callable function');
        }
        if(this.states[_event] === true){
            _listener();
        }
        else{
            if(this.states[_event] === undefined){
                this.states[_event] = new ArcArray();
            }
            this.states[_event].push(_listener);
        }
    }


    once(_event,_listener,_customId){
        if(is(_listener) !== 'function' && is(_listener) !== 'asyncfunction'){
            throw new TypeError('Events.once requires listener to be a callable function');
        }
        let onceListener = () => {
            this.removeListener(_event,onceListener);
            _listener(...arguments); //Not sure if I can actually do a spread on arguments yet. WE SHALL SEE (otherwise apply will work)
        };
        return this.on(_event,onceListener,_customId);
    }

    removeListener(_event,_listener){
        if(is(_listener) !== 'function' && is(_listener) !== 'asyncfunction'){
            throw new TypeError('Events.removeListener requires listener to be a callable function')
        }
        if(this.listeners[_event] !== undefined){
            this.listeners[_event].forEach((_data,_index,_array) => {
                let [id,listener] = _data;
                if(listener === _listener){
                    _array.splice(_index,1);
                    if(!_array.length){
                        delete this.listeners[_event];
                    }
                    return false;
                }
            });
        }
    }

    removeAllListeners(_event){
        if(_event !== undefined){
            delete this.listeners[_event];
        }
        else{
            this.listeners = new ArcObject();
        }
    }

    getListeners(_event){
        if(_event !== undefined){
            return this.listeners[_event] || new ArcArray();
        }
        else{
            return this.listeners;
        }
    }

    emit(_event,_args){
        //Hmm
        _args = (is(_args) === 'array' ? _args : new ArcArray());
        if(this.catchAll && this.listeners[_event] === undefined && this.catches[_event] === undefined){
            _args.unshift(_event);
            this.catchAll(..._args);
        }

        const listeners = this.getListeners(_event);
        listeners.forEach((_array) => {
            let [id,listener] = _array;
            listener(..._args);
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
            const listeners = this.states[_event];
            this.states[_event] = true;
            if(is(listeners,true) === 'ArcArray'){
                listeners.forEach((_listener) => {
                    _listener();
                });
            }
        }
    }

    checkState(_state){
        return (this.states[_state] === true ? true : false);
    }

    clearState(_event){
        delete this.states[_event];
    }

    clean(_id){
        let cleaned = false;
        this.listeners.forEach((_listeners,_event) => {
            let _continue = true;
            if(is(_listeners,true) === 'ArcArray'){
                _listeners.forEach((_data,_index,_listenerArray) => {
                    let [id,listener] = _data;
                    if(id === _id){
                        _continue = false;
                        cleaned = true;
                        _listenerArray.splice(_index,1);
                        if(!_listenerArray.length){
                            delete this.listeners[_event];
                        }
                        return false;
                    }
                });
            }
            return _continue;
        });
        return cleaned;
    }

    toString(){
        return '[object '+this.constructor.name+']';
    }

    static mixin(_obj){
        if(is(_obj) !== 'object'){
            throw new TypeError('ArcEvents.mixin requires an object to mixin with: '+is(_obj,true));
        }
        const Events = new ArcEvents();
        const fList = new ArcArray('setCatchAll','setCatch','on','onState','once','removeListener','removeAllListeners','getListeners','emit','emitState','clearState','clear','clean');
        fList.forEach((_fName) => {
            _obj[_fName] = Events[_fName].bind(Events);
        });
        return _obj;
    }
}

module.exports = ArcEvents;