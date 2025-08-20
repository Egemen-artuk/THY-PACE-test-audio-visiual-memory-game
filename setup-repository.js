#!/usr/bin/env node

/**
 * Repository Setup Script for Audio Visual Memory Game
 * This script helps configure the GitHub repository for the leaderboard system
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt) {
    return new Promise(resolve => {
        rl.question(prompt, resolve);
    });
}

async function main() {
    console.log('🚀 Audio Visual Memory Game - Repository Setup');
    console.log('===============================================\n');
    
    try {
        // Get repository information
        console.log('Please provide your GitHub repository information:\n');
        
        const username = await question('GitHub Username: ');
        const repoName = await question('Repository Name: ');
        const authorName = await question('Your Name (for package.json): ');
        
        if (!username || !repoName || !authorName) {
            console.log('\n❌ All fields are required. Please try again.');
            process.exit(1);
        }
        
        console.log('\n🔧 Updating configuration files...\n');
        
        // Update script.js
        updateScriptJs(username, repoName);
        console.log('✅ Updated script.js with repository URLs');
        
        // Update package.json
        updatePackageJson(username, repoName, authorName);
        console.log('✅ Updated package.json with repository details');
        
        // Update LEADERBOARD_SETUP.md
        updateLeaderboardSetup(username, repoName);
        console.log('✅ Updated LEADERBOARD_SETUP.md with specific instructions');
        
        console.log('\n🎉 Setup completed successfully!\n');
        console.log('Next steps:');
        console.log('1. Commit and push these changes to your GitHub repository');
        console.log('2. Go to your repository on GitHub');
        console.log('3. Click the "Actions" tab and enable GitHub Actions');
        console.log('4. Your leaderboard system is now ready to use!\n');
        console.log('📖 For detailed instructions, see LEADERBOARD_SETUP.md');
        
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        process.exit(1);
    } finally {
        rl.close();
    }
}

function updateScriptJs(username, repoName) {
    const scriptPath = 'script.js';
    let content = fs.readFileSync(scriptPath, 'utf8');
    
    // Replace placeholder URLs
    const oldUrl = 'https://api.github.com/repos/YOUR_USERNAME/YOUR_REPO_NAME/contents/leaderboard.json';
    const newUrl = `https://api.github.com/repos/${username}/${repoName}/contents/leaderboard.json`;
    content = content.replace(oldUrl, newUrl);
    
    const oldRawUrl = 'https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO_NAME/main/leaderboard.json';
    const newRawUrl = `https://raw.githubusercontent.com/${username}/${repoName}/main/leaderboard.json`;
    content = content.replace(oldRawUrl, newRawUrl);
    
    fs.writeFileSync(scriptPath, content);
}

function updatePackageJson(username, repoName, authorName) {
    const packagePath = 'package.json';
    const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Update repository information
    packageData.repository.url = `git+https://github.com/${username}/${repoName}.git`;
    packageData.author = authorName;
    packageData.name = repoName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    
    fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2));
}

function updateLeaderboardSetup(username, repoName) {
    const setupPath = 'LEADERBOARD_SETUP.md';
    let content = fs.readFileSync(setupPath, 'utf8');
    
    // Replace placeholders
    content = content.replace(/YOUR_USERNAME/g, username);
    content = content.replace(/YOUR_REPO_NAME/g, repoName);
    
    fs.writeFileSync(setupPath, content);
}

// Run the setup
main().catch(console.error);
