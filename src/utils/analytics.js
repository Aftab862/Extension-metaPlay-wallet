// // src/utils/analytics.js

// let queue = [];

// // internal: actually send event once `window.umami` is available
// function _flushQueue() {
//   if (window.umami) {
//     queue.forEach(({ name, data }) => {
//       console.log(`📊 Umami: Sending queued event [${name}]`, data);
//       window.umami.track(name, data);
//     });
//     queue = [];
//   }
// }

// // poll for readiness and flush
// (function waitForUmami() {
//   const interval = setInterval(() => {
//     if (window.umami) {
//       clearInterval(interval);
//       console.log("✅ window.umami available—flushing event queue");
//       _flushQueue();
//     }
//   }, 300);
// })();

// // public helper
// export function trackEvent(name, data = {}) {
//   if (window.umami) {
//     console.log(`📊 Umami: Sending event [${name}]`, data);
//     window.umami.track(name, data);                           // :contentReference[oaicite:0]{index=0}
//   } else {
//     console.warn(`⏳ Umami not ready—queuing event [${name}]`, data);
//     queue.push({ name, data });
//   }
// }


// export function trackEvent(name, data = {}) {
//   if (window.umami) {
//     console.log(`📊 Umami: Sending event [${name}]`, data);
//     window.umami.track(name, data);
//   } else {
//     console.warn("⚠️ Umami not ready");
//   }
// }


let eventTracked = false;  // Flag to prevent multiple tracking of the same event

export function trackEvent(name, data = {}) {
  if (!eventTracked && window.umami) {
    eventTracked = true;  // Set flag to true to prevent further tracking
    console.log(`📊 Umami: Sending event [${name}]`, data);
    window.umami.track(name, data);

    // Reset flag after a short time (e.g., 5 seconds) to allow further tracking
    setTimeout(() => {
      eventTracked = false;
    }, 5000);  // Reset after 5 seconds
  } else if (!window.umami) {
    console.warn("⚠️ Umami not ready");
  }
}
