# ForgePilot 发布规范

## 发布清单

1. 更新 `CHANGELOG.md` 并标注 breaking change。
2. 提供迁移说明（配置项、环境变量、接口变化）。
3. 更新兼容矩阵（前端、后端、运行时、模型网关版本）。
4. 准备回滚步骤（镜像 tag、数据库回滚、配置回退）。
5. 运行 `scripts/forgepilot-release-check.sh` 并保存结果到发布记录。

## 版本建议

- Patch: 缺陷修复与小优化。
- Minor: 向后兼容的新能力。
- Major: 不兼容改动，必须附迁移文档。

## 交付物

- 变更日志：`CHANGELOG.md`
- 兼容矩阵：`docs/compatibility-matrix.zh-CN.md`
- 回滚手册：`docs/release-rollback-playbook.zh-CN.md`
- 发布检查脚本：`scripts/forgepilot-release-check.sh`

## 发布前命令

```bash
scripts/forgepilot-release-check.sh
```
