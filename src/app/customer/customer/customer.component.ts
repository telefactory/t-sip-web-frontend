import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { UserService } from '../../shared/user.service';
import { CustomerService } from '../../shared/customer.service';
import { Customer } from '../../shared/models/customer';
import { Service } from '../../shared/models/service';
import { ServiceGroup } from "../../shared/models/service-group";
import { ServiceGroupStatistics } from "../../shared/models/service-group-statistics";
import { NumberService } from '../../shared/number.service';

declare var moment: any;

@Component({
    selector: 'app-customer',
    templateUrl: './customer.component.html',
    styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit {
    id: number;
    @Input() customer: Customer;
    _selectedServiceGroup: ServiceGroup;
    _selectedDynamicServiceGroup: ServiceGroup;
    _selectedRestrictionServiceGroup: ServiceGroup;
    _dynamicServiceGroupShowNumber: boolean = false;

    selectedDynamicNumbers: Array<Service>;
    selectedDynamicNumbersSpecific: Array<Service>;
    selectedRestrictedNumbers: Array<Service>;
    selectedRestrictedNumbersSpecific: Array<Service>;

    constructor(private route: ActivatedRoute,
        private userService: UserService,
        private customerService: CustomerService,
        private numberService: NumberService) {
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.id = +params['id'];
        });

        this._selectedServiceGroup = this.customer.service_groups[0];
    }

    get user() {
        return this.userService.getUser();
    }

    get unusedNumbers() {
        return this.customer.number_list.filter(
            (num: Service) => {
                return num.service_group_id === null;
            }
        );
    }

    get services() {
        return this._selectedServiceGroup.number_list;
    }

    get selectedDynamicServiceGroup() {
        if (!this._selectedDynamicServiceGroup && this.customer.service_groups && this.customer.service_groups.length > 0)
            this._selectedDynamicServiceGroup = this.customer.service_groups[0];

        return this._selectedDynamicServiceGroup;
    }

    get selectedDynamicServiceGroupNumbers() {
        return this.selectedDynamicServiceGroup.number_list.filter(
            (num: Service) => {
                return this.unusedNumbers.find(
                    (n: Service) => {
                        return n.number_id == num.number_id;
                    }
                ) ? false : true;
            }
        );
    }

    get selectedRestrictedServiceGroupNumbers() {
        let numbers = [];

        if (typeof this.selectedRestrictionServiceGroup == 'undefined')
            return numbers;

        for (let num of this.selectedRestrictionServiceGroup.statistics_list) {
            let statNum = this.customer.number_list.find((n: Service) => n.number_id == num.number_id);

            if (typeof statNum == 'undefined')
                continue;

            numbers.push(statNum);
        }

        return numbers;
    }

    set selectedDynamicServiceGroup(sg: ServiceGroup) {
        this._selectedDynamicServiceGroup = sg;
        this.selectedDynamicNumbers = [];
        this.selectedDynamicNumbersSpecific = [];
    }

    get selectedRestrictionServiceGroup() {
        if (!this._selectedRestrictionServiceGroup && this.customer.service_groups && this.customer.service_groups.length > 0)
            this._selectedRestrictionServiceGroup = this.customer.service_groups[0];

        return this._selectedRestrictionServiceGroup;
    }

    set selectedRestrictionServiceGroup(sg: ServiceGroup) {
        this._selectedRestrictionServiceGroup = sg;
        this.selectedRestrictedNumbers = [];
        this.selectedRestrictedNumbersSpecific = [];
    }

    get unusedRestrictedServiceGroupNumbers() {
        return this.customer.number_list.filter(
            (num: Service) => {
                return typeof this.selectedRestrictionServiceGroup.statistics_list.find((n: ServiceGroupStatistics) => n.number_id == num.number_id) == 'undefined';
            }
        );
    }

    get selectedServiceGroup() {
        if (!this._selectedServiceGroup && this.customer.service_groups && this.customer.service_groups.length > 0)
            this._selectedServiceGroup = this.customer.service_groups[0];
        return this._selectedServiceGroup;
    }

    set selectedServiceGroup(sg: ServiceGroup) {
        this.updateServiceGroups();
        this._selectedServiceGroup = sg;
    }

    getServiceGroups() {
        let sgs: ServiceGroup[] = this.customer.service_groups;
        sgs.sort(this.customerService.sortServices);

        if (this.user.isAdmin()) {
            return sgs;
        }

        let sgList: ServiceGroup[] = [];
        let sgId: number = this.userService.getServiceId();
        for (let sg of sgs) {
            if ((this.user.isAgent() && sg.service_group_id == sgId) || this.user.isCustomer()) {
                sg.number_list = this.numberService.sortServices(sg.number_list);
                sgList.push(sg);

                if (this.user.isAgent())
                    this._selectedServiceGroup = sg;
            }
        }
        return sgList;
    }

    get serviceGroups() {
        return this.getServiceGroups();
    }

    get showNumber(): boolean {
        return this._dynamicServiceGroupShowNumber;
    }

    set showNumber(showNumber: boolean) {
        this._dynamicServiceGroupShowNumber = showNumber;
    }

    getNumberOrDescription(number: Service) {
        if (this.showNumber)
            return number.service_number;

        return number.description;
    }

    addSelectedNumbersDynamic() {
        let selectedNumbers = this.selectedDynamicNumbersSpecific;

        if (typeof selectedNumbers == 'undefined' || (typeof selectedNumbers == 'object' && typeof selectedNumbers.length !== 'undefined' && selectedNumbers.length == 0))
            return;

        for (let n of selectedNumbers) {
            let findNumber = this.selectedDynamicServiceGroup.number_list.find(
                (num: Service) => {
                    return num.number_id == n.number_id;
                }
            );

            if (findNumber) {
                findNumber.service_group_id = this.selectedDynamicServiceGroup.service_group_id;
            }
            else {
                n.service_group_id = this.selectedDynamicServiceGroup.service_group_id;
                this.selectedDynamicServiceGroup.number_list.push(n);
            }
        }

        // Set selectedDynamicNumbersSpecific and selectedDynamicNumbers to empty to ensure that number can't be added to/removed from other groups by clicking add/remove button
        this.selectedDynamicNumbersSpecific = this.selectedDynamicNumbers = [];
        this.saveServiceGroup();
    }

    removeSelectedNumbersDynamic() {
        let selectedNumbers = this.selectedDynamicNumbers;

        if (typeof selectedNumbers == 'undefined' || (typeof selectedNumbers == 'object' && typeof selectedNumbers.length !== 'undefined' && selectedNumbers.length == 0))
            return;

        for (let n of selectedNumbers) {
            let findNumber = this.customer.number_list.find(
                (num: Service) => {
                    return num.number_id == n.number_id;
                }
            );

            if (findNumber) {
                findNumber.service_group_id = null;
                findNumber.customer_id = this.customer.customer_id;
            }
            else {
                n.service_group_id = null;
                n.customer_id = this.customer.customer_id;
                this.customer.number_list.push(n);
            }
        }

        // Remove numbers from service group array
        this.selectedDynamicServiceGroup.number_list = this.selectedDynamicServiceGroup.number_list.filter(
            (num: Service) => {
                return selectedNumbers.find(
                    (n: Service) => {
                        return n.number_id != num.number_id;
                    }
                )
            }
        );

        // Set selectedDynamicNumbersSpecific and selectedDynamicNumbers to empty to ensure that number can't be added to/removed from other groups by clicking add/remove button on separate group and ensure that numbers is not listed twice in list
        this.selectedDynamicNumbersSpecific = this.selectedDynamicNumbers = [];
        this.saveServiceGroup();
    }

    addSelectedNumbersRestricted() {
        let selectedNumbers = this.selectedRestrictedNumbersSpecific;

        // Check if all numbers has been selected
        let allSelected = selectedNumbers.find((option: any) => option == "all") ? true : false;
        if (allSelected) {
            selectedNumbers = this.unusedRestrictedServiceGroupNumbers;
        }

        if (typeof selectedNumbers == 'undefined' || (typeof selectedNumbers == 'object' && typeof selectedNumbers.length !== 'undefined' && selectedNumbers.length == 0))
            return;

        for (let n of selectedNumbers) {

            let isNumberMissing = true;
            for (var index = 0; index < this.selectedRestrictedServiceGroupNumbers.length; index++) {
                if (n.number_id == this.selectedRestrictedServiceGroupNumbers[index].number_id && n.service_group_id == this.selectedRestrictedServiceGroupNumbers[index].service_group_id) {
                    isNumberMissing = false;
                    break;
                }
            }

            if (isNumberMissing) {
                let statNum = new ServiceGroupStatistics(this.selectedRestrictionServiceGroup.service_group_id, n.number_id);
                this.selectedRestrictionServiceGroup.statistics_list.push(statNum);
            }
        }

        this.selectedRestrictedNumbersSpecific = this.selectedRestrictedNumbers = [];
        this.saveServiceGroup();
    }

    removeSelectedNumbersRestricted() {
        let selectedNumbers = this.selectedRestrictedNumbers;

        if (typeof selectedNumbers == 'undefined' || (typeof selectedNumbers == 'object' && typeof selectedNumbers.length !== 'undefined' && selectedNumbers.length == 0))
            return;

        for (let n of selectedNumbers) {
            // Remove number from service group array
            for (let index = 0; index < this.selectedRestrictionServiceGroup.statistics_list.length; index++) {
                if (n.number_id == this.selectedRestrictionServiceGroup.statistics_list[index].number_id) {
                    this.selectedRestrictionServiceGroup.statistics_list.splice(index, 1);
                    break;
                }
            }
        }

        // Set selectedDynamicNumbersSpecific and selectedDynamicNumbers to empty to ensure that number can't be added to/removed from other groups by clicking add/remove button on separate group and ensure that numbers is not listed twice in list
        this.selectedDynamicNumbersSpecific = this.selectedDynamicNumbers = [];
        this.saveServiceGroup();
    }

    get showDynamicServiceGroups(): boolean {
        return this.user && this.user.show_dynamic_service_groups && (this.user.isCustomer() || this.user.isAdmin());
    }

    get showStatisticsRestrictions(): boolean {
        return this.user && this.showDynamicServiceGroups && this.user.show_statistics;
    }

    getSelectHeight(options) {
        let length: number;

        if (typeof options == 'undefined' || typeof options.length == 'undefined' || options.length < 4)
            length = 4;
        else
            length = options.length;

        return 20 * length;
    }

    saveCustomer() {
        this.customerService.saveCustomer()
            .subscribe(() => {
                this.customerService.scheduleChangedOpeningDate = false;
            }, (error: any) => {
                console.log("error=" + error);
            });
        return false;
    }

    saveServiceGroup() {
        let sg = this._selectedDynamicServiceGroup;
        this.customerService.saveServiceGroup(sg, true)
            .subscribe(() => {
                this.customerService.scheduleChangedOpeningDate = false;
            }, (error: any) => {
                console.log("error=" + error);
            });
        return false;
    }

    updateServiceGroups() {
        this.customerService.updateServiceGroups()
        .subscribe(() => {
        }, (error: any) => {
            console.log("error=" + error);
        });
    }

    getPassedEndDate(number) {
        if(!number.end_date) {
            return false;
        }
        let end_date = moment(number.end_date);
        let now = moment();
     
        if(end_date.isSameOrBefore(now)) {
            return true;
        }
        return false;
    }

    getBeforeStartDate(number) {
        if(!number.start_date) {
            return true;
        }
        
        let start_date = moment(number.start_date);
        let now = moment();

        if(start_date.isSameOrAfter(now)) {
            return true;
        }
        return false;
    }

    getPassedFrozenDate(number) {
        if(!number.frozen_date) {
            return false;
        }
        
        let frozen_date = moment(number.frozen_date);
        let now = moment();
    
        if(frozen_date.isSameOrBefore(now)) {
            return true;
        }
        return false;
    }

}
