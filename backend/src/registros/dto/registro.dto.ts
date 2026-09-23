import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export class CreateRegistroDto {
  @IsDateString()
  fecha: string;

  @Matches(TIME_REGEX, { message: 'horaInicio debe tener formato HH:mm' })
  horaInicio: string;

  @Matches(TIME_REGEX, { message: 'horaFin debe tener formato HH:mm' })
  horaFin: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsUUID()
  usuarioId?: string;
}

export class UpdateRegistroDto {
  @IsOptional()
  @Matches(TIME_REGEX, { message: 'horaInicio debe tener formato HH:mm' })
  horaInicio?: string;

  @IsOptional()
  @Matches(TIME_REGEX, { message: 'horaFin debe tener formato HH:mm' })
  horaFin?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class QueryRegistroDto {
  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @IsOptional()
  @IsDateString()
  fechaHasta?: string;

  @IsOptional()
  @IsUUID()
  usuarioId?: string;
}
