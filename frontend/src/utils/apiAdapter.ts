/**
 * API响应适配器工具
 * 用于统一后端响应结构到前端预期格式
 */

/**
 * 前端期望的标准API响应格式
 */
export interface StandardApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

/**
 * 后端可能返回的多种响应格式
 */
interface BackendResponseCode {
  code: number;
  data: any;
  success: boolean;
  message?: string;
}

interface BackendResponseStatus {
  status: string;
  message: string;
  data?: any;
}

/**
 * 适配不同类型的后端响应到标准前端API响应格式
 * @template T 响应数据类型
 * @param {any} response 后端原始响应
 * @param {string} defaultErrorMessage 默认错误信息（如果后端没有提供）
 * @returns {StandardApiResponse<T>} 标准化的API响应
 */
export function adaptApiResponse<T = any>(
  response: any, 
  defaultErrorMessage = '请求失败'
): StandardApiResponse<T> {
  // 如果响应为空
  if (!response) {
    return {
      success: false,
      message: defaultErrorMessage
    };
  }

  // 已经是标准格式的情况
  if (typeof response.success === 'boolean' && 'message' in response) {
    return response as StandardApiResponse<T>;
  }

  // 处理含有code的响应格式 (如 { code: 200, data: ..., success: true })
  if ('code' in response && typeof response.success === 'boolean') {
    const backendResponse = response as BackendResponseCode;
    return {
      success: backendResponse.success,
      message: backendResponse.message || (backendResponse.success ? '请求成功' : defaultErrorMessage),
      data: backendResponse.data as T
    };
  }

  // 处理含有status的响应格式 (如 { status: 'success', message: ... })
  if ('status' in response && typeof response.status === 'string') {
    const backendResponse = response as BackendResponseStatus;
    return {
      success: backendResponse.status === 'success',
      message: backendResponse.message || (backendResponse.status === 'success' ? '请求成功' : defaultErrorMessage),
      data: backendResponse.data as T
    };
  }

  // 退化处理：尝试根据常见字段推断结果
  return {
    success: Boolean(response.success || response.ok || response.status === 'success' || response.code === 200),
    message: response.message || response.msg || defaultErrorMessage,
    data: response.data || response.result || response
  };
} 