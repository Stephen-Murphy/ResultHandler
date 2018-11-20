
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

export MyClass {

    constructor() {
        this.resultHandler = Result(MyClass);
    }

    someMethod() {

        const r = this.resultHandler(this.someMethod);

        const data = doStuff(); // ... do some stuff

        if (data) {
            return r.success(data);
        } else {
            return r.error("error message"); // returns throwable error with "MyClass.someMethod()" prepended to error message
        }
    }

}

````

### TODO's
- full tests/coverage
- badges
