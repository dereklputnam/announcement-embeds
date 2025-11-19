import { apiInitializer } from "discourse/lib/api";

export default apiInitializer("1.8.0", (api) => {
  api.decorateCookedElement(
    (elem) => {
      // Find all links inside .wrap.no-email blocks
      elem.querySelectorAll('.wrap.no-email a[href]').forEach((link) => {
        const url = link.href;

        // Check if the link points to a video file or Discourse-hosted media
        const isVideo = url.match(/\.(mp4|mov|webm|m4v)$/i);
        const isDiscourseAsset = url.includes("discourseimages");

        if (isVideo || isDiscourseAsset) {
          // Only convert if the link hasn't already been replaced
          if (link.parentElement && !link.parentElement.classList.contains('video-wrapper')) {
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

            // Create wrapper for easier styling
            const wrapper = document.createElement("div");
            wrapper.classList.add('video-wrapper', 'rehydrated-media');
            wrapper.appendChild(video);

            // Replace the link with the video wrapper
            link.replaceWith(wrapper);
          }
        }
      });
    },
    {
      id: "rehydrate-wrap-embeds",
      onlyStream: false // Apply to all posts, not just stream
    }
  );
});
