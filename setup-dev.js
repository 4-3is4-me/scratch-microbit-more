const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process')

const ExtRoot = path.resolve(__dirname);
const VmRoot = path.resolve(__dirname, '../scratch-vm');
const GuiRoot = path.resolve(__dirname, '../scratch-gui');

const ExtId = 'microbitMore';
const VmExtDirName = 'microbitMore';

const VmExtPath = 'src/extensions/' + VmExtDirName;
const GuiExtPath = 'src/lib/libraries/extensions/' + ExtId;
const VmExtManager = 'src/extension-support/extension-manager.js'
const GuiExtIndex = 'src/lib/libraries/extensions/index.jsx'
const GuiExtIndexConfig = fs.readFileSync(path.join(ExtRoot, 'gui_ext_index-code.jsx'), 'utf-8');
const GuiMenuBarLogoFile = path.join('src', 'components', 'menu-bar', 'scratch-logo.svg');

// Make symbolic link in scratch-vm. 
try {
    fs.symlinkSync(path.resolve(path.join(ExtRoot, 'scratch-vm', VmExtPath)), path.resolve(path.join(VmRoot, VmExtPath)));
    console.log(`Make link: ${path.resolve(path.join(VmRoot, VmExtPath))}`);
} catch (err) {
    console.log(`Already exists link: ${path.resolve(path.join(VmRoot, VmExtPath))}`);
};

// Make symbolic link from scratch-vm for ESLint.
try {
    fs.symlinkSync(path.resolve(path.join(VmRoot, 'node_modules')), path.resolve(path.join(ExtRoot, 'scratch-vm', 'node_modules')));
    console.log(`Make link: ${path.resolve(path.join(ExtRoot, 'scratch-vm', 'node_modules'))}`);
} catch (err) {
    console.log(`Already exists link: ${path.resolve(path.join(ExtRoot, 'scratch-vm', 'node_modules'))}`);
}

try {
    fs.symlinkSync(path.resolve(path.join(VmRoot, 'src', '.eslintrc.js')), path.resolve(path.join(ExtRoot, 'scratch-vm', 'src', '.eslintrc.js')));
    console.log(`Make link: ${path.resolve(path.join(ExtRoot, 'scratch-vm', 'src', '.eslintrc.js'))}`);
} catch (err) {
    console.log(`Already exists link: ${path.resolve(path.join(ExtRoot, 'scratch-vm', 'src', '.eslintrc.js'))}`);
}

// Add the extension to extension manager of scratch-vm. 
let managerCode = fs.readFileSync(path.resolve(path.join(VmRoot, VmExtManager)), 'utf-8');
if (managerCode.includes(ExtId)) {
    console.log(`Already registered in manager: ${ExtId}`);
} else {
    fs.copyFileSync(path.resolve(path.join(VmRoot, VmExtManager)), path.resolve(path.join(VmRoot, VmExtManager + '_orig')));
    managerCode = managerCode.replace(/builtinExtensions = {[\s\S]*?};/, `$&\n\nbuiltinExtensions.${ExtId} = () => require('../extensions/${VmExtDirName}');`);
    fs.writeFileSync(path.resolve(path.join(VmRoot, VmExtManager)), managerCode);
    console.log(`Registered in manager: ${ExtId}`);
}

// Make symbolic link in scratch-gui. 
try {
    fs.symlinkSync(path.resolve(path.join(ExtRoot, 'scratch-gui', GuiExtPath)), path.resolve(path.join(GuiRoot, GuiExtPath)));
    console.log(`Make link: ${path.resolve(path.join(GuiRoot, GuiExtPath))}`);
} catch (err) {
    console.log(`Already exists link: ${path.resolve(path.join(GuiRoot, GuiExtPath))}`);
};

// Add the extension to list of scratch-gui. 
let indexCode = fs.readFileSync(path.resolve(path.join(GuiRoot, GuiExtIndex)), 'utf-8');
if (indexCode.includes(ExtId)) {
    console.log(`Already added to extrnsion list: ${ExtId}`);
} else {
    fs.copyFileSync(path.resolve(path.join(GuiRoot, GuiExtIndex)), path.resolve(path.join(GuiRoot, GuiExtIndex + '_orig')));
    indexCode = indexCode.replace(/^.*export default\s+\[\s*$/m,
        GuiExtIndexConfig.match(/<icon>.*[\r\n]+([\s\S]*)$[\r\n].*<\/icon>/mi)[1]
        + '\n\n$&\n'
        + GuiExtIndexConfig.match(/<configuration>.*[\r\n]+([\s\S]*)$[\r\n].*<\/configuration>/mi)[1]);
    fs.writeFileSync(path.resolve(path.join(GuiRoot, GuiExtIndex)), indexCode);
    console.log(`Added to extrnsion list: ${ExtId}`);
}

// Change logo image of scratch-gui
fs.copyFileSync(path.resolve(path.join(ExtRoot, 'scratch-gui', GuiMenuBarLogoFile)), path.resolve(path.join(GuiRoot, GuiMenuBarLogoFile)));

// Use local repositories.
let stdout = execSync(`cd ${VmRoot} && npm link`);
console.log(`stdout: ${stdout.toString()}`);

stdout = execSync(`cd ${GuiRoot} && npm link scratch-vm`);
console.log(`stdout: ${stdout.toString()}`);
