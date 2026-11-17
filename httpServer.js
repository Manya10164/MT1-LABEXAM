import http from 'http';
import fs from 'fs';

const PORT = 3000;

const foods = [
  { id: 1, foodName: 'Pizza', category: 'Fast Food', price: 250, availability: true },
  { id: 2, foodName: 'Burger', category: 'Fast Food', price: 150, availability: true },
  { id: 3, foodName: 'Pasta', category: 'Italian', price: 200, availability: false }
];

const requiredFields = ['id', 'foodName', 'category', 'price', 'availability'];

const sendJSON = (res, statusCode, data) => {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
};

const sendHTML = (res, statusCode, html) => {
  res.writeHead(statusCode, { 'Content-Type': 'text/html' });
  res.end(html);
};

const handleAddFood = (req, res) => {
  let body = '';

  req.on('data', (chunk) => {
    body += chunk.toString();
  });

  req.on('end', () => {
    let newFood;

    try {
      newFood = JSON.parse(body);
    } catch (error) {
      return sendJSON(res, 400, { error: 'Invalid JSON' });
    }

    const missingFields = requiredFields.filter((field) => newFood[field] === undefined);

    if (missingFields.length > 0) {
      return sendJSON(res, 400, {
        error: 'Missing required fields',
        missingFields
      });
    }

    foods.push(newFood);
    sendJSON(res, 201, { message: 'Food item added successfully', food: newFood });
  });
};

const server = http.createServer((req, res) => {
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);
  const method = req.method;

  if (method === 'GET' && pathname === '/') {
    sendHTML(
      res,
      200,
      '<h1>Welcome to Tasty Bites Restaurant</h1><p>Fresh food delivered to your door.</p>'
    );
  } else if (method === 'GET' && pathname === '/foods') {
    const availableFoods = foods.filter((food) => food.availability === true);
    sendJSON(res, 200, availableFoods);
  } else if (method === 'GET' && pathname === '/about') {
    sendHTML(
      res,
      200,
      '<h1>About Us</h1><p>Tasty Bites has served fast food, Italian dishes and beverages since 2020.</p>'
    );
  } else if (method === 'GET' && pathname === '/menu') {
    fs.readFile(new URL('./public/menu.html', import.meta.url), (err, data) => {
      if (err) {
        return sendJSON(res, 500, { error: 'Unable to read menu file' });
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  } else if (method === 'POST' && pathname === '/add-food') {
    handleAddFood(req, res);
  } else {
    sendJSON(res, 404, { error: 'Route not found' });
  }
});

server.listen(PORT, () => {
  console.log(`HTTP Server running at http://localhost:${PORT}`);
});