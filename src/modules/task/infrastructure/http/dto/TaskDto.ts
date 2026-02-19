export interface CreateTaskDTO {
  title: string;
  status?: string;
  description?: string;
  assignedTo?: string;
  dueDate?: Date;
}

export interface UpdateTaskDTO {
  title: string;
  status: string;
  description?: string;
  assignedTo?: string;
  dueDate?: Date;
}

export interface PatchTaskDTO {
  title?: string;
  status?: string;
  description?: string;
  assignedTo?: string;
  dueDate?: Date;
}

export interface TaskDTO {
  id: string;
  title: string;
  status?: string;
  description?: string;
  assignedTo?: string;
  dueDate?: Date;
}
