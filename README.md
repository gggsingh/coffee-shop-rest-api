# Coffee Shop API

This project is a simple Node.js and Express application that uses Zod for input validation. It provides API endpoints for retrieving a coffee shop menu and placing orders.

## Project Structure

```
coffee-shop-rest-api
├── src
│   ├── [server.js]     # Main entry point of the application
│   ├── [app.js]        # Main application route logic
│   └── test
│       └── test.js     # Unit tests for the application
├── Dockerfile          # Dockerfile for building the application image
├── [package.json]      # npm configuration file
└── [README.md]         # Project documentation
```

## Setup Instructions

1. **Clone the repository**:

   ```bash
   git clone https://github.com/gggsingh/coffee-shop-rest-api
   cd coffee-shop-rest-api
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Run the application**:

   ```bash
   npm start
   ```

   The application will be running at `http://localhost:3000`.

## Docker Setup

To build and run the application using Docker:

1. **Build the Docker image**:

   ```bash
   docker build -t coffee-shop-api .
   ```

2. **Run the Docker container**:

   ```bash
   docker run -p 3000:3000 coffee-shop-api
   ```

## API Endpoints

- **GET /menu**: Retrieves the list of menu items.
  ```json
  [
    {
      "id": "1",
      "name": "Espresso",
      "price": 3.0,
      "imageFileName": "espresso.jpg"
    },
    {
      "id": "2",
      "name": "Latte",
      "price": 4.0,
      "imageFileName": "latte.jpg"
    },
    {
      "id": "3",
      "name": "Cappuccino",
      "price": 4.5,
      "imageFileName": "cappuccino.jpg"
    }
  ]
  ```
- **GET /menu/:id**: Retrieves the details of a specific menu item.
  ```json
  {
    "id": "1",
    "name": "Espresso",
    "price": 3.0,
    "imageFileName": "espresso.jpg",
    "description": "Espresso is not merely a drink; it is a cultural phenomenon woven into the very fabric of daily life."
  }
  ```
- **GET /loyalty/:loyaltyNumber**: Retrieves the balance of a loyalty account.
  ```json
  {
    "balance": 100
  }
  ```
- **GET /order/search**: Searches for orders by name, orderId, or loyaltyNumber. Accepts query parameters:
  ```json
  {
    "name": "John Doe",
    "orderId": "order-id",
    "loyaltyNumber": "1234567890"
  }
  ```
- **POST /order**: Places a new order. Requires a JSON body with the following structure:
  ```json
  {
    "items": [1, 2],
    "loyaltyNumber": "1234567890",
    "name": "John Doe"
  }
  ```
- **POST /loyalty**: Creates a new loyalty account. Requires a JSON body with the following structure:
  ```json
  {
    "name": "Jane Doe",
    "loyaltyNumber": "9876543210",
    "balance": 50
  }
  ```
- **PUT /order/:orderId**: Updates an existing order. Requires a JSON body with the following structure:
  ```json
  {
    "items": [1, 2],
    "loyaltyNumber": "1234567890",
    "name": "John Doe"
  }
  ```
- **PUT /loyalty/:loyaltyNumber**: Updates the balance of a loyalty account. Requires a JSON body with the following structure:
  ```json
  {
    "balance": 100
  }
  ```

## Running Tests

To run the unit tests, use the following command:

```bash
npm test
```
