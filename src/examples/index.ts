import { TaskHandler } from "../core/TaskHandler";
import { TResult } from "../core/types";
import { Task } from "../core/Task";


export function exampleMethod() {
    const task = new Task<number>('', exampleMethod.name);
    if (Math.random() > 0.5) {
        return task.success(5);
    } else {
        return task.failure();
    }
}

export class ExampleClass {

    public taskHandler: TaskHandler;

    constructor() {
        this.taskHandler = new TaskHandler(ExampleClass);
    }

    public exampleMethod(): TResult<number> {
        const task = this.taskHandler.task<number>(this.exampleMethod);
        if (Math.random() > 0.1) {
            return task.success(5);
        } else {
            return task.failure('');
        }
    }

    public nestedExample(): TResult<any> {
        const task = this.taskHandler.task(this.exampleMethod);
        const otherResult = this.exampleMethod();
        if (otherResult.success) return task.success();
        else return task.failure(otherResult);
    }

}
