export interface Album {
  id: number; // 主键
  album_name: string; // 相册名
  album_desc: string; // 相册描述
  album_cover: string; // 相册封面
}

export interface ArticleDetails extends ArticleHome {
  author: UserInfoVO;
  last_article: ArticlePreview;
  next_article: ArticlePreview;
  recommend_article_list: ArticlePreview[];
  newest_article_list: ArticlePreview[];
}

export interface ArticleHome {
  id: number;
  article_cover: string;
  article_title: string;
  article_content: string;
  article_type: number;
  original_url: string;
  is_top: number;
  status: number;
  created_at: number;
  updated_at: number;
  category_name: string;
  tag_name_list: string[];
  like_count: number;
  view_count: number;
}

export interface ArticlePreview {
  id: number;
  article_cover: string;
  article_title: string;
  like_count: number;
  view_count: number;
  created_at: number;
}

// 绑定邮箱请求
export interface BindMeEmailReq {
  email: string; // 邮箱
  verify_code: string; // 验证码
}

// 绑定手机号请求
export interface BindMeMobileReq {
  mobile: string; // 手机号
  verify_code: string; // 验证码
}

// 绑定第三方平台请求
export interface BindMeThirdPartyReq {
  platform: string; // 平台
  code: string; // 授权码
  state?: string; // 状态
}

export interface Category {
  id: number;
  category_name: string;
  article_count: number;
  created_at: number;
  updated_at: number;
}

export interface Comment {
  id: number;
  user_id: string;
  device_id: string;
  topic_id: number;
  parent_id: number;
  reply_id: number;
  reply_user_id: string;
  comment_content: string;
  status: number;
  type: number;
  created_at: number;
  like_count: number;
  guest_info: GuestInfoVO;
  user_info: UserInfoVO;
  reply_user_info: UserInfoVO;
  reply_count: number;
  comment_reply_list: CommentReply[];
}

export interface CommentRecent {
  id: number;
  user_id: string;
  device_id: string;
  reply_user_id: string;
  comment_content: string;
  status: number;
  guest_info: GuestInfoVO;
  user_info: UserInfoVO;
  reply_user_info: UserInfoVO;
}

export interface CommentReply {
  id: number;
  user_id: string;
  device_id: string;
  topic_id: number;
  parent_id: number;
  reply_id: number;
  reply_user_id: string;
  comment_content: string;
  status: number;
  type: number;
  created_at: number;
  like_count: number;
  guest_info: GuestInfoVO;
  user_info: UserInfoVO;
  reply_user_info: UserInfoVO;
}

export interface CreateCommentReq {
  topic_id?: number;
  parent_id?: number;
  reply_id?: number;
  reply_user_id?: string;
  comment_content: string;
  status?: number;
  type: number;
}

export interface CreateMessageReq {
  message_content: string;
}

// 获取上传凭证请求
export interface CreateUploadTokenReq {
  file_name: string; // 文件名称
  file_base?: string; // 文件目录
  expire_seconds?: number; // 凭证有效期（秒），默认1小时
}

// 获取上传凭证响应（完整的UploadToken结构）
export interface CreateUploadTokenResp {
  upload_url: string; // 上传地址
  token: string; // 上传凭证/Token
  policy: string; // 上传策略
  signature: string; // 签名
  file_key: string; // 文件Key/路径
  access_url: string; // 上传成功后的访问URL
  expire_at: number; // 凭证过期时间戳（秒）
  extra_data: Record<string, any>; // 额外数据
}

// 停用账号请求（进入冷静期）
export interface DeactivateAccountReq {
  password: string; // 确认密码
  reason: string; // 停用原因
}

export interface DeactivateAccountResp {
  cooling_period_days: number; // 冷静期天数
  can_reactivate_until: number; // 可恢复截止时间（时间戳，毫秒）
}

// 邮箱验证码登录（仅登录，未注册报错）
export interface EmailLoginReq {
  email: string; // 邮箱
  code: string; // 验证码
}

export interface EmptyReq {
}

export interface EmptyResp {
}

export interface FileInfoVO {
  file_base: string; // 文件目录
  file_name: string; // 文件名称
  file_type: string; // 文件类型
  file_size: number; // 文件大小
  file_url: string; // 上传路径
  updated_at: number; // 更新时间
}

export interface Friend {
  id: number;
  link_name: string;
  link_avatar: string;
  link_address: string;
  link_intro: string;
  created_at: number;
  updated_at: number;
}

export interface GetAboutMeReq {
}

export interface GetAboutMeResp {
  content: string;
}

export interface GetAlbumReq {
  id: number;
}

export interface GetArticleReq {
  id: number;
}

export interface GetBlogHomeInfoReq {
}

export interface GetBlogHomeInfoResp {
  article_count: number; // 文章数量
  category_count: number; // 分类数量
  tag_count: number; // 标签数量
  total_user_view_count: number; // 累计独立访客数（UV）
  total_page_view_count: number; // 总浏览量
  page_list: PageVO[]; // 页面列表
  notice_list: NoticeVO[]; // 通知列表
  website_config: WebsiteConfigVO; // 网站配置
}

export interface GetCaptchaReq {
  width?: number; // 宽度
  height?: number; // 高度
}

export interface GetCaptchaResp {
  captcha_key: string; // 验证码key
  captcha_base64: string; // 验证码base64
}

export interface GetGuestReq {
}

export interface GetGuestResp {
  id: number; // 访客唯一ID
  device_id: string; // 设备ID
  os: string; // 操作系统
  browser: string; // 浏览器
  ip_address: string; // IP地址
  ip_source: string; // IP归属地
}

// 获取用户点赞集合请求
export interface GetMeLikeReq {
}

// 获取用户点赞集合响应
export interface GetMeLikeResp {
  article_like_set: number[]; // 文章点赞集合
  comment_like_set: number[]; // 评论点赞集合
  talk_like_set: number[]; // 说说点赞集合
}

// 获取当前用户信息请求
export interface GetMeReq {
}

// 获取当前用户信息响应
export interface GetMeResp extends UserInfoExt {
  user_id: string; // 用户ID（UUID）
  username: string; // 用户名
  nickname: string; // 昵称
  avatar: string; // 头像URL
  email: string; // 邮箱
  mobile: string; // 手机号
  status: number; // 账号状态
  plan: string; // 会员计划
  balance: number; // 余额
  coin: number; // 账户积分
  created_at: number; // 注册时间
  third_party: UserThirdPartyInfo[]; // 第三方绑定
}

// 第三方登录授权URL
export interface GetOauthAuthorizeUrlReq {
  platform: string; // 平台
  state?: string; // 状态
}

export interface GetOauthAuthorizeUrlResp {
  authorize_url: string; // 授权地址
}

export interface GetTalkReq {
  id: number;
}

export interface GuestInfoVO {
  device_id: string; // 设备ID
  os: string; // 操作系统
  browser: string; // 浏览器
  ip_address: string; // IP地址
  ip_source: string; // IP归属地
}

export interface LikeArticleReq {
  id: number;
}

export interface LikeCommentReq {
  id: number;
}

export interface LikeTalkReq {
  id: number;
}

export interface ListQuery {
  page?: number; // 当前页码
  page_size?: number; // 每页数量
  sorts?: string[]; // 排序
}

export interface ListResult {
  page: number;
  page_size: number;
  total: number;
  list: any;
}

// 登录响应
export interface LoginResp {
  user_id: string; // 用户id
  user_type: string; // 用户类型：user-普通用户 admin-管理员
  scope: string; // 作用域
  token: Token;
}

export interface LogoutReq {
}

export interface LogoutResp {
}

export interface Message {
  id: number;
  user_id: string;
  device_id: string;
  message_content: string;
  status: number;
  created_at: number;
  updated_at: number;
  user_info: UserInfoVO;
}

// 手机验证码登录（自动注册）
export interface MobileLoginReq {
  mobile: string; // 手机号
  code: string; // 验证码
}

export interface NoticeVO {
  id?: number; // 主键ID
  title: string; // 通知标题
  content: string; // 通知内容
  type: string; // 通知类型
  level: string; // 通知等级
  publish_time: number; // 发布时间
}

// 第三方登录（前端携带code）
export interface OauthLoginReq {
  platform: string; // 平台
  code: string; // 授权码
  state?: string; // 状态
}

export interface Page {
  id: number; // 页面id
  page_name: string; // 页面名
  page_label: string; // 页面标签
  page_cover: string; // 页面封面
  is_carousel: number; // 是否轮播
  created_at: number; // 创建时间
  updated_at: number; // 更新时间
}

export interface PageVO {
  id: number; // 页面ID
  page_name: string; // 页面名称
  page_label: string; // 页面标签
  page_cover: string; // 页面封面
  is_carousel: number; // 是否轮播
}

// 密码登录（账号/手机号/邮箱 + 密码）
export interface PasswordLoginReq {
  account: string; // 账号/手机号/邮箱
  password: string; // 密码
  captcha_key?: string; // 图形验证码key
  captcha_code?: string; // 图形验证码
}

export interface Photo {
  id: number; // 主键
  photo_url: string; // 照片地址
}

export interface PingReq {
}

export interface PingResp {
  env: string;
  name: string;
  version: string;
  runtime: string;
  description: string;
}

export interface QueryAlbumListReq extends ListQuery {
  page?: number; // 当前页码
  page_size?: number; // 每页数量
  sorts?: string[]; // 排序
}

export interface QueryAlbumPhotoListReq {
  album_id: number; // 相册ID
}

// 归档文章查询
export interface QueryArchivedArticleListReq extends ListQuery {
  page?: number; // 当前页码
  page_size?: number; // 每页数量
  sorts?: string[]; // 排序
}

// 列表查询（按你的规范命名）
export interface QueryArticleListReq extends ListQuery {
  page?: number; // 当前页码
  page_size?: number; // 每页数量
  sorts?: string[]; // 排序
  article_title?: string;
  category_name?: string;
  tag_name?: string;
}

export interface QueryCategoryListReq extends ListQuery {
  page?: number; // 当前页码
  page_size?: number; // 每页数量
  sorts?: string[]; // 排序
  category_name?: string;
}

export interface QueryCommentListReq extends ListQuery {
  page?: number; // 当前页码
  page_size?: number; // 每页数量
  sorts?: string[]; // 排序
  topic_id?: number;
  parent_id?: number;
  type?: number;
}

export interface QueryCommentReplyListReq extends ListQuery {
  comment_id: number;
  page?: number; // 当前页码
  page_size?: number; // 每页数量
  sorts?: string[]; // 排序
  topic_id?: number;
  type?: number;
}

export interface QueryFriendListReq extends ListQuery {
  page?: number; // 当前页码
  page_size?: number; // 每页数量
  sorts?: string[]; // 排序
}

export interface QueryMessageListReq extends ListQuery {
  page?: number; // 当前页码
  page_size?: number; // 每页数量
  sorts?: string[]; // 排序
}

export interface QueryPageListReq extends ListQuery {
  page?: number; // 当前页码
  page_size?: number; // 每页数量
  sorts?: string[]; // 排序
}

// 推荐文章查询
export interface QueryRecommendArticleListReq {
}

export interface QueryTagListReq extends ListQuery {
  page?: number; // 当前页码
  page_size?: number; // 每页数量
  sorts?: string[]; // 排序
  tag_name?: string;
}

export interface QueryTalkListReq extends ListQuery {
  page?: number; // 当前页码
  page_size?: number; // 每页数量
  sorts?: string[]; // 排序
}

// 恢复账号请求（冷静期内）
export interface ReactivateAccountReq {
  email?: string; // 邮箱
  mobile?: string; // 手机号
  verification_code?: string; // 验证码
}

export interface ReactivateAccountResp {
  success: boolean; // 是否恢复成功
}

export interface RefreshTokenReq {
  user_id: string; // 用户id
  grant_type: string; // 授权类型
  refresh_token: string; // 刷新令牌
}

// 邮箱注册（必须设密码）
export interface RegisterReq {
  email: string; // 邮箱
  password: string; // 密码
  code: string; // 验证码
  username?: string; // 用户名
  nickname?: string; // 昵称
}

export interface RegisterResp {
}

// 重置密码请求（免登录，通过验证码）
export interface ResetPasswordReq {
  email: string; // 邮箱
  password: string; // 新密码
  confirm_password: string; // 确认密码
  code: string; // 验证码
}

export interface ResetPasswordResp {
}

export interface RewardQrCode {
  alipay_qr_code: string; // 支付宝二维码
  weixin_qr_code: string; // 微信二维码
}

// 发送邮箱验证码
export interface SendEmailCodeReq {
  email: string; // 邮箱
  type: string; // login / register / reset_password / bind_email
}

export interface SendEmailCodeResp {
}

// 发送手机验证码
export interface SendMobileCodeReq {
  mobile: string; // 手机号
  type: string; // login / reset_password / bind_phone
}

export interface SendMobileCodeResp {
}

export interface SocialAccountInfo {
  name: string; // 名称-微信
  platform: string; // 平台-wechat
  link_url: string; // 链接地址
  enabled: boolean; // 是否启用
}

export interface Tag {
  id: number;
  tag_name: string;
  article_count: number;
  created_at: number;
  updated_at: number;
}

export interface Talk {
  id: number; // 说说ID
  user_id: string; // 用户ID
  content: string; // 说说内容
  img_list: string[]; // 图片URL列表
  is_top: number; // 是否置顶
  status: number; // 状态 1.公开 2.私密
  like_count: number; // 点赞量
  comment_count: number; // 评论量
  created_at: number; // 创建时间
  updated_at: number; // 更新时间
  user_info: UserInfoVO; // 用户信息
}

export interface ThirdPlatformInfo {
  name: string; // 名称-微信
  platform: string; // 平台-wechat
  enabled: boolean; // 是否启用
}

export interface Token {
  token_type: string; // Token 类型（如 "Bearer"）
  access_token: string; // 访问令牌：用于接口访问，有效期短
  expires_in: number; // AccessToken 有效期（秒），如 3600（1小时）
  refresh_token: string; // 刷新令牌：仅用于刷新 AccessToken，有效期长
  refresh_expires_in: number; // RefreshToken 有效期（秒），如 604800（7天）
  refresh_expires_at: number; // RefreshToken 过期时间戳（秒）
}

// 解绑第三方平台请求
export interface UnbindMeThirdPartyReq {
  platform: string; // 平台
}

export interface UpdateCommentReq {
  id: number;
  reply_user_id?: string;
  comment_content: string;
  status?: number;
}

// 更新用户信息请求
export interface UpdateMeReq extends UserInfoExt {
  nickname?: string; // 昵称
  avatar?: string; // 头像URL
}

// 更新用户信息响应
export interface UpdateMeResp {
}

export interface UploadFileReq {
  file?: any; // 文件
  file_base?: string; // 文件目录
}

export interface UploadFileResp {
  file_info: FileInfoVO; // 文件信息
}

export interface UserInfoExt {
  gender?: number; // 性别 0未知 1男 2女
  intro?: string; // 简介
  website?: string; // 网站
}

export interface UserInfoVO {
  user_id: string;
  username: string;
  avatar: string;
  nickname: string;
  user_type: string;
}

// 第三方平台绑定信息
export interface UserThirdPartyInfo {
  platform: string; // 平台
  open_id: string; // 平台用户id
  nickname: string; // 昵称
  avatar: string; // 头像
  created_at: number; // 创建时间
}

export interface WebsiteConfigVO {
  admin_url: string; // 后台地址
  websocket_url: string; // websocket地址
  tourist_avatar: string; // 游客头像
  user_avatar: string; // 用户头像
  website_feature: WebsiteFeature; // 网站功能
  website_info: WebsiteInfo; // 网站信息
  reward_qr_code: RewardQrCode; // 打赏二维码
  social_login_list: ThirdPlatformInfo[]; // 用户第三方登录列表
  social_url_list: SocialAccountInfo[]; // 作者社交地址列表
}

export interface WebsiteFeature {
  is_chat_room: number; // 是否开启聊天室
  is_ai_assistant: number; // 是否开启AI助手
  is_music_player: number; // 是否开启音乐播放器
  is_comment_review: number; // 是否开启评论审核
  is_email_notice: number; // 是否开启邮件通知
  is_message_review: number; // 是否开启留言审核
  is_reward: number; // 是否开启打赏
}

export interface WebsiteInfo {
  website_author: string; // 网站作者
  website_avatar: string; // 网站头像
  website_create_time: string; // 网站创建时间
  website_intro: string; // 网站介绍
  website_name: string; // 网站名称
  website_notice: string; // 网站公告
  website_record_no: string; // 网站备案号
}
