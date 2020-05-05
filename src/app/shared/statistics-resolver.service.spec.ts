import { TestBed, inject } from '@angular/core/testing';

import { StatisticsResolverService } from './statistics-resolver.service';

describe('StatisticsResolverService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StatisticsResolverService]
    });
  });

  it('should ...', inject([StatisticsResolverService], (service: StatisticsResolverService) => {
    expect(service).toBeTruthy();
  }));
});
