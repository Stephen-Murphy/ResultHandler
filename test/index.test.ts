import { TaskHandler, SuccessResult, FailureResult, Task } from "../src";

describe("TaskHandler", () => {

    it("should initialize handler", () => {
        const handler = new TaskHandler("foo");
        expect(handler.name).toBe("foo");
        function bar() { }
        const handler2 = new TaskHandler(bar);
        expect(handler2.name).toBe("bar");
    });

});

describe("Task", () => {

    it("should initialize task", () => {

        const handler = new TaskHandler("foo");
        const task = handler.task<boolean>("bar");
        const result = task.success(true);
        expect(result.success).toBeTruthy();
        expect(result.value).toBe(true);
        const failingTask = handler.task("baz").failure("baz failure");
        expect(failingTask.success).toBe(false);
        expect(failingTask.error).toBe("baz failure");

        function bar() { }
        const task2 = handler.task(bar);
        const result2 = task2.success(true);
        expect(result2.success).toBeTruthy();

    });

    it("should handle try", () => {

        const handler = new TaskHandler("try");

        const task = handler.task<any>("bar");
        const tryResult = task.try(() => "foo");
        expect(tryResult.success).toBeTruthy();
        expect((<SuccessResult<any>>tryResult).value).toBe("foo");

        const task2 = handler.task<any>("bar");
        const innerResult2 = handler.task("inner").success(1);
        const tryResult2 = task2.try(() => innerResult2);
        expect(tryResult2.success).toBeTruthy();
        expect((<SuccessResult<any>>tryResult2).value).toBe(innerResult2.value);

        const task3 = handler.task<any>("bar");
        const innerResult3 = handler.task("inner").failure("1");
        const tryResult3 = task3.try(() => innerResult3);
        expect(tryResult3.success).toBeFalsy();
        expect((<FailureResult>tryResult3).innerResult).toBe(innerResult3);

        const task4 = handler.task<any>("bar");
        const tryResult4 = task4.try(() => { throw new Error("bad"); });
        expect(tryResult4.success).toBeFalsy();
        expect((<Error>(<FailureResult>tryResult4).error).message).toBe("bad");

    });

    it("should handle events", () => {

        {
            const task = new Task<void>("Test", "handleEvents1");
            expect(() => task.on("complete", () => { })).not.toThrow();
            expect(() => task.on("invalid" as any, () => { })).toThrow();
        }

        let errorFired, failureFired, successFired, completeFired;
        const reset = () => errorFired = failureFired = successFired = completeFired = false;

        {
            reset();
            const task = new Task<void>("Test", "handleEvents2");
            let sr: any = null;
            task.on("complete", result => {
                sr = result;
                completeFired = true;
                throw new Error("test");
            });
            task.on("success", () => successFired = true);
            task.on("failure", () => failureFired = true);
            task.on("error", () => errorFired = true);
            const result = task.success();
            expect(completeFired).toBe(true);
            expect(errorFired).toBe(true);
            expect(successFired).toBe(true);
            expect(failureFired).toBe(false);
            expect(sr).toBe(result);
        }

        {
            let [a, b, c] = [false, false, false];
            const task = new Task<void>("Test", "handleEvents3");
            task.on("complete", () => a = true);
            task.on("complete", () => {
                b = true;
                throw new Error("test");
            });
            task.on("complete", () => c = true);
            expect(() => task.success()).toThrowError("test");
            expect(a).toBe(true);
            expect(b).toBe(true);
            expect(c).toBe(false);
        }

        {
            reset();
            const task = new Task<void>("Test", "handleEvents3");
            const evt = () => completeFired = true;
            task.on("complete", evt);
            task.off("complete", evt);
            task.success();
            expect(completeFired).toBe(false);
        }

        {
            const task = new Task<void>("Test", "fluent");
            expect(task.on("complete", () => { })).toBe(task);
        }

    });

});

describe("TaskResult", () => {

    it("should stringify", () => {
        const handler = new TaskHandler("foo");
        const task = handler.task<void>("bar");
        const result = task.success();
        const str = result.toString();
        expect(str).toBe("foo.bar()");
    });

});
