# npm-audit-resolver and npm7

The main idea behind why ignoring issues using audit-resolver is the precision with which it works. The vulnerability is ignored not on the package level, but a specific path in dependency tree and if the same vulnerable package surfaces elsewhere - potentially as a dependency of a dependency where it does get called in production code. In that case the warning needs to come back.

npm7's audit output is not structured the way it used to in npm6, but it contains almost all of the necessary information. I can reindex it to produce paths in dependency tree that audit-resolver uses. The only thing that's missing is deduplication.

*Example:*
a depends on b which depends on c
c is vulnerable
npm7 lists all a,b and c on the top level and the references in `.via` let me produce the chains:
```
a>b>c
b>c
c
```
But I don't need all of them.
If only a is a direct dependency, I need the a>b>c in audit-resolve file.
If both a and b are installed, I need a>b>c AND b>c. 
There's no way to tell which items in npm7 audit output are direct dependencies so I have to run `npm ls --depth=0 --json` to get that information. 

**ASK1**: An indication of that fact with a simple boolean or `.depth` field would do a lot to help.
I thought of using the "nodes" field, but it seems with deduplication they often land at the top.


Current audit doesn't seem to have enough information available in it to construct a valid fix command - install or update, dev dependency or not, depth, that's missing from the audit output in npm7 and audit-resolver doesn't have a command to run to fix an individual issue and record the fact it was fixed. 

**ASK2**: add a `.command` field to fixAvailable or share/expose the algorithm with which npm audit fix decides what to do.