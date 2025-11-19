import { apiInitializer } from "discourse/lib/api";
import { ajax } from "discourse/lib/ajax";

export default apiInitializer("1.8.0", (api) => {
  // Helper: Check if URL is a video file
  function isVideoFile(url) {
    return /\.(mp4|mov|webm|m4v|avi|mkv|flv|ogv)$/i.test(url);
  }

  // Helper: Check if URL is a known video platform
  function isVideoHostingPlatform(url) {
    const videoPatterns = [
      /youtube\.com\/watch/i,
      /youtu\.be\//i,
      /vimeo\.com\//i,
      /dailymotion\.com\//i,
      /twitch\.tv\//i,
      /streamable\.com\//i,
      /wistia\.(com|net)/i,
      /vidyard\.com\//i,
      /brightcove\.(com|net)/i,
      /kaltura\.com\//i,
      /discourseimages/i, // Discourse-hosted media
      /azurefd\.net/i, // Azure CDN (common for Discourse)
      /cloudfront\.net/i, // AWS CloudFront
      /cdn\./i, // Generic CDN pattern
    ];

    return videoPatterns.some(pattern => pattern.test(url));
  }

  // Helper: Create native video player
  function createVideoPlayer(url) {
    const video = document.createElement("video");
    video.src = url;
    video.controls = true;
    video.preload = "metadata";
    video.style.maxWidth = "100%";
    video.style.borderRadius = "8px";
    video.style.display = "block";
    video.style.margin = "1em auto";
    video.setAttribute('aria-label', `Video: ${url.split('/').pop()}`);

    // Error handling
    video.addEventListener('error', (e) => {
      console.error("[Announcement Embeds] Video failed to load:", url, e);
    });

    video.addEventListener('loadedmetadata', () => {
      console.log("[Announcement Embeds] Video loaded:", url);
    });

    return video;
  }

  // Helper: Create YouTube embed
  function createYouTubeEmbed(url) {
    let videoId;

    // Extract video ID from various YouTube URL formats
    if (url.includes('youtube.com')) {
      const urlParams = new URLSearchParams(new URL(url).search);
      videoId = urlParams.get('v');
    } else if (url.includes('youtu.be')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    }

    if (!videoId) return null;

    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube.com/embed/${videoId}`;
    iframe.width = "560";
    iframe.height = "315";
    iframe.style.maxWidth = "100%";
    iframe.style.borderRadius = "8px";
    iframe.style.display = "block";
    iframe.style.margin = "1em auto";
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');

    return iframe;
  }

  // Helper: Create Vimeo embed
  function createVimeoEmbed(url) {
    const match = url.match(/vimeo\.com\/(\d+)/i);
    if (!match) return null;

    const videoId = match[1];
    const iframe = document.createElement("iframe");
    iframe.src = `https://player.vimeo.com/video/${videoId}`;
    iframe.width = "560";
    iframe.height = "315";
    iframe.style.maxWidth = "100%";
    iframe.style.borderRadius = "8px";
    iframe.style.display = "block";
    iframe.style.margin = "1em auto";
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');

    return iframe;
  }

  // Main decorator
  api.decorateCookedElement(
    (elem) => {
      console.log("[Announcement Embeds] Decorator running");
      console.log("[Announcement Embeds] Element HTML (first 1000 chars):", elem.innerHTML.substring(0, 1000));

      // Try multiple possible selectors for wrap=no-email blocks
      const selectors = [
        '.wrap.no-email',           // Standard: <div class="wrap no-email">
        '.wrap[data-wrap="no-email"]', // Data attribute variant
        '[class*="no-email"]',      // Any class containing "no-email"
        '.no-email',                // Just the no-email class
        '[data-wrap*="no-email"]',  // Data attribute containing "no-email"
      ];

      let wrapBlocks = [];
      for (const selector of selectors) {
        const found = elem.querySelectorAll(selector);
        if (found.length > 0) {
          console.log(`[Announcement Embeds] ✓ Found ${found.length} blocks with selector: ${selector}`);
          wrapBlocks = Array.from(found);
          break;
        } else {
          console.log(`[Announcement Embeds] ✗ No blocks found with selector: ${selector}`);
        }
      }

      console.log(`[Announcement Embeds] Total wrap blocks found: ${wrapBlocks.length}`);

      wrapBlocks.forEach((wrapBlock, blockIndex) => {
        console.log(`[Announcement Embeds] Processing block #${blockIndex + 1}`);

        // Find all links inside this wrap block
        const links = wrapBlock.querySelectorAll('a[href]');
        console.log(`[Announcement Embeds] Found ${links.length} links`);

        links.forEach((link, linkIndex) => {
          const url = link.href;

          // Skip if already processed
          if (link.closest('.media-embed-wrapper, .video-wrapper, .rehydrated-media')) {
            console.log(`[Announcement Embeds] Link #${linkIndex + 1} already processed, skipping`);
            return;
          }

          console.log(`[Announcement Embeds] Analyzing link #${linkIndex + 1}:`, url);

          let embedElement = null;

          // Check what type of media this is
          const isVideo = isVideoFile(url);
          const isHostedVideo = isVideoHostingPlatform(url);

          console.log(`[Announcement Embeds] Detection:`, {
            url: url.substring(0, 80) + '...',
            isVideoFile: isVideo,
            isHostedVideo: isHostedVideo,
            isYouTube: /youtube\.com|youtu\.be/i.test(url),
            isVimeo: /vimeo\.com/i.test(url),
          });

          // Priority 1: YouTube
          if (/youtube\.com|youtu\.be/i.test(url)) {
            console.log("[Announcement Embeds] Creating YouTube embed");
            embedElement = createYouTubeEmbed(url);
          }
          // Priority 2: Vimeo
          else if (/vimeo\.com/i.test(url)) {
            console.log("[Announcement Embeds] Creating Vimeo embed");
            embedElement = createVimeoEmbed(url);
          }
          // Priority 3: Direct video files or hosted video
          else if (isVideo || isHostedVideo) {
            console.log("[Announcement Embeds] Creating native video player");
            embedElement = createVideoPlayer(url);
          }

          // If we created an embed, replace the link
          if (embedElement) {
            console.log("[Announcement Embeds] Replacing link with embed");

            // Create wrapper
            const wrapper = document.createElement("div");
            wrapper.classList.add('media-embed-wrapper', 'rehydrated-media');
            wrapper.appendChild(embedElement);

            // Replace the link
            link.replaceWith(wrapper);
            console.log("[Announcement Embeds] ✓ Embed created successfully");
          } else {
            console.log("[Announcement Embeds] No embed created for this link");
          }
        });
      });

      console.log("[Announcement Embeds] Processing complete");
    },
    {
      id: "rehydrate-wrap-embeds",
      onlyStream: false,
    }
  );
});
