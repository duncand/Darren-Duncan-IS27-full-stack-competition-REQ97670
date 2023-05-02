export interface PositionMaybeSansPositionSurrogateIDs {
  parentPSID: string;
  positionLevel: string;
  positionTitle: string;
  positionNumber: string;
  employeeFirstName: string;
  employeeLastName: string;
  employeeNumber: string;
}

export interface Position extends PositionMaybeSansPositionSurrogateIDs {
  positionSurrogateID: string;
}

export interface Level {
  code: string;
  title: string;
  limit: number|null;
}

export const emptyLevel = {code: '', title: '', limit: null};

export const emptyPositionMSPSI = {
  employeeFirstName: '',
  employeeLastName: '',
  employeeNumber: '',
  positionNumber: '',
  positionLevel: '',
  positionTitle: '',
  parentPSID: '',
};

export const emptyPosition = {
  positionSurrogateID: '',
  parentPSID: '',
  positionLevel: '',
  positionTitle: '',
  positionNumber: '',
  employeeFirstName: '',
  employeeLastName: '',
  employeeNumber: '',
};

// For limit, if a number is present, that is the maximum count of positions
// who may hold that level at once; otherwise the maximum count is unlimited.
export const levels: Array<Level> = [
  { code: "director", title: "Director", limit: 1 },
  { code: "senior_manager", title: "Senior Manager", limit: null },
  { code: "manager", title: "Manager", limit: null },
  { code: "senior_developer", title: "Senior Developer", limit: null },
  { code: "junior_developer", title: "Junior Developer", limit: null },
];

export const levelCodes: Array<string> = levels.map((level) => level.code);

export function isString(given: any): boolean {
  return (typeof given === 'string') && given.trim() === given;
}

export function isNonEmptyString(given: any): boolean {
  return isString(given) && given !== '';
}

export function isLevelCode(given: any): boolean {
  return (typeof given === 'string') && levelCodes.includes(given);
}

export function isPositionMaybeSansPositionSurrogateIDs(given: any): boolean {
  if (typeof given !== 'object') {
    return false;
  }
  if (!given.hasOwnProperty('employeeFirstName')
      || !isString(given.employeeFirstName)
      || !given.hasOwnProperty('employeeLastName')
      || !isString(given.employeeLastName)
      || !given.hasOwnProperty('employeeNumber')
      || !isString(given.employeeNumber)
      || !given.hasOwnProperty('positionNumber')
      || !isNonEmptyString(given.positionNumber)
      || !given.hasOwnProperty('positionLevel')
      || !isLevelCode(given.positionLevel)
      || !given.hasOwnProperty('positionTitle')
      || !isNonEmptyString(given.positionTitle)
      || !given.hasOwnProperty('parentPSID')
      || !isString(given.parentPSID)) {
    return false;
  }
  // The 3 Employee fields must either all be populated or must all be blank,
  // which indicates that employee holds the position or the position is
  // vacant respectively.
  if (given.employeeFirstName === ''
      || given.employeeLastName === ''
      || given.employeeNumber === '') {
    if (given.employeeFirstName !== ''
        || given.employeeLastName !== ''
        || given.employeeNumber !== '') {
      return false;
    }
  }
  return true;
}

export function isPositionSansPositionSurrogateIDs(given: any): boolean {
  return isPositionMaybeSansPositionSurrogateIDs(given)
    && Object.keys(given).length === 7;
}

export function isPosition(given: any): boolean {
  return isPositionMaybeSansPositionSurrogateIDs(given)
    && Object.keys(given).length === 8
    && given.hasOwnProperty('positionSurrogateID')
    && isNonEmptyString(given.positionSurrogateID);
}

export function isArrayOfPosition(given: any): boolean {
  return (Array.isArray(given)
    && given.every((elem) => isPosition(elem)));
}

export function allPositionSurrogateIDsAreDistinct(positions: Array<Position>): boolean {
  const positionSurrogateIDs = positions.map((elem) => elem.positionSurrogateID);
  return ((new Set(positionSurrogateIDs)).size === positionSurrogateIDs.length);
}

export function allLevelLimitsAreRespected(positions: Array<Position>): boolean {
  for (let index = 0; index < levels.length; index++) {
    const level: Level = levelAtIndex(index);
    if (typeof level.limit === "number") {
      if (positions.filter((elem) => elem.positionLevel === level.code).length > level.limit) {
        return false;
      }
    }
  }
  return true;
}

export function isPositions(given: any): boolean {
  return isArrayOfPosition(given)
    && allPositionSurrogateIDsAreDistinct(given)
    && allLevelLimitsAreRespected(given);
}

export function maybeIndexOfMatchingLevel(levelCode: string): number {
  return levels.findIndex((level) => level.code === levelCode);
}

export function levelAtIndex(index: number): Level {
  return levels.at(index) ?? emptyLevel;
}

export function levelTitle(levelCode: string): string {
  return levelAtIndex(maybeIndexOfMatchingLevel(levelCode)).title;
}

export function levelHasChildLevels(levelCode: string): boolean {
  return (maybeIndexOfMatchingLevel(levelCode) < (levels.length - 1));
}

export function maybeIndexOfMatchingPosition(
    positions: Array<Position>, positionSurrogateID: string)
    : number {
  return positions.findIndex((elem) => elem.positionSurrogateID === positionSurrogateID);
}

export function positionAtIndex(positions: Array<Position>, index: number): Position {
  // We assume positionAtIndex() is called exclusively on inputs
  // for which maybeIndexOfMatchingPosition() had a successful find.
  return positions.at(index) ?? emptyPosition;
}

export function generateDistinctPositionSurrogateID(positions: Array<Position>): string {
  // We will use a simple generator algorithm, that takes the rounded
  // result of multiplying the current UNIX timestamp in milliseconds
  // by a pseudo-random number, then modulo 2^16 so its easier to read,
  // to generate a positionSurrogateID.
  // As a guard for the tiny possibility of a collision with
  // an existing positionSurrogateID, in the event of a collision we will
  // append an "x" repeatedly until there isn't a collision.
  var positionSurrogateID: string
    = (Math.floor(Date.now() * Math.random()) % (2**16)).toString();
  while (maybeIndexOfMatchingPosition(positions, positionSurrogateID) !== -1) {
    positionSurrogateID = positionSurrogateID + 'x';
  }
  return positionSurrogateID;
}
