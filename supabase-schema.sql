-- ============================================================
-- 好友集市（Buddy Shop） Supabase 数据库脚本
-- 在 Supabase 控制台 → SQL Editor → 新建查询 → 粘贴全部 → Run
-- ============================================================

-- 1) 用户资料表（Supabase 自带 auth.users，这里存昵称和积分）
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null,
  points integer not null default 0,
  created_at timestamptz not null default now()
);

-- 2) 商品表
create table if not exists public.items (
  id bigint generated always as identity primary key,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null default '',
  price_type text not null check (price_type in ('points','money','reward')),
  price_points integer not null default 0,
  price_money numeric not null default 0,
  reward_text text not null default '',
  status text not null default 'active' check (status in ('active','sold')),
  created_at timestamptz not null default now()
);

-- 3) 订单表
create table if not exists public.orders (
  id bigint generated always as identity primary key,
  item_id bigint not null references public.items(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  price_type text not null,
  amount_points integer not null default 0,
  amount_money numeric not null default 0,
  reward_text text not null default '',
  status text not null default 'pending' check (status in ('pending','paid','completed','cancelled')),
  created_at timestamptz not null default now()
);

-- 4) 积分流水表
create table if not exists public.point_txs (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  delta integer not null,
  reason text not null,
  created_at timestamptz not null default now()
);

-- 5) 注册时自动创建资料 + 送初始积分
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nickname, points)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nickname', split_part(coalesce(new.email,''), '@', 1)),
    50
  );
  insert into public.point_txs (user_id, delta, reason)
  values (new.id, 50, '注册赠送');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 行级安全（RLS）
-- ============================================================
alter table public.profiles enable row level security;
alter table public.items enable row level security;
alter table public.orders enable row level security;
alter table public.point_txs enable row level security;

-- 资料：登录用户都能看（用于显示卖家昵称、转赠下拉）
create policy "profiles_read" on public.profiles
  for select using (auth.role() = 'authenticated');

-- 商品：登录用户都能看；只能上架自己的；只能删自己的
create policy "items_read" on public.items
  for select using (auth.role() = 'authenticated');
create policy "items_insert" on public.items
  for insert with check (seller_id = auth.uid());
create policy "items_delete" on public.items
  for delete using (seller_id = auth.uid());

-- 订单：只能看自己作为买家或卖家的订单
create policy "orders_read" on public.orders
  for select using (buyer_id = auth.uid() or seller_id = auth.uid());

-- 积分流水：只能看自己的
create policy "point_txs_read" on public.point_txs
  for select using (user_id = auth.uid());

-- ============================================================
-- 业务函数（用 SECURITY DEFINER 保证积分转账等操作的原子性）
-- ============================================================

-- 购买商品
create or replace function public.buy_item(p_item_id bigint)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_item items%rowtype;
  v_buyer_id uuid := auth.uid();
begin
  select * into v_item from items where id = p_item_id for update;
  if not found then raise exception 'NOT_FOUND'; end if;
  if v_item.seller_id = v_buyer_id then raise exception 'CANT_BUY_OWN'; end if;
  if v_item.status <> 'active' then raise exception 'ALREADY_SOLD'; end if;

  if v_item.price_type = 'points' then
    if (select points from profiles where id = v_buyer_id) < v_item.price_points then
      raise exception 'INSUFFICIENT_POINTS';
    end if;
    update profiles set points = points - v_item.price_points where id = v_buyer_id;
    update profiles set points = points + v_item.price_points where id = v_item.seller_id;
    insert into point_txs (user_id, delta, reason) values
      (v_buyer_id, -v_item.price_points, '购买「' || v_item.title || '」'),
      (v_item.seller_id, v_item.price_points, '卖出「' || v_item.title || '」');
    insert into orders (item_id, buyer_id, seller_id, price_type, amount_points, amount_money, reward_text, status)
      values (p_item_id, v_buyer_id, v_item.seller_id, 'points', v_item.price_points, 0, '', 'completed');
  else
    insert into orders (item_id, buyer_id, seller_id, price_type, amount_points, amount_money, reward_text, status)
      values (p_item_id, v_buyer_id, v_item.seller_id, v_item.price_type, 0, v_item.price_money, v_item.reward_text, 'pending');
  end if;

  update items set status = 'sold' where id = p_item_id;
end;
$$;

-- 转赠积分
create or replace function public.gift_points(p_to_id uuid, p_amount integer)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_from_id uuid := auth.uid();
  v_to_nickname text;
  v_from_nickname text;
begin
  if p_amount <= 0 then raise exception 'INVALID_INPUT'; end if;
  if p_to_id = v_from_id then raise exception 'CANT_GIFT_SELF'; end if;
  if (select points from profiles where id = v_from_id) < p_amount then
    raise exception 'INSUFFICIENT_POINTS';
  end if;
  select nickname into v_to_nickname from profiles where id = p_to_id;
  select nickname into v_from_nickname from profiles where id = v_from_id;
  if v_to_nickname is null then raise exception 'USER_NOT_FOUND'; end if;

  update profiles set points = points - p_amount where id = v_from_id;
  update profiles set points = points + p_amount where id = p_to_id;
  insert into point_txs (user_id, delta, reason) values
    (v_from_id, -p_amount, '转赠给 ' || v_to_nickname),
    (p_to_id, p_amount, '收到 ' || v_from_nickname || ' 的转赠');
end;
$$;

-- 订单操作（pay / complete / cancel）
create or replace function public.order_action(p_order_id bigint, p_action text)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_order orders%rowtype;
  v_uid uuid := auth.uid();
begin
  select * into v_order from orders where id = p_order_id for update;
  if not found then raise exception 'NOT_FOUND'; end if;

  if p_action = 'pay' then
    if v_order.buyer_id <> v_uid then raise exception 'FORBIDDEN'; end if;
    if v_order.price_type <> 'money' or v_order.status <> 'pending' then raise exception 'INVALID_STATE'; end if;
    update orders set status = 'paid' where id = p_order_id;

  elsif p_action = 'complete' then
    if v_order.seller_id <> v_uid and v_order.buyer_id <> v_uid then raise exception 'FORBIDDEN'; end if;
    if v_order.price_type = 'money' and v_order.seller_id <> v_uid then raise exception 'FORBIDDEN'; end if;
    if v_order.price_type = 'money' and v_order.status <> 'paid' then raise exception 'INVALID_STATE'; end if;
    if v_order.status <> 'pending' and v_order.status <> 'paid' then raise exception 'INVALID_STATE'; end if;
    update orders set status = 'completed' where id = p_order_id;

  elsif p_action = 'cancel' then
    if v_order.buyer_id <> v_uid and v_order.seller_id <> v_uid then raise exception 'FORBIDDEN'; end if;
    if v_order.status <> 'pending' and v_order.status <> 'paid' then raise exception 'INVALID_STATE'; end if;
    update orders set status = 'cancelled' where id = p_order_id;
    if v_order.price_type <> 'points' then
      update items set status = 'active' where id = v_order.item_id;
    end if;

  else
    raise exception 'NOT_FOUND';
  end if;
end;
$$;

-- ============================================================
-- 期望上架（愿望清单）
-- ============================================================
create table if not exists public.wishes (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.wishes enable row level security;

create policy "wishes_read" on public.wishes for select using (auth.role() = 'authenticated');
create policy "wishes_insert" on public.wishes for insert with check (user_id = auth.uid());
create policy "wishes_delete" on public.wishes for delete using (user_id = auth.uid());
