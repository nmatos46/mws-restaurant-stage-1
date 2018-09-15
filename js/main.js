let restaurants,
  neighborhoods,
  cuisines
var map
var markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  fetchNeighborhoods();
  fetchCuisines();
  updateRestaurants();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };

  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });

  if (self.restaurants){
    //only load markers if restuarants have been defined
    addMarkersToMap();
  }
}

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  //change aria-label to match selected value
  document.getElementById("neighborhoods-select").setAttribute("aria-label",neighborhood);
  document.getElementById("cuisines-select").setAttribute("aria-label",cuisine);
  
  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));

    //Initialize IDB with all restaurant objects
    if (restaurants.length === 10){
      var restrDBPromise = idb.open('restrDB').then( updateDB => {
        var restrTX = updateDB.transaction('restaurants','readwrite');
        var restStore = restrTX.objectStore('restaurants');
        restStore.put(restaurant);
        return restrTX.complete;
      });
    }
  });

  if (self.map){
    /**only run if window.initMap has already been run
     * and thus self.map is defined
    */
    addMarkersToMap();
  }
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');
  console.log(restaurant.is_favorite);

  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.src = `/imgSmall/${restaurant.id}.jpg`;
  
  /**Citations: Responsive Styling, 1
   *            Heading "Full Responsiveness"
   * Notes:
   * - Add srcset attribute to provide images of differing
   *   pixel sizing.
   */
  image.srcset = `/img/${restaurant.id}.jpg 1200w, /imgMedium/${restaurant.id}.jpg 800w, /imgSmall/${restaurant.id}.jpg 400w`;
  /*****End of Citations: Responsive Styling, 1
   *                      Heading "Full Responsiveness"
   */
  
  //Add accessbility friendly images
  image.alt = altTxt[restaurant.name];
  li.append(image);
  
  /**Citations: Accessibility HTML, 2.2 */
  const name = document.createElement('h2');
  /**End of Citations: Accessibility HTML, 2.2 */
  name.innerHTML = restaurant.name;
  li.append(name);
  
  const boldenNeighborhood = document.createElement("strong");
  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  boldenNeighborhood.append(neighborhood);
  li.append(boldenNeighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  li.append(address);
  
  //Add Accessibility friendly buttons
  const deets = document.createElement('button');
  deets.innerHTML = `See ${restaurant.name} Details`;
  deets.addEventListener("click", () => {
    window.location.href = DBHelper.urlForRestaurant(restaurant);
  });
  li.append(deets);

  //Add favorite button
  const fav = document.createElement('a');
  fav.href = 'javascript:void(0)';
  fav.className = 'mainFav';
  //const favText = fav.append('font ');
  //favText.color ='red';
  if (restaurant.is_favorite==true){
    fav.innerHTML='♥';
  }else if (restaurant.is_favorite==false){
    fav.innerHTML='♡';
  }
  fav.addEventListener('click', () => {
    console.log('!!!!!!!!')
    console.log(fav.innerHTML);
    if (fav.innerHTML==='♡'){
      fav.innerHTML='♥';
    }else if (fav.innerHTML==='♥'){
      fav.innerHTML='♡';
    }
    fav.blur();
  });
  li.append(fav);

  return li
}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
}
