const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

class GitHubContributionGenerator {
    constructor(userName, userEmail) {
        this.userName = userName;
        this.userEmail = userEmail;
        this.projectDir = path.join(process.cwd(), 'contribution_project');
    }

    async setupRepo() {
        try {
            // Remove existing directory if it exists
            if (fs.existsSync(this.projectDir)) {
                fs.rmSync(this.projectDir, { recursive: true, force: true });
            }

            // Create new directory
            fs.mkdirSync(this.projectDir);
            process.chdir(this.projectDir);

            // Initialize git with error handling
            this.execGitCommand('git init');
            this.execGitCommand(`git config user.name "${this.userName}"`);
            this.execGitCommand(`git config user.email "${this.userEmail}"`);
            
            // Create initial README
            fs.writeFileSync('README.md', '# Contribution Project\nThis is a project to track various contributions and updates.');
            this.execGitCommand('git add README.md');
            this.execGitCommand('git commit -m "Initial commit"');

            return true;
        } catch (error) {
            console.error('Error setting up repository:', error.message);
            return false;
        }
    }

    execGitCommand(command) {
        try {
            execSync(command, { stdio: 'pipe' });
            return true;
        } catch (error) {
            console.error(`Error executing command '${command}':`, error.message);
            return false;
        }
    }

    makeContribution(date) {
        try {
            // Format date for filename and commit
            const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
            const commitDateStr = date.toISOString().replace('T', ' ').split('.')[0];

            // Create data directory if it doesn't exist
            const dataDir = path.join(this.projectDir, 'data');
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir);
            }

            // Create file with content
            const filename = path.join('data', `entry_${dateStr}.txt`);
            const content = `Project update for ${date.toISOString().split('T')[0]}\n` +
                           '- Added new feature implementation details\n' +
                           '- Updated documentation\n' +
                           '- Fixed reported issues\n';

            fs.writeFileSync(filename, content);

            // Stage and commit changes
            this.execGitCommand(`git add "${filename}"`);
            this.execGitCommand(`git commit --date="${commitDateStr}" -m "Update project documentation and features"`);
            
            return true;
        } catch (error) {
            console.error('Error making contribution:', error.message);
            return false;
        }
    }

    async createContributionPattern(intensity = 0.7) {
        try {
            const success = await this.setupRepo();
            if (!success) {
                throw new Error('Failed to set up repository');
            }

            const endDate = new Date();
            const startDate = new Date();
            startDate.setFullYear(startDate.getFullYear() - 1);

            let currentDate = new Date(startDate);
            const endDateTime = new Date(endDate);

            while (currentDate <= endDateTime) {
                if (Math.random() < intensity) {
                    const numContributions = Math.floor(Math.random() * 5) + 1;
                    
                    for (let i = 0; i < numContributions; i++) {
                        const hour = Math.floor(Math.random() * 8) + 9;
                        const minute = Math.floor(Math.random() * 60);
                        
                        const contributionDate = new Date(currentDate);
                        contributionDate.setHours(hour, minute);
                        
                        this.makeContribution(contributionDate);
                    }
                }
                
                currentDate.setDate(currentDate.getDate() + 1);
            }

            console.log("\nContribution pattern created successfully!");
            console.log("\nNext steps:");
            console.log("1. Create a new repository on GitHub");
            console.log("2. Run these commands in the contribution_project directory:");
            console.log("   git remote add origin <your-repo-url>");
            console.log("   git branch -M main");
            console.log("   git push -u origin main");
            
            return true;
        } catch (error) {
            console.error('Error creating contribution pattern:', error.message);
            return false;
        }
    }
}

// Get user input and run the generator
const promptUser = () => {
    rl.question('Enter your GitHub username: ', (username) => {
        rl.question('Enter your email: ', (email) => {
            rl.question('Enter contribution probability (0-1): ', async (probability) => {
                const generator = new GitHubContributionGenerator(username, email);
                await generator.createContributionPattern(parseFloat(probability));
                rl.close();
            });
        });
    });
};

promptUser();