import { IsString } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  readonly description: string;
}
