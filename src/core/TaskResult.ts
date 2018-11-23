import { FailureResult } from "./types";

export class TaskResult<T> {

    private readonly namespace?: string;
    private readonly method?: string;
    public readonly success: boolean;
    public readonly error?: string | Error | FailureResult;
    public readonly value?: T;
    public readonly innerResult?: FailureResult;

    constructor(namespace: string | undefined, method: string | undefined, success: true, value?: T);
    constructor(namespace: string | undefined, method: string | undefined, success: false, error?: string | Error | FailureResult);
    constructor(namespace: string | undefined, method: string | undefined, success: false, error: string | Error, innerResult: FailureResult);
    constructor(namespace: string | undefined, method: string | undefined, success: boolean, errorOrValue?: string | Error | FailureResult | T, innerResult?: FailureResult) {
        this.namespace = namespace;
        this.method = method;
        this.success = success;
        if (success) {
            this.value = <T | undefined>errorOrValue;
        } else if (errorOrValue !== undefined) {
            if (innerResult) {
                this.innerResult = innerResult;
                this.error = <string | Error>errorOrValue;
            } else {
                this.error = <string | Error | undefined>errorOrValue;
            }
        }
    }

    public toString(): string {

        const depth: number = (arguments[0] || 0) * 4; // internal type hack
        let message: string = '';

        if (this.namespace) {
            message += this.namespace;
            if (this.method) message += `.${this.method}()`;
        } else if (this.method) {
            message += `${this.method}()`;
        }

        if (this.error) {
            if (message) message += ' - ';
            if (typeof this.error === 'string') message += this.error;
            else if (this.error instanceof Error) message += this.error.message || '';
        }

        if (this.innerResult) {
            if (message) message += '\n';
            message += <string>(<any>this.innerResult.toString)(depth + 1);
        }

        return (Array(depth).fill(' ').join('')) + message;

    }

}
