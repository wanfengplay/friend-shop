# 🛍️ 好友集市（Buddy Shop）

朋友 / 对象之间的小小购物集市。可以「上架」东西，用**积分、真钱（记账）、或自定义奖励**（抱抱 / 亲亲 / 做饭 / 洗衣服……）来交换。中英双语，两台手机/电脑随时共用一份数据。

## 技术方案

- **前端**：纯静态网页（HTML + CSS + JS），托管在 GitHub Pages，免费、24 小时在线、不睡眠
- **后端**：Supabase（免费云端 PostgreSQL），负责账号登录、数据存储、积分/订单逻辑
- 两者都免费、无需绑卡

## 文件说明

```
friend-shop/
├── index.html            # 页面
├── style.css             # 样式
├── app.js                # 前端逻辑（含中英双语）
├── config.js             # Supabase 项目地址和密钥（公开密钥，可安全暴露）
└── supabase-schema.sql   # 数据库建表脚本（已在 Supabase 执行，留作备份）
```

## 本地预览

用任意静态服务器打开即可（因为数据在 Supabase，本地打开也能用）：

```bash
cd friend-shop
npx serve .   # 或 python3 -m http.server
```

## 部署

1. Supabase 建好项目，执行 `supabase-schema.sql`，并关闭邮箱验证（Authentication → Providers → Email → 关掉 Confirm email）
2. 把 `config.js` 里的 `url` 和 `key` 换成你自己的 Supabase 项目值
3. 整个文件夹推到 GitHub，开启 GitHub Pages（或部署到 Cloudflare Pages / Netlify 等任意静态托管）

## 账号

- 注册 = 邮箱 + 密码 + 昵称，注册送 50 积分
- 真钱订单只记账，线下自行转账
