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
      my: '我的',
      edit_profile: '编辑资料',
      avatar: '头像',
      save: '保存',
      my_orders: '我的订单',
      points_center: '积分中心',
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
      delisted: '已下架',
      delist: '下架',
      relist: '重新上架',
      comments: '评论',
      add_comment: '发表评论',
      comment_ph: '说点什么…',
      send_comment: '发送',
      empty_comments: '还没有评论',
      confirm_receipt: '确认收货',
      chat: '讲价',
      service: '客服',
      send_msg: '发送',
      msg_ph: '和卖家聊聊，砍砍价…',
      empty_chat: '还没有消息，发一句打个招呼吧',
      tasks: '任务',
      new_task: '发布任务',
      task_title: '任务标题',
      task_desc: '任务描述（可选）',
      task_points: '奖励积分',
      publish_task: '发布',
      take: '接单',
      task_done: '确认完成',
      task_open: '待接单',
      task_taken: '进行中',
      task_done_st: '已完成',
      task_cancelled: '已取消',
      empty_tasks: '还没有任务，发布一个让 TA 赚积分吧',
      admin_grant: '发积分（管理员）',
      grant: '发放',
      price_points_short: '积分',
      price_money_short: '元',
      seller: '卖家',
      buyer: '买家',
      me: '我',
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
      CANT_TAKE_OWN: '不能接自己发布的任务',
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
      my: 'My',
      edit_profile: 'Edit profile',
      avatar: 'Avatar',
      save: 'Save',
      my_orders: 'My orders',
      points_center: 'Points center',
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
      delisted: 'Delisted',
      delist: 'Delist',
      relist: 'Relist',
      comments: 'Comments',
      add_comment: 'Add comment',
      comment_ph: 'Say something…',
      send_comment: 'Send',
      empty_comments: 'No comments yet',
      confirm_receipt: 'Confirm receipt',
      chat: 'Chat',
      service: 'Service',
      send_msg: 'Send',
      msg_ph: 'Chat with the seller, make an offer…',
      empty_chat: 'No messages yet',
      tasks: 'Tasks',
      new_task: 'Post task',
      task_title: 'Task title',
      task_desc: 'Description (optional)',
      task_points: 'Reward points',
      publish_task: 'Post',
      take: 'Take',
      task_done: 'Mark done',
      task_open: 'Open',
      task_taken: 'In progress',
      task_done_st: 'Done',
      task_cancelled: 'Cancelled',
      empty_tasks: 'No tasks yet',
      admin_grant: 'Grant points (admin)',
      grant: 'Grant',
      price_points_short: 'pts',
      price_money_short: '¥',
      seller: 'Seller',
      buyer: 'Buyer',
      me: 'Me',
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
    comments: [],      // 评论
    commentOpenId: null, // 当前展开评论的商品 id
    messages: [],      // 私聊消息（讲价）
    chatItemId: null,  // 当前打开的讲价商品 id
    tasks: [],         // 任务
    isAdmin: false,    // 是否是管理员
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

  const AVATARS = ['😊','😍','🥰','😎','🤩','😜','🤗','😇','🦄','🐱','🐶','🐰','🐻','🦊','🐼','🐨','🌸','🍀','⭐','🌈','🔥','💎','🍰','🎮','🎧','⚽','📚','🎨'];

  // ---------------- Toast ----------------
  function toast(msg) {
    const el = $('#toast');
    el.textContent = msg;
    el.classList.remove('hidden');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => el.classList.add('hidden'), 2400);
  }

  // ---------------- 错误映射 ----------------
  const KNOWN_CODES = ['INSUFFICIENT_POINTS', 'CANT_BUY_OWN', 'ALREADY_SOLD', 'INVALID_STATE', 'FORBIDDEN', 'NOT_FOUND', 'USER_NOT_FOUND', 'CANT_GIFT_SELF', 'CANT_TAKE_OWN', 'INVALID_INPUT'];
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
      const itemComments = state.comments.filter((c) => c.item_id === i.id);
      const open = state.commentOpenId === i.id;
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
          <button class="btn btn-sm ghost" data-comment-toggle="${i.id}">💬 ${itemComments.length}</button>
          <button class="btn btn-sm ghost" data-chat="${i.id}">${mine ? '🛎️ ' + t('service') : '🤝 ' + t('chat')}</button>
        </div>
        ${open ? `
        <div class="comment-box">
          ${itemComments.length === 0 ? `<div class="empty">${t('empty_comments')}</div>` : itemComments.map((c) => {
            const mineC = state.user && c.user_id === state.user.id;
            return `<div class="comment-item">
              <div class="comment-head"><span class="comment-nick">${esc(nick(c.user_id))}</span><span class="comment-time">${new Date(c.created_at).toLocaleString()}</span>${mineC ? `<button class="btn btn-sm btn-danger" data-delcomment="${c.id}">${t('delete')}</button>` : ''}</div>
              <div class="comment-content">${esc(c.content)}</div>
            </div>`;
          }).join('')}
          <div class="comment-input-row">
            <input id="comment-input-${i.id}" type="text" maxlength="200" placeholder="${t('comment_ph')}">
            <button class="btn btn-sm" data-addcomment="${i.id}">${t('send_comment')}</button>
          </div>
        </div>` : ''}
      </div>`;
    }).join('');
    $$('[data-buy]').forEach((b) => b.addEventListener('click', () => buyItem(Number(b.dataset.buy))));
    $$('[data-comment-toggle]').forEach((b) => b.addEventListener('click', () => toggleComments(Number(b.dataset.commentToggle))));
    $$('[data-chat]').forEach((b) => b.addEventListener('click', () => openChat(Number(b.dataset.chat))));
    $$('[data-addcomment]').forEach((b) => b.addEventListener('click', () => addComment(Number(b.dataset.addcomment))));
    $$('[data-delcomment]').forEach((b) => b.addEventListener('click', () => deleteComment(Number(b.dataset.delcomment))));
  }

  function renderMyItems() {
    const list = $('#my-items-list');
    const mine = state.items.filter((i) => state.user && i.seller_id === state.user.id);
    if (mine.length === 0) { list.innerHTML = `<div class="empty">${t('empty_items')}</div>`; return; }
    list.innerHTML = mine.map((i) => {
      const statusBadge = i.status === 'sold' ? `<span class="badge own">${t('sold')}</span>` : (i.status === 'delisted' ? `<span class="badge own">${t('delisted')}</span>` : `<span class="badge points">${t('active')}</span>`);
      const actions = [];
      if (i.status === 'active') actions.push(`<button class="btn btn-sm ghost" data-setstatus="${i.id}" data-status="delisted">${t('delist')}</button>`);
      if (i.status === 'delisted') actions.push(`<button class="btn btn-sm green" data-setstatus="${i.id}" data-status="active">${t('relist')}</button>`);
      actions.push(`<button class="btn btn-sm btn-danger" data-del="${i.id}">${t('delete')}</button>`);
      return `
      <div class="card item-card">
        <div class="item-title">${esc(i.title)} ${statusBadge}</div>
        <div class="item-meta">${priceBadge(i)}</div>
        <div class="action-row">${actions.join('')}</div>
      </div>`;
    }).join('');
    $$('[data-del]').forEach((b) => b.addEventListener('click', () => deleteItem(Number(b.dataset.del))));
    $$('[data-setstatus]').forEach((b) => b.addEventListener('click', () => setItemStatus(Number(b.dataset.setstatus), b.dataset.status)));
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
        if (isBuyer && o.price_type === 'reward') actions.push(`<button class="btn btn-sm green" data-act="confirm" data-id="${o.id}">${t('confirm_receipt')}</button>`);
        actions.push(`<button class="btn btn-sm ghost" data-act="cancel" data-id="${o.id}">${t('cancel')}</button>`);
      } else if (o.status === 'paid' && isBuyer) {
        actions.push(`<button class="btn btn-sm green" data-act="confirm" data-id="${o.id}">${t('confirm_receipt')}</button>`);
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
    const prof = state.profile || {};
    const pts = prof.points || 0;
    $('#balance-big').textContent = pts;
    $('#my-points').textContent = '🪙 ' + pts;
    $('#my-points-big').textContent = pts;
    $('#my-nickname').textContent = prof.nickname || '—';
    $('#my-avatar').textContent = prof.avatar || '😊';
    const others = state.profiles.filter((p) => state.user && p.id !== state.user.id);
    const sel = $('#gift-user');
    sel.innerHTML = others.map((p) => `<option value="${esc(p.id)}">${esc(p.nickname)}</option>`).join('');
    if (others.length === 0) sel.innerHTML = '<option value="" disabled>—</option>';
    const gsel = $('#grant-user');
    gsel.innerHTML = others.map((p) => `<option value="${esc(p.id)}">${esc(p.nickname)}</option>`).join('');
    $('#form-grant').classList.toggle('hidden', !state.isAdmin);
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

  function renderTasks() {
    const list = $('#tasks-list');
    if (state.tasks.length === 0) { list.innerHTML = `<div class="empty">${t('empty_tasks')}</div>`; return; }
    const statusLabel = { open: t('task_open'), taken: t('task_taken'), done: t('task_done_st'), cancelled: t('task_cancelled') };
    list.innerHTML = state.tasks.map((task) => {
      const mine = state.user && task.creator_id === state.user.id;
      const takenByMe = state.user && task.taker_id === state.user.id;
      const actions = [];
      if (task.status === 'open' && !mine) actions.push(`<button class="btn btn-sm green" data-take="${task.id}">${t('take')}</button>`);
      if (task.status === 'taken' && mine) actions.push(`<button class="btn btn-sm green" data-tdone="${task.id}">${t('task_done')}</button>`);
      if ((task.status === 'open' && mine) || (task.status === 'taken' && (mine || takenByMe))) actions.push(`<button class="btn btn-sm ghost" data-tcancel="${task.id}">${t('cancel')}</button>`);
      return `
      <div class="card item-card">
        <div class="item-title">${esc(task.title)} <span class="badge points">🪙 ${task.points}</span></div>
        ${task.description ? `<div class="item-desc">${esc(task.description)}</div>` : ''}
        <div class="item-meta">
          <span class="seller-name">${esc(nick(task.creator_id))}${task.taker_id ? ' → ' + esc(nick(task.taker_id)) : ''}</span>
          <span class="tag-status status-${task.status}">${statusLabel[task.status]}</span>
        </div>
        ${actions.length ? `<div class="action-row">${actions.join('')}</div>` : ''}
      </div>`;
    }).join('');
    $$('[data-take]').forEach((b) => b.addEventListener('click', () => takeTask(Number(b.dataset.take))));
    $$('[data-tdone]').forEach((b) => b.addEventListener('click', () => completeTask(Number(b.dataset.tdone))));
    $$('[data-tcancel]').forEach((b) => b.addEventListener('click', () => cancelTask(Number(b.dataset.tcancel))));
  }

  function renderChat() {
    const item = state.chatItemId ? state.items.find((i) => i.id === state.chatItemId) : null;
    if (!item) return;
    $('#chat-title').textContent = item.title;
    const msgs = state.messages.filter((m) => m.item_id === item.id);
    const box = $('#chat-messages');
    if (msgs.length === 0) {
      box.innerHTML = `<div class="empty">${t('empty_chat')}</div>`;
    } else {
      box.innerHTML = msgs.map((m) => {
        const mine = state.user && m.sender_id === state.user.id;
        return `<div class="msg ${mine ? 'mine' : ''}">
          <div class="msg-nick">${mine ? t('me') : esc(nick(m.sender_id))}</div>
          <div class="msg-bubble">${esc(m.content)}</div>
        </div>`;
      }).join('');
    }
    box.scrollTop = box.scrollHeight;
  }

  function openChat(id) {
    state.chatItemId = id;
    renderChat();
    $('#chat-modal').classList.remove('hidden');
  }
  function closeChat() {
    state.chatItemId = null;
    $('#chat-modal').classList.add('hidden');
  }
  async function sendMessage() {
    const item = state.items.find((i) => i.id === state.chatItemId);
    if (!item) return;
    const input = $('#chat-input');
    const content = input.value.trim();
    if (!content) return;
    const myId = state.user.id;
    let receiverId;
    if (myId === item.seller_id) {
      const last = state.messages.filter((m) => m.item_id === item.id && m.sender_id !== myId).slice(-1)[0];
      const other = state.profiles.find((p) => p.id !== myId);
      receiverId = last ? last.sender_id : (other ? other.id : null);
    } else {
      receiverId = item.seller_id;
    }
    if (!receiverId) { toast(t('SERVER_ERROR')); return; }
    const { error } = await state.supabase.from('messages').insert({ item_id: item.id, sender_id: myId, receiver_id: receiverId, content });
    if (error) { showErr(error); return; }
    input.value = '';
    refreshAll();
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
      const [profiles, items, orders, txs, wishes, comments, messages, tasks] = await Promise.all([
        s.from('profiles').select('id, nickname, points, created_at, avatar, is_admin'),
        s.from('items').select('*').order('id', { ascending: false }),
        s.from('orders').select('*').order('id', { ascending: false }),
        s.from('point_txs').select('*').eq('user_id', state.user.id).order('id', { ascending: false }).limit(100),
        s.from('wishes').select('*').order('id', { ascending: false }),
        s.from('comments').select('*').order('id', { ascending: true }),
        s.from('messages').select('*').order('id', { ascending: true }),
        s.from('tasks').select('*').order('id', { ascending: false }),
      ]);
      if (profiles.error) throw profiles.error;
      if (items.error) throw items.error;
      if (orders.error) throw orders.error;
      if (txs.error) throw txs.error;
      if (wishes.error) throw wishes.error;
      if (comments.error) throw comments.error;
      if (messages.error) throw messages.error;
      if (tasks.error) throw tasks.error;
      state.profiles = profiles.data || [];
      state.items = items.data || [];
      state.orders = orders.data || [];
      state.txs = txs.data || [];
      state.wishes = wishes.data || [];
      state.comments = comments.data || [];
      state.messages = messages.data || [];
      state.tasks = tasks.data || [];
      const me = state.profiles.find((p) => p.id === state.user.id);
      state.profile = me || { nickname: state.user.user_metadata?.nickname || '', points: 0, avatar: '😊' };
      state.isAdmin = !!(me && me.is_admin);
      renderMarket();
      renderMyItems();
      renderOrders();
      renderPoints();
      renderWishes();
      renderTasks();
      renderChat();
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
  async function setItemStatus(id, status) {
    const { error } = await state.supabase.rpc('set_item_status', { p_item_id: id, p_status: status });
    if (error) { showErr(error); return; }
    toast(t('done'));
    refreshAll();
  }
  function toggleComments(id) {
    state.commentOpenId = state.commentOpenId === id ? null : id;
    renderMarket();
  }
  async function addComment(id) {
    const input = document.getElementById('comment-input-' + id);
    const content = input ? input.value.trim() : '';
    if (!content) return;
    const { error } = await state.supabase.from('comments').insert({ item_id: id, user_id: state.user.id, content });
    if (error) { showErr(error); return; }
    state.commentOpenId = id;
    refreshAll();
  }
  async function deleteComment(id) {
    const { error } = await state.supabase.from('comments').delete().eq('id', id);
    if (error) { showErr(error); return; }
    refreshAll();
  }
  async function takeTask(id) {
    const { error } = await state.supabase.rpc('take_task', { p_task_id: id });
    if (error) { showErr(error); return; }
    toast(t('done'));
    refreshAll();
  }
  async function completeTask(id) {
    const { error } = await state.supabase.rpc('complete_task', { p_task_id: id });
    if (error) { showErr(error); return; }
    toast(t('done'));
    refreshAll();
  }
  async function cancelTask(id) {
    const { error } = await state.supabase.rpc('cancel_task', { p_task_id: id });
    if (error) { showErr(error); return; }
    toast(t('done'));
    refreshAll();
  }
  async function handleTask(e) {
    e.preventDefault();
    const title = $('#task-title').value.trim();
    const description = $('#task-desc').value.trim();
    const points = Number($('#task-points').value);
    if (!title) return;
    const { error } = await state.supabase.from('tasks').insert({ creator_id: state.user.id, title, description, points });
    if (error) { showErr(error); return; }
    toast(t('published'));
    e.target.reset();
    refreshAll();
  }
  async function handleGrant(e) {
    e.preventDefault();
    const to_id = $('#grant-user').value;
    const amount = Number($('#grant-amount').value);
    if (!to_id) return;
    const { error } = await state.supabase.rpc('admin_grant_points', { p_to_id: to_id, p_amount: amount });
    if (error) { showErr(error); return; }
    toast(t('done'));
    refreshAll();
  }
  function openEdit() {
    const prof = state.profile || {};
    $('#edit-nickname').value = prof.nickname || '';
    renderAvatarPicker(prof.avatar || '😊');
    $('#edit-modal').classList.remove('hidden');
  }
  function renderAvatarPicker(selected) {
    state._selAvatar = selected;
    const box = $('#avatar-picker');
    box.innerHTML = AVATARS.map((a) => `<div class="avatar-opt ${a === selected ? 'sel' : ''}" data-avatar="${a}">${a}</div>`).join('');
    $$('#avatar-picker .avatar-opt').forEach((el) => el.addEventListener('click', () => {
      state._selAvatar = el.dataset.avatar;
      $$('#avatar-picker .avatar-opt').forEach((x) => x.classList.remove('sel'));
      el.classList.add('sel');
    }));
  }
  async function saveEdit() {
    const nickname = $('#edit-nickname').value.trim();
    const avatar = state._selAvatar || '😊';
    if (!nickname) { toast(t('INVALID_INPUT')); return; }
    const { error } = await state.supabase.rpc('update_profile', { p_nickname: nickname, p_avatar: avatar });
    if (error) { showErr(error); return; }
    $('#edit-modal').classList.add('hidden');
    toast(t('done'));
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
    $('#form-task').addEventListener('submit', handleTask);
    $('#form-grant').addEventListener('submit', handleGrant);
    $('#btn-edit-profile').addEventListener('click', openEdit);
    $('#edit-save').addEventListener('click', saveEdit);
    $('#edit-close').addEventListener('click', () => $('#edit-modal').classList.add('hidden'));
    $('#chat-send').addEventListener('click', sendMessage);
    $('#chat-close').addEventListener('click', closeChat);
    $('#chat-input').addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMessage(); });
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
