import { apiInitializer } from "discourse/lib/api";

export default apiInitializer("1.8.0", (api) => {
  api.decorateCookedElement(
    (elem) => {
      // Debug: Log when the decorator runs
      console.log("[Announcement Embeds] Decorator running on element:", elem);

      // Find all .wrap.no-email blocks
      const wrapBlocks = elem.querySelectorAll('.wrap.no-email');
      console.log("[Announcement Embeds] Found wrap.no-email blocks:", wrapBlocks.length);

      wrapBlocks.forEach((wrapBlock, index) => {
        console.log(`[Announcement Embeds] Processing wrap block #${index + 1}`);
        console.log("[Announcement Embeds] Wrap block HTML:", wrapBlock.innerHTML.substring(0, 500));

        // Find all links inside this wrap block
        const links = wrapBlock.querySelectorAll('a[href]');
        console.log(`[Announcement Embeds] Found ${links.length} links in wrap block #${index + 1}`);

        links.forEach((link, linkIndex) => {
          const url = link.href;
          console.log(`[Announcement Embeds] Link #${linkIndex + 1}:`, url);

          // Check if the link points to a video file or Discourse-hosted media
          const isVideo = url.match(/\.(mp4|mov|webm|m4v)$/i);
          const isDiscourseAsset = url.includes("discourseimages");
          const isAzureCDN = url.includes("azurefd.net");

          console.log(`[Announcement Embeds] URL analysis:`, {
            url,
            isVideo: !!isVideo,
            isDiscourseAsset,
            isAzureCDN,
            shouldConvert: !!(isVideo || isDiscourseAsset)
          });

          if (isVideo || isDiscourseAsset) {
            // Only convert if the link hasn't already been replaced
            const alreadyConverted = link.closest('.video-wrapper');

            if (alreadyConverted) {
              console.log("[Announcement Embeds] Link already converted, skipping");
              return;
            }

            console.log("[Announcement Embeds] Converting link to video player");

            // Create video element
            const video = document.createElement("video");
            video.src = url;
            video.controls = true;
            video.preload = "metadata";
            video.style.maxWidth = "100%";
            video.style.borderRadius = "8px";
            video.style.display = "block";
            video.style.margin = "1em auto";

            // Add accessibility attributes
            video.setAttribute('aria-label', `Video: ${url.split('/').pop()}`);

            // Add error handling for debugging
            video.addEventListener('error', (e) => {
              console.error("[Announcement Embeds] Video failed to load:", url);
              console.error("[Announcement Embeds] Error details:", e);
            });

            video.addEventListener('loadedmetadata', () => {
              console.log("[Announcement Embeds] Video metadata loaded successfully:", url);
            });

            // Create wrapper for easier styling
            const wrapper = document.createElement("div");
            wrapper.classList.add('video-wrapper', 'rehydrated-media');
            wrapper.appendChild(video);

            // Replace the link with the video wrapper
            console.log("[Announcement Embeds] Replacing link with video wrapper");
            link.replaceWith(wrapper);

            console.log("[Announcement Embeds] Video conversion complete");
          } else {
            console.log("[Announcement Embeds] Link does not match video criteria, skipping");
          }
        });
      });

      console.log("[Announcement Embeds] Decorator finished");
    },
    {
      id: "rehydrate-wrap-embeds",
      onlyStream: false // Apply to all posts, not just stream
    }
  );
});
