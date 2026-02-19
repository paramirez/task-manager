export interface TaskDTO {
    id: string;
    title: string;
    status?: string;
    description?: string;
    assignedTo?: string;
    dueDate?: Date;
}