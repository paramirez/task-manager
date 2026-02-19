import { Task } from "@/domain/task/Task";
import { Result } from "@/shared/core/result";

export class ListTaskUseCase {
    execute(): Result<Task[], Error> {

        return Result.ok([Task.create({
            id: "1",
            title: "Pepe",
        }).getValue()])
    }
}