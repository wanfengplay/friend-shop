// 好友集市（Buddy Shop）前端逻辑 —— 数据存 Supabase
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
      email: '邮箱',
      password: '密码',
      nickname: '昵称',
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
      wishes: '期望',
      wish_hint: '我希望 TA 上架…',
      add_wish: '添加期望',
      wish_list: '大家的期望',
      wish_wants: '想要',
      empty_wish: '还没有期望，快写下你想要什么吧～',
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
      confirm_buy: '确定要购买「{title}」吗？',
      confirm_delete: '确定删除「{title}」吗？',
      check_email: '注册成功！请去邮箱点击确认链接，然后回来登录。',
      login_first: '请先登录',
      published: '上架成功！',
      purchased: '购买成功！',
      gifted: '转赠成功！',
      deleted: '已删除',
      done: '操作成功',
      // 错误
      INSUFFICIENT_POINTS: '积分不足',
      CANT_BUY_OWN: '不能购买自己上架的东西',
      ALREADY_SOLD: '该商品已被买走',
      INVALID_STATE: '当前状态无法执行该操作',
      FORBIDDEN: '没有权限',
      NOT_FOUND: '不存在',
      USER_NOT_FOUND: '找不到该用户',
      CANT_GIFT_SELF: '不能转赠给自己',
      INVALID_INPUT: '请检查填写内容',
      SERVER_ERROR: '出错了，请重试',
      invalid_credentials: '邮箱或密码错误',
      email_taken: '该邮箱已注册',
    },
    en: {
      app_name: 'Buddy Shop',
      auth_sub: 'A tiny marketplace for you and your friends',
      login: 'Log in',
      register: 'Sign up',
      logout: 'Log out',
      email: 'Email',
      password: 'Password',
      nickname: 'Nickname',
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
      wishes: 'Wishes',
      wish_hint: 'I wish my partner would offer…',
      add_wish: 'Add wish',
      wish_list: "Everyone's wishes",
      wish_wants: 'wants',
      empty_wish: 'No wishes yet — write what you want!',
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
      confirm_buy: 'Buy "{title}"?',
      confirm_delete: 'Delete "{title}"?',
      check_email: 'Signed up! Check your email to confirm, then log in.',
      login_first: 'Please log in first',
      published: 'Published!',
      purchased: 'Purchased!',
      gifted: 'Sent!',
      deleted: 'Deleted',
      done: 'Done',
      INSUFFICIENT_POINTS: 'Not enough points',
      CANT_BUY_OWN: "You can't buy your own listing",
      ALREADY_SOLD: 'Already sold',
      INVALID_STATE: "Can't do that in this state",
      FORBIDDEN: 'No permission',
      NOT_FOUND: 'Not found',
      USER_NOT_FOUND: 'User not found',
      CANT_GIFT_SELF: "Can't send points to yourself",
      INVALID_INPUT: 'Please check your input',
      SERVER_ERROR: 'Something went wrong',
      invalid_credentials: 'Wrong email or password',
      email_taken: 'Email already registered',
    },
  };

  const state = {
    supabase: null,
    user: null,        // auth 用户
    profile: null,     // 我的资料（昵称、积分）
    profiles: [],      // 所有用户资料
    items: [],         // 所有商品
    orders: [],        // 我的订单
    txs: [],           // 我的积分流水
    wishes: [],        // 期望清单
    lang: localStorage.getItem('cs_lang') || 'zh',
    page: 'market',
    orderTab: 'bought',
  };

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const t = (key) => (I18N[state.lang] && I18N[state.lang][key]) || key;
  const tt = (key, vars) => {
    let s = t(key);
    if (vars) for (const k in vars) s = s.replace('{' + k + '}', vars[k]);
    return s;
  };
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---------------- Toast ----------------
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.remove('hidden');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.add('hidden'), 2400);
  }

  // ---------------- 错误映射 ----------------
  const KNOWN_CODES = ['INSUFFICIENT_POINTS', 'CANT_BUY_OWN', 'ALREADY_SOLD', 'INVALID_STATE', 'FORBIDDEN', 'NOT_FOUND', 'USER_NOT_FOUND', 'CANT_GIFT_SELF', 'INVALID_INPUT'];
  function errCode(err) {
    const m = (err && (err.message || err.error_description || err.msg)) || '';
    for (const c of KNOWN_CODES) if (m.indexOf(c) >= 0) return c;
    return null;
  }
  function authErrCode(err) {
    const m = (err && err.message) || '';
    if (/invalid login/i.test(m)) return 'invalid_credentials';
    if (/already registered|already been registered/i.test(m)) return 'email_taken';
    return null;
  }
  function showErr(err) {
    toast(t(errCode(err) || authErrCode(err) || 'SERVER_ERROR'));
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
  function orderStatusLabel(s) { return t('order_' + s) || s; }
  function nick(id) {
    const p = state.profiles.find((x) => x.id === id);
    return p ? p.nickname : '?';
  }

  function renderMarket() {
    const list = $('#market-list');
    const active = state.items.filter((i) => i.status === 'active');
    $('#market-empty').classList.toggle('hidden', active.length > 0);
    if (active.length === 0) { $('#market-empty').textContent = t('empty_market'); list.innerHTML = ''; return; }
    list.innerHTML = active.map((i) => {
      const mine = state.user && i.seller_id === state.user.id;
      return `
      <div class="card item-card">
        <div class="item-title">${esc(i.title)}</div>
        ${i.description ? `<div class="item-desc">${esc(i.description)}</div>` : ''}
        <div class="item-meta">
          ${priceBadge(i)}
          <span class="seller-name">${t('seller')} · ${esc(nick(i.seller_id))}</span>
        </div>
        <div class="action-row">
          ${mine ? `<span class="badge own">${t('my_own')}</span>` : `<button class="btn btn-sm" data-buy="${i.id}">${t('buy')}</button>`}
        </div>
      </div>`;
    }).join('');
    $$('[data-buy]').forEach((b) => b.addEventListener('click', () => buyItem(Number(b.dataset.buy))));
  }

  function renderMyItems() {
    const list = $('#my-items-list');
    const mine = state.items.filter((i) => state.user && i.seller_id === state.user.id);
    if (mine.length === 0) { list.innerHTML = `<div class="empty">${t('empty_items')}</div>`; return; }
    list.innerHTML = mine.map((i) => `
      <div class="card item-card">
        <div class="item-title">${esc(i.title)} ${i.status === 'sold' ? `<span class="badge own">${t('sold')}</span>` : `<span class="badge points">${t('active')}</span>`}</div>
        <div class="item-meta">${priceBadge(i)}</div>
        <div class="action-row"><button class="btn btn-sm btn-danger" data-del="${i.id}">${t('delete')}</button></div>
      </div>`).join('');
    $$('[data-del]').forEach((b) => b.addEventListener('click', () => deleteItem(Number(b.dataset.del))));
  }

  function renderOrders() {
    const list = $('#orders-list');
    const filtered = state.orders.filter((o) => (state.orderTab === 'bought' ? o.buyer_id === state.user.id : o.seller_id === state.user.id));
    $('#orders-empty').classList.toggle('hidden', filtered.length > 0);
    if (filtered.length === 0) { $('#orders-empty').textContent = t('empty_orders'); list.innerHTML = ''; return; }
    const itemTitle = {};
    state.items.forEach((i) => { itemTitle[i.id] = i.title; });
    list.innerHTML = filtered.map((o) => {
      const amount = o.price_type === 'points' ? `🪙 ${o.amount_points}` : (o.price_type === 'money' ? `💴 ¥${Number(o.amount_money).toFixed(2)}` : `🎁 ${esc(o.reward_text)}`);
      const isBuyer = o.buyer_id === state.user.id;
      const counterpart = isBuyer ? `${t('seller')} · ${esc(nick(o.seller_id))}` : `${t('buyer')} · ${esc(nick(o.buyer_id))}`;
      const actions = [];
      if (o.status === 'pending') {
        if (isBuyer && o.price_type === 'money') actions.push(`<button class="btn btn-sm" data-act="pay" data-id="${o.id}">${t('pay')}</button>`);
        if (o.price_type === 'reward') actions.push(`<button class="btn btn-sm green" data-act="complete" data-id="${o.id}">${t('complete')}</button>`);
        actions.push(`<button class="btn btn-sm ghost" data-act="cancel" data-id="${o.id}">${t('cancel')}</button>`);
      } else if (o.status === 'paid' && !isBuyer) {
        actions.push(`<button class="btn btn-sm green" data-act="complete" data-id="${o.id}">${t('complete')}</button>`);
        actions.push(`<button class="btn btn-sm ghost" data-act="cancel" data-id="${o.id}">${t('cancel')}</button>`);
      }
      return `
      <div class="card order-item">
        <div class="order-title">${esc(itemTitle[o.item_id] || '?')}</div>
        <div class="order-meta">${counterpart}</div>
        <div class="order-meta">${t('price_type')}: ${amount}</div>
        <div class="order-meta">${new Date(o.created_at).toLocaleString()} · <span class="tag-status status-${o.status}">${orderStatusLabel(o.status)}</span></div>
        ${actions.length ? `<div class="action-row">${actions.join('')}</div>` : ''}
      </div>`;
    }).join('');
    $$('[data-act]').forEach((b) => b.addEventListener('click', () => orderAction(b.dataset.act, Number(b.dataset.id))));
  }

  function renderPoints() {
    const pts = state.profile ? state.profile.points : 0;
    $('#balance-big').textContent = pts;
    $('#my-points').textContent = '🪙 ' + pts;
    const sel = $('#gift-user');
    const others = state.profiles.filter((p) => state.user && p.id !== state.user.id);
    sel.innerHTML = others.map((p) => `<option value="${esc(p.id)}">${esc(p.nickname)}</option>`).join('');
    if (others.length === 0) sel.innerHTML = '<option value="" disabled>—</option>';
    const list = $('#tx-list');
    if (state.txs.length === 0) { list.innerHTML = `<div class="empty">${t('empty_tx')}</div>`; return; }
    list.innerHTML = state.txs.map((tx) => `
      <div class="card tx-item">
        <div><div class="tx-reason">${esc(tx.reason)}</div><div class="tx-time">${new Date(tx.created_at).toLocaleString()}</div></div>
        <div class="tx-delta ${tx.delta >= 0 ? 'plus' : 'minus'}">${tx.delta >= 0 ? '+' : ''}${tx.delta}</div>
      </div>`).join('');
  }

  function renderWishes() {
    const list = $('#wish-list');
    if (state.wishes.length === 0) {
      list.innerHTML = `<div class="empty">${t('empty_wish')}</div>`;
      return;
    }
    list.innerHTML = state.wishes.map((w) => {
      const mine = state.user && w.user_id === state.user.id;
      return `
      <div class="card wish-item">
        <div class="item-title">💝 ${esc(nick(w.user_id))} ${t('wish_wants')}</div>
        <div class="item-desc">${esc(w.content)}</div>
        ${mine ? `<div class="action-row"><button class="btn btn-sm btn-danger" data-delwish="${w.id}">${t('delete')}</button></div>` : ''}
      </div>`;
    }).join('');
    $$('[data-delwish]').forEach((b) => b.addEventListener('click', () => deleteWish(Number(b.dataset.delwish))));
  }

  function switchPage(page) {
    state.page = page;
    $$('.page').forEach((p) => p.classList.add('hidden'));
    $('#page-' + page).classList.remove('hidden');
    $$('.tab').forEach((tb) => tb.classList.toggle('active', tb.dataset.page === page));
    refreshAll();
  }

  function showApp(show) {
    $('#view-auth').classList.toggle('hidden', show);
    $('#view-app').classList.toggle('hidden', !show);
  }

  // ---------------- 数据 ----------------
  async function refreshAll() {
    if (!state.user) return;
    const s = state.supabase;
    try {
      const [profiles, items, orders, txs, wishes] = await Promise.all([
        s.from('profiles').select('id, nickname, points'),
        s.from('items').select('*').order('id', { ascending: false }),
        s.from('orders').select('*').order('id', { ascending: false }),
        s.from('point_txs').select('*').eq('user_id', state.user.id).order('id', { ascending: false }).limit(100),
        s.from('wishes').select('*').order('id', { ascending: false }),
      ]);
      if (profiles.error) throw profiles.error;
      if (items.error) throw items.error;
      if (orders.error) throw orders.error;
      if (txs.error) throw txs.error;
      if (wishes.error) throw wishes.error;
      state.profiles = profiles.data || [];
      state.items = items.data || [];
      state.orders = orders.data || [];
      state.txs = txs.data || [];
      state.wishes = wishes.data || [];
      const me = state.profiles.find((p) => p.id === state.user.id);
      state.profile = me || { nickname: state.user.user_metadata?.nickname || '', points: 0 };
      renderMarket();
      renderMyItems();
      renderOrders();
      renderPoints();
      renderWishes();
    } catch (e) {
      if (errCode(e) === 'AUTH') { /* ignore */ } else { /* 静默 */ }
    }
  }

  // ---------------- 操作 ----------------
  async function buyItem(id) {
    const item = state.items.find((i) => i.id === id);
    if (!item) return;
    if (!confirm(tt('confirm_buy', { title: item.title }))) return;
    const { error } = await state.supabase.rpc('buy_item', { p_item_id: id });
    if (error) { showErr(error); return; }
    toast(t('purchased'));
    refreshAll();
  }
  async function deleteItem(id) {
    const item = state.items.find((i) => i.id === id);
    if (!confirm(tt('confirm_delete', { title: item ? item.title : '' }))) return;
    const { error } = await state.supabase.from('items').delete().eq('id', id);
    if (error) { showErr(error); return; }
    toast(t('deleted'));
    refreshAll();
  }
  async function orderAction(action, id) {
    const { error } = await state.supabase.rpc('order_action', { p_order_id: id, p_action: action });
    if (error) { showErr(error); return; }
    toast(t('done'));
    refreshAll();
  }
  async function handleSell(e) {
    e.preventDefault();
    const priceType = document.querySelector('input[name="price_type"]:checked').value;
    const body = {
      seller_id: state.user.id,
      title: $('#sell-title').value.trim(),
      description: $('#sell-desc').value.trim(),
      price_type: priceType,
      price_points: 0, price_money: 0, reward_text: '',
    };
    if (priceType === 'points') body.price_points = Number($('#sell-points').value);
    else if (priceType === 'money') body.price_money = Number($('#sell-money').value);
    else body.reward_text = $('#sell-reward').value.trim();
    const { error } = await state.supabase.from('items').insert(body);
    if (error) { showErr(error); return; }
    toast(t('published'));
    e.target.reset();
    $('#field-points').classList.remove('hidden');
    $('#field-money').classList.add('hidden');
    $('#field-reward').classList.add('hidden');
    refreshAll();
    switchPage('market');
  }
  async function handleGift(e) {
    e.preventDefault();
    const to_id = $('#gift-user').value;
    const amount = Number($('#gift-amount').value);
    if (!to_id) return;
    const { error } = await state.supabase.rpc('gift_points', { p_to_id: to_id, p_amount: amount });
    if (error) { showErr(error); return; }
    toast(t('gifted'));
    refreshAll();
  }
  async function handleWish(e) {
    e.preventDefault();
    const content = $('#wish-content').value.trim();
    if (!content) return;
    const { error } = await state.supabase.from('wishes').insert({ user_id: state.user.id, content });
    if (error) { showErr(error); return; }
    e.target.reset();
    toast(t('done'));
    refreshAll();
  }
  async function deleteWish(id) {
    const { error } = await state.supabase.from('wishes').delete().eq('id', id);
    if (error) { showErr(error); return; }
    toast(t('deleted'));
    refreshAll();
  }

  // ---------------- 认证 ----------------
  async function handleLogin(e) {
    e.preventDefault();
    const email = $('#login-email').value.trim();
    const password = $('#login-password').value;
    const { data, error } = await state.supabase.auth.signInWithPassword({ email, password });
    if (error) { toast(t(authErrCode(error) || 'invalid_credentials')); return; }
    state.user = data.user;
    enterApp();
  }
  async function handleRegister(e) {
    e.preventDefault();
    const nickname = $('#reg-nickname').value.trim();
    const email = $('#reg-email').value.trim();
    const password = $('#reg-password').value;
    const { data, error } = await state.supabase.auth.signUp({
      email, password,
      options: { data: { nickname: nickname || email.split('@')[0] } },
    });
    if (error) { toast(t(authErrCode(error) || 'SERVER_ERROR')); return; }
    if (!data.session) {
      toast(t('check_email'));
      $('#tab-login').click();
      return;
    }
    state.user = data.user;
    enterApp();
  }
  async function logout() {
    await state.supabase.auth.signOut().catch(() => {});
    state.user = null; state.profile = null;
    showApp(false);
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
    renderMarket(); renderMyItems(); renderOrders(); renderPoints(); renderWishes();
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
    $('#form-wish').addEventListener('submit', handleWish);
    $('#btn-logout').addEventListener('click', logout);
    $('#btn-lang').addEventListener('click', toggleLang);
    $('#btn-lang-auth').addEventListener('click', toggleLang);

    $$('.tab').forEach((tb) => tb.addEventListener('click', () => switchPage(tb.dataset.page)));
    $('#tab-bought').addEventListener('click', () => { state.orderTab = 'bought'; $('#tab-bought').classList.add('active'); $('#tab-sold').classList.remove('active'); renderOrders(); });
    $('#tab-sold').addEventListener('click', () => { state.orderTab = 'sold'; $('#tab-sold').classList.add('active'); $('#tab-bought').classList.remove('active'); renderOrders(); });

    $$('input[name="price_type"]').forEach((r) => r.addEventListener('change', () => {
      const v = r.value;
      $('#field-points').classList.toggle('hidden', v !== 'points');
      $('#field-money').classList.toggle('hidden', v !== 'money');
      $('#field-reward').classList.toggle('hidden', v !== 'reward');
    }));
  }

  // ---------------- 启动 ----------------
  async function init() {
    const cfg = window.SUPABASE_CONFIG;
    state.supabase = supabase.createClient(cfg.url, cfg.key, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
    bind();
    applyI18n();

    const { data: { user } } = await state.supabase.auth.getUser().catch(() => ({ data: { user: null } }));
    if (user) {
      state.user = user;
      enterApp();
    } else {
      showApp(false);
    }

    // 会话变化监听
    state.supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) { state.user = session.user; enterApp(); }
      else if (event === 'SIGNED_OUT') { state.user = null; showApp(false); }
    });
  }
  init();
})();
