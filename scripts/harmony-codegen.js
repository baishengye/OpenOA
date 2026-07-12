/**
 * harmony-codegen.js - 自动为鸿蒙项目运行 codegen
 *
 * 功能：
 * 1. 遍历 packages/ 下有 harmony 目录的包，运行库级 codegen (codegen-lib-harmony)
 * 2. 遍历 apps/ 下的应用，运行 app 级 codegen (codegen-harmony)
 * 3. 自动跳过已在库级 codegen 中处理的 TurboModule
 *
 * 使用方式：
 *   node scripts/harmony-codegen.js
 *
 * 配置：
 *   在项目根目录创建 harmony-codegen.config.js 来自定义排除列表
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const APPS_DIR = path.join(ROOT_DIR, 'apps');
const PACKAGES_DIR = path.join(ROOT_DIR, 'packages');
const CONFIG_FILE = path.join(ROOT_DIR, 'harmony-codegen.config.js');

/**
 * 默认配置
 */
const DEFAULT_CONFIG = {
  // 库级 codegen 包的列表（这些包的 TurboModule 会在 app 级 codegen 中被排除）
  libraryCodegenPackages: [
    '@itc/rn-client-sdk-plus',  // im 包
    '@itc/biometric',
  ],
  // 额外排除的模块名（精确匹配）
  excludeModules: [],
  // 排除的 app 列表
  excludeApps: [],
};

/**
 * 加载配置
 */
function loadConfig() {
  let config = { ...DEFAULT_CONFIG };

  if (fs.existsSync(CONFIG_FILE)) {
    try {
      const userConfig = require(CONFIG_FILE);
      config = { ...config, ...userConfig };
      console.log(`[codegen] Loaded config from ${CONFIG_FILE}`);
    } catch (e) {
      console.error(`[codegen] Failed to load config: ${e.message}`);
    }
  }

  return config;
}

/**
 * 检查包是否有 harmony codegen 配置
 */
function hasHarmonyCodegenConfig(packageJson) {
  return packageJson && packageJson.harmony && packageJson.harmony.codegenConfig;
}

/**
 * 检查包是否有 harmony 目录
 */
function hasHarmonyDir(packageDir) {
  const harmonyDir = path.join(packageDir, 'harmony');
  return fs.existsSync(harmonyDir);
}

/**
 * 查找 harmony 子目录（包含 src/main/cpp 的目录）
 */
function findHarmonySubdir(packageDir) {
  const harmonyDir = path.join(packageDir, 'harmony');
  if (!fs.existsSync(harmonyDir)) return null;

  const entries = fs.readdirSync(harmonyDir, { withFileTypes: true });
  const subdirs = entries.filter(e => e.isDirectory()).map(e => e.name);

  // 优先选择包含 cpp 目录的子目录
  for (const subdir of subdirs) {
    const cppDir = path.join(harmonyDir, subdir, 'src/main/cpp');
    if (fs.existsSync(cppDir)) {
      return subdir;
    }
  }

  return subdirs[0] || null;
}

/**
 * 转换绝对路径为相对于 targetDir 的相对路径
 */
function toRelativePath(absolutePath, targetDir) {
  const rel = path.relative(targetDir, absolutePath);
  return rel.replace(/\\/g, '/');
}

/**
 * 从 spec 文件中提取 TurboModule 名称
 * @param {string[]} specPaths - spec 文件路径（相对于 pkgRoot）
 * @param {string} pkgRoot - 包根目录
 */
function extractModuleNamesFromSpec(specPaths, pkgRoot) {
  const modules = new Set();

  for (const specPath of specPaths) {
    // specPaths 相对于 pkgRoot
    const absPath = path.resolve(pkgRoot, specPath);
    if (!fs.existsSync(absPath)) {
      console.warn(`[codegen] Spec file not found: ${absPath}`);
      continue;
    }

    try {
      let content = fs.readFileSync(absPath, 'utf8');

      // 移除 TypeScript 类型注释和导入
      content = content.replace(/\/\*[\s\S]*?\*\//g, '');
      content = content.replace(/\/\/.*/g, '');
      content = content.replace(/^import\s+.*$/gm, '');
      content = content.replace(/^export\s+/gm, '');

      // 优先从 getEnforcing<Spec>('ItcOpenIM') 提取模块名
      const getEnforcingMatch = content.match(/TurboModuleRegistry\.getEnforcing<[^>]+>\(['"]([^'"]+)['"]\)/);
      if (getEnforcingMatch) {
        modules.add(getEnforcingMatch[1]);
        continue;
      }

      // 备用：查找 interface Spec extends TurboModule
      const interfaceMatch = content.match(/interface\s+(\w+)\s+extends\s+TurboModule/);
      if (interfaceMatch) {
        modules.add(interfaceMatch[1]);
      }
    } catch (e) {
      console.warn(`[codegen] Failed to parse spec ${specPath}: ${e.message}`);
    }
  }

  return Array.from(modules);
}

/**
 * 运行库级 codegen (codegen-lib-harmony)
 */
function runLibCodegen(packageDir, packageJson, packageName) {
  const config = packageJson.harmony;
  const codegenConfig = config.codegenConfig;
  const specPaths = codegenConfig.specPaths;

  if (!Array.isArray(specPaths) || specPaths.length === 0) {
    console.log(`[codegen] ${packageName}: specPaths is empty, skipping`);
    return [];
  }

  // 查找 harmony 子目录
  const harmonySubdir = findHarmonySubdir(packageDir);
  if (!harmonySubdir) {
    console.log(`[codegen] ${packageName}: No harmony subdirectory with cpp found, skipping`);
    return [];
  }

  const harmonyDir = path.join(packageDir, 'harmony');
  const cppOutput = path.join(harmonyDir, harmonySubdir, 'src/main/cpp');
  const etsOutput = path.join(harmonyDir, harmonySubdir, 'src/main/ets/generated');

  // specPaths 相对于 package.json 所在目录
  const pkgRoot = packageDir;
  const resolvedSpecPaths = specPaths.map(sp => path.resolve(pkgRoot, sp));

  console.log(`[codegen] ${packageName}:`);
  console.log(`  - Spec paths: ${specPaths.join(', ')}`);
  console.log(`  - C++ output: ${cppOutput}`);
  console.log(`  - ETS output: ${etsOutput}`);

  try {
    const appDir = path.join(APPS_DIR, 'oa');
    const mainSpecPath = resolvedSpecPaths[0];
    const specPathArg = toRelativePath(mainSpecPath, appDir);
    const cppOutputArg = toRelativePath(cppOutput, appDir);
    const etsOutputArg = toRelativePath(etsOutput, appDir);

    const cmd = [
      'npx react-native codegen-lib-harmony',
      `--npm-package-name "${packageName}"`,
      `--turbo-modules-spec-paths "${specPathArg}"`,
      `--cpp-output-path "${cppOutputArg}"`,
      `--ets-output-path "${etsOutputArg}"`,
      '--no-safety-check'
    ].join(' ');

    console.log(`  - Running: ${cmd}`);

    execSync(cmd, {
      cwd: appDir,
      stdio: 'inherit',
      encoding: 'utf8'
    });

    console.log(`[codegen] ${packageName}: ✓ Done`);

    // 提取并返回生成的模块名
    const moduleNames = extractModuleNamesFromSpec(specPaths, pkgRoot);
    return moduleNames;
  } catch (error) {
    console.error(`[codegen] ${packageName}: ✗ Failed`);
    return [];
  }
}

/**
 * 运行 app 级 codegen (codegen-harmony)
 */
function runAppCodegen(appDir, appName, excludedModules) {
  const harmonyDir = path.join(appDir, 'harmony');
  const entryDir = path.join(harmonyDir, 'entry');

  if (!fs.existsSync(entryDir)) {
    console.log(`[codegen] ${appName}: No entry directory, skipping`);
    return false;
  }

  const cppOutput = path.join(entryDir, 'src/main/cpp/generated');
  const etsOutput = path.join(entryDir, 'src/main/ets/generated');

  console.log(`[codegen] ${appName}:`);
  console.log(`  - C++ output: ${cppOutput}`);
  console.log(`  - ETS output: ${etsOutput}`);
  if (excludedModules.length > 0) {
    console.log(`  - Excluded modules: ${excludedModules.join(', ')}`);
  }

  // 注意：当前 RNOH 的 codegen-harmony 不支持排除特定模块
  // 如果有排除的模块，需要手动处理或在 codegen 后清理
  // 这里先运行 codegen，然后如果需要可以清理重复文件
  try {
    const cppOutputArg = toRelativePath(cppOutput, appDir);
    const etsOutputArg = toRelativePath(etsOutput, appDir);

    const cmd = [
      'npx react-native codegen-harmony',
      `--cpp-output-path "${cppOutputArg}"`,
      `--ets-output-path "${etsOutputArg}"`,
      '--no-safety-check'
    ].join(' ');

    console.log(`  - Running: ${cmd}`);

    execSync(cmd, {
      cwd: appDir,
      stdio: 'inherit',
      encoding: 'utf8'
    });

    // 清理 app 级 codegen 生成的库包模块（避免重复编译）
    if (excludedModules.length > 0) {
      cleanupExcludedModules(cppOutput, excludedModules);
    }

    console.log(`[codegen] ${appName}: ✓ Done`);
    return true;
  } catch (error) {
    console.error(`[codegen] ${appName}: ✗ Failed`);
    return false;
  }
}

/**
 * 清理 app 级 codegen 生成的文件中属于库包的模块
 */
function cleanupExcludedModules(cppOutput, excludedModules) {
  const packageHeaderFile = path.join(cppOutput, 'RNOHGeneratedPackage.h');

  for (const moduleName of excludedModules) {
    const cppFile = path.join(cppOutput, `${moduleName}.cpp`);
    const hFile = path.join(cppOutput, `${moduleName}.h`);

    if (fs.existsSync(cppFile)) {
      fs.unlinkSync(cppFile);
      console.log(`  - Removed app-level codegen file: ${moduleName}.cpp`);
    }
    if (fs.existsSync(hFile)) {
      fs.unlinkSync(hFile);
      console.log(`  - Removed app-level codegen file: ${moduleName}.h`);
    }

    // 清理 RNOHGeneratedPackage.h 中的模块引用
    if (fs.existsSync(packageHeaderFile)) {
      let content = fs.readFileSync(packageHeaderFile, 'utf8');
      const originalContent = content;

      // 移除 #include "generated/ModuleName.h"
      content = content.replace(new RegExp(`#include\\s+"generated/${moduleName}\\.h"\\s*\\n`, 'g'), '');

      // 移除 if (name == "ModuleName") { ... }
      const ifPattern = new RegExp(`if\\s*\\(\\s*name\\s*==\\s*"${moduleName}"\\s*\\)\\s*\\{[\\s\\S]*?return\\s*std::make_shared<${moduleName}>\\(ctx,\\s*name\\);[\\s\\S]*?\\}`, 'g');
      content = content.replace(ifPattern, '');

      // 清理空行（连续的空行只保留一个）
      content = content.replace(/\n{3,}/g, '\n\n');

      if (content !== originalContent) {
        fs.writeFileSync(packageHeaderFile, content, 'utf8');
        console.log(`  - Cleaned RNOHGeneratedPackage.h for: ${moduleName}`);
      }
    }

    // 同时清理 generated/ts.ts 中的引用
    cleanupTsExports(cppOutput, moduleName);
  }
}

/**
 * 清理 TypeScript 导出文件中的模块引用
 */
function cleanupTsExports(cppOutput, moduleName) {
  // cppOutput 格式: entry/src/main/cpp/generated
  // 需要到达: entry/src/main/ets/generated
  const cppParent = path.dirname(cppOutput); // entry/src/main/cpp
  const turboModulesDir = path.join(cppParent, '..', 'ets', 'generated', 'turboModules');
  const tsFile = path.join(turboModulesDir, 'ts.ts');

  // 清理 turboModules 目录中的模块文件
  if (fs.existsSync(turboModulesDir)) {
    const moduleTsFile = path.join(turboModulesDir, `${moduleName}.ts`);
    if (fs.existsSync(moduleTsFile)) {
      fs.unlinkSync(moduleTsFile);
      console.log(`  - Removed ETS file: ${moduleName}.ts`);
    }

    // 清理 ts.ts 中的 export 语句
    if (fs.existsSync(tsFile)) {
      let content = fs.readFileSync(tsFile, 'utf8');
      const originalContent = content;

      // 移除 export * from "./ModuleName"
      content = content.replace(new RegExp(`export \\* from "\\./${moduleName}"\\s*;?`, 'g'), '');

      // 移除 export { ... } from "./ModuleName"
      content = content.replace(new RegExp(`export \\{[^}]*\\} from "\\./${moduleName}"\\s*;?`, 'g'), '');

      // 清理空行（连续的空行只保留一个）
      content = content.replace(/\n{3,}/g, '\n\n');

      // 清理文件开头可能的多余空行
      content = content.replace(/^\n+/, '');

      if (content !== originalContent) {
        fs.writeFileSync(tsFile, content, 'utf8');
        console.log(`  - Cleaned export in ts.ts for: ${moduleName}`);
      }
    }
  }
}

/**
 * 扫描并运行所有包的 codegen
 */
function scanAndRunCodegen() {
  console.log('===========================================');
  console.log('  Harmony Codegen Automation');
  console.log('===========================================\n');

  // 加载配置
  const config = loadConfig();
  let libCodegenCount = 0;
  let appCodegenCount = 0;
  const allExcludedModules = new Set(config.excludeModules);

  // 1. 扫描 packages 目录（库级 codegen）
  console.log('--- Packages (Library-level codegen) ---\n');

  if (fs.existsSync(PACKAGES_DIR)) {
    const packageDirs = fs.readdirSync(PACKAGES_DIR, { withFileTypes: true })
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name);

    for (const pkgName of packageDirs) {
      const packageDir = path.join(PACKAGES_DIR, pkgName);
      const packageJsonPath = path.join(packageDir, 'package.json');

      if (!fs.existsSync(packageJsonPath)) continue;

      // 检查是否有 harmony 目录和 codegen 配置
      if (!hasHarmonyDir(packageDir)) {
        continue;
      }

      let packageJson;
      try {
        packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      } catch (e) {
        console.error(`[codegen] Failed to read ${packageJsonPath}: ${e.message}`);
        continue;
      }

      if (!hasHarmonyCodegenConfig(packageJson)) {
        console.log(`[codegen] ${packageJson.name || pkgName}: No harmony.codegenConfig, skipping`);
        continue;
      }

      const modules = runLibCodegen(packageDir, packageJson, packageJson.name);
      modules.forEach(m => allExcludedModules.add(m));
      libCodegenCount++;
    }

    // 2. 从配置中的 libraryCodegenPackages 提取模块名（处理没有 codegenConfig 的包）
    console.log('\n--- Extracting module names from config packages ---\n');

    for (const pkgName of config.libraryCodegenPackages) {
      // 跳过已经处理过的包
      if (fs.readdirSync(PACKAGES_DIR, { withFileTypes: true })
        .filter(e => e.isDirectory())
        .map(e => e.name)
        .some(name => {
          const pkgDir = path.join(PACKAGES_DIR, name);
          const pkgJsonPath = path.join(pkgDir, 'package.json');
          if (fs.existsSync(pkgJsonPath)) {
            const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
            return pkgJson.name === pkgName && hasHarmonyCodegenConfig(pkgJson);
          }
          return false;
        })) {
        continue;
      }

      // 查找包目录
      const pkgDir = fs.readdirSync(PACKAGES_DIR, { withFileTypes: true })
        .filter(e => e.isDirectory())
        .find(e => {
          const pkgJsonPath = path.join(PACKAGES_DIR, e.name, 'package.json');
          if (fs.existsSync(pkgJsonPath)) {
            const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
            return pkgJson.name === pkgName;
          }
          return false;
        });

      if (!pkgDir) {
        console.log(`[codegen] Config package ${pkgName}: Not found`);
        continue;
      }

      const pkgDirFull = path.join(PACKAGES_DIR, pkgDir.name);
      const pkgJsonPath = path.join(pkgDirFull, 'package.json');
      const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));

      // 尝试从 specPaths 提取模块名
      if (pkgJson.harmony && pkgJson.harmony.codegenConfig && pkgJson.harmony.codegenConfig.specPaths) {
        const specPaths = pkgJson.harmony.codegenConfig.specPaths;
        const modules = extractModuleNamesFromSpec(specPaths, pkgDirFull);
        if (modules.length > 0) {
          console.log(`[codegen] Config package ${pkgName}: Extracted modules: ${modules.join(', ')}`);
          modules.forEach(m => allExcludedModules.add(m));
        }
      } else {
        console.log(`[codegen] Config package ${pkgName}: No specPaths, skipping`);
      }
    }
  }

  console.log('\n--- Apps (App-level codegen) ---\n');

  // 2. 扫描 apps 目录（app 级 codegen）
  if (fs.existsSync(APPS_DIR)) {
    const appEntries = fs.readdirSync(APPS_DIR, { withFileTypes: true })
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name);

    for (const appName of appEntries) {
      // 检查是否在排除列表中
      if (config.excludeApps.includes(appName)) {
        console.log(`[codegen] ${appName}: Excluded by config`);
        continue;
      }

      const appDir = path.join(APPS_DIR, appName);
      const harmonyDir = path.join(appDir, 'harmony');

      if (!fs.existsSync(harmonyDir)) continue;

      // 检查是否有 entry 目录
      const entryDir = path.join(harmonyDir, 'entry');
      if (!fs.existsSync(entryDir)) continue;

      if (runAppCodegen(appDir, appName, Array.from(allExcludedModules))) {
        appCodegenCount++;
      }
    }
  }

  console.log('\n===========================================');
  console.log('  Summary');
  console.log('===========================================');
  console.log(`  Library codegen: ${libCodegenCount} packages`);
  console.log(`  App codegen: ${appCodegenCount} apps`);
  console.log(`  Excluded modules: ${Array.from(allExcludedModules).join(', ') || '(none)'}`);
  console.log('===========================================\n');
}

// 主函数
scanAndRunCodegen();
