import { ApiProperty } from '@nestjs/swagger';

export class UpdatePositionDto {
  @ApiProperty({
    type: String,
    minLength: 1,
    required: true,
    example: '12345',
  })
  positionSurrogateID: string;

  // The remaining properties below this line are exact clones of those
  // declared in CreatePositionDto.  An earlier version of this class
  // instead had these:
  //   import { PartialType } from '@nestjs/mapped-types';
  //   export class UpdatePositionDto extends PartialType(CreatePositionDto)
  // However, this was changed to the current method so that Swagger can
  // properly pick up on all the members of UpdatePositionDto.

  @ApiProperty({
    type: String,
    minLength: 1,
    required: false,
    example: 'John',
  })
  employeeFirstName: string;

  @ApiProperty({
    type: String,
    minLength: 1,
    required: false,
    example: 'Doe',
  })
  employeeLastName: string;

  @ApiProperty({
    type: String,
    minLength: 1,
    required: false,
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

  @ApiProperty({
    type: String,
    minLength: 1,
    required: false,
    example: '678910',
  })
  parentPSID: string;
}
