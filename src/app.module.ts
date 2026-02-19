import { Module } from '@nestjs/common';
import { TaskController } from './infraestructure/http/controllers/TaskController';
import { ListTaskUseCase } from './application/useCases/ListTaskUseCase';

@Module({
  imports: [],
  controllers: [
    TaskController
  ],
  providers: [{
    provide: ListTaskUseCase,
    useFactory() {
      return new ListTaskUseCase()
    }
  }],
})
export class AppModule { }
