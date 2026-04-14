# Shelf 页面 — 结构与数据约定

本文档描述 **Shelf**（书架）页面的 DOM/信息层级与排版规则，供 HTML/CSS/JSON 实现时对照。编组单位为 **行（row）**，不是列。

---

## 1. 页面级结构

```
页面 shelf.html
├── 全局导航（与其它页面共用）
└── main.content.shelf
    ├── [可选] 侧栏 / 固定区块（若保留与 Journal 类似的左侧 sketchbook 区，则与主区顶端对齐）
    └── .shelf-main（主阅读区）
        ├── .shelf-header
        │   ├── h1 「Shelf」
        │   └── .shelf-stats（状态汇总，如 reading / read 数量）
        └── .shelf-rows
            └── .shelf-row × N   ← 每一行一条「架子」
```

- **标题**：页面主标题由「Journal」改为 **「Shelf」**。
- **逻辑**：内容按 **`.shelf-row`** 分行；每一行内从左到右排列多本书，行与行自上而下。

---

## 2. 单行 `.shelf-row` 内部结构

每一行表示一层架子上的书，推荐 DOM 骨架如下：

```
.shelf-row
├── .shelf-row-books      ← 书本区域（用于 flex/grid 与 bottom-align）
│   └── .shelf-book × M   ← 单本书（含封面、状态角标等）
│       ├── .shelf-book-cover-wrap   ← 封面容器（定宽或按比例，控制视觉书脊）
│       │   ├── img.shelf-book-cover
│       │   └── [可选] .shelf-book-badge（如 reading）
│       └── .shelf-book-title        ← 书名，在封面正下方
└── .shelf-row-deco       ← 行级 SVG 装饰（「架子」横条，垫在书后/书下）
```

### 2.1 书籍对齐（行内）

| 规则 | 说明 |
|------|------|
| (a) Bottom align | 行内所有 **`.shelf-book-cover-wrap`（或封面块）下边缘** 在同一条水平基线上对齐（`align-items: flex-end` 或等价布局）。 |
| (b) SVG 装饰 | **`.shelf-row-deco`** 使用你提供的 SVG，作为该行的背景/后景装饰（`z-index` 低于书）。 |
| (c) 与书底的间距 | **书底边** 与 **装饰物底边** 相差 **20px**（实现时统一用 CSS 变量，如 `--shelf-book-to-deco: 20px`）。 |

> 实现提示：可用「行容器 = 相对定位」+「装饰 = 绝对定位贴底」或「flex 列 + 装饰在下一层」，保证数值与视觉稿一致即可。

### 2.2 书名与间距

| 规则 | 说明 |
|------|------|
| (a) 书名 top align | **`.shelf-book-title`** 内文字 **顶对齐**（`align-items: flex-start` / 多行标题时从第一行顶对齐）。 |
| (b) 与书左缘、宽度一致 | 书名块 **左对齐** 于封面的左缘，**宽度** 等于封面宽度（与 `.shelf-book-cover-wrap` 同宽）。 |
| (c) 书与书间距 | 行内相邻两本书之间使用 **固定百分比** 水平间距（如 `gap: 2%` 或 `margin-left` 用 `%`，相对 **`.shelf-row-books` 宽度** 计算，全站统一一个变量）。 |

---

## 3. 数据层（JSON）建议 — 以「行」为顶层

后续可用 `shelf/index.json` 驱动渲染，结构示例：

```json
{
  "title": "Shelf",
  "stats": {
    "reading": 3,
    "read": 8
  },
  "rows": [
    {
      "id": "row-1",
      "books": [
        {
          "id": "book-1",
          "title": "书名",
          "cover": "shelf/covers/example.jpg",
          "width": 120,
          "height": 180,
          "status": "reading"
        }
      ]
    }
  ]
}
```

### 字段说明（最小集）

| 字段 | 含义 |
|------|------|
| `rows` | 数组，顺序即从上到下每一行。 |
| `rows[].books` | 该行从左到右的书顺序。 |
| `title` | 显示在封面下方的书名。 |
| `cover` | 封面图路径。 |
| `width` / `height` | 可选；用于保持不同书尺寸比例（与 CSS 中 max-height 等配合）。 |
| `status` | 可选：`reading` / `read` / 省略，用于角标与统计。 |

---

## 4. CSS 变量建议（实现阶段）

| 变量 | 用途 |
|------|------|
| `--shelf-gap-pct` | 行内书与书之间的水平间距（百分比）。 |
| `--shelf-book-to-deco` | 书底到装饰 SVG 底边的 **20px**。 |

---

## 5. 与导航 / 侧栏

- 若左侧仍保留「sketchbook」预览区：与主区 **Shelf 标题** 顶对齐（沿用现有 ghost spacer 思路即可）。
- 导航中 **Shelf** 项：指向 `shelf.html`（与现有站点结构一致时再接线）。

---

## 6. 待你补充

- [ ] 行级架子 **SVG** 文件路径与 `viewBox`（贴入后可替换 `.shelf-row-deco` 占位）。
- [ ] 行内 `gap` 的具体 **百分比** 数值（定稿后写入 `--shelf-gap-pct`）。
