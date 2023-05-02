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
  positionMSESI: PositionMaybeSansPositionSurrogateIDs;
  assignTo_positionMSESI: (x: PositionMaybeSansPositionSurrogateIDs) => void;
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
      <th>Position First Name</th>
      <th>Position Last Name</th>
      <th>Position Number</th>
      <th>Position Level</th>
      <th>Position Notes</th>
    </tr>
  );

  const tableRows = filteredPositions.map((position) =>
    <tr key={position.positionSurrogateID}>
      <td><Link to={'/edit/' + position.positionSurrogateID}>Edit</Link></td>
      <td><Link to={'/delete/' + position.positionSurrogateID}>Delete</Link></td>
      <td>{position.positionSurrogateID}</td>
      <td>{position.positionFirstName}</td>
      <td>{position.positionLastName}</td>
      <td>{position.positionNumber}</td>
      <td>{position.positionLevel}</td>
      <td>{position.positionNotes}</td>
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
      positionMSESI,
      assignTo_positionMSESI,
      forDisplayOnly,
    }: PositionCEDProps) {

  if (forDisplayOnly) {
    return (
      <>
        <tr>
          <td>Position First Name:</td>
          <td>{positionMSESI.positionFirstName}</td>
        </tr>
        <tr>
          <td>Position Last Name:</td>
          <td>{positionMSESI.positionLastName}</td>
        </tr>
        <tr>
          <td>Position Number:</td>
          <td>{positionMSESI.positionNumber}</td>
        </tr>
        <tr>
          <td>Position Level:</td>
          <td>{positionMSESI.positionLevel}</td>
        </tr>
        <tr>
          <td>Position Notes:</td>
          <td>{positionMSESI.positionNotes}</td>
        </tr>
      </>
    );
  }

  return (
    <>
      <tr>
        <td>Position First Name:</td>
        <td><input
          type="text"
          id="positionFirstName"
          name="positionFirstName"
          value={positionMSESI.positionFirstName}
          onChange={(e) => assignTo_positionMSESI({ ...positionMSESI, positionFirstName: e.target.value })}
          /></td>
      </tr>
      <tr>
        <td>Position Last Name:</td>
        <td><input
          type="text"
          id="positionLastName"
          name="positionLastName"
          value={positionMSESI.positionLastName}
          onChange={(e) => assignTo_positionMSESI({ ...positionMSESI, positionLastName: e.target.value })}
          /></td>
      </tr>
      <tr>
        <td>Position Number:</td>
        <td><input
          type="text"
          id="positionNumber"
          name="positionNumber"
          value={positionMSESI.positionNumber}
          onChange={(e) => assignTo_positionMSESI({ ...positionMSESI, positionNumber: e.target.value })}
          /></td>
      </tr>
      <tr>
        <td>Position Level:</td>
        <td><input
          type="text"
          id="positionLevel"
          name="positionLevel"
          value={positionMSESI.positionLevel}
          onChange={(e) => assignTo_positionMSESI({ ...positionMSESI, positionLevel: e.target.value })}
          /></td>
      </tr>
      <tr>
        <td>Position Notes:</td>
        <td><input
          type="text"
          id="positionNotes"
          name="positionNotes"
          value={positionMSESI.positionNotes}
          onChange={(e) => assignTo_positionMSESI({ ...positionMSESI, positionNotes: e.target.value })}
          /></td>
      </tr>
    </>
  );
}

function normalizedPositionSansPositionSurrogateIDs(
    positionMSESI: PositionMaybeSansPositionSurrogateIDs): PositionMaybeSansPositionSurrogateIDs {
  return {
    positionFirstName: positionMSESI.positionFirstName.trim(),
    positionLastName: positionMSESI.positionLastName.trim(),
    positionNumber: positionMSESI.positionNumber.trim(),
    positionLevel: positionMSESI.positionLevel.trim(),
    positionNotes: positionMSESI.positionNotes.trim(),
  };
}

function CreateOnePositionPage() {
  const [positionMSESI, assignTo_positionMSESI] = useState<PositionMaybeSansPositionSurrogateIDs>({
    positionFirstName: '',
    positionLastName: '',
    positionNumber: '',
    positionLevel: '',
    positionNotes: '',
  });

  function handlePositionCreateFormSubmit(event: React.FormEvent<HTMLFormElement>) {
    // Prevent page from submitting.
    event.preventDefault();
    const normProdMSESI = normalizedPositionSansPositionSurrogateIDs(positionMSESI);
    console.log('save button clicked with '+JSON.stringify(normProdMSESI));
    if (!isPositionSansPositionSurrogateIDs(normProdMSESI)) {
      alert('Every field must be non-empty to save changes.');
      return;
    }
    fetch(dbmsUriBase() + '/positions/', {
        method: 'POST',
        body: JSON.stringify(normalizedPositionSansPositionSurrogateIDs(normProdMSESI)),
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
              positionMSESI={positionMSESI}
              assignTo_positionMSESI={assignTo_positionMSESI}
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
  const [positionMSESI, assignTo_positionMSESI] = useState<PositionMaybeSansPositionSurrogateIDs>({
    positionFirstName: '',
    positionLastName: '',
    positionNumber: '',
    positionLevel: '',
    positionNotes: '',
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
          assignTo_positionMSESI(data);
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
    const normProdMSESI = normalizedPositionSansPositionSurrogateIDs(positionMSESI);
    const position: Position = { ...normProdMSESI, positionSurrogateID: positionSurrogateID || '' };
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
              positionMSESI={positionMSESI}
              assignTo_positionMSESI={assignTo_positionMSESI}
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
  const [positionMSESI, assignTo_positionMSESI] = useState<PositionMaybeSansPositionSurrogateIDs>({
    positionFirstName: '',
    positionLastName: '',
    positionNumber: '',
    positionLevel: '',
    positionNotes: '',
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
          assignTo_positionMSESI(data);
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
              positionMSESI={positionMSESI}
              assignTo_positionMSESI={assignTo_positionMSESI}
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
