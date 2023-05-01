import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';

import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import {
  allEmployeeSurrogateIDsAreDistinct,
  allPositionLimitsAreRespected,
  isArrayOfEmployee,
  isNonEmptyString,
  isEmployee,
  isEmployeeSansEmployeeSurrogateIDs,
} from '../app-types';

@Injectable()
export class EmployeesService {
  // This is the file system path of the JSON file we will use as our database.
  // We require that file to already exist and be readable and writable.
  // We require the user to specify this path so they have full control
  // over where file system changes are made by this application.
  // The application should exit/fail if the user didn't specify the file
  // path, but the app should just return a runtime error and keep going
  // if there is a problem with the actual referred-to file;
  // the data file itself is only read and/or written on API calls that use
  // it, each time an API call is made, and not once per application run.
  private dataFilePath: string;

  constructor(private configService: ConfigService) {
    // Read the value of DATA_FILE_PATH from either the runtime environment
    // or a local ".env" file; throw an exception if the user didn't declare
    // either of those for us; ideally the app would actually shutdown then.
    const maybeDataFilePath = this.configService.get<string>('DATA_FILE_PATH');
    if (!isNonEmptyString(maybeDataFilePath)) {
      throw new Error(
        'Environment variable DATA_FILE_PATH must be a non-empty string.');
    }
    this.dataFilePath = (maybeDataFilePath ?? '').trim();
    console.log('EmployeesService.constructor():'
      + ' DATA_FILE_PATH is "' + this.dataFilePath + '"');
  }

  private readDataFile(): Array<UpdateEmployeeDto> {
    var dataFileAsText;
    try {
      dataFileAsText = fs.readFileSync(this.dataFilePath, 'utf8');
    }
    catch (e) {
      console.log('EmployeesService.readDataFile():'
        + ' failure to read data file as text from "' + this.dataFilePath + '"');
      // This should result in a generic 500 API response.
      throw e;
    }
    var dataFileAsAny;
    try {
      dataFileAsAny = JSON.parse(dataFileAsText);
    }
    catch (e) {
      console.log('EmployeesService.readDataFile():'
        + ' failure to parse data file text as JSON from "' + this.dataFilePath + '"');
      // This should result in a generic 500 API response.
      throw e;
    }
    if (!isArrayOfEmployee(dataFileAsAny)) {
      const msg: string = 'EmployeesService.readDataFile():'
        + ' data file is not Array of Employee from "' + this.dataFilePath + '"';
      console.log(msg);
      // This should result in a generic 500 API response.
      throw new Error(msg);
    }
    if (!allEmployeeSurrogateIDsAreDistinct(dataFileAsAny)) {
      const msg: string = 'EmployeesService.readDataFile():'
        + ' data file Employees not all distinct employeeSurrogateIDs'
        + ' from "' + this.dataFilePath + '"';
      console.log(msg);
      // This should result in a generic 500 API response.
      throw new Error(msg);
    }
    if (!allPositionLimitsAreRespected(dataFileAsAny)) {
      const msg: string = 'EmployeesService.readDataFile():'
        + ' data file Employees exceed limits on an employeePosition'
        + ' from "' + this.dataFilePath + '"';
      console.log(msg);
      // This should result in a generic 500 API response.
      throw new Error(msg);
    }
    return dataFileAsAny;
  }

  private writeDataFile(employees: Array<UpdateEmployeeDto>): void {
    var dataFileAsText;
    try {
      // Serialize pretty-printed with indentations of 2 spaces per level.
      dataFileAsText = JSON.stringify(employees, null, 2);
    }
    catch (e) {
      console.log('EmployeesService.readDataFile():'
        + ' failure to serialize data file text as JSON to "' + this.dataFilePath + '"');
      // This should result in a generic 500 API response.
      throw e;
    }
    try {
      fs.writeFileSync(this.dataFilePath, dataFileAsText, 'utf8');
    }
    catch (e) {
      console.log('EmployeesService.readDataFile():'
        + ' failure to write data file as text to "' + this.dataFilePath + '"');
      // This should result in a generic 500 API response.
      throw e;
    }
  }

  private maybeIndexOfMatchingEmployee(
      employees: Array<UpdateEmployeeDto>, employeeSurrogateID: string)
      : number {
    return employees.findIndex((elem) => elem.employeeSurrogateID === employeeSurrogateID);
  }

  private employeeAtIndex(employees: Array<UpdateEmployeeDto>, index: number)
      : UpdateEmployeeDto {
    // We assume employeeAtIndex() is called exclusively on inputs
    // for which maybeIndexOfMatchingEmployee() had a successful find.
    // The "?? new UpdateEmployeeDto()" is only here because strict
    // TypeScript would complain about trying to assign X|undefined to X.
    return employees.at(index) ?? new UpdateEmployeeDto();
  }

  private generateDistinctEmployeeSurrogateID(employees: Array<UpdateEmployeeDto>): string {
    // We will use a simple generator algorithm, that takes the rounded
    // result of multiplying the current UNIX timestamp in milliseconds
    // by a pseudo-random number, then modulo 2^16 so its easier to read,
    // to generate an employeeSurrogateID.
    // As a guard for the tiny possibility of a collision with
    // an existing employeeSurrogateID, in the event of a collision we will
    // append an "x" repeatedly until there isn't a collision.
    var employeeSurrogateID: string
      = (Math.floor(Date.now() * Math.random()) % (2**16)).toString();
    while (this.maybeIndexOfMatchingEmployee(employees, employeeSurrogateID) !== -1) {
      employeeSurrogateID = employeeSurrogateID + 'x';
    }
    return employeeSurrogateID;
  }

  createOne(createEmployeeDto: CreateEmployeeDto) {
    if (!isEmployeeSansEmployeeSurrogateIDs(createEmployeeDto)) {
      throw new BadRequestException(
        "request body doesn't match the format of a Employee sans employeeSurrogateID");
    }
    const employees: Array<UpdateEmployeeDto> = this.readDataFile();
    const employee: UpdateEmployeeDto = {
      "employeeSurrogateID": this.generateDistinctEmployeeSurrogateID(employees),
      "employeeFirstName": createEmployeeDto.employeeFirstName,
      "employeeLastName": createEmployeeDto.employeeLastName,
      "employeeNumber": createEmployeeDto.employeeNumber,
      "employeePosition": createEmployeeDto.employeePosition,
      "employeeNotes": createEmployeeDto.employeeNotes,
    };
    employees.push(employee);
    if (!allPositionLimitsAreRespected(employees)) {
      throw new BadRequestException(
        "too many employees with this employeePosition");
    }
    this.writeDataFile(employees);
  }

  fetchAll(): Array<UpdateEmployeeDto> {
    return this.readDataFile();
  }

  fetchOne(employeeSurrogateID: string): UpdateEmployeeDto {
    if (!isNonEmptyString(employeeSurrogateID)) {
      throw new BadRequestException(
        "employeeSurrogateID (ignoring spaces) isn't a non-empty string");
    }
    const employees: Array<UpdateEmployeeDto> = this.readDataFile();
    const maybeIndexOfMatchingEmployee
      = this.maybeIndexOfMatchingEmployee(employees, employeeSurrogateID);
    if (maybeIndexOfMatchingEmployee === -1) {
      throw new NotFoundException(
        "no Employee found matching given employeeSurrogateID");
    }
    return this.employeeAtIndex(employees, maybeIndexOfMatchingEmployee);
  }

  updateOne(employeeSurrogateID: string, updateEmployeeDto: UpdateEmployeeDto) {
    if (!isNonEmptyString(employeeSurrogateID)) {
      throw new BadRequestException(
        "employeeSurrogateID (ignoring spaces) isn't a non-empty string");
    }
    if (!isEmployee(updateEmployeeDto)) {
      throw new BadRequestException(
        "request body doesn't match the format of a Employee");
    }
    if (updateEmployeeDto.employeeSurrogateID !== employeeSurrogateID) {
      throw new BadRequestException(
        "employeeSurrogateIDs in url and request body don't match");
    }
    const employees: Array<UpdateEmployeeDto> = this.readDataFile();
    const maybeIndexOfMatchingEmployee
      = this.maybeIndexOfMatchingEmployee(employees, employeeSurrogateID);
    if (maybeIndexOfMatchingEmployee === -1) {
      throw new NotFoundException(
        "no Employee found matching given employeeSurrogateID");
    }
    employees.splice(maybeIndexOfMatchingEmployee, 1, updateEmployeeDto);
    if (!allPositionLimitsAreRespected(employees)) {
      throw new BadRequestException(
        "too many employees with this employeePosition");
    }
    this.writeDataFile(employees);
  }

  removeOne(employeeSurrogateID: string) {
    if (!isNonEmptyString(employeeSurrogateID)) {
      throw new BadRequestException(
        "employeeSurrogateID (ignoring spaces) isn't a non-empty string");
    }
    const employees: Array<UpdateEmployeeDto> = this.readDataFile();
    const maybeIndexOfMatchingEmployee
      = this.maybeIndexOfMatchingEmployee(employees, employeeSurrogateID);
    if (maybeIndexOfMatchingEmployee === -1) {
      throw new NotFoundException(
        "no Employee found matching given employeeSurrogateID");
    }
    employees.splice(maybeIndexOfMatchingEmployee, 1);
    this.writeDataFile(employees);
  }
}
