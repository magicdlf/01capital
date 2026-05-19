#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Thu Jul  3 11:20:59 2025

@author: weijiaxin
"""
  
    
"""
Update User JSON Files from CSV with Hash-based Filename Mapping

This script updates existing user JSON files with new data from CSV files.
It preserves existing files and uses hardcoded hash values for filename mapping.

Usage:
    python json_upload.py [csv_data_path] [json_save_path] [password_file_path]
    
Examples:
    python json_upload.py                                    # Use default paths
    python json_upload.py /path/to/csv/data                 # Custom CSV path
    python json_upload.py /path/to/csv/data /path/to/users  # Custom CSV and JSON paths
    python json_upload.py /path/to/csv/data /path/to/users /path/to/password.csv  # All custom paths
"""

import csv
import json
import os
import sys
from datetime import datetime, date
from pathlib import Path
from typing import Dict, List, Any
import mysql.connector
from config import get_config

root_folder_path = os.path.abspath(os.getcwd())
root_folder_path = os.path.join(root_folder_path,'data')
web_path = os.path.join(os.path.abspath(os.getcwd()),'web_output')

# generate_hash_filename function removed - now using hash values directly from hardcoded mapping

def safe_float(value, default=0.0):
    """
    Safely convert value to float, handling None, empty strings, and invalid values.
    
    Args:
        value: Value to convert (can be string, number, None, etc.)
        default: Default value to return if conversion fails (default: 0.0)
    
    Returns:
        float: Converted value or default if conversion fails
    """
    if value is None:
        return default
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, str):
        value = value.strip()
        if not value or value == '':
            return default
        try:
            return float(value)
        except (ValueError, TypeError):
            return default
    try:
        return float(value)
    except (ValueError, TypeError):
        return default

class UserDataUpdater:
    def __init__(self, csv_data_dir: str = "data", json_save_dir: str = "data/users", password_file: str = "data/password.csv", fund_unit_csv_dir: str = None):
        """
        Initialize the updater with custom paths
        
        Args:
            csv_data_dir: Directory containing CSV files (arbitrage_investor.csv, etc.)
            json_save_dir: Directory where JSON files will be saved
            password_file: Path to password.csv file (deprecated, kept for backward compatibility)
            fund_unit_csv_dir: Directory containing fund_unit.csv (if different from csv_data_dir)
        """
        self.csv_data_dir = Path(csv_data_dir)
        self.json_save_dir = Path(json_save_dir)
        self.password_file = Path(password_file)
        # If fund_unit_csv_dir is not specified, use csv_data_dir
        self.fund_unit_csv_dir = Path(fund_unit_csv_dir) if fund_unit_csv_dir else self.csv_data_dir
        
        # Load database configuration
        self._CFG = get_config()
        
        # CSV file mappings
        self.csv_files = {
            "arbitrage": "arbitrage_investor.csv",
            "arbitrage2": "arbitrage2_investor.csv",
            "balanced": "balanced_investor.csv", 
            "arbitrage_coin": "arbitrage_coin_investor.csv",
            "arbitrage_eth": "arbitrage_eth_investor.csv",
            "growth": "growth_investor.csv",
            "paarb": "paarb_investor.csv"
        }
        
        # Store user data
        self.users_data = {}
        
        # Store username to hash mapping
        self.username_hash_map = {}
        
        # Validate paths
        if not self.csv_data_dir.exists():
            print(f"Warning: CSV data directory '{self.csv_data_dir}' does not exist")
        
        # Create JSON save directory if it doesn't exist
        self.json_save_dir.mkdir(parents=True, exist_ok=True)
        
        # Load username-hash mapping
        self.load_hash_mapping()
        
    def load_hash_mapping(self):
        """Load username to hash mapping from hardcoded values"""
        # Hardcoded username-hash mapping
        self.username_hash_map = {
            "miao": "K7Y7YOMNMEJGUThcOwWLJQ",
            "chao": "abzqT3rLVVAdsFji0QMPBg",
            "bon": "p1EbyPw4RgV_w_6PFdXSTg",
            "tt": "IrU-PVhe0tHXfRglPfia6w",
            "ying": "RMdDu2Ge7vpkRVH9ajEsCA",
            "octopus": "AYH7uF0GEEq-i_EV0fonBw",
            "sam": "G_Zu0heW-RoFyWd4j86z3A",
            "alex": "vjiX-Zf4wb0ENWZVzoffCw",
            "hp": "zt7haqELynsfY7zuJQQStA",
            "jennifer": "Jcia8HA2GdPkwlVib8w6DQ",
            "turbo": "PJRnvofw6ocb9u8Ox1wJTQ",
            "cheryl": "iQYdqgTx28hrSgaBgC8Xig",
            "lg": "zbgHGVn8qxkgmdE-cTE_pQ",
            "gang": "D1xmXUFELhXWIkbQj6ZkBg",
            "zc": "rKtE7kq_luKRl3bIF8_p3w",
            "cassius": "ZR4eljg1XDsumtyfPARL-g"
            
        }
        print(f"Loaded {len(self.username_hash_map)} username-hash mappings from hardcoded values")
    
    def read_csv_file(self, csv_path: Path) -> List[Dict[str, Any]]:
        """Read CSV file and return list of dictionaries"""
        data = []
        try:
            # Use utf-8-sig to handle BOM (Byte Order Mark) in CSV files
            with open(csv_path, 'r', encoding='utf-8-sig') as file:
                reader = csv.DictReader(file)
                for row in reader:
                    data.append(row)
            print(f"Read {len(data)} rows from {csv_path.name}")
        except FileNotFoundError:
            print(f"Warning: {csv_path} not found")
        except Exception as e:
            print(f"Error reading {csv_path}: {e}")
        return data
    
    def process_investment_data(self, csv_data: List[Dict[str, Any]], investment_type: str):
        """Process investment data and organize by user"""
        for row in csv_data:
            investor = row.get('investor', '').strip()
            if not investor:
                continue
                
            # Initialize user if not exists
            if investor not in self.users_data:
                self.users_data[investor] = {
                    "username": investor,
                    "created_at": datetime.now().isoformat(),
                    "investments": {
                        "balanced": [],
                        "arbitrage": [],
                        "arbitrage2": [],
                        "arbitrage_coin": [],
                        "arbitrage_eth": [],
                        "growth": [],
                        "paarb":[]
                    },
                    "investment_details": []
                }
            
            # Create investment record
            try:
                investment_record = {
                    "date": row.get('Date', ''),
                    "nav": safe_float(row.get('NAV per unit', 0)),
                    "principal": safe_float(row.get('principal', 0)),
                    "net_nav": safe_float(row.get('net_nav', 0)),
                    "net_pnl": safe_float(row.get('net_pnl', 0)),
                    "realized_pnl": safe_float(row.get('realized_pnl', 0)),
                    "total_return": safe_float(row.get('total_return', 0)),
                    "coin": row.get('coin', 'USDT')
                }
                
                # Add to user's investment data
                self.users_data[investor]["investments"][investment_type].append(investment_record)
            except (ValueError, TypeError) as e:
                print(f"Warning: Skipping invalid data for {investor} on {row.get('Date', 'unknown date')}: {e}")
    
    def process_fund_unit_data(self, fund_unit_data: List[Dict[str, Any]]):
        """Process fund_unit data from database and organize by user"""
        # Fund name mapping
        fund_name_mapping = {
            'zerone': 'Alpha-Bridge',
            'HPU': 'Stable-Harbor-USDT',
            'binggan': 'Stable-Harbor-BTC',
            'HPE': 'Stable-Harbor-ETH',
            'DG': 'Deep-Growth',
            'HPU2026': 'Stable-Harbor-USDT 2.0',
            'PAarb': 'Arbitrage-USDT'
        }
        
        for row in fund_unit_data:
            investor = row.get('investor', '').strip()
            if not investor:
                continue
            
            # Initialize user if not exists
            if investor not in self.users_data:
                self.users_data[investor] = {
                    "username": investor,
                    "created_at": datetime.now().isoformat(),
                    "investments": {
                        "balanced": [],
                        "arbitrage": [],
                        "arbitrage2": [],
                        "arbitrage_coin": [],
                        "arbitrage_eth": [],
                        "growth": [],
                        "paarb":[]
                    },
                    "investment_details": []
                }
            
            # Create investment detail record
            try:
                # Get fund code and map to product name
                fund_code = row.get('fund', '').strip()
                fund_name = fund_name_mapping.get(fund_code, fund_code)  # Use mapped name or original if not found
                
                # Convert date to string if it's a datetime/date object
                date_value = row.get('date', '')
                if isinstance(date_value, datetime):
                    date_value = date_value.isoformat()
                elif hasattr(date_value, 'isoformat'):  # Handle date objects
                    date_value = date_value.isoformat()
                elif date_value is None:
                    date_value = ''
                
                detail_record = {
                    "fund": fund_name,  # Store mapped product name instead of fund code
                    "date": date_value,
                    "investor": row.get('investor', ''),
                    "action": row.get('action', ''),
                    "coin": row.get('coin', ''),
                    "amount": safe_float(row.get('amount', 0)),
                    "unit": safe_float(row.get('unit', 0)),
                    "principal": safe_float(row.get('principal', 0)),
                    "unit_total": safe_float(row.get('unit_total', 0)),
                    "unit_chg": safe_float(row.get('unit_chg', 0)),
                    "carry_fee": safe_float(row.get('carry_fee', 0)),
                    "management_fee": safe_float(row.get('management_fee', 0)),
                    "realized_pnl": safe_float(row.get('realized_pnl', 0)),
                    "realized_mgm": safe_float(row.get('realized_mgm', 0)),
                    "realized_carry": safe_float(row.get('realized_carry', 0)),
                    "nav_per_unit": safe_float(row.get('nav_per_unit', 0))
                }
                
                # Add to user's investment details
                if "investment_details" not in self.users_data[investor]:
                    self.users_data[investor]["investment_details"] = []
                self.users_data[investor]["investment_details"].append(detail_record)
            except (ValueError, TypeError) as e:
                print(f"Warning: Skipping invalid fund_unit data for {investor} on {row.get('date', 'unknown date')}: {e}")
    
    def update_existing_json_files(self):
        """Update existing JSON files with new data, handle hash changes"""
        if not self.json_save_dir.exists():
            print(f"JSON save directory {self.json_save_dir} does not exist")
            return
        
        updated_count = 0
        hash_changed_files = []  # Track files that need to be recreated due to hash change
        
        for json_file in self.json_save_dir.glob("*.json"):
            try:
                # Read existing JSON file
                with open(json_file, 'r', encoding='utf-8') as file:
                    existing_data = json.load(file)
                
                username = existing_data.get('username', '')
                if not username:
                    continue
                
                # Check if hash has changed
                current_hash = self.username_hash_map.get(username, '')
                file_hash = json_file.stem  # Get filename without .json extension
                
                # If hash has changed, mark for recreation
                if current_hash and current_hash != file_hash:
                    print(f"Hash changed for user {username}: old={file_hash}, new={current_hash}")
                    hash_changed_files.append((username, json_file, existing_data))
                    continue
                
                # Always preserve existing data structure - start with existing data
                updated_data = existing_data.copy()
                
                # Update only specific fields from new data
                if username in self.users_data:
                    new_data = self.users_data[username]
                    
                    # Merge investments by type: only overwrite a type when the new data
                    # is non-empty, so missing CSV files never wipe existing data.
                    if 'investments' in new_data:
                        if 'investments' not in updated_data:
                            updated_data['investments'] = {}
                        for inv_type, records in new_data['investments'].items():
                            if records:  # only update when new data is non-empty
                                updated_data['investments'][inv_type] = records
                    
                    # Always update investment_details from database
                    if 'investment_details' in new_data and new_data['investment_details']:
                        updated_data['investment_details'] = new_data['investment_details']
                    elif 'investment_details' not in updated_data:
                        updated_data['investment_details'] = []
                
                # Preserve password_changed_at if exists
                if 'password_changed_at' in existing_data:
                    updated_data['password_changed_at'] = existing_data['password_changed_at']
                
                # Write updated data
                with open(json_file, 'w', encoding='utf-8') as file:
                    json.dump(updated_data, file, indent=2, ensure_ascii=False)
                    
                print(f"Updated {json_file.name} for user {username}")
                updated_count += 1
                    
            except Exception as e:
                print(f"Error updating {json_file.name}: {e}")
        
        # Handle hash changes: create new files and delete old ones
        for username, old_file, existing_data in hash_changed_files:
            new_hash = self.username_hash_map.get(username, '')
            if not new_hash:
                print(f"Warning: No hash found for user {username}, skipping hash change")
                continue
            
            # Merge existing data with new data
            updated_data = existing_data.copy()
            if username in self.users_data:
                new_data = self.users_data[username]
                
                # Merge investments by type (same logic as above)
                if 'investments' in new_data:
                    if 'investments' not in updated_data:
                        updated_data['investments'] = {}
                    for inv_type, records in new_data['investments'].items():
                        if records:
                            updated_data['investments'][inv_type] = records
                
                # Update investment_details
                if 'investment_details' in new_data and new_data['investment_details']:
                    updated_data['investment_details'] = new_data['investment_details']
            
            # Preserve password_changed_at if exists
            if 'password_changed_at' in existing_data:
                updated_data['password_changed_at'] = existing_data['password_changed_at']
            
            # Create new file with new hash
            new_json_filename = new_hash + '.json'
            new_json_path = self.json_save_dir / new_json_filename
            
            try:
                with open(new_json_path, 'w', encoding='utf-8') as file:
                    json.dump(updated_data, file, indent=2, ensure_ascii=False)
                print(f"Created new file {new_json_filename} for user {username} (hash changed)")
                
                # Delete old file
                old_file.unlink()
                print(f"Deleted old file {old_file.name} for user {username}")
                updated_count += 1
            except Exception as e:
                print(f"Error creating new file for user {username} after hash change: {e}")
        
        print(f"\nUpdated {updated_count} existing JSON files")
    
    def create_new_user_files(self):
        """Create new JSON files for users that don't have existing files with correct hash"""
        if not self.json_save_dir.exists():
            self.json_save_dir.mkdir(parents=True, exist_ok=True)
        
        created_count = 0
        
        # Get existing files mapped by hash
        existing_hash_files = {}
        for json_file in self.json_save_dir.glob("*.json"):
            try:
                with open(json_file, 'r', encoding='utf-8') as file:
                    data = json.load(file)
                    username = data.get('username', '')
                    file_hash = json_file.stem  # Get filename without .json extension
                    if username:
                        existing_hash_files[username] = file_hash
            except:
                continue
        
        # Create new files for users that don't have files with correct hash
        for username, user_data in self.users_data.items():
            # Check if we have hash for this user
            if username not in self.username_hash_map:
                print(f"Warning: No hash found for user {username}, skipping file creation")
                continue
            
            expected_hash = self.username_hash_map[username]
            current_file_hash = existing_hash_files.get(username, '')
            
            # Check if file exists with correct hash
            json_filename = expected_hash + '.json'
            json_path = self.json_save_dir / json_filename
            
            # Create file if it doesn't exist or if hash doesn't match
            if not json_path.exists() or current_file_hash != expected_hash:
                try:
                    with open(json_path, 'w', encoding='utf-8') as file:
                        json.dump(user_data, file, indent=2, ensure_ascii=False)
                    print(f"Created new file {json_filename} for user {username}")
                    created_count += 1
                except Exception as e:
                    print(f"Error creating file for {username}: {e}")
        
        print(f"Created {created_count} new user files")
    
    def process_all_csv_files(self):
        """Process all CSV files and update user JSON files"""
        print(f"Starting CSV to JSON update process...")
        print(f"CSV data directory: {self.csv_data_dir}")
        print(f"JSON save directory: {self.json_save_dir}")
        
        # Process each investment type
        for investment_type, csv_filename in self.csv_files.items():
            csv_path = self.csv_data_dir / csv_filename
            if csv_path.exists():
                print(f"\nProcessing {csv_filename}...")
                csv_data = self.read_csv_file(csv_path)
                self.process_investment_data(csv_data, investment_type)
            else:
                print(f"Warning: {csv_filename} not found in {self.csv_data_dir}")
        
        # Process fund_unit data from database
        print(f"\nProcessing fund_unit data from database...")
        try:
            conn = mysql.connector.connect(**self._CFG["mysql"]["warning"])
            cursor = conn.cursor()
            
            query = '''
                SELECT * from playground2.fund_unit;
            '''
            cursor.execute(query)
            
            results = cursor.fetchall()
            column_names = [desc[0] for desc in cursor.description]
            
            # Convert to list of dictionaries and handle datetime objects
            fund_unit_data = []
            for row in results:
                row_dict = {}
                for col_name, value in zip(column_names, row):
                    # Convert datetime objects to ISO format strings
                    if isinstance(value, datetime):
                        row_dict[col_name] = value.isoformat()
                    elif hasattr(value, 'isoformat'):  # Handle date objects
                        row_dict[col_name] = value.isoformat()
                    else:
                        row_dict[col_name] = value
                fund_unit_data.append(row_dict)
            
            cursor.close()
            conn.close()
            
            self.process_fund_unit_data(fund_unit_data)
            print(f"Loaded {len(fund_unit_data)} fund_unit records from database")
        except Exception as e:
            print(f"Error loading fund_unit data from database: {e}")
        
        # Update existing files and create new ones
        print(f"\nFound data for {len(self.users_data)} users")
        self.update_existing_json_files()
        self.create_new_user_files()
        
        print(f"\nUpdate completed!")

def main():
    """Main function with command line argument support"""
    # Parse command line arguments
    csv_data_path = root_folder_path # Default CSV data path (for investor files)
    json_save_path = web_path  # Default JSON save path
    password_file_path = os.path.join(root_folder_path, 'password.csv')  # Default password file path
    fund_unit_csv_path = root_folder_path  # Default fund_unit.csv path
    
    if len(sys.argv) >= 2:
        csv_data_path = sys.argv[1]
    
    if len(sys.argv) >= 3:
        json_save_path = sys.argv[2]
    
    if len(sys.argv) >= 4:
        password_file_path = sys.argv[3]
    
    if len(sys.argv) >= 5:
        fund_unit_csv_path = sys.argv[4]
    
    # Create updater with custom paths
    updater = UserDataUpdater(csv_data_path, json_save_path, password_file_path, fund_unit_csv_path)
    updater.process_all_csv_files()

if __name__ == "__main__":
    main()