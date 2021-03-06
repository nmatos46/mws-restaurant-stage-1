let restaurant;
let reviews;
let map;

/**
 * Fill in restaurant html after DOM has loaded
 */
document.addEventListener('DOMContentLoaded', event => {
  /**
  * Initialize Google map, called from HTML.
  */
  window.initMap = () => {
    //initialize map object
    self.map = new google.maps.Map(document.getElementById('map'),{
      zoom: 16,
      center: {lat:0,lng:0}
    });
    console.log('#######################')
    console.log(self.map);

    if (self.restaurant){
      self.map.setOptions({
        zoom: 16,
        center: self.restaurant.latlng,
        scrollwheel: false
      });
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  }

  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      fillBreadcrumb();
    }
  });
});

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant);
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL';
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant);
    });
  }
}


/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img';
  image.src = `/imgSmall/${restaurant.id}.jpg`; 

  //Add html to fav button
  const fav = document.getElementsByClassName('restrFav')[0];
  let unfavor = `Unfavorite ${restaurant.name}`;
  let favor = `Favorite ${restaurant.name}`;
  //let unfavor = '♥';
  //let favor = '♡';

  //change initial fav string to boolean
  if(restaurant.is_favorite=='true'){
    DBHelper.changeFavState(restaurant,true);
    restaurant.is_favorite=true;
  }else if (restaurant.is_favorite=='false'){
    DBHelper.changeFavState(restaurant,false);
    restaurant.is_favorite=false;
  }

  if (restaurant.is_favorite==true){
    fav.innerHTML=unfavor;
  }else if (restaurant.is_favorite==false){
    fav.innerHTML=favor;
  }

  //Favorite button code
  //change fav state of restaurant on-click
  fav.addEventListener('click', () => {
    console.log('!!!!!!!!');
    console.log(fav.innerHTML);
    if (fav.innerHTML===favor){
      fav.innerHTML=unfavor;
      DBHelper.changeFavState(restaurant,true);
    }else if (fav.innerHTML===unfavor){
      fav.innerHTML=favor;
      //store new fav state in idb and server
      DBHelper.changeFavState(restaurant,false);
    }
    fav.blur();
  });

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

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }

  //create the static map
  let mapSrc="https://maps.googleapis.com/maps/api/staticmap?";
  let center = `center=${restaurant.latlng.lat},${restaurant.latlng.lng}`;
  let zoom = "&zoom=16";
  let size = "&size=500x300" 

  mapSrc += center;
  mapSrc += zoom;
  mapSrc += size;


    //define Map marker
  let marker = "&markers=size:mid";
  marker += "|color:0x6a5db8";
  //marker += "|label=R"; optional if design on marker is too plain
  marker += `|${restaurant.latlng.lat},${restaurant.latlng.lng}`;

  mapSrc += marker;

    //define api key
  mapSrc += "&key=AIzaSyCvSApnzzO8lNHBERgBOtGGRfm3POUo0Es"

    //render static map in html
  document.getElementById("info-static-map").src = mapSrc;


  //get reviews and create their html
  DBHelper.fetchRestaurantReviews(restaurant.id,(error,reviews)=>{
    if (!reviews){
      //if there are no reviews
      console.log(`Error fetching Restaurant Reviews: ${error}`);
      return;
    }
    else{
      self.reviews = reviews;
      fillReviewsHTML();
    }
  })
  
  
  //configure the google map
  /**  
  if (self.map){
    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
    console.log(self.map);
    if (self.map.tagName==="DIV"){
      fillBreadcrumb();
    }
    console.log(self.map);
    self.map.setOptions({
      zoom: 16,
      center: restaurant.latlng,
      scrollwheel: false
    })
    /** 
    .catch(error => {
      console.log(`${error.name}: ${error.message}`);
    });
    
    DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
  }
  */
  
  
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

changeRatingAria = () =>{
  const ratingSelect = document.getElementById('rating');
  const ratingIndex = ratingSelect.selectedIndex;
  const rating = ratingSelect[ratingIndex].value;

  //change aria-label to match selected value
  document.getElementById("rating").setAttribute("aria-label",`Input Rating Value ${rating}`);
  console.log("HA! This works");
}

submitReview = () => {
  console.log("WOOT! Getting there bit by bit, eh???");
  let name = document.getElementById("review-name").value;
  let rating = parseInt(document.getElementById("rating").value);
  let formReview = document.getElementById("review").value;

  let restaurantID = parseInt(getParameterByName('id'));
  let reviewDate = new Date();
  
  let review = {
    "id": 404,
    "restaurant_id": restaurantID,
    "name": name,
    "createdAt": reviewDate,
    "updatedAt": reviewDate,
    "rating": rating,
    "comments": formReview
  };

  console.log(review);
  
  //add in an offline review
  const ul = document.getElementById('reviews-list');
  const offlineReview = ul.appendChild(createReviewHTML(review));
  const offlineMessage = document.createElement('p');
  offlineMessage.setAttribute('id','offline-review');
  offlineMessage.innerHTML = 'Refresh the page before using the delete button.';
  const breakSpace1 = document.createElement('br');
  const breakSpace2 = document.createElement('br');
  offlineReview.appendChild(breakSpace1);
  offlineReview.appendChild(breakSpace2);
  offlineReview.appendChild(offlineMessage);
  ul.appendChild(offlineReview);

  //add dummy offline review to idb for now
  var reviewsDBPromise = idb.open('reviewsDB').then( updateDB => {
    var reviewsTX = updateDB.transaction('reviews','readwrite');
    var reviewsStore = reviewsTX.objectStore('reviews');
    reviewsStore.put(review);
    return reviewsTX.complete;
  });

  if(!window.navigator.onLine){
    window.addEventListener('online',event => {
      //Post review to server
      DBHelper.updateServerReviews(review);
    });
  }else{
    //Post review to server
    DBHelper.updateServerReviews(review);
  }
 
  
  //add a message after button is clicked
  const reviewForm = document.getElementById('form-container');
  const message = document.createElement('p');
  message.innerHTML = "Review submitted! See below :)";
  reviewForm.appendChild(message);

  document.getElementById("reviews-form").reset();
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.reviews) => {
  const container = document.getElementById('reviews-container');

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);  

  var reviewsDBPromise = idb.open('reviewsDB').then( updateDB => {
    var reviewsTX = updateDB.transaction('reviews','readwrite');
    var reviewsStore = reviewsTX.objectStore('reviews');

    reviews.forEach(review => {
      reviewsStore.put(review);
    });
    return reviewsTX.complete;
  });
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = Date(review.updatedAt);
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  //Add delete button for new comments
  if (review.id > 30){
    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = 'DELETE';
    let deleteMessage = '';
    deleteButton.addEventListener('click',()=>{
      if(!window.navigator.onLine){
        //if new review has been stored from the server
        if(review.id!==404){
          deleteIDBReview(review.id);
        }else{
          deleteIDBReview(404);
        }
        
        window.addEventListener('online',event => {
          deleteReview(review.id);  
        });
        deleteMessage = 'Review to be deleted in the server once back online. In the meantime, refresh the page, then come back...'
        
      }else{
        //if new review has been stored from the server
        deleteIDBReview(review.id);
        deleteIDBReview(404)
        deleteReview(review.id);
        deleteMessage = 'Comment completely deleted. Refresh the page then come back :)';
      }
      const breakSpace1 = document.createElement('br');
      const breakSpace2 = document.createElement('br');
      const deleteHTML = document.createElement('p');
      deleteHTML.innerHTML = deleteMessage;
      li.appendChild(breakSpace1);
      li.appendChild(breakSpace2);
      li.appendChild(deleteHTML);
    });
    li.appendChild(deleteButton);
  }

  return li;
}

deleteIDBReview = (reviewID) => {
  var reviewsDBPromise = idb.open('reviewsDB').then( updateDB => {
    var reviewsTX = updateDB.transaction('reviews','readwrite');
    var reviewsStore = reviewsTX.objectStore('reviews');
    reviewsStore.delete(reviewID);
    return reviewsTX.complete;
  });
}

deleteReview = (reviewID) => {
  fetch(`https://udacity-reviews-server-ncm.herokuapp.com/reviews/${reviewID}`,{
	      method:'DELETE'
  }).then(response => {
    console.log('###########################################')
	  console.log(response);
  });
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url){
    url = window.location.href;
  }

  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);
  let results = regex.exec(url);
  
  if (!results){
    return null;
  }
  
  if (!results[2]){
    return '';
  }
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
