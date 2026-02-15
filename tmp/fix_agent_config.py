#!/usr/bin/env python3
import json

# 读取修复后的配置文件
with open('/tmp/agent_llm_config.json', 'r', encoding='utf-8') as f:
    config = json.load(f)

# 生成硬编码配置的Python代码
config_code = json.dumps(config, ensure_ascii=False, indent=4)

print(config_code)
