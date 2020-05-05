/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { UserManualService } from './user-manual.service';

describe('UserManualService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserManualService]
    });
  });

  it('should ...', inject([UserManualService], (service: UserManualService) => {
    expect(service).toBeTruthy();
  }));
});
