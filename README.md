# npm audit resolver

`npm audit` is great. `npm audit fix` is also there if you didn't know. But sometimes you need to manage your security and make decisions about the dependencies you use.

This tool creates a `audit-resolv.json` file in your app and interactively helps you manage security of your dependencies.

## Install

Requires npm v6.1.0 installed alongside

```
npm install -g npm-audit-resolver
```

## Usage

Go into the project folder and run

```
resolve-audit
```

It goes through the results of `npm audit` and lets you decide what to do with the issues.
The decisions you make are stored in `audit-resolv.json` to keep track of it in version control and have a log of who decided to do what and when.

### Running in CI

One if the problems this solves is running audit as part of your build pipeline.
You don't want to break your CI for a few days waiting to get a fix on a dependency, but at the same time ignoring the whole class of issues or the audit result entirely means you'll rarely notice it at all.

Run 
```
check-audit
```

This command will only exit with an error if a human needs to make new decisions about vulnerabilities and commit the `audit-resolv.json` file. If all issues are addressed, your build can pass.

## Why would I ignore security vulnerabilities?

- dev dependencies! a DOS vulnerability in your test runner's dependency is not a showstopper
- build tooling vulnerability
- dependencies of a tool you use very narrowly
- new vulnerability without a fix and you want to wait for a fix while running your builds (there's a remind me in 24h option available)
