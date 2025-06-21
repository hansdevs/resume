# CS 2410 Final Project: Showtime!

## Course Information
- **Course:** CS 2410
- **Semester:** Fall 2024
- **Instructor:** Dr. Chad Mano

## Author
- **Name:** Hans Gamlien

## Project Summary
**Final Project: Showtime!**

This is the moment you've been waiting for. This final assignment is the Final Project for the semester. It is worth 200 points, which is twice that of a regular assignment. Note that the syllabus listed this as 15% of your grade. That is approximate, but very close. This is part of the Assignments portion of your grade, which makes it so Assignment Grace points can apply here as well.

You can do everything that is required! This will take some time, but it is not as big as it seems at first glance. There is a lot of code that can be reused or slightly modified to meet all requirements.

## Objectives
- Build a large-scale project
- Transitions and animations
- Responsive Design
- Your creativity

## Getting Ready
There is a little bit of setup you need to do for this project. Make sure to review the starter code. There's a lot of stuff to help make the network communication easy. We went over this in class on 11/18, so you can review the recording for help. Here's a shortened version of what we covered. Note: I changed up how the code is organized so the starter code doesn't match this, but it'll still work for the explanation.

### Get the Starter Code
This will work for you right away, but complete the Account Setup step before using it. If you don't do that you may run into problems if others skip the step and suddenly the limit of API requests is hit. You'll want to become very familiar with this code. It does almost all of the network communication you'll need. You will need to add three calls, but you can do this by just following the pattern in the starter code.

- **Starter Code:** [CS2410 Demo Code](https://bitbucket.org/cmano/cs2410-demo-code/src/master/Final%20Project/)
- **API Documentation:** [The Movie Database API](https://developer.themoviedb.org/reference/intro/getting-started)

### Account Setup
We'll be using a free API for this assignment, but you do need to create an account to be able to use it. We'll be using a service at [The Movie Database](https://www.themoviedb.org).

1. Create an account: [Sign Up](https://www.themoviedb.org/signup)
2. Go to your Account Settings Page
3. Click the API menu item on the left
4. Create a new API Key.
5. Choose Education in the drop down.
6. Put N/A for the URL
7. Put this for your summary: "I am in a class where we're learning web programming with network APIs. We are building a simple app to search for movies."
8. Fill out the rest of the info.
9. Your API key will appear on the page where you clicked to create a new key.
10. Replace the value on line 2 of the `api.js` file in the starter code.

## Requirements
Read this section carefully. I would keep referring to a specific section as you are building.

### Files
Your program will show the following pages:
- **Dashboard:** main landing page/start page for your program. It should be in a file called `index.html`
- **Movies:** A page that shows a collection of movies. This can be the result of a search, trending, etc.
- **TV Shows:** A page that shows a collection of television shows. This can be the result of a search, trending, etc.
- **People:** A page that shows a collection of people. This can be the result of a search, trending, etc.
- **Movie:** A page that shows an individual movie.
- **Series:** A page that shows a single TV Series.
- **Person:** A page that shows an individual person.

You should use the `api.js` file included in the starter code. You may modify it if you wish, but other than changing the API key it is not necessary.

### All Pages
- Appropriate titles, copy (written content), section headers.
- Fixed Navigation
    - This should be at the top of the screen.
    - It should not scroll.
    - With our limited functionality there isn't much on this bar, but add stuff so it looks official.
    - It should have an icon somewhere indicating a menu can be opened.
- Animated Navigation Menu
    - A navigation menu should open somehow. It does not (and really should not) have to be exactly the one we did in class. Use your creativity. The principles are the same.
    - The following menu items should be included
        - Dashboard/Home
        - Movies
        - Television
        - People
    - The menu items should take people to those specific pages.
    - If you are currently on a page, you should not navigate to the page by clicking.
    - Use icons as part of the menu.

### Dashboard Page
- Search Bar that starts as empty when navigating to the page.
- Movie, Television, and People sections.
    - Sections should be filled with popular or some other data. Popular is what is included in the starter code.
    - No need to show tons of results for each section. Just something reasonable. No need to scroll or show more.
    - Cards should show each movie with the following information:
        - **Movie**
            - Title
            - Picture
            - Year released
            - Vote Average
        - **TV**
            - Title
            - Picture
            - First Aired Date
            - Vote Average
        - **Person**
            - Name
            - Picture

### Searching
Users should be able to search in 4 modes. You can decide how to do this, but a nice looking dropdown box or something might be good. Think about things you've seen before that do this. (Maybe Amazon?)

#### Modes
- **All:** Results should show on the Dashboard page with each section showing the appropriate results
- **Movies:** Navigate to the Movies page and show results. The search query should be included in the search bar for that page.
- **TV:** Navigate to the TV page and show results. The search query should be included in the search bar for that page.
- **People:** Navigate to the People page and show results. The search query should be included in the search bar for that page.

### Movies, TV, and People Pages
- Search Bar
    - Starts as empty if navigating from the menu. Show popular or some other general results.
    - Starts with a string if navigating from a search
    - Only show the appropriate type of media on this page.
    - Show multiple rows of cards (same info as cards as Dashboard, but can look different if you'd like. Larger might be good).

### Additional Pages
- Give the user the ability to see more results if they are available (see JSON object for info on number of pages)
    - You can have next and previous buttons which would erase all content and only show the current page
    - You can also have a More button at the bottom of results if there are more pages. Then just add new cards to the bottom.
    - You can pick how to do this.
    - You should not be able to try to view pages that don't exist (ex. If there are 6 pages of results, you should not have the option to go to page 7).

### Searching
If the search function is used, the Card area should re-populate with the results of the search. The additional pages should function the same way.

### Interacting with Cards
- When hovering over a card, some kind of animation/transition should occur to indicate that card is being hovered over. It can grow, wiggle, spin, or anything.
- When a card is clicked you should navigate to an individual page for that media that will be populated with the item from the card.
- When you click there should be some kind of animation that visual indicates a click happened.

### Movie Page
Make a nice profile page for the Movie

#### Include
- Picture
- Title
- Release Date
- Overview
- Runtime
- Vote Average

#### Image Gallery
Choose One
- **Manual**
    - Show one image at a time
    - Use Next and Previous buttons. Buttons should not work if there is no next or previous.
    - Use a transition between images
- **Scrolling (10 bonus points for this)**
    - Make an image gallery of the movie posters
    - It should scroll automatically
    - Nothing to click on or control
    - If there are not enough images to fill the screen, duplicate images to fill the screen or window where you're showing the images.
    - The gallery size should be at least 3x's the width of a single image (at least 3 images should be showing at once).

#### Credits
Make a list of the people credited in the movie. You can choose how it appears. Use the Credits API under the Movie category.

#### Include
- Picture
- Name
- Character

No need to sort or anything. Just do this in the order given. Clicking on the credit should take you to a Person page for that individual.

### Series Page
Make a nice profile page for the TV Series

#### Include
- Picture
- Title
- Years running (ex. 2012-2016)
- Number of seasons
- Number of episodes
- Vote Average
- Overview

#### Credits
Make a list of the people credited in the series. You can choose how it appears. Use the Credits API under the TV Series category.

#### Include
- Picture
- Name
- Character played

No need to sort or anything. Just do this in the order given. Clicking on the credit should take you to a Person page for that individual.

### Person Page
Make a nice profile page for the person

#### Include
- Picture
- Name
- Birthday
- Death Date (if applicable)
- Birthplace
- Biography

#### Credit History
Make a list of their Combined Credits. Use the Combined Credits API under the People section.

#### Show
- Image (like the poster)
- Release date
- Character named

No need to sort or anything. Just do this in the order given. Clicking on the credit should take you to a Movie or TV page. Note: keep track of the media_type value. Ignore anything that isn't movie or tv.

### Styling
Make something you'll be proud of!

- Every visible element should have some kind of styling. (This is the most important)
- Remember about box shadows to give your app depth.
- Anything clickable should give some indication when hovering over it. This means more than just the cursor change.
- Anything that is clicked should give some visual indication that it is clicked.
- Borders, backgrounds, font, etc should be included.
- Each page should have a title on the tab
- Each page should have an appropriate heading/title on the actual page
- Add text/descriptions so each page has appropriate meaning for the user
- Margins and padding should be used.
- Don't forget that the navigation bar should be on every page.

### Hints and Resources
- Notice how the Movies, TV, and People pages are very similar. Once you build one, the rest are almost done already.
- Think about creating elements. Make it very easy to make new elements such as the cards.
- Remember that if you include many scripts in your HTML that the scripts can access things that are in other scripts. It's like importing in python or java.
- You don't need a CSS file for every page. There will be lots of common stuff, so put that in a single css file.

### Submit
You should zip up your ENTIRE project folder. Please make sure to zip the entire folder and not just the contents of the folder. Upload your submission to Canvas. Keep in mind, it might take a minute to upload and submit so if you are submitting right at the due time you will be in trouble.