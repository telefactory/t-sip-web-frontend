/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { HuntGroupService } from './huntgroup.service';

describe('HuntGroupService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [HuntGroupService]
    });
  });

  it('should ...', inject([HuntGroupService], (service: HuntGroupService) => {
    expect(service).toBeTruthy();
  }));
});
