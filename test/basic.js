"use strict";
var tap = require('tap');
var is = require('arc-is');
var ArcEvents = require('../');
var EventTest = new ArcEvents();

tap.test('Events.typeCheck',function(_test){
    _test.equal(is(EventTest),'object');
    _test.equal(is(EventTest,true),'ArcEvents');
    _test.end();
});

class X{
    constructor(){

    }
}

var Y = new X();
ArcEvents.mixin(Y);
console.log(Y);


// //Let's just do some temporary testing here (before writing full tests)
// var counter = 0;
// var Test = new Events();
// Test.onState('testState',function(){
//     counter++;
//     console.log(counter,'testState');
// });
//
// Test.setCatchAll(function(){
//     counter++;
//     console.log(counter,arguments);
// });
//
// Test.on('testEvent',function(){
//     counter++;
//     console.log(counter,'testEvent');
// });
//
// Test.once('testEvent',function(){
//     counter++;
//     console.log(counter,'testOnce');
// });
//
// Test.emitState('testState');
// Test.emit('unknown',['x','y']);
// Test.emit('testEvent',['a','b']);
// Test.emit('testEvent',['c','d']);