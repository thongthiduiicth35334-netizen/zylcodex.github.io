# 张永禄的博客

静态个人博客主页，开箱即用。

## 本地预览

```bash
cd /root/zhangyonglu-blog
python3 -m http.server 8080
```

浏览器打开：

```
http://localhost:8080
```

## 下一步建议

- 替换文章与统计数字为真实内容
- 已包含文章列表页与详情页
- 接入静态站点生成器或部署到 Nginx/Caddy

## 部署占位示例

### Caddy（推荐）

```
your-domain.com {
  root * /var/www/zhangyonglu-blog
  file_server
}
```

### Nginx

```
server {
  listen 80;
  server_name your-domain.com;
  root /var/www/zhangyonglu-blog;
  index index.html;
  location / {
    try_files $uri $uri/ =404;
  }
}
```
