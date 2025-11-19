# Testing Checklist for Announcement Embeds Component

## Pre-Installation Testing

- [ ] Verify Discourse version compatibility (3.0.0+)
- [ ] Ensure admin access to Discourse instance
- [ ] Backup current theme configuration

## Installation Testing

### Method 1: Git Repository Install
- [ ] Navigate to Admin → Customize → Themes
- [ ] Click Install → From a git repository
- [ ] Enter repository URL: `https://github.com/dereklputnam/announcement-embeds`
- [ ] Installation completes without errors
- [ ] Component appears in theme list

### Method 2: Manual Upload
- [ ] Download repository as ZIP
- [ ] Navigate to Admin → Customize → Themes
- [ ] Click Install → Upload a .zip file
- [ ] Upload completes without errors
- [ ] Component appears in theme list

## Functional Testing

### Basic Video Embedding
Create a test post with:
```
[wrap=no-email]
Test video embedding:
https://example.com/test-video.mp4
[/wrap]
```

- [ ] Video link is detected
- [ ] Video player appears (not plain URL)
- [ ] Video controls are visible
- [ ] Video can be played
- [ ] Video dimensions are responsive

### Multiple Video Formats
Test with different formats:
```
[wrap=no-email]
MP4: https://example.com/video.mp4
WebM: https://example.com/video.webm
MOV: https://example.com/video.mov
M4V: https://example.com/video.m4v
[/wrap]
```

- [ ] All formats are recognized
- [ ] All videos render as players
- [ ] No JavaScript errors in console

### Discourse-Hosted Media
```
[wrap=no-email]
Uploaded video:
https://discourse.example.com/uploads/default/original/1X/discourseimages/video.mp4
[/wrap]
```

- [ ] Discourse-hosted media is detected
- [ ] Video embeds correctly
- [ ] No CORS issues

### Mixed Content
```
[wrap=no-email]
Regular text before video.

https://example.com/video.mp4

Regular text after video.

Another video:
https://example.com/video2.mp4
[/wrap]
```

- [ ] Multiple videos in one block work
- [ ] Text content is preserved
- [ ] Spacing is appropriate

### Edge Cases

#### Non-Video Links
```
[wrap=no-email]
https://example.com/document.pdf
https://example.com/image.jpg
https://example.com/page.html
[/wrap]
```

- [ ] Non-video links are NOT converted
- [ ] Links remain clickable
- [ ] No errors in console

#### Invalid URLs
```
[wrap=no-email]
https://broken-url.com/video.mp4
[/wrap]
```

- [ ] Broken videos show standard browser error state
- [ ] No JavaScript errors
- [ ] Page remains functional

#### Regular Wrap Blocks
```
[wrap=custom-class]
https://example.com/video.mp4
[/wrap]
```

- [ ] Only `[wrap=no-email]` blocks are affected
- [ ] Other wrap types are not modified

## Visual/UI Testing

### Desktop
- [ ] Video width is responsive (max 100%)
- [ ] Border radius applied (8px)
- [ ] Box shadow visible
- [ ] Controls are accessible
- [ ] Video is centered

### Mobile (< 768px)
- [ ] Video scales to screen width
- [ ] Border radius adjusts (4px)
- [ ] Controls remain usable
- [ ] No horizontal scroll

### Dark Mode
- [ ] Enable dark mode theme
- [ ] Video box shadow adjusted
- [ ] Video background is black
- [ ] Controls are visible

### Light Mode
- [ ] Video styling is appropriate
- [ ] Controls contrast is good

## Performance Testing

### Single Post
- [ ] Page load time is normal
- [ ] No visible lag when scrolling
- [ ] Browser console shows no warnings

### Multiple Posts
- [ ] Navigate to topic with 20+ posts
- [ ] Enable infinite scroll
- [ ] Scroll through all posts
- [ ] Videos load as expected
- [ ] No memory leaks
- [ ] Performance remains smooth

### High Video Count
Create a post with 10+ videos:
- [ ] All videos are converted
- [ ] Page remains responsive
- [ ] No browser slowdown

## Accessibility Testing

### Keyboard Navigation
- [ ] Tab to video player
- [ ] Space/Enter plays/pauses
- [ ] Arrow keys work for seek
- [ ] Controls are keyboard accessible

### Screen Reader
- [ ] Video has appropriate ARIA label
- [ ] Screen reader announces video element
- [ ] Controls are announced correctly

## Browser Compatibility

Test in each browser:

### Chrome/Edge (Chromium)
- [ ] Videos embed correctly
- [ ] Controls work
- [ ] No console errors

### Firefox
- [ ] Videos embed correctly
- [ ] Controls work
- [ ] No console errors

### Safari (macOS)
- [ ] Videos embed correctly
- [ ] Controls work
- [ ] No console errors

### Safari (iOS)
- [ ] Videos embed correctly
- [ ] Controls work (native iOS controls)
- [ ] Responsive sizing correct

### Chrome Mobile (Android)
- [ ] Videos embed correctly
- [ ] Controls work
- [ ] Responsive sizing correct

## Integration Testing

### With Other Theme Components
- [ ] No conflicts with existing components
- [ ] CSS doesn't interfere
- [ ] JavaScript doesn't conflict

### With Plugins
Test with common plugins:
- [ ] Discourse AI
- [ ] Chat
- [ ] Calendar
- [ ] No conflicts detected

## Email Testing

### Email Notifications
Create a post with `[wrap=no-email]` containing video:
- [ ] Subscribe to topic
- [ ] Trigger email notification
- [ ] Email does NOT contain video
- [ ] Email does NOT contain video URL
- [ ] `[wrap=no-email]` content is excluded

## Security Testing

### XSS Protection
Try malicious input:
```
[wrap=no-email]
https://example.com/video.mp4"><script>alert('XSS')</script>
[/wrap]
```

- [ ] Script does NOT execute
- [ ] Video URL is sanitized
- [ ] No security warnings

### CSP Compliance
- [ ] Check browser console for CSP violations
- [ ] No inline script execution
- [ ] All resources load correctly

### External Media
```
[wrap=no-email]
https://untrusted-site.com/video.mp4
[/wrap]
```

- [ ] Video loads (if CORS allows)
- [ ] No security warnings
- [ ] Failed loads handled gracefully

## Rollback Testing

### Disable Component
- [ ] Disable theme component
- [ ] Refresh page
- [ ] Videos revert to plain links
- [ ] No JavaScript errors

### Re-enable Component
- [ ] Enable theme component
- [ ] Refresh page
- [ ] Videos embed again
- [ ] No issues detected

## Documentation Validation

- [ ] README installation steps are accurate
- [ ] Code examples work as documented
- [ ] Troubleshooting section is helpful
- [ ] Links in README are valid

## Known Issues

Document any issues found during testing:

| Issue | Severity | Status | Notes |
|-------|----------|--------|-------|
|       |          |        |       |

## Sign-Off

| Tester | Date | Result | Comments |
|--------|------|--------|----------|
|        |      | ✅/❌   |          |

---

## Post-Deployment Monitoring

After deploying to production:

- [ ] Monitor error logs for 24 hours
- [ ] Check user feedback
- [ ] Verify analytics (page load time, etc.)
- [ ] No new issues reported
