# Audit Resolver

A tool for building a responsible but practical supply chain security practice.

`npm audit` is great. `npm audit fix` is also there if you didn't know. But not everything can be fixed right away and you need to manage your security and make decisions about the dependencies you use.

> I built audit-resolver after a few weeks of trying to run audit as a step in CI and failing each time there's a vulnerability. There were just too many irrelevant or unfixed ones and my team needed a way to manage the situation. 

Audit resolver creates a `audit-resolve.json` file in your app and interactively helps you manage security of your dependencies.  
You can decide what to ignore and for how long, or track what's been fixed before.  
The `audit-resolve.json` file sits in the repository and you can see who decided to ignore what and when.

I'm participating in [Package Vulnerability Management & Reporting Collaboration Space](https://github.com/openjs-foundation/pkg-vuln-collab-space) where I intend to donate parts of the audit-resolver's core.

## Changes in version 3

Due to changes introduced by npm7 the option to fix an individual package is no longer available from npm and wasn't always working correctly anyway. By virtue of "doing one thing and one thing well" this package will no longer provide that option. 
You can run `npm audit fix` before running the interactive `resolve-audit` command.

Requires npm v7.24.2+ or yarn 1 installed alongside    
Works with node 10+  
*You can use audit recolver v2.x with npm6*  
*Yarn support was not heavily tested across versions*  
## Install

```
npm install -g npm-audit-resolver
```

## Usage

Go into the project folder and run

```
resolve-audit
```

It goes through the results of `npm audit` and lets you decide what to do with the issues.
The decisions you make are stored in `audit-resolve.json` to keep track of it in version control and have a log of who decided to do what and when.

### Arguments 

```
--yarn switches to yarn instead of npm.
--migrate forces migration to the new audit-resolve.json file and format even if no modifications are made to decisions
--mock used in tests
```

All other arguments are passed down to the npm/yarn audit call

### Running in CI

One of the problems npm-audit-resolver solves is running audit as part of your build pipeline.
You don't want to break your CI for a few days waiting to get a fix on a dependency, but at the same time ignoring the whole class of issues or the audit result entirely means you'll rarely notice it at all.

Run
```
check-audit
```

This command will only exit with an error if a human needs to make new decisions about vulnerabilities and commit the `audit-resolve.json` file. If all issues are addressed, your build can pass.

For JSON output (similar to `npm audit --json`), run
```
check-audit --json
```

All other arguments are passed down to the npm/yarn audit call

## Features

When a vulnerability is found, you get to choose between the following options:

- remind in 24h - Lets you ignore an issue temporarily to make the build pass until a fix is known
- ignore - Adds the particular dependency paths and advisories to be ignored in the future. If the same issue in the same package comes up, but it's a dependency of another package, it won't get ignored. If a new issue is found in the package, it doesn't get ignored. You can decide if the decision expires or not.
- delete - Removes your dependency that brought the vulnerability in its dependencies.
- skip and quit, obviously

audit-resolve.json is formatted, so git history has a trace of who addressed which vulnerability, when and how.

### Why would I ignore security vulnerabilities?

Because otherwise running `npm audit` as part of your CI is not practical.

- dev dependencies! a DOS vulnerability in your test runner's dependency is not a showstopper
- build tooling vulnerability
- dependencies of a tool you use very narrowly and can prove it's safe
- new vulnerability without a fix and you want to wait for a fix while running your builds (there's a remind me in 24h option available)
- Further in the future - because a maintainer you trust has checked and the vulnerability in their dependency tree that you pulled is not affecting the package you're using
