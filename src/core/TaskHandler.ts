import { Task } from "./Task";

export class TaskHandler {

    public readonly name: string;

    public constructor(name: string | Function) {
        this.name = typeof name === "function" ? name.name : name;
    }

    public task<T>(name: string | Function): Task<T> {
        return new Task<T>(this.name, typeof name === "function" ? name.name : name);
    }

}
