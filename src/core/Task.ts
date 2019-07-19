import { TaskResult } from "./TaskResult";
import { FailureResult, SuccessResult } from "./types";

export class Task<T> {

    private readonly namespace?: string;
    private readonly method?: string;

    constructor(namespace?: string, method?: string) {
        this.namespace = namespace;
        this.method = method;
    }

    // TODO: add support for async - when result type is Promise<T>
    public try(callback: () => T): TaskResult<T> {
        try {
            const result = callback();
            if (result instanceof TaskResult) {
                if (result.success) {
                    return this.success(result);
                } else {
                    return this.failure(<FailureResult>result);
                }
            }
            return this.success(callback());
        } catch (e) {
            return this.failure(e);
        }
    }

    public success(value?: T): SuccessResult<T> {
        return <SuccessResult<T>>(new TaskResult<T>(this.namespace, this.method, true, value));
    }

    public failure(error?: string | Error | FailureResult): FailureResult;
    public failure(error: string | Error, innerResult: FailureResult): FailureResult;
    public failure(errorOrResult?: string | Error | FailureResult, innerResult?: FailureResult): FailureResult {
        return <FailureResult>(new TaskResult(this.namespace, this.method, false, <any>errorOrResult, <any>innerResult));
    }

    // TODO
    /* public static async All<T>(...tasks: Promise<TaskResult<T>>[]): Promise<TaskResult<T>> {
        if (!tasks.length) return (new TaskResult<T>(undefined, undefined, true));
        throw new Error("unimplemented");
    } */

}
