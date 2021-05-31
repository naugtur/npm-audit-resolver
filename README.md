
A tool for building a responsible but practical supply chain security practice.

`npm audit` is great. `npm audit fix` is also there if you didn't know. But not everything can be fixed right away and you need to manage your security and make decisions about the dependencies you use.

> I built audit-resolver after a few weeks of trying to run audit as a step in CI and failing each time there's a vulnerability. There were just too many irrelevant or unfixed ones and my team needed a way to manage the situation. 

Audit resolver creates a `audit-resolve.json` file in your app and interactively helps you manage security of your dependencies.  
You can decide what to ignore and for how long, or track what's been fixed before.  
The `audit-resolve.json` file sits in the repository and you can see who decided to ignore what and when.

*This package is meant for early adopters. Anything can change, but my team uses it for maintaining over 20 apps so there's likely to be a migration path.*

I'm working on getting it built into npm. See [the RFC](https://github.com/npm/rfcs/pull/18)  
I'm participating in [Package Vulnerability Management & Reporting Collaboration Space](https://github.com/openjs-foundation/pkg-vuln-collab-space) where I intend to donate parts of the audit-resolver's core.

## 👷 🚧

npm7 has introduced significant changes to the audit output. Support for that is in a release candidate for v3. 
You can try it out by installing `npm-audit-resolver@next`
## Install

Requires npm v6.1.0+ or yarn installed alongside

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
--yarn switch to calling yarn audit instead of npm audit.
--migrate forces migration to a new file and format even if no modifications are made to decisions
```

All other arguments are passed down to the npm/yarn audit call

### Running in CI

One of the problems this solves is running audit as part of your build pipeline.
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

Want to give it a go? Download this repo and run `npm run testdrive`

When a vulnerability is found, you get to choose between the following options:

- fix - Runs the fix proposed by npm audit and makes a note. If the same issue comes back because someone else on the team changed package-lock.json, you'll get a warning about that.
- show details - Prints more information about the issues form the audit and asks what to do again
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
