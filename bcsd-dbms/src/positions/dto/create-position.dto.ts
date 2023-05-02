import { ApiProperty } from '@nestjs/swagger';

export class CreatePositionDto {
  @ApiProperty({
    type: String,
    minLength: 1,
    required: true,
    example: 'John',
  })
  employeeFirstName: string;

  @ApiProperty({
    type: String,
    minLength: 1,
    required: true,
    example: 'Doe',
  })
  employeeLastName: string;

  @ApiProperty({
    type: String,
    minLength: 1,
    required: true,
    example: '703',
  })
  employeeNumber: string;

  @ApiProperty({
    type: String,
    minLength: 1,
    required: true,
    example: '17',
  })
  positionNumber: string;

  @ApiProperty({
    type: String,
    minLength: 1,
    required: true,
    example: 'manager',
  })
  positionLevel: string;

  @ApiProperty({
    type: String,
    minLength: 1,
    required: true,
    example: 'Cat Herder',
  })
  positionTitle: string;
}
