#!/bin/bash

# 构建脚本 - 先手动构建前端，然后跳过前端构建步骤
echo "=== Huntly 构建脚本（预编译前端版本） ==="

# 检查前端 build 目录是否存在
if [ ! -d "app/client/build" ]; then
    echo "❌ 错误: app/client/build 目录不存在"
    echo "请先运行以下命令构建前端:"
    echo "  cd app/client"
    echo "  npm run build"
    exit 1
fi

echo "✅ 检测到前端已构建完成"
echo "🚀 开始构建 Java 后端（跳过前端构建）..."

# 切换到服务器目录并构建
cd app/server

# 使用 skipFrontend=true 参数跳过前端构建
mvn clean package -DskipTests -DskipFrontend=true

if [ $? -eq 0 ]; then
    echo "✅ 构建成功！"
    echo "📦 JAR 包位置: app/server/huntly-server/target/"
else
    echo "❌ 构建失败"
    exit 1
fi
