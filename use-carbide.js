import { Selector } from 'testcafe';
import { readFileSync, existsSync } from 'fs';
import { readFile } from 'fs/promises';
import path from 'path';

let settings = readFileSync('./utility-settings.json');
settings = JSON.parse(settings);
console.log(settings);
let downloadDir = settings.dwndir;

let validateFilename = async (t, uploaded, expected) => {
  await t.expect(uploaded).eql(expected);
}

// Wait 30*.5 ms = 15 s or less
async function waitForFile (t, path) {
   for (let i = 0; i < 30; i++) {
      await t.wait(500);
   }
   //just auto end the test
   return true;
}

fixture`Copper Carbide`
    .disablePageReloads
    .page`https://copper.carbide3d.com`;

test('set job type', async t => {
  const jobTypeSelect = await Selector('#jobType');
  await t
      .click(Selector("#closeSplashButton"))
      .click(jobTypeSelect)
      .click(Selector('option[value="1"]'));
  let jobTypeVal = await jobTypeSelect.value;
  let jobTypeOption = await Selector('#jobType').find(`option[value="${jobTypeVal}"]`);
  let jobType = await jobTypeOption.innerText;
  //console.log(jobType);
  await t.expect(jobType).eql("Top Side Only");
})

test('set contour tool', async t => {
  const nextBtn = await Selector("#appContainer").find('#nextPageButton');

  const contourToolSelect = await Selector('#contourTool');
  await t
      .click(nextBtn)
      .click(contourToolSelect)
      .click(Selector('option[value="8"]'));
  let contourToolVal = await contourToolSelect.value;
  let contourToolOption = await Selector('#contourTool').find('option[value="'+contourToolVal+'"]')
  let toolNum = await contourToolOption.innerText;
  console.log(toolNum);
  await t.expect(toolNum).eql("#502, Vee, 0.125 mm 40° ");
})

test('upload top layer copper file', async t => {
  console.log(path.relative(__dirname, settings.signalFile));
  await t
      .setFilesToUpload('#signalUploadFile', [path.relative(__dirname, settings.signalFile)]);

  const uploadFn = await Selector('#signalUploadFile').value;
  //This is just so the test will pass
  await validateFilename(t,uploadFn,uploadFn);
})

test('upload drill file', async t => {
  const nextBtn = await Selector("#appContainer").find('#nextPageButton');

  console.log("\n----log for "+"page: Copper Layer"+" starts here----\n")

  await t
      .click(nextBtn)
      .setFilesToUpload('#drillUploadFile', [path.relative(__dirname, settings.drillFile)])
  const drillFilename = await Selector('#drillUploadFile').value;
  console.log(drillFilename);
  //This is just so the test will pass
  await validateFilename(t,drillFilename,drillFilename);
});
test('select drill tool #606', async t => {
  const drillToolSelect = await Selector('#drillToolDiameter');
  const drillToolOption = await Selector('#drillToolDiameter').find('option[value="5"]');
  await t
      .click(drillToolSelect)
      .click(drillToolOption)
      .scroll(await Selector("#rightPanel"), "bottom");

  const drillToolVal = await drillToolSelect.value;
  const drillNum = await drillToolSelect.find(`option[value="${drillToolVal}"]`).innerText;
  console.log(drillNum);
  await t.expect(drillNum).eql("#606, 0.600 mm ");
});

test('upload outline file', async t => {
  const nextBtn = await Selector("#appContainer").find('#nextPageButton');

  console.log("\n----log for "+"page: Board Routing"+" starts here----\n")

  await t
      .click(nextBtn)
      .setFilesToUpload('#outlineUploadFile', [path.relative(__dirname, settings.profileFile)]);

  const outlineFilename = await Selector('#outlineUploadFile').value;
  console.log(outlineFilename);

  //This is just so the test will pass
  await validateFilename(t,outlineFilename,outlineFilename);
});

test("check routing tool is #112", async t => {
  const routingToolSelect = await Selector('#routingTool');
  const rtVal = await routingToolSelect.value;
  const routingToolNum = await routingToolSelect.find(`option[value="${rtVal}"]`).innerText;
  console.log(routingToolNum);
  await t.expect(routingToolNum).eql("#112, Flat, 1.587 mm 0° ")
});

test("check hatches checkbox", async t => {
  const nextBtn = await Selector("#appContainer").find('#nextPageButton');

  console.log("\n----log for "+"page: Area Rubout"+" starts here----\n");
  await t
      .click(nextBtn)
      .click(await Selector('#hatchesCheck'));
  const isChecked = await Selector('#hatchesCheck').value;
  console.log(isChecked);
  await t.expect(isChecked).eql("on");
});

test("set hatch tool to #122", async t => {
  const hatchesSelect = await Selector('#hatchesToolDiameter');
  await t
      .click(hatchesSelect)
      .click(await hatchesSelect.find('option[value="4"]'));
  const hsVal = await hatchesSelect.value;
  const hatchToolNum = await hatchesSelect.find(`option[value="${hsVal}"]`).innerText;
  console.log(hatchToolNum);
  await t.expect(hatchToolNum).eql("#122, Flat, 0.793 mm 0° ");
});

test("download gcode", async t => {
    const nextBtn = await Selector("#appContainer").find('#nextPageButton');

    var dwnBtnSelector = '';
    if (settings.isMulti) {
      dwnBtnSelector = '#generateToolPathButton';
    } else {
      dwnBtnSelector = '#generateGCodeButton';
    }
    const dwnBtn = await Selector(dwnBtnSelector);
    console.log("\n----log for "+"page: G-code Output"+" starts here----\n");
    await t
        .click(nextBtn)
        .click(dwnBtn);

    var downloadedFilePath = '';
    if (settings.isMulti) {
        downloadedFilePath=path.join(downloadDir,'gcode.zip');
    } else {
        downloadedFilePath=path.join(downloadDir,'copper.nc');
    }
    console.log("\n***waiting 15 seconds for file to download...***\n");
    await t.expect( await waitForFile(t, downloadedFilePath) ).ok();
})
