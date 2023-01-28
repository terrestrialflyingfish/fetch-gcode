import { Command } from 'commander';
import path from 'path';
import os from 'os';
import fs from 'fs';
import testcafe from 'testcafe';

const program = new Command();
program
  .name('gcode-util')
  .description('CLI to retrieve gcode files from Copper Carbide')
  .version('0.0.1');

  let curSettings = fs.readFileSync('./utility-settings.json');
  curSettings = JSON.parse(curSettings);
program.command('carbide')
  .description('Gets gcode files from copper carbide.\n')
  .option('-m, --multi', 'return folder with multiple gcode files')
  .option('-b, --browser <string>', 'browser to run utility with', curSettings.browser)
  .option('-d, --drill <string>', 'path to drill file, ex. ~/project/copper_top.gbr', curSettings.drillFile)
  .option('-s, --signal <string>', 'path to signal file, ex. ex. ~/project/drill.xln', curSettings.signalFile)
  .option('-p, --profile <string>', 'path to profile file, ex. ~/project/profile.gbr', curSettings.profileFile)
  .option('-dw, --dwndir <string>', 'specify absolute path to download folder (doesn\'t actually do anything)', curSettings.dwndir)
  .action((options) => {
    console.log(options);
    curSettings.dwndir = options.dwndir.replace("~", os.homedir());
    if (options.multi){
      curSettings.isMulti = true;
    } else {
      curSettings.isMulti = false;
    }

    var browser = options.browser;
    switch (browser) {
      case 'chrome':
        curSettings.uploadedFilePrefix = "C:\\fakepath\\";
        break;
      case 'firefox':
        curSettings.uploadedFilePrefix = '';
        browser += ":headless";
        break;
      case 'safari':
        curSettings.uploadedFilePrefix = '';
        browser += ":headless";
        break;
      default:
        console.error("Unsupported browser.");
        process.exit(1);
    }

    curSettings.signalFile = options.signal.replace("~", os.homedir());
    curSettings.drillFile = options.drill.replace("~", os.homedir());
    curSettings.profileFile = options.profile.replace("~", os.homedir());

    fs.writeFileSync(path.join('utility-settings.json'), JSON.stringify(curSettings));
    (async () => {
      const cafe = await testcafe();
      const runner = cafe.createRunner();
      try {

        const runProg = await runner
           .src('./use-carbide.js')
           .browsers(browser)
           .run();
      }
      finally {
        await runner.stop();
        await cafe.close();
      }
    })()

});


program.parse();
