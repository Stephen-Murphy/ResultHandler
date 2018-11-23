
export type TResult<T> = SuccessResult<T> | FailureResult;

export type FailureResult = {
    success: false;
    error?: string | Error;
    innerResult?: FailureResult;
    toString(): string;
};

export type SuccessResult<T> = {
    success: true;
    value: T;
};
