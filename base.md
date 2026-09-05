This is a marketplace website sells car parts. This website is used as a catalog only and no payment is integrated here. 
User : 
- basic user, normal entry path no login
- admin user, admin entry path should require login registered thru database only.

Spec :
- monolith apps, no separate backend API calls.
- allows user for photo uploading
- can use react/angular/any framework, or even no framework. AI agent is free to chose.

## Requirement for basic user 
- User can look all the products.
- User can filter the products based on brand, type, year, model.
- User can sort the proeudts based on price
- User can add products to cart
- From cart, user can checkout and gets redirected to whatsapp.
- when user click a product, they get into detail page which will have the picture and details.

## Requirement for admin user
- User should be able to login using username and password
- Admin page should also able to manage admin users
- admin can add other user and remove user
- There should be at least one admin user, so cannot delete the last admin.
- admin can add a product details and photos.
- photos uploaded by admin should be in a draft state, once user click publish only the product should be shown.
- admin should also be able to change published image to draft or delete published image.
- admin should be able to change the whatsapp number which will be targeted whatsapp.

## Additional Details

### Product details : 
- title
- description
- price
- ref. no
- brand
- type
- year
- model
- can go directly to whatsapp

### Whatsapp details :
- once user redirected to whatsapp, whatsapp message will attach the model, ref. no and title as message.
- full message :
```
Hai admin, mau bertanya terkait barang-barang berikut ini :
- <title> | <model> | <ref-No>
- <title> | <model> | <ref-No>
```

## Additional Clarification need to be fixed
- use firebase or just normal folder storage?
- should we use framework or go with basic html css javascript only?