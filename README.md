# fetch-gcode

Utility that automates using the [Copper Carbide](https://copper.carbide3d.com) to generate gcode from Gerber files.

## Usage Instructions

First, make sure [npm](https://docs.npmjs.com/cli/v7/configuring-npm/install) is installed.

Clone the repo and cd into it:
```
git clone "https://github.com/terrestrialflyingfish/fetch-gcode.git"
cd fetch-gcode
```

Then run:
```
npm install
```

To use the utility, make sure you are in the fetch-gcode directory.

When using the command, you have to specify the paths to the signal, profile and drill files. They have to be absolute file paths. You can also specify the browser the utility will use to access Copper Carbide. 

```
node utility.js carbide -s <path to signal Gerber file> -p <path to profile Gerber file> -d <path to drill file> -b <browser utility should use>
```

Example:
```
node utility.js carbide -s ~/project/copper_top.gbr -p ~/project/profile.gbr -d ~/project/drill.xln -b "firefox"
```
