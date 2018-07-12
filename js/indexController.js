/**Citations: Service Worker Code 3
 * Notes:
 * - Organize code for installing service worker using a file
 *   separate from main.js
 */
/**
 * End of Citations: Service Worker Code 3
 */


/**Citations: Service Worker Code 2,
 *            Heading "Registering the service worker"
 * Notes:
 * - Register the service worker with the name of the
 *   service worker script. 
 * - Promise to log to console using then for debugging
 */

/**Register the service worker once main.js is called.*/
if (navigator.serviceWorker){
    navigator.serviceWorker.register('sw.js')
    .catch(err => {
      console.log("Service Worker: C'est mort!!!!", err);
    });
  }

/**End of Citations: Service Worker Code 2,
 *            Heading "Registering the service worker"
 */

/**Citations: Service Worker Code 2,
 *            Heading "Indexed DB API"
 */

var dbPromise = idb.open('test-db', 1, function(upgradeDb) {
  var keyValStore = upgradeDb.createObjectStore('keyval');
  keyValStore.put("world", "hello");
});

/**End of Citations: Service Worker Code 2,
 *                   Heading "Indexed DB API"
 */
  