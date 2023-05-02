import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';

import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import {
  allPositionSurrogateIDsAreDistinct,
  allLevelLimitsAreRespected,
  isArrayOfPosition,
  isNonEmptyString,
  isPosition,
  isPositionSansPositionSurrogateIDs,
} from '../app-types';

@Injectable()
export class PositionsService {
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
    console.log('PositionsService.constructor():'
      + ' DATA_FILE_PATH is "' + this.dataFilePath + '"');
  }

  private readDataFile(): Array<UpdatePositionDto> {
    var dataFileAsText;
    try {
      dataFileAsText = fs.readFileSync(this.dataFilePath, 'utf8');
    }
    catch (e) {
      console.log('PositionsService.readDataFile():'
        + ' failure to read data file as text from "' + this.dataFilePath + '"');
      // This should result in a generic 500 API response.
      throw e;
    }
    var dataFileAsAny;
    try {
      dataFileAsAny = JSON.parse(dataFileAsText);
    }
    catch (e) {
      console.log('PositionsService.readDataFile():'
        + ' failure to parse data file text as JSON from "' + this.dataFilePath + '"');
      // This should result in a generic 500 API response.
      throw e;
    }
    if (!isArrayOfPosition(dataFileAsAny)) {
      const msg: string = 'PositionsService.readDataFile():'
        + ' data file is not Array of Position from "' + this.dataFilePath + '"';
      console.log(msg);
      // This should result in a generic 500 API response.
      throw new Error(msg);
    }
    if (!allPositionSurrogateIDsAreDistinct(dataFileAsAny)) {
      const msg: string = 'PositionsService.readDataFile():'
        + ' data file Positions not all distinct positionSurrogateIDs'
        + ' from "' + this.dataFilePath + '"';
      console.log(msg);
      // This should result in a generic 500 API response.
      throw new Error(msg);
    }
    if (!allLevelLimitsAreRespected(dataFileAsAny)) {
      const msg: string = 'PositionsService.readDataFile():'
        + ' data file Positions exceed limits on an positionLevel'
        + ' from "' + this.dataFilePath + '"';
      console.log(msg);
      // This should result in a generic 500 API response.
      throw new Error(msg);
    }
    return dataFileAsAny;
  }

  private writeDataFile(positions: Array<UpdatePositionDto>): void {
    var dataFileAsText;
    try {
      // Serialize pretty-printed with indentations of 2 spaces per level.
      dataFileAsText = JSON.stringify(positions, null, 2);
    }
    catch (e) {
      console.log('PositionsService.readDataFile():'
        + ' failure to serialize data file text as JSON to "' + this.dataFilePath + '"');
      // This should result in a generic 500 API response.
      throw e;
    }
    try {
      fs.writeFileSync(this.dataFilePath, dataFileAsText, 'utf8');
    }
    catch (e) {
      console.log('PositionsService.readDataFile():'
        + ' failure to write data file as text to "' + this.dataFilePath + '"');
      // This should result in a generic 500 API response.
      throw e;
    }
  }

  private maybeIndexOfMatchingPosition(
      positions: Array<UpdatePositionDto>, positionSurrogateID: string)
      : number {
    return positions.findIndex((elem) => elem.positionSurrogateID === positionSurrogateID);
  }

  private positionAtIndex(positions: Array<UpdatePositionDto>, index: number)
      : UpdatePositionDto {
    // We assume positionAtIndex() is called exclusively on inputs
    // for which maybeIndexOfMatchingPosition() had a successful find.
    // The "?? new UpdatePositionDto()" is only here because strict
    // TypeScript would complain about trying to assign X|undefined to X.
    return positions.at(index) ?? new UpdatePositionDto();
  }

  private generateDistinctPositionSurrogateID(positions: Array<UpdatePositionDto>): string {
    // We will use a simple generator algorithm, that takes the rounded
    // result of multiplying the current UNIX timestamp in milliseconds
    // by a pseudo-random number, then modulo 2^16 so its easier to read,
    // to generate an positionSurrogateID.
    // As a guard for the tiny possibility of a collision with
    // an existing positionSurrogateID, in the event of a collision we will
    // append an "x" repeatedly until there isn't a collision.
    var positionSurrogateID: string
      = (Math.floor(Date.now() * Math.random()) % (2**16)).toString();
    while (this.maybeIndexOfMatchingPosition(positions, positionSurrogateID) !== -1) {
      positionSurrogateID = positionSurrogateID + 'x';
    }
    return positionSurrogateID;
  }

  createOne(createPositionDto: CreatePositionDto) {
    if (!isPositionSansPositionSurrogateIDs(createPositionDto)) {
      throw new BadRequestException(
        "request body doesn't match the format of a Position sans positionSurrogateID");
    }
    const positions: Array<UpdatePositionDto> = this.readDataFile();
    const position: UpdatePositionDto = {
      "positionSurrogateID": this.generateDistinctPositionSurrogateID(positions),
      "employeeFirstName": createPositionDto.employeeFirstName,
      "employeeLastName": createPositionDto.employeeLastName,
      "employeeNumber": createPositionDto.employeeNumber,
      "positionNumber": createPositionDto.positionNumber,
      "positionLevel": createPositionDto.positionLevel,
      "positionTitle": createPositionDto.positionTitle,
    };
    positions.push(position);
    if (!allLevelLimitsAreRespected(positions)) {
      throw new BadRequestException(
        "too many positions with this positionLevel");
    }
    this.writeDataFile(positions);
  }

  fetchAll(): Array<UpdatePositionDto> {
    return this.readDataFile();
  }

  fetchOne(positionSurrogateID: string): UpdatePositionDto {
    if (!isNonEmptyString(positionSurrogateID)) {
      throw new BadRequestException(
        "positionSurrogateID (ignoring spaces) isn't a non-empty string");
    }
    const positions: Array<UpdatePositionDto> = this.readDataFile();
    const maybeIndexOfMatchingPosition
      = this.maybeIndexOfMatchingPosition(positions, positionSurrogateID);
    if (maybeIndexOfMatchingPosition === -1) {
      throw new NotFoundException(
        "no Position found matching given positionSurrogateID");
    }
    return this.positionAtIndex(positions, maybeIndexOfMatchingPosition);
  }

  updateOne(positionSurrogateID: string, updatePositionDto: UpdatePositionDto) {
    if (!isNonEmptyString(positionSurrogateID)) {
      throw new BadRequestException(
        "positionSurrogateID (ignoring spaces) isn't a non-empty string");
    }
    if (!isPosition(updatePositionDto)) {
      throw new BadRequestException(
        "request body doesn't match the format of a Position");
    }
    if (updatePositionDto.positionSurrogateID !== positionSurrogateID) {
      throw new BadRequestException(
        "positionSurrogateIDs in url and request body don't match");
    }
    const positions: Array<UpdatePositionDto> = this.readDataFile();
    const maybeIndexOfMatchingPosition
      = this.maybeIndexOfMatchingPosition(positions, positionSurrogateID);
    if (maybeIndexOfMatchingPosition === -1) {
      throw new NotFoundException(
        "no Position found matching given positionSurrogateID");
    }
    positions.splice(maybeIndexOfMatchingPosition, 1, updatePositionDto);
    if (!allLevelLimitsAreRespected(positions)) {
      throw new BadRequestException(
        "too many positions with this positionLevel");
    }
    this.writeDataFile(positions);
  }

  removeOne(positionSurrogateID: string) {
    if (!isNonEmptyString(positionSurrogateID)) {
      throw new BadRequestException(
        "positionSurrogateID (ignoring spaces) isn't a non-empty string");
    }
    const positions: Array<UpdatePositionDto> = this.readDataFile();
    const maybeIndexOfMatchingPosition
      = this.maybeIndexOfMatchingPosition(positions, positionSurrogateID);
    if (maybeIndexOfMatchingPosition === -1) {
      throw new NotFoundException(
        "no Position found matching given positionSurrogateID");
    }
    positions.splice(maybeIndexOfMatchingPosition, 1);
    this.writeDataFile(positions);
  }
}
