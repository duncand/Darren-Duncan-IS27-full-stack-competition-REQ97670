# Province of British Columbia - Staff Directory (BCSD)

This document describes BCSD, a simple web-based database application that
implements a staff directory for an organization, where employees are
arranged in a hierarchy; it supports listing, viewing, adding, editing, and
removing employee records.

BCSD is implemented as a pair of applications named BCSD-DBMS and
BCSD-WEBAPP, such that the latter is what end users typically interact
with directly using a generic web browser, and the former is a supporting
service providing a RESTful API that the latter consumes.

## Quick Links

The canonical home of this BCSD source code is
<https://github.com/duncand/Darren-Duncan-IS27-full-stack-competition-REQ97670>.

A temporary live deployment of BCSD is on Heroku.

Visit <http://req97670-bcsd-webapp.herokuapp.com> in a web browser to
actually use the application as a regular end user.

Visit <http://req97670-bcsd-dbms.herokuapp.com/api/api-docs> to view the
interactive REST API documentation which lets you invoke the API directly.

## Contents

This document consists of multiple parts:

1. BCSD - Overview (the current part)
1. [BCSD - End User Manual](docs/Manual.md)
1. [BCSD - Structure](docs/Structure.md)
1. [BCSD - Local Deployment](docs/Local.md)
1. [BCSD - Heroku Deployment](docs/Heroku.md)
1. [BCSD - Future Functionality](docs/Future.md)
1. [BCSD - Assumptions](docs/Assumptions.md)

The [BCSD - End User Manual](docs/Manual.md) part is what regular end
users, who are simply using an already deployed instance of BCSD, need to
know; the other documentation parts are mainly for someone wanting to
deploy or develop the application or otherwise learn more about how it
works internally.

## Author

Darren Duncan - darren@DarrenDuncan.net

## License and Copyright

BCSD is Copyright © 2023, Darren Duncan.

BCSD is free software;
you can redistribute it and/or modify it under the terms of the Apache
License, Version 2.0 (AL2) as published by the Apache Software Foundation
(<https://www.apache.org>).  You should have received a copy of the
AL2 as part of the BCSD distribution, in the file
[LICENSE/Apache-2.0.txt](LICENSE/Apache-2.0.txt); if not, see
<https://www.apache.org/licenses/LICENSE-2.0>.

Any versions of BCSD that you modify and distribute must carry prominent
notices stating that you changed the files and the date of any changes, in
addition to preserving this original copyright notice and other credits.
BCSD is distributed in the hope that it will be
useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
