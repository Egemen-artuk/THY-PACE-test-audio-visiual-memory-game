# 🚀 Deployment Checklist - Audio Visual Memory Game

## ✅ Pre-Deployment Setup

### 1. Configure Repository
Run the setup script to configure your GitHub repository:
```bash
npm run setup
```

This will prompt you for:
- **GitHub Username**: Your GitHub username
- **Repository Name**: The name of your repository
- **Your Name**: For package.json author field

### 2. Verify File Structure
Ensure you have all required files:
```
✅ .github/workflows/update-leaderboard.yml  # GitHub Actions workflow
✅ leaderboard-submissions/.gitkeep          # Submissions directory
✅ scripts/update-leaderboard.js             # Leaderboard update script
✅ setup-repository.js                       # Configuration script
✅ leaderboard.json                          # Initial leaderboard data
✅ package.json                              # Updated with your details
✅ script.js                                 # Updated with your repo URLs
```

### 3. Commit and Push
```bash
git add .
git commit -m "Setup GitHub-based leaderboard system"
git push origin main
```

## 🎯 GitHub Configuration

### 1. Enable GitHub Actions
1. Go to your repository on GitHub
2. Click the **"Actions"** tab
3. Click **"Enable Actions"** if prompted
4. The workflow `update-leaderboard.yml` should appear

### 2. Test the Workflow
1. The workflow will run automatically when:
   - New files are added to `leaderboard-submissions/`
   - You manually trigger it from the Actions tab
2. Check that the workflow has proper permissions:
   - Go to Settings → Actions → General
   - Ensure "Read and write permissions" is enabled

## 🌐 Deployment Options

### Option 1: Netlify (Recommended)
1. Connect your GitHub repository to Netlify
2. Deploy settings are already configured in `netlify.toml`
3. Your game will be live with automatic deployments

### Option 2: Vercel
1. Connect your GitHub repository to Vercel
2. Deploy settings are already configured in `vercel.json`
3. Automatic deployments on every push

### Option 3: GitHub Pages
1. Go to repository Settings → Pages
2. Select "Deploy from a branch"
3. Choose "main" branch and "/ (root)" folder
4. Your game will be available at `https://username.github.io/repository-name`

### Option 4: Any Static Host
Upload all files to any static hosting service (Cloudflare Pages, Firebase Hosting, etc.)

## 🏆 Leaderboard Testing

### 1. Test Score Submission
1. Deploy your game
2. Play in "Exam" mode
3. Complete all 12 rounds
4. Check that your score appears on the leaderboard
5. Verify the score was saved to GitHub (`leaderboard.json` should update)

### 2. Verify GitHub Actions
1. Go to your repository → Actions tab
2. You should see a workflow run after score submission
3. Check that `leaderboard.json` was updated automatically
4. Verify old submission files were cleaned up

### 3. Test Global Access
1. Share your game URL with others
2. Have them complete the exam
3. Verify their scores appear on the global leaderboard
4. Test the "Refresh" button to fetch latest scores

## 🔧 Troubleshooting

### Leaderboard Not Updating?
- Check GitHub Actions tab for errors
- Verify `leaderboard-submissions/` directory exists
- Ensure GitHub Actions has write permissions

### Scores Not Submitting?
- Check browser console for errors
- Verify repository URLs are correct in `script.js`
- Test with a simple score submission

### GitHub Actions Failing?
- Check workflow file syntax in `.github/workflows/update-leaderboard.yml`
- Verify Node.js version compatibility
- Check repository permissions in Settings → Actions

## 📊 Monitoring

### Regular Checks
- Monitor GitHub Actions runs for failures
- Check `leaderboard.json` file size (it will grow over time)
- Verify game performance on different devices

### Maintenance
- Periodically review leaderboard for inappropriate names
- Consider implementing score validation if needed
- Monitor repository storage usage

## 🎉 Go Live!

Once all checks pass:
1. ✅ Repository configured with your details
2. ✅ GitHub Actions enabled and working
3. ✅ Game deployed to hosting platform
4. ✅ Leaderboard tested and functional
5. ✅ Global access verified

**Your Audio Visual Memory Game with global leaderboard is ready for the world! 🌍**

Share your game URL and watch players compete globally on your leaderboard system!

---

**Need help?** Check `LEADERBOARD_SETUP.md` for detailed technical information or create an issue in your repository.
