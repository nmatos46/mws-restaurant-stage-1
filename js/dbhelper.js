/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    /**From Stage 1 
    const port = 9000 // Change this to your server port
    return `http://localhost:${port}/data/restaurants.json`;
    */
    return `https://udacity-reviews-server-ncm.herokuapp.com/restaurants`;
  }

  /**Citation: Handling failed http responses
   * https://www.tjvantoll.com/2015/09/13/fetch-and-errors/
   */
  static returnError(promiseResponse,callback){
    if (!promiseResponse.ok){
      callback(promiseResponse.statusText,null);
      return;
    }
    return promiseResponse;
  }

  /**
   * Fetch all reviews from a particular restaurant
   */
  static fetchRestaurantReviews(restaurantID, callback){
    let reviews = [];
    //get reviews from idb if you can
    if(window.navigator.onLine){
      return this.fetchReviewsFromServer(restaurantID,callback);
    }else{
      let reviewsDBPromise = idb.open('reviewsDB').then( updateDB => {
        let reviewsTX = updateDB.transaction('reviews');
        let reviewsStore = reviewsTX.objectStore('reviews');
        let reviewsIndex = reviewsStore.index('restaurant_id');
        let reviewsDB = reviewsIndex.getAll(restaurantID)
        return reviewsDB;
      }).then(objects =>{
        //If there are review objects in the idb database
        if (objects.length > 0){
          console.log("!!!!!!!!!!!!!!!!!!!!!!!$$$$$$$$$$$$$$$$$$$");
          console.log(reviews);
          console.log(objects);
          reviews = objects;
          callback(null, reviews);
        }
        else{
          //fetch reviews from server
          callback('There are currently no reviews in idb.',null);
        }
      });
    }


    
  }

  /**
   * Get restaurant reviews from server by ID
   * @param {int} restaurantID 
   * @param {function} callback 
   */
  static fetchReviewsFromServer(restaurantID,callback){
    fetch(`https://udacity-reviews-server-ncm.herokuapp.com/reviews/?restaurant_id=${restaurantID}`)
    .then(promiseResponse => {
      return this.returnError(promiseResponse,callback);
    })
    .then(data => {
      let dataJ = data.json();
      return dataJ;
    })
    .then(reviewsArr => {
      console.log(reviewsArr);
      callback(null, reviewsArr);
    });
  }
  
  /**
   * Change the is_favorite value for a restaurant object in idb and beyond.
   * @param {restaurant object} restaurant
   * @param {Boolean} newFavState
   */
  static changeFavState(restaurant,newFavState) {
    //change is_favorite in idb
    let restrDBPromise = idb.open('restrDB').then( updateDB => {
      let restrTX = updateDB.transaction('restaurants','readwrite');
      let restStore = restrTX.objectStore('restaurants');
      let restaurantsDB = restStore.get(restaurant.id).then(object => {
        object.is_favorite = newFavState
        restStore.put(object)
      });
      return restrTX.complete;
    })
    if (!window.navigator.onLine){
      //if you are offline, update server when back online
      console.log('OH NO. TIS OFFLINE!!!!!!!!')
      window.addEventListener('online',event => {
        console.log('Calm yourself. We back online~~~~~~~~~')
        DBHelper.changeServedFavState(restaurant.id,newFavState);
      });  
    }else{
      //update server
      console.log('Tis Online Sah~~~~~~~~~~~~~~~~~~~~~~~~')
      DBHelper.changeServedFavState(restaurant.id,newFavState);
    }
    
  }

  /**
   * Change fav state of restaurant in the server
   * @param {restaurant Object} restaurantID 
   * @param {Boolean} newFavState 
   */
  static changeServedFavState(restaurantID,newFavState){
    fetch(`https://udacity-reviews-server-ncm.herokuapp.com/restaurants/${restaurantID}/?is_favorite=${newFavState}`,{
      method: 'PUT'
    });
  }

  static updateServerReviews(review){
    console.log('ayyyyyyyyy');
    console.log(review);
    let reviewPost = {
      "restaurant_id": review.restaurant_id,
      "name": review.name,
      "rating": review.rating,
      "comments": review.comments
    }
    console.log(JSON.stringify(reviewPost));

    let requestURL = 'https://udacity-reviews-server-ncm.herokuapp.com/reviews/';
    
    //Update server data
    fetch(requestURL,{
      method: 'POST',
      body: JSON.stringify(reviewPost),
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    })
    .then(response => {
      console.log(response);
    })
    .catch(error => {
      console.log(`${error.name}: ${error.message}`);
    });

    /** 
    //Update idb data with data from the server
    let reviewsIDB = {};
    this.fetchReviewsFromServer(review.restaurant_id,(error,reviews) => {
      if (!reviews){
        //if there are no reviews
        console.log(`Error fetching Restaurant Reviews: ${error}`);
        return;
      }
      else{
        reviewsIDB = reviews;
      }
      console.log("?????????????????????????$$$$$$$$$$$$$$$$$??????????????????")
      console.log(reviewsIDB);
    });
    */
    
    
  }


  /**End of Citation: Handling failed http responses */


  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    let restaurants = {};
    
    //fetch restaurants from idb
    let restrDBPromise = idb.open('restrDB').then( updateDB => {
      let restrTX = updateDB.transaction('restaurants');
      let restStore = restrTX.objectStore('restaurants');
      let restaurantsDB = restStore.getAll();
      console.log("@@@@@@@@@@@@@@@");
      console.log(restaurantsDB);
      return restaurantsDB;
    }).then(objects =>{

    //If there are objects in the idb database
    if (objects.length > 0){
      console.log("$$$$$$$$$$$$$$$$$$$");
      console.log(restaurants);
      console.log(objects);
      restaurants = objects;
      callback(null, restaurants);
    }
    else{
      //fetch restaurants from server if not fetched from idb
      let xhr = new XMLHttpRequest();
      xhr.open('GET', DBHelper.DATABASE_URL);
      xhr.onload = () => {
        if (xhr.status === 200) { // Got a success response from server!
          
          //if the 10 restaurant objects were not fetched from idb
          if (restaurants.length != 10){
            console.log(`***********************`);
            restaurants = JSON.parse(xhr.responseText);
            console.log(restaurants);
            callback(null, restaurants);
          }
        } else { // Oops!. Got an error from server.
          const error = (`Request failed. Returned status of ${xhr.status}`);
          callback(error, null);
        }
      };
      xhr.send();
    }
    });
    
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.photograph}`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

}
