import request from "@/utils/request";
import type {
  AffectedResp,
  DeleteNotificationReq,
  EmptyReq,
  EmptyResp,
  ListResult,
  NotifyPreferenceListResp,
  QueryNotificationListReq,
  ReadNotificationReq,
  UnreadCountReq,
  UnreadCountResp,
  UnsubscribeReq,
  UnsubscribeVerifyReq,
  UnsubscribeVerifyResp,
  UpdateNotifyPreferenceReq,
} from "@/api/types";

/**
 * 通知
 *
 * 列表按「分组」分页：同一条内容下的多次互动合并成一组，组键由服务端下发，
 * 客户端原样回传即可整组已读或整组删除，不需要自己拼。
 */
export const NotificationAPI = {
  /** 获取通知列表（按分组分页） */
  queryNotificationList(params?: QueryNotificationListReq): Promise<ApiResponse<ListResult>> {
    return request({
      url: `/api/v1/notifications`,
      method: "GET",
      params: params,
    });
  },

  /** 获取未读分组数 */
  getUnreadCount(params?: UnreadCountReq): Promise<ApiResponse<UnreadCountResp>> {
    return request({
      url: `/api/v1/notifications/unread-count`,
      method: "GET",
      params: params,
    });
  },

  /** 标记一组已读 */
  readNotification(data: ReadNotificationReq): Promise<ApiResponse<AffectedResp>> {
    return request({
      url: `/api/v1/notifications/read`,
      method: "POST",
      data: data,
    });
  },

  /** 全部标记已读 */
  readAllNotification(data?: EmptyReq): Promise<ApiResponse<AffectedResp>> {
    return request({
      url: `/api/v1/notifications/read-all`,
      method: "POST",
      data: data,
    });
  },

  /** 删除一组通知 */
  deleteNotification(data: DeleteNotificationReq): Promise<ApiResponse<AffectedResp>> {
    return request({
      url: `/api/v1/notifications/delete`,
      method: "POST",
      data: data,
    });
  },

  /** 获取通知偏好 */
  getNotifyPreference(params?: EmptyReq): Promise<ApiResponse<NotifyPreferenceListResp>> {
    return request({
      url: `/api/v1/notifications/preferences`,
      method: "GET",
      params: params,
    });
  },

  /** 更新通知偏好 */
  updateNotifyPreference(data: UpdateNotifyPreferenceReq): Promise<ApiResponse<NotifyPreferenceListResp>> {
    return request({
      url: `/api/v1/notifications/preferences`,
      method: "PUT",
      data: data,
    });
  },

  /** 校验退订令牌（邮件确认页调用） */
  verifyUnsubscribe(params: UnsubscribeVerifyReq): Promise<ApiResponse<UnsubscribeVerifyResp>> {
    return request({
      url: `/api/v1/notifications/unsubscribe`,
      method: "GET",
      params: params,
    });
  },

  /** 执行退订 */
  unsubscribe(data: UnsubscribeReq): Promise<ApiResponse<EmptyResp>> {
    return request({
      url: `/api/v1/notifications/unsubscribe`,
      method: "POST",
      data: data,
    });
  },
};
