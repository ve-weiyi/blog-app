
export interface Album {
  id: number; // 主键
  album_name: string; // 相册名
  album_desc: string; // 相册描述
  album_cover: string; // 相册封面
}

export interface AlbumQueryReq extends PageQuery {
}

export interface ArticleArchivesQueryReq extends PageQuery {
}

export interface ArticleClassifyQueryReq extends PageQuery {
  classify_name?: string; // 分类名
}

export interface ArticleDetails extends ArticleHome {
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

export interface ArticleHomeQueryReq extends PageQuery {
  article_title?: string; // 标题
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

export interface BindUserEmailReq {
  email: string; // 邮箱
  verify_code: string; // 验证码
}

export interface Category {
  id: number; 
  category_name: string; // 分类名
  article_count: number; 
  created_at: number; // 创建时间
  updated_at: number; // 更新时间
}

export interface CategoryQueryReq extends PageQuery {
  category_name?: string; // 分类名
}

export interface ChatRecordResp {
  id: number; // 主键
  user_id: string; // 用户id
  device_id: string; // 设备id
  nickname: string; // 昵称
  avatar: string; // 头像
  chat_content: string; // 消息内容
  ip_address: string; // ip地址
  ip_source: string; // ip来源
  type: string; // 类型
  created_at: number; // 创建时间
  updated_at: number; // 更新时间
}

export interface ClientInfoResp {
  client_id: string; // 客户端id
  user_id: string; // 用户id
  device_id: string; // 设备id
  nickname: string; // 昵称
  ip_address: string; // ip地址
  ip_source: string; // ip来源
}

export interface Comment {
  id: number; // 评论id
  topic_id: number; // 主题id
  parent_id: number; // 父评论id
  reply_msg_id: number; // 会话id
  user_id: string; // 用户id
  reply_user_id: string; // 被回复用户id
  comment_content: string; // 评论内容
  type: number; // 评论类型 1.文章 2.友链 3.说说
  created_at: number; // 评论时间
  like_count: number; // 点赞数
  user?: CommentUserInfo; // 评论用户
  reply_user?: CommentUserInfo; // 被回复评论用户
  reply_count: number; // 回复量
  comment_reply_list: CommentReply[]; // 评论回复列表
}

export interface CommentNewReq {
  topic_id?: number; // 主题id
  parent_id?: number; // 父评论id
  reply_msg_id?: number; // 会话id
  reply_user_id?: string; // 回复用户id
  comment_content?: string; // 评论内容
  type?: number; // 评论类型 1.文章 2.友链 3.说说
}

export interface CommentQueryReq extends PageQuery {
  topic_id?: number; // 主题id
  parent_id?: number; // 父评论id
  type?: number; // 评论类型 1.文章 2.友链 3.说说
}

export interface CommentReply {
  id: number; // 评论id
  topic_id: number; // 主题id
  parent_id: number; // 父评论id
  reply_msg_id: number; // 会话id
  user_id: string; // 用户id
  reply_user_id: string; // 被回复用户id
  comment_content: string; // 评论内容
  type: number; // 评论类型 1.文章 2.友链 3.说说
  created_at: number; // 评论时间
  like_count: number; // 点赞数
  user?: CommentUserInfo; // 评论用户
  reply_user?: CommentUserInfo; // 被回复评论用户
}

export interface CommentUserInfo {
  user_id: string; 
  nickname: string; 
  avatar: string; 
  website: string; 
}

export interface EmptyReq {
}

export interface EmptyResp {
}

export interface FileBackDTO {
  id?: number; // 文件目录ID
  user_id: string; // 用户id
  file_path: string; // 文件路径
  file_name: string; // 文件名称
  file_type: string; // 文件类型
  file_size: number; // 文件大小
  file_md5: string; // 文件md5值
  file_url: string; // 上传路径
  created_at: number; // 创建时间
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

export interface FriendQueryReq extends PageQuery {
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
  views_count: number; // 访问量
  website_config: WebsiteConfigDTO; // 网站配置
  page_list: PageDTO[]; // 页面列表
}

export interface IdReq {
  id: number; 
}

export interface IdsReq {
  ids: number[]; 
}

export interface LoginReq {
  username: string; 
  password: string; 
  verify_code?: string; // 验证码
}

export interface LoginResp {
  token?: Token; 
}

export interface MultiUploadFileReq {
  files?: any[]; // 文件列表
  file_path?: string; // 文件路径
}

export interface OauthLoginReq {
  platform: string; // 平台
  code?: string; // 授权码
  state?: string; // 状态
}

export interface OauthLoginUrlResp {
  url: string; // 授权地址
}

export interface OnlineCountResp {
  msg: string; // 消息
  count: number; // 在线人数
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

export interface PageDTO {
  id: number; // 页面ID
  page_name: string; // 页面名称
  page_label: string; // 页面标签
  page_cover: string; // 页面封面
  is_carousel?: number; // 是否轮播
}

export interface PageQuery {
  page?: number; 
  page_size?: number; 
  sorts?: string[]; 
}

export interface PageQueryReq extends PageQuery {
}

export interface PageResp {
  page: number; 
  page_size: number; 
  total: number; 
  list: any; 
}

export interface Photo {
  id: number; // 主键
  photo_url: string; // 照片地址
}

export interface PhotoQueryReq {
  album_id: number; // 相册ID
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

export interface RecallMessageReq {
  id: number; // 消息id
}

export interface RecallMessageResp {
  id: number; // 消息id
}

export interface ReceiveMsg {
  type: number; // 类型
  data: string; // 数据
  timestamp: number; //时间戳
}

export interface RegisterReq {
  username: string; 
  password: string; 
  verify_code: string; // 验证码
}

export interface Remark {
  id?: number; // 主键id
  nickname: string; // 昵称
  avatar: string; // 头像
  message_content: string; // 留言内容
  ip_address: string; // 用户ip
  ip_source: string; // 用户地址
  is_review: number; // 是否审核
  created_at: number; // 发布时间
  updated_at: number; // 更新时间
}

export interface RemarkNewReq {
  nickname: string; // 昵称
  avatar: string; // 头像
  message_content: string; // 留言内容
}

export interface RemarkQueryReq extends PageQuery {
}

export interface ReplyMsg {
  type: number; // 类型
  data: string; // 数据
  timestamp: number; //时间戳
}

export interface ReportResp {
  terminal_id: string; 
}

export interface ResetPasswordReq {
  username: string; 
  password: string; 
  verify_code: string; // 验证码
}

export interface Response {
  code: number; 
  message: string; 
  data: any; 
  trace_id: string; 
}

export interface RestHeader {
  header_country?: string; 
  header_language?: string; 
  header_timezone?: string; 
  header_app_name?: string; 
  header_x_user_id?: string; 
  header_x_auth_token?: string; 
  header_terminal_id?: string; 
}

export interface SendMessageReq {
  type: string; // 消息类型 1: 文本消息 2: 图片消息 3: 文件消息 4: 语音消息 5: 视频消息
  content: string; // 消息内容
}

export interface Tag {
  id: number; // 标签ID
  tag_name: string; // 标签名
  article_count: number; // 文章数量
  created_at: number; // 创建时间
  updated_at: number; // 更新时间
}

export interface TagQueryReq extends PageQuery {
  tag_name?: string; // 标签名
}

export interface Talk {
  id: number; // 说说ID
  user_id: string; // 用户ID
  nickname: string; // 用户昵称
  avatar: string; // 用户头像
  content: string; // 评论内容
  img_list: string[]; // 图片URL列表
  is_top: number; // 是否置顶
  status: number; // 状态 1.公开 2.私密
  like_count: number; // 点赞量
  comment_count: number; // 评论量
  created_at: number; // 创建时间
  updated_at: number; // 更新时间
}

export interface TalkQueryReq extends PageQuery {
}

export interface Token {
  user_id: string; // 用户id
  token_type: string; // token类型,Bearer
  access_token: string; // 访问token,过期时间较短。2h
  expires_in: number; // 访问token过期时间
  refresh_token: string; // 刷新token,过期时间较长。30d
  refresh_expires_in: number; // 刷新token过期时间
  scope: string; // 作用域
}

export interface UpdateUserAvatarReq {
  avatar: string; // 头像
}

export interface UpdateUserInfoReq extends UserInfoExt {
  nickname?: string; // 昵称
  avatar?: string; // 头像
}

export interface UploadFileReq {
  file?: any; // 文件
  file_path?: string; // 文件路径
}

export interface UserEmailReq {
  username: string; 
}

export interface UserInfoExt {
  intro: string; // 简介
  website: string; // 网站
}

export interface UserInfoResp extends UserInfoExt {
  user_id: string; // 用户id
  username: string; // 用户名
  nickname: string; // 用户昵称
  avatar: string; // 用户头像
  email: string; // 用户邮箱
  phone: string; // 用户手机号
}

export interface UserLikeResp {
  article_like_set: number[]; 
  comment_like_set: number[]; 
  talk_like_set: number[]; 
}

export interface WebsiteConfigDTO {
  admin_url: string; // 后台地址
  alipay_qr_code: string; // 支付宝二维码
  gitee: string; // Gitee
  github: string; // Github
  is_chat_room: number; // 是否开启聊天室
  is_comment_review: number; // 是否开启评论审核
  is_email_notice: number; // 是否开启邮件通知
  is_message_review: number; // 是否开启留言审核
  is_music_player: number; // 是否开启音乐播放器
  is_reward: number; // 是否开启打赏
  qq: string; // QQ
  social_login_list: string[]; // 社交登录列表
  social_url_list: string[]; // 社交地址列表
  tourist_avatar: string; // 游客头像
  user_avatar: string; // 用户头像
  website_author: string; // 网站作者
  website_avatar: string; // 网站头像
  website_create_time: string; // 网站创建时间
  website_intro: string; // 网站介绍
  website_name: string; // 网站名称
  website_notice: string; // 网站公告
  website_record_no: string; // 网站备案号
  websocket_url: string; // websocket地址
  weixin_qr_code: string; // 微信二维码
}
