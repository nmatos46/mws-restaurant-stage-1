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

    //cacheAlways.push(`./restuarant.html?id=${i}`);
}

let currentCache = 'myCacheNow6';

self.addEventListener("install", inst => {
    console.log("I have INSTALLED!!!!");
    console.log(cacheAlways);
    //Install predetermined caches before full install
    inst.waitUntil(
        caches.open(currentCache).then(maCache => {
            console.log("Adding a cache!!!!");
            return maCache.addAll(cacheAlways);
        })
    );
    
})

self.addEventListener("activate", actEv =>{
    console.log("I am ACTIVATED!!!!!");
    
    actEv.waitUntil(
        caches.keys().then(cacheArray=>{
            return Promise.all(
                cacheArray.filter(cacheOfThePast=>{
                    console.log("Filtering caches!!!!")
                    return cacheOfThePast!==currentCache;
                }).map(targetAcquired => {
                    console.log('Deleting old caches!!!!');
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
        caches.match(fetEv.request).then(response=>{
            if (response){
                console.log("OMG...I\'M DOING IT!!!!! The cache WORKS!!!");
                return response;
            }
            console.log(fetEv.request.url);
            console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&");
            console.log(fetEv.request);
            return fetch(fetEv.request);
        })
        .catch( (err) => {
            return new Response(err);
        })
        
    );
})