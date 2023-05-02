export interface PositionMaybeSansPositionSurrogateIDs {
  employeeFirstName: string;
  employeeLastName: string;
  employeeNumber: string;
  positionNumber: string;
  positionLevel: string;
  positionTitle: string;
  parentPSID: string;
}

export interface Position extends PositionMaybeSansPositionSurrogateIDs {
  positionSurrogateID: string;
}

export interface Level {
  code: string;
  title: string;
  limit: number|null;
}

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
    const level: Level = levels.at(index) || {code: '', title: '', limit: null};
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
