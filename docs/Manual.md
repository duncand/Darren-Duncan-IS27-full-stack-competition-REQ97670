# BCSD - End User Manual

This document consists of multiple parts; for a directory to all of the
parts, see [Overview](../README.md).

This part of the document explains what regular end users, who are simply
using an already deployed instance of BCSD, need to know.

BCSD is a simple web-based database application that implements a staff
directory for an organization, where employees are arranged in a hierarchy;
it supports listing, viewing, adding, editing, and removing employee
position records.

To be more specific, it models a set of positions, such that each position
has its own identity with its own distinct Position Title and Position
Number, such that these are arranged in a hierarchy of 5 named levels.

Each position can either be occupied by a single employee, where the latter
has a separate identity in the form of an Employee First Name, Employee
Last Name, and Employee Number, or the position may be vacant, not occupied
by an employee, but still having its own existence and identity.

The web application has 4 main screens: View All Positions, Add a Position,
Edit a Position, and Delete a Position.

## View All Positions

The View All Positions screen displays all positions in the database at
once, arranged in a hierarchical list, one position per line, such that
child positions are grouped under and indented relative to their parent.

This screen shows all details for each position, plus all the details for
the employee occupying that position, if there is one, and it indicates a
vacancy otherwise, as there aren't a lot of the details so they fit easily
and it means everything is accessable in one place.

Beside each position are 2 links titled "Edit" and "Delete", such that
clicking on one of them takes you to the Edit a Position and Delete a
Position page specific to that position.

As an exception, the "Delete" link is not present for any position that has
child positions, since deleting such a position would make orphans of its
children; if you want to delete such a position, delete its descendants
first.

Beneath each position is a link to "Add" a new child position of that
position, that goes to the Add a Position screen.

As an exception, a position of the lowest level does not give the option to
add a child.

If the database is empty / has no positions, then this screen will just
contain an "Add" link to create a root position, and then you can continue
from there.

## Add/Edit/Delete Position

Each of these screens shows the full details of a position as well as its
associated employee when present.  The Add/Edit screens allow input or
editing of all the core information, Position Title, Position Number, and
Employee First/Last/Number.  The Delete screen just displays those details
without being editable.

To use each screen, fill in or edit the fields as applicable, and then
click a button at the bottom to save changes (or delete the record).

To indicate that an employee occupies a position, all 3 Employee fields
must be filled in; to indicate the position is vacant, all 3 Employee
fields must be vacant; the application won't allow some to be filled and
others empty.

The Position Title/Number must always be populated.

When clicking the button, a modal alert message will appear that either
states the changes were saved/deleted, or that they weren't, either because
of bad input or a server side problem.  This message won't specify which
field is the problem.  You can keep retrying until you succeed.

After dismissing the modal message, you will still be on the same screen;
on the Edit version you can choose to Edit more and save again if you want.

When you are done / success, you will need to click the "Return" link at
the top left to go back to the View All Positions screen and see the result
of your add/edit/delete reflected there.

If you stay on the Add screen, you can keep adding more records with
suitable edits.  If you stay on the Delete screen, it will still have a
button but that will then be an invalid operation, that would report
failure the second time since the record is already gone.

