import { TaskResult } from "./TaskResult";
import { FailureResult, SuccessResult, TResult } from "./types";

export class Task<T> {

    private readonly namespace?: string;
    private readonly method?: string;
    private _onFailure?: any;

    constructor(namespace?: string, method?: string) {
        this.namespace = namespace;
        this.method = method;
    }

    /**
     * Synchronous try/catch
     *
     * @param {(() => T | TResult<T>)} callback
     * @param {boolean} [directReturn=false] if result of callback is a TaskResult, return it directly, otherwise return its value
     * @returns {TResult<T>}
     * @memberof Task
     */
    public try(callback: () => T | TResult<T>, directReturn = false): TResult<T> {
        try {
            const result = callback();
            if (!directReturn && (result instanceof TaskResult)) {
                if (result.success) {
                    return this.success(result.value);
                } else {
                    return this.failure(<FailureResult>result);
                }
            }
            return this.success(result as T);
        } catch (e) {
            return this.failure(e);
        }
    }

    /**
     * Asynchronous try/catch
     *
     * @param {(() => Promise<T | TResult<T>>)} callback
     * @param {boolean} [directReturn=false] if result of callback is TaskResult | Promise<TaskResult>, return it directly, otherwise return its value
     * @returns {Promise<TResult<T>>}
     * @memberof Task
     */
    public async tryAsync(callback: () => Promise<T | TResult<T>>, directReturn = false): Promise<TResult<T>> {
        try {
            const result = await callback();
            if (!directReturn && (result instanceof TaskResult)) {
                if (result.success) {
                    return this.success(result.value);
                } else {
                    return this.failure(<FailureResult>result);
                }
            }
            return this.success(result as T);
        } catch (e) {
            return await this.failureAsync(e);
        }
    }

    public success(value?: T): SuccessResult<T> {
        return <SuccessResult<T>>(new TaskResult<T>(this.namespace, this.method, true, value));
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
        this._onFailure = callback;
    }

    // TODO
    /* public static async All<T>(...tasks: Promise<TaskResult<T>>[]): Promise<TaskResult<T>> {
        if (!tasks.length) return (new TaskResult<T>(undefined, undefined, true));
        throw new Error("unimplemented");
    } */

}
