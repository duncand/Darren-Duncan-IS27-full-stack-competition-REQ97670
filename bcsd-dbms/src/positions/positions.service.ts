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
  allLevelLimitsAreRespected,
  allPositionSurrogateIDsAreDistinct,
  generateDistinctPositionSurrogateID,
  isArrayOfPosition,
  isNonEmptyString,
  isPosition,
  isPositionSansPositionSurrogateIDs,
  maybeIndexOfMatchingPosition,
  positionAtIndex,
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
        + ' data file Positions exceed limits on a positionLevel'
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

  createOne(createPositionDto: CreatePositionDto) {
    if (!isPositionSansPositionSurrogateIDs(createPositionDto)) {
      throw new BadRequestException(
        "request body doesn't match the format of a Position sans positionSurrogateID");
    }
    const positions: Array<UpdatePositionDto> = this.readDataFile();
    const position: UpdatePositionDto = {
      "positionSurrogateID": generateDistinctPositionSurrogateID(positions),
      "employeeFirstName": createPositionDto.employeeFirstName,
      "employeeLastName": createPositionDto.employeeLastName,
      "employeeNumber": createPositionDto.employeeNumber,
      "positionNumber": createPositionDto.positionNumber,
      "positionLevel": createPositionDto.positionLevel,
      "positionTitle": createPositionDto.positionTitle,
      "parentPSID": createPositionDto.parentPSID,
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
    const mayIndMatPos = maybeIndexOfMatchingPosition(positions, positionSurrogateID);
    if (mayIndMatPos === -1) {
      throw new NotFoundException(
        "no Position found matching given positionSurrogateID");
    }
    return positionAtIndex(positions, mayIndMatPos);
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
    const mayIndMatPos = maybeIndexOfMatchingPosition(positions, positionSurrogateID);
    if (mayIndMatPos === -1) {
      throw new NotFoundException(
        "no Position found matching given positionSurrogateID");
    }
    positions.splice(mayIndMatPos, 1, updatePositionDto);
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
    const mayIndMatPos = maybeIndexOfMatchingPosition(positions, positionSurrogateID);
    if (mayIndMatPos === -1) {
      throw new NotFoundException(
        "no Position found matching given positionSurrogateID");
    }
    positions.splice(mayIndMatPos, 1);
    this.writeDataFile(positions);
  }
}
