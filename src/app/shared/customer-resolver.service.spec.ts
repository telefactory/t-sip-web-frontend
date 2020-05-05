/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CustomerResolverService } from './customer-resolver.service';

describe('CustomerResolverService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CustomerResolverService]
    });
  });

  it('should ...', inject([CustomerResolverService], (service: CustomerResolverService) => {
    expect(service).toBeTruthy();
  }));
});
