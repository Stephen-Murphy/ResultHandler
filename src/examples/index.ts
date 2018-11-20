import { Result, ResultHandler } from "../core/Result";


const handler = Result.Handler(Result);
function someMethod() {
    const result = handler<number>(someMethod);
    if (Math.random() > 0.5) {
        return result.success(5);
    } else {
        return result.failure();
    }
}

someMethod();

export class MyTestClass {

    createResult: ResultHandler;

    constructor() {
        this.createResult = Result.Handler(MyTestClass);
    }

    someMethod() {
        const result = this.createResult<number>(this.someMethod);
        if (Math.random() > 0.1) {
            return result.success(5);
        } else {
            return result.failure('');
        }
    }

    throws(): Result<any> {
        const result = this.createResult<null>(this.throws);
        return result.throw('reason');
    }

}
