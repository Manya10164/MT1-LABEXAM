import express from 'express';

const app = express();
const PORT = 4000;

app.use(express.json());

let foods = [
  { id: 1, foodName: 'Pizza', category: 'Fast Food', price: 250, availability: true },
  { id: 2, foodName: 'Burger', category: 'Fast Food', price: 150, availability: true },
  { id: 3, foodName: 'Pasta', category: 'Italian', price: 200, availability: false }
];

const requiredFields = ['id', 'foodName', 'category', 'price', 'availability'];

const isPositiveNumber = (value) => typeof value === 'number' && value > 0;

app.get('/foods', (req, res) => {
  res.status(200).json(foods);
});

app.get('/foods/:id', (req, res) => {
  const food = foods.find((item) => item.id === Number(req.params.id));

  if (!food) {
    return res.status(404).json({ error: 'Food item not found' });
  }

  res.status(200).json(food);
});

app.post('/foods', (req, res) => {
  const newFood = req.body;

  const missingFields = requiredFields.filter((field) => newFood[field] === undefined);

  if (missingFields.length > 0) {
    return res.status(400).json({ error: 'Missing required fields', missingFields });
  }

  if (!isPositiveNumber(newFood.price)) {
    return res.status(400).json({ error: 'Price must be a positive number' });
  }

  if (foods.some((item) => item.id === newFood.id)) {
    return res.status(400).json({ error: 'Food with this id already exists' });
  }

  foods.push(newFood);
  res.status(201).json({ message: 'Food item added successfully', food: newFood });
});

app.put('/foods/:id', (req, res) => {
  const index = foods.findIndex((item) => item.id === Number(req.params.id));

  if (index === -1) {
    return res.status(404).json({ error: 'Food item not found' });
  }

  const { foodName, category, price, availability } = req.body;

  if (price !== undefined && !isPositiveNumber(price)) {
    return res.status(400).json({ error: 'Price must be a positive number' });
  }

  const updatedFood = {
    ...foods[index],
    ...(foodName !== undefined && { foodName }),
    ...(category !== undefined && { category }),
    ...(price !== undefined && { price }),
    ...(availability !== undefined && { availability })
  };

  foods[index] = updatedFood;
  res.status(200).json({ message: 'Food item updated successfully', food: updatedFood });
});

app.delete('/foods/:id', (req, res) => {
  const index = foods.findIndex((item) => item.id === Number(req.params.id));

  if (index === -1) {
    return res.status(404).json({ error: 'Food item not found' });
  }

  const [deletedFood] = foods.splice(index, 1);
  res.status(200).json({ message: 'Food item deleted successfully', food: deletedFood });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Express Server running at http://localhost:${PORT}`);
});