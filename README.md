# @clderystd/m3-ui

云术工作室的 Material Design 3 组件库。18 个 M3 组件 + 结构令牌 + useModal / v-ripple / v-reveal，
不依赖任何第三方 UI 组件库。

## 关键约定

**配色由使用方注入。** 本包只带结构令牌（形状 / 字阶 / 海拔 / 动效 / 状态层），
全部颜色走 `--md-sys-color-*` 这类语义变量。每个站点用自己的种子色生成配色表：

```css
/* 使用方自己的 m3-color-tokens.css */
:root { --md-sys-color-primary: #0061a4; /* ... */ }
.dark { --md-sys-color-primary: #9ecaff; /* ... */ }
```

这样官方站的蓝色、scforge 的橙色可以共存，而组件代码只有一份。

**图标不绑定图标库。** `IconComponent` 就是 Vue 的 `Component`，
unplugin-icons 生成的、手写 SFC、其他图标库的都能传。包里只内联了三个自己要用的小图标
（check / close / expand-more）。

## 使用

```bash
pnpm add @clderystd/m3-ui --registry=https://npm.pkg.github.com
```

```ts
import { M3Button, M3Card, M3Dialog } from '@clderystd/m3-ui'
import '@clderystd/m3-ui/style.css'   // 结构令牌 + 组件样式（不含配色）
```

`style.css` 要在**站点自己的配色之前**引入，方便站点覆盖。

## 组件

M3Avatar、M3Button、M3Card、M3Chip、M3Dialog、M3Divider、M3Fab、M3Icon、M3IconButton、
M3List、M3ListItem、M3Menu、M3MenuItem、M3SegmentedButton、M3Sheet、M3Switch、M3Tooltip、M3TopAppBar。

另导出 `vRipple`、`vReveal`、`useModal`、`IconCheck`、`IconClose`、`IconExpandMore`。

## 本地联调

站点用 `file:../m3-ui` 引用本包。**注意 pnpm 的 `file:` 是复制语义，不是软链**：
改了组件源码后必须

```bash
pnpm build                          # 在 m3-ui 里重新构建
cd ../identity-ui && pnpm install   # 让站点拿到新副本
```

只跑 `pnpm build` 而不 `pnpm install`，站点侧仍指向旧的 `dist` 副本
（实测两份 `m3-ui.css` 时间戳会差几分钟，改了也不生效）。

正式接入时应改用发布后的版本号（`@clderystd/m3-ui@^0.1.0`），
那时升级用 `pnpm update`，行为符合预期。

## 开发

```bash
pnpm build       # 产出 dist/index.js + dist/m3-ui.css + dist/*.d.ts
pnpm typecheck
```

构建细节：

- `vue` 是 peerDependency，不打进产物；
- 类型由 `vite-plugin-dts` 生成后用 `scripts/flatten-dts.mjs` 摊平到 `dist/` 根
  （**不要**开 `rollupTypes`，它会把 `.vue` 的类型全丢掉，产出空的 `index.d.ts`）；
- CSS 独立成 `dist/m3-ui.css`，不在 JS 里自动注入。

## 发布

发布到 npm 公共 registry（registry.npmjs.org），包作用域是 `@cloudery`。

1. 准备一个带 `read:packages` + `write:packages` 权限的 GitHub token（classic PAT 即可）；
2. 写进 `~/.npmrc`（**不要**提交到仓库）：

   ```
   @cloudery:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=${NPM_TOKEN}
   ```

3. 设置环境变量后发布：

   ```bash
   $env:NPM_TOKEN = 'npm_xxx'      # PowerShell
   pnpm publish                       # 会先跑 prepublishOnly -> build
   ```

`publishConfig.registry` 已固定到 GitHub Packages，`access: restricted`。
改版本号用 `pnpm version patch|minor|major`（会自动打 tag）。