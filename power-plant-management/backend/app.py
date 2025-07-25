from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import json
import random
import time
from datetime import datetime, timedelta
import sqlite3
import os

app = Flask(__name__)
CORS(app)  # 允许跨域请求

# 数据库初始化
def init_db():
    conn = sqlite3.connect('power_plant.db')
    cursor = conn.cursor()
    
    # 创建用户表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # 创建运行数据表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS operation_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            power REAL,
            efficiency REAL,
            temperature REAL,
            pressure REAL,
            status TEXT
        )
    ''')
    
    # 创建设备状态表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS equipment_status (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            equipment_name TEXT NOT NULL,
            status TEXT NOT NULL,
            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # 创建市场数据表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS market_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            price REAL,
            volume REAL,
            market_share REAL
        )
    ''')
    
    # 创建设备信息表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS equipment (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT,
            status TEXT,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    # 创建公告表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS announcement (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT,
            is_active INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    # 创建图表数据表
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS chart_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            chart_type TEXT NOT NULL,
            data_json TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # 插入初始数据
    cursor.execute('SELECT COUNT(*) FROM users')
    if cursor.fetchone()[0] == 0:
        cursor.execute('''
            INSERT INTO users (username, password, role) VALUES 
            ('admin', 'admin123', '系统管理员'),
            ('operator', 'operator123', '操作员'),
            ('engineer', 'engineer123', '工程师')
        ''')
    
    cursor.execute('SELECT COUNT(*) FROM equipment_status')
    if cursor.fetchone()[0] == 0:
        cursor.execute('''
            INSERT INTO equipment_status (equipment_name, status) VALUES 
            ('1号机组', 'online'),
            ('2号机组', 'online'),
            ('3号机组', 'maintenance')
        ''')
    
    # 系统设置表初始化
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS system_settings (
            key TEXT PRIMARY KEY,
            value TEXT
        )
    ''')
    # 初始化默认设置
    cursor.execute('SELECT COUNT(*) FROM system_settings')
    if cursor.fetchone()[0] == 0:
        cursor.execute('INSERT INTO system_settings (key, value) VALUES (?, ?)', ('site_name', '大有电厂'))
        cursor.execute('INSERT INTO system_settings (key, value) VALUES (?, ?)', ('theme', 'light'))
    
    conn.commit()
    conn.close()

# 初始化数据库
init_db()

# 路由：获取概览数据
@app.route('/api/overview', methods=['GET'])
def get_overview():
    """获取全景概览数据"""
    try:
        # 模拟实时数据
        data = {
            'metrics': {
                'power': {
                    'value': round(1200 + random.uniform(-50, 100), 1),
                    'trend': round(random.uniform(-3, 5), 1),
                    'unit': 'MW'
                },
                'efficiency': {
                    'value': round(90 + random.uniform(-2, 6), 1),
                    'trend': round(random.uniform(-1, 2), 1),
                    'unit': '%'
                },
                'temperature': {
                    'value': round(530 + random.uniform(-10, 20), 1),
                    'trend': round(random.uniform(-2, 2), 1),
                    'unit': '°C'
                },
                'pressure': {
                    'value': round(16 + random.uniform(-1, 2), 1),
                    'trend': round(random.uniform(-1, 1), 1),
                    'unit': 'MPa'
                }
            },
            'equipment': [
                {'name': '1号机组', 'status': 'online', 'text': '正常运行'},
                {'name': '2号机组', 'status': 'online', 'text': '正常运行'},
                {'name': '3号机组', 'status': 'maintenance', 'text': '维护中'}
            ],
            'timestamp': datetime.now().isoformat()
        }
        return jsonify({'success': True, 'data': data})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# 路由：获取功率曲线数据
@app.route('/api/chart/power', methods=['GET'])
def get_power_chart():
    """获取功率曲线数据"""
    try:
        time_range = request.args.get('range', '24h')
        
        # 根据时间范围生成数据点
        if time_range == '24h':
            points = 24
            interval = 1  # 小时
        elif time_range == '7d':
            points = 168
            interval = 1  # 小时
        else:  # 30d
            points = 30
            interval = 24  # 小时
        
        data = []
        base_time = datetime.now()
        
        for i in range(points):
            timestamp = base_time - timedelta(hours=i * interval)
            power = 1200 + random.uniform(-100, 100) + 50 * random.sin(i * 0.3)
            data.append({
                'timestamp': timestamp.isoformat(),
                'power': round(power, 1)
            })
        
        data.reverse()  # 按时间正序排列
        
        return jsonify({'success': True, 'data': data})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# 路由：运行管理 - 获取当前参数
@app.route('/api/operation/parameters', methods=['GET'])
def get_operation_parameters():
    """获取运行参数"""
    try:
        data = {
            'power_setpoint': 1250,
            'temperature_setpoint': 540,
            'pressure_setpoint': 16.8,
            'status': 'running'
        }
        return jsonify({'success': True, 'data': data})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# 路由：运行管理 - 更新参数
@app.route('/api/operation/parameters', methods=['POST'])
def update_operation_parameters():
    """更新运行参数"""
    try:
        data = request.get_json()
        
        # 验证参数
        required_fields = ['power_setpoint', 'temperature_setpoint', 'pressure_setpoint']
        for field in required_fields:
            if field not in data:
                return jsonify({'success': False, 'error': f'缺少参数: {field}'}), 400
        
        # 这里可以添加参数验证逻辑
        if not (0 <= data['power_setpoint'] <= 1500):
            return jsonify({'success': False, 'error': '功率设定值超出范围'}), 400
        
        if not (500 <= data['temperature_setpoint'] <= 560):
            return jsonify({'success': False, 'error': '温度设定值超出范围'}), 400
        
        if not (15 <= data['pressure_setpoint'] <= 18):
            return jsonify({'success': False, 'error': '压力设定值超出范围'}), 400
        
        # 保存到数据库（这里简化处理）
        print(f"更新运行参数: {data}")
        
        return jsonify({'success': True, 'message': '参数更新成功'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# 路由：运行管理 - 控制命令
@app.route('/api/operation/control', methods=['POST'])
def operation_control():
    """执行控制命令"""
    try:
        data = request.get_json()
        command = data.get('command')
        
        if command not in ['start', 'stop', 'emergency']:
            return jsonify({'success': False, 'error': '无效的控制命令'}), 400
        
        # 这里可以添加实际的控制逻辑
        command_messages = {
            'start': '机组启动指令已发送',
            'stop': '机组停止指令已发送',
            'emergency': '紧急停机指令已发送'
        }
        
        return jsonify({
            'success': True, 
            'message': command_messages[command],
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# 路由：电力市场数据
@app.route('/api/market/data', methods=['GET'])
def get_market_data():
    """获取电力市场数据"""
    try:
        data = {
            'price': round(0.8 + random.uniform(-0.1, 0.2), 2),
            'volume': round(25000 + random.uniform(-5000, 10000)),
            'market_share': round(14 + random.uniform(-2, 4), 1),
            'trend': random.choice(['up', 'down', 'stable']),
            'timestamp': datetime.now().isoformat()
        }
        return jsonify({'success': True, 'data': data})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# 路由：数据台账 - 查询数据
@app.route('/api/data/query', methods=['POST'])
def query_data():
    """查询历史数据"""
    try:
        data = request.get_json()
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        if not start_date or not end_date:
            return jsonify({'success': False, 'error': '请提供开始和结束日期'}), 400
        
        # 模拟查询结果
        records = []
        start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        
        current = start
        while current <= end:
            records.append({
                'timestamp': current.isoformat(),
                'power': round(1200 + random.uniform(-100, 100), 1),
                'efficiency': round(90 + random.uniform(-5, 8), 1),
                'temperature': round(530 + random.uniform(-15, 25), 1),
                'pressure': round(16 + random.uniform(-1.5, 2.5), 1),
                'status': 'normal' if random.random() > 0.1 else 'warning'
            })
            current += timedelta(hours=1)
        
        return jsonify({
            'success': True, 
            'data': records,
            'total': len(records)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# 路由：数据台账 - 导出数据
@app.route('/api/data/export', methods=['POST'])
def export_data():
    """导出数据"""
    try:
        data = request.get_json()
        export_type = data.get('type', 'excel')
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        if export_type not in ['excel', 'pdf']:
            return jsonify({'success': False, 'error': '不支持的导出格式'}), 400
        
        # 这里可以添加实际的导出逻辑
        filename = f"power_plant_data_{start_date}_{end_date}.{export_type}"
        
        return jsonify({
            'success': True,
            'message': f'{export_type.upper()} 导出成功',
            'filename': filename,
            'download_url': f'/api/download/{filename}'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# 路由：系统管理 - 获取用户列表
@app.route('/api/admin/users', methods=['GET'])
def get_users():
    """获取用户列表"""
    try:
        conn = sqlite3.connect('power_plant.db')
        cursor = conn.cursor()
        cursor.execute('SELECT id, username, role, created_at FROM users')
        users = []
        for row in cursor.fetchall():
            users.append({
                'id': row[0],
                'username': row[1],
                'role': row[2],
                'created_at': row[3]
            })
        conn.close()
        
        return jsonify({'success': True, 'data': users})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# 路由：系统管理 - 添加用户
@app.route('/api/admin/users', methods=['POST'])
def add_user():
    """添加用户"""
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        role = data.get('role')
        
        if not all([username, password, role]):
            return jsonify({'success': False, 'error': '请提供完整的用户信息'}), 400
        
        conn = sqlite3.connect('power_plant.db')
        cursor = conn.cursor()
        cursor.execute('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', 
                      (username, password, role))
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': '用户添加成功'})
    except sqlite3.IntegrityError:
        return jsonify({'success': False, 'error': '用户名已存在'}), 400
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# 路由：系统管理 - 删除用户
@app.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    """删除用户"""
    try:
        conn = sqlite3.connect('power_plant.db')
        cursor = conn.cursor()
        cursor.execute('DELETE FROM users WHERE id = ?', (user_id,))
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': '用户删除成功'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# 路由：系统管理 - 更新用户
@app.route('/api/admin/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    """更新用户信息"""
    try:
        data = request.get_json()
        username = data.get('username')
        role = data.get('role')
        
        if not all([username, role]):
            return jsonify({'success': False, 'error': '请提供完整的用户信息'}), 400
        
        conn = sqlite3.connect('power_plant.db')
        cursor = conn.cursor()
        cursor.execute('UPDATE users SET username = ?, role = ? WHERE id = ?', 
                      (username, role, user_id))
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': '用户信息更新成功'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# 路由：认证 - 登录
@app.route('/api/auth/login', methods=['POST'])
def login():
    """用户登录"""
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'success': False, 'error': '请提供用户名和密码'}), 400
        
        conn = sqlite3.connect('power_plant.db')
        cursor = conn.cursor()
        cursor.execute('SELECT id, username, role FROM users WHERE username = ? AND password = ?', 
                      (username, password))
        user = cursor.fetchone()
        conn.close()
        
        if user:
            return jsonify({
                'success': True,
                'data': {
                    'id': user[0],
                    'username': user[1],
                    'role': user[2],
                    'token': 'mock_token_' + str(int(time.time()))
                }
            })
        else:
            return jsonify({'success': False, 'error': '用户名或密码错误'}), 401
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# 路由：系统状态
@app.route('/api/system/status', methods=['GET'])
def get_system_status():
    """获取系统状态"""
    try:
        data = {
            'status': 'running',
            'uptime': '15天 8小时 32分钟',
            'version': '1.0.0',
            'last_backup': '2024-01-15 02:00:00',
            'disk_usage': '45%',
            'memory_usage': '62%',
            'cpu_usage': '28%',
            'timestamp': datetime.now().isoformat()
        }
        return jsonify({'success': True, 'data': data})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# 路由：系统日志
@app.route('/api/system/logs', methods=['GET'])
def get_system_logs():
    """获取系统日志"""
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 50))
        
        # 模拟日志数据
        logs = []
        log_levels = ['INFO', 'WARNING', 'ERROR', 'DEBUG']
        log_messages = [
            '系统启动完成',
            '数据备份完成',
            '用户登录成功',
            '参数更新成功',
            '设备状态检查完成',
            '数据库连接正常',
            '网络连接正常',
            '存储空间充足'
        ]
        
        for i in range(limit):
            timestamp = datetime.now() - timedelta(minutes=i * 5)
            logs.append({
                'id': i + 1,
                'timestamp': timestamp.isoformat(),
                'level': random.choice(log_levels),
                'message': random.choice(log_messages),
                'user': random.choice(['admin', 'operator', 'system'])
            })
        
        return jsonify({
            'success': True,
            'data': logs,
            'total': 1000,
            'page': page,
            'limit': limit
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# 错误处理
@app.errorhandler(404)
def not_found(error):
    return jsonify({'success': False, 'error': '接口不存在'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'success': False, 'error': '服务器内部错误'}), 500

# 健康检查
@app.route('/api/health', methods=['GET'])
def health_check():
    """健康检查接口"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

# 虚拟接口：获取用户信息
@app.route('/api/mock/user', methods=['GET'])
def mock_user():
    return jsonify({
        'success': True,
        'data': {
            'id': 1,
            'username': 'testuser',
            'role': 'admin',
            'email': 'testuser@example.com'
        }
    })

# 虚拟接口：登录
@app.route('/api/mock/login', methods=['POST'])
def mock_login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    if username == 'testuser' and password == '123456':
        return jsonify({'success': True, 'token': 'mock-jwt-token'})
    else:
        return jsonify({'success': False, 'error': '用户名或密码错误'}), 401

# 虚拟接口：获取测试数据
@app.route('/api/mock/data', methods=['GET'])
def mock_data():
    return jsonify({
        'success': True,
        'data': [
            {'id': 1, 'value': 'A'},
            {'id': 2, 'value': 'B'},
            {'id': 3, 'value': 'C'}
        ]
    })

# 设备管理接口
@app.route('/api/admin/equipment', methods=['GET'])
def get_equipment():
    conn = sqlite3.connect('power_plant.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM equipment')
    rows = cursor.fetchall()
    conn.close()
    equipment = [
        {
            'id': row[0],
            'name': row[1],
            'type': row[2],
            'status': row[3],
            'description': row[4],
            'created_at': row[5],
            'updated_at': row[6]
        } for row in rows
    ]
    return jsonify({'success': True, 'data': equipment})

@app.route('/api/admin/equipment', methods=['POST'])
def add_equipment():
    data = request.get_json()
    conn = sqlite3.connect('power_plant.db')
    cursor = conn.cursor()
    cursor.execute('''INSERT INTO equipment (name, type, status, description) VALUES (?, ?, ?, ?)''',
                   (data.get('name'), data.get('type'), data.get('status'), data.get('description')))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': '设备添加成功'})

@app.route('/api/admin/equipment/<int:equipment_id>', methods=['PUT'])
def update_equipment(equipment_id):
    data = request.get_json()
    conn = sqlite3.connect('power_plant.db')
    cursor = conn.cursor()
    cursor.execute('''UPDATE equipment SET name=?, type=?, status=?, description=?, updated_at=CURRENT_TIMESTAMP WHERE id=?''',
                   (data.get('name'), data.get('type'), data.get('status'), data.get('description'), equipment_id))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': '设备信息更新成功'})

@app.route('/api/admin/equipment/<int:equipment_id>', methods=['DELETE'])
def delete_equipment(equipment_id):
    conn = sqlite3.connect('power_plant.db')
    cursor = conn.cursor()
    cursor.execute('DELETE FROM equipment WHERE id=?', (equipment_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': '设备删除成功'})

# 运行参数管理接口
@app.route('/api/admin/operation_data', methods=['GET'])
def get_operation_data():
    conn = sqlite3.connect('power_plant.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM operation_data')
    rows = cursor.fetchall()
    conn.close()
    data = [
        {
            'id': row[0],
            'timestamp': row[1],
            'power': row[2],
            'efficiency': row[3],
            'temperature': row[4],
            'pressure': row[5],
            'status': row[6]
        } for row in rows
    ]
    return jsonify({'success': True, 'data': data})

@app.route('/api/admin/operation_data', methods=['POST'])
def add_operation_data():
    data = request.get_json()
    conn = sqlite3.connect('power_plant.db')
    cursor = conn.cursor()
    cursor.execute('''INSERT INTO operation_data (power, efficiency, temperature, pressure, status) VALUES (?, ?, ?, ?, ?)''',
                   (data.get('power'), data.get('efficiency'), data.get('temperature'), data.get('pressure'), data.get('status')))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': '运行参数添加成功'})

@app.route('/api/admin/operation_data/<int:data_id>', methods=['PUT'])
def update_operation_data(data_id):
    data = request.get_json()
    conn = sqlite3.connect('power_plant.db')
    cursor = conn.cursor()
    cursor.execute('''UPDATE operation_data SET power=?, efficiency=?, temperature=?, pressure=?, status=? WHERE id=?''',
                   (data.get('power'), data.get('efficiency'), data.get('temperature'), data.get('pressure'), data.get('status'), data_id))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': '运行参数更新成功'})

@app.route('/api/admin/operation_data/<int:data_id>', methods=['DELETE'])
def delete_operation_data(data_id):
    conn = sqlite3.connect('power_plant.db')
    cursor = conn.cursor()
    cursor.execute('DELETE FROM operation_data WHERE id=?', (data_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': '运行参数删除成功'})

# 市场数据管理接口
@app.route('/api/admin/market_data', methods=['GET'])
def get_market_data_admin():
    conn = sqlite3.connect('power_plant.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM market_data')
    rows = cursor.fetchall()
    conn.close()
    data = [
        {
            'id': row[0],
            'timestamp': row[1],
            'price': row[2],
            'volume': row[3],
            'market_share': row[4]
        } for row in rows
    ]
    return jsonify({'success': True, 'data': data})

@app.route('/api/admin/market_data', methods=['POST'])
def add_market_data():
    data = request.get_json()
    conn = sqlite3.connect('power_plant.db')
    cursor = conn.cursor()
    cursor.execute('''INSERT INTO market_data (price, volume, market_share) VALUES (?, ?, ?)''',
                   (data.get('price'), data.get('volume'), data.get('market_share')))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': '市场数据添加成功'})

@app.route('/api/admin/market_data/<int:data_id>', methods=['PUT'])
def update_market_data(data_id):
    data = request.get_json()
    conn = sqlite3.connect('power_plant.db')
    cursor = conn.cursor()
    cursor.execute('''UPDATE market_data SET price=?, volume=?, market_share=? WHERE id=?''',
                   (data.get('price'), data.get('volume'), data.get('market_share'), data_id))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': '市场数据更新成功'})

@app.route('/api/admin/market_data/<int:data_id>', methods=['DELETE'])
def delete_market_data(data_id):
    conn = sqlite3.connect('power_plant.db')
    cursor = conn.cursor()
    cursor.execute('DELETE FROM market_data WHERE id=?', (data_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': '市场数据删除成功'})

# 公告管理接口
@app.route('/api/admin/announcement', methods=['GET'])
def get_announcements():
    conn = sqlite3.connect('power_plant.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM announcement')
    rows = cursor.fetchall()
    conn.close()
    data = [
        {
            'id': row[0],
            'title': row[1],
            'content': row[2],
            'is_active': row[3],
            'created_at': row[4],
            'updated_at': row[5]
        } for row in rows
    ]
    return jsonify({'success': True, 'data': data})

@app.route('/api/admin/announcement', methods=['POST'])
def add_announcement():
    data = request.get_json()
    conn = sqlite3.connect('power_plant.db')
    cursor = conn.cursor()
    cursor.execute('''INSERT INTO announcement (title, content, is_active) VALUES (?, ?, ?)''',
                   (data.get('title'), data.get('content'), data.get('is_active')))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': '公告添加成功'})

@app.route('/api/admin/announcement/<int:announcement_id>', methods=['PUT'])
def update_announcement(announcement_id):
    data = request.get_json()
    conn = sqlite3.connect('power_plant.db')
    cursor = conn.cursor()
    cursor.execute('''UPDATE announcement SET title=?, content=?, is_active=?, updated_at=CURRENT_TIMESTAMP WHERE id=?''',
                   (data.get('title'), data.get('content'), data.get('is_active'), announcement_id))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': '公告更新成功'})

@app.route('/api/admin/announcement/<int:announcement_id>', methods=['DELETE'])
def delete_announcement(announcement_id):
    conn = sqlite3.connect('power_plant.db')
    cursor = conn.cursor()
    cursor.execute('DELETE FROM announcement WHERE id=?', (announcement_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': '公告删除成功'})

# 系统设置接口
@app.route('/api/admin/settings', methods=['GET'])
def get_settings():
    conn = sqlite3.connect('power_plant.db')
    cursor = conn.cursor()
    cursor.execute('SELECT key, value FROM system_settings')
    settings = {row[0]: row[1] for row in cursor.fetchall()}
    conn.close()
    return jsonify({'success': True, 'data': settings})

@app.route('/api/admin/settings', methods=['POST'])
def save_settings():
    data = request.get_json()
    conn = sqlite3.connect('power_plant.db')
    cursor = conn.cursor()
    for k, v in data.items():
        cursor.execute('REPLACE INTO system_settings (key, value) VALUES (?, ?)', (k, v))
    conn.commit()
    conn.close()
    return jsonify({'success': True, 'message': '设置已保存'})

if __name__ == '__main__':
    print("启动大有电厂管理平台后端服务...")
    print("API文档:")
    print("  - 概览数据: GET /api/overview")
    print("  - 功率曲线: GET /api/chart/power")
    print("  - 运行参数: GET /api/operation/parameters")
    print("  - 市场数据: GET /api/market/data")
    print("  - 用户管理: GET /api/admin/users")
    print("  - 系统状态: GET /api/system/status")
    print("  - 健康检查: GET /api/health")
    print("\n服务地址: http://localhost:5001")
    
    app.run(debug=True, host='0.0.0.0', port=5001) 