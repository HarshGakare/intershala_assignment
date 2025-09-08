
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { nanoid } from 'nanoid';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();
app.use(cors());
app.use(bodyParser.json());

const DB_FILE = path.join(__dirname, 'db.json');
const adapter = new JSONFile(DB_FILE);
const db = new Low(adapter);
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_key';
const TOKEN_EXPIRES_IN = '7d';

async function initDB(){
  await db.read();
  db.data ||= { users: [], items: [], carts: [] };
  // seed if empty
  if(db.data.items.length === 0){
    db.data.items.push(
      { id: nanoid(), name: 'Blue T-Shirt', price: 19.99, category: 'clothing', description: 'Comfortable cotton tee' },
      { id: nanoid(), name: 'Coffee Mug', price: 9.99, category: 'home', description: 'Ceramic mug 350ml' },
      { id: nanoid(), name: 'Headphones', price: 59.99, category: 'electronics', description: 'Over-ear headphones' }
    );
    await db.write();
  }
}

function authMiddleware(req, res, next){
  const auth = req.headers.authorization;
  if(!auth) return res.status(401).json({ message: 'Missing Authorization' });
  const parts = auth.split(' ');
  if(parts.length !== 2) return res.status(401).json({ message: 'Malformed token' });
  const token = parts[1];
  try{
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; 
    next();
  }catch(err){
    return res.status(401).json({ message: 'Invalid token' });
  }
}


app.post('/auth/signup', async (req, res) =>{
  const { email, password, name } = req.body;
  if(!email || !password) return res.status(400).json({ message: 'email/password required' });
  await db.read();
  const exists = db.data.users.find(u => u.email === email);
  if(exists) return res.status(400).json({ message: 'user exists' });
  const hashed = await bcrypt.hash(password, 10);
  const newUser = { id: nanoid(), email, password: hashed, name: name || '' };
  db.data.users.push(newUser);
  await db.write();
  const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
  return res.json({ token, user: { id: newUser.id, email: newUser.email, name: newUser.name } });
});


app.post('/auth/login', async (req, res) =>{
  const { email, password } = req.body;
  await db.read();
  const user = db.data.users.find(u => u.email === email);
  if(!user) return res.status(400).json({ message: 'invalid credentials' });
  const ok = await bcrypt.compare(password, user.password);
  if(!ok) return res.status(400).json({ message: 'invalid credentials' });
  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
  return res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});


app.post('/items', authMiddleware, async (req, res) =>{
  const { name, price, category, description } = req.body;
  if(!name || !price) return res.status(400).json({ message: 'name & price required' });
  await db.read();
  const item = { id: nanoid(), name, price: Number(price), category: category || 'uncategorized', description: description || '' };
  db.data.items.push(item);
  await db.write();
  res.json(item);
});


app.get('/items', async (req, res) =>{
  const { q, min, max, category, sort } = req.query;
  await db.read();
  let items = [...db.data.items];
  if(q) items = items.filter(it => it.name.toLowerCase().includes(q.toLowerCase()) || (it.description||'').toLowerCase().includes(q.toLowerCase()));
  if(category) items = items.filter(it => it.category === category);
  if(min) items = items.filter(it => it.price >= Number(min));
  if(max) items = items.filter(it => it.price <= Number(max));
  if(sort === 'price_asc') items = items.sort((a,b)=>a.price-b.price);
  if(sort === 'price_desc') items = items.sort((a,b)=>b.price-a.price);
  res.json(items);
});


app.get('/items/:id', async (req, res) =>{
  await db.read();
  const it = db.data.items.find(i => i.id === req.params.id);
  if(!it) return res.status(404).json({ message: 'not found' });
  res.json(it);
});


app.put('/items/:id', authMiddleware, async (req, res) =>{
  await db.read();
  const it = db.data.items.find(i => i.id === req.params.id);
  if(!it) return res.status(404).json({ message: 'not found' });
  Object.assign(it, req.body);
  await db.write();
  res.json(it);
});


app.delete('/items/:id', authMiddleware, async (req, res) =>{
  await db.read();
  db.data.items = db.data.items.filter(i => i.id !== req.params.id);
  await db.write();
  res.json({ ok: true });
});



app.get('/cart', authMiddleware, async (req, res) => {
  await db.read();
  const cart = db.data.carts.find(c => c.userId === req.user.id) || { userId: req.user.id, items: [] };

  
  const expanded = cart.items.map(ci => {
    const it = db.data.items.find(i => i.id === ci.itemId);
    return it
      ? { itemId: ci.itemId, qty: ci.qty, item: { ...it } }  
      : { itemId: ci.itemId, qty: ci.qty, item: null }; 
  });

  res.json({ userId: cart.userId, items: expanded });
});


app.post('/cart/add', authMiddleware, async (req, res) =>{
  const { itemId, qty } = req.body;
  if(!itemId) return res.status(400).json({ message: 'itemId required' });
  await db.read();
  let cart = db.data.carts.find(c => c.userId === req.user.id);
  if(!cart){ cart = { userId: req.user.id, items: [] }; db.data.carts.push(cart); }
  const existing = cart.items.find(i => i.itemId === itemId);
  if(existing) existing.qty += Number(qty || 1);
  else cart.items.push({ itemId, qty: Number(qty || 1) });
  await db.write();
  res.json({ ok: true, cart });
});

app.post('/cart/remove', authMiddleware, async (req, res) =>{
  const { itemId } = req.body;
  if(!itemId) return res.status(400).json({ message: 'itemId required' });
  await db.read();
  let cart = db.data.carts.find(c => c.userId === req.user.id);
  if(!cart) return res.json({ ok: true });
  cart.items = cart.items.filter(i => i.itemId !== itemId);
  await db.write();
  res.json({ ok: true, cart });
});


app.put('/cart', authMiddleware, async (req, res) =>{
  const { items } = req.body;
  await db.read();
  let cart = db.data.carts.find(c => c.userId === req.user.id);
  if(!cart){ cart = { userId: req.user.id, items: [] }; db.data.carts.push(cart); }
  cart.items = items || [];
  await db.write();
  res.json({ ok: true, cart });
});


initDB().then(()=>{
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, ()=> console.log('Backend running on', PORT));
}).catch(err=> console.error(err));
