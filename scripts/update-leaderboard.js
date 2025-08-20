const fs = require('fs');
const path = require('path');

// Read current leaderboard
function readLeaderboard() {
    try {
        const data = fs.readFileSync('leaderboard.json', 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.log('No existing leaderboard, starting fresh');
        return [];
    }
}

// Read submission files
function readSubmissions() {
    const submissionsDir = 'leaderboard-submissions';
    const submissions = [];
    
    try {
        const files = fs.readdirSync(submissionsDir);
        files.forEach(file => {
            if (file.endsWith('.json')) {
                try {
                    const data = fs.readFileSync(path.join(submissionsDir, file), 'utf8');
                    const submission = JSON.parse(data);
                    submissions.push(submission);
                    console.log(`Processed submission: ${submission.name} - ${submission.score}`);
                } catch (error) {
                    console.error(`Error reading submission ${file}:`, error);
                }
            }
        });
    } catch (error) {
        console.log('No submissions directory found');
    }
    
    return submissions;
}

// Merge submissions with existing leaderboard
function mergeLeaderboard(existing, submissions) {
    const merged = [...existing];
    
    submissions.forEach(submission => {
        // Check if player already exists
        const existingIndex = merged.findIndex(entry => 
            entry.name === submission.name && 
            entry.date === submission.date
        );
        
        if (existingIndex === -1) {
            // Add new submission
            merged.push(submission);
        } else {
            // Update existing entry if score is better
            if (submission.score > merged[existingIndex].score) {
                merged[existingIndex] = submission;
            }
        }
    });
    
    // Sort by score descending
    merged.sort((a, b) => b.score - a.score);
    
    return merged;
}

// Clean up submission files
function cleanupSubmissions() {
    const submissionsDir = 'leaderboard-submissions';
    try {
        const files = fs.readdirSync(submissionsDir);
        files.forEach(file => {
            if (file.endsWith('.json')) {
                fs.unlinkSync(path.join(submissionsDir, file));
                console.log(`Removed submission: ${file}`);
            }
        });
    } catch (error) {
        console.log('No submissions to clean up');
    }
}

// Main execution
function main() {
    console.log('Starting leaderboard update...');
    
    // Read existing leaderboard
    const existing = readLeaderboard();
    console.log(`Existing entries: ${existing.length}`);
    
    // Read new submissions
    const submissions = readSubmissions();
    console.log(`New submissions: ${submissions.length}`);
    
    if (submissions.length === 0) {
        console.log('No new submissions to process');
        return;
    }
    
    // Merge and update
    const updated = mergeLeaderboard(existing, submissions);
    console.log(`Updated entries: ${updated.length}`);
    
    // Write updated leaderboard
    fs.writeFileSync('leaderboard.json', JSON.stringify(updated, null, 2));
    console.log('Leaderboard updated successfully');
    
    // Clean up submissions
    cleanupSubmissions();
    console.log('Submissions cleaned up');
}

main();
