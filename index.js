#!/usr/bin/env node

const readline = require('readline');
const simpleGit = require('simple-git');
const fs = require('fs');

function askQuestion(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
}

async function logDetails() {
    const message = "Welcome to Grameenphone. Thanks for choosing gp.";
    const hint = "To proceed further, please follow the prompt instruction - ";  
    const colorfulBox = `  
\x1b[38;5;3m------------------------------------------------------
 \x1b[38;5;3m${message}\x1b[38;5;3m  
------------------------------------------------------
\x1b[38;5;5m${hint}\x1b[38;5;3m  

`;
    console.log(colorfulBox);

    const validPartners = [
        { name: "chorki", token: "12345" },
        { name: "diptoplay", token: "54321" },
        // Add more partners as needed
    ];

    const partnerName = await askQuestion(`1. What's your partner name? `);
    const partnerToken = await askQuestion(`1. What's your partner token? `);

    const isValidPartner = validPartners.some(partner => partner.name === partnerName && partner.token === partnerToken);
    if (!isValidPartner) {
        console.log('\x1b[31mInvalid partner name or token. Access denied.'); // Red color for error
        return;
    }

    const services = ["service-description-one", "service-description-two", "service-description-three"]; 
    let service;
    while (!service) {
        const formattedServices = services.map((desc, index) => `     ${index + 1}. ${desc}`); 
        const serviceIndex = await askQuestion(`\x1b[38;5;3m2. Please select your service type :\n${formattedServices.join('\n')} \n     Put your answer here: `);
        const index = parseInt(serviceIndex) - 1; 
        if (!isNaN(index) && index >= 0 && index < services.length) {
            service = services[index];
        } else {
            console.log('\x1b[31mInvalid service type. Please select from the available options.'); // Red color for error
        }
    }

    const answer = await askQuestion(`\x1b[38;5;3m3. Do you want to clone the repository? (yes/no): `);

    if (answer.toLowerCase() === 'no') {
        console.log('\x1b[31mCloning cancelled.');
        return;
    }

    const folderPath = `./${partnerName}`;
    if (fs.existsSync(folderPath)) {
        try {
            fs.rmdirSync(folderPath, { recursive: true });
            console.log('Folder deleted successfully.');
        } catch (err) {
            console.error('Error while deleting folder:', err);
        }
    } else {
        console.log('Folder does not exist.');
    }

    /* Cloning git repo in current directory with progress animation*/
    const progressAnimation = ['|', '/', '-', '\\'];
    let animationIndex = 0;
    const interval = setInterval(() => {
        process.stdout.write('\x1b[2K\x1b[0GCloning repository ' + progressAnimation[animationIndex]);
        animationIndex = (animationIndex + 1) % progressAnimation.length;
    }, 250);

    simpleGit().clone('https://github.com/asadpstu/childapp-sample.git', `./${partnerName}`, async (err) => {
        clearInterval(interval);
        if (err) {
            console.error('\x1b[31mFailed to clone repository', err); // Red color for error
            return;
        }

        console.log('\x1b[32mRepository cloned successfully.'); // Green color for success
        
        // Perform text replacement after cloning
        const clonedFolderPath = `./${partnerName}`;
        replaceTextInFiles(clonedFolderPath, 'child_app_one', partnerName)
            .then(() => {
                console.log(`
\x1b[38;5;3m------------------------------------------------------
\x1b[38;5;3mCongratulations! Child App is ready.\x1b[38;5;3m  
------------------------------------------------------`)
                console.log(`\x1b[38;5;5m\x1b[38;5;3m`)
            })
            .catch(err => {
                console.error('\x1b[31mError during text replacement:', err); // Red color for error
            });
    });

}

async function replaceTextInFiles(folderPath, searchText, replaceText) {
    return new Promise((resolve, reject) => {
        fs.readdir(folderPath, (err, files) => {
            if (err) {
                reject(err);
                return;
            }
            let filesProcessed = 0;
            const totalFiles = files.length;
            if (totalFiles === 0) {
                resolve(); 
                return;
            }
            files.forEach(file => {
                const filePath = `${folderPath}/${file}`;
                fs.readFile(filePath, (err, data) => {
                    if (err) {
                        console.error(`\x1b[38;5;3m Ignoring reading nontext file ${filePath}`);
                        filesProcessed++;
                        if (filesProcessed === totalFiles) {
                            resolve();
                        }
                        return;
                    }
                    const updatedData = data.toString().replace(new RegExp(searchText, 'g'), replaceText);
                    fs.writeFile(filePath, updatedData, (err) => {
                        if (err) {
                            console.error(`\x1b[38;5;3m Ignoring reading nontext file ${filePath}`);
                        } else {
                            console.log(`\x1b[32mText replaced in ${file}`); 
                        }
                        filesProcessed++;
                        if (filesProcessed === totalFiles) {
                            resolve();
                        }
                    });
                });
            });
        });
    });
}


logDetails();
