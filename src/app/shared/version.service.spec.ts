/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { VersionService } from './version.service';

describe('VersionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VersionService]
    });
  });

  it('should ...', inject([VersionService], (service: VersionService) => {
    expect(service).toBeTruthy();
  }));
});
