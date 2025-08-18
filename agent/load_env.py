#!/usr/bin/env python3
"""
Script to load environment variables from YAML file
Usage: python load_env.py [yaml_file]
"""

import yaml
import os
import sys

def load_env_from_yaml(yaml_file):
    """Load environment variables from YAML file"""
    try:
        with open(yaml_file, 'r') as file:
            env_vars = yaml.safe_load(file)
        
        for key, value in env_vars.items():
            if isinstance(value, str):
                os.environ[key] = value
                print(f"export {key}=\"{value}\"")
        
        print(f"✅ Loaded {len(env_vars)} environment variables from {yaml_file}")
        
    except FileNotFoundError:
        print(f"❌ File {yaml_file} not found")
        sys.exit(1)
    except yaml.YAMLError as e:
        print(f"❌ Error parsing YAML file: {e}")
        sys.exit(1)

if __name__ == "__main__":
    yaml_file = sys.argv[1] if len(sys.argv) > 1 else "env.local.yaml"
    load_env_from_yaml(yaml_file)
