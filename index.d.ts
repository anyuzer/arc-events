import type ArcObject from "arc-object";
import type ArcArray from "arc-array";

type ListenerFn = (...args: any[]) => any;

declare class ArcEvents {
    constructor();
    clear(): void;
    setCatchAll(_f?: ListenerFn): void;
    setCatch(_event: string): void;
    on(_event: string, _listener: ListenerFn, _customId?: number): number;
    onState(_event: string, _listener: ListenerFn): void;
    once(_event: string, _listener: ListenerFn, _customId?: number): number;
    removeListener(_event: string, _listener: ListenerFn): void;
    removeAllListeners(_event?: string): void;
    getListeners(_event: string): ArcArray<[number, ListenerFn]>;
    getListeners(): ArcObject;
    emit(_event: string, _args?: any[]): void;
    emitState(_event: string): void;
    checkState(_state: string): boolean;
    clearState(_event: string): void;
    clean(_id: number): boolean;
    toString(): string;
    static mixin<T extends object>(_obj: T): T;
}

export default ArcEvents;
