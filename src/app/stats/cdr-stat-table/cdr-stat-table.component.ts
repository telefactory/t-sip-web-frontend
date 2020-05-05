import { Component, Input, OnInit } from '@angular/core';
import { Service } from "../../shared/models/service";
import { ServiceGroup } from "../../shared/models/service-group";

@Component({
  selector: 'app-cdr-stat-table',
  templateUrl: './cdr-stat-table.component.html',
  styleUrls: ['./cdr-stat-table.component.css']
})
export class CdrStatTableComponent implements OnInit {
  @Input() cdrStats: any;
  @Input() user: any;
  @Input() label: string;

  constructor() { }

  ngOnInit() {
  }

}
