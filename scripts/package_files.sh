#!/bin/bash

# 打包所有部署需要的文件到 zip 文件

echo "正在打包部署文件..."

# 创建临时目录
mkdir -p deploy_package

# 复制所有需要的文件
cp render.yaml deploy_package/
cp requirements.txt deploy_package/
cp -r config deploy_package/
cp -r src deploy_package/

# 创建 zip 文件
cd deploy_package
zip -r ../paperbagglue-chat-deploy.zip ./*

# 清理临时目录
cd ..
rm -rf deploy_package

echo "✅ 打包完成！文件名：paperbagglue-chat-deploy.zip"
echo "   请下载这个文件到你的电脑"
