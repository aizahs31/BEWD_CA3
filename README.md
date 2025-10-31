# BEWD CA 3

This is my CA #3 on backend development. This contains the instructions to runt eh server locally on your machine and also understand more about the code I've written!

## Local instructions

To run the server locally, follow these steps:

#### Step - 1

Clone the repository

#### Step - 2

Install the required packages
To do so, run:
`npm install`

#### Step - 3

Create a .env file
The dotenv file must contain the following vars:
`PORT=3000`

Start the server
Run:
`npm run start`

# API URL

https://bewd-ca3-bsvk.onrender.com

# API Endpoints:

## POST /api/events

This endpoint posts a new event in data/events.json
Requires "x-api-key" header for auth

## GET /api/events

This endpoint gets all the events from data/events.json

## PUT /api/events/:id

This endpoint updates the required field of a specific event (requires the id of the event)

## Delete /api/events/:id

This endpoint delets a specific event (requires the id of the event)
