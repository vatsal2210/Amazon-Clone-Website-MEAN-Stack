# Amazon Clone Website with MEAN Stack

## Description
Develop a web application for a storefront that allows browsing items, creating, editing and saving a
shopping cart, simulate purchasing items, managing a wish list and sharing it with other users and
commenting on items.

Use of Node.js and Angular v7 is required. Other technologies may include Mongodb and Express or any
alternatives that suit you better.

## Stack:

Node js - 8.10.0
Angular CLI - 7.0.7
MongoDB shell version - v3.6.0
 
## Requirements (70 points)

1. Authentication method: { total 10 points }

- Local authentication which uses email as the username and require a password. { 4 points }
- Input validation for email (proper format). { 1 point }
- Password stored using a hashing algorithm that is resistant to brute force attacks (e.g. bcrypt). { 1 point }
- Verification of of email (see References). { 3 points }
- If the account is marked as deactivated, show a message asking to contact the store manager and not allow logging in: { 1 point }

2. Limited functionality for unauthenticated users: { total 10 points }

- Start page showing application name, a short “about” blurb that says what the site offers, and login button. { 2 points }
- List of purchasable items (up to 10) ordered by popularity (e.g. number of users who bought that item or average rating). { 3 points }
- Ability to browse the entire catalogue of items: { 2 points }
- Clicking on an item shows a description about the item and price at the time of click. Live updates are not necessary. { 1 point }
- Item description includes upto 5 comments. Comments must show the rating, the comment and commentor’s username: { 2 points }

3. Additional functionality for authenticated users: { total 26 points }

- Add items to a shopping cart: { 1 point }
- Remove items in the shopping cart: { 1 point }
- Change quantities of items in the shopping cart: { 1 point }
- Clear the shopping cart: { 1 point }
- A ‘Buy’ button to simulate the purchase of items in the shopping cart: { 1 point }
- Ensure that item stock levels are updated through every action above: { 4 points }
- Add a comment and a rating (1-5 stars) to any item: { 4 points }
- Create a list of items and quantities with a name, a description and a visibility setting of “private” (default) or “public”: { 6 points }
- Edit all aspects of an own item collection: { 2 points }
- View, delete or rename own item collections: { 2 points }
- View item collections from other users that are marked as “public”: { 3 points }

4. Store manager functionality related to store maintenance: { total 16 points }
- Special user with store manager access: { 2 points }
- Ability to grant store manager privilege to one or more existing users: { 2 points }
- Ability to add/modify/delete items, quantities and prices: { 6 points }
- Ability to mark a comment as hidden: { 2 points }
- Ability to mark a user as “deactivated”: { 2 points }

5. Web service API: { total 10 points }
- Provide an API that has at least four nouns (URLs) and at least 8 separate noun+ HTTP verb combinations. You must have at least two nouns that support two or more verbs. { 8 points }
- Build your application using this API. { 2 points }

6. Usability and code quality: { up to -24 points }
- Resistant to HTML and JavaScript injection attacks: { up to -2 point }
- Able to handle user input in any language: { up to -2 point }
- Usability of the application on multiple browsers and form factors. { up to -2 point }
- Modular code that is easily extensible and maintainable. { up to -2 point } E.g. Changes to operational parameters such as server names, port numbers etc should not cause changes in code.
- Avoid code duplication. { up to -2 point } E.g. Full URLs that are duplicated in calls to ReST api
- Avoid hard-coded literals in code. { up to -5 points } E.g. Hard-coded port numbers, URLS
- Frequent git commits with meaningful comments { up to -2 points }
- Sufficient and meaningful comments in code { up to -2 points }
- Proper precautions in saving user information { up to -5 points } 
 
## Node JS:

server.js
models:
	cart.js			- store all user cart details	
	collection.js	- customize collection list for all users	
	order.js		- final order
	product.js		- product list
	review.js		- review and comment of product
	token.js		- token to activate account
	user.js			- user details
route:
	module.js	
		- files included

	account.js
		- /api/signup
		- /api/login
		- /api/confirmation/:token
		- /api/updateprofile
		
	admin.js
		- /admin/getProducts
		- /admin/product (add / update)
		- /admin/deleteProduct
		- /admin/getUsers
		- /admin/changeUserStatus
		- /admin/changeManagerStatus
		- /admin/commentStatus
		
	collection.js
		- /api/collections
		- /api/usercollection
		- /api/addCollection
		- /api/collectionDetails/:id
		- /api/updateCollection
		- /api/updateCollectionProduct
		- /api/deleteCollection	
		
	products.js	
		- /api/products			
		- /api/findProduct/:id 
		- /api/review 
		
	user.js
		- /api/profile (dashboard)
		- /admin		(dashboard)
		- /api/cart
		- /api/order
		- /api/addtocart
		- /api/removeProduct
		- /api/clearCart
		- /api/orderCart
		
	
## Angular:
	Services:
		- alert.service
		- restapi.service
		- user.service
		
	Components:
		- admin
			- users
			- products
		- alert
		- cart
		- collection
		- home
		- login
		- manager
		- profile
		- regestration
		

## Resources

Token Authentication:
URL: https://codemoto.io/coding/nodejs/email-verification-node-express-mongodb

NavBar Header:
https://www.w3schools.com/bootstrap4/bootstrap_navbar.asp

E-commerce View:
https://mdbootstrap.com/docs/angular/sections/e-commerce/#APIref

Validation:
https://www.w3resource.com/javascript/form/email-validation.php

Checkbox:
https://stackoverflow.com/questions/34997128/angular-2-get-values-of-multiple-checked-checkboxes
https://mdbootstrap.com/docs/angular/advanced/carousel/#multi-item-carousel		
