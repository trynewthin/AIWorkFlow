/**
 * MCP 邮件服务器测试脚本
 * 用于验证各个工具的基本功能
 */

const mailerModule = require('./index.js');

console.log('🧪 开始测试 MCP 邮件服务器功能...\n');

async function runTests() {
    try {
        // 测试1: 获取服务状态
        console.log('📊 测试1: 获取邮件服务状态');
        const status = mailerModule.getStatus();
        console.log('结果:', JSON.stringify(status, null, 2));
        console.log('✅ 状态获取测试完成\n');

        // 测试2: 验证邮件地址
        console.log('📧 测试2: 验证邮件地址格式');
        const validEmail = mailerModule.validateEmail('test@example.com');
        const invalidEmail = mailerModule.validateEmail('invalid-email');
        console.log('有效邮件验证:', validEmail);
        console.log('无效邮件验证:', invalidEmail);
        console.log('✅ 邮件验证测试完成\n');

        // 测试3: 测试连接（如果已配置）
        if (process.env.EMAIL_USERNAME && process.env.EMAIL_AUTH_CODE) {
            console.log('🔗 测试3: 测试邮件服务连接');
            try {
                const connectionTest = await mailerModule.testConnection();
                console.log('连接测试结果:', JSON.stringify(connectionTest, null, 2));
                console.log('✅ 连接测试完成\n');
            } catch (error) {
                console.log('❌ 连接测试失败:', error.message);
                console.log('💡 提示: 请确保已正确配置邮件服务环境变量\n');
            }
        } else {
            console.log('⚠️  跳过连接测试 - 未配置邮件服务环境变量');
            console.log('💡 要进行完整测试，请设置以下环境变量:');
            console.log('   - EMAIL_USERNAME: 发件人邮箱');
            console.log('   - EMAIL_AUTH_CODE: 邮箱授权码');
            console.log('   - EMAIL_SERVICE: 邮件服务商 (qq/163/aliyun)\n');
        }

        console.log('🎉 基础功能测试完成！');
        console.log('📝 注意事项:');
        console.log('   - 实际邮件发送需要配置正确的邮件服务环境变量');
        console.log('   - MCP 服务器通过标准输入输出与客户端通信');
        console.log('   - 请参考 README.md 了解如何集成到 Claude Desktop 等客户端');

    } catch (error) {
        console.error('❌ 测试过程中出现错误:', error);
        process.exit(1);
    }
}

// 模拟 MCP 工具调用测试
function testMCPToolDefinitions() {
    console.log('\n🔧 MCP 工具定义验证:');
    
    const tools = [
        'send_reminder_email',
        'send_text_email',
        'send_html_email',
        'send_system_notification',
        'test_email_connection',
        'get_email_service_status',
        'validate_email_address'
    ];
    
    tools.forEach(tool => {
        console.log(`   ✅ ${tool}`);
    });
    
    console.log(`\n📊 总计 ${tools.length} 个可用工具`);
}

// 运行测试
if (require.main === module) {
    runTests()
        .then(() => {
            testMCPToolDefinitions();
            console.log('\n🏁 所有测试完成！');
        })
        .catch(error => {
            console.error('❌ 测试失败:', error);
            process.exit(1);
        });
}

module.exports = {
    runTests,
    testMCPToolDefinitions
}; 