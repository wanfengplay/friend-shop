// 好友集市 前端逻辑
(function () {
  'use strict';

  // ---------------- 双语字典 ----------------
  const I18N = {
    zh: {
      app_name: '好友集市',
      auth_sub: '朋友之间的小小购物集市',
      login: '登录',
      register: '注册',
      logout: '退出',
      username: '用户名（登录用）',
      password: '密码',
      nickname: '昵称',
      username_login: '用户名',
      market: '市场',
      sell: '上架',
      orders: '订单',
      points: '积分',
      bought: '我买到的',
      sold_tab: '我卖出的',
      item_title: '标题',
      item_desc: '描述（可选）',
      price_type: '结算方式',
      type_points: '积分',
      type_money: '真钱',
      type_reward: '自定义奖励',
      price_points: '价格（积分）',
      price_money: '价格（元）',
      reward_text: '奖励内容',
      publish: '上架',
      my_items: '我上架的东西',
      my_balance: '我的积分',
      gift_points: '转赠积分给 TA',
      to_user: '转给谁',
      amount: '数量',
      send: '转赠',
      tx_history: '积分记录',
      empty_market: '还没有东西，快来上架第一件吧～',
      empty_orders: '还没有订单',
      empty_items: '还没上架任何东西',
      empty_tx: '还没有积分记录',
      buy: '购买',
      my_own: '我上架的',
      delete: '删除',
      pay: '我已转账',
      complete: '确认完成',
      cancel: '取消',
      sold: '已卖出',
      active: '在售',
      price_points_short: '积分',
      price_money_short: '元',
      seller: '卖家',
      buyer: '买家',
      order_pending: '待处理',
      order_paid: '已付款',
      order_completed: '已完成',
      order_cancelled: '已取消',
      registered_bonus: '注册赠送',
      gift_to: '转赠给',
      gift_from: '收到',
      sell_gain: '卖出「',
      buy_spend: '购买「',
      confirm_buy: '确定要购买「{title}」吗？',
      confirm_delete: '确定删除「{title}」吗？',
      // 错误
      AUTH_REQUIRED: '请先登录',
      INVALID_CREDENTIALS: '用户名或密码错误',
      USERNAME_TAKEN: '该用户名已被占用',
      INVALID_INPUT: '请检查填写内容',
      NOT_FOUND: '不存在',
      FORBIDDEN: '没有权限',
      INSUFFICIENT_POINTS: '积分不足',
      CANT_BUY_OWN: '不能购买自己上架的东西',
      ALREADY_SOLD: '该商品已被买走',
      INVALID_STATE: '当前状态无法执行该操作',
      USER_NOT_FOUND: '找不到该用户',
      CANT_GIFT_SELF: '不能转赠给自己',
      SERVER_ERROR: '服务器出错了',
      loading: '加载中…',
    },
    en: {
      app_name: 'Buddy Shop',
      auth_sub: 'A tiny marketplace for you and your friends',
      login: 'Log in',
      register: 'Sign up',
      logout: 'Log out',
      username: 'Username',
      password: 'Password',
      nickname: 'Nickname',
      username_login: 'Username',
      market: 'Market',
      sell: 'Sell',
      orders: 'Orders',
      points: 'Points',
      bought: 'Bought',
      sold_tab: 'Sold',
      item_title: 'Title',
      item_desc: 'Description (optional)',
      price_type: 'Payment',
      type_points: 'Points',
      type_money: 'Money',
      type_reward: 'Custom reward',
      price_points: 'Price (points)',
      price_money: 'Price (¥)',
      reward_text: 'Reward',
      publish: 'Publish',
      my_items: 'My listings',
      my_balance: 'My points',
      gift_points: 'Send points to partner',
      to_user: 'To',
      amount: 'Amount',
      send: 'Send',
      tx_history: 'Point history',
      empty_market: 'Nothing here yet — list the first thing!',
      empty_orders: 'No orders yet',
      empty_items: 'No listings yet',
      empty_tx: 'No point history yet',
      buy: 'Buy',
      my_own: 'My listing',
      delete: 'Delete',
      pay: "I've paid",
      complete: 'Mark done',
      cancel: 'Cancel',
      sold: 'Sold',
      active: 'Active',
      price_points_short: 'pts',
      price_money_short: '¥',
      seller: 'Seller',
      buyer: 'Buyer',
      order_pending: 'Pending',
      order_paid: 'Paid',
      order_completed: 'Completed',
      order_cancelled: 'Cancelled',
      registered_bonus: 'Sign-up bonus',
      gift_to: 'Sent to',
      gift_from: 'Received from',
      sell_gain: 'Sold "',
      buy_spend: 'Bought "',
      confirm_buy: 'Buy "{title}"?',
      confirm_delete: 'Delete "{title}"?',
      AUTH_REQUIRED: 'Please log in first',
      INVALID_CREDENTIALS: 'Wrong username or password',
      USERNAME_TAKEN: 'Username already taken',
      INVALID_INPUT: 'Please check your input',
      NOT_FOUND: 'Not found',
      FORBIDDEN: 'No permission',
      INSUFFICIENT_POINTS: 'Not enough points',
      CANT_BUY_OWN: "You can't buy your own listing",
      ALREADY_SOLD: 'Already sold',
      INVALID_STATE: "Can't do that in this state",
      USER_NOT_FOUND: 'User not found',
      CANT_GIFT_SELF: "Can't send points to yourself",
      SERVER_ERROR: 'Server error',
      loading: 'Loading…',
    },
  };

  const state = {
    token: localStorage.getItem('cs_token') || '',
    user: null,
    lang: localStorage.getItem('cs_lang') || 'zh',
    page: 'market',
    items: [],
    orders: [],
    orderTab: 'bought',
    users: [],
    txs: [],
  };

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const t = (key) => (I18N[state.lang] && I18N[state.lang][key]) || key;
  const tt = (key, vars) => {
    let s = t(key);
    if (vars) for (const k in vars) s = s.replace('{' + k + '}', vars[k]);
    return s;
  };

  // ---------------- API ----------------
  async function api(method, path, body) {
    const opts = { method, headers: {} };
    if (state.token) opts.headers['Authorization'] = 'Bearer ' + state.token;
    if (body !== undefined) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
    const res = await fetch(path, opts);
    let data = {};
    try { data = await res.json(); } catch (e) {}
    if (!data.ok) {
      const err = new Error(t(data.error || 'SERVER_ERROR'));
      err.code = data.error;
      throw err;
    }
    return data;
  }

  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.remove('hidden');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.add('hidden'), 2200);
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // ---------------- 渲染 ----------------
  function applyI18n() {
    $$('[data-i18n]').forEach((el) => { el.textContent = t(el.getAttribute('data-i18n')); });
    document.documentElement.lang = state.lang;
    document.title = t('app_name');
    $('#btn-lang').textContent = state.lang === 'zh' ? 'EN' : '中文';
    $('#btn-lang-auth').textContent = state.lang === 'zh' ? 'EN / 中文' : '中文 / EN';
  }

  function priceBadge(item) {
    if (item.price_type === 'points') return `<span class="badge points">🪙 ${item.price_points} ${t('price_points_short')}</span>`;
    if (item.price_type === 'money') return `<span class="badge money">💴 ¥${Number(item.price_money).toFixed(2)}</span>`;
    return `<span class="badge reward">🎁 ${esc(item.reward_text)}</span>`;
  }

  function orderStatusLabel(s) {
    return t('order_' + s) || s;
  }

  function renderMarket() {
    const list = $('#market-list');
    const active = state.items.filter((i) => i.status === 'active');
    $('#market-empty').classList.toggle('hidden', active.length > 0);
    if (active.length === 0) {
      $('#market-empty').textContent = t('empty_market');
      list.innerHTML = '';
      return;
    }
    list.innerHTML = active.map((i) => `
      <div class="card item-card">
        <div class="item-title">${esc(i.title)}</div>
        ${i.description ? `<div class="item-desc">${esc(i.description)}</div>` : ''}
        <div class="item-meta">
          ${priceBadge(i)}
          <span class="seller-name">${t('seller')} · ${esc(i.seller_name)}</span>
        </div>
        <div class="action-row">
          ${i.is_mine
            ? `<span class="badge own">${t('my_own')}</span>`
            : `<button class="btn btn-sm" data-buy="${i.id}">${t('buy')}</button>`}
        </div>
      </div>
    `).join('');
    $$('[data-buy]').forEach((b) => b.addEventListener('click', () => buyItem(Number(b.dataset.buy))));
  }

  function renderMyItems() {
    const list = $('#my-items-list');
    if (state.items.length === 0) {
      list.innerHTML = `<div class="empty">${t('empty_items')}</div>`;
      return;
    }
    list.innerHTML = state.items.map((i) => `
      <div class="card item-card">
        <div class="item-title">${esc(i.title)} ${i.status === 'sold' ? `<span class="badge own">${t('sold')}</span>` : `<span class="badge points">${t('active')}</span>`}</div>
        <div class="item-meta">${priceBadge(i)}</div>
        <div class="action-row">
          <button class="btn btn-sm btn-danger" data-del="${i.id}">${t('delete')}</button>
        </div>
      </div>
    `).join('');
    $$('[data-del]').forEach((b) => b.addEventListener('click', () => deleteItem(Number(b.dataset.del))));
  }

  function renderOrders() {
    const list = $('#orders-list');
    const filtered = state.orders.filter((o) => (state.orderTab === 'bought' ? o.role === 'buyer' : o.role === 'seller'));
    $('#orders-empty').classList.toggle('hidden', filtered.length > 0);
    if (filtered.length === 0) {
      $('#orders-empty').textContent = t('empty_orders');
      list.innerHTML = '';
      return;
    }
    list.innerHTML = filtered.map((o) => {
      const amount = o.price_type === 'points' ? `🪙 ${o.amount_points}` : (o.price_type === 'money' ? `💴 ¥${Number(o.amount_money).toFixed(2)}` : `🎁 ${esc(o.reward_text)}`);
      const counterpart = o.role === 'buyer' ? `${t('seller')} · ${esc(o.seller_name)}` : `${t('buyer')} · ${esc(o.buyer_name)}`;
      const actions = [];
      if (o.status === 'pending') {
        if (o.role === 'buyer' && o.price_type === 'money') actions.push(`<button class="btn btn-sm" data-act="pay" data-id="${o.id}">${t('pay')}</button>`);
        if (o.price_type === 'reward') actions.push(`<button class="btn btn-sm green" data-act="complete" data-id="${o.id}">${t('complete')}</button>`);
        actions.push(`<button class="btn btn-sm ghost" data-act="cancel" data-id="${o.id}">${t('cancel')}</button>`);
      } else if (o.status === 'paid' && o.role === 'seller') {
        actions.push(`<button class="btn btn-sm green" data-act="complete" data-id="${o.id}">${t('complete')}</button>`);
        actions.push(`<button class="btn btn-sm ghost" data-act="cancel" data-id="${o.id}">${t('cancel')}</button>`);
      }
      return `
        <div class="card order-item">
          <div class="order-title">${esc(o.item_title)}</div>
          <div class="order-meta">${counterpart}</div>
          <div class="order-meta">${t('price_type')}: ${amount}</div>
          <div class="order-meta">${new Date(o.created_at).toLocaleString()} · <span class="tag-status status-${o.status}">${orderStatusLabel(o.status)}</span></div>
          ${actions.length ? `<div class="action-row">${actions.join('')}</div>` : ''}
        </div>
      `;
    }).join('');
    $$('[data-act]').forEach((b) => b.addEventListener('click', () => orderAction(b.dataset.act, Number(b.dataset.id))));
  }

  function renderPoints() {
    $('#balance-big').textContent = state.user ? state.user.points : 0;
    $('#my-points').textContent = '🪙 ' + (state.user ? state.user.points : 0);
    // 转赠下拉
    const sel = $('#gift-user');
    const others = state.users.filter((u) => u.id !== state.user.id);
    sel.innerHTML = others.map((u) => `<option value="${esc(u.username)}">${esc(u.nickname)}（${esc(u.username)}）</option>`).join('');
    if (others.length === 0) sel.innerHTML = '<option value="" disabled>—</option>';
    // 积分记录
    const list = $('#tx-list');
    if (state.txs.length === 0) {
      list.innerHTML = `<div class="empty">${t('empty_tx')}</div>`;
      return;
    }
    list.innerHTML = state.txs.map((tx) => `
      <div class="card tx-item">
        <div>
          <div class="tx-reason">${esc(tx.reason)}</div>
          <div class="tx-time">${new Date(tx.created_at).toLocaleString()}</div>
        </div>
        <div class="tx-delta ${tx.delta >= 0 ? 'plus' : 'minus'}">${tx.delta >= 0 ? '+' : ''}${tx.delta}</div>
      </div>
    `).join('');
  }

  function switchPage(page) {
    state.page = page;
    $$('.page').forEach((p) => p.classList.add('hidden'));
    $('#page-' + page).classList.remove('hidden');
    $$('.tab').forEach((tb) => tb.classList.toggle('active', tb.dataset.page === page));
    if (page === 'points') refreshUsers();
    if (page === 'market') refreshAll();
    if (page === 'orders') refreshAll();
    if (page === 'sell') refreshAll();
  }

  function showApp(show) {
    $('#view-auth').classList.toggle('hidden', show);
    $('#view-app').classList.toggle('hidden', !show);
  }

  // ---------------- 数据刷新 ----------------
  async function refreshAll() {
    try {
      const me = await api('GET', '/api/me');
      state.user = me.user;
      const d1 = await api('GET', '/api/items');
      state.items = d1.items;
      const d2 = await api('GET', '/api/orders');
      state.orders = d2.orders;
      const d3 = await api('GET', '/api/points/history');
      state.txs = d3.txs;
      renderMarket();
      renderMyItems();
      renderOrders();
      renderPoints();
    } catch (e) {
      if (e.code === 'AUTH_REQUIRED') { logout(false); } else toast(e.message);
    }
  }

  async function refreshUsers() {
    try {
      const d = await api('GET', '/api/users');
      state.users = d.users;
      renderPoints();
    } catch (e) { /* ignore */ }
  }

  // ---------------- 操作 ----------------
  async function buyItem(id) {
    const item = state.items.find((i) => i.id === id);
    if (!item) return;
    if (!confirm(tt('confirm_buy', { title: item.title }))) return;
    try {
      await api('POST', '/api/items/' + id + '/buy');
      toast(state.lang === 'zh' ? '购买成功！' : 'Purchased!');
      refreshAll();
    } catch (e) { toast(e.message); }
  }

  async function deleteItem(id) {
    const item = state.items.find((i) => i.id === id);
    if (!confirm(tt('confirm_delete', { title: item ? item.title : '' }))) return;
    try {
      await api('DELETE', '/api/items/' + id);
      toast(state.lang === 'zh' ? '已删除' : 'Deleted');
      refreshAll();
    } catch (e) { toast(e.message); }
  }

  async function orderAction(action, id) {
    try {
      await api('POST', '/api/orders/' + id + '/' + action);
      toast(state.lang === 'zh' ? '操作成功' : 'Done');
      refreshAll();
    } catch (e) { toast(e.message); }
  }

  async function handleLogin(e) {
    e.preventDefault();
    const username = $('#login-username').value.trim();
    const password = $('#login-password').value;
    try {
      const d = await api('POST', '/api/login', { username, password });
      state.token = d.token; state.user = d.user;
      localStorage.setItem('cs_token', d.token);
      enterApp();
    } catch (err) { toast(err.message); }
  }

  async function handleRegister(e) {
    e.preventDefault();
    const username = $('#reg-username').value.trim();
    const password = $('#reg-password').value;
    const nickname = $('#reg-nickname').value.trim();
    try {
      const d = await api('POST', '/api/register', { username, password, nickname });
      state.token = d.token; state.user = d.user;
      localStorage.setItem('cs_token', d.token);
      enterApp();
    } catch (err) { toast(err.message); }
  }

  async function handleSell(e) {
    e.preventDefault();
    const priceType = document.querySelector('input[name="price_type"]:checked').value;
    const body = {
      title: $('#sell-title').value.trim(),
      description: $('#sell-desc').value.trim(),
      price_type: priceType,
    };
    if (priceType === 'points') body.price_points = Number($('#sell-points').value);
    else if (priceType === 'money') body.price_money = Number($('#sell-money').value);
    else body.reward_text = $('#sell-reward').value.trim();
    try {
      await api('POST', '/api/items', body);
      toast(state.lang === 'zh' ? '上架成功！' : 'Published!');
      e.target.reset();
      $('#field-points').classList.remove('hidden');
      $('#field-money').classList.add('hidden');
      $('#field-reward').classList.add('hidden');
      refreshAll();
      switchPage('market');
    } catch (err) { toast(err.message); }
  }

  async function handleGift(e) {
    e.preventDefault();
    const to_username = $('#gift-user').value;
    const amount = Number($('#gift-amount').value);
    try {
      await api('POST', '/api/points/gift', { to_username, amount });
      toast(state.lang === 'zh' ? '转赠成功！' : 'Sent!');
      refreshAll(); refreshUsers();
    } catch (err) { toast(err.message); }
  }

  function logout(toastMsg = true) {
    if (state.token) api('POST', '/api/logout').catch(() => {});
    state.token = ''; state.user = null;
    localStorage.removeItem('cs_token');
    showApp(false);
    if (toastMsg) toast(state.lang === 'zh' ? '已退出登录' : 'Logged out');
  }

  function enterApp() {
    showApp(true);
    switchPage('market');
    refreshAll();
  }

  function toggleLang() {
    state.lang = state.lang === 'zh' ? 'en' : 'zh';
    localStorage.setItem('cs_lang', state.lang);
    applyI18n();
    renderMarket(); renderMyItems(); renderOrders(); renderPoints();
  }

  // ---------------- 事件绑定 ----------------
  function bind() {
    $('#tab-login').addEventListener('click', () => {
      $('#tab-login').classList.add('active'); $('#tab-register').classList.remove('active');
      $('#form-login').classList.remove('hidden'); $('#form-register').classList.add('hidden');
    });
    $('#tab-register').addEventListener('click', () => {
      $('#tab-register').classList.add('active'); $('#tab-login').classList.remove('active');
      $('#form-register').classList.remove('hidden'); $('#form-login').classList.add('hidden');
    });
    $('#form-login').addEventListener('submit', handleLogin);
    $('#form-register').addEventListener('submit', handleRegister);
    $('#form-sell').addEventListener('submit', handleSell);
    $('#form-gift').addEventListener('submit', handleGift);
    $('#btn-logout').addEventListener('click', () => logout());
    $('#btn-lang').addEventListener('click', toggleLang);
    $('#btn-lang-auth').addEventListener('click', toggleLang);

    $$('.tab').forEach((tb) => tb.addEventListener('click', () => switchPage(tb.dataset.page)));
    $('#tab-bought').addEventListener('click', () => { state.orderTab = 'bought'; $('#tab-bought').classList.add('active'); $('#tab-sold').classList.remove('active'); renderOrders(); });
    $('#tab-sold').addEventListener('click', () => { state.orderTab = 'sold'; $('#tab-sold').classList.add('active'); $('#tab-bought').classList.remove('active'); renderOrders(); });

    // 结算方式切换
    $$('input[name="price_type"]').forEach((r) => r.addEventListener('change', () => {
      const v = r.value;
      $('#field-points').classList.toggle('hidden', v !== 'points');
      $('#field-money').classList.toggle('hidden', v !== 'money');
      $('#field-reward').classList.toggle('hidden', v !== 'reward');
    }));
  }

  // ---------------- 启动 ----------------
  function init() {
    bind();
    applyI18n();
    if (state.token) {
      api('GET', '/api/me').then((d) => { state.user = d.user; enterApp(); }).catch(() => showApp(false));
    } else {
      showApp(false);
    }
  }
  init();
})();
