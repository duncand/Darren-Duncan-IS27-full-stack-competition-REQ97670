import React, { useState, useEffect } from 'react';
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useParams,
} from 'react-router-dom';

import {
  Position,
  PositionMaybeSansPositionSurrogateIDs,
  levelCodes,
  levelTitles,
  levelLimits,
  isPosition,
  isPositionSansPositionSurrogateIDs,
  isPositions,
} from './app-types';

import './App.css';

// Note, for any uses of useEffect(), providing the second "optional" arg
// even if the empty array is necessary to avoid infinite useEffect() calls.

interface PositionCEDProps {
  positionMSPSI: PositionMaybeSansPositionSurrogateIDs;
  assignTo_positionMSPSI: (x: PositionMaybeSansPositionSurrogateIDs) => void;
  forDisplayOnly: boolean;
}

interface DisplayOfOneLevelProps {
  levelCode: string;
  positions: Array<Position>;
}

interface DisplayOfAllLevelsProps {
  positions: Array<Position>;
}

function dbmsUriBase(): string {
  // Defaults match those of the API server.
  const host = process.env.REACT_APP_DBMS_HOST || '127.0.0.1';
  const port = process.env.REACT_APP_DBMS_PORT || 80;
  return 'http://'+host+':'+port+'/api';
}

function DisplayOfOneLevel({ levelCode, positions }: DisplayOfOneLevelProps) {
  const filteredPositions = positions.filter(
    (position) => position.positionLevel === levelCode);

  if (filteredPositions.length === 0) {
    return(
      <p>There are no positions in this level.</p>
    );
  }

  const tableHeading = (
    <tr>
      <th></th>
      <th></th>
      <th>Position Surrogate ID</th>
      <th>Employee First Name</th>
      <th>Employee Last Name</th>
      <th>Employee Number</th>
      <th>Position Number</th>
      <th>Position Level</th>
      <th>Position Title</th>
      <th>Parent Position Surrogate ID</th>
    </tr>
  );

  const tableRows = filteredPositions.map((position) =>
    <tr key={position.positionSurrogateID}>
      <td><Link to={'/edit/' + position.positionSurrogateID}>Edit</Link></td>
      <td><Link to={'/delete/' + position.positionSurrogateID}>Delete</Link></td>
      <td>{position.positionSurrogateID}</td>
      <td>{position.employeeFirstName}</td>
      <td>{position.employeeLastName}</td>
      <td>{position.employeeNumber}</td>
      <td>{position.positionNumber}</td>
      <td>{position.positionLevel}</td>
      <td>{position.positionTitle}</td>
      <td>{position.parentPSID}</td>
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

function DisplayOfAllLevels({ positions }: DisplayOfAllLevelsProps) {
  const tableHeading = (
    <tr>
      <th>Level Title</th>
      <th>Level Number</th>
      <th>Positions</th>
    </tr>
  );

  let index: number = -1;
  const tableRows = levelCodes.map((levelCode) => {
    index++;
    const levelLimit = levelLimits.at(index);
    const levelTitleText = levelTitles.at(index)
      + ((typeof levelLimit === "number") ? ' (Limit of '+levelLimit+'.)' : '');
    return (
      <tr key={index}>
        <td>{levelTitleText}</td>
        <td>{index + 1}</td>
        <td><DisplayOfOneLevel
          levelCode={levelCode}
          positions={positions}
        /></td>
      </tr>
    )
  });

  return (
    <>
      <p>Total of {positions.length} positions displayed.</p>
      <p><Link to={'/create'}>Add</Link> a new position.</p>
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

function ViewAllPositionsPage() {
  const [isPositionsFetchError, assignTo_isPositionsFetchError] = useState<boolean>(true);
  const [positions, assignTo_positions] = useState<Array<Position>>([]);

  useEffect(() => {
    fetch(dbmsUriBase() + '/positions')
      .then((response) => {
        if (response.status === 200) {
          assignTo_isPositionsFetchError(false);
          return response.json();
        }
        else {
          assignTo_isPositionsFetchError(true);
        }
      })
      .then((data) => {
        if (!isPositions(data)) {
          assignTo_isPositionsFetchError(true);
        }
        else {
          assignTo_positions(data);
        }
      })
      .catch((err) => {
        assignTo_isPositionsFetchError(true);
        console.log(err.message);
      });
  }, []);

  if (isPositionsFetchError) {
    return (
      <p>Failed to fetch positions.</p>
    )
  }

  return (
    <DisplayOfAllLevels positions={positions} />
  );
}

function PositionFormFieldsSansPositionSurrogateIDs(
    {
      positionMSPSI,
      assignTo_positionMSPSI,
      forDisplayOnly,
    }: PositionCEDProps) {

  if (forDisplayOnly) {
    return (
      <>
        <tr>
          <td>Employee First Name:</td>
          <td>{positionMSPSI.employeeFirstName}</td>
        </tr>
        <tr>
          <td>Employee Last Name:</td>
          <td>{positionMSPSI.employeeLastName}</td>
        </tr>
        <tr>
          <td>Employee Number:</td>
          <td>{positionMSPSI.employeeNumber}</td>
        </tr>
        <tr>
          <td>Position Number:</td>
          <td>{positionMSPSI.positionNumber}</td>
        </tr>
        <tr>
          <td>Position Level:</td>
          <td>{positionMSPSI.positionLevel}</td>
        </tr>
        <tr>
          <td>Position Title:</td>
          <td>{positionMSPSI.positionTitle}</td>
        </tr>
        <tr>
          <td>Parent Position Surrogate ID:</td>
          <td>{positionMSPSI.parentPSID}</td>
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
          value={positionMSPSI.employeeFirstName}
          onChange={(e) => assignTo_positionMSPSI({ ...positionMSPSI, employeeFirstName: e.target.value })}
          /></td>
      </tr>
      <tr>
        <td>Employee Last Name:</td>
        <td><input
          type="text"
          id="employeeLastName"
          name="employeeLastName"
          value={positionMSPSI.employeeLastName}
          onChange={(e) => assignTo_positionMSPSI({ ...positionMSPSI, employeeLastName: e.target.value })}
          /></td>
      </tr>
      <tr>
        <td>Employee Number:</td>
        <td><input
          type="text"
          id="employeeNumber"
          name="employeeNumber"
          value={positionMSPSI.employeeNumber}
          onChange={(e) => assignTo_positionMSPSI({ ...positionMSPSI, employeeNumber: e.target.value })}
          /></td>
      </tr>
      <tr>
        <td>Position Number:</td>
        <td><input
          type="text"
          id="positionNumber"
          name="positionNumber"
          value={positionMSPSI.positionNumber}
          onChange={(e) => assignTo_positionMSPSI({ ...positionMSPSI, positionNumber: e.target.value })}
          /></td>
      </tr>
      <tr>
        <td>Position Level:</td>
        <td><input
          type="text"
          id="positionLevel"
          name="positionLevel"
          value={positionMSPSI.positionLevel}
          onChange={(e) => assignTo_positionMSPSI({ ...positionMSPSI, positionLevel: e.target.value })}
          /></td>
      </tr>
      <tr>
        <td>Position Title:</td>
        <td><input
          type="text"
          id="positionTitle"
          name="positionTitle"
          value={positionMSPSI.positionTitle}
          onChange={(e) => assignTo_positionMSPSI({ ...positionMSPSI, positionTitle: e.target.value })}
          /></td>
      </tr>
      <tr>
        <td>Parent Position Surrogate ID:</td>
        <td><input
          type="text"
          id="parentPSID"
          name="parentPSID"
          value={positionMSPSI.parentPSID}
          onChange={(e) => assignTo_positionMSPSI({ ...positionMSPSI, parentPSID: e.target.value })}
          /></td>
      </tr>
    </>
  );
}

function normalizedPositionSansPositionSurrogateIDs(
    positionMSPSI: PositionMaybeSansPositionSurrogateIDs): PositionMaybeSansPositionSurrogateIDs {
  return {
    employeeFirstName: positionMSPSI.employeeFirstName.trim(),
    employeeLastName: positionMSPSI.employeeLastName.trim(),
    employeeNumber: positionMSPSI.employeeNumber.trim(),
    positionNumber: positionMSPSI.positionNumber.trim(),
    positionLevel: positionMSPSI.positionLevel.trim(),
    positionTitle: positionMSPSI.positionTitle.trim(),
    parentPSID: positionMSPSI.parentPSID.trim(),
  };
}

function CreateOnePositionPage() {
  const [positionMSPSI, assignTo_positionMSPSI] = useState<PositionMaybeSansPositionSurrogateIDs>({
    employeeFirstName: '',
    employeeLastName: '',
    employeeNumber: '',
    positionNumber: '',
    positionLevel: '',
    positionTitle: '',
    parentPSID: '',
  });

  function handlePositionCreateFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    // Prevent page from submitting.
    event.preventDefault();
    const normProdMSPSI = normalizedPositionSansPositionSurrogateIDs(positionMSPSI);
    console.log('save button clicked with '+JSON.stringify(normProdMSPSI));
    if (!isPositionSansPositionSurrogateIDs(normProdMSPSI)) {
      alert('Every field must be non-empty to save changes.');
      return;
    }
    fetch(dbmsUriBase() + '/positions/', {
        method: 'POST',
        body: JSON.stringify(normalizedPositionSansPositionSurrogateIDs(normProdMSPSI)),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      })
      .then((response) => {
        if (response.status === 201) {
          alert('Changes were saved.');
        }
        else if (response.status === 400) {
          alert('Failed to save changes as bad client request; you might have exceeded the limit on how many positions may have this Level.');
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
      <h2>Add an Position</h2>
      <p><Link to={'/'}>Return</Link> to the position listing page.</p>
      <form onSubmit={handlePositionCreateFormSubmit}>
        <table>
          <tbody>
            <tr>
              <td>Position Surrogate ID:</td>
              <td>(Will be generated.)</td>
            </tr>
            <PositionFormFieldsSansPositionSurrogateIDs
              positionMSPSI={positionMSPSI}
              assignTo_positionMSPSI={assignTo_positionMSPSI}
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

function EditOnePositionPage() {
  const { positionSurrogateID } = useParams();

  const [isPositionFetchError, assignTo_isPositionFetchError] = useState<boolean>(true);
  const [positionMSPSI, assignTo_positionMSPSI] = useState<PositionMaybeSansPositionSurrogateIDs>({
    employeeFirstName: '',
    employeeLastName: '',
    employeeNumber: '',
    positionNumber: '',
    positionLevel: '',
    positionTitle: '',
    parentPSID: '',
  });

  useEffect(() => {
    fetch(dbmsUriBase() + '/positions/'+positionSurrogateID)
      .then((response) => {
        if (response.status === 200) {
          assignTo_isPositionFetchError(false);
          return response.json();
        }
        else {
          assignTo_isPositionFetchError(true);
        }
      })
      .then((data) => {
        if (!isPosition(data)) {
          assignTo_isPositionFetchError(true);
        }
        else {
          assignTo_positionMSPSI(data);
        }
      })
      .catch((err) => {
        assignTo_isPositionFetchError(true);
        console.log(err.message);
      });
  }, [positionSurrogateID]);

  if (isPositionFetchError) {
    return (
      <p>Failed to fetch position.</p>
    )
  }

  function handlePositionEditFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    // Prevent page from submitting.
    event.preventDefault();
    const normProdMSPSI = normalizedPositionSansPositionSurrogateIDs(positionMSPSI);
    const position: Position = { ...normProdMSPSI, positionSurrogateID: positionSurrogateID || '' };
    console.log('save button clicked with '+JSON.stringify(position));
    if (!isPosition(position)) {
      alert('Every field must be non-empty to save changes.');
      return;
    }
    fetch(dbmsUriBase() + '/positions/'+positionSurrogateID+'/', {
        method: 'PUT',
        body: JSON.stringify(position),
        headers: {
          'Content-type': 'application/json; charset=UTF-8',
        },
      })
      .then((response) => {
        if (response.status === 200) {
          alert('Changes were saved.');
        }
        else if (response.status === 400) {
          alert('Failed to save changes as bad client request; you might have exceeded the limit on how many positions may have this Level.');
        }
        else if (response.status === 404) {
          alert('Failed to save changes as position no longer in database.');
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
      <h2>Edit an Position</h2>
      <p><Link to={'/'}>Return</Link> to the position listing page.</p>
      <form onSubmit={handlePositionEditFormSubmit}>
        <table>
          <tbody>
            <tr>
              <td>Position Surrogate ID:</td>
              <td>{positionSurrogateID}</td>
            </tr>
            <PositionFormFieldsSansPositionSurrogateIDs
              positionMSPSI={positionMSPSI}
              assignTo_positionMSPSI={assignTo_positionMSPSI}
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

function DeleteOnePositionPage() {
  const { positionSurrogateID } = useParams();

  const [isPositionFetchError, assignTo_isPositionFetchError] = useState<boolean>(true);
  const [positionMSPSI, assignTo_positionMSPSI] = useState<PositionMaybeSansPositionSurrogateIDs>({
    employeeFirstName: '',
    employeeLastName: '',
    employeeNumber: '',
    positionNumber: '',
    positionLevel: '',
    positionTitle: '',
    parentPSID: '',
  });

  useEffect(() => {
    fetch(dbmsUriBase() + '/positions/'+positionSurrogateID)
      .then((response) => {
        if (response.status === 200) {
          assignTo_isPositionFetchError(false);
          return response.json();
        }
        else {
          assignTo_isPositionFetchError(true);
        }
      })
      .then((data) => {
        if (!isPosition(data)) {
          assignTo_isPositionFetchError(true);
        }
        else {
          assignTo_positionMSPSI(data);
        }
      })
      .catch((err) => {
        assignTo_isPositionFetchError(true);
        console.log(err.message);
      });
  }, [positionSurrogateID]);

  if (isPositionFetchError) {
    return (
      <p>Failed to fetch position.</p>
    )
  }

  function handlePositionDeleteFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    // Prevent page from submitting.
    event.preventDefault();
    console.log('delete button clicked with '+positionSurrogateID);
    fetch(dbmsUriBase() + '/positions/'+positionSurrogateID+'/', {
        method: 'DELETE',
      })
      .then((response) => {
        if (response.status === 200) {
          alert('Position was deleted.');
        }
        else if (response.status === 400) {
          alert('Failed to save changes as bad client request; this shouldn\'t happen.');
        }
        else if (response.status === 404) {
          alert('Failed to save changes as position no longer in database.');
        }
        else {
          alert('Something else happened: '+response.status+' '+response.statusText);
        }
      })
      .catch((err) => {
        alert('Failed to delete position: ' + err.message
          + ' see console for details');
        console.log(err.message);
      });
  }

  return (
    <>
      <h2>Delete an Position</h2>
      <p><Link to={'/'}>Return</Link> to the position listing page.</p>
      <form onSubmit={handlePositionDeleteFormSubmit}>
        <table>
          <tbody>
            <tr>
              <td>Position Surrogate ID:</td>
              <td>{positionSurrogateID}</td>
            </tr>
            <PositionFormFieldsSansPositionSurrogateIDs
              positionMSPSI={positionMSPSI}
              assignTo_positionMSPSI={assignTo_positionMSPSI}
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
        <Route path="/create" element={<CreateOnePositionPage />} />
        <Route path="/" element={<ViewAllPositionsPage />} />
        <Route path="/edit/:positionSurrogateID" element={<EditOnePositionPage />} />
        <Route path="/delete/:positionSurrogateID" element={<DeleteOnePositionPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
