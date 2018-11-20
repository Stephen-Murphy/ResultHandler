
type BaseResult<T = any> = {
    namespace: string | undefined;
    method: string | undefined;
    message: string;
    success(value: T): SuccessResult<T>;
    failure(message: string | Error): FailureResult;
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

export class Result<T> {

    public get namespace() { return this._namespace; }
    private _namespace?: string;
    public get method() { return this._method; }
    private _method?: string;
    public get value() { return this._value; }
    private _value?: T;
    public get isSuccessful() { return this._successful; }
    private _successful?: boolean;
    public get error() { return this._error; }
    private _error?: string | Error;

    // createError() => new Error(this.namespace + this.method + this.error.toString())
    public get message() {
        if (this._message) return this._message;
        let message = '';
        if (this._namespace) {
            message += this._namespace;
            if (this._method) message += '.';
        }
        if (this._method) message += this._method + '()';
        if (message) message += ' - ';
        if (this._error) {
            if (typeof this._error === 'string') message += this._error;
            else message += this._error.toString();
        }
        this._message = message;
        return message;
    }
    private _message?: string;

    public success(value: T): SuccessResult<T> {
        this._value = value;
        this._successful = true;
        return this as SuccessResult<T>;
    }

    public static Success<T = any>(value: T) {
        return (new Result<T>()).success(value);
    }

    public failure(error?: string | Error): FailureResult {
        this._error = error;
        this._successful = false;
        return this as FailureResult;
    }

    public static Failure<T = any>(error?: string | Error) {
        return (new Result<T>()).failure(error);
    }

    public static Handler(target: string | Function): ResultHandler {
        if (!target || typeof target !== 'string' || typeof target !== 'function' || !target!.constructor || !target!.constructor!.name)
            throw new Error('Result.Handler() must specify target or target name');
        const name: string = typeof target === 'string' ? target : target!.constructor!.name;
        return <T>(method: Function) => {
            if (typeof method !== 'function') throw new Error('Result.Handler()() - invalid method');
            const result = new Result<T>();
            result._namespace = name;
            result._method = method.name;
            return result as Result<T>;
        };
    }

    public throw(error?: string | Error) {
        if (error) this._error = error;
        throw new Error(this.message);
    }

}
