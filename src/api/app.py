def initialize_agent():
    """初始化Agent实例"""
    global agent_instance, agent_config
    
    try:
        logger.info("Initializing agent...")
        
        # 获取当前工作目录
        current_dir = os.getcwd()
        logger.info(f"Current directory: {current_dir}")
        
        # 尝试多个可能的路径
        possible_paths = [
            '/opt/render/project/src/config/agent_llm_config.json',
            '/opt/render/project/config/agent_llm_config.json',
            os.path.join(current_dir, 'config/agent_llm_config.json'),
            os.path.join(current_dir, '../config/agent_llm_config.json'),
        ]
        
        config_path = None
        for path in possible_paths:
            logger.info(f"Checking path: {path}")
            if os.path.exists(path):
                config_path = path
                logger.info(f"✓ Found config file at: {path}")
                break
        
        if config_path is None:
            logger.error("Config file not found!")
            return False
        
        logger.info(f"Using config: {config_path}")
        
        agent_instance = build_agent()
        logger.info("Agent initialized successfully")
        
        with open(config_path, 'r', encoding='utf-8') as f:
            agent_config = json.load(f)
        
        logger.info("Config loaded successfully")
        return True
        
    except Exception as e:
        logger.error(f"Failed to initialize agent: {e}")
        return False
