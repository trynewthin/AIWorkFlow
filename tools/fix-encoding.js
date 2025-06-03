/**
 * 编码修复工具
 * 检查和修复项目中的文件编码问题
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const iconv = require('iconv-lite');
const jschardet = require('jschardet');

// 项目根目录
const projectRoot = path.resolve(__dirname, '..');

// 需要检查的目录（相对于项目根目录）
const checkDirs = [
  'electron/controller',
  'electron/services',
  'electron/config',
  'electron/database',
  'electron/workflow',
  'electron/knowledge',
  'electron/pipeline',
  'electron/node',
  'electron/users'
];

// 需要检查的文件扩展名
const checkExtensions = ['.js', '.json', '.md'];

console.log('🔍 开始检查项目文件编码...\n');

/**
 * 检查文件编码
 */
function checkFileEncoding(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    
    // 使用 jschardet 检测编码
    const detected = jschardet.detect(buffer);
    const detectedEncoding = detected.encoding?.toLowerCase() || 'unknown';
    const confidence = detected.confidence || 0;
    
    // 检查是否包含中文字符
    let utf8Content = '';
    let hasChineseChars = false;
    let chineseCount = 0;
    
    try {
      // 尝试用UTF-8读取
      utf8Content = buffer.toString('utf-8');
      hasChineseChars = /[\u4e00-\u9fa5]/.test(utf8Content);
      chineseCount = (utf8Content.match(/[\u4e00-\u9fa5]/g) || []).length;
    } catch (error) {
      // UTF-8读取失败
    }
    
    let gbkContent = '';
    let gbkChineseCount = 0;
    
    if (hasChineseChars && (detectedEncoding.includes('gb') || detectedEncoding.includes('cp936'))) {
      try {
        // 如果检测到可能是GBK，尝试用GBK解码
        gbkContent = iconv.decode(buffer, 'gbk');
        gbkChineseCount = (gbkContent.match(/[\u4e00-\u9fa5]/g) || []).length;
      } catch (error) {
        // GBK读取失败
      }
    }
    
    // 获取相对于项目根目录的路径
    const relativePath = path.relative(projectRoot, filePath);
    
    console.log(`📄 ${relativePath}:`);
    console.log(`   检测编码: ${detectedEncoding} (置信度: ${(confidence * 100).toFixed(1)}%)`);
    
    if (hasChineseChars) {
      console.log(`   UTF-8 中文字符数: ${chineseCount}`);
      if (gbkChineseCount > 0) {
        console.log(`   GBK 中文字符数: ${gbkChineseCount}`);
      }
      
      // 判断编码问题
      if (detectedEncoding.includes('gb') || detectedEncoding.includes('cp936') || gbkChineseCount > chineseCount) {
        console.log(`   ⚠️  疑似 GBK 编码，建议转换为 UTF-8`);
        return { 
          file: filePath, 
          encoding: 'gbk', 
          needConvert: true,
          confidence: confidence,
          chineseCount: Math.max(chineseCount, gbkChineseCount)
        };
      } else if (detectedEncoding === 'utf-8' || detectedEncoding === 'ascii') {
        console.log(`   ✅ UTF-8 编码正常`);
        return { 
          file: filePath, 
          encoding: 'utf-8', 
          needConvert: false,
          confidence: confidence,
          chineseCount: chineseCount
        };
      } else {
        console.log(`   ❓ 编码不确定: ${detectedEncoding}`);
        return { 
          file: filePath, 
          encoding: detectedEncoding, 
          needConvert: false,
          confidence: confidence,
          chineseCount: chineseCount
        };
      }
    } else {
      // 没有中文字符
      if (detectedEncoding === 'utf-8' || detectedEncoding === 'ascii') {
        console.log(`   ✅ 编码正常`);
        return { 
          file: filePath, 
          encoding: detectedEncoding, 
          needConvert: false,
          confidence: confidence,
          chineseCount: 0
        };
      } else {
        console.log(`   ⚠️  编码异常: ${detectedEncoding}`);
        return { 
          file: filePath, 
          encoding: detectedEncoding, 
          needConvert: true,
          confidence: confidence,
          chineseCount: 0
        };
      }
    }
  } catch (error) {
    console.log(`❌ 无法读取文件 ${filePath}: ${error.message}`);
    return null;
  }
}

/**
 * 扫描目录中的文件
 */
function scanDirectory(dir) {
  const results = [];
  const fullDir = path.join(projectRoot, dir);
  
  if (!fs.existsSync(fullDir)) {
    console.log(`⚠️  目录不存在: ${dir}`);
    return results;
  }
  
  function scanRecursive(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const itemPath = path.join(currentDir, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        scanRecursive(itemPath);
      } else if (stats.isFile()) {
        const ext = path.extname(itemPath);
        if (checkExtensions.includes(ext)) {
          const result = checkFileEncoding(itemPath);
          if (result) {
            results.push(result);
          }
        }
      }
    }
  }
  
  scanRecursive(fullDir);
  return results;
}

/**
 * 修复编码问题
 */
function fixEncodingIssues(results) {
  const needConvert = results.filter(r => r.needConvert);
  
  if (needConvert.length === 0) {
    console.log('\n✅ 没有发现需要转换的编码问题！');
    return;
  }
  
  console.log(`\n🔧 发现 ${needConvert.length} 个文件需要编码转换:`);
  needConvert.forEach(item => {
    const relativePath = path.relative(projectRoot, item.file);
    console.log(`   - ${relativePath} (${item.encoding} -> UTF-8) [置信度: ${(item.confidence * 100).toFixed(1)}%]`);
  });
  
  console.log('\n🛠️  自动转换选项:');
  console.log('是否要自动转换这些文件？(输入 y 确认，其他键跳过)');
  
  // 这里可以添加自动转换逻辑
  console.log('\n💡 手动转换方法:');
  console.log('1. 在 VS Code 中打开文件');
  console.log('2. 点击右下角的编码显示');
  console.log('3. 选择 "通过编码重新打开" -> 选择检测到的编码');
  console.log('4. 然后选择 "通过编码保存" -> "UTF-8"');
  
  return needConvert;
}

/**
 * 自动转换编码
 */
function autoConvertFiles(filesToConvert) {
  console.log('\n🔄 开始自动转换编码...');
  
  let successCount = 0;
  let failCount = 0;
  
  filesToConvert.forEach(fileInfo => {
    try {
      const buffer = fs.readFileSync(fileInfo.file);
      let content = '';
      
      if (fileInfo.encoding === 'gbk') {
        // 从GBK转换到UTF-8
        content = iconv.decode(buffer, 'gbk');
      } else {
        // 尝试用原编码读取
        content = buffer.toString(fileInfo.encoding);
      }
      
      // 以UTF-8格式保存
      fs.writeFileSync(fileInfo.file, content, 'utf8');
      const relativePath = path.relative(projectRoot, fileInfo.file);
      console.log(`   ✅ ${relativePath} 转换成功`);
      successCount++;
      
    } catch (error) {
      const relativePath = path.relative(projectRoot, fileInfo.file);
      console.log(`   ❌ ${relativePath} 转换失败: ${error.message}`);
      failCount++;
    }
  });
  
  console.log(`\n📊 转换完成: 成功 ${successCount} 个，失败 ${failCount} 个`);
}

/**
 * 设置 Windows 终端编码
 */
function setupWindowsEncoding() {
  if (process.platform === 'win32') {
    console.log('🪟 为 Windows 设置 UTF-8 编码...');
    try {
      execSync('chcp 65001', { stdio: 'inherit' });
      console.log('✅ Windows 终端编码已设置为 UTF-8\n');
    } catch (error) {
      console.log('⚠️  设置 Windows 编码失败:', error.message);
    }
  }
}

// 主要执行流程
async function main() {
  // 设置 Windows 编码
  setupWindowsEncoding();
  
  console.log(`📁 项目根目录: ${projectRoot}\n`);
  
  // 扫描所有目录
  let allResults = [];
  
  for (const dir of checkDirs) {
    console.log(`📂 扫描目录: ${dir}`);
    const results = scanDirectory(dir);
    allResults = allResults.concat(results);
    console.log(); // 空行分隔
  }
  
  // 修复编码问题
  const needConvert = fixEncodingIssues(allResults);
  
  // 生成报告
  console.log('\n📊 扫描完成！');
  console.log(`总共检查了 ${allResults.length} 个文件`);
  
  const encodingStats = allResults.reduce((acc, item) => {
    acc[item.encoding] = (acc[item.encoding] || 0) + 1;
    return acc;
  }, {});
  
  console.log('\n📈 编码统计:');
  Object.entries(encodingStats).forEach(([encoding, count]) => {
    console.log(`   ${encoding}: ${count} 个文件`);
  });
  
  // 显示中文文件统计
  const chineseFiles = allResults.filter(r => r.chineseCount > 0);
  if (chineseFiles.length > 0) {
    console.log(`\n🇨🇳 包含中文的文件: ${chineseFiles.length} 个`);
    const gbkFiles = chineseFiles.filter(r => r.encoding === 'gbk' || r.encoding.includes('gb'));
    if (gbkFiles.length > 0) {
      console.log(`   其中可能是GBK编码: ${gbkFiles.length} 个`);
    }
  }
  
  console.log('\n💡 为了避免编码问题，建议:');
  console.log('1. 统一使用 UTF-8 编码保存所有文件');
  console.log('2. 在 IDE 中设置默认编码为 UTF-8');
  console.log('3. 确保终端/控制台支持 UTF-8 显示');
  console.log('4. 使用增强开发模式: npm run dev:enhanced');
}

// 运行
main().catch(error => {
  console.error('❌ 执行失败:', error);
  process.exit(1);
}); 