#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import csv
import json
import hashlib
import base64
import os
from datetime import datetime

def generate_hash_filename(username, password):
    """生成用户认证的hash文件名"""
    # 组合用户名和密码（用户名转小写）
    combined = f"{username.lower()}:{password}"
    
    # 生成SHA-256 hash
    hash_obj = hashlib.sha256(combined.encode('utf-8'))
    hash_bytes = hash_obj.digest()
    
    # 使用前16字节生成Base64文件名（URL安全版本）
    short_hash = hash_bytes[:16]
    base64_str = base64.b64encode(short_hash).decode('ascii')
    # 替换URL不安全字符
    base64_str = base64_str.replace('+', '-').replace('/', '_').replace('=', '')
    
    return base64_str + '.json'

def read_investor_data(csv_file, investor_name):
    """从CSV文件中读取特定投资者的数据"""
    investor_data = []
    
    if not os.path.exists(csv_file):
        return investor_data
    
    with open(csv_file, 'r', encoding='utf-8-sig') as f:  # 使用utf-8-sig处理BOM
        reader = csv.DictReader(f)
        for row in reader:
            if row.get('investor', '').lower() == investor_name.lower():
                # 转换数据类型
                data = {
                    'date': row.get('Date', ''),
                    'investor': row.get('investor', ''),
                    'nav': float(row.get('NAV per unit', 0) or 0),
                    'principal': float(row.get('principal', 0) or 0),
                    'net_nav': float(row.get('net_nav', 0) or 0),
                    'net_pnl': float(row.get('net_pnl', 0) or 0),
                    'realized_pnl': float(row.get('realized_pnl', 0) or 0),
                    'total_return': float(row.get('total_return', 0) or 0),
                    'coin': row.get('coin', 'USDT')
                }
                investor_data.append(data)
    
    return investor_data

def main():
    """主函数"""
    # 创建输出目录
    output_dir = '../data/users'
    os.makedirs(output_dir, exist_ok=True)
    
    # 读取密码文件
    with open('../data/password.csv', 'r', encoding='utf-8-sig') as f:  # 使用utf-8-sig处理BOM
        reader = csv.DictReader(f)
        users = list(reader)
        
        # 调试：打印第一个用户的键
        if users:
            print("CSV columns:", list(users[0].keys()))
    
    print(f"Found {len(users)} users to migrate")
    
    # 为每个用户生成hash文件
    for user in users:
        # 尝试不同的可能的列名
        username = user.get('name') or user.get('Name') or user.get('用户名')
        password = user.get('password') or user.get('Password') or user.get('密码')
        
        if not username or not password:
            print(f"Skipping user with missing data: {user}")
            continue
        
        # 生成hash文件名
        hash_filename = generate_hash_filename(username, password)
        output_path = os.path.join(output_dir, hash_filename)
        
        print(f"\nProcessing user: {username}")
        print(f"  Hash filename: {hash_filename}")
        
        # 收集用户的投资数据
        user_data = {
            'username': username,
            'created_at': datetime.now().isoformat(),
            'investments': {
                'balanced': [],
                'arbitrage': [],
                'arbitrage_coin': []
            }
        }
        
        # 从各个CSV文件读取数据
        balanced_data = read_investor_data('../data/balanced_investor.csv', username)
        if balanced_data:
            user_data['investments']['balanced'] = balanced_data
            print(f"  Found {len(balanced_data)} balanced records")
        
        arbitrage_data = read_investor_data('../data/arbitrage_investor.csv', username)
        if arbitrage_data:
            user_data['investments']['arbitrage'] = arbitrage_data
            print(f"  Found {len(arbitrage_data)} arbitrage records")
        
        arbitrage_coin_data = read_investor_data('../data/arbitrage_coin_investor.csv', username)
        if arbitrage_coin_data:
            user_data['investments']['arbitrage_coin'] = arbitrage_coin_data
            print(f"  Found {len(arbitrage_coin_data)} arbitrage_coin records")
        
        # 保存到JSON文件
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(user_data, f, ensure_ascii=False, indent=2)
        
        print(f"  Saved to: {output_path}")
    
    print(f"\nMigration completed! Created {len(users)} user hash files.")
    
    # 输出示例登录信息
    if users:
        test_user = users[0]
        username = test_user.get('name') or test_user.get('Name') or test_user.get('用户名')
        password = test_user.get('password') or test_user.get('Password') or test_user.get('密码')
        if username and password:
            print("\n" + "="*50)
            print("Example login for testing:")
            print(f"Username: {username}")
            print(f"Password: {password}")
            print(f"Hash file: {generate_hash_filename(username, password)}")

if __name__ == '__main__':
    main() 