# Announcement Embeds - Wrap No-Email Media Fix

A Discourse theme component that fixes the issue where `[wrap=no-email]` blocks prevent videos and media links from rendering as embedded players.

## Problem Statement

By default, Discourse's `[wrap]` BBCode tags strip or escape inner HTML before the Markdown "onebox" pipeline runs. This causes video links to appear as plain URLs instead of embedded `<video>` players inside `[wrap=no-email]` blocks.

## Solution

This theme component adds a JavaScript initializer that "rehydrates" embedded media inside `[wrap=no-email]` regions on the client side after posts are rendered.

### How It Works

1. **Client-Side Rehydration**: Uses the Discourse `api.decorateCookedElement()` hook to scan post content after rendering
2. **Media Detection**: Finds video links (`.mp4`, `.webm`, `.mov`, `.m4v`) or Discourse-hosted media URLs
3. **Dynamic Replacement**: Replaces plain text links with `<video>` elements that include playback controls
4. **Automatic Execution**: Runs after every post render, including infinite scroll

## Installation

### Method 1: From Repository (Recommended)

1. Navigate to your Discourse Admin Panel → **Customize** → **Themes**
2. Click **Install** → **From a git repository**
3. Enter the repository URL:
   ```
   https://github.com/dereklputnam/announcement-embeds
   ```
4. Click **Install**
5. Enable the theme component on your active theme

### Method 2: Manual Upload

1. Download this repository as a ZIP file
2. Navigate to your Discourse Admin Panel → **Customize** → **Themes**
3. Click **Install** → **Upload a .zip file**
4. Select the downloaded ZIP
5. Enable the theme component on your active theme

## Usage

Once installed, the component works automatically. Simply use the `[wrap=no-email]` BBCode in your posts:

```markdown
[wrap=no-email]
This content will be hidden from email notifications.

https://example.com/video.mp4
[/wrap]
```

The video link will automatically render as an embedded video player for users viewing the post on the web.

### Supported Media Types

- **Video formats**: `.mp4`, `.mov`, `.webm`, `.m4v`
- **Discourse-hosted media**: Any media uploaded to Discourse (contains `discourseimages` in URL)

## Features

- ✅ **Automatic Detection**: Scans all `[wrap=no-email]` blocks for video links
- ✅ **Responsive Design**: Videos scale properly on mobile and desktop
- ✅ **Accessibility**: Includes ARIA labels for screen readers
- ✅ **Dark Mode Support**: Styling adapts to Discourse theme
- ✅ **No Configuration Required**: Works out of the box
- ✅ **Performance Optimized**: Only processes media links, minimal overhead

## Configuration

This theme component works without any configuration. However, you can customize the styling by editing the `common.scss` file:

- Adjust video border radius
- Modify shadow effects
- Change spacing and margins
- Add custom animations

## Technical Details

### File Structure

```
announcement-embeds/
├── about.json                                    # Theme metadata
├── javascripts/
│   └── discourse/
│       └── initializers/
│           └── rehydrate-wrap-embeds.js         # Main logic
├── stylesheets/
│   └── common.scss                              # Video styling
└── README.md                                     # Documentation
```

### Key Components

**JavaScript Initializer** ([rehydrate-wrap-embeds.js](javascripts/discourse/initializers/rehydrate-wrap-embeds.js)):
- Registers a `decorateCookedElement` hook
- Queries for `.wrap.no-email a[href]` elements
- Validates media URLs
- Creates `<video>` elements with proper attributes
- Replaces links with video players

**Stylesheet** ([common.scss](stylesheets/common.scss)):
- Responsive video container styling
- Dark mode support
- Accessibility enhancements
- Optional loading animations

## Browser Compatibility

- ✅ Chrome/Edge (Chromium) 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Security Considerations

This component:
- **Does not bypass Discourse security**: Only rehydrates media from trusted sources
- **Respects CSP policies**: Uses standard `<video>` elements
- **No external dependencies**: Pure JavaScript, no third-party libraries
- **Client-side only**: Does not modify server-side rendering or database content

## Troubleshooting

### Videos Not Appearing

1. **Check browser console** for JavaScript errors
2. **Verify the component is enabled** on your active theme
3. **Ensure video URLs are publicly accessible**
4. **Clear browser cache** and reload the page

### Videos Not Loading

1. **Verify video file format** is supported (`.mp4`, `.webm`, `.mov`, `.m4v`)
2. **Check CORS headers** if videos are hosted externally
3. **Test video URL directly** in browser to ensure it loads

### Performance Issues

- The component is optimized for performance and should not impact page load times
- If you experience issues, check for conflicts with other theme components

## Future Enhancements

Planned features for future versions:

- 🔄 **YouTube/Vimeo Support**: Auto-embed YouTube and Vimeo links inside `[wrap=no-email]`
- 📄 **PDF Previews**: Inline previews of PDF documents
- 🖼️ **Image Galleries**: Support for image galleries in no-email contexts
- ⚙️ **Admin Settings**: Toggle features on/off via theme settings
- 🎨 **Custom Styling Options**: Admin-configurable video player appearance

## Contributing

Contributions are welcome! Please:

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - See [LICENSE](LICENSE) file for details

## Support

If you encounter issues or have questions:

1. **Check existing issues**: [GitHub Issues](https://github.com/dereklputnam/announcement-embeds/issues)
2. **Open a new issue**: Provide detailed information about your environment and the problem
3. **Community support**: Ask on the [Discourse Meta forum](https://meta.discourse.org)

## Credits

Developed by Derek Putnam for enterprise Discourse deployments requiring secure, auditable media embedding in email-excluded content blocks.

---

**Note**: This component only affects web view for logged-in users. Email notifications will continue to exclude content inside `[wrap=no-email]` blocks as intended.
