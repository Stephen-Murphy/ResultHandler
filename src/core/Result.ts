
type BaseResult<T = any> = {
    namespace: string | undefined;
    method: string | undefined;
    message: string;
    success(value: T): SuccessResult<T>;
    failure(message: string | Error): FailureResult;
    throw(err: string | Error): FailureResult;
}

export type SuccessResult<T> = BaseResult<T> & {
    isSuccessful: true;
    value: T;
    error: undefined;
}

export type FailureResult = BaseResult & {
    isSuccessful: false;
    value: undefined;
    error: string | Error;
}

export type ResultHandler = {
    <T = any>(method: Function): Result<T>;
}

export class Result<T = any> {

    public get namespace() { return this._namespace; }
    private _namespace?: string;
    public get method() { return this._method; }
    private _method?: string;
    public get value() { return this._value; }
    private _value?: T;
    public get isSuccessful() { return this._successful; }
    private _successful?: boolean;
    public get error() { return this._error; }
    private _error?: string | Error | FailureResult;
    // supplementary when adding parent FailureResult
    private _message?: string;

    // createError() => new Error(this.namespace + this.method + this.error.toString())
    public get message() {
        let message = '';
        if (this._namespace) {
            message += this._namespace;
            if (this._method) message += '.';
        }
        if (this._method) message += this._method + '()';
        if (this._message) {
            if (message) message += ' - ';
            message += this._message.toString();
        }
        if (this._error) {
            if (this._message && message) message += ' - ';
            if (typeof this._error === 'string') {
                if (message) message += ' - ';
                message += this._error;
            } else if (this._error instanceof Result || this._error instanceof Error) {
                message += '\n    ' + this._error.message;
            } else {
                if (message) message += ' - ';
                message += this._error.toString();
            }
        }
        return message;
    }

    public success(value?: T): SuccessResult<T> {
        this._value = value;
        this._successful = true;
        return this as SuccessResult<T>;
    }

    public static Success<T = any>(value?: T) {
        return (new Result<T>()).success(value);
    }

    public failure(error?: string | Error | FailureResult, message?: string): FailureResult {
        this._error = error;
        this._successful = false;
        this._message = message;
        return this as FailureResult;
    }

    public static Failure<T = any>(error?: string | Error | FailureResult) {
        return (new Result<T>()).failure(error);
    }

    public static Handler(target: string | Function): ResultHandler {
        if (!target || (typeof target !== 'string' && typeof target !== 'function') || !target!.constructor || !target!.constructor!.name)
            throw new Error('Result.Handler() must specify target or target name');
        const name: string = typeof target === 'string' ? target : target.name;
        return <T>(method: Function | string) => {
            if (typeof method !== 'string' && typeof method !== 'function')
                throw new Error('Result.Handler()() - invalid method');
            const result = new Result<T>();
            result._namespace = name;
            result._method = typeof method === 'string' ? method : method.name;
            return result as Result<T>;
        };
    }

    public throw(error: string | Error): FailureResult {
        this.failure(error);
        throw new Error(this.message);
    }

}
