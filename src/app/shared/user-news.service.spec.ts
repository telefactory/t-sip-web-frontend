/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { UserNewsService } from './user-news.service';

describe('UserNewsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserNewsService]
    });
  });

  it('should ...', inject([UserNewsService], (service: UserNewsService) => {
    expect(service).toBeTruthy();
  }));
});
