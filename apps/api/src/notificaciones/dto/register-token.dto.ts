import { IsString, IsNotEmpty } from 'class-validator';

export class RegisterTokenDto {
  @IsString()
  @IsNotEmpty()
  expoPushToken!: string;
}
