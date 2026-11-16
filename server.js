// 好友集市（Buddy Shop）—— 后端服务器
// 纯 Node.js 实现，使用内置 http + node:sqlite，无需安装任何依赖
// 运行：node server.js   然后手机浏览器打开 http://127.0.0.1:3000

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');

const PORT = Number(process.env.PORT || 3000);
// 本地默认只监听本机（安全）；云端（Render 等会注入 PORT）自动监听所有网卡
const HOST = process.env.HOST || (process.env.PORT ? '0.0.0.0' : '127.0.0.1');
const START_POINTS = 50; // 注册赠送的初始积分，可自行修改

const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DATA_DIR, 'shop.db');
const PUBLIC_DIR = path.join(__dirname, 'public');

fs.mkdirSync(DATA_DIR, { recursive: true });

// ---------------- 数据库 ----------------
const db = new DatabaseSync(DB_PATH);
db.exec(`
  PRAGMA journal_mode = WAL;
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    nickname TEXT NOT NULL,
    points INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    seller_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    price_type TEXT NOT NULL,          -- 'points' | 'money' | 'reward'
    price_points INTEGER DEFAULT 0,    -- 积分价格
    price_money REAL DEFAULT 0,        -- 真钱价格（元）
    reward_text TEXT DEFAULT '',       -- 自定义奖励文字
    status TEXT NOT NULL DEFAULT 'active',  -- 'active' | 'sold'
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    buyer_id INTEGER NOT NULL,
    seller_id INTEGER NOT NULL,
    price_type TEXT NOT NULL,
    amount_points INTEGER DEFAULT 0,
    amount_money REAL DEFAULT 0,
    reward_text TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending',  -- pending | paid | completed | cancelled
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS point_txs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    delta INTEGER NOT NULL,
    reason TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

const now = () => new Date().toISOString();

// ---------------- 工具函数 ----------------
function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(pw, salt, 32).toString('hex');
  return `${salt}:${hash}`;
}
function verifyPassword(pw, stored) {
  const [salt, hash] = stored.split(':');
  const test = crypto.scryptSync(pw, salt, 32).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(test, 'hex'));
}
function newToken() {
  return crypto.randomBytes(24).toString('hex');
}
function getUserByToken(token) {
  if (!token) return null;
  const row = db.prepare('SELECT user_id FROM sessions WHERE token = ?').get(token);
  if (!row) return null;
  return db.prepare('SELECT id, username, nickname, points, created_at FROM users WHERE id = ?').get(row.user_id);
}

// 序列化给前端（去掉密码）
function publicUser(u) {
  return { id: u.id, username: u.username, nickname: u.nickname, points: u.points };
}

function send(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  });
  res.end(body);
}
function ok(res, data) { send(res, 200, { ok: true, ...data }); }
function fail(res, code, error) { send(res, code, { ok: false, error }); }

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (c) => {
      raw += c;
      if (raw.length > 1e6) { req.destroy(); reject(new Error('too large')); }
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); } catch (e) { reject(new Error('bad json')); }
    });
    req.on('error', reject);
  });
}

function addPoints(userId, delta, reason) {
  db.prepare('UPDATE users SET points = points + ? WHERE id = ?').run(delta, userId);
  db.prepare('INSERT INTO point_txs (user_id, delta, reason, created_at) VALUES (?, ?, ?, ?)')
    .run(userId, delta, reason, now());
}

// ---------------- 静态文件 ----------------
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
};
function serveStatic(res, urlPath) {
  let p = urlPath === '/' ? '/index.html' : urlPath;
  const file = path.normalize(path.join(PUBLIC_DIR, p));
  if (!file.startsWith(PUBLIC_DIR)) { res.writeHead(403); res.end('forbidden'); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('not found'); return; }
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

// ---------------- 路由处理 ----------------
async function handle(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const method = req.method;
  const p = url.pathname;

  // CORS 预检
  if (method === 'OPTIONS') { res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, Authorization', 'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS' }); res.end(); return; }

  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const user = getUserByToken(token);
  const auth = (fn) => { if (!user) return fail(res, 401, 'AUTH_REQUIRED'); return fn(); };

  try {
    // ---- 认证 ----
    if (method === 'POST' && p === '/api/register') {
      const b = await readBody(req);
      const username = String(b.username || '').trim();
      const password = String(b.password || '');
      const nickname = String(b.nickname || '').trim() || username;
      if (!username || !password) return fail(res, 400, 'INVALID_INPUT');
      if (username.length > 30 || password.length < 4) return fail(res, 400, 'INVALID_INPUT');
      const exists = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
      if (exists) return fail(res, 409, 'USERNAME_TAKEN');
      const info = db.prepare('INSERT INTO users (username, password, nickname, points, created_at) VALUES (?, ?, ?, 0, ?)')
        .run(username, hashPassword(password), nickname, now());
      const uid = Number(info.lastInsertRowid);
      addPoints(uid, START_POINTS, '注册赠送');
      const tok = newToken();
      db.prepare('INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, ?)').run(tok, uid, now());
      const me = db.prepare('SELECT id, username, nickname, points, created_at FROM users WHERE id = ?').get(uid);
      return ok(res, { token: tok, user: publicUser(me) });
    }

    if (method === 'POST' && p === '/api/login') {
      const b = await readBody(req);
      const username = String(b.username || '').trim();
      const password = String(b.password || '');
      const row = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
      if (!row || !verifyPassword(password, row.password)) return fail(res, 401, 'INVALID_CREDENTIALS');
      const tok = newToken();
      db.prepare('INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, ?)').run(tok, row.id, now());
      return ok(res, { token: tok, user: publicUser(row) });
    }

    if (method === 'POST' && p === '/api/logout') {
      if (token) db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
      return ok(res, {});
    }

    if (method === 'GET' && p === '/api/me') {
      return auth(() => ok(res, { user: publicUser(user) }));
    }

    // ---- 用户列表（用于转赠积分） ----
    if (method === 'GET' && p === '/api/users') {
      return auth(() => {
        const rows = db.prepare('SELECT id, username, nickname, points FROM users ORDER BY id').all();
        return ok(res, { users: rows });
      });
    }

    // ---- 商品 ----
    if (method === 'GET' && p === '/api/items') {
      const rows = db.prepare(`
        SELECT i.id, i.seller_id, i.title, i.description, i.price_type,
               i.price_points, i.price_money, i.reward_text, i.status, i.created_at,
               u.nickname AS seller_name
        FROM items i JOIN users u ON u.id = i.seller_id
        ORDER BY i.id DESC
      `).all();
      const list = rows.map((r) => ({ ...r, is_mine: user ? r.seller_id === user.id : false }));
      return ok(res, { items: list });
    }

    if (method === 'POST' && p === '/api/items') {
      return auth(() => (async () => {
        const b = await readBody(req);
        const title = String(b.title || '').trim();
        const description = String(b.description || '').trim();
        const priceType = b.price_type;
        if (!title) return fail(res, 400, 'INVALID_INPUT');
        if (!['points', 'money', 'reward'].includes(priceType)) return fail(res, 400, 'INVALID_INPUT');
        let pricePoints = 0, priceMoney = 0, rewardText = '';
        if (priceType === 'points') {
          pricePoints = Number(b.price_points);
          if (!Number.isInteger(pricePoints) || pricePoints <= 0) return fail(res, 400, 'INVALID_INPUT');
        } else if (priceType === 'money') {
          priceMoney = Number(b.price_money);
          if (!(priceMoney > 0)) return fail(res, 400, 'INVALID_INPUT');
        } else {
          rewardText = String(b.reward_text || '').trim();
          if (!rewardText) return fail(res, 400, 'INVALID_INPUT');
        }
        const info = db.prepare(`
          INSERT INTO items (seller_id, title, description, price_type, price_points, price_money, reward_text, status, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?)
        `).run(user.id, title, description, priceType, pricePoints, priceMoney, rewardText, now());
        const item = db.prepare('SELECT * FROM items WHERE id = ?').get(Number(info.lastInsertRowid));
        return ok(res, { item });
      })());
    }

    if (method === 'GET' && p === '/api/items/mine') {
      return auth(() => {
        const rows = db.prepare('SELECT * FROM items WHERE seller_id = ? ORDER BY id DESC').all(user.id);
        return ok(res, { items: rows });
      });
    }

    if (method === 'DELETE' && p.startsWith('/api/items/')) {
      return auth(() => {
        const id = Number(p.split('/')[3]);
        const item = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
        if (!item) return fail(res, 404, 'NOT_FOUND');
        if (item.seller_id !== user.id) return fail(res, 403, 'FORBIDDEN');
        db.prepare('DELETE FROM items WHERE id = ?').run(id);
        return ok(res, {});
      });
    }

    // ---- 购买 ----
    if (method === 'POST' && p.startsWith('/api/items/') && p.endsWith('/buy')) {
      return auth(() => {
        const id = Number(p.split('/')[3]);
        const item = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
        if (!item) return fail(res, 404, 'NOT_FOUND');
        if (item.seller_id === user.id) return fail(res, 400, 'CANT_BUY_OWN');
        if (item.status !== 'active') return fail(res, 400, 'ALREADY_SOLD');

        if (item.price_type === 'points') {
          const buyer = user;
          if (buyer.points < item.price_points) return fail(res, 400, 'INSUFFICIENT_POINTS');
          addPoints(buyer.id, -item.price_points, `购买「${item.title}」`);
          addPoints(item.seller_id, item.price_points, `卖出「${item.title}」`);
          db.prepare(`INSERT INTO orders (item_id, buyer_id, seller_id, price_type, amount_points, amount_money, reward_text, status, created_at)
                      VALUES (?, ?, ?, 'points', ?, 0, '', 'completed', ?)`)
            .run(item.id, buyer.id, item.seller_id, item.price_points, now());
          db.prepare("UPDATE items SET status = 'sold' WHERE id = ?").run(item.id);
        } else {
          db.prepare(`INSERT INTO orders (item_id, buyer_id, seller_id, price_type, amount_points, amount_money, reward_text, status, created_at)
                      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)`)
            .run(item.id, user.id, item.seller_id, item.price_type, 0, item.price_money, item.reward_text, now());
          db.prepare("UPDATE items SET status = 'sold' WHERE id = ?").run(item.id);
        }
        return ok(res, {});
      });
    }

    // ---- 订单 ----
    if (method === 'GET' && p === '/api/orders') {
      return auth(() => {
        const rows = db.prepare(`
          SELECT o.*, i.title AS item_title,
                 bu.nickname AS buyer_name, su.nickname AS seller_name
          FROM orders o
          JOIN items i ON i.id = o.item_id
          JOIN users bu ON bu.id = o.buyer_id
          JOIN users su ON su.id = o.seller_id
          WHERE o.buyer_id = ? OR o.seller_id = ?
          ORDER BY o.id DESC
        `).all(user.id, user.id);
        const orders = rows.map((r) => ({ ...r, role: r.buyer_id === user.id ? 'buyer' : 'seller' }));
        return ok(res, { orders });
      });
    }

    if (method === 'POST' && p.startsWith('/api/orders/')) {
      return auth(() => {
        const parts = p.split('/');
        const id = Number(parts[3]);
        const action = parts[4];
        const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
        if (!order) return fail(res, 404, 'NOT_FOUND');

        if (action === 'pay') {
          if (order.buyer_id !== user.id) return fail(res, 403, 'FORBIDDEN');
          if (order.price_type !== 'money' || order.status !== 'pending') return fail(res, 400, 'INVALID_STATE');
          db.prepare("UPDATE orders SET status = 'paid' WHERE id = ?").run(id);
          return ok(res, {});
        }
        if (action === 'complete') {
          const isSeller = order.seller_id === user.id;
          const isBuyer = order.buyer_id === user.id;
          if (!isSeller && !isBuyer) return fail(res, 403, 'FORBIDDEN');
          // 真钱：需已付款且卖家确认；积分已完成无需此步；奖励：买卖双方任意一方确认
          if (order.price_type === 'money' && !isSeller) return fail(res, 403, 'FORBIDDEN');
          if (order.price_type === 'money' && order.status !== 'paid') return fail(res, 400, 'INVALID_STATE');
          if (order.status !== 'pending' && order.status !== 'paid') return fail(res, 400, 'INVALID_STATE');
          db.prepare("UPDATE orders SET status = 'completed' WHERE id = ?").run(id);
          return ok(res, {});
        }
        if (action === 'cancel') {
          if (order.buyer_id !== user.id && order.seller_id !== user.id) return fail(res, 403, 'FORBIDDEN');
          if (order.status !== 'pending' && order.status !== 'paid') return fail(res, 400, 'INVALID_STATE');
          db.prepare("UPDATE orders SET status = 'cancelled' WHERE id = ?").run(id);
          // 商品重新上架（积分即时成交的已完成订单不可取消）
          if (order.price_type !== 'points') {
            db.prepare("UPDATE items SET status = 'active' WHERE id = ?").run(order.item_id);
          }
          return ok(res, {});
        }
        return fail(res, 404, 'NOT_FOUND');
      });
    }

    // ---- 积分 ----
    if (method === 'GET' && p === '/api/points/history') {
      return auth(() => {
        const rows = db.prepare('SELECT * FROM point_txs WHERE user_id = ? ORDER BY id DESC LIMIT 100').all(user.id);
        return ok(res, { txs: rows });
      });
    }

    if (method === 'POST' && p === '/api/points/gift') {
      return auth(() => (async () => {
        const b = await readBody(req);
        const amount = Number(b.amount);
        const toUsername = String(b.to_username || '').trim();
        if (!Number.isInteger(amount) || amount <= 0) return fail(res, 400, 'INVALID_INPUT');
        const to = db.prepare('SELECT * FROM users WHERE username = ?').get(toUsername);
        if (!to) return fail(res, 404, 'USER_NOT_FOUND');
        if (to.id === user.id) return fail(res, 400, 'CANT_GIFT_SELF');
        if (user.points < amount) return fail(res, 400, 'INSUFFICIENT_POINTS');
        addPoints(user.id, -amount, `转赠给 ${to.nickname}`);
        addPoints(to.id, amount, `收到 ${user.nickname} 的转赠`);
        return ok(res, {});
      })());
    }

    // ---- 静态资源 ----
    if (method === 'GET') return serveStatic(res, p);

    return fail(res, 404, 'NOT_FOUND');
  } catch (e) {
    console.error(e);
    return fail(res, 500, 'SERVER_ERROR');
  }
}

const server = http.createServer(handle);
server.listen(PORT, HOST, () => {
  console.log('');
  console.log('  🛍️  好友集市（Buddy Shop）已启动');
  console.log('  📱 手机浏览器打开：http://127.0.0.1:' + PORT);
  console.log('  📡 监听地址：' + HOST + ':' + PORT + (HOST === '127.0.0.1' ? '（仅本机，安全）' : ''));
  console.log('  停止：Ctrl + C');
  console.log('');
});
