
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');


// Endpoint for training teh rasa bot
module.exports.trainRasaBot = async (req, res) => {
  console.log('Received request to train Rasa Bot.');

  const rasaFolderPath = path.join(__dirname, '../../../rasachat');
  console.log('Rasa folder path:', rasaFolderPath);

  const activateCommand = process.platform === 'win32' ? '.\\venv\\Scripts\\activate' : './venv/Scripts/activate';
  const trainCommand = 'rasa train';

  // Start the training process
  const trainProcess = spawn(activateCommand + ' && ' + trainCommand, [], { cwd: rasaFolderPath, shell: true });

  trainProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  trainProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  trainProcess.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    if (code === 0) {
      console.log('Rasa Bot training completed successfully.');
      res.status(200).json({ message: 'Rasa Bot training completed successfully.' });
    } else {
      console.error('Error during Rasa Bot training.');
      res.status(500).json({ error: 'Error during Rasa Bot training.' });
    }
  });
};


// Endpoint for starting the rasa actions
module.exports.startRasaActions = async (req, res) => {
  console.log('Received request to start Rasa actions server.');

  const rasaFolderPath = path.join(__dirname, '../../../rasachat');
  console.log('Rasa folder path:', rasaFolderPath);

  const activateCommand = process.platform === 'win32' ? '.\\venv\\Scripts\\activate' : './venv/Scripts/activate';
  const runActionsCommand = 'rasa run actions';

  // Start Rasa actions server
  const actionsServerProcess = spawn(activateCommand + ' && ' + runActionsCommand, [], { cwd: rasaFolderPath, shell: true });
  
  actionsServerProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });
  
  actionsServerProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });
  
  actionsServerProcess.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    if (code === 0) {
      console.log('Rasa actions server started successfully.');
      res.status(200).json({ message: 'Rasa actions server started successfully.' });
    } else {
      console.error('Error starting Rasa actions server.');
      res.status(500).json({ error: 'Error starting Rasa actions server.' });
    }
  });
};


// Endpoint for starting the Rasa server
module.exports.startRasaServer = async (req, res) => {
  console.log('Received request to start Rasa server.');

  const rasaFolderPath = path.join(__dirname, '../../../rasachat');
  console.log('Rasa folder path:', rasaFolderPath);

  const activateCommand = process.platform === 'win32' ? '.\\venv\\Scripts\\activate' : './venv/Scripts/activate';
  const runRasaCommand = 'python -m rasa run --enable-api --cors="*"';

  // Start Rasa server

  const rasaServerProcess = spawn(activateCommand + ' && ' + runRasaCommand, [], { cwd: rasaFolderPath, shell: true });
  
  rasaServerProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  rasaServerProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  rasaServerProcess.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    if (code === 0) {
      console.log('Rasa server started successfully.');
      res.status(200).json({ message: 'Rasa server started successfully.' });
    } else {
      console.error('Error starting Rasa server.');
      res.status(500).json({ error: 'Error starting Rasa server.' });
    }
  });
};


// Endpoint for stopping the Rasa server
module.exports.stopRasaServer = async (req, res) => {
  console.log('Received request to stop Rasa server.');

  const stopRasaCommand = process.platform === 'win32' ? 'taskkill /f /im python.exe' : 'pkill -f "python -m rasa run --enable-api --cors="*"';

  // Stop the Rasa server process
  const stopRasaProcess = spawn(stopRasaCommand, { shell: true });

  stopRasaProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  stopRasaProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  stopRasaProcess.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    if (code === 0) {
      console.log('Rasa server stopped successfully.');
      res.status(200).json({ message: 'Rasa server stopped successfully.' });
    } else {
      console.error('Error stopping Rasa server.');
      res.status(500).json({ error: 'Error stopping Rasa server.' });
    }
  });
};




// rasa data update 
module.exports.addTrainingData = async (req, res) => {
    const { companyPrefix ,name, examples , response} = req.body;
    updateIntent(name, examples);
    updateDomain(name, response);
    addStory(name ,companyPrefix);
    return res.status(200).json({ message: 'Rasa Bot Data updatedsuccessfully' });
};



// this function to handle updating domain.yml
function updateDomain(intentName, response) {
    // Load the existing YAML content of domain.yml
    let domainYamlContent = fs.readFileSync('../../rasachat/domain.yml', 'utf8');
  
    // Check if the intent already exists
    if (domainYamlContent.includes(`- ${intentName}`)) {
      // Intent exists, find corresponding response block
      const responseBlockRegex = new RegExp(`utter_${intentName}:\\s*-\\s*text:\\s*["'](.*)["']`, 'g');
      const responseBlockMatch = responseBlockRegex.exec(domainYamlContent);
  
      if (responseBlockMatch) {
        const newResponseBlock = `\n  - text: "${response}"`;
        domainYamlContent = domainYamlContent.replace(responseBlockMatch[0], responseBlockMatch[0] + newResponseBlock);
      } else {
        // No response block found, add new response block
        const newResponseBlock = `\n  utter_${intentName}:\n  - text: "${response}"`;
        domainYamlContent = domainYamlContent.replace('responses:', `responses:${newResponseBlock}`);
      }
    } else {
      // Intent does not exist, add both intent and response block
      const newIntentBlock = `\n  - ${intentName}`;
      const newResponseBlock = `\n  utter_${intentName}: \n  - text: "${response}"`;
      domainYamlContent = domainYamlContent.replace('intents:', `intents:${newIntentBlock}`);
      domainYamlContent = domainYamlContent.replace('responses:', `responses:${newResponseBlock}`);
    }
  
    // Write the updated domain.yml content back to the file
    fs.writeFileSync('../../rasachat/domain.yml', domainYamlContent, 'utf8');
}

function updateIntent(intentName, newExample) {
  
    // Load the existing YAML content of nlu.yml
    let nluYamlContent = fs.readFileSync('../../rasachat/data/nlu.yml', 'utf8');
  
      // Check if the intent name already exists in nlu.yml
    if (nluYamlContent.includes(`- intent: ${intentName}`)) {
  
      // Find the intent block in nlu.yml
      const regex = new RegExp(`- intent: ${intentName}(?:\\n(?!- ).*)*`, 'g');
      const match = nluYamlContent.match(regex);
  
      if (match) {
        // Construct the updated intent block with the new example added
        const updatedIntentBlock = match[0].replace(/examples: \|\n/, `examples: |\n    - ${newExample.trim()}\n`);
  
        // Replace the old intent block with the updated one
        nluYamlContent = nluYamlContent.replace(match[0], updatedIntentBlock);
  
        // Write the updated nlu.yml content back to the file
        fs.writeFileSync('../../rasachat/data/nlu.yml', nluYamlContent, 'utf8');
      } else {
        console.error(`Intent '${intentName}' not found in nlu.yml`);
      }
    }
  
    else{
  
      const intentData = {
        intentName,
        examples: newExample.split(',')
      };
      // Construct the new intent block for nlu.yml
      const newIntentBlockNLU = `\n- intent: ${intentData.intentName}\n  examples: |\n  ${intentData.examples.map(example => `  - ${example}`).join('\n  ')}\n  `;
      console.log('New intent block for nlu.yml:', newIntentBlockNLU);
        // Append the new intent block to the nlu.yml content
        nluYamlContent += newIntentBlockNLU;
      
        // Write the updated nlu.yml content back to the file
        fs.writeFileSync('../../rasachat/data/nlu.yml', nluYamlContent, 'utf8');
  
    }
}

function addStory(intentName, companyPrefix) {
  // Load the existing YAML content of stories.yml
  let storiesYamlContent = fs.readFileSync('../../rasachat/data/stories.yml', 'utf8');

  // Check if the story already exists (unchanged)
  if (!storiesYamlContent.includes(`- story: story_${companyPrefix}`)) {
    // Construct the new story block for stories.yml (unchanged)
    const newStoryBlock = `\n- story: story_${companyPrefix} \n  steps: \n  - intent: ${intentName} \n  - action: utter_${intentName} \n`;

    // Append the new story block to the stories.yml content
    storiesYamlContent += newStoryBlock;
  } else {
    // Find the index where the existing story starts
    const storyStartIndex = storiesYamlContent.indexOf(`- story: story_${companyPrefix}`);

    // Find the index of the next story or the end of the file
    const nextStoryIndex = storiesYamlContent.indexOf('- story:', storyStartIndex + 1);
    const endIndex = nextStoryIndex === -1 ? storiesYamlContent.length : nextStoryIndex;

    // Extract the existing story
    const existingStory = storiesYamlContent.substring(storyStartIndex, endIndex);

    // Append the new intent and action to the existing story
    const updatedStory = `${existingStory}\n  - intent: ${intentName}\n  - action: utter_${intentName}\n\n`;

    // Replace the old story with the updated story in the YAML content
    storiesYamlContent = storiesYamlContent.replace(existingStory, updatedStory);
  }

  // Write the updated stories.yml content back to the file
  fs.writeFileSync('../../rasachat/data/stories.yml', storiesYamlContent, 'utf8');
}