import { ApiProperty } from '@nestjs/swagger';

export class CreateEmployeeDto {
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
    example: 'manager',
  })
  employeeLevel: string;

  @ApiProperty({
    type: String,
    minLength: 1,
    required: true,
    example: 'Good work guy.',
  })
  employeeNotes: string;
}
