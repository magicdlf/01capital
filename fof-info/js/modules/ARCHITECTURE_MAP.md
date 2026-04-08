# Main.js 功能边界映射

## 入口与全局配置
- `config.js`：数据路径、产品配置、映射配置、EmailJS 配置。
- `main.js`：页面入口、模块协调、DOM 绑定。

## 主要功能边界
- **产品路由**：`product-router.js` 负责产品按钮点击与子菜单展开。
- **图表与产品展示**：`main.js` 中的 `show*/render*/load*` 保持现有行为。
- **认证与会话**：`showLoginModal()`、`handleLogin()`、`handleLogout()`。
- **投资摘要**：`showInvestmentSummary()` 负责总览渲染；通用计算迁移到 `summary-utils.js`。
- **用户动作**：赎回与币种转换相关函数保留在 `main.js`（后续可继续拆分）。

## 关键依赖
- Chart.js、Papa Parse、EmailJS、Bootstrap Modal。
- 用户数据源：`/data/users/*.json`
- 产品数据源：`/data/*.csv`

## 本轮重构结果
- 完成配置/路由/摘要工具模块化抽取。
- 产品点击分发由硬编码 `if/else` 迁移为配置路由器。
- 投资摘要核心重复计算已具备通用函数入口，保持原行为。
- `index.html` 使用 `type="module"` 加载 `main.js`，支持 ES Module 拆分。
- `main.js` 导入：`config.js`、`product-router.js`、`summary-utils.js`。
- 投资摘要中多产品持仓收益计算块改为 `computeReturnMetrics()` 驱动（与原先逐段计算等价）。
- `fundNameMapping` 合并至 `config.js` 的 `FUND_NAME_MAPPING`，避免重复定义。

## 后续可继续拆分（可选）
- 图表与 CSV：`charts` 相关函数仍位于 `main.js`，可逐步迁入 `modules/charts.js`。
- 认证与导航：`showLoginModal` / `handleLogin` / `handleLogout` 可迁入 `modules/auth.js`（需注入全局状态与回调）。
- 用户操作：赎回与币种转换可迁入 `modules/actions.js`。
