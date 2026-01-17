这份 PRD（产品需求文档）是为了 Room-Market (Hackathon Edition) 量身定制的。
核心思路是：“去后端化”（Serverless / Client-Side First）。为了确保黑客松现场演示绝对稳定，我们将逻辑重心放在 前端交互 + 链上模拟 + AI 生成，去掉复杂的数据库同步，利用本地状态或简单的链上广播来完成演示。
产品需求文档 (PRD): Room-Market (Monad Hackathon Edition)
版本号: v1.0 (Demo Ready)
项目代号: LiveOracle
适用场景: Monad 黑客松现场演示
1. 产品概述 (Executive Summary)
1.1 产品定义
Room-Market 是一个基于房间的、超高频的、由 AI 驱动的去中心化预测市场。
它就像是 "Kahoot! 遇上了 Polymarket"。用户可以在现场（如黑客松、派对、体育赛事）一键创建一个“房间”，利用大屏投影，观众扫码即可参与即时的手速竞技、预测下注或抢红包。
1.2 核心价值 (Value Proposition)
Monad 极速体验: 展示 Monad 区块链 400ms 出块时间的优势，实现即时结算（Instant Settlement）。
AI 赋能 (GenAI): 解决“建盘难”的问题，通过 Gemini API 一键生成任何主题的预测盘口。
现场互动 (Social-Fi): 专注于线下场景的大屏可视化与多人互动。
1.3 演示目标 (Demo Goals)
零门槛: 演示期间确保无崩溃（Black Screen Free）。
视觉冲击: 大屏数据可视化（Recharts）+ 赛博朋克 UI。
完整闭环: 建房 -> 扫码 -> 互动 -> 结算 -> 领奖。
2. 用户角色与流程 (User Roles & Flow)
2.1 角色
房主 (Host): 创建市场的人（演示者）。负责投屏、控制节奏。
玩家 (Player): 现场观众/评委。通过扫码进入，使用钱包（或模拟钱包）参与。
2.2 核心流程图
code
Code
[房主] 连接钱包 -> [AI 生成] 输入 "谁是冠军" -> [大屏模式] 投影二维码
       |
       v
[玩家] 扫码/访问 -> [互动] 点击/下注/抢红包 -> [链上交互] 模拟/上链
       |
       v
[系统] 实时更新大屏图表 -> [结算] 智能合约分配奖金 -> [大屏] 显示赢家
3. 功能需求详解 (Functional Requirements)
3.1 核心模块一：AI 市场生成器 (AI Generator)
输入: 用户输入自然语言提示词（例如：“今晚黑客松谁赢？”）。
处理: 调用 Google Gemini API。
输出: 标准化 JSON 结构（标题、互斥选项列表）。
约束:
20 个选项限制: 为了渲染性能，生成的选项或模拟数据强制限制在 20 个以内。
兜底机制: 如果 API 超时或 Key 失效，自动回退到本地 Mock 数据（"BTC 哈希猜测"等）。
3.2 核心模块二：三大玩法模式
A. 极速竞技场 (Arena Mode) - 展示 TPS
机制: 15秒倒计时，玩家疯狂点击屏幕（模拟发送高频交易）。
前端逻辑: 记录点击数 (CPS)。
结算: 倒计时结束 -> 模拟“三方节点仲裁”动画 -> 公布排名 -> 发放奖励。
演示重点: 展示“三方仲裁”UI，体现去中心化预言机概念。
B. 预测市场 (Prediction Mode) - 展示流动性
机制: 类似于 Polymarket，但基于 Parimutuel (彩池制) 赔率。
UI: 动态进度条，实时显示赔率变化（Odds）。
演示重点: 玩家下注后，赔率条即时变动的顺滑感。
C. 链上红包 (Red Packet) - 展示低 Gas
机制: 房主塞钱，玩家抢。
逻辑: 纯随机数逻辑（模拟 VRF）。
演示重点: 开红包的动画特效 + “资金已到账”的即时反馈。
3.3 核心模块三：大屏可视化 (Big Screen)
入口: 房主端点击“投屏模式”。
布局:
左侧: 实时数据（参与人数、总奖池、模拟 TPS）。
右侧: 巨大的动态柱状图（Recharts）。
底部: 滚动显示的最新交易记录（Ticker）。
交互: 必须支持“返回”按钮退出全屏。
渲染优化: 针对 20 个数据点，X 轴标签需旋转 45 度以防重叠。
3.4 核心模块四：钱包与交易 (Web3 & Simulation)
双模式策略:
真实模式: 检测到 MetaMask/Rabby 且在 Monad Testnet，发送真实交易。
演示模式 (Demo Mode): 检测不到钱包时，自动分配 0x...Demo 地址，所有交易模拟 400ms 延迟并返回成功。这是现场演示的生命线，防止网络拥堵导致演示失败。
4. 技术栈与性能约束 (Tech Stack & Constraints)
4.1 前端 (即后端)
框架: React 18 (通过 ImportMap 锁定版本 18.2.0 或 18.3.1，严禁使用 Beta)。
语言: TypeScript.
样式: TailwindCSS (CDN 引入，保持轻量)。
图标: Lucide-React.
图表: Recharts.
Web3: Ethers.js v6.
4.2 数据流 (State Management)
去后端化: 在演示版中，不使用 Firebase/Supabase。
状态同步:
利用 React useState 作为单一数据源。
注意: 在真实的纯前端演示中，房主和玩家其实是操作同一个浏览器窗口（或通过简单的硬编码 Mock 数据让大屏看起来在动）。
如果必须多端: 房主端是大屏，玩家端逻辑仅用于产生 Mock 数据填充进大屏的 State 列表。
4.3 性能指标
加载时间: < 1秒 (无打包步骤，原生 ES Module)。
列表渲染: 严格限制最大 20 个卡片/图表项，防止 DOM 过多导致卡顿。
动画: 使用 CSS transform 代替 top/left 属性，确保 60fps 流畅度。
5. UI/UX 设计规范 (Design System)
色调: 深色模式 (Dark Mode)。
背景: #0f172a (Slate-950).
主色: #9333ea (Purple-600) - 致敬 Monad 紫。
强调色: #eab308 (Yellow-500) - 赢家/金钱。
字体: Inter (Google Fonts)，数字使用 Monospace 以体现极客感。
特效:
Neon Glow: 关键文字和按钮增加发光效果。
Pulse: 实时状态（如“进行中”）必须有呼吸灯动画。
移动端适配: 所有玩家操作界面必须 100% 适配手机竖屏。
6. 现场演示脚本 (Demo Script) - 2分钟版本
0:00 - 开场: "大家看大屏幕，这是 Room-Market。"
0:10 - 连接: 点击 "Connect Wallet"，秒连（使用 Demo 模式或真实钱包）。
0:20 - AI 生成: "我们来预测一下今天的冠军。" 输入 "Monad Hackathon Winner"，点击生成。Gemini 3秒内返回 20 个项目列表。
0:40 - 投屏: 点击 "投屏模式"。大屏显示柱状图和二维码。
1:00 - 互动: (假装观众扫码，或者并在另一个窗口模拟玩家操作) 疯狂点击/下注。大屏柱状图实时跳动。
1:30 - 结算: 倒计时结束，点击“结算”。显示“三方仲裁”动画。
1:50 - 结尾: 显示冠军奖杯。"基于 Monad，即时结算。谢谢。"
7. 风险控制 (Risk Management)
风险点	解决方案
现场断网	预埋 Mock 数据生成逻辑，断网时自动切换为本地随机数据生成。
Gemini API 限流	代码中已内置 Try-Catch，失败时自动返回“BTC 预测”等默认 Mock 数据。
投影仪分辨率低	增大 BigScreen 组件的基础字号，图表文字旋转 45 度。
钱包无法弹出	强制启用 Web3.ts 中的 isDemoAddress 逻辑，点击即成功，不依赖插件。
这份文档可以直接发给负责 Demo 流程的队友，确保大家对“能做什么”、“不能做什么（复杂的后端同步）”有统一的认知。祝比赛顺利！
