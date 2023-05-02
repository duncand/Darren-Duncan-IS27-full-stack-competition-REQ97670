# BCSD - Heroku Deployment

This document consists of multiple parts; for a directory to all of the
parts, see [Overview](../README.md).

This part of the document explains how to install and run BCSD on the
Heroku <https://www.heroku.com> cloud service, such as one might do if they
were putting it into production.

These instructions assume a modern UNIX-like shell environment, like one
would have with a modern Linux or Apple MacOS system.  If you are using a
Microsoft Windows system, some alterations may be necessary.

Notably, you do not need to have Node.js or any other Javascript related
tools installed for a Heroku deployment as you would for a local one,
since all building and running of the sources happens remotely instead.

## Service Prerequisites

You need to have an account with Heroku.  Registering for one is fairly
straightforward, you start at <https://signup.heroku.com> and follow the
prompts.  Its just a few basic fields mostly.

Notable is Heroku requires 2FA for logins so you will need to have some 2FA
tool such as Google Authenticator installed on a phone, or a 2FA hardware
dongle, or such, as a prerequisite to have an account.

When I registered, I indicated that Node was my primary project type,
but that probably doesn't have any significant effect.

Your account also needs to be verified, per
<https://devcenter.heroku.com/articles/account-verification>, which
basically means logging into your account, going to Manage Account, and in
the Billing tab adding a credit card.

Heroku no longer has gratis hosting options, except for some students,
since the middle of 2022, so using them even for a simple application like
BCSD will cost some money.  But it should be possible to not spend more
than a few dollars for very short term usage; see also
<https://blog.heroku.com/new-low-cost-plans>.

See <https://www.heroku.com/pricing> for service pricing.

To run BCSD one requires 2 "dynos", one each for BCSD-DBMS and BCSD-WEBAPP.

I used two "Basic" dynos which cost 1 cent per hour and offer 512MB of RAM,
which is sufficient when deploying in production mode.

After registering and adding a payment option, you don't have to do
anything setup-wise in the Heroku website, everything else is done via the
Heroku CLI, including creating "dynos".  Although I still use the web
interface to delete the "dynos" when I'm done with them.  And there are
dashboards there.

# Choose public hosts to run under.

You will need to pick two public identifiers for the servers to run as;
I chose `req97670-bcsd-dbms` and `req97670-bcsd-webapp`.  These names are
referenced in the source code repository in configuration files and/or in
documentation instructions.  Substitute your own identifiers for your use.

# Local Prerequisites

## Git

You need to have Git <https://git-scm.com> installed on your local machine.
The Heroku CLI and deployment process requires and is based around it.

On MacOS, Apple provides Git as part of its devtools; you can cause it to
be installed by trying to run "git" in the Terminal which is initially a
shim and then you approve the Apple devtools install.

## Homebrew

The Homebrew <https://brew.sh> package manager for MacOS is used to
install the Heroku command line interface, so Homebrew has to be installed
first to do that.

## Heroku CLI

The Heroku command-line interface (CLI) is the main tool other than Git
that you will use to deploy anything to the Heroku servers.

Use Homebrew to install it with this shell command in the Terminal:

```
brew tap heroku/brew && brew install heroku
```

# Heroku Authentication

You then need to login to the Heroku CLI at least once after it is installed
by running this shell command:

```
heroku login
```

This would cause a web browser to open and you authenticate with your
account user/pass as well as the 2FA you associated with the account.

Rarely you might have to repeat this process, but once authenticated the
CLI seems to remember for at least several days so you may not need to again.

# Project Source Code

Obtain the latest source code for this project from its current repository.
You can use a `git` client to clone/pull it, or GitHub can privide a zip file.

<https://github.com/duncand/Darren-Duncan-IS27-full-stack-competition-REQ97670>

# Data File

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

# Heroku Procfiles

Each of BCSD-DBMS and BCSD-WEBAPP includes a `Procfile` in its root, which
is what Heroku uses automatically to know how to run the apps.  They are
complete as is for my usage, but you will need to alter the one in
`bcsd-webapp` to replace the `req97670-bcsd-webapp` with what you picked.
The `Procfile` in `bcsd-dbms` specifies the location of the `data.json` so
if you put yours elsewhere then update accordingly; it needs to be inside
`bcsd-dbms` though.

# New Local Git Repositories

A significant limitation of Heroku is it requires a separate local Git
repository each for BCSD-DBMS and BCSD-WEBAPP, because the entire contents
of the root directory of a Git repo are what are deployed, and need to have
a particular configuration.

This is not compatible with the canonical Git layout of BCSD on GitHub
which has both components plus supporting docs in a single Git repo.

However you obtained the BCSD sources, you will need to relocate or clone
separately the bcsd-dbms and bcsd-webapp subdirectories to somewhere
outside of any existing local Git repositories; if you fetched the project
as a zip file then they are fine where they are; if you used git clone you
will have to do the relocate/clone.

The rest of the instructions below assume the 2 subdirectories are not
inside a Git repository folder.

For each of the 2 subdirectories, cd into it and run the following:

```
git init
git add .
git commit -m 'initial version'
```

Thanks to the existing `.gitignore` files, using `git add .` should pick up
everything it needs to and nothing it doesn't.  In particular it should
include the `data.json` you provided/cloned.

# Creating the Heroku Dynos

Creating the Heroku dynos and associated remote Git repositories and
associating the local git repositories with them are accomplished with
these 2 shell commands.

For each of the 2 subdirectories, cd into it and run one of the following,
suitably modified for your own host names:

```
heroku create req97670-bcsd-dbms
heroku create req97670-bcsd-webapp
```

# Deploying to the Heroku Dynos

For each of the 2 subdirectories, cd into it and run this:

```
git push heroku main
```

Once that completes, assuming successful, BCSD will be running on the cloud.

## Using the BCSD Application

Visit your analogy to <http://req97670-bcsd-webapp.herokuapp.com> in a web
browser while both servers are running to actually use the application as a
regular end user.

Visit your analogy to
<http://req97670-bcsd-dbms.herokuapp.com/api/api-docs> to view the REST API
documentation or try out invoking it directly.

Note that Heroku makes both of those available under HTTPS in addition to
HTTP, but expect that only the HTTP will actually work as far as the two
app components talking to each other.
