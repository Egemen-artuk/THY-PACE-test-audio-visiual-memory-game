# 🏆 GitHub-Based Leaderboard Setup Guide

This guide explains how to set up a **real-time, global leaderboard** for your Audio Visual Memory Game that all players can see and update.

## 🚀 How It Works

1. **Player completes exam** → Score stored locally + submitted to GitHub
2. **GitHub Actions** → Automatically processes new scores
3. **Global leaderboard** → All players see real-time updates
4. **Refresh button** → Players can fetch latest scores

## 📋 Setup Steps

### 1. Update Repository URLs

In `script.js`, replace these placeholders with your actual GitHub details:

```javascript
this.githubLeaderboardUrl = 'https://api.github.com/repos/YOUR_USERNAME/YOUR_REPO_NAME/contents/leaderboard.json';
```

### 2. Enable GitHub Actions

1. Go to your repository on GitHub
2. Click **Actions** tab
3. Click **Enable Actions** if prompted
4. The workflow will automatically run when you push changes

### 3. Create Required Directories

```bash
mkdir leaderboard-submissions
```

### 4. Update package.json

Edit `package.json` and replace:
- `YOUR_USERNAME` with your GitHub username
- `YOUR_REPO_NAME` with your repository name
- `Your Name` with your actual name

### 5. Push All Files

```bash
git add .
git commit -m "Add GitHub-based leaderboard system"
git push origin main
```

## 🔄 How Scores Are Updated

### Automatic Process:
1. Player completes exam → Score saved locally
2. Score submitted to `leaderboard-submissions/` folder
3. GitHub Actions detects new submission
4. Runs `update-leaderboard.js` script
5. Merges new scores with existing leaderboard
6. Updates `leaderboard.json` file
7. Cleans up submission files

### Manual Process (if needed):
```bash
npm run update-leaderboard
```

## 📊 Leaderboard Structure

Each entry contains:
```json
{
  "name": "Player Name",
  "score": 18,
  "date": "1/1/2024",
  "totalSections": 21
}
```

- **score**: Number of flawless sections (max 21)
- **totalSections**: Always 21 (6 Easy + 6 Medium + 9 Hard)
- **date**: When the exam was completed

## 🌐 Player Experience

1. **Click "Exam"** → Enter name for leaderboard
2. **Complete exam** → Score calculated automatically
3. **See results** → Score and rank displayed
4. **Auto-redirect** → Leaderboard shows global rankings
5. **Refresh button** → Get latest scores from other players

## 🛠️ Troubleshooting

### Leaderboard not updating?
- Check GitHub Actions tab for errors
- Verify file paths in workflow
- Ensure `leaderboard-submissions/` directory exists

### Scores not showing?
- Check browser console for errors
- Verify GitHub repository URL is correct
- Try refreshing the leaderboard

### GitHub Actions failing?
- Check workflow file syntax
- Verify Node.js version compatibility
- Check repository permissions

## 🔒 Security Notes

- **No authentication required** for reading leaderboard
- **Scores are public** - anyone can see them
- **GitHub Actions** run automatically on new submissions
- **Local storage** provides immediate feedback

## 📈 Benefits

✅ **Real-time updates** - All players see new scores immediately  
✅ **Global competition** - Players compete worldwide  
✅ **No server needed** - Runs entirely on GitHub  
✅ **Automatic updates** - No manual intervention required  
✅ **Fallback support** - Works offline with local storage  

## 🎯 Next Steps

1. **Test the system** with a few exam completions
2. **Monitor GitHub Actions** for successful runs
3. **Share with players** - they'll see real-time competition!
4. **Customize styling** - Make the leaderboard match your game's theme

---

**Need help?** Check the GitHub Actions logs or create an issue in your repository.
