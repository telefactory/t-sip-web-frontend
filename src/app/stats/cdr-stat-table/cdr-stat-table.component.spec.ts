import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CdrStatTableComponent } from './cdr-stat-table.component';

describe('CdrStatTableComponent', () => {
  let component: CdrStatTableComponent;
  let fixture: ComponentFixture<CdrStatTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CdrStatTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CdrStatTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
