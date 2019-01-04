# Mobile Web Specialist Certification Course Project
---
#### _Three Stage Course Material Project - Restaurant Reviews_
A demo of the client of this application can be found at the following url:
- https://udacity-reviews-client-ncm.herokuapp.com/

A demo of the server of this application can be found at the following url:
- https://udacity-reviews-server-ncm.herokuapp.com/restaurants

For the respective repositories in git, see the following links:
- (Client) https://github.com/nmatos46/mws-restaurant-stage-1
- (Server) https://github.com/nmatos46/mws-restaurant-stage-3

Note that this application requires the following installations:
- Node.js: https://nodejs.org/en/download/
- Node Package Manager (npm): https://www.npmjs.com/get-npm
- Express.js (Once npm is installed, run the command 'npm install --save express')

If this repository is cloned from git, it can be run locally with npm using the following command in your terminal:
'npm start'

#Original Udacity Readme~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
---
## Udacity Project Overview: Stage 1

For the **Restaurant Reviews** projects, you will incrementally convert a static webpage to a mobile-ready web application. In **Stage One**, you will take a static design that lacks accessibility and convert the design to be responsive on different sized displays and accessible for screen reader use. You will also add a service worker to begin the process of creating a seamless offline experience for your users.

### Specification

You have been provided the code for a restaurant reviews website. The code has a lot of issues. It’s barely usable on a desktop browser, much less a mobile device. It also doesn’t include any standard accessibility features, and it doesn’t work offline at all. Your job is to update the code to resolve these issues while still maintaining the included functionality. 

### What do I do from here?

1. In this folder, start up a simple HTTP server to serve up the site files on your local computer. Python has some simple tools to do this, and you don't even need to know Python. For most people, it's already installed on your computer. 

In a terminal, check the version of Python you have: `python -V`. If you have Python 2.x, spin up the server with `python -m SimpleHTTPServer 9000` (or some other port, if port 8000 is already in use.) For Python 3.x, you can use `python3 -m http.server 9000`. If you don't have Python installed, navigate to Python's [website](https://www.python.org/) to download and install the software.

2. With your server running, visit the site: `http://localhost:9000`, and look around for a bit to see what the current experience looks like.
3. Explore the provided code, and make start making a plan to implement the required features in three areas: responsive design, accessibility and offline use.
4. Write code to implement the updates to get this site on its way to being a mobile-ready website.

### Note about ES6

Most of the code in this project has been written to the ES6 JavaScript specification for compatibility with modern web browsers and future proofing JavaScript code. As much as possible, try to maintain use of ES6 in any additional JavaScript you write. 



