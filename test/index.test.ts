import { TaskHandler } from "../src";

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
        expect(tryResult.value).toBe("foo");

        const task2 = handler.task<any>("bar");
        const innerResult2 = handler.task("inner").success(1);
        const tryResult2 = task2.try(() => innerResult2);
        expect(tryResult2.success).toBeTruthy();
        expect(tryResult2.value).toBe(innerResult2);

        const task3 = handler.task<any>("bar");
        const innerResult3 = handler.task("inner").failure("1");
        const tryResult3 = task3.try(() => innerResult3);
        expect(tryResult3.success).toBeFalsy();
        expect(tryResult3.error).toBe(innerResult3);

        const task4 = handler.task<any>("bar");
        const tryResult4 = task4.try(() => { throw new Error("bad"); });
        expect(tryResult4.success).toBeFalsy();
        expect((<Error>tryResult4.error).message).toBe("bad");

    });

});

describe("TaskResult", () => {

    it("should stringify", () => {
        const handler = new TaskHandler("foo");
        const task = handler.task("bar");
        const result = task.success();
        const str = result.toString();
        expect(str).toBe("foo.bar()");
    });

});
