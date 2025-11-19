# Quick Installation Guide

## Step 1: Install the Theme Component

### Option A: Direct from GitHub (Recommended)

1. Log into your Discourse instance as an **admin**
2. Navigate to **Admin Panel** → **Customize** → **Themes**
3. Click the **"Install"** button in the top-right corner
4. Select **"From a git repository"**
5. Enter the repository URL:
   ```
   https://github.com/dereklputnam/announcement-embeds
   ```
6. Click **"Install"**
7. Wait for the installation to complete

### Option B: Manual ZIP Upload

1. Download the repository:
   - Go to https://github.com/dereklputnam/announcement-embeds
   - Click **Code** → **Download ZIP**
2. Log into your Discourse instance as an **admin**
3. Navigate to **Admin Panel** → **Customize** → **Themes**
4. Click **"Install"** → **"Upload a .zip file"**
5. Select the downloaded ZIP file
6. Click **"Install"**

## Step 2: Enable the Component

1. After installation, you'll see the component in your themes list
2. Click on your **active theme** (the one currently in use)
3. Scroll to the **"Theme Components"** section
4. Click **"Add component"**
5. Select **"Announcement Embeds - Wrap No-Email Media Fix"**
6. Click **"Add"**

## Step 3: Verify Installation

1. Create a test post with the following content:
   ```
   [wrap=no-email]
   Test video:
   https://example.com/sample.mp4
   [/wrap]
   ```
2. View the post
3. You should see an embedded video player (not a plain link)

## Troubleshooting

### Component Not Appearing
- **Clear your browser cache** (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
- **Rebuild HTML** in Admin → Customize → Themes
- Check browser console for JavaScript errors (F12)

### Videos Not Embedding
- Ensure the video URL ends with `.mp4`, `.webm`, `.mov`, or `.m4v`
- Verify the video file is publicly accessible
- Check that the URL is inside `[wrap=no-email]` blocks (NOT other wrap types)

### Still Having Issues?
1. Check [TESTING.md](TESTING.md) for comprehensive testing checklist
2. Open an issue on [GitHub](https://github.com/dereklputnam/announcement-embeds/issues)
3. Include:
   - Discourse version
   - Browser and version
   - Console error messages (if any)
   - Example post that's not working

## Next Steps

- Read the full [README.md](README.md) for usage examples
- Review [TESTING.md](TESTING.md) for validation procedures
- Test with your actual video URLs

## Updating the Component

### If Installed from Git Repository
The component will auto-update when you push changes. To manually update:
1. Admin → Customize → Themes
2. Find the component
3. Click **"Check for Updates"**

### If Installed from ZIP
You'll need to reinstall by uploading a new ZIP file with the latest version.

---

**Security Note**: This component only affects client-side rendering for web users. Email notifications will continue to exclude content inside `[wrap=no-email]` blocks as intended.
