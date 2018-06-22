let cacheAlways = [
    './',
    './index.html',
    './restaurant.html',
    './css/styles.css',
    './js/main.js',
    './js/restaurant_info.js',
    './js/dbhelper.js',
    './data/restaurants.json'
];

//Add images and restaurant pages to the cache
for (let i=1; i<=10; i++){
    cacheAlways.push(`./imgSmall/${i}.jpg`);
    cacheAlways.push(`./imgMedium/${i}.jpg`);
    cacheAlways.push(`./img/${i}.jpg`);
}

let currentCache = 'myCacheNow0';

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
    //respond to fetch events with the cache
    console.log(fetEv.request.url);
    console.log(fetEv);
    

    fetEv.respondWith(
        caches.match(fetEv.request).then(response => {
            
            if (response){
                return response;
            }
            
            //record the request url because the request is consumed when fetching
            let reqURL = fetEv.request.url;
        
            return fetch(fetEv.request).then( fetResponse =>{

                //cache responses that are not related to google maps
                if (!(reqURL.includes("maps") || reqURL.includes("googleapis"))){

                    //clone the response to not consume it when caching
                    let fetResClone = fetResponse.clone();

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
})