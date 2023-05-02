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
  emptyPositionMSPSI,
  isPosition,
  isPositionSansPositionSurrogateIDs,
  isPositions,
  levelAtIndex,
  positionAtIndex,
} from './app-types';

import './App.css';

// Note, for any uses of useEffect(), providing the second "optional" arg
// even if the empty array is necessary to avoid infinite useEffect() calls.

interface PositionCEDProps {
  positionMSPSI: PositionMaybeSansPositionSurrogateIDs;
  assignTo_positionMSPSI: (x: PositionMaybeSansPositionSurrogateIDs) => void;
  forDisplayOnly: boolean;
}

interface DisplayPositionWithChildrenProps {
  selfPosition: Position;
  positions: Array<Position>;
}

function dbmsUriBase(): string {
  // Defaults match those of the API server.
  const host = process.env.REACT_APP_DBMS_HOST ?? '127.0.0.1';
  const port = process.env.REACT_APP_DBMS_PORT ?? 80;
  return 'http://'+host+':'+port+'/api';
}

function DisplayPositionWithChildren({ selfPosition, positions }: DisplayPositionWithChildrenProps) {

  const selfRendered = (
    <table>
      <thead>
        <tr>
          <th></th>
          <th></th>
          <th>Position Surrogate ID</th>
          <th>Parent Position Surrogate ID</th>
          <th>Position Level</th>
          <th>Position Title</th>
          <th>Position Number</th>
          <th>Employee First Name</th>
          <th>Employee Last Name</th>
          <th>Employee Number</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><Link to={'/edit/' + selfPosition.positionSurrogateID}>Edit</Link></td>
          <td><Link to={'/delete/' + selfPosition.positionSurrogateID}>Delete</Link></td>
          <td>{selfPosition.positionSurrogateID}</td>
          <td>{selfPosition.parentPSID}</td>
          <td>{selfPosition.positionLevel}</td>
          <td>{selfPosition.positionTitle}</td>
          <td>{selfPosition.positionNumber}</td>
          <td>{selfPosition.employeeFirstName}</td>
          <td>{selfPosition.employeeLastName}</td>
          <td>{selfPosition.employeeNumber}</td>
        </tr>
      </tbody>
    </table>
  );

  const childPositions = positions.filter((position) =>
    position.parentPSID === selfPosition.positionSurrogateID);

  var childrenRendered;
  if (childPositions.length === 0) {
    childrenRendered = (
      <p>No children.</p>
    );
  }
  else {
    const childTableRows = childPositions.map((position) =>
      <tr key={position.positionSurrogateID}>
        <td>
          <DisplayPositionWithChildren
            selfPosition={position}
            positions={positions}
          />
        </td>
      </tr>
    );
    childrenRendered = (
      <table>
        <tbody>
          {childTableRows}
        </tbody>
      </table>
    );
  }

  return (
    <table>
      <tbody>
        <tr key="1">
          <td>
            {selfRendered}
          </td>
        </tr>
        <tr key="2">
          <td>
            {childrenRendered}
          </td>
        </tr>
      </tbody>
    </table>
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

  const rootPositions = positions.filter((position) =>
    position.positionLevel === levelAtIndex(0).code);

  if (rootPositions.length === 0) {
    return (
      <>
        <p>There is no root position to display.</p>
        <p><Link to={'/create'}>Add</Link> a new position.</p>
      </>
    )
  }

  return (
    <>
      <p>Total of {positions.length} positions displayed.</p>
      <p><Link to={'/create'}>Add</Link> a new position.</p>
      <DisplayPositionWithChildren
        selfPosition={positionAtIndex(rootPositions, 0)}
        positions={positions}
      />
    </>
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
          <td>Parent Position Surrogate ID:</td>
          <td>{positionMSPSI.parentPSID}</td>
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
          <td>Position Number:</td>
          <td>{positionMSPSI.positionNumber}</td>
        </tr>
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
      </>
    );
  }

  return (
    <>
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
  const [positionMSPSI, assignTo_positionMSPSI]
    = useState<PositionMaybeSansPositionSurrogateIDs>(emptyPositionMSPSI);

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
      <h2>Add a Position</h2>
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
  const [positionMSPSI, assignTo_positionMSPSI]
    = useState<PositionMaybeSansPositionSurrogateIDs>(emptyPositionMSPSI);

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
    const position: Position = { ...normProdMSPSI, positionSurrogateID: positionSurrogateID ?? '' };
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
      <h2>Edit a Position</h2>
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
  const [positionMSPSI, assignTo_positionMSPSI]
    = useState<PositionMaybeSansPositionSurrogateIDs>(emptyPositionMSPSI);

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
      <h2>Delete a Position</h2>
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
