# BCSD - Assumptions

This document consists of multiple parts; for a directory to all of the
parts, see [Overview](../README.md).

This part of the document explains assumptions that I made when
interpreting the requirements of the project.

A key assumption is that the scale is small enough that it is okay to fetch
all records and display them on the main screen, without paging.  And
similarly that it was okay to use a JSON file for storage rather than a
DBMS.

I also assumed it was okay to denormalize the data by having employee
details in the position records rather than their own records.
