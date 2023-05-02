import { ApiProperty } from '@nestjs/swagger';

export class CreatePositionDto {
  @ApiProperty({
    type: String,
    minLength: 1,
    required: true,
    example: 'John',
  })
  positionFirstName: string;

  @ApiProperty({
    type: String,
    minLength: 1,
    required: true,
    example: 'Doe',
  })
  positionLastName: string;

  @ApiProperty({
    type: String,
    minLength: 1,
    required: true,
    example: '703',
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
    example: 'Good work guy.',
  })
  positionNotes: string;
}
