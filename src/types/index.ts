export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: string[];
}

export interface PagedResult<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CompanyTranslation {
  languageCode: string;
  name: string;
  shortDescription?: string;
  description?: string;
  address?: string;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  logoUrl?: string;
  coverImageUrl?: string;
  websiteUrl?: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  displayOrder: number;
  projectsCount?: number;
  servicesCount?: number;
  createdAt: string;
  translations?: CompanyTranslation[];
}

export interface ProjectTranslation {
  languageCode: string;
  name: string;
  shortDescription?: string;
  description?: string;
  location?: string;
}

export interface Project {
  id: string;
  companyId: string;
  companyName?: string;
  companySlug?: string;
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  coverImageUrl?: string;
  clientName?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  status: string;
  displayOrder: number;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
  translations?: ProjectTranslation[];
}

export interface ServiceTranslation {
  languageCode: string;
  name: string;
  description?: string;
}

export interface Service {
  id: string;
  companyId: string;
  companyName?: string;
  companySlug?: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  imageUrl?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  translations?: ServiceTranslation[];
}

export interface PageSection {
  id: string;
  pageId: string;
  sectionType: string;
  displayOrder: number;
  isVisible: boolean;
  configurationJson: string;
}

export interface PageTranslation {
  languageCode: string;
  title: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface Page {
  id: string;
  companyId: string;
  companyName?: string;
  companySlug?: string;
  title: string;
  slug: string;
  isHomePage: boolean;
  isPublished: boolean;
  displayOrder: number;
  createdAt: string;
  translations?: PageTranslation[];
  sections?: PageSection[];
}

export interface CompanyDetail extends Company {
  featuredProjects: Project[];
  featuredServices: Service[];
  socialLinks: SocialLink[];
  contactInfo?: ContactInfo;
  homePage?: Page;
}

export interface SocialLink {
  id: string;
  companyId: string;
  platform: string;
  url: string;
  displayOrder: number;
  isActive: boolean;
}

export interface ContactInfo {
  id: string;
  companyId: string;
  email?: string;
  phone?: string;
  mobile?: string;
  address?: string;
  mapUrl?: string;
  latitude?: number;
  longitude?: number;
}

export interface MediaFile {
  id: string;
  companyId?: string;
  companyName?: string;
  fileName: string;
  originalFileName: string;
  contentType: string;
  fileSize: number;
  url: string;
  altText?: string;
  createdAt: string;
}

export interface NavigationItem {
  id: string;
  companyId?: string;
  parentId?: string;
  title: string;
  url: string;
  displayOrder: number;
  isExternal: boolean;
  isVisible: boolean;
  children: NavigationItem[];
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  roles: string[];
  allowedCompanyIds: string[];
  isSuperAdmin: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: UserProfile;
}

export interface SiteSetting {
  id: string;
  companyId?: string;
  settingKey: string;
  settingValue?: string;
  languageCode?: string;
}

export interface SystemSetting {
  id: string;
  settingKey: string;
  settingValue?: string;
  description?: string;
  isEncrypted: boolean;
}

export interface RealtimeConfig {
  hubName: string;
  baseUrl: string;
  fullUrl: string;
  isActive: boolean;
}

export interface SystemStatus {
  api: string;
  database: string;
  signalR: string;
  environment: string;
  version: string;
  serverTime: string;
}

export interface NotificationItem {
  id: string;
  userId?: string;
  companyId?: string;
  type: string;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  userId?: string;
  username?: string;
  action: string;
  entityName: string;
  entityId?: string;
  oldValues?: string;
  newValues?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}
