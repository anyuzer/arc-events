const is = require('arc-is');
const ArcArray = require('arc-array');

const ArcEvents = require('../index');

describe('ArcEvents tests', () => {
    const EventTest = new ArcEvents();

    test('Should instantiate to the correct types', () => {
        expect(is(EventTest)).toBe('object');
        expect(is(EventTest,true)).toBe('ArcEvents');
    })

    test('onState should fire a singular time when a state is emitted', () => {
        const callback = jest.fn();
        EventTest.clear();
        EventTest.onState('loaded', callback);
        EventTest.emitState('loaded');
        EventTest.emitState('loaded');
        expect(callback).toHaveBeenCalledTimes(1)
    })

    test('onState callback should automatically fire when bound, if state has already occurred', () => {
        const callback = jest.fn();
        EventTest.clear();
        EventTest.emitState('loaded');
        EventTest.onState('loaded', callback);
        expect(callback).toHaveBeenCalledTimes(1)
    })

    test('onState should be able to be cleared, and wait to be triggered again', () => {
        const callback = jest.fn();
        EventTest.clear();
        EventTest.emitState('loaded');
        EventTest.clearState('loaded');
        EventTest.onState('loaded', callback);
        expect(callback).not.toHaveBeenCalled();
    })

    test('checkState should be able to check whether a state has occurred', () => {
        EventTest.clear();
        expect(EventTest.checkState('loaded')).toBe(false);
        EventTest.emitState('loaded');
        expect(EventTest.checkState('loaded')).toBe(true);
    })

    test('catchAll should catch events fired without listeners', () => {
        const boundListener = jest.fn();
        const catchAllListener = jest.fn();
        EventTest.clear();
        EventTest.on('bound', boundListener);
        EventTest.setCatchAll(catchAllListener);
        EventTest.emit('nonsense');
        expect(boundListener).not.toHaveBeenCalled();
        expect(catchAllListener).toHaveBeenCalledTimes(1);
    })

    test('we should be able to catch fired events inside of the events class', () => {
        const notCalled = jest.fn();
        expect.assertions(3);
        EventTest.clear();
        EventTest.setCatch('packets');
        EventTest.emit('packets',['DATA']);
        EventTest.emit('packets', ['DATA']);
        EventTest.on('packets', (_data) => {
            expect(_data).toBe('DATA');
        })
        EventTest.on('packets', notCalled);
        expect(notCalled).not.toHaveBeenCalled();
    })


    test('basic on event test', () => {
        expect.assertions(1);
        EventTest.clear();
        EventTest.on('event', (data) => {
            expect(data).toBe('DATA')
        });
        EventTest.emit('event', ['DATA']);
    })

    test('once will trigger a listener once and then remove it', () => {
        const listener = jest.fn();
        EventTest.clear();
        EventTest.once('event', listener);
        EventTest.emit('event');
        EventTest.emit('event');
        expect(listener).toHaveBeenCalledTimes(1);
    })

    test('successfully removing a listener should prevent it from being called', () => {
        const listener1 = jest.fn();
        const listener2 = jest.fn();
        EventTest.clear();
        EventTest.on('remove', listener1);
        EventTest.on('remove', listener2);
        EventTest.removeListener('remove', listener1);
        EventTest.emit('remove');
        expect(listener1).not.toHaveBeenCalled();
        expect(listener2).toHaveBeenCalledTimes(1);
    })

    test('removeAllListeners from a single event', () => {
        const listener1 = jest.fn();
        const listener2 = jest.fn();
        EventTest.clear();
        EventTest.on('remove', listener1);
        EventTest.on('remove', listener2);
        EventTest.removeAllListeners('remove');
        EventTest.emit('remove');
        expect(listener1).not.toHaveBeenCalled();
        expect(listener2).not.toHaveBeenCalled();
    })

    test('removeAllListeners from all events', () => {
        const listener1 = jest.fn();
        const listener2 = jest.fn();
        EventTest.clear();

        EventTest.on('remove', listener1);
        EventTest.on('remove2', listener2);
        EventTest.removeAllListeners();

        EventTest.emit('remove');
        EventTest.emit('remove2');
        expect(listener1).not.toHaveBeenCalled();
        expect(listener2).not.toHaveBeenCalled();
    })

    test('use an eventId to remove a specific event listener', () => {
        const listener1 = jest.fn();
        const listener2 = jest.fn();
        EventTest.clear();

        const eventId = EventTest.on('remove', listener1);
        EventTest.on('remove', listener2);
        EventTest.emit('remove');

        EventTest.clean(eventId);
        EventTest.emit('remove');

        expect(listener1).toHaveBeenCalledTimes(1);
        expect(listener2).toHaveBeenCalledTimes(2);
    })

    test('use a customId to manage listeners', () => {
        const listener1 = jest.fn();
        EventTest.clear();

        EventTest.on('remove', listener1, 'custom');
        EventTest.emit('remove');
        EventTest.clean('custom');
        EventTest.emit('remove');

        expect(listener1).toHaveBeenCalledTimes(1);
    })

    test('get listeners for a specific event, or all listeners', () => {
        EventTest.clear();
        EventTest.on('remove', ()=>{});
        expect(EventTest.getListeners('remove').length).toBe(1);
        expect(EventTest.getListeners()['remove'].length).toBe(1);
    })

    test('mixin should bind methods to a new object', () => {
        const obj = {};

        ArcEvents.mixin(obj);
        const mixMethods = ['setCatchAll','setCatch','on','onState','once','removeListener','removeAllListeners','getListeners','emit','emitState','clearState','clear','clean'];
        mixMethods.forEach((_method) => {
            expect(is(obj[_method])).toBe('function');
        })
    })

    test('Type Errors should be thrown when a listener is not callable', () => {
        EventTest.clear();
        expect(() => { EventTest.on('something','something'); }).toThrowError();
        expect(() => { EventTest.onState('something','something'); }).toThrowError();
        expect(() => { EventTest.once('something','something'); }).toThrowError()
        expect(() => { EventTest.removeListener('something','something'); }).toThrowError()
        expect(() => { ArcEvents.mixin('something'); }).toThrowError()
    })
});
