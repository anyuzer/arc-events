"use strict";
var tap = require('tap');
var is = require('arc-is');
var ArcArray = require('arc-array');
var ArcEvents = require('../');
var EventTest = new ArcEvents();

tap.test('ArcEvents.typeCheck',function(_test){
    _test.equal(is(EventTest),'object');
    _test.equal(is(EventTest,true),'ArcEvents');
    _test.end();
});

tap.test('ArcEvents.onState',function(_test){
    EventTest.clear();
    _test.throws(function(){
        EventTest.onState('event','STRING');
    },TypeError);

    EventTest.onState('loaded',function () {
        _test.pass('onState fired');
        _test.end();
    });
    EventTest.emitState('loaded');
});

tap.test('ArcEvents.onState2',function(_test){
    EventTest.clear();
    EventTest.emitState('loaded'); //Emit the state first

    //This should automatically fire
    EventTest.onState('loaded',function () {
        _test.pass('onState fired');
        _test.end();
    });
});

tap.test('ArcEvents.onState3',function(_test){
    EventTest.clear();
    EventTest.emitState('loaded'); //Emit the state first
    EventTest.clearState('loaded');

    //This will not fire
    EventTest.onState('loaded',function () {
        _test.fail('Should not fire');
    });

    setTimeout(function(){
        _test.pass('our state was reset');
        _test.end();
    },500);
});

tap.test('ArcEvents.setCatchAll',function(_test){
    EventTest.clear();

    //We want our test to fail if this fires
    EventTest.on('bound',function(){
        _test.fail('This function should not fire');
    });

    //If this fires our test passes succeeds
    EventTest.setCatchAll(function(){
        EventTest.setCatchAll(); //Unset our catchAll
        _test.pass('catchAll caught unbound event');
        _test.end();
    });

    //And fire
    EventTest.emit('unbound');
});

tap.test('ArcEvents.setCatch',function(_test){
    EventTest.clear();

    //We want to catch any 'packets' events inside of the Event class
    EventTest.setCatch('packets');

    //We emit an event
    EventTest.emit('packets',['SOME CAUGHT DATA']);

    //Now we bind a listener, which will immediately result in the previously caught event firing in order
    EventTest.on('packets',function(_data) {
        _test.equal(_data,'SOME CAUGHT DATA');
        _test.end();
    });
});

tap.test('ArcEvents.on',function(_test){
    EventTest.clear();

    _test.throws(function(){
        EventTest.on('event','STRING');
    },TypeError);


    //Most basic test
    EventTest.on('event',function(_data){
        _test.equal(_data,'DATA');
        _test.end();
    });

    EventTest.emit('event',['DATA']);
});

tap.test('ArcEvents.once',function(_test){
    EventTest.clear();

    _test.throws(function(){
        EventTest.once('event','STRING');
    },TypeError);


    var counter = 0;
    
    EventTest.once('once',function(){
        counter++;
        _test.equal(counter,1);
    });

    EventTest.setCatchAll(function(){
        //This should fire AFTER the other listener has been removed
        _test.equal(counter,1); //Should still be one
        _test.end();
    });

    EventTest.emit('once'); //1
    EventTest.emit('once'); //2
});

tap.test('ArcEvents.removeListener',function(_test){
    _test.throws(function(){
        EventTest.removeListener('event','STRING');
    },TypeError);


    var l1 = function(){
        _test.fail('Listener not removed');
    };

    var l2 = function(){
        _test.pass('Listener still bound');
        _test.end();
    };

    EventTest.clear();

    EventTest.on('remove',l1);
    EventTest.on('remove',l2);

    EventTest.removeListener('remove',l1);
    EventTest.emit('remove');
});

tap.test('ArcEvents.removeAllListeners',function(_test){
    var fail = function(){
        _test.fail();
    };
    EventTest.clear();
    EventTest.setCatchAll(function(){
        _test.pass('no listeners bound');
        _test.end();
    });
    EventTest.on('temp',fail);
    EventTest.on('temp',fail);
    EventTest.on('temp2',fail);
    EventTest.removeAllListeners('temp');
    EventTest.emit('temp');
});

tap.test('ArcEvents.removeAllListeners2',function(_test){
    var fail = function(){
        _test.fail();
    };
    EventTest.clear();
    EventTest.on('temp',fail);
    EventTest.on('temp2',fail);
    EventTest.removeAllListeners();
    _test.equal(EventTest.getListeners().count(),0);
    _test.end();
});

tap.test('ArcEvents.getListeners',function(_test){
    let f = function(){};
    EventTest.clear();
    EventTest.on('test',f);
    let listeners = EventTest.getListeners('test');
    _test.same(new ArcArray(f),listeners);
    _test.end();
});

tap.test('ArcEvents.mixin',function(_test){
    _test.throws(function(){
        ArcEvents.mixin('STRING');
    },TypeError);

    var obj = {};
    var mix = ArcEvents.mixin(obj);

    _test.same(mix.on,EventTest.on);
    _test.same(mix.onState,EventTest.onState);
    _test.same(mix.setCatchAll,EventTest.setCatchAll);
    _test.same(mix.setCatch,EventTest.setCatch);
    _test.same(mix.on,EventTest.on);
    _test.same(mix.once,EventTest.once);
    _test.same(mix.removeListener,EventTest.removeListener);
    _test.same(mix.removeAllListeners,EventTest.removeAllListeners);
    _test.same(mix.getListeners,EventTest.getListeners);
    _test.equal(obj,mix);

    _test.end();
});

tap.test('ArcEvents.misc',function(_test){
    EventTest.clear();
    EventTest.emit('anEvent',['X']);
    _test.end();
});