/**
 * Form utilities — name path handling, immutable store get/set, and the
 * NameMap keyed by string[] paths.
 *
 * Ported from rc-field-form's valueUtil/NameMap (semantics kept, code
 * rewritten for this repo's conventions: no runtime deps, Solid-friendly).
 */
export type NamePathSegment = string | number;
/** Internal normalized path — always a flat array of string|number. */
export type InternalNamePath = NamePathSegment[];
/** User-facing name: string ('a.b' NOT supported — plain key), number, or array. */
export type NamePath = string | number | InternalNamePath;
/**
 * Convert a user-provided name into the internal flat array format.
 * 'a' => ['a']; 123 => [123]; ['a', 123] => ['a', 123]
 * Only string/number segments are supported by the public contract.
 */
export declare function getNamePath(path?: NamePath | null): InternalNamePath;
type AnyRecord = Record<string, any>;
/** Get value at path. Returns undefined for any missing segment. */
export declare function getValue(store: unknown, namePath: InternalNamePath): any;
/**
 * Immutable set: returns a new store with `value` placed at `namePath`,
 * shallow-cloning only the containers along the path. `remove` (true)
 * deletes the leaf instead (rc-util `set` third-flag semantics).
 */
export declare function setValue<T>(store: T, namePath: InternalNamePath, value: any, remove?: boolean): T;
/** Clone `store` restricted to the given paths (missing paths stay missing). */
export declare function cloneByNamePathList(store: unknown, namePathList: InternalNamePath[]): AnyRecord;
/**
 * Is `namePath` a super-set of (or equal to) `subNamePath`?
 * With partialMatch, [a, b] matches [a, b, c].
 */
export declare function matchNamePath(namePath?: InternalNamePath | null, subNamePath?: InternalNamePath | null, partialMatch?: boolean): boolean;
/** Does `namePathList` include `namePath` (exact, or partial when enabled)? */
export declare function containsNamePath(namePathList: InternalNamePath[] | null | undefined, namePath: InternalNamePath, partialMatch?: boolean): boolean;
/** Move array item (pure — returns a new array). */
export declare function move<T>(array: T[], from: number, to: number): T[];
/**
 * Escape hatch for custom components whose `onChange` emits an Event rather
 * than a bare value: read `event.target[valuePropName]` when possible,
 * otherwise pass the first arg through unchanged.
 */
export declare function defaultGetValueFromEvent(valuePropName: string, ...args: any[]): any;
/**
 * A Map keyed by NamePath (string[]). `type:value` normalization keeps
 * number 0 and string '0' distinct.
 */
export declare class NameMap<V> {
    private kvs;
    set(key: InternalNamePath, value: V): void;
    get(key: InternalNamePath): V | undefined;
    update(key: InternalNamePath, updater: (prev?: V) => V): void;
    has(key: InternalNamePath): boolean;
    delete(key: InternalNamePath): void;
    map<T>(mapper: (item: {
        key: InternalNamePath;
        value: V;
    }) => T): T[];
    forEach(consumer: (item: {
        key: InternalNamePath;
        value: V;
    }) => void): void;
    get size(): number;
}
export {};
