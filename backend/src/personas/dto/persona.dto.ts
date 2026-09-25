import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreatePersonaDto {
  @IsString()
  @MaxLength(120)
  nombre: string;

  @IsString()
  @MaxLength(30)
  documento: string;

  @IsOptional()
  @IsEmail()
  correo?: string;
}

export class UpdatePersonaDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  nombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  documento?: string;

  @IsOptional()
  @IsEmail()
  correo?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
