export interface EmployeeMaybeSansEmployeeSurrogateIDs {
  employeeFirstName: string;
  employeeLastName: string;
  employeeNumber: string;
  employeePosition: string;
  employeeNotes: string;
}

export interface Employee extends EmployeeMaybeSansEmployeeSurrogateIDs {
  employeeSurrogateID: string;
}

// The positionFoo array elements correspond to each other by their indexes;
// the order of the elements corresponds to the rank of the position.
export const positionCodes: Array<string> = [
  "director",
  "senior_manager",
  "manager",
  "senior_developer",
  "junior_developer",
];

export const positionTitles: Array<string> = [
  "Director",
  "Senior Manager",
  "Manager",
  "Senior Developer",
  "Junior Developer",
];

// If a number is present, that is the maximum count of employees who may
// hold that position at once; otherwise the maximum count is unlimited.
export const positionLimits: Array<number|null> = [
  1,
  null,
  null,
  null,
  null,
];

export function isString(given: any): boolean {
  return (typeof given === 'string');
}

export function isNonEmptyString(given: any): boolean {
  return (typeof given === 'string') && given.trim() !== '';
}

export function isPositionCode(given: any): boolean {
  return (typeof given === 'string') && positionCodes.includes(given);
}

export function isEmployeeMaybeSansEmployeeSurrogateIDs(given: any): boolean {
  if (typeof given !== 'object') {
    return false;
  }
  if (!given.hasOwnProperty('employeeFirstName')
      || !isNonEmptyString(given.employeeFirstName)
      || !given.hasOwnProperty('employeeLastName')
      || !isNonEmptyString(given.employeeLastName)
      || !given.hasOwnProperty('employeeNumber')
      || !isNonEmptyString(given.employeeNumber)
      || !given.hasOwnProperty('employeePosition')
      || !isPositionCode(given.employeePosition)
      || !given.hasOwnProperty('employeeNotes')
      || !isString(given.employeeNotes)) {
    return false;
  }
  return true;
}

export function isEmployeeSansEmployeeSurrogateIDs(given: any): boolean {
  return isEmployeeMaybeSansEmployeeSurrogateIDs(given)
    && Object.keys(given).length === 5;
}

export function isEmployee(given: any): boolean {
  return isEmployeeMaybeSansEmployeeSurrogateIDs(given)
    && Object.keys(given).length === 6
    && given.hasOwnProperty('employeeSurrogateID')
    && isNonEmptyString(given.employeeSurrogateID);
}

export function isArrayOfEmployee(given: any): boolean {
  return (Array.isArray(given)
    && given.every((elem) => isEmployee(elem)));
}

export function allEmployeeSurrogateIDsAreDistinct(employees: Array<Employee>): boolean {
  const employeeSurrogateIDs = employees.map((elem) => elem.employeeSurrogateID);
  return ((new Set(employeeSurrogateIDs)).size === employeeSurrogateIDs.length);
}

export function allPositionLimitsAreRespected(employees: Array<Employee>): boolean {
  for (let index = 0; index < positionCodes.length; index++) {
    const positionLimit = positionLimits.at(index);
    if (typeof positionLimit === "number") {
      const positionCode = positionCodes.at(index);
      if (employees.filter((elem) => elem.employeePosition === positionCode).length > positionLimit) {
        return false;
      }
    }
  }
  return true;
}

export function isEmployees(given: any): boolean {
  return isArrayOfEmployee(given)
    && allEmployeeSurrogateIDsAreDistinct(given)
    && allPositionLimitsAreRespected(given);
}
