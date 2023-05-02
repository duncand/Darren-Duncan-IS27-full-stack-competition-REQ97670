import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { PositionsService } from './positions.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';

@Controller('positions')
@ApiTags('positions')
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new Position with a generated positionSurrogateID'
  })
  @ApiCreatedResponse({
    description: 'Created a new Position with a generated positionSurrogateID',
  })
  @ApiBadRequestResponse({
    description: 'Given request body is not of a valid format'
      + " or too many positions have this one's positionLevel"
  })
  createOne(@Body() createPositionDto: CreatePositionDto) {
    return this.positionsService.createOne(createPositionDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Fetch a list of all existing Positions'
  })
  @ApiOkResponse({
    description: 'Fetched a list of all existing Positions',
  })
  fetchAll() {
    return this.positionsService.fetchAll();
  }

  @Get(':positionSurrogateID')
  @ApiParam({ name: 'positionSurrogateID', type: String, required: true })
  @ApiOperation({
    summary: 'Fetch an existing Position matching given positionSurrogateID'
  })
  @ApiOkResponse({
    description: 'Fetched an existing Position matching given positionSurrogateID'
  })
  @ApiBadRequestResponse({
    description: 'Given positionSurrogateID is not of a valid format'
  })
  @ApiNotFoundResponse({
    description: 'No Position found matching given positionSurrogateID'
  })
  fetchOne(@Param('positionSurrogateID') positionSurrogateID: string): UpdatePositionDto {
    return this.positionsService.fetchOne(decodeURIComponent(positionSurrogateID));
  }

  @Put(':positionSurrogateID')
  @ApiParam({ name: 'positionSurrogateID', type: String, required: true })
  @ApiOperation({
    summary: 'Update an existing Position matching given positionSurrogateID'
  })
  @ApiOkResponse({
    description: 'Updated an existing Position matching given positionSurrogateID'
  })
  @ApiBadRequestResponse({
    description: 'Given positionSurrogateID or request body is not of a valid format'
      + " or positionSurrogateIDs in url and body don't match"
      + " or too many positions have this one's positionLevel"
  })
  @ApiNotFoundResponse({
    description: 'No Position found matching given positionSurrogateID'
  })
  updateOne(@Param('positionSurrogateID') positionSurrogateID: string,
      @Body() updatePositionDto: UpdatePositionDto) {
    return this.positionsService.updateOne(
      decodeURIComponent(positionSurrogateID), updatePositionDto);
  }

  @Delete(':positionSurrogateID')
  @ApiParam({ name: 'positionSurrogateID', type: String, required: true })
  @ApiOperation({
    summary: 'Remove an existing Position matching given positionSurrogateID'
  })
  @ApiOkResponse({
    description: 'Removed an existing Position matching given positionSurrogateID'
  })
  @ApiBadRequestResponse({
    description: 'Given positionSurrogateID is not of a valid format'
  })
  @ApiNotFoundResponse({
    description: 'No Position found matching given positionSurrogateID'
  })
  removeOne(@Param('positionSurrogateID') positionSurrogateID: string) {
    return this.positionsService.removeOne(decodeURIComponent(positionSurrogateID));
  }
}
