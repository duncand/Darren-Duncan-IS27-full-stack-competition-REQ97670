# Province of British Columbia - Staff Directory (BCSD)

BCSD is a simple web-based database application that implements a staff
directory for an organization, where employees are organized in a
hierarchy; it supports adding, editing, and removing employee records,
which includes changing their position in the hierarchy.

The canonical home of BCSD is
<https://github.com/duncand/Darren-Duncan-IS27-full-stack-competition-REQ97670>.

## Structure

BCSD is implemented as a pair of applications named BCSD-DBMS and
BCSD-WEBAPP, such that the latter is what end users typically interact
with directly using a generic web browser, and the former is a supporting
service providing a RESTful API that the latter consumes.

### BCSD-DBMS

BCSD-DBMS is a TypeScript/JavaScript application that runs in a
server-side Node.js <https://nodejs.org> environment.

It is written against the ECMAScript standard version 12 (2021) so you
should have a fairly modern Node.js.

BCSD-DBMS is built around the NestJS framework, so the latter's main
documentation site <https://docs.nestjs.com> can be used to understand its
architecture and how to build and run it at a generic level.

But this current README will specify how to run BCSD-DBMS in a common
dev environment so you don't actually have to look at external docs.

### BCSD-WEBAPP

BCSD-WEBAPP is a TypeScript/JavaScript application that runs primarily in
the end-user's web browser with supporting functionality in a server-side
Node.js <https://nodejs.org> environment.

It is written against the ECMAScript standard version 12 (2021) so you
should have a fairly modern Node.js and web browser.

BCSD-WEBAPP is built around the React library, so the latter's main
documentation site <https://react.dev/learn> can be used to understand its
architecture and how to build and run it at a generic level.

But this current README will specify how to run BCSD-WEBAPP in a common
dev environment so you don't actually have to look at external docs.

## Installation

These instructions assume a modern UNIX-like shell environment, like one
would have with a modern Linux or Apple MacOS system.  If you are using a
Microsoft Windows system, some alterations may be necessary.

### Prerequisite - Node.js

You should have Node.js <https://nodejs.org> installed.
A common way to do so is using your operating system's package manager,
or with Homebrew <https://brew.sh> in the case of MacOS.

This will provide the `npm` (Node Package Manager) utility and other tools
you would use for most setup or runtime tasks afterwards.

### Project Source Code

Obtain the latest source code for this project from its current repository.
You can use a `git` client to clone/pull it, or GitHub can privide a zip file.

All shell command sequences given here to setup or run BCSD itself assume
your starting current working directory is the root level of your clone of
this project's source folder, unless otherwise stated.

### Node Package Manager

Before the first run of the BCSD-DBMS server, in a shell session, first
`cd` into the `bcsd-dbms` folder and run the following command, which
will fetch/install the server's additional JavaScript library dependencies:

```
    npm install
```

Before the first run of the BCSD-WEBAPP server, in a shell session, first
`cd` into the `bcsd-webapp` folder and run the following command, which
will fetch/install the server's additional JavaScript library dependencies:

```
    npm install
```

### Data File

BCSD-DBMS uses a JSON-formatted plain text file to keep its staff directory
data in.  You need to supply such a valid file in a file system location of
your choice and tell the application where it is.

An example data file `data_seed_for_copying.json` is provided in the
`bcsd-dbms` folder of the project.  You should not specify this file
itself as your data file, but you can specify a duplicate of it.

If you want to use an "empty" data file, then you just need one that
defines an empty JSON array, so its entire content is just `[]`.

The following instructions assume you named your data file `data.json` and
located it in the same `bcsd-dbms` folder.

## Running the Servers

### BCSD-DBMS

To start the BCSD-DBMS server, in a shell session, first `cd` into the
`bcsd-dbms` folder and run either of the following commands,
adjusting for your choices of host or port data file path:

```
    HOST=localhost PORT=3000 DATA_FILE_PATH=data.json npm run start:dev
```

Or:

```
    npm run build
    HOST=localhost PORT=3000 DATA_FILE_PATH=data.json npm run start:prod
```

The first option of 1 command is easier when one is actively developing
this project.  The server is running in a mode that watches for changes to
the source code files, automatically reloads them if it sees any changed,
and provides some helpful diagnostics when some problems occur.

The second option of 2 commands is better for a production or
production-like situation.  The first command only needs to be run when
there are changes made to the project.  The second command will run the
server produced by the first command and will not auto-reload on changes.

Any environment variable can be set inline like shown here,
or by setting it in a `.env` file.

You are required to explicitly give the path of the data file as a safety
measure, so the server isn't going and making changes to any file except
what you specify.

If you do not explicitly set `DATA_FILE_PATH`, then the server will
complain at startup with an error message about this plus exception in the
shell output; the server will not quit, but it will not work properly.

The actual specified data file doesn't need to exist until the actual times
that API invocations are made of the server.  The server will re-read the
file for every API call, and validate that it is present and is a well
formed set of employee records, and the API will return a 500 response if it
isn't without attempting to alter or create the file.  Assuming it is
valid, and the API invocation is also valid, any API invocation that is
a create/modify/remove request will rewrite the file.  You can manually
edit the file between API calls, including to fix it if it is damaged.

We assume only a single instance of BCSD-DBMS is running at a time for
any given data file, and that the server serializes handling of API calls;
it is not designed to handle concurrent access of multiple instances or
API calls to the same data file at once; data loss may occur in that case.

The `HOST` and `PORT` determine what the BCSD-DBMS server will listen on;
if either is not specified it will default to `127.0.0.1` (`localhost`) and
`80` respectively.

To stop the server, hit CTRL-C in the same shell session.

### BCSD-WEBAPP

To start the BCSD-WEBAPP server, in a shell session, first `cd` into the
`bcsd-webapp` folder and run either of the following commands,
adjusting for your choices of host or port:

```
    REACT_APP_DBMS_HOST=localhost REACT_APP_DBMS_PORT=3000 PORT=8080 npm start
```

Or:

```
    REACT_APP_DBMS_HOST=localhost REACT_APP_DBMS_PORT=3000 npm run build
    PORT=8080 serve -s build
```

The first option of 1 command is easier when one is actively developing
this project.  The server is running in a mode that watches for changes to
the source code files, automatically reloads them if it sees any changed,
and provides some helpful diagnostics when some problems occur.

The second option of 2 commands is better for a production or
production-like situation.  The first command only needs to be run when
there are changes made to the project.  The second command will run the
server produced by the first command and will not auto-reload on changes.

Any environment variable can be set inline like shown here,
or by setting it in a `.env` file.

The BCSD-WEBAPP server will listen on localhost port 8080, or whatever
alternate `PORT` you choose.  Make sure its not the same as BCSD-DBMS.

BCSD-WEBAPP will invoke BCSD-DBMS using the latter's location specified by
`REACT_APP_DBMS_HOST` and `REACT_APP_DBMS_PORT`.

To stop the server, hit CTRL-C in the same shell session.

## Using the BCSD Application

Visit <http://localhost:8080> in a web browser while both servers are
running to actually use the application as a regular end user.

Visit <http://localhost:3000/api/api-docs> to view the REST API
documentation or try out invoking it directly.

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
