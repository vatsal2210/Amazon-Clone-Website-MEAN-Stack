# ece9065-vshah56-lab5
Web Technologies - Lab5

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
 
Node JS:

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
		
	
Angular:
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
		
		