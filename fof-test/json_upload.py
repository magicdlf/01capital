#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Thu Jul  3 11:20:59 2025

@author: weijiaxin
"""
  
    
"""
Update User JSON Files from CSV with Hash-based Filename Mapping

This script updates existing user JSON files with new data from CSV files.
It preserves existing files and uses hash values from password.csv for filename mapping.

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
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any

root_folder_path = os.path.abspath(os.getcwd())

# generate_hash_filename function removed - now using hash values directly from password.csv

class UserDataUpdater:
    def __init__(self, csv_data_dir: str = "data", json_save_dir: str = "data/users", password_file: str = "data/password.csv"):
        """
        Initialize the updater with custom paths
        
        Args:
            csv_data_dir: Directory containing CSV files (arbitrage_investor.csv, etc.)
            json_save_dir: Directory where JSON files will be saved
            password_file: Path to password.csv file for username-hash mapping
        """
        self.csv_data_dir = Path(csv_data_dir)
        self.json_save_dir = Path(json_save_dir)
        self.password_file = Path(password_file)
        
        # CSV file mappings
        self.csv_files = {
            "arbitrage": "arbitrage_investor.csv",
            "balanced": "balanced_investor.csv", 
            "arbitrage_coin": "arbitrage_coin_investor.csv"
        }
        
        # Store user data
        self.users_data = {}
        
        # Store username to hash mapping
        self.username_hash_map = {}
        
        # Validate paths
        if not self.csv_data_dir.exists():
            print(f"Warning: CSV data directory '{self.csv_data_dir}' does not exist")
        
        if not self.password_file.exists():
            print(f"Warning: Password file '{self.password_file}' does not exist")
        
        # Create JSON save directory if it doesn't exist
        self.json_save_dir.mkdir(parents=True, exist_ok=True)
        
        # Load username-hash mapping
        self.load_hash_mapping()
        
    def load_hash_mapping(self):
        """Load username to hash mapping from password.csv"""
        try:
            with open(self.password_file, 'r', encoding='utf-8-sig') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    username = row.get('name', '').strip()
                    hash_value = row.get('hash', '').strip()
                    if username and hash_value:
                        self.username_hash_map[username] = hash_value
            print(f"Loaded {len(self.username_hash_map)} username-hash mappings")
        except Exception as e:
            print(f"Error loading hash mapping: {e}")
    
    def read_csv_file(self, csv_path: Path) -> List[Dict[str, Any]]:
        """Read CSV file and return list of dictionaries"""
        data = []
        try:
            with open(csv_path, 'r', encoding='utf-8') as file:
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
                        "arbitrage_coin": []
                    }
                }
            
            # Create investment record
            try:
                investment_record = {
                    "date": row.get('Date', ''),
                    "nav": float(row.get('NAV per unit', 0)),
                    "principal": float(row.get('principal', 0)),
                    "net_nav": float(row.get('net_nav', 0)),
                    "net_pnl": float(row.get('net_pnl', 0)),
                    "realized_pnl": float(row.get('realized_pnl', 0)),
                    "total_return": float(row.get('total_return', 0)),
                    "coin": row.get('coin', 'USDT')
                }
                
                # Add to user's investment data
                self.users_data[investor]["investments"][investment_type].append(investment_record)
            except (ValueError, TypeError) as e:
                print(f"Warning: Skipping invalid data for {investor} on {row.get('Date', 'unknown date')}: {e}")
    
    def update_existing_json_files(self):
        """Update existing JSON files with new data"""
        if not self.json_save_dir.exists():
            print(f"JSON save directory {self.json_save_dir} does not exist")
            return
        
        updated_count = 0
        for json_file in self.json_save_dir.glob("*.json"):
            try:
                # Read existing JSON file
                with open(json_file, 'r', encoding='utf-8') as file:
                    existing_data = json.load(file)
                
                username = existing_data.get('username', '')
                if username in self.users_data:
                    # Update with new data
                    new_data = self.users_data[username]
                    new_data['created_at'] = existing_data.get('created_at', new_data['created_at'])
                    
                    # Write updated data
                    with open(json_file, 'w', encoding='utf-8') as file:
                        json.dump(new_data, file, indent=2, ensure_ascii=False)
                    
                    print(f"Updated {json_file.name} for user {username}")
                    updated_count += 1
                else:
                    print(f"No data found for user in {json_file.name}")
                    
            except Exception as e:
                print(f"Error updating {json_file.name}: {e}")
        
        print(f"\nUpdated {updated_count} existing JSON files")
    
    def create_new_user_files(self):
        """Create new JSON files for users that don't have existing files"""
        if not self.json_save_dir.exists():
            self.json_save_dir.mkdir(parents=True, exist_ok=True)
        
        created_count = 0
        existing_usernames = set()
        
        # Get existing usernames
        for json_file in self.json_save_dir.glob("*.json"):
            try:
                with open(json_file, 'r', encoding='utf-8') as file:
                    data = json.load(file)
                    existing_usernames.add(data.get('username', ''))
            except:
                continue
        
        # Create new files for users not in existing files
        for username, user_data in self.users_data.items():
            if username not in existing_usernames:
                # Check if we have hash for this user
                if username in self.username_hash_map:
                    hash_value = self.username_hash_map[username]
                    # Use the hash value directly as filename
                    json_filename = hash_value + '.json'
                    json_path = self.json_save_dir / json_filename
                    
                    try:
                        with open(json_path, 'w', encoding='utf-8') as file:
                            json.dump(user_data, file, indent=2, ensure_ascii=False)
                        print(f"Created new file {json_filename} for user {username}")
                        created_count += 1
                    except Exception as e:
                        print(f"Error creating file for {username}: {e}")
                else:
                    print(f"Warning: No hash found for user {username}, skipping file creation")
        
        print(f"Created {created_count} new user files")
    
    def process_all_csv_files(self):
        """Process all CSV files and update user JSON files"""
        print(f"Starting CSV to JSON update process...")
        print(f"CSV data directory: {self.csv_data_dir}")
        print(f"JSON save directory: {self.json_save_dir}")
        print(f"Password file: {self.password_file}")
        
        # Process each investment type
        for investment_type, csv_filename in self.csv_files.items():
            csv_path = self.csv_data_dir / csv_filename
            if csv_path.exists():
                print(f"\nProcessing {csv_filename}...")
                csv_data = self.read_csv_file(csv_path)
                self.process_investment_data(csv_data, investment_type)
            else:
                print(f"Warning: {csv_filename} not found in {self.csv_data_dir}")
        
        # Update existing files and create new ones
        print(f"\nFound data for {len(self.users_data)} users")
        self.update_existing_json_files()
        self.create_new_user_files()
        
        print(f"\nUpdate completed!")

def main():
    """Main function with command line argument support"""
    # Parse command line arguments
    csv_data_path = "/Users/weijiaxin/Desktop/01 Capital/01 nav" # Default CSV data path
    json_save_path = "/Users/weijiaxin/Desktop/01 Capital/网站/fof-info/data/users"  # Default JSON save path
    password_file_path = "/Users/weijiaxin/Desktop/01 Capital/网站/fof-info/data/password.csv"  # Default password file path
    
    if len(sys.argv) >= 2:
        csv_data_path = sys.argv[1]
    
    if len(sys.argv) >= 3:
        json_save_path = sys.argv[2]
    
    if len(sys.argv) >= 4:
        password_file_path = sys.argv[3]
    
    print(f"Using CSV data path: {csv_data_path}")
    print(f"Using JSON save path: {json_save_path}")
    print(f"Using password file path: {password_file_path}")
    
    # Create updater with custom paths
    updater = UserDataUpdater(csv_data_path, json_save_path, password_file_path)
    updater.process_all_csv_files()

if __name__ == "__main__":
    main()