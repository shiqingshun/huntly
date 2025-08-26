# 低内存服务器构建指南

当您的服务器内存不足（如只有1.7G）时，可以使用这种方法来避免前端构建时的内存溢出问题。

## 构建步骤

### 方法1: 使用构建脚本（推荐）

1. 首先构建前端：
```bash
cd app/client
npm run build
```

2. 运行构建脚本：
```bash
# Linux/macOS
chmod +x build-with-prebuilt-frontend.sh
./build-with-prebuilt-frontend.sh

# Windows
build-with-prebuilt-frontend.bat
```

### 方法2: 手动执行

1. 首先构建前端：
```bash
cd app/client
npm run build
```

2. 然后构建后端（跳过前端构建）：
```bash
cd ../server
mvn clean package -DskipTests -DskipFrontend=true
```

## 原理说明

- 添加了 `skipFrontend` 属性到 `pom.xml`
- 当设置 `-DskipFrontend=true` 时，Maven 会跳过所有前端相关的构建步骤
- maven-resources-plugin 仍会正常工作，将预构建的前端文件从 `app/client/build` 复制到 JAR 包中

## 注意事项

1. 确保在运行 Maven 构建之前，前端已经成功构建并且 `app/client/build` 目录存在
2. 如果前端代码有更新，需要重新运行 `npm run build`
3. 这种方法可以显著减少构建时的内存使用

## 恢复正常构建

如果服务器内存足够，想要恢复正常的一体化构建，只需要：

```bash
mvn clean package -DskipTests
```

（不使用 `-DskipFrontend=true` 参数）
