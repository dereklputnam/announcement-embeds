import { apiInitializer } from "discourse/lib/api";
import { ajax } from "discourse/lib/ajax";

export default apiInitializer("1.8.0", (api) => {
  // Helper: Check if URL is a video file
  function isVideoFile(url) {
    return /\.(mp4|mov|webm|m4v|avi|mkv|flv|ogv)$/i.test(url);
  }

  // Helper: Check if URL is a Discourse topic/post
  function isDiscourseTopic(url) {
    // Check if URL is from the same Discourse instance or matches topic patterns
    try {
      const urlObj = new URL(url);
      const currentHost = window.location.host;

      // Same host or contains /t/ (topic) pattern
      return urlObj.host === currentHost && /\/t\//.test(url);
    } catch {
      return false;
    }
  }


  // Helper: Fetch and create onebox for a URL
  async function createOnebox(url) {
    try {
      const response = await ajax("/onebox", {
        type: "GET",
        data: {
          url: url,
          refresh: false,
        },
        cache: true,
        dataType: "html", // IMPORTANT: Tell ajax to expect HTML, not JSON!
      });

      if (response && response.trim()) {
        // Create a container for the onebox
        const container = document.createElement("div");
        container.classList.add("onebox-container", "rehydrated-media");
        container.innerHTML = response;

        // Auto-expand collapsed oneboxes (remove truncation)
        setTimeout(() => {
          // Try multiple possible expand button selectors
          const selectors = [
            'button.show-more',
            '.show-more-button',
            '.expand-quote',
            'a.show-more',
            '.quote .title .quote-controls button',
            'aside.quote .show-more',
          ];

          let expandButton = null;
          for (const selector of selectors) {
            expandButton = container.querySelector(selector);
            if (expandButton) {
              expandButton.click();
              break;
            }
          }
        }, 100);

        return container;
      }
      return null;
    } catch (error) {
      console.error("[Announcement Embeds] Onebox fetch failed:", error);

      // Check if the error has responseText (which means we actually got data!)
      if (error.responseText) {
        const container = document.createElement("div");
        container.classList.add("onebox-container", "rehydrated-media");
        container.innerHTML = error.responseText;

        // Auto-expand collapsed oneboxes (remove truncation)
        setTimeout(() => {
          // Try multiple possible expand button selectors
          const selectors = [
            'button.show-more',
            '.show-more-button',
            '.expand-quote',
            'a.show-more',
            '.quote .title .quote-controls button',
            'aside.quote .show-more',
          ];

          let expandButton = null;
          for (const selector of selectors) {
            expandButton = container.querySelector(selector);
            if (expandButton) {
              expandButton.click();
              break;
            }
          }
        }, 100);

        return container;
      }

      return null;
    }
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
    async (elem) => {
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
          wrapBlocks = Array.from(found);
          break;
        }
      }

      if (wrapBlocks.length === 0) return;

      wrapBlocks.forEach(async (wrapBlock) => {
        // Find all links inside this wrap block
        const links = Array.from(wrapBlock.querySelectorAll('a[href]'));

        // Process links sequentially to handle async operations
        for (let linkIndex = 0; linkIndex < links.length; linkIndex++) {
          const link = links[linkIndex];
          const url = link.href;

          // Skip if already processed
          if (link.closest('.media-embed-wrapper, .video-wrapper, .rehydrated-media, .onebox-container')) {
            continue;
          }

          // Skip heading anchor links (e.g., #heading-name)
          if (url.includes('#') && url.split('#')[0] === window.location.href.split('#')[0]) {
            continue;
          }

          // Skip if link is inside a heading element
          if (link.closest('h1, h2, h3, h4, h5, h6')) {
            continue;
          }

          // Skip Discourse internal upload URLs (upload://xxxxx)
          if (url.startsWith('upload://') || url.includes('/upload://')) {
            continue;
          }

          // Skip image links (links that contain an img element)
          if (link.querySelector('img')) {
            continue;
          }

          // Helper: Check if link is standalone (on its own line, not inline with text)
          const isStandaloneLink = (linkElement) => {
            const parent = linkElement.parentElement;
            if (!parent) return false;

            // Check if the link is in a paragraph by itself
            if (parent.tagName === 'P') {
              // Get all text nodes and elements in the paragraph
              const children = Array.from(parent.childNodes);

              // If paragraph only contains this link (and maybe whitespace), it's standalone
              const hasOtherContent = children.some(node => {
                if (node === linkElement) return false;
                if (node.nodeType === Node.TEXT_NODE) {
                  return node.textContent.trim().length > 0;
                }
                if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== 'BR') {
                  return true;
                }
                return false;
              });

              return !hasOtherContent;
            }

            return false;
          };

          let embedElement = null;

          // Check what type of media this is
          const isVideo = isVideoFile(url);
          const isHostedVideo = isVideoHostingPlatform(url);
          const isTopic = isDiscourseTopic(url);
          const isStandalone = isStandaloneLink(link);

          // Priority 1: Discourse topics (use onebox API) - ONLY for standalone links
          if (isTopic && isStandalone) {
            embedElement = await createOnebox(url);
          }
          // Priority 2: YouTube
          else if (/youtube\.com|youtu\.be/i.test(url)) {
            embedElement = createYouTubeEmbed(url);
          }
          // Priority 3: Vimeo
          else if (/vimeo\.com/i.test(url)) {
            embedElement = createVimeoEmbed(url);
          }
          // Priority 4: Direct video files or hosted video
          else if (isVideo || isHostedVideo) {
            embedElement = createVideoPlayer(url);
          }
          // Priority 5: Try onebox for any other URL - ONLY for standalone links
          else if (isStandalone && (link.textContent.trim() === url || link.textContent.includes('http'))) {
            embedElement = await createOnebox(url);
          }

          // If we created an embed, replace the link
          if (embedElement) {
            // For oneboxes, don't wrap again (already has container)
            if (embedElement.classList.contains('onebox-container')) {
              link.replaceWith(embedElement);
            } else {
              // Create wrapper for video embeds
              const wrapper = document.createElement("div");
              wrapper.classList.add('media-embed-wrapper', 'rehydrated-media');
              wrapper.appendChild(embedElement);
              link.replaceWith(wrapper);
            }
          }
        }
      });
    },
    {
      id: "rehydrate-wrap-embeds",
      onlyStream: false,
    }
  );
});
