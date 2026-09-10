import { IsNotEmpty, IsString } from 'class-validator';

export class GeneratePresignedUrlDto {
  @IsString()
  @IsNotEmpty()
  filename: string;

  @IsString()
  @IsNotEmpty()
  contentType: string;
}
