# 图像对照

React + Vite 静态展示站。三个模型并排三列，八个场景逐行展示；默认暗色，亮暗选择保存在当前浏览器。原图完整显示，点击后使用 [Yet Another React Lightbox](https://yet-another-react-lightbox.com/plugins/zoom) 放大，支持滚轮缩放、拖动、方向键切换及 Esc 关闭。

## 本地运行

需要 Node.js 22.12+（或 20.19+）。

```sh
npm ci
npm run dev
```

## 构建

```sh
npm run build
npm run preview
```

将 `dist/` 交给任意静态 HTTP 服务即可，也支持放在网站子路径下。不能直接双击 HTML 文件运行。

## 素材

仅复制模型原图，不包含拼接对比图、请求或响应日志。24 张原图已放入 `public/images/<场景>/<模型>/original.<原始扩展名>`，并随仓库保存；页面延迟加载非首行图片。`src/gallery.json` 记录场景、模型、相对路径及真实尺寸。运行和构建不依赖父目录。

需要重新导入同结构的数据时：

```sh
npm run import:images -- /absolute/path/to/source
```

省略路径时读取上级目录。导入器要求三个模型、每个场景一个样本，以及每个模型恰好一张原图；不满足时直接报错。`sharp` 只读取图像尺寸，素材以原始字节复制，不缩放或转码。
