// 电厂管理平台主应用
class PowerPlantApp {
    constructor() {
        this.currentPage = 'overview';
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadMockData();
        this.startRealTimeUpdates();
        this.initCharts();
    }

    bindEvents() {
        // 导航菜单事件
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                this.switchPage(page);
            });
        });

        // 时间范围按钮事件
        document.querySelectorAll('.btn-time').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.btn-time').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.updateChart(btn.dataset.time);
            });
        });

        // 控制按钮事件
        document.querySelectorAll('.btn-control').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleControlAction(btn.textContent.trim());
            });
        });

        // 参数输入事件
        document.querySelectorAll('.parameter-item input').forEach(input => {
            input.addEventListener('change', (e) => {
                this.updateParameter(e.target);
            });
        });

        // 搜索功能
        const searchInput = document.querySelector('.search-box input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // 通知点击事件
        document.querySelector('.notifications').addEventListener('click', () => {
            this.showNotifications();
        });

        // 设置点击事件
        document.querySelector('.settings').addEventListener('click', () => {
            this.showSettings();
        });

        // 数据查询按钮
        const queryBtn = document.querySelector('.data-controls .btn-primary');
        if (queryBtn) {
            queryBtn.addEventListener('click', () => {
                this.queryData();
            });
        }

        // 导出按钮
        document.querySelectorAll('.export-actions .btn-secondary').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.target.textContent.includes('Excel') ? 'excel' : 'pdf';
                this.exportData(type);
            });
        });

        // 标签页切换
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // 用户操作按钮
        document.querySelectorAll('.btn-icon').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.closest('.btn-icon').querySelector('i').classList.contains('fa-edit') ? 'edit' : 'delete';
                this.handleUserAction(action, e.target.closest('.user-item'));
            });
        });

        // 设备管理：添加设备按钮事件
        document.body.addEventListener('click', (e) => {
            if (e.target.closest('#add-equipment-btn')) {
                this.showEquipmentForm();
            }
            if (e.target.closest('.edit-equipment-btn')) {
                const id = e.target.closest('.edit-equipment-btn').dataset.id;
                this.showEquipmentForm(id);
            }
            if (e.target.closest('.delete-equipment-btn')) {
                const id = e.target.closest('.delete-equipment-btn').dataset.id;
                if (confirm('确定要删除该设备吗？')) {
                    this.deleteEquipment(id);
                }
            }
            if (e.target.closest('#equipment-form-cancel')) {
                document.getElementById('equipment-form-modal').remove();
            }
            if (e.target.closest('#equipment-form-submit')) {
                this.submitEquipmentForm();
            }
        });
        // 运行参数管理：添加参数按钮事件
        document.body.addEventListener('click', (e) => {
            if (e.target.closest('#add-operation-data-btn')) {
                this.showOperationDataForm();
            }
            if (e.target.closest('.edit-operation-data-btn')) {
                const id = e.target.closest('.edit-operation-data-btn').dataset.id;
                this.showOperationDataForm(id);
            }
            if (e.target.closest('.delete-operation-data-btn')) {
                const id = e.target.closest('.delete-operation-data-btn').dataset.id;
                if (confirm('确定要删除该参数记录吗？')) {
                    this.deleteOperationData(id);
                }
            }
            if (e.target.closest('#operation-data-form-cancel')) {
                document.getElementById('operation-data-form-modal').remove();
            }
            if (e.target.closest('#operation-data-form-submit')) {
                this.submitOperationDataForm();
            }
        });
        // 市场数据管理：添加市场数据按钮事件
        document.body.addEventListener('click', (e) => {
            if (e.target.closest('#add-market-data-btn')) {
                this.showMarketDataForm();
            }
            if (e.target.closest('.edit-market-data-btn')) {
                const id = e.target.closest('.edit-market-data-btn').dataset.id;
                this.showMarketDataForm(id);
            }
            if (e.target.closest('.delete-market-data-btn')) {
                const id = e.target.closest('.delete-market-data-btn').dataset.id;
                if (confirm('确定要删除该市场数据吗？')) {
                    this.deleteMarketData(id);
                }
            }
            if (e.target.closest('#market-data-form-cancel')) {
                document.getElementById('market-data-form-modal').remove();
            }
            if (e.target.closest('#market-data-form-submit')) {
                this.submitMarketDataForm();
            }
        });
        // 公告管理：添加公告按钮事件
        document.body.addEventListener('click', (e) => {
            if (e.target.closest('#add-announcement-btn')) {
                this.showAnnouncementForm();
            }
            if (e.target.closest('.edit-announcement-btn')) {
                const id = e.target.closest('.edit-announcement-btn').dataset.id;
                this.showAnnouncementForm(id);
            }
            if (e.target.closest('.delete-announcement-btn')) {
                const id = e.target.closest('.delete-announcement-btn').dataset.id;
                if (confirm('确定要删除该公告吗？')) {
                    this.deleteAnnouncement(id);
                }
            }
            if (e.target.closest('#announcement-form-cancel')) {
                document.getElementById('announcement-form-modal').remove();
            }
            if (e.target.closest('#announcement-form-submit')) {
                this.submitAnnouncementForm();
            }
        });
        // 系统设置：保存按钮事件
        document.body.addEventListener('click', (e) => {
            if (e.target.closest('#save-settings-btn')) {
                this.saveSystemSettings();
            }
        });
    }

    switchPage(page) {
        // 更新导航状态
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-page="${page}"]`).classList.add('active');

        // 更新页面显示
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });
        document.getElementById(`${page}-page`).classList.add('active');

        // 更新面包屑
        const pageNames = {
            overview: '全景概览',
            operation: '运行管理',
            market: '电力市场',
            data: '数据台账',
            admin: '系统管理'
        };
        document.getElementById('current-page').textContent = pageNames[page];

        this.currentPage = page;

        // 页面特定初始化
        if (page === 'data') {
            this.loadDataTable();
        }
    }

    switchTab(tab) {
        // 更新标签按钮状态
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        // 更新标签内容
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.getElementById(`${tab}-tab`).classList.add('active');

        if (tab === 'equipment') {
            this.loadEquipmentList();
        }
        if (tab === 'operation-data') {
            this.loadOperationDataList();
        }
        if (tab === 'market-data') {
            this.loadMarketDataList();
        }
        if (tab === 'announcement') {
            this.loadAnnouncementList();
        }
        if (tab === 'system') {
            this.loadSystemSettings();
        }
    }

    loadMockData() {
        // 模拟实时数据更新
        this.updateMetrics();
        this.updateEquipmentStatus();
        this.updateMarketData();
    }

    updateMetrics() {
        const metrics = [
            { id: 'power', value: 1250, trend: 2.3 },
            { id: 'efficiency', value: 94.2, trend: 0.8 },
            { id: 'temperature', value: 540, trend: 0.0 },
            { id: 'pressure', value: 16.8, trend: -0.5 }
        ];

        metrics.forEach(metric => {
            const card = document.querySelector(`.metric-card:has(.metric-icon.${metric.id})`);
            if (card) {
                const valueEl = card.querySelector('.metric-value');
                const trendEl = card.querySelector('.metric-trend span');
                
                // 添加数字动画效果
                this.animateNumber(valueEl, metric.value);
                
                // 更新趋势
                const trendClass = metric.trend > 0 ? 'positive' : metric.trend < 0 ? 'negative' : 'neutral';
                const trendIcon = metric.trend > 0 ? 'fa-arrow-up' : metric.trend < 0 ? 'fa-arrow-down' : 'fa-minus';
                
                trendEl.parentElement.className = `metric-trend ${trendClass}`;
                trendEl.parentElement.querySelector('i').className = `fas ${trendIcon}`;
                trendEl.textContent = `${Math.abs(metric.trend)}%`;
            }
        });
    }

    animateNumber(element, targetValue) {
        const startValue = parseInt(element.textContent.replace(/,/g, ''));
        const increment = (targetValue - startValue) / 20;
        let currentValue = startValue;
        
        const timer = setInterval(() => {
            currentValue += increment;
            if ((increment > 0 && currentValue >= targetValue) || 
                (increment < 0 && currentValue <= targetValue)) {
                currentValue = targetValue;
                clearInterval(timer);
            }
            element.textContent = Math.round(currentValue).toLocaleString();
        }, 50);
    }

    updateEquipmentStatus() {
        const equipment = [
            { name: '1号机组', status: 'online', text: '正常运行' },
            { name: '2号机组', status: 'online', text: '正常运行' },
            { name: '3号机组', status: 'maintenance', text: '维护中' }
        ];

        equipment.forEach((eq, index) => {
            const item = document.querySelectorAll('.equipment-item')[index];
            if (item) {
                item.className = `equipment-item ${eq.status}`;
                item.querySelector('.equipment-name').textContent = eq.name;
                item.querySelector('.equipment-status-text').textContent = eq.text;
            }
        });
    }

    updateMarketData() {
        // 模拟市场数据更新
        const price = (0.8 + Math.random() * 0.2).toFixed(2);
        const volume = Math.floor(25000 + Math.random() * 10000);
        const share = (14 + Math.random() * 3).toFixed(1);

        // 更新价格
        const priceEl = document.querySelector('.price');
        if (priceEl) {
            priceEl.textContent = `¥${price}`;
        }

        // 更新交易量
        const volumeEl = document.querySelector('.volume');
        if (volumeEl) {
            volumeEl.textContent = volume.toLocaleString();
        }

        // 更新市场份额
        const shareEl = document.querySelector('.share-percentage');
        if (shareEl) {
            shareEl.textContent = `${share}%`;
        }
    }

    initCharts() {
        // 初始化功率曲线图表
        this.createPowerChart();
    }

    createPowerChart() {
        const chartContainer = document.getElementById('power-chart');
        if (!chartContainer) return;

        // 创建简单的SVG图表
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.setAttribute('viewBox', '0 0 400 200');

        // 生成模拟数据
        const data = this.generateChartData();
        
        // 创建路径
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const pathData = this.createPathData(data);
        path.setAttribute('d', pathData);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', '#667eea');
        path.setAttribute('stroke-width', '2');

        // 创建网格线
        const gridLines = this.createGridLines();

        svg.appendChild(gridLines);
        svg.appendChild(path);
        chartContainer.appendChild(svg);
    }

    generateChartData() {
        const data = [];
        for (let i = 0; i < 24; i++) {
            data.push({
                x: i * 16.67,
                y: 180 - (Math.sin(i * 0.3) * 30 + Math.random() * 20 + 100)
            });
        }
        return data;
    }

    createPathData(data) {
        let path = `M ${data[0].x} ${data[0].y}`;
        for (let i = 1; i < data.length; i++) {
            path += ` L ${data[i].x} ${data[i].y}`;
        }
        return path;
    }

    createGridLines() {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        
        // 水平网格线
        for (let i = 0; i <= 4; i++) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', '0');
            line.setAttribute('y1', i * 50);
            line.setAttribute('x2', '400');
            line.setAttribute('y2', i * 50);
            line.setAttribute('stroke', '#e2e8f0');
            line.setAttribute('stroke-width', '1');
            group.appendChild(line);
        }

        // 垂直网格线
        for (let i = 0; i <= 6; i++) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', i * 66.67);
            line.setAttribute('y1', '0');
            line.setAttribute('x2', i * 66.67);
            line.setAttribute('y2', '200');
            line.setAttribute('stroke', '#e2e8f0');
            line.setAttribute('stroke-width', '1');
            group.appendChild(line);
        }

        return group;
    }

    updateChart(timeRange) {
        // 根据时间范围更新图表数据
        console.log(`更新图表数据: ${timeRange}`);
        // 这里可以添加实际的图表更新逻辑
    }

    handleControlAction(action) {
        // 处理控制按钮点击
        let message = '';
        let type = 'info';

        switch (action) {
            case '启动':
                message = '机组启动指令已发送';
                type = 'success';
                break;
            case '停止':
                message = '机组停止指令已发送';
                type = 'warning';
                break;
            case '紧急停机':
                message = '紧急停机指令已发送！';
                type = 'error';
                break;
        }

        this.showNotification(message, type);
    }

    updateParameter(input) {
        // 处理参数更新
        const value = input.value;
        const label = input.previousElementSibling.textContent;
        console.log(`更新参数: ${label} = ${value}`);
        
        this.showNotification(`参数 ${label} 已更新为 ${value}`, 'success');
    }

    handleSearch(query) {
        // 处理搜索功能
        console.log(`搜索: ${query}`);
        // 这里可以添加实际的搜索逻辑
    }

    showNotifications() {
        // 显示通知面板
        const notifications = [
            { title: '系统警告', message: '3号机组温度异常', time: '2分钟前', type: 'warning' },
            { title: '维护提醒', message: '1号机组需要定期维护', time: '1小时前', type: 'info' },
            { title: '数据更新', message: '实时数据已更新', time: '5分钟前', type: 'success' }
        ];

        this.showNotificationPanel(notifications);
    }

    showSettings() {
        // 显示设置面板
        this.showNotification('设置功能开发中...', 'info');
    }

    loadDataTable() {
        // 加载数据表格
        const tbody = document.getElementById('data-table-body');
        if (!tbody) return;

        // 清空现有数据
        tbody.innerHTML = '';

        // 生成模拟数据
        const data = this.generateTableData();
        
        data.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.time}</td>
                <td>${row.power}</td>
                <td>${row.efficiency}</td>
                <td>${row.temperature}</td>
                <td>${row.pressure}</td>
                <td><span class="status-badge ${row.status}">${row.statusText}</span></td>
            `;
            tbody.appendChild(tr);
        });
    }

    generateTableData() {
        const data = [];
        const now = new Date();
        
        for (let i = 0; i < 10; i++) {
            const time = new Date(now.getTime() - i * 3600000);
            data.push({
                time: time.toLocaleString(),
                power: Math.floor(1200 + Math.random() * 200),
                efficiency: (90 + Math.random() * 8).toFixed(1),
                temperature: Math.floor(530 + Math.random() * 20),
                pressure: (16 + Math.random() * 2).toFixed(1),
                status: Math.random() > 0.8 ? 'warning' : 'normal',
                statusText: Math.random() > 0.8 ? '异常' : '正常'
            });
        }
        
        return data;
    }

    queryData() {
        // 查询数据
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        
        if (!startDate || !endDate) {
            this.showNotification('请选择查询日期范围', 'warning');
            return;
        }

        this.showNotification('数据查询中...', 'info');
        setTimeout(() => {
            this.loadDataTable();
            this.showNotification('数据查询完成', 'success');
        }, 1000);
    }

    exportData(type) {
        // 导出数据
        this.showNotification(`${type.toUpperCase()} 导出中...`, 'info');
        setTimeout(() => {
            this.showNotification(`${type.toUpperCase()} 导出完成`, 'success');
        }, 2000);
    }

    handleUserAction(action, userItem) {
        // 处理用户操作
        const userName = userItem.querySelector('.user-name').textContent;
        
        if (action === 'edit') {
            this.showNotification(`编辑用户: ${userName}`, 'info');
        } else if (action === 'delete') {
            if (confirm(`确定要删除用户 ${userName} 吗？`)) {
                userItem.remove();
                this.showNotification(`用户 ${userName} 已删除`, 'success');
            }
        }
    }

    showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        // 添加样式
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border-radius: 8px;
            padding: 1rem;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 1rem;
            min-width: 300px;
            border-left: 4px solid ${this.getNotificationColor(type)};
            animation: slideIn 0.3s ease;
        `;

        // 添加关闭按钮事件
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });

        document.body.appendChild(notification);

        // 自动移除
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            warning: 'exclamation-triangle',
            error: 'times-circle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    getNotificationColor(type) {
        const colors = {
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#667eea'
        };
        return colors[type] || '#667eea';
    }

    showNotificationPanel(notifications) {
        // 创建通知面板
        const panel = document.createElement('div');
        panel.className = 'notification-panel';
        panel.innerHTML = `
            <div class="notification-panel-header">
                <h3>通知</h3>
                <button class="notification-panel-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="notification-panel-content">
                ${notifications.map(notification => `
                    <div class="notification-item">
                        <div class="notification-item-header">
                            <span class="notification-title">${notification.title}</span>
                            <span class="notification-time">${notification.time}</span>
                        </div>
                        <div class="notification-message">${notification.message}</div>
                    </div>
                `).join('')}
            </div>
        `;

        // 添加样式
        panel.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            width: 350px;
            max-height: 500px;
            overflow: hidden;
            animation: slideIn 0.3s ease;
        `;

        // 添加关闭事件
        panel.querySelector('.notification-panel-close').addEventListener('click', () => {
            panel.remove();
        });

        document.body.appendChild(panel);

        // 点击外部关闭
        document.addEventListener('click', function closePanel(e) {
            if (!panel.contains(e.target)) {
                panel.remove();
                document.removeEventListener('click', closePanel);
            }
        });
    }

    startRealTimeUpdates() {
        // 启动实时数据更新
        setInterval(() => {
            this.updateMetrics();
            this.updateMarketData();
        }, 5000); // 每5秒更新一次
    }

    // 设备管理：加载设备列表
    loadEquipmentList() {
        fetch('http://localhost:5001/api/admin/equipment')
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    this.renderEquipmentList(res.data);
                }
            });
    }

    // 设备管理：渲染设备列表
    renderEquipmentList(list) {
        const container = document.getElementById('equipment-list');
        if (!container) return;
        if (!list.length) {
            container.innerHTML = '<div style="padding:2rem;color:#888;">暂无设备数据</div>';
            return;
        }
        container.innerHTML = `<table class="equipment-table"><thead><tr><th>名称</th><th>类型</th><th>状态</th><th>描述</th><th>操作</th></tr></thead><tbody>
            ${list.map(item => `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.type || ''}</td>
                    <td>${item.status || ''}</td>
                    <td>${item.description || ''}</td>
                    <td>
                        <button class="btn-icon edit-equipment-btn" data-id="${item.id}"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon delete-equipment-btn" data-id="${item.id}"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `).join('')}
        </tbody></table>`;
    }

    // 设备管理：显示添加/编辑表单
    showEquipmentForm(id) {
        let data = {name:'', type:'', status:'', description:''};
        if (id) {
            // 获取当前设备数据
            fetch(`http://localhost:5001/api/admin/equipment`)
                .then(res => res.json())
                .then(res => {
                    const item = res.data.find(d => d.id == id);
                    if (item) {
                        this.renderEquipmentForm(item);
                    }
                });
        } else {
            this.renderEquipmentForm(data);
        }
    }

    // 设备管理：渲染表单弹窗
    renderEquipmentForm(data) {
        // 移除已有弹窗
        const old = document.getElementById('equipment-form-modal');
        if (old) old.remove();
        // 构建表单
        const modal = document.createElement('div');
        modal.id = 'equipment-form-modal';
        modal.innerHTML = `
        <div style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.2);z-index:9999;display:flex;align-items:center;justify-content:center;">
          <form style="background:#fff;padding:2rem 2.5rem;border-radius:12px;min-width:320px;box-shadow:0 4px 24px rgba(0,0,0,0.12);position:relative;" onsubmit="return false;">
            <h2 style="margin-bottom:1.5rem;">${data.id ? '编辑设备' : '添加设备'}</h2>
            <input type="hidden" id="equipment-id" value="${data.id||''}">
            <div style="margin-bottom:1rem;"><label>名称：</label><input id="equipment-name" value="${data.name||''}" required style="width:200px;"></div>
            <div style="margin-bottom:1rem;"><label>类型：</label><input id="equipment-type" value="${data.type||''}" style="width:200px;"></div>
            <div style="margin-bottom:1rem;"><label>状态：</label><input id="equipment-status" value="${data.status||''}" style="width:200px;"></div>
            <div style="margin-bottom:1rem;"><label>描述：</label><input id="equipment-description" value="${data.description||''}" style="width:200px;"></div>
            <div style="margin-top:1.5rem;text-align:right;">
              <button id="equipment-form-cancel" type="button" class="btn-secondary" style="margin-right:1rem;">取消</button>
              <button id="equipment-form-submit" type="button" class="btn-primary">提交</button>
            </div>
          </form>
        </div>`;
        document.body.appendChild(modal);
    }

    // 设备管理：提交表单
    submitEquipmentForm() {
        const id = document.getElementById('equipment-id').value;
        const name = document.getElementById('equipment-name').value.trim();
        const type = document.getElementById('equipment-type').value.trim();
        const status = document.getElementById('equipment-status').value.trim();
        const description = document.getElementById('equipment-description').value.trim();
        if (!name) { alert('设备名称不能为空'); return; }
        const data = {name, type, status, description};
        if (id) {
            fetch(`http://localhost:5001/api/admin/equipment/${id}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            }).then(() => {
                document.getElementById('equipment-form-modal').remove();
                this.loadEquipmentList();
            });
        } else {
            fetch('http://localhost:5001/api/admin/equipment', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            }).then(() => {
                document.getElementById('equipment-form-modal').remove();
                this.loadEquipmentList();
            });
        }
    }

    // 设备管理：删除设备
    deleteEquipment(id) {
        fetch(`http://localhost:5001/api/admin/equipment/${id}`, {
            method: 'DELETE'
        }).then(() => {
            this.loadEquipmentList();
        });
    }

    // 运行参数管理：加载参数列表
    loadOperationDataList() {
        fetch('http://localhost:5001/api/admin/operation_data')
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    this.renderOperationDataList(res.data);
                }
            });
    }

    // 运行参数管理：渲染参数列表
    renderOperationDataList(list) {
        const container = document.getElementById('operation-data-list');
        if (!container) return;
        if (!list.length) {
            container.innerHTML = '<div style="padding:2rem;color:#888;">暂无参数数据</div>';
            return;
        }
        container.innerHTML = `<table class="operation-data-table"><thead><tr><th>时间</th><th>功率(MW)</th><th>效率(%)</th><th>温度(°C)</th><th>压力(MPa)</th><th>状态</th><th>操作</th></tr></thead><tbody>
            ${list.map(item => `
                <tr>
                    <td>${item.timestamp || ''}</td>
                    <td>${item.power || ''}</td>
                    <td>${item.efficiency || ''}</td>
                    <td>${item.temperature || ''}</td>
                    <td>${item.pressure || ''}</td>
                    <td>${item.status || ''}</td>
                    <td>
                        <button class="btn-icon edit-operation-data-btn" data-id="${item.id}"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon delete-operation-data-btn" data-id="${item.id}"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `).join('')}
        </tbody></table>`;
    }

    // 运行参数管理：显示添加/编辑表单
    showOperationDataForm(id) {
        let data = {power:'', efficiency:'', temperature:'', pressure:'', status:''};
        if (id) {
            fetch('http://localhost:5001/api/admin/operation_data')
                .then(res => res.json())
                .then(res => {
                    const item = res.data.find(d => d.id == id);
                    if (item) {
                        this.renderOperationDataForm(item);
                    }
                });
        } else {
            this.renderOperationDataForm(data);
        }
    }

    // 运行参数管理：渲染表单弹窗
    renderOperationDataForm(data) {
        const old = document.getElementById('operation-data-form-modal');
        if (old) old.remove();
        const modal = document.createElement('div');
        modal.id = 'operation-data-form-modal';
        modal.innerHTML = `
        <div style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.2);z-index:9999;display:flex;align-items:center;justify-content:center;">
          <form style="background:#fff;padding:2rem 2.5rem;border-radius:12px;min-width:320px;box-shadow:0 4px 24px rgba(0,0,0,0.12);position:relative;" onsubmit="return false;">
            <h2 style="margin-bottom:1.5rem;">${data.id ? '编辑参数' : '添加参数'}</h2>
            <input type="hidden" id="operation-data-id" value="${data.id||''}">
            <div style="margin-bottom:1rem;"><label>功率(MW)：</label><input id="operation-data-power" value="${data.power||''}" type="number" style="width:200px;"></div>
            <div style="margin-bottom:1rem;"><label>效率(%)：</label><input id="operation-data-efficiency" value="${data.efficiency||''}" type="number" style="width:200px;"></div>
            <div style="margin-bottom:1rem;"><label>温度(°C)：</label><input id="operation-data-temperature" value="${data.temperature||''}" type="number" style="width:200px;"></div>
            <div style="margin-bottom:1rem;"><label>压力(MPa)：</label><input id="operation-data-pressure" value="${data.pressure||''}" type="number" style="width:200px;"></div>
            <div style="margin-bottom:1rem;"><label>状态：</label><input id="operation-data-status" value="${data.status||''}" style="width:200px;"></div>
            <div style="margin-top:1.5rem;text-align:right;">
              <button id="operation-data-form-cancel" type="button" class="btn-secondary" style="margin-right:1rem;">取消</button>
              <button id="operation-data-form-submit" type="button" class="btn-primary">提交</button>
            </div>
          </form>
        </div>`;
        document.body.appendChild(modal);
    }

    // 运行参数管理：提交表单
    submitOperationDataForm() {
        const id = document.getElementById('operation-data-id').value;
        const power = document.getElementById('operation-data-power').value.trim();
        const efficiency = document.getElementById('operation-data-efficiency').value.trim();
        const temperature = document.getElementById('operation-data-temperature').value.trim();
        const pressure = document.getElementById('operation-data-pressure').value.trim();
        const status = document.getElementById('operation-data-status').value.trim();
        const data = {power, efficiency, temperature, pressure, status};
        if (id) {
            fetch(`http://localhost:5001/api/admin/operation_data/${id}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            }).then(() => {
                document.getElementById('operation-data-form-modal').remove();
                this.loadOperationDataList();
            });
        } else {
            fetch('http://localhost:5001/api/admin/operation_data', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            }).then(() => {
                document.getElementById('operation-data-form-modal').remove();
                this.loadOperationDataList();
            });
        }
    }

    // 运行参数管理：删除参数
    deleteOperationData(id) {
        fetch(`http://localhost:5001/api/admin/operation_data/${id}`, {
            method: 'DELETE'
        }).then(() => {
            this.loadOperationDataList();
        });
    }

    // 市场数据管理：加载市场数据列表
    loadMarketDataList() {
        fetch('http://localhost:5001/api/admin/market_data')
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    this.renderMarketDataList(res.data);
                }
            });
    }

    // 市场数据管理：渲染市场数据列表
    renderMarketDataList(list) {
        const container = document.getElementById('market-data-list');
        if (!container) return;
        if (!list.length) {
            container.innerHTML = '<div style="padding:2rem;color:#888;">暂无市场数据</div>';
            return;
        }
        container.innerHTML = `<table class="market-data-table"><thead><tr><th>时间</th><th>价格</th><th>交易量</th><th>市场份额</th><th>操作</th></tr></thead><tbody>
            ${list.map(item => `
                <tr>
                    <td>${item.timestamp || ''}</td>
                    <td>${item.price || ''}</td>
                    <td>${item.volume || ''}</td>
                    <td>${item.market_share || ''}</td>
                    <td>
                        <button class="btn-icon edit-market-data-btn" data-id="${item.id}"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon delete-market-data-btn" data-id="${item.id}"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `).join('')}
        </tbody></table>`;
    }

    // 市场数据管理：显示添加/编辑表单
    showMarketDataForm(id) {
        let data = {price:'', volume:'', market_share:''};
        if (id) {
            fetch('http://localhost:5001/api/admin/market_data')
                .then(res => res.json())
                .then(res => {
                    const item = res.data.find(d => d.id == id);
                    if (item) {
                        this.renderMarketDataForm(item);
                    }
                });
        } else {
            this.renderMarketDataForm(data);
        }
    }

    // 市场数据管理：渲染表单弹窗
    renderMarketDataForm(data) {
        const old = document.getElementById('market-data-form-modal');
        if (old) old.remove();
        const modal = document.createElement('div');
        modal.id = 'market-data-form-modal';
        modal.innerHTML = `
        <div style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.2);z-index:9999;display:flex;align-items:center;justify-content:center;">
          <form style="background:#fff;padding:2rem 2.5rem;border-radius:12px;min-width:320px;box-shadow:0 4px 24px rgba(0,0,0,0.12);position:relative;" onsubmit="return false;">
            <h2 style="margin-bottom:1.5rem;">${data.id ? '编辑市场数据' : '添加市场数据'}</h2>
            <input type="hidden" id="market-data-id" value="${data.id||''}">
            <div style="margin-bottom:1rem;"><label>价格：</label><input id="market-data-price" value="${data.price||''}" type="number" style="width:200px;"></div>
            <div style="margin-bottom:1rem;"><label>交易量：</label><input id="market-data-volume" value="${data.volume||''}" type="number" style="width:200px;"></div>
            <div style="margin-bottom:1rem;"><label>市场份额：</label><input id="market-data-market_share" value="${data.market_share||''}" type="number" style="width:200px;"></div>
            <div style="margin-top:1.5rem;text-align:right;">
              <button id="market-data-form-cancel" type="button" class="btn-secondary" style="margin-right:1rem;">取消</button>
              <button id="market-data-form-submit" type="button" class="btn-primary">提交</button>
            </div>
          </form>
        </div>`;
        document.body.appendChild(modal);
    }

    // 市场数据管理：提交表单
    submitMarketDataForm() {
        const id = document.getElementById('market-data-id').value;
        const price = document.getElementById('market-data-price').value.trim();
        const volume = document.getElementById('market-data-volume').value.trim();
        const market_share = document.getElementById('market-data-market_share').value.trim();
        const data = {price, volume, market_share};
        if (id) {
            fetch(`http://localhost:5001/api/admin/market_data/${id}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            }).then(() => {
                document.getElementById('market-data-form-modal').remove();
                this.loadMarketDataList();
            });
        } else {
            fetch('http://localhost:5001/api/admin/market_data', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            }).then(() => {
                document.getElementById('market-data-form-modal').remove();
                this.loadMarketDataList();
            });
        }
    }

    // 市场数据管理：删除市场数据
    deleteMarketData(id) {
        fetch(`http://localhost:5001/api/admin/market_data/${id}`, {
            method: 'DELETE'
        }).then(() => {
            this.loadMarketDataList();
        });
    }

    // 公告管理：加载公告列表
    loadAnnouncementList() {
        fetch('http://localhost:5001/api/admin/announcement')
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    this.renderAnnouncementList(res.data);
                }
            });
    }

    // 公告管理：渲染公告列表
    renderAnnouncementList(list) {
        const container = document.getElementById('announcement-list');
        if (!container) return;
        if (!list.length) {
            container.innerHTML = '<div style="padding:2rem;color:#888;">暂无公告</div>';
            return;
        }
        container.innerHTML = `<table class="announcement-table"><thead><tr><th>标题</th><th>内容</th><th>状态</th><th>创建时间</th><th>操作</th></tr></thead><tbody>
            ${list.map(item => `
                <tr>
                    <td>${item.title || ''}</td>
                    <td>${item.content || ''}</td>
                    <td>${item.is_active ? '有效' : '无效'}</td>
                    <td>${item.created_at || ''}</td>
                    <td>
                        <button class="btn-icon edit-announcement-btn" data-id="${item.id}"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon delete-announcement-btn" data-id="${item.id}"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `).join('')}
        </tbody></table>`;
    }

    // 公告管理：显示添加/编辑表单
    showAnnouncementForm(id) {
        let data = {title:'', content:'', is_active:1};
        if (id) {
            fetch('http://localhost:5001/api/admin/announcement')
                .then(res => res.json())
                .then(res => {
                    const item = res.data.find(d => d.id == id);
                    if (item) {
                        this.renderAnnouncementForm(item);
                    }
                });
        } else {
            this.renderAnnouncementForm(data);
        }
    }

    // 公告管理：渲染表单弹窗
    renderAnnouncementForm(data) {
        const old = document.getElementById('announcement-form-modal');
        if (old) old.remove();
        const modal = document.createElement('div');
        modal.id = 'announcement-form-modal';
        modal.innerHTML = `
        <div style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.2);z-index:9999;display:flex;align-items:center;justify-content:center;">
          <form style="background:#fff;padding:2rem 2.5rem;border-radius:12px;min-width:320px;box-shadow:0 4px 24px rgba(0,0,0,0.12);position:relative;" onsubmit="return false;">
            <h2 style="margin-bottom:1.5rem;">${data.id ? '编辑公告' : '添加公告'}</h2>
            <input type="hidden" id="announcement-id" value="${data.id||''}">
            <div style="margin-bottom:1rem;"><label>标题：</label><input id="announcement-title" value="${data.title||''}" required style="width:200px;"></div>
            <div style="margin-bottom:1rem;"><label>内容：</label><textarea id="announcement-content" style="width:200px;">${data.content||''}</textarea></div>
            <div style="margin-bottom:1rem;"><label>状态：</label><select id="announcement-is_active"><option value="1" ${data.is_active==1?'selected':''}>有效</option><option value="0" ${data.is_active==0?'selected':''}>无效</option></select></div>
            <div style="margin-top:1.5rem;text-align:right;">
              <button id="announcement-form-cancel" type="button" class="btn-secondary" style="margin-right:1rem;">取消</button>
              <button id="announcement-form-submit" type="button" class="btn-primary">提交</button>
            </div>
          </form>
        </div>`;
        document.body.appendChild(modal);
    }

    // 公告管理：提交表单
    submitAnnouncementForm() {
        const id = document.getElementById('announcement-id').value;
        const title = document.getElementById('announcement-title').value.trim();
        const content = document.getElementById('announcement-content').value.trim();
        const is_active = document.getElementById('announcement-is_active').value;
        if (!title) { alert('公告标题不能为空'); return; }
        const data = {title, content, is_active};
        if (id) {
            fetch(`http://localhost:5001/api/admin/announcement/${id}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            }).then(() => {
                document.getElementById('announcement-form-modal').remove();
                this.loadAnnouncementList();
            });
        } else {
            fetch('http://localhost:5001/api/admin/announcement', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            }).then(() => {
                document.getElementById('announcement-form-modal').remove();
                this.loadAnnouncementList();
            });
        }
    }

    // 公告管理：删除公告
    deleteAnnouncement(id) {
        fetch(`http://localhost:5001/api/admin/announcement/${id}`, {
            method: 'DELETE'
        }).then(() => {
            this.loadAnnouncementList();
        });
    }

    // 系统设置：加载设置
    loadSystemSettings() {
        fetch('http://localhost:5001/api/admin/settings')
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    document.getElementById('site-name-input').value = res.data.site_name || '';
                    document.getElementById('theme-select').value = res.data.theme || 'light';
                }
            });
    }

    // 系统设置：保存设置
    saveSystemSettings() {
        const siteName = document.getElementById('site-name-input').value.trim();
        const theme = document.getElementById('theme-select').value;
        fetch('http://localhost:5001/api/admin/settings', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({site_name: siteName, theme})
        }).then(res => res.json()).then(res => {
            if (res.success) {
                // 刷新页面相关内容
                document.querySelector('.logo span').textContent = siteName;
                document.body.setAttribute('data-theme', theme);
                this.showNotification('设置已保存', 'success');
            }
        });
    }
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex: 1;
    }

    .notification-close {
        background: none;
        border: none;
        cursor: pointer;
        color: #64748b;
        padding: 0.25rem;
        border-radius: 4px;
        transition: all 0.3s ease;
    }

    .notification-close:hover {
        background: #f1f5f9;
        color: #374151;
    }

    .notification-panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 1.5rem;
        border-bottom: 1px solid #e2e8f0;
    }

    .notification-panel-header h3 {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 600;
        color: #1e293b;
    }

    .notification-panel-close {
        background: none;
        border: none;
        cursor: pointer;
        color: #64748b;
        padding: 0.5rem;
        border-radius: 4px;
        transition: all 0.3s ease;
    }

    .notification-panel-close:hover {
        background: #f1f5f9;
        color: #374151;
    }

    .notification-panel-content {
        max-height: 400px;
        overflow-y: auto;
    }

    .notification-item {
        padding: 1rem 1.5rem;
        border-bottom: 1px solid #e2e8f0;
        transition: all 0.3s ease;
    }

    .notification-item:hover {
        background: #f8fafc;
    }

    .notification-item:last-child {
        border-bottom: none;
    }

    .notification-item-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
    }

    .notification-title {
        font-weight: 600;
        color: #1e293b;
        font-size: 0.875rem;
    }

    .notification-time {
        font-size: 0.75rem;
        color: #64748b;
    }

    .notification-message {
        color: #64748b;
        font-size: 0.875rem;
        line-height: 1.4;
    }

    .status-badge {
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 500;
    }

    .status-badge.normal {
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;
    }

    .status-badge.warning {
        background: rgba(245, 158, 11, 0.1);
        color: #f59e0b;
    }
`;
document.head.appendChild(style);

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new PowerPlantApp();
}); 