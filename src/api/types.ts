
export interface Album {
  id: number; // 主键
  album_name: string; // 相册名
  album_desc: string; // 相册描述
  album_cover: string; // 相册封面
}

export interface ArticleDetails extends ArticleHome {
  author?: UserInfoVO; // 作者
  last_article?: ArticlePreview; // 上一篇文章
  next_article?: ArticlePreview; // 下一篇文章
  recommend_article_list: ArticlePreview[]; // 推荐文章列表
  newest_article_list: ArticlePreview[]; // 最新文章列表
}

export interface ArticleHome {
  id: number; // 文章ID
  article_cover: string; // 文章缩略图
  article_title: string; // 标题
  article_content: string; // 内容
  article_type: number; // 文章类型
  original_url: string; // 原文链接
  is_top: number; // 是否置顶
  status: number; // 状态值 1 公开 2 私密 3 草稿 4 已删除
  created_at: number; // 发表时间
  updated_at: number; // 更新时间
  category_name: string; // 文章分类名
  tag_name_list: string[]; // 文章标签列表
  like_count: number; // 点赞量
  views_count: number; // 浏览量
}

export interface ArticlePreview {
  id: number; // 文章ID
  article_cover: string; // 文章缩略图
  article_title: string; // 标题
  like_count: number; // 点赞量
  views_count: number; // 浏览量
  created_at: number; // 创建时间
}

export interface BatchResp {
  success_count: number; 
}

export interface Category {
  id: number; 
  category_name: string; // 分类名
  article_count: number; 
  created_at: number; // 创建时间
  updated_at: number; // 更新时间
}

export interface ClientInfoVO {
  terminal_id: string; // 终端ID
  os: string; // 操作系统
  browser: string; // 浏览器
  ip_address: string; // IP地址
  ip_source: string; // IP归属地
}

export interface Comment {
  id: number; // 评论id
  user_id: string; // 用户ID
  terminal_id: string; // 终端id
  topic_id: number; // 主题id
  parent_id: number; // 父评论id
  reply_id: number; // 会话id
  reply_user_id: string; // 被回复用户id
  comment_content: string; // 评论内容
  status: number; // 状态
  type: number; // 评论类型 1.文章 2.友链 3.说说
  created_at: number; // 评论时间
  like_count: number; // 点赞数
  client_info?: ClientInfoVO; // 客户端信息
  user_info?: UserInfoVO; // 用户信息
  reply_user_info?: UserInfoVO; // 回复用户信息
  reply_count: number; // 回复量
  comment_reply_list: CommentReply[]; // 评论回复列表
}

export interface CommentRecent {
  id: number; // 评论id
  user_id: string; // 用户ID
  terminal_id: string; // 终端id
  reply_user_id: string; // 被回复用户id
  comment_content: string; // 评论内容
  status: number; // 状态
  client_info?: ClientInfoVO; // 客户端信息
  user_info?: UserInfoVO; // 用户信息
  reply_user_info?: UserInfoVO; // 回复用户信息
}

export interface CommentReply {
  id: number; // 评论id
  user_id: string; // 用户ID
  terminal_id: string; // 终端id
  topic_id: number; // 主题id
  parent_id: number; // 父评论id
  reply_id: number; // 会话id
  reply_user_id: string; // 被回复用户id
  comment_content: string; // 评论内容
  status: number; // 状态
  type: number; // 评论类型 1.文章 2.友链 3.说说
  created_at: number; // 评论时间
  like_count: number; // 点赞数
  client_info?: ClientInfoVO; // 客户端信息
  user_info?: UserInfoVO; // 用户信息
  reply_user_info?: UserInfoVO; // 回复用户信息
}

export interface DeleteUserBindThirdPartyReq {
  platform: string; // 平台
}

export interface DeletesUploadFileReq {
  file_paths?: string[]; // 文件路径
}

export interface EmailLoginReq {
  email: string; // 邮箱
  password: string; // 密码
  captcha_key?: string; // 验证码key
  captcha_code?: string; // 验证码
}

export interface EmptyReq {
}

export interface EmptyResp {
}

export interface FileInfoVO {
  file_path: string; // 文件路径
  file_name: string; // 文件名称
  file_type: string; // 文件类型
  file_size: number; // 文件大小
  file_url: string; // 上传路径
  updated_at: number; // 更新时间
}

export interface Friend {
  id: number; // id
  link_name: string; // 链接名
  link_avatar: string; // 链接头像
  link_address: string; // 链接地址
  link_intro: string; // 链接介绍
  created_at: number; // 创建时间
  updated_at: number; // 更新时间
}

export interface GetAboutMeReq {
}

export interface GetAboutMeResp {
  content: string; 
}

export interface GetBlogHomeInfoReq {
}

export interface GetBlogHomeInfoResp {
  article_count: number; // 文章数量
  category_count: number; // 分类数量
  tag_count: number; // 标签数量
  total_user_view_count: number; // 总服务量
  total_page_view_count: number; // 总浏览量
  page_list: PageVO[]; // 页面列表
  notice_list: NoticeVO[]; // 通知列表
  website_config: WebsiteConfigVO; // 网站配置
}

export interface GetCaptchaCodeReq {
  width?: number; // 宽度
  height?: number; // 高度
}

export interface GetCaptchaCodeResp {
  captcha_key: string; // 验证码key
  captcha_base64: string; // 验证码base64
  captcha_code: string; // 验证码
}

export interface GetClientInfoReq {
}

export interface GetClientInfoResp {
  id: number; // 访客唯一ID
  terminal_id: string; // 终端ID
  os: string; // 操作系统
  browser: string; // 浏览器
  ip_address: string; // IP地址
  ip_source: string; // IP归属地
}

export interface GetOauthAuthorizeUrlReq {
  platform: string; // 平台
  state?: string; // 状态
}

export interface GetOauthAuthorizeUrlResp {
  authorize_url: string; // 授权地址
}

export interface IdReq {
  id: number; 
}

export interface IdsReq {
  ids: number[]; 
}

export interface ListUploadFileReq {
  file_path?: string; // 文件路径
  limit?: number; // 限制
}

export interface LoginReq {
  username: string; 
  password: string; 
  captcha_key?: string; // 验证码key
  captcha_code?: string; // 验证码
}

export interface LoginResp {
  user_id: string; // 用户id
  scope: string; // 作用域
  token?: Token; 
}

export interface Message {
  id?: number; // 主键id
  user_id: string; // 用户id
  terminal_id: string; // 终端id
  message_content: string; // 留言内容
  status: number; // 状态
  created_at: number; // 发布时间
  updated_at: number; // 更新时间
  user_info?: UserInfoVO; // 用户信息
}

export interface MultiUploadFileReq {
  files?: any[]; // 文件列表
  file_path?: string; // 文件路径
}

export interface NewCommentReq {
  topic_id?: number; // 主题id
  parent_id?: number; // 父评论id
  reply_id?: number; // 会话id
  reply_user_id?: string; // 回复用户id
  comment_content: string; // 评论内容
  status?: number; // 状态
  type: number; // 评论类型 1.文章 2.友链 3.说说
}

export interface NewMessageReq {
  message_content: string; // 留言内容
}

export interface NoticeVO {
  id?: number; // 主键ID
  title: string; // 通知标题
  content: string; // 通知内容
  type: string; // 通知类型
  level: string; // 通知等级
  publish_time: number; // 发布时间
}

export interface Page {
  id: number; // 页面id
  page_name: string; // 页面名
  page_label: string; // 页面标签
  page_cover: string; // 页面封面
  is_carousel?: number; // 是否轮播
  created_at: number; // 创建时间
  updated_at: number; // 更新时间
}

export interface PageQuery {
  page?: number; // 当前页码
  page_size?: number; // 每页数量
  sorts?: string[]; // 排序
}

export interface PageResp {
  page: number; 
  page_size: number; 
  total: number; 
  list: any; 
}

export interface PageVO {
  id: number; // 页面ID
  page_name: string; // 页面名称
  page_label: string; // 页面标签
  page_cover: string; // 页面封面
  is_carousel?: number; // 是否轮播
}

export interface PhoneLoginReq {
  phone: string; // 手机号
  verify_code: string; // 验证码
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
  rpc_status: string[]; 
}

export interface QueryAlbumReq extends PageQuery {
}

export interface QueryArticleArchivesReq extends PageQuery {
}

export interface QueryArticleClassifyReq extends PageQuery {
  classify_name?: string; // 分类名
}

export interface QueryArticleHomeReq extends PageQuery {
  article_title?: string; // 标题
}

export interface QueryCategoryReq extends PageQuery {
  category_name?: string; // 分类名
}

export interface QueryCommentReq extends PageQuery {
  topic_id?: number; // 主题id
  parent_id?: number; // 父评论id
  type?: number; // 评论类型 1.文章 2.友链 3.说说
}

export interface QueryFriendReq extends PageQuery {
}

export interface QueryMessageReq extends PageQuery {
}

export interface QueryPageReq extends PageQuery {
}

export interface QueryPhotoReq {
  album_id: number; // 相册ID
}

export interface QueryTagReq extends PageQuery {
  tag_name?: string; // 标签名
}

export interface QueryTalkReq extends PageQuery {
}

export interface RegisterReq {
  username: string; 
  password: string; 
  confirm_password: string; // 确认密码
  email: string; // 邮箱
  verify_code: string; // 验证码
}

export interface ResetPasswordReq {
  password: string; 
  confirm_password: string; // 确认密码
  email: string; 
  verify_code: string; // 验证码
}

export interface RewardQrCode {
  alipay_qr_code: string; // 支付宝二维码
  weixin_qr_code: string; // 微信二维码
}

export interface SendEmailVerifyCodeReq {
  email: string; // 邮箱
  type: string; // 类型 register,reset_password,bind_email,bind_phone
}

export interface SendPhoneVerifyCodeReq {
  phone: string; // 手机号
  type: string; // 类型 register,reset_password,bind_email,bind_phone
}

export interface SocialAccountInfo {
  name: string; // 名称-微信
  platform: string; // 平台-wechat
  link_url: string; // 链接地址
  enabled: boolean; // 是否启用
}

export interface Tag {
  id: number; // 标签ID
  tag_name: string; // 标签名
  article_count: number; // 文章数量
  created_at: number; // 创建时间
  updated_at: number; // 更新时间
}

export interface Talk {
  id: number; // 说说ID
  user_id: string; // 用户ID
  content: string; // 评论内容
  img_list: string[]; // 图片URL列表
  is_top: number; // 是否置顶
  status: number; // 状态 1.公开 2.私密
  like_count: number; // 点赞量
  comment_count: number; // 评论量
  created_at: number; // 创建时间
  updated_at: number; // 更新时间
  user_info?: UserInfoVO; // 用户信息
}

export interface ThirdLoginReq {
  platform: string; // 平台
  code?: string; // 授权码
}

export interface ThirdPlatformInfo {
  name: string; // 名称-微信
  platform: string; // 平台-wechat
  authorize_url: string; // 授权地址
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

export interface UpdateCommentReq {
  id: number; // 主键
  reply_user_id?: string; // 回复用户id
  comment_content: string; // 评论内容
  status?: number; // 状态
}

export interface UpdateUserAvatarReq {
  avatar: string; // 头像
}

export interface UpdateUserBindEmailReq {
  email: string; // 邮箱
  verify_code: string; // 验证码
}

export interface UpdateUserBindPhoneReq {
  phone: string; // 手机号
  verify_code: string; // 验证码
}

export interface UpdateUserBindThirdPartyReq {
  platform: string; // 平台
  code: string; // 授权码
  state?: string; // 状态
}

export interface UpdateUserInfoReq extends UserInfoExt {
  nickname: string; // 昵称
}

export interface UpdateUserPasswordReq {
  old_password: string; // 旧密码
  new_password: string; // 新密码
  confirm_password: string; // 确认密码
}

export interface UploadFileReq {
  file?: any; // 文件
  file_path?: string; // 文件路径
}

export interface UserInfoExt {
  gender?: number; // 性别 0未知 1男 2女
  intro?: string; // 简介
  website?: string; // 网站
}

export interface UserInfoResp extends UserInfoExt {
  user_id: string; // 用户id
  username: string; // 用户名
  nickname: string; // 用户昵称
  avatar: string; // 用户头像
  email: string; // 用户邮箱
  phone: string; // 用户手机号
  register_type: string; // 注册方式
  created_at: number; // 创建时间
  third_party: UserThirdPartyInfo[]; 
}

export interface UserInfoVO extends UserInfoExt {
  user_id: string; // 用户ID
  username: string; // 用户名
  avatar: string; // 用户头像
  nickname: string; // 用户昵称
}

export interface UserLikeResp {
  article_like_set: number[]; 
  comment_like_set: number[]; 
  talk_like_set: number[]; 
}

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
  website_feature?: WebsiteFeature; // 网站功能
  website_info?: WebsiteInfo; // 网站信息
  reward_qr_code?: RewardQrCode; // 打赏二维码
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
