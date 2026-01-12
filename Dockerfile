FROM node:22-slim AS base

# 安装 pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# 复制依赖文件和补丁文件
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

# 构建阶段
FROM base AS build
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# 运行阶段
FROM base AS runner
ENV NODE_ENV=production
RUN pnpm install --prod --frozen-lockfile

# 复制构建产物
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json

# 暴露端口
EXPOSE 3001

# 启动命令
CMD ["node", "dist/index.js"]
