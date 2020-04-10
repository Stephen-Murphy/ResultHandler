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
            } else if (errorOrValue instanceof TaskResult) {
                this.innerResult = errorOrValue as FailureResult;
            } else {
                this.error = <string | Error | undefined>errorOrValue;
            }
        }
    }

    public toString(): string {

        let depth = 0;
        let message = "";

        let current: TaskResult<any> | undefined = this as TaskResult<any>;
        while (current) {

            if (current.namespace) {
                message += current.namespace;
                if (current.method) message += `.${current.method}()`;
            } else if (current.method) {
                message += `${current.method}()`;
            }

            if (current.error) {
                if (message) message += " - ";
                if (typeof current.error === "string") message += current.error;
                else if (current.error instanceof Error) message += current.error.message || "";
            }

            current = current.innerResult as TaskResult<any> | undefined;

            if (current) {
                message += "\n" + Array(depth++).fill("    ").join("");
            }

        }

        return message;

    }

}
