/**Citations: Service Worker Code 1, 
 *            Heading "Install a service worker"
 *Notes: Use array variables to initialize a cache
 */
let cacheAlways = [
    './',
    './manifest.json',
    './index.html',
    './restaurant.html',
    './js/altTxt.js',
    './css/styles.css',
    './js/main.js',
    './js/restaurant_info.js',
    './js/dbhelper.js'
];
/**End of "Citations: Service Worker Code 1,
 *                    Heading "Install a service worker""
 */
//Add images and restaurant pages to the cache
for (let i=1; i<=10; i++){
    cacheAlways.push(`./imgSmall/${i}.jpg`);
    cacheAlways.push(`./imgMedium/${i}.jpg`);
    cacheAlways.push(`./img/${i}.jpg`);
}

/**Citations: Service Worker Code 2, Heading "Using the cache API"
 * Notes: 
 * - When installing service worker, pause install event using waituntil
 *   and when adding a cache, return a promise to add to the cache using then
 * - When the service worker is activating, pause activate event using waituntil
 *   and when deleting a cache, return a promise for all caches to be deleted
 *   using promise.all
 * - When the browser initiates a fetch event, intercept it using respondWith,
 *   returning a promise for a response from the cache using then, returning 
 *   a promise for caching the fetched response using then if it doesn't exist 
 *   in the cache and returning a new response with a string if an error is 
 *   thrown.
 */
let currentCache = 'myCacheNow';

self.addEventListener("install", inst => {
    //Install predetermined caches before full install
    inst.waitUntil(
        caches.open(currentCache).then(maCache => {
            return maCache.addAll(cacheAlways);
        })
    );
    
})

self.addEventListener("activate", actEv =>{
    actEv.waitUntil(
        caches.keys().then(cacheArray=>{
            return Promise.all(
                cacheArray.filter(cacheOfThePast=>{
                    return cacheOfThePast!==currentCache;
                }).map(targetAcquired => {
                    return caches.delete(targetAcquired);
                })
            )
        })
    );
    
});

self.addEventListener("fetch", fetEv => {
    
    fetEv.respondWith(
        caches.match(fetEv.request).then(response => {
            
            if (response){
                return response;
            }
            
            /**Citations: Service Worker Code 1, 
             *            Heading "Cache and return requests" 
             * Notes: 
             * - Requests and responses are streams that are
             *   consumed when fetched or put into the cache.
             *   Clone or record before consuming if you 
             *   need either later in your code.
             */

            //record the request url because the request is consumed when fetching
            let reqURL = fetEv.request.url;
        
            return fetch(fetEv.request).then( fetResponse =>{

                //cache responses that are not related to google maps, or the restaurants and reviews database
                if (!(reqURL.includes("maps") || reqURL.includes("googleapis") || reqURL.includes("restaurants") || reqURL.includes("reviews"))){

                    //clone the response to not consume it when caching
                    let fetResClone = fetResponse.clone();
            
            /*****End of Citations: Service Worker Code 1, 
             *                      Heading "Cache and return requests"
             */

                    //cache the url-response pair
                    caches.open(currentCache).then(cacheNow =>{
                        cacheNow.put(reqURL,fetResClone);
                    });
                }
                return fetResponse;
            })
        })
        .catch( (err) => {
            return new Response(
                `
                ${err}
                Please visit this page while online
                before trying to visit it offline.
                `);
        })
        
    );
/*****End of Citations: Service Worker Code 2, 
 * Heading "Using the cache API"
 */
})