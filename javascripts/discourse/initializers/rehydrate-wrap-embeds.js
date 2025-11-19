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

  // Helper: Extract topic ID from URL
  function extractTopicId(url) {
    const match = url.match(/\/t\/[^\/]+\/(\d+)/);
    return match ? match[1] : null;
  }

  // Helper: Fetch full topic data and create expanded quote
  async function createFullTopicQuote(url) {
    const topicId = extractTopicId(url);
    if (!topicId) {
      console.log("[Announcement Embeds] Could not extract topic ID from URL");
      return null;
    }

    try {
      console.log("[Announcement Embeds] Fetching full topic data for ID:", topicId);

      const topicData = await ajax(`/t/${topicId}.json`, {
        type: "GET",
        cache: true,
      });

      if (!topicData || !topicData.post_stream || !topicData.post_stream.posts || !topicData.post_stream.posts[0]) {
        console.log("[Announcement Embeds] Invalid topic data received");
        return null;
      }

      const firstPost = topicData.post_stream.posts[0];
      const topic = topicData;

      console.log("[Announcement Embeds] Topic data received:", {
        title: topic.title,
        postLength: firstPost.cooked.length,
      });

      // Build a full quote block (similar to Discourse's quote format)
      const quoteHTML = `
        <aside class='quote no-group' data-username='${firstPost.username}' data-post='${firstPost.post_number}' data-topic='${topic.id}'>
          <div class='title'>
            <div class='quote-controls'></div>
            <img alt='' width='24' height='24' src='${firstPost.avatar_template.replace('{size}', '48')}' class='avatar'>
            <div class="quote-title__text-content">
              <a href='${url}'>${topic.title}</a>
              ${topic.category_id ? `<a class='badge-category__wrapper' href='/c/${topic.category_id}'><span class='badge-category'>${topic.category_name || ''}</span></a>` : ''}
            </div>
          </div>
          <blockquote>
            ${firstPost.cooked}
          </blockquote>
        </aside>
      `;

      const container = document.createElement("div");
      container.classList.add("onebox-container", "rehydrated-media", "full-topic-quote");
      container.innerHTML = quoteHTML;

      return container;
    } catch (error) {
      console.error("[Announcement Embeds] Failed to fetch full topic:", error);
      return null;
    }
  }

  // Helper: Fetch and create onebox for a URL
  async function createOnebox(url, linkElement) {
    try {
      console.log("[Announcement Embeds] Fetching onebox for:", url);

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
        console.log("[Announcement Embeds] Onebox HTML received, length:", response.length);

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
              console.log(`[Announcement Embeds] Found expand button with selector: ${selector}`);
              break;
            }
          }

          if (expandButton) {
            console.log("[Announcement Embeds] Auto-expanding collapsed onebox");
            expandButton.click();
          } else {
            console.log("[Announcement Embeds] No expand button found - onebox may already be fully expanded");
          }
        }, 100);

        return container;
      } else {
        console.log("[Announcement Embeds] Empty onebox response");
        return null;
      }
    } catch (error) {
      console.error("[Announcement Embeds] Onebox fetch failed:", error);

      // Check if the error has responseText (which means we actually got data!)
      if (error.responseText) {
        console.log("[Announcement Embeds] Found HTML in error response, using it anyway");
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
              console.log(`[Announcement Embeds] Found expand button with selector: ${selector}`);
              break;
            }
          }

          if (expandButton) {
            console.log("[Announcement Embeds] Auto-expanding collapsed onebox");
            expandButton.click();
          } else {
            console.log("[Announcement Embeds] No expand button found - onebox may already be fully expanded");
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

      wrapBlocks.forEach(async (wrapBlock, blockIndex) => {
        console.log(`[Announcement Embeds] Processing block #${blockIndex + 1}`);

        // Find all links inside this wrap block
        const links = Array.from(wrapBlock.querySelectorAll('a[href]'));
        console.log(`[Announcement Embeds] Found ${links.length} links`);

        // Process links sequentially to handle async operations
        for (let linkIndex = 0; linkIndex < links.length; linkIndex++) {
          const link = links[linkIndex];
          const url = link.href;

          // Skip if already processed
          if (link.closest('.media-embed-wrapper, .video-wrapper, .rehydrated-media, .onebox-container')) {
            console.log(`[Announcement Embeds] Link #${linkIndex + 1} already processed, skipping`);
            continue; // Skip to next link, don't exit the loop!
          }

          console.log(`[Announcement Embeds] Analyzing link #${linkIndex + 1}:`, url);

          let embedElement = null;

          // Check what type of media this is
          const isVideo = isVideoFile(url);
          const isHostedVideo = isVideoHostingPlatform(url);
          const isTopic = isDiscourseTopic(url);

          console.log(`[Announcement Embeds] Detection:`, {
            url: url.substring(0, 80) + '...',
            isVideoFile: isVideo,
            isHostedVideo: isHostedVideo,
            isYouTube: /youtube\.com|youtu\.be/i.test(url),
            isVimeo: /vimeo\.com/i.test(url),
            isDiscourseTopic: isTopic,
          });

          // Priority 1: Discourse topics (fetch full topic data)
          if (isTopic) {
            console.log("[Announcement Embeds] Fetching full Discourse topic");
            embedElement = await createFullTopicQuote(url);
          }
          // Priority 2: YouTube
          else if (/youtube\.com|youtu\.be/i.test(url)) {
            console.log("[Announcement Embeds] Creating YouTube embed");
            embedElement = createYouTubeEmbed(url);
          }
          // Priority 3: Vimeo
          else if (/vimeo\.com/i.test(url)) {
            console.log("[Announcement Embeds] Creating Vimeo embed");
            embedElement = createVimeoEmbed(url);
          }
          // Priority 4: Direct video files or hosted video
          else if (isVideo || isHostedVideo) {
            console.log("[Announcement Embeds] Creating native video player");
            embedElement = createVideoPlayer(url);
          }
          // Priority 5: Try onebox for any other URL (optional - might be too aggressive)
          else if (link.textContent.trim() === url || link.textContent.includes('http')) {
            console.log("[Announcement Embeds] Attempting onebox for generic URL");
            embedElement = await createOnebox(url, link);
          }

          // If we created an embed, replace the link
          if (embedElement) {
            console.log("[Announcement Embeds] Replacing link with embed");
            console.log("[Announcement Embeds] Link element before replace:", link);
            console.log("[Announcement Embeds] Link parent before replace:", link.parentElement);

            // For oneboxes, don't wrap again (already has container)
            if (embedElement.classList.contains('onebox-container')) {
              console.log("[Announcement Embeds] Replacing with onebox container");
              link.replaceWith(embedElement);
              console.log("[Announcement Embeds] Onebox HTML:", embedElement.outerHTML.substring(0, 300));
            } else {
              // Create wrapper for video embeds
              console.log("[Announcement Embeds] Replacing with video wrapper");
              const wrapper = document.createElement("div");
              wrapper.classList.add('media-embed-wrapper', 'rehydrated-media');
              wrapper.appendChild(embedElement);
              link.replaceWith(wrapper);
            }

            console.log("[Announcement Embeds] ✓ Embed created successfully");
            console.log("[Announcement Embeds] Parent after replace:", embedElement.parentElement);
          } else {
            console.log("[Announcement Embeds] No embed created for this link");
          }
        }
      });

      console.log("[Announcement Embeds] Processing complete");
    },
    {
      id: "rehydrate-wrap-embeds",
      onlyStream: false,
    }
  );
});
