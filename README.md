
# Result Handler


````sh
npm i result-handler
````

Usage with classes

````typescript
import { Result } from 'result-handler';

// Success<T>(value: T) => (new Result()).successful(value);
// Failure<T>(err: str | error) => (new Result()).failure(msg, value?);
// Success, Result, Message, Value, Exception
// Result<T>
// Result<SuccessValue, FailureValue>
// get Result.error - create and store new Error on first access - don't throw or create error right away
// Result.exception
// success: boolean; - readonly
// failure: boolean; - readonly

class MyTestClass {

    createResult: ResultHandler;

    constructor() {
        this.createResult = Result.Handler(MyTestClass);
    }

    someMethod(): Result<number> {
        const result = this.createResult<number>(this.someMethod);
        if (Math.random() > 0.1) {
            return result.success(5);
        } else {
            return result.failure('');
        }
    }

    alwaysFails() {
        return Result.Failure('message');
    }

    alwaysSucceeds() {
        return Result.Success(123);
    }

    mayFail() {
        if (shouldFail) {
            return Result.Failure('message');
        } else {
            return result.Success(123);
        }
    }

}

````

### TODO's
- full tests/coverage
- badges
