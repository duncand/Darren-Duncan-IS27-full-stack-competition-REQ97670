# BCSD - Structure

This document consists of multiple parts; for a directory to all of the
parts, see [Overview](../README.md).

This part of the document explains how BCSD is structured, with an overview
of its parts and how it works.

This document part is not exhaustive; where there are gaps, you can see the
source code files.

BCSD is implemented as a pair of applications named BCSD-DBMS and
BCSD-WEBAPP, such that the latter is what end users typically interact
with directly using a generic web browser, and the former is a supporting
service providing a RESTful API that the latter consumes.

## BCSD-DBMS

BCSD-DBMS is a TypeScript/JavaScript application that runs in a
server-side Node.js <https://nodejs.org> environment.

It is written against the ECMAScript standard version 12 (2021) so you
should have a fairly modern Node.js.

BCSD-DBMS is built around the NestJS framework, so the latter's main
documentation site <https://docs.nestjs.com> can be used to understand its
architecture and how to build and run it at a generic level.

But this current README will specify how to run BCSD-DBMS in a common
dev environment so you don't actually have to look at external docs.

## BCSD-WEBAPP

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
