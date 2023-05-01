import React, { useState, useEffect } from 'react';
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useParams,
} from 'react-router-dom';

import {
  Employee,
  EmployeeMaybeSansEmployeeSurrogateIDs,
  positionCodes,
  positionTitles,
  positionLimits,
  isEmployee,
  isEmployeeSansEmployeeSurrogateIDs,
  isEmployees,
} from './app-types';

import './App.css';

// Note, for any uses of useEffect(), providing the second "optional" arg
// even if the empty array is necessary to avoid infinite useEffect() calls.

interface EmployeeCEDProps {
  employeeMSESI: EmployeeMaybeSansEmployeeSurrogateIDs;
  assignTo_employeeMSESI: (x: EmployeeMaybeSansEmployeeSurrogateIDs) => void;
  forDisplayOnly: boolean;
}

interface DisplayOfOnePositionProps {
  positionCode: string;
  employees: Array<Employee>;
}

interface DisplayOfAllPositionsProps {
  employees: Array<Employee>;
}

function dbmsUriBase(): string {
  // Defaults match those of the API server.
  const host = process.env.REACT_APP_DBMS_HOST || '127.0.0.1';
  const port = process.env.REACT_APP_DBMS_PORT || 80;
  return 'http://'+host+':'+port+'/api';
}

function DisplayOfOnePosition({ positionCode, employees }: DisplayOfOnePositionProps) {
  const filteredEmployees = employees.filter(
    (employee) => employee.employeePosition === positionCode);

  if (filteredEmployees.length === 0) {
    return(
      <p>There are no employees in this position.</p>
    );
  }

  const tableHeading = (
    <tr>
      <th></th>
      <th></th>
      <th>Employee Surrogate ID</th>
      <th>Employee First Name</th>
      <th>Employee Last Name</th>
      <th>Employee Number</th>
      <th>Employee Position</th>
      <th>Employee Notes</th>
    </tr>
  );

  const tableRows = filteredEmployees.map((employee) =>
    <tr key={employee.employeeSurrogateID}>
      <td><Link to={'/edit/' + employee.employeeSurrogateID}>Edit</Link></td>
      <td><Link to={'/delete/' + employee.employeeSurrogateID}>Delete</Link></td>
      <td>{employee.employeeSurrogateID}</td>
      <td>{employee.employeeFirstName}</td>
      <td>{employee.employeeLastName}</td>
      <td>{employee.employeeNumber}</td>
      <td>{employee.employeePosition}</td>
      <td>{employee.employeeNotes}</td>
    </tr>
  );

  return (
    <table>
      <thead>
        {tableHeading}
      </thead>
      <tbody>
        {tableRows}
      </tbody>
    </table>
  );
}

function DisplayOfAllPositions({ employees }: DisplayOfAllPositionsProps) {
  const tableHeading = (
    <tr>
      <th>Position Title</th>
      <th>Position Number</th>
      <th>Employees</th>
    </tr>
  );

  let index: number = -1;
  const tableRows = positionCodes.map((positionCode) => {
    index++;
    const positionLimit = positionLimits.at(index);
    const positionTitleText = positionTitles.at(index)
      + ((typeof positionLimit === "number") ? ' (Limit of '+positionLimit+'.)' : '');
    return (
      <tr key={index}>
        <td>{positionTitleText}</td>
        <td>{index + 1}</td>
        <td><DisplayOfOnePosition
          positionCode={positionCode}
          employees={employees}
        /></td>
      </tr>
    )
  });

  return (
    <>
      <p>Total of {employees.length} employees displayed.</p>
      <p><Link to={'/create'}>Add</Link> a new employee.</p>
      <table>
        <thead>
          {tableHeading}
        </thead>
        <tbody>
          {tableRows}
        </tbody>
      </table>
    </>
  );
}

function ViewAllEmployeesPage() {
  const [isEmployeesFetchError, assignTo_isEmployeesFetchError] = useState<boolean>(true);
  const [employees, assignTo_employees] = useState<Array<Employee>>([]);

  useEffect(() => {
    fetch(dbmsUriBase() + '/employees')
      .then((response) => {
        if (response.status === 200) {
          assignTo_isEmployeesFetchError(false);
          return response.json();
        }
        else {
          assignTo_isEmployeesFetchError(true);
        }
      })
      .then((data) => {
        if (!isEmployees(data)) {
          assignTo_isEmployeesFetchError(true);
        }
        else {
          assignTo_employees(data);
        }
      })
      .catch((err) => {
        assignTo_isEmployeesFetchError(true);
        console.log(err.message);
      });
  }, []);

  if (isEmployeesFetchError) {
    return (
      <p>Failed to fetch employees.</p>
    )
  }

  return (
    <DisplayOfAllPositions employees={employees} />
  );
}

function EmployeeFormFieldsSansEmployeeSurrogateIDs(
    {
      employeeMSESI,
      assignTo_employeeMSESI,
      forDisplayOnly,
    }: EmployeeCEDProps) {

  if (forDisplayOnly) {
    return (
      <>
        <tr>
          <td>Employee First Name:</td>
          <td>{employeeMSESI.employeeFirstName}</td>
        </tr>
        <tr>
          <td>Employee Last Name:</td>
          <td>{employeeMSESI.employeeLastName}</td>
        </tr>
        <tr>
          <td>Employee Number:</td>
          <td>{employeeMSESI.employeeNumber}</td>
        </tr>
        <tr>
          <td>Employee Position:</td>
          <td>{employeeMSESI.employeePosition}</td>
        </tr>
        <tr>
          <td>Employee Notes:</td>
          <td>{employeeMSESI.employeeNotes}</td>
        </tr>
      </>
    );
  }

  return (
    <>
      <tr>
        <td>Employee First Name:</td>
        <td><input
          type="text"
          id="employeeFirstName"
          name="employeeFirstName"
          value={employeeMSESI.employeeFirstName}
          onChange={(e) => assignTo_employeeMSESI({ ...employeeMSESI, employeeFirstName: e.target.value })}
          /></td>
      </tr>
      <tr>
        <td>Employee Last Name:</td>
        <td><input
          type="text"
          id="employeeLastName"
          name="employeeLastName"
          value={employeeMSESI.employeeLastName}
          onChange={(e) => assignTo_employeeMSESI({ ...employeeMSESI, employeeLastName: e.target.value })}
          /></td>
      </tr>
      <tr>
        <td>Employee Number:</td>
        <td><input
          type="text"
          id="employeeNumber"
          name="employeeNumber"
          value={employeeMSESI.employeeNumber}
          onChange={(e) => assignTo_employeeMSESI({ ...employeeMSESI, employeeNumber: e.target.value })}
          /></td>
      </tr>
      <tr>
        <td>Employee Position:</td>
        <td><input
          type="text"
          id="employeePosition"
          name="employeePosition"
          value={employeeMSESI.employeePosition}
          onChange={(e) => assignTo_employeeMSESI({ ...employeeMSESI, employeePosition: e.target.value })}
          /></td>
      </tr>
      <tr>
        <td>Employee Notes:</td>
        <td><input
          type="text"
          id="employeeNotes"
          name="employeeNotes"
          value={employeeMSESI.employeeNotes}
          onChange={(e) => assignTo_employeeMSESI({ ...employeeMSESI, employeeNotes: e.target.value })}
          /></td>
      </tr>
    </>
  );
}

function normalizedEmployeeSansEmployeeSurrogateIDs(
    employeeMSESI: EmployeeMaybeSansEmployeeSurrogateIDs): EmployeeMaybeSansEmployeeSurrogateIDs {
  return {
    employeeFirstName: employeeMSESI.employeeFirstName.trim(),
    employeeLastName: employeeMSESI.employeeLastName.trim(),
    employeeNumber: employeeMSESI.employeeNumber.trim(),
    employeePosition: employeeMSESI.employeePosition.trim(),
    employeeNotes: employeeMSESI.employeeNotes.trim(),
  };
}

function CreateOneEmployeePage() {
  const [employeeMSESI, assignTo_employeeMSESI] = useState<EmployeeMaybeSansEmployeeSurrogateIDs>({
    employeeFirstName: '',
    employeeLastName: '',
    employeeNumber: '',
    employeePosition: '',
    employeeNotes: '',
  });

  function handleEmployeeCreateFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    // Prevent page from submitting.
    event.preventDefault();
    const normProdMSESI = normalizedEmployeeSansEmployeeSurrogateIDs(employeeMSESI);
    console.log('save button clicked with '+JSON.stringify(normProdMSESI));
    if (!isEmployeeSansEmployeeSurrogateIDs(normProdMSESI)) {
      alert('Every field must be non-empty to save changes.');
      return;
    }
    fetch(dbmsUriBase() + '/employees/', {
        method: 'POST',
        body: JSON.stringify(normalizedEmployeeSansEmployeeSurrogateIDs(normProdMSESI)),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      })
      .then((response) => {
        if (response.status === 201) {
          alert('Changes were saved.');
        }
        else if (response.status === 400) {
          alert('Failed to save changes as bad client request; you might have exceeded the limit on how many employees may have this Position.');
        }
        else {
          alert('Something else happened: '+response.status+' '+response.statusText);
        }
      })
      .catch((err) => {
        alert('Failed to save changes: ' + err.message
          + ' see console for details');
        console.log(err.message);
      });
  }

  return (
    <>
      <h2>Add an Employee</h2>
      <p><Link to={'/'}>Return</Link> to the employee listing page.</p>
      <form onSubmit={handleEmployeeCreateFormSubmit}>
        <table>
          <tbody>
            <tr>
              <td>Employee Surrogate ID:</td>
              <td>(Will be generated.)</td>
            </tr>
            <EmployeeFormFieldsSansEmployeeSurrogateIDs
              employeeMSESI={employeeMSESI}
              assignTo_employeeMSESI={assignTo_employeeMSESI}
              forDisplayOnly={false}
            />
            <tr>
              <td></td>
              <td><button type="submit">Save Changes</button></td>
            </tr>
          </tbody>
        </table>
      </form>
    </>
  );
}

function EditOneEmployeePage() {
  const { employeeSurrogateID } = useParams();

  const [isEmployeeFetchError, assignTo_isEmployeeFetchError] = useState<boolean>(true);
  const [employeeMSESI, assignTo_employeeMSESI] = useState<EmployeeMaybeSansEmployeeSurrogateIDs>({
    employeeFirstName: '',
    employeeLastName: '',
    employeeNumber: '',
    employeePosition: '',
    employeeNotes: '',
  });

  useEffect(() => {
    fetch(dbmsUriBase() + '/employees/'+employeeSurrogateID)
      .then((response) => {
        if (response.status === 200) {
          assignTo_isEmployeeFetchError(false);
          return response.json();
        }
        else {
          assignTo_isEmployeeFetchError(true);
        }
      })
      .then((data) => {
        if (!isEmployee(data)) {
          assignTo_isEmployeeFetchError(true);
        }
        else {
          assignTo_employeeMSESI(data);
        }
      })
      .catch((err) => {
        assignTo_isEmployeeFetchError(true);
        console.log(err.message);
      });
  }, [employeeSurrogateID]);

  if (isEmployeeFetchError) {
    return (
      <p>Failed to fetch employee.</p>
    )
  }

  function handleEmployeeEditFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    // Prevent page from submitting.
    event.preventDefault();
    const normProdMSESI = normalizedEmployeeSansEmployeeSurrogateIDs(employeeMSESI);
    const employee: Employee = { ...normProdMSESI, employeeSurrogateID: employeeSurrogateID || '' };
    console.log('save button clicked with '+JSON.stringify(employee));
    if (!isEmployee(employee)) {
      alert('Every field must be non-empty to save changes.');
      return;
    }
    fetch(dbmsUriBase() + '/employees/'+employeeSurrogateID+'/', {
        method: 'PUT',
        body: JSON.stringify(employee),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      })
      .then((response) => {
        if (response.status === 200) {
          alert('Changes were saved.');
        }
        else if (response.status === 400) {
          alert('Failed to save changes as bad client request; you might have exceeded the limit on how many employees may have this Position.');
        }
        else if (response.status === 404) {
          alert('Failed to save changes as employee no longer in database.');
        }
        else {
          alert('Something else happened: '+response.status+' '+response.statusText);
        }
      })
      .catch((err) => {
        alert('Failed to save changes: ' + err.message
          + ' see console for details');
        console.log(err.message);
      });
  }

  return (
    <>
      <h2>Edit an Employee</h2>
      <p><Link to={'/'}>Return</Link> to the employee listing page.</p>
      <form onSubmit={handleEmployeeEditFormSubmit}>
        <table>
          <tbody>
            <tr>
              <td>Employee Surrogate ID:</td>
              <td>{employeeSurrogateID}</td>
            </tr>
            <EmployeeFormFieldsSansEmployeeSurrogateIDs
              employeeMSESI={employeeMSESI}
              assignTo_employeeMSESI={assignTo_employeeMSESI}
              forDisplayOnly={false}
            />
            <tr>
              <td></td>
              <td><button type="submit">Save Changes</button></td>
            </tr>
          </tbody>
        </table>
      </form>
    </>
  );
}

function DeleteOneEmployeePage() {
  const { employeeSurrogateID } = useParams();

  const [isEmployeeFetchError, assignTo_isEmployeeFetchError] = useState<boolean>(true);
  const [employeeMSESI, assignTo_employeeMSESI] = useState<EmployeeMaybeSansEmployeeSurrogateIDs>({
    employeeFirstName: '',
    employeeLastName: '',
    employeeNumber: '',
    employeePosition: '',
    employeeNotes: '',
  });

  useEffect(() => {
    fetch(dbmsUriBase() + '/employees/'+employeeSurrogateID)
      .then((response) => {
        if (response.status === 200) {
          assignTo_isEmployeeFetchError(false);
          return response.json();
        }
        else {
          assignTo_isEmployeeFetchError(true);
        }
      })
      .then((data) => {
        if (!isEmployee(data)) {
          assignTo_isEmployeeFetchError(true);
        }
        else {
          assignTo_employeeMSESI(data);
        }
      })
      .catch((err) => {
        assignTo_isEmployeeFetchError(true);
        console.log(err.message);
      });
  }, [employeeSurrogateID]);

  if (isEmployeeFetchError) {
    return (
      <p>Failed to fetch employee.</p>
    )
  }

  function handleEmployeeDeleteFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    // Prevent page from submitting.
    event.preventDefault();
    console.log('delete button clicked with '+employeeSurrogateID);
    fetch(dbmsUriBase() + '/employees/'+employeeSurrogateID+'/', {
        method: 'DELETE',
      })
      .then((response) => {
        if (response.status === 200) {
          alert('Employee was deleted.');
        }
        else if (response.status === 400) {
          alert('Failed to save changes as bad client request; this shouldn\'t happen.');
        }
        else if (response.status === 404) {
          alert('Failed to save changes as employee no longer in database.');
        }
        else {
          alert('Something else happened: '+response.status+' '+response.statusText);
        }
      })
      .catch((err) => {
        alert('Failed to delete employee: ' + err.message
          + ' see console for details');
        console.log(err.message);
      });
  }

  return (
    <>
      <h2>Delete an Employee</h2>
      <p><Link to={'/'}>Return</Link> to the employee listing page.</p>
      <form onSubmit={handleEmployeeDeleteFormSubmit}>
        <table>
          <tbody>
            <tr>
              <td>Employee Surrogate ID:</td>
              <td>{employeeSurrogateID}</td>
            </tr>
            <EmployeeFormFieldsSansEmployeeSurrogateIDs
              employeeMSESI={employeeMSESI}
              assignTo_employeeMSESI={assignTo_employeeMSESI}
              forDisplayOnly={true}
            />
            <tr>
              <td></td>
              <td><button type="submit">Delete If You're Sure</button></td>
            </tr>
          </tbody>
        </table>
      </form>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <h1>Province of British Columbia - Staff Directory (BCSD)</h1>
      <Routes>
        <Route path="/create" element={<CreateOneEmployeePage />} />
        <Route path="/" element={<ViewAllEmployeesPage />} />
        <Route path="/edit/:employeeSurrogateID" element={<EditOneEmployeePage />} />
        <Route path="/delete/:employeeSurrogateID" element={<DeleteOneEmployeePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
