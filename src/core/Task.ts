import { TaskResult } from "./TaskResult";
import { FailureResult, SuccessResult, TResult } from "./types";

type FailureEventName = "failure";
type SuccessEventName = "success";
type CompleteEventName = "complete";
type TaskEventName = FailureEventName | SuccessEventName | CompleteEventName;

type RegisteredFailureEvent = [FailureEventName, (result: FailureResult) => void];
type RegisteredSuccessEvent<T> = [SuccessEventName, (result: SuccessResult<T>) => void];
type RegisteredCompleteEvent<T> = [CompleteEventName, (result: TResult<T>) => void];
type RegisteredErrorEvent = ["error", (err?: string | Error | any) => void];

type RegisteredEvent<T> = RegisteredFailureEvent | RegisteredSuccessEvent<T> | RegisteredCompleteEvent<T> | RegisteredErrorEvent;

export class Task<T> {

    private readonly namespace?: string;
    private readonly method?: string;
    private _onFailure?: any;
    private readonly _listeners: Array<RegisteredEvent<T>>;

    constructor(namespace?: string, method?: string) {
        this.namespace = namespace;
        this.method = method;
        this._listeners = [];
    }

    /**
     * Registers an event listener callback, the same event & callback can be registered more than once. 0.2.0
     *
     * @param {TaskEventName | "error"} eventName
     * @param {(result: TResult<T>) => void} callback callback to register for the event name
     * @returns {this}
     * @memberof Task
     */
    public on(eventName: "error", callback: (err?: string | Error) => void): this;
    public on(eventName: "failure", callback: (result: FailureResult) => void): this;
    public on(eventName: "success", callback: (result: SuccessResult<T>) => void): this;
    public on(eventName: "complete", callback: (result: TResult<T>) => void): this;
    public on<E extends TaskEventName | "error">(eventName: E,
        callback: E extends "failure" ?
            (result: FailureResult) => void :
            E extends "success" ?
            (result: SuccessResult<T>) => void :
            E extends "complete" ?
            (result: TResult<T>) => void :
            (err?: string | Error) => void): this {

        if (!["failure", "success", "complete"].includes(eventName))
            throw new Error(`Task.on(eventName, ...): unknown task event name: ${eventName}`);
        if (typeof callback !== "function")
            throw new Error(`Task.on(..., callback): invalid callback - must be a function`);

        this._listeners.push([eventName, callback] as RegisteredEvent<T>);

        return this;
    }

    /**
     * Removes all registered instances of the event callback. 0.2.0
     *
     * @param {TaskEventName | "error"} eventName
     * @param {(result: TResult<T>) => void} callback callback that was registered for the event name
     * @returns {this}
     * @memberof Task
     */
    public off(eventName: "error", callback: (err?: string | Error) => void): this;
    public off(eventName: "failure", callback: (result: FailureResult) => void): this;
    public off(eventName: "success", callback: (result: SuccessResult<T>) => void): this;
    public off(eventName: "complete", callback: (result: TResult<T>) => void): this;
    public off<E extends TaskEventName>(eventName: E,
        callback: E extends "failure" ?
            (result: FailureResult) => void :
            E extends "success" ?
            (result: SuccessResult<T>) => void :
            E extends "complete" ?
            (result: TResult<T>) => void :
            (err?: string | Error) => void): this {

        if (!["failure", "success", "complete"].includes(eventName))
            throw new Error(`Task.off(eventName, ...): unknown task event name: ${eventName}`);
        if (typeof callback !== "function")
            throw new Error(`Task.off(..., callback): invalid callback - must be a function`);

        for (let i = this._listeners.length - 1; i >= 0; i--) {
            let [n, cb] = this._listeners[i];
            if (n === eventName && cb === callback) this._listeners.splice(i, 1);
        }

        return this;
    }

    /**
     * Synchronous try/catch (akin to 'run'). Runs the passed function and wraps result in a TaskResult if it isn't already a TaskResult.
     *
     * @param {(() => T | TResult<T>)} fn
     * @param {boolean} [directReturn=false] if result of fn is a TaskResult, return it directly, otherwise return its value
     * @returns {TResult<T>}
     * @memberof Task
     */
    public try(fn: () => T | TResult<T>, directReturn = false): TResult<T> {
        try {
            const result = fn();
            if (!directReturn && (result instanceof TaskResult)) {
                if (result.success) {
                    return this.success(result.value);
                } else {
                    return this.failure(<FailureResult>result);
                }
            }
            return this.success(result as T extends void ? undefined : T);
        } catch (e) {
            return this.failure(e);
        }
    }

    /**
     * Asynchronous try/catch (akin to 'runAsync'). Runs the passed function and wraps result in a TaskResult if it isn't already a TaskResult.
     *
     * @param {(() => Promise<T | TResult<T>>)} fn
     * @param {boolean} [directReturn=false] if result of fn is TaskResult | Promise<TaskResult>, return it directly, otherwise return its value
     * @returns {Promise<TResult<T>>}
     * @memberof Task
     */
    public async tryAsync(fn: () => Promise<T | TResult<T>>, directReturn = false): Promise<TResult<T>> {
        try {
            const result = await fn();
            if (!directReturn && (result instanceof TaskResult)) {
                if (result.success) {
                    return this.success(result.value);
                } else {
                    return this.failure(<FailureResult>result);
                }
            }
            return this.success(result as T extends void ? undefined : T);
        } catch (e) {
            return await this.failureAsync(e);
        }
    }

    public success(value: T extends void ? void : T): SuccessResult<T> {
        const result = new TaskResult<T>(this.namespace, this.method, true, value as any) as SuccessResult<T>;
        this._fireEvents("success", result);
        return result;
    }

    public failure(error?: string | Error | FailureResult): FailureResult;
    public failure(error: string | Error, innerResult: FailureResult): FailureResult;
    public failure(errorOrResult?: string | Error | FailureResult, innerResult?: FailureResult): FailureResult {
        if (this._onFailure) try { this._onFailure(); } catch {}
        return <FailureResult>(new TaskResult(this.namespace, this.method, false, <any>errorOrResult, <any>innerResult));
    }

    public async failureAsync(error?: string | Error | FailureResult): Promise<FailureResult>;
    public async failureAsync(error: string | Error, innerResult: FailureResult): Promise<FailureResult>;
    public async failureAsync(errorOrResult?: string | Error | FailureResult, innerResult?: FailureResult): Promise<FailureResult> {
        if (this._onFailure) try { await this._onFailure(); } catch {}
        return <FailureResult>(new TaskResult(this.namespace, this.method, false, <any>errorOrResult, <any>innerResult));
    }

    public onFailure(callback: (() => any)): void {
        console.warn(`Task.onFailure(callback) is being deprecated - use Task.on("failure", (result: FailureResult) => void); instead`);
        this._onFailure = callback;
    }

    // 0.2.0
    public static Success<T extends void>(taskName: string, value?: T): SuccessResult<T>;
    public static Success<T>(taskName: string, value: T): SuccessResult<T>;
    public static Success<T>(taskName: string, value?: T): SuccessResult<T> {
        return new Task(undefined, taskName).success(value) as SuccessResult<T>;
    }

    // 0.2.0
    public static Failure(taskName: string, error?: string | Error | FailureResult): FailureResult {
        return new Task(undefined, taskName).failure(error);
    }

    // TODO
    /* public static async All<T>(...tasks: Promise<TaskResult<T>>[]): Promise<TaskResult<T>> {
        if (!tasks.length) return (new TaskResult<T>(undefined, undefined, true));
        throw new Error("unimplemented");
    } */

    private _fireEvents(type: TaskEventName | "error", result: TResult<T>): void {

        const listeners = [...this._listeners];
        const errorListeners: Array<RegisteredErrorEvent> = [];
        this._listeners.length = 0;

        for (let i = listeners.length - 1; i >= 0; i--) {
            if (listeners[i][0] === "error") {
                errorListeners.push(listeners.splice(i, 1)[0] as RegisteredErrorEvent);
            }
        }

        // - async errors will not be caught here
        // - sync errors will be passed to "error" event listeners if they exist
        // - errors fired in error handlers will not be caught
        // - errors fired in listeners when there are no "error" listeners will be re-thrown
        for (const [name, callback] of listeners) {
            if (name === "complete" || type === name) {
                try {
                    callback(result as any);
                } catch (err) {
                    if (errorListeners.length) {
                        for (const [, errCb] of errorListeners) { errCb(err); }
                    } else {
                        throw err;
                    }
                }
            }
        }

    }

}
