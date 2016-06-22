# arc-events [![Build Status](https://travis-ci.org/anyuzer/arc-events.svg?branch=master)](https://travis-ci.org/anyuzer/arc-events)
ES6 EventEmitter class with advanced features

## Install
```
$ npm install arc-events --save
```

## Features
* Classic on/once/emit methods
* onState/emitState for behavior around boolean states (ie. Loaded)
* Can be initialized independently
* Static mixin method for easily extending existing objects
* CatchAll and catch events without listeners
* Catch to catch potentially important events before a listener has been bound
* Optional id based management for easier cleanup

## Basic Usage
The following creates a new `ArcEvents` object and listens for an event, and fires an event

```js
//Initialize
var ArcEvents = require('arc-events');
let CustomEmitter = new ArcEvents();

//Bind a listener
CustomEmitter.on('change',function(_data1,_data2){
    //Received my event data
});

//Emit an event
CustomEmitter.emit('change',['arg1','arg2']);
```

## Advanced Usage
In certain edge cases, a basic EventEmitter may not suffice, the following examples highlight some more common contexts.

#### Example 1: Timing
It is possible inside of certain abstractions, that an async data source may be receive data before the system is ready to listen for that data. In these cases `setCatch()` can be used, to catch an event internally until a listener is bound to the object.
```js
//Initialize
var ArcEvents = require('arc-events');
var EventEmitter = new ArcEvents();

//We want to 'catch' any data events inside the EventEmitter
EventEmitter.setCatch('data');

//A fake async data source
var Data = ASYNC_DATA;

//Read a buffer every 250ms and push it to the emitter
setInterval(function(){
    while(Data.buffer()){
        EventEmitter.emit('data',[Data.read()]);
    }
},250);

//Assume the EventEmitter is propagated through the system
EventEmitter.on('data',function(_data){
    //This will be fired chronologically for every previous caught event (and clear them), as well as be bound as a future listener on data
});
````

#### Example 2: Unknown/Dynamic Events

In a service consumer, if the service is providing events dynamically, unknown events may be critical and should be handle even if they are not actively listened for. In this way `setCatchAll()` can be used to ensure no events are missed.
```js
//We imagine an RESTful consumer, that utilizes ArcEvents
var REST = RESTFUL_CONSUMER;

//We imagine it emits HTTP codes as Events, along with Response objects
REST.on(200,function(_Response){
    //OK
});

REST.on(500,function(_Response){
    //Server error
});

//But we should never trust a remote server to be reliable
REST.setCatchAll(function(_event,_Response){
    //In this case events without a listener propagate here for us to handle/log/swallow
});

```

#### Example 3: Optimal Binary States
Classically EventEmitters have a linear relationship: a listener is bound, and events fired after the listener is bound trigger the listener. If the listener is removed, those same events no longer trigger it, if another listener is added, all listeners fire chronologically in the order bound.

This is non optimal for binary states, such as loaded, or ready, or other similarily used states. In these cases, ideal behavior changes to the following:
* Bind a listener to a binary state
* Assume all listeners are of the type 'once'
* IF the state is already in the desired state, do not bind the listener at all, simply fire it immediately

ArcEvents supports this type of behavior with the `onState()` and `emitState()` methods;

```js
//We imagine a script loader
var Scripts = SCRIPT_LOADER;

//From an external standpoint, we may want to wait on a script being loaded
Scripts.onState('specialScriptLoaded',function(){
    //We know when this fires we should be safe to rely on this state
});

//From an internal standpoint we imagine our 'SpecialScript'
(function(_Scripts){
    //This code is availble now, so we fire our eventState which would allow any onState listeners to be fired, and cleared
    _Scripts.emitState('specialScriptLoaded');
})(Scripts);

//Again externally, we may rely on the same script
Scripts.onState('specialScriptLoaded',function(){
    //In this case, as our state has already resolved, this function will automatically fire without ever being bound inside the emitter
});
```

## API

### new ArcEvents()
Create a new `ArcEvents` object. Requires `new`

### .clear()
Clears the EventEmitter back to it's original state, effectively a `reset` for the Emitter.

### .setCatchAll(`listener:Function`)
Set a special listener to catch all events that do not have any listener bound. Can be unset by passing `undefined` as the listener argument.

### .setCatch(`event:String`)
Tell the EventEmitter to collect all emitted events of a certain type. These events will be stored internally until a listener is bound, at which point the listener will be called chronologically for each stored event, clearing it out of the EventEmitter.

### .on(`event:String, listener:Function [,customId:Mixed]`)
Set a callback to listen for an event being emitted. customId is an optional id, that can technically be anything that in turn can be used by the `clean()` method later to clear all listeners matching that id. In the event that no customId is set `on()` will return an id that was internally generated.

### .onState(`state:String,listener:Function`)
Set a callback to listen for a state. If that state already exists, the listener will not be bound internally and simply immediately fire, otherwise it will be bound internally until the state is emitted at which point it will be fired and cleared.

### .once(`event:String, listener:Function [,customId:Mixed]`)
Set a callback to listen for an event being emitted. When the listener fires, it will automatically be removed internally as a listener and will no longer fire on subsequent events.

### .removeListener(`event:String, listener:Function`)
### .clean(`customId:Mixed`)
These methods are for cleanup:
* `removeListener()` requires the original function to remove the listener
* `clean()` uses an id to remove the listener
```js
//Example of removing a listener
var ArcEvents = require('arc-events');
var eventEmitter = new ArcEvents();

var listener = function(){
    //A listener
};

//We bind a listener
eventEmitter.on('event',listener);

//But we can remove it because we have a reference to the original listener
eventEmitter.removeListener('event',listener);

//If we do the following
var internalId = eventEmitter.on('event',function(){
    //We do not have reference to this, so will not be able to use removeListener
});

//Instead we use clean, and the internalId
eventEmitter.clean(internalId);
```

### .removeAllListeners(`event:String`)
If a `string` is passed in, remove all listeners for that event. If `undefined` is passed in, remove all internal listeners.

### .getListeners(`event:String`)
Get an array of all listeners bound to an event.

### .emit(`event:String [,arguments:Array]`)
Emit an event, in order to trigger all listeners bound to the event. Arguments is an optional array of the argument list that will be passed into the listener.

### .emitState(`state:String`)
Emit a state and trigger/clear all listeners bound to that state. Additionally set the internal state to `true` allowing future `onState()` listeners to immediately fire.

### .clearState(`state:String`)
Clear a state, allowing listeners to once more be bound internally waiting for the state to fire.

### ArcEvents.mixin(`target:Object`)
A static method for extending existing objects. Existing object will have all of the ArcEvents methods bound to it, and will overwrite properties that are already set that have the same name.
```js
//Example
var ArcEvents = require('arc-events');

var OtherClass = new OtherClass();
ArcEvents.mixin(OtherClass);

//Now we can access an event scope for that object
OtherClass.on('what?',()=>{});
OtherClass.emit('what?');
```

## Testing
```
$ npm test
```