import { Component, Input, OnInit, KeyValueDiffers, DoCheck } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

//import * as moment from 'moment'
declare var moment: any;

import { StatisticsService } from '../../shared/statistics.service';
import { CdrDailySum } from '../../shared/models/statistics/cdr-daily-sum';
import { UserService } from '../../shared/user.service';
import { CustomerService } from '../../shared/customer.service';
import { Customer } from "../../shared/models/customer";
import { Service } from "../../shared/models/service";
import { ServiceGroup } from "../../shared/models/service-group";
import { ServiceGroupStatistics } from '../../shared/models/service-group-statistics';
import { not, ThrowStmt } from '@angular/compiler/src/output/output_ast';

@Component({
    selector: 'app-stats',
    templateUrl: './stats.component.html',
    styleUrls: ['./stats.component.css']
})
export class StatsComponent implements OnInit, DoCheck {
    @Input() label: string;
    differ: any;

    dates: { from: string, to: string } = {
        from: null,
        to: null
    };

    cdrDailySums: Array<CdrDailySum>;

    cdrStats: { day: CdrDailySum[], yesterday: CdrDailySum[], week: CdrDailySum[], lastweek: CdrDailySum[], month: CdrDailySum[], lastmonth: CdrDailySum[], lastyearmonth: CdrDailySum[], custom: CdrDailySum[] } = { day: [], yesterday: [], week: [], lastweek: [], month: [], lastmonth: [], lastyearmonth: [], custom: null };

    numberList: string[] = [];
    restrictedNumbers: string[] = [];

    loadingStatistics: boolean = true;

    serviceGroups: Array<ServiceGroup> = [];

    constructor(private route: ActivatedRoute,
        private router: Router,
        private statisticsService: StatisticsService,
        private userService: UserService,
        private customerService: CustomerService,
        private differs: KeyValueDiffers) {
        this.differ = differs.find({}).create();
        let user = userService.getUser();
        if (typeof user == 'undefined' || !user.show_statistics) {
            router.navigate(['/']);
        }
    }

    get user() {
        return this.userService.getUser();
    }

    ngOnInit() {
        this.updateStatistics();
    }

    getFilteredServiceGroups() {
        let groups = new Set();
        for(let sg of this.serviceGroups) {
            if(sg.number_list.length > 0) {
                for(let service of sg.number_list) {
                    if(service.service_number.length > 4) {
                        groups.add(sg);
                    }
                }
                
            }
        }
        return groups;
    }

    updateStatistics(forceCacheReload: boolean = false) {
        this.loadingStatistics = true;
        this.route.params.subscribe((params: Params) => {
            this.statisticsService.setCustomerId(params['customerId']);

            let toDate = moment().format('YYYY-MM-DD');
            let d = new Date();
            let month = new Date(d.getFullYear(), d.getMonth(), 1);
            let today = moment().startOf('isoday').format('YYYY-MM-DD');
            let yesterday = moment().startOf('isoday').subtract(1, 'day').format('YYYY-MM-DD');
            let thisWeek = moment().startOf('isoweek').format('YYYY-MM-DD');
            let lastWeekStart = moment(thisWeek).subtract(1, 'week').startOf('isoweek').format('YYYY-MM-DD');
            let lastWeekEnd = moment(thisWeek).subtract(1, 'week').endOf('isoweek').format('YYYY-MM-DD');
            let thisMonth = moment(month).format('YYYY-MM-DD');
            let lastMonthStart = moment(month).subtract(1, 'months').startOf('month').format('YYYY-MM-DD');
            let lastMonthEnd = moment(month).subtract(1, 'months').endOf('month').format('YYYY-MM-DD');
            let lastYearMonthStart = moment(month).subtract(1, 'months').subtract(1, 'years').startOf('month').format('YYYY-MM-DD');
            let lastYearMonthEnd = moment(month).subtract(1, 'months').subtract(1, 'years').endOf('month').format('YYYY-MM-DD');

            this.statisticsService.loadCDRStats(lastYearMonthStart, toDate, forceCacheReload)
                .subscribe(() => {
                    this.numberList = [];

                    if (this.userService.getUser().isAgent()) {
                        this.customerService.getCustomer(this.userService.getCustomerId()).subscribe((customer: Customer) => {
                            let sgId = this.userService.getServiceId();
                            for (let sg of customer.service_groups) {
                                if (sg.service_group_id == sgId) {
                                    for (let number of sg.number_list) {
                                        this.numberList.push(number.service_number);
                                    }

                                    if (this.userService.getUser().show_statistics_restrictions && sg.statistics_list != null && sg.statistics_list.length > 0) {
                                        // Make sure only restricted numbers are visible for user
                                        let restrictedNumbers = customer.number_list.filter(
                                            (num: Service) => {
                                                return typeof sg.statistics_list.find((n: ServiceGroupStatistics) => n.number_id == num.number_id) !== 'undefined';
                                            }
                                        );

                                        this.restrictedNumbers = this.numberList.filter(
                                            (num: string) => {
                                                return typeof restrictedNumbers.find((n: Service) => n.service_number == num) !== 'undefined';
                                            }
                                        );
                                    }
                                }
                            }

                            this.numberList.sort(function (a, b) {
                                return a > b ? 1 : -1;
                            });
                        });
                    } else if (!this.user.isAdmin() || !this.user.isSuperAdmin()) {
                        this.customerService.getServiceGroups(this.userService.getCustomerId()).subscribe((sgs: Array<ServiceGroup>) => {
                            this.serviceGroups = sgs;
                        });
                    } else {
                        this.customerService.getServiceGroups(params['customerId']).subscribe((sgs: Array<ServiceGroup>) => {
                            this.serviceGroups = sgs;
                        });
                    }

                    // Past 7 days will be present in cache now
                    this.cdrStats.day = this.statisticsService.getCDRStats(today, toDate);
                    this.cdrStats.yesterday = this.statisticsService.getCDRStats(yesterday, yesterday);
                    this.cdrStats.week = this.statisticsService.getCDRStats(thisWeek, toDate);
                    this.cdrStats.month = this.statisticsService.getCDRStats(thisMonth, toDate);
                    this.cdrStats.lastweek = this.statisticsService.getCDRStats(lastWeekStart, lastWeekEnd);
                    this.cdrStats.lastmonth = this.statisticsService.getCDRStats(lastMonthStart, lastMonthEnd);
                    this.cdrStats.lastyearmonth = this.statisticsService.getCDRStats(lastYearMonthStart, lastYearMonthEnd);

                    this.loadingStatistics = false;
                });

        });
    }

    getStatsForNumber(number: string) {
        let stats: { day: CdrDailySum, yesterday: CdrDailySum, week: CdrDailySum, lastweek: CdrDailySum, month: CdrDailySum, lastmonth: CdrDailySum, lastyearmonth: CdrDailySum } = {
            day: null,
            yesterday: null,
            week: null,
            lastweek: null,
            month: null,
            lastmonth: null,
            lastyearmonth: null
        }

        // Day
        for (let stat of this.cdrStats.day) {
            if (stat.number === number) {
                stats.day = stat;
                break;
            }
            else if (number === '*') {
                if (!(stats.day instanceof CdrDailySum))
                    stats.day = stat;
                else {
                    stats.day.offeredIncoming += stat.offeredIncoming;
                    stats.day.offeredOutgoing += stat.offeredOutgoing;
                    stats.day.answered += stat.answered;
                    stats.day.seconds += stat.seconds;
                    stats.day.count_busy += stat.count_busy;
                    stats.day.count_closed += stat.count_closed;
                    stats.day.count_queue_busy += stat.count_queue_busy;
                }
            }
        }

        if (stats.day == null)
            stats.day = new CdrDailySum(number);

        let restricted = this.restrictedNumbers.find((num: string) => num == number) ? true : false;

        if (!this.userService.getUser().show_statistics_restrictions || (this.userService.getUser().show_statistics_restrictions && (restricted || (number === '*' && this.restrictedNumbers.length > 0)))) {
            // Yesterday
            for (let stat of this.cdrStats.yesterday) {
                let statRestricted = !this.userService.getUser().show_statistics_restrictions || this.restrictedNumbers.find((num: string) => num == stat.number) ? true : false;
                if (stat.number === number) {
                    stats.yesterday = stat;
                    break;
                }
                else if (number === '*' && statRestricted) {
                    if (!(stats.yesterday instanceof CdrDailySum))
                        stats.yesterday = stat;
                    else {
                        stats.yesterday.offeredIncoming += stat.offeredIncoming;
                        stats.yesterday.offeredOutgoing += stat.offeredOutgoing;
                        stats.yesterday.answered += stat.answered;
                        stats.yesterday.seconds += stat.seconds;
                        stats.yesterday.count_busy += stat.count_busy;
                        stats.yesterday.count_closed += stat.count_closed;
                        stats.yesterday.count_queue_busy += stat.count_queue_busy;
                    }
                }
            }

            // Week
            for (let stat of this.cdrStats.week) {
                let statRestricted = !this.userService.getUser().show_statistics_restrictions || this.restrictedNumbers.find((num: string) => num == stat.number) ? true : false;
                if (stat.number === number) {
                    stats.week = stat;
                    break;
                }
                else if (number === '*' && statRestricted) {
                    if (!(stats.week instanceof CdrDailySum))
                        stats.week = stat;
                    else {
                        stats.week.offeredIncoming += stat.offeredIncoming;
                        stats.week.offeredOutgoing += stat.offeredOutgoing;
                        stats.week.answered += stat.answered;
                        stats.week.seconds += stat.seconds;
                        stats.week.count_busy += stat.count_busy;
                        stats.week.count_closed += stat.count_closed;
                        stats.week.count_queue_busy += stat.count_queue_busy;
                    }
                }
            }

            // Last week
            for (let stat of this.cdrStats.lastweek) {
                let statRestricted = !this.userService.getUser().show_statistics_restrictions || this.restrictedNumbers.find((num: string) => num == stat.number) ? true : false;
                if (stat.number === number) {
                    stats.lastweek = stat;
                    break;
                }
                else if (number === '*' && statRestricted) {
                    if (!(stats.lastweek instanceof CdrDailySum))
                        stats.lastweek = stat;
                    else {
                        stats.lastweek.offeredIncoming += stat.offeredIncoming;
                        stats.lastweek.offeredOutgoing += stat.offeredOutgoing;
                        stats.lastweek.answered += stat.answered;
                        stats.lastweek.seconds += stat.seconds;
                        stats.lastweek.count_busy += stat.count_busy;
                        stats.lastweek.count_closed += stat.count_closed;
                        stats.lastweek.count_queue_busy += stat.count_queue_busy;
                    }
                }
            }

            // Month
            for (let stat of this.cdrStats.month) {
                let statRestricted = !this.userService.getUser().show_statistics_restrictions || this.restrictedNumbers.find((num: string) => num == stat.number) ? true : false;
                if (stat.number === number) {
                    stats.month = stat;
                    break;
                }
                else if (number === '*' && statRestricted) {
                    if (!(stats.month instanceof CdrDailySum))
                        stats.month = stat;
                    else {
                        stats.month.offeredIncoming += stat.offeredIncoming;
                        stats.month.offeredOutgoing += stat.offeredOutgoing;
                        stats.month.answered += stat.answered;
                        stats.month.seconds += stat.seconds;
                        stats.month.count_busy += stat.count_busy;
                        stats.month.count_closed += stat.count_closed;
                        stats.month.count_queue_busy += stat.count_queue_busy;
                    }
                }
            }

            // Last month
            for (let stat of this.cdrStats.lastmonth) {
                let statRestricted = !this.userService.getUser().show_statistics_restrictions || this.restrictedNumbers.find((num: string) => num == stat.number) ? true : false;
                if (stat.number === number) {
                    stats.lastmonth = stat;
                    break;
                }
                else if (number === '*' && statRestricted) {
                    if (!(stats.lastmonth instanceof CdrDailySum))
                        stats.lastmonth = stat;
                    else {
                        stats.lastmonth.offeredIncoming += stat.offeredIncoming;
                        stats.lastmonth.offeredOutgoing += stat.offeredOutgoing;
                        stats.lastmonth.answered += stat.answered;
                        stats.lastmonth.seconds += stat.seconds;
                        stats.lastmonth.count_busy += stat.count_busy;
                        stats.lastmonth.count_closed += stat.count_closed;
                        stats.lastmonth.count_queue_busy += stat.count_queue_busy;
                    }
                }
            }

            // Last year
            for (let stat of this.cdrStats.lastyearmonth) {
                let statRestricted = !this.userService.getUser().show_statistics_restrictions || this.restrictedNumbers.find((num: string) => num == stat.number) ? true : false;
                if (stat.number === number) {
                    stats.lastyearmonth = stat;
                    break;
                }
                else if (number === '*' && statRestricted) {
                    if (!(stats.lastyearmonth instanceof CdrDailySum))
                        stats.lastyearmonth = stat;
                    else {
                        stats.lastyearmonth.offeredIncoming += stat.offeredIncoming;
                        stats.lastyearmonth.offeredOutgoing += stat.offeredOutgoing;
                        stats.lastyearmonth.answered += stat.answered;
                        stats.lastyearmonth.seconds += stat.seconds;
                        stats.lastyearmonth.count_busy += stat.count_busy;
                        stats.lastyearmonth.count_closed += stat.count_closed;
                        stats.lastyearmonth.count_queue_busy += stat.count_queue_busy;
                    }
                }
            }

            if (stats.yesterday == null)
                stats.yesterday = new CdrDailySum(number);

            if (stats.week == null)
                stats.week = new CdrDailySum(number);

            if (stats.lastweek == null)
                stats.lastweek = new CdrDailySum(number);

            if (stats.month == null)
                stats.month = new CdrDailySum(number);

            if (stats.lastmonth == null)
                stats.lastmonth = new CdrDailySum(number);

            if (stats.lastyearmonth == null)
                stats.lastyearmonth = new CdrDailySum(number);
        }

        return stats;
    }

    getAllStats() {
        let stats: { day: CdrDailySum, yesterday: CdrDailySum, week: CdrDailySum, lastweek: CdrDailySum, month: CdrDailySum, lastmonth: CdrDailySum, lastyearmonth: CdrDailySum } = Object.assign({}, {
            day: null,
            yesterday: null,
            week: null,
            lastweek: null,
            month: null,
            lastmonth: null,
            lastyearmonth: null
        });

        for (let sg of this.serviceGroups) {
            for (let number of sg.number_list) {
                if (number.toString().length == 4) {
                    continue;
                }
    
                let stat = Object.assign({}, this.getStatsForNumber(number.service_number));
    
                for (let key in stats) {
                    if (stats[key] === null && typeof stat[key] !== 'undefined') {
                        stats[key] = new CdrDailySum('*');
                    }
    
                    if (stats[key] instanceof CdrDailySum && stat[key] !== null && typeof stat[key] === 'object') {
                        stats[key].offeredIncoming += stat[key].offeredIncoming;
                        stats[key].offeredOutgoing += stat[key].offeredOutgoing;
                        stats[key].answered += stat[key].answered;
                        stats[key].count_closed += stat[key].count_closed;
                        stats[key].count_busy += stat[key].count_busy;
                        stats[key].count_queue_busy += stat[key].count_queue_busy;
                        stats[key].seconds += stat[key].seconds;
                    }
                }
            }
        }

        return stats;
    }


    getStats() {
        this.statisticsService.loadCDRStats(this.dates.from, this.dates.to)
            .subscribe((cdrStats: any) => {
                this.cdrStats.custom = cdrStats;
            });
    }

    ngDoCheck() {
        let changes = this.differ.diff(this.cdrStats);
        if (!changes) return;
    }

}
