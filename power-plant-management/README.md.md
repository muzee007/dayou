# 大有电厂管理平台

一个现代化的电厂管理平台，提供全景概览、运行管理、电力市场、数据台账等核心功能。

## 功能特性

### 🏠 全景概览
- 实时监控关键指标（功率、效率、温度、压力）
- 动态数据更新和趋势分析
- 设备状态实时显示
- 功率曲线图表展示

### ⚙️ 运行管理
- 机组启动/停止/紧急停机控制
- 运行参数实时调节
- 设备状态监控
- 操作日志记录

### 📊 电力市场
- 实时电价显示
- 交易量统计
- 市场份额分析
- 市场趋势预测

### 📋 数据台账
- 历史数据查询
- 多维度数据分析
- Excel/PDF数据导出
- 自定义时间范围查询

### 👥 系统管理
- 用户权限管理
- 角色分配
- 系统配置
- 操作日志查看

## 技术架构

### 前端技术栈
- **HTML5** - 语义化标记
- **CSS3** - 现代化样式设计
- **JavaScript (ES6+)** - 交互逻辑
- **Font Awesome** - 图标库
- **Google Fonts** - 字体优化

### 后端技术栈
- **Python 3.8+** - 后端语言
- **Flask** - Web框架
- **SQLite** - 数据库
- **Flask-CORS** - 跨域支持

## 项目结构

```
power-plant-management/
├── frontend/                 # 前端代码
│   ├── index.html           # 主页面
│   ├── css/
│   │   └── style.css        # 样式文件
│   ├── js/
│   │   └── app.js           # 应用逻辑
│   ├── images/              # 图片资源
│   └── pages/               # 页面文件
├── backend/                 # 后端代码
│   ├── app.py              # Flask应用
│   ├── requirements.txt    # Python依赖
│   ├── api/                # API模块
│   ├── models/             # 数据模型
│   └── utils/              # 工具函数
└── README.md               # 项目说明
```

## 快速开始

### 环境要求
- Python 3.8+
- 现代浏览器（Chrome、Firefox、Safari、Edge）

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd power-plant-management
   ```

2. **安装后端依赖**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. **启动后端服务**
   ```bash
   python app.py
   ```
   后端服务将在 http://localhost:5000 启动

4. **启动前端**
   - 直接在浏览器中打开 `frontend/index.html`
   - 或使用本地服务器：
     ```bash
     cd frontend
     python -m http.server 8000
     ```
   - 访问 http://localhost:8000

### 默认用户
- 用户名：`admin`
- 密码：`admin123`
- 角色：系统管理员

## API接口

### 概览数据
- `GET /api/overview` - 获取全景概览数据

### 图表数据
- `GET /api/chart/power?range=24h` - 获取功率曲线数据

### 运行管理
- `GET /api/operation/parameters` - 获取运行参数
- `POST /api/operation/parameters` - 更新运行参数
- `POST /api/operation/control` - 执行控制命令

### 电力市场
- `GET /api/market/data` - 获取市场数据

### 数据台账
- `POST /api/data/query` - 查询历史数据
- `POST /api/data/export` - 导出数据

### 系统管理
- `GET /api/admin/users` - 获取用户列表
- `POST /api/admin/users` - 添加用户
- `PUT /api/admin/users/<id>` - 更新用户
- `DELETE /api/admin/users/<id>` - 删除用户

### 系统状态
- `GET /api/system/status` - 获取系统状态
- `GET /api/system/logs` - 获取系统日志
- `GET /api/health` - 健康检查

## 界面预览

### 全景概览
- 实时指标卡片展示
- 动态数据更新
- 设备状态监控
- 功率曲线图表

### 运行管理
- 机组控制面板
- 参数调节界面
- 实时状态反馈

### 电力市场
- 实时电价显示
- 交易量统计
- 市场份额分析

### 数据台账
- 历史数据查询
- 数据导出功能
- 表格展示

### 系统管理
- 用户管理界面
- 权限配置
- 系统监控

## 开发说明

### 前端开发
- 使用模块化的JavaScript架构
- 响应式设计，支持移动端
- 实时数据更新机制
- 优雅的动画效果

### 后端开发
- RESTful API设计
- 数据库操作封装
- 错误处理机制
- 日志记录功能

### 数据安全
- 参数验证
- SQL注入防护
- 跨域安全配置
- 用户权限控制

## 部署说明

### 生产环境部署
1. 配置Web服务器（Nginx/Apache）
2. 设置反向代理
3. 配置SSL证书
4. 数据库优化
5. 日志管理

### Docker部署
```dockerfile
# Dockerfile示例
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["python", "app.py"]
```

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 联系方式

- 项目维护者：[您的姓名]
- 邮箱：[您的邮箱]
- 项目地址：[项目URL]

## 更新日志

### v1.0.0 (2024-01-15)
- 初始版本发布
- 实现核心功能模块
- 完成前后端架构
- 添加用户管理系统 