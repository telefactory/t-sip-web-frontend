import { UserNews } from './user-news';
export class User {
  id: number;
  username: string;
  // Password is only visible while setting it, since it's hashed later
  password: string;
  email: string;
  roles: Array<string>;
  customer_id: number;
  service_id: number;
  show_statistics: boolean;
  user_manual_type: number;
  user_manual_show_video: boolean;
  show_dynamic_service_groups: boolean;
  show_statistics_restrictions: boolean;
  advanced_weekly_schedule: boolean;
  hide_yearly_statistics: boolean;

  constructor(
    id: number,
    username: string,
    email: string,
    roles: Array<string>,
    customerId: number,
    serviceId: number,
    showStatistics: boolean,
    userManualType: number,
    userManualShowVideo: boolean, 
    showDynamicServiceGroups: boolean, 
    showStatisticsRestrictions: boolean, 
    advancedWeeklySchedule: boolean,
    hideYearlyStatistics: boolean) {
      
    this.id = id;
    this.username = username;
    this.email = email;
    this.roles = roles;
    this.customer_id = customerId;
    this.service_id = serviceId;
    this.show_statistics = showStatistics;
    this.user_manual_type = userManualType;
    this.user_manual_show_video = userManualShowVideo;
    this.show_dynamic_service_groups = showDynamicServiceGroups;
    this.show_statistics_restrictions = showStatisticsRestrictions;
    this.advanced_weekly_schedule = advancedWeeklySchedule;
    this.hide_yearly_statistics = hideYearlyStatistics;
  }

  isCustomer(): boolean {
    return this.roles.indexOf("CUSTOMER") >= 0;
  }

  isAdmin(): boolean {
    return this.roles.indexOf("ADMIN") >= 0 || this.roles.indexOf("SUPERADMIN") >= 0;
  }

  isSuperAdmin(): boolean {
    return this.roles.indexOf("SUPERADMIN") >= 0;
  }

  isAgent(): boolean {
      return this.roles.indexOf("AGENT") >= 0;
  }

  toggleRole(role: string) {
    let index = this.roles.indexOf(role);
    if (index >= 0)
      this.roles.splice(index, 1);
    else
      this.roles.push(role);
  }
}
