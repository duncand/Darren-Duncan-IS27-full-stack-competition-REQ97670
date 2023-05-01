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

import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Controller('employees')
@ApiTags('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new Employee with a generated employeeSurrogateID'
  })
  @ApiCreatedResponse({
    description: 'Created a new Employee with a generated employeeSurrogateID',
  })
  @ApiBadRequestResponse({
    description: 'Given request body is not of a valid format'
      + " or too many employees have this one's employeePosition"
  })
  createOne(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.createOne(createEmployeeDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Fetch a list of all existing Employees'
  })
  @ApiOkResponse({
    description: 'Fetched a list of all existing Employees',
  })
  fetchAll() {
    return this.employeesService.fetchAll();
  }

  @Get(':employeeSurrogateID')
  @ApiParam({ name: 'employeeSurrogateID', type: String, required: true })
  @ApiOperation({
    summary: 'Fetch an existing Employee matching given employeeSurrogateID'
  })
  @ApiOkResponse({
    description: 'Fetched an existing Employee matching given employeeSurrogateID'
  })
  @ApiBadRequestResponse({
    description: 'Given employeeSurrogateID is not of a valid format'
  })
  @ApiNotFoundResponse({
    description: 'No Employee found matching given employeeSurrogateID'
  })
  fetchOne(@Param('employeeSurrogateID') employeeSurrogateID: string): UpdateEmployeeDto {
    return this.employeesService.fetchOne(decodeURIComponent(employeeSurrogateID));
  }

  @Put(':employeeSurrogateID')
  @ApiParam({ name: 'employeeSurrogateID', type: String, required: true })
  @ApiOperation({
    summary: 'Update an existing Employee matching given employeeSurrogateID'
  })
  @ApiOkResponse({
    description: 'Updated an existing Employee matching given employeeSurrogateID'
  })
  @ApiBadRequestResponse({
    description: 'Given employeeSurrogateID or request body is not of a valid format'
      + " or employeeSurrogateIDs in url and body don't match"
      + " or too many employees have this one's employeePosition"
  })
  @ApiNotFoundResponse({
    description: 'No Employee found matching given employeeSurrogateID'
  })
  updateOne(@Param('employeeSurrogateID') employeeSurrogateID: string,
      @Body() updateEmployeeDto: UpdateEmployeeDto) {
    return this.employeesService.updateOne(
      decodeURIComponent(employeeSurrogateID), updateEmployeeDto);
  }

  @Delete(':employeeSurrogateID')
  @ApiParam({ name: 'employeeSurrogateID', type: String, required: true })
  @ApiOperation({
    summary: 'Remove an existing Employee matching given employeeSurrogateID'
  })
  @ApiOkResponse({
    description: 'Removed an existing Employee matching given employeeSurrogateID'
  })
  @ApiBadRequestResponse({
    description: 'Given employeeSurrogateID is not of a valid format'
  })
  @ApiNotFoundResponse({
    description: 'No Employee found matching given employeeSurrogateID'
  })
  removeOne(@Param('employeeSurrogateID') employeeSurrogateID: string) {
    return this.employeesService.removeOne(decodeURIComponent(employeeSurrogateID));
  }
}
