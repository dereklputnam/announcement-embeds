# Announcement Embeds - Wrap No-Email Media Fix

A Discourse theme component that automatically embeds videos and media from **any source** inside `[wrap=no-email]` blocks, restoring the onebox functionality that Discourse strips away.

## Problem Statement

By default, Discourse's `[wrap]` BBCode tags strip or escape inner HTML before the Markdown "onebox" pipeline runs. This causes:
- Video links to appear as **plain text URLs** instead of embedded players
- YouTube/Vimeo links to remain as **clickable text** instead of iframe embeds
- Discourse-hosted media to **not display** inline
- Any media URL that would normally "unfurl" to **stay collapsed**

## Solution

This theme component adds a JavaScript initializer that "rehydrates" embedded media inside `[wrap=no-email]` regions on the client side after posts are rendered.

### How It Works

1. **Client-Side Rehydration**: Uses the Discourse `api.decorateCookedElement()` hook to scan post content after rendering
2. **Universal Media Detection**: Automatically detects:
   - Direct video files (`.mp4`, `.webm`, `.mov`, `.m4v`, `.avi`, `.mkv`, `.flv`, `.ogv`)
   - YouTube links (`youtube.com`, `youtu.be`)
   - Vimeo links (`vimeo.com`)
   - Any video hosting platform (Dailymotion, Twitch, Streamable, Wistia, Vidyard, etc.)
   - Discourse-hosted media (Azure CDN, CloudFront, or direct uploads)
3. **Smart Embedding**: Creates the appropriate embed type:
   - YouTube → iframe embed
   - Vimeo → iframe embed
   - Direct video files → native HTML5 `<video>` player
   - Platform-hosted videos → native player with auto-detection
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

Direct video file:
https://example.com/video.mp4

YouTube video:
https://www.youtube.com/watch?v=dQw4w9WgXcQ

Vimeo video:
https://vimeo.com/123456789

Discourse-hosted media:
https://your-discourse.azurefd.net/discourseimages/video.mp4
[/wrap]
```

All video links will automatically render as embedded players for users viewing the post on the web.

### Supported Media Types

#### **Video Files** (Native HTML5 Player)
- `.mp4`, `.webm`, `.mov`, `.m4v`
- `.avi`, `.mkv`, `.flv`, `.ogv`

#### **Video Platforms** (Iframe Embeds)
- **YouTube** (`youtube.com`, `youtu.be`)
- **Vimeo** (`vimeo.com`)
- **Dailymotion**, **Twitch**, **Streamable**
- **Wistia**, **Vidyard**, **Brightcove**, **Kaltura**

#### **Discourse-Hosted Media**
- Any video uploaded to Discourse
- Azure CDN (`azurefd.net`)
- AWS CloudFront (`cloudfront.net`)
- Generic CDN patterns

#### **Team Video Sources**
Works with **any video URL** your team uses! The component automatically detects video content from any hosting platform.

## Features

- ✅ **Universal Support**: Works with YouTube, Vimeo, and any video hosting platform
- ✅ **Automatic Detection**: Scans all `[wrap=no-email]` blocks for video links
- ✅ **Smart Embedding**: Uses appropriate player type (iframe vs native)
- ✅ **Responsive Design**: Videos scale properly on mobile and desktop (16:9 aspect ratio)
- ✅ **Accessibility**: Includes ARIA labels for screen readers
- ✅ **Dark Mode Support**: Styling adapts to Discourse theme
- ✅ **No Configuration Required**: Works out of the box
- ✅ **Performance Optimized**: Only processes media links, minimal overhead
- ✅ **Debug Logging**: Console messages for troubleshooting

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
