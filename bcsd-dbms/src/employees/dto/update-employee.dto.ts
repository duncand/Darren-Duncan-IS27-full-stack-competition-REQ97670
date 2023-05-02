import { ApiProperty } from '@nestjs/swagger';

export class UpdateEmployeeDto {
  @ApiProperty({
    type: String,
    minLength: 1,
    required: true,
    example: '12345',
  })
  employeeSurrogateID: string;

  // The remaining properties below this line are exact clones of those
  // declared in CreateEmployeeDto.  An earlier version of this class
  // instead had these:
  //   import { PartialType } from '@nestjs/mapped-types';
  //   export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto)
  // However, this was changed to the current method so that Swagger can
  // properly pick up on all the members of UpdateEmployeeDto.

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
