
# Result Handler


````sh
npm i result-handler
````

Usage with classes

````typescript
import { Result } from 'result-handler';

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

    throws() {
        const r = new Result();
        r.throw('some message');
    }

}

````

### TODO's
- full tests/coverage
- badges
